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

export default function JobTrackerScreen() {
  const router = useRouter();

  const jobs = [
    { id: 'j1', vehicle: 'Honda Civic', license: 'CBA-1234', status: 'In Progress', progress: 0.6, technician: 'Amal P.' },
    { id: 'j2', vehicle: 'Toyota Prius', license: 'CAA-9876', status: 'Waiting for Parts', progress: 0.2, technician: 'Bandara K.' },
    { id: 'j3', vehicle: 'Nissan Leaf', license: 'CAD-1122', status: 'Ready for Pickup', progress: 1.0, technician: 'Amal P.' },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={BG} />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={TEXT} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Job Status Tracker</Text>
        <TouchableOpacity style={styles.filterBtn}>
          <Ionicons name="filter-outline" size={20} color={TEXT} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {jobs.map((job) => (
          <View key={job.id} style={styles.jobCard}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.vehicleTitle}>{job.vehicle}</Text>
                <Text style={styles.licenseText}>{job.license}</Text>
              </View>
              <View style={[
                styles.statusBadge,
                job.status === 'Ready for Pickup' ? styles.statusSuccess : (job.status === 'In Progress' ? styles.statusInfo : styles.statusWarning)
              ]}>
                <Text style={[
                  styles.statusText,
                  job.status === 'Ready for Pickup' ? styles.statusTextSuccess : (job.status === 'In Progress' ? styles.statusTextInfo : styles.statusTextWarning)
                ]}>{job.status}</Text>
              </View>
            </View>

            <View style={styles.progressSection}>
              <View style={styles.progressTrack}>
                <View style={[styles.progressBar, { width: `${job.progress * 100}%`, backgroundColor: job.status === 'Ready for Pickup' ? '#10B981' : BRAND }]} />
              </View>
              <Text style={styles.progressPercent}>{Math.round(job.progress * 100)}% Complete</Text>
            </View>

            <View style={styles.footer}>
              <View style={styles.techBox}>
                <Ionicons name="person-outline" size={14} color={MUTED} />
                <Text style={styles.techText}>Technician: {job.technician}</Text>
              </View>
              <TouchableOpacity style={styles.updateBtn}>
                <Text style={styles.updateText}>Update Status</Text>
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
  filterBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: BORDER },

  scroll: { padding: 20, paddingBottom: 100 },
  
  jobCard: {
    backgroundColor: WHITE,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: BORDER,
    marginBottom: 16,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  vehicleTitle: { fontSize: 17, fontWeight: '900', color: TEXT, letterSpacing: -0.3 },
  licenseText: { fontSize: 13, color: MUTED, fontWeight: '600', marginTop: 2 },
  
  statusBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  statusSuccess: { backgroundColor: '#ECFDF5' },
  statusInfo: { backgroundColor: '#EFF6FF' },
  statusWarning: { backgroundColor: '#FFFBEB' },
  
  statusText: { fontSize: 11, fontWeight: '800' },
  statusTextSuccess: { color: '#047857' },
  statusTextInfo: { color: '#1D4ED8' },
  statusTextWarning: { color: '#D97706' },

  progressSection: { marginBottom: 20 },
  progressTrack: { height: 8, backgroundColor: '#F3F4F6', borderRadius: 4, overflow: 'hidden', marginBottom: 8 },
  progressBar: { height: '100%' },
  progressPercent: { fontSize: 12, fontWeight: '700', color: MUTED, textAlign: 'right' },

  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 16 },
  techBox: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  techText: { fontSize: 13, color: MUTED, fontWeight: '500' },
  updateBtn: { backgroundColor: '#F9FAFB', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: BORDER },
  updateText: { fontSize: 12, fontWeight: '700', color: TEXT },
});
