import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Radii, Shadows, Spacing } from '../../theme';

export default function Card({
  children,
  onPress,
  style,
  padded = true,
  elevation = 'card', // 'subtle' | 'card' | 'popover' | 'none'
  variant = 'default', // 'default' | 'outlined' | 'subtle'
  ...props
}) {
  const getVariantStyle = () => {
    switch (variant) {
      case 'outlined':
        return {
          backgroundColor: Colors.surface,
          borderWidth: 1,
          borderColor: Colors.border,
        };
      case 'subtle':
        return {
          backgroundColor: Colors.surfaceSubtle,
        };
      case 'default':
      default:
        return {
          backgroundColor: Colors.surface,
          ...(elevation !== 'none' ? Shadows[elevation] || Shadows.card : {}),
        };
    }
  };

  const cardContent = (
    <View
      style={[
        styles.card,
        getVariantStyle(),
        padded && styles.padded,
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.85} onPress={onPress}>
        {cardContent}
      </TouchableOpacity>
    );
  }

  return cardContent;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radii.base,
    overflow: 'hidden',
  },
  padded: {
    padding: Spacing.base,
  },
});
