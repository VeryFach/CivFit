import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { shopItems } from '@/data/civfit';
import { CivfitScreen } from '../../src/components/civfit/screen';
import { SectionCard } from '../../src/components/civfit/section-card';
import { RECOVERY_ITEMS, useCivfitStore } from '../../src/state/civfit-store';

export default function ShopScreen() {
    const { stats, purchase, gacha } = useCivfitStore();
    const [silverToGoldInput, setSilverToGoldInput] = useState(100);
    const [goldToSilverInput, setGoldToSilverInput] = useState(10);
    const silverPerGoldRate = useMemo(() => 12, []);
    const goldToSilverRate = useMemo(() => 8, []);

    return (
        <CivfitScreen>
            <View style={styles.hero}>
                <Text style={styles.kicker}>SHOP LAYER</Text>
                <Text style={styles.title}>Survival Supplies</Text>
                <Text style={styles.subtitle}>Sama seperti web: item recovery, gacha, dan resource conversion.</Text>
            </View>

            <View style={styles.heroStats}>
                <View style={styles.heroStatCard}>
                    <Text style={styles.heroStatLabel}>Gold</Text>
                    <Text style={styles.heroStatValue}>{stats.gold}</Text>
                </View>
                <View style={styles.heroStatCard}>
                    <Text style={styles.heroStatLabel}>Silver</Text>
                    <Text style={styles.heroStatValue}>{stats.silver}</Text>
                </View>
            </View>

            <View style={styles.stack}>
                {RECOVERY_ITEMS.map((item) => (
                    <Pressable
                        key={item.id}
                        style={styles.recoveryCard}
                        onPress={() => purchase(item.id === 'skipTicket' ? 'skipTicket' : 'hp', item.hpRestore || 1, item.costGold)}>
                        <Text style={styles.recoveryTitle}>{item.name}</Text>
                        <Text style={styles.recoveryMeta}>{item.description}</Text>
                        <Text style={styles.recoveryPrice}>{item.costGold} Gold</Text>
                    </Pressable>
                ))}
            </View>

            <View style={styles.exchangeCard}>
                <Text style={styles.exchangeTitle}>Resource Conversion</Text>
                <View style={styles.exchangeRow}>
                    <View style={styles.exchangeBlock}>
                        <Text style={styles.exchangeLabel}>Silver to Gold</Text>
                        <TextInput
                            style={styles.exchangeInput}
                            value={String(silverToGoldInput)}
                            onChangeText={(value) => setSilverToGoldInput(Number(value) || 0)}
                            keyboardType="numeric"
                        />
                        <Text style={styles.exchangeHint}>{silverPerGoldRate} S : 1 G</Text>
                        <Pressable
                            style={styles.exchangeButton}
                            onPress={() => purchase('gold', Math.floor(silverToGoldInput / silverPerGoldRate), silverToGoldInput)}>
                            <Text style={styles.exchangeButtonText}>Confirm</Text>
                        </Pressable>
                    </View>
                    <View style={styles.exchangeBlock}>
                        <Text style={styles.exchangeLabel}>Gold to Silver</Text>
                        <TextInput
                            style={styles.exchangeInput}
                            value={String(goldToSilverInput)}
                            onChangeText={(value) => setGoldToSilverInput(Number(value) || 0)}
                            keyboardType="numeric"
                        />
                        <Text style={styles.exchangeHint}>1 G : {goldToSilverRate} S</Text>
                        <Pressable
                            style={styles.exchangeButton}
                            onPress={() => purchase('silver', goldToSilverInput * goldToSilverRate, goldToSilverInput)}>
                            <Text style={styles.exchangeButtonText}>Confirm</Text>
                        </Pressable>
                    </View>
                </View>
            </View>

            <View style={styles.gachaCard}>
                <Text style={styles.gachaTitle}>Gacha</Text>
                <Text style={styles.gachaBody}>Bayar 100 Gold untuk hadiah acak seperti di web.</Text>
                <Pressable style={styles.primaryButton} onPress={gacha}>
                    <Text style={styles.primaryButtonText}>Spin</Text>
                </Pressable>
            </View>

            <View style={styles.stack}>
                {shopItems.map((item) => (
                    <SectionCard
                        key={item.name}
                        title={item.name}
                        description={`${item.cost} · ${item.effect}`}
                        badge={item.badge}
                        icon={<Ionicons name={item.icon as keyof typeof Ionicons.glyphMap} size={22} color="#E85146" />}
                    />
                ))}
            </View>

            <View style={styles.footerCard}>
                <Text style={styles.footerTitle}>Trading protocol</Text>
                <Text style={styles.footerText}>Silakan sambungkan logika ini ke Firebase nanti jika ingin economy sync seperti versi web.</Text>
            </View>
        </CivfitScreen>
    );
}

