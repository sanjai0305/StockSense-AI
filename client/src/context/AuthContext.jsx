import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { sendFirebasePhoneOtp, confirmFirebaseOtp } from '../services/firebaseAuth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);

  // Transient state for pending registration
  const [pendingRegistrationData, setPendingRegistrationData] = useState(() => {
    const saved = sessionStorage.getItem('stocksense_pending_reg');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('smartstock_token');
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res.success) {
            setUser(res.user);
            setStore(res.store);
          }
        } catch (error) {
          console.error('Session restoration failed:', error);
          localStorage.removeItem('smartstock_token');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.success) {
      localStorage.setItem('smartstock_token', res.token);
      setUser(res.user);
      setStore(res.store);
      return res;
    }
  };

  /**
   * Initiates Phone Authentication via Firebase and caches registration details
   */
  const initiatePhoneRegistration = async (formData) => {
    const formattedPhone = formData.phone.startsWith('+') ? formData.phone : `+91${formData.phone}`;
    const regPayload = {
      ...formData,
      phone: formattedPhone,
    };

    setPendingRegistrationData(regPayload);
    sessionStorage.setItem('stocksense_pending_reg', JSON.stringify(regPayload));

    // Send Firebase OTP (handles test numbers and real SMS automatically)
    const firebaseRes = await sendFirebasePhoneOtp(formattedPhone);
    return firebaseRes;
  };

  /**
   * Confirms Firebase OTP code and registers the verified account in PostgreSQL
   */
  const verifyPhoneRegistration = async (otpCode) => {
    const cachedData = pendingRegistrationData || JSON.parse(sessionStorage.getItem('stocksense_pending_reg') || '{}');

    if (!cachedData || !cachedData.email || !cachedData.phone) {
      throw new Error('Registration session expired. Please fill out the registration form again.');
    }

    // 1. Verify 6-digit OTP code directly against Firebase Auth
    const { idToken, user: firebaseUser } = await confirmFirebaseOtp(otpCode);

    // 2. Commit verified user record to PostgreSQL database backend
    const registerPayload = {
      fullName: cachedData.fullName,
      phone: cachedData.phone,
      email: cachedData.email,
      password: cachedData.password,
      firebaseUid: firebaseUser?.uid,
    };

    const res = await api.post('/auth/register', registerPayload);

    if (res.success) {
      localStorage.setItem('smartstock_token', res.token);
      setUser(res.user);
      setStore(res.store);
      sessionStorage.removeItem('stocksense_pending_reg');
      setPendingRegistrationData(null);
      return res;
    } else {
      throw new Error(res.message || 'Failed to complete registration.');
    }
  };

  /**
   * Resends Firebase phone OTP
   */
  const resendPhoneOtp = async (phone) => {
    const cachedData = pendingRegistrationData || JSON.parse(sessionStorage.getItem('stocksense_pending_reg') || '{}');
    const targetPhone = phone || cachedData?.phone;
    if (!targetPhone) {
      throw new Error('No phone number found to resend OTP.');
    }
    return await sendFirebasePhoneOtp(targetPhone);
  };

  const register = async (formData) => {
    const res = await api.post('/auth/register', formData);
    if (res.success) {
      localStorage.setItem('smartstock_token', res.token);
      setUser(res.user);
      setStore(res.store);
      return res;
    }
  };

  const logout = () => {
    localStorage.removeItem('smartstock_token');
    sessionStorage.removeItem('stocksense_pending_reg');
    setUser(null);
    setStore(null);
  };

  const updateProfileState = (updatedUser) => {
    setUser((prev) => ({ ...prev, ...updatedUser }));
  };

  const updateStoreState = (updatedStore) => {
    setStore((prev) => ({ ...prev, ...updatedStore }));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        store,
        loading,
        isAuthenticated: !!user,
        pendingRegistrationData,
        login,
        initiatePhoneRegistration,
        verifyPhoneRegistration,
        resendPhoneOtp,
        register,
        logout,
        updateProfileState,
        updateStoreState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
