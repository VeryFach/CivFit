import { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { CivfitScreen } from '../../src/components/civfit/screen';
import { useCivfitStore } from '../../src/state/civfit-store';

export default function HomeScreen() {
  const { 
    habits, 
    stats, 
    completeHabit, 
    addHabit, 
    updateHabit, 
    deleteHabit, 
    endDay,
    closeReport 
  } = useCivfitStore();

  const [isAdding, setIsAdding] = useState(false);
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null);
  const [newHabit, setNewHabit] = useState('');
  const [habitType, setHabitType] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [filter, setFilter] = useState<'all' | 'daily' | 'weekly' | 'monthly'>('all');
  const [viewMode, setViewMode] = useState<'habits' | 'logs'>('habits');

  const today = new Date().toISOString().split('T')[0];
  const filteredHabits = useMemo(
    () => habits.filter((h) => filter === 'all' || h.type === filter),
    [habits, filter],
  );

  const completionRate = useMemo(() => {
    const activeHabits = habits.filter((h) => h.type === 'daily');
    if (activeHabits.length === 0) return 0;
    return (
      activeHabits.filter((h) => h.completedDates.includes(today)).length /
      activeHabits.length
    );
  }, [habits, today]);

  const momentumLabel =
    stats.momentum >= 80 ? 'Unstoppable' : stats.momentum >= 50 ? 'Steady' : stats.momentum >= 20 ? 'Slow' : 'Stalled';

  const handleSaveHabit = () => {
    if (!newHabit.trim()) {
      Alert.alert('Error', 'Habit name cannot be empty');
      return;
    }
    if (editingHabitId) {
      updateHabit(editingHabitId, { title: newHabit.trim(), type: habitType });
    } else {
      addHabit(newHabit.trim(), habitType);
    }
    setNewHabit('');
    setEditingHabitId(null);
    setIsAdding(false);
  };

  const handleCompleteHabit = (habitId: string) => {
    completeHabit(habitId);
  };

  const handleDeleteHabit = (habitId: string) => {
    Alert.alert(
      'Delete Habit',
      'Are you sure you want to delete this habit?',
      [
        { text: 'Cancel', onPress: () => {}, style: 'cancel' },
        {
          text: 'Delete',
          onPress: () => deleteHabit(habitId),
          style: 'destructive',
        },
      ],
    );
  };

  const isHabitCompleted = (habitId: string) =>
    habits.find((h) => h.id === habitId)?.completedDates.includes(today) || false;

  const startEditHabit = (habit: any) => {
    setEditingHabitId(habit.id);
    setNewHabit(habit.title);
    setHabitType(habit.type);
    setIsAdding(true);
  };

  const renderCalendar = () => {
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).getDay();
    
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);

    return (
      <View style={styles.calendarCard}>
        <Text style={styles.calendarTitle}>📅 Habit History</Text>
        <Text style={styles.calendarMonth}>
          {now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </Text>
        
        <View style={styles.dayLabels}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <Text key={day} style={styles.dayLabel}>{day}</Text>
          ))}
        </View>

        <View style={styles.calendarGrid}>
          {days.map((day, index) => {
            if (!day) return <View key={`empty-${index}`} style={styles.calendarDayEmpty} />;
            
            const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isToday = dateStr === today;
            const completedCount = habits.filter(h => h.completedDates.includes(dateStr)).length;
            const totalHabits = habits.length;
            const intensity = totalHabits > 0 ? completedCount / totalHabits : 0;

            return (
              <View
                key={day}
                style={[
                  styles.calendarDay,
                  isToday && styles.calendarDayToday,
                  intensity > 0.5 && !isToday && styles.calendarDayActive,
                ]}>
                <Text style={[styles.calendarDayText, isToday && styles.calendarDayTextToday]}>
                  {day}
                </Text>
              </View>
            );
          })}
        </View>

        <View style={styles.calendarLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, styles.legendColorLow]} />
            <Text style={styles.legendText}>Low</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, styles.legendColorHigh]} />
            <Text style={styles.legendText}>High</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <CivfitScreen>
      {/* Hero Section */}
      <View style={styles.hero}>
        <Text style={styles.heroKicker}>REALITA CENTER</Text>
        <Text style={styles.heroTitle}>Habit Inventory</Text>
        <Text style={styles.heroSubtitle}>{new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })}</Text>
      </View>

      {/* Progress Dashboard */}
      <View style={styles.dashboardCard}>
        <View style={styles.dashboardRow}>
          <View>
            <Text style={styles.dashboardLabel}>Momentum</Text>
            <Text style={styles.dashboardValue}>{stats.momentum}%</Text>
          </View>
          <View style={styles.momentumBadge}>
            <Text style={styles.momentumBadgeText}>{momentumLabel}</Text>
          </View>
        </View>

        <View style={styles.progressBlock}>
          <View style={styles.progressMeta}>
            <Text style={styles.progressLabel}>Habit Execution</Text>
            <Text style={styles.progressPercent}>{Math.round(completionRate * 100)}%</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${completionRate * 100}%` }]} />
          </View>
        </View>

        <View style={styles.dashboardActions}>
          <Pressable
            style={[styles.button, styles.primaryButton]}
            onPress={() => setIsAdding(!isAdding)}>
            <Text style={styles.primaryButtonText}>{isAdding ? 'CLOSE' : '➕ ADD HABIT'}</Text>
          </Pressable>
          <Pressable style={[styles.button, styles.endDayButton]} onPress={endDay}>
            <Text style={styles.endDayButtonText}>END DAY</Text>
          </Pressable>
        </View>
      </View>

      {/* View Mode Switcher */}
      <View style={styles.viewSwitcher}>
        <Pressable 
          style={[styles.viewTab, viewMode === 'habits' && styles.viewTabActive]}
          onPress={() => setViewMode('habits')}>
          <Text style={[styles.viewTabText, viewMode === 'habits' && styles.viewTabTextActive]}>📋 HABITS</Text>
        </Pressable>
        <Pressable 
          style={[styles.viewTab, viewMode === 'logs' && styles.viewTabActive]}
          onPress={() => setViewMode('logs')}>
          <Text style={[styles.viewTabText, viewMode === 'logs' && styles.viewTabTextActive]}>📅 LOGS</Text>
        </Pressable>
      </View>

      {/* Calendar View */}
      {viewMode === 'logs' && renderCalendar()}

      {/* Habits View */}
      {viewMode === 'habits' && (
        <>
          {/* Add/Edit Habit Form */}
          {isAdding && (
            <View style={styles.formCard}>
              <Text style={styles.formTitle}>{editingHabitId ? 'MODIFY HABIT' : 'CREATE HABIT'}</Text>
              <TextInput
                autoFocus
                style={styles.habitInput}
                placeholder="Habit name..."
                placeholderTextColor="#999"
                value={newHabit}
                onChangeText={setNewHabit}
              />
              <View style={styles.typeSelector}>
                {(['daily', 'weekly', 'monthly'] as const).map((type) => (
                  <Pressable
                    key={type}
                    style={[styles.typeOption, habitType === type && styles.typeOptionActive]}
                    onPress={() => setHabitType(type)}>
                    <Text
                      style={[
                        styles.typeOptionText,
                        habitType === type && styles.typeOptionActiveText,
                      ]}>
                      {type.toUpperCase()}
                    </Text>
                  </Pressable>
                ))}
              </View>
              <View style={styles.formActions}>
                <Pressable style={[styles.button, styles.cancelButton]} onPress={() => { setIsAdding(false); setEditingHabitId(null); setNewHabit(''); }}>
                  <Text style={styles.cancelButtonText}>CANCEL</Text>
                </Pressable>
                <Pressable style={[styles.button, styles.saveButton]} onPress={handleSaveHabit}>
                  <Text style={styles.saveButtonText}>{editingHabitId ? 'UPDATE' : 'CREATE'}</Text>
                </Pressable>
              </View>
            </View>
          )}

          {/* Filter Tabs */}
          <View style={styles.filterTabs}>
            {(['all', 'daily', 'weekly', 'monthly'] as const).map((f) => (
              <Pressable
                key={f}
                style={[styles.filterTab, filter === f && styles.filterTabActive]}
                onPress={() => setFilter(f)}>
                <Text style={[styles.filterTabText, filter === f && styles.filterTabActiveText]}>
                  {f === 'all' ? 'ALL' : f.toUpperCase()}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Habits List */}
          <View style={styles.habitsList}>
            {filteredHabits.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateEmoji}>⏳</Text>
                <Text style={styles.emptyStateTitle}>NO HABITS YET</Text>
                <Text style={styles.emptyStateText}>Create your first habit to start building momentum!</Text>
                <Pressable 
                  style={[styles.button, styles.primaryButton, { marginTop: 12 }]}
                  onPress={() => setIsAdding(true)}>
                  <Text style={styles.primaryButtonText}>➕ CREATE HABIT</Text>
                </Pressable>
              </View>
            ) : (
              filteredHabits.map((habit) => {
                const completed = isHabitCompleted(habit.id);
                const isEmergency = habit.title.startsWith('Mitigasi:');
                const statusEmoji = completed ? '🔥' : isEmergency ? '🚨' : '⏳';
                
                return (
                  <Pressable 
                    key={habit.id} 
                    style={[
                      styles.habitCard,
                      completed && styles.habitCardCompleted,
                      isEmergency && styles.habitCardEmergency,
                    ]}
                    onPress={() => handleCompleteHabit(habit.id)}>
                    <View style={[styles.habitEmoji, completed && styles.habitEmojiCompleted]}>
                      <Text style={styles.habitEmojiText}>{statusEmoji}</Text>
                    </View>
                    <View style={styles.habitContent}>
                      <View style={styles.habitTitleRow}>
                        <Text style={[styles.habitTitle, completed && styles.habitTitleCompleted]}>
                          {habit.title}
                        </Text>
                        {habit.currentStreak > 0 && (
                          <View style={styles.streakBadge}>
                            <Text style={styles.streakText}>🔥 {habit.currentStreak}</Text>
                          </View>
                        )}
                        {isEmergency && (
                          <View style={styles.urgentBadge}>
                            <Text style={styles.urgentText}>URGENT</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.habitMeta}>
                        {habit.type.toUpperCase()} • +{habit.goldReward}G • +{habit.expReward}X
                      </Text>
                    </View>
                    <Pressable
                      style={styles.habitEditBtn}
                      onPress={() => startEditHabit(habit)}>
                      <Text style={styles.habitEditBtnText}>✏️</Text>
                    </Pressable>
                  </Pressable>
                );
              })
            )}
          </View>
        </>
      )}

      {/* Pending Report */}
      {stats.pendingReport && (
        <View style={styles.reportCard}>
          <Text style={styles.reportTitle}>📋 MORNING REPORT</Text>
          <View style={styles.reportStats}>
            <View style={styles.reportStat}>
              <Text style={styles.reportLabel}>Completed</Text>
              <Text style={styles.reportValue}>{stats.pendingReport.habitsCompleted}/{stats.pendingReport.habitsTotal}</Text>
            </View>
            <View style={styles.reportStat}>
              <Text style={styles.reportLabel}>Gold</Text>
              <Text style={styles.reportValue}>+{stats.pendingReport.goldGained}</Text>
            </View>
            <View style={styles.reportStat}>
              <Text style={styles.reportLabel}>EXP</Text>
              <Text style={styles.reportValue}>+{stats.pendingReport.expGained}</Text>
            </View>
          </View>
          <Pressable style={[styles.button, styles.primaryButton]} onPress={closeReport}>
            <Text style={styles.primaryButtonText}>DISMISS</Text>
          </Pressable>
        </View>
      )}
    </CivfitScreen>
  );
}

const styles = StyleSheet.create({
  hero: {
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  heroKicker: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
    color: '#666',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1F2228',
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  dashboardCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#1F2228',
    borderRadius: 16,
    padding: 16,
    gap: 12,
    shadowColor: '#1F2228',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 0,
    elevation: 3,
  },
  dashboardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  dashboardLabel: {
    fontSize: 11,
    fontWeight: '900',
    color: '#999',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  dashboardValue: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1F2228',
  },
  momentumBadge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#1F2228',
  },
  momentumBadgeText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#1F2228',
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
    fontSize: 11,
    fontWeight: '900',
    color: '#666',
    textTransform: 'uppercase',
  },
  progressPercent: {
    fontSize: 12,
    fontWeight: '900',
    color: '#1F2228',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#1F2228',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00CED1',
  },
  dashboardActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#1F2228',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#DC143C',
  },
  primaryButtonText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  endDayButton: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  endDayButtonText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#1F2228',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  viewSwitcher: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
  },
  viewTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#DDD',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  viewTabActive: {
    backgroundColor: '#1F2228',
    borderColor: '#1F2228',
  },
  viewTabText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#999',
    textTransform: 'uppercase',
  },
  viewTabTextActive: {
    color: '#FFFFFF',
  },
  calendarCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#1F2228',
    borderRadius: 16,
    padding: 14,
    gap: 12,
    shadowColor: '#1F2228',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 0,
    elevation: 3,
    marginBottom: 12,
  },
  calendarTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#1F2228',
    textTransform: 'uppercase',
  },
  calendarMonth: {
    fontSize: 10,
    color: '#999',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  dayLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  dayLabel: {
    width: '14.28%',
    textAlign: 'center',
    fontSize: 8,
    fontWeight: '900',
    color: '#999',
    textTransform: 'uppercase',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 2,
  },
  calendarDay: {
    width: '14.28%',
    aspectRatio: 1,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#DDD',
    backgroundColor: '#F9F9F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarDayEmpty: {
    width: '14.28%',
  },
  calendarDayToday: {
    backgroundColor: '#DC143C',
    borderColor: '#DC143C',
  },
  calendarDayActive: {
    backgroundColor: '#D1E7E4',
    borderColor: '#00CED1',
  },
  calendarDayText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#1F2228',
  },
  calendarDayTextToday: {
    color: '#FFFFFF',
  },
  calendarLegend: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#DDD',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendColor: {
    width: 8,
    height: 8,
    borderRadius: 2,
  },
  legendColorLow: {
    backgroundColor: '#F9F9F9',
    borderWidth: 1,
    borderColor: '#DDD',
  },
  legendColorHigh: {
    backgroundColor: '#D1E7E4',
  },
  legendText: {
    fontSize: 8,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#1F2228',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    shadowColor: '#1F2228',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 0,
    elevation: 3,
    marginBottom: 12,
  },
  formTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#1F2228',
    textTransform: 'uppercase',
  },
  habitInput: {
    borderWidth: 2,
    borderColor: '#1F2228',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#1F2228',
    fontWeight: '600',
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 6,
  },
  typeOption: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#DDD',
    alignItems: 'center',
  },
  typeOptionActive: {
    backgroundColor: '#1F2228',
    borderColor: '#1F2228',
  },
  typeOptionText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#666',
    textTransform: 'uppercase',
  },
  typeOptionActiveText: {
    color: '#FFFFFF',
  },
  formActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  cancelButtonText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#1F2228',
    textTransform: 'uppercase',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#00CED1',
  },
  saveButtonText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  filterTabs: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#DDD',
    alignItems: 'center',
  },
  filterTabActive: {
    backgroundColor: '#1F2228',
    borderColor: '#1F2228',
  },
  filterTabText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#666',
    textTransform: 'uppercase',
  },
  filterTabActiveText: {
    color: '#FFFFFF',
  },
  habitsList: {
    gap: 8,
  },
  emptyState: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyStateEmoji: {
    fontSize: 36,
    marginBottom: 8,
  },
  emptyStateTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#1F2228',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  emptyStateText: {
    fontSize: 11,
    color: '#999',
    textAlign: 'center',
  },
  habitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#1F2228',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 12,
    shadowColor: '#1F2228',
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 0,
    elevation: 2,
  },
  habitCardCompleted: {
    backgroundColor: '#F5F5F5',
    borderColor: '#DDD',
    opacity: 0.7,
  },
  habitCardEmergency: {
    borderColor: '#DC143C',
    borderWidth: 2,
    backgroundColor: '#FFEBEE',
  },
  habitEmoji: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#F5F5F5',
    borderWidth: 2,
    borderColor: '#DDD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  habitEmojiCompleted: {
    backgroundColor: '#D4F1D4',
    borderColor: '#66BB6A',
  },
  habitEmojiText: {
    fontSize: 18,
  },
  habitContent: {
    flex: 1,
  },
  habitTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  habitTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#1F2228',
    flex: 1,
  },
  habitTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  streakBadge: {
    backgroundColor: '#FFE5B4',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  streakText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#FF6B00',
  },
  urgentBadge: {
    backgroundColor: '#DC143C',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  urgentText: {
    fontSize: 7,
    fontWeight: '900',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  habitMeta: {
    fontSize: 9,
    color: '#999',
    fontWeight: '600',
  },
  habitEditBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    borderWidth: 2,
    borderColor: '#DDD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  habitEditBtnText: {
    fontSize: 14,
  },
  reportCard: {
    backgroundColor: '#FFF9E6',
    borderWidth: 2,
    borderColor: '#FFD700',
    borderRadius: 12,
    padding: 14,
    gap: 12,
    marginTop: 12,
  },
  reportTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#1F2228',
    textTransform: 'uppercase',
  },
  reportStats: {
    flexDirection: 'row',
    gap: 12,
  },
  reportStat: {
    flex: 1,
    alignItems: 'center',
  },
  reportLabel: {
    fontSize: 9,
    color: '#999',
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  reportValue: {
    fontSize: 14,
    fontWeight: '900',
    color: '#1F2228',
  },
});