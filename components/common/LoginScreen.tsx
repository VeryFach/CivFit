import { useColorScheme } from '@/hooks/use-color-scheme';
import { useGoogleAuth } from '@/hooks/useAuth';
import { COLORS, THEME } from '@/theme';
import { LogIn, Sparkles } from 'lucide-react-native';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';

export function LoginScreen() {
  const { useGoogleAuth: handleGoogleAuth } = useGoogleAuth();
  const [isLoading, setIsLoading] = useState(false);
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const palette = isDarkMode
    ? {
        background: '#0F172A',
        text: '#F8FAFC',
        mutedText: '#94A3B8',
        card: '#1E293B',
        button: '#F8FAFC',
        buttonText: '#0F172A',
        accent: '#2DD4BF',
      }
    : {
        background: COLORS.bg,
        text: COLORS.dark,
        mutedText: 'rgba(45, 52, 54, 0.4)',
        card: COLORS.teal,
        button: COLORS.dark,
        buttonText: '#FFF',
        accent: COLORS.teal,
      };
  
  const onLoginPress = async () => {
    setIsLoading(true);
    try {
      await handleGoogleAuth();
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      <Animated.View
        entering={ZoomIn.duration(600)}
        style={styles.inner}
      >
        <View style={styles.logoContainer}>
          <View style={[styles.logoIcon, { backgroundColor: palette.card }]}>
            <Text style={styles.logoEmoji}>🏰</Text>
          </View>
          <Animated.View
            entering={FadeIn.delay(400)}
            style={[styles.sparkleBox, { backgroundColor: isDarkMode ? '#FBBF24' : COLORS.yellow }]}
          >
            <Sparkles size={24} color={isDarkMode ? '#0F172A' : COLORS.dark} />
          </Animated.View>
        </View>

        <Text style={[styles.title, { color: palette.text }]}>
          CIV<Text style={{ color: palette.accent }}>FIT</Text>
        </Text>
        <Text style={[styles.subtitle, { color: palette.mutedText }]}>
          Sync your productivity with the simulation
        </Text>

        <View style={styles.actions}>
          <Pressable
            onPress={onLoginPress}
            disabled={isLoading}
            style={[
              styles.loginBtn,
              { backgroundColor: palette.button, borderColor: isDarkMode ? '#334155' : COLORS.dark },
              isLoading && styles.loginBtnDisabled,
            ]}
          >
            <LogIn size={24} color={palette.buttonText} />
            <Text style={[styles.loginBtnText, { color: palette.buttonText }]}>
              {isLoading ? 'Signing in...' : 'Sign in with Google'}
            </Text>
          </Pressable>

          <Text style={[styles.disclaimer, { color: palette.mutedText }]}>
            Your data is stored securely in the cloud via Firebase.
          </Text>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  inner: {
    maxWidth: 400,
    width: '100%',
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 32,
    position: 'relative',
  },
  logoIcon: {
    width: 96,
    height: 96,
    backgroundColor: COLORS.teal,
    borderRadius: 32,
    ...THEME.neoBorder,
    ...THEME.neoShadow,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotate: '-6deg' }],
  },
  logoEmoji: {
    fontSize: 48,
  },
  sparkleBox: {
    position: 'absolute',
    top: -16,
    right: -16,
    backgroundColor: COLORS.yellow,
    padding: 8,
    borderRadius: 12,
    ...THEME.neoBorder,
    ...THEME.neoShadowSm,
  },
  title: {
    fontSize: 60,
    fontWeight: '900',
    fontStyle: 'italic',
    textTransform: 'uppercase',
    letterSpacing: -2,
    marginBottom: 16,
  },
  subtitle: {
    fontWeight: '900',
    textTransform: 'uppercase',
    fontSize: 12,
    letterSpacing: 2,
    marginBottom: 48,
    textAlign: 'center',
  },
  actions: {
    width: '100%',
    gap: 16,
  },
  loginBtn: {
    paddingVertical: 24,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    ...THEME.neoBorder,
    ...THEME.neoShadowLg,
  },
  loginBtnDisabled: {
    opacity: 0.6,
  },
  loginBtnText: {
    fontSize: 20,
    fontWeight: '900',
    fontStyle: 'italic',
    textTransform: 'uppercase',
    letterSpacing: -0.5,
  },
  disclaimer: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    textAlign: 'center',
    paddingHorizontal: 32,
    lineHeight: 16,
  }
});
