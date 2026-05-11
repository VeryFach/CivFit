import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar, Dimensions, Pressable, Text } from 'react-native';
import { Header } from './ui/components/Header';
import { Navigation } from './ui/components/Navigation';
import { RealitaTab } from './ui/components/RealitaTab';
import { KotaTab } from './ui/components/KotaTab';
import { TokoTab } from './ui/components/TokoTab';
import { MenuTab } from './ui/components/MenuTab';
import { EvolutionTab } from './ui/components/EvolutionTab';
import { LeaderboardTab } from './ui/components/LeaderboardTab';
import { DailyReportOverlay } from './ui/components/DailyReportOverlay';
import { LoginScreen } from './ui/components/LoginScreen';
import { useCivStore } from './core/progression/store';
import { useOnlineStatus } from './platform/mobile/hooks/useOnlineStatus';
import { BUILDINGS, ERAS_CONFIG, PASSIVE_INTERVAL } from './core/constants';
import { calculateCitySummary } from './core/simulation/cityUtils';
import { Era } from './core/types';
import Animated, { FadeIn, FadeOut, ZoomIn, ZoomOut } from 'react-native-reanimated';
import { COLORS, THEME } from './ui/theme';

import { TrendingUp, ChevronRight, Sparkles } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

export default function App() {
  const [currentTab, setCurrentTab] = useState('realita');
  const currentUser = useCivStore((state) => state.currentUser);
  const loading = useCivStore((state) => state.loading);
  const stats = useCivStore((state) => state.stats);
  const habits = useCivStore((state) => state.habits);
  const city = useCivStore((state) => state.city);
  const logs = useCivStore((state) => state.logs);
  
  const setStats = useCivStore((state) => state.setStats);
  const setCity = useCivStore((state) => state.setCity);
  const addHabit = useCivStore((state) => state.addHabit);
  const completeHabit = useCivStore((state) => state.completeHabit);
  const updateHabit = useCivStore((state) => state.updateHabit);
  const deleteHabit = useCivStore((state) => state.deleteHabit);
  const deployBuilding = useCivStore((state) => state.deployBuilding);
  const upgradeBuilding = useCivStore((state) => state.upgradeBuilding);
  const removeBuilding = useCivStore((state) => state.removeBuilding);
  const unlockEvolution = useCivStore((state) => state.unlockEvolution);
  const endDay = useCivStore((state) => state.endDay);
  const initialize = useCivStore((state) => state.initialize);
  const addLog = useCivStore((state) => state.addLog);

  const isOnline = useOnlineStatus();

  // Initialize store on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  const [sleepFlow, setSleepFlow] = useState<{ step: 'animating' | 'summary' | 'levelup' | null, data: any }>({ step: null, data: null });
  const [gachaReward, setGachaReward] = useState<{ type: string, amount: number, message: string } | null>(null);
  const [conversionStatus, setConversionStatus] = useState<{
    show: boolean;
    success: boolean;
    message: string;
    type: 'gold' | 'silver';
  } | null>(null);

  // Level Up Detection
  useEffect(() => {
    if (stats.level > stats.lastCelebratedLevel) {
       setStats(s => ({ ...s, lastCelebratedLevel: stats.level }));
       setSleepFlow({ step: 'levelup', data: { oldLevel: stats.level - 1, newLevel: stats.level } });
    }
  }, [stats.level, stats.lastCelebratedLevel, setStats]);

  // Era Progression
  useEffect(() => {
    const newEra = ERAS_CONFIG.slice().reverse().find(e => stats.level >= e.minLevel);
    if (newEra && newEra.id !== city.currentEra) {
      setCity(prev => ({ ...prev, currentEra: newEra.id }));
      addLog('system', `Peradaban memasuki: ${newEra.name}`, 0, 'exp');
    }
  }, [stats.level, city.currentEra]);

  const handleEndDay = async () => {
    const report = await endDay();
    if (!report) return;
    setSleepFlow({ step: 'animating', data: report });
    
    // Auto advance from animation to summary after delay
    setTimeout(() => {
      setSleepFlow(prev => ({ ...prev, step: 'summary' }));
    }, 2500);
  };

  const handleCloseReport = () => {
    setStats(s => ({ ...s, pendingReport: null }));
    setSleepFlow({ step: null, data: null });
  };

  const handlePurchase = (type: 'hp' | 'silver' | 'gold' | 'skipTicket', amount: number, cost: number) => {
    if (type === 'hp') {
      if (stats.gold < cost) {
        setConversionStatus({ show: true, success: false, message: 'Gold habit tidak cukup!', type: 'silver' });
        return;
      }
      setStats(s => ({ ...s, hp: Math.min(s.maxHp, s.hp + amount), gold: s.gold - cost }));
      addLog('economy', 'Bought recovery item', amount, 'hp');
    } else if (type === 'skipTicket') {
      if (stats.gold < cost) {
        setConversionStatus({ show: true, success: false, message: 'Gold habit tidak cukup!', type: 'silver' });
        return;
      }
      setStats(s => ({ ...s, skipTickets: s.skipTickets + 1, gold: s.gold - cost }));
      addLog('economy', 'Bought Skip Ticket', 1, 'system');
      setConversionStatus({ show: true, success: true, message: 'Skip Ticket purchased! Simulation protected.', type: 'gold' });
    } else if (type === 'silver') {
      if (stats.gold < cost) {
        setConversionStatus({ show: true, success: false, message: 'Gold habit tidak cukup!', type: 'silver' });
        return;
      }
      setStats(s => ({ ...s, silver: s.silver + amount, gold: s.gold - cost }));
      addLog('economy', 'Exchanged gold for silver', amount, 'silver');
      setConversionStatus({ show: true, success: true, message: `Konversi Berhasil! ${amount} Silver diterima.`, type: 'silver' });
    } else if (type === 'gold') {
      if (stats.silver < cost) {
        setConversionStatus({ show: true, success: false, message: 'Silver kota tidak cukup!', type: 'gold' });
        return;
      }
      setStats(s => ({ ...s, gold: s.gold + amount, silver: s.silver - cost }));
      addLog('economy', 'Exchanged silver for gold', amount, 'gold');
      setConversionStatus({ show: true, success: true, message: `Konversi Berhasil! ${amount} Gold diterima.`, type: 'gold' });
    }
  };

  const handleDeployBuilding = (buildingTypeId: string, x: number, y: number, silverCost: number) => {
    deployBuilding(buildingTypeId, silverCost, x, y);
  };

  const handleGacha = () => {
    if (stats.gold < 100) return;
    
    setStats(s => ({ ...s, gold: s.gold - 100 }));
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

    if (reward.type === 'gold') setStats(s => ({ ...s, gold: s.gold + reward.amount }));
    if (reward.type === 'silver') setStats(s => ({ ...s, silver: s.silver + reward.amount }));
    if (reward.type === 'exp') setStats(s => ({ ...s, exp: s.exp + reward.amount }));
    if (reward.type === 'hp') setStats(s => ({ ...s, hp: Math.min(s.maxHp, s.hp + reward.amount) }));

    addLog('economy', `Gacha: ${reward.message}`, reward.amount, reward.type);
    setGachaReward(reward);
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: COLORS.bg }]}>
        <Animated.Text 
          entering={FadeIn}
          style={{ fontSize: 48 }}
        >
          🏰
        </Animated.Text>
      </View>
    );
  }

  if (!currentUser) {
    return <LoginScreen />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        <Header />
        
        {!isOnline && (
          <Animated.View 
            entering={FadeIn.duration(500)}
            style={styles.offlineBadge}
          >
            <View style={styles.offlineDot} />
            <Text style={styles.offlineText}>Offline Mode: Limited Sync</Text>
          </Animated.View>
        )}
        
        <View style={styles.mainContent}>
          {currentTab === 'realita' && (
            <Animated.View key="realita" entering={FadeIn} exiting={FadeOut} style={styles.tabContainer}>
              <RealitaTab 
                habits={habits} 
                hp={stats.hp} 
                momentum={stats.momentum}
                onAdd={addHabit} 
                onComplete={completeHabit} 
                onUpdate={updateHabit}
                onDelete={deleteHabit}
                onEndDay={handleEndDay} 
              />
            </Animated.View>
          )}

          {currentTab === 'kota' && (
            <Animated.View key="kota" entering={FadeIn} exiting={FadeOut} style={styles.tabContainer}>
              <KotaTab 
                city={city} 
                stats={stats} 
                onDeploy={handleDeployBuilding} 
                onUpgrade={upgradeBuilding}
                onRemove={removeBuilding}
                onSwitchTab={setCurrentTab}
              />
            </Animated.View>
          )}

          {currentTab === 'evolution' && (
            <Animated.View key="evolution" entering={FadeIn} exiting={FadeOut} style={styles.tabContainer}>
              <EvolutionTab 
                stats={stats}
                city={city}
                onUnlock={unlockEvolution}
                onBack={() => setCurrentTab('kota')}
              />
            </Animated.View>
          )}

          {currentTab === 'toko' && (
            <Animated.View key="toko" entering={FadeIn} exiting={FadeOut} style={styles.tabContainer}>
              <TokoTab 
                stats={stats} 
                onPurchase={handlePurchase} 
                onGacha={handleGacha} 
              />
            </Animated.View>
          )}

          {currentTab === 'settings' && (
            <Animated.View key="settings" entering={FadeIn} exiting={FadeOut} style={styles.tabContainer}>
              <MenuTab />
            </Animated.View>
          )}
        </View>

        {/* Overlays */}
        {sleepFlow.step === 'animating' && (
          <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.sleepOverlay}>
            <View style={styles.starContainer}>
               {Array.from({ length: 40 }).map((_, i) => (
                 <View
                   key={i}
                   style={[
                     styles.star,
                     {
                       left: `${Math.random() * 100}%`,
                       top: `${Math.random() * 100}%`,
                       opacity: 0.2 + Math.random() * 0.8,
                     }
                   ]}
                 />
               ))}
            </View>
            
            <Animated.View entering={ZoomIn} style={styles.sleepContent}>
              <View style={styles.moon} />
              <Text style={styles.sleepText}>Menuju Pagi...</Text>
            </Animated.View>
          </Animated.View>
        )}

        {sleepFlow.step === 'summary' && (
          <DailyReportOverlay 
            report={sleepFlow.data} 
            stats={stats} 
            onClose={handleCloseReport} 
          />
        )}

        {sleepFlow.step === 'levelup' && (
          <Animated.View entering={FadeIn} exiting={FadeOut} style={[styles.overlayFullscreen, { backgroundColor: COLORS.teal }]}>
             <Animated.View entering={ZoomIn} style={styles.levelupCard}>
                <View style={styles.levelupIconBox}>
                   <TrendingUp size={48} color={COLORS.dark} />
                </View>
                <Text style={styles.levelupTitle}>LEVEL UP!</Text>
                <Text style={styles.levelupSubtitle}>Evolusimu Berlanjut</Text>
                
                <View style={styles.levelupStats}>
                  <Text style={styles.levelupOldLvl}>LVL {sleepFlow.data.oldLevel}</Text>
                  <ChevronRight size={32} color={COLORS.dark} style={{ opacity: 0.2 }} />
                  <View style={styles.levelupNewLvlBox}>
                    <Text style={styles.levelupNewLvl}>LVL {sleepFlow.data.newLevel}</Text>
                  </View>
                </View>

                <Pressable
                  onPress={() => setSleepFlow({ step: null, data: null })}
                  style={styles.levelupButton}
                >
                  <Text style={styles.levelupButtonText}>TERIMA KEKUATAN BARU</Text>
                </Pressable>
             </Animated.View>
          </Animated.View>
        )}

        {gachaReward && (
          <Animated.View 
            entering={FadeIn} 
            exiting={FadeOut} 
            style={styles.overlayModal}
            onTouchEnd={() => setGachaReward(null)}
          >
            <Animated.View 
              entering={ZoomIn} 
              style={styles.gachaCard}
              onTouchEnd={(e) => e.stopPropagation()}
            >
              <View style={styles.gachaIconFloating}>
                <Text style={{ fontSize: 40 }}>
                  {gachaReward.type === 'gold' ? '💰' : gachaReward.type === 'silver' ? '🪙' : gachaReward.type === 'exp' ? '✨' : '❤️'}
                </Text>
              </View>

              <View style={{ marginTop: 32 }}>
                <Text style={styles.gachaTitle}>Kuil Nasib</Text>
                <Text style={styles.gachaSubtitle}>Berkat yang Diterima</Text>
                
                <View style={styles.gachaResultBox}>
                  <Text style={styles.gachaValue}>+{gachaReward.amount}</Text>
                  <Text style={styles.gachaValueType}>{gachaReward.type}</Text>
                </View>

                <Text style={styles.gachaMessage}>"{gachaReward.message}"</Text>

                <Pressable
                  onPress={() => setGachaReward(null)}
                  style={styles.gachaButton}
                >
                  <Text style={styles.gachaButtonText}>SYUKUR</Text>
                </Pressable>
              </View>
            </Animated.View>
          </Animated.View>
        )}

        <Navigation currentTab={currentTab} onTabChange={setCurrentTab} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  container: {
    flex: 1,
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainContent: {
    flex: 1,
    width: '100%',
    maxWidth: 500,
    paddingTop: 80,
    paddingBottom: 80,
  },
  tabContainer: {
    flex: 1,
  },
  offlineBadge: {
    position: 'absolute',
    top: 100,
    zIndex: 50,
    backgroundColor: COLORS.red,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    ...THEME.neoBorder,
    ...THEME.neoShadowSm,
  },
  offlineDot: {
    width: 8,
    height: 8,
    backgroundColor: COLORS.white,
    borderRadius: 4,
  },
  offlineText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  // Sleep Overlay
  sleepOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: COLORS.dark,
    zIndex: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  starContainer: {
    ...StyleSheet.absoluteFill,
  },
  star: {
    position: 'absolute',
    backgroundColor: COLORS.white,
    width: 2,
    height: 2,
    borderRadius: 1,
  },
  sleepContent: {
    alignItems: 'center',
    gap: 24,
  },
  moon: {
    width: 96,
    height: 96,
    backgroundColor: '#FDCC0D',
    borderRadius: 48,
    shadowColor: '#FDCC0D',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 40,
    elevation: 20,
  },
  sleepText: {
    color: COLORS.white,
    fontWeight: '900',
    fontStyle: 'italic',
    textTransform: 'uppercase',
    letterSpacing: 4,
    fontSize: 20,
  },
  // Overlays
  overlayFullscreen: {
    ...StyleSheet.absoluteFill,
    zIndex: 400,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  levelupCard: {
    backgroundColor: COLORS.white,
    ...THEME.neoBorderLg,
    ...THEME.neoShadowLg,
    padding: 40,
    borderRadius: 48,
    alignItems: 'center',
    width: '100%',
    maxWidth: 360,
  },
  levelupIconBox: {
    backgroundColor: COLORS.yellow,
    padding: 16,
    borderRadius: 24,
    ...THEME.neoBorder,
    ...THEME.neoShadowSm,
    marginBottom: 24,
  },
  levelupTitle: {
    fontSize: 40,
    fontWeight: '900',
    fontStyle: 'italic',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  levelupSubtitle: {
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 2,
    color: COLORS.dark,
    opacity: 0.4,
    marginBottom: 32,
  },
  levelupStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
    marginBottom: 40,
  },
  levelupOldLvl: {
    fontSize: 24,
    fontFamily: 'monospace',
    opacity: 0.4,
  },
  levelupNewLvlBox: {
    backgroundColor: COLORS.teal,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    ...THEME.neoBorder,
  },
  levelupNewLvl: {
    fontSize: 40,
    fontWeight: '900',
    fontStyle: 'italic',
    fontFamily: 'monospace',
  },
  levelupButton: {
    width: '100%',
    backgroundColor: COLORS.dark,
    paddingVertical: 20,
    borderRadius: 16,
    ...THEME.neoShadow,
    alignItems: 'center',
  },
  levelupButtonText: {
    color: COLORS.white,
    fontWeight: '900',
    fontStyle: 'italic',
    fontSize: 18,
    textTransform: 'uppercase',
  },
  // Gacha
  overlayModal: {
    ...StyleSheet.absoluteFill,
    zIndex: 500,
    backgroundColor: 'rgba(45, 52, 54, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  gachaCard: {
    backgroundColor: COLORS.white,
    ...THEME.neoBorderLg,
    ...THEME.neoShadowLg,
    padding: 40,
    borderRadius: 48,
    alignItems: 'center',
    width: '100%',
    maxWidth: 360,
  },
  gachaIconFloating: {
    position: 'absolute',
    top: -48,
    width: 96,
    height: 96,
    backgroundColor: COLORS.yellow,
    borderRadius: 48,
    ...THEME.neoBorder,
    ...THEME.neoShadowSm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gachaTitle: {
    fontSize: 32,
    fontWeight: '900',
    fontStyle: 'italic',
    textTransform: 'uppercase',
    textAlign: 'center',
    color: COLORS.dark,
  },
  gachaSubtitle: {
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 3,
    color: 'rgba(45, 52, 54, 0.4)',
    textAlign: 'center',
    marginBottom: 24,
  },
  gachaResultBox: {
    backgroundColor: COLORS.bg,
    ...THEME.neoBorder,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    marginBottom: 32,
  },
  gachaValue: {
    fontSize: 48,
    fontWeight: '900',
    fontFamily: 'monospace',
    color: COLORS.teal,
  },
  gachaValueType: {
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
    color: 'rgba(45, 52, 54, 0.4)',
  },
  gachaMessage: {
    fontStyle: 'italic',
    fontWeight: '700',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 40,
    color: COLORS.dark,
  },
  gachaButton: {
    width: '100%',
    backgroundColor: COLORS.teal,
    paddingVertical: 20,
    borderRadius: 16,
    ...THEME.neoShadow,
    alignItems: 'center',
  },
  gachaButtonText: {
    color: COLORS.dark,
    fontWeight: '900',
    fontStyle: 'italic',
    fontSize: 20,
    textTransform: 'uppercase',
  }
});
