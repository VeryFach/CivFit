import { MenuTab as MenuTabComponent } from '@/features/profile/menu'; // sesuaikan path impor
import React from 'react';
import { StyleSheet, View } from 'react-native';

export default function MenuTab() {
    return (
        <View style={styles.container}>
            <MenuTabComponent />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
});
