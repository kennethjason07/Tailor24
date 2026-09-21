import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Platform, StatusBar, ActivityIndicator, View } from 'react-native';

// Import web styles for responsive design
if (Platform.OS === 'web') {
  try {
    require('./web-styles.css');
  } catch (e) {
    // web-styles.css is optional
  }
}

// Suppress specific React Native Web deprecation warnings
if (Platform.OS === 'web') {
  const originalWarn = console.warn;
  console.warn = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('shadow*') ||
        args[0].includes('pointerEvents is deprecated') ||
        args[0].includes('resizeMode is deprecated') ||
        args[0].includes('textShadow*'))
    ) {
      return;
    }
    originalWarn.apply(console, args);
  };
}

import { AuthProvider, useAuth } from './context/AuthContext';
import LoginScreen from './LoginScreen';
import CustomerHomeScreen from './screens/customer/CustomerHomeScreen';
import DashboardScreen from './DashboardScreen';
import WorkersScreen from './WorkersScreen';
import OrdersOverviewScreen from './OrdersOverviewScreen';
import ShopExpenseScreen from './ShopExpenseScreen';
import WorkerExpenseScreen from './WorkerExpenseScreen';
import CustomerInfoScreen from './CustomerInfoScreen';
import WeeklyPayScreen from './WeeklyPayScreen';
import NewBillScreen from './NewBillScreen';
import WorkerDetailScreen from './WorkerDetailScreen';
import TodayProfitScreen from './TodayProfitScreen';
import WeeklyProfitScreen from './WeeklyProfitScreen';
import MonthlyProfitScreen from './MonthlyProfitScreen';
import WhatsAppConfigScreen from './WhatsAppConfigScreen';
import GenerateBillScreen from './GenerateBillScreen';
import TodaysOrdersScreen from './TodaysOrdersScreen';

const Stack = createStackNavigator();

function NavigationRoot() {
  const { session, role, loading, signOut } = useAuth();

  // Show loading screen while verifying auth session
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#2c3e50' }}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  // Not authenticated -> Show Login / Register Screen
  if (!session) {
    return (
      <>
        <StatusBar
          barStyle={Platform.OS === 'ios' ? 'light-content' : 'light-content'}
          backgroundColor={Platform.OS === 'android' ? '#2c3e50' : undefined}
        />
        <LoginScreen />
      </>
    );
  }

  // Authenticated as Customer -> Show dedicated Customer Portal
  if (role === 'customer') {
    return <CustomerHomeScreen />;
  }

  // Authenticated as Admin / Staff -> Show Full Tailor Management System
  return (
    <>
      <StatusBar
        barStyle={Platform.OS === 'ios' ? 'dark-content' : 'light-content'}
        backgroundColor={Platform.OS === 'android' ? '#2980b9' : undefined}
      />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Dashboard"
          screenOptions={{
            headerShown: false,
            ...(Platform.OS === 'ios' && {
              cardStyleInterpolator: ({ current, layouts }) => {
                return {
                  cardStyle: {
                    transform: [
                      {
                        translateX: current.progress.interpolate({
                          inputRange: [0, 1],
                          outputRange: [layouts.screen.width, 0],
                        }),
                      },
                    ],
                  },
                };
              },
            }),
          }}
        >
          <Stack.Screen name="Dashboard">
            {(props) => <DashboardScreen {...props} onLogout={signOut} />}
          </Stack.Screen>
          <Stack.Screen name="Workers" component={WorkersScreen} />
          <Stack.Screen name="OrdersOverview" component={OrdersOverviewScreen} />
          <Stack.Screen name="ShopExpense" component={ShopExpenseScreen} />
          <Stack.Screen name="WorkerExpense" component={WorkerExpenseScreen} />
          <Stack.Screen name="CustomerInfo" component={CustomerInfoScreen} />
          <Stack.Screen name="WeeklyPay" component={WeeklyPayScreen} />
          <Stack.Screen name="NewBill" component={NewBillScreen} />
          <Stack.Screen name="WorkerDetail" component={WorkerDetailScreen} />
          <Stack.Screen name="TodayProfit" component={TodayProfitScreen} />
          <Stack.Screen name="WeeklyProfit" component={WeeklyProfitScreen} />
          <Stack.Screen name="MonthlyProfit" component={MonthlyProfitScreen} />
          <Stack.Screen name="WhatsAppConfig" component={WhatsAppConfigScreen} />
          <Stack.Screen name="GenerateBill" component={GenerateBillScreen} />
          <Stack.Screen name="TodaysOrders" component={TodaysOrdersScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationRoot />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
