import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Modal, Dimensions } from 'react-native';
import { UserStats, CityState, Era, EvolutionBranch } from '../../core/types';
import { ERAS_CONFIG, EVOLUTION_BRANCHES } from '../../core/constants';
import * as Icons from 'lucide-react-native';
import { ChevronRight, Target, Zap, Lock, Info, ArrowLeft, GitBranch, X, Check, CheckSquare, Loader2, Circle } from 'lucide-react-native';
import Animated, { FadeIn, FadeOut, SlideInUp, SlideOutDown } from 'react-native-reanimated';
import { COLORS, THEME } from '../theme';

const { width } = Dimensions.get('window');

interface EvolutionTabProps {
  stats: UserStats;
  city: CityState;
  onBack: () => void;
  onUnlock: (branchId: string) => Promise<boolean>;
}

const IconRenderer = ({ name, size = 16, color = COLORS.dark }: { name: string, size?: number, color?: string }) => {
  const Icon = (Icons as any)[name] || Circle;
  return <Icon size={size} color={color} />;
};

export function EvolutionTab({ stats, city, onBack, onUnlock }: EvolutionTabProps) {
  const [selectedEra, setSelectedEra] = useState<Era | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<EvolutionBranch | null>(null);
  const [isUnlocking, setIsUnlocking] = useState(false);

  const currentEraIndex = ERAS_CONFIG.findIndex(e => e.id === city.currentEra);

  const handleUnlock = async () => {
    if (!selectedBranch) return;
    setIsUnlocking(true);
    const success = await onUnlock(selectedBranch.id);
    if (success) {
      // Success feedback
    }
    setIsUnlocking(false);
  };

  return (
    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      <Pressable onPress={onBack} style={styles.backBtn}>
        <ArrowLeft size={16} color={COLORS.dark} />
        <Text style={styles.backBtnText}>Kembali ke Kota</Text>
      </Pressable>

      <View style={styles.headerCard}>
        <View style={styles.headerIconBg}>
          <GitBranch size={128} color="rgba(255,255,255,0.1)" />
        </View>
        <Text style={styles.headerTitle}>Pohon Evolusi</Text>
        <Text style={styles.headerSub}>Tentukan masa depan peradabanmu</Text>
        
        <View style={styles.infoBox}>
          <Info size={20} color={COLORS.teal} />
          <Text style={styles.infoText}>
            Pilihlah era untuk melihat jalur teknologi dan cabang kebudayaan yang tersedia.
          </Text>
        </View>
      </View>

      {/* Eras Timeline */}
      <View style={styles.timeline}>
        {ERAS_CONFIG.map((era, index) => {
          const isUnlocked = stats.level >= era.minLevel;
          const isCurrent = city.currentEra === era.id;
          const isPast = index < currentEraIndex;

          return (
            <View key={era.id} style={styles.timelineNode}>
              {index !== ERAS_CONFIG.length - 1 && (
                <View style={[styles.connector, isPast && { backgroundColor: COLORS.teal }]} />
              )}
              
              <Pressable
                onPress={() => setSelectedEra(era.id)}
                style={[
                  styles.eraCard,
                  isUnlocked ? styles.eraCardUnlocked : styles.eraCardLocked,
                  isCurrent && styles.eraCardCurrent
                ]}
              >
                <View style={[
                  styles.eraIconBox,
                  isCurrent ? { backgroundColor: COLORS.teal } : isUnlocked ? { backgroundColor: COLORS.bg } : { backgroundColor: '#E5E7EB' }
                ]}>
                  {isUnlocked ? (
                    isCurrent ? <Text style={{ fontSize: 16 }}>✨</Text> : <Text style={styles.eraIndex}>{index + 1}</Text>
                  ) : <Lock size={20} color="#9CA3AF" />}
                </View>

                <View style={styles.eraInfo}>
                  <View style={styles.eraTitleRow}>
                    <Text style={[styles.eraName, !isUnlocked && { color: '#9CA3AF' }]}>{era.name}</Text>
                    {isCurrent && (
                      <View style={styles.activeTag}>
                        <Text style={styles.activeTagText}>Aktif</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.eraStatus}>
                    {isUnlocked ? 'Terbuka' : `Butuh Level ${era.minLevel}`}
                  </Text>
                </View>

                <ChevronRight size={20} color={isUnlocked ? COLORS.dark : '#D1D5DB'} />
              </Pressable>
            </View>
          );
        })}
      </View>

      {/* Era Details Overlay */}
      {selectedEra && (
        <Modal
          transparent
          animationType="fade"
          visible={true}
          onRequestClose={() => { setSelectedEra(null); setSelectedBranch(null); }}
        >
          <Pressable 
            style={styles.modalOverlay}
            onPress={() => { setSelectedEra(null); setSelectedBranch(null); }}
          >
            <Animated.View 
              entering={SlideInUp}
              exiting={SlideOutDown}
              style={styles.sheet}
              onTouchStart={(e) => e.stopPropagation()}
            >
              <View style={styles.sheetHeader}>
                <View>
                  <Text style={styles.sheetTitle}>
                    {ERAS_CONFIG.find(e => e.id === selectedEra)?.name}
                  </Text>
                  <Text style={styles.sheetSub}>Cabang Peradaban</Text>
                </View>
                <Pressable 
                  onPress={() => { setSelectedEra(null); setSelectedBranch(null); }}
                  style={styles.closeBtn}
                >
                  <X size={24} color={COLORS.dark} />
                </Pressable>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.eraDesc}>
                  "{ERAS_CONFIG.find(e => e.id === selectedEra)?.description}"
                </Text>

                <View style={styles.branchesSection}>
                  <Text style={styles.sectionTitle}>Jalur Evolusi Tersedia</Text>
                  <View style={styles.branchesGrid}>
                    {EVOLUTION_BRANCHES.filter(b => b.era === selectedEra).map(branch => {
                      const isBranchUnlocked = city.unlockedEvolutions?.includes(branch.id);
                      return (
                        <Pressable
                          key={branch.id}
                          onPress={() => setSelectedBranch(branch)}
                          style={[
                            styles.branchCard,
                            selectedBranch?.id === branch.id ? styles.branchCardSelected : isBranchUnlocked ? styles.branchCardUnlocked : styles.branchCardDefault
                          ]}
                        >
                          {isBranchUnlocked && (
                            <View style={styles.checkBadge}>
                              <Check size={12} color="#FFF" />
                            </View>
                          )}
                          <View style={styles.branchIconBox}>
                            <IconRenderer name={branch.iconName} size={28} />
                          </View>
                          <Text style={styles.branchName}>{branch.name}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                {selectedBranch && (
                  <View style={styles.branchDetails}>
                    <View style={styles.branchDetailHeader}>
                      <View style={styles.branchDetailIconBox}>
                        <Target size={20} color={COLORS.dark} />
                      </View>
                      <View>
                        <Text style={styles.branchDetailName}>{selectedBranch.name}</Text>
                        <Text style={styles.branchDetailMeta}>Detail & Requirements</Text>
                      </View>
                      {city.unlockedEvolutions?.includes(selectedBranch.id) && (
                        <View style={styles.unlockedTag}>
                          <Text style={styles.unlockedTagText}>Unlocked</Text>
                        </View>
                      )}
                    </View>

                    <Text style={styles.branchDescText}>"{selectedBranch.description}"</Text>

                    <View style={styles.reqSection}>
                      <View style={styles.reqHeaderRow}>
                        <CheckSquare size={16} color={COLORS.yellow} />
                        <Text style={styles.reqHeaderTitle}>Syarat Pembukaan</Text>
                      </View>
                      <View style={styles.reqList}>
                        {selectedBranch.requirements.map((req, i) => {
                          let isMet = false;
                          if (req.type === 'level') isMet = stats.level >= (req.target as number);
                          if (req.type === 'buildings') {
                             const count = city.buildings.filter(b => b.buildingTypeId === req.target).length;
                             isMet = count >= (typeof req.target === 'string' ? 2 : (req.target as number));
                          }
                          return (
                            <View key={i} style={styles.reqItem}>
                              <Text style={styles.reqItemText}>{req.description}</Text>
                              {isMet ? (
                                <Check size={16} color={COLORS.teal} />
                              ) : (
                                <Lock size={12} color="rgba(255,255,255,0.2)" />
                              )}
                            </View>
                          );
                        })}
                      </View>
                    </View>

                    <View style={styles.benefitSection}>
                      <View style={styles.benefitHeaderRow}>
                        <Zap size={16} color={COLORS.teal} />
                        <Text style={styles.benefitHeaderTitle}>Keuntungan Budaya</Text>
                      </View>
                      <View style={styles.benefitList}>
                        {selectedBranch.benefits.map((benefit, i) => (
                          <View key={i} style={styles.benefitItem}>
                            <View style={styles.dot} />
                            <Text style={styles.benefitText}>{benefit}</Text>
                          </View>
                        ))}
                      </View>
                    </View>

                    {!city.unlockedEvolutions?.includes(selectedBranch.id) && (
                      <Pressable
                        disabled={isUnlocking || !selectedBranch.requirements.every(req => {
                          if (req.type === 'level') return stats.level >= (req.target as number);
                          if (req.type === 'buildings') return city.buildings.filter(b => b.buildingTypeId === req.target).length >= 2;
                          return true;
                        })}
                        onPress={handleUnlock}
                        style={[styles.unlockBtn, isUnlocking && { opacity: 0.5 }]}
                      >
                        {isUnlocking ? <Loader2 size={16} color={COLORS.dark} style={{ transform: [{ rotate: '45deg' }] }} /> : <Zap size={16} color={COLORS.dark} />}
                        <Text style={styles.unlockBtnText}>Mulai Evolusi</Text>
                      </Pressable>
                    )}
                  </View>
                )}
                <View style={{ height: 40 }} />
              </ScrollView>
            </Animated.View>
          </Pressable>
        </Modal>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    padding: 16,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
  },
  backBtnText: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.dark,
    textTransform: 'uppercase',
    fontStyle: 'italic',
  },
  headerCard: {
    backgroundColor: COLORS.dark,
    borderRadius: 40,
    padding: 32,
    ...THEME.neoBorderLg,
    ...THEME.neoShadowLg,
    marginBottom: 32,
    position: 'relative',
    overflow: 'hidden',
  },
  headerIconBg: {
    position: 'absolute',
    top: 20,
    right: 20,
    opacity: 0.1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    fontStyle: 'italic',
    color: '#FFF',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  headerSub: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.yellow,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 24,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 16,
    borderRadius: 20,
    ...THEME.neoBorder,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  infoText: {
    flex: 1,
    color: '#FFF',
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  timeline: {
    paddingLeft: 8,
    marginBottom: 100,
  },
  timelineNode: {
    position: 'relative',
    marginBottom: 24,
  },
  connector: {
    position: 'absolute',
    left: 32,
    top: 64,
    width: 4,
    height: 32,
    backgroundColor: '#E5E7EB',
    zIndex: 0,
  },
  eraCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    borderRadius: 32,
    ...THEME.neoBorderLg,
    ...THEME.neoShadow,
    gap: 16,
    zIndex: 1,
  },
  eraCardUnlocked: {
    backgroundColor: '#FFF',
  },
  eraCardLocked: {
    backgroundColor: '#F9FAFB',
    opacity: 0.5,
  },
  eraCardCurrent: {
    borderColor: COLORS.teal,
    borderWidth: 4,
  },
  eraIconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    ...THEME.neoBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eraIndex: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.dark,
  },
  eraInfo: {
    flex: 1,
  },
  eraTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  eraName: {
    fontSize: 16,
    fontWeight: '900',
    fontStyle: 'italic',
    textTransform: 'uppercase',
    color: COLORS.dark,
  },
  activeTag: {
    backgroundColor: COLORS.teal,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  activeTagText: {
    fontSize: 8,
    fontWeight: '900',
    textTransform: 'uppercase',
    color: COLORS.dark,
  },
  eraStatus: {
    fontSize: 10,
    fontWeight: '700',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  // Modal Sheet
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(45, 52, 54, 0.2)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    padding: 32,
    borderTopWidth: 4,
    borderTopColor: COLORS.dark,
    ...THEME.neoShadowLg,
    maxHeight: '90%',
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  sheetTitle: {
    fontSize: 28,
    fontWeight: '900',
    fontStyle: 'italic',
    color: COLORS.dark,
    textTransform: 'uppercase',
  },
  sheetSub: {
    fontSize: 10,
    fontWeight: '900',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  closeBtn: {
    padding: 12,
    borderRadius: 16,
    backgroundColor: COLORS.bg,
    ...THEME.neoBorder,
  },
  eraDesc: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6B7280',
    fontStyle: 'italic',
    marginBottom: 32,
  },
  branchesSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    color: COLORS.dark,
    opacity: 0.4,
    letterSpacing: 2,
    marginBottom: 16,
  },
  branchesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  branchCard: {
    width: (width - 64 - 12) / 2,
    padding: 24,
    borderRadius: 24,
    borderWidth: 2,
    alignItems: 'center',
    gap: 12,
  },
  branchCardDefault: {
    backgroundColor: COLORS.bg,
    borderColor: 'transparent',
  },
  branchCardSelected: {
    backgroundColor: COLORS.teal,
    borderColor: COLORS.dark,
    ...THEME.neoShadowSm,
  },
  branchCardUnlocked: {
    backgroundColor: 'rgba(45, 204, 113, 0.1)',
    borderColor: 'rgba(45, 204, 113, 0.2)',
  },
  checkBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: COLORS.teal,
    padding: 4,
    borderRadius: 8,
  },
  branchIconBox: {
    width: 56,
    height: 56,
    backgroundColor: '#FFF',
    borderRadius: 16,
    ...THEME.neoBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  branchName: {
    fontSize: 10,
    fontWeight: '900',
    fontStyle: 'italic',
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  branchDetails: {
    backgroundColor: COLORS.dark,
    borderRadius: 32,
    padding: 24,
    ...THEME.neoBorder,
  },
  branchDetailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  branchDetailIconBox: {
    width: 40,
    height: 40,
    backgroundColor: COLORS.teal,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  branchDetailName: {
    fontSize: 16,
    fontWeight: '900',
    fontStyle: 'italic',
    color: COLORS.teal,
    textTransform: 'uppercase',
  },
  branchDetailMeta: {
    fontSize: 8,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.4)',
    textTransform: 'uppercase',
  },
  unlockedTag: {
    marginLeft: 'auto',
    backgroundColor: COLORS.teal,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  unlockedTagText: {
    fontSize: 8,
    fontWeight: '900',
    color: COLORS.dark,
    textTransform: 'uppercase',
  },
  branchDescText: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.8)',
    fontStyle: 'italic',
    marginBottom: 24,
  },
  reqSection: {
    marginBottom: 24,
  },
  reqHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  reqHeaderTitle: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.yellow,
    textTransform: 'uppercase',
  },
  reqList: {
    gap: 8,
  },
  reqItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  reqItemText: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  benefitSection: {
    marginBottom: 32,
  },
  benefitHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  benefitHeaderTitle: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.teal,
    textTransform: 'uppercase',
  },
  benefitList: {
    gap: 8,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 8,
    borderRadius: 8,
  },
  dot: {
    width: 6,
    height: 6,
    backgroundColor: COLORS.teal,
    borderRadius: 3,
  },
  benefitText: {
    fontSize: 9,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  unlockBtn: {
    backgroundColor: COLORS.teal,
    paddingVertical: 16,
    borderRadius: 20,
    ...THEME.neoBorder,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    ...THEME.neoShadow,
    shadowColor: '#FFF',
  },
  unlockBtnText: {
    fontSize: 14,
    fontWeight: '900',
    fontStyle: 'italic',
    textTransform: 'uppercase',
    color: COLORS.dark,
    letterSpacing: 1,
  }
});
