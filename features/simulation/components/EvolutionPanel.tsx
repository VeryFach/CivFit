import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function EvolutionPanel() {
    return (
        <View style={styles.container}>
            <Text>Evolution Progress</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        borderRadius: 20,
        backgroundColor: '#EFEFEF',
    },
});