import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { featureRoutes, highlightCards } from '@/data/civfit';
import { MetricCard } from '../../src/components/civfit/metric-card';
import { CivfitScreen } from '../../src/components/civfit/screen';
import { SectionCard } from '../../src/components/civfit/section-card';
import { useCivfitStore } from '../../src/state/civfit-store';

export default function HomeScreen() {
  const router = useRouter();
  const { habits, stats, completeHabit, addHabit, updateHabit, deleteHabit, endDay, closeReport, logs } = useCivfitStore();
  const [isAdding, setIsAdding] = useState(false);
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null);
  const [newHabit, setNewHabit] = useState('');
  const [habitType, setHabitType] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [view, setView] = useState<'habits' | 'calendar'>('habits');
  const [filter, setFilter] = useState<'all' | 'daily' | 'weekly' | 'monthly'>('all');

  const today = new Date().toISOString().split('T')[0];
  const filteredHabits = useMemo(
    () => habits.filter((habit) => filter === 'all' || habit.type === filter),
    [filter, habits],
  );

  const completionRate = useMemo(() => {
    const active = habits.filter((habit) => habit.type === 'daily');
    if (active.length === 0) return 0;
    return active.filter((habit) => habit.completedDates.includes(today)).length / active.length;
  }, [habits, today]);

  const momentumLabel = stats.momentum >= 80 ? 'Unstoppable' : stats.momentum >= 50 ? 'Steady' : stats.momentum >= 20 ? 'Slow' : 'Stalled';

  const handleSaveHabit = () => {
    if (!newHabit.trim()) return;
    if (editingHabitId) {
      updateHabit(editingHabitId, { title: newHabit.trim(), type: habitType });
    } else {
      addHabit(newHabit.trim(), habitType);
    }
    setNewHabit('');
    setEditingHabitId(null);
    setIsAdding(false);
  };

  return (
    <CivfitScreen>
      <View style={styles.hero}>
        <Text style={styles.kicker}>REALITA CENTER</Text>
        <Text style={styles.title}>Inventory Habit</Text>
        <Text style={styles.subtitle}>Dashboard ini mengikuti web: progress utama, habit inventory, lalu aksi harian yang nyata.</Text>
      </View>

      <View style={styles.metricsGrid}>
        {highlightCards.map((card) => (
          <MetricCard
            key={card.label}
            label={card.label}
            value={card.value}
            note={card.note}
            tone={card.accent}
          />
        ))}
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Progress Harian</Text>
        <Text style={styles.sectionHint}>{Math.round(completionRate * 100)}%</Text>
      </View>

      <View style={styles.dashboardCard}>
        <View style={styles.dashboardTopRow}>
          <View>
            <Text style={styles.dashboardLabel}>Momentum (Snowball)</Text>
            <Text style={styles.dashboardValue}>{stats.momentum}%</Text>
          </View>
          <View style={styles.dashboardBadge}>
            <Text style={styles.dashboardBadgeText}>{momentumLabel}</Text>
          </View>
        </View>
        <View style={styles.progressBlock}>
          <View style={styles.progressMeta}>
            <Text style={styles.progressLabel}>Habit Execution</Text>
            <Text style={styles.progressValue}>{Math.round(completionRate * 100)}%</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${Math.round(completionRate * 100)}%` }]} />
          </View>
        </View>
        <View style={styles.progressBlock}>
          <View style={styles.progressMeta}>
            <Text style={styles.progressLabel}>Momentum</Text>
            <Text style={styles.progressValue}>{stats.momentum}%</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFillAlt, { width: `${stats.momentum}%` }]} />
          </View>
        </View>
        <View style={styles.dashboardActions}>
          <Pressable style={styles.primaryButton} onPress={() => setIsAdding((current) => !current)}>
            <Text style={styles.primaryButtonText}>{isAdding ? 'Tutup' : 'Tambah Habit'}</Text>
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={endDay}>
            <Text style={styles.secondaryButtonText}>End Day</Text>
          </Pressable>
        </View>
      </View>

      {stats.pendingReport && (
        <View style={styles.reportCard}>
          <Text style={styles.reportTitle}>Morning Report</Text>
          <Text style={styles.reportBody}>{stats.pendingReport.message}</Text>
          <Pressable style={styles.secondaryButton} onPress={closeReport}>
            <Text style={styles.secondaryButtonText}>Begin New Cycle</Text>
          </Pressable>
        </View>
      )}

      {isAdding && (
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>{editingHabitId ? 'Edit Habit' : 'New Habit'}</Text>
          <TextInput
            value={newHabit}
            onChangeText={setNewHabit}
            placeholder="Tuliskan habit baru"
            placeholderTextColor="#8A8F98"
            style={styles.input}
          />
          <View style={styles.segmentRow}>
            {(['daily', 'weekly', 'monthly'] as const).map((type) => (
              <Pressable
                key={type}
                style={[styles.segmentButton, habitType === type && styles.segmentButtonActive]}
                onPress={() => setHabitType(type)}>
                <Text style={[styles.segmentText, habitType === type && styles.segmentTextActive]}>{type}</Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.formActions}>
            <Pressable style={styles.primaryButton} onPress={handleSaveHabit}>
              <Text style={styles.primaryButtonText}>Save</Text>
            </Pressable>
            <Pressable
              style={styles.secondaryButton}
              onPress={() => {
                setIsAdding(false);
                setEditingHabitId(null);
                setNewHabit('');
              }}>
              <Text style={styles.secondaryButtonText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      )}

      <View style={styles.segmentRow}>
        {(['all', 'daily', 'weekly', 'monthly'] as const).map((cat) => (
          <Pressable
            key={cat}
            style={[styles.segmentButton, filter === cat && styles.segmentButtonActive]}
            onPress={() => setFilter(cat)}>
            <Text style={[styles.segmentText, filter === cat && styles.segmentTextActive]}>{cat}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.toggleRow}>
        <Pressable style={[styles.toggleButton, view === 'habits' && styles.toggleButtonActive]} onPress={() => setView('habits')}>
          <Text style={[styles.toggleText, view === 'habits' && styles.toggleTextActive]}>HABITS</Text>
        </Pressable>
        <Pressable style={[styles.toggleButton, view === 'calendar' && styles.toggleButtonActive]} onPress={() => setView('calendar')}>
          <Text style={[styles.toggleText, view === 'calendar' && styles.toggleTextActive]}>LOGS</Text>
        </Pressable>
      </View>

      {view === 'calendar' ? (
        <View style={styles.calendarCard}>
          <Text style={styles.calendarTitle}>History Dunia</Text>
          <Text style={styles.calendarBody}>Riwayat log terbaru mengikuti pola web. Kamu bisa pakai ini untuk memonitor progress harian.</Text>
          <View style={styles.logList}>
            {logs.slice(0, 6).map((log) => (
              <View key={log.id} style={styles.logRow}>
                <View style={styles.logDot} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.logTitle}>{log.message}</Text>
                  <Text style={styles.logMeta}>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      ) : (
        <View style={styles.habitStack}>
          {filteredHabits.map((habit) => {
            const completed = habit.completedDates.includes(today);
            return (
              <View key={habit.id} style={styles.habitCard}>
                <View style={styles.habitTopRow}>
                  <View>
                    <Text style={styles.habitTitle}>{habit.title}</Text>
                    <Text style={styles.habitMeta}>{habit.type} · streak {habit.currentStreak}</Text>
                  </View>
                  <Text style={styles.habitReward}>+{habit.goldReward} G</Text>
                </View>
                <View style={styles.habitActions}>
                  <Pressable style={[styles.smallButton, completed && styles.smallButtonDisabled]} onPress={() => completeHabit(habit.id)}>
                    <Text style={styles.smallButtonText}>{completed ? 'Done' : 'Complete'}</Text>
                  </Pressable>
                  <Pressable
                    style={styles.smallButton}
                    onPress={() => {
                      setEditingHabitId(habit.id);
                      setNewHabit(habit.title);
                      setHabitType(habit.type);
                      setIsAdding(true);
                    }}>
                    <Text style={styles.smallButtonText}>Edit</Text>
                  </Pressable>
                  <Pressable style={styles.smallButtonDanger} onPress={() => deleteHabit(habit.id)}>
                    <Text style={styles.smallButtonText}>Delete</Text>
                  </Pressable>
                </View>
              </View>
            );
          })}
        </View>
      )}

      <View style={styles.stack}>
        {featureRoutes.map((item) => (
          <SectionCard
            key={item.title}
            title={item.title}
            description={item.description}
            badge={item.badge}
            icon={<Ionicons name={item.icon as keyof typeof Ionicons.glyphMap} size={22} color="#8AB7FF" />}
            onPress={
              item.href === '/'
                ? undefined
                : () => {
                    if (item.href === '/city') router.push('/city');
                    if (item.href === '/shop') router.push('/shop' as never);
                    if (item.href === '/menu') router.push('/menu');
                  }
            }
          />
        ))}
      </View>
    </CivfitScreen>
  );
}

const styles = StyleSheet.create({
  hero: {
    gap: 10,
    paddingTop: 10,
  },
  kicker: {
    color: '#E85146',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2.4,
    textTransform: 'uppercase',
  },
  title: {
    color: '#1F2228',
    fontSize: 32,
    lineHeight: 36,
    fontWeight: '900',
  },
  subtitle: {
    color: '#4C5158',
    fontSize: 15,
    lineHeight: 22,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  sectionTitle: {
    color: '#1F2228',
    fontSize: 18,
    fontWeight: '800',
  },
  sectionHint: {
    color: '#E85146',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  stack: {
    gap: 14,
  },
  dashboardCard: {
    borderRadius: 28,
    borderWidth: 2,
    borderColor: '#1F2228',
    backgroundColor: '#1F2228',
    padding: 18,
    gap: 14,
    shadowColor: '#1F2228',
    shadowOpacity: 0.25,
    shadowRadius: 0,
    shadowOffset: { width: 4, height: 4 },
    elevation: 4,
  },
  dashboardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dashboardLabel: {
    color: 'rgba(255,255,255,0.45)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontSize: 10,
    fontWeight: '800',
  },
  dashboardValue: {
    color: '#FFD94A',
    fontSize: 28,
    fontWeight: '900',
  },
  dashboardBadge: {
    backgroundColor: '#2FBFA5',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  dashboardBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  progressBlock: {
    gap: 6,
  },
  progressMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    color: '#FFFFFF',
    fontSize: 10,
    textTransform: 'uppercase',
    fontWeight: '800',
    letterSpacing: 1,
  },
  progressValue: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  progressTrack: {
    height: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: '#FFFFFF',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2FBFA5',
  },
  progressFillAlt: {
    height: '100%',
    backgroundColor: '#FFD94A',
  },
  dashboardActions: {
    flexDirection: 'row',
    gap: 10,
  },
  primaryButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2FBFA5',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 14,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  secondaryButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#1F2228',
    borderRadius: 18,
    paddingVertical: 14,
  },
  secondaryButtonText: {
    color: '#1F2228',
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  reportCard: {
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#1F2228',
    backgroundColor: '#FFFFFF',
    padding: 18,
    gap: 10,
    shadowColor: '#1F2228',
    shadowOpacity: 0.2,
    shadowRadius: 0,
    shadowOffset: { width: 3, height: 3 },
  },
  reportTitle: {
    color: '#1F2228',
    fontSize: 18,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  reportBody: {
    color: '#4C5158',
    lineHeight: 20,
  },
  formCard: {
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#1F2228',
    backgroundColor: '#FFFFFF',
    padding: 18,
    gap: 12,
  },
  formTitle: {
    color: '#1F2228',
    fontSize: 18,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  input: {
    borderWidth: 2,
    borderColor: '#1F2228',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#1F2228',
    backgroundColor: '#F6F0E7',
    fontWeight: '700',
  },
  segmentRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  segmentButton: {
    borderWidth: 2,
    borderColor: '#1F2228',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
  },
  segmentButtonActive: {
    backgroundColor: '#FFD94A',
  },
  segmentText: {
    color: '#1F2228',
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  segmentTextActive: {
    color: '#1F2228',
  },
  formActions: {
    flexDirection: 'row',
    gap: 10,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 10,
  },
  toggleButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#1F2228',
    borderRadius: 18,
    paddingVertical: 12,
  },
  toggleButtonActive: {
    backgroundColor: '#1F2228',
  },
  toggleText: {
    color: '#1F2228',
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  toggleTextActive: {
    color: '#FFFFFF',
  },
  calendarCard: {
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#1F2228',
    backgroundColor: '#FFFFFF',
    padding: 18,
    gap: 12,
  },
  calendarTitle: {
    color: '#1F2228',
    fontSize: 18,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  calendarBody: {
    color: '#4C5158',
    lineHeight: 20,
  },
  logList: {
    gap: 10,
  },
  logRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  logDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: '#E85146',
    marginTop: 5,
  },
  logTitle: {
    color: '#1F2228',
    fontWeight: '800',
  },
  logMeta: {
    color: '#4C5158',
    fontSize: 11,
    marginTop: 2,
  },
  habitStack: {
    gap: 12,
  },
  habitCard: {
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#1F2228',
    backgroundColor: '#FFFFFF',
    padding: 16,
    gap: 12,
  },
  habitTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
  },
  habitTitle: {
    color: '#1F2228',
    fontSize: 16,
    fontWeight: '900',
  },
  habitMeta: {
    color: '#4C5158',
    fontSize: 11,
    marginTop: 3,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  habitReward: {
    color: '#E85146',
    fontWeight: '900',
  },
  habitActions: {
    flexDirection: 'row',
    gap: 8,
  },
  smallButton: {
    borderRadius: 999,
    borderWidth: 2,
    borderColor: '#1F2228',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F6F0E7',
  },
  smallButtonDisabled: {
    backgroundColor: '#D7F3EA',
  },
  smallButtonDanger: {
    borderRadius: 999,
    borderWidth: 2,
    borderColor: '#1F2228',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F7DCE2',
  },
  smallButtonText: {
    color: '#1F2228',
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
});
