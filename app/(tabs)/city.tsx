import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import CityScreen from '@/features/simulation/CityScreen';
import Evolution from '@/features/evolution/evolution';
import { useCivStore } from '@/store';

export default function CityTab() {
    const { city, stats, deployBuilding, upgradeBuilding, removeBuilding, unlockEvolution } = useCivStore();
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
        paddingTop: 80,
        backgroundColor: '#FFFFFF',
    },
});