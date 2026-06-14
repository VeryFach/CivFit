import GachaChestModal, { GachaReward } from '@/components/common/GachaChestModal';
import { RECOVERY_ITEMS } from '@/core/constants';
import { UserStats } from '@/core/types';
import { useColorScheme } from '@/hooks/use-color-scheme';
import Slider from '@react-native-community/slider';
import * as Icons from 'lucide-react-native';
import {
    AlertTriangle,
    ArrowRightLeft,
    CheckCircle,
    Coffee,
    Coins,
    Heart,
    Info,
    RefreshCw,
    ShieldCheck,
    Sparkles,
    X,
    Zap,
} from 'lucide-react-native';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface StoreTabProps {
    stats: UserStats;
    onPurchase: (type: 'hp' | 'silver' | 'gold' | 'skipTicket', amount: number, cost: number) => void;
    onGacha: () => Promise<GachaReward | void>;
}

type TransactionType = 'purchase' | 'exchange_gold' | 'exchange_silver' | 'gacha';

interface TransactionResult {
    type: TransactionType;
    success: boolean;
    title: string;
    subtitle: string;
    details: { label: string; value: string; color?: string }[];
    icon: 'check' | 'zap' | 'shield' | 'sparkles';
    accentColor: string;
    bgColor: string;
}

interface ConfirmConfig {
    title: string;
    subtitle: string;
    details: { label: string; value: string; color?: string }[];
    accentColor: string;
    bgColor: string;
    confirmLabel: string;
    cancelLabel?: string;
    hideCancel?: boolean;
    icon: 'zap' | 'shield' | 'sparkles' | 'warning' | 'coins' | 'heart';
    onConfirm: () => void;
}

// ─── Palette helper ─────────────────────────────────────────────────────────
function usePalette() {
    const scheme = useColorScheme();
    const isDark = scheme === 'dark';
    return {
        isDark,
        bg: isDark ? '#0F172A' : '#F8FAFC',
        card: isDark ? '#1E293B' : '#FFFFFF',
        cardAlt: isDark ? '#0F172A' : '#F1F5F9',
        panel: isDark ? '#111827' : '#F8FAFC',
        inputBg: isDark ? '#0F172A' : '#F1F5F9',
        border: isDark ? '#334155' : '#E2E8F0',
        borderMuted: isDark ? '#1E293B' : '#F1F5F9',
        borderActive: isDark ? '#FBBF24' : '#1E293B',
        text: isDark ? '#F8FAFC' : '#1E293B',
        textMuted: isDark ? '#94A3B8' : '#64748B',
        textFaint: isDark ? 'rgba(248,250,252,0.4)' : 'rgba(30,41,59,0.4)',
        recoveryBonus: isDark ? '#5EEAD4' : '#0D9488',
        maxBtnTextDark: isDark ? '#FDE047' : '#FBBF24',
        maxBtnTextLight: isDark ? '#5EEAD4' : '#14B8A6',
        resultFeeDark: isDark ? 'rgba(248,250,252,0.8)' : 'rgba(0,0,0,0.7)',
        exchangeDarkBg: isDark ? '#0F172A' : '#1E293B',
        exchangeDarkBorder: isDark ? '#1E293B' : '#334155',
        exchangeDarkText: '#FFFFFF',
        exchangeDarkMuted: isDark ? 'rgba(248,250,252,0.4)' : 'rgba(255,255,255,0.5)',
        gachaCardBg: isDark ? '#1E293B' : '#FFFFFF',
        gachaCardBorder: isDark ? '#334155' : '#E2E8F0',
        gachaGoldColor: isDark ? '#FBBF24' : '#D97706',
        gachaSilverColor: isDark ? '#14B8A6' : '#0F766E',
        gachaExpColor: isDark ? '#A855F7' : '#7E22CE',
        gachaHpColor: isDark ? '#EF4444' : '#DC2626',
        gachaInfoBg: isDark ? 'rgba(30,41,59,0.9)' : 'rgba(248,250,252,0.95)',
        gachaInfoBorder: isDark ? '#334155' : '#E2E8F0',
        gachaInfoTitleColor: isDark ? '#F8FAFC' : '#1E293B',
        gachaInfoLabelColor: isDark ? '#CBD5E1' : '#475569',
        gachaButtonActiveBg: isDark ? '#FBBF24' : '#D97706',
        gachaButtonDisabledBg: isDark ? '#334155' : '#CBD5E1',
        gachaButtonActiveText: isDark ? '#0F172A' : '#FFFFFF',
        gachaButtonDisabledText: isDark ? '#94A3B8' : '#64748B',
        gachaSubtitleColor: isDark ? '#94A3B8' : '#64748B',
        gachaFooterTextColor: isDark ? '#94A3B8' : '#64748B',
        avatarBg: isDark ? '#334155' : '#F1F5F9',
    };
}

