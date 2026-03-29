import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const BRAND = '#F56E0F';
const WHITE = '#FFFFFF';
const BG = '#F9FAFB';
const TEXT = '#111827';
const MUTED = '#6B7280';
const BORDER = '#E5E7EB';

export default function BookingManagementScreen() {
  const router = useRouter();

  const bookings = [
    {
      id: 'b1',
      customer: 'John Perera',
      vehicle: 'Honda Civic (CBA-1234)',
      service: 'Full Service & Oil Change',
      time: 'Today, 10:00 AM',
      status: 'Pending',
    },
    {
      id: 'b2',
      customer: 'Saman Silva',
      vehicle: 'Toyota Prius (CAA-9876)',
      service: 'Brake Inspection',
      time: 'Today, 02:30 PM',
      status: 'Pending',
    },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={BG} />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={TEXT} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Booking Management</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.tabHeader}>
          <View style={styles.tabActive}><Text style={styles.tabActiveText}>Incoming (2)</Text></View>
          <View style={styles.tabInactive}><Text style={styles.tabInactiveText}>Scheduled</Text></View>
        </View>

        {bookings.map((b) => (
          <View key={b.id} style={styles.bookingCard}>
            <View style={styles.cardHeader}>
              <View style={styles.customerBox}>
                <View style={styles.avatar}><Text style={styles.avatarText}>{b.customer[0]}</Text></View>
                <View>
                  <Text style={styles.customerName}>{b.customer}</Text>
                  <Text style={styles.vehicleText}>{b.vehicle}</Text>
                </View>
              </View>
              <View style={styles.statusBadge}><Text style={styles.statusText}>{b.status}</Text></View>
            </View>

            <View style={styles.serviceBox}>
              <Ionicons name="construct-outline" size={16} color={MUTED} />
              <Text style={styles.serviceText}>{b.service}</Text>
            </View>
            
            <View style={styles.timeBox}>
              <Ionicons name="time-outline" size={16} color={BRAND} />
              <Text style={styles.timeText}>{b.time}</Text>
            </View>

            <View style={styles.footerRow}>
              <TouchableOpacity style={styles.rejectBtn}>
                <Text style={styles.rejectText}>Reject</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.acceptBtn}>
                <Text style={styles.acceptText}>Accept Booking</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: WHITE,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: TEXT },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F3F4F6' },

  scroll: { padding: 20, paddingBottom: 100 },
  
  tabHeader: { flexDirection: 'row', backgroundColor: '#E5E7EB', borderRadius: 10, padding: 4, marginBottom: 20 },
  tabActive: { flex: 1, backgroundColor: WHITE, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  tabActiveText: { fontWeight: '800', color: TEXT, fontSize: 13 },
  tabInactive: { flex: 1, paddingVertical: 10, alignItems: 'center' },
  tabInactiveText: { fontWeight: '600', color: MUTED, fontSize: 13 },

  bookingCard: {
    backgroundColor: WHITE,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: BORDER,
    marginBottom: 16,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  customerBox: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFF4EC', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: BRAND, fontWeight: '800', fontSize: 16 },
  customerName: { fontSize: 16, fontWeight: '800', color: TEXT },
  vehicleText: { fontSize: 12, color: MUTED, fontWeight: '600' },
  statusBadge: { backgroundColor: '#FFFBEB', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, alignSelf: 'flex-start' },
  statusText: { fontSize: 11, fontWeight: '800', color: '#D97706' },

  serviceBox: { flexDirection: 'row', gap: 8, alignItems: 'center', marginBottom: 8 },
  serviceText: { fontSize: 14, color: TEXT, fontWeight: '600' },
  timeBox: { flexDirection: 'row', gap: 8, alignItems: 'center', marginBottom: 20 },
  timeText: { fontSize: 14, color: BRAND, fontWeight: '700' },

  footerRow: { flexDirection: 'row', gap: 12 },
  rejectBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, borderWidth: 1, borderColor: BORDER, alignItems: 'center' },
  rejectText: { fontWeight: '700', color: TEXT, fontSize: 13 },
  acceptBtn: { flex: 2, paddingVertical: 12, borderRadius: 10, backgroundColor: BRAND, alignItems: 'center' },
  acceptText: { fontWeight: '800', color: WHITE, fontSize: 13 },
});
