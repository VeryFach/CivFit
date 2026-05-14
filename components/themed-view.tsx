import { useColorScheme } from '@/hooks/use-color-scheme';
import React from 'react';
import { View, ViewProps } from 'react-native';

type ThemedViewProps = ViewProps & {
    lightColor?: string;
    darkColor?: string;
};

const Colors = {
    light: {
        background: '#FFFFFF',
        border: '#E5E5E5',
    },
    dark: {
        background: '#1F1F1F',
        border: '#333333',
    },
};

export function ThemedView({
    style,
    lightColor,
    darkColor,
    ...rest
}: ThemedViewProps) {
    const colorScheme = useColorScheme();
    const backgroundColor =
        colorScheme === 'dark'
            ? darkColor || Colors.dark.background
            : lightColor || Colors.light.background;

    return <View style={[{ backgroundColor }, style]} {...rest} />;
}
