import { BUILDINGS, ERAS_CONFIG, EVOLUTION_BRANCHES } from '@/core/constants';
import { CityState, Era, EvolutionBranch, PlacedBuilding, UserStats } from '@/core/types';
import { useColorScheme } from '@/hooks/use-color-scheme';
import * as Icons from 'lucide-react-native';
import {
    ArrowLeft,
    Check,
    CheckSquare,
    ChevronRight,
    Coins,
    GitBranch,
    Hammer,
    Info,
    Lock,
    Target,
    Trophy,
    X,
    Zap
} from 'lucide-react-native';
import React, { useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    useWindowDimensions,
    View,
} from 'react-native';

interface EvolutionTabProps {
    stats: UserStats;
    city: CityState;
    buildings: PlacedBuilding[];
    onBack: () => void;
    onUnlock: (branchId: string) => Promise<boolean>;
}

// ─── Palette helper (sama seperti StoreTab) ─────────────────────────────────
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
        // Borders
        border: isDark ? '#334155' : '#E2E8F0',
        borderMuted: isDark ? '#1E293B' : '#F1F5F9',
        borderActive: isDark ? '#14B8A6' : '#1E293B',
        // Text
        text: isDark ? '#F8FAFC' : '#1E293B',
        textMuted: isDark ? '#94A3B8' : '#64748B',
        textFaint: isDark ? 'rgba(248,250,252,0.4)' : 'rgba(30,41,59,0.4)',
        // Aksen
        accent: '#14B8A6',        // teal
        accentGold: '#FBBF24',
        // Komponen spesifik
        headerCardBg: isDark ? '#1E293B' : '#0F172A',   // header selalu gelap agar kontras
        headerCardBorder: isDark ? '#334155' : '#1E293B',
        eraButtonBg: isDark ? '#1E293B' : '#FFFFFF',
        eraButtonBorder: isDark ? '#334155' : '#E2E8F0',
        eraButtonLockedBg: isDark ? '#0F172A' : '#F1F5F9',
        branchCardBg: isDark ? '#0F172A' : '#F1F5F9',
        branchCardSelectedBg: '#14B8A6',
        detailCardBg: isDark ? '#0F172A' : '#1E293B',   // detail selalu gelap (seperti exchange card)
        detailCardBorder: isDark ? '#334155' : '#334155',
        modalBg: isDark ? '#1E293B' : '#FFFFFF',
        modalBorder: isDark ? '#334155' : '#E2E8F0',
    };
}

