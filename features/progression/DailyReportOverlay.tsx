import { DailyReport, UserStats } from '@/core/types';
import {
    AlertTriangle,
    ArrowUpRight,
    Coins,
    Heart,
    Skull,
    TrendingUp,
    Users,
    Zap
} from 'lucide-react-native';
import React, { useEffect, useRef } from 'react';
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

interface DailyReportOverlayProps {
    report: DailyReport;
    stats: UserStats;
    onClose: () => void;
}

const { width, height } = Dimensions.get('window');

export default function DailyReportOverlay({ report, stats, onClose }: DailyReportOverlayProps) {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 8,
                tension: 40,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const handleClose = () => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 0.9,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start(() => onClose());
    };

    return (
        <Modal transparent visible animationType="none" onRequestClose={handleClose}>
            <Animated.View style={[styles.modalBackdrop, { opacity: fadeAnim }]}>
                <ScrollView
                    contentContainerStyle={styles.scrollContainer}
                    showsVerticalScrollIndicator={false}
                >
                    <Animated.View
                        style={[
                            styles.contentContainer,
                            {
                                transform: [{ scale: scaleAnim }],
                            },
                        ]}
                    >
                        {/* Header */}
                        <View style={styles.header}>
                            <Animated.View style={styles.iconCircle}>
                                <TrendingUp size={32} color="#1E293B" />
                            </Animated.View>
                            <Text style={styles.title}>Daily Report</Text>
                            <Text style={styles.subtitle}>Day {stats.dayCount} Summary</Text>
                        </View>

                        {/* Cards Section */}
                        <View style={styles.cardsContainer}>
                            {/* Momentum Card */}
                            <View style={styles.momentumCard}>
                                <View style={styles.momentumSparkleBg} />
                                <View style={styles.cardContent}>
                                    <View style={styles.cardHeader}>
                                        <View style={styles.cardTitleRow}>
                                            <Zap size={12} color="#FBBF24" />
                                            <Text style={styles.cardTitle}>Momentum</Text>
                                        </View>
                                        <Text
                                            style={[
                                                styles.momentumValue,
                                                report.momentumBonus >= 0 ? styles.positiveText : styles.negativeText,
                                            ]}
                                        >
                                            {report.momentumBonus >= 0 ? '+' : ''}{report.momentumBonus}%
                                        </Text>
                                    </View>
                                    <View style={styles.momentumStats}>
                                        <Text style={styles.momentumPercentage}>{stats.momentum}%</Text>
                                        <Text style={styles.momentumLabel}>Current Momentum</Text>
                                    </View>
                                    <Text style={styles.momentumMessage}>“{report.message}”</Text>
                                </View>
                            </View>

                            {/* Event Card */}
                            {report.event && (
                                <View style={styles.eventCard}>
                                    <View style={styles.eventBgIcon}>
                                        <Skull size={96} color="#EF4444" />
                                    </View>
                                    <View style={styles.cardContent}>
                                        <View style={styles.eventHeader}>
                                            <AlertTriangle size={12} color="#EF4444" />
                                            <Text style={styles.eventTitle}>Incident</Text>
                                        </View>
                                        <Text style={styles.eventName}>{report.event.name}</Text>
                                        <Text style={styles.eventDesc}>{report.event.description}</Text>
                                        <View style={styles.eventImpact}>
                                            <Zap size={12} color="#EF4444" />
                                            <Text style={styles.eventImpactText}>
                                                Impact: -{report.event.severity}% on {report.event.impactType}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            )}

                            {/* Real World Performance */}
                            <View style={styles.performanceCard}>
                                <View style={styles.performanceHeader}>
                                    <Text style={styles.sectionTitle}>Real-World Impact</Text>
                                    <View style={styles.completionBadge}>
                                        <Text style={styles.completionText}>
                                            {report.habitsCompleted}/{report.habitsTotal} Completed
                                        </Text>
                                    </View>
                                </View>
                                <View style={styles.performanceStats}>
                                    <View style={styles.statItem}>
                                        <Text style={styles.statLabel}>Health</Text>
                                        <View style={styles.statRow}>
                                            <View
                                                style={[
                                                    styles.statIcon,
                                                    report.hpChange >= 0 ? styles.statIconPositive : styles.statIconNegative,
                                                ]}
                                            >
                                                {report.hpChange >= 0 ? (
                                                    <Heart size={16} color="#14B8A6" />
                                                ) : (
                                                    <Skull size={16} color="#EF4444" />
                                                )}
                                            </View>
                                            <Text
                                                style={[
                                                    styles.statValue,
                                                    report.hpChange >= 0 ? styles.positiveText : styles.negativeText,
                                                ]}
                                            >
                                                {report.hpChange >= 0 ? '+' : ''}{report.hpChange} HP
                                            </Text>
                                        </View>
                                    </View>
                                    <View style={styles.statItem}>
                                        <Text style={styles.statLabel}>Daily Income</Text>
                                        <View style={styles.statRow}>
                                            <View style={styles.statIconGold}>
                                                <Coins size={16} color="#FBBF24" />
                                            </View>
                                            <Text style={styles.statValueGold}>+{report.goldGained} G</Text>
                                        </View>
                                    </View>
                                </View>
                            </View>

                            {/* Simulation Summary */}
                            <View style={styles.simulationCard}>
                                <View style={styles.simulationProgress}>
                                    <Animated.View
                                        style={[
                                            styles.simulationProgressFill,
                                            {
                                                width: `${stats.momentum}%`,
                                                backgroundColor: '#14B8A6',
                                            },
                                        ]}
                                    />
                                </View>
                                <Text style={styles.sectionTitle}>Simulation Summary</Text>
                                <View style={styles.simulationStats}>
                                    {/* Population */}
                                    <View style={styles.simulationRow}>
                                        <View style={styles.simulationIconContainer}>
                                            <View style={styles.simulationIcon}>
                                                <Users size={16} color="#14B8A6" />
                                            </View>
                                            <View>
                                                <Text style={styles.simulationLabel}>Population</Text>
                                                <Text style={styles.simulationDesc}>Population Growth</Text>
                                            </View>
                                        </View>
                                        <View style={styles.simulationValue}>
                                            <Text style={[styles.simulationNumber, report.populationGrowth >= 0 ? styles.positiveText : styles.negativeText]}>
                                                {report.populationGrowth >= 0 ? '+' : ''}{report.populationGrowth}
                                            </Text>
                                            <Text style={styles.simulationUnit}>Citizens</Text>
                                        </View>
                                    </View>

                                    {/* Sickness & Deaths */}
                                    {(report.sickChange !== 0 || (report.deathCount || 0) > 0) && (
                                        <View style={styles.sicknessCard}>
                                            <View style={styles.sicknessRow}>
                                                <Text style={styles.sicknessLabel}>Sickness Change</Text>
                                                <Text style={styles.sicknessValue}>
                                                    {report.sickChange! > 0 ? '+' : ''}{report.sickChange} citizens
                                                </Text>
                                            </View>
                                            {report.deathCount! > 0 && (
                                                <View style={styles.sicknessRow}>
                                                    <Text style={styles.sicknessLabel}>Deaths</Text>
                                                    <Text style={styles.sicknessValue}>-{report.deathCount} citizens</Text>
                                                </View>
                                            )}
                                        </View>
                                    )}

                                    {/* Economy */}
                                    <View style={styles.simulationRow}>
                                        <View style={styles.simulationIconContainer}>
                                            <View style={[styles.simulationIcon, styles.iconGold]}>
                                                <ArrowUpRight size={16} color="#FBBF24" />
                                            </View>
                                            <View>
                                                <Text style={styles.simulationLabel}>Economy</Text>
                                                <Text style={styles.simulationDesc}>Treasury</Text>
                                            </View>
                                        </View>
                                        <View style={styles.simulationValueGold}>
                                            <Text style={styles.simulationNumberGold}>+{report.silverTax} S</Text>
                                            <Text style={styles.simulationUnit}>Silver</Text>
                                        </View>
                                    </View>

                                    {/* Evolution */}
                                    <View style={styles.simulationRow}>
                                        <View style={styles.simulationIconContainer}>
                                            <View style={[styles.simulationIcon, styles.iconPurple]}>
                                                <Zap size={16} color="#8B5CF6" />
                                            </View>
                                            <View>
                                                <Text style={styles.simulationLabel}>Evolution</Text>
                                                <Text style={styles.simulationDesc}>Research Progress</Text>
                                            </View>
                                        </View>
                                        <View style={styles.simulationValuePurple}>
                                            <Text style={styles.simulationNumberPurple}>+{report.expGained} X</Text>
                                            <Text style={styles.simulationUnit}>Exp</Text>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        </View>

                        {/* Close Button */}
                        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                            <Text style={styles.closeButtonText}>Start Next Day</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </ScrollView>
            </Animated.View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(30,41,59,0.98)', // brand-dark with opacity
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
    },
    contentContainer: {
        width: width * 0.9,
        maxWidth: 400,
        paddingVertical: 24,
    },
    // Header
    header: {
        alignItems: 'center',
        marginBottom: 32,
    },
    iconCircle: {
        backgroundColor: '#FBBF24',
        borderRadius: 48,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#FBBF24',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 20,
        elevation: 10,
    },
    title: {
        fontSize: 28,
        fontWeight: '900',
        fontStyle: 'italic',
        textTransform: 'uppercase',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 10,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 3,
        color: '#14B8A6',
    },
    cardsContainer: {
        gap: 16,
        marginBottom: 24,
    },
    // Momentum Card
    momentumCard: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        borderRadius: 32,
        padding: 20,
        overflow: 'hidden',
        position: 'relative',
    },
    momentumSparkleBg: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: 80,
        height: 80,
        opacity: 0.1,
        backgroundColor: 'transparent',
    },
    cardContent: {
        zIndex: 1,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    cardTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    cardTitle: {
        fontSize: 10,
        fontWeight: '900',
        color: 'rgba(255,255,255,0.4)',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    momentumValue: {
        fontSize: 12,
        fontWeight: '900',
        fontFamily: 'monospace',
    },
    positiveText: {
        color: '#14B8A6',
    },
    negativeText: {
        color: '#EF4444',
    },
    momentumStats: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 8,
        marginBottom: 12,
    },
    momentumPercentage: {
        fontSize: 32,
        fontWeight: '900',
        fontFamily: 'monospace',
        color: '#FFFFFF',
    },
    momentumLabel: {
        fontSize: 8,
        fontWeight: '700',
        color: 'rgba(255,255,255,0.4)',
        textTransform: 'uppercase',
    },
    momentumMessage: {
        fontSize: 10,
        fontWeight: '500',
        fontStyle: 'italic',
        color: 'rgba(255,255,255,0.6)',
        lineHeight: 16,
    },
    // Event Card
    eventCard: {
        backgroundColor: 'rgba(239,68,68,0.1)',
        borderWidth: 1,
        borderColor: 'rgba(239,68,68,0.3)',
        borderRadius: 32,
        padding: 20,
        overflow: 'hidden',
        position: 'relative',
    },
    eventBgIcon: {
        position: 'absolute',
        top: -20,
        right: -20,
        opacity: 0.1,
    },
    eventHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 12,
    },
    eventTitle: {
        fontSize: 10,
        fontWeight: '900',
        color: '#EF4444',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    eventName: {
        fontSize: 18,
        fontWeight: '900',
        color: '#FFFFFF',
        fontStyle: 'italic',
        marginBottom: 8,
    },
    eventDesc: {
        fontSize: 12,
        fontWeight: '500',
        color: 'rgba(255,255,255,0.6)',
        lineHeight: 18,
        marginBottom: 12,
    },
    eventImpact: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    eventImpactText: {
        fontSize: 10,
        fontWeight: '900',
        color: '#EF4444',
        textTransform: 'uppercase',
    },
    // Performance Card
    performanceCard: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        borderRadius: 40,
        padding: 20,
    },
    performanceHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 10,
        fontWeight: '900',
        color: 'rgba(255,255,255,0.4)',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    completionBadge: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    completionText: {
        fontSize: 8,
        fontWeight: '900',
        color: 'rgba(255,255,255,0.6)',
    },
    performanceStats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 16,
    },
    statItem: {
        flex: 1,
    },
    statLabel: {
        fontSize: 8,
        fontWeight: '900',
        color: 'rgba(255,255,255,0.3)',
        textTransform: 'uppercase',
        marginBottom: 8,
    },
    statRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    statIcon: {
        padding: 8,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
    },
    statIconPositive: {
        borderColor: '#14B8A6',
    },
    statIconNegative: {
        borderColor: '#EF4444',
    },
    statIconGold: {
        padding: 8,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: '#FBBF24',
    },
    statValue: {
        fontSize: 18,
        fontWeight: '900',
        fontFamily: 'monospace',
    },
    statValueGold: {
        fontSize: 18,
        fontWeight: '900',
        fontFamily: 'monospace',
        color: '#FBBF24',
    },
    // Simulation Card
    simulationCard: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        borderRadius: 40,
        padding: 20,
        position: 'relative',
        overflow: 'hidden',
    },
    simulationProgress: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 4,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    simulationProgressFill: {
        height: '100%',
    },
    simulationStats: {
        gap: 20,
    },
    simulationRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    simulationIconContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    simulationIcon: {
        width: 32,
        height: 32,
        borderRadius: 12,
        backgroundColor: 'rgba(20,184,166,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(20,184,166,0.2)',
    },
    iconGold: {
        backgroundColor: 'rgba(251,191,36,0.2)',
        borderColor: 'rgba(251,191,36,0.2)',
    },
    iconPurple: {
        backgroundColor: 'rgba(139,92,246,0.2)',
        borderColor: 'rgba(139,92,246,0.2)',
    },
    simulationLabel: {
        fontSize: 8,
        fontWeight: '900',
        color: 'rgba(255,255,255,0.4)',
        textTransform: 'uppercase',
    },
    simulationDesc: {
        fontSize: 14,
        fontWeight: '900',
        color: '#FFFFFF',
        fontStyle: 'italic',
    },
    simulationValue: {
        alignItems: 'flex-end',
    },
    simulationNumber: {
        fontSize: 20,
        fontWeight: '900',
        fontFamily: 'monospace',
    },
    simulationValueGold: {
        alignItems: 'flex-end',
    },
    simulationNumberGold: {
        fontSize: 20,
        fontWeight: '900',
        fontFamily: 'monospace',
        color: '#FBBF24',
    },
    simulationValuePurple: {
        alignItems: 'flex-end',
    },
    simulationNumberPurple: {
        fontSize: 20,
        fontWeight: '900',
        fontFamily: 'monospace',
        color: '#8B5CF6',
    },
    simulationUnit: {
        fontSize: 8,
        fontWeight: '900',
        color: 'rgba(255,255,255,0.3)',
        textTransform: 'uppercase',
    },
    sicknessCard: {
        backgroundColor: 'rgba(239,68,68,0.1)',
        borderRadius: 20,
        padding: 12,
        borderWidth: 1,
        borderColor: 'rgba(239,68,68,0.2)',
        marginTop: 8,
    },
    sicknessRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    sicknessLabel: {
        fontSize: 8,
        fontWeight: '900',
        color: '#EF4444',
        textTransform: 'uppercase',
    },
    sicknessValue: {
        fontSize: 10,
        fontWeight: '900',
        color: '#EF4444',
    },
    // Close Button
    closeButton: {
        backgroundColor: '#14B8A6',
        paddingVertical: 20,
        borderRadius: 32,
        borderWidth: 2,
        borderColor: '#0F172A',
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 0,
        elevation: 6,
        alignItems: 'center',
        marginTop: 8,
    },
    closeButtonText: {
        fontSize: 20,
        fontWeight: '900',
        fontStyle: 'italic',
        textTransform: 'uppercase',
        color: '#1E293B',
    },
});