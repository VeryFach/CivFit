import { StyleSheet, Text, View } from 'react-native';

type MetricCardProps = {
    label: string;
    value: string;
    note: string;
    tone: 'blue' | 'amber' | 'mint' | 'rose';
};

const tones = {
    blue: {
        border: '#1F2228',
        background: '#FFFFFF',
        value: '#1D5FD4',
    },
    amber: {
        border: '#1F2228',
        background: '#FFD94A',
        value: '#1F2228',
    },
    mint: {
        border: '#1F2228',
        background: '#D7F3EA',
        value: '#1F2228',
    },
    rose: {
        border: '#1F2228',
        background: '#F7DCE2',
        value: '#1F2228',
    },
};

export function MetricCard({ label, value, note, tone }: MetricCardProps) {
    const palette = tones[tone];

    return (
        <View style={[styles.card, { borderColor: palette.border, backgroundColor: palette.background }]}>
            <Text style={styles.label}>{label}</Text>
            <Text style={[styles.value, { color: palette.value }]}>{value}</Text>
            <Text style={styles.note}>{note}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        minWidth: '47%',
        flexGrow: 1,
        flexBasis: '47%',
        borderWidth: 2,
        borderRadius: 22,
        padding: 16,
        gap: 8,
        shadowColor: '#1F2228',
        shadowOpacity: 0.24,
        shadowRadius: 0,
        shadowOffset: { width: 4, height: 4 },
        elevation: 4,
    },
    label: {
        color: '#1F2228',
        fontSize: 11,
        letterSpacing: 1.2,
        textTransform: 'uppercase',
        fontWeight: '700',
    },
    value: {
        fontSize: 21,
        lineHeight: 26,
        fontWeight: '900',
        fontStyle: 'italic',
    },
    note: {
        color: '#1F2228',
        fontSize: 12,
        lineHeight: 17,
        fontWeight: '600',
    },
});
