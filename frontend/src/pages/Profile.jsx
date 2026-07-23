import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Loader from '../components/Loader';
import { 
    User, Mail, Briefcase, Award, ShieldAlert, 
    Trash2, Save, Key, Upload, AlertCircle, CheckCircle2 
} from 'lucide-react';
import { motion } from 'motion/react';

export default function Profile() {
    const { user, updateProfile, updateAvatar, logout } = useAuth();
    
    // Core profile form state
    const [name, setName] = useState('');
    const [bio, setBio] = useState('');
    const [targetJob, setTargetJob] = useState('');
    const [experienceLevel, setExperienceLevel] = useState('Mid-Level');
    const [skills, setSkills] = useState('');
    const [linkedin, setLinkedin] = useState('');

    // Avatar upload state
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarUrlInput, setAvatarUrlInput] = useState('');

    // Password change state
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Status / Feedback state
    const [loading, setLoading] = useState(false);
    const [feedback, setFeedback] = useState({ text: '', type: '' });

    useEffect(() => {
        if (user) {
            setName(user.name || '');
            setBio(user.bio || '');
            setTargetJob(user.targetJob || '');
            setExperienceLevel(user.experienceLevel || 'Mid-Level');
            setSkills(Array.isArray(user.skills) ? user.skills.join(', ') : user.skills || '');
            setLinkedin(user.socialLinks?.linkedin || '');
            setAvatarUrlInput(user.avatarUrl || '');
        }
    }, [user]);

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setFeedback({ text: '', type: '' });

        const parsedSkills = skills.split(',').map(s => s.trim()).filter(Boolean);

        const result = await updateProfile({
            name,
            bio,
            targetJob,
            experienceLevel,
            skills: parsedSkills,
            socialLinks: { linkedin }
        });

        setLoading(false);
        if (result.success) {
            setFeedback({ text: 'Profile information updated successfully!', type: 'success' });
        } else {
            setFeedback({ text: result.error, type: 'error' });
        }
    };

    const handleAvatarSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setFeedback({ text: '', type: '' });

        const formData = new FormData();
        if (avatarFile) {
            formData.append('avatar', avatarFile);
        } else if (avatarUrlInput) {
            formData.append('avatarUrl', avatarUrlInput);
        } else {
            setFeedback({ text: 'Please select an image file or enter an avatar URL', type: 'error' });
            setLoading(false);
            return;
        }

        const result = await updateAvatar(formData);
        setLoading(false);
        if (result.success) {
            setFeedback({ text: 'Profile picture updated successfully!', type: 'success' });
            setAvatarFile(null);
        } else {
            setFeedback({ text: result.error, type: 'error' });
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setFeedback({ text: '', type: '' });

        if (newPassword !== confirmPassword) {
            setFeedback({ text: 'New passwords do not match', type: 'error' });
            return;
        }

        setLoading(true);
        try {
            await api.post('/auth/change-password', {
                oldPassword,
                newPassword
            });
            setFeedback({ text: 'Password changed successfully!', type: 'success' });
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            const msg = err.response?.data?.message || 'Password update failed. Check old password.';
            setFeedback({ text: msg, type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        const confirmDelete = window.confirm(
            "CRITICAL WARNING:\n\nAre you sure you want to permanently delete your account? This will erase all resumes, mock practice scores, and historical logs. This action is irreversible."
        );
        if (!confirmDelete) return;

        setLoading(true);
        try {
            await api.delete('/users/account');
            await logout();
            window.location.href = '/login';
        } catch (err) {
            console.error("Account deletion failed:", err);
            setFeedback({ text: 'Failed to complete account deletion.', type: 'error' });
            setLoading(false);
        }
    };

    const getInitials = (name) => {
        if (!name) return 'PG';
        return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div>
                <h1 className="text-2xl font-bold text-slate-950 dark:text-white font-sans tracking-tight">
                    Candidate Profile & Preferences
                </h1>
                <p className="text-sm text-slate-400 mt-1">
                    Manage your target experience specifications, resume attributes, and personal safety details.
                </p>
            </div>

            {feedback.text && (
                <div className={`p-4 rounded-xl flex items-center space-x-3 text-sm border ${
                    feedback.type === 'success' 
                        ? 'bg-green-50 text-green-700 border-green-100 dark:bg-green-950/25 dark:text-green-400 dark:border-green-900/30' 
                        : 'bg-red-50 text-red-700 border-red-100 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30'
                }`}>
                    {feedback.type === 'success' ? <CheckCircle2 className="h-5 w-5 shrink-0" /> : <AlertCircle className="h-5 w-5 shrink-0" />}
                    <span>{feedback.text}</span>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Left column: Profile Avatar details */}
                <div className="space-y-6">
                    
                    {/* Picture info card */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col items-center text-center space-y-4">
                        {user?.avatarUrl ? (
                            <img 
                                src={user.avatarUrl} 
                                alt={user.name} 
                                className="h-24 w-24 rounded-2xl object-cover ring-4 ring-blue-50 dark:ring-blue-950/50"
                                referrerPolicy="no-referrer"
                            />
                        ) : (
                            <div className="h-24 w-24 rounded-2xl bg-blue-100 dark:bg-blue-900/30 font-bold text-3xl text-blue-600 flex items-center justify-center">
                                {getInitials(name)}
                            </div>
                        )}
                        <div>
                            <h3 className="font-bold text-slate-800 dark:text-white">{name || "Candidate"}</h3>
                            <p className="text-xs text-slate-400">{user?.email}</p>
                        </div>

                        {/* Avatar uploader form */}
                        <form onSubmit={handleAvatarSubmit} className="w-full pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-3.5">
                            <div className="space-y-1">
                                <label className="block text-[10px] font-bold text-slate-400 uppercase text-left tracking-wider">
                                    Upload Image File
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setAvatarFile(e.target.files[0])}
                                    className="block w-full text-xs text-slate-500 file:mr-3 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full inline-flex items-center justify-center space-x-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg transition"
                            >
                                <Upload className="h-3.5 w-3.5" />
                                <span>Save Avatar</span>
                            </button>
                        </form>
                    </div>

                    {/* Quick Stats Summary */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
                        <h4 className="font-bold text-slate-800 dark:text-white text-xs uppercase tracking-wider">Target Profile</h4>
                        <div className="space-y-3 text-xs">
                            <div className="flex justify-between">
                                <span className="text-slate-400">Job Role:</span>
                                <span className="font-semibold text-slate-700 dark:text-slate-300">{targetJob || 'Not set'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Experience:</span>
                                <span className="font-semibold text-slate-700 dark:text-slate-300">{experienceLevel}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Account Type:</span>
                                <span className="font-semibold text-blue-600 dark:text-blue-400">Full-Access PRO</span>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Right column: Edit forms */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* Edit Profile Info details form */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
                        <div className="flex items-center space-x-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                            <User className="h-5 w-5 text-blue-500" />
                            <h3 className="font-bold text-slate-800 dark:text-white">Profile Details</h3>
                        </div>

                        <form onSubmit={handleProfileSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="block w-full px-4 py-2 border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                                        Target Job Role
                                    </label>
                                    <input
                                        type="text"
                                        value={targetJob}
                                        onChange={(e) => setTargetJob(e.target.value)}
                                        className="block w-full px-4 py-2 border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
                                        placeholder="e.g. Senior Product Manager"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                                        Experience Seniority
                                    </label>
                                    <select
                                        value={experienceLevel}
                                        onChange={(e) => setExperienceLevel(e.target.value)}
                                        className="block w-full px-4 py-2 border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
                                    >
                                        <option value="Entry-Level">Entry-Level (0-2 years)</option>
                                        <option value="Mid-Level">Mid-Level (2-5 years)</option>
                                        <option value="Senior-Level">Senior-Level (5+ years)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                                        LinkedIn Profile Link
                                    </label>
                                    <input
                                        type="url"
                                        value={linkedin}
                                        onChange={(e) => setLinkedin(e.target.value)}
                                        className="block w-full px-4 py-2 border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
                                        placeholder="https://linkedin.com/in/username"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                                    Key Skills (Comma-separated)
                                </label>
                                <input
                                    type="text"
                                    value={skills}
                                    onChange={(e) => setSkills(e.target.value)}
                                    className="block w-full px-4 py-2 border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
                                    placeholder="React, NodeJS, MongoDB, System Design, STAR Framework"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                                    Short Bio / Elevator pitch
                                </label>
                                <textarea
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    rows="4"
                                    className="block w-full px-4 py-2 border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition resize-none"
                                    placeholder="Brief introductory pitch highlighted for AI evaluations..."
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="inline-flex items-center space-x-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-md transition cursor-pointer"
                            >
                                <Save className="h-4 w-4" />
                                <span>{loading ? 'Saving...' : 'Update Details'}</span>
                            </button>
                        </form>
                    </div>

                    {/* Change Password Form details */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
                        <div className="flex items-center space-x-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                            <Key className="h-5 w-5 text-blue-500" />
                            <h3 className="font-bold text-slate-800 dark:text-white">Credentials & Access</h3>
                        </div>

                        <form onSubmit={handlePasswordSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                                        Current Password
                                    </label>
                                    <input
                                        type="password"
                                        value={oldPassword}
                                        onChange={(e) => setOldPassword(e.target.value)}
                                        className="block w-full px-4 py-2 border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                                        New Password
                                    </label>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="block w-full px-4 py-2 border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                                        Confirm Password
                                    </label>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="block w-full px-4 py-2 border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="inline-flex items-center space-x-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-md transition cursor-pointer"
                            >
                                <Key className="h-4 w-4" />
                                <span>Update Password</span>
                            </button>
                        </form>
                    </div>

                    {/* Danger zone details */}
                    <div className="bg-red-50/10 border border-red-100 dark:border-red-950/40 rounded-2xl p-6 shadow-sm space-y-4">
                        <div className="flex items-center space-x-2 pb-2 border-b border-red-100 dark:border-red-950/40">
                            <ShieldAlert className="h-5 w-5 text-red-500" />
                            <h3 className="font-bold text-red-700 dark:text-red-400">Danger Zone Area</h3>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
                            Once your candidate profile account is cleared, it is completely purged. All files, summaries, evaluations and analytics will be permanently destroyed from our databases.
                        </p>
                        <button
                            onClick={handleDeleteAccount}
                            disabled={loading}
                            className="inline-flex items-center space-x-1.5 px-4.5 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-sm transition cursor-pointer"
                        >
                            <Trash2 className="h-4 w-4" />
                            <span>Permanently Delete Account</span>
                        </button>
                    </div>

                </div>

            </div>
        </div>
    );
}
