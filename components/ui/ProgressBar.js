import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors, Radii } from '../../theme';

export default function ProgressBar({
  progress = 0, // 0 to 100
  color = Colors.primaryLight,
  trackColor = Colors.border,
  height = 6,
  style,
}) {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <View style={[styles.track, { height, backgroundColor: trackColor }, style]}>
      <View
        style={[
          styles.fill,
          {
            width: `${clampedProgress}%`,
            backgroundColor: color,
            height,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    borderRadius: Radii.full,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: Radii.full,
  },
});
