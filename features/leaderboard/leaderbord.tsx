import React, { useEffect, useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    FlatList,
    ActivityIndicator,
    Dimensions,
    Animated,
} from 'react-native';
import { Trophy, Users, TrendingUp, Medal } from 'lucide-react-native';
import { db } from '@/services/firebase/index';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '@/services/firebase/firestoreUtils';

interface LeaderboardEntry {
    userId: string;
    displayName: string;
    photoURL: string;
    level: number;
    population: number;
    currentEra: string;
}

interface LeaderboardTabProps {
    isEmbedded?: boolean;
}

export function LeaderboardTab({ isEmbedded }: LeaderboardTabProps) {
    const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const fadeAnims = useRef<Animated.Value[]>([]).current;

    useEffect(() => {
        const q = query(
            collection(db, 'leaderboard'),
            orderBy('level', 'desc'),
            orderBy('population', 'desc'),
            limit(20)
        );

        const unsub = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => doc.data() as LeaderboardEntry);
            setEntries(data);
            setLoading(false);
            // Create fade animations for each item
            fadeAnims.length = 0;
            data.forEach(() => fadeAnims.push(new Animated.Value(0)));
            // Animate each item after data loads
            Animated.stagger(50, fadeAnims.map(anim => 
                Animated.timing(anim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                })
            )).start();
        }, (error) => handleFirestoreError(error, OperationType.LIST, 'leaderboard'));

        return () => unsub();
    }, []);

    const renderItem = ({ item, index }: { item: LeaderboardEntry; index: number }) => {
        const isTop3 = index < 3;
        const medalColors = ['#FBBF24', '#D1D5DB', '#FB923C']; // brand-yellow, gray-300, orange-400
        const medalColor = isTop3 ? medalColors[index] : '#F1F5F9';

        const rankBgStyle = {
            backgroundColor: medalColor,
        };

        return (
            <Animated.View
                style={[
                    styles.rankCard,
                    isTop3 ? styles.rankCardTop : styles.rankCardNormal,
                    { opacity: fadeAnims[index] || 1 },
                ]}
            >
                <View style={[styles.rankNumber, rankBgStyle]}>
                    <Text style={styles.rankNumberText}>{index + 1}</Text>
                </View>

                <View style={styles.avatarContainer}>
                    {item.photoURL ? (
                        <Image source={{ uri: item.photoURL }} style={styles.avatar} />
                    ) : (
                        <View style={styles.avatarPlaceholder}>
                            <Text style={styles.avatarInitial}>{item.displayName.charAt(0)}</Text>
                        </View>
                    )}
                </View>

                <View style={styles.userInfo}>
                    <Text style={styles.userName} numberOfLines={1}>
                        {item.displayName}
                    </Text>
                    <View style={styles.userStats}>
                        <View style={styles.statRow}>
                            <TrendingUp size={12} color="#14B8A6" />
                            <Text style={styles.statText}>Lv.{item.level}</Text>
                        </View>
                        <View style={styles.statRow}>
                            <Users size={12} color="#14B8A6" />
                            <Text style={styles.statText}>{item.population.toLocaleString()} Pop</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.rightSection}>
                    <View style={styles.eraBadge}>
                        <Text style={styles.eraText}>{item.currentEra}</Text>
                    </View>
                    {isTop3 && (
                        <Medal
                            size={20}
                            color={index === 0 ? '#FBBF24' : '#9CA3AF'}
                            style={styles.medalIcon}
                        />
                    )}
                </View>
            </Animated.View>
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#14B8A6" />
            </View>
        );
    }

    return (
        <View style={[styles.container, isEmbedded ? styles.containerEmbedded : styles.containerFull]}>
            {/* Header Card */}
            <View style={styles.headerCard}>
                <View style={styles.headerContent}>
                    <View style={styles.trophyIconBox}>
                        <Trophy size={24} color="#1E293B" />
                    </View>
                    <View>
                        <Text style={styles.headerTitle}>Global Rankings</Text>
                        <Text style={styles.headerSubtitle}>Simulated Leaders</Text>
                    </View>
                </View>
            </View>

            {/* Rankings List */}
            <FlatList
                data={entries}
                keyExtractor={(item) => item.userId}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>No rankings yet</Text>
                    </View>
                }
            />

            {/* Info Note */}
            <View style={styles.infoCard}>
                <Text style={styles.infoTitle}>Expansion Note</Text>
                <Text style={styles.infoText}>
                    Rankings are updated every time you complete a daily report or build infrastructure. Only the top 20 survivors are shown.
                </Text>
            </View>
        </View>
    );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    containerFull: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 32,
    },
    containerEmbedded: {
        paddingHorizontal: 0,
        paddingTop: 0,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
    },
    headerCard: {
        backgroundColor: '#1E293B',
        borderRadius: 40,
        padding: 20,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 0,
        elevation: 8,
        transform: [{ rotate: '-1deg' }],
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    trophyIconBox: {
        backgroundColor: '#FBBF24',
        padding: 10,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#0F172A',
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.2,
        elevation: 2,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '900',
        fontStyle: 'italic',
        textTransform: 'uppercase',
        color: '#FFFFFF',
    },
    headerSubtitle: {
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 2,
        textTransform: 'uppercase',
        color: '#94A3B8',
        marginTop: 4,
    },
    listContent: {
        gap: 16,
        paddingBottom: 16,
    },
    rankCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 32,
        borderWidth: 2,
        backgroundColor: '#FFFFFF',
        marginBottom: 12,
    },
    rankCardTop: {
        borderColor: '#1E293B',
        shadowColor: '#000',
        shadowOffset: { width: 3, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 0,
        elevation: 6,
    },
    rankCardNormal: {
        borderColor: 'rgba(30,41,59,0.1)',
        backgroundColor: 'rgba(255,255,255,0.5)',
    },
    rankNumber: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#0F172A',
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.2,
        elevation: 2,
        marginRight: 12,
    },
    rankNumberText: {
        fontSize: 20,
        fontWeight: '900',
        color: '#1E293B',
    },
    avatarContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#CBD5E1',
        overflow: 'hidden',
        marginRight: 12,
        backgroundColor: '#F1F5F9',
    },
    avatar: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    avatarPlaceholder: {
        width: '100%',
        height: '100%',
        backgroundColor: '#14B8A6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarInitial: {
        fontSize: 18,
        fontWeight: '900',
        color: '#FFFFFF',
        textTransform: 'uppercase',
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 14,
        fontWeight: '900',
        textTransform: 'uppercase',
        color: '#1E293B',
        marginBottom: 4,
    },
    userStats: {
        flexDirection: 'row',
        gap: 12,
    },
    statRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    statText: {
        fontSize: 10,
        fontWeight: '900',
        color: '#64748B',
        textTransform: 'uppercase',
    },
    rightSection: {
        alignItems: 'flex-end',
    },
    eraBadge: {
        backgroundColor: 'rgba(20,184,166,0.1)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginBottom: 4,
    },
    eraText: {
        fontSize: 8,
        fontWeight: '900',
        color: '#14B8A6',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    medalIcon: {
        marginTop: 4,
    },
    emptyState: {
        backgroundColor: 'rgba(255,255,255,0.5)',
        paddingVertical: 48,
        borderRadius: 32,
        borderWidth: 2,
        borderColor: '#E2E8F0',
        borderStyle: 'dashed',
        alignItems: 'center',
        marginTop: 24,
    },
    emptyText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#94A3B8',
        textTransform: 'uppercase',
    },
    infoCard: {
        backgroundColor: 'rgba(20,184,166,0.05)',
        borderWidth: 2,
        borderColor: 'rgba(20,184,166,0.1)',
        borderRadius: 40,
        padding: 24,
        marginTop: 16,
        marginBottom: 32,
    },
    infoTitle: {
        fontSize: 10,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 2,
        color: '#14B8A6',
        marginBottom: 8,
    },
    infoText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#64748B',
        fontStyle: 'italic',
        lineHeight: 18,
    },
});