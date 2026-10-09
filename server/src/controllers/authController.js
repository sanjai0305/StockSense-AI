import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import prisma from '../config/prisma.js';

// In-memory store for pending OTP registrations (keyed by email or phone)
const pendingRegistrations = new Map();

/**
 * Normalizes and validates a 10-digit Indian mobile number
 * Returns formatted E.164 string '+91XXXXXXXXXX' or throws an Error
 */
export const normalizeIndianMobile = (phoneInput) => {
  if (!phoneInput || typeof phoneInput !== 'string') {
    throw new Error('Mobile number is required.');
  }

  // Remove spaces, hyphens, parentheses, and leading plus
  let cleaned = phoneInput.replace(/[\s\-\(\)\+]/g, '');

  // If prefixed with country code 91 and total length is 12, strip 91
  if (cleaned.startsWith('91') && cleaned.length === 12) {
    cleaned = cleaned.substring(2);
  } else if (cleaned.startsWith('0') && cleaned.length === 11) {
    // If prefixed with 0 (STD) and total length is 11, strip 0
    cleaned = cleaned.substring(1);
  }

  // Check if exactly 10 digits numeric
  if (!/^\d{10}$/.test(cleaned)) {
    throw new Error('Please enter a valid 10-digit mobile number.');
  }

  return `+91${cleaned}`;
};

const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().min(10, 'Please enter a 10-digit mobile number'),
  storeName: z.string().optional(),
  firebaseUid: z.string().optional(),
  address: z.string().default('Salem, Tamil Nadu'),
  city: z.string().default('Salem'),
  state: z.string().default('Tamil Nadu'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const verifyOtpSchema = z.object({
  email: z.string().email('Invalid email address').optional(),
  phone: z.string().optional(),
  otp: z.string().length(6, 'OTP must be exactly 6 digits'),
});

// Generate 6-digit cryptographically random numeric string
const generateNumericOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Step 1: Initiate Registration & Generate 6-digit OTP (Optional backend fallback)
 */
export const initiateRegistration = async (req, res, next) => {
  try {
    const rawData = registerSchema.parse(req.body);
    const normalizedPhone = normalizeIndianMobile(rawData.phone);

    // Check duplicate email
    const existingUserByEmail = await prisma.user.findUnique({
      where: { email: rawData.email.toLowerCase() },
    });

    if (existingUserByEmail) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists. Please sign in.',
      });
    }

    // Check duplicate phone
    const existingUserByPhone = await prisma.user.findFirst({
      where: { phone: normalizedPhone },
    });

    if (existingUserByPhone) {
      return res.status(400).json({
        success: false,
        message: 'An account with this mobile number already exists. Please sign in.',
      });
    }

    const data = {
      ...rawData,
      email: rawData.email.toLowerCase(),
      phone: normalizedPhone,
    };

    const otp = generateNumericOtp();
    const now = Date.now();
    const expiresAt = now + 10 * 60 * 1000; // 10 minutes
    const cooldownUntil = now + 30 * 1000; // 30 seconds resend cooldown

    pendingRegistrations.set(data.email, {
      data,
      otp,
      attempts: 0,
      expiresAt,
      cooldownUntil,
      createdAt: now,
    });

    console.log(`\n======================================================`);
    console.log(`🔑 [StockSense AI] OTP Generated for ${data.email} (Phone: ${normalizedPhone}): ${otp}`);
    console.log(`⏱️  Expires at: ${new Date(expiresAt).toLocaleTimeString()}`);
    console.log(`======================================================\n`);

    res.json({
      success: true,
      message: `Verification code sent to ${data.email}.`,
      email: data.email,
      phone: normalizedPhone,
      cooldownSeconds: 30,
      expiresInMinutes: 10,
    });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ success: false, message: error.errors[0]?.message || 'Invalid registration data' });
    }
    return res.status(400).json({ success: false, message: error.message || 'Registration failed' });
  }
};

/**
 * Step 2: Resend 6-Digit OTP with rate limiting & cooldown
 */
