import { LeaderboardTab } from '@/features/leaderboard/leaderbord';
import { auth } from '@/services/firebase';
import { useCivStore } from '@/store';
import { useThemeStore } from '@/store/themeStore';
import { router } from 'expo-router';
import { signOut } from 'firebase/auth';
import {
    ArrowDownLeft,
    ArrowUpRight,
    Award,
    Bell,
    CheckCircle,
    ChevronRight,
    Clock,
    Globe,
    HelpCircle,
    History,
    LogOut,
    Moon,
    Settings,
    ShieldCheck,
    Sun,
    Trophy,
    User,
    X
} from 'lucide-react-native';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Image,
    Modal,
    Text as RNText,
    ScrollView,
    StyleSheet,
    Switch,
    TextProps,
    TouchableOpacity,
    View
} from 'react-native';
import { platformConfirm } from '../../platform/mobile/utils/interactions';

const { width } = Dimensions.get('window');
const BADGE_SIZE = (width - 64) / 3;

// FAQ data (translated)
const FAQ_DATA = [
    {
        question: 'What is CivFit?',
        answer: 'CivFit is a civilization simulation game that blends fitness with city-building. Your real-world activity generates resources for your city.',
    },
    {
        question: 'How do I earn Silver?',
        answer: 'Silver is earned from citizen taxes, completing daily missions, and from economic buildings like Markets or Banks.',
    },
    {
        question: 'Why is my population unhealthy?',
        answer: 'City health drops if healthcare is insufficient or pollution is high. Build a Hospital and keep the city clean.',
    },
    {
        question: 'How do I advance an era?',
        answer: 'Collect evolution points by increasing population, happiness, and productivity. When you meet the requirements, use the "Evolve" action in the City tab.',
    },
    {
        question: 'What do notifications do?',
        answer: 'Notifications remind you about important events, completed missions, or city crises. You can enable or disable them in Settings.',
    },
];

