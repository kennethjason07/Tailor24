import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radii } from '../../theme';

export default function Input({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  autoCorrect = false,
  error,
  leftIcon,
  hint,
  disabled = false,
  style,
  inputStyle,
  ...props
}) {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(!secureTextEntry);

  return (
    <View style={[styles.wrapper, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputFocused,
          error && styles.inputError,
          disabled && styles.inputDisabled,
        ]}
      >
        {leftIcon && <View style={styles.leftIconWrapper}>{leftIcon}</View>}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.textMuted}
          secureTextEntry={secureTextEntry && !showPassword}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          editable={!disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={[styles.textInput, inputStyle]}
          {...props}
        />
        {secureTextEntry && (
          <TouchableOpacity
            style={styles.rightIconWrapper}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={Colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : hint ? (
        <Text style={styles.hintText}>{hint}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: Spacing.base,
    width: '100%',
  },
  label: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.medium,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs + 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radii.md,
    height: 48,
    paddingHorizontal: Spacing.md,
  },
  inputFocused: {
    borderColor: Colors.primaryLight,
    backgroundColor: '#FAFCFF',
  },
  inputError: {
    borderColor: Colors.error,
  },
  inputDisabled: {
    backgroundColor: Colors.surfaceSubtle,
    opacity: 0.7,
  },
  leftIconWrapper: {
    marginRight: Spacing.sm,
  },
  rightIconWrapper: {
    padding: Spacing.xs,
  },
  textInput: {
    flex: 1,
    height: '100%',
    color: Colors.textPrimary,
    fontSize: Typography.fontSizes.base,
    paddingVertical: 0,
  },
  errorText: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.error,
    marginTop: Spacing.xs,
    fontWeight: Typography.fontWeights.medium,
  },
  hintText: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.textMuted,
    marginTop: Spacing.xs,
  },
});
