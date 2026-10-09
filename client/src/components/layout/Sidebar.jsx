import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  BarChart3,
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
  Package,
  Layers,
  ArrowDownLeft,
  ArrowUpRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ isOpen, onClose, isCollapsed, onToggleCollapse, onOpenAiAssistant }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const accountRef = useRef(null);

  // Close account dropdown on outside click or Escape
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (accountRef.current && !accountRef.current.contains(event.target)) {
        setAccountDropdownOpen(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setAccountDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleLogout = () => {
    setAccountDropdownOpen(false);
    logout();
    navigate('/login');
  };

  const navGroups = [
    {
      section: null,
      items: [
        { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
      ],
    },
    {
      section: 'INVENTORY & SALES',
      items: [
        { label: 'Products', icon: Package, path: '/products' },
        { label: 'Categories', icon: Layers, path: '/categories' },
        { label: 'Stock In (Purchase)', icon: ArrowDownLeft, path: '/stock-in' },
        { label: 'Stock Out (Sales)', icon: ArrowUpRight, path: '/stock-out' },
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
        { label: 'Reports & Analytics', icon: BarChart3, path: '/reports' },
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
        <div className="h-[68px] flex items-center px-3 border-b border-[#E8F3EC] flex-shrink-0">
          {!isCollapsed ? (
            <div className="flex items-center justify-between w-full min-w-0">
              {/* StackSense AI Official Logo */}
              <NavLink
                to="/"
                className="flex items-center min-w-0 focus:outline-hidden group"
                title="StockSense AI — Supermarket Inventory Management"
              >
                <img
                  src="/stocksense-logo.png"
                  alt="StockSense AI — Supermarket Inventory Management"
                  className="w-[176px] max-w-[185px] h-auto object-contain object-left flex-shrink-0 group-hover:opacity-95 transition-opacity"
                />
              </NavLink>

              {/* Collapse Button */}
              <button
                onClick={() => {
                  if (window.innerWidth < 1024) {
                    onClose && onClose();
                  } else {
                    onToggleCollapse && onToggleCollapse();
                  }
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-[#00966B] hover:bg-[#E8F8EE] transition-colors cursor-pointer flex-shrink-0 ml-1"
                title="Collapse Sidebar"
                aria-label="Collapse Sidebar"
              >
                <ChevronsLeft className="w-4 h-4 stroke-[2.2]" />
              </button>
            </div>
          ) : (
            <div className="w-full flex items-center justify-center">
              <button
                onClick={onToggleCollapse}
                className="group relative flex items-center justify-center cursor-pointer p-0.5"
                title="Click to Expand Sidebar"
                aria-label="Expand Sidebar"
              >
                <div className="w-10 h-10 rounded-xl bg-[#E8F8EE] border border-[#CDE9D6] text-[#00966B] flex items-center justify-center shadow-2xs group-hover:scale-105 group-hover:bg-[#DCFCE7] group-hover:border-emerald-300 transition-all">
                  <ShoppingCart className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-white border border-[#CDE9D6] text-[#00966B] flex items-center justify-center shadow-2xs group-hover:bg-[#00966B] group-hover:text-white transition-colors">
                  <ChevronsRight className="w-2.5 h-2.5 stroke-[2.5]" />
                </div>
              </button>
            </div>
          )}
        </div>

        {/* =================================================================== */}
        {/* 2. NAVIGATION ITEMS */}
        {/* =================================================================== */}
        <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-3.5 scrollbar-thin">
          {navGroups.map((group, gIdx) => (
            <div key={group.section || `sec-${gIdx}`} className="space-y-1">
              {/* Section Header */}
              {group.section && !isCollapsed && (
                <div className="px-3 pt-1 text-[10px] font-extrabold text-[#94A3B8] tracking-wider uppercase">
                  {group.section}
                </div>
              )}
              {isCollapsed && group.section && (
                <div className="w-6 mx-auto h-[1px] bg-slate-200/70 my-2" />
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
                          ? 'bg-[#E8F8EF] text-[#00966B] font-bold shadow-2xs'
                          : 'text-[#475569] hover:bg-[#F0FDF4] hover:text-[#00966B]'
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
        {/* 3. BOTTOM PROFILE SECTION */}
        {/* =================================================================== */}
        <div className="p-2 border-t border-[#E8F3EC] bg-white relative flex-shrink-0" ref={accountRef}>
          {!isCollapsed ? (
            <div className="flex items-center justify-between p-1.5 rounded-xl hover:bg-[#F0FDF4] transition-colors">
              <button
                onClick={() => setAccountDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2.5 min-w-0 flex-1 text-left cursor-pointer group"
                aria-label="User Account"
              >
                {/* Dark Green Circle with S */}
                <div className="w-8 h-8 rounded-full bg-[#083324] text-white font-extrabold flex items-center justify-center text-xs shadow-xs overflow-hidden flex-shrink-0 group-hover:ring-2 group-hover:ring-emerald-400 transition-all">
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt="User" className="w-full h-full object-cover" />
                  ) : (
                    <span>{user?.fullName ? user.fullName[0].toUpperCase() : 'S'}</span>
                  )}
                </div>

                {/* User Name & Role */}
                <div className="min-w-0 flex-1">
                  <h4 className="text-[12px] font-bold text-[#0F172A] leading-tight truncate">
                    {user?.fullName || 'sanjai R'}
                  </h4>
                  <div className="flex items-center gap-1 text-[10px] text-[#64748B] font-medium">
                    <span className="truncate">
                      {user?.role === 'STORE_OWNER' ? 'Store Owner' : user?.role || 'Store Owner'}
                    </span>
                    <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${accountDropdownOpen ? 'rotate-180' : ''}`} />
                  </div>
                </div>
              </button>

              {/* Quick Sign Out Icon */}
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer flex-shrink-0"
                title="Sign Out"
                aria-label="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1.5">
              <button
                onClick={() => setAccountDropdownOpen((prev) => !prev)}
                className="w-9 h-9 rounded-full bg-[#083324] text-white font-extrabold flex items-center justify-center text-xs shadow-xs hover:ring-2 hover:ring-emerald-400 transition-all cursor-pointer"
                title={`${user?.fullName || 'sanjai R'} (Store Owner)`}
              >
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt="User" className="w-full h-full object-cover" />
                ) : (
                  <span>{user?.fullName ? user.fullName[0].toUpperCase() : 'S'}</span>
                )}
              </button>
            </div>
          )}

          {/* Account Dropdown Menu */}
          {accountDropdownOpen && (
            <div
              className={`absolute ${
                isCollapsed ? 'left-[76px] bottom-2 w-60' : 'bottom-[56px] left-2 right-2'
              } bg-white rounded-2xl shadow-[0_10px_35px_-5px_rgba(0,0,0,0.15)] border border-[#E2F0E7] py-2 z-50 animate-in fade-in slide-in-from-bottom-2 duration-150 select-none`}
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
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-[#334155] hover:bg-[#F0FDF4] hover:text-[#00966B] flex items-center gap-2.5 transition-colors cursor-pointer"
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
      </aside>
    </>
  );
};

export default Sidebar;