export default function EvolutionTab({ stats, city, buildings, onBack, onUnlock }: EvolutionTabProps) {
    const palette = usePalette();
    const { width: screenWidth } = useWindowDimensions();

    const [selectedEra, setSelectedEra] = useState<Era | null>(null);
    const [selectedBranch, setSelectedBranch] = useState<EvolutionBranch | null>(null);
    const [isUnlocking, setIsUnlocking] = useState(false);
    const slideAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    const currentEraIndex = ERAS_CONFIG.findIndex(e => e.id === city.currentEra);

    const handleUnlock = async () => {
        if (!selectedBranch) return;
        setIsUnlocking(true);
        const success = await onUnlock(selectedBranch.id);
        setIsUnlocking(false);
        if (success) {
            closeModal();
        }
    };

    const openModal = (era: Era) => {
        setSelectedEra(era);
        setSelectedBranch(null);
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
            Animated.spring(slideAnim, { toValue: 1, friction: 8, tension: 40, useNativeDriver: true }),
        ]).start();
    };

    const closeModal = () => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
        ]).start(() => {
            setSelectedEra(null);
            setSelectedBranch(null);
        });
    };

    // Helper untuk mengecek requirement building sesuai count di constants.
    const checkBuildingRequirement = (target: string, requiredCount = 1): boolean => {
        const count = buildings.filter(b => b.buildingTypeId === target).length;
        return count >= requiredCount;
    };

    const getBuildingCount = (target: string) => {
        return buildings.filter(b => b.buildingTypeId === target).length;
    };

    const isRequirementMet = (req: EvolutionBranch['requirements'][number]) => {
        if (req.type === 'level') {
            return stats.level >= (req.target as number);
        }
        if (req.type === 'buildings') {
            return checkBuildingRequirement(req.target as string, req.count ?? 1);
        }
        if (req.type === 'silver') {
            return stats.silver >= (req.target as number);
        }
        if (req.type === 'gold') {
            return stats.gold >= (req.target as number);
        }
        return true;
    };

    const renderRequirementCard = (req: EvolutionBranch['requirements'][number], idx: number) => {
        const isMet = isRequirementMet(req);

        if (req.type === 'buildings') {
            const target = req.target as string;
            const buildingType = BUILDINGS.find(building => building.id === target);
            const ownedCount = getBuildingCount(target);
            const requiredCount = req.count ?? 1;
            const Icon = buildingType ? (Icons as any)[buildingType.iconName] || Icons.HelpCircle : Hammer;

            return (
                <View
                    key={idx}
                    style={[
                        styles.requirementBuildingCard,
                        {
                            backgroundColor: isMet ? palette.accent + '22' : palette.cardAlt,
                            borderColor: isMet ? palette.accent : palette.border,
                        },
                    ]}
                >
                    <View style={[styles.requirementBuildingIcon, { backgroundColor: palette.card, borderColor: palette.border }]}>
                        <Icon size={28} color={isMet ? palette.accent : palette.text} />
                    </View>
                    <View style={styles.requirementBuildingBody}>
                        <View style={styles.requirementTitleRow}>
                            <Text style={[styles.requirementBuildingName, { color: palette.text }]} numberOfLines={1}>
                                {buildingType?.name || req.description}
                            </Text>
                            {isMet ? <Check size={16} color={palette.accent} /> : <Lock size={14} color={palette.textMuted} />}
                        </View>
                        <Text style={[styles.requirementBuildingMeta, { color: palette.textMuted }]}>
                            {buildingType ? buildingType.category : 'building'} requirement
                        </Text>
                        {buildingType && (
                            <View style={styles.requirementStatsRow}>
                                {buildingType.housing > 0 && <Text style={[styles.statBadge, { backgroundColor: palette.card, color: palette.text }]}>H {buildingType.housing}</Text>}
                                {buildingType.foodProduction > 0 && <Text style={[styles.statBadge, { backgroundColor: palette.card, color: palette.text }]}>F {buildingType.foodProduction}</Text>}
                                {buildingType.silverIncome > 0 && <Text style={[styles.statBadge, { backgroundColor: palette.card, color: palette.text }]}>S {buildingType.silverIncome}</Text>}
                            </View>
                        )}
                        <View style={styles.requirementProgressBar}>
                            <View
                                style={[
                                    styles.requirementProgressFill,
                                    {
                                        width: `${Math.min(100, (ownedCount / requiredCount) * 100)}%`,
                                        backgroundColor: isMet ? palette.accent : palette.accentGold,
                                    },
                                ]}
                            />
                        </View>
                        <Text style={[styles.requirementProgressText, { color: isMet ? palette.accent : palette.textMuted }]}>
                            Owned {Math.min(ownedCount, requiredCount)} / {requiredCount}
                        </Text>
                    </View>
                </View>
            );
        }

        const currentValue = req.type === 'level'
            ? stats.level
            : req.type === 'silver'
                ? stats.silver
                : req.type === 'gold'
                    ? stats.gold
                    : 0;
        const targetValue = typeof req.target === 'number' ? req.target : 1;
        const Icon = req.type === 'level' ? Trophy : req.type === 'silver' || req.type === 'gold' ? Coins : Target;

        return (
            <View
                key={idx}
                style={[
                    styles.requirementRow,
                    {
                        backgroundColor: isMet ? palette.accent + '22' : palette.cardAlt,
                        borderColor: isMet ? palette.accent : palette.border,
                    },
                ]}
            >
                <View style={styles.requirementLevelLeft}>
                    <View style={[styles.requirementMiniIcon, { backgroundColor: palette.card, borderColor: palette.border }]}>
                        <Icon size={16} color={isMet ? palette.accent : palette.textMuted} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.requirementText, { color: palette.text }]}>{req.description}</Text>
                        <Text style={[styles.requirementProgressText, { color: isMet ? palette.accent : palette.textMuted }]}>
                            Current {Math.min(currentValue, targetValue)} / {targetValue}
                        </Text>
                    </View>
                </View>
                {isMet ? <Check size={16} color={palette.accent} /> : <Lock size={12} color={palette.textMuted} />}
            </View>
        );
    };

    const renderEraBuildingUnlocks = (era: Era) => {
        const eraBuildings = BUILDINGS.filter(building => building.era === era);
        if (eraBuildings.length === 0) return null;

        return (
            <View style={styles.constructionPreviewSection}>
                <View style={styles.sectionHeader}>
                    <Hammer size={16} color={palette.accent} />
                    <Text style={[styles.benefitsLabel, { color: palette.accent }]}>Construction Unlocks</Text>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.constructionPreviewRow}>
                        {eraBuildings.map(building => {
                            const Icon = (Icons as any)[building.iconName] || Icons.HelpCircle;
                            const isAvailable = stats.level >= (ERAS_CONFIG.find(item => item.id === building.era)?.minLevel || 0);

                            return (
                                <View
                                    key={building.id}
                                    style={[
                                        styles.previewBuildingCard,
                                        {
                                            width: screenWidth > 380 ? 156 : 136,
                                            backgroundColor: palette.card,
                                            borderColor: isAvailable ? palette.accent : palette.border,
                                            opacity: isAvailable ? 1 : 0.65,
                                        },
                                    ]}
                                >
                                    <View style={[styles.previewBuildingIcon, { backgroundColor: palette.cardAlt, borderColor: palette.border }]}>
                                        <Icon size={screenWidth > 380 ? 30 : 26} color={isAvailable ? palette.text : palette.textMuted} />
                                    </View>
                                    <Text style={[styles.previewBuildingName, { color: palette.text }]} numberOfLines={1}>{building.name}</Text>
                                    <Text style={[styles.previewBuildingCategory, { color: palette.textMuted }]}>{building.category}</Text>
                                    <View style={styles.requirementStatsRow}>
                                        {building.housing > 0 && <Text style={[styles.statBadge, { backgroundColor: palette.cardAlt, color: palette.text }]}>H {building.housing}</Text>}
                                        {building.foodProduction > 0 && <Text style={[styles.statBadge, { backgroundColor: palette.cardAlt, color: palette.text }]}>F {building.foodProduction}</Text>}
                                        {building.silverIncome > 0 && <Text style={[styles.statBadge, { backgroundColor: palette.cardAlt, color: palette.text }]}>S {building.silverIncome}</Text>}
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                </ScrollView>
            </View>
        );
    };

    const renderEraTimeline = () => {
        return (
            <View style={styles.timelineContainer}>
                {ERAS_CONFIG.map((era, index) => {
                    const isUnlocked = stats.level >= era.minLevel;
                    const isCurrent = city.currentEra === era.id;
                    const isPast = index < currentEraIndex;

                    return (
                        <View key={era.id} style={styles.eraItem}>
                            {index !== ERAS_CONFIG.length - 1 && (
                                <View style={[styles.eraConnector, { backgroundColor: palette.border }, isPast && { backgroundColor: palette.accent }]} />
                            )}
                            <TouchableOpacity
                                style={[
                                    styles.eraButton,
                                    { backgroundColor: palette.eraButtonBg, borderColor: palette.eraButtonBorder },
                                    !isUnlocked && { backgroundColor: palette.eraButtonLockedBg, opacity: 0.7 },
                                    isCurrent && { borderColor: palette.accent, shadowColor: palette.accent },
                                ]}
                                onPress={() => openModal(era.id)}
                                activeOpacity={0.8}
                            >
                                <View style={[styles.eraIcon, isCurrent && { backgroundColor: palette.accent, borderColor: palette.border }]}>
                                    {isUnlocked ? (
                                        isCurrent ? (
                                            <Text style={styles.eraIconText}>✨</Text>
                                        ) : (
                                            <Text style={[styles.eraIconNumber, { color: palette.text }]}>{index + 1}</Text>
                                        )
                                    ) : (
                                        <Lock size={20} color={palette.textMuted} />
                                    )}
                                </View>
                                <View style={styles.eraInfo}>
                                    <View style={styles.eraTitleRow}>
                                        <Text style={[styles.eraName, { color: !isUnlocked ? palette.textMuted : palette.text }]}>
                                            {era.name}
                                        </Text>
                                        {isCurrent && (
                                            <View style={[styles.currentBadge, { backgroundColor: palette.accent }]}>
                                                <Text style={styles.currentBadgeText}>Active</Text>
                                            </View>
                                        )}
                                    </View>
                                    <Text style={[styles.eraSubtext, { color: palette.textMuted }]}>
                                        {isUnlocked ? 'Unlocked' : `Requires Level ${era.minLevel}`}
                                    </Text>
                                </View>
                                <ChevronRight size={20} color={isUnlocked ? palette.text : palette.textMuted} />
                            </TouchableOpacity>
                        </View>
                    );
                })}
            </View>
        );
    };

    const renderModal = () => {
        const eraData = ERAS_CONFIG.find(e => e.id === selectedEra);
        if (!selectedEra || !eraData) return null;

        const branches = EVOLUTION_BRANCHES.filter(b => b.era === selectedEra);
        const selectedBranchData = selectedBranch;

        return (
            <Modal transparent visible={selectedEra !== null} animationType="none" onRequestClose={closeModal}>
                <Animated.View style={[styles.modalOverlay, { opacity: fadeAnim }]}>
                    <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={closeModal} />
                    <Animated.View
                        style={[
                            styles.modalContent,
                            {
                                backgroundColor: palette.modalBg,
                                borderColor: palette.modalBorder,
                                transform: [{
                                    translateY: slideAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [Dimensions.get('window').height, 0],
                                    }),
                                }],
                            },
                        ]}
                    >
                        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScroll}>
                            <View style={styles.modalHeader}>
                                <View>
                                    <Text style={[styles.modalTitle, { color: palette.text }]}>{eraData.name}</Text>
                                    <Text style={[styles.modalSubtitle, { color: palette.textMuted }]}>Cultural Branches</Text>
                                </View>
                                <TouchableOpacity style={[styles.closeButton, { backgroundColor: palette.cardAlt, borderColor: palette.border }]} onPress={closeModal}>
                                    <X size={24} color={palette.text} />
                                </TouchableOpacity>
                            </View>

                            <Text style={[styles.modalQuote, { color: palette.textMuted }]}>{eraData.description}</Text>

                            {renderEraBuildingUnlocks(selectedEra)}

                            <View style={styles.branchesSection}>
                                <Text style={[styles.sectionLabel, { color: palette.textFaint }]}>Available Evolution Paths</Text>
                                <View style={styles.branchesGrid}>
                                    {branches.map(branch => {
                                        const Icon = (Icons as any)[branch.iconName] || Icons.Circle;
                                        const isBranchUnlocked = city.unlockedEvolutions?.includes(branch.id);
                                        const requiredLevel = branch.requirements.find(req => req.type === 'level')?.target as number | undefined;
                                        const canStartBranch = branch.requirements.every(isRequirementMet);
                                        return (
                                            <TouchableOpacity
                                                key={branch.id}
                                                style={[
                                                    styles.branchCard,
                                                    { backgroundColor: palette.branchCardBg, borderColor: 'transparent' },
                                                    selectedBranch?.id === branch.id && { backgroundColor: palette.branchCardSelectedBg, borderColor: palette.borderActive },
                                                    isBranchUnlocked && { backgroundColor: palette.accent + '33', borderColor: palette.accent }, // 20% opacity
                                                    !isBranchUnlocked && !canStartBranch && { borderColor: palette.border },
                                                ]}
                                                onPress={() => setSelectedBranch(branch)}
                                            >
                                                {isBranchUnlocked && (
                                                    <View style={[styles.unlockedBadge, { backgroundColor: palette.accent }]}>
                                                        <Check size={12} color="#FFFFFF" />
                                                    </View>
                                                )}
                                                <View style={[styles.branchIcon, { backgroundColor: palette.card, borderColor: palette.border }]}>
                                                    <Icon size={32} color={palette.text} />
                                                </View>
                                                <Text style={[styles.branchName, { color: palette.text }]}>{branch.name}</Text>
                                                <View style={[styles.branchLevelBadge, { backgroundColor: canStartBranch ? palette.accent + '22' : palette.card, borderColor: canStartBranch ? palette.accent : palette.border }]}>
                                                    {canStartBranch ? (
                                                        <Check size={10} color={palette.accent} />
                                                    ) : (
                                                        <Lock size={10} color={palette.textMuted} />
                                                    )}
                                                    <Text style={[styles.branchLevelText, { color: canStartBranch ? palette.accent : palette.textMuted }]}>
                                                        Level {requiredLevel || eraData.minLevel}
                                                    </Text>
                                                </View>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            </View>

                            {selectedBranchData && (
                                <View style={[styles.detailCard, { backgroundColor: palette.detailCardBg, borderColor: palette.detailCardBorder }]}>
                                    <View style={styles.detailHeader}>
                                        <View style={styles.detailTitleRow}>
                                            <View style={[styles.detailIcon, { backgroundColor: palette.accent }]}>
                                                <Target size={20} color="#1E293B" />
                                            </View>
                                            <View>
                                                    <Text style={[styles.detailName, { color: palette.accent }]}>{selectedBranchData.name}</Text>
                                                    <Text style={[styles.detailSub, { color: palette.textFaint }]}>Detail & Requirements</Text>
                                            </View>
                                        </View>
                                        {city.unlockedEvolutions?.includes(selectedBranchData.id) && (
                                            <View style={[styles.unlockBadge, { backgroundColor: palette.accent }]}>
                                                <Text style={styles.unlockBadgeText}>Unlocked</Text>
                                            </View>
                                        )}
                                    </View>

                                    <Text style={[styles.detailDesc, { color: palette.textMuted }]}>{selectedBranchData.description}</Text>

                                    <View style={styles.requirementsSection}>
                                        <View style={styles.sectionHeader}>
                                            <CheckSquare size={16} color={palette.accentGold} />
                                            <Text style={[styles.requirementsLabel, { color: palette.accentGold }]}>Unlock Requirements</Text>
                                        </View>
                                        {selectedBranchData.requirements.map(renderRequirementCard)}
                                    </View>

                                    <View style={styles.benefitsSection}>
                                        <View style={styles.sectionHeader}>
                                            <Zap size={16} color={palette.accent} />
                                            <Text style={[styles.benefitsLabel, { color: palette.accent }]}>Cultural Benefits</Text>
                                        </View>
                                        {selectedBranchData.benefits.map((benefit, idx) => (
                                            <View key={idx} style={styles.benefitRow}>
                                                <View style={[styles.benefitDot, { backgroundColor: palette.accent }]} />
                                                <Text style={[styles.benefitText, { color: palette.textMuted }]}>{benefit}</Text>
                                            </View>
                                        ))}
                                    </View>

                                    {!city.unlockedEvolutions?.includes(selectedBranchData.id) && (
                                        <TouchableOpacity
                                            style={[
                                                styles.unlockButton,
                                                { backgroundColor: palette.accent },
                                                (isUnlocking || !selectedBranchData.requirements.every(isRequirementMet)) && styles.unlockButtonDisabled,
                                            ]}
                                            disabled={isUnlocking || !selectedBranchData.requirements.every(isRequirementMet)}
                                            onPress={handleUnlock}
                                        >
                                            {isUnlocking ? (
                                                <ActivityIndicator size="small" color="#1E293B" />
                                            ) : (
                                                <>
                                                    <Zap size={16} color="#1E293B" />
                                                    <Text style={styles.unlockButtonText}>Start Evolution</Text>
                                                </>
                                            )}
                                        </TouchableOpacity>
                                    )}
                                </View>
                            )}
                        </ScrollView>
                    </Animated.View>
                </Animated.View>
            </Modal>
        );
    };

    return (
        <ScrollView style={[styles.container, { backgroundColor: palette.bg }]} showsVerticalScrollIndicator={false}>
            <TouchableOpacity style={styles.backButton} onPress={onBack}>
                <ArrowLeft size={16} color={palette.text} />
                <Text style={[styles.backButtonText, { color: palette.text }]}>Back to City</Text>
            </TouchableOpacity>

            <View style={[styles.headerCard, { backgroundColor: palette.headerCardBg, borderColor: palette.headerCardBorder }]}>
                <View style={styles.headerBackground}>
                    <GitBranch size={128} color="rgba(255,255,255,0.1)" />
                </View>
                <Text style={styles.headerTitle}>Evolution Tree</Text>
                <Text style={[styles.headerSubtitle, { color: palette.accentGold }]}>Shape the future of your civilization</Text>
                <View style={[styles.infoBox, { borderColor: palette.border, backgroundColor: 'rgba(255,255,255,0.1)' }]}>
                    <Info size={20} color={palette.accent} />
                        <Text style={[styles.infoText, { color: '#FFFFFF' }]}>
                        Select an era to view available technology paths and cultural branches.
                    </Text>
                </View>
            </View>

            {renderEraTimeline()}
            {renderModal()}
        </ScrollView>
    );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 12,
        paddingHorizontal: 16,
        paddingBottom: 80,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
        alignSelf: 'flex-start',
    },
    backButtonText: {
        fontSize: 10,
        fontWeight: '900',
        fontStyle: 'italic',
        textTransform: 'uppercase',
    },
    headerCard: {
        borderRadius: 40,
        padding: 24,
        marginBottom: 24,
        borderWidth: 2,
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 0,
        elevation: 8,
        overflow: 'hidden',
    },
    headerBackground: {
        position: 'absolute',
        top: 16,
        right: 16,
        opacity: 0.1,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '900',
        fontStyle: 'italic',
        textTransform: 'uppercase',
        color: '#FFFFFF',
        marginBottom: 8,
    },
    headerSubtitle: {
        fontSize: 10,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 3,
        marginBottom: 24,
    },
    infoBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 16,
        borderRadius: 24,
        borderWidth: 1,
    },
    infoText: {
        flex: 1,
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    timelineContainer: {
        marginBottom: 24,
    },
    eraItem: {
        position: 'relative',
        marginBottom: 16,
    },
    eraConnector: {
        position: 'absolute',
        left: 32,
        top: 64,
        width: 4,
        height: 48,
        zIndex: 0,
    },
    eraButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        borderRadius: 32,
        borderWidth: 2,
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 0,
        elevation: 2,
        marginLeft: 16,
    },
    eraIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    eraIconText: {
        fontSize: 20,
    },
    eraIconNumber: {
        fontSize: 18,
        fontWeight: '900',
    },
    eraInfo: {
        flex: 1,
    },
    eraTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    eraName: {
        fontSize: 16,
        fontWeight: '900',
        textTransform: 'uppercase',
        fontStyle: 'italic',
    },
    currentBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 16,
    },
    currentBadgeText: {
        fontSize: 8,
        fontWeight: '900',
        color: '#1E293B',
        textTransform: 'uppercase',
    },
    eraSubtext: {
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
        marginTop: 2,
    },
    modalOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalBackdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    modalContent: {
        borderTopLeftRadius: 48,
        borderTopRightRadius: 48,
        borderWidth: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 20,
        maxHeight: height * 0.9,
    },
    modalScroll: {
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 24,
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 28,
        fontWeight: '900',
        fontStyle: 'italic',
        textTransform: 'uppercase',
    },
    modalSubtitle: {
        fontSize: 10,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 3,
    },
    closeButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
    },
    modalQuote: {
        fontSize: 14,
        fontWeight: '700',
        fontStyle: 'italic',
        marginBottom: 24,
    },
    branchesSection: {
        marginBottom: 24,
    },
    sectionLabel: {
        fontSize: 10,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 2,
        marginBottom: 12,
    },
    branchesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 12,
    },
    branchCard: {
        width: (width - 72) / 2,
        borderRadius: 32,
        padding: 20,
        alignItems: 'center',
        borderWidth: 2,
        marginBottom: 12,
        position: 'relative',
    },
    unlockedBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    branchIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        marginBottom: 12,
    },
    branchName: {
        fontSize: 10,
        fontWeight: '900',
        textTransform: 'uppercase',
        fontStyle: 'italic',
        textAlign: 'center',
    },
    branchLevelBadge: {
        marginTop: 10,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 14,
        borderWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    branchLevelText: {
        fontSize: 8,
        fontWeight: '900',
        textTransform: 'uppercase',
    },
    detailCard: {
        borderRadius: 32,
        padding: 20,
        marginTop: 8,
        marginBottom: 24,
        borderWidth: 2,
    },
    detailHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    detailTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    detailIcon: {
        width: 40,
        height: 40,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    detailName: {
        fontSize: 14,
        fontWeight: '900',
        textTransform: 'uppercase',
        fontStyle: 'italic',
    },
    detailSub: {
        fontSize: 8,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    unlockBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 24,
    },
    unlockBadgeText: {
        fontSize: 8,
        fontWeight: '900',
        color: '#1E293B',
        textTransform: 'uppercase',
    },
    detailDesc: {
        fontSize: 12,
        fontWeight: '700',
        fontStyle: 'italic',
        marginBottom: 20,
    },
    requirementsSection: {
        marginBottom: 20,
    },
    constructionPreviewSection: {
        marginBottom: 24,
    },
    constructionPreviewRow: {
        flexDirection: 'row',
        gap: 16,
        paddingBottom: 4,
    },
    previewBuildingCard: {
        padding: 16,
        borderRadius: 32,
        borderWidth: 2,
        alignItems: 'center',
    },
    previewBuildingIcon: {
        width: 60,
        height: 60,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
        borderWidth: 1,
    },
    previewBuildingName: {
        fontSize: 11,
        fontWeight: '900',
        textTransform: 'uppercase',
        marginVertical: 4,
        textAlign: 'center',
    },
    previewBuildingCategory: {
        fontSize: 8,
        fontWeight: '700',
        textTransform: 'uppercase',
        marginBottom: 8,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    requirementsLabel: {
        fontSize: 10,
        fontWeight: '900',
        textTransform: 'uppercase',
    },
    requirementRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 8,
    },
    requirementLevelLeft: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginRight: 8,
    },
    requirementMiniIcon: {
        width: 32,
        height: 32,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
    },
    requirementBuildingCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 24,
        borderWidth: 1,
        marginBottom: 10,
        gap: 12,
    },
    requirementBuildingIcon: {
        width: 56,
        height: 56,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
    },
    requirementBuildingBody: {
        flex: 1,
    },
    requirementTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
    },
    requirementBuildingName: {
        flex: 1,
        fontSize: 12,
        fontWeight: '900',
        textTransform: 'uppercase',
    },
    requirementBuildingMeta: {
        fontSize: 8,
        fontWeight: '700',
        textTransform: 'uppercase',
        marginTop: 2,
        marginBottom: 8,
    },
    requirementStatsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 4,
        marginBottom: 8,
    },
    requirementProgressBar: {
        height: 4,
        borderRadius: 4,
        backgroundColor: 'rgba(0,0,0,0.1)',
        overflow: 'hidden',
    },
    requirementProgressFill: {
        height: '100%',
    },
    requirementProgressText: {
        fontSize: 9,
        fontWeight: '800',
        textTransform: 'uppercase',
        marginTop: 6,
    },
    requirementText: {
        fontSize: 10,
        fontWeight: '700',
    },
    statBadge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 12,
        fontSize: 8,
        fontWeight: '800',
        overflow: 'hidden',
    },
    benefitsSection: {
        marginBottom: 24,
    },
    benefitsLabel: {
        fontSize: 10,
        fontWeight: '900',
        textTransform: 'uppercase',
    },
    benefitRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    benefitDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    benefitText: {
        fontSize: 9,
        fontWeight: '700',
    },
    unlockButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 16,
        borderRadius: 24,
        borderWidth: 2,
        borderColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 0.2,
        elevation: 6,
    },
    unlockButtonDisabled: {
        opacity: 0.5,
    },
    unlockButtonText: {
        fontSize: 14,
        fontWeight: '900',
        fontStyle: 'italic',
        textTransform: 'uppercase',
        color: '#1E293B',
    },
});
