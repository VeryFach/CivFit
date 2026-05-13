import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { MenuTab as MenuTabComponent } from '@/features/profile/menu'; // sesuaikan path impor

export default function MenuTab() {
    return (
        <SafeAreaView style={styles.container}>
            <MenuTabComponent />
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
