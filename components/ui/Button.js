import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, View } from 'react-native';
import { Colors, Typography, Spacing, Radii, Shadows } from '../../theme';

export default function Button({
  title,
  onPress,
  variant = 'primary', // 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size = 'base', // 'sm' | 'base' | 'lg'
  icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  fullWidth = true,
  style,
  textStyle,
}) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return {
          container: styles.btnSecondary,
          text: styles.btnSecondaryText,
        };
      case 'outline':
        return {
          container: styles.btnOutline,
          text: styles.btnOutlineText,
        };
      case 'ghost':
        return {
          container: styles.btnGhost,
          text: styles.btnGhostText,
        };
      case 'danger':
        return {
          container: styles.btnDanger,
          text: styles.btnDangerText,
        };
      case 'primary':
      default:
        return {
          container: styles.btnPrimary,
          text: styles.btnPrimaryText,
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          container: { height: 38, paddingHorizontal: Spacing.md },
          text: { fontSize: Typography.fontSizes.sm },
        };
      case 'lg':
        return {
          container: { height: 54, paddingHorizontal: Spacing.xl },
          text: { fontSize: Typography.fontSizes.md },
        };
      case 'base':
      default:
        return {
          container: { height: 48, paddingHorizontal: Spacing.base },
          text: { fontSize: Typography.fontSizes.base },
        };
    }
  };

  const vStyles = getVariantStyles();
  const sStyles = getSizeStyles();

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.base,
        vStyles.container,
        sStyles.container,
        fullWidth && styles.fullWidth,
        (disabled || loading) && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'ghost' ? Colors.primary : Colors.textWhite}
        />
      ) : (
        <View style={styles.contentRow}>
          {icon && iconPosition === 'left' && <View style={styles.iconLeft}>{icon}</View>}
          <Text style={[styles.baseText, vStyles.text, sStyles.text, textStyle]}>{title}</Text>
          {icon && iconPosition === 'right' && <View style={styles.iconRight}>{icon}</View>}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: Radii.md,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  fullWidth: {
    width: '100%',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLeft: {
    marginRight: Spacing.sm,
  },
  iconRight: {
    marginLeft: Spacing.sm,
  },
  disabled: {
    opacity: 0.6,
  },
  baseText: {
    fontWeight: Typography.fontWeights.semibold,
    textAlign: 'center',
  },
  // Variant Containers
  btnPrimary: {
    backgroundColor: Colors.primary,
    ...Shadows.subtle,
  },
  btnSecondary: {
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  btnOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.primaryLight,
  },
  btnGhost: {
    backgroundColor: 'transparent',
  },
  btnDanger: {
    backgroundColor: Colors.error,
  },
  // Variant Texts
  btnPrimaryText: {
    color: Colors.textWhite,
  },
  btnSecondaryText: {
    color: Colors.textPrimary,
  },
  btnOutlineText: {
    color: Colors.primaryLight,
  },
  btnGhostText: {
    color: Colors.textSecondary,
  },
  btnDangerText: {
    color: Colors.textWhite,
  },
});
