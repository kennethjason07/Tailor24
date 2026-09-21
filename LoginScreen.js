import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
  Dimensions,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from './context/AuthContext';

const { width } = Dimensions.get('window');
const isSmallScreen = width < 768;

const LoginScreen = () => {
  const { signIn, signUp } = useAuth();

  // Role Tab: 'admin' | 'customer'
  const [selectedRole, setSelectedRole] = useState('admin');
  // Customer mode: 'login' | 'signup'
  const [customerMode, setCustomerMode] = useState('login');

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');

  // Status
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setErrorMessage('');
    setSuccessMessage('');

    if (!email.trim()) {
      setErrorMessage('Please enter your email or username');
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your password');
      return;
    }

    // Auto-normalize "admin" or username to standard email format if needed
    let cleanEmail = email.trim();
    if (!cleanEmail.includes('@')) {
      cleanEmail = `${cleanEmail.toLowerCase()}@tailor24.com`;
    }

    setLoading(true);

    try {
      if (selectedRole === 'customer' && customerMode === 'signup') {
        if (!fullName.trim()) {
          setErrorMessage('Please enter your full name');
          setLoading(false);
          return;
        }
        if (!mobileNumber.trim()) {
          setErrorMessage('Please enter your 10-digit mobile number');
          setLoading(false);
          return;
        }

        await signUp(cleanEmail, password, {
          full_name: fullName.trim(),
          mobile_number: mobileNumber.trim(),
          role: 'customer',
        });

        setSuccessMessage('Account created! Please check your email to verify, or sign in.');
        setCustomerMode('login');
      } else {
        // Sign in for either Admin or Customer
        await signIn(cleanEmail, password);
      }
    } catch (error) {
      console.error('Auth error:', error);
      let msg = error.message || 'Authentication failed. Please check credentials.';
      if (msg.includes('Invalid login credentials')) {
        msg = 'Incorrect email or password entered.';
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
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.loginBox}>
          {/* Header */}
          <View style={styles.header}>
            <Image
              source={require('./assets/logo.jpg')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.title}>Tailor24</Text>
            <Text style={styles.subtitle}>Tailor Management System</Text>
          </View>

          {/* Role Selection Tabs */}
          <View style={styles.roleTabs}>
            <TouchableOpacity
              style={[styles.roleTab, selectedRole === 'admin' && styles.activeRoleTab]}
              onPress={() => {
                setSelectedRole('admin');
                setErrorMessage('');
                setSuccessMessage('');
              }}
            >
              <Ionicons
                name="shield-checkmark"
                size={16}
                color={selectedRole === 'admin' ? '#2980b9' : '#7f8c8d'}
              />
              <Text style={[styles.roleTabText, selectedRole === 'admin' && styles.activeRoleTabText]}>
                Staff / Admin
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.roleTab, selectedRole === 'customer' && styles.activeRoleTab]}
              onPress={() => {
                setSelectedRole('customer');
                setErrorMessage('');
                setSuccessMessage('');
              }}
            >
              <Ionicons
                name="person"
                size={16}
                color={selectedRole === 'customer' ? '#2980b9' : '#7f8c8d'}
              />
              <Text style={[styles.roleTabText, selectedRole === 'customer' && styles.activeRoleTabText]}>
                Customer
              </Text>
            </TouchableOpacity>
          </View>

          {/* Customer Sub-mode: Login vs Signup */}
          {selectedRole === 'customer' && (
            <View style={styles.customerModeSwitch}>
              <TouchableOpacity
                onPress={() => {
                  setCustomerMode('login');
                  setErrorMessage('');
                }}
              >
                <Text style={[styles.modeSwitchText, customerMode === 'login' && styles.activeModeSwitchText]}>
                  Sign In
                </Text>
              </TouchableOpacity>
              <Text style={styles.modeDivider}>|</Text>
              <TouchableOpacity
                onPress={() => {
                  setCustomerMode('signup');
                  setErrorMessage('');
                }}
              >
                <Text style={[styles.modeSwitchText, customerMode === 'signup' && styles.activeModeSwitchText]}>
                  Create Customer Account
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Form */}
          <View style={styles.form}>
            {selectedRole === 'customer' && customerMode === 'signup' && (
              <>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Full Name</Text>
                  <TextInput
                    style={styles.input}
                    value={fullName}
                    onChangeText={setFullName}
                    placeholder="e.g. Rahul Sharma"
                    autoCapitalize="words"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Mobile Number (Registered with Shop)</Text>
                  <TextInput
                    style={styles.input}
                    value={mobileNumber}
                    onChangeText={setMobileNumber}
                    placeholder="10-digit mobile number"
                    keyboardType="phone-pad"
                  />
                </View>
              </>
            )}

            <View style={styles.inputContainer}>
              <Text style={styles.label}>
                {selectedRole === 'admin' ? 'Admin Email / Username' : 'Email Address'}
              </Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setErrorMessage('');
                }}
                placeholder={selectedRole === 'admin' ? 'admin@tailor24.com or admin' : 'customer@example.com'}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setErrorMessage('');
                }}
                placeholder="Enter password"
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Error Message */}
            {errorMessage ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            {/* Success Message */}
            {successMessage ? (
              <View style={styles.successContainer}>
                <Text style={styles.successText}>{successMessage}</Text>
              </View>
            ) : null}

            {/* Action Button */}
            <TouchableOpacity
              style={[styles.loginButton, loading && styles.disabledButton]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.loginButtonText}>
                  {selectedRole === 'customer' && customerMode === 'signup'
                    ? 'Register Customer Account'
                    : selectedRole === 'admin'
                    ? 'Login as Admin'
                    : 'Customer Sign In'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2c3e50',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: isSmallScreen ? 15 : 20,
  },
  loginBox: {
    width: isSmallScreen ? '100%' : '90%',
    maxWidth: 440,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: isSmallScreen ? 20 : 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
  },
  title: {
    fontSize: isSmallScreen ? 22 : 26,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  roleTabs: {
    flexDirection: 'row',
    backgroundColor: '#f1f2f6',
    borderRadius: 10,
    padding: 4,
    marginBottom: 16,
  },
  roleTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
  },
  activeRoleTab: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  roleTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#7f8c8d',
    marginLeft: 6,
  },
  activeRoleTabText: {
    color: '#2980b9',
  },
  customerModeSwitch: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modeSwitchText: {
    fontSize: 13,
    color: '#7f8c8d',
    paddingHorizontal: 8,
  },
  activeModeSwitchText: {
    color: '#2980b9',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  modeDivider: {
    color: '#bdc3c7',
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#34495e',
    marginBottom: 6,
  },
  input: {
    width: '100%',
    height: 48,
    borderWidth: 1,
    borderColor: '#dcdde1',
    borderRadius: 8,
    paddingHorizontal: 14,
    fontSize: 15,
    backgroundColor: '#f8f9fa',
    color: '#2c3e50',
  },
  errorContainer: {
    width: '100%',
    backgroundColor: '#ffebee',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ef5350',
  },
  errorText: {
    color: '#c62828',
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '500',
  },
  successContainer: {
    width: '100%',
    backgroundColor: '#e8f5e9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#66bb6a',
  },
  successText: {
    color: '#2e7d32',
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '500',
  },
  loginButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#2980b9',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
    elevation: 3,
  },
  disabledButton: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default LoginScreen;
