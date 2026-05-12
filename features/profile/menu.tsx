import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    Image,
    StyleSheet,
    Dimensions,
    Animated,
    Alert,
} from 'react-native';
import { useCivStore } from '../../core/progression/store';
import { auth } from '@/services/firebase';
import { signOut } from 'firebase/auth';
import { platformConfirm } from '../../platform/mobile/utils/interactions';
import { LeaderboardTab } from '@/features/leaderboard/leaderbord';
import {
    Award,
    User,
    MapPin,
    Globe,
    Bell,
    ShieldCheck,
    History,
    Clock,
    ArrowUpRight,
    ArrowDownLeft,
    ChevronRight,
    LogOut,
    Info,
    Settings,
    Trophy,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');
const BADGE_SIZE = (width - 64) / 3; // 3 columns with padding

export function MenuTab() {
    const stats = useCivStore((state) => state.stats);
    const logs = useCivStore((state) => state.logs);
    const [activeSection, setActiveSection] = useState<'profile' | 'logs' | 'rank' | 'settings'>('profile');
    const user = auth.currentUser;

    // Animations for sections
    const fadeAnim = useRef(new Animated.Value(1)).current;
    const slideAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Reset animations when section changes
        fadeAnim.setValue(0);
        slideAnim.setValue(10);
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
            Animated.spring(slideAnim, { toValue: 0, friction: 8, tension: 40, useNativeDriver: true }),
        ]).start();
    }, [activeSection]);

    const badgeGallery = [
        { title: 'Pionir Batu', icon: 'Mountain', unlocked: stats.level >= 1 },
        { title: 'Ksatria Besi', icon: 'Shield', unlocked: stats.level >= 5 },
        { title: 'Insinyur Uap', icon: 'Zap', unlocked: stats.level >= 15 },
        { title: 'Warga Modern', icon: 'Smartphone', unlocked: stats.level >= 30 },
        { title: 'Avatar Digital', icon: 'Cpu', unlocked: stats.level >= 50 },
    ];

    const handleLogout = async () => {
        const confirm = await platformConfirm('Keluar dari peradaban Fitnismu?');
        if (confirm) {
            signOut(auth);
        }
    };

    // Helper to render icon from name (simple mapping for demo)
    const renderBadgeIcon = (iconName: string, unlocked: boolean) => {
        const iconColor = unlocked ? '#1E293B' : '#94A3B8';
        switch (iconName) {
            case 'Mountain': return <Globe size={24} color={iconColor} />;
            case 'Shield': return <ShieldCheck size={24} color={iconColor} />;
            case 'Zap': return <ChevronRight size={24} color={iconColor} />; // fallback
            case 'Smartphone': return <Bell size={24} color={iconColor} />;
            case 'Cpu': return <Settings size={24} color={iconColor} />;
            default: return <Globe size={24} color={iconColor} />;
        }
    };

    const renderSection = () => {
        switch (activeSection) {
            case 'profile':
                return (
                    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                        <View style={styles.profileCard}>
                            <View style={styles.avatarContainer}>
                                {user?.photoURL ? (
                                    <Image source={{ uri: user.photoURL }} style={styles.avatar} />
                                ) : (
                                    <User size={48} color="#1E293B" />
                                )}
                            </View>
                            <Text style={styles.userName}>{user?.displayName || 'Citizen #9923'}</Text>
                            <Text style={styles.userLevel}>Level {stats.level} Survivor</Text>
                            <View style={styles.statsRow}>
                                <View style={styles.statBox}>
                                    <Text style={styles.statNumber}>{stats.dayCount}</Text>
                                    <Text style={styles.statLabel}>Hari Aktif</Text>
                                </View>
                                <View style={styles.statBox}>
                                    <Text style={styles.statNumber}>S{stats.level}</Text>
                                    <Text style={styles.statLabel}>Tier Kota</Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.badgeSection}>
                            <View style={styles.sectionHeader}>
                                <Award size={16} color="#94A3B8" />
                                <Text style={styles.sectionTitle}>Galeri Lencana</Text>
                            </View>
                            <View style={styles.badgeGrid}>
                                {badgeGallery.map((badge, idx) => (
                                    <View
                                        key={idx}
                                        style={[
                                            styles.badgeCard,
                                            badge.unlocked ? styles.badgeUnlocked : styles.badgeLocked,
                                        ]}
                                    >
                                        <View
                                            style={[
                                                styles.badgeIconContainer,
                                                badge.unlocked ? styles.badgeIconUnlocked : styles.badgeIconLocked,
                                            ]}
                                        >
                                            {renderBadgeIcon(badge.icon, badge.unlocked)}
                                        </View>
                                        <Text style={styles.badgeTitle}>{badge.title}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    </Animated.View>
                );

            case 'logs':
                return (
                    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                        <View style={styles.logsCard}>
                            <View style={styles.logsHeader}>
                                <History size={24} color="#1E293B" />
                                <Text style={styles.logsTitle}>Riwayat Aktivitas</Text>
                            </View>
                            <ScrollView style={styles.logsList} showsVerticalScrollIndicator={false}>
                                {(logs?.length || 0) > 0 ? (
                                    logs.map((log) => (
                                        <View key={log.id} style={styles.logItem}>
                                            <View
                                                style={[
                                                    styles.logIcon,
                                                    log.change > 0 ? styles.logIconPositive : styles.logIconNegative,
                                                ]}
                                            >
                                                {log.change > 0 ? (
                                                    <ArrowUpRight size={16} color="#FFFFFF" />
                                                ) : (
                                                    <ArrowDownLeft size={16} color="#FFFFFF" />
                                                )}
                                            </View>
                                            <View style={styles.logContent}>
                                                <Text style={styles.logMessage}>{log.message}</Text>
                                                <View style={styles.logMeta}>
                                                    <Clock size={10} color="#94A3B8" />
                                                    <Text style={styles.logTime}>
                                                        {new Date(log.timestamp).toLocaleTimeString([], {
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                        })}
                                                    </Text>
                                                    <Text
                                                        style={[
                                                            styles.logChange,
                                                            log.change > 0 ? styles.logChangePositive : styles.logChangeNegative,
                                                        ]}
                                                    >
                                                        {log.change > 0 ? '+' : ''}{log.change} {log.unit}
                                                    </Text>
                                                </View>
                                            </View>
                                        </View>
                                    ))
                                ) : (
                                    <View style={styles.emptyLogs}>
                                        <Text style={styles.emptyLogsText}>Belum ada catatan aktivitas...</Text>
                                    </View>
                                )}
                            </ScrollView>
                        </View>
                    </Animated.View>
                );

            case 'rank':
                return (
                    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                        <LeaderboardTab isEmbedded />
                    </Animated.View>
                );

            case 'settings':
                return (
                    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                        <View style={styles.settingsCard}>
                            <View style={styles.settingsHeader}>
                                <Text style={styles.settingsTitle}>Layanan Sektor</Text>
                                <ShieldCheck size={24} color="#14B8A6" />
                            </View>
                            <View style={styles.settingsOptions}>
                                <TouchableOpacity style={styles.settingItem}>
                                    <View style={styles.settingLeft}>
                                        <MapPin size={16} color="#14B8A6" />
                                        <Text style={styles.settingText}>Zona Waktu</Text>
                                    </View>
                                    <Text style={styles.settingValue}>WIB</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.settingItem}>
                                    <View style={styles.settingLeft}>
                                        <Bell size={16} color="#14B8A6" />
                                        <Text style={styles.settingText}>Notifikasi</Text>
                                    </View>
                                    <View style={styles.toggle}>
                                        <View style={styles.toggleKnob} />
                                    </View>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.settingItem}>
                                    <View style={styles.settingLeft}>
                                        <Info size={16} color="#14B8A6" />
                                        <Text style={styles.settingText}>Bantuan & FAQ</Text>
                                    </View>
                                    <ChevronRight size={16} color="#FFFFFF" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                            <LogOut size={20} color="#FFFFFF" />
                            <Text style={styles.logoutText}>Keluar Sesi</Text>
                        </TouchableOpacity>
                    </Animated.View>
                );

            default:
                return null;
        }
    };

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Tab Switcher */}
            <View style={styles.tabBar}>
                {[
                    { id: 'profile', label: 'Profil', Icon: User },
                    { id: 'logs', label: 'Log', Icon: History },
                    { id: 'rank', label: 'Rank', Icon: Trophy },
                    { id: 'settings', label: 'Opsi', Icon: Settings },
                ].map((tab) => {
                    const Icon = tab.Icon;
                    const isActive = activeSection === tab.id;
                    return (
                        <TouchableOpacity
                            key={tab.id}
                            style={[styles.tabButton, isActive && styles.tabButtonActive]}
                            onPress={() => setActiveSection(tab.id as any)}
                        >
                            <Icon size={16} color={isActive ? '#FFFFFF' : '#94A3B8'} />
                            <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                                {tab.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* Active Section */}
            {renderSection()}

            {/* Footer */}
            <View style={styles.footer}>
                <Text style={styles.footerVersion}>CivFit v1.7.0 Cloud Sync</Text>
                <Text style={styles.footerMotto}>Build peradabanmu, bangun dirimu.</Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 100,
    },
    tabBar: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderRadius: 32,
        borderWidth: 2,
        borderColor: '#0F172A',
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 0,
        elevation: 6,
        marginBottom: 24,
        padding: 6,
    },
    tabButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 10,
        borderRadius: 24,
        backgroundColor: 'transparent',
    },
    tabButtonActive: {
        backgroundColor: '#1E293B',
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.2,
        elevation: 2,
    },
    tabLabel: {
        fontSize: 10,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 1,
        color: '#94A3B8',
    },
    tabLabelActive: {
        color: '#FFFFFF',
    },
    // Profile Section
    profileCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 40,
        padding: 24,
        borderWidth: 2,
        borderColor: '#E2E8F0',
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 0,
        elevation: 6,
        alignItems: 'center',
        marginBottom: 24,
    },
    avatarContainer: {
        width: 96,
        height: 96,
        borderRadius: 48,
        backgroundColor: '#F1F5F9',
        borderWidth: 2,
        borderColor: '#0F172A',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 0.1,
        elevation: 4,
    },
    avatar: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    userName: {
        fontSize: 24,
        fontWeight: '900',
        fontStyle: 'italic',
        textTransform: 'uppercase',
        color: '#1E293B',
        marginBottom: 4,
        textAlign: 'center',
    },
    userLevel: {
        fontSize: 10,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 2,
        color: '#94A3B8',
        marginBottom: 24,
    },
    statsRow: {
        flexDirection: 'row',
        gap: 16,
        width: '100%',
    },
    statBox: {
        flex: 1,
        backgroundColor: '#F8FAFC',
        borderWidth: 2,
        borderColor: '#0F172A',
        borderRadius: 24,
        padding: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.05,
        elevation: 2,
    },
    statNumber: {
        fontSize: 20,
        fontWeight: '900',
        fontFamily: 'monospace',
        color: '#1E293B',
    },
    statLabel: {
        fontSize: 8,
        fontWeight: '900',
        textTransform: 'uppercase',
        color: '#94A3B8',
        marginTop: 4,
    },
    badgeSection: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
        paddingHorizontal: 4,
    },
    sectionTitle: {
        fontSize: 10,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 2,
        color: '#94A3B8',
    },
    badgeGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 12,
    },
    badgeCard: {
        width: BADGE_SIZE,
        aspectRatio: 1,
        borderRadius: 32,
        borderWidth: 2,
        padding: 12,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    badgeUnlocked: {
        backgroundColor: '#FFFFFF',
        borderColor: '#1E293B',
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.1,
        elevation: 2,
    },
    badgeLocked: {
        backgroundColor: '#F1F5F9',
        borderColor: '#E2E8F0',
        borderStyle: 'dashed',
        opacity: 0.6,
    },
    badgeIconContainer: {
        padding: 8,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#0F172A',
        shadowColor: '#000',
        shadowOffset: { width: 1, height: 1 },
        shadowOpacity: 0.1,
        elevation: 1,
    },
    badgeIconUnlocked: {
        backgroundColor: '#FBBF24',
    },
    badgeIconLocked: {
        backgroundColor: '#E2E8F0',
    },
    badgeTitle: {
        fontSize: 8,
        fontWeight: '900',
        textTransform: 'uppercase',
        textAlign: 'center',
        color: '#1E293B',
    },
    // Logs Section
    logsCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 40,
        padding: 20,
        borderWidth: 2,
        borderColor: '#E2E8F0',
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 0.08,
        elevation: 6,
    },
    logsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 20,
    },
    logsTitle: {
        fontSize: 20,
        fontWeight: '900',
        fontStyle: 'italic',
        textTransform: 'uppercase',
        color: '#1E293B',
    },
    logsList: {
        maxHeight: 500,
    },
    logItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 16,
        padding: 16,
        borderRadius: 24,
        borderWidth: 2,
        borderColor: '#0F172A',
        backgroundColor: '#F8FAFC',
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.05,
        elevation: 2,
    },
    logIcon: {
        padding: 8,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#0F172A',
        shadowColor: '#000',
        shadowOffset: { width: 1, height: 1 },
        shadowOpacity: 0.1,
    },
    logIconPositive: {
        backgroundColor: '#14B8A6',
    },
    logIconNegative: {
        backgroundColor: '#EF4444',
    },
    logContent: {
        flex: 1,
    },
    logMessage: {
        fontSize: 12,
        fontWeight: '900',
        textTransform: 'uppercase',
        color: '#1E293B',
        marginBottom: 6,
    },
    logMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flexWrap: 'wrap',
    },
    logTime: {
        fontSize: 8,
        fontWeight: '900',
        color: '#94A3B8',
        textTransform: 'uppercase',
    },
    logChange: {
        fontSize: 8,
        fontWeight: '900',
        textTransform: 'uppercase',
    },
    logChangePositive: {
        color: '#14B8A6',
    },
    logChangeNegative: {
        color: '#EF4444',
    },
    emptyLogs: {
        alignItems: 'center',
        paddingVertical: 48,
    },
    emptyLogsText: {
        fontSize: 10,
        fontWeight: '900',
        color: '#CBD5E1',
        textTransform: 'uppercase',
    },
    // Settings Section
    settingsCard: {
        backgroundColor: '#1E293B',
        borderRadius: 40,
        padding: 24,
        borderWidth: 2,
        borderColor: '#334155',
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 0.15,
        elevation: 8,
        marginBottom: 24,
    },
    settingsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    settingsTitle: {
        fontSize: 20,
        fontWeight: '900',
        fontStyle: 'italic',
        textTransform: 'uppercase',
        color: '#14B8A6',
    },
    settingsOptions: {
        gap: 12,
    },
    settingItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.1)',
        padding: 16,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    settingText: {
        fontSize: 14,
        fontWeight: '900',
        textTransform: 'uppercase',
        color: '#FFFFFF',
    },
    settingValue: {
        fontSize: 10,
        fontWeight: '900',
        color: '#FBBF24',
    },
    toggle: {
        width: 40,
        height: 20,
        backgroundColor: '#EF4444',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#0F172A',
        justifyContent: 'center',
        paddingHorizontal: 2,
    },
    toggleKnob: {
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: '#FFFFFF',
        alignSelf: 'flex-end',
    },
    logoutButton: {
        backgroundColor: '#EF4444',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        paddingVertical: 20,
        borderRadius: 32,
        borderWidth: 2,
        borderColor: '#0F172A',
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 0.2,
        elevation: 6,
    },
    logoutText: {
        fontSize: 18,
        fontWeight: '900',
        fontStyle: 'italic',
        textTransform: 'uppercase',
        color: '#FFFFFF',
    },
    footer: {
        alignItems: 'center',
        paddingVertical: 20,
        marginTop: 16,
    },
    footerVersion: {
        fontSize: 10,
        fontWeight: '900',
        color: '#94A3B8',
        textTransform: 'uppercase',
        letterSpacing: 4,
        marginBottom: 6,
    },
    footerMotto: {
        fontSize: 8,
        fontWeight: '700',
        fontStyle: 'italic',
        color: '#CBD5E1',
        textTransform: 'uppercase',
    },
});