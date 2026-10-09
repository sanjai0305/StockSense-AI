import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Package,
  Layers,
  ArrowDownLeft,
  ArrowUpRight,
  Truck,
  ShoppingCart,
  Receipt,
  Users2,
  Tag,
  Settings,
  ChevronsLeft,
  ChevronsRight,
  ChevronDown,
  LogOut,
  UserCheck,
  Bell,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import api from '../../services/api';

const Sidebar = ({ isOpen, onClose, isCollapsed, onToggleCollapse }) => {
  const { user, logout } = useAuth();
  const { unreadNotifications, setUnreadNotifications, triggerRefresh } = useStore();
  const navigate = useNavigate();

  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);
  const [notificationsList, setNotificationsList] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsError, setNotificationsError] = useState(false);

  const accountRef = useRef(null);
  const notifRef = useRef(null);
  const notifPanelRef = useRef(null);

  // Close dropdowns when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Account dropdown outside click
      if (
        accountRef.current &&
        !accountRef.current.contains(event.target)
      ) {
        setAccountDropdownOpen(false);
      }

      // Notification dropdown outside click
      if (
        notifRef.current &&
        !notifRef.current.contains(event.target) &&
        notifPanelRef.current &&
        !notifPanelRef.current.contains(event.target)
      ) {
        setNotificationDropdownOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setAccountDropdownOpen(false);
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
      setNotificationsError(false);
      const res = await api.get('/notifications');
      if (res.success) {
        setNotificationsList(res.data || []);
        if (typeof res.unreadCount === 'number') {
          setUnreadNotifications(res.unreadCount);
        }
      } else {
        setNotificationsError(true);
      }
    } catch (e) {
      console.error('Failed to fetch notifications:', e);
      setNotificationsError(true);
    } finally {
      setNotificationsLoading(false);
    }
  };

  const handleToggleNotifications = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setAccountDropdownOpen(false);
    if (!notificationDropdownOpen) {
      fetchNotifications();
    }
    setNotificationDropdownOpen((prev) => !prev);
  };

  const handleToggleAccount = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setNotificationDropdownOpen(false);
    setAccountDropdownOpen((prev) => !prev);
  };

  const handleMarkAllRead = async (e) => {
    e.stopPropagation();
    try {
      await api.patch('/notifications/all/read');
      setUnreadNotifications(0);
      setNotificationsList((prev) =>
        prev.map((n) => ({ ...n, isRead: true }))
      );
      triggerRefresh();
    } catch (e) {
      console.error('Failed to mark all notifications as read:', e);
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

    // Route navigation based on notification type
    if (notif.type === 'LOW_STOCK' || notif.type === 'STOCKOUT') {
      navigate('/reorder-suggestions');
    } else if (notif.type === 'PURCHASE_ORDER') {
      navigate('/stock-in');
    } else {
      navigate('/products');
    }
  };

  const handleLogout = () => {
    setAccountDropdownOpen(false);
    setNotificationDropdownOpen(false);
    logout();
    navigate('/login');
  };

  const navItems = [
    {
      section: null,
      items: [
        { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
      ],
    },
    {
      section: 'INVENTORY',
      items: [
        { label: 'Products', icon: Package, path: '/products' },
        { label: 'Categories', icon: Layers, path: '/categories' },
        { label: 'Stock In (Purchase)', icon: ArrowDownLeft, path: '/stock-in' },
        { label: 'Stock Out (Sales)', icon: ArrowUpRight, path: '/billing' },
        { label: 'Suppliers', icon: Truck, path: '/suppliers' },
      ],
    },
    {
      section: 'SALES',
      items: [
        { label: 'Create Bill / POS', icon: ShoppingCart, path: '/billing' },
        { label: 'Bills & Sales History', icon: Receipt, path: '/bills' },
        { label: 'Customers', icon: Users2, path: '/customers' },
      ],
    },
    {
      section: 'MANAGEMENT',
      items: [
        { label: 'Smart Reorders', icon: Tag, path: '/reorder-suggestions' },
        { label: 'Reports & Analytics', icon: FileText, path: '/reports' },
        { label: 'Staff & Users', icon: UserCheck, path: '/users' },
        { label: 'Store Settings', icon: Settings, path: '/settings' },
      ],
    },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 ${
          isCollapsed ? 'w-[72px]' : 'w-[240px]'
        } bg-[#FAFDFB] text-[#334155] flex flex-col transition-all duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } border-r border-[#E2F0E7] select-none shadow-xs`}
      >
        {/* =================================================================== */}
        {/* 1. SIDEBAR BRAND HEADER */}
        {/* =================================================================== */}
        <div className="h-[64px] flex items-center px-3 border-b border-[#E8F3EC] flex-shrink-0">
          {!isCollapsed ? (
            /* Expanded State: Full StockSense AI Logo + Collapse Button */
            <div className="flex items-center justify-between w-full min-w-0">
              <div className="flex items-center min-w-0 pr-1">
                <img
                  src="/stocksense-logo.png"
                  alt="StockSense AI"
                  className="h-9 w-auto max-h-9 object-contain select-none"
                />
              </div>
              <button
                onClick={() => {
                  if (window.innerWidth < 1024) {
                    onClose && onClose();
                  } else {
                    onToggleCollapse && onToggleCollapse();
                  }
                }}
                className="p-1.5 rounded-xl text-slate-400 hover:text-[#059669] hover:bg-[#E8F8EE] transition-all cursor-pointer flex-shrink-0"
                title="Collapse Sidebar"
                aria-label="Collapse Sidebar"
              >
                <ChevronsLeft className="w-4 h-4 stroke-[2.2]" />
              </button>
            </div>
          ) : (
            /* Collapsed State: Centered Green Trolley Icon with Expand Trigger */
            <div className="w-full flex items-center justify-center">
              <button
                onClick={onToggleCollapse}
                className="group relative flex items-center justify-center cursor-pointer p-0.5"
                title="Click to Expand Sidebar"
                aria-label="Expand Sidebar"
              >
                {/* Light Green Trolley Badge */}
                <div className="w-10 h-10 rounded-xl bg-[#E8F8EE] border border-[#CDE9D6] text-[#059669] flex items-center justify-center shadow-2xs group-hover:scale-105 group-hover:bg-[#DCFCE7] group-hover:border-emerald-300 transition-all">
                  <ShoppingCart className="w-5 h-5 stroke-[2.2] text-[#059669]" />
                </div>

                {/* Mini Expand Chevron Badge */}
                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-white border border-[#CDE9D6] text-[#059669] flex items-center justify-center shadow-2xs group-hover:bg-[#059669] group-hover:text-white transition-colors">
                  <ChevronsRight className="w-2.5 h-2.5 stroke-[2.5]" />
                </div>
              </button>
            </div>
          )}
        </div>

        {/* =================================================================== */}
        {/* 2. NAVIGATION ITEMS */}
        {/* =================================================================== */}
        <div className="flex-1 overflow-y-auto px-2 py-3 space-y-3 scrollbar-thin">
          {navItems.map((group, gIdx) => (
            <div key={group.section || `sec-${gIdx}`} className="space-y-1">
              {/* Section Header */}
              {group.section && !isCollapsed && (
                <div className="px-3 pt-1 text-[10px] font-bold text-[#94A3B8] tracking-wider uppercase">
                  {group.section}
                </div>
              )}
              {isCollapsed && group.section && (
                <div className="w-6 mx-auto h-[1px] bg-slate-200/70 my-1.5" />
              )}

              {/* Section Links */}
              <div className="space-y-0.5">
                {group.items.map((item) => (
                  <NavLink
                    key={item.label}
                    to={item.path}
                    end={item.path === '/'}
                    title={isCollapsed ? item.label : undefined}
                    onClick={() => onClose && onClose()}
                    className={({ isActive }) =>
                      `flex items-center ${
                        isCollapsed ? 'justify-center px-2 py-2.5' : 'gap-3 px-3 py-2'
                      } rounded-xl text-[12.5px] font-medium transition-all duration-150 ${
                        isActive
                          ? 'bg-[#E8F8EE] text-[#059669] font-bold shadow-xs'
                          : 'text-[#475569] hover:bg-[#F0FDF4] hover:text-[#059669]'
                      }`
                    }
                  >
                    <item.icon className="w-[18px] h-[18px] stroke-[2] flex-shrink-0" />
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* =================================================================== */}
        {/* 3. DEDICATED SIDEBAR ACCOUNT & NOTIFICATION SECTION AT THE BOTTOM */}
        {/* =================================================================== */}
        <div className="p-2 border-t border-[#E8F3EC] bg-white relative flex-shrink-0">
          {!isCollapsed ? (
            /* Expanded State: Horizontally aligned [Account Profile] [Notification Bell] */
            <div className="flex items-center justify-between gap-1.5">
              {/* Account Profile Trigger Button */}
              <div className="relative flex-1 min-w-0" ref={accountRef}>
                <button
                  onClick={handleToggleAccount}
                  className="w-full flex items-center justify-between p-1.5 rounded-xl hover:bg-[#F0FDF4] transition-colors cursor-pointer group"
                  aria-label="Account Settings"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {/* User Avatar */}
                    <div className="w-8 h-8 rounded-full bg-[#0F382C] text-white font-bold flex items-center justify-center text-xs shadow-xs overflow-hidden flex-shrink-0 group-hover:ring-2 group-hover:ring-emerald-300 transition-all">
                      {user?.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt={user.fullName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span>{user?.fullName ? user.fullName[0].toUpperCase() : 'S'}</span>
                      )}
                    </div>

                    {/* User Name & Role */}
                    <div className="text-left min-w-0">
                      <h4 className="text-[12px] font-bold text-[#0F172A] leading-tight truncate">
                        {user?.fullName || 'Sanjai R'}
                      </h4>
                      <p className="text-[10px] text-[#64748B] font-medium truncate">
                        {user?.role === 'STORE_OWNER'
                          ? 'Store Owner'
                          : user?.role === 'MANAGER'
                          ? 'Manager'
                          : user?.role || 'Store Owner'}
                      </p>
                    </div>
                  </div>

                  {/* Dropdown Chevron */}
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-400 flex-shrink-0 transition-transform duration-200 ${
                      accountDropdownOpen ? 'rotate-180 text-[#059669]' : ''
                    }`}
                  />
                </button>

                {/* Account Dropdown Menu (Opens upwards) */}
                {accountDropdownOpen && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute bottom-[54px] left-0 w-56 bg-white rounded-2xl shadow-[0_10px_35px_-5px_rgba(0,0,0,0.15)] border border-[#E2F0E7] py-2 z-50 animate-in fade-in slide-in-from-bottom-2 duration-150 select-none"
                  >
                    <div className="px-3.5 py-2 border-b border-slate-100">
                      <p className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-wider">
                        Signed in as
                      </p>
                      <p className="text-xs font-bold text-[#0F172A] truncate mt-0.5">
                        {user?.email || 'owner@stocksense.com'}
                      </p>
                    </div>

                    <div className="py-1 px-1">
                      <button
                        onClick={() => {
                          setAccountDropdownOpen(false);
                          navigate('/settings');
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-[#334155] hover:bg-[#F0FDF4] hover:text-[#059669] flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <Settings className="w-4 h-4 text-[#64748B]" />
                        <span>Store Settings</span>
                      </button>
                    </div>

                    <div className="border-t border-slate-100 pt-1 px-1">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Notification Bell Button (Beside Account Profile) */}
              <div className="relative flex-shrink-0" ref={notifRef}>
                <button
                  onClick={handleToggleNotifications}
                  className="w-8 h-8 rounded-xl border border-[#E2E8F0] bg-white hover:bg-[#F0FDF4] hover:border-emerald-300 flex items-center justify-center text-[#475569] transition-colors relative shadow-2xs cursor-pointer group"
                  title="Notifications"
                  aria-label="Notifications"
                >
                  <Bell className="w-4 h-4 text-[#059669] group-hover:scale-105 transition-transform" />
                  {unreadNotifications > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-red-500 text-white text-[9.5px] font-bold rounded-full flex items-center justify-center shadow-xs">
                      {unreadNotifications > 9 ? '9+' : unreadNotifications}
                    </span>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* Collapsed State: Stacked compact Account Avatar & Notification Bell */
            <div className="flex flex-col items-center gap-2">
              {/* Collapsed Account Avatar Trigger */}
              <div className="relative" ref={accountRef}>
                <button
                  onClick={handleToggleAccount}
                  className="w-9 h-9 rounded-full bg-[#0F382C] text-white font-bold flex items-center justify-center text-xs shadow-xs overflow-hidden hover:ring-2 hover:ring-emerald-300 transition-all cursor-pointer group"
                  title={`${user?.fullName || 'Account'} (${user?.role || 'Store Owner'})`}
                  aria-label="Account Settings"
                >
                  {user?.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{user?.fullName ? user.fullName[0].toUpperCase() : 'S'}</span>
                  )}
                </button>

                {/* Collapsed Account Dropdown */}
                {accountDropdownOpen && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="fixed left-[76px] bottom-3 w-60 bg-white rounded-2xl shadow-[0_10px_35px_-5px_rgba(0,0,0,0.15)] border border-[#E2F0E7] py-2 z-50 animate-in fade-in slide-in-from-left-2 duration-150 select-none"
                  >
                    <div className="px-3.5 py-2 border-b border-slate-100">
                      <p className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-wider">
                        Signed in as
                      </p>
                      <p className="text-xs font-bold text-[#0F172A] truncate mt-0.5">
                        {user?.email || 'owner@stocksense.com'}
                      </p>
                    </div>

                    <div className="py-1 px-1">
                      <button
                        onClick={() => {
                          setAccountDropdownOpen(false);
                          navigate('/settings');
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-[#334155] hover:bg-[#F0FDF4] hover:text-[#059669] flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <Settings className="w-4 h-4 text-[#64748B]" />
                        <span>Store Settings</span>
                      </button>
                    </div>

                    <div className="border-t border-slate-100 pt-1 px-1">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Collapsed Notification Bell Trigger */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={handleToggleNotifications}
                  className="w-9 h-9 rounded-xl border border-[#E2E8F0] bg-white hover:bg-[#F0FDF4] hover:border-emerald-300 flex items-center justify-center text-[#475569] transition-colors relative shadow-2xs cursor-pointer group"
                  title="Notifications"
                  aria-label="Notifications"
                >
                  <Bell className="w-4.5 h-4.5 text-[#059669] group-hover:scale-105 transition-transform" />
                  {unreadNotifications > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-red-500 text-white text-[9.5px] font-bold rounded-full flex items-center justify-center shadow-xs">
                      {unreadNotifications > 9 ? '9+' : unreadNotifications}
                    </span>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* NOTIFICATIONS PANEL (Fixed/Absolute Overlay to Prevent Clipping) */}
          {/* =============================================================== */}
          {notificationDropdownOpen && (
            <div
              ref={notifPanelRef}
              onClick={(e) => e.stopPropagation()}
              className={`${
                isCollapsed
                  ? 'fixed left-[76px] bottom-3 w-[340px] sm:w-[380px]'
                  : 'absolute bottom-[54px] left-1 w-[320px] sm:w-[350px]'
              } bg-white rounded-2xl shadow-[0_12px_45px_-5px_rgba(0,0,0,0.22)] border border-[#E2F0E7] py-3 z-50 animate-in fade-in slide-in-from-bottom-2 duration-150 select-none`}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 pb-2.5 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-slate-800 text-sm">Notifications</h3>
                  {unreadNotifications > 0 && (
                    <span className="px-2 py-0.5 bg-red-100 text-red-600 text-[11px] font-bold rounded-full">
                      {unreadNotifications} new
                    </span>
                  )}
                </div>
                {unreadNotifications > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[12px] text-[#059669] font-bold hover:underline cursor-pointer"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              {/* Body */}
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 scrollbar-thin">
                {notificationsLoading ? (
                  <div className="p-6 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
                    <RotateCw className="w-4 h-4 animate-spin text-emerald-600" />
                    <span>Loading notifications...</span>
                  </div>
                ) : notificationsError ? (
                  <div className="p-6 text-center text-xs text-slate-500 flex flex-col items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                    <span>Could not load notifications.</span>
                    <button
                      onClick={fetchNotifications}
                      className="text-[#059669] font-bold text-xs hover:underline cursor-pointer"
                    >
                      Retry
                    </button>
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
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-emerald-100 text-[#059669]'
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
                            <span className="w-1.5 h-1.5 rounded-full bg-[#059669] flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                          {notif.message}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-xs text-slate-400 flex flex-col items-center gap-1.5">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                    <p className="font-semibold text-slate-600">All caught up!</p>
                    <p className="text-[11px] text-slate-400">No unread notifications.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
