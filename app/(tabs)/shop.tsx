import { StyleSheet, Text, View, Pressable, Alert } from 'react-native';
import { CivfitScreen } from '../../src/components/civfit/screen';
import { useCivfitStore } from '../../src/state/civfit-store';
import { useState, useMemo } from 'react';

export default function ShopScreen() {
  const { stats } = useCivfitStore();
  const [tab, setTab] = useState<'items' | 'exchange'>('items');

  // Recovery Items Mock Data
  const recoveryItems = [
    { id: 'potion', name: '🧪 Health Potion', description: '+25 HP', cost: 50, type: 'hp' },
    { id: 'ampoule', name: '💊 Super Ampoule', description: '+50 HP', cost: 100, type: 'hp' },
    { id: 'skip', name: '⏭️ Skip Ticket', description: 'Skip daily tasks', cost: 200, type: 'ticket' },
  ];

  const handlePurchase = (item: typeof recoveryItems[0]) => {
    if (stats.gold < item.cost) {
      Alert.alert('Insufficient Gold', `You need ${item.cost} gold to purchase this item.`);
      return;
    }
    Alert.alert('Success', `Purchased ${item.name}`);
  };

  return (
    <CivfitScreen>
      {/* Hero Section */}
      <View style={styles.hero}>
        <Text style={styles.heroKicker}>SHOP & MARKET</Text>
        <Text style={styles.heroTitle}>Survival Supplies</Text>
        <Text style={styles.heroSubtitle}>Purchase recovery items and convert resources</Text>
      </View>

      {/* Resource Display */}
      <View style={styles.resourceDisplay}>
        <View style={styles.resourceCard}>
          <Text style={styles.resourceLabel}>💰 Gold</Text>
          <Text style={styles.resourceValue}>{stats.gold}</Text>
        </View>
        <View style={styles.resourceCard}>
          <Text style={styles.resourceLabel}>🪙 Silver</Text>
          <Text style={styles.resourceValue}>{stats.silver}</Text>
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabNav}>
        <Pressable
          style={[styles.tab, tab === 'items' && styles.tabActive]}
          onPress={() => setTab('items')}>
          <Text style={[styles.tabText, tab === 'items' && styles.tabTextActive]}>Items</Text>
        </Pressable>
        <Pressable
          style={[styles.tab, tab === 'exchange' && styles.tabActive]}
          onPress={() => setTab('exchange')}>
          <Text style={[styles.tabText, tab === 'exchange' && styles.tabTextActive]}>Exchange</Text>
        </Pressable>
      </View>

      {/* Items Tab */}
      {tab === 'items' && (
        <View style={styles.itemsContainer}>
          <Text style={styles.sectionTitle}>Available Items</Text>
          <View style={styles.itemsList}>
            {recoveryItems.map((item) => {
              const canAfford = stats.gold >= item.cost;
              return (
                <Pressable
                  key={item.id}
                  style={[styles.itemCard, !canAfford && styles.itemCardDisabled]}
                  onPress={() => handlePurchase(item)}>
                  <View style={styles.itemLeft}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemDesc}>{item.description}</Text>
                  </View>
                  <View style={styles.itemRight}>
                    <View style={styles.costBadge}>
                      <Text style={styles.costText}>{item.cost}G</Text>
                    </View>
                    <Text style={styles.statusText}>{canAfford ? '✓' : '✗'}</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>
      )}

      {/* Exchange Tab */}
      {tab === 'exchange' && (
        <View style={styles.exchangeContainer}>
          <Text style={styles.sectionTitle}>Resource Conversion</Text>
          
          <View style={styles.exchangeCard}>
            <Text style={styles.exchangeTitle}>💱 Silver ↔️ Gold</Text>
            <Text style={styles.exchangeRate}>1 Gold = 12 Silver (with 5% fee)</Text>
            
            <View style={styles.exchangeInfo}>
              <Text style={styles.exchangeInfoText}>
                Convert between gold (habit currency) and silver (city currency). Use wisely!
              </Text>
            </View>

            <View style={styles.exchangeButtons}>
              <Pressable style={[styles.exchangeButton, styles.silverToGold]}>
                <Text style={styles.exchangeButtonText}>Silver → Gold</Text>
              </Pressable>
              <Pressable style={[styles.exchangeButton, styles.goldToSilver]}>
                <Text style={styles.exchangeButtonText}>Gold → Silver</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.gacha}>
            <Text style={styles.gachaTitle}>🎰 Gacha Rewards</Text>
            <Text style={styles.gachaDesc}>Spin for random rewards. Unlocked at later levels!</Text>
            <Pressable style={[styles.button, styles.gachaButton]}>
              <Text style={styles.gachaButtonText}>Coming Soon</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* Tips */}
      <View style={styles.tipsCard}>
        <Text style={styles.tipsTitle}>💡 Shop Tips</Text>
        <Text style={styles.tipsText}>
          • Recovery items help you survive tough days{'\n'}
          • Exchange resources to rebalance your economy{'\n'}
          • Watch out for high prices when many players are trading
        </Text>
      </View>
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
  resourceDisplay: {
    flexDirection: 'row',
    gap: 8,
  },
  resourceCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#1F2228',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    gap: 4,
  },
  resourceLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: '#999',
    textTransform: 'uppercase',
  },
  resourceValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1F2228',
  },
  tabNav: {
    flexDirection: 'row',
    gap: 6,
    backgroundColor: '#F5F5F5',
    padding: 6,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#DDD',
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#1F2228',
  },
  tabText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#999',
    textTransform: 'uppercase',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  itemsContainer: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#1F2228',
    textTransform: 'uppercase',
  },
  itemsList: {
    gap: 8,
  },
  itemCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#1F2228',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#1F2228',
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 0,
    elevation: 2,
  },
  itemCardDisabled: {
    opacity: 0.5,
  },
  itemLeft: {
    flex: 1,
    gap: 4,
  },
  itemName: {
    fontSize: 13,
    fontWeight: '900',
    color: '#1F2228',
  },
  itemDesc: {
    fontSize: 11,
    color: '#999',
    fontWeight: '600',
  },
  itemRight: {
    alignItems: 'flex-end',
    gap: 6,
  },
  costBadge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#1F2228',
  },
  costText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#1F2228',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '900',
  },
  exchangeContainer: {
    gap: 12,
  },
  exchangeCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#1F2228',
    borderRadius: 12,
    padding: 14,
    gap: 10,
  },
  exchangeTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#1F2228',
  },
  exchangeRate: {
    fontSize: 11,
    color: '#999',
    fontWeight: '600',
  },
  exchangeInfo: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#00CED1',
  },
  exchangeInfoText: {
    fontSize: 11,
    color: '#666',
    lineHeight: 16,
  },
  exchangeButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  exchangeButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
  },
  silverToGold: {
    backgroundColor: '#FFE5E5',
    borderColor: '#DC143C',
  },
  goldToSilver: {
    backgroundColor: '#E5F5FF',
    borderColor: '#00CED1',
  },
  exchangeButtonText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#1F2228',
    textTransform: 'uppercase',
  },
  gacha: {
    backgroundColor: '#FFF9E6',
    borderWidth: 2,
    borderColor: '#FFD700',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    gap: 8,
  },
  gachaTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#1F2228',
  },
  gachaDesc: {
    fontSize: 11,
    color: '#999',
    textAlign: 'center',
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#1F2228',
    alignItems: 'center',
  },
  gachaButton: {
    width: '100%',
    backgroundColor: '#FFD700',
  },
  gachaButtonText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#1F2228',
    textTransform: 'uppercase',
  },
  tipsCard: {
    backgroundColor: '#F5F5F5',
    borderWidth: 2,
    borderColor: '#DDD',
    borderRadius: 12,
    padding: 12,
    gap: 6,
  },
  tipsTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#1F2228',
  },
  tipsText: {
    fontSize: 11,
    color: '#666',
    lineHeight: 16,
  },
});