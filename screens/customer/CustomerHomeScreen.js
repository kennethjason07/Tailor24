import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Image,
  Dimensions,
  Platform,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../supabase';
import { Colors, Typography, Spacing, Radii, Shadows } from '../../theme';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import StatusBadge from '../../components/ui/StatusBadge';
import ProgressBar from '../../components/ui/ProgressBar';
import AIAssistantModal from '../../components/customer/AIAssistantModal';

const { width } = Dimensions.get('window');
const isSmallScreen = width < 768;

const LIFECYCLE_STAGES = [
  { key: 'ordered', label: 'Ordered', step: 1 },
  { key: 'measurement', label: 'Measured', step: 2 },
  { key: 'production', label: 'Production', step: 3 },
  { key: 'quality', label: 'Quality Check', step: 4 },
  { key: 'ready', label: 'Ready for Pickup', step: 5 },
];

export default function CustomerHomeScreen() {
  const { user, profile, signOut } = useAuth();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'measurements' | 'bills'
  const [aiModalVisible, setAiModalVisible] = useState(false);

  const [orders, setOrders] = useState([]);
  const [bills, setBills] = useState([]);
  const [measurements, setMeasurements] = useState(null);

  const customerPhone = profile?.mobile_number || user?.user_metadata?.mobile_number || '';
  const customerName = profile?.full_name || user?.user_metadata?.full_name || 'Valued Customer';

  useEffect(() => {
    fetchCustomerData();
  }, [customerPhone]);

  const fetchCustomerData = async () => {
    setLoading(true);
    try {
      if (!customerPhone) {
        setLoading(false);
        return;
      }

      // 1. Fetch Customer Bills
      const { data: billsData, error: billsErr } = await supabase
        .from('bills')
        .select('*')
        .eq('mobile_number', customerPhone)
        .order('id', { ascending: false });

      if (billsErr) throw billsErr;
      setBills(billsData || []);

      // 2. Fetch Customer Orders
      const billNumbers = (billsData || []).map((b) => b.id || b.bill_number).filter(Boolean);
      if (billNumbers.length > 0) {
        const { data: ordersData, error: ordersErr } = await supabase
          .from('orders')
          .select('*')
          .in('bill_number', billNumbers)
          .order('id', { ascending: false });

        if (!ordersErr) {
          setOrders(ordersData || []);
        }
      }

      // 3. Fetch Measurements
      const { data: measureData, error: measureErr } = await supabase
        .from('measurements')
        .select('*')
        .eq('mobile_number', customerPhone)
        .maybeSingle();

      if (!measureErr && measureData) {
        setMeasurements(measureData);
      }
    } catch (err) {
      console.warn('Error loading customer records:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchCustomerData();
  };

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to log out of your account?')) {
        signOut();
      }
    } else {
      Alert.alert('Log Out', 'Are you sure you want to log out of your account?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log Out', style: 'destructive', onPress: signOut },
      ]);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Calculate order progress percentage
  const getProgressForOrder = (status) => {
    const s = (status || '').toLowerCase();
    if (s.includes('deliver') || s.includes('complete')) return 100;
    if (s.includes('ready') || s.includes('pickup')) return 85;
    if (s.includes('quality') || s.includes('check')) return 70;
    if (s.includes('production') || s.includes('stitch') || s.includes('process')) return 50;
    if (s.includes('measure')) return 25;
    return 15; // Ordered
  };

  // Metrics
  const ordersInProduction = orders.filter((o) => {
    const s = (o.status || '').toLowerCase();
    return !s.includes('deliver') && !s.includes('ready');
  }).length;

  const ordersReady = orders.filter((o) => {
    const s = (o.status || '').toLowerCase();
    return s.includes('ready') || s.includes('pickup');
  }).length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primaryDark} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Header Banner */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.brandRow}>
              <View style={styles.logoBadge}>
                <Image source={require('../../assets/logo.jpg')} style={styles.logo} />
              </View>
              <View>
                <Text style={styles.brandTitle}>Tailor24</Text>
                <Text style={styles.brandTagline}>Smart Automation & Delivery</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={16} color="#fff" />
              <Text style={styles.logoutBtnText}>Logout</Text>
            </TouchableOpacity>
          </View>

          {/* Greeting Box */}
          <View style={styles.greetingCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{customerName.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={styles.greetingDetails}>
              <Text style={styles.greetingSubtitle}>{getGreeting()},</Text>
              <Text style={styles.greetingName}>{customerName}</Text>
              <View style={styles.phoneBadge}>
                <Ionicons name="call" size={11} color={Colors.accentLight} />
                <Text style={styles.phoneBadgeText}>{customerPhone || 'Linked Account'}</Text>
              </View>
            </View>
          </View>

          {/* Operational Quick Stats */}
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statNum}>{orders.length}</Text>
              <Text style={styles.statLabel}>Active Orders</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={[styles.statNum, { color: Colors.primaryLight }]}>{ordersInProduction}</Text>
              <Text style={styles.statLabel}>In Production</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={[styles.statNum, { color: Colors.success }]}>{ordersReady}</Text>
              <Text style={styles.statLabel}>Ready for Pickup</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statNum}>{bills.length}</Text>
              <Text style={styles.statLabel}>Total Bills</Text>
            </View>
          </View>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'orders' && styles.activeTabItem]}
            onPress={() => setActiveTab('orders')}
          >
            <Ionicons
              name="shirt-outline"
              size={18}
              color={activeTab === 'orders' ? Colors.primary : Colors.textMuted}
            />
            <Text style={[styles.tabItemText, activeTab === 'orders' && styles.activeTabItemText]}>
              Orders ({orders.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'measurements' && styles.activeTabItem]}
            onPress={() => setActiveTab('measurements')}
          >
            <MaterialCommunityIcons
              name="tape-measure"
              size={18}
              color={activeTab === 'measurements' ? Colors.primary : Colors.textMuted}
            />
            <Text style={[styles.tabItemText, activeTab === 'measurements' && styles.activeTabItemText]}>
              Measurements
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'bills' && styles.activeTabItem]}
            onPress={() => setActiveTab('bills')}
          >
            <Ionicons
              name="receipt-outline"
              size={18}
              color={activeTab === 'bills' ? Colors.primary : Colors.textMuted}
            />
            <Text style={[styles.tabItemText, activeTab === 'bills' && styles.activeTabItemText]}>
              Bills & Invoices
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Body */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Syncing orders with shop database...</Text>
          </View>
        ) : (
          <View style={styles.tabContentContainer}>
            {/* ORDERS TAB */}
            {activeTab === 'orders' && (
              <View>
                {orders.length === 0 ? (
                  <Card style={styles.emptyCard}>
                    <MaterialCommunityIcons name="clipboard-text-outline" size={54} color={Colors.textMuted} />
                    <Text style={styles.emptyTitle}>No Active Orders Found</Text>
                    <Text style={styles.emptySubtitle}>
                      Orders created with phone #{customerPhone} will appear here with live production updates.
                    </Text>
                  </Card>
                ) : (
                  orders.map((order, idx) => {
                    const progress = getProgressForOrder(order.status);
                    return (
                      <Card key={order.id || idx} style={styles.orderCard}>
                        {/* Order Header */}
                        <View style={styles.orderHeader}>
                          <View>
                            <View style={styles.orderTagRow}>
                              <Text style={styles.orderIdText}>#T24-{order.bill_number || order.id}</Text>
                              <StatusBadge status={order.status} />
                            </View>
                            <Text style={styles.garmentTitle}>{order.garment_type || 'Custom Garment'}</Text>
                          </View>
                          <Text style={styles.orderAmountText}>₹{order.total_amount || 0}</Text>
                        </View>

                        {/* Progress Bar & Status */}
                        <View style={styles.progressSection}>
                          <View style={styles.progressLabels}>
                            <Text style={styles.progressStatusText}>
                              Stage: <Text style={{ fontWeight: 'bold', color: Colors.primary }}>{order.status || 'In Production'}</Text>
                            </Text>
                            <Text style={styles.progressPercentText}>{progress}%</Text>
                          </View>
                          <ProgressBar progress={progress} color={progress === 100 ? Colors.success : Colors.primaryLight} height={7} />
                        </View>

                        {/* Metadata Grid */}
                        <View style={styles.metaGrid}>
                          <View style={styles.metaItem}>
                            <Text style={styles.metaLabel}>Delivery Due</Text>
                            <Text style={styles.metaValue}>{order.due_date || 'Standard'}</Text>
                          </View>
                          <View style={styles.metaItem}>
                            <Text style={styles.metaLabel}>Payment Status</Text>
                            <Text
                              style={[
                                styles.metaValue,
                                { color: order.payment_status === 'paid' ? Colors.success : Colors.warning },
                              ]}
                            >
                              {order.payment_status === 'paid' ? 'Paid in Full' : 'Advance Paid'}
                            </Text>
                          </View>
                          <View style={styles.metaItem}>
                            <Text style={styles.metaLabel}>Quality Verification</Text>
                            <Text style={[styles.metaValue, { color: Colors.success }]}>
                              <Ionicons name="checkmark-circle" size={13} color={Colors.success} /> On Track
                            </Text>
                          </View>
                        </View>
                      </Card>
                    );
                  })
                )}
              </View>
            )}

            {/* MEASUREMENTS TAB */}
            {activeTab === 'measurements' && (
              <View>
                {!measurements ? (
                  <Card style={styles.emptyCard}>
                    <MaterialCommunityIcons name="tape-measure" size={54} color={Colors.textMuted} />
                    <Text style={styles.emptyTitle}>Measurements Not Yet Recorded</Text>
                    <Text style={styles.emptySubtitle}>
                      Visit our shop to have your master fit dimensions saved. Once recorded, all your future suits, shirts, and trousers will fit accurately.
                    </Text>
                  </Card>
                ) : (
                  <Card style={styles.measurementCard}>
                    <View style={styles.measureHeader}>
                      <View>
                        <Text style={styles.measureTitle}>Verified Body Specifications</Text>
                        <Text style={styles.measureSubtitle}>
                          Registered mobile: {measurements.mobile_number}
                        </Text>
                      </View>
                      <View style={styles.verifiedChip}>
                        <Ionicons name="shield-checkmark" size={14} color={Colors.success} />
                        <Text style={styles.verifiedChipText}>Verified Fit</Text>
                      </View>
                    </View>

                    <View style={styles.dimGrid}>
                      {Object.entries(measurements).map(([key, val]) => {
                        if (
                          ['id', 'created_at', 'updated_at', 'mobile_number', 'customer_name'].includes(key) ||
                          !val
                        ) {
                          return null;
                        }
                        const formattedKey = key.replace(/_/g, ' ').toUpperCase();
                        return (
                          <View key={key} style={styles.dimCard}>
                            <Text style={styles.dimLabel}>{formattedKey}</Text>
                            <Text style={styles.dimValue}>{String(val)}"</Text>
                          </View>
                        );
                      })}
                    </View>
                  </Card>
                )}
              </View>
            )}

            {/* BILLS TAB */}
            {activeTab === 'bills' && (
              <View>
                {bills.length === 0 ? (
                  <Card style={styles.emptyCard}>
                    <Ionicons name="receipt-outline" size={54} color={Colors.textMuted} />
                    <Text style={styles.emptyTitle}>No Invoices Issued</Text>
                    <Text style={styles.emptySubtitle}>
                      Invoices and receipts generated by shop staff will appear here.
                    </Text>
                  </Card>
                ) : (
                  bills.map((bill, idx) => (
                    <Card key={bill.id || idx} style={styles.billCard}>
                      <View style={styles.billTopRow}>
                        <View>
                          <Text style={styles.billNumber}>Invoice #{bill.id || bill.bill_number}</Text>
                          <Text style={styles.billDate}>Issue Date: {bill.date_issue || bill.today_date || 'Recent'}</Text>
                        </View>
                        <Text style={styles.billTotal}>₹{bill.total_amt || 0}</Text>
                      </View>

                      <View style={styles.billDivider} />

                      <View style={styles.billBottomRow}>
                        <Text style={styles.billStatus}>
                          Status:{' '}
                          <Text
                            style={{
                              fontWeight: 'bold',
                              color: bill.payment_status === 'paid' ? Colors.success : Colors.warning,
                            }}
                          >
                            {(bill.payment_status || 'Pending').toUpperCase()}
                          </Text>
                        </Text>
                        <Text style={styles.billPaid}>Amount Paid: ₹{bill.payment_amount || 0}</Text>
                      </View>
                    </Card>
                  ))
                )}
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Floating AI Assistant Entry Button */}
      <TouchableOpacity
        style={styles.floatingAiBtn}
        activeOpacity={0.85}
        onPress={() => setAiModalVisible(true)}
      >
        <Ionicons name="sparkles" size={20} color="#fff" />
        <Text style={styles.floatingAiText}>AI Assistant</Text>
      </TouchableOpacity>

      {/* Smart Assistant Modal */}
      <AIAssistantModal
        visible={aiModalVisible}
        onClose={() => setAiModalVisible(false)}
        customerName={customerName}
        orders={orders}
        measurements={measurements}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.primaryDark,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    paddingBottom: 90,
  },
  header: {
    backgroundColor: Colors.primaryDark,
    paddingHorizontal: Spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 12 : Spacing.base,
    paddingBottom: Spacing.xl,
    borderBottomLeftRadius: Radii.lg,
    borderBottomRightRadius: Radii.lg,
    ...Shadows.card,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.base,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    padding: 2,
    marginRight: Spacing.md,
    overflow: 'hidden',
  },
  logo: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  brandTitle: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.heavy,
    color: Colors.textWhite,
  },
  brandTagline: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.textMuted,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.25)',
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radii.full,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  logoutBtnText: {
    color: '#fff',
    fontSize: Typography.fontSizes.xs,
    fontWeight: Typography.fontWeights.semibold,
    marginLeft: 4,
  },
  greetingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: Radii.base,
    padding: Spacing.base,
    marginBottom: Spacing.base,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textWhite,
  },
  greetingDetails: {
    flex: 1,
  },
  greetingSubtitle: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.textMuted,
  },
  greetingName: {
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textWhite,
  },
  phoneBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  phoneBadgeText: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.accentLight,
    marginLeft: 4,
    fontWeight: Typography.fontWeights.medium,
  },
  statsGrid: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: Radii.md,
    paddingVertical: Spacing.md,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statBox: {
    alignItems: 'center',
  },
  statNum: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.heavy,
    color: Colors.textWhite,
  },
  statLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: Spacing.base,
    marginTop: Spacing.base,
    marginBottom: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: Radii.md,
    padding: 4,
    ...Shadows.subtle,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: Radii.sm,
  },
  activeTabItem: {
    backgroundColor: '#EFF6FF',
  },
  tabItemText: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.textMuted,
    marginLeft: 6,
  },
  activeTabItemText: {
    color: Colors.primary,
  },
  tabContentContainer: {
    paddingHorizontal: Spacing.base,
  },
  loadingContainer: {
    padding: Spacing.huge,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: Typography.fontSizes.sm,
    color: Colors.textMuted,
  },
  emptyCard: {
    alignItems: 'center',
    padding: Spacing.xl,
    marginVertical: Spacing.sm,
  },
  emptyTitle: {
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
    marginTop: Spacing.md,
  },
  emptySubtitle: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.xs,
    lineHeight: 20,
  },
  orderCard: {
    marginBottom: Spacing.md,
    padding: Spacing.base,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  orderTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: 4,
  },
  orderIdText: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textSecondary,
  },
  garmentTitle: {
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
  },
  orderAmountText: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.heavy,
    color: Colors.success,
  },
  progressSection: {
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: Radii.sm,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  progressStatusText: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.textSecondary,
  },
  progressPercentText: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.primary,
  },
  metaGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.sm,
  },
  metaItem: {
    alignItems: 'center',
  },
  metaLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    marginBottom: 2,
  },
  metaValue: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.textPrimary,
  },
  measurementCard: {
    padding: Spacing.base,
  },
  measureHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.base,
  },
  measureTitle: {
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
  },
  measureSubtitle: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.textMuted,
  },
  verifiedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.successBg,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radii.full,
  },
  verifiedChipText: {
    fontSize: 11,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.success,
    marginLeft: 4,
  },
  dimGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  dimCard: {
    width: '48%',
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: Radii.md,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dimLabel: {
    fontSize: 10,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  dimValue: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.heavy,
    color: Colors.primary,
  },
  billCard: {
    marginBottom: Spacing.md,
    padding: Spacing.base,
  },
  billTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  billNumber: {
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
  },
  billDate: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  billTotal: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.heavy,
    color: Colors.success,
  },
  billDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.md,
  },
  billBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  billStatus: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.textSecondary,
  },
  billPaid: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.textPrimary,
  },
  floatingAiBtn: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.base,
    paddingVertical: 12,
    borderRadius: Radii.full,
    borderWidth: 1.5,
    borderColor: Colors.accentLight,
    ...Shadows.popover,
  },
  floatingAiText: {
    color: '#fff',
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.bold,
    marginLeft: 6,
  },
});