// ─── Confirm Modal — Neobrutalist ─────────────────────────────────────────
function ConfirmModal({
    config,
    visible,
    onCancel,
    palette,
}: {
    config: ConfirmConfig | null;
    visible: boolean;
    onCancel: () => void;
    palette: ReturnType<typeof usePalette>;
}) {
    const insets = useSafeAreaInsets();
    const translateYAnim = useRef(new Animated.Value(120)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;
    const iconScaleAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            translateYAnim.setValue(120);
            opacityAnim.setValue(0);
            iconScaleAnim.setValue(0);

            Animated.parallel([
                Animated.timing(opacityAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
                Animated.spring(translateYAnim, { toValue: 0, tension: 100, friction: 9, useNativeDriver: true }),
            ]).start(() => {
                Animated.spring(iconScaleAnim, { toValue: 1, tension: 200, friction: 7, useNativeDriver: true }).start();
            });
        } else {
            Animated.parallel([
                Animated.timing(opacityAnim, { toValue: 0, duration: 160, useNativeDriver: true }),
                Animated.timing(translateYAnim, { toValue: 120, duration: 160, useNativeDriver: true }),
            ]).start(() => {
                translateYAnim.setValue(120);
                iconScaleAnim.setValue(0);
            });
        }
    }, [visible]);

    if (!config) return null;

    const IconMap: Record<string, any> = {
        zap: Zap,
        shield: ShieldCheck,
        sparkles: Sparkles,
        warning: AlertTriangle,
        coins: Coins,
        heart : Heart,
    };
    const IconComponent = IconMap[config.icon] ?? Zap;

    const detailBg = palette.isDark ? '#0F172A' : '#F1F5F9';
    const borderStrong = palette.isDark ? '#0F172A' : '#1E293B';

    return (
        <Modal transparent animationType="none" visible={visible} onRequestClose={onCancel}>
            {/* Overlay */}
            <Animated.View style={[confirmStyles.overlay, { opacity: opacityAnim, paddingBottom: insets.bottom }]}>
                {/* Tap-outside to cancel */}
                <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onCancel} />

                {/* Sheet */}
                <Animated.View
                    style={[
                        confirmStyles.sheet,
                        {
                            backgroundColor: palette.card,
                            borderColor: config.accentColor,
                            transform: [{ translateY: translateYAnim }],
                        },
                    ]}
                >
                    {/* ── Stripe header ── */}
                    <View style={[confirmStyles.stripeBar, { backgroundColor: config.accentColor }]}>
                        <Text style={confirmStyles.stripeLabel}>✦CONFIRM PURCHASE ✦</Text>
                    </View>

                    {/* ── Close X ── */}
                    <TouchableOpacity
                        style={[confirmStyles.closeX, { backgroundColor: palette.cardAlt, borderColor: palette.border }]}
                        onPress={onCancel}
                        activeOpacity={0.7}
                    >
                        <X size={16} color={palette.textMuted} />
                    </TouchableOpacity>

                    {/* ── Icon block ── */}
                    <Animated.View
                        style={[
                            confirmStyles.iconBlock,
                            {
                                backgroundColor: config.bgColor,
                                borderColor: config.accentColor,
                                transform: [{ scale: iconScaleAnim }],
                            },
                        ]}
                    >
                        <IconComponent
                            size={36}
                            color={config.accentColor}
                            fill={config.icon === 'sparkles' ? config.accentColor : 'none'}
                        />
                    </Animated.View>

                    {/* ── Title block ── */}
                    <Text style={[confirmStyles.title, { color: palette.text }]}>
                        {config.title}
                    </Text>
                    <Text style={[confirmStyles.subtitle, { color: palette.textMuted }]}>
                        {config.subtitle}
                    </Text>

                    {/* ── Detail preview card ── */}
                    {config.details.length > 0 && (
                        <View style={[
                            confirmStyles.detailCard,
                            { backgroundColor: detailBg, borderColor: config.accentColor },
                        ]}>
                            {config.details.map((d, i) => (
                                <View
                                    key={i}
                                    style={[
                                        confirmStyles.detailRow,
                                        i < config.details.length - 1 && {
                                            borderBottomWidth: 1,
                                            borderBottomColor: palette.border,
                                            paddingBottom: 10,
                                            marginBottom: 10,
                                        },
                                    ]}
                                >
                                    <Text style={[confirmStyles.detailLabel, { color: palette.textMuted }]}>
                                        {d.label}
                                    </Text>
                                    <Text style={[confirmStyles.detailValue, { color: d.color ?? palette.text }]}>
                                        {d.value}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    )}

                    {/* ── Action buttons ── */}
                    <View style={confirmStyles.buttonRow}>
                        {/* Cancel */}
                        <TouchableOpacity
                            style={[
                                confirmStyles.cancelButton,
                                { backgroundColor: palette.cardAlt, borderColor: palette.border },
                            ]}
                            onPress={onCancel}
                            activeOpacity={0.8}
                        >
                            <Text style={[confirmStyles.cancelButtonText, { color: palette.textMuted }]}>
                                {config.cancelLabel ?? 'CANCEL'}
                            </Text>
                        </TouchableOpacity>

                        {/* Confirm */}
                        <TouchableOpacity
                            style={[
                                confirmStyles.confirmButton,
                                { backgroundColor: config.accentColor, borderColor: borderStrong },
                            ]}
                            onPress={() => {
                                onCancel();          // tutup dulu
                                config.onConfirm();  // lalu eksekusi
                            }}
                            activeOpacity={0.82}
                        >
                            <Text style={[confirmStyles.confirmButtonText, { color: borderStrong }]}>
                                {config.confirmLabel}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </Animated.View>
        </Modal>
    );
}

const confirmStyles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.70)',
        justifyContent: 'flex-end',
    },
    sheet: {
        width: '100%',
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        borderWidth: 2,
        borderBottomWidth: 0,
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingBottom: 40,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -6 },
        shadowOpacity: 0.22,
        shadowRadius: 0,
        elevation: 20,
    },

    // ── Stripe ──
    stripeBar: {
        width: '100%',
        paddingVertical: 10,
        alignItems: 'center',
        marginBottom: 24,
    },
    stripeLabel: {
        fontSize: 9,
        fontWeight: '900',
        fontStyle: 'italic',
        letterSpacing: 2.5,
        color: '#1E293B',
        textTransform: 'uppercase',
    },

    // ── Close X ──
    closeX: {
        position: 'absolute',
        top: 52,
        right: 24,
        width: 36,
        height: 36,
        borderRadius: 12,
        borderWidth: 1.5,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // ── Icon ──
    iconBlock: {
        width: 76,
        height: 76,
        borderRadius: 24,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 0,
        elevation: 5,
    },

    // ── Typography ──
    title: {
        fontSize: 24,
        fontWeight: '900',
        fontStyle: 'italic',
        textTransform: 'uppercase',
        textAlign: 'center',
        letterSpacing: 0.3,
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 9,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 2,
        textAlign: 'center',
        marginBottom: 20,
    },

    // ── Detail card ──
    detailCard: {
        width: '100%',
        borderRadius: 24,
        borderWidth: 2,
        padding: 18,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 3, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 0,
        elevation: 3,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    detailLabel: {
        fontSize: 9,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 0.8,
    },
    detailValue: {
        fontSize: 14,
        fontWeight: '900',
        fontFamily: 'monospace',
    },

    // ── Buttons ──
    buttonRow: {
        width: '100%',
        flexDirection: 'row',
        gap: 12,
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 18,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        shadowColor: '#000',
        shadowOffset: { width: 3, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 0,
        elevation: 3,
    },
    cancelButtonText: {
        fontSize: 13,
        fontWeight: '900',
        fontStyle: 'italic',
        textTransform: 'uppercase',
        letterSpacing: 1.5,
    },
    confirmButton: {
        flex: 2,
        paddingVertical: 18,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        shadowColor: '#000',
        shadowOffset: { width: 3, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 0,
        elevation: 5,
    },
    confirmButtonText: {
        fontSize: 16,
        fontWeight: '900',
        fontStyle: 'italic',
        textTransform: 'uppercase',
        letterSpacing: 1.5,
    },
});

// ─── Transaction Popup — Neobrutalist ────────────────────────────────────
function TransactionPopup({
    result,
    visible,
    onClose,
    palette,
}: {
    result: TransactionResult | null;
    visible: boolean;
    onClose: () => void;
    palette: ReturnType<typeof usePalette>;
}) {
    const insets = useSafeAreaInsets();
    const translateYAnim = useRef(new Animated.Value(80)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;
    const iconScaleAnim = useRef(new Animated.Value(0)).current;
    const iconRotateAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            translateYAnim.setValue(80);
            opacityAnim.setValue(0);
            iconScaleAnim.setValue(0);
            iconRotateAnim.setValue(0);

            Animated.parallel([
                Animated.timing(opacityAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
                Animated.spring(translateYAnim, { toValue: 0, tension: 110, friction: 9, useNativeDriver: true }),
            ]).start(() => {
                Animated.parallel([
                    Animated.spring(iconScaleAnim, { toValue: 1, tension: 220, friction: 6, useNativeDriver: true }),
                    Animated.timing(iconRotateAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
                ]).start();
            });
        } else {
            translateYAnim.setValue(80);
            opacityAnim.setValue(0);
            iconScaleAnim.setValue(0);
            iconRotateAnim.setValue(0);
        }
    }, [visible]);

    if (!result) return null;

    const IconComponent =
        result.icon === 'sparkles' ? Sparkles :
            result.icon === 'zap' ? Zap :
                result.icon === 'shield' ? ShieldCheck :
                    CheckCircle;

    const iconRotate = iconRotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['-15deg', '0deg'],
    });

    const statusBgColor = result.success ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)';
    const statusTextColor = result.success ? '#22C55E' : '#EF4444';
    const statusBorderColor = result.success ? '#22C55E' : '#EF4444';
    const detailBg = palette.isDark ? '#0F172A' : '#F1F5F9';

    return (
        <Modal transparent animationType="none" visible={visible} onRequestClose={onClose}>
            <Animated.View style={[popupStyles.overlay, { opacity: opacityAnim, paddingBottom: insets.bottom }]}>
                <Animated.View
                    style={[
                        popupStyles.sheet,
                        {
                            backgroundColor: palette.card,
                            borderColor: result.accentColor,
                            transform: [{ translateY: translateYAnim }],
                        },
                    ]}
                >
                    <View style={[popupStyles.stripeBar, { backgroundColor: result.accentColor }]}>
                        <Text style={popupStyles.stripeLabel}>
                            {result.success ? '✦ TRANSACTION CONFIRMED ✦' : '✦ TRANSACTION FAILED ✦'}
                        </Text>
                    </View>

                    <Animated.View
                        style={[
                            popupStyles.iconBlock,
                            {
                                backgroundColor: result.bgColor,
                                borderColor: result.accentColor,
                                transform: [{ scale: iconScaleAnim }, { rotate: iconRotate }],
                            },
                        ]}
                    >
                        <IconComponent
                            size={40}
                            color={result.accentColor}
                            fill={result.icon === 'sparkles' ? result.accentColor : 'none'}
                        />
                    </Animated.View>

                    <Text style={[popupStyles.title, { color: palette.text }]}>{result.title}</Text>
                    <Text style={[popupStyles.subtitle, { color: palette.textMuted }]}>{result.subtitle}</Text>

                    <View style={[
                        popupStyles.statusBadge,
                        { backgroundColor: statusBgColor, borderColor: statusBorderColor },
                    ]}>
                        <Text style={[popupStyles.statusText, { color: statusTextColor }]}>
                            {result.success ? '● SUCCESS' : '● FAILED'}
                        </Text>
                    </View>

                    <View style={[popupStyles.detailCard, { backgroundColor: detailBg, borderColor: palette.border }]}>
                        {result.details.map((detail, i) => (
                            <View
                                key={i}
                                style={[
                                    popupStyles.detailRow,
                                    i < result.details.length - 1 && {
                                        borderBottomWidth: 1,
                                        borderBottomColor: palette.border,
                                        paddingBottom: 12,
                                        marginBottom: 12,
                                    },
                                ]}
                            >
                                <Text style={[popupStyles.detailLabel, { color: palette.textMuted }]}>
                                    {detail.label}
                                </Text>
                                <Text style={[popupStyles.detailValue, { color: detail.color ?? palette.text }]}>
                                    {detail.value}
                                </Text>
                            </View>
                        ))}
                    </View>

                    <TouchableOpacity
                        style={[
                            popupStyles.closeButton,
                            {
                                backgroundColor: result.accentColor,
                                borderColor: palette.isDark ? '#0F172A' : '#1E293B',
                            },
                        ]}
                        onPress={onClose}
                        activeOpacity={0.82}
                    >
                        <Text style={[popupStyles.closeButtonText, { color: palette.isDark ? '#0F172A' : '#1E293B' }]}>
                            CLOSE
                        </Text>
                    </TouchableOpacity>
                </Animated.View>
            </Animated.View>
        </Modal>
    );
}

