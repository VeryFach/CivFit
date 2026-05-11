import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, FlatList, ActivityIndicator, Image } from 'react-native';
import { Trophy, Users, TrendingUp, Medal } from 'lucide-react-native';
import { db } from '../../platform/api/firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../../platform/api/firestoreUtils';
import Animated, { FadeInLeft } from 'react-native-reanimated';
import { COLORS, THEME } from '../theme';

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
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'leaderboard'));

    return () => unsub();
  }, []);

  const renderItem = ({ item, index }: { item: LeaderboardEntry, index: number }) => {
    const isTop3 = index < 3;
    const medalColors = [COLORS.yellow, '#D1D5DB', '#FB923C'];
    
    return (
      <Animated.View
        entering={FadeInLeft.delay(index * 50)}
        style={[
          styles.entryCard,
          isTop3 ? styles.entryCardTop : styles.entryCardRegular
        ]}
      >
        <View style={[
          styles.rankBadge,
          { backgroundColor: isTop3 ? medalColors[index] : COLORS.bg }
        ]}>
          <Text style={styles.rankText}>{index + 1}</Text>
        </View>

        <View style={styles.avatarBox}>
           {item.photoURL ? (
              <Image source={{ uri: item.photoURL }} style={styles.avatarImg} />
           ) : (
              <View style={styles.avatarPlaceholder}>
                 <Text style={styles.avatarInitial}>{item.displayName?.slice(0, 1) || '?'}</Text>
              </View>
           )}
        </View>

        <View style={styles.entryInfo}>
          <Text style={styles.entryName} numberOfLines={1}>
            {item.displayName || 'Anonymous'}
          </Text>
          <View style={styles.entryStats}>
             <View style={styles.statLine}>
                <TrendingUp size={10} color={COLORS.teal} />
                <Text style={styles.statText}>Lv.{item.level}</Text>
             </View>
             <View style={styles.statLine}>
                <Users size={10} color={COLORS.teal} />
                <Text style={styles.statText}>{item.population.toLocaleString()} Pop</Text>
             </View>
          </View>
        </View>

        <View style={styles.entryRight}>
           <View style={styles.eraTag}>
             <Text style={styles.eraTagText}>{item.currentEra}</Text>
           </View>
           {isTop3 && (
             <Medal size={20} color={index === 0 ? COLORS.yellow : '#9CA3AF'} style={{ marginTop: 4 }} />
           )}
        </View>
      </Animated.View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.teal} />
        <Text style={styles.loadingText}>FETCHING KOTA DATA...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, isEmbedded ? { padding: 0 } : { padding: 16 }]}>
      <FlatList
        data={entries}
        keyExtractor={item => item.userId}
        renderItem={renderItem}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <View style={styles.trophyBox}>
                <Trophy size={24} color={COLORS.dark} />
              </View>
              <View>
                <Text style={styles.headerTitle}>Global Rankings</Text>
                <Text style={styles.headerSub}>Simulated Leaders</Text>
              </View>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No rankings yet</Text>
          </View>
        }
        ListFooterComponent={
          <View style={styles.footer}>
             <Text style={styles.footerTitle}>Expansion Note</Text>
             <Text style={styles.footerText}>
               Rankings are updated every time you complete a daily report or build infrastructure. Only the top 20 survivors are shown.
             </Text>
          </View>
        }
        contentContainerStyle={!isEmbedded ? { paddingBottom: 100 } : {}}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    padding: 60,
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#9CA3AF',
    textTransform: 'uppercase',
  },
  header: {
    backgroundColor: COLORS.dark,
    borderRadius: 32,
    padding: 24,
    transform: [{ rotate: '-1deg' }],
    ...THEME.neoBorder,
    ...THEME.neoShadowLg,
    marginBottom: 24,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  trophyBox: {
    backgroundColor: COLORS.yellow,
    padding: 10,
    borderRadius: 16,
    ...THEME.neoBorder,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    fontStyle: 'italic',
    color: '#FFF',
    textTransform: 'uppercase',
  },
  headerSub: {
    fontSize: 10,
    fontWeight: '700',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginTop: 4,
  },
  entryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 32,
    marginBottom: 12,
    gap: 12,
  },
  entryCardTop: {
    backgroundColor: '#FFF',
    ...THEME.neoBorder,
    ...THEME.neoShadowLg,
  },
  entryCardRegular: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 2,
    borderColor: 'rgba(45, 52, 54, 0.05)',
  },
  rankBadge: {
    width: 44,
    height: 44,
    borderRadius: 16,
    ...THEME.neoBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankText: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.dark,
  },
  avatarBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    ...THEME.neoBorder,
    overflow: 'hidden',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.teal,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    color: '#FFF',
    fontWeight: '900',
    fontSize: 20,
  },
  entryInfo: {
    flex: 1,
    minWidth: 0,
  },
  entryName: {
    fontSize: 14,
    fontWeight: '900',
    textTransform: 'uppercase',
    color: COLORS.dark,
    marginBottom: 4,
  },
  entryStats: {
    flexDirection: 'row',
    gap: 12,
  },
  statLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#9CA3AF',
    textTransform: 'uppercase',
  },
  entryRight: {
    alignItems: 'flex-end',
  },
  eraTag: {
    backgroundColor: 'rgba(45, 204, 113, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  eraTagText: {
    fontSize: 8,
    fontWeight: '900',
    color: COLORS.teal,
    textTransform: 'uppercase',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 32,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#E5E7EB',
  },
  emptyText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#9CA3AF',
    textTransform: 'uppercase',
  },
  footer: {
    padding: 24,
    backgroundColor: 'rgba(45, 204, 113, 0.05)',
    borderRadius: 32,
    borderWidth: 2,
    borderColor: 'rgba(45, 204, 113, 0.1)',
    marginTop: 24,
    marginBottom: 100,
  },
  footerTitle: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.teal,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  footerText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280',
    fontStyle: 'italic',
    lineHeight: 16,
  }
});
