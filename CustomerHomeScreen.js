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
  Linking,
  Alert,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useAuth } from './context/AuthContext';
import { supabase } from './supabase';
import WebScrollView from './components/WebScrollView';

const { width } = Dimensions.get('window');
const isSmallScreen = width < 768;

export default function CustomerHomeScreen() {
  const { user, profile, signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'measurements' | 'bills'

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
      console.warn('Error loading customer data:', err.message);
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
      if (window.confirm('Are you sure you want to log out?')) {
        signOut();
      }
    } else {
      Alert.alert('Log Out', 'Are you sure you want to log out of your account?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log Out', style: 'destructive', onPress: signOut },
      ]);
    }
  };

  const getStatusColor = (status) => {
    const s = (status || '').toLowerCase();
    if (s.includes('ready') || s.includes('delivered') || s.includes('completed')) return '#27ae60';
    if (s.includes('process') || s.includes('stitching')) return '#e67e22';
    return '#2980b9'; // pending / default
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#2c3e50" />
      <WebScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header Banner */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.brandRow}>
              <Image source={require('./assets/logo.jpg')} style={styles.logo} />
              <View>
                <Text style={styles.brandTitle}>Tailor24</Text>
                <Text style={styles.brandSubtitle}>Customer Portal</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={20} color="#fff" />
              <Text style={styles.logoutBtnText}>Logout</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.profileCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{customerName.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={styles.profileDetails}>
              <Text style={styles.welcomeText}>Hello,</Text>
              <Text style={styles.userName}>{customerName}</Text>
              <Text style={styles.userPhone}>
                <Ionicons name="call-outline" size={13} color="#bdc3c7" /> {customerPhone || 'No phone set'}
              </Text>
            </View>
          </View>

          {/* Quick Metrics */}
          <View style={styles.metricsRow}>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>{orders.length}</Text>
              <Text style={styles.metricLabel}>Total Orders</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>{bills.length}</Text>
              <Text style={styles.metricLabel}>Bills</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>{measurements ? 'Saved' : 'Pending'}</Text>
              <Text style={styles.metricLabel}>Measurements</Text>
            </View>
          </View>
        </View>

        {/* Tab Selector */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'orders' && styles.activeTabButton]}
            onPress={() => setActiveTab('orders')}
          >
            <Ionicons
              name="shirt-outline"
              size={18}
              color={activeTab === 'orders' ? '#2980b9' : '#7f8c8d'}
            />
            <Text style={[styles.tabText, activeTab === 'orders' && styles.activeTabText]}>
              My Orders ({orders.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'measurements' && styles.activeTabButton]}
            onPress={() => setActiveTab('measurements')}
          >
            <MaterialCommunityIcons
              name="tape-measure"
              size={18}
              color={activeTab === 'measurements' ? '#2980b9' : '#7f8c8d'}
            />
            <Text style={[styles.tabText, activeTab === 'measurements' && styles.activeTabText]}>
              Measurements
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'bills' && styles.activeTabButton]}
            onPress={() => setActiveTab('bills')}
          >
            <Ionicons
              name="receipt-outline"
              size={18}
              color={activeTab === 'bills' ? '#2980b9' : '#7f8c8d'}
            />
            <Text style={[styles.tabText, activeTab === 'bills' && styles.activeTabText]}>
              Bills ({bills.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content Area */}
        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#2980b9" />
            <Text style={styles.loadingText}>Loading your tailoring records...</Text>
          </View>
        ) : (
          <View style={styles.tabContent}>
            {/* ORDERS TAB */}
            {activeTab === 'orders' && (
              <View>
                {orders.length === 0 ? (
                  <View style={styles.emptyCard}>
                    <MaterialCommunityIcons name="clipboard-text-outline" size={48} color="#bdc3c7" />
                    <Text style={styles.emptyTitle}>No Orders Found</Text>
                    <Text style={styles.emptySubtitle}>
                      No active tailoring orders linked to {customerPhone}.
                    </Text>
                  </View>
                ) : (
                  orders.map((order, idx) => (
                    <View key={order.id || idx} style={styles.orderCard}>
                      <View style={styles.orderCardHeader}>
                        <View style={styles.garmentBadge}>
                          <Ionicons name="shirt" size={16} color="#2980b9" />
                          <Text style={styles.garmentName}>{order.garment_type || 'Custom Garment'}</Text>
                        </View>
                        <View
                          style={[
                            styles.statusBadge,
                            { backgroundColor: getStatusColor(order.status) + '15' },
                          ]}
                        >
                          <Text
                            style={[
                              styles.statusBadgeText,
                              { color: getStatusColor(order.status) },
                            ]}
                          >
                            {order.status || 'Processing'}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.orderDetailsGrid}>
                        <View style={styles.orderDetailCol}>
                          <Text style={styles.detailLabel}>Bill Number</Text>
                          <Text style={styles.detailValue}>#{order.bill_number || 'N/A'}</Text>
                        </View>
                        <View style={styles.orderDetailCol}>
                          <Text style={styles.detailLabel}>Delivery Due</Text>
                          <Text style={styles.detailValue}>{order.due_date || 'Standard'}</Text>
                        </View>
                        <View style={styles.orderDetailCol}>
                          <Text style={styles.detailLabel}>Amount</Text>
                          <Text style={[styles.detailValue, { color: '#27ae60', fontWeight: 'bold' }]}>
                            ₹{order.total_amount || 0}
                          </Text>
                        </View>
                      </View>
                    </View>
                  ))
                )}
              </View>
            )}

            {/* MEASUREMENTS TAB */}
            {activeTab === 'measurements' && (
              <View>
                {!measurements ? (
                  <View style={styles.emptyCard}>
                    <MaterialCommunityIcons name="tape-measure" size={48} color="#bdc3c7" />
                    <Text style={styles.emptyTitle}>No Measurements Saved</Text>
                    <Text style={styles.emptySubtitle}>
                      Your measurement profile has not been recorded yet. Please visit our shop to take your custom fit.
                    </Text>
                  </View>
                ) : (
                  <View style={styles.measurementCard}>
                    <Text style={styles.cardHeaderTitle}>Recorded Body Dimensions</Text>
                    <Text style={styles.cardHeaderSubtitle}>
                      Saved for mobile: {measurements.mobile_number}
                    </Text>

                    <View style={styles.dimGrid}>
                      {Object.entries(measurements).map(([key, val]) => {
                        if (['id', 'created_at', 'updated_at', 'mobile_number', 'customer_name'].includes(key) || !val) {
                          return null;
                        }
                        const formattedKey = key.replace(/_/g, ' ').toUpperCase();
                        return (
                          <View key={key} style={styles.dimItem}>
                            <Text style={styles.dimKey}>{formattedKey}</Text>
                            <Text style={styles.dimVal}>{String(val)}"</Text>
                          </View>
                        );
                      })}
                    </View>
                  </View>
                )}
              </View>
            )}

            {/* BILLS TAB */}
            {activeTab === 'bills' && (
              <View>
                {bills.length === 0 ? (
                  <View style={styles.emptyCard}>
                    <Ionicons name="receipt-outline" size={48} color="#bdc3c7" />
                    <Text style={styles.emptyTitle}>No Bills Issued</Text>
                    <Text style={styles.emptySubtitle}>
                      No invoices found for phone {customerPhone}.
                    </Text>
                  </View>
                ) : (
                  bills.map((bill, idx) => (
                    <View key={bill.id || idx} style={styles.billCard}>
                      <View style={styles.billHeader}>
                        <View>
                          <Text style={styles.billNumberText}>Bill #{bill.id || bill.bill_number}</Text>
                          <Text style={styles.billDateText}>{bill.date_issue || bill.today_date || 'Recent'}</Text>
                        </View>
                        <View style={styles.billTotalBox}>
                          <Text style={styles.billTotalLabel}>Total</Text>
                          <Text style={styles.billTotalValue}>₹{bill.total_amt || 0}</Text>
                        </View>
                      </View>

                      <View style={styles.billDivider} />

                      <View style={styles.billRow}>
                        <Text style={styles.billInfoText}>
                          Payment Status: <Text style={{ fontWeight: 'bold', color: bill.payment_status === 'paid' ? '#27ae60' : '#e67e22' }}>{bill.payment_status || 'Pending'}</Text>
                        </Text>
                        <Text style={styles.billInfoText}>
                          Paid: ₹{bill.payment_amount || 0}
                        </Text>
                      </View>
                    </View>
                  ))
                )}
              </View>
            )}
          </View>
        )}
      </WebScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#2c3e50' },
  container: { flex: 1, backgroundColor: '#f5f7fa' },
  contentContainer: { paddingBottom: 50 },
  header: {
    backgroundColor: '#2c3e50',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center' },
  logo: { width: 42, height: 42, borderRadius: 21, marginRight: 12 },
  brandTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff', letterSpacing: 0.5 },
  brandSubtitle: { fontSize: 12, color: '#bdc3c7' },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e74c3c',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  logoutBtnText: { color: '#fff', fontSize: 12, fontWeight: '600', marginLeft: 4 },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 18,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  avatarText: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  profileDetails: { flex: 1 },
  welcomeText: { fontSize: 13, color: '#bdc3c7' },
  userName: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  userPhone: { fontSize: 13, color: '#ecf0f1', marginTop: 2 },
  metricsRow: {
    flexDirection: 'row',
    backgroundColor: '#34495e',
    borderRadius: 12,
    paddingVertical: 12,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  metricItem: { alignItems: 'center' },
  metricValue: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
  metricLabel: { fontSize: 11, color: '#bdc3c7', marginTop: 2 },
  metricDivider: { width: 1, height: 24, backgroundColor: 'rgba(255,255,255,0.2)' },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 18,
    marginBottom: 14,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
  },
  activeTabButton: { backgroundColor: '#eaf2f8' },
  tabText: { fontSize: 13, color: '#7f8c8d', fontWeight: '600', marginLeft: 6 },
  activeTabText: { color: '#2980b9' },
  tabContent: { paddingHorizontal: 16 },
  loadingBox: { padding: 40, alignItems: 'center' },
  loadingText: { marginTop: 12, color: '#7f8c8d', fontSize: 14 },
  emptyCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    marginVertical: 10,
  },
  emptyTitle: { fontSize: 17, fontWeight: 'bold', color: '#2c3e50', marginTop: 12 },
  emptySubtitle: {
    fontSize: 13,
    color: '#7f8c8d',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  orderCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  garmentBadge: { flexDirection: 'row', alignItems: 'center' },
  garmentName: { fontSize: 16, fontWeight: 'bold', color: '#2c3e50', marginLeft: 6 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusBadgeText: { fontSize: 12, fontWeight: 'bold' },
  orderDetailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 10,
  },
  orderDetailCol: { alignItems: 'center' },
  detailLabel: { fontSize: 11, color: '#95a5a6', marginBottom: 2 },
  detailValue: { fontSize: 13, color: '#34495e', fontWeight: '600' },
  measurementCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  cardHeaderTitle: { fontSize: 16, fontWeight: 'bold', color: '#2c3e50' },
  cardHeaderSubtitle: { fontSize: 12, color: '#7f8c8d', marginBottom: 14 },
  dimGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  dimItem: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  dimKey: { fontSize: 11, color: '#7f8c8d', fontWeight: '600', marginBottom: 2 },
  dimVal: { fontSize: 16, fontWeight: 'bold', color: '#2980b9' },
  billCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  billHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  billNumberText: { fontSize: 16, fontWeight: 'bold', color: '#2c3e50' },
  billDateText: { fontSize: 12, color: '#7f8c8d', marginTop: 2 },
  billTotalBox: { alignItems: 'flex-end' },
  billTotalLabel: { fontSize: 11, color: '#95a5a6' },
  billTotalValue: { fontSize: 18, fontWeight: 'bold', color: '#27ae60' },
  billDivider: { height: 1, backgroundColor: '#eee', marginVertical: 12 },
  billRow: { flexDirection: 'row', justifyContent: 'space-between' },
  billInfoText: { fontSize: 13, color: '#7f8c8d' },
});
