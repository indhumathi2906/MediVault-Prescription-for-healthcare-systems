import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar.js';

export const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500 no-print">
        <p>© {new Date().getFullYear()} MEDIVAULT - A Centralized Digital Healthcare Management System. All rights reserved.</p>
        <p className="mt-1 text-slate-400">Continuous Patient Health Progress Tracking & Digital Prescriptions</p>
      </footer>
    </div>
  );
};
