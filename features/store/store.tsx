import GachaChestModal, { GachaReward } from '@/components/common/GachaChestModal';
import { RECOVERY_ITEMS } from '@/core/constants';
import { UserStats } from '@/core/types';
import { useColorScheme } from '@/hooks/use-color-scheme';
import Slider from '@react-native-community/slider';
import * as Icons from 'lucide-react-native';
import {
    ArrowRightLeft,
    CheckCircle,
    Coffee,
    Coins,
    Info,
    RefreshCw,
    ShieldCheck,
    Sparkles,
    Zap
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
    View
} from 'react-native';

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

// ─── Palette helper — dynamic colors gathered here ─────────────────────────
function usePalette() {
    const scheme = useColorScheme();
    const isDark = scheme === 'dark';
    return {
        isDark,
        // Backgrounds
        bg: isDark ? '#0F172A' : '#F8FAFC',
        card: isDark ? '#1E293B' : '#FFFFFF',
        cardAlt: isDark ? '#0F172A' : '#F1F5F9',
        panel: isDark ? '#111827' : '#F8FAFC',
        inputBg: isDark ? '#0F172A' : '#F1F5F9',
        // Borders
        border: isDark ? '#334155' : '#E2E8F0',
        borderMuted: isDark ? '#1E293B' : '#F1F5F9',
        borderActive: isDark ? '#FBBF24' : '#1E293B',   // border for active card
        // Text
        text: isDark ? '#F8FAFC' : '#1E293B',
        textMuted: isDark ? '#94A3B8' : '#64748B',
        textFaint: isDark ? 'rgba(248,250,252,0.4)' : 'rgba(30,41,59,0.4)',
        // Accent color for recovery bonus
        recoveryBonus: isDark ? '#5EEAD4' : '#0D9488',
        // MAX button on exchange card
        maxBtnTextDark: isDark ? '#FDE047' : '#FBBF24',
        maxBtnTextLight: isDark ? '#5EEAD4' : '#14B8A6',
        // Fee result on dark card (higher contrast)
        resultFeeDark: isDark ? 'rgba(248,250,252,0.8)' : 'rgba(0,0,0,0.7)',
        // Exchange card dark (always contrasts background)
        exchangeDarkBg: isDark ? '#0F172A' : '#1E293B',
        exchangeDarkBorder: isDark ? '#1E293B' : '#334155',
        exchangeDarkText: '#FFFFFF',
        exchangeDarkMuted: isDark ? 'rgba(248,250,252,0.4)' : 'rgba(255,255,255,0.5)',
        exchangeDarkSliderLabel: isDark ? 'rgba(248,250,252,0.4)' : 'rgba(255,255,255,0.5)',
    };
}

// ─── Transaction Popup (mostly unchanged, accepts palette) ────────────────
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
    const scaleAnim = useRef(new Animated.Value(0.8)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;
    const checkAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.spring(scaleAnim, { toValue: 1, tension: 120, friction: 8, useNativeDriver: true }),
                Animated.timing(opacityAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
                Animated.spring(slideAnim, { toValue: 0, tension: 100, friction: 8, useNativeDriver: true }),
            ]).start(() => {
                Animated.spring(checkAnim, { toValue: 1, tension: 200, friction: 6, useNativeDriver: true }).start();
            });
        } else {
            scaleAnim.setValue(0.8);
            opacityAnim.setValue(0);
            checkAnim.setValue(0);
            slideAnim.setValue(30);
        }
    }, [visible]);

    if (!result) return null;

    const IconComponent =
        result.icon === 'sparkles' ? Sparkles :
        result.icon === 'zap' ? Zap :
        result.icon === 'shield' ? ShieldCheck :
        CheckCircle;

    return (
        <Modal transparent animationType="none" visible={visible} onRequestClose={onClose}>
            <Animated.View style={[popupStyles.overlay, { opacity: opacityAnim }]}>
                <Animated.View
                    style={[
                        popupStyles.card,
                        {
                            transform: [{ scale: scaleAnim }, { translateY: slideAnim }],
                            borderColor: result.accentColor,
                            backgroundColor: palette.card,
                        },
                    ]}
                >
                    <View style={[popupStyles.accentBar, { backgroundColor: result.accentColor }]} />

                    <Animated.View
                        style={[
                            popupStyles.iconCircle,
                            {
                                backgroundColor: result.bgColor,
                                borderColor: result.accentColor,
                                transform: [{ scale: checkAnim }],
                            },
                        ]}
                    >
                        <IconComponent size={36} color={result.accentColor} fill={result.icon === 'sparkles' ? result.accentColor : 'none'} />
                    </Animated.View>

                    <View style={[popupStyles.statusBadge, { backgroundColor: result.success ? '#DCFCE7' : '#FEE2E2' }]}>
                        <Text style={[popupStyles.statusText, { color: result.success ? '#16A34A' : '#DC2626' }]}>
                                {result.success ? '✓ TRANSACTION SUCCESS' : '✗ TRANSACTION FAILED'}
                        </Text>
                    </View>

                    <Text style={[popupStyles.title, { color: palette.text }]}>{result.title}</Text>
                    <Text style={[popupStyles.subtitle, { color: palette.textMuted }]}>{result.subtitle}</Text>

                    <View style={[popupStyles.detailsGrid, { backgroundColor: palette.panel, borderWidth: 1, borderColor: palette.border }]}>
                        {result.details.map((detail, i) => (
                            <View key={i} style={popupStyles.detailRow}>
                                <Text style={[popupStyles.detailLabel, { color: palette.textMuted }]}>{detail.label}</Text>
                                <Text style={[popupStyles.detailValue, { color: detail.color ?? palette.text }]}>
                                    {detail.value}
                                </Text>
                            </View>
                        ))}
                    </View>

                    <View style={[popupStyles.divider, { backgroundColor: palette.border }]} />

                    <TouchableOpacity
                        style={[popupStyles.closeButton, { backgroundColor: result.accentColor }]}
                        onPress={onClose}
                        activeOpacity={0.85}
                    >
                            <Text style={popupStyles.closeButtonText}>CLOSE</Text>
                    </TouchableOpacity>
                </Animated.View>
            </Animated.View>
        </Modal>
    );
}

