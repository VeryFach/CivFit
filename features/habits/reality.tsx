import { ActivityLog, Habit, HabitType } from '@/core/types';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
    Calendar as CalendarIcon,
    Edit3,
    Layers,
    Plus,
    Trash2,
    X
} from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Text as RNText,
    ScrollView,
    StyleSheet,
    TextInput,
    TextProps,
    TouchableOpacity,
    View,
} from 'react-native';

interface RealitaTabProps {
    habits: Habit[];
    logs: ActivityLog[];
    hp: number;
    momentum: number;
    dayCount: number;
    onAdd: (title: string, type: HabitType) => void;
    onComplete: (id: string) => void;
    onUpdate: (id: string, updates: Partial<Habit>) => void;
    onDelete: (id: string) => void;
    onEndDay: () => void;
}

export default function RealitaTab({
    habits,
    logs,
    hp,
    momentum,
    dayCount,
    onAdd,
    onComplete,
    onUpdate,
    onDelete,
    onEndDay,
}: RealitaTabProps) {
    const isDarkMode = useColorScheme() === 'dark';
    const palette = isDarkMode
        ? { screen: '#0F172A', card: '#1E293B', border: '#334155' }
        : { screen: '#F8FAFC', card: '#FFFFFF', border: '#E2E8F0' };
    const [isAdding, setIsAdding] = useState(false);
    const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
    const [deletingHabitId, setDeletingHabitId] = useState<string | null>(null);
    const [newHabit, setNewHabit] = useState('');
    const [habitType, setHabitType] = useState<HabitType>('daily');
    const [view, setView] = useState<'habits' | 'calendar'>('habits');
    const [categoryFilter, setCategoryFilter] = useState<'all' | HabitType>('all');

    const slideAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    const getLocalDateKey = (value: string | Date) => {
        const date = value instanceof Date ? value : new Date(value);

        if (Number.isNaN(date.getTime())) {
            return typeof value === 'string' ? value.slice(0, 10) : '';
        }

        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    };

    const habitDayKey = `day-${dayCount}`;
    const todayDateKey = getLocalDateKey(new Date());
    const activeHabits = habits.filter(h => h.type === 'daily');
    const filteredHabits = habits.filter(h => categoryFilter === 'all' || h.type === categoryFilter);

    const completionRate = activeHabits.length > 0
        ? activeHabits.filter(h => h.completedDates.includes(habitDayKey)).length / activeHabits.length
        : 0;

    const normalizeHabitTitle = (value: string) => value.trim().replace(/\s+/g, ' ').toUpperCase();

    const momentumStatus =
        momentum >= 80 ? 'Unstoppable' :
            momentum >= 50 ? 'Steady' :
                momentum >= 20 ? 'Slow' : 'Stalled';

    const momentumColor =
        momentum >= 80 ? '#FBBF24' :
            momentum >= 50 ? '#14B8A6' :
                momentum >= 20 ? '#8B5CF6' : '#EF4444';

    const Text = ({ style, ...rest }: TextProps) => (
        <RNText
            {...rest}
            style={style}
            allowFontScaling
            maxFontSizeMultiplier={1.2}
        />
    );

    const handleAdd = () => {
        const normalizedTitle = normalizeHabitTitle(newHabit);

        if (normalizedTitle) {
            onAdd(normalizedTitle, habitType);
            setNewHabit('');
            setIsAdding(false);
        }
    };

    const handleUpdate = () => {
        const normalizedTitle = normalizeHabitTitle(newHabit);

        if (editingHabit && normalizedTitle) {
            onUpdate(editingHabit.id, { title: normalizedTitle, type: habitType });
            setEditingHabit(null);
            setNewHabit('');
        }
    };

    const getDefaultHabitType = () => {
        return categoryFilter === 'all' ? 'daily' : categoryFilter;
    };

    const startEdit = (habit: Habit) => {
        setEditingHabit(habit);
        setNewHabit(habit.title);
        setHabitType(habit.type);
        openBottomSheet(habit.type);
    };

    const openBottomSheet = (defaultType: HabitType = getDefaultHabitType()) => {
        setHabitType(defaultType);
        setIsAdding(true);
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
        ]).start();
    };

    const closeBottomSheet = () => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
        ]).start(() => {
            setIsAdding(false);
            setEditingHabit(null);
            setNewHabit('');
            setDeletingHabitId(null);
        });
    };

    // Calendar rendering
    const renderCalendar = () => {
        const now = new Date();
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).getDay();
        const offset = firstDay === 0 ? 6 : firstDay - 1;
        const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        const habitLogs = logs.filter(log => log.type === 'habit');
        const todayCompletionCount = habits.filter(h => h.completedDates.includes(habitDayKey)).length;

        const monthLogCounts = new Map<string, number>();
        habitLogs.forEach(log => {
            const dateKey = getLocalDateKey(log.timestamp);
            if (dateKey.startsWith(monthKey)) {
                monthLogCounts.set(dateKey, (monthLogCounts.get(dateKey) ?? 0) + 1);
            }
        });

        const heatColors = [
            '#E2E8F0',
            '#BBF7D0',
            '#86EFAC',
            '#22C55E',
            '#15803D',
        ];

        const getHeatLevel = (count: number) => {
            if (count <= 0) return 0;
            if (count === 1) return 1;
            if (count === 2) return 2;
            if (count === 3) return 3;
            return 4;
        };

        const days: (number | null)[] = [];
        for (let i = 0; i < offset; i++) days.push(null);
        for (let i = 1; i <= daysInMonth; i++) days.push(i);

        const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

        return (
            <View style={[styles.calendarCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
                <View style={styles.calendarHeader}>
                    <Text style={styles.calendarTitle}>Activity History</Text>
                    <View style={styles.calendarMonthBadge}>
                        <Text style={styles.calendarMonthText}>
                            {now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </Text>
                    </View>
                </View>

                <View style={styles.weekDaysRow}>
                    {weekDays.map(d => (
                        <Text key={d} style={styles.weekDayText}>{d}</Text>
                    ))}
                </View>

                <View style={styles.calendarGrid}>
                    {days.map((day, idx) => {
                        if (day === null) {
                            return <View key={`empty-${idx}`} style={styles.calendarDayCell} />;
                        }
                        const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                        const isToday = dateStr === todayDateKey;
                        const logCount = monthLogCounts.get(dateStr) ?? 0;
                        const combinedCount = logCount + (isToday ? todayCompletionCount : 0);
                        const heatLevel = getHeatLevel(combinedCount);

                        return (
                            <TouchableOpacity
                                key={day}
                                style={[
                                    styles.calendarDayCell,
                                    isToday && styles.calendarDayToday,
                                    { backgroundColor: heatColors[heatLevel] },
                                ]}
                                activeOpacity={0.7}
                            >
                                <Text
                                    style={[
                                        styles.calendarDayText,
                                        heatLevel >= 3 && styles.calendarDayTextToday,
                                        isToday && styles.calendarDayTextToday,
                                    ]}
                                >
                                    {day}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                <View style={styles.calendarLegend}>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendBox, { backgroundColor: heatColors[0] }]} />
                        <Text style={styles.legendText}>No logs</Text>
                    </View>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendBox, { backgroundColor: heatColors[2] }]} />
                        <Text style={styles.legendText}>Medium</Text>
                    </View>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendBox, { backgroundColor: heatColors[4] }]} />
                        <Text style={styles.legendText}>High</Text>
                    </View>
                </View>
            </View>
        );
    };

    // Progress bar animations
    const completionWidth = useRef(new Animated.Value(0)).current;
    const momentumWidth = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(completionWidth, {
            toValue: completionRate * 100,
            duration: 500,
            useNativeDriver: false,
        }).start();
        Animated.timing(momentumWidth, {
            toValue: momentum,
            duration: 500,
            useNativeDriver: false,
        }).start();
    }, [completionRate, momentum]);

    return (
        <ScrollView style={[styles.container, { backgroundColor: palette.screen }]} showsVerticalScrollIndicator={false}>
            {/* Daily Progress Card */}
            <View
                style={[
                    styles.progressCard,
                    {
                        backgroundColor: isDarkMode ? palette.card : '#FFFFFF',
                        borderColor: isDarkMode ? palette.border : '#CBD5E1',
                        shadowOpacity: isDarkMode ? 0.15 : 0.08,
                    },
                ]}
            >
                <View style={styles.progressHeader}>
                    <View>
                        <Text style={[styles.progressTitle, { color: isDarkMode ? '#FFFFFF' : '#1E293B' }]}>Reality Center</Text>
                        <Text style={[styles.progressDate, { color: isDarkMode ? 'rgba(255,255,255,0.4)' : '#64748B' }]}>
                            {new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </Text>
                    </View>
                    <View style={styles.viewToggle}>
                        <TouchableOpacity
                            style={[
                                styles.viewButton,
                                {
                                    backgroundColor: !isDarkMode ? '#FFFFFF' : 'transparent',
                                    borderColor: !isDarkMode ? '#CBD5E1' : '#334155',
                                },
                                view === 'habits' && styles.viewButtonActiveHabits,
                            ]}
                            onPress={() => setView('habits')}
                        >
                            <Text style={[
                                styles.viewButtonText,
                                { color: isDarkMode ? 'rgba(255,255,255,0.6)' : '#475569' },
                                view === 'habits' && styles.viewButtonTextActive,
                            ]}>HABITS</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.viewButton,
                                {
                                    backgroundColor: !isDarkMode ? '#FFFFFF' : 'transparent',
                                    borderColor: !isDarkMode ? '#CBD5E1' : '#334155',
                                },
                                view === 'calendar' && styles.viewButtonActiveCalendar,
                            ]}
                            onPress={() => setView('calendar')}
                        >
                            <Text style={[
                                styles.viewButtonText,
                                { color: isDarkMode ? 'rgba(255,255,255,0.6)' : '#475569' },
                                view === 'calendar' && styles.viewButtonTextActive,
                            ]}>LOGS</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.progressStats}>
                    <View style={styles.statItem}>
                        <View style={styles.statHeader}>
                            <Text style={[styles.statLabel, { color: isDarkMode ? 'rgba(255,255,255,0.4)' : '#64748B' }]}>Habit Execution</Text>
                            <Text style={styles.statValue}>{Math.round(completionRate * 100)}%</Text>
                        </View>
                        <View style={styles.progressBarBg}>
                            <Animated.View style={[
                                styles.progressBarFill,
                                {
                                    width: completionWidth.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }),
                                    backgroundColor: '#14B8A6',
                                },
                            ]} />
                        </View>
                    </View>
                    <View style={styles.statItem}>
                        <View style={styles.statHeader}>
                            <Text style={[styles.statLabel, { color: isDarkMode ? 'rgba(255,255,255,0.4)' : '#64748B' }]}>Momentum (Snowball)</Text>
                            <Text style={[styles.statValue, { color: momentumColor }]}>{momentum}%</Text>
                        </View>
                        <View style={styles.progressBarBg}>
                            <Animated.View style={[
                                styles.progressBarFill,
                                {
                                    width: momentumWidth.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }),
                                    backgroundColor: momentumColor,
                                },
                            ]} />
                        </View>
                    </View>
                </View>

                <View style={styles.momentumStatus}>
                    <View style={[styles.momentumIcon, { borderColor: momentumColor, backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#FFFFFF' }]}>
                        <Layers size={16} color={momentumColor} />
                    </View>
                    <View>
                        <Text style={[styles.momentumLabel, { color: isDarkMode ? 'rgba(255,255,255,0.4)' : '#64748B' }]}>Current State</Text>
                        <Text style={[styles.momentumValue, { color: momentumColor }]}>System Status: {momentumStatus}</Text>
                    </View>
                </View>
            </View>

            {view === 'calendar' ? (
                renderCalendar()
            ) : (
                <View style={styles.habitsSection}>
                    <View style={styles.habitsHeader}>
                        <View style={styles.habitsTitleWrapper}>
                            <Layers size={16} color="#14B8A6" />
                            <Text style={styles.habitsTitle}>Your Habits</Text>
                        </View>
                        <TouchableOpacity style={styles.addButton} onPress={() => openBottomSheet()}>
                            <Plus size={20} color="#1E293B" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.filterTabs}>
                        {(['all', 'daily', 'weekly', 'monthly'] as const).map(cat => (
                            <TouchableOpacity
                                key={cat}
                                style={[styles.filterTab, categoryFilter === cat && styles.filterTabActive]}
                                onPress={() => setCategoryFilter(cat)}
                            >
                                <Text style={[styles.filterTabText, categoryFilter === cat && styles.filterTabTextActive]}>
                                    {cat}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View style={styles.habitsList}>
                        {filteredHabits.length === 0 ? (
                            <View style={styles.emptyState}>
                                <View style={styles.emptyIcon}>
                                    <CalendarIcon size={32} color="#CBD5E1" />
                                </View>
                                <Text style={styles.emptyTitle}>Nothing here?</Text>
                                <Text style={styles.emptyDesc}>
                                    No habits planned yet.{'\n'}Start your first evolution!
                                </Text>
                                <TouchableOpacity style={styles.emptyButton} onPress={() => openBottomSheet()}>
                                    <Text style={styles.emptyButtonText}>Add Habit</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            filteredHabits.map(habit => {
                                const isCompleted = habit.completedDates.includes(habitDayKey);
                                const isEmergency = habit.title.startsWith('Mitigasi:');
                                return (
                                    <TouchableOpacity
                                        key={habit.id}
                                        style={[
                                            styles.habitCard,

                                            isCompleted && (
                                                isDarkMode
                                                    ? styles.habitCardCompletedDark
                                                    : styles.habitCardCompleted
                                            ),

                                            isEmergency && styles.habitCardEmergency,

                                            !isCompleted && !isEmergency && (
                                                isDarkMode
                                                    ? styles.habitCardActiveDark
                                                    : styles.habitCardActive
                                            ),
                                        ]}
                                        onPress={() => !isCompleted && onComplete(habit.id)}
                                        activeOpacity={0.8}
                                    >
                                        <View style={[
                                            styles.habitIcon,
                                            isCompleted && styles.habitIconCompleted,
                                            isEmergency && styles.habitIconEmergency,
                                        ]}>
                                            <Text style={styles.habitIconText}>
                                                {isCompleted ? '🔥' : isEmergency ? '🚨' : '⏳'}
                                            </Text>
                                        </View>
                                        <View style={styles.habitInfo}>
                                            <View style={styles.habitTitleRow}>
                                                <Text style={[
                                                    styles.habitTitle,
                                                    isDarkMode &&
                                                    !isCompleted &&
                                                    !isEmergency &&
                                                    styles.habitTitleDark,
                                                    isCompleted && styles.habitTitleCompleted,
                                                    isEmergency && styles.habitTitleEmergency,
                                                ]}>
                                                    {habit.title}
                                                </Text>
                                                {isEmergency && <Text style={styles.urgentBadge}>URGENT</Text>}
                                                {habit.currentStreak > 0 && (
                                                    <Text style={styles.streakBadge}>STREAK {habit.currentStreak}</Text>
                                                )}
                                            </View>
                                            <View style={styles.habitMeta}>
                                                <Text style={[styles.habitType, isCompleted && styles.habitTypeCompleted]}>
                                                    {habit.type}
                                                </Text>
                                                <Text style={styles.habitRewards}>
                                                    <Text style={{ color: '#14B8A6' }}>+ {habit.goldReward}G</Text>
                                                    {' • '}
                                                    <Text style={{ color: '#8B5CF6' }}>+ {habit.expReward}X</Text>
                                                </Text>
                                            </View>
                                        </View>
                                        <TouchableOpacity
                                            style={styles.editButton}
                                            onPress={() => startEdit(habit)}
                                        >
                                            <Edit3 size={16} color="#94A3B8" />
                                        </TouchableOpacity>
                                    </TouchableOpacity>
                                );
                            })
                        )}
                    </View>
                </View>
            )}

            <View style={styles.footer}>
                <View style={styles.hpStatus}>
                    <Text style={styles.hpLabel}>Survival Status</Text>
                    <View style={styles.hpBadge}>
                        <Text style={[styles.hpBadgeText, hp < 50 && styles.hpBadgeLow]}>
                            {hp < 50 ? 'LOW HP' : 'STABLE'}
                        </Text>
                    </View>
                </View>
                <TouchableOpacity style={styles.endDayButton} onPress={onEndDay}>
                    <Text style={styles.endDayButtonText}>SLEEP NOW</Text>
                </TouchableOpacity>
            </View>

            {/* ─── Bottom Sheet Modal ─── */}
            <Modal
                visible={isAdding}
                transparent
                animationType="none"
                onRequestClose={closeBottomSheet}
                statusBarTranslucent
            >
                {/*
                 * KeyboardAvoidingView wraps the whole modal content.
                 * - iOS  : behavior="padding" mendorong sheet ke atas sebesar tinggi keyboard
                 * - Android : behavior="height" memperkecil area agar sheet tetap terlihat
                 * style flex:1 + justifyContent:'flex-end' agar sheet tetap nempel di bawah
                 */}
                <KeyboardAvoidingView
                    style={styles.keyboardAvoid}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
                >
                    <Animated.View style={[StyleSheet.absoluteFillObject, styles.modalOverlayBg, { opacity: fadeAnim }]}>
                        <TouchableOpacity
                            style={StyleSheet.absoluteFillObject}
                            activeOpacity={1}
                            onPress={closeBottomSheet}
                        />
                    </Animated.View>

                    <Animated.View
                        style={[
                            styles.bottomSheet,
                            isDarkMode && styles.bottomSheetDark,
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
                        <View style={styles.sheetHandle} />
                        <View style={styles.sheetHeader}>
                            <Text
                                style={[
                                    styles.sheetTitle,
                                    isDarkMode && styles.sheetTitleDark,
                                ]}
                            >
                                {editingHabit ? 'Edit Habit' : 'Create Habit'}
                            </Text>
                            <TouchableOpacity
                                onPress={closeBottomSheet}
                                style={[
                                    styles.sheetClose,
                                    isDarkMode && styles.sheetCloseDark,
                                ]}
                            >
                                <X size={24} color={isDarkMode ? '#F8FAFC' : '#1E293B'} />
                            </TouchableOpacity>
                        </View>

                        {/* ScrollView di dalam sheet agar tidak overflow saat keyboard muncul */}
                        <ScrollView
                            style={styles.sheetScroll}
                            contentContainerStyle={styles.sheetScrollContent}
                            keyboardShouldPersistTaps="handled"
                            showsVerticalScrollIndicator={false}
                            bounces={false}
                        >
                            <View style={styles.inputGroup}>
                                <Text style={[
                                    styles.inputLabel,
                                    isDarkMode && styles.inputLabelDark,
                                ]}>Habit Title</Text>
                                <TextInput
                                    autoFocus
                                    style={[styles.input, isDarkMode && styles.inputDark,]}
                                    placeholder="What's your big plan?"
                                    placeholderTextColor="#CBD5E1"
                                    allowFontScaling
                                    maxFontSizeMultiplier={1.2}
                                    autoCapitalize="characters"
                                    autoCorrect={false}
                                    spellCheck={false}
                                    value={newHabit}
                                    onChangeText={setNewHabit}
                                    onSubmitEditing={editingHabit ? handleUpdate : handleAdd}
                                    returnKeyType="done"
                                />
                            </View>

                            <View style={styles.typeGroup}>
                                <Text style={styles.inputLabel}>Frequency</Text>
                                <View style={styles.typeButtons}>
                                    {(['daily', 'weekly', 'monthly'] as HabitType[]).map(type => (
                                        <TouchableOpacity
                                            key={type}
                                            style={[
                                                styles.typeButton, isDarkMode && styles.typeButtonDark,
                                                habitType === type && type === 'daily' && styles.typeButtonDailyActive,
                                                habitType === type && type === 'weekly' && styles.typeButtonWeeklyActive,
                                                habitType === type && type === 'monthly' && styles.typeButtonMonthlyActive,
                                            ]}
                                            onPress={() => setHabitType(type)}
                                        >
                                            <Text style={[
                                                styles.typeButtonText, isDarkMode && styles.typeButtonTextDark,
                                                habitType === type && styles.typeButtonTextActive,
                                            ]}>
                                                {type}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            <View style={styles.sheetActions}>
                                <TouchableOpacity
                                    style={styles.saveButton}
                                    onPress={editingHabit ? handleUpdate : handleAdd}
                                >
                                    <Text style={styles.saveButtonText}>
                                        {editingHabit ? 'SAVE CHANGES' : 'START EVOLUTION'}
                                    </Text>
                                </TouchableOpacity>

                                {editingHabit && (
                                    <View style={[styles.deleteSection, isDarkMode && styles.deleteSectionDark]}>
                                        {deletingHabitId === editingHabit.id ? (
                                            <View style={styles.deleteConfirmRow}>
                                                <TouchableOpacity
                                                    style={styles.deleteConfirmYes}
                                                    onPress={() => {
                                                        onDelete(editingHabit.id);
                                                        closeBottomSheet();
                                                    }}
                                                >
                                                    <Text style={styles.deleteConfirmText}>YES, DELETE NOW</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity
                                                    style={styles.deleteConfirmNo}
                                                    onPress={() => setDeletingHabitId(null)}
                                                >
                                                    <Text style={styles.deleteConfirmTextNo}>CANCEL</Text>
                                                </TouchableOpacity>
                                            </View>
                                        ) : (
                                            <TouchableOpacity
                                                style={styles.deleteButton}
                                                onPress={() => setDeletingHabitId(editingHabit.id)}
                                            >
                                                <Trash2 size={14} color="#EF4444" />
                                                <Text style={styles.deleteButtonText}>DELETE PERMANENTLY</Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                )}
                            </View>
                        </ScrollView>

                        <View style={styles.sheetBottomSafe} />
                    </Animated.View>
                </KeyboardAvoidingView>
            </Modal>
        </ScrollView>
    );
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 80,
    },
    // Progress Card
    progressCard: {
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
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 24,
    },
    progressTitle: {
        fontSize: 28,
        fontWeight: '900',
        fontStyle: 'italic',
        textTransform: 'uppercase',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    progressDate: {
        fontSize: 10,
        fontWeight: '900',
        color: 'rgba(255,255,255,0.4)',
        textTransform: 'uppercase',
    },
    viewToggle: {
        flexDirection: 'row',
        gap: 8,
    },
    viewButton: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#334155',
    },
    viewButtonActiveHabits: {
        backgroundColor: '#14B8A6',
        borderColor: '#0F172A',
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.2,
        elevation: 2,
    },
    viewButtonActiveCalendar: {
        backgroundColor: '#FBBF24',
        borderColor: '#0F172A',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.2,
        elevation: 2,
    },
    viewButtonText: {
        fontSize: 8,
        fontWeight: '900',
        color: 'rgba(255,255,255,0.6)',
        textTransform: 'uppercase',
    },
    viewButtonTextActive: {
        color: '#1E293B',
    },
    progressStats: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 24,
    },
    statItem: {
        flex: 1,
    },
    statHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    statLabel: {
        fontSize: 9,
        fontWeight: '900',
        color: 'rgba(255,255,255,0.4)',
        textTransform: 'uppercase',
    },
    statValue: {
        fontSize: 12,
        fontWeight: '900',
        fontFamily: 'monospace',
        color: '#14B8A6',
    },
    progressBarBg: {
        height: 8,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 4,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 4,
    },
    momentumStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    momentumIcon: {
        padding: 8,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 16,
        borderWidth: 1,
    },
    momentumLabel: {
        fontSize: 10,
        fontWeight: '900',
        color: 'rgba(255,255,255,0.4)',
        textTransform: 'uppercase',
        marginBottom: 2,
    },
    momentumValue: {
        fontSize: 14,
        fontWeight: '900',
        textTransform: 'uppercase',
    },
    // Calendar Card
    calendarCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 40,
        padding: 24,
        borderWidth: 2,
        borderColor: '#E2E8F0',
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 0,
        elevation: 6,
        marginBottom: 24,
    },
    calendarHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    calendarTitle: {
        fontSize: 20,
        fontWeight: '900',
        textTransform: 'uppercase',
        fontStyle: 'italic',
        color: '#1E293B',
    },
    calendarMonthBadge: {
        backgroundColor: '#F1F5F9',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#CBD5E1',
    },
    calendarMonthText: {
        fontSize: 10,
        fontWeight: '900',
        textTransform: 'uppercase',
        color: '#1E293B',
    },
    weekDaysRow: {
        flexDirection: 'row',
        marginBottom: 12,
        paddingHorizontal: 4,
    },
    weekDayText: {
        flex: 1,
        textAlign: 'center',
        fontSize: 8,
        fontWeight: '900',
        color: '#94A3B8',
        textTransform: 'uppercase',
    },
    calendarGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 24,
    },
    calendarDayCell: {
        width: `${100 / 7}%`,
        aspectRatio: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#CBD5E1',
        marginBottom: 4,
    },
    calendarDayToday: {
        borderColor: '#0F172A',
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.2,
        elevation: 4,
        transform: [{ scale: 1.05 }],
        zIndex: 10,
    },
    calendarDayText: {
        fontSize: 12,
        fontWeight: '900',
        color: '#1E293B',
    },
    calendarDayTextToday: {
        color: '#FFFFFF',
    },
    calendarDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#FFFFFF',
        marginTop: 2,
    },
    calendarLegend: {
        flexDirection: 'row',
        gap: 16,
        borderTopWidth: 2,
        borderTopColor: '#1E293B',
        borderStyle: 'dashed',
        paddingTop: 16,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    legendBox: {
        width: 12,
        height: 12,
        borderWidth: 1,
        borderRadius: 4,
    },
    legendText: {
        fontSize: 8,
        fontWeight: '900',
        color: '#94A3B8',
        textTransform: 'uppercase',
    },
    // Habits Section
    habitsSection: {
        marginBottom: 24,
    },
    habitsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        paddingHorizontal: 4,
    },
    habitsTitleWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    habitsTitle: {
        fontSize: 10,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 2,
        color: '#64748B',
    },
    addButton: {
        padding: 8,
        backgroundColor: '#14B8A6',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#0F172A',
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.2,
        elevation: 2,
    },
    filterTabs: {
        flexDirection: 'row',
        backgroundColor: '#F1F5F9',
        borderRadius: 20,
        padding: 4,
        marginBottom: 20,
    },
    filterTab: {
        flex: 1,
        paddingVertical: 8,
        borderRadius: 16,
        alignItems: 'center',
    },
    filterTabActive: {
        backgroundColor: '#1E293B',
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.2,
        elevation: 2,
    },
    filterTabText: {
        fontSize: 9,
        fontWeight: '900',
        textTransform: 'uppercase',
        color: '#94A3B8',
    },
    filterTabTextActive: {
        color: '#FFFFFF',
    },
    habitsList: {
        gap: 12,
    },
    emptyState: {
        paddingVertical: 48,
        paddingHorizontal: 24,
        backgroundColor: 'rgba(255,255,255,0.5)',
        borderRadius: 40,
        borderWidth: 2,
        borderColor: '#E2E8F0',
        borderStyle: 'dashed',
        alignItems: 'center',
    },
    emptyIcon: {
        width: 64,
        height: 64,
        backgroundColor: '#F1F5F9',
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 2,
        borderColor: '#CBD5E1',
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '900',
        textTransform: 'uppercase',
        fontStyle: 'italic',
        color: '#1E293B',
        marginBottom: 8,
    },
    emptyDesc: {
        fontSize: 10,
        fontWeight: '700',
        color: '#94A3B8',
        textAlign: 'center',
        marginBottom: 24,
    },
    emptyButton: {
        backgroundColor: '#14B8A6',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 24,
        borderWidth: 2,
        borderColor: '#0F172A',
        shadowColor: '#000',
        shadowOffset: { width: 3, height: 3 },
        shadowOpacity: 0.2,
        elevation: 4,
    },
    emptyButtonText: {
        fontSize: 10,
        fontWeight: '900',
        textTransform: 'uppercase',
        color: '#1E293B',
    },
    habitCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 28,
        borderWidth: 2,
        marginBottom: 12,
    },
    habitCardCompleted: {
        backgroundColor: '#F8FAFC',
        borderColor: '#E2E8F0',
        shadowColor: '#14B8A6',
        shadowOpacity: 0.15,
        elevation: 3,
    },
    habitCardCompletedDark: {
        backgroundColor: '#0F2E2B',
        borderColor: '#14B8A6',
        borderLeftWidth: 5,

        shadowColor: '#14B8A6',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.25,
        shadowRadius: 8,

        elevation: 4,
    },
    habitCardEmergency: {
        backgroundColor: 'rgba(239,68,68,0.05)',
        borderColor: '#EF4444',
        shadowColor: '#EF4444',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 0.2,
        elevation: 6,
    },
    habitCardActive: {
        backgroundColor: '#FFFFFF',
        borderColor: '#1E293B',
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 0.1,
        elevation: 4,
    },
    habitCardActiveDark: {
        backgroundColor: '#171223',
        borderColor: '#14b86e',

        shadowColor: '#000',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,

        elevation: 4,
    },
    habitIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#CBD5E1',
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.1,
        elevation: 2,
    },
    habitIconCompleted: {
        backgroundColor: '#D1FAE5',
        borderColor: '#A7F3D0',
    },
    habitIconEmergency: {
        backgroundColor: '#EF4444',
    },
    habitIconText: {
        fontSize: 24,
    },
    habitInfo: {
        flex: 1,
    },
    habitTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 6,
        marginBottom: 4,
    },
    habitTitle: {
        fontSize: 14,
        fontWeight: '900',
        textTransform: 'uppercase',
        color: '#1E293B',
    },
    habitTitleDark: {
        color: '#F8FAFC',
    },
    habitTitleCompleted: {
        textDecorationLine: 'line-through',
        color: '#94A3B8',
    },
    habitTitleEmergency: {
        color: '#EF4444',
    },
    urgentBadge: {
        fontSize: 7,
        fontWeight: '900',
        backgroundColor: '#EF4444',
        color: '#FFFFFF',
        paddingHorizontal: 4,
        paddingVertical: 2,
        borderRadius: 4,
    },
    streakBadge: {
        fontSize: 8,
        fontWeight: '900',
        backgroundColor: '#FBBF24',
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
    habitType: {
        fontSize: 7,
        fontWeight: '900',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#CBD5E1',
        backgroundColor: '#F1F5F9',
        color: '#1E293B',
        textTransform: 'uppercase',
    },
    habitTypeCompleted: {
        backgroundColor: '#E2E8F0',
        color: '#94A3B8',
        borderColor: '#CBD5E1',
    },
    habitRewards: {
        fontSize: 9,
        fontWeight: '700',
        color: '#94A3B8',
        textTransform: 'uppercase',
    },
    editButton: {
        padding: 12,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 2,
        borderTopColor: '#1E293B',
        borderStyle: 'dashed',
        paddingTop: 24,
        marginTop: 8,
        marginBottom: 32,
    },
    hpStatus: {
        maxWidth: 120,
    },
    hpLabel: {
        fontSize: 10,
        fontWeight: '900',
        color: '#64748B',
        textTransform: 'uppercase',
    },
    hpBadge: {
        marginTop: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#0F172A',
        backgroundColor: '#14B8A6',
    },
    hpBadgeLow: {
        backgroundColor: '#EF4444',
    },
    hpBadgeText: {
        fontSize: 8,
        fontWeight: '900',
        textTransform: 'uppercase',
        color: '#1E293B',
    },
    endDayButton: {
        backgroundColor: '#EF4444',
        paddingHorizontal: 32,
        paddingVertical: 16,
        borderRadius: 24,
        borderWidth: 2,
        borderColor: '#0F172A',
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 0.2,
        elevation: 6,
    },
    endDayButtonText: {
        fontSize: 18,
        fontWeight: '900',
        fontStyle: 'italic',
        textTransform: 'uppercase',
        color: '#FFFFFF',
    },
    // ─── Modal / Bottom Sheet ───
    keyboardAvoid: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    modalOverlayBg: {
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    bottomSheet: {
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
        // Batasi tinggi maksimum agar tidak memenuhi layar
        maxHeight: screenHeight * 0.85,
    },
    bottomSheetDark: {
        backgroundColor: '#0F172A',
        borderColor: '#334155',
    },
    sheetHandle: {
        width: 48,
        height: 6,
        backgroundColor: '#E2E8F0',
        borderRadius: 3,
        alignSelf: 'center',
        marginTop: 12,
    },
    sheetHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 24,
        paddingBottom: 16,
    },
    sheetTitle: {
        fontSize: 28,
        fontWeight: '900',
        fontStyle: 'italic',
        textTransform: 'uppercase',
        color: '#1E293B',
    },
    sheetTitleDark: {
        color: '#F8FAFC',
    },
    sheetClose: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#CBD5E1',
    },
    sheetCloseDark: {
        backgroundColor: '#1E293B',
        borderColor: '#334155',
    },
    sheetScroll: {
        flexGrow: 0,
    },
    sheetScrollContent: {
        paddingHorizontal: 24,
        paddingBottom: 8,
    },
    inputGroup: {
        marginBottom: 24,
    },
    inputLabel: {
        fontSize: 10,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 2,
        color: '#94A3B8',
        marginBottom: 8,
        paddingHorizontal: 4,
    },
    inputLabelDark: {
        color: '#94A3B8',
    },
    input: {
        fontSize: 24,
        fontWeight: '900',
        borderBottomWidth: 4,
        borderBottomColor: '#14B8A6',
        paddingVertical: 12,
        color: '#1E293B',
    },
    inputDark: {
        color: '#F8FAFC',
        borderBottomColor: '#14B8A6',
    },
    typeGroup: {
        marginBottom: 32,
    },
    typeButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    typeButton: {
        flex: 1,
        paddingVertical: 16,
        borderRadius: 24,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#E2E8F0',
        backgroundColor: '#FFFFFF',
    },
    typeButtonDark: {
        backgroundColor: '#1E293B',
        borderColor: '#334155',
    },
    typeButtonDailyActive: {
        backgroundColor: '#14B8A6',
        borderColor: '#0F172A',
        shadowColor: '#000',
        shadowOffset: { width: 3, height: 3 },
        shadowOpacity: 0.2,
        elevation: 4,
    },
    typeButtonWeeklyActive: {
        backgroundColor: '#FBBF24',
        borderColor: '#0F172A',
        shadowOffset: { width: 3, height: 3 },
        shadowOpacity: 0.2,
        elevation: 4,
    },
    typeButtonMonthlyActive: {
        backgroundColor: '#8B5CF6',
        borderColor: '#0F172A',
        shadowOffset: { width: 3, height: 3 },
        shadowOpacity: 0.2,
        elevation: 4,
    },
    typeButtonText: {
        fontSize: 10,
        fontWeight: '900',
        textTransform: 'uppercase',
        color: '#94A3B8',
    },
    typeButtonTextDark: {
        color: '#F8FAFC',
    },
    typeButtonTextActive: {
        color: '#1E293B',
    },
    sheetActions: {
        marginTop: 16,
    },
    saveButton: {
        backgroundColor: '#14B8A6',
        paddingVertical: 20,
        borderRadius: 32,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#0F172A',
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 0.2,
        elevation: 6,
        marginBottom: 16,
    },
    saveButtonText: {
        fontSize: 20,
        fontWeight: '900',
        fontStyle: 'italic',
        textTransform: 'uppercase',
        color: '#1E293B',
    },
    deleteSection: {
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
    },
    deleteSectionDark: {
        borderTopColor: '#334155',
    },
    deleteConfirmRow: {
        flexDirection: 'row',
        gap: 12,
    },
    deleteConfirmYes: {
        flex: 1,
        backgroundColor: '#EF4444',
        paddingVertical: 16,
        borderRadius: 24,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#0F172A',
    },
    deleteConfirmNo: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        paddingVertical: 16,
        borderRadius: 24,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#CBD5E1',
    },
    deleteConfirmText: {
        fontSize: 12,
        fontWeight: '900',
        color: '#FFFFFF',
        textTransform: 'uppercase',
    },
    deleteConfirmTextNo: {
        fontSize: 12,
        fontWeight: '900',
        color: '#1E293B',
        textTransform: 'uppercase',
    },
    deleteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 12,
    },
    deleteButtonText: {
        fontSize: 10,
        fontWeight: '900',
        color: '#EF4444',
        textTransform: 'uppercase',
    },
    sheetBottomSafe: {
        height: Platform.OS === 'ios' ? 34 : 16,
    },
});