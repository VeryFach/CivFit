import React from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import CityScreen from '@/features/simulation/screens/CityScreen';

export default function CityTab() {
    return <CityScreen />;
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    content: {
        flex: 1,
        padding: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
    },
});
