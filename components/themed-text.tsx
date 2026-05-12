import React from 'react';
import { Text, TextProps, useColorScheme } from 'react-native';

type ThemedTextProps = TextProps & {
    type?: 'default' | 'title' | 'subtitle' | 'link';
};

const Colors = {
    light: {
        text: '#000000',
        title: '#1F2228',
        subtitle: '#666666',
        link: '#0066CC',
        background: '#FFFFFF',
    },
    dark: {
        text: '#FFFFFF',
        title: '#FFFFFF',
        subtitle: '#CCCCCC',
        link: '#66B3FF',
        background: '#1F1F1F',
    },
};

export function ThemedText({ style, type = 'default', ...rest }: ThemedTextProps) {
    const colorScheme = useColorScheme();
    const color = colorScheme === 'dark' ? Colors.dark : Colors.light;

    const textStyle = {
        color: color.text,
        ...(type === 'title' && {
            fontSize: 28,
            fontWeight: 'bold',
            color: color.title,
        }),
        ...(type === 'subtitle' && {
            fontSize: 16,
            color: color.subtitle,
        }),
        ...(type === 'link' && {
            fontSize: 14,
            color: color.link,
            textDecorationLine: 'underline',
        }),
    };

    return <Text style={[textStyle, style]} {...rest} />;
}
