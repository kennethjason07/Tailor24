import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { Colors, Typography, Spacing, Radii, Shadows } from '../../theme';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';

const { width } = Dimensions.get('window');
const isSmallScreen = width < 768;

export default function CustomerLoginScreen({ onSwitchToAdmin }) {
  const { signIn, signUp } = useAuth();

  // Mode: 'login' | 'signup'
  const [mode, setMode] = useState('login');

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Status
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setErrorMessage('');
    setSuccessMessage('');

    if (!email.trim()) {
      setErrorMessage('Please enter your email address');
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your password');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'signup') {
        if (!fullName.trim()) {
          setErrorMessage('Please enter your full name');
          setLoading(false);
          return;
        }

        const cleanMobile = mobileNumber.replace(/\D/g, '');
        if (cleanMobile.length < 10) {
          setErrorMessage('Please enter a valid 10-digit mobile number');
          setLoading(false);
          return;
        }

        await signUp(email.trim().toLowerCase(), password, {
          full_name: fullName.trim(),
          mobile_number: cleanMobile,
          role: 'customer',
        });

        setSuccessMessage('Account created successfully! Signing you in...');
      } else {
        await signIn(email.trim().toLowerCase(), password);
      }
    } catch (err) {
      console.error('Customer Auth Error:', err);
      let msg = err.message || 'Authentication failed. Please verify your credentials.';
      if (msg.includes('Invalid login credentials')) {
        msg = 'Incorrect email or password. Please try again.';
      } else if (msg.includes('User already registered')) {
        msg = 'An account with this email already exists. Please sign in instead.';
      }
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Card style={styles.authCard} padded={false}>
          {/* Brand Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Image
                source={require('../../assets/logo.jpg')}
                style={styles.logo}
                resizeMode="cover"
              />
            </View>
            <Text style={styles.brandTitle}>Tailor24</Text>
            <Text style={styles.brandTagline}>Smart Automation & Delivery</Text>
            <View style={styles.roleBadge}>
              <Ionicons name="person" size={12} color={Colors.primary} />
              <Text style={styles.roleBadgeText}>Customer Portal</Text>
            </View>
          </View>

          {/* Mode Switcher Tabs */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tabButton, mode === 'login' && styles.activeTabButton]}
              onPress={() => {
                setMode('login');
                setErrorMessage('');
                setSuccessMessage('');
              }}
            >
              <Text style={[styles.tabText, mode === 'login' && styles.activeTabText]}>
                Sign In
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabButton, mode === 'signup' && styles.activeTabButton]}
              onPress={() => {
                setMode('signup');
                setErrorMessage('');
                setSuccessMessage('');
              }}
            >
              <Text style={[styles.tabText, mode === 'signup' && styles.activeTabText]}>
                Create Account
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form Content */}
          <View style={styles.formContainer}>
            {mode === 'signup' && (
              <>
                <Input
                  label="Full Name"
                  placeholder="e.g. Rahul Sharma"
                  value={fullName}
                  onChangeText={setFullName}
                  autoCapitalize="words"
                  leftIcon={<Ionicons name="person-outline" size={18} color={Colors.textMuted} />}
                />

                <Input
                  label="Mobile Number (Registered with Shop)"
                  placeholder="10-digit mobile number"
                  value={mobileNumber}
                  onChangeText={setMobileNumber}
                  keyboardType="phone-pad"
                  hint="Used to instantly link your previous orders & measurements"
                  leftIcon={<Ionicons name="call-outline" size={18} color={Colors.textMuted} />}
                />
              </>
            )}

            <Input
              label="Email Address"
              placeholder="customer@example.com"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setErrorMessage('');
              }}
              autoCapitalize="none"
              keyboardType="email-address"
              leftIcon={<Ionicons name="mail-outline" size={18} color={Colors.textMuted} />}
            />

            <Input
              label="Password"
              placeholder="••••••••"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setErrorMessage('');
              }}
              secureTextEntry
              autoCapitalize="none"
              leftIcon={<Ionicons name="lock-closed-outline" size={18} color={Colors.textMuted} />}
            />

            {/* Error Message Alert */}
            {errorMessage ? (
              <View style={styles.errorAlert}>
                <Ionicons name="alert-circle" size={18} color={Colors.error} style={{ marginRight: 6 }} />
                <Text style={styles.errorAlertText}>{errorMessage}</Text>
              </View>
            ) : null}

            {/* Success Message Alert */}
            {successMessage ? (
              <View style={styles.successAlert}>
                <Ionicons name="checkmark-circle" size={18} color={Colors.success} style={{ marginRight: 6 }} />
                <Text style={styles.successAlertText}>{successMessage}</Text>
              </View>
            ) : null}

            {/* Submit Button */}
            <Button
              title={mode === 'login' ? 'Sign In to Customer Portal' : 'Register & Track Orders'}
              onPress={handleSubmit}
              loading={loading}
              size="lg"
              style={{ marginTop: Spacing.sm }}
            />

            {/* Staff / Admin Switcher Link */}
            {onSwitchToAdmin && (
              <TouchableOpacity
                style={styles.switchAdminContainer}
                onPress={onSwitchToAdmin}
              >
                <MaterialCommunityIcons name="shield-account-outline" size={16} color={Colors.primaryLight} />
                <Text style={styles.switchAdminText}>
                  Staff or Tailor? <Text style={styles.switchAdminLink}>Login to TMS Admin</Text>
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: isSmallScreen ? Spacing.base : Spacing.xl,
  },
  authCard: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    ...Shadows.popover,
  },
  header: {
    alignItems: 'center',
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.base,
    paddingHorizontal: Spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceSubtle,
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.surfaceSubtle,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
    ...Shadows.subtle,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  brandTitle: {
    fontSize: Typography.fontSizes.xl,
    fontWeight: Typography.fontWeights.heavy,
    color: Colors.textPrimary,
    letterSpacing: Typography.letterSpacing.tight,
  },
  brandTagline: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.textSecondary,
    marginTop: 2,
    letterSpacing: 0.5,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 4,
    borderRadius: Radii.full,
    marginTop: Spacing.sm,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  roleBadgeText: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.primary,
    marginLeft: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceSubtle,
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.base,
    borderRadius: Radii.md,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radii.sm,
  },
  activeTabButton: {
    backgroundColor: Colors.surface,
    ...Shadows.subtle,
  },
  tabText: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.textMuted,
  },
  activeTabText: {
    color: Colors.primary,
  },
  formContainer: {
    padding: Spacing.xl,
  },
  errorAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.errorBg,
    borderRadius: Radii.md,
    padding: Spacing.md,
    marginBottom: Spacing.base,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorAlertText: {
    flex: 1,
    fontSize: Typography.fontSizes.sm,
    color: Colors.error,
    fontWeight: Typography.fontWeights.medium,
  },
  successAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.successBg,
    borderRadius: Radii.md,
    padding: Spacing.md,
    marginBottom: Spacing.base,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  successAlertText: {
    flex: 1,
    fontSize: Typography.fontSizes.sm,
    color: Colors.success,
    fontWeight: Typography.fontWeights.medium,
  },
  switchAdminContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.lg,
    paddingVertical: Spacing.xs,
  },
  switchAdminText: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.textSecondary,
    marginLeft: 6,
  },
  switchAdminLink: {
    fontWeight: Typography.fontWeights.bold,
    color: Colors.primaryLight,
  },
});