const popupStyles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.72)',
        justifyContent: 'flex-end',
    },
    sheet: {
        width: '100%',
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        borderWidth: 2,
        borderBottomWidth: 0,
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingBottom: 36,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -6 },
        shadowOpacity: 0.25,
        shadowRadius: 0,
        elevation: 20,
    },
    stripeBar: {
        width: '100%',
        paddingVertical: 10,
        alignItems: 'center',
        marginBottom: 28,
    },
    stripeLabel: {
        fontSize: 9,
        fontWeight: '900',
        fontStyle: 'italic',
        letterSpacing: 2.5,
        color: '#1E293B',
        textTransform: 'uppercase',
    },
    iconBlock: {
        width: 88,
        height: 88,
        borderRadius: 28,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 0.18,
        shadowRadius: 0,
        elevation: 6,
    },
    title: {
        fontSize: 26,
        fontWeight: '900',
        fontStyle: 'italic',
        textTransform: 'uppercase',
        textAlign: 'center',
        letterSpacing: 0.5,
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 9,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 2,
        textAlign: 'center',
        marginBottom: 16,
    },
    statusBadge: {
        paddingHorizontal: 20,
        paddingVertical: 7,
        borderRadius: 8,
        borderWidth: 1.5,
        marginBottom: 24,
    },
    statusText: {
        fontSize: 9,
        fontWeight: '900',
        letterSpacing: 2,
        textTransform: 'uppercase',
    },
    detailCard: {
        width: '100%',
        borderRadius: 24,
        borderWidth: 2,
        padding: 20,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 3, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 0,
        elevation: 4,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    detailLabel: {
        fontSize: 9,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 0.8,
    },
    detailValue: {
        fontSize: 15,
        fontWeight: '900',
        fontFamily: 'monospace',
    },
    closeButton: {
        width: '100%',
        paddingVertical: 20,
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        shadowColor: '#000',
        shadowOffset: { width: 3, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 0,
        elevation: 4,
    },
    closeButtonText: {
        fontSize: 18,
        fontWeight: '900',
        fontStyle: 'italic',
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
});

// ─── Main StoreTab ─────────────────────────────────────────────────────────
export default function StoreTab({ stats, onPurchase, onGacha }: StoreTabProps) {
    const palette = usePalette();

    const [showChest, setShowChest] = useState(false);
    const [gachaReward, setGachaReward] = useState<GachaReward | null>(null);
    const [isOpeningChest, setIsOpeningChest] = useState(false);

    const [silverToGoldInput, setSilverToGoldInput] = useState(10);
    const [goldToSilverInput, setGoldToSilverInput] = useState(10);
    const [showGachaInfo, setShowGachaInfo] = useState(false);
    const [gachaInfoAnim] = useState(new Animated.Value(0));

    // Result popup (setelah transaksi)
    const [popupVisible, setPopupVisible] = useState(false);
    const [popupResult, setPopupResult] = useState<TransactionResult | null>(null);

    // Confirm modal (sebelum transaksi)
    const [confirmVisible, setConfirmVisible] = useState(false);
    const [confirmConfig, setConfirmConfig] = useState<ConfirmConfig | null>(null);

    const silverPerGoldRate = useMemo(() => Math.round(12 + Math.sin(stats.dayCount) * 2), [stats.dayCount]);
    const goldToSilverRate = useMemo(() => Math.round(8 + Math.cos(stats.dayCount) * 1.5), [stats.dayCount]);
    const networkFee = 0.05;

    const silverToGoldResult = useMemo(() => {
        const amount = Math.floor(silverToGoldInput / silverPerGoldRate);
        const fee = Math.ceil(amount * networkFee);
        return Math.max(0, amount - fee);
    }, [silverToGoldInput, silverPerGoldRate]);

    const goldToSilverResult = useMemo(() => {
        const rawResult = goldToSilverInput * goldToSilverRate;
        const fee = Math.ceil(rawResult * networkFee);
        return Math.max(0, rawResult - fee);
    }, [goldToSilverInput, goldToSilverRate]);

    const handleSetMaxSilver = () =>
        setSilverToGoldInput(Math.max(10, Math.min(Math.floor(stats.silver / 10) * 10, 2000)));
    const handleSetMaxGold = () =>
        setGoldToSilverInput(Math.max(10, Math.min(Math.floor(stats.gold / 10) * 10, 500)));

    const toggleGachaInfo = () => {
        if (showGachaInfo) {
            Animated.timing(gachaInfoAnim, { toValue: 0, duration: 200, useNativeDriver: false })
                .start(() => setShowGachaInfo(false));
        } else {
            setShowGachaInfo(true);
            Animated.timing(gachaInfoAnim, { toValue: 1, duration: 200, useNativeDriver: false }).start();
        }
    };

    const gachaInfoHeight = gachaInfoAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 200] });

    const openConfirm = (cfg: ConfirmConfig) => { setConfirmConfig(cfg); setConfirmVisible(true); };
    const closeConfirm = () => setConfirmVisible(false);
    const showPopup = (result: TransactionResult) => { setPopupResult(result); setPopupVisible(true); };

    // ── Handlers ──────────────────────────────────────────────────────────

    const handleRecoveryPurchase = (item: typeof RECOVERY_ITEMS[number]) => {
        const isTicket = item.id === 'skipTicket';
        if (!isTicket && stats.hp >= stats.maxHp) {
            openConfirm({
                title: 'HP Already Full',
                subtitle: 'No recovery needed right now',
                icon: 'heart',
                accentColor: '#EF4444',
                bgColor: 'rgba(239,68,68,0.12)',
                confirmLabel: 'GOT',
                hideCancel: true,
                details: [
                    { label: 'Current HP', value: `${stats.hp} HP`, color: '#EF4444' },
                    { label: 'Max HP', value: `${stats.maxHp} HP`, color: '#EF4444' },
                    { label: 'Status', value: 'FULL', color: '#22C55E' },
                ],
                onConfirm: () => { },   // tidak ada aksi, hanya dismiss
            });
            return;
        }
        openConfirm({
            title: isTicket ? 'Skip Ticket' : item.name,
            subtitle: isTicket ? 'Activate streak protection' : `Restore ${item.hpRestore} HP instantly`,
            icon: isTicket ? 'shield' : 'coins',
            accentColor: isTicket ? '#14B8A6' : '#22C55E',
            bgColor: isTicket ? 'rgba(20,184,166,0.12)' : 'rgba(34,197,94,0.12)',
            confirmLabel: 'CONFIRM PURCHASE',
            details: [
                { label: 'Item', value: item.name },
                {
                    label: isTicket ? 'Effect' : 'HP Restored',
                    value: isTicket ? 'PROTECTION' : `+${item.hpRestore} HP`,
                    color: isTicket ? '#14B8A6' : '#22C55E'
                },
                { label: 'Gold Cost', value: `-${item.costGold} G`, color: '#EF4444' },
                { label: 'Balance After', value: `${stats.gold - item.costGold} G`, color: '#FBBF24' },
            ],
            onConfirm: () => {
                if (isTicket) {
                    onPurchase('skipTicket', 1, item.costGold);
                    showPopup({
                        type: 'purchase', success: true,
                        title: 'Skip Ticket', subtitle: 'Protection Active',
                        icon: 'shield', accentColor: '#14B8A6', bgColor: 'rgba(20,184,166,0.12)',
                        details: [
                            { label: 'Item', value: item.name },
                            { label: 'Effect', value: 'PROTECTION', color: '#14B8A6' },
                            { label: 'Gold Spent', value: `-${item.costGold} G`, color: '#EF4444' },
                        ],
                    });
                } else {
                    onPurchase('hp', item.hpRestore, item.costGold);
                    showPopup({
                        type: 'purchase', success: true,
                        title: item.name, subtitle: 'Recovery Successful',
                        icon: 'check', accentColor: '#22C55E', bgColor: 'rgba(34,197,94,0.12)',
                        details: [
                            { label: 'Item', value: item.name },
                            { label: 'HP Restored', value: `+${item.hpRestore} HP`, color: '#22C55E' },
                            { label: 'Gold Spent', value: `-${item.costGold} G`, color: '#EF4444' },
                        ],
                    });
                }
            },
        });
    };

    const handleSilverToGold = () => {
        const fee = Math.ceil((silverToGoldInput / silverPerGoldRate) * networkFee);
        openConfirm({
            title: 'Liquid Asset',
            subtitle: 'Convert Silver into Gold',
            icon: 'zap',
            accentColor: '#FBBF24',
            bgColor: 'rgba(251,191,36,0.12)',
            confirmLabel: 'CONVERT',
            details: [
                { label: 'Silver Spent', value: `-${silverToGoldInput} S`, color: '#EF4444' },
                { label: 'Gold Received', value: `+${silverToGoldResult} G`, color: '#FBBF24' },
                { label: 'Network Fee (5%)', value: `-${fee} G`, color: '#ffffff' },
                { label: 'Rate', value: `${silverPerGoldRate}S : 1G` },
            ],
            onConfirm: () => {
                onPurchase('gold', silverToGoldResult, silverToGoldInput);
                showPopup({
                    type: 'exchange_gold', success: true,
                    title: 'Conversion Complete', subtitle: 'Silver → Gold',
                    icon: 'zap', accentColor: '#FBBF24', bgColor: 'rgba(251,191,36,0.12)',
                    details: [
                        { label: 'Silver Spent', value: `-${silverToGoldInput} S`, color: '#EF4444' },
                        { label: 'Gold Received', value: `+${silverToGoldResult} G`, color: '#FBBF24' },
                        { label: 'Network Fee (5%)', value: `-${fee} G`, color: '#ffffff' },
                        { label: 'Rate', value: `${silverPerGoldRate}S : 1G` },
                    ],
                });
            },
        });
    };

    const handleGoldToSilver = () => {
        const fee = Math.ceil(goldToSilverInput * goldToSilverRate * networkFee);
        openConfirm({
            title: 'Treasury Exchange',
            subtitle: 'Liquidate Gold into Silver',
            icon: 'zap',
            accentColor: '#14B8A6',
            bgColor: 'rgba(20,184,166,0.12)',
            confirmLabel: 'LIQUIDATE',
            details: [
                { label: 'Gold Spent', value: `-${goldToSilverInput} G`, color: '#EF4444' },
                { label: 'Silver Received', value: `+${goldToSilverResult} S`, color: '#14B8A6' },
                { label: 'Stability Fee (5%)', value: `-${fee} S`, color: '#94A3B8' },
                { label: 'Rate', value: `1G : ${goldToSilverRate}S` },
            ],
            onConfirm: () => {
                onPurchase('silver', goldToSilverResult, goldToSilverInput);
                showPopup({
                    type: 'exchange_silver', success: true,
                    title: 'Liquidation Complete', subtitle: 'Gold → Silver',
                    icon: 'zap', accentColor: '#14B8A6', bgColor: 'rgba(20,184,166,0.12)',
                    details: [
                        { label: 'Gold Spent', value: `-${goldToSilverInput} G`, color: '#EF4444' },
                        { label: 'Silver Received', value: `+${goldToSilverResult} S`, color: '#14B8A6' },
                        { label: 'Stability Fee (5%)', value: `-${fee} S`, color: '#94A3B8' },
                        { label: 'Rate', value: `1G : ${goldToSilverRate}S` },
                    ],
                });
            },
        });
    };

    const handleGacha = () => {
        if (stats.gold < 100) return;
        openConfirm({
            title: 'Invoke the Shrine',
            subtitle: 'Fate awaits your sacrifice',
            icon: 'sparkles',
            accentColor: '#FBBF24',
            bgColor: 'rgba(251,191,36,0.12)',
            confirmLabel: 'INVOKE',
            details: [
                { label: 'Cost', value: '-100 G', color: '#EF4444' },
                { label: 'Reward', value: 'RANDOM', color: '#FBBF24' },
                { label: 'Balance After', value: `${stats.gold - 100} G` },
                { label: 'Drop Rates', value: '5% – 40%', color: '#ffffff' },
            ],
            onConfirm: async () => {
                setShowChest(true);
                setIsOpeningChest(true);

                const rewardFromParent = await onGacha();

                if (!rewardFromParent) {
                    setIsOpeningChest(false);
                    setShowChest(false);
                    return;
                }

                setTimeout(() => {
                    setGachaReward(rewardFromParent);
                    setIsOpeningChest(false);
                }, 1500);
            },
        });
    };

    // ── Derived style vars ─────────────────────────────────────────────────
    const sectionTitleColor = palette.textMuted;
    const recoveryCardBg = palette.card;
    const recoveryCardBorder = palette.border;
    const recoveryNameColor = palette.text;
    const sliderLabelDark = palette.exchangeDarkMuted;
    const sliderLabelLight = palette.textMuted;
    const resultLabelDark = palette.exchangeDarkMuted;
    const resultLabelLight = palette.textMuted;
    const presetBtnDarkBg = palette.isDark ? 'rgba(248,250,252,0.07)' : 'rgba(255,255,255,0.08)';
    const presetBtnDarkText = palette.exchangeDarkText;
    const presetBtnLightBg = palette.isDark ? '#1E293B' : '#F1F5F9';
    const presetBtnLightText = palette.textMuted;
    const sliderValueDarkColor = palette.exchangeDarkText;
    const sliderValueDarkUnit = palette.exchangeDarkMuted;
    const resultCardDarkBg = palette.isDark ? 'rgba(248,250,252,0.05)' : 'rgba(255,255,255,0.08)';

    return (
        <>
            <ConfirmModal
                config={confirmConfig}
                visible={confirmVisible}
                onCancel={closeConfirm}
                palette={palette}
            />
            <TransactionPopup
                result={popupResult}
                visible={popupVisible}
                onClose={() => setPopupVisible(false)}
                palette={palette}
            />
            <GachaChestModal
                visible={showChest}
                onClose={() => { setShowChest(false); setGachaReward(null); }}
                reward={gachaReward}
                isOpening={isOpeningChest}
            />

            <ScrollView
                style={[styles.container, { backgroundColor: palette.bg }]}
                showsVerticalScrollIndicator={false}
            >
                {/* ── Recovery Section ── */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Coffee size={16} color={sectionTitleColor} />
                        <Text style={[styles.sectionTitle, { color: sectionTitleColor }]}>Survival Supplies</Text>
                    </View>
                    <View style={styles.recoveryGrid}>
                        {RECOVERY_ITEMS.map((item) => {
                            const Icon = (Icons as any)[item.icon] || Coffee;
                            const canAfford = stats.gold >= item.costGold;
                            return (
                                <TouchableOpacity
                                    key={item.id}
                                    disabled={!canAfford}
                                    style={[
                                        styles.recoveryCard,
                                        { backgroundColor: recoveryCardBg, borderColor: recoveryCardBorder },
                                        canAfford ? { borderColor: palette.borderActive } : styles.recoveryCardDisabled,
                                    ]}
                                    onPress={() => handleRecoveryPurchase(item)}
                                    activeOpacity={0.8}
                                >
                                    <View style={[styles.recoveryIcon, { backgroundColor: palette.cardAlt, borderColor: palette.border }]}>
                                        <Icon size={28} color={palette.text} />
                                    </View>
                                    <View style={styles.recoveryInfo}>
                                        <Text style={[styles.recoveryName, { color: recoveryNameColor }]}>{item.name}</Text>
                                        <Text style={[styles.recoveryBonus, { color: palette.recoveryBonus }]}>
                                            {item.id === 'skipTicket' ? 'PROTECTION' : `+${item.hpRestore} HP`}
                                        </Text>
                                        <Text style={[styles.recoveryDesc, { color: palette.textMuted }]}>{item.description}</Text>
                                    </View>
                                    <View style={[styles.recoveryCost, { borderColor: palette.border }]}>
                                        <Coins size={14} color="#1E293B" />
                                        <Text style={styles.recoveryCostText}>{item.costGold}</Text>
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                {/* ── Exchange Section ── */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <ArrowRightLeft size={16} color={sectionTitleColor} />
                        <Text style={[styles.sectionTitle, { color: sectionTitleColor }]}>Resource Conversion</Text>
                    </View>

                    {/* Silver → Gold */}
                    <View style={[styles.exchangeCardDark, { backgroundColor: palette.exchangeDarkBg, borderColor: palette.exchangeDarkBorder }]}>
                        <View style={styles.exchangeHeader}>
                            <View>
                                <Text style={styles.exchangeTitle}>Liquid Asset</Text>
                                <Text style={[styles.exchangeSubtitle, { color: palette.exchangeDarkMuted }]}>City Silver → Habit Gold</Text>
                            </View>
                            <View style={styles.rateBadge}>
                                <Text style={[styles.rateLabel, { color: palette.exchangeDarkMuted }]}>Market Rate</Text>
                                <View style={styles.rateValue}>
                                    <Text style={styles.rateText}>{silverPerGoldRate}S : 1G</Text>
                                </View>
                            </View>
                        </View>
                        <View style={styles.sliderContainer}>
                            <View style={styles.sliderControls}>
                                <Text style={[styles.sliderLabel, { color: sliderLabelDark }]}>Conversion Amount</Text>
                                <View style={styles.presetButtons}>
                                    {[100, 500, 1000].map(val => (
                                        <TouchableOpacity key={val} style={[styles.presetBtn, { backgroundColor: presetBtnDarkBg }]} onPress={() => setSilverToGoldInput(val)}>
                                            <Text style={[styles.presetBtnText, { color: presetBtnDarkText }]}>{val}</Text>
                                        </TouchableOpacity>
                                    ))}
                                    <TouchableOpacity style={styles.maxBtn} onPress={handleSetMaxSilver}>
                                        <Text style={[styles.maxBtnText, { color: palette.maxBtnTextDark }]}>MAX</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <Slider
                                style={styles.slider}
                                minimumValue={10}
                                maximumValue={Math.max(stats.silver, 2000)}
                                step={10}
                                value={silverToGoldInput}
                                onValueChange={setSilverToGoldInput}
                                minimumTrackTintColor="#FBBF24"
                                maximumTrackTintColor="#334155"
                                thumbTintColor="#FBBF24"
                            />
                            <View style={styles.sliderValue}>
                                <Text style={[styles.sliderValueNumber, { color: sliderValueDarkColor }]}>{silverToGoldInput}</Text>
                                <Text style={[styles.sliderValueUnit, { color: sliderValueDarkUnit }]}>S</Text>
                            </View>
                        </View>
                        <View style={[styles.resultCard, { backgroundColor: resultCardDarkBg }]}>
                            <View style={styles.resultLeft}>
                                <View style={styles.resultIconYellow}>
                                    <RefreshCw size={16} color="#FBBF24" />
                                </View>
                                <View>
                                    <Text style={[styles.resultLabel, { color: resultLabelDark }]}>Est. Gold Received</Text>
                                    <Text style={styles.resultValueYellow}>{silverToGoldResult} G</Text>
                                </View>
                            </View>
                            <View style={styles.resultRight}>
                                <Text style={[styles.resultFeeLabel, { color: resultLabelDark }]}>Net Fee (5%)</Text>
                                <Text style={[styles.resultFeeValue, { color: palette.resultFeeDark }]}>
                                    -{Math.ceil(silverToGoldInput / silverPerGoldRate * networkFee)} G
                                </Text>
                            </View>
                        </View>
                        <TouchableOpacity
                            style={[styles.confirmButton, (stats.silver < silverToGoldInput || silverToGoldResult <= 0) && styles.confirmButtonDisabled]}
                            disabled={stats.silver < silverToGoldInput || silverToGoldResult <= 0}
                            onPress={handleSilverToGold}
                        >
                            <Text style={styles.confirmButtonText}>Confirm Conversion</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Gold → Silver */}
                    <View style={[styles.exchangeCardLight, { backgroundColor: palette.card, borderColor: palette.border }]}>
                        <View style={styles.exchangeHeader}>
                            <View>
                                <Text style={[styles.exchangeTitleLight, { color: '#14B8A6' }]}>Treasury Exchange</Text>
                                <Text style={[styles.exchangeSubtitleLight, { color: palette.textMuted }]}>Habit Gold → City Silver</Text>
                            </View>
                            <View style={styles.rateBadge}>
                                <Text style={[styles.rateLabel, { color: palette.textMuted }]}>Market Rate</Text>
                                <View style={[styles.rateValueLight, { backgroundColor: palette.cardAlt }]}>
                                    <Text style={styles.rateTextLight}>1G : {goldToSilverRate}S</Text>
                                </View>
                            </View>
                        </View>
                        <View style={styles.sliderContainer}>
                            <View style={styles.sliderControls}>
                                <Text style={[styles.sliderLabel, { color: sliderLabelLight }]}>Collateral Amount</Text>
                                <View style={styles.presetButtons}>
                                    {[10, 50, 100].map(val => (
                                        <TouchableOpacity key={val} style={[styles.presetBtn, { backgroundColor: presetBtnLightBg }]} onPress={() => setGoldToSilverInput(val)}>
                                            <Text style={[styles.presetBtnText, { color: presetBtnLightText }]}>{val}</Text>
                                        </TouchableOpacity>
                                    ))}
                                    <TouchableOpacity style={styles.maxBtnLight} onPress={handleSetMaxGold}>
                                        <Text style={[styles.maxBtnTextLight, { color: palette.maxBtnTextLight }]}>MAX</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <Slider
                                style={styles.slider}
                                minimumValue={5}
                                maximumValue={Math.max(stats.gold, 500)}
                                step={5}
                                value={goldToSilverInput}
                                onValueChange={setGoldToSilverInput}
                                minimumTrackTintColor="#14B8A6"
                                maximumTrackTintColor={palette.isDark ? '#334155' : '#E2E8F0'}
                                thumbTintColor="#14B8A6"
                            />
                            <View style={styles.sliderValue}>
                                <Text style={[styles.sliderValueNumber, { color: palette.text }]}>{goldToSilverInput}</Text>
                                <Text style={[styles.sliderValueUnit, { color: palette.textMuted }]}>G</Text>
                            </View>
                        </View>
                        <View style={[styles.resultCard, { backgroundColor: palette.cardAlt, borderWidth: 1, borderColor: palette.border }]}>
                            <View style={styles.resultLeft}>
                                <View style={styles.resultIconTeal}>
                                    <RefreshCw size={16} color="#14B8A6" />
                                </View>
                                <View>
                                    <Text style={[styles.resultLabel, { color: resultLabelLight }]}>Est. Silver Liquidity</Text>
                                    <Text style={styles.resultValueTeal}>{goldToSilverResult} S</Text>
                                </View>
                            </View>
                            <View style={styles.resultRight}>
                                <Text style={[styles.resultFeeLabel, { color: resultLabelLight }]}>Stability Fee (5%)</Text>
                                <Text style={[styles.resultFeeValue, { color: palette.textMuted }]}>
                                    -{Math.ceil(goldToSilverInput * goldToSilverRate * networkFee)} S
                                </Text>
                            </View>
                        </View>
                        <TouchableOpacity
                            style={[styles.confirmButtonTeal, (stats.gold < goldToSilverInput || goldToSilverResult <= 0) && styles.confirmButtonDisabled]}
                            disabled={stats.gold < goldToSilverInput || goldToSilverResult <= 0}
                            onPress={handleGoldToSilver}
                        >
                            <Text style={styles.confirmButtonTextTeal}>Liquidate to Silver</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* ── Gacha Section ── */}
                <View style={[styles.gachaCard, { backgroundColor: palette.gachaCardBg, borderColor: palette.gachaCardBorder }]}>
                    <View style={styles.gachaHeader}>
                        <View style={styles.gachaTitleContainer}>
                            <Sparkles size={28} color={palette.gachaGoldColor} fill={palette.gachaGoldColor} />
                            <Text style={[styles.gachaTitle, { color: palette.text }]}>Shrine of Fate</Text>
                        </View>
                        <TouchableOpacity
                            style={[styles.infoButton, { backgroundColor: palette.isDark ? 'rgba(251,191,36,0.15)' : 'rgba(245,158,11,0.1)' }]}
                            onPress={toggleGachaInfo}
                        >
                            <Info size={20} color={palette.gachaGoldColor} />
                        </TouchableOpacity>
                    </View>
                    <Text style={[styles.gachaSubtitle, { color: palette.gachaSubtitleColor }]}>
                        Sacrifice Gold for Civilization Blessing
                    </Text>
                    {showGachaInfo && (
                        <Animated.View style={[styles.gachaInfoPanel, {
                            backgroundColor: palette.gachaInfoBg,
                            borderColor: palette.gachaInfoBorder,
                            height: gachaInfoHeight,
                        }]}>
                            <Text style={[styles.gachaInfoTitle, { color: palette.gachaInfoTitleColor }]}>
                                Divine Drop Rates
                            </Text>
                            {[
                                { label: 'Ultimate Jackpot (Gold)', value: '5%', color: palette.gachaGoldColor },
                                { label: 'Treasury Overflow (Silver)', value: '25%', color: palette.gachaSilverColor },
                                { label: 'Ancient Wisdom (EXP)', value: '30%', color: palette.gachaExpColor },
                                { label: 'Life Blessing (HP)', value: '40%', color: palette.gachaHpColor },
                            ].map(row => (
                                <View key={row.label} style={styles.dropRateRow}>
                                    <Text style={[styles.dropRateLabel, { color: palette.gachaInfoLabelColor }]}>{row.label}</Text>
                                    <Text style={[styles.dropRateValue, { color: row.color, fontWeight: '800' }]}>{row.value}</Text>
                                </View>
                            ))}
                        </Animated.View>
                    )}
                    <TouchableOpacity
                        style={[
                            styles.gachaButton,
                            { backgroundColor: stats.gold < 100 ? palette.gachaButtonDisabledBg : palette.gachaButtonActiveBg },
                            stats.gold < 100 && styles.gachaButtonDisabled,
                        ]}
                        disabled={stats.gold < 100}
                        onPress={handleGacha}
                    >
                        <Text style={[styles.gachaButtonText, { color: stats.gold < 100 ? palette.gachaButtonDisabledText : palette.gachaButtonActiveText }]}>
                            Invoke the Shrine (100 G)
                        </Text>
                    </TouchableOpacity>
                    <View style={styles.gachaFooter}>
                        <View style={styles.avatarGroup}>
                            {[1, 2, 3].map(i => (
                                <View key={i} style={[styles.avatar, { backgroundColor: palette.avatarBg, borderColor: palette.border }]}>
                                    <Text style={styles.avatarText}>👤</Text>
                                </View>
                            ))}
                        </View>
                        <Text style={[styles.gachaFooterText, { color: palette.gachaFooterTextColor }]}>
                            128 Players recently won
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </>
    );
}

// ─── Static StyleSheet ────────────────────────────────────────────────────
const { width } = Dimensions.get('window');
const recoveryCardWidth = (width - 32 - 16) / 2;

const styles = StyleSheet.create({
    container: { flex: 1, paddingTop: 12, paddingHorizontal: 16, paddingBottom: 80 },
    section: { marginBottom: 32 },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16, paddingHorizontal: 4 },
    sectionTitle: { fontSize: 10, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 2 },

    recoveryGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    recoveryCard: {
        width: recoveryCardWidth, borderRadius: 32, borderWidth: 2, padding: 16, marginBottom: 16,
        shadowColor: '#000', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.07, shadowRadius: 0, elevation: 2,
    },
    recoveryCardDisabled: { opacity: 0.45 },
    recoveryIcon: { width: 56, height: 56, borderRadius: 24, borderWidth: 1, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
    recoveryInfo: { marginBottom: 28 },
    recoveryName: { fontSize: 14, fontWeight: '900', textTransform: 'uppercase', marginBottom: 4 },
    recoveryBonus: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase', marginBottom: 4 },
    recoveryDesc: { fontSize: 8, fontWeight: '700', textTransform: 'uppercase' },
    recoveryCost: {
        position: 'absolute', bottom: 16, right: 16,
        flexDirection: 'row', alignItems: 'center', gap: 4,
        backgroundColor: '#FBBF24', paddingHorizontal: 8, paddingVertical: 4,
        borderRadius: 16, borderWidth: 1, borderColor: '#1E293B',
    },
    recoveryCostText: { fontSize: 12, fontWeight: '900', fontFamily: 'monospace', color: '#1E293B' },

    exchangeCardDark: {
        borderRadius: 40, padding: 24, marginBottom: 24, borderWidth: 2,
        shadowColor: '#000', shadowOffset: { width: 4, height: 4 }, shadowOpacity: 0.2, shadowRadius: 0, elevation: 6,
    },
    exchangeCardLight: {
        borderRadius: 40, padding: 24, marginBottom: 24, borderWidth: 2,
        shadowColor: '#000', shadowOffset: { width: 4, height: 4 }, shadowOpacity: 0.08, shadowRadius: 0, elevation: 4,
    },
    exchangeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
    exchangeTitle: { fontSize: 20, fontWeight: '900', fontStyle: 'italic', textTransform: 'uppercase', color: '#FBBF24' },
    exchangeSubtitle: { fontSize: 8, fontWeight: '900', textTransform: 'uppercase', marginTop: 4 },
    exchangeTitleLight: { fontSize: 20, fontWeight: '900', fontStyle: 'italic', textTransform: 'uppercase' },
    exchangeSubtitleLight: { fontSize: 8, fontWeight: '900', textTransform: 'uppercase', marginTop: 4 },
    rateBadge: { alignItems: 'flex-end' },
    rateLabel: { fontSize: 8, fontWeight: '900', textTransform: 'uppercase', marginBottom: 4 },
    rateValue: { backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 24, borderWidth: 1, borderColor: '#FBBF24' },
    rateText: { fontSize: 10, fontWeight: '900', color: '#FBBF24' },
    rateValueLight: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 24, borderWidth: 1, borderColor: '#14B8A6' },
    rateTextLight: { fontSize: 10, fontWeight: '900', color: '#14B8A6' },

    sliderContainer: { marginBottom: 24 },
    sliderControls: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    sliderLabel: { fontSize: 8, fontWeight: '900', textTransform: 'uppercase' },
    presetButtons: { flexDirection: 'row', gap: 4 },
    presetBtn: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    presetBtnText: { fontSize: 8, fontWeight: '900' },
    maxBtn: { paddingHorizontal: 8, paddingVertical: 4, backgroundColor: 'rgba(251,191,36,0.2)', borderRadius: 8 },
    maxBtnText: { fontSize: 8, fontWeight: '900' },
    maxBtnLight: { paddingHorizontal: 8, paddingVertical: 4, backgroundColor: 'rgba(20,184,166,0.12)', borderRadius: 8 },
    maxBtnTextLight: { fontSize: 8, fontWeight: '900' },
    slider: { width: '100%', height: 6 },
    sliderValue: { alignItems: 'center', marginTop: 12 },
    sliderValueNumber: { fontSize: 24, fontWeight: '900', fontFamily: 'monospace' },
    sliderValueUnit: { fontSize: 8, fontWeight: '900', textTransform: 'uppercase' },

    resultCard: { borderRadius: 24, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    resultLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    resultIconYellow: { padding: 8, backgroundColor: 'rgba(251,191,36,0.2)', borderRadius: 16 },
    resultIconTeal: { padding: 8, backgroundColor: 'rgba(20,184,166,0.12)', borderRadius: 16 },
    resultLabel: { fontSize: 8, fontWeight: '900', textTransform: 'uppercase' },
    resultValueYellow: { fontSize: 20, fontWeight: '900', fontFamily: 'monospace', color: '#FBBF24' },
    resultValueTeal: { fontSize: 20, fontWeight: '900', fontFamily: 'monospace', color: '#14B8A6' },
    resultRight: { alignItems: 'flex-end' },
    resultFeeLabel: { fontSize: 8, fontWeight: '900', textTransform: 'uppercase' },
    resultFeeValue: { fontSize: 10, fontWeight: '900' },

    confirmButton: {
        backgroundColor: '#FBBF24', borderRadius: 32, paddingVertical: 20,
        alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#1E293B',
        shadowColor: '#000', shadowOffset: { width: 3, height: 3 }, shadowOpacity: 0.2, shadowRadius: 0, elevation: 4,
    },
    confirmButtonTeal: {
        backgroundColor: '#14B8A6', borderRadius: 32, paddingVertical: 20,
        alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#1E293B',
        shadowColor: '#000', shadowOffset: { width: 3, height: 3 }, shadowOpacity: 0.1, shadowRadius: 0, elevation: 4,
    },
    confirmButtonDisabled: { opacity: 0.45 },
    confirmButtonText: { fontSize: 18, fontWeight: '900', fontStyle: 'italic', textTransform: 'uppercase', color: '#1E293B' },
    confirmButtonTextTeal: { fontSize: 18, fontWeight: '900', fontStyle: 'italic', textTransform: 'uppercase', color: '#1E293B' },

    gachaCard: {
        borderRadius: 32, padding: 20, marginBottom: 24, borderWidth: 1,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3,
    },
    gachaHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    gachaTitleContainer: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    gachaTitle: { fontSize: 28, fontWeight: '900', fontStyle: 'italic', textTransform: 'uppercase' },
    infoButton: { padding: 8, borderRadius: 16 },
    gachaSubtitle: { fontSize: 10, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 24 },
    gachaInfoPanel: { borderRadius: 24, padding: 16, marginBottom: 24, overflow: 'hidden', borderWidth: 1 },
    gachaInfoTitle: { fontSize: 9, fontWeight: '900', textTransform: 'uppercase', marginBottom: 12 },
    dropRateRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    dropRateLabel: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
    dropRateValue: { fontSize: 10, fontWeight: '900' },
    gachaButton: {
        borderRadius: 32, paddingVertical: 24, alignItems: 'center', justifyContent: 'center',
        borderWidth: 2, borderColor: '#1E293B',
        shadowColor: '#000', shadowOffset: { width: 3, height: 3 }, shadowOpacity: 0.2, shadowRadius: 0, elevation: 4,
        marginBottom: 16,
    },
    gachaButtonDisabled: { opacity: 0.45 },
    gachaButtonText: { fontSize: 18, fontWeight: '900', fontStyle: 'italic', textTransform: 'uppercase' },
    gachaFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 },
    avatarGroup: { flexDirection: 'row', gap: -8 },
    avatar: { width: 24, height: 24, borderRadius: 12, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
    avatarText: { fontSize: 8 },
    gachaFooterText: { fontSize: 8, fontWeight: '900', textTransform: 'uppercase' },
});