const styles = StyleSheet.create({
    hero: {
        gap: 10,
        paddingTop: 10,
    },
    kicker: {
        color: '#E85146',
        fontSize: 12,
        fontWeight: '800',
        letterSpacing: 2.4,
        textTransform: 'uppercase',
    },
    title: {
        color: '#1F2228',
        fontSize: 30,
        lineHeight: 34,
        fontWeight: '900',
    },
    subtitle: {
        color: '#4C5158',
        fontSize: 15,
        lineHeight: 22,
    },
    heroStats: {
        flexDirection: 'row',
        gap: 10,
    },
    heroStatCard: {
        flex: 1,
        borderWidth: 2,
        borderColor: '#1F2228',
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 14,
        shadowColor: '#1F2228',
        shadowOpacity: 0.2,
        shadowRadius: 0,
        shadowOffset: { width: 3, height: 3 },
    },
    heroStatLabel: {
        color: '#4C5158',
        fontSize: 10,
        fontWeight: '900',
        textTransform: 'uppercase',
    },
    heroStatValue: {
        color: '#1F2228',
        fontSize: 24,
        fontWeight: '900',
    },
    stack: {
        gap: 14,
    },
    recoveryCard: {
        borderRadius: 24,
        borderWidth: 2,
        borderColor: '#1F2228',
        backgroundColor: '#FFFFFF',
        padding: 16,
        gap: 8,
    },
    recoveryTitle: {
        color: '#1F2228',
        fontSize: 16,
        fontWeight: '900',
    },
    recoveryMeta: {
        color: '#4C5158',
        lineHeight: 18,
        fontSize: 13,
    },
    recoveryPrice: {
        color: '#E85146',
        fontWeight: '900',
    },
    exchangeCard: {
        borderRadius: 28,
        borderWidth: 2,
        borderColor: '#1F2228',
        backgroundColor: '#1F2228',
        padding: 18,
        gap: 12,
    },
    exchangeTitle: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '900',
        textTransform: 'uppercase',
    },
    exchangeRow: {
        flexDirection: 'row',
        gap: 10,
    },
    exchangeBlock: {
        flex: 1,
        gap: 8,
    },
    exchangeLabel: {
        color: 'rgba(255,255,255,0.55)',
        fontSize: 10,
        fontWeight: '800',
        textTransform: 'uppercase',
    },
    exchangeInput: {
        borderWidth: 2,
        borderColor: '#FFFFFF',
        borderRadius: 16,
        paddingHorizontal: 12,
        paddingVertical: 10,
        color: '#FFFFFF',
    },
    exchangeHint: {
        color: '#FFD94A',
        fontSize: 11,
        fontWeight: '800',
    },
    exchangeButton: {
        backgroundColor: '#FFD94A',
        borderWidth: 2,
        borderColor: '#FFFFFF',
        borderRadius: 16,
        paddingVertical: 12,
        alignItems: 'center',
    },
    exchangeButtonText: {
        color: '#1F2228',
        fontSize: 11,
        fontWeight: '900',
        textTransform: 'uppercase',
    },
    gachaCard: {
        borderWidth: 2,
        borderColor: '#1F2228',
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 16,
        gap: 10,
    },
    gachaTitle: {
        color: '#1F2228',
        fontSize: 18,
        fontWeight: '900',
        textTransform: 'uppercase',
    },
    gachaBody: {
        color: '#4C5158',
    },
    primaryButton: {
        borderRadius: 18,
        backgroundColor: '#2FBFA5',
        borderWidth: 2,
        borderColor: '#1F2228',
        paddingVertical: 14,
        alignItems: 'center',
    },
    primaryButtonText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '900',
        textTransform: 'uppercase',
    },
    footerCard: {
        borderRadius: 24,
        padding: 18,
        backgroundColor: '#FFFFFF',
        borderWidth: 2,
        borderColor: '#1F2228',
        gap: 8,
    },
    footerTitle: {
        color: '#1F2228',
        fontSize: 16,
        fontWeight: '800',
    },
    footerText: {
        color: '#4C5158',
        lineHeight: 20,
        fontSize: 14,
    },
});