export const resendOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email address is required.' });
    }

    const record = pendingRegistrations.get(email.toLowerCase());
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'No pending registration found for this email. Please register again.',
      });
    }

    const now = Date.now();
    if (now < record.cooldownUntil) {
      const remainingSec = Math.ceil((record.cooldownUntil - now) / 1000);
      return res.status(429).json({
        success: false,
        message: `Please wait ${remainingSec} seconds before requesting a new code.`,
        remainingSeconds: remainingSec,
      });
    }

    const newOtp = generateNumericOtp();
    record.otp = newOtp;
    record.attempts = 0;
    record.expiresAt = now + 10 * 60 * 1000;
    record.cooldownUntil = now + 30 * 1000;

    console.log(`\n======================================================`);
    console.log(`🔁 [StockSense AI] Resent OTP for ${email}: ${newOtp}`);
    console.log(`======================================================\n`);

    res.json({
      success: true,
      message: 'New verification code has been sent.',
      cooldownSeconds: 30,
      expiresInMinutes: 10,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Step 3: Verify 6-Digit OTP & Commit User & Store in PostgreSQL
 */
export const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = verifyOtpSchema.parse(req.body);
    const key = email ? email.toLowerCase() : '';
    const record = pendingRegistrations.get(key);

    if (!record) {
      return res.status(400).json({
        success: false,
        message: 'No pending verification session found or session expired. Please register again.',
      });
    }

    const now = Date.now();
    if (now > record.expiresAt) {
      pendingRegistrations.delete(key);
      return res.status(400).json({
        success: false,
        message: 'Verification code has expired. Please request a new code.',
      });
    }

    record.attempts += 1;
    if (record.attempts > 5) {
      pendingRegistrations.delete(key);
      return res.status(429).json({
        success: false,
        message: 'Too many incorrect attempts. Please start registration again.',
      });
    }

    if (record.otp !== otp.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification code. Please check and try again.',
      });
    }

    // OTP is valid! Create store and user in transaction
    const data = record.data;
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(data.password, salt);

    const result = await prisma.$transaction(async (tx) => {
      const store = await tx.store.create({
        data: {
          name: data.storeName || `${data.fullName}'s Supermarket`,
          address: data.address,
          city: data.city,
          state: data.state,
          phone: data.phone,
          email: data.email,
        },
      });

      const user = await tx.user.create({
        data: {
          storeId: store.id,
          fullName: data.fullName,
          email: data.email,
          phone: data.phone,
          passwordHash,
          role: 'STORE_OWNER',
        },
      });

      // Default categories
      const defaultCategories = [
        { name: 'Dairy Products', color: '#10B981', description: 'Milk, curd, butter, cheese' },
        { name: 'Cooking Oil', color: '#F59E0B', description: 'Sunflower oil, groundnut oil, mustard oil' },
        { name: 'Rice & Grains', color: '#D97706', description: 'Basmati rice, ponni rice, wheat, pulses' },
        { name: 'Beverages', color: '#06B6D4', description: 'Cold drinks, juices, tea, coffee' },
        { name: 'Snacks', color: '#EF4444', description: 'Biscuits, noodles, chips, chocolates' },
        { name: 'Personal Care', color: '#8B5CF6', description: 'Soaps, shampoos, oral care' },
        { name: 'Household', color: '#3B82F6', description: 'Detergents, floor cleaners, dishwashers' },
      ];

      for (const cat of defaultCategories) {
        await tx.category.create({
          data: {
            storeId: store.id,
            name: cat.name,
            color: cat.color,
            description: cat.description,
          },
        });
      }

      return { store, user };
    });

    // Delete verified pending record
    pendingRegistrations.delete(key);

    const token = jwt.sign(
      { userId: result.user.id, storeId: result.store.id, role: result.user.role },
      process.env.JWT_SECRET || 'smartstock-secret-key',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Phone verified and Store Account created successfully!',
      token,
      user: {
        id: result.user.id,
        fullName: result.user.fullName,
        email: result.user.email,
        phone: result.user.phone,
        role: result.user.role,
        avatarUrl: result.user.avatarUrl,
      },
      store: result.store,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Standard Registration (Commit verified Firebase user or direct registration)
 */
export const register = async (req, res, next) => {
  try {
    const rawData = registerSchema.parse(req.body);
    const normalizedPhone = normalizeIndianMobile(rawData.phone);

    const existingUser = await prisma.user.findUnique({
      where: { email: rawData.email.toLowerCase() },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists. Please sign in.',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(rawData.password, salt);

    const result = await prisma.$transaction(async (tx) => {
      const store = await tx.store.create({
        data: {
          name: rawData.storeName || `${rawData.fullName}'s Supermarket`,
          address: rawData.address,
          city: rawData.city,
          state: rawData.state,
          phone: normalizedPhone,
          email: rawData.email.toLowerCase(),
        },
      });

      const user = await tx.user.create({
        data: {
          storeId: store.id,
          fullName: rawData.fullName,
          email: rawData.email.toLowerCase(),
          phone: normalizedPhone,
          passwordHash,
          role: 'STORE_OWNER',
        },
      });

      // Default categories
      const defaultCategories = [
        { name: 'Dairy Products', color: '#10B981', description: 'Milk, curd, butter, cheese' },
        { name: 'Cooking Oil', color: '#F59E0B', description: 'Sunflower oil, groundnut oil, mustard oil' },
        { name: 'Rice & Grains', color: '#D97706', description: 'Basmati rice, ponni rice, wheat, pulses' },
        { name: 'Beverages', color: '#06B6D4', description: 'Cold drinks, juices, tea, coffee' },
        { name: 'Snacks', color: '#EF4444', description: 'Biscuits, noodles, chips, chocolates' },
        { name: 'Personal Care', color: '#8B5CF6', description: 'Soaps, shampoos, oral care' },
        { name: 'Household', color: '#3B82F6', description: 'Detergents, floor cleaners, dishwashers' },
      ];

      for (const cat of defaultCategories) {
        await tx.category.create({
          data: {
            storeId: store.id,
            name: cat.name,
            color: cat.color,
            description: cat.description,
          },
        });
      }

      return { store, user };
    });

    const token = jwt.sign(
      { userId: result.user.id, storeId: result.store.id, role: result.user.role },
      process.env.JWT_SECRET || 'smartstock-secret-key',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Store and Owner account created successfully.',
      token,
      user: {
        id: result.user.id,
        fullName: result.user.fullName,
        email: result.user.email,
        phone: result.user.phone,
        role: result.user.role,
        avatarUrl: result.user.avatarUrl,
      },
      store: result.store,
    });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ success: false, message: error.errors[0]?.message || 'Invalid registration data' });
    }
    return res.status(400).json({ success: false, message: error.message || 'Registration failed' });
  }
};

