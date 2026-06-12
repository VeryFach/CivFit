import { useColorScheme } from '@/hooks/use-color-scheme';
import React, { useRef } from 'react';
import {
    Animated,
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// ─── Palette (mirrors CityTab) ────────────────────────────────────────────────
export function usePalette() {
    const scheme = useColorScheme();
    const isDark = scheme === 'dark';
    return {
        isDark,
        bg: isDark ? '#0F172A' : '#F8FAFC',
        card: isDark ? '#1E293B' : '#FFFFFF',
        cardAlt: isDark ? '#0F172A' : '#F1F5F9',
        border: isDark ? '#334155' : '#E2E8F0',
        borderActive: isDark ? '#14B8A6' : '#0D9488',
        text: isDark ? '#F8FAFC' : '#1E293B',
        textMuted: isDark ? '#94A3B8' : '#64748B',
        textFaint: isDark ? 'rgba(248,250,252,0.4)' : 'rgba(30,41,59,0.5)',
        accentTeal: '#14B8A6',
        accentGold: '#FBBF24',
        accentRed: '#EF4444',
        overlay: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.08)',
        iconBg: isDark ? '#1E293B' : '#FFFFFF',
    };
}

// ─── Dot progress indicator ───────────────────────────────────────────────────
interface DotsProps {
    total: number;
    current: number; // 0-indexed
}
export function Dots({ total, current }: DotsProps) {
    const palette = usePalette();
    return (
        <View style={dotStyles.row}>
            {Array.from({ length: total }).map((_, i) => (
                <View
                    key={i}
                    style={[
                        dotStyles.dot,
                        {
                            backgroundColor:
                                i === current
                                    ? palette.accentTeal
                                    : palette.border,
                            width: i === current ? 24 : 8,
                        },
                    ]}
                />
            ))}
        </View>
    );
}

const dotStyles = StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    dot: { height: 8, borderRadius: 4 },
});

// ─── Primary CTA button ───────────────────────────────────────────────────────
interface CTAProps {
    label: string;
    onPress: () => void;
    disabled?: boolean;
}
export function CTAButton({ label, onPress, disabled }: CTAProps) {
    const palette = usePalette();
    const scale = useRef(new Animated.Value(1)).current;

    const onPressIn = () =>
        Animated.spring(scale, { toValue: 0.96, useNativeDriver: true, speed: 30 }).start();
    const onPressOut = () =>
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30 }).start();

    return (
        <Animated.View style={{ transform: [{ scale }] }}>
            <TouchableOpacity
                onPress={onPress}
                onPressIn={onPressIn}
                onPressOut={onPressOut}
                disabled={disabled}
                activeOpacity={0.85}
                style={[
                    ctaStyles.btn,
                    {
                        backgroundColor: disabled ? palette.border : palette.accentTeal,
                        shadowColor: palette.accentTeal,
                    },
                ]}
            >
                <Text style={[ctaStyles.label, { color: disabled ? palette.textMuted : '#FFFFFF' }]}>
                    {label}
                </Text>
            </TouchableOpacity>
        </Animated.View>
    );
}

const ctaStyles = StyleSheet.create({
    btn: {
        paddingVertical: 18,
        paddingHorizontal: 40,
        borderRadius: 32,
        alignItems: 'center',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.35,
        shadowRadius: 16,
        elevation: 10,
    },
    label: {
        fontSize: 16,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 1.5,
    },
});

// ─── Slide shell ──────────────────────────────────────────────────────────────
interface SlideShellProps {
    /** 0-indexed current slide */
    current: number;
    total?: number;
    children: React.ReactNode;
    /** Accent colour for top-left glow bubble; defaults to teal */
    accentColor?: string;
    /** Secondary accent for bottom-right glow bubble */
    accentColor2?: string;
}

export function SlideShell({
    current,
    total = 6,
    children,
    accentColor,
    accentColor2,
}: SlideShellProps) {
    const palette = usePalette();
    const a1 = accentColor ?? palette.accentTeal;
    const a2 = accentColor2 ?? palette.accentGold;

    return (
        <SafeAreaView style={[shell.safe, { backgroundColor: palette.bg }]}>
            {/* Ambient glow bubbles */}
            <View
                style={[
                    shell.glow,
                    {
                        top: -80,
                        left: -80,
                        backgroundColor: a1,
                        opacity: palette.isDark ? 0.18 : 0.12,
                    },
                ]}
            />
            <View
                style={[
                    shell.glow,
                    {
                        bottom: -100,
                        right: -100,
                        width: 280,
                        height: 280,
                        backgroundColor: a2,
                        opacity: palette.isDark ? 0.14 : 0.1,
                    },
                ]}
            />

            {/* Content */}
            <View style={shell.inner}>{children}</View>

            {/* Bottom dots */}
            <View style={shell.footer}>
                <Dots total={total} current={current} />
            </View>
        </SafeAreaView>
    );
}

const shell = StyleSheet.create({
    safe: { flex: 1 },
    glow: {
        position: 'absolute',
        width: 240,
        height: 240,
        borderRadius: 120,
        zIndex: 0,
    },
    inner: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 40,
        paddingBottom: 16,
        zIndex: 1,
    },
    footer: {
        paddingBottom: 24,
        alignItems: 'center',
        zIndex: 1,
    },
});

// ─── Icon badge (large centred icon in a card) ────────────────────────────────
interface IconBadgeProps {
    children: React.ReactNode;
    size?: number;
    color?: string;
}
export function IconBadge({ children, size = 96, color }: IconBadgeProps) {
    const palette = usePalette();
    const bg = color ? color + '22' : palette.overlay;
    const border = color ?? palette.border;
    return (
        <View
            style={{
                width: size,
                height: size,
                borderRadius: size * 0.35,
                backgroundColor: bg,
                borderWidth: 2,
                borderColor: border,
                justifyContent: 'center',
                alignItems: 'center',
            }}
        >
            {children}
        </View>
    );
}

// ─── Step card row ─────────────────────────────────────────────────────────────
interface StepRowProps {
    number: string;
    title: string;
    description: string;
    accentColor?: string;
}
export function StepRow({ number, title, description, accentColor }: StepRowProps) {
    const palette = usePalette();
    const accent = accentColor ?? palette.accentTeal;
    return (
        <View
            style={[
                stepRow.card,
                { backgroundColor: palette.card, borderColor: palette.border },
            ]}
        >
            <View
                style={[
                    stepRow.badge,
                    { backgroundColor: accent + '22', borderColor: accent },
                ]}
            >
                <Text style={[stepRow.badgeText, { color: accent }]}>{number}</Text>
            </View>
            <View style={{ flex: 1 }}>
                <Text style={[stepRow.title, { color: palette.text }]}>{title}</Text>
                <Text style={[stepRow.desc, { color: palette.textMuted }]}>{description}</Text>
            </View>
        </View>
    );
}

const stepRow = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 16,
        padding: 16,
        borderRadius: 24,
        borderWidth: 1,
        marginBottom: 12,
    },
    badge: {
        width: 40,
        height: 40,
        borderRadius: 14,
        borderWidth: 1.5,
        justifyContent: 'center',
        alignItems: 'center',
        flexShrink: 0,
    },
    badgeText: { fontSize: 16, fontWeight: '900' },
    title: { fontSize: 14, fontWeight: '900', marginBottom: 2 },
    desc: { fontSize: 12, fontWeight: '600', lineHeight: 18 },
});

export { SCREEN_H, SCREEN_W };