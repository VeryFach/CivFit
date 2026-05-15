import LevelUpPopup from '@/components/common/LevelUpPopup';
import SleepAnimation from '@/components/common/SleepAnimation';
import { DayReport } from '@/core/progression/engine';
import Reality from '@/features/habits/reality';
import DailyReportOverlay from '@/features/progression/DailyReportOverlay';
import { useCivStore } from '@/store';
import React, { useEffect, useRef, useState } from 'react';
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
    const [levelUpCelebration, setLevelUpCelebration] = useState<{ level: number; levelUpCount: number } | null>(null);

    const hasInitializedLevelRef = useRef(false);
    const lastSeenLevelRef = useRef(stats.level);

    useEffect(() => {
        if (!hasInitializedLevelRef.current) {
            hasInitializedLevelRef.current = true;
            lastSeenLevelRef.current = stats.level;
            return;
        }

        if (stats.level > lastSeenLevelRef.current) {
            setLevelUpCelebration({
                level: stats.level,
                levelUpCount: stats.level - lastSeenLevelRef.current,
            });
        }

        lastSeenLevelRef.current = stats.level;
    }, [stats.level]);

    const handleEndDay = async () => {
        const result = await endDay();
        if (result) {
            setReport(result);
            setSleepState('animating');
        }
    };

    const handleAnimationFinish = () => {
        setSleepState('summary');
    };

    const handleCloseLevelUp = () => {
        setLevelUpCelebration(null);
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
                dayCount={stats.dayCount}
                onAdd={addHabit}
                onComplete={completeHabit}
                onUpdate={updateHabit}
                onDelete={deleteHabit}
                onEndDay={handleEndDay}
            />
            <SleepAnimation visible={sleepState === 'animating'} onFinish={handleAnimationFinish} />
            {levelUpCelebration && (
                <LevelUpPopup
                    visible
                    level={levelUpCelebration.level}
                    levelUpCount={levelUpCelebration.levelUpCount}
                    onClose={handleCloseLevelUp}
                />
            )}
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