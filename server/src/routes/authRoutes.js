import { Router } from 'express';
import {
  register,
  login,
  getMe,
  updateProfile,
  initiateRegistration,
  resendOtp,
  verifyOtp,
  requestPasswordResetOtp,
  verifyPasswordResetOtp,
  resetPassword,
} from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.post('/register', register);
router.post('/register-initiate', initiateRegistration);
router.post('/resend-otp', resendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/login', login);

// Forgot Password Flow with Email OTP
router.post('/forgot-password/request-otp', requestPasswordResetOtp);
router.post('/forgot-password/verify-otp', verifyPasswordResetOtp);
router.post('/forgot-password/reset-password', resetPassword);

router.get('/me', authenticate, getMe);
router.put('/profile', authenticate, updateProfile);

export default router;

