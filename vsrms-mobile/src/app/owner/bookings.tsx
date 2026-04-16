import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StatusBar } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { FlashList } from '@shopify/flash-list';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet } from 'react-native-unistyles';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { useAuth } from '@/hooks';
import { useWorkshopAppointments } from '@/features/appointments/queries/queries';
import { useUpdateAppointmentStatus } from '@/features/appointments/queries/mutations';
import { useWorkshop } from '@/features/workshops/queries/queries';
import { Appointment } from '@/features/appointments/types/appointments.types';
import { ErrorScreen } from '@/components/feedback/ErrorScreen';
import { EmptyState } from '@/components/ui/EmptyState';

function BookingCard({
  appt,
  onStatusChange
}: {
  appt: Appointment;
  onStatusChange: (id: string, s: string) => void
}) {
  const customerName = appt.userId && typeof appt.userId === 'object' ? appt.userId.fullName : 'Customer';
  const vehicleName = appt.vehicleId && typeof appt.vehicleId === 'object' ? `${appt.vehicleId.make} ${appt.vehicleId.model}` : 'Vehicle';

  return (
    <View style={styles.card}>
      <View style={styles.cardMain}>
        <View style={styles.cardHeader}>
          <View style={styles.infoCol}>
            {appt.workshopId && typeof appt.workshopId === 'object' && (appt.workshopId as any)?.name && (
              <Text style={styles.cardWorkshopName}>{(appt.workshopId as any).name}</Text>
            )}
            <Text style={styles.custName}>{customerName}</Text>
            <Text style={styles.vehName}>{vehicleName}</Text>
          </View>
          <View style={[styles.statusBadge, appt.status === 'confirmed' ? styles.statusConfirmed : styles.statusPending]}>
            <Text style={[styles.statusTabText, appt.status === 'confirmed' ? { color: '#059669' } : { color: '#D97706' }]}>
              {appt.status.toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="calendar-outline" size={14} color="#6B7280" />
            <Text style={styles.metaText}>{new Date(appt.scheduledDate).toLocaleDateString()}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="build-outline" size={14} color="#6B7280" />
            <Text style={styles.metaText}>{appt.serviceType}</Text>
          </View>
        </View>
      </View>

      {appt.status === 'pending' && (
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.declineBtn}
            onPress={() => onStatusChange((appt.id || appt._id)!, 'cancelled')}
          >
            <Text style={styles.declineText}>Decline</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.approveBtn}
            onPress={() => onStatusChange((appt.id || appt._id)!, 'confirmed')}
          >
            <Text style={styles.approveText}>Approve</Text>
          </TouchableOpacity>
        </View>
      )}

      {appt.status === 'confirmed' && (
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => onStatusChange((appt.id || appt._id)!, 'in_progress')}
          >
            <Ionicons name="play-circle" size={18} color="#FFFFFF" />
            <Text style={styles.actionBtnText}>Start Repair Job</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

export default function BookingsScreen() {
  const router = useRouter();
  const { workshopId: paramWorkshopId } = useLocalSearchParams<{ workshopId: string }>();
  const { user } = useAuth();
  const [status, setStatus] = useState<'pending' | 'confirmed' | 'completed' | 'cancelled'>('pending');

  const targetWorkshopId = useMemo(() => paramWorkshopId || 'all', [paramWorkshopId]);
  const { data: workshop } = useWorkshop(targetWorkshopId && targetWorkshopId !== 'all' ? targetWorkshopId : '');

  const { data, isLoading, isError, refetch } = useWorkshopAppointments(targetWorkshopId, status);
  const { mutate: updateStatus } = useUpdateAppointmentStatus();

  // Deduplicate by id — guards against backend returning same appointment twice
  const appointments = useMemo(() => {
    const seen = new Set<string>();
    return (data ?? []).filter(a => {
      const key = (a as any).id || (a as any)._id;
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [data]);

  const handleStatusUpdate = (id: string, s: string) => {
    updateStatus({ id, status: s });
  };

  const workshopName = (!targetWorkshopId || targetWorkshopId === 'all')
    ? 'All Workshops'
    : (workshop && typeof workshop === 'object' ? (workshop as any).name : 'Workshop');

  return (
    <ScreenWrapper bg="#1A1A2E">
      <StatusBar barStyle="light-content" backgroundColor="#1A1A2E" />

      {/* ── DARK TOP SECTION ── */}
      <View style={styles.topSection}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerSub}>Management</Text>
            <Text style={styles.headerTitle} numberOfLines={1}>{workshopName}</Text>
          </View>
          <TouchableOpacity
            style={styles.jobsBtn}
            onPress={() => router.push({ pathname: '/owner/jobs', params: { workshopId: targetWorkshopId === 'all' ? undefined : targetWorkshopId } } as any)}
          >
            <Ionicons name="hammer-outline" size={20} color="#FFFFFF" />
            <Text style={styles.jobsBtnText}>Jobs</Text>
          </TouchableOpacity>
        </View>

        {/* Status Tabs */}
        <View style={styles.tabContainer}>
          {(['pending', 'confirmed', 'completed'] as const).map((s) => (
            <TouchableOpacity
              key={s}
              onPress={() => setStatus(s)}
              style={[styles.tab, status === s && styles.activeTab]}
            >
              <Text style={[styles.tabText, status === s && styles.activeTabText]}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </Text>
              {status === s && <View style={styles.activeLine} />}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.decCircle1} />
        <View style={styles.decCircle2} />
      </View>

      {/* ── WHITE CARD SECTION ── */}
      <View style={styles.mainCard}>
        {isLoading && !data ? (
          <View style={styles.centered}><ActivityIndicator size="large" color="#F56E0F" /></View>
        ) : isError ? (
          <ErrorScreen onRetry={refetch} variant="inline" />
        ) : (
          <FlashList
            data={(data || []) as Appointment[]}
            renderItem={({ item }) => <BookingCard appt={item as Appointment} onStatusChange={handleStatusUpdate} />}
            // @ts-expect-error - FlashList requires estimatedItemSize dynamically
            estimatedItemSize={140}
            onRefresh={refetch}
            refreshing={isLoading}
            keyExtractor={(a: Appointment) => a._id || a.id || Math.random().toString()}
            contentContainerStyle={styles.list}
            ListEmptyComponent={<EmptyState message={`No ${status} bookings found.`} />}
          />
        )}
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create((theme) => ({
  topSection: {
    paddingHorizontal: theme.spacing.screenPadding,
    paddingTop: 16,
    paddingBottom: 60,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#1A1A2E'
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', zIndex: 10, marginBottom: 24 },
  headerSub: {
    fontSize: theme.fonts.sizes.caption,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1
  },
  headerTitle: {
    fontSize: theme.fonts.sizes.pageTitle,
    color: '#FFFFFF',
    fontWeight: '900',
    letterSpacing: -0.5,
    marginTop: 4
  },
  jobsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  jobsBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },

  tabContainer: { flexDirection: 'row', gap: 24, zIndex: 10 },
  tab: { paddingVertical: 8, position: 'relative' },
  tabText: { fontSize: 14, color: 'rgba(255,255,255,0.5)', fontWeight: '700' },
  activeTabText: { color: '#FFFFFF' },
  activeLine: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, backgroundColor: '#F56E0F', borderRadius: 2 },
  activeTab: {},

  decCircle1: { position: 'absolute', width: 140, height: 140, borderRadius: 70, backgroundColor: 'rgba(245,110,15,0.12)', top: -30, right: -20 },
  decCircle2: { position: 'absolute', width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(245,110,15,0.06)', bottom: 10, right: 90 },

  mainCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: theme.spacing.cardOverlap,
    flex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 16
  },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: {
    paddingHorizontal: theme.spacing.screenPadding,
    paddingTop: 24,
    paddingBottom: 130
  },

  card: { backgroundColor: '#FFFFFF', borderRadius: 24, marginBottom: 16, borderWidth: 1, borderColor: '#F3F4F6', overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  cardMain: { padding: 20 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
  infoCol: { flex: 1, paddingRight: 12 },
  custName: { fontSize: 17, fontWeight: '900', color: '#1A1A2E' },
  cardWorkshopName: {
    fontSize: 11,
    fontWeight: '800',
    color: '#F56E0F',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6
  },
  vehName: { fontSize: 14, color: '#6B7280', fontWeight: '600', marginTop: 4 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  statusConfirmed: { backgroundColor: '#ECFDF5' },
  statusPending: { backgroundColor: '#FFFBEB' },
  statusTabText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },

  metaRow: { flexDirection: 'row', gap: 20, marginTop: 4 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontSize: 13, fontWeight: '700', color: '#4B5563' },

  actionRow: { flexDirection: 'row', gap: 12, paddingHorizontal: 20, paddingBottom: 20 },
  declineBtn: { flex: 1, paddingVertical: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FEF2F2', borderRadius: 14 },
  approveBtn: { flex: 1, paddingVertical: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F56E0F', borderRadius: 14, shadowColor: '#F56E0F', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 4 },
  declineText: { fontSize: 14, fontWeight: '800', color: '#DC2626' },
  approveText: { fontSize: 14, fontWeight: '800', color: '#FFFFFF' },
  
  actionContainer: {
    flexDirection: 'row',
    marginTop: 4,
    borderTopWidth: 1.5,
    borderTopColor: '#F3F4F6',
    paddingTop: 14,
    paddingBottom: 4,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    borderRadius: 14,
    gap: 8,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
}));
