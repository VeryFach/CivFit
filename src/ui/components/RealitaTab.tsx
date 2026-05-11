import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput, Dimensions, Modal } from 'react-native';
import { Habit, HabitType } from '../../core/types';
import { CheckCircle2, Circle, Plus, X, Trash2, Edit3, Calendar as CalendarIcon, Layers, ChevronRight } from 'lucide-react-native';
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { COLORS, THEME } from '../theme';

const { width } = Dimensions.get('window');

interface RealitaTabProps {
  habits: Habit[];
  hp: number;
  momentum: number;
  onAdd: (title: string, type: HabitType) => void;
  onComplete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Habit>) => void;
  onDelete: (id: string) => void;
  onEndDay: () => void;
}

export function RealitaTab({ habits, hp, momentum, onAdd, onComplete, onUpdate, onDelete, onEndDay }: RealitaTabProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [deletingHabitId, setDeletingHabitId] = useState<string | null>(null);
  const [newHabit, setNewHabit] = useState('');
  const [habitType, setHabitType] = useState<HabitType>('daily');
  const [view, setView] = useState<'habits' | 'calendar'>('habits');
  const [categoryFilter, setCategoryFilter] = useState<'all' | HabitType>('all');

  const today = new Date().toISOString().split('T')[0];
  const activeHabits = habits.filter(h => h.type === 'daily');
  const filteredHabits = habits.filter(h => categoryFilter === 'all' || h.type === categoryFilter);

  const completionRate = activeHabits.length > 0 
    ? (activeHabits.filter(h => h.completedDates.includes(today)).length / activeHabits.length) 
    : 0;

  const momentumStatus = momentum >= 80 ? 'Unstoppable' : momentum >= 50 ? 'Steady' : momentum >= 20 ? 'Slow' : 'Stalled';
  const momentumColor = momentum >= 80 ? COLORS.yellow : momentum >= 50 ? COLORS.teal : momentum >= 20 ? COLORS.purple : COLORS.red;

  const handleAdd = () => {
    if (newHabit.trim()) {
      onAdd(newHabit.trim(), habitType);
      setNewHabit('');
      setIsAdding(false);
    }
  };

  const handleUpdate = () => {
    if (editingHabit && newHabit.trim()) {
      onUpdate(editingHabit.id, { title: newHabit.trim(), type: habitType });
      setEditingHabit(null);
      setNewHabit('');
    }
  };

  const startEdit = (habit: Habit) => {
    setEditingHabit(habit);
    setNewHabit(habit.title);
    setHabitType(habit.type);
  };

  return (
    <ScrollView 
      style={styles.scrollView}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Daily Progress Card */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <View>
            <Text style={styles.summaryTitle}>Realita Center</Text>
            <Text style={styles.summarySub}>{new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}</Text>
          </View>
          <View style={styles.tabSwitcher}>
            <Pressable 
              onPress={() => setView('habits')}
              style={[styles.tabBtn, view === 'habits' && styles.tabBtnActive]}
            >
              <Text style={[styles.tabBtnText, view === 'habits' && styles.tabBtnTextActive]}>HABITS</Text>
            </Pressable>
            <Pressable 
              onPress={() => setView('calendar')}
              style={[styles.tabBtn, view === 'calendar' && styles.tabBtnActive]}
            >
              <Text style={[styles.tabBtnText, view === 'calendar' && styles.tabBtnTextActive]}>LOGS</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <View style={styles.statHeader}>
              <Text style={styles.statLabel}>Execution</Text>
              <Text style={[styles.statValue, { color: COLORS.teal }]}>{Math.round(completionRate * 100)}%</Text>
            </View>
            <View style={styles.progressBg}>
              <View style={[styles.progressFill, { width: `${completionRate * 100}%`, backgroundColor: COLORS.teal }]} />
            </View>
          </View>
          <View style={styles.statItem}>
            <View style={styles.statHeader}>
              <Text style={styles.statLabel}>Momentum</Text>
              <Text style={[styles.statValue, { color: momentumColor }]}>{momentum}%</Text>
            </View>
            <View style={styles.progressBg}>
              <View style={[styles.progressFill, { width: `${momentum}%`, backgroundColor: momentumColor }]} />
            </View>
          </View>
        </View>

        <View style={styles.statusFooter}>
          <Layers size={16} color={momentumColor} />
          <View>
            <Text style={styles.statusLabel}>Current State</Text>
            <Text style={[styles.statusValue, { color: momentumColor }]}>Status: {momentumStatus}</Text>
          </View>
        </View>
      </View>

      {/* Habit Controls */}
      <View style={styles.controlsRow}>
        <View style={styles.sectionHeader}>
          <Layers size={14} color={COLORS.teal} />
          <Text style={styles.sectionTitle}>Inventory Habit</Text>
        </View>
        <Pressable 
          onPress={() => setIsAdding(true)}
          style={styles.addButton}
        >
          <Plus size={24} color={COLORS.dark} />
        </Pressable>
      </View>

      {/* Categories */}
      <View style={styles.categoryRow}>
        {['all', 'daily', 'weekly', 'monthly'].map((cat) => (
          <Pressable
            key={cat}
            onPress={() => setCategoryFilter(cat as any)}
            style={[styles.categoryBtn, categoryFilter === cat && styles.categoryBtnActive]}
          >
            <Text style={[styles.categoryBtnText, categoryFilter === cat && styles.categoryBtnTextActive]}>
              {cat.toUpperCase()}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Habits List */}
      <View style={styles.habitList}>
        {filteredHabits.length === 0 ? (
          <View style={styles.emptyState}>
            <CalendarIcon size={32} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>Dunia Hampa?</Text>
            <Text style={styles.emptyDesc}>Belum ada habit yang direncanakan.</Text>
          </View>
        ) : filteredHabits.map((habit) => {
          const isCompleted = habit.completedDates.includes(today);
          const isEmergency = habit.title.startsWith('Mitigasi:');
          
          return (
            <Pressable
              key={habit.id}
              onPress={() => !isCompleted && onComplete(habit.id)}
              style={[
                styles.habitCard,
                isCompleted ? styles.habitCardCompleted : isEmergency ? styles.habitCardEmergency : styles.habitCardNormal
              ]}
            >
              <View style={[
                styles.habitIconBox,
                isCompleted ? styles.habitIconBoxCompleted : isEmergency ? styles.habitIconBoxEmergency : styles.habitIconBoxNormal
              ]}>
                <Text style={{ fontSize: 24 }}>{isCompleted ? '🔥' : isEmergency ? '🚨' : '⏳'}</Text>
              </View>
              <View style={styles.habitMain}>
                <View style={styles.habitTitleRow}>
                  <Text 
                    numberOfLines={1}
                    style={[
                      styles.habitTitle,
                      isCompleted ? styles.habitTitleCompleted : isEmergency ? styles.habitTitleEmergency : styles.habitTitleNormal
                    ]}
                  >
                    {habit.title}
                  </Text>
                  {habit.currentStreak > 0 && (
                    <Text style={styles.streakBadge}>STREAK {habit.currentStreak}</Text>
                  )}
                </View>
                <View style={styles.habitMeta}>
                  <View style={styles.typeBadge}>
                    <Text style={styles.typeBadgeText}>{habit.type}</Text>
                  </View>
                  <Text style={styles.rewardText}>
                    <Text style={{ color: COLORS.teal }}>+{habit.goldReward}G</Text> • <Text style={{ color: COLORS.purple }}>+{habit.expReward}X</Text>
                  </Text>
                </View>
              </View>
              <Pressable 
                onPress={() => startEdit(habit)}
                style={styles.editBtn}
              >
                <Edit3 size={16} color={COLORS.dark} />
              </Pressable>
            </Pressable>
          );
        })}
      </View>

      {/* End Day Button */}
      <View style={styles.footer}>
        <View>
          <Text style={styles.survivalLabel}>Status Survival</Text>
          <View style={[styles.survivalStatus, { backgroundColor: hp < 50 ? COLORS.red : COLORS.teal }]}>
            <Text style={styles.survivalStatusText}>{hp < 50 ? 'LOW HP' : 'STABLE'}</Text>
          </View>
        </View>
        <Pressable 
          onPress={onEndDay}
          style={styles.endDayBtn}
        >
          <Text style={styles.endDayBtnText}>TIBA-TIBA TIDUR</Text>
        </Pressable>
      </View>

      {/* Modal for Add/Edit */}
      {(isAdding || editingHabit) && (
        <Modal
          transparent
          animationType="fade"
          visible={true}
          onRequestClose={() => { setIsAdding(false); setEditingHabit(null); }}
        >
          <Pressable 
            style={styles.modalOverlay}
            onPress={() => { setIsAdding(false); setEditingHabit(null); }}
          >
            <Animated.View 
              entering={SlideInDown}
              exiting={SlideOutDown}
              style={styles.sheet}
              onTouchStart={(e) => e.stopPropagation()}
            >
              <View style={styles.sheetHandle} />
              
              <View style={styles.sheetHeader}>
                <Text style={styles.sheetTitle}>{editingHabit ? 'MODIFIKASI EVOLUSI' : 'INISIASI EVOLUSI'}</Text>
                <Pressable onPress={() => { setIsAdding(false); setEditingHabit(null); }} style={styles.closeBtn}>
                  <X size={24} color={COLORS.dark} />
                </Pressable>
              </View>

              <View style={styles.form}>
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>Judul Habit</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Apa rencana besarmu?"
                    value={newHabit}
                    onChangeText={setNewHabit}
                    autoFocus
                  />
                </View>

                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>Frekuensi Evolusi</Text>
                  <View style={styles.typeRow}>
                    {(['daily', 'weekly', 'monthly'] as HabitType[]).map((type) => (
                      <Pressable
                        key={type}
                        onPress={() => setHabitType(type)}
                        style={[
                          styles.typeBtn, 
                          habitType === type && styles.typeBtnActive,
                          habitType === type && type === 'daily' && { backgroundColor: COLORS.teal },
                          habitType === type && type === 'weekly' && { backgroundColor: COLORS.yellow },
                          habitType === type && type === 'monthly' && { backgroundColor: COLORS.purple }
                        ]}
                      >
                        <Text style={[styles.typeBtnText, habitType === type && styles.typeBtnTextActive]}>{type.toUpperCase()}</Text>
                      </Pressable>
                    ))}
                  </View>
                </View>

                <Pressable 
                  onPress={editingHabit ? handleUpdate : handleAdd}
                  style={styles.submitBtn}
                >
                  <Text style={styles.submitBtnText}>{editingHabit ? 'SIMPAN PERUBAHAN' : 'MULAI EVOLUSI'}</Text>
                </Pressable>

                {editingHabit && (
                  <View style={styles.deleteSection}>
                    {deletingHabitId === editingHabit.id ? (
                      <View style={styles.confirmDelete}>
                        <Pressable 
                          onPress={() => { onDelete(editingHabit.id); setEditingHabit(null); setDeletingHabitId(null); }}
                          style={[styles.deleteActionBtn, { backgroundColor: COLORS.red }]}
                        >
                          <Text style={styles.deleteActionText}>YA, HAPUS SEKARANG</Text>
                        </Pressable>
                        <Pressable 
                          onPress={() => setDeletingHabitId(null)}
                          style={styles.cancelDeleteBtn}
                        >
                          <Text style={styles.cancelDeleteText}>BATAL</Text>
                        </Pressable>
                      </View>
                    ) : (
                      <Pressable 
                        onPress={() => setDeletingHabitId(editingHabit.id)}
                        style={styles.deleteBtn}
                      >
                        <Trash2 size={14} color={COLORS.red} opacity={0.4} />
                        <Text style={styles.deleteBtnText}>HAPUS PERMANEN</Text>
                      </Pressable>
                    )}
                  </View>
                )}
              </View>
            </Animated.View>
          </Pressable>
        </Modal>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  summaryCard: {
    backgroundColor: COLORS.dark,
    ...THEME.neoBorderLg,
    ...THEME.neoShadowLg,
    borderRadius: 40,
    padding: 24,
    marginBottom: 24,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  summaryTitle: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: '900',
    fontStyle: 'italic',
    textTransform: 'uppercase',
  },
  summarySub: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  tabSwitcher: {
    flexDirection: 'row',
    gap: 8,
  },
  tabBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  tabBtnActive: {
    backgroundColor: COLORS.teal,
    borderColor: COLORS.dark,
    ...THEME.neoShadowSm,
  },
  tabBtnText: {
    color: '#FFF',
    fontSize: 8,
    fontWeight: '900',
  },
  tabBtnTextActive: {
    color: COLORS.dark,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  statItem: {
    flex: 1,
    gap: 8,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statLabel: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
    fontStyle: 'italic',
  },
  statValue: {
    fontSize: 12,
    fontWeight: '900',
    fontFamily: 'monospace',
  },
  progressBg: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 4,
    ...THEME.neoBorder,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
  statusFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusLabel: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '900',
    textTransform: 'uppercase',
    fontStyle: 'italic',
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 2,
    color: '#6B7280',
  },
  addButton: {
    backgroundColor: COLORS.teal,
    ...THEME.neoBorder,
    ...THEME.neoShadowSm,
    padding: 8,
    borderRadius: 12,
  },
  categoryRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.bg,
    ...THEME.neoBorder,
    borderRadius: 16,
    padding: 4,
    gap: 4,
    marginBottom: 16,
  },
  categoryBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 12,
  },
  categoryBtnActive: {
    backgroundColor: COLORS.dark,
    ...THEME.neoShadowSm,
  },
  categoryBtnText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#9CA3AF',
  },
  categoryBtnTextActive: {
    color: '#FFF',
  },
  habitList: {
    gap: 12,
  },
  emptyState: {
    padding: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    ...THEME.neoBorderLg,
    borderStyle: 'dashed',
    borderColor: '#E5E7EB',
    borderRadius: 40,
    alignItems: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '900',
    textTransform: 'uppercase',
    fontStyle: 'italic',
    color: COLORS.dark,
  },
  emptyDesc: {
    fontSize: 10,
    fontWeight: '700',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  habitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 28,
    gap: 12,
  },
  habitCardNormal: {
    backgroundColor: '#FFF',
    ...THEME.neoBorder,
    ...THEME.neoShadow,
  },
  habitCardEmergency: {
    backgroundColor: 'rgba(255, 107, 107, 0.05)',
    borderColor: COLORS.red,
    borderWidth: 2,
    ...THEME.neoShadow,
  },
  habitCardCompleted: {
    backgroundColor: '#F9FAFB',
    borderColor: '#F3F4F6',
    borderWidth: 2,
    opacity: 0.6,
  },
  habitIconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    ...THEME.neoBorder,
    ...THEME.neoShadowSm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  habitIconBoxNormal: {
    backgroundColor: '#FFF',
  },
  habitIconBoxEmergency: {
    backgroundColor: COLORS.red,
  },
  habitIconBoxCompleted: {
    backgroundColor: '#E5E7EB',
    borderColor: '#D1D5DB',
  },
  habitMain: {
    flex: 1,
  },
  habitTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  habitTitle: {
    fontWeight: '900',
    textTransform: 'uppercase',
    fontSize: 14,
  },
  habitTitleNormal: {
    color: COLORS.dark,
  },
  habitTitleEmergency: {
    color: COLORS.red,
  },
  habitTitleCompleted: {
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  streakBadge: {
    fontSize: 8,
    fontWeight: '900',
    backgroundColor: COLORS.yellow,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    fontStyle: 'italic',
  },
  habitMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  typeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    borderRadius: 4,
    backgroundColor: COLORS.bg,
  },
  typeBadgeText: {
    fontSize: 7,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  rewardText: {
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    color: '#9CA3AF',
  },
  editBtn: {
    padding: 12,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    borderRadius: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 32,
    paddingTop: 24,
    borderTopWidth: 2,
    borderTopColor: COLORS.dark,
    borderStyle: 'dashed',
  },
  survivalLabel: {
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    opacity: 0.6,
    marginBottom: 4,
  },
  survivalStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    ...THEME.neoBorder,
    borderRadius: 8,
    ...THEME.neoShadowSm,
  },
  survivalStatusText: {
    fontSize: 8,
    fontWeight: '900',
    color: 'white',
  },
  endDayBtn: {
    backgroundColor: COLORS.red,
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 16,
    ...THEME.neoBorderLg,
    ...THEME.neoShadow,
  },
  endDayBtnText: {
    color: '#FFF',
    fontWeight: '900',
    fontSize: 18,
    textTransform: 'uppercase',
    fontStyle: 'italic',
  },
  // Modal Sheet
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(45, 52, 54, 0.2)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    padding: 32,
    borderTopWidth: 4,
    borderTopColor: COLORS.dark,
    ...THEME.neoShadowLg,
    maxHeight: '85%',
  },
  sheetHandle: {
    width: 48,
    height: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 32,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  sheetTitle: {
    fontSize: 24,
    fontWeight: '900',
    fontStyle: 'italic',
    textTransform: 'uppercase',
  },
  closeBtn: {
    padding: 12,
    borderRadius: 16,
    backgroundColor: '#F9FAFB',
    ...THEME.neoBorder,
  },
  form: {
    gap: 32,
  },
  field: {
    gap: 8,
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    color: '#9CA3AF',
    letterSpacing: 2,
    paddingLeft: 4,
  },
  input: {
    fontSize: 24,
    fontWeight: '900',
    textTransform: 'uppercase',
    borderBottomWidth: 4,
    borderBottomColor: COLORS.teal,
    padding: 12,
  },
  typeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#F3F4F6',
  },
  typeBtnActive: {
    borderColor: COLORS.dark,
    ...THEME.neoShadowSm,
  },
  typeBtnText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#D1D5DB',
  },
  typeBtnTextActive: {
    color: COLORS.dark,
  },
  submitBtn: {
    backgroundColor: COLORS.teal,
    ...THEME.neoBorderLg,
    borderRadius: 32,
    paddingVertical: 20,
    alignItems: 'center',
    ...THEME.neoShadow,
  },
  submitBtnText: {
    fontSize: 20,
    fontWeight: '900',
    fontStyle: 'italic',
    color: COLORS.dark,
    textTransform: 'uppercase',
  },
  deleteSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F9FAFB',
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  deleteBtnText: {
    fontSize: 10,
    fontWeight: '900',
    color: 'rgba(255, 107, 107, 0.4)',
    textTransform: 'uppercase',
  },
  confirmDelete: {
    flexDirection: 'row',
    gap: 8,
  },
  deleteActionBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    ...THEME.neoBorder,
    alignItems: 'center',
  },
  deleteActionText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '900',
  },
  cancelDeleteBtn: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 16,
    ...THEME.neoBorder,
    backgroundColor: '#FFF',
    alignItems: 'center',
  },
  cancelDeleteText: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.dark,
  }
});
