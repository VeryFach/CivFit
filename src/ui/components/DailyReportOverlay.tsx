import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Modal, Dimensions } from 'react-native';
import { DailyReport, UserStats } from '../../core/types';
import { 
  CheckCircle2, 
  TrendingUp, 
  ChevronRight, 
  Zap, 
  Skull, 
  Heart, 
  Users, 
  Coins, 
  Sparkles,
  ArrowUpRight,
  AlertTriangle
} from 'lucide-react-native';
import Animated, { FadeIn, ZoomIn, SlideInUp } from 'react-native-reanimated';
import { COLORS, THEME } from '../theme';

const { height } = Dimensions.get('window');

interface DailyReportOverlayProps {
  report: DailyReport;
  stats: UserStats;
  onClose: () => void;
}

export function DailyReportOverlay({ report, stats, onClose }: DailyReportOverlayProps) {
  return (
    <Modal transparent visible={true} animationType="fade">
      <View style={styles.overlay}>
        <Animated.View 
          entering={FadeIn.duration(400)}
          style={styles.backdrop} 
        />
        
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View 
            entering={ZoomIn.delay(200)}
            style={styles.content}
          >
            <View style={styles.header}>
               <Animated.View 
                 entering={ZoomIn.delay(400)}
                 style={styles.trophyIcon}
               >
                  <TrendingUp size={32} color={COLORS.dark} />
               </Animated.View>
               <Text style={styles.headerTitle}>Morning Report</Text>
               <Text style={styles.headerSub}>Day {stats.dayCount} Evaluation</Text>
            </View>

            <View style={styles.cardStack}>
              {/* Momentum Card */}
              <View style={styles.glassCard}>
                 <View style={styles.glassIconBg}>
                    <Sparkles size={80} color={report.momentumBonus >= 0 ? COLORS.teal : COLORS.red} opacity={0.1} />
                 </View>
                 
                 <View style={styles.cardRow}>
                    <View style={styles.cardInfo}>
                       <View style={styles.tagRow}>
                          <Zap size={12} color={COLORS.yellow} />
                          <Text style={styles.tagText}>Momentum Protocol</Text>
                       </View>
                       <View style={styles.mainValRow}>
                          <Text style={styles.mainValText}>{stats.momentum}%</Text>
                          <Text style={styles.mainValSub}>Active Momentum</Text>
                       </View>
                    </View>
                    <Text style={[styles.deltaText, { color: report.momentumBonus >= 0 ? COLORS.teal : COLORS.red }]}>
                      {report.momentumBonus >= 0 ? '+' : ''}{report.momentumBonus}%
                    </Text>
                 </View>
                 <Text style={styles.quoteText}>"{report.message}"</Text>
              </View>

              {/* Incident Card */}
              {report.event && (
                <View style={[styles.glassCard, styles.dangerCard]}>
                   <View style={styles.glassIconBg}>
                      <Skull size={96} color={COLORS.red} opacity={0.1} />
                   </View>
                   <View style={styles.tagRow}>
                      <AlertTriangle size={12} color={COLORS.red} />
                      <Text style={[styles.tagText, { color: COLORS.red }]}>Incident Report</Text>
                   </View>
                   <Text style={styles.eventTitle}>{report.event.name}</Text>
                   <Text style={styles.eventDesc}>{report.event.description}</Text>
                   <View style={styles.eventImpactRow}>
                      <Zap size={12} color={COLORS.red} />
                      <Text style={styles.eventImpactText}>Impact: -{report.event.severity}% {report.event.impactType}</Text>
                   </View>
                </View>
              )}

              {/* Real World Impact */}
              <View style={styles.glassCard}>
                 <View style={styles.cardHeaderRow}>
                    <Text style={styles.cardHeadline}>Real World Impact</Text>
                    <View style={styles.countBadge}>
                       <Text style={styles.countText}>{report.habitsCompleted}/{report.habitsTotal} Completed</Text>
                    </View>
                 </View>
                 
                 <View style={styles.statsGrid}>
                    <View style={styles.statBox}>
                       <Text style={styles.statLabel}>Biometric Status</Text>
                       <View style={styles.statLine}>
                          <View style={[styles.statIconBox, { borderColor: report.hpChange >= 0 ? 'rgba(45, 204, 113, 0.3)' : 'rgba(255, 107, 107, 0.3)' }]}>
                             {report.hpChange >= 0 ? <Heart size={16} color={COLORS.teal} /> : <Skull size={16} color={COLORS.red} />}
                          </View>
                          <Text style={[styles.statValue, { color: report.hpChange >= 0 ? COLORS.teal : COLORS.red }]}>
                            {report.hpChange >= 0 ? '+' : ''}{report.hpChange} HP
                          </Text>
                       </View>
                    </View>
                    <View style={styles.statBox}>
                       <Text style={styles.statLabel}>Daily Earnings</Text>
                       <View style={styles.statLine}>
                          <View style={[styles.statIconBox, { borderColor: 'rgba(253, 204, 13, 0.3)' }]}>
                             <Coins size={16} color={COLORS.yellow} />
                          </View>
                          <Text style={[styles.statValue, { color: COLORS.yellow }]}>+{report.goldGained} G</Text>
                       </View>
                    </View>
                 </View>
              </View>

              {/* Simulation Result */}
              <View style={[styles.glassCard, { overflow: 'hidden' }]}>
                 <View style={styles.progressTrack}>
                    <Animated.View 
                      entering={SlideInUp.delay(600)}
                      style={[styles.progressFill, { width: `${stats.momentum}%` }]} 
                    />
                 </View>
                 
                 <Text style={styles.cardHeadline}>Simulation Summary</Text>
                 
                 <View style={styles.simList}>
                    <View style={styles.simItem}>
                       <View style={styles.simIconBox}>
                          <Users size={16} color={COLORS.teal} />
                       </View>
                       <View style={styles.simInfo}>
                          <Text style={styles.simMeta}>Demographics</Text>
                          <Text style={styles.simName}>Population Growth</Text>
                       </View>
                       <View style={styles.simRight}>
                          <Text style={[styles.simDelta, { color: report.populationGrowth >= 0 ? COLORS.teal : COLORS.red }]}>
                             {report.populationGrowth >= 0 ? '+' : ''}{report.populationGrowth}
                          </Text>
                          <Text style={styles.simUnit}>Citizens</Text>
                       </View>
                    </View>

                    {(report.sickChange !== 0 || (report.deathCount || 0) > 0) && (
                       <View style={styles.hazardBox}>
                          <View style={styles.hazardRow}>
                             <Text style={styles.hazardLabel}>Sickness Delta</Text>
                             <Text style={styles.hazardVal}>{report.sickChange! > 0 ? '+' : ''}{report.sickChange} citizens</Text>
                          </View>
                          {report.deathCount! > 0 && (
                            <View style={styles.hazardRow}>
                               <Text style={styles.hazardLabel}>Fatalities</Text>
                               <Text style={styles.hazardVal}>-{report.deathCount} citizens</Text>
                            </View>
                          )}
                       </View>
                    )}

                    <View style={styles.simItem}>
                       <View style={[styles.simIconBox, { backgroundColor: 'rgba(253, 204, 13, 0.1)' }]}>
                          <ArrowUpRight size={16} color={COLORS.yellow} />
                       </View>
                       <View style={styles.simInfo}>
                          <Text style={styles.simMeta}>Economic Flow</Text>
                          <Text style={styles.simName}>Treasury Collection</Text>
                       </View>
                       <View style={styles.simRight}>
                          <Text style={[styles.simDelta, { color: COLORS.yellow }]}>+{report.silverTax} S</Text>
                          <Text style={styles.simUnit}>Silver</Text>
                       </View>
                    </View>

                    <View style={styles.simItem}>
                       <View style={[styles.simIconBox, { backgroundColor: 'rgba(155, 89, 182, 0.1)' }]}>
                          <Zap size={16} color={COLORS.purple} />
                       </View>
                       <View style={styles.simInfo}>
                          <Text style={styles.simMeta}>Evolution Data</Text>
                          <Text style={styles.simName}>Intellectual Progress</Text>
                       </View>
                       <View style={styles.simRight}>
                          <Text style={[styles.simDelta, { color: COLORS.purple }]}>+{report.expGained} X</Text>
                          <Text style={styles.simUnit}>Exp</Text>
                       </View>
                    </View>
                 </View>
              </View>
            </View>

            <Pressable 
              onPress={onClose}
              style={styles.closeBtn}
            >
              <Text style={styles.closeBtnText}>Begin New Cycle</Text>
            </Pressable>
          </Animated.View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    padding: 24,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: COLORS.dark,
    opacity: 0.98,
  },
  scrollContent: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  content: {
    width: '100%',
    maxWidth: 400,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  trophyIcon: {
    width: 64,
    height: 64,
    backgroundColor: COLORS.yellow,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    ...THEME.neoShadowSm,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '900',
    fontStyle: 'italic',
    color: '#FFF',
    textTransform: 'uppercase',
  },
  headerSub: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.teal,
    textTransform: 'uppercase',
    letterSpacing: 3,
    marginTop: 4,
  },
  cardStack: {
    gap: 16,
  },
  glassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 32,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    position: 'relative',
    overflow: 'hidden',
  },
  glassIconBg: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardInfo: {
    flex: 1,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 9,
    fontWeight: '900',
    color: 'rgba(255, 255, 255, 0.4)',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  mainValRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  mainValText: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFF',
    fontFamily: 'monospace',
  },
  mainValSub: {
    fontSize: 8,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.4)',
    textTransform: 'uppercase',
  },
  deltaText: {
    fontSize: 18,
    fontWeight: '900',
    fontFamily: 'monospace',
  },
  quoteText: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.6)',
    fontStyle: 'italic',
    marginTop: 4,
  },
  // Danger Card
  dangerCard: {
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderColor: 'rgba(255, 107, 107, 0.3)',
  },
  eventTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFF',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  eventDesc: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.6)',
    lineHeight: 18,
  },
  eventImpactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
  },
  eventImpactText: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.red,
    textTransform: 'uppercase',
  },
  // Stats
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  cardHeadline: {
    fontSize: 10,
    fontWeight: '900',
    color: 'rgba(255, 255, 255, 0.4)',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  countBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  countText: {
    fontSize: 10,
    fontWeight: '900',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  statBox: {
    flex: 1,
  },
  statLabel: {
    fontSize: 8,
    fontWeight: '900',
    color: 'rgba(255, 255, 255, 0.3)',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  statLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statIconBox: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '900',
    fontFamily: 'monospace',
  },
  // Simulation
  progressTrack: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.teal,
    shadowColor: COLORS.teal,
    shadowRadius: 5,
    shadowOpacity: 1,
  },
  simList: {
    marginTop: 24,
    gap: 12,
  },
  simItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  simIconBox: {
    width: 32,
    height: 32,
    backgroundColor: 'rgba(45, 204, 113, 0.1)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  simInfo: {
    flex: 1,
  },
  simMeta: {
    fontSize: 8,
    fontWeight: '900',
    color: 'rgba(255, 255, 255, 0.4)',
    textTransform: 'uppercase',
  },
  simName: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFF',
    fontStyle: 'italic',
  },
  simRight: {
    alignItems: 'flex-end',
  },
  simDelta: {
    fontSize: 18,
    fontWeight: '900',
    fontFamily: 'monospace',
  },
  simUnit: {
    fontSize: 8,
    fontWeight: '900',
    color: '#9CA3AF',
    textTransform: 'uppercase',
  },
  hazardBox: {
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    padding: 12,
    borderRadius: 16,
    gap: 4,
  },
  hazardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  hazardLabel: {
    fontSize: 8,
    fontWeight: '900',
    color: COLORS.red,
    textTransform: 'uppercase',
  },
  hazardVal: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.red,
  },
  closeBtn: {
    backgroundColor: COLORS.teal,
    paddingVertical: 20,
    borderRadius: 32,
    ...THEME.neoBorder,
    ...THEME.neoShadow,
    alignItems: 'center',
    marginTop: 32,
  },
  closeBtnText: {
    fontSize: 18,
    fontWeight: '900',
    fontStyle: 'italic',
    textTransform: 'uppercase',
    color: COLORS.dark,
    letterSpacing: 1,
  }
});
