import SleepAnimation from '@/components/common/SleepAnimation';
import { DayReport } from '@/core/progression/engine';
import Reality from '@/features/habits/reality';
import DailyReportOverlay from '@/features/progression/DailyReportOverlay';
import { useCivStore } from '@/store';
import React, { useState } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';

export default function RealitaTab() {
    const habits = useCivStore((state) => state.habits);
    const logs = useCivStore((state) => state.logs);
    const stats = useCivStore((state) => state.stats);
    const addHabit = useCivStore((state) => state.addHabit);
    const completeHabit = useCivStore((state) => state.completeHabit);
    const updateHabit = useCivStore((state) => state.updateHabit);
    const deleteHabit = useCivStore((state) => state.deleteHabit);
    const endDay = useCivStore((state) => state.endDay);

    const [sleepState, setSleepState] = useState<'idle' | 'animating' | 'summary'>('idle');
    const [report, setReport] = useState<DayReport | null>(null);

    const handleEndDay = async () => {
        const result = await endDay();
        if (result) { // ✅ hanya set jika result ada (bukan undefined)
            setReport(result);
            setSleepState('animating');
        }
    };

    const handleAnimationFinish = () => {
        setSleepState('summary');
    };

    const handleCloseReport = () => {
        setSleepState('idle');
        setReport(null);
    };

    return (
        <SafeAreaView style={styles.container}>
            <Reality
                habits={habits}
                logs={logs}
                hp={stats.hp}
                momentum={stats.momentum}
                onAdd={addHabit}
                onComplete={completeHabit}
                onUpdate={updateHabit}
                onDelete={deleteHabit}
                onEndDay={handleEndDay}
            />
            <SleepAnimation visible={sleepState === 'animating'} onFinish={handleAnimationFinish} />
            {sleepState === 'summary' && report && (
                <DailyReportOverlay
                    report={report}
                    stats={stats}
                    onClose={handleCloseReport}
                />
            )}
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