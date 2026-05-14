import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Dimensions,
    Animated,
    UIManager,
    Platform,
    Modal,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { UserStats } from '@/core/types';
import { RECOVERY_ITEMS } from '@/core/constants';
import {
    Coffee,
    RefreshCw,
    Sparkles,
    Coins,
    Info,
    ArrowRightLeft,
    CheckCircle,
    XCircle,
    TrendingUp,
    Zap,
    ShieldCheck,
} from 'lucide-react-native';
import * as Icons from 'lucide-react-native';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface StoreTabProps {
    stats: UserStats;
    onPurchase: (type: 'hp' | 'silver' | 'gold' | 'skipTicket', amount: number, cost: number) => void;
    onGacha: () => void;
}

// ─── Transaction Popup Types ───────────────────────────────────────────────────
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

// ─── Transaction Popup Component ───────────────────────────────────────────────
function TransactionPopup({
    result,
    visible,
    onClose,
}: {
    result: TransactionResult | null;
    visible: boolean;
    onClose: () => void;
}) {
    const scaleAnim = useRef(new Animated.Value(0.8)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;
    const checkAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    tension: 120,
                    friction: 8,
                    useNativeDriver: true,
                }),
                Animated.timing(opacityAnim, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.spring(slideAnim, {
                    toValue: 0,
                    tension: 100,
                    friction: 8,
                    useNativeDriver: true,
                }),
            ]).start(() => {
                Animated.spring(checkAnim, {
                    toValue: 1,
                    tension: 200,
                    friction: 6,
                    useNativeDriver: true,
                }).start();
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
                        },
                    ]}
                >
                    {/* Top accent bar */}
                    <View style={[popupStyles.accentBar, { backgroundColor: result.accentColor }]} />

                    {/* Icon circle */}
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

                    {/* Status badge */}
                    <View style={[popupStyles.statusBadge, { backgroundColor: result.success ? '#DCFCE7' : '#FEE2E2' }]}>
                        <Text style={[popupStyles.statusText, { color: result.success ? '#16A34A' : '#DC2626' }]}>
                            {result.success ? '✓ TRANSAKSI BERHASIL' : '✗ TRANSAKSI GAGAL'}
                        </Text>
                    </View>

                    {/* Title */}
                    <Text style={popupStyles.title}>{result.title}</Text>
                    <Text style={popupStyles.subtitle}>{result.subtitle}</Text>

                    {/* Details grid */}
                    <View style={popupStyles.detailsGrid}>
                        {result.details.map((detail, i) => (
                            <View key={i} style={popupStyles.detailRow}>
                                <Text style={popupStyles.detailLabel}>{detail.label}</Text>
                                <Text style={[popupStyles.detailValue, detail.color ? { color: detail.color } : {}]}>
                                    {detail.value}
                                </Text>
                            </View>
                        ))}
                    </View>

                    {/* Divider */}
                    <View style={popupStyles.divider} />

                    {/* Close button */}
                    <TouchableOpacity
                        style={[popupStyles.closeButton, { backgroundColor: result.accentColor }]}
                        onPress={onClose}
                        activeOpacity={0.85}
                    >
                        <Text style={popupStyles.closeButtonText}>TUTUP</Text>
                    </TouchableOpacity>
                </Animated.View>
            </Animated.View>
        </Modal>
    );
}

const popupStyles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.55)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    card: {
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: 32,
        borderWidth: 2,
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingBottom: 28,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.25,
        shadowRadius: 24,
        elevation: 20,
    },
    accentBar: {
        width: '100%',
        height: 6,
        marginBottom: 24,
    },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    statusBadge: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 100,
        marginBottom: 16,
    },
    statusText: {
        fontSize: 9,
        fontWeight: '900',
        letterSpacing: 1.5,
    },
    title: {
        fontSize: 22,
        fontWeight: '900',
        fontStyle: 'italic',
        textTransform: 'uppercase',
        color: '#1E293B',
        textAlign: 'center',
        marginBottom: 6,
    },
    subtitle: {
        fontSize: 11,
        fontWeight: '700',
        color: '#94A3B8',
        textTransform: 'uppercase',
        letterSpacing: 1,
        textAlign: 'center',
        marginBottom: 24,
    },
    detailsGrid: {
        width: '100%',
        backgroundColor: '#F8FAFC',
        borderRadius: 20,
        padding: 16,
        gap: 12,
        marginBottom: 20,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    detailLabel: {
        fontSize: 10,
        fontWeight: '700',
        color: '#94A3B8',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    detailValue: {
        fontSize: 14,
        fontWeight: '900',
        color: '#1E293B',
        fontFamily: 'monospace',
    },
    divider: {
        width: '100%',
        height: 1,
        backgroundColor: '#E2E8F0',
        marginBottom: 20,
    },
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
    closeButtonText: {
        fontSize: 16,
        fontWeight: '900',
        fontStyle: 'italic',
        color: '#1E293B',
        letterSpacing: 2,
    },
});

