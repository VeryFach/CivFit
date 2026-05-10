import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { appChecklist, menuNotes } from '@/data/civfit';
import { CivfitScreen } from '../../src/components/civfit/screen';
import { SectionCard } from '../../src/components/civfit/section-card';
import { BADGE_GALLERY, useCivfitStore } from '../../src/state/civfit-store';

export default function MenuScreen() {
    const { stats, logs } = useCivfitStore();
    const [activeSection, setActiveSection] = useState<'profile' | 'logs' | 'rank' | 'settings'>('profile');

    return (
        <CivfitScreen>
            <View style={styles.hero}>
                <Text style={styles.kicker}>MENU / STRUCTURE</Text>
                <Text style={styles.title}>Profil, Logs, Rank, Opsi</Text>
                <Text style={styles.subtitle}>
                    Bagian ini meniru web: switcher, profil, riwayat aktivitas, rank, dan settings.
                </Text>
            </View>

            <View style={styles.switcher}>
                {[
                    { id: 'profile', label: 'Profil' },
                    { id: 'logs', label: 'Log' },
                    { id: 'rank', label: 'Rank' },
                    { id: 'settings', label: 'Opsi' },
                ].map((item) => (
                    <Pressable key={item.id} style={[styles.switcherButton, activeSection === item.id && styles.switcherButtonActive]} onPress={() => setActiveSection(item.id as typeof activeSection)}>
                        <Text style={[styles.switcherText, activeSection === item.id && styles.switcherTextActive]}>{item.label}</Text>
                    </Pressable>
                ))}
            </View>

            {activeSection === 'profile' && (
                <View style={styles.profileCard}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>C</Text>
                    </View>
                    <Text style={styles.profileName}>Citizen #{stats.level}923</Text>
                    <Text style={styles.profileMeta}>Level {stats.level} Survivor</Text>
                    <View style={styles.profileGrid}>
                        <View style={styles.profileTile}>
                            <Text style={styles.profileTileValue}>{stats.dayCount}</Text>
                            <Text style={styles.profileTileLabel}>Hari Aktif</Text>
                        </View>
                        <View style={styles.profileTile}>
                            <Text style={styles.profileTileValue}>S{stats.level}</Text>
                            <Text style={styles.profileTileLabel}>Tier Kota</Text>
                        </View>
                    </View>
                    <View style={styles.badgeGallery}>
                        {BADGE_GALLERY.map((badge) => (
                            <View key={badge.title} style={[styles.badgeTile, badge.unlocked ? styles.badgeTileUnlocked : styles.badgeTileLocked]}>
                                <Text style={styles.badgeTitle}>{badge.title}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            )}

            {activeSection === 'logs' && (
                <View style={styles.logsCard}>
                    <Text style={styles.sectionTitle}>Riwayat Aktivitas</Text>
                    <View style={styles.logsList}>
                        {logs.slice(0, 8).map((log) => (
                            <View key={log.id} style={styles.logRow}>
                                <View style={[styles.logMarker, log.change >= 0 ? styles.logMarkerPositive : styles.logMarkerNegative]} />
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.logTitle}>{log.message}</Text>
                                    <Text style={styles.logMeta}>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>
            )}

            {activeSection === 'rank' && (
                <View style={styles.rankCard}>
                    <Text style={styles.sectionTitle}>Global Rankings</Text>
                    <View style={styles.rankList}>
                        {[
                            { name: 'You', level: stats.level, pop: 28, era: 'Stone Age' },
                            { name: 'Ava', level: 18, pop: 120, era: 'Industrial' },
                            { name: 'Noah', level: 12, pop: 90, era: 'Medieval' },
                        ].map((entry, index) => (
                            <View key={entry.name} style={styles.rankRow}>
                                <View style={styles.rankIndex}><Text style={styles.rankIndexText}>{index + 1}</Text></View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.rankName}>{entry.name}</Text>
                                    <Text style={styles.rankMeta}>Lv.{entry.level} · {entry.pop} Pop · {entry.era}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>
            )}

            {activeSection === 'settings' && (
                <View style={styles.settingsCard}>
                    <Text style={styles.sectionTitle}>Layanan Sektor</Text>
                    <View style={styles.settingsList}>
                        {['Zona Waktu', 'Notifikasi', 'Bantuan & FAQ'].map((item) => (
                            <View key={item} style={styles.settingRow}>
                                <Text style={styles.settingText}>{item}</Text>
                                <Text style={styles.settingArrow}>›</Text>
                            </View>
                        ))}
                    </View>
                </View>
            )}

            <View style={styles.stack}>
                {menuNotes.map((note, index) => (
                    <SectionCard
                        key={note}
                        title={`Prinsip ${index + 1}`}
                        description={note}
                        badge="Guideline"
                        icon={<Ionicons name="layers-outline" size={22} color="#A9C3FF" />}
                    />
                ))}
            </View>

            <View style={styles.checklistCard}>
                <Text style={styles.sectionTitle}>Checklist struktur</Text>
                <View style={styles.checklistList}>
                    {appChecklist.map((item) => (
                        <View key={item} style={styles.checkRow}>
                            <View style={styles.dot} />
                            <Text style={styles.checkText}>{item}</Text>
                        </View>
                    ))}
                </View>
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
    switcher: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderWidth: 2,
        borderColor: '#1F2228',
        borderRadius: 22,
        padding: 6,
        gap: 6,
    },
    switcherButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 18,
        backgroundColor: '#FFFFFF',
    },
    switcherButtonActive: {
        backgroundColor: '#1F2228',
    },
    switcherText: {
        color: '#4C5158',
        fontSize: 11,
        fontWeight: '900',
        textTransform: 'uppercase',
    },
    switcherTextActive: {
        color: '#FFFFFF',
    },
    profileCard: {
        borderRadius: 28,
        borderWidth: 2,
        borderColor: '#1F2228',
        backgroundColor: '#FFFFFF',
        padding: 20,
        alignItems: 'center',
        gap: 10,
    },
    avatar: {
        width: 96,
        height: 96,
        borderRadius: 999,
        backgroundColor: '#D7F3EA',
        borderWidth: 2,
        borderColor: '#1F2228',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        color: '#1F2228',
        fontSize: 32,
        fontWeight: '900',
    },
    profileName: {
        color: '#1F2228',
        fontSize: 22,
        fontWeight: '900',
    },
    profileMeta: {
        color: '#4C5158',
        fontSize: 12,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    profileGrid: {
        flexDirection: 'row',
        gap: 10,
        width: '100%',
    },
    profileTile: {
        flex: 1,
        borderWidth: 2,
        borderColor: '#1F2228',
        borderRadius: 20,
        backgroundColor: '#F6F0E7',
        padding: 14,
        alignItems: 'center',
        gap: 4,
    },
    profileTileValue: {
        color: '#1F2228',
        fontSize: 20,
        fontWeight: '900',
    },
    profileTileLabel: {
        color: '#4C5158',
        fontSize: 10,
        fontWeight: '800',
        textTransform: 'uppercase',
    },
    badgeGallery: {
        width: '100%',
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    badgeTile: {
        flexBasis: '48%',
        borderRadius: 18,
        borderWidth: 2,
        borderColor: '#1F2228',
        padding: 12,
    },
    badgeTileUnlocked: {
        backgroundColor: '#FFD94A',
    },
    badgeTileLocked: {
        backgroundColor: '#F6F0E7',
        opacity: 0.55,
    },
    badgeTitle: {
        color: '#1F2228',
        fontSize: 10,
        fontWeight: '900',
        textTransform: 'uppercase',
    },
    logsCard: {
        borderRadius: 28,
        borderWidth: 2,
        borderColor: '#1F2228',
        backgroundColor: '#FFFFFF',
        padding: 18,
        gap: 12,
    },
    logsList: {
        gap: 10,
    },
    logRow: {
        flexDirection: 'row',
        gap: 10,
        alignItems: 'flex-start',
    },
    logMarker: {
        width: 10,
        height: 10,
        borderRadius: 999,
        marginTop: 5,
    },
    logMarkerPositive: {
        backgroundColor: '#2FBFA5',
    },
    logMarkerNegative: {
        backgroundColor: '#E85146',
    },
    logTitle: {
        color: '#1F2228',
        fontSize: 13,
        fontWeight: '800',
    },
    logMeta: {
        color: '#4C5158',
        fontSize: 11,
        marginTop: 2,
    },
    rankCard: {
        borderRadius: 28,
        borderWidth: 2,
        borderColor: '#1F2228',
        backgroundColor: '#1F2228',
        padding: 18,
        gap: 12,
    },
    rankList: {
        gap: 10,
    },
    rankRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: '#FFFFFF',
        borderWidth: 2,
        borderColor: '#1F2228',
        borderRadius: 18,
        padding: 12,
    },
    rankIndex: {
        width: 36,
        height: 36,
        borderRadius: 14,
        backgroundColor: '#FFD94A',
        borderWidth: 2,
        borderColor: '#1F2228',
        alignItems: 'center',
        justifyContent: 'center',
    },
    rankIndexText: {
        color: '#1F2228',
        fontWeight: '900',
    },
    rankName: {
        color: '#1F2228',
        fontWeight: '900',
    },
    rankMeta: {
        color: '#4C5158',
        fontSize: 11,
        marginTop: 2,
    },
    settingsCard: {
        borderRadius: 28,
        borderWidth: 2,
        borderColor: '#1F2228',
        backgroundColor: '#FFFFFF',
        padding: 18,
        gap: 12,
    },
    settingsList: {
        gap: 10,
    },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 2,
        borderColor: '#1F2228',
        borderRadius: 16,
        paddingHorizontal: 14,
        paddingVertical: 12,
        backgroundColor: '#F6F0E7',
    },
    settingText: {
        color: '#1F2228',
        fontWeight: '800',
    },
    settingArrow: {
        color: '#1F2228',
        fontWeight: '900',
        fontSize: 18,
    },
    stack: {
        gap: 14,
    },
    checklistCard: {
        borderRadius: 24,
        padding: 18,
        backgroundColor: '#FFFFFF',
        borderWidth: 2,
        borderColor: '#1F2228',
        gap: 12,
    },
    sectionTitle: {
        color: '#1F2228',
        fontSize: 18,
        fontWeight: '800',
    },
    checklistList: {
        gap: 12,
    },
    checkRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
    },
    dot: {
        width: 9,
        height: 9,
        borderRadius: 999,
        marginTop: 7,
        backgroundColor: '#8AB7FF',
    },
    checkText: {
        flex: 1,
        color: '#4C5158',
        lineHeight: 20,
        fontSize: 14,
    },
});