const popupStyles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.65)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    card: {
        width: '100%',
        borderRadius: 32,
        borderWidth: 2,
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingBottom: 28,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.35,
        shadowRadius: 24,
        elevation: 20,
    },
    accentBar: { width: '100%', height: 6, marginBottom: 24 },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    statusBadge: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 100, marginBottom: 16 },
    statusText: { fontSize: 9, fontWeight: '900', letterSpacing: 1.5 },
    title: { fontSize: 22, fontWeight: '900', fontStyle: 'italic', textTransform: 'uppercase', textAlign: 'center', marginBottom: 6 },
    subtitle: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, textAlign: 'center', marginBottom: 24 },
    detailsGrid: { width: '100%', borderRadius: 20, padding: 16, gap: 12, marginBottom: 20 },
    detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    detailLabel: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
    detailValue: { fontSize: 14, fontWeight: '900', fontFamily: 'monospace' },
    divider: { width: '100%', height: 1, marginBottom: 20 },
    closeButton: {
        width: '100%',
        paddingVertical: 18,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#1E293B',
        shadowColor: '#000',
        shadowOffset: { width: 3, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 0,
        elevation: 4,
    },
    closeButtonText: { fontSize: 16, fontWeight: '900', fontStyle: 'italic', color: '#1E293B', letterSpacing: 2 },
});