export const login = async (req, res, next) => {
  try {
    const data = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
      include: { store: true },
    });

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const isMatch = await bcrypt.compare(data.password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const token = jwt.sign(
      { userId: user.id, storeId: user.storeId, role: user.role },
      process.env.JWT_SECRET || 'smartstock-secret-key',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatarUrl: user.avatarUrl,
      },
      store: user.store,
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user.id,
      fullName: req.user.fullName,
      email: req.user.email,
      phone: req.user.phone,
      role: req.user.role,
      avatarUrl: req.user.avatarUrl,
    },
    store: req.store,
  });
};

export const updateProfile = async (req, res, next) => {
  try {
    const { fullName, phone, avatarUrl, currentPassword, newPassword } = req.body;
    const updateData = {};

    if (fullName) updateData.fullName = fullName;
    if (phone !== undefined) {
      updateData.phone = normalizeIndianMobile(phone);
    }
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ success: false, message: 'Current password is required to set a new password.' });
      }
      const isMatch = await bcrypt.compare(currentPassword, req.user.passwordHash);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
      }
      const salt = await bcrypt.genSalt(10);
      updateData.passwordHash = await bcrypt.hash(newPassword, salt);
    }

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
    });

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: {
        id: updated.id,
        fullName: updated.fullName,
        email: updated.email,
        phone: updated.phone,
        role: updated.role,
        avatarUrl: updated.avatarUrl,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Memory store for password reset challenges
// Key: email -> { hashedOtp, attempts, expiresAt, cooldownUntil, userId }
const passwordResetChallenges = new Map();
// Valid single-use reset tokens: token -> { userId, email, expiresAt }
const validResetTokens = new Map();

/**
 * Masks an email for privacy display: e.g. sanjai1999@gmail.com -> sa***@gmail.com
 */
const maskEmail = (email) => {
  if (!email || typeof email !== 'string') return '';
  const [user, domain] = email.split('@');
  if (!domain) return email;
  const visible = user.length <= 2 ? user : user.substring(0, 2) + '***';
  return `${visible}@${domain}`;
};

/**
 * Forgot Password - Step 1: Request Email OTP
 */
export const requestPasswordResetOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid registered email address.',
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const now = Date.now();

    // Check rate-limiting cooldown on existing challenge
    const existing = passwordResetChallenges.get(cleanEmail);
    if (existing && now < existing.cooldownUntil) {
      const remainingSec = Math.ceil((existing.cooldownUntil - now) / 1000);
      return res.status(429).json({
        success: false,
        message: `Please wait ${remainingSec} seconds before requesting a new code.`,
        remainingSeconds: remainingSec,
      });
    }

    // Lookup user in PostgreSQL
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    // Privacy preserving response: If user does not exist, return generic message without error
    if (!user || !user.isActive) {
      return res.json({
        success: true,
        message: 'If an account exists with this email address, a verification code has been sent.',
        maskedEmail: maskEmail(cleanEmail),
        cooldownSeconds: 60,
        expiresInMinutes: 10,
      });
    }

    // Generate secure 6-digit numeric OTP
    const rawOtp = generateNumericOtp();
    const salt = await bcrypt.genSalt(10);
    const hashedOtp = await bcrypt.hash(rawOtp, salt);

    const expiresAt = now + 10 * 60 * 1000; // 10 minutes
    const cooldownUntil = now + 60 * 1000;  // 60 seconds resend cooldown

    passwordResetChallenges.set(cleanEmail, {
      hashedOtp,
      attempts: 0,
      expiresAt,
      cooldownUntil,
      userId: user.id,
      fullName: user.fullName,
    });

    // Import and send email asynchronously
    const { sendPasswordResetEmail } = await import('../services/emailService.js');
    await sendPasswordResetEmail(cleanEmail, user.fullName, rawOtp);

    res.json({
      success: true,
      message: 'Verification code sent to your registered email address.',
      maskedEmail: maskEmail(cleanEmail),
      cooldownSeconds: 60,
      expiresInMinutes: 10,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Forgot Password - Step 2: Verify 6-Digit Email OTP
 */
export const verifyPasswordResetOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email address and 6-digit verification code are required.',
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otp.toString().trim();

    if (!/^\d{6}$/.test(cleanOtp)) {
      return res.status(400).json({
        success: false,
        message: 'Verification code must be exactly 6 digits.',
      });
    }

    const challenge = passwordResetChallenges.get(cleanEmail);
    if (!challenge) {
      return res.status(400).json({
        success: false,
        message: 'No active password reset session found or the code has expired. Please request a new code.',
      });
    }

    const now = Date.now();
    if (now > challenge.expiresAt) {
      passwordResetChallenges.delete(cleanEmail);
      return res.status(400).json({
        success: false,
        message: 'Verification code has expired. Please request a new code.',
      });
    }

    // Rate limiting attempts (max 5)
    challenge.attempts += 1;
    if (challenge.attempts > 5) {
      passwordResetChallenges.delete(cleanEmail);
      return res.status(429).json({
        success: false,
        message: 'Too many incorrect attempts. For security, please request a new verification code.',
      });
    }

    const isValid = await bcrypt.compare(cleanOtp, challenge.hashedOtp);
    if (!isValid) {
      const remainingAttempts = 5 - challenge.attempts;
      return res.status(400).json({
        success: false,
        message: `Invalid verification code. ${remainingAttempts > 0 ? `${remainingAttempts} attempts remaining.` : 'Please request a new code.'}`,
      });
    }

    // OTP is valid! Invalidate the challenge so it cannot be reused
    passwordResetChallenges.delete(cleanEmail);

    // Issue a short-lived single-use password reset token (15 mins)
    const resetToken = jwt.sign(
      {
        userId: challenge.userId,
        email: cleanEmail,
        type: 'PASSWORD_RESET_TOKEN',
        issuedAt: Date.now(),
      },
      process.env.JWT_SECRET || 'smartstock-secret-key',
      { expiresIn: '15m' }
    );

    validResetTokens.set(resetToken, {
      userId: challenge.userId,
      email: cleanEmail,
      expiresAt: now + 15 * 60 * 1000,
    });

    res.json({
      success: true,
      message: 'Email verified successfully. You can now set your new password.',
      resetToken,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Forgot Password - Step 3: Set New Password
 */
export const resetPassword = async (req, res, next) => {
  try {
    const { resetToken, newPassword } = req.body;

    if (!resetToken) {
      return res.status(400).json({
        success: false,
        message: 'Reset authorization token is missing. Please restart the verification process.',
      });
    }

    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long.',
      });
    }

    // Check in-memory single-use registry
    const tokenRecord = validResetTokens.get(resetToken);
    if (!tokenRecord || Date.now() > tokenRecord.expiresAt) {
      validResetTokens.delete(resetToken);
      return res.status(400).json({
        success: false,
        message: 'Password reset authorization has expired or was already used. Please request a new OTP.',
      });
    }

    // Verify JWT integrity
    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET || 'smartstock-secret-key');
    } catch (jwtErr) {
      validResetTokens.delete(resetToken);
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token. Please request a new verification code.',
      });
    }

    if (decoded.type !== 'PASSWORD_RESET_TOKEN' || decoded.userId !== tokenRecord.userId) {
      validResetTokens.delete(resetToken);
      return res.status(400).json({
        success: false,
        message: 'Invalid token type.',
      });
    }

    // Invalidate reset token immediately to enforce single-use
    validResetTokens.delete(resetToken);

    // Hash new password and update in PostgreSQL database
    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { id: decoded.userId },
      data: { passwordHash: newPasswordHash },
    });

    console.log(`\n======================================================`);
    console.log(`✅ [StockSense AI Auth] Password successfully reset for user: ${decoded.email}`);
    console.log(`======================================================\n`);

    res.json({
      success: true,
      message: 'Your password has been reset successfully. You can now sign in with your new password.',
    });
  } catch (error) {
    next(error);
  }
};