export function MenuTab() {
    const stats = useCivStore((state) => state.stats);
    const logs = useCivStore((state) => state.logs);
    const [activeSection, setActiveSection] = useState<'profile' | 'logs' | 'rank' | 'settings'>('profile');
    const user = auth.currentUser;
    const isDarkMode = useThemeStore((state) => state.isDarkMode);
    const setThemeMode = useThemeStore((state) => state.setThemeMode);

    // State untuk fitur settings
    const [selectedTimezone, setSelectedTimezone] = useState('WIB');
    const [notificationEnabled, setNotificationEnabled] = useState(true);
    const [faqModalVisible, setFaqModalVisible] = useState(false);
    const [timezoneModalVisible, setTimezoneModalVisible] = useState(false);

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

    const todayKey = new Date().toISOString().split('T')[0];

    const getLocalDateKey = (value: string) => {
        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return value.slice(0, 10);
        }

        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    };

    const todayLogs = logs.filter((log) => getLocalDateKey(log.timestamp) === todayKey);

    const Text = ({ style, ...rest }: TextProps) => (
        <RNText
            {...rest}
            style={style}
            allowFontScaling
            maxFontSizeMultiplier={1.2}
        />
    );

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
            tabLabel: { fontSize: 10, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1, color: '#94A3B8', textAlign: 'center', flexShrink: 1 },
            tabLabelActive: { color: '#FFF' },
            profileCard: { backgroundColor: surfaceColor, borderRadius: 40, padding: 24, borderWidth: 2, borderColor: borderColor, ...cardShadow, shadowOffset: { width: 4, height: 4 }, elevation: 6, alignItems: 'center', marginBottom: 24 },
            avatarContainer: { width: 96, height: 96, borderRadius: 48, backgroundColor: '#F1F5F9', borderWidth: 2, borderColor: '#0F172A', justifyContent: 'center', alignItems: 'center', marginBottom: 16, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 4, height: 4 }, shadowOpacity: 0.1, elevation: 4 },
            avatar: { width: '100%', height: '100%', resizeMode: 'cover' },
            userName: { fontSize: 24, fontWeight: '900', fontStyle: 'italic', textTransform: 'uppercase', color: textColor, marginBottom: 4, textAlign: 'center', flexShrink: 1 },
            userLevel: { fontSize: 10, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 2, color: subTextColor, marginBottom: 24, textAlign: 'center', flexShrink: 1 },
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
            badgeTitle: { fontSize: 8, fontWeight: '900', textTransform: 'uppercase', textAlign: 'center', color: textColor, flexShrink: 1 },
            logsCard: { backgroundColor: surfaceColor, borderRadius: 40, padding: 20, borderWidth: 2, borderColor: borderColor, ...cardShadow, shadowOffset: { width: 4, height: 4 }, elevation: 6 },
            logsHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
            logsTitle: { fontSize: 20, fontWeight: '900', fontStyle: 'italic', textTransform: 'uppercase', color: textColor },
            logsList: { maxHeight: 500 },
            logItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 16, padding: 16, borderRadius: 24, borderWidth: 2, borderColor: '#0F172A', backgroundColor: isDarkMode ? '#0F172A' : '#F8FAFC', marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.05, elevation: 2 },
            logIcon: { padding: 8, borderRadius: 16, borderWidth: 1, borderColor: '#0F172A', shadowColor: '#000', shadowOffset: { width: 1, height: 1 }, shadowOpacity: 0.1 },
            logIconPositive: { backgroundColor: '#14B8A6' },
            logIconNegative: { backgroundColor: '#EF4444' },
            logContent: { flex: 1 },
            logMessage: { fontSize: 12, fontWeight: '900', textTransform: 'uppercase', color: textColor, marginBottom: 6, flexShrink: 1 },
            logMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
            logTime: { fontSize: 8, fontWeight: '900', color: subTextColor, textTransform: 'uppercase', flexShrink: 1 },
            logChange: { fontSize: 8, fontWeight: '900', textTransform: 'uppercase' },
            logChangePositive: { color: '#14B8A6' },
            logChangeNegative: { color: '#EF4444' },
            emptyLogs: { alignItems: 'center', paddingVertical: 48 },
            emptyLogsText: { fontSize: 10, fontWeight: '900', color: subTextColor, textTransform: 'uppercase', textAlign: 'center', flexShrink: 1 },
            settingsCard: { backgroundColor: '#1E293B', borderRadius: 40, padding: 24, borderWidth: 2, borderColor: '#334155', shadowColor: '#000', shadowOffset: { width: 4, height: 4 }, shadowOpacity: 0.15, elevation: 8, marginBottom: 24 },
            settingsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
            settingsTitle: { fontSize: 20, fontWeight: '900', fontStyle: 'italic', textTransform: 'uppercase', color: '#14B8A6' },
            settingsOptions: { gap: 12 },
            settingItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', padding: 16, borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
            settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
            settingText: { fontSize: 14, fontWeight: '900', textTransform: 'uppercase', color: '#FFF', flexShrink: 1 },
            settingValue: { fontSize: 10, fontWeight: '900', color: '#FBBF24', flexShrink: 1 },
            logoutButton: { backgroundColor: '#EF4444', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, paddingVertical: 20, borderRadius: 32, borderWidth: 2, borderColor: '#0F172A', shadowColor: '#000', shadowOffset: { width: 4, height: 4 }, shadowOpacity: 0.2, elevation: 6 },
            logoutText: { fontSize: 18, fontWeight: '900', fontStyle: 'italic', textTransform: 'uppercase', color: '#FFF', flexShrink: 1 },
            footer: { alignItems: 'center', paddingVertical: 20, marginTop: 16 },
            footerVersion: { fontSize: 10, fontWeight: '900', color: subTextColor, textTransform: 'uppercase', letterSpacing: 4, marginBottom: 6, textAlign: 'center', flexShrink: 1 },
            footerMotto: { fontSize: 8, fontWeight: '700', fontStyle: 'italic', color: subTextColor, textTransform: 'uppercase', textAlign: 'center', flexShrink: 1 },
            modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
            modalContainer: { backgroundColor: surfaceColor, borderRadius: 40, padding: 24, width: '80%', borderWidth: 2, borderColor: borderColor },
            modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
            modalTitle: { fontSize: 18, fontWeight: '900', fontStyle: 'italic', textTransform: 'uppercase', color: textColor, flexShrink: 1 },
            modalOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: borderColor, gap: 12 },
            modalOptionText: { fontSize: 16, fontWeight: '700', color: textColor, flexShrink: 1 },
            faqItem: { marginBottom: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: borderColor },
            faqQuestion: { fontSize: 14, fontWeight: '900', color: textColor, marginBottom: 8, flexShrink: 1 },
            faqAnswer: { fontSize: 12, color: subTextColor, lineHeight: 18, flexShrink: 1 },
        });
    }, [isDarkMode]);

    const badgeGallery = [
        { title: 'Stone Pioneer', icon: 'Mountain', unlocked: stats.level >= 1 },
        { title: 'Iron Knight', icon: 'Shield', unlocked: stats.level >= 5 },
        { title: 'Steam Engineer', icon: 'Zap', unlocked: stats.level >= 15 },
        { title: 'Modern Citizen', icon: 'Smartphone', unlocked: stats.level >= 30 },
        { title: 'Digital Avatar', icon: 'Cpu', unlocked: stats.level >= 50 },
    ];

    const handleLogout = async () => {
        const confirm = await platformConfirm('Sign out of your CivFit account?');
        if (confirm) {
            await signOut(auth);
            router.replace('/(auth)/login');
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
                                    <Text style={stylesDynamic.statLabel}>Active Days</Text>
                                </View>
                                <View style={stylesDynamic.statBox}>
                                    <Text style={stylesDynamic.statNumber}>S{stats.level}</Text>
                                    <Text style={stylesDynamic.statLabel}>City Tier</Text>
                                </View>
                            </View>
                        </View>
                        <View style={stylesDynamic.badgeSection}>
                            <View style={stylesDynamic.sectionHeader}>
                                <Award size={16} color="#94A3B8" />
                                <Text style={stylesDynamic.sectionTitle}>Badge Gallery</Text>
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
                                <Text style={stylesDynamic.logsTitle}>Today Log</Text>
                            </View>
                            <ScrollView
                                style={stylesDynamic.logsList}
                                showsVerticalScrollIndicator={false}
                                nestedScrollEnabled
                            >
                                {todayLogs.length > 0 ? (
                                    todayLogs.map((log) => (
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
                                        <Text style={stylesDynamic.emptyLogsText}>No logs for today...</Text>
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
                                <Text style={stylesDynamic.settingsTitle}>Services</Text>
                                <ShieldCheck size={24} color="#14B8A6" />
                            </View>
                            <View style={stylesDynamic.settingsOptions}>
                                {/* Zona Waktu */}
                                <TouchableOpacity style={stylesDynamic.settingItem} onPress={() => setTimezoneModalVisible(true)}>
                                    <View style={stylesDynamic.settingLeft}>
                                        <Globe size={16} color="#14B8A6" />
                                        <Text style={stylesDynamic.settingText}>Timezone</Text>
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
                                        <Text style={stylesDynamic.settingText}>Notifications</Text>
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
                                        <Text style={stylesDynamic.settingText}>Dark Mode</Text>
                                    </View>
                                    <Switch
                                        value={isDarkMode}
                                        onValueChange={(value) => setThemeMode(value ? 'dark' : 'light')}
                                        trackColor={{ false: '#EF4444', true: '#14B8A6' }}
                                        thumbColor="#FFFFFF"
                                    />
                                </View>

                                {/* Bantuan & FAQ */}
                                <TouchableOpacity style={stylesDynamic.settingItem} onPress={() => setFaqModalVisible(true)}>
                                    <View style={stylesDynamic.settingLeft}>
                                        <HelpCircle size={16} color="#14B8A6" />
                                        <Text style={stylesDynamic.settingText}>Help & FAQ</Text>
                                    </View>
                                    <ChevronRight size={16} color="#FFFFFF" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <TouchableOpacity style={stylesDynamic.logoutButton} onPress={handleLogout}>
                            <LogOut size={20} color="#FFFFFF" />
                            <Text style={stylesDynamic.logoutText}>Sign Out</Text>
                        </TouchableOpacity>

                        {/* Modal Pilih Zona Waktu */}
                        <Modal visible={timezoneModalVisible} transparent animationType="slide">
                            <View style={stylesDynamic.modalOverlay}>
                                <View style={stylesDynamic.modalContainer}>
                                    <View style={stylesDynamic.modalHeader}>
                                        <Text style={stylesDynamic.modalTitle}>Select Timezone</Text>
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
                                        <Text style={stylesDynamic.modalTitle}>Help & FAQ</Text>
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
        <ScrollView
            style={dynamicStyles.container}
            showsVerticalScrollIndicator={false}
            scrollEnabled={activeSection !== 'logs'}
        >
            <View style={dynamicStyles.tabBar}>
                {[
                    { id: 'profile', label: 'Profile', Icon: User },
                    { id: 'logs', label: 'Logs', Icon: History },
                    { id: 'rank', label: 'Rankings', Icon: Trophy },
                    { id: 'settings', label: 'Options', Icon: Settings },
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
                <Text style={dynamicStyles.footerMotto}>Build your civilization, build yourself.</Text>
            </View>
        </ScrollView>
    );
}
