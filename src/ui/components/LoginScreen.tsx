import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { LogIn, Sparkles } from 'lucide-react-native';
import { signInWithGoogle } from '../../platform/api/firebase';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import { COLORS, THEME } from '../theme';

export function LoginScreen() {
  return (
    <View style={styles.container}>
      <Animated.View 
        entering={ZoomIn.duration(600)}
        style={styles.inner}
      >
        <View style={styles.logoContainer}>
           <View style={styles.logoIcon}>
              <Text style={styles.logoEmoji}>🏰</Text>
           </View>
           <Animated.View 
             entering={FadeIn.delay(400)}
             style={styles.sparkleBox}
           >
              <Sparkles size={24} color={COLORS.dark} />
           </Animated.View>
        </View>

        <Text style={styles.title}>
          CIV<Text style={{ color: COLORS.teal }}>FIT</Text>
        </Text>
        <Text style={styles.subtitle}>
          Sync your productivity with the simulation
        </Text>

        <View style={styles.actions}>
          <Pressable
            onPress={signInWithGoogle}
            style={styles.loginBtn}
          >
            <LogIn size={24} color="#FFF" />
            <Text style={styles.loginBtnText}>Sign in with Google</Text>
          </Pressable>
          
          <Text style={styles.disclaimer}>
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
    backgroundColor: COLORS.bg,
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
    color: COLORS.dark,
    marginBottom: 16,
  },
  subtitle: {
    color: 'rgba(45, 52, 54, 0.4)',
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
    backgroundColor: COLORS.dark,
    paddingVertical: 24,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    ...THEME.neoBorder,
    ...THEME.neoShadowLg,
  },
  loginBtnText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '900',
    fontStyle: 'italic',
    textTransform: 'uppercase',
    letterSpacing: -0.5,
  },
  disclaimer: {
    fontSize: 10,
    color: '#9CA3AF',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    textAlign: 'center',
    paddingHorizontal: 32,
    lineHeight: 16,
  }
});