// ─── Main StoreTab ─────────────────────────────────────────────────────────────
export default function StoreTab({ stats, onPurchase, onGacha }: StoreTabProps) {
    const palette = usePalette();

    const [showChest, setShowChest] = useState(false);
    const [gachaReward, setGachaReward] = useState<GachaReward | null>(null);
    const [isOpeningChest, setIsOpeningChest] = useState(false);

    const [silverToGoldInput, setSilverToGoldInput] = useState(10);
    const [goldToSilverInput, setGoldToSilverInput] = useState(10);
    const [showGachaInfo, setShowGachaInfo] = useState(false);
    const [gachaInfoAnim] = useState(new Animated.Value(0));
    const [popupVisible, setPopupVisible] = useState(false);
    const [popupResult, setPopupResult] = useState<TransactionResult | null>(null);

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

    const handleSetMaxSilver = () => setSilverToGoldInput(Math.max(10, Math.min(Math.floor(stats.silver / 10) * 10, 2000)));
    const handleSetMaxGold = () => setGoldToSilverInput(Math.max(10, Math.min(Math.floor(stats.gold / 10) * 10, 500)));

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

    const showPopup = (result: TransactionResult) => { setPopupResult(result); setPopupVisible(true); };

    const handleRecoveryPurchase = (item: typeof RECOVERY_ITEMS[number]) => {
                if (item.id === 'skipTicket') {
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
                icon: 'check', accentColor: '#EF4444', bgColor: 'rgba(239,68,68,0.12)',
                details: [
                    { label: 'Item', value: item.name },
                    { label: 'HP Restored', value: `+${item.hpRestore} HP`, color: '#22C55E' },
                    { label: 'Gold Spent', value: `-${item.costGold} G`, color: '#EF4444' },
                ],
            });
        }
    };

    const handleSilverToGold = () => {
        const fee = Math.ceil(silverToGoldInput / silverPerGoldRate * networkFee);
        // Keep persisted transaction aligned with popup details: spend the exact slider input.
        onPurchase('gold', silverToGoldResult, silverToGoldInput);
        showPopup({
            type: 'exchange_gold', success: true,
            title: 'Conversion Successful', subtitle: 'Silver → Gold',
            icon: 'zap', accentColor: '#FBBF24', bgColor: 'rgba(251,191,36,0.12)',
            details: [
                { label: 'Silver Spent', value: `-${silverToGoldInput} S`, color: '#EF4444' },
                { label: 'Gold Received', value: `+${silverToGoldResult} G`, color: '#FBBF24' },
                { label: 'Network Fee (5%)', value: `-${fee} G`, color: '#94A3B8' },
                { label: 'Rate', value: `${silverPerGoldRate}S : 1G` },
            ],
        });
    };

    const handleGoldToSilver = () => {
        const fee = Math.ceil(goldToSilverInput * goldToSilverRate * networkFee);
        onPurchase('silver', goldToSilverResult, goldToSilverInput);
        showPopup({
            type: 'exchange_silver', success: true,
            title: 'Liquidation Successful', subtitle: 'Gold → Silver',
            icon: 'zap', accentColor: '#14B8A6', bgColor: 'rgba(20,184,166,0.12)',
            details: [
                { label: 'Gold Spent', value: `-${goldToSilverInput} G`, color: '#EF4444' },
                { label: 'Silver Received', value: `+${goldToSilverResult} S`, color: '#14B8A6' },
                { label: 'Stability Fee (5%)', value: `-${fee} S`, color: '#94A3B8' },
                { label: 'Rate', value: `1G : ${goldToSilverRate}S` },
            ],
        });
    };

    const handleGacha = async () => {
        if (stats.gold < 100) return;

        setShowChest(true);
        setIsOpeningChest(true);

        // Sumber reward tunggal: parent (shop.tsx) yang menentukan dan menyimpan hasil gacha.
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
    };

    // ─── Derived styles (nilai-nilai yang bergantung pada palette) ──────────────
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
            <TransactionPopup result={popupResult} visible={popupVisible} onClose={() => setPopupVisible(false)} palette={palette} />

            <GachaChestModal
                visible={showChest}
                onClose={() => {
                    setShowChest(false);
                    setGachaReward(null);
                }}
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

                    {/* Silver → Gold (kartu gelap) */}
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

                    {/* Gold → Silver (kartu terang) */}
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
                <View style={styles.gachaCard}>
                    <View style={styles.gachaHeader}>
                        <View style={styles.gachaTitleContainer}>
                            <Sparkles size={32} color="#FBBF24" fill="#FBBF24" />
                            <Text style={styles.gachaTitle}>Shrine of Fate</Text>
                        </View>
                        <TouchableOpacity style={styles.infoButton} onPress={toggleGachaInfo}>
                            <Info size={20} color="#FBBF24" />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.gachaSubtitle}>Sacrifice Gold for Civilization Blessing</Text>

                    {showGachaInfo && (
                        <Animated.View style={[styles.gachaInfoPanel, { height: gachaInfoHeight }]}>
                            <Text style={styles.gachaInfoTitle}>Divine Drop Rates</Text>
                            {[
                                { label: 'Ultimate Jackpot (Gold)', value: '5%', color: '#FBBF24' },
                                { label: 'Treasury Overflow (Silver)', value: '25%', color: '#14B8A6' },
                                { label: 'Ancient Wisdom (EXP)', value: '30%', color: '#A855F7' },
                                { label: 'Life Blessing (HP)', value: '40%', color: '#EF4444' },
                            ].map(row => (
                                <View key={row.label} style={styles.dropRateRow}>
                                    <Text style={styles.dropRateLabel}>{row.label}</Text>
                                    <Text style={[styles.dropRateValue, { color: row.color }]}>{row.value}</Text>
                                </View>
                            ))}
                        </Animated.View>
                    )}

                    <TouchableOpacity
                        style={[styles.gachaButton, stats.gold < 100 && styles.gachaButtonDisabled]}
                        disabled={stats.gold < 100}
                        onPress={handleGacha}
                    >
                        <Text style={styles.gachaButtonText}>Invoke the Shrine (100 G)</Text>
                    </TouchableOpacity>

                    <View style={styles.gachaFooter}>
                        <View style={styles.avatarGroup}>
                            {[1, 2, 3].map(i => (
                                <View key={i} style={styles.avatar}>
                                    <Text style={styles.avatarText}>👤</Text>
                                </View>
                            ))}
                        </View>
                        <Text style={styles.gachaFooterText}>128 Players recently won</Text>
                    </View>
                </View>
            </ScrollView>
        </>
    );
}

// ─── Static StyleSheet (dynamic colors are managed via palette and inline styles) ─────
const { width } = Dimensions.get('window');
const recoveryCardWidth = (width - 32 - 16) / 2;

