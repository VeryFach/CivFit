import Evolution from '@/features/evolution/evolution';
import CityScreen from '@/features/simulation/CityScreen';
import { useCivStore } from '@/store';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';

export default function CityTab() {
    const { city, stats, buildings, deployBuilding, upgradeBuilding, removeBuilding, unlockEvolution } = useCivStore();
    const [activeTab, setActiveTab] = useState<'city' | 'evolution'>('city');

    const handleSwitchTab = (tab: string) => {
        if (tab === 'evolution') setActiveTab('evolution');
        else setActiveTab('city');
    };

    const handleUnlock = async (branchId: string) => {
        return await unlockEvolution(branchId);
    };

    return (
        <View style={styles.container}>
            {activeTab === 'city' && (
                <CityScreen
                    city={city}
                    stats={stats}
                    buildings={buildings}
                    onDeploy={deployBuilding}
                    onUpgrade={upgradeBuilding}
                    onRemove={removeBuilding}
                    onSwitchTab={handleSwitchTab}
                />
            )}
            {activeTab === 'evolution' && (
                <Evolution
                    stats={stats}
                    city={city}
                    buildings={buildings}
                    onBack={() => setActiveTab('city')}
                    onUnlock={handleUnlock}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
});