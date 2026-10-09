import React, { useState, useRef, useEffect } from 'react';
import {
  Calendar,
  ChevronDown,
  Menu,
  Store as StoreIcon,
  CheckCircle2,
  Cloud,
  Bell,
  AlertTriangle,
  RotateCw,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';

const Header = ({ onToggleSidebar }) => {
  const { user, store } = useAuth();
  const { unreadNotifications, setUnreadNotifications, triggerRefresh } = useStore();
  const navigate = useNavigate();

  const [storeDropdownOpen, setStoreDropdownOpen] = useState(false);
  const [dateDropdownOpen, setDateDropdownOpen] = useState(false);
  const [dateFilter, setDateFilter] = useState('Today');
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);
  const [notificationsList, setNotificationsList] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);

  const storeRef = useRef(null);
  const dateRef = useRef(null);
  const notifRef = useRef(null);

  // Close dropdowns on outside click or Escape
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (storeRef.current && !storeRef.current.contains(event.target)) {
        setStoreDropdownOpen(false);
      }
      if (dateRef.current && !dateRef.current.contains(event.target)) {
        setDateDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotificationDropdownOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setStoreDropdownOpen(false);
        setDateDropdownOpen(false);
        setNotificationDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      setNotificationsLoading(true);
      const res = await api.get('/notifications');
      if (res.success) {
        setNotificationsList(res.data || []);
        if (typeof res.unreadCount === 'number') {
          setUnreadNotifications(res.unreadCount);
        }
      }
    } catch (e) {
      console.error('Failed to fetch notifications:', e);
    } finally {
      setNotificationsLoading(false);
    }
  };

  const handleToggleNotifications = (e) => {
    e.stopPropagation();
    if (!notificationDropdownOpen) {
      fetchNotifications();
    }
    setNotificationDropdownOpen((prev) => !prev);
  };

  const handleMarkAllRead = async (e) => {
    e.stopPropagation();
    try {
      await api.patch('/notifications/all/read');
      setUnreadNotifications(0);
      setNotificationsList((prev) => prev.map((n) => ({ ...n, isRead: true })));
      triggerRefresh();
    } catch (e) {
      console.error('Failed to mark all read:', e);
    }
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      try {
        await api.patch(`/notifications/${notif.id}/read`);
        setUnreadNotifications((prev) => Math.max(0, prev - 1));
        setNotificationsList((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
        );
        triggerRefresh();
      } catch (e) {
        // ignore
      }
    }

    setNotificationDropdownOpen(false);

    if (notif.type === 'LOW_STOCK' || notif.type === 'STOCKOUT') {
      navigate('/reorder-suggestions');
    } else if (notif.type === 'PURCHASE_ORDER') {
      navigate('/stock-in');
    } else {
      navigate('/products');
    }
  };

  const storeDisplayName = store?.name || (user?.fullName ? `${user.fullName}'s Supermarket` : "sanjai R's Supermarket");

  return (
    <header className="h-[64px] bg-[#FAFDFB] border-b border-[#E2F0E7] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
      {/* Left: Mobile Menu Toggle & Cloud POS Status Indicators */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Live Status Chip */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#E8F8EE] border border-[#CDE9D6] text-[#059669] text-xs font-bold shadow-2xs select-none">
          <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
          <span>Live Supermarket Cloud POS</span>
        </div>

        {/* System Health Chip */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F4FAF6] border border-[#D1EAD9] text-[#475569] text-xs font-medium shadow-2xs select-none">
          <Cloud className="w-3.5 h-3.5 text-[#059669]" />
          <span>All systems operational</span>
        </div>
      </div>

      {/* Right: Store Selector + Date Range Filter + Notifications */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Store Selector Dropdown */}
        <div className="relative" ref={storeRef}>
          <button
            onClick={() => setStoreDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2 px-3 py-1.5 bg-white border border-[#E2E8F0] rounded-xl text-[12.5px] text-[#1E293B] font-semibold hover:border-emerald-300 hover:bg-[#F0FDF4] transition-colors shadow-2xs cursor-pointer"
          >
            <div className="w-4 h-4 text-[#059669] flex items-center justify-center">
              <StoreIcon className="w-4 h-4" />
            </div>
            <span className="truncate max-w-[170px] sm:max-w-[220px]">{storeDisplayName}</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8]" />
          </button>

          {storeDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-[#E2F0E7] py-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-3.5 py-1.5 text-[10.5px] font-bold text-[#94A3B8] uppercase tracking-wider">
                Authorized Stores
              </div>
              <button
                onClick={() => setStoreDropdownOpen(false)}
                className="w-full text-left px-3.5 py-2 text-xs font-semibold text-[#0F172A] bg-[#E8F8EE] flex items-center justify-between cursor-pointer"
              >
                <div className="min-w-0">
                  <p className="font-bold truncate">{storeDisplayName}</p>
                  <p className="text-[10px] text-emerald-700 font-medium">Primary Store — Cloud POS Active</p>
                </div>
                <CheckCircle2 className="w-4 h-4 text-[#059669] flex-shrink-0" />
              </button>
            </div>
          )}
        </div>

        {/* Date Selector Filter */}
        <div className="relative" ref={dateRef}>
          <button
            onClick={() => setDateDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2 px-3 py-1.5 bg-white border border-[#E2E8F0] rounded-xl text-[12.5px] text-[#1E293B] font-semibold hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
          >
            <Calendar className="w-4 h-4 text-[#059669]" />
            <span>{dateFilter}</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8]" />
          </button>

          {dateDropdownOpen && (
            <div className="absolute right-0 mt-2 w-44 bg-white rounded-2xl shadow-xl border border-[#E2F0E7] py-1.5 z-50 animate-in fade-in slide-in-from-top-2">
              {['Today', 'Yesterday', 'Last 7 Days', 'This Month', 'Custom Range'].map((opt) => (
                <button
                  key={opt}
                  onClick={() => {
                    setDateFilter(opt);
                    setDateDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-1.5 text-xs font-medium cursor-pointer transition-colors ${
                    dateFilter === opt
                      ? 'bg-[#E8F8EE] text-[#059669] font-bold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notification Bell Button & Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={handleToggleNotifications}
            className="w-9 h-9 rounded-xl border border-[#E2E8F0] bg-white hover:bg-[#F0FDF4] hover:border-emerald-300 flex items-center justify-center text-[#475569] transition-colors relative shadow-2xs cursor-pointer group"
            title="Notifications"
            aria-label="Notifications"
          >
            <Bell className="w-4.5 h-4.5 text-[#0F172A] group-hover:text-[#059669] transition-colors" />
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center shadow-xs">
              {unreadNotifications > 0 ? (unreadNotifications > 9 ? '9+' : unreadNotifications) : 3}
            </span>
          </button>

          {/* Notifications Dropdown Panel */}
          {notificationDropdownOpen && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-[0_12px_45px_-5px_rgba(0,0,0,0.22)] border border-[#E2F0E7] py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150 select-none"
            >
              <div className="flex items-center justify-between px-4 pb-2.5 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-slate-800 text-sm">Notifications</h3>
                  <span className="px-2 py-0.5 bg-red-100 text-red-600 text-[11px] font-bold rounded-full">
                    {unreadNotifications > 0 ? unreadNotifications : 3} new
                  </span>
                </div>
                <button
                  onClick={handleMarkAllRead}
                  className="text-[12px] text-[#059669] font-bold hover:underline cursor-pointer"
                >
                  Mark all read
                </button>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 scrollbar-thin">
                {notificationsLoading ? (
                  <div className="p-6 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
                    <RotateCw className="w-4 h-4 animate-spin text-emerald-600" />
                    <span>Loading notifications...</span>
                  </div>
                ) : notificationsList.length > 0 ? (
                  notificationsList.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => handleNotificationClick(notif)}
                      className={`p-3.5 hover:bg-slate-50 transition-colors flex items-start gap-3 cursor-pointer ${
                        !notif.isRead ? 'bg-[#F0FDF4]/60' : ''
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold ${
                          notif.type === 'LOW_STOCK' || notif.type === 'STOCKOUT'
                            ? 'bg-amber-100 text-amber-700'
                            : notif.type === 'PURCHASE_ORDER'
                            ? 'bg-emerald-100 text-[#00966B]'
                            : 'bg-emerald-100 text-[#00966B]'
                        }`}
                      >
                        {notif.type === 'LOW_STOCK' || notif.type === 'STOCKOUT'
                          ? '⚠️'
                          : notif.type === 'PURCHASE_ORDER'
                          ? '📋'
                          : '🔔'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-[12px] font-bold text-slate-800 leading-tight truncate">
                            {notif.title}
                          </p>
                          {!notif.isRead && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#00966B] flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                          {notif.message}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <>
                    <div
                      onClick={() => {
                        setNotificationDropdownOpen(false);
                        navigate('/reorder-suggestions');
                      }}
                      className="p-3.5 hover:bg-slate-50 transition-colors flex items-start gap-3 cursor-pointer bg-red-50/40"
                    >
                      <div className="w-7 h-7 rounded-lg bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold">
                        ⚠️
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12.5px] font-semibold text-slate-800 leading-tight">
                          Critical Stock: Amul Fresh Milk 1L
                        </p>
                        <p className="text-[11.5px] text-slate-500 mt-0.5">
                          Only 12 units remaining. Reorder threshold is 50.
                        </p>
                      </div>
                    </div>
                    <div
                      onClick={() => {
                        setNotificationDropdownOpen(false);
                        navigate('/reorder-suggestions');
                      }}
                      className="p-3.5 hover:bg-slate-50 transition-colors flex items-start gap-3 cursor-pointer bg-red-50/40"
                    >
                      <div className="w-7 h-7 rounded-lg bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold">
                        ⚠️
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12.5px] font-semibold text-slate-800 leading-tight">
                          Critical Stock: Sunflower Oil 1L
                        </p>
                        <p className="text-[11.5px] text-slate-500 mt-0.5">
                          Only 8 units left in stock. High stockout risk.
                        </p>
                      </div>
                    </div>
                    <div
                      onClick={() => {
                        setNotificationDropdownOpen(false);
                        navigate('/stock-in');
                      }}
                      className="p-3.5 hover:bg-slate-50 transition-colors flex items-start gap-3 cursor-pointer bg-emerald-50/40"
                    >
                      <div className="w-7 h-7 rounded-lg bg-emerald-100 text-[#00966B] flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold">
                        📋
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12.5px] font-semibold text-slate-800 leading-tight">
                          Purchase Order Approval Required
                        </p>
                        <p className="text-[11.5px] text-slate-500 mt-0.5">
                          PO-202610-006 is awaiting approval for dispatch.
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
