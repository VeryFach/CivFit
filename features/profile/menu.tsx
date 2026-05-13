import React, { useState, useEffect, useRef, useMemo } from 'react';
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
    Modal,
    Switch,
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
    X,
    HelpCircle,
    CheckCircle,
    Moon,
    Sun,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');
const BADGE_SIZE = (width - 64) / 3;

// Data FAQ (tidak berubah)
const FAQ_DATA = [
    {
        question: 'Apa itu CivFit?',
        answer: 'CivFit adalah game simulasi peradaban yang menggabungkan kebugaran dengan pembangunan kota. Setiap langkahmu di dunia nyata menghasilkan sumber daya untuk kotamu.',
    },
    {
        question: 'Bagaimana cara mendapatkan Silver?',
        answer: 'Silver diperoleh dari pajak warga, menyelesaikan misi harian, dan dari bangunan ekonomi seperti Market atau Bank.',
    },
    {
        question: 'Mengapa penduduk saya sakit?',
        answer: 'Kesehatan kota menurun jika fasilitas kesehatan tidak mencukupi atau polusi tinggi. Bangun Rumah Sakit dan jaga kebersihan.',
    },
    {
        question: 'Bagaimana cara naik era?',
        answer: 'Kumpulkan cukup poin evolusi dengan meningkatkan populasi, kebahagiaan, dan produktivitas. Setelah memenuhi syarat, klik tombol "Evolusi" di tab Kota.',
    },
    {
        question: 'Apa fungsi notifikasi?',
        answer: 'Notifikasi akan mengingatkan Anda tentang event penting, misi selesai, atau krisis kota. Anda bisa mengaktifkan/menonaktifkannya di menu Pengaturan.',
    },
];

