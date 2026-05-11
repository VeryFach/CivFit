import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput, Dimensions } from 'react-native';
import { UserStats } from '../../core/types';
import { RECOVERY_ITEMS } from '../../core/constants';
import { 
  Coffee, 
  RefreshCw, 
  Sparkles, 
  TrendingUp, 
  Coins, 
  Info,
  ChevronRight,
  ArrowRightLeft
} from 'lucide-react-native';
import * as Icons from 'lucide-react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { COLORS, THEME } from '../theme';

const { width } = Dimensions.get('window');

interface TokoTabProps {
  stats: UserStats;
  onPurchase: (type: 'hp' | 'silver' | 'gold' | 'skipTicket', amount: number, cost: number) => void;
  onGacha: () => void;
}

export function TokoTab({ stats, onPurchase, onGacha }: TokoTabProps) {
  const [silverToGoldInput, setSilverToGoldInput] = useState('100');
  const [goldToSilverInput, setGoldToSilverInput] = useState('10');
  const [showGachaInfo, setShowGachaInfo] = useState(false);

  // Dynamic Economic Rates
  const silverPerGoldRate = useMemo(() => Math.round(12 + Math.sin(stats.dayCount) * 2), [stats.dayCount]);
  const goldToSilverRate = useMemo(() => Math.round(8 + Math.cos(stats.dayCount) * 1.5), [stats.dayCount]);
  const networkFee = 0.05; // 5% fee for each transaction

  const silverToGoldVal = parseInt(silverToGoldInput) || 0;
  const goldToSilverVal = parseInt(goldToSilverInput) || 0;

  const silverToGoldResult = useMemo(() => {
    const amount = Math.floor(silverToGoldVal / silverPerGoldRate);
    const fee = Math.ceil(amount * networkFee);
    return Math.max(0, amount - fee);
  }, [silverToGoldVal, silverPerGoldRate]);

  const goldToSilverResult = useMemo(() => {
    const rawResult = goldToSilverVal * goldToSilverRate;
    const fee = Math.ceil(rawResult * networkFee);
    return Math.max(0, rawResult - fee);
  }, [goldToSilverVal, goldToSilverRate]);

  return (
    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      {/* Recovery Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Coffee size={14} color={COLORS.dark} opacity={0.4} />
          <Text style={styles.sectionTitle}>Survival Supplies</Text>
        </View>
        
        <View style={styles.itemsGrid}>
          {RECOVERY_ITEMS.map((item) => {
            const Icon = (Icons as any)[item.icon] || Coffee;
            const canAfford = stats.gold >= item.costGold;
            return (
              <Pressable
                key={item.id}
                disabled={!canAfford}
                onPress={() => {
                  if (item.id === 'skipTicket') {
                    onPurchase('skipTicket', 1, item.costGold);
                  } else {
                    onPurchase('hp', item.hpRestore, item.costGold);
                  }
                }}
                style={[styles.itemCard, !canAfford && styles.itemCardDisabled]}
              >
                <View style={[styles.itemIconBox, !canAfford && { backgroundColor: '#E5E7EB' }]}>
                  <Icon size={28} color={COLORS.dark} />
                </View>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemEffect}>
                    {item.id === 'skipTicket' ? 'PROTECTION' : `+${item.hpRestore} HP`}
                  </Text>
                  <Text style={styles.itemDesc}>{item.description}</Text>
                </View>
                <View style={styles.itemCost}>
                  <Coins size={14} color={COLORS.dark} />
                  <Text style={styles.itemCostText}>{item.costGold}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Resource Conversion */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <ArrowRightLeft size={14} color={COLORS.dark} opacity={0.4} />
          <Text style={styles.sectionTitle}>Resource Conversion</Text>
        </View>

        <View style={styles.conversionStack}>
          {/* Silver TO Gold */}
          <View style={styles.darkCard}>
             <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.cardTitle}>Liquid Asset</Text>
                  <Text style={styles.cardSub}>Silver Kota → Gold Habit</Text>
                </View>
                <View style={styles.rateBatch}>
                  <Text style={styles.rateLabel}>Rate</Text>
                  <Text style={styles.rateVal}>{silverPerGoldRate}S : 1G</Text>
                </View>
             </View>

             <View style={styles.inputArea}>
                <View style={styles.inputRow}>
                   <View style={styles.inputMain}>
                      <View style={styles.inputHeader}>
                        <Text style={styles.inputLabel}>Conversion Amount</Text>
                        <View style={styles.presets}>
                           {[100, 500, 1000].map(val => (
                             <Pressable 
                               key={val}
                               onPress={() => setSilverToGoldInput(val.toString())}
                               style={styles.presetBtn}
                             >
                               <Text style={styles.presetText}>{val}</Text>
                             </Pressable>
                           ))}
                        </View>
                      </View>
                      <TextInput 
                        style={styles.conversionInput}
                        keyboardType="numeric"
                        value={silverToGoldInput}
                        onChangeText={setSilverToGoldInput}
                        placeholderTextColor="rgba(255,255,255,0.2)"
                      />
                   </View>
                   <View style={styles.unitBox}>
                      <Text style={styles.unitVal}>{silverToGoldVal}</Text>
                      <Text style={styles.unitLabel}>S</Text>
                   </View>
                </View>

                <View style={styles.estBox}>
                   <View style={styles.estLeft}>
                      <View style={styles.estIcon}>
                        <RefreshCw size={16} color={COLORS.yellow} />
                      </View>
                      <View>
                        <Text style={styles.estLabel}>Est. Gold Received</Text>
                        <Text style={[styles.estVal, { color: COLORS.yellow }]}>{silverToGoldResult} G</Text>
                      </View>
                   </View>
                   <View style={styles.feeBox}>
                      <Text style={styles.feeLabel}>Net Fee (5%)</Text>
                      <Text style={styles.feeVal}>-{Math.ceil(silverToGoldVal / silverPerGoldRate * networkFee)} G</Text>
                   </View>
                </View>
             </View>

             <Pressable 
               onPress={() => onPurchase('gold', silverToGoldResult, Math.floor(silverToGoldResult * silverPerGoldRate))}
               disabled={stats.silver < silverToGoldVal || silverToGoldResult <= 0}
               style={[styles.confirmBtn, { backgroundColor: COLORS.yellow }, (stats.silver < silverToGoldVal || silverToGoldResult <= 0) && styles.btnDisabled]}
             >
               <Text style={styles.confirmBtnText}>Confirm Conversion</Text>
             </Pressable>
          </View>

          {/* Gold TO Silver */}
          <View style={styles.lightCard}>
             <View style={styles.cardHeader}>
                <View>
                  <Text style={[styles.cardTitle, { color: COLORS.teal }]}>Treasury Exchange</Text>
                  <Text style={[styles.cardSub, { color: '#9CA3AF' }]}>Gold Habit → Silver Kota</Text>
                </View>
                <View style={[styles.rateBatch, { backgroundColor: COLORS.bg, borderColor: 'rgba(45, 204, 113, 0.3)' }]}>
                  <Text style={[styles.rateLabel, { color: COLORS.teal }]}>Rate</Text>
                  <Text style={[styles.rateVal, { color: COLORS.teal }]}>1G : {goldToSilverRate}S</Text>
                </View>
             </View>

             <View style={styles.inputArea}>
                <View style={styles.inputRow}>
                   <View style={styles.inputMain}>
                      <View style={styles.inputHeader}>
                        <Text style={[styles.inputLabel, { color: '#9CA3AF' }]}>Collateral Amount</Text>
                        <View style={styles.presets}>
                           {[10, 50, 100].map(val => (
                             <Pressable 
                               key={val}
                               onPress={() => setGoldToSilverInput(val.toString())}
                               style={[styles.presetBtn, { backgroundColor: COLORS.bg }]}
                             >
                               <Text style={[styles.presetText, { color: '#9CA3AF' }]}>{val}</Text>
                             </Pressable>
                           ))}
                        </View>
                      </View>
                      <TextInput 
                        style={[styles.conversionInput, { color: COLORS.dark, borderBottomColor: COLORS.teal }]}
                        keyboardType="numeric"
                        value={goldToSilverInput}
                        onChangeText={setGoldToSilverInput}
                        placeholderTextColor="rgba(0,0,0,0.1)"
                      />
                   </View>
                   <View style={styles.unitBox}>
                      <Text style={[styles.unitVal, { color: COLORS.dark }]}>{goldToSilverVal}</Text>
                      <Text style={[styles.unitLabel, { color: '#9CA3AF' }]}>G</Text>
                   </View>
                </View>

                <View style={[styles.estBox, { backgroundColor: COLORS.bg, borderColor: 'rgba(0,0,0,0.05)' }]}>
                   <View style={styles.estLeft}>
                      <View style={[styles.estIcon, { backgroundColor: 'rgba(45, 204, 113, 0.2)' }]}>
                        <RefreshCw size={16} color={COLORS.teal} />
                      </View>
                      <View>
                        <Text style={[styles.estLabel, { color: '#9CA3AF' }]}>Est. Silver Liquidity</Text>
                        <Text style={[styles.estVal, { color: COLORS.teal }]}>{goldToSilverResult} S</Text>
                      </View>
                   </View>
                   <View style={styles.feeBox}>
                      <Text style={[styles.feeLabel, { color: '#9CA3AF' }]}>Stability Fee (5%)</Text>
                      <Text style={[styles.feeVal, { color: COLORS.dark }]}>-{Math.ceil(goldToSilverVal * goldToSilverRate * networkFee)} S</Text>
                   </View>
                </View>
             </View>

             <Pressable 
               onPress={() => onPurchase('silver', goldToSilverResult, goldToSilverVal)}
               disabled={stats.gold < goldToSilverVal || goldToSilverResult <= 0}
               style={[styles.confirmBtn, { backgroundColor: COLORS.teal }, (stats.gold < goldToSilverVal || goldToSilverResult <= 0) && styles.btnDisabled]}
             >
               <Text style={styles.confirmBtnText}>Liquidate to Silver</Text>
             </Pressable>
          </View>
        </View>
      </View>

      {/* Gacha System */}
      <View style={styles.gachaSection}>
        <View style={styles.gachaBgIcon}>
          <Sparkles size={160} color="rgba(255,255,255,0.1)" />
        </View>

        <View style={styles.gachaHeader}>
          <View style={styles.gachaTitleRow}>
            <Sparkles size={32} color={COLORS.yellow} />
            <Text style={styles.gachaTitle}>Kuil Nasib</Text>
          </View>
          <Pressable 
            onPress={() => setShowGachaInfo(!showGachaInfo)}
            style={styles.infoBtn}
          >
            <Info size={20} color={COLORS.yellow} />
          </Pressable>
        </View>
        <Text style={styles.gachaSub}>Sacrifice Gold for Civilization's Blessing</Text>
        
        {showGachaInfo && (
          <Animated.View entering={FadeIn} style={styles.infoPanel}>
            <Text style={styles.infoPanelTitle}>Divine Drop Rates</Text>
            <View style={styles.rateRow}>
              <Text style={styles.rateName}>Ultimate Jackpot (Gold)</Text>
              <Text style={[styles.rateValue, { color: COLORS.yellow }]}>5%</Text>
            </View>
            <View style={styles.rateRow}>
              <Text style={styles.rateName}>Treasury Overflow (Silver)</Text>
              <Text style={[styles.rateValue, { color: COLORS.teal }]}>25%</Text>
            </View>
            <View style={styles.rateRow}>
              <Text style={styles.rateName}>Ancient Wisdom (EXP)</Text>
              <Text style={[styles.rateValue, { color: COLORS.purple }]}>30%</Text>
            </View>
            <View style={styles.rateRow}>
              <Text style={styles.rateName}>Life Blessing (HP)</Text>
              <Text style={[styles.rateValue, { color: COLORS.red }]}>40%</Text>
            </View>
          </Animated.View>
        )}

        <Pressable 
          onPress={onGacha}
          disabled={stats.gold < 100}
          style={[styles.gachaBtn, stats.gold < 100 && styles.btnDisabled]}
        >
          <Text style={styles.gachaBtnText}>Invoke the Shrine (100 G)</Text>
        </Pressable>
        
        <View style={styles.recentWinners}>
           <View style={styles.winnerAvatars}>
              {[1, 2, 3].map(i => (
                <View key={i} style={styles.avatar}>
                  <Text style={{ fontSize: 8 }}>👤</Text>
                </View>
              ))}
           </View>
           <Text style={styles.winnerLabel}>128 Players recently won</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 16,
    gap: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 2,
    color: '#9CA3AF',
  },
  itemsGrid: {
    gap: 16,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    ...THEME.neoBorder,
    borderRadius: 32,
    padding: 20,
    gap: 16,
    ...THEME.neoShadow,
  },
  itemCardDisabled: {
    opacity: 0.5,
    backgroundColor: '#F9FAFB',
    borderColor: '#E5E7EB',
  },
  itemIconBox: {
    width: 56,
    height: 56,
    backgroundColor: COLORS.bg,
    borderRadius: 16,
    ...THEME.neoBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '900',
    fontStyle: 'italic',
    textTransform: 'uppercase',
    color: COLORS.dark,
    marginBottom: 2,
  },
  itemEffect: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.teal,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  itemDesc: {
    fontSize: 8,
    fontWeight: '700',
    color: '#9CA3AF',
    textTransform: 'uppercase',
  },
  itemCost: {
    backgroundColor: COLORS.yellow,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    ...THEME.neoBorder,
    ...THEME.neoShadowSm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  itemCostText: {
    fontSize: 12,
    fontWeight: '900',
    fontFamily: 'monospace',
  },
  conversionStack: {
    gap: 24,
  },
  darkCard: {
    backgroundColor: COLORS.dark,
    padding: 32,
    borderRadius: 40,
    ...THEME.neoBorderLg,
    ...THEME.neoShadowLg,
  },
  lightCard: {
    backgroundColor: '#FFF',
    padding: 32,
    borderRadius: 40,
    ...THEME.neoBorderLg,
    ...THEME.neoShadowLg,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 32,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '900',
    fontStyle: 'italic',
    textTransform: 'uppercase',
    color: COLORS.yellow,
  },
  cardSub: {
    fontSize: 8,
    fontWeight: '900',
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.4)',
    marginTop: 4,
  },
  rateBatch: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    ...THEME.neoBorder,
    borderColor: 'rgba(253, 204, 13, 0.3)',
    alignItems: 'center',
  },
  rateLabel: {
    fontSize: 8,
    fontWeight: '900',
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.4)',
    marginBottom: 2,
  },
  rateVal: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.yellow,
  },
  inputArea: {
    gap: 24,
    marginBottom: 32,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  inputMain: {
    flex: 1,
  },
  inputHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 8,
    fontWeight: '900',
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.4)',
  },
  presets: {
    flexDirection: 'row',
    gap: 4,
  },
  presetBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 6,
  },
  presetText: {
    fontSize: 8,
    fontWeight: '900',
    color: 'rgba(255,255,255,0.6)',
  },
  conversionInput: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFF',
    borderBottomWidth: 2,
    borderBottomColor: COLORS.yellow,
    paddingVertical: 8,
  },
  unitBox: {
    width: 60,
    alignItems: 'center',
  },
  unitVal: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFF',
    fontFamily: 'monospace',
  },
  unitLabel: {
    fontSize: 8,
    fontWeight: '900',
    color: 'rgba(255,255,255,0.4)',
    textTransform: 'uppercase',
  },
  estBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  estLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  estIcon: {
    padding: 8,
    backgroundColor: 'rgba(253, 204, 13, 0.2)',
    borderRadius: 12,
  },
  estLabel: {
    fontSize: 8,
    fontWeight: '900',
    color: 'rgba(255,255,255,0.4)',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  estVal: {
    fontSize: 20,
    fontWeight: '900',
    fontFamily: 'monospace',
  },
  feeBox: {
    alignItems: 'flex-end',
  },
  feeLabel: {
    fontSize: 8,
    fontWeight: '900',
    color: 'rgba(255,255,255,0.4)',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  feeVal: {
    fontSize: 10,
    fontWeight: '900',
    color: 'rgba(255,255,255,0.8)',
  },
  confirmBtn: {
    paddingVertical: 20,
    borderRadius: 32,
    alignItems: 'center',
    ...THEME.neoBorderLg,
    ...THEME.neoShadow,
  },
  confirmBtnText: {
    fontSize: 18,
    fontWeight: '900',
    fontStyle: 'italic',
    textTransform: 'uppercase',
    color: COLORS.dark,
  },
  btnDisabled: {
    opacity: 0.5,
  },
  gachaSection: {
    backgroundColor: COLORS.purple,
    margin: 16,
    padding: 32,
    borderRadius: 40,
    ...THEME.neoBorderLg,
    ...THEME.neoShadowLg,
    position: 'relative',
    overflow: 'hidden',
    marginBottom: 100,
  },
  gachaBgIcon: {
    position: 'absolute',
    top: 20,
    right: 20,
    opacity: 0.1,
  },
  gachaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  gachaTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  gachaTitle: {
    fontSize: 32,
    fontWeight: '900',
    fontStyle: 'italic',
    color: '#FFF',
    textTransform: 'uppercase',
  },
  infoBtn: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
  },
  gachaSub: {
    fontSize: 10,
    fontWeight: '900',
    color: 'rgba(255, 255, 255, 0.6)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 32,
  },
  infoPanel: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 32,
    gap: 8,
  },
  infoPanelTitle: {
    fontSize: 9,
    fontWeight: '900',
    color: COLORS.yellow,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  rateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rateName: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.6)',
    textTransform: 'uppercase',
  },
  rateValue: {
    fontSize: 10,
    fontWeight: '900',
  },
  gachaBtn: {
    backgroundColor: '#FFF',
    paddingVertical: 24,
    borderRadius: 32,
    alignItems: 'center',
    ...THEME.neoBorderLg,
    ...THEME.neoShadow,
  },
  gachaBtnText: {
    fontSize: 20,
    fontWeight: '900',
    fontStyle: 'italic',
    textTransform: 'uppercase',
    color: COLORS.dark,
  },
  recentWinners: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
  },
  winnerAvatars: {
    flexDirection: 'row',
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 2,
    borderColor: COLORS.purple,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -8,
  },
  winnerLabel: {
    fontSize: 8,
    fontWeight: '900',
    color: 'rgba(255, 255, 255, 0.3)',
    textTransform: 'uppercase',
  }
});
