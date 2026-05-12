import React from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import Reality from '@/features/habits/reality';
import endDay from '@/features/progression/DailyReportOverlay';
import { useCivStore } from '@/core/progression/store';

export default function RealitaTab() {
    // Ambil data dan fungsi dari store
    const habits = useCivStore((state) => state.habits);
    const stats = useCivStore((state) => state.stats);
    const addHabit = useCivStore((state) => state.addHabit);
    const completeHabit = useCivStore((state) => state.completeHabit);
    const updateHabit = useCivStore((state) => state.updateHabit);
    const deleteHabit = useCivStore((state) => state.deleteHabit);
    const endDay = useCivStore((state) => state.endDay);

    return (
        <SafeAreaView style={styles.container}>
            <Reality
                habits={habits}
                hp={stats.hp}
                momentum={stats.momentum}
                onAdd={addHabit}
                onComplete={completeHabit}
                onUpdate={updateHabit}
                onDelete={deleteHabit}
                onEndDay={endDay}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
        paddingTop: 80,
    },
});