export function MenuTab() {
    const stats = useCivStore((state) => state.stats);
    const logs = useCivStore((state) => state.logs);
    const [activeSection, setActiveSection] = useState<'profile' | 'logs' | 'rank' | 'settings'>('profile');
    const user = auth.currentUser;

    // State untuk fitur settings
    const [selectedTimezone, setSelectedTimezone] = useState('WIB');
    const [notificationEnabled, setNotificationEnabled] = useState(true);
    const [faqModalVisible, setFaqModalVisible] = useState(false);
    const [timezoneModalVisible, setTimezoneModalVisible] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false); // <-- state dark mode

    // Animations
    const fadeAnim = useRef(new Animated.Value(1)).current;
    const slideAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        fadeAnim.setValue(0);
        slideAnim.setValue(10);
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
            Animated.spring(slideAnim, { toValue: 0, friction: 8, tension: 40, useNativeDriver: true }),
        ]).start();
    }, [activeSection]);

    // Style dinamis berdasarkan mode
    const dynamicStyles = useMemo(() => {
        const darkBackground = '#0F172A';
        const lightBackground = '#F8FAFC';
        const darkSurface = '#1E293B';
        const lightSurface = '#FFFFFF';
        const darkText = '#F1F5F9';
        const lightText = '#1E293B';
        const darkBorder = '#334155';
        const lightBorder = '#E2E8F0';

        const bgColor = isDarkMode ? darkBackground : lightBackground;
        const surfaceColor = isDarkMode ? darkSurface : lightSurface;
        const textColor = isDarkMode ? darkText : lightText;
        const borderColor = isDarkMode ? darkBorder : lightBorder;
        const subTextColor = isDarkMode ? '#94A3B8' : '#64748B';
        const cardShadow = isDarkMode ? { shadowColor: '#000', shadowOpacity: 0.3 } : { shadowColor: '#000', shadowOpacity: 0.08 };

        return StyleSheet.create({
            container: { flex: 1, backgroundColor: bgColor, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 100 },
            tabBar: { flexDirection: 'row', backgroundColor: surfaceColor, borderRadius: 32, borderWidth: 2, borderColor: borderColor, shadowColor: '#000', shadowOffset: { width: 4, height: 4 }, shadowOpacity: 0.1, elevation: 6, marginBottom: 24, padding: 6 },
            tabButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 10, borderRadius: 24, backgroundColor: 'transparent' },
            tabButtonActive: { backgroundColor: '#1E293B', shadowColor: '#000', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.2, elevation: 2 },
            tabLabel: { fontSize: 10, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1, color: '#94A3B8' },
            tabLabelActive: { color: '#FFF' },
            profileCard: { backgroundColor: surfaceColor, borderRadius: 40, padding: 24, borderWidth: 2, borderColor: borderColor, ...cardShadow, shadowOffset: { width: 4, height: 4 }, elevation: 6, alignItems: 'center', marginBottom: 24 },
            avatarContainer: { width: 96, height: 96, borderRadius: 48, backgroundColor: '#F1F5F9', borderWidth: 2, borderColor: '#0F172A', justifyContent: 'center', alignItems: 'center', marginBottom: 16, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 4, height: 4 }, shadowOpacity: 0.1, elevation: 4 },
            avatar: { width: '100%', height: '100%', resizeMode: 'cover' },
            userName: { fontSize: 24, fontWeight: '900', fontStyle: 'italic', textTransform: 'uppercase', color: textColor, marginBottom: 4, textAlign: 'center' },
            userLevel: { fontSize: 10, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 2, color: subTextColor, marginBottom: 24 },
            statsRow: { flexDirection: 'row', gap: 16, width: '100%' },
            statBox: { flex: 1, backgroundColor: isDarkMode ? '#0F172A' : '#F8FAFC', borderWidth: 2, borderColor: '#0F172A', borderRadius: 24, padding: 16, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.05, elevation: 2 },
            statNumber: { fontSize: 20, fontWeight: '900', fontFamily: 'monospace', color: textColor },
            statLabel: { fontSize: 8, fontWeight: '900', textTransform: 'uppercase', color: subTextColor, marginTop: 4 },
            badgeSection: { marginBottom: 24 },
            sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16, paddingHorizontal: 4 },
            sectionTitle: { fontSize: 10, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 2, color: subTextColor },
            badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 },
            badgeCard: { width: BADGE_SIZE, aspectRatio: 1, borderRadius: 32, borderWidth: 2, padding: 12, alignItems: 'center', justifyContent: 'center', gap: 8 },
            badgeUnlocked: { backgroundColor: surfaceColor, borderColor: '#1E293B', ...cardShadow, shadowOffset: { width: 2, height: 2 }, elevation: 2 },
            badgeLocked: { backgroundColor: isDarkMode ? '#334155' : '#F1F5F9', borderColor: borderColor, borderStyle: 'dashed', opacity: 0.6 },
            badgeIconContainer: { padding: 8, borderRadius: 16, borderWidth: 1, borderColor: '#0F172A', shadowColor: '#000', shadowOffset: { width: 1, height: 1 }, shadowOpacity: 0.1, elevation: 1 },
            badgeIconUnlocked: { backgroundColor: '#FBBF24' },
            badgeIconLocked: { backgroundColor: '#E2E8F0' },
            badgeTitle: { fontSize: 8, fontWeight: '900', textTransform: 'uppercase', textAlign: 'center', color: textColor },
            logsCard: { backgroundColor: surfaceColor, borderRadius: 40, padding: 20, borderWidth: 2, borderColor: borderColor, ...cardShadow, shadowOffset: { width: 4, height: 4 }, elevation: 6 },
            logsHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
            logsTitle: { fontSize: 20, fontWeight: '900', fontStyle: 'italic', textTransform: 'uppercase', color: textColor },
            logsList: { maxHeight: 500 },
            logItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 16, padding: 16, borderRadius: 24, borderWidth: 2, borderColor: '#0F172A', backgroundColor: isDarkMode ? '#0F172A' : '#F8FAFC', marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.05, elevation: 2 },
            logIcon: { padding: 8, borderRadius: 16, borderWidth: 1, borderColor: '#0F172A', shadowColor: '#000', shadowOffset: { width: 1, height: 1 }, shadowOpacity: 0.1 },
            logIconPositive: { backgroundColor: '#14B8A6' },
            logIconNegative: { backgroundColor: '#EF4444' },
            logContent: { flex: 1 },
            logMessage: { fontSize: 12, fontWeight: '900', textTransform: 'uppercase', color: textColor, marginBottom: 6 },
            logMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
            logTime: { fontSize: 8, fontWeight: '900', color: subTextColor, textTransform: 'uppercase' },
            logChange: { fontSize: 8, fontWeight: '900', textTransform: 'uppercase' },
            logChangePositive: { color: '#14B8A6' },
            logChangeNegative: { color: '#EF4444' },
            emptyLogs: { alignItems: 'center', paddingVertical: 48 },
            emptyLogsText: { fontSize: 10, fontWeight: '900', color: subTextColor, textTransform: 'uppercase' },
            settingsCard: { backgroundColor: '#1E293B', borderRadius: 40, padding: 24, borderWidth: 2, borderColor: '#334155', shadowColor: '#000', shadowOffset: { width: 4, height: 4 }, shadowOpacity: 0.15, elevation: 8, marginBottom: 24 },
            settingsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
            settingsTitle: { fontSize: 20, fontWeight: '900', fontStyle: 'italic', textTransform: 'uppercase', color: '#14B8A6' },
            settingsOptions: { gap: 12 },
            settingItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', padding: 16, borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
            settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
            settingText: { fontSize: 14, fontWeight: '900', textTransform: 'uppercase', color: '#FFF' },
            settingValue: { fontSize: 10, fontWeight: '900', color: '#FBBF24' },
            logoutButton: { backgroundColor: '#EF4444', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, paddingVertical: 20, borderRadius: 32, borderWidth: 2, borderColor: '#0F172A', shadowColor: '#000', shadowOffset: { width: 4, height: 4 }, shadowOpacity: 0.2, elevation: 6 },
            logoutText: { fontSize: 18, fontWeight: '900', fontStyle: 'italic', textTransform: 'uppercase', color: '#FFF' },
            footer: { alignItems: 'center', paddingVertical: 20, marginTop: 16 },
            footerVersion: { fontSize: 10, fontWeight: '900', color: subTextColor, textTransform: 'uppercase', letterSpacing: 4, marginBottom: 6 },
            footerMotto: { fontSize: 8, fontWeight: '700', fontStyle: 'italic', color: subTextColor, textTransform: 'uppercase' },
            modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
            modalContainer: { backgroundColor: surfaceColor, borderRadius: 40, padding: 24, width: '80%', borderWidth: 2, borderColor: borderColor },
            modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
            modalTitle: { fontSize: 18, fontWeight: '900', fontStyle: 'italic', textTransform: 'uppercase', color: textColor },
            modalOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: borderColor },
            modalOptionText: { fontSize: 16, fontWeight: '700', color: textColor },
            faqItem: { marginBottom: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: borderColor },
            faqQuestion: { fontSize: 14, fontWeight: '900', color: textColor, marginBottom: 8 },
            faqAnswer: { fontSize: 12, color: subTextColor, lineHeight: 18 },
        });
    }, [isDarkMode]);

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

    const renderBadgeIcon = (iconName: string, unlocked: boolean) => {
        const iconColor = unlocked ? '#1E293B' : '#94A3B8';
        switch (iconName) {
            case 'Mountain': return <Globe size={24} color={iconColor} />;
            case 'Shield': return <ShieldCheck size={24} color={iconColor} />;
            case 'Zap': return <ChevronRight size={24} color={iconColor} />;
            case 'Smartphone': return <Bell size={24} color={iconColor} />;
            case 'Cpu': return <Settings size={24} color={iconColor} />;
            default: return <Globe size={24} color={iconColor} />;
        }
    };

    const renderSection = () => {
        const stylesDynamic = dynamicStyles;
        switch (activeSection) {
            case 'profile':
                return (
                    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                        <View style={stylesDynamic.profileCard}>
                            <View style={stylesDynamic.avatarContainer}>
                                {user?.photoURL ? (
                                    <Image source={{ uri: user.photoURL }} style={stylesDynamic.avatar} />
                                ) : (
                                    <User size={48} color="#1E293B" />
                                )}
                            </View>
                            <Text style={stylesDynamic.userName}>{user?.displayName || 'Citizen #9923'}</Text>
                            <Text style={stylesDynamic.userLevel}>Level {stats.level} Survivor</Text>
                            <View style={stylesDynamic.statsRow}>
                                <View style={stylesDynamic.statBox}>
                                    <Text style={stylesDynamic.statNumber}>{stats.dayCount}</Text>
                                    <Text style={stylesDynamic.statLabel}>Hari Aktif</Text>
                                </View>
                                <View style={stylesDynamic.statBox}>
                                    <Text style={stylesDynamic.statNumber}>S{stats.level}</Text>
                                    <Text style={stylesDynamic.statLabel}>Tier Kota</Text>
                                </View>
                            </View>
                        </View>
                        <View style={stylesDynamic.badgeSection}>
                            <View style={stylesDynamic.sectionHeader}>
                                <Award size={16} color="#94A3B8" />
                                <Text style={stylesDynamic.sectionTitle}>Galeri Lencana</Text>
                            </View>
                            <View style={stylesDynamic.badgeGrid}>
                                {badgeGallery.map((badge, idx) => (
                                    <View key={idx} style={[stylesDynamic.badgeCard, badge.unlocked ? stylesDynamic.badgeUnlocked : stylesDynamic.badgeLocked]}>
                                        <View style={[stylesDynamic.badgeIconContainer, badge.unlocked ? stylesDynamic.badgeIconUnlocked : stylesDynamic.badgeIconLocked]}>
                                            {renderBadgeIcon(badge.icon, badge.unlocked)}
                                        </View>
                                        <Text style={stylesDynamic.badgeTitle}>{badge.title}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    </Animated.View>
                );

            case 'logs':
                return (
                    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                        <View style={stylesDynamic.logsCard}>
                            <View style={stylesDynamic.logsHeader}>
                                <History size={24} color="#1E293B" />
                                <Text style={stylesDynamic.logsTitle}>Riwayat Aktivitas</Text>
                            </View>
                            <ScrollView style={stylesDynamic.logsList} showsVerticalScrollIndicator={false}>
                                {(logs?.length || 0) > 0 ? (
                                    logs.map((log) => (
                                        <View key={log.id} style={stylesDynamic.logItem}>
                                            <View style={[stylesDynamic.logIcon, log.change > 0 ? stylesDynamic.logIconPositive : stylesDynamic.logIconNegative]}>
                                                {log.change > 0 ? <ArrowUpRight size={16} color="#FFF" /> : <ArrowDownLeft size={16} color="#FFF" />}
                                            </View>
                                            <View style={stylesDynamic.logContent}>
                                                <Text style={stylesDynamic.logMessage}>{log.message}</Text>
                                                <View style={stylesDynamic.logMeta}>
                                                    <Clock size={10} color="#94A3B8" />
                                                    <Text style={stylesDynamic.logTime}>
                                                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </Text>
                                                    <Text style={[stylesDynamic.logChange, log.change > 0 ? stylesDynamic.logChangePositive : stylesDynamic.logChangeNegative]}>
                                                        {log.change > 0 ? '+' : ''}{log.change} {log.unit}
                                                    </Text>
                                                </View>
                                            </View>
                                        </View>
                                    ))
                                ) : (
                                    <View style={stylesDynamic.emptyLogs}>
                                        <Text style={stylesDynamic.emptyLogsText}>Belum ada catatan aktivitas...</Text>
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
                        <View style={stylesDynamic.settingsCard}>
                            <View style={stylesDynamic.settingsHeader}>
                                <Text style={stylesDynamic.settingsTitle}>Layanan Sektor</Text>
                                <ShieldCheck size={24} color="#14B8A6" />
                            </View>
                            <View style={stylesDynamic.settingsOptions}>
                                {/* Zona Waktu */}
                                <TouchableOpacity style={stylesDynamic.settingItem} onPress={() => setTimezoneModalVisible(true)}>
                                    <View style={stylesDynamic.settingLeft}>
                                        <Globe size={16} color="#14B8A6" />
                                        <Text style={stylesDynamic.settingText}>Zona Waktu</Text>
                                    </View>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                        <Text style={stylesDynamic.settingValue}>{selectedTimezone}</Text>
                                        <ChevronRight size={16} color="#FFFFFF" />
                                    </View>
                                </TouchableOpacity>

                                {/* Notifikasi dengan Switch */}
                                <View style={stylesDynamic.settingItem}>
                                    <View style={stylesDynamic.settingLeft}>
                                        <Bell size={16} color="#14B8A6" />
                                        <Text style={stylesDynamic.settingText}>Notifikasi</Text>
                                    </View>
                                    <Switch
                                        value={notificationEnabled}
                                        onValueChange={setNotificationEnabled}
                                        trackColor={{ false: '#EF4444', true: '#14B8A6' }}
                                        thumbColor="#FFFFFF"
                                    />
                                </View>

                                {/* Dark Mode Toggle */}
                                <View style={stylesDynamic.settingItem}>
                                    <View style={stylesDynamic.settingLeft}>
                                        {isDarkMode ? <Moon size={16} color="#14B8A6" /> : <Sun size={16} color="#14B8A6" />}
                                        <Text style={stylesDynamic.settingText}>Mode Gelap</Text>
                                    </View>
                                    <Switch
                                        value={isDarkMode}
                                        onValueChange={setIsDarkMode}
                                        trackColor={{ false: '#EF4444', true: '#14B8A6' }}
                                        thumbColor="#FFFFFF"
                                    />
                                </View>

                                {/* Bantuan & FAQ */}
                                <TouchableOpacity style={stylesDynamic.settingItem} onPress={() => setFaqModalVisible(true)}>
                                    <View style={stylesDynamic.settingLeft}>
                                        <HelpCircle size={16} color="#14B8A6" />
                                        <Text style={stylesDynamic.settingText}>Bantuan & FAQ</Text>
                                    </View>
                                    <ChevronRight size={16} color="#FFFFFF" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <TouchableOpacity style={stylesDynamic.logoutButton} onPress={handleLogout}>
                            <LogOut size={20} color="#FFFFFF" />
                            <Text style={stylesDynamic.logoutText}>Keluar Sesi</Text>
                        </TouchableOpacity>

                        {/* Modal Pilih Zona Waktu */}
                        <Modal visible={timezoneModalVisible} transparent animationType="slide">
                            <View style={stylesDynamic.modalOverlay}>
                                <View style={stylesDynamic.modalContainer}>
                                    <View style={stylesDynamic.modalHeader}>
                                        <Text style={stylesDynamic.modalTitle}>Pilih Zona Waktu</Text>
                                        <TouchableOpacity onPress={() => setTimezoneModalVisible(false)}>
                                            <X size={24} color="#1E293B" />
                                        </TouchableOpacity>
                                    </View>
                                    {['WIB', 'WITA', 'WIT'].map((tz) => (
                                        <TouchableOpacity
                                            key={tz}
                                            style={stylesDynamic.modalOption}
                                            onPress={() => {
                                                setSelectedTimezone(tz);
                                                setTimezoneModalVisible(false);
                                            }}
                                        >
                                            <Text style={stylesDynamic.modalOptionText}>{tz}</Text>
                                            {selectedTimezone === tz && <CheckCircle size={20} color="#14B8A6" />}
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        </Modal>

                        {/* Modal FAQ */}
                        <Modal visible={faqModalVisible} transparent animationType="slide">
                            <View style={stylesDynamic.modalOverlay}>
                                <View style={[stylesDynamic.modalContainer, { maxHeight: '80%' }]}>
                                    <View style={stylesDynamic.modalHeader}>
                                        <Text style={stylesDynamic.modalTitle}>Bantuan & FAQ</Text>
                                        <TouchableOpacity onPress={() => setFaqModalVisible(false)}>
                                            <X size={24} color={isDarkMode ? '#FFF' : '#1E293B'} />
                                        </TouchableOpacity>
                                    </View>
                                    <ScrollView showsVerticalScrollIndicator={false}>
                                        {FAQ_DATA.map((item, idx) => (
                                            <View key={idx} style={stylesDynamic.faqItem}>
                                                <Text style={stylesDynamic.faqQuestion}>❓ {item.question}</Text>
                                                <Text style={stylesDynamic.faqAnswer}>{item.answer}</Text>
                                            </View>
                                        ))}
                                    </ScrollView>
                                </View>
                            </View>
                        </Modal>
                    </Animated.View>
                );

            default:
                return null;
        }
    };

    return (
        <ScrollView style={dynamicStyles.container} showsVerticalScrollIndicator={false}>
            <View style={dynamicStyles.tabBar}>
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
                            style={[dynamicStyles.tabButton, isActive && dynamicStyles.tabButtonActive]}
                            onPress={() => setActiveSection(tab.id as any)}
                        >
                            <Icon size={16} color={isActive ? '#FFFFFF' : '#94A3B8'} />
                            <Text style={[dynamicStyles.tabLabel, isActive && dynamicStyles.tabLabelActive]}>
                                {tab.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
            {renderSection()}
            <View style={dynamicStyles.footer}>
                <Text style={dynamicStyles.footerVersion}>CivFit v1.7.0 Cloud Sync</Text>
                <Text style={dynamicStyles.footerMotto}>Build peradabanmu, bangun dirimu.</Text>
            </View>
        </ScrollView>
    );
}