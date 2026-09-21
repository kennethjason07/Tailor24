import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, Radii } from '../../theme';

export default function StatusBadge({
  status = 'pending',
  label,
  size = 'md', // 'sm' | 'md' | 'lg'
  style,
  textStyle,
}) {
  const getStatusConfig = () => {
    const s = (status || '').toLowerCase().trim();

    if (s.includes('ready') || s.includes('pickup')) {
      return {
        bg: '#ECFDF5',
        border: '#A7F3D0',
        text: '#059669',
        defaultLabel: 'Ready for Pickup',
      };
    }
    if (s.includes('deliver') || s.includes('completed')) {
      return {
        bg: '#F0FDF4',
        border: '#BBF7D0',
        text: '#16A34A',
        defaultLabel: 'Delivered',
      };
    }
    if (s.includes('production') || s.includes('stitch') || s.includes('process')) {
      return {
        bg: '#EFF6FF',
        border: '#BFDBFE',
        text: '#2563EB',
        defaultLabel: 'In Production',
      };
    }
    if (s.includes('quality') || s.includes('check')) {
      return {
        bg: '#FEF3C7',
        border: '#FDE68A',
        text: '#D97706',
        defaultLabel: 'Quality Check',
      };
    }
    if (s.includes('urgent') || s.includes('risk') || s.includes('delay')) {
      return {
        bg: '#FEF2F2',
        border: '#FECACA',
        text: '#DC2626',
        defaultLabel: 'Urgent Attention',
      };
    }

    // Default: Pending / Ordered
    return {
      bg: '#F8FAFC',
      border: '#E2E8F0',
      text: '#475569',
      defaultLabel: 'Order Received',
    };
  };

  const config = getStatusConfig();
  const displayLabel = label || config.defaultLabel;

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          container: { paddingHorizontal: 6, paddingVertical: 2 },
          text: { fontSize: 11 },
          dot: { width: 5, height: 5, marginRight: 4 },
        };
      case 'lg':
        return {
          container: { paddingHorizontal: 12, paddingVertical: 6 },
          text: { fontSize: 14 },
          dot: { width: 8, height: 8, marginRight: 6 },
        };
      case 'md':
      default:
        return {
          container: { paddingHorizontal: 9, paddingVertical: 3.5 },
          text: { fontSize: 12 },
          dot: { width: 6, height: 6, marginRight: 5 },
        };
    }
  };

  const sStyle = getSizeStyles();

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: config.bg, borderColor: config.border },
        sStyle.container,
        style,
      ]}
    >
      <View style={[styles.dot, { backgroundColor: config.text }, sStyle.dot]} />
      <Text
        style={[
          styles.badgeText,
          { color: config.text },
          sStyle.text,
          textStyle,
        ]}
      >
        {displayLabel}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radii.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  dot: {
    borderRadius: Radii.full,
  },
  badgeText: {
    fontWeight: Typography.fontWeights.semibold,
    letterSpacing: 0.2,
  },
});
