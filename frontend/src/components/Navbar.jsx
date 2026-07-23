import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Link, useNavigate } from 'react-router-dom';
import { Sun, Moon, LogOut, User, Menu, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Navbar({ onToggleSidebar }) {
    const { user, logout } = useAuth();
    const { darkMode, toggleDarkMode } = useTheme();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    // Extract initials for the profile avatar fallback
    const getInitials = (name) => {
        if (!name) return 'PG';
        return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
    };

    return (
        <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md transition-colors duration-200">
            <div className="flex h-16 items-center justify-between px-4 sm:px-6">
                
                {/* Mobile & Tablet Sidebar Menu Toggle */}
                <div className="flex items-center space-x-3">
                    <button
                        onClick={onToggleSidebar}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden focus:outline-none"
                        id="sidebar-toggle"
                    >
                        <Menu className="h-5 w-5" />
                    </button>
                    
                    {/* Branding */}
                    <Link to="/dashboard" className="flex items-center space-x-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
                            <Sparkles className="h-5 w-5" />
                        </div>
                        <span className="hidden font-sans font-bold text-lg tracking-tight text-slate-900 dark:text-white sm:block">
                            PrepGenius <span className="text-blue-600">AI</span>
                        </span>
                    </Link>
                </div>

                {/* Right Action Items */}
                <div className="flex items-center space-x-3">
                    {/* Theme Toggle Button */}
                    <button
                        onClick={toggleDarkMode}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400 focus:outline-none transition"
                        title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                        id="theme-toggle"
                    >
                        {darkMode ? (
                            <Sun className="h-5 w-5 text-yellow-500 animate-spin-slow" />
                        ) : (
                            <Moon className="h-5 w-5 text-slate-600" />
                        )}
                    </button>

                    {/* Profile Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            className="flex items-center space-x-2 focus:outline-none group"
                            id="profile-dropdown-trigger"
                        >
                            {user?.avatarUrl ? (
                                <img
                                    className="h-9 w-9 rounded-xl object-cover ring-2 ring-slate-100 dark:ring-slate-800 group-hover:ring-blue-500/50 transition-all"
                                    src={user.avatarUrl}
                                    alt={user.name}
                                    referrerPolicy="no-referrer"
                                />
                            ) : (
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30 font-semibold text-blue-700 dark:text-blue-400 text-sm ring-2 ring-slate-100 dark:ring-slate-800 group-hover:ring-blue-500/50 transition-all">
                                    {getInitials(user?.name)}
                                </div>
                            )}
                            <span className="hidden text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 md:block max-w-[120px] truncate">
                                {user?.name || "Candidate"}
                            </span>
                        </button>

                        <AnimatePresence>
                            {dropdownOpen && (
                                <>
                                    {/* Overlay back to close dropdown */}
                                    <div className="fixed inset-0 z-30" onClick={() => setDropdownOpen(false)} />
                                    
                                    <motion.div
                                        className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 py-1.5 shadow-xl ring-1 ring-black/5 focus:outline-none z-40"
                                        initial={{ opacity: 0, scale: 0.95, y: -5 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95, y: -5 }}
                                        transition={{ duration: 0.15 }}
                                    >
                                        <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                                            <p className="text-xs text-slate-400 dark:text-slate-500">Signed in as</p>
                                            <p className="font-semibold text-sm text-slate-800 dark:text-slate-200 truncate">{user?.email}</p>
                                        </div>
                                        
                                        <div className="py-1">
                                            <Link
                                                to="/profile"
                                                onClick={() => setDropdownOpen(false)}
                                                className="flex w-full items-center px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-blue-600"
                                            >
                                                <User className="mr-3 h-4 w-4" />
                                                My Profile
                                            </Link>
                                        </div>

                                        <div className="border-t border-slate-100 dark:border-slate-800 py-1">
                                            <button
                                                onClick={() => {
                                                    setDropdownOpen(false);
                                                    handleLogout();
                                                }}
                                                className="flex w-full items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20"
                                            >
                                                <LogOut className="mr-3 h-4 w-4" />
                                                Log Out
                                            </button>
                                        </div>
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

            </div>
        </header>
    );
}