// ─── Main StoreTab Component ───────────────────────────────────────────────────
export default function StoreTab({ stats, onPurchase, onGacha }: StoreTabProps) {
    const [silverToGoldInput, setSilverToGoldInput] = useState(10);
    const [goldToSilverInput, setGoldToSilverInput] = useState(10);
    const [showGachaInfo, setShowGachaInfo] = useState(false);
    const [gachaInfoAnim] = useState(new Animated.Value(0));

    // Popup state
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

    const handleSetMaxSilver = () => {
        const maxAffordable = Math.floor(stats.silver / 10) * 10;
        setSilverToGoldInput(Math.max(10, Math.min(maxAffordable, 2000)));
    };

    const handleSetMaxGold = () => {
        const maxAffordable = Math.floor(stats.gold / 10) * 10;
        setGoldToSilverInput(Math.max(10, Math.min(maxAffordable, 500)));
    };

    const toggleGachaInfo = () => {
        if (showGachaInfo) {
            Animated.timing(gachaInfoAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: false,
            }).start(() => setShowGachaInfo(false));
        } else {
            setShowGachaInfo(true);
            Animated.timing(gachaInfoAnim, {
                toValue: 1,
                duration: 200,
                useNativeDriver: false,
            }).start();
        }
    };

    const gachaInfoHeight = gachaInfoAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 200],
    });

    // ─── Popup Triggers ──────────────────────────────────────────────────────
    const showPopup = (result: TransactionResult) => {
        setPopupResult(result);
        setPopupVisible(true);
    };

    const handleRecoveryPurchase = (item: typeof RECOVERY_ITEMS[number]) => {
        if (item.id === 'skipTicket') {
            onPurchase('skipTicket', 1, item.costGold);
            showPopup({
                type: 'purchase',
                success: true,
                title: 'Skip Ticket',
                subtitle: 'Perlindungan Aktif',
                icon: 'shield',
                accentColor: '#14B8A6',
                bgColor: 'rgba(20,184,166,0.08)',
                details: [
                    { label: 'Item', value: item.name },
                    { label: 'Efek', value: 'PROTECTION', color: '#14B8A6' },
                    { label: 'Gold Dikeluarkan', value: `-${item.costGold} G`, color: '#EF4444' },
                ],
            });
        } else {
            onPurchase('hp', item.hpRestore, item.costGold);
            showPopup({
                type: 'purchase',
                success: true,
                title: item.name,
                subtitle: 'Pemulihan Berhasil',
                icon: 'check',
                accentColor: '#EF4444',
                bgColor: 'rgba(239,68,68,0.08)',
                details: [
                    { label: 'Item', value: item.name },
                    { label: 'HP Dipulihkan', value: `+${item.hpRestore} HP`, color: '#22C55E' },
                    { label: 'Gold Dikeluarkan', value: `-${item.costGold} G`, color: '#EF4444' },
                ],
            });
        }
    };

    const handleSilverToGold = () => {
        const fee = Math.ceil(silverToGoldInput / silverPerGoldRate * networkFee);
        onPurchase('gold', silverToGoldResult, Math.floor(silverToGoldResult * silverPerGoldRate));
        showPopup({
            type: 'exchange_gold',
            success: true,
            title: 'Konversi Berhasil',
            subtitle: 'Silver → Gold',
            icon: 'zap',
            accentColor: '#FBBF24',
            bgColor: 'rgba(251,191,36,0.08)',
            details: [
                { label: 'Silver Digunakan', value: `-${silverToGoldInput} S`, color: '#EF4444' },
                { label: 'Gold Diterima', value: `+${silverToGoldResult} G`, color: '#FBBF24' },
                { label: 'Biaya Jaringan (5%)', value: `-${fee} G`, color: '#94A3B8' },
                { label: 'Kurs', value: `${silverPerGoldRate}S : 1G` },
            ],
        });
    };

    const handleGoldToSilver = () => {
        const fee = Math.ceil(goldToSilverInput * goldToSilverRate * networkFee);
        onPurchase('silver', goldToSilverResult, goldToSilverInput);
        showPopup({
            type: 'exchange_silver',
            success: true,
            title: 'Likuidasi Berhasil',
            subtitle: 'Gold → Silver',
            icon: 'zap',
            accentColor: '#14B8A6',
            bgColor: 'rgba(20,184,166,0.08)',
            details: [
                { label: 'Gold Digunakan', value: `-${goldToSilverInput} G`, color: '#EF4444' },
                { label: 'Silver Diterima', value: `+${goldToSilverResult} S`, color: '#14B8A6' },
                { label: 'Biaya Stabilitas (5%)', value: `-${fee} S`, color: '#94A3B8' },
                { label: 'Kurs', value: `1G : ${goldToSilverRate}S` },
            ],
        });
    };

    const handleGacha = () => {
        onGacha();
        showPopup({
            type: 'gacha',
            success: true,
            title: 'Kuil Nasib',
            subtitle: 'Berkah Peradaban',
            icon: 'sparkles',
            accentColor: '#8B5CF6',
            bgColor: 'rgba(139,92,246,0.08)',
            details: [
                { label: 'Gold Dikorbankan', value: `-100 G`, color: '#EF4444' },
                { label: 'Status', value: 'Sedang diproses...', color: '#8B5CF6' },
                { label: 'Semoga Beruntung', value: '🎲', color: '#FBBF24' },
            ],
        });
    };

    return (
        <>
            <TransactionPopup
                result={popupResult}
                visible={popupVisible}
                onClose={() => setPopupVisible(false)}
            />

            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                {/* Recovery Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Coffee size={16} color="#64748B" />
                        <Text style={styles.sectionTitle}>Survival Supplies</Text>
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
                                        canAfford ? styles.recoveryCardActive : styles.recoveryCardDisabled,
                                    ]}
                                    onPress={() => handleRecoveryPurchase(item)}
                                    activeOpacity={0.8}
                                >
                                    <View style={[styles.recoveryIcon, canAfford && styles.recoveryIconActive]}>
                                        <Icon size={28} color="#1E293B" />
                                    </View>
                                    <View style={styles.recoveryInfo}>
                                        <Text style={styles.recoveryName}>{item.name}</Text>
                                        <Text style={styles.recoveryBonus}>
                                            {item.id === 'skipTicket' ? 'PROTECTION' : `+${item.hpRestore} HP`}
                                        </Text>
                                        <Text style={styles.recoveryDesc}>{item.description}</Text>
                                    </View>
                                    <View style={styles.recoveryCost}>
                                        <Coins size={14} color="#1E293B" />
                                        <Text style={styles.recoveryCostText}>{item.costGold}</Text>
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                {/* Exchange Protocol */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <ArrowRightLeft size={16} color="#64748B" />
                        <Text style={styles.sectionTitle}>Resource Conversion</Text>
                    </View>

                    {/* Silver to Gold */}
                    <View style={styles.exchangeCardDark}>
                        <View style={styles.exchangeHeader}>
                            <View>
                                <Text style={styles.exchangeTitle}>Liquid Asset</Text>
                                <Text style={styles.exchangeSubtitle}>Silver Kota → Gold Habit</Text>
                            </View>
                            <View style={styles.rateBadge}>
                                <Text style={styles.rateLabel}>Market Rate</Text>
                                <View style={styles.rateValue}>
                                    <Text style={styles.rateText}>{silverPerGoldRate}S : 1G</Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.sliderContainer}>
                            <View style={styles.sliderControls}>
                                <Text style={styles.sliderLabel}>Conversion Amount</Text>
                                <View style={styles.presetButtons}>
                                    {[100, 500, 1000].map(val => (
                                        <TouchableOpacity key={val} style={styles.presetBtn} onPress={() => setSilverToGoldInput(val)}>
                                            <Text style={styles.presetBtnText}>{val}</Text>
                                        </TouchableOpacity>
                                    ))}
                                    <TouchableOpacity style={styles.maxBtn} onPress={handleSetMaxSilver}>
                                        <Text style={styles.maxBtnText}>MAX</Text>
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
                                <Text style={styles.sliderValueNumber}>{silverToGoldInput}</Text>
                                <Text style={styles.sliderValueUnit}>S</Text>
                            </View>
                        </View>

                        <View style={styles.resultCard}>
                            <View style={styles.resultLeft}>
                                <View style={styles.resultIconYellow}>
                                    <RefreshCw size={16} color="#FBBF24" />
                                </View>
                                <View>
                                    <Text style={styles.resultLabel}>Est. Gold Received</Text>
                                    <Text style={styles.resultValueYellow}>{silverToGoldResult} G</Text>
                                </View>
                            </View>
                            <View style={styles.resultRight}>
                                <Text style={styles.resultFeeLabel}>Net Fee (5%)</Text>
                                <Text style={styles.resultFeeValue}>-{Math.ceil(silverToGoldInput / silverPerGoldRate * networkFee)} G</Text>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={[
                                styles.confirmButton,
                                (stats.silver < silverToGoldInput || silverToGoldResult <= 0) && styles.confirmButtonDisabled,
                            ]}
                            disabled={stats.silver < silverToGoldInput || silverToGoldResult <= 0}
                            onPress={handleSilverToGold}
                        >
                            <Text style={styles.confirmButtonText}>Confirm Conversion</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Gold to Silver */}
                    <View style={styles.exchangeCardLight}>
                        <View style={styles.exchangeHeader}>
                            <View>
                                <Text style={styles.exchangeTitleLight}>Treasury Exchange</Text>
                                <Text style={styles.exchangeSubtitleLight}>Gold Habit → Silver Kota</Text>
                            </View>
                            <View style={styles.rateBadgeLight}>
                                <Text style={styles.rateLabelLight}>Market Rate</Text>
                                <View style={styles.rateValueLight}>
                                    <Text style={styles.rateTextLight}>1G : {goldToSilverRate}S</Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.sliderContainer}>
                            <View style={styles.sliderControls}>
                                <Text style={styles.sliderLabelLight}>Collateral Amount</Text>
                                <View style={styles.presetButtons}>
                                    {[10, 50, 100].map(val => (
                                        <TouchableOpacity key={val} style={styles.presetBtnLight} onPress={() => setGoldToSilverInput(val)}>
                                            <Text style={styles.presetBtnTextLight}>{val}</Text>
                                        </TouchableOpacity>
                                    ))}
                                    <TouchableOpacity style={styles.maxBtnLight} onPress={handleSetMaxGold}>
                                        <Text style={styles.maxBtnTextLight}>MAX</Text>
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
                                maximumTrackTintColor="#E2E8F0"
                                thumbTintColor="#14B8A6"
                            />
                            <View style={styles.sliderValue}>
                                <Text style={styles.sliderValueNumberLight}>{goldToSilverInput}</Text>
                                <Text style={styles.sliderValueUnitLight}>G</Text>
                            </View>
                        </View>

                        <View style={styles.resultCardLight}>
                            <View style={styles.resultLeft}>
                                <View style={styles.resultIconTeal}>
                                    <RefreshCw size={16} color="#14B8A6" />
                                </View>
                                <View>
                                    <Text style={styles.resultLabelLight}>Est. Silver Liquidity</Text>
                                    <Text style={styles.resultValueTeal}>{goldToSilverResult} S</Text>
                                </View>
                            </View>
                            <View style={styles.resultRight}>
                                <Text style={styles.resultFeeLabelLight}>Stability Fee (5%)</Text>
                                <Text style={styles.resultFeeValueLight}>-{Math.ceil(goldToSilverInput * goldToSilverRate * networkFee)} S</Text>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={[
                                styles.confirmButtonTeal,
                                (stats.gold < goldToSilverInput || goldToSilverResult <= 0) && styles.confirmButtonDisabled,
                            ]}
                            disabled={stats.gold < goldToSilverInput || goldToSilverResult <= 0}
                            onPress={handleGoldToSilver}
                        >
                            <Text style={styles.confirmButtonTextTeal}>Liquidate to Silver</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Gacha System */}
                <View style={styles.gachaCard}>
                    <View style={styles.gachaHeader}>
                        <View style={styles.gachaTitleContainer}>
                            <Sparkles size={32} color="#FBBF24" fill="#FBBF24" />
                            <Text style={styles.gachaTitle}>Kuil Nasib</Text>
                        </View>
                        <TouchableOpacity style={styles.infoButton} onPress={toggleGachaInfo}>
                            <Info size={20} color="#FBBF24" />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.gachaSubtitle}>Sacrifice Gold for Civilization's Blessing</Text>

                    {showGachaInfo && (
                        <Animated.View style={[styles.gachaInfoPanel, { height: gachaInfoHeight }]}>
                            <Text style={styles.gachaInfoTitle}>Divine Drop Rates</Text>
                            <View style={styles.dropRateRow}>
                                <Text style={styles.dropRateLabel}>Ultimate Jackpot (Gold)</Text>
                                <Text style={styles.dropRateValue}>5%</Text>
                            </View>
                            <View style={styles.dropRateRow}>
                                <Text style={styles.dropRateLabel}>Treasury Overflow (Silver)</Text>
                                <Text style={styles.dropRateValueSilver}>25%</Text>
                            </View>
                            <View style={styles.dropRateRow}>
                                <Text style={styles.dropRateLabel}>Ancient Wisdom (EXP)</Text>
                                <Text style={styles.dropRateValueExp}>30%</Text>
                            </View>
                            <View style={styles.dropRateRow}>
                                <Text style={styles.dropRateLabel}>Life Blessing (HP)</Text>
                                <Text style={styles.dropRateValueHp}>40%</Text>
                            </View>
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

const { width } = Dimensions.get('window');
const cardPadding = 16;
const recoveryCardWidth = (width - 32 - cardPadding) / 2;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 80,
    },
    section: {
        marginBottom: 32,
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
    recoveryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    recoveryCard: {
        width: recoveryCardWidth,
        backgroundColor: '#FFFFFF',
        borderRadius: 32,
        borderWidth: 2,
        borderColor: '#E2E8F0',
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 0,
        elevation: 2,
    },
    recoveryCardActive: {
        borderColor: '#1E293B',
        shadowOffset: { width: 3, height: 3 },
        shadowOpacity: 0.1,
    },
    recoveryCardDisabled: {
        opacity: 0.5,
    },
    recoveryIcon: {
        width: 56,
        height: 56,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#CBD5E1',
        backgroundColor: '#F1F5F9',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    recoveryIconActive: {
        backgroundColor: '#F1F5F9',
    },
    recoveryInfo: {
        marginBottom: 12,
    },
    recoveryName: {
        fontSize: 14,
        fontWeight: '900',
        textTransform: 'uppercase',
        color: '#1E293B',
        marginBottom: 4,
    },
    recoveryBonus: {
        fontSize: 10,
        fontWeight: '800',
        color: '#14B8A6',
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    recoveryDesc: {
        fontSize: 8,
        fontWeight: '700',
        color: '#94A3B8',
        textTransform: 'uppercase',
    },
    recoveryCost: {
        position: 'absolute',
        bottom: 16,
        right: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#FBBF24',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#1E293B',
    },
    recoveryCostText: {
        fontSize: 12,
        fontWeight: '900',
        fontFamily: 'monospace',
        color: '#1E293B',
    },
    exchangeCardDark: {
        backgroundColor: '#1E293B',
        borderRadius: 40,
        padding: 24,
        marginBottom: 24,
        borderWidth: 2,
        borderColor: '#334155',
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 0,
        elevation: 6,
    },
    exchangeCardLight: {
        backgroundColor: '#FFFFFF',
        borderRadius: 40,
        padding: 24,
        borderWidth: 2,
        borderColor: '#E2E8F0',
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 0,
        elevation: 4,
    },
    exchangeHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 24,
    },
    exchangeTitle: {
        fontSize: 20,
        fontWeight: '900',
        fontStyle: 'italic',
        textTransform: 'uppercase',
        color: '#FBBF24',
    },
    exchangeSubtitle: {
        fontSize: 8,
        fontWeight: '900',
        color: 'rgba(255,255,255,0.4)',
        textTransform: 'uppercase',
        marginTop: 4,
    },
    exchangeTitleLight: {
        fontSize: 20,
        fontWeight: '900',
        fontStyle: 'italic',
        textTransform: 'uppercase',
        color: '#14B8A6',
    },
    exchangeSubtitleLight: {
        fontSize: 8,
        fontWeight: '900',
        color: '#94A3B8',
        textTransform: 'uppercase',
        marginTop: 4,
    },
    rateBadge: { alignItems: 'flex-end' },
    rateLabel: {
        fontSize: 8,
        fontWeight: '900',
        color: 'rgba(255,255,255,0.4)',
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    rateValue: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#FBBF24',
    },
    rateText: { fontSize: 10, fontWeight: '900', color: '#FBBF24' },
    rateBadgeLight: { alignItems: 'flex-end' },
    rateLabelLight: {
        fontSize: 8,
        fontWeight: '900',
        color: '#94A3B8',
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    rateValueLight: {
        backgroundColor: '#F1F5F9',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#14B8A6',
    },
    rateTextLight: { fontSize: 10, fontWeight: '900', color: '#14B8A6' },
    sliderContainer: { marginBottom: 24 },
    sliderControls: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sliderLabel: {
        fontSize: 8,
        fontWeight: '900',
        color: 'rgba(255,255,255,0.4)',
        textTransform: 'uppercase',
    },
    sliderLabelLight: {
        fontSize: 8,
        fontWeight: '900',
        color: '#94A3B8',
        textTransform: 'uppercase',
    },
    presetButtons: { flexDirection: 'row', gap: 4 },
    presetBtn: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 8,
    },
    presetBtnText: { fontSize: 8, fontWeight: '900', color: 'rgba(255,255,255,0.6)' },
    maxBtn: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        backgroundColor: 'rgba(251,191,36,0.2)',
        borderRadius: 8,
    },
    maxBtnText: { fontSize: 8, fontWeight: '900', color: '#FBBF24' },
    presetBtnLight: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        backgroundColor: '#F8FAFC',
        borderRadius: 8,
    },
    presetBtnTextLight: { fontSize: 8, fontWeight: '900', color: '#94A3B8' },
    maxBtnLight: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        backgroundColor: 'rgba(20,184,166,0.1)',
        borderRadius: 8,
    },
    maxBtnTextLight: { fontSize: 8, fontWeight: '900', color: '#14B8A6' },
    slider: { width: '100%', height: 6 },
    sliderValue: { alignItems: 'center', marginTop: 12 },
    sliderValueNumber: {
        fontSize: 24,
        fontWeight: '900',
        fontFamily: 'monospace',
        color: '#FFFFFF',
    },
    sliderValueUnit: {
        fontSize: 8,
        fontWeight: '900',
        color: 'rgba(255,255,255,0.4)',
        textTransform: 'uppercase',
    },
    sliderValueNumberLight: {
        fontSize: 24,
        fontWeight: '900',
        fontFamily: 'monospace',
        color: '#1E293B',
    },
    sliderValueUnitLight: {
        fontSize: 8,
        fontWeight: '900',
        color: '#94A3B8',
        textTransform: 'uppercase',
    },
    resultCard: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 24,
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    resultLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    resultIconYellow: {
        padding: 8,
        backgroundColor: 'rgba(251,191,36,0.2)',
        borderRadius: 16,
    },
    resultLabel: {
        fontSize: 8,
        fontWeight: '900',
        color: 'rgba(255,255,255,0.4)',
        textTransform: 'uppercase',
    },
    resultValueYellow: {
        fontSize: 20,
        fontWeight: '900',
        fontFamily: 'monospace',
        color: '#FBBF24',
    },
    resultRight: { alignItems: 'flex-end' },
    resultFeeLabel: {
        fontSize: 8,
        fontWeight: '900',
        color: 'rgba(255,255,255,0.4)',
        textTransform: 'uppercase',
    },
    resultFeeValue: { fontSize: 10, fontWeight: '900', color: 'rgba(255,255,255,0.8)' },
    resultCardLight: {
        backgroundColor: '#F1F5F9',
        borderRadius: 24,
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    resultIconTeal: {
        padding: 8,
        backgroundColor: 'rgba(20,184,166,0.1)',
        borderRadius: 16,
    },
    resultLabelLight: {
        fontSize: 8,
        fontWeight: '900',
        color: '#94A3B8',
        textTransform: 'uppercase',
    },
    resultValueTeal: {
        fontSize: 20,
        fontWeight: '900',
        fontFamily: 'monospace',
        color: '#14B8A6',
    },
    resultFeeLabelLight: {
        fontSize: 8,
        fontWeight: '900',
        color: '#94A3B8',
        textTransform: 'uppercase',
    },
    resultFeeValueLight: { fontSize: 10, fontWeight: '900', color: '#475569' },
    confirmButton: {
        backgroundColor: '#FBBF24',
        borderRadius: 32,
        paddingVertical: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#1E293B',
        shadowColor: '#000',
        shadowOffset: { width: 3, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 0,
        elevation: 4,
    },
    confirmButtonTeal: {
        backgroundColor: '#14B8A6',
        borderRadius: 32,
        paddingVertical: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#1E293B',
        shadowColor: '#000',
        shadowOffset: { width: 3, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 0,
        elevation: 4,
    },
    confirmButtonDisabled: { opacity: 0.5 },
    confirmButtonText: {
        fontSize: 18,
        fontWeight: '900',
        fontStyle: 'italic',
        textTransform: 'uppercase',
        color: '#1E293B',
    },
    confirmButtonTextTeal: {
        fontSize: 18,
        fontWeight: '900',
        fontStyle: 'italic',
        textTransform: 'uppercase',
        color: '#1E293B',
    },
    gachaCard: {
        backgroundColor: '#8B5CF6',
        borderRadius: 40,
        padding: 24,
        marginBottom: 32,
        borderWidth: 2,
        borderColor: '#6D28D9',
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 0,
        elevation: 8,
        overflow: 'hidden',
    },
    gachaHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    gachaTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    gachaTitle: {
        fontSize: 28,
        fontWeight: '900',
        fontStyle: 'italic',
        textTransform: 'uppercase',
        color: '#FFFFFF',
    },
    infoButton: {
        padding: 8,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 16,
    },
    gachaSubtitle: {
        fontSize: 10,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 2,
        color: 'rgba(255,255,255,0.6)',
        marginBottom: 24,
    },
    gachaInfoPanel: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 24,
        padding: 16,
        marginBottom: 24,
        overflow: 'hidden',
    },
    gachaInfoTitle: {
        fontSize: 9,
        fontWeight: '900',
        color: '#FBBF24',
        textTransform: 'uppercase',
        marginBottom: 12,
    },
    dropRateRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    dropRateLabel: {
        fontSize: 10,
        fontWeight: '700',
        color: 'rgba(255,255,255,0.6)',
        textTransform: 'uppercase',
    },
    dropRateValue: { fontSize: 10, fontWeight: '900', color: '#FBBF24' },
    dropRateValueSilver: { fontSize: 10, fontWeight: '900', color: '#14B8A6' },
    dropRateValueExp: { fontSize: 10, fontWeight: '900', color: '#A855F7' },
    dropRateValueHp: { fontSize: 10, fontWeight: '900', color: '#EF4444' },
    gachaButton: {
        backgroundColor: '#FFFFFF',
        borderRadius: 32,
        paddingVertical: 24,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#1E293B',
        shadowColor: '#000',
        shadowOffset: { width: 3, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 0,
        elevation: 4,
        marginBottom: 16,
    },
    gachaButtonDisabled: { opacity: 0.5 },
    gachaButtonText: {
        fontSize: 18,
        fontWeight: '900',
        fontStyle: 'italic',
        textTransform: 'uppercase',
        color: '#1E293B',
    },
    gachaFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },
    avatarGroup: { flexDirection: 'row', gap: -8 },
    avatar: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderWidth: 2,
        borderColor: '#8B5CF6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: { fontSize: 8 },
    gachaFooterText: {
        fontSize: 8,
        fontWeight: '900',
        color: 'rgba(255,255,255,0.3)',
        textTransform: 'uppercase',
    },
});