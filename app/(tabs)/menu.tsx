import { signOut } from 'firebase/auth';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { auth } from '../../FirebaseConfig';
import { CivfitScreen } from '../../src/components/civfit/screen';
import { useCivfitStore } from '../../src/state/civfit-store';

export default function MenuScreen() {
  const { stats } = useCivfitStore();
  const [activeSection, setActiveSection] = useState<'profile' | 'badges' | 'settings' | 'help'>('profile');
  const user = auth.currentUser;

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', onPress: () => {}, style: 'cancel' },
        {
          text: 'Logout',
          onPress: () => {
            signOut(auth).catch((error) => {
              Alert.alert('Error', error.message);
            });
          },
          style: 'destructive',
        },
      ]
    );
  };

  const badges = [
    { title: 'Pioneer', unlocked: stats.level >= 1 },
    { title: 'Knight', unlocked: stats.level >= 5 },
    { title: 'Engineer', unlocked: stats.level >= 15 },
    { title: 'Citizen', unlocked: stats.level >= 30 },
  ];

  return (
    <CivfitScreen>
      {/* Hero Section */}
      <View style={styles.hero}>
        <Text style={styles.heroKicker}>MENU & SETTINGS</Text>
        <Text style={styles.heroTitle}>Profile</Text>
        <Text style={styles.heroSubtitle}>View your profile and game progress</Text>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabNav}>
        {[
          { id: 'profile', label: '👤 Profile' },
          { id: 'badges', label: '🏆 Badges' },
          { id: 'settings', label: '⚙️ Settings' },
          { id: 'help', label: '❓ Help' },
        ].map((tab) => (
          <Pressable
            key={tab.id}
            style={[styles.tabButton, activeSection === tab.id && styles.tabButtonActive]}
            onPress={() => setActiveSection(tab.id as any)}>
            <Text style={[styles.tabButtonText, activeSection === tab.id && styles.tabButtonTextActive]}>
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Profile Section */}
      {activeSection === 'profile' && (
        <View style={styles.section}>
          <View style={styles.profileCard}>
            <View style={styles.profileHeader}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{user?.displayName?.[0] || 'C'}</Text>
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{user?.displayName || 'Citizen #9923'}</Text>
                <Text style={styles.profileLevel}>Level {stats.level} Survivor</Text>
              </View>
            </View>

            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Active Days</Text>
                <Text style={styles.statValue}>{stats.dayCount}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Total HP</Text>
                <Text style={styles.statValue}>{stats.hp}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Momentum</Text>
                <Text style={styles.statValue}>{stats.momentum}%</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Gold</Text>
                <Text style={styles.statValue}>{stats.gold}</Text>
              </View>
            </View>

            <Pressable style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutButtonText}>🚪 Logout</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* Badges Section */}
      {activeSection === 'badges' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Achievement Badges</Text>
          <View style={styles.badgeGrid}>
            {badges.map((badge) => (
              <View key={badge.title} style={[styles.badgeCard, !badge.unlocked && styles.badgeCardLocked]}>
                <Text style={styles.badgeIcon}>{badge.unlocked ? '⭐' : '🔒'}</Text>
                <Text style={styles.badgeTitle}>{badge.title}</Text>
              </View>
            ))}
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              Unlock badges by reaching level milestones. These represent your progress and achievements in the game!
            </Text>
          </View>
        </View>
      )}

      {/* Settings Section */}
      {activeSection === 'settings' && (
        <View style={styles.section}>
          <View style={styles.settingCard}>
            <Text style={styles.settingTitle}>Game Settings</Text>
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Sound Effects</Text>
              <Text style={styles.settingValue}>Enabled</Text>
            </View>
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Haptic Feedback</Text>
              <Text style={styles.settingValue}>Enabled</Text>
            </View>
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Notifications</Text>
              <Text style={styles.settingValue}>On</Text>
            </View>
          </View>

          <View style={styles.settingCard}>
            <Text style={styles.settingTitle}>Account</Text>
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Firebase User ID</Text>
              <Text style={styles.settingValue}>{user?.uid?.slice(0, 8)}...</Text>
            </View>
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Email</Text>
              <Text style={styles.settingValue}>{user?.email}</Text>
            </View>
          </View>
        </View>
      )}

      {/* Help Section */}
      {activeSection === 'help' && (
        <View style={styles.section}>
          <View style={styles.helpCard}>
            <Text style={styles.helpTitle}>❓ How to Play</Text>
            <Text style={styles.helpText}>
              1. Track your daily habits in the Realita tab{'\n'}
              2. Build and manage your city in the Kota tab{'\n'}
              3. Purchase items and convert resources in the Toko tab{'\n'}
              4. Check your progress and badges here in the Menu{'\n'}
            </Text>
          </View>

          <View style={styles.helpCard}>
            <Text style={styles.helpTitle}>💡 Tips</Text>
            <Text style={styles.helpText}>
              • Complete daily habits to earn gold{'\n'}
              • Use gold to purchase recovery items{'\n'}
              • Build buildings to increase city stats{'\n'}
              • Reach higher levels to unlock new eras{'\n'}
            </Text>
          </View>

          <View style={styles.helpCard}>
            <Text style={styles.helpTitle}>⚠️ About</Text>
            <Text style={styles.helpText}>
              CivFit v1.0.0{'\n'}
              A habit tracking game with city-building mechanics
            </Text>
          </View>
        </View>
      )}
    </CivfitScreen>
  );
}