const styles = StyleSheet.create({
    container: { flex: 1, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 80 },
    section: { marginBottom: 32 },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16, paddingHorizontal: 4 },
    sectionTitle: { fontSize: 10, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 2 },
    recoveryGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    recoveryCard: {
        width: recoveryCardWidth,
        borderRadius: 32,
        borderWidth: 2,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.07,
        shadowRadius: 0,
        elevation: 2,
    },
    recoveryCardDisabled: { opacity: 0.45 },
    recoveryIcon: {
        width: 56, height: 56,
        borderRadius: 24, borderWidth: 1,
        justifyContent: 'center', alignItems: 'center',
        marginBottom: 12,
    },
    recoveryInfo: { marginBottom: 28 },
    recoveryName: { fontSize: 14, fontWeight: '900', textTransform: 'uppercase', marginBottom: 4 },
    recoveryBonus: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase', marginBottom: 4 },
    recoveryDesc: { fontSize: 8, fontWeight: '700', textTransform: 'uppercase' },
    recoveryCost: {
        position: 'absolute', bottom: 16, right: 16,
        flexDirection: 'row', alignItems: 'center', gap: 4,
        backgroundColor: '#FBBF24',
        paddingHorizontal: 8, paddingVertical: 4,
        borderRadius: 16, borderWidth: 1,
    },
    recoveryCostText: { fontSize: 12, fontWeight: '900', fontFamily: 'monospace', color: '#1E293B' },

    // Exchange cards
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
        alignItems: 'center', justifyContent: 'center',
        borderWidth: 2, borderColor: '#1E293B',
        shadowColor: '#000', shadowOffset: { width: 3, height: 3 }, shadowOpacity: 0.2, shadowRadius: 0, elevation: 4,
    },
    confirmButtonTeal: {
        backgroundColor: '#14B8A6', borderRadius: 32, paddingVertical: 20,
        alignItems: 'center', justifyContent: 'center',
        borderWidth: 2, borderColor: '#1E293B',
        shadowColor: '#000', shadowOffset: { width: 3, height: 3 }, shadowOpacity: 0.1, shadowRadius: 0, elevation: 4,
    },
    confirmButtonDisabled: { opacity: 0.45 },
    confirmButtonText: { fontSize: 18, fontWeight: '900', fontStyle: 'italic', textTransform: 'uppercase', color: '#1E293B' },
    confirmButtonTextTeal: { fontSize: 18, fontWeight: '900', fontStyle: 'italic', textTransform: 'uppercase', color: '#1E293B' },

    // Gacha (always purple, no adaptation needed)
    gachaCard: {
        backgroundColor: '#8B5CF6', borderRadius: 40, padding: 24, marginBottom: 32,
        borderWidth: 2, borderColor: '#6D28D9',
        shadowColor: '#000', shadowOffset: { width: 4, height: 4 }, shadowOpacity: 0.2, shadowRadius: 0, elevation: 8, overflow: 'hidden',
    },
    gachaHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    gachaTitleContainer: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    gachaTitle: { fontSize: 28, fontWeight: '900', fontStyle: 'italic', textTransform: 'uppercase', color: '#FFFFFF' },
    infoButton: { padding: 8, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 16 },
    gachaSubtitle: { fontSize: 10, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 2, color: 'rgba(255,255,255,0.7)', marginBottom: 24 },
    gachaInfoPanel: { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 24, padding: 16, marginBottom: 24, overflow: 'hidden' },
    gachaInfoTitle: { fontSize: 9, fontWeight: '900', color: '#FBBF24', textTransform: 'uppercase', marginBottom: 12 },
    dropRateRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    dropRateLabel: { fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.75)', textTransform: 'uppercase' },
    dropRateValue: { fontSize: 10, fontWeight: '900' },
    gachaButton: {
        backgroundColor: '#FFFFFF', borderRadius: 32, paddingVertical: 24,
        alignItems: 'center', justifyContent: 'center',
        borderWidth: 2, borderColor: '#1E293B',
        shadowColor: '#000', shadowOffset: { width: 3, height: 3 }, shadowOpacity: 0.2, shadowRadius: 0, elevation: 4, marginBottom: 16,
    },
    gachaButtonDisabled: { opacity: 0.45 },
    gachaButtonText: { fontSize: 18, fontWeight: '900', fontStyle: 'italic', textTransform: 'uppercase', color: '#1E293B' },
    gachaFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 },
    avatarGroup: { flexDirection: 'row', gap: -8 },
    avatar: {
        width: 24, height: 24, borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderWidth: 2, borderColor: '#8B5CF6',
        justifyContent: 'center', alignItems: 'center',
    },
    avatarText: { fontSize: 8 },
    gachaFooterText: { fontSize: 8, fontWeight: '900', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase' },
});
