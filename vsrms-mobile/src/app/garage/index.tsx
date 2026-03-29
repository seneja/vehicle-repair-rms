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

export default function GarageDashboardScreen() {
  const router = useRouter();

  const stats = [
    { label: 'Pending Bookings', value: '12', icon: 'time-outline', color: '#F59E0B' },
    { label: 'Active Jobs', value: '8', icon: 'hammer-outline', color: BRAND },
    { label: 'Completed Today', value: '5', icon: 'checkmark-done-circle-outline', color: '#10B981' },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={BG} />
      
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerSubtitle}>Service Center</Text>
          <Text style={styles.headerTitle}>AutoCare Colombo</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
        {/* STATS */}
        <View style={styles.statsGrid}>
          {stats.map((s, i) => (
            <View key={i} style={styles.statCard}>
              <View style={[styles.iconBox, { backgroundColor: s.color + '10' }]}>
                <Ionicons name={s.icon as any} size={24} color={s.color} />
              </View>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* QUICK ACTIONS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsBox}>
            <TouchableOpacity 
              style={styles.actionBtn} 
              onPress={() => router.push('/garage/create-record')}
              activeOpacity={0.7}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#EFF6FF' }]}>
                <Ionicons name="document-text" size={24} color="#3B82F6" />
              </View>
              <Text style={styles.actionText}>Create Record</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionBtn} 
              onPress={() => router.push('/garage/bookings')}
              activeOpacity={0.7}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#F0FDF4' }]}>
                <Ionicons name="calendar" size={24} color="#10B981" />
              </View>
              <Text style={styles.actionText}>Bookings</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionBtn} 
              onPress={() => router.push('/garage/jobs')}
              activeOpacity={0.7}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#FFF7ED' }]}>
                <Ionicons name="trending-up" size={24} color={BRAND} />
              </View>
              <Text style={styles.actionText}>Job Tracker</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* RECENT ACTIVITY MOCK */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityCard}>
            <View style={styles.activityItem}>
              <View style={styles.activityDot} />
              <View>
                <Text style={styles.activityTitle}>John Perera - Honda Civic</Text>
                <Text style={styles.activityTime}>Just now • Booking Approved</Text>
              </View>
            </View>
            <View style={[styles.activityItem, { borderBottomWidth: 0 }]}>
              <View style={[styles.activityDot, { backgroundColor: BRAND }]} />
              <View>
                <Text style={styles.activityTitle}>Toyota Prius (CAA-9876)</Text>
                <Text style={styles.activityTime}>15 mins ago • In Progress</Text>
              </View>
            </View>
          </View>
        </View>

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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    backgroundColor: WHITE,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  headerSubtitle: { fontSize: 13, color: MUTED, fontWeight: '600' },
  headerTitle: { fontSize: 20, fontWeight: '800', color: TEXT, letterSpacing: -0.5 },

  scroll: { padding: 20, paddingBottom: 100 },
  
  statsGrid: { flexDirection: 'row', gap: 12, marginBottom: 28 },
  statCard: {
    flex: 1,
    backgroundColor: WHITE,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: BORDER,
    elevation: 2,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8,
  },
  iconBox: { width: 44, height: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  statValue: { fontSize: 24, fontWeight: '900', color: TEXT, marginBottom: 2 },
  statLabel: { fontSize: 11, color: MUTED, fontWeight: '600', textTransform: 'uppercase' },

  section: { marginBottom: 32 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: TEXT, marginBottom: 16 },
  
  actionsBox: { flexDirection: 'row', gap: 12 },
  actionBtn: { flex: 1, alignItems: 'center' },
  actionIcon: { width: 60, height: 60, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 8, borderWidth: 1, borderColor: BORDER },
  actionText: { fontSize: 12, fontWeight: '700', color: TEXT, textAlign: 'center' },

  activityCard: {
    backgroundColor: WHITE,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: BORDER,
  },
  activityItem: { flexDirection: 'row', gap: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6', alignItems: 'center' },
  activityDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981' },
  activityTitle: { fontSize: 14, fontWeight: '700', color: TEXT },
  activityTime: { fontSize: 12, color: MUTED, marginTop: 2 },
});
