import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { ServiceRecord } from '../types/records.types';

export function RecordCard({ record }: { record: ServiceRecord }) {
  const { theme } = useUnistyles();

  return (
    <View style={styles.card}>
      {/* Header row */}
      <View style={styles.headerRow}>
        <View style={styles.iconBox}>
          <Ionicons name="document-text-outline" size={22} color={theme.colors.brand} />
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.serviceDate}>
            {new Date(record.serviceDate).toLocaleDateString('en-LK', {
              day: 'numeric', month: 'short', year: 'numeric',
            })}
          </Text>
          {record.technicianName ? (
            <Text style={styles.techName}>{record.technicianName}</Text>
          ) : null}
        </View>
        <View style={styles.costBox}>
          <Text style={styles.cost}>LKR {record.totalCost.toLocaleString()}</Text>
        </View>
      </View>

      {/* Work done */}
      <Text style={styles.workDone} numberOfLines={2}>{record.workDone}</Text>

      {/* Parts replaced */}
      {record.partsReplaced && record.partsReplaced.length > 0 ? (
        <View style={styles.partsRow}>
          <Ionicons name="construct-outline" size={12} color={theme.colors.muted} />
          <Text style={styles.partsText} numberOfLines={1}>
            {record.partsReplaced.join(' · ')}
          </Text>
        </View>
      ) : null}

      {/* Mileage */}
      {record.mileageAtService ? (
        <View style={styles.mileageRow}>
          <Ionicons name="speedometer-outline" size={12} color={theme.colors.muted} />
          <Text style={styles.mileageText}>{record.mileageAtService.toLocaleString()} km</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.brand,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 10 },
  iconBox: {
    width: 40, height: 40, borderRadius: 10,
    backgroundColor: theme.colors.brandSoft,
    alignItems: 'center', justifyContent: 'center',
  },
  headerInfo: { flex: 1 },
  serviceDate: { fontSize: 13, fontWeight: '700', color: theme.colors.text },
  techName: { fontSize: 11, color: theme.colors.muted, fontWeight: '500', marginTop: 2 },
  costBox: {
    backgroundColor: '#ECFDF5', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8,
  },
  cost: { fontSize: 12, fontWeight: '800', color: '#059669' },

  workDone: { fontSize: 14, fontWeight: '600', color: theme.colors.text, lineHeight: 20, marginBottom: 8 },

  partsRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 4 },
  partsText: { flex: 1, fontSize: 12, color: theme.colors.muted, fontWeight: '500' },

  mileageRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  mileageText: { fontSize: 12, color: theme.colors.muted, fontWeight: '500' },
}));
