import { GachaReward } from '@/components/common/GachaChestModal';
import StoreTab from '@/features/store/store'; // import komponen StoreTab yang sudah Anda buat
import { useCivStore } from '@/store';
import { Coins, Heart, Sparkles } from 'lucide-react-native';
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
    const handleGacha = async (): Promise<GachaReward | void> => {
        if (stats.gold < 100) return;

        const rand = Math.random();
        let reward: GachaReward;
        let rewardMessage = '';

        if (rand > 0.95) {
            reward = {
                type: 'gold',
                amount: 500,
                name: 'Ultimate Jackpot',
                icon: <Coins size={40} color="#FBBF24" />,
                color: '#FBBF24',
            };
            rewardMessage = 'JACKPOT! Dewa memberkatimu.';
        } else if (rand > 0.7) {
            reward = {
                type: 'silver',
                amount: 1000,
                name: 'Treasury Overflow',
                icon: <Coins size={40} color="#14B8A6" />,
                color: '#14B8A6',
            };
            rewardMessage = 'Kekayaan kota meningkat.';
        } else if (rand > 0.4) {
            reward = {
                type: 'exp',
                amount: 200,
                name: 'Ancient Wisdom',
                icon: <Sparkles size={40} color="#A855F7" />,
                color: '#A855F7',
            };
            rewardMessage = 'Hikmat dan ilmu pengetahuan.';
        } else {
            reward = {
                type: 'hp',
                amount: 20,
                name: 'Life Blessing',
                icon: <Heart size={40} color="#EF4444" />,
                color: '#EF4444',
            };
            rewardMessage = 'Berkat kesehatan.';
        }

        // Apply cost + reward in one atomic update so persisted stats stay consistent.
        setStats((prev) => {
            const nextStats = { ...prev, gold: prev.gold - 100 };
            if (reward.type === 'gold') nextStats.gold += reward.amount;
            if (reward.type === 'silver') nextStats.silver += reward.amount;
            if (reward.type === 'exp') nextStats.exp += reward.amount;
            if (reward.type === 'hp') nextStats.hp = Math.min(prev.maxHp, prev.hp + reward.amount);
            return nextStats;
        });

        await addLog('economy', `Gacha: ${rewardMessage}`, reward.amount, reward.type);
        return reward;
        
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