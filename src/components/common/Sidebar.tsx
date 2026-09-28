import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { formatDoctorWelcomeName } from '../../utils/doctorName.js';
import {
  LayoutDashboard,
  Calendar,
  FileText,
  History,
  Activity,
  User,
  Users,
  Stethoscope,
  ClipboardList,
  LogOut,
  X,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  name: string;
  path: string;
  icon: any;
  badge?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const patientNav: NavItem[] = [
    { name: 'Dashboard', path: '/patient/dashboard', icon: LayoutDashboard },
    { name: 'Appointments', path: '/patient/appointments', icon: Calendar },
    { name: 'Prescriptions', path: '/patient/prescriptions', icon: FileText },
    { name: 'Medical History', path: '/patient/medical-history', icon: History },
    {
      name: 'Health Progress',
      path: '/patient/progress',
      icon: Activity,
      badge: 'Core',
    },
    { name: 'Profile', path: '/patient/profile', icon: User },
  ];

  const doctorNav: NavItem[] = [
    { name: 'Dashboard', path: '/doctor/dashboard', icon: LayoutDashboard },
    { name: 'Appointments', path: '/doctor/appointments', icon: Calendar },
    { name: 'Patients', path: '/doctor/patients', icon: Users },
    { name: 'Reviews', path: '/doctor/reviews', icon: Activity },
    { name: 'Prescriptions', path: '/doctor/prescriptions', icon: FileText },
    { name: 'Profile', path: '/doctor/profile', icon: User },
  ];

  const adminNav: NavItem[] = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Users', path: '/admin/users', icon: Users },
    { name: 'Patients', path: '/admin/patients', icon: User },
    { name: 'Doctors', path: '/admin/doctors', icon: Stethoscope },
    { name: 'Appointments', path: '/admin/appointments', icon: Calendar },
  ];

  const navItems =
    user.role === 'patient'
      ? patientNav
      : user.role === 'doctor'
      ? doctorNav
      : adminNav;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 bg-white border-r border-slate-200/80 transform transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col justify-between overflow-y-auto no-print`}
      >
        {/* Top Navigation list */}
        <div className="p-4">
          <div className="flex items-center justify-between md:hidden pb-3 mb-2 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Navigation Menu
            </span>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => onClose()}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2.5 rounded-lg text-xs transition-all ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 font-semibold shadow-2xs border-l-2 border-blue-600 pl-2.5'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 font-medium'
                    }`
                  }
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 shrink-0 transition-colors" />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-600 text-white">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>
        </div>

        {/* Bottom User info & Logout */}
        <div className="p-3 border-t border-slate-200 bg-slate-50/80">
          <div className="flex items-center gap-2.5 mb-2.5 px-1.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white font-bold flex items-center justify-center text-xs shadow-xs shrink-0">
              {user.full_name?.replace(/^(Dr\.|Dr)\s*/i, '').charAt(0) || 'U'}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-slate-900 truncate">
                {user.role === 'doctor' ? formatDoctorWelcomeName(user.full_name) : user.full_name}
              </span>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">{user.role}</span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-slate-200 hover:border-rose-200"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
};
