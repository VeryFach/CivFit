import  CityScreen from '@/features/simulation/CityScreen';
import { useCivStore } from '@/store';
import React from 'react';
import { StyleSheet, View } from 'react-native';

export default function CityTab() {
    const { city, stats, deployBuilding, upgradeBuilding, removeBuilding } = useCivStore();

    return (
        <View style={styles.container}>
            <CityScreen
                city={city}
                stats={stats}
                onDeploy={deployBuilding}
                onUpgrade={upgradeBuilding}
                onRemove={removeBuilding}
                onSwitchTab={() => {}}
            />
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
