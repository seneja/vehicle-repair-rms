import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { useVehicle } from '../queries/queries';
import { useVehicleRecords } from '@/features/records/queries/queries';
import { ServiceRecord } from '@/features/records/types/records.types';

const TYPE_ICON: Record<string, string> = {
  car:        'car-outline',
  motorcycle: 'bicycle-outline',
  tuk:        'car-outline',
  van:        'bus-outline',
};

export function VehicleDetailScreen({ id }: { id: string }) {
  const router = useRouter();
  const { theme } = useUnistyles();

  const { data: vehicle, isLoading: vLoading } = useVehicle(id);
  const { data: records, isLoading: rLoading } = useVehicleRecords(id);

  if (vLoading) return (
    <ScreenWrapper>
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.brand} />
      </View>
    </ScreenWrapper>
  );

  if (!vehicle) return (
    <ScreenWrapper>
      <View style={styles.centered}>
        <Ionicons name="alert-circle-outline" size={40} color={theme.colors.muted} />
        <Text style={styles.notFoundText}>Vehicle not found</Text>
      </View>
    </ScreenWrapper>
  );

  const iconName = TYPE_ICON[vehicle.vehicleType] ?? 'car-outline';

  return (
    <ScreenWrapper>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Vehicle Details</Text>
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => router.push(`/tabs/vehicles/edit/${id}` as any)}
          activeOpacity={0.7}
        >
          <Ionicons name="create-outline" size={20} color={theme.colors.brand} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* VEHICLE INFO CARD */}
        <View style={styles.infoCard}>
          <View style={styles.cardTop}>
            <View style={styles.iconBox}>
              <Ionicons name={iconName as any} size={30} color={theme.colors.text} />
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.vehicleName}>{vehicle.make} {vehicle.model}</Text>
              <Text style={styles.vehicleReg}>{vehicle.registrationNo}</Text>
            </View>
            <View style={styles.typeBadge}>
              <Text style={styles.typeBadgeText}>{vehicle.vehicleType.toUpperCase()}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.metaGrid}>
            <View style={styles.metaCell}>
              <Text style={styles.metaLabel}>Year</Text>
              <Text style={styles.metaValue}>{vehicle.year}</Text>
            </View>
            <View style={[styles.metaCell, styles.metaCellBorder]}>
              <Text style={styles.metaLabel}>Mileage</Text>
              <Text style={styles.metaValue}>
                {vehicle.mileage ? `${vehicle.mileage.toLocaleString()} km` : 'N/A'}
              </Text>
            </View>
            <View style={styles.metaCell}>
              <Text style={styles.metaLabel}>Added</Text>
              <Text style={styles.metaValue}>
                {vehicle.createdAt
                  ? new Date(vehicle.createdAt).toLocaleDateString('en-LK', { month: 'short', year: 'numeric' })
                  : 'N/A'}
              </Text>
            </View>
          </View>
        </View>

        {/* SERVICE HISTORY */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Service History</Text>

          {rLoading ? (
            <ActivityIndicator color={theme.colors.brand} style={{ marginTop: 12 }} />
          ) : !records || records.length === 0 ? (
            <View style={styles.emptyHistory}>
              <Ionicons name="document-text-outline" size={32} color={theme.colors.muted} />
              <Text style={styles.emptyHistoryText}>No service records yet</Text>
            </View>
          ) : (
            <View style={styles.timeline}>
              {(records as ServiceRecord[]).map((rec, idx) => (
                <View key={rec._id} style={styles.timelineItem}>
                  <View style={styles.timelineLeft}>
                    <View style={styles.timelineDot} />
                    {idx < records.length - 1 && <View style={styles.timelineLine} />}
                  </View>
                  <View style={styles.timelineContent}>
                    <Text style={styles.historyDate}>
                      {new Date(rec.serviceDate).toLocaleDateString('en-LK', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })}
                    </Text>
                    <View style={styles.historyCard}>
                      <Text style={styles.historyTitle}>{rec.workDone}</Text>
                      {rec.technicianName ? (
                        <View style={styles.techRow}>
                          <Ionicons name="person-outline" size={12} color={theme.colors.muted} />
                          <Text style={styles.historyGarage}>{rec.technicianName}</Text>
                        </View>
                      ) : null}
                      {rec.mileageAtService ? (
                        <View style={styles.techRow}>
                          <Ionicons name="speedometer-outline" size={12} color={theme.colors.muted} />
                          <Text style={styles.historyGarage}>{rec.mileageAtService.toLocaleString()} km</Text>
                        </View>
                      ) : null}
                      {rec.partsReplaced && rec.partsReplaced.length > 0 ? (
                        <View style={styles.partsWrap}>
                          {rec.partsReplaced.map(p => (
                            <View key={p} style={styles.partChip}>
                              <Text style={styles.partChipText}>{p}</Text>
                            </View>
                          ))}
                        </View>
                      ) : null}
                      <View style={styles.costRow}>
                        <View style={styles.historyDivider} />
                        <Text style={styles.historyCost}>LKR {rec.totalCost.toLocaleString()}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create((theme) => ({
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  notFoundText: { fontSize: 16, color: theme.colors.muted, fontWeight: '600' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backBtn: {
    width: 40, height: 40, alignItems: 'center', justifyContent: 'center',
    borderRadius: 12, backgroundColor: theme.colors.background,
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: theme.colors.text },
  editBtn: {
    width: 40, height: 40, alignItems: 'center', justifyContent: 'center',
    borderRadius: 12, backgroundColor: theme.colors.brandSoft,
  },

  scroll: { padding: theme.spacing.md, paddingBottom: 100 },

  infoCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.xl,
    padding: theme.spacing.lg,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  iconBox: {
    width: 56, height: 56, borderRadius: theme.radii.md,
    backgroundColor: theme.colors.background, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: theme.colors.border,
  },
  infoTextContainer: { flex: 1 },
  vehicleName: { fontSize: 20, fontWeight: '900', color: theme.colors.text, letterSpacing: -0.5 },
  vehicleReg: { fontSize: 14, color: theme.colors.muted, fontWeight: '600', marginTop: 2 },
  typeBadge: {
    backgroundColor: theme.colors.brandSoft,
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: theme.radii.md,
  },
  typeBadgeText: { fontSize: 10, fontWeight: '800', color: theme.colors.brand },

  divider: { height: 1, backgroundColor: theme.colors.border, marginVertical: theme.spacing.md },

  metaGrid: { flexDirection: 'row' },
  metaCell: { flex: 1, paddingHorizontal: 4, alignItems: 'center' },
  metaCellBorder: {
    borderLeftWidth: 1, borderRightWidth: 1, borderColor: theme.colors.border,
  },
  metaLabel: {
    fontSize: 10, color: theme.colors.muted, fontWeight: '700',
    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4, textAlign: 'center',
  },
  metaValue: { fontSize: 14, color: theme.colors.text, fontWeight: '700', textAlign: 'center' },

  section: { marginBottom: theme.spacing.md },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: theme.colors.text, marginBottom: theme.spacing.md },

  emptyHistory: {
    alignItems: 'center', paddingVertical: 32, gap: 10,
    backgroundColor: theme.colors.surface, borderRadius: theme.radii.lg,
    borderWidth: 1, borderColor: theme.colors.border,
  },
  emptyHistoryText: { fontSize: 14, color: theme.colors.muted, fontWeight: '500' },

  timeline: { paddingLeft: 4 },
  timelineItem: { flexDirection: 'row', marginBottom: 20 },
  timelineLeft: { alignItems: 'center', width: 24, marginRight: 14 },
  timelineDot: {
    width: 12, height: 12, borderRadius: 6,
    backgroundColor: theme.colors.brand, zIndex: 10,
    borderWidth: 2, borderColor: theme.colors.brandSoft,
  },
  timelineLine: { width: 2, flex: 1, backgroundColor: theme.colors.border, marginTop: 4 },

  timelineContent: { flex: 1, marginTop: -2 },
  historyDate: {
    fontSize: 11, fontWeight: '700', color: theme.colors.muted,
    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8,
  },
  historyCard: {
    backgroundColor: theme.colors.surface, borderRadius: theme.radii.lg,
    padding: theme.spacing.md, borderWidth: 1, borderColor: theme.colors.border,
  },
  historyTitle: { fontSize: 14, fontWeight: '800', color: theme.colors.text, marginBottom: 6 },
  techRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 4 },
  historyGarage: { fontSize: 12, color: theme.colors.muted, fontWeight: '500' },
  partsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6, marginBottom: 6 },
  partChip: {
    backgroundColor: theme.colors.background, paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 6, borderWidth: 1, borderColor: theme.colors.border,
  },
  partChipText: { fontSize: 11, color: theme.colors.text, fontWeight: '600' },
  costRow: {},
  historyDivider: { height: 1, backgroundColor: theme.colors.border, marginVertical: 8 },
  historyCost: { fontSize: 13, fontWeight: '800', color: theme.colors.brand },
}));