const styles = StyleSheet.create({
  hero: {
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  heroKicker: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
    color: '#666',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1F2228',
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  tabNav: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#DDD',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: '#1F2228',
    borderColor: '#1F2228',
  },
  tabButtonText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#999',
    textTransform: 'uppercase',
  },
  tabButtonTextActive: {
    color: '#FFFFFF',
  },
  section: {
    gap: 12,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#1F2228',
    borderRadius: 16,
    padding: 16,
    gap: 14,
    shadowColor: '#1F2228',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 0,
    elevation: 3,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#FFD700',
    borderWidth: 2,
    borderColor: '#1F2228',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1F2228',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 14,
    fontWeight: '900',
    color: '#1F2228',
  },
  profileLevel: {
    fontSize: 11,
    color: '#999',
    fontWeight: '600',
    marginTop: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#F5F5F5',
    borderWidth: 2,
    borderColor: '#DDD',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
    gap: 4,
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: '#999',
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '900',
    color: '#1F2228',
  },
  logoutButton: {
    backgroundColor: '#FFE5E5',
    borderWidth: 2,
    borderColor: '#DC143C',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  logoutButtonText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#DC143C',
    textTransform: 'uppercase',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#1F2228',
    textTransform: 'uppercase',
  },
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badgeCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFF9E6',
    borderWidth: 2,
    borderColor: '#FFD700',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    gap: 6,
  },
  badgeCardLocked: {
    backgroundColor: '#F5F5F5',
    borderColor: '#DDD',
    opacity: 0.5,
  },
  badgeIcon: {
    fontSize: 24,
  },
  badgeTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#1F2228',
    textAlign: 'center',
  },
  infoBox: {
    backgroundColor: '#E5F5FF',
    borderWidth: 2,
    borderColor: '#00CED1',
    borderRadius: 10,
    padding: 12,
  },
  infoText: {
    fontSize: 11,
    color: '#666',
    lineHeight: 16,
  },
  settingCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#1F2228',
    borderRadius: 12,
    padding: 12,
    gap: 10,
  },
  settingTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#1F2228',
    borderBottomWidth: 1,
    borderBottomColor: '#DDD',
    paddingBottom: 8,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  settingLabel: {
    fontSize: 11,
    fontWeight: '900',
    color: '#1F2228',
  },
  settingValue: {
    fontSize: 10,
    color: '#999',
    fontWeight: '600',
  },
  helpCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#1F2228',
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  helpTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#1F2228',
  },
  helpText: {
    fontSize: 11,
    color: '#666',
    lineHeight: 16,
  },
});
