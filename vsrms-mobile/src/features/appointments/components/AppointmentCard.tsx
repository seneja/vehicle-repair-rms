import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet } from 'react-native-unistyles';
import { Appointment, AppointmentStatus } from '../types/appointments.types';

const STATUS_CONFIG: Record<AppointmentStatus, { label: string; bg: string; text: string; accent: string }> = {
  pending:     { label: 'Pending',     bg: '#FFFBEB', text: '#D97706', accent: '#F59E0B' },
  confirmed:   { label: 'Confirmed',   bg: '#EFF6FF', text: '#2563EB', accent: '#3B82F6' },
  in_progress: { label: 'In Progress', bg: '#FFF7ED', text: '#EA580C', accent: '#F56E0F' },
  completed:   { label: 'Completed',   bg: '#ECFDF5', text: '#059669', accent: '#10B981' },
  cancelled:   { label: 'Cancelled',   bg: '#FEF2F2', text: '#DC2626', accent: '#EF4444' },
};

function getVehicleLabel(vehicleId: Appointment['vehicleId']): string {
  if (typeof vehicleId === 'object' && vehicleId) {
    return `${vehicleId.make} ${vehicleId.model} · ${vehicleId.registrationNo}`;
  }
  return 'Vehicle';
}

function getWorkshopLabel(workshopId: Appointment['workshopId']): string {
  if (typeof workshopId === 'object' && workshopId) {
    return workshopId.name;
  }
  return 'Workshop';
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-LK', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}

export function AppointmentCard({ appointment }: { appointment: Appointment }) {
  const status = appointment.status ?? 'pending';
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;

  return (
    <View style={[styles.card, { borderLeftColor: cfg.accent }]}>
      {/* DATE + STATUS */}
      <View style={styles.cardHeader}>
        <View style={styles.dateBox}>
          <Ionicons name="calendar-outline" size={13} color="#6B7280" />
          <Text style={styles.dateText}>{formatDate(appointment.scheduledDate)}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
          <View style={[styles.statusDot, { backgroundColor: cfg.accent }]} />
          <Text style={[styles.statusText, { color: cfg.text }]}>{cfg.label}</Text>
        </View>
      </View>

      {/* SERVICE TYPE */}
      <Text style={styles.serviceType}>{appointment.serviceType}</Text>

      {/* VEHICLE */}
      <View style={styles.infoRow}>
        <Ionicons name="car-outline" size={15} color="#6B7280" />
        <Text style={styles.infoText}>{getVehicleLabel(appointment.vehicleId)}</Text>
      </View>

      {/* WORKSHOP */}
      <View style={styles.infoRow}>
        <Ionicons name="business-outline" size={15} color="#6B7280" />
        <Text style={styles.infoText}>{getWorkshopLabel(appointment.workshopId)}</Text>
      </View>

      {appointment.notes ? (
        <View style={styles.notesBox}>
          <Ionicons name="document-text-outline" size={13} color="#9CA3AF" />
          <Text style={styles.notesText}>{appointment.notes}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create(() => ({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10,
  },
  dateBox: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  dateText: { fontSize: 12, fontWeight: '600', color: '#6B7280' },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.3 },

  serviceType: { fontSize: 16, fontWeight: '800', color: '#1A1A2E', marginBottom: 10, letterSpacing: -0.3 },

  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 5 },
  infoText: { fontSize: 13, color: '#6B7280', fontWeight: '500', flex: 1 },

  notesBox: {
    flexDirection: 'row', gap: 8, alignItems: 'flex-start',
    marginTop: 10, backgroundColor: '#F9FAFB', borderRadius: 10, padding: 10,
  },
  notesText: { flex: 1, fontSize: 12, color: '#6B7280', fontStyle: 'italic', lineHeight: 18 },
}));
