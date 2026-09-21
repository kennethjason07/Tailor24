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
import { useAuth } from './context/AuthContext';
import { Colors, Typography, Spacing, Radii, Shadows } from './theme';
import Button from './components/ui/Button';
import Input from './components/ui/Input';
import Card from './components/ui/Card';
import CustomerLoginScreen from './screens/auth/CustomerLoginScreen';

const { width } = Dimensions.get('window');
const isSmallScreen = width < 768;

export default function LoginScreen() {
  const { signIn } = useAuth();

  // Tab: 'customer' | 'admin' (defaults to customer so mobile users get direct access)
  const [activeTab, setActiveTab] = useState('customer');

  // Admin form state
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // If customer tab is active, render CustomerLoginScreen
  if (activeTab === 'customer') {
    return <CustomerLoginScreen onSwitchToAdmin={() => setActiveTab('admin')} />;
  }

  // Otherwise, render Staff / Admin Login
  const handleAdminSubmit = async () => {
    setErrorMessage('');

    if (!adminEmail.trim()) {
      setErrorMessage('Please enter your staff or admin email');
      return;
    }

    if (!adminPassword) {
      setErrorMessage('Please enter your password');
      return;
    }

    let cleanEmail = adminEmail.trim();
    if (!cleanEmail.includes('@')) {
      cleanEmail = `${cleanEmail.toLowerCase()}@tailor24.com`;
    }

    setLoading(true);

    try {
      await signIn(cleanEmail, adminPassword);
    } catch (err) {
      console.error('Admin Auth Error:', err);
      let msg = err.message || 'Authentication failed. Please verify credentials.';
      if (msg.includes('Invalid login credentials')) {
        msg = 'Incorrect admin email or password.';
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
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Card style={styles.authCard} padded={false}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Image
                source={require('./assets/logo.jpg')}
                style={styles.logo}
                resizeMode="cover"
              />
            </View>
            <Text style={styles.brandTitle}>Tailor24</Text>
            <Text style={styles.brandTagline}>Tailor Management System (TMS)</Text>
            <View style={styles.roleBadge}>
              <MaterialCommunityIcons name="shield-account" size={13} color={Colors.accent} />
              <Text style={styles.roleBadgeText}>Staff / Admin Portal</Text>
            </View>
          </View>

          {/* Form Content */}
          <View style={styles.formContainer}>
            <Input
              label="Admin Email / Username"
              placeholder="admin@tailor24.com or admin"
              value={adminEmail}
              onChangeText={(text) => {
                setAdminEmail(text);
                setErrorMessage('');
              }}
              autoCapitalize="none"
              leftIcon={<Ionicons name="mail-outline" size={18} color={Colors.textMuted} />}
            />

            <Input
              label="Password"
              placeholder="••••••••"
              value={adminPassword}
              onChangeText={(text) => {
                setAdminPassword(text);
                setErrorMessage('');
              }}
              secureTextEntry
              autoCapitalize="none"
              leftIcon={<Ionicons name="lock-closed-outline" size={18} color={Colors.textMuted} />}
            />

            {errorMessage ? (
              <View style={styles.errorAlert}>
                <Ionicons name="alert-circle" size={18} color={Colors.error} style={{ marginRight: 6 }} />
                <Text style={styles.errorAlertText}>{errorMessage}</Text>
              </View>
            ) : null}

            <Button
              title="Sign In as Staff / Admin"
              onPress={handleAdminSubmit}
              loading={loading}
              size="lg"
              style={{ marginTop: Spacing.xs }}
            />

            <TouchableOpacity
              style={styles.switchCustomerContainer}
              onPress={() => setActiveTab('customer')}
            >
              <Ionicons name="person-outline" size={16} color={Colors.primaryLight} />
              <Text style={styles.switchCustomerText}>
                Are you a customer? <Text style={styles.switchCustomerLink}>Customer Portal</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primaryDark,
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
    backgroundColor: '#FEF3C7',
    paddingHorizontal: Spacing.sm + 4,
    paddingVertical: 4,
    borderRadius: Radii.full,
    marginTop: Spacing.sm,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  roleBadgeText: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: Typography.fontWeights.semibold,
    color: '#B45309',
    marginLeft: 4,
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
  switchCustomerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.lg,
    paddingVertical: Spacing.xs,
  },
  switchCustomerText: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.textSecondary,
    marginLeft: 6,
  },
  switchCustomerLink: {
    fontWeight: Typography.fontWeights.bold,
    color: Colors.primaryLight,
  },
});
