import React, { useState } from 'react';
import { UserStats, ActivityLog } from '../../core/types';
import { motion, AnimatePresence } from 'motion/react';
import {
    Award, User, MapPin, Globe, Bell, ShieldCheck,
    History, Clock, ArrowUpRight, ArrowDownLeft,
    ChevronRight, LogOut, Info, Settings, Trophy
} from 'lucide-react';
import { auth } from '@/services/firebase/index';
import { signOut } from 'firebase/auth';
import { useCivStore } from '@/core/progression/store';
import { LeaderboardTab } from '@/features/leaderboard/leaderboardTab';
import { platformConfirm } from '../../platform/mobile/utils/interactions';

export function MenuTab() {
    const stats = useCivStore((state) => state.stats);
    const logs = useCivStore((state) => state.logs);
    const [activeSection, setActiveSection] = useState<'profile' | 'logs' | 'rank' | 'settings'>('profile');
    const user = auth.currentUser;

    const badgeGallery = [
        { title: 'Pionir Batu', icon: 'Mountain', unlocked: stats.level >= 1 },
        { title: 'Ksatria Besi', icon: 'Shield', unlocked: stats.level >= 5 },
        { title: 'Insinyur Uap', icon: 'Zap', unlocked: stats.level >= 15 },
        { title: 'Warga Modern', icon: 'Smartphone', unlocked: stats.level >= 30 },
        { title: 'Avatar Digital', icon: 'Cpu', unlocked: stats.level >= 50 },
    ];

    const handleLogout = () => {
        if (platformConfirm('Keluar dari peradaban Fitnismu?')) {
            signOut(auth);
        }
    };

    return (
        <div className="flex flex-col gap-6 p-4 pb-32">
            {/* Menu Header / Switcher */}
            <div className="flex bg-white p-1.5 rounded-[2rem] neo-border shadow-[4px_4px_0_0_#2D3436]">
                {[
                    { id: 'profile', label: 'Profil', icon: User },
                    { id: 'logs', label: 'Log', icon: History },
                    { id: 'rank', label: 'Rank', icon: Trophy },
                    { id: 'settings', label: 'Opsi', icon: Settings }
                ].map((item) => {
                    const Icon = item.icon;
                    const isActive = activeSection === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveSection(item.id as any)}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl transition-all ${isActive ? 'bg-brand-dark text-white' : 'text-gray-400 hover:text-brand-dark'
                                }`}
                        >
                            <Icon className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
                        </button>
                    );
                })}
            </div>

            <AnimatePresence mode="wait">
                {activeSection === 'profile' && (
                    <motion.div
                        key="profile"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                    >
                        {/* Profile Card */}
                        <div className="bg-white rounded-[2.5rem] p-8 neo-border-lg neo-shadow-lg flex flex-col items-center">
                            <div className="w-24 h-24 rounded-full bg-brand-bg neo-border flex items-center justify-center mb-6 shadow-[4px_4px_0_0_#2D3436] overflow-hidden">
                                {user?.photoURL ? (
                                    <img src={user.photoURL} alt="User" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                ) : (
                                    <User className="w-12 h-12 text-brand-dark" />
                                )}
                            </div>
                            <h3 className="text-3xl font-black italic tracking-tighter uppercase mb-1 leading-none italic text-center">
                                {user?.displayName || 'Citizen #9923'}
                            </h3>
                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mb-8">Level {stats.level} Survivor</p>

                            <div className="grid grid-cols-2 gap-4 w-full">
                                <div className="bg-gray-50 neo-border p-4 rounded-3xl flex flex-col items-center neo-shadow shadow-[2px_2px_0_0_#2D3436]">
                                    <span className="text-xl font-black font-mono">{stats.dayCount}</span>
                                    <span className="text-[8px] font-black uppercase text-gray-400">Hari Aktif</span>
                                </div>
                                <div className="bg-gray-50 neo-border p-4 rounded-3xl flex flex-col items-center neo-shadow shadow-[2px_2px_0_0_#2D3436]">
                                    <span className="text-xl font-black font-mono tracking-tighter italic">S{stats.level}</span>
                                    <span className="text-[8px] font-black uppercase text-gray-400">Tier Kota</span>
                                </div>
                            </div>
                        </div>

                        {/* Badge Gallery */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 px-1">
                                <Award className="w-4 h-4 text-gray-400" />
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Galeri Lencana</h3>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                {badgeGallery.map((badge, i) => (
                                    <div
                                        key={i}
                                        className={`aspect-square rounded-[2rem] flex flex-col items-center justify-center gap-2 border-2 transition-all p-3 ${badge.unlocked ? 'bg-white border-brand-dark neo-shadow shadow-[2px_2px_0_0_#2D3436]' : 'bg-gray-100 border-dashed border-gray-200 opacity-40 grayscale'
                                            }`}
                                    >
                                        <div className={`p-2 rounded-xl border border-brand-dark shadow-[1px_1px_0_0_#2D3436] ${badge.unlocked ? 'bg-brand-yellow' : 'bg-gray-200'}`}>
                                            <Globe className={`w-6 h-6 ${badge.unlocked ? 'text-brand-dark' : 'text-gray-400'}`} />
                                        </div>
                                        <span className="text-[8px] font-black uppercase text-center leading-tight tracking-tight">{badge.title}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeSection === 'logs' && (
                    <motion.div
                        key="logs"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-4"
                    >
                        <div className="bg-white rounded-[2.5rem] p-6 neo-border-lg neo-shadow-lg">
                            <div className="flex items-center gap-3 mb-6">
                                <History className="w-6 h-6 text-brand-dark" />
                                <h3 className="text-xl font-black italic tracking-tighter uppercase">Riwayat Aktivitas</h3>
                            </div>

                            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 no-scrollbar">
                                {(logs?.length || 0) > 0 ? (
                                    logs.map((log) => (
                                        <div
                                            key={log.id}
                                            className="flex items-start gap-4 p-4 rounded-2xl border-2 border-brand-dark shadow-[2px_2px_0_0_#000] bg-brand-bg/20"
                                        >
                                            <div className={`mt-1 p-2 rounded-xl neo-border shadow-[1px_1px_0_0_#000] ${log.change > 0 ? 'bg-brand-teal text-white' : 'bg-brand-red text-white'
                                                }`}>
                                                {log.change > 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-xs font-black uppercase tracking-tight text-brand-dark leading-snug">{log.message}</p>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <div className="flex items-center gap-1 text-[8px] font-black uppercase text-gray-400 tracking-[0.2em]">
                                                        <Clock className="w-2.5 h-2.5" />
                                                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                    <span className={`text-[8px] font-black underline decoration-2 underline-offset-4 uppercase tracking-widest ${log.change > 0 ? 'text-brand-teal' : 'text-brand-red'
                                                        }`}>
                                                        {log.change > 0 ? '+' : ''}{log.change} {log.unit}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-12">
                                        <p className="text-[10px] font-black uppercase text-gray-300 italic tracking-widest">Belum ada catatan aktivitas...</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeSection === 'rank' && (
                    <motion.div
                        key="rank"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        <LeaderboardTab isEmbedded />
                    </motion.div>
                )}

                {activeSection === 'settings' && (
                    <motion.div
                        key="settings"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                    >
                        {/* Preferences */}
                        <div className="bg-brand-dark rounded-[2.5rem] p-8 text-white space-y-4 neo-shadow-lg neoborder-lg">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-2xl font-black uppercase italic tracking-tighter text-brand-teal">Layanan Sektor</h3>
                                <ShieldCheck className="w-6 h-6 text-brand-teal" />
                            </div>

                            <div className="space-y-3">
                                <button className="w-full flex items-center justify-between p-4 bg-white/10 rounded-2xl neo-border hover:bg-white/20 transition-all active:translate-y-0.5">
                                    <div className="flex items-center gap-3">
                                        <MapPin className="w-4 h-4 text-brand-teal" />
                                        <span className="text-sm font-black uppercase tracking-tight">Zona Waktu</span>
                                    </div>
                                    <span className="text-[10px] font-black text-brand-yellow">WIB</span>
                                </button>
                                <button className="w-full flex items-center justify-between p-4 bg-white/10 rounded-2xl neo-border hover:bg-white/20 transition-all active:translate-y-0.5">
                                    <div className="flex items-center gap-3">
                                        <Bell className="w-4 h-4 text-brand-teal" />
                                        <span className="text-sm font-black uppercase tracking-tight">Notifikasi</span>
                                    </div>
                                    <div className="w-10 h-5 bg-brand-red neo-border rounded-full flex items-center px-1">
                                        <div className="w-3 h-3 bg-white rounded-full translate-x-5" />
                                    </div>
                                </button>
                                <button className="w-full flex items-center justify-between p-4 bg-white/10 rounded-2xl neo-border hover:bg-white/20 transition-all active:translate-y-0.5">
                                    <div className="flex items-center gap-3">
                                        <Info className="w-4 h-4 text-brand-teal" />
                                        <span className="text-sm font-black uppercase tracking-tight">Bantuan & FAQ</span>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-white/40" />
                                </button>
                            </div>
                        </div>

                        <button
                            onClick={handleLogout}
                            className="w-full bg-brand-red text-white py-5 rounded-[2rem] neo-border shadow-[4px_4px_0_0_#2D3436] flex items-center justify-center gap-3 hover:opacity-90 active:translate-y-1 active:shadow-none transition-all"
                        >
                            <LogOut className="w-5 h-5" />
                            <span className="font-black uppercase italic tracking-widest text-lg">Keluar Sesi</span>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Footer Info */}
            <div className="text-center py-4">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mb-2 leading-none">CivFit v1.7.0 Cloud Sync</p>
                <p className="text-[8px] text-gray-500 font-bold uppercase italic tracking-widest">Build peradabanmu, bangun dirimu.</p>
            </div>
        </div>
    );
}