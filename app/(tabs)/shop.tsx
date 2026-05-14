import StoreTab from '@/features/store/store'; // import komponen StoreTab yang sudah Anda buat
import { useCivStore } from '@/store';
import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';

export default function ShopTab() {
    // Ambil data dan fungsi dari store
    const stats = useCivStore((state) => state.stats);
    const setStats = useCivStore((state) => state.setStats);
    const addLog = useCivStore((state) => state.addLog);
    
    // State untuk overlay (jika diperlukan)
    // const setGachaReward = useCivStore((state) => state.setGachaReward);
    // const setConversionStatus = useCivStore((state) => state.setConversionStatus);

    // Handler untuk pembelian (mirip dengan logika di App.tsx asli)
    const handlePurchase = (
        type: 'hp' | 'silver' | 'gold' | 'skipTicket',
        amount: number,
        cost: number
    ) => {
        if (type === 'hp') {
            if (stats.gold < cost) {
                // Tampilkan notifikasi gagal (bisa lewat store untuk overlay)
                return;
            }
            setStats({
                ...stats,
                hp: Math.min(stats.maxHp, stats.hp + amount),
                gold: stats.gold - cost,
            });
            addLog('economy', 'Bought recovery item', amount, 'hp');
        } 
        else if (type === 'skipTicket') {
            if (stats.gold < cost) return;
            setStats({
                ...stats,
                skipTickets: (stats.skipTickets || 0) + 1,
                gold: stats.gold - cost,
            });
            addLog('economy', 'Bought Skip Ticket', 1, 'system');
        } 
        else if (type === 'silver') {
            if (stats.gold < cost) return;
            setStats({
                ...stats,
                silver: stats.silver + amount,
                gold: stats.gold - cost,
            });
            addLog('economy', 'Exchanged gold for silver', amount, 'silver');
        } 
        else if (type === 'gold') {
            if (stats.silver < cost) return;
            setStats({
                ...stats,
                gold: stats.gold + amount,
                silver: stats.silver - cost,
            });
            addLog('economy', 'Exchanged silver for gold', amount, 'gold');
        }
    };

    // Handler untuk Gacha
    const handleGacha = () => {
        if (stats.gold < 100) return;
        
        setStats({ ...stats, gold: stats.gold - 100 });
        const rand = Math.random();
        let reward: { type: 'gold' | 'silver' | 'exp' | 'hp', amount: number, message: string };

        if (rand > 0.95) {
            reward = { type: 'gold', amount: 500, message: 'JACKPOT! Dewa memberkatimu.' };
        } else if (rand > 0.7) {
            reward = { type: 'silver', amount: 1000, message: 'Kekayaan kota meningkat.' };
        } else if (rand > 0.4) {
            reward = { type: 'exp', amount: 200, message: 'Hikmat dan ilmu pengetahuan.' };
        } else {
            reward = { type: 'hp', amount: 20, message: 'Berkat kesehatan.' };
        }

        // Terapkan reward
        let updates: Partial<typeof stats> = {};
        if (reward.type === 'gold') updates.gold = stats.gold + reward.amount;
        if (reward.type === 'silver') updates.silver = stats.silver + reward.amount;
        if (reward.type === 'exp') updates.exp = stats.exp + reward.amount;
        if (reward.type === 'hp') updates.hp = Math.min(stats.maxHp, stats.hp + reward.amount);
        
        setStats({ ...stats, ...updates });
        addLog('economy', `Gacha: ${reward.message}`, reward.amount, reward.type);
        
        // Jika ingin menampilkan popup reward, set state overlay di store
        // setGachaReward(reward);
    };

    return (
        <SafeAreaView style={styles.container}>
            <StoreTab 
                stats={stats}
                onPurchase={handlePurchase}
                onGacha={handleGacha}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
        paddingTop: 80, // sesuaikan dengan layout header Anda
    },
});