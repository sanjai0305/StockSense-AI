import { auth } from '../config/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

/**
 * Initializes or resets the Firebase RecaptchaVerifier
 * Uses invisible reCAPTCHA by default for seamless supermarket UX
 */
export const getRecaptchaVerifier = (containerId = 'recaptcha-container') => {
  if (typeof window === 'undefined') return null;

  // Clear existing verifier if present to avoid re-initialization errors
  if (window.recaptchaVerifier) {
    try {
      window.recaptchaVerifier.clear();
    } catch (e) {
      console.warn('Clearing previous recaptcha verifier:', e);
    }
    window.recaptchaVerifier = null;
  }

  // Ensure container element exists in DOM
  let container = document.getElementById(containerId);
  if (!container) {
    container = document.createElement('div');
    container.id = containerId;
    document.body.appendChild(container);
  }

  window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
    size: 'invisible',
    callback: () => {
      // reCAPTCHA solved - will proceed with signInWithPhoneNumber
    },
    'expired-callback': () => {
      console.warn('reCAPTCHA expired, please try again.');
    },
  });

  return window.recaptchaVerifier;
};

/**
 * Sends a phone verification OTP using Firebase Authentication
 * Works seamlessly with both Real SMS and Firebase Console Test Numbers (e.g. +91 9876543210)
 */
export const sendFirebasePhoneOtp = async (phoneNumber) => {
  try {
    const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
    const appVerifier = getRecaptchaVerifier('recaptcha-container');

    const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
    window.confirmationResult = confirmationResult;

    // Cache phone in session for reload recovery
    sessionStorage.setItem('stocksense_pending_phone', formattedPhone);

    return {
      success: true,
      phoneNumber: formattedPhone,
      confirmationResult,
    };
  } catch (error) {
    console.error('Firebase signInWithPhoneNumber Error:', error);
    // Format Firebase-specific errors to friendly user messages
    let friendlyMessage = error.message;
    if (error.code === 'auth/invalid-phone-number') {
      friendlyMessage = 'The phone number format is invalid. Please check your 10-digit number.';
    } else if (error.code === 'auth/quota-exceeded') {
      friendlyMessage = 'SMS quota exceeded for today. Please test with a Firebase test phone number.';
    } else if (error.code === 'auth/too-many-requests') {
      friendlyMessage = 'Too many attempts. Please wait a few minutes before requesting another code.';
    } else if (error.code === 'auth/captcha-check-failed') {
      friendlyMessage = 'reCAPTCHA verification failed. Please reload the page and try again.';
    }
    throw new Error(friendlyMessage);
  }
};

/**
 * Confirms the 6-digit OTP code with Firebase ConfirmationResult
 */
export const confirmFirebaseOtp = async (otpCode) => {
  if (!window.confirmationResult) {
    throw new Error('Verification session has expired. Please go back and request a new code.');
  }

  try {
    const userCredential = await window.confirmationResult.confirm(otpCode);
    const user = userCredential.user;
    const idToken = await user.getIdToken();

    return {
      success: true,
      user,
      idToken,
      phoneNumber: user.phoneNumber,
    };
  } catch (error) {
    console.error('Firebase OTP Confirmation Error:', error);
    let friendlyMessage = 'Invalid verification code. Please check and try again.';
    if (error.code === 'auth/invalid-verification-code') {
      friendlyMessage = 'Invalid verification code. Please check the 6-digit code and try again.';
    } else if (error.code === 'auth/code-expired') {
      friendlyMessage = 'The verification code has expired. Please click Resend Code.';
    }
    throw new Error(friendlyMessage);
  }
};
