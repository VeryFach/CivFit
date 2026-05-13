import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    Modal,
    StyleSheet,
    Dimensions,
    Animated,
    ActivityIndicator,
} from 'react-native';
import { UserStats, CityState, Era, EvolutionBranch } from '@/core/types';
import { ERAS_CONFIG, EVOLUTION_BRANCHES } from '@/core/constants';
import * as Icons from 'lucide-react-native';
import {
    ChevronRight,
    Target,
    Zap,
    Lock,
    Info,
    ArrowLeft,
    GitBranch,
    X,
    Check,
    CheckSquare,
    Loader2,
} from 'lucide-react-native';

interface EvolutionTabProps {
    stats: UserStats;
    city: CityState;
    onBack: () => void;
    onUnlock: (branchId: string) => Promise<boolean>;
}

export default function EvolutionTab({ stats, city, onBack, onUnlock }: EvolutionTabProps) {
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

    // Untuk progress bar connect antar era (opsional, di web ada garis)
    // Tidak diimplementasikan karena terlalu kompleks di RN, garis bisa diabaikan atau pakai absolute positioning sederhana

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
                                <View style={[styles.eraConnector, isPast && styles.eraConnectorActive]} />
                            )}
                            <TouchableOpacity
                                style={[
                                    styles.eraButton,
                                    isUnlocked ? styles.eraButtonUnlocked : styles.eraButtonLocked,
                                    isCurrent && styles.eraButtonCurrent,
                                ]}
                                onPress={() => openModal(era.id)}
                                activeOpacity={0.8}
                            >
                                <View style={[styles.eraIcon, isCurrent && styles.eraIconCurrent]}>
                                    {isUnlocked ? (
                                        isCurrent ? (
                                            <Text style={styles.eraIconText}>✨</Text>
                                        ) : (
                                            <Text style={styles.eraIconNumber}>{index + 1}</Text>
                                        )
                                    ) : (
                                        <Lock size={20} color="#94A3B8" />
                                    )}
                                </View>
                                <View style={styles.eraInfo}>
                                    <View style={styles.eraTitleRow}>
                                        <Text style={[styles.eraName, !isUnlocked && styles.eraNameLocked]}>
                                            {era.name}
                                        </Text>
                                        {isCurrent && (
                                            <View style={styles.currentBadge}>
                                                <Text style={styles.currentBadgeText}>Aktif</Text>
                                            </View>
                                        )}
                                    </View>
                                    <Text style={styles.eraSubtext}>
                                        {isUnlocked ? 'Terbuka' : `Butuh Level ${era.minLevel}`}
                                    </Text>
                                </View>
                                <ChevronRight size={20} color={isUnlocked ? '#1E293B' : '#CBD5E1'} />
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
                                    <Text style={styles.modalTitle}>{eraData.name}</Text>
                                    <Text style={styles.modalSubtitle}>Cabang Peradaban</Text>
                                </View>
                                <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                                    <X size={24} color="#1E293B" />
                                </TouchableOpacity>
                            </View>

                            <Text style={styles.modalQuote}>"{eraData.description}"</Text>

                            <View style={styles.branchesSection}>
                                <Text style={styles.sectionLabel}>Jalur Evolusi Tersedia</Text>
                                <View style={styles.branchesGrid}>
                                    {branches.map(branch => {
                                        const Icon = (Icons as any)[branch.iconName] || Icons.Circle;
                                        const isBranchUnlocked = city.unlockedEvolutions?.includes(branch.id);
                                        return (
                                            <TouchableOpacity
                                                key={branch.id}
                                                style={[
                                                    styles.branchCard,
                                                    selectedBranch?.id === branch.id && styles.branchCardSelected,
                                                    isBranchUnlocked && styles.branchCardUnlocked,
                                                ]}
                                                onPress={() => setSelectedBranch(branch)}
                                            >
                                                {isBranchUnlocked && (
                                                    <View style={styles.unlockedBadge}>
                                                        <Check size={12} color="#FFFFFF" />
                                                    </View>
                                                )}
                                                <View style={styles.branchIcon}>
                                                    <Icon size={32} color="#1E293B" />
                                                </View>
                                                <Text style={styles.branchName}>{branch.name}</Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            </View>

                            {selectedBranchData && (
                                <View style={styles.detailCard}>
                                    <View style={styles.detailHeader}>
                                        <View style={styles.detailTitleRow}>
                                            <View style={styles.detailIcon}>
                                                <Target size={20} color="#1E293B" />
                                            </View>
                                            <View>
                                                <Text style={styles.detailName}>{selectedBranchData.name}</Text>
                                                <Text style={styles.detailSub}>Detail & Requirements</Text>
                                            </View>
                                        </View>
                                        {city.unlockedEvolutions?.includes(selectedBranchData.id) && (
                                            <View style={styles.unlockBadge}>
                                                <Text style={styles.unlockBadgeText}>Unlocked</Text>
                                            </View>
                                        )}
                                    </View>

                                    <Text style={styles.detailDesc}>"{selectedBranchData.description}"</Text>

                                    <View style={styles.requirementsSection}>
                                        <View style={styles.sectionHeader}>
                                            <CheckSquare size={16} color="#FBBF24" />
                                            <Text style={styles.requirementsLabel}>Syarat Pembukaan</Text>
                                        </View>
                                        {selectedBranchData.requirements.map((req, idx) => {
                                            let isMet = false;
                                            if (req.type === 'level') {
                                                isMet = stats.level >= (req.target as number);
                                            } else if (req.type === 'buildings') {
                                                const target = req.target as string;
                                                const count = city.buildings.filter(b => b.buildingTypeId === target).length;
                                                const required = typeof req.target === 'string' ? 2 : (req.target as number);
                                                isMet = count >= required;
                                            }
                                            return (
                                                <View key={idx} style={styles.requirementRow}>
                                                    <Text style={styles.requirementText}>{req.description}</Text>
                                                    {isMet ? (
                                                        <Check size={16} color="#14B8A6" />
                                                    ) : (
                                                        <Lock size={12} color="rgba(255,255,255,0.2)" />
                                                    )}
                                                </View>
                                            );
                                        })}
                                    </View>

                                    <View style={styles.benefitsSection}>
                                        <View style={styles.sectionHeader}>
                                            <Zap size={16} color="#14B8A6" />
                                            <Text style={styles.benefitsLabel}>Keuntungan Budaya</Text>
                                        </View>
                                        {selectedBranchData.benefits.map((benefit, idx) => (
                                            <View key={idx} style={styles.benefitRow}>
                                                <View style={styles.benefitDot} />
                                                <Text style={styles.benefitText}>{benefit}</Text>
                                            </View>
                                        ))}
                                    </View>

                                    {!city.unlockedEvolutions?.includes(selectedBranchData.id) && (
                                        <TouchableOpacity
                                            style={[
                                                styles.unlockButton,
                                                (isUnlocking || !selectedBranchData.requirements.every(req => {
                                                    if (req.type === 'level') return stats.level >= (req.target as number);
                                                    if (req.type === 'buildings') {
                                                        const target = req.target as string;
                                                        const count = city.buildings.filter(b => b.buildingTypeId === target).length;
                                                        return count >= 2;
                                                    }
                                                    return true;
                                                })) && styles.unlockButtonDisabled,
                                            ]}
                                            disabled={isUnlocking}
                                            onPress={handleUnlock}
                                        >
                                            {isUnlocking ? (
                                                <ActivityIndicator size="small" color="#1E293B" />
                                            ) : (
                                                <>
                                                    <Zap size={16} color="#1E293B" />
                                                    <Text style={styles.unlockButtonText}>Mulai Evolusi</Text>
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
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <TouchableOpacity style={styles.backButton} onPress={onBack}>
                <ArrowLeft size={16} color="#1E293B" />
                <Text style={styles.backButtonText}>Kembali ke Kota</Text>
            </TouchableOpacity>

            <View style={styles.headerCard}>
                <View style={styles.headerBackground}>
                    <GitBranch size={128} color="rgba(255,255,255,0.1)" />
                </View>
                <Text style={styles.headerTitle}>Pohon Evolusi</Text>
                <Text style={styles.headerSubtitle}>Tentukan masa depan peradabanmu</Text>
                <View style={styles.infoBox}>
                    <Info size={20} color="#14B8A6" />
                    <Text style={styles.infoText}>
                        Pilihlah era untuk melihat jalur teknologi dan cabang kebudayaan yang tersedia.
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
        backgroundColor: '#F8FAFC',
        paddingHorizontal: 16,
        paddingTop: 16,
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
        color: '#1E293B',
    },
    headerCard: {
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
        color: '#FBBF24',
        marginBottom: 24,
    },
    infoBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: 'rgba(255,255,255,0.1)',
        padding: 16,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#334155',
    },
    infoText: {
        flex: 1,
        fontSize: 10,
        fontWeight: '700',
        color: '#FFFFFF',
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
        backgroundColor: '#E2E8F0',
        zIndex: 0,
    },
    eraConnectorActive: {
        backgroundColor: '#14B8A6',
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
    eraButtonUnlocked: {
        backgroundColor: '#FFFFFF',
        borderColor: '#E2E8F0',
    },
    eraButtonLocked: {
        backgroundColor: '#F1F5F9',
        borderColor: '#E2E8F0',
        opacity: 0.7,
    },
    eraButtonCurrent: {
        borderColor: '#14B8A6',
        shadowColor: '#14B8A6',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        elevation: 4,
    },
    eraIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#CBD5E1',
        backgroundColor: '#F1F5F9',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    eraIconCurrent: {
        backgroundColor: '#14B8A6',
        borderColor: '#0F172A',
    },
    eraIconText: {
        fontSize: 20,
    },
    eraIconNumber: {
        fontSize: 18,
        fontWeight: '900',
        color: '#1E293B',
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
        color: '#1E293B',
    },
    eraNameLocked: {
        color: '#94A3B8',
    },
    currentBadge: {
        backgroundColor: '#14B8A6',
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
        color: '#94A3B8',
        textTransform: 'uppercase',
        marginTop: 2,
    },
    // Modal styles
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
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 48,
        borderTopRightRadius: 48,
        borderWidth: 2,
        borderColor: '#E2E8F0',
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
        color: '#1E293B',
    },
    modalSubtitle: {
        fontSize: 10,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 3,
        color: '#94A3B8',
    },
    closeButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#F1F5F9',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#CBD5E1',
    },
    modalQuote: {
        fontSize: 14,
        fontWeight: '700',
        fontStyle: 'italic',
        color: '#64748B',
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
        color: '#1E293B',
        opacity: 0.4,
        marginBottom: 12,
    },
    branchesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 12,
    },
    branchCard: {
        width: (width - 72) / 2, // 2 columns with padding
        backgroundColor: '#F1F5F9',
        borderRadius: 32,
        padding: 20,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
        marginBottom: 12,
    },
    branchCardSelected: {
        backgroundColor: '#14B8A6',
        borderColor: '#1E293B',
        shadowColor: '#000',
        shadowOffset: { width: 3, height: 3 },
        shadowOpacity: 0.2,
        elevation: 4,
    },
    branchCardUnlocked: {
        backgroundColor: 'rgba(20,184,166,0.2)',
        borderColor: '#14B8A6',
    },
    unlockedBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: '#14B8A6',
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
        backgroundColor: '#FFFFFF',
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#CBD5E1',
        marginBottom: 12,
    },
    branchName: {
        fontSize: 10,
        fontWeight: '900',
        textTransform: 'uppercase',
        fontStyle: 'italic',
        textAlign: 'center',
        color: '#1E293B',
    },
    detailCard: {
        backgroundColor: '#1E293B',
        borderRadius: 32,
        padding: 20,
        marginTop: 8,
        marginBottom: 24,
        borderWidth: 2,
        borderColor: '#334155',
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
        backgroundColor: '#14B8A6',
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    detailName: {
        fontSize: 14,
        fontWeight: '900',
        textTransform: 'uppercase',
        fontStyle: 'italic',
        color: '#14B8A6',
    },
    detailSub: {
        fontSize: 8,
        fontWeight: '700',
        textTransform: 'uppercase',
        color: 'rgba(255,255,255,0.4)',
    },
    unlockBadge: {
        backgroundColor: '#14B8A6',
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
        color: 'rgba(255,255,255,0.8)',
        marginBottom: 20,
    },
    requirementsSection: {
        marginBottom: 20,
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
        color: '#FBBF24',
        textTransform: 'uppercase',
    },
    requirementRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        padding: 12,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        marginBottom: 8,
    },
    requirementText: {
        fontSize: 10,
        fontWeight: '700',
        color: 'rgba(255,255,255,0.6)',
    },
    benefitsSection: {
        marginBottom: 24,
    },
    benefitsLabel: {
        fontSize: 10,
        fontWeight: '900',
        color: '#14B8A6',
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
        backgroundColor: '#14B8A6',
    },
    benefitText: {
        fontSize: 9,
        fontWeight: '700',
        color: 'rgba(255,255,255,0.8)',
    },
    unlockButton: {
        backgroundColor: '#14B8A6',
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
        backgroundColor: '#475569',
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