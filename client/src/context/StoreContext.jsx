import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const StoreContext = createContext(null);

export const StoreProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);
  const [globalSearch, setGlobalSearch] = useState('');
  const [unreadNotifications, setUnreadNotifications] = useState(3);
  const [quickActionModal, setQuickActionModal] = useState(null); // 'ADD_PRODUCT' | 'STOCK_IN' | 'STOCK_OUT' | 'GENERATE_REORDER' | 'PRINT_REPORT'

  const triggerRefresh = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await api.get('/notifications');
      if (res.success) {
        setUnreadNotifications(res.unreadCount || 0);
      }
    } catch (e) {
      // ignore
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUnreadCount();
    }
  }, [isAuthenticated, refreshKey, fetchUnreadCount]);

  return (
    <StoreContext.Provider
      value={{
        refreshKey,
        triggerRefresh,
        globalSearch,
        setGlobalSearch,
        unreadNotifications,
        setUnreadNotifications,
        quickActionModal,
        setQuickActionModal,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => useContext(StoreContext);
