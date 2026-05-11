import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Image, Dimensions } from 'react-native';
import { UserStats, ActivityLog } from '../../core/types';
import { 
  Award, User, MapPin, Globe, Bell, ShieldCheck, 
  History, Clock, ArrowUpRight, ArrowDownLeft,
  ChevronRight, LogOut, Info, Settings, Trophy, Mountain, Shield, Zap, Smartphone, Cpu
} from 'lucide-react-native';
import { auth } from '../../platform/api/firebase';
import { signOut } from 'firebase/auth';
import { useCivStore } from '../../core/progression/store';
import { LeaderboardTab } from './LeaderboardTab';
import { platformConfirm } from '../../platform/mobile/utils/interactions';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { COLORS, THEME } from '../theme';

const { width } = Dimensions.get('window');

export function MenuTab() {
  const stats = useCivStore((state) => state.stats);
  const logs = useCivStore((state) => state.logs);
  const [activeSection, setActiveSection] = useState<'profile' | 'logs' | 'rank' | 'settings'>('profile');
  const user = auth.currentUser;

  const badgeGallery = [
    { title: 'Pionir Batu', icon: Mountain, unlocked: stats.level >= 1 },
    { title: 'Ksatria Besi', icon: Shield, unlocked: stats.level >= 5 },
    { title: 'Insinyur Uap', icon: Zap, unlocked: stats.level >= 15 },
    { title: 'Warga Modern', icon: Smartphone, unlocked: stats.level >= 30 },
    { title: 'Avatar Digital', icon: Cpu, unlocked: stats.level >= 50 },
  ];

  const handleLogout = () => {
    if (platformConfirm('Keluar dari peradaban Fitnismu?')) {
      signOut(auth);
    }
  };

  return (
    <View style={styles.container}>
      {/* Menu Header / Switcher */}
      <View style={styles.switcher}>
        {[
          { id: 'profile', label: 'Profil', icon: User },
          { id: 'logs', label: 'Log', icon: History },
          { id: 'rank', label: 'Rank', icon: Trophy },
          { id: 'settings', label: 'Opsi', icon: Settings }
        ].map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <Pressable
              key={item.id}
              onPress={() => setActiveSection(item.id as any)}
              style={[styles.switchBtn, isActive && styles.switchBtnActive]}
            >
              <Icon size={16} color={isActive ? '#FFF' : '#9CA3AF'} />
              <Text style={[styles.switchText, isActive && styles.switchTextActive]}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <ScrollView style={styles.contentScroll} showsVerticalScrollIndicator={false}>
        {activeSection === 'profile' && (
          <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.section}>
            {/* Profile Card */}
            <View style={styles.profileCard}>
              <View style={styles.avatarBox}>
                {user?.photoURL ? (
                   <Image source={{ uri: user.photoURL }} style={styles.profileImg} />
                ) : (
                  <User size={48} color={COLORS.dark} />
                )}
              </View>
              <Text style={styles.profileName}>{user?.displayName || 'Citizen #9923'}</Text>
              <Text style={styles.profileLevel}>Level {stats.level} Survivor</Text>
              
              <View style={styles.statGrid}>
                <View style={styles.smallStatCard}>
                  <Text style={styles.statValue}>{stats.dayCount}</Text>
                  <Text style={styles.statLabel}>Hari Aktif</Text>
                </View>
                <View style={styles.smallStatCard}>
                   <Text style={[styles.statValue, { fontStyle: 'italic' }]}>S{stats.level}</Text>
                   <Text style={styles.statLabel}>Tier Kota</Text>
                </View>
              </View>
            </View>

            {/* Badge Gallery */}
            <View style={styles.badgeSection}>
              <View style={styles.badgeHeader}>
                <Award size={14} color="#9CA3AF" />
                <Text style={styles.badgeSectionTitle}>Galeri Lencana</Text>
              </View>
              <View style={styles.badgeGrid}>
                {badgeGallery.map((badge, i) => {
                  const Icon = badge.icon;
                  return (
                    <View 
                      key={i}
                      style={[
                        styles.badgeCard,
                        badge.unlocked ? styles.badgeCardUnlocked : styles.badgeCardLocked
                      ]}
                    >
                      <View style={[styles.badgeIconBox, { backgroundColor: badge.unlocked ? COLORS.yellow : '#E5E7EB' }]}>
                        <Icon size={24} color={badge.unlocked ? COLORS.dark : '#9CA3AF'} />
                      </View>
                      <Text style={styles.badgeTitle}>{badge.title}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          </Animated.View>
        )}

        {activeSection === 'logs' && (
          <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.section}>
            <View style={styles.logsCard}>
              <View style={styles.logsHeader}>
                <History size={24} color={COLORS.dark} />
                <Text style={styles.logsTitle}>Riwayat Aktivitas</Text>
              </View>

              <View style={styles.logsList}>
                {(logs?.length || 0) > 0 ? (
                  logs.map((log) => (
                    <View 
                      key={log.id}
                      style={styles.logItem}
                    >
                      <View style={[
                        styles.logIconBox,
                        { backgroundColor: log.change > 0 ? COLORS.teal : COLORS.red }
                      ]}>
                        {log.change > 0 ? <ArrowUpRight size={16} color="#FFF" /> : <ArrowDownLeft size={16} color="#FFF" />}
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.logMsg}>{log.message}</Text>
                        <View style={styles.logMeta}>
                          <View style={styles.logTimeRow}>
                            <Clock size={10} color="#9CA3AF" />
                            <Text style={styles.logTime}>
                              {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </Text>
                          </View>
                          <Text style={[
                            styles.logChange,
                            { color: log.change > 0 ? COLORS.teal : COLORS.red }
                          ]}>
                            {log.change > 0 ? '+' : ''}{log.change} {log.unit}
                          </Text>
                        </View>
                      </View>
                    </View>
                  ))
                ) : (
                  <View style={styles.emptyLogs}>
                    <Text style={styles.emptyText}>Belum ada catatan aktivitas...</Text>
                  </View>
                )}
              </View>
            </View>
          </Animated.View>
        )}

        {activeSection === 'rank' && (
          <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.section}>
            <LeaderboardTab isEmbedded />
          </Animated.View>
        )}

        {activeSection === 'settings' && (
          <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.section}>
            {/* Preferences */}
            <View style={styles.settingsCard}>
               <View style={styles.settingsHeader}>
                  <Text style={styles.settingsTitle}>Layanan Sektor</Text>
                  <ShieldCheck size={24} color={COLORS.teal} />
               </View>
               
               <View style={styles.settingsOptions}>
                  <Pressable style={styles.optionBtn}>
                    <View style={styles.optionLeft}>
                      <MapPin size={16} color={COLORS.teal} />
                      <Text style={styles.optionLabel}>Zona Waktu</Text>
                    </View>
                    <Text style={styles.optionVal}>WIB</Text>
                  </Pressable>
                  <Pressable style={styles.optionBtn}>
                    <View style={styles.optionLeft}>
                      <Bell size={16} color={COLORS.teal} />
                      <Text style={styles.optionLabel}>Notifikasi</Text>
                    </View>
                    <View style={styles.toggleBg}>
                       <View style={styles.toggleCircle} />
                    </View>
                  </Pressable>
                  <Pressable style={styles.optionBtn}>
                    <View style={styles.optionLeft}>
                      <Info size={16} color={COLORS.teal} />
                      <Text style={styles.optionLabel}>Bantuan & FAQ</Text>
                    </View>
                    <ChevronRight size={16} color="rgba(255,255,255,0.4)" />
                  </Pressable>
               </View>
            </View>

            <Pressable 
              onPress={handleLogout}
              style={styles.logoutBtn}
            >
               <LogOut size={20} color="#FFF" />
               <Text style={styles.logoutBtnText}>Keluar Sesi</Text>
            </Pressable>
          </Animated.View>
        )}
        
        {/* Footer Info */}
        <View style={styles.footer}>
          <Text style={styles.buildInfo}>CivFit v1.7.0 Cloud Sync</Text>
          <Text style={styles.motto}>Build peradabanmu, bangun dirimu.</Text>
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  switcher: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    padding: 6,
    borderRadius: 32,
    ...THEME.neoBorder,
    ...THEME.neoShadow,
    marginBottom: 24,
  },
  switchBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 24,
  },
  switchBtnActive: {
    backgroundColor: COLORS.dark,
  },
  switchText: {
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#9CA3AF',
  },
  switchTextActive: {
    color: '#FFF',
  },
  contentScroll: {
    flex: 1,
  },
  section: {
    gap: 24,
  },
  profileCard: {
    backgroundColor: '#FFF',
    borderRadius: 40,
    padding: 32,
    ...THEME.neoBorderLg,
    ...THEME.neoShadowLg,
    alignItems: 'center',
  },
  avatarBox: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.bg,
    ...THEME.neoBorder,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    ...THEME.neoShadow,
    overflow: 'hidden',
  },
  profileImg: {
    width: '100%',
    height: '100%',
  },
  profileName: {
    fontSize: 32,
    fontWeight: '900',
    fontStyle: 'italic',
    textTransform: 'uppercase',
    color: COLORS.dark,
    textAlign: 'center',
    marginBottom: 4,
  },
  profileLevel: {
    fontSize: 10,
    fontWeight: '900',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 32,
  },
  statGrid: {
    flexDirection: 'row',
    gap: 16,
    width: '100%',
  },
  smallStatCard: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    ...THEME.neoBorder,
    padding: 16,
    borderRadius: 24,
    alignItems: 'center',
    ...THEME.neoShadowSm,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.dark,
    fontFamily: 'monospace',
  },
  statLabel: {
    fontSize: 8,
    fontWeight: '900',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    marginTop: 4,
  },
  badgeSection: {
    gap: 16,
  },
  badgeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 4,
  },
  badgeSectionTitle: {
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    color: '#9CA3AF',
    letterSpacing: 2,
  },
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  badgeCard: {
    width: (width - 32 - 24) / 3,
    aspectRatio: 1,
    borderRadius: 32,
    borderWidth: 2,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  badgeCardUnlocked: {
    backgroundColor: '#FFF',
    borderColor: COLORS.dark,
    ...THEME.neoShadowSm,
  },
  badgeCardLocked: {
    backgroundColor: '#F3F4F6',
    borderStyle: 'dashed',
    borderColor: '#D1D5DB',
    opacity: 0.4,
  },
  badgeIconBox: {
    padding: 8,
    borderRadius: 12,
    ...THEME.neoBorder,
    ...THEME.neoShadowSm,
  },
  badgeTitle: {
    fontSize: 8,
    fontWeight: '900',
    textTransform: 'uppercase',
    textAlign: 'center',
    color: COLORS.dark,
  },
  logsCard: {
    backgroundColor: '#FFF',
    borderRadius: 40,
    padding: 24,
    ...THEME.neoBorderLg,
    ...THEME.neoShadowLg,
  },
  logsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  logsTitle: {
    fontSize: 20,
    fontWeight: '900',
    fontStyle: 'italic',
    textTransform: 'uppercase',
    color: COLORS.dark,
  },
  logsList: {
    gap: 16,
  },
  logItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    padding: 16,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: COLORS.dark,
    backgroundColor: COLORS.bg,
    ...THEME.neoShadowSm,
    shadowColor: '#000',
  },
  logIconBox: {
    padding: 8,
    borderRadius: 12,
    ...THEME.neoBorder,
  },
  logMsg: {
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
    color: COLORS.dark,
    lineHeight: 16,
  },
  logMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  logTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  logTime: {
    fontSize: 8,
    fontWeight: '900',
    color: '#9CA3AF',
    textTransform: 'uppercase',
  },
  logChange: {
    fontSize: 8,
    fontWeight: '900',
    textTransform: 'uppercase',
    textDecorationLine: 'underline',
  },
  emptyLogs: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#D1D5DB',
    fontStyle: 'italic',
    textTransform: 'uppercase',
  },
  settingsCard: {
    backgroundColor: COLORS.dark,
    padding: 32,
    borderRadius: 40,
    ...THEME.neoBorderLg,
    ...THEME.neoShadowLg,
  },
  settingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  settingsTitle: {
    fontSize: 24,
    fontWeight: '900',
    fontStyle: 'italic',
    textTransform: 'uppercase',
    color: COLORS.teal,
  },
  settingsOptions: {
    gap: 12,
  },
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 16,
    borderRadius: 20,
    ...THEME.neoBorder,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFF',
    textTransform: 'uppercase',
  },
  optionVal: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.yellow,
  },
  toggleBg: {
    width: 40,
    height: 20,
    backgroundColor: COLORS.red,
    borderRadius: 10,
    ...THEME.neoBorder,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleCircle: {
    width: 14,
    height: 14,
    backgroundColor: '#FFF',
    borderRadius: 7,
    alignSelf: 'flex-end',
  },
  logoutBtn: {
    backgroundColor: COLORS.red,
    paddingVertical: 20,
    borderRadius: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    ...THEME.neoBorder,
    ...THEME.neoShadow,
  },
  logoutBtnText: {
    fontSize: 18,
    fontWeight: '900',
    fontStyle: 'italic',
    textTransform: 'uppercase',
    color: '#FFF',
    letterSpacing: 2,
  },
  footer: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  buildInfo: {
    fontSize: 10,
    fontWeight: '900',
    color: '#D1D5DB',
    textTransform: 'uppercase',
    letterSpacing: 4,
    marginBottom: 8,
  },
  motto: {
    fontSize: 8,
    fontWeight: '700',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    fontStyle: 'italic',
    letterSpacing: 2,
  }
});
