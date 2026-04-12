import React from 'react';
import { View, Text, ActivityIndicator, StatusBar } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet } from 'react-native-unistyles';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { useAuth } from '@/hooks';
import { useWorkshopRecords } from '@/features/records/queries/queries';
import { ErrorScreen } from '@/components/feedback/ErrorScreen';
import { EmptyState } from '@/components/ui/EmptyState';
import { ServiceRecord } from '@/features/records/types/records.types';

function RecordRow({ record }: { record: ServiceRecord }) {
  const vehicle = typeof record.vehicleId === 'object' ? record.vehicleId as any : null;
  const appt    = typeof record.appointmentId === 'object' ? record.appointmentId as any : null;
  const dateStr = new Date(record.serviceDate).toLocaleDateString(undefined, {
    day: 'numeric', month: 'short', year: 'numeric',
  });

  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.iconBox}>
          <Ionicons name="document-text-outline" size={22} color="#F56E0F" />
        </View>
        <View style={styles.cardMain}>
          <Text style={styles.vehicleName} numberOfLines={1}>
            {vehicle ? `${vehicle.make} ${vehicle.model}` : 'Vehicle'}
          </Text>
          <Text style={styles.vehicleReg}>{vehicle?.registrationNo ?? ''}</Text>
        </View>
        <View style={styles.dateBadge}>
          <Text style={styles.dateText}>{dateStr}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <Text style={styles.workDone} numberOfLines={2}>{record.workDone}</Text>

      <View style={styles.metaRow}>
        {record.technicianName ? (
          <View style={styles.metaChip}>
            <Ionicons name="person-outline" size={11} color="#6B7280" />
            <Text style={styles.metaChipText}>{record.technicianName}</Text>
          </View>
        ) : null}
        {appt?.serviceType ? (
          <View style={styles.metaChip}>
            <Ionicons name="construct-outline" size={11} color="#6B7280" />
            <Text style={styles.metaChipText}>{appt.serviceType}</Text>
          </View>
        ) : null}
        <View style={[styles.metaChip, styles.costChip]}>
          <Text style={styles.costText}>LKR {record.totalCost?.toLocaleString()}</Text>
        </View>
      </View>

      {record.partsReplaced?.length > 0 ? (
        <View style={styles.partsRow}>
          {record.partsReplaced.slice(0, 3).map((p, i) => (
            <View key={i} style={styles.partChip}>
              <Text style={styles.partText}>{p}</Text>
            </View>
          ))}
          {record.partsReplaced.length > 3 ? (
            <View style={styles.partChip}>
              <Text style={styles.partText}>+{record.partsReplaced.length - 3} more</Text>
            </View>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

export default function OwnerLogsScreen() {
  const { user } = useAuth();
  const workshopId = user?.workshopId as string | undefined;
  const { data, isLoading, isError, refetch } = useWorkshopRecords(workshopId ?? '');

  return (
    <ScreenWrapper bg="#1A1A2E">
      <StatusBar barStyle="light-content" backgroundColor="#1A1A2E" />

      {/* ── DARK TOP SECTION ── */}
      <View style={styles.topSection}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerSub}>Workshop History</Text>
            <Text style={styles.headerTitle}>Service Logs</Text>
          </View>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{data?.total ?? 0}</Text>
          </View>
        </View>
        <View style={styles.decCircle1} />
        <View style={styles.decCircle2} />
      </View>

      {/* ── WHITE CARD SECTION ── */}
      <View style={[styles.mainCard, { overflow: 'hidden' }]}>
        {isLoading && !data ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color="#F56E0F" />
          </View>
        ) : isError ? (
          <ErrorScreen onRetry={refetch} variant="inline" />
        ) : (
          <FlashList
            data={(data?.data ?? []) as ServiceRecord[]}
            renderItem={({ item }) => <RecordRow record={item as ServiceRecord} />}
            estimatedItemSize={180}
            onRefresh={refetch}
            refreshing={isLoading}
            keyExtractor={(r: ServiceRecord) => r._id || r.id || Math.random().toString()}
            contentContainerStyle={styles.list}
            ListEmptyComponent={<EmptyState message="No service records yet for this workshop." />}
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
    paddingBottom: theme.spacing.headerBottom,
    position: 'relative',
    overflow: 'hidden',
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', zIndex: 10 },
  headerSub: {
    fontSize: theme.fonts.sizes.caption,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  headerTitle: {
    fontSize: theme.fonts.sizes.pageTitle,
    color: '#FFFFFF',
    fontWeight: '900',
    letterSpacing: -0.5,
    marginTop: 4,
  },
  countBadge: {
    width: 48, height: 48, borderRadius: 14,
    backgroundColor: 'rgba(245,110,15,0.2)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#F56E0F',
  },
  countText: { fontSize: 18, fontWeight: '900', color: '#F56E0F' },

  decCircle1: { position: 'absolute', width: 130, height: 130, borderRadius: 65, backgroundColor: 'rgba(245,110,15,0.13)', top: -25, right: -25 },
  decCircle2: { position: 'absolute', width: 70, height: 70, borderRadius: 35, backgroundColor: 'rgba(245,110,15,0.08)', bottom: 10, right: 90 },

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
    elevation: 16,
  },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { paddingHorizontal: theme.spacing.screenPadding, paddingTop: 24, paddingBottom: 130 },

  card: {
    backgroundColor: '#FFFFFF', borderRadius: 24, padding: 18, marginBottom: 16,
    borderWidth: 1.5, borderColor: '#F3F4F6',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 2,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  iconBox: { width: 46, height: 46, borderRadius: 13, backgroundColor: '#FFF7ED', alignItems: 'center', justifyContent: 'center' },
  cardMain: { flex: 1 },
  vehicleName: { fontSize: 16, fontWeight: '900', color: '#1A1A2E' },
  vehicleReg: { fontSize: 12, color: '#9CA3AF', fontWeight: '700', marginTop: 2, letterSpacing: 0.5 },
  dateBadge: { backgroundColor: '#F3F4F6', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  dateText: { fontSize: 11, fontWeight: '800', color: '#6B7280' },

  divider: { height: 1.5, backgroundColor: '#F9FAFB', marginBottom: 12 },
  workDone: { fontSize: 14, color: '#374151', fontWeight: '600', lineHeight: 20, marginBottom: 12 },

  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 10 },
  metaChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F9FAFB', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  metaChipText: { fontSize: 11, fontWeight: '700', color: '#6B7280' },
  costChip: { backgroundColor: '#ECFDF5', marginLeft: 'auto' },
  costText: { fontSize: 12, fontWeight: '900', color: '#059669' },

  partsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  partChip: { backgroundColor: '#EFF6FF', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  partText: { fontSize: 10, fontWeight: '700', color: '#2563EB' },
}));
