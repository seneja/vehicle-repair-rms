import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet } from 'react-native-unistyles';
import { useRouter, useLocalSearchParams } from 'expo-router';

import { useVehicles } from '@/features/vehicles/queries/queries';
import { useWorkshops } from '@/features/workshops/queries/queries';
import { useCreateAppointment } from '../queries/mutations';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { ErrorScreen } from '@/components/feedback/ErrorScreen';

const SERVICE_TYPES = [
  'Oil Change',
  'Brake Service',
  'Tyre Rotation',
  'Full Service',
  'Engine Diagnostic',
  'Wheel Alignment',
  'AC Service',
  'Battery Replacement',
  'Other',
];

export function BookAppointmentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ workshopId?: string }>();

  const { data: vehicles = [], isLoading: vLoading, isError: vError, refetch: vRefetch } = useVehicles();
  const { data: workshops = [], isLoading: wLoading, isError: wError, refetch: wRefetch } = useWorkshops();

  const [vehicleId, setVehicleId]       = useState('');
  const [workshopId, setWorkshopId]     = useState(params.workshopId ?? '');
  const [serviceType, setServiceType]   = useState('');
  const [customService, setCustomService] = useState('');
  // dateStr in YYYY-MM-DD format
  const tomorrow = new Date(Date.now() + 86400000);
  const pad = (n: number) => String(n).padStart(2, '0');
  const [dateStr, setDateStr]           = useState(
    `${tomorrow.getFullYear()}-${pad(tomorrow.getMonth() + 1)}-${pad(tomorrow.getDate())}`
  );
  const [notes, setNotes]               = useState('');
  const [errors, setErrors]             = useState<Record<string, string>>({});

  const { mutate: book, isPending } = useCreateAppointment();

  const validate = () => {
    const e: Record<string, string> = {};
    if (!vehicleId)   e.vehicleId   = 'Select a vehicle';
    if (!workshopId)  e.workshopId  = 'Select a workshop';
    if (!serviceType) e.serviceType = 'Select a service type';
    const parsedDate = new Date(dateStr);
    if (!dateStr || isNaN(parsedDate.getTime())) e.date = 'Enter a valid date (YYYY-MM-DD)';
    else if (parsedDate <= new Date()) e.date = 'Date must be in the future';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleBook = () => {
    if (!validate()) return;
    const finalService = serviceType === 'Other' ? customService.trim() : serviceType;
    if (!finalService) { setErrors(e => ({ ...e, serviceType: 'Describe the service' })); return; }

    book(
      { vehicleId, workshopId, serviceType: finalService, scheduledDate: new Date(dateStr).toISOString(), notes: notes.trim() || undefined },
      { onSuccess: () => router.back() },
    );
  };

  if (vLoading || wLoading) return (
    <ScreenWrapper><View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator size="large" color="#F56E0F" /></View></ScreenWrapper>
  );
  if (vError)   return <ErrorScreen onRetry={vRefetch} />;
  if (wError)   return <ErrorScreen onRetry={wRefetch} />;

  return (
    <ScreenWrapper>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color="#1A1A2E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Book Appointment</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* VEHICLE */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Select Vehicle *</Text>
          {vehicles.length === 0
            ? <Text style={styles.emptyHint}>No vehicles registered. Add one first.</Text>
            : vehicles.map(v => (
              <TouchableOpacity
                key={v._id}
                style={[styles.selectCard, vehicleId === v._id && styles.selectCardActive]}
                onPress={() => setVehicleId(v._id)}
                activeOpacity={0.8}
              >
                <View style={styles.selectCardIcon}>
                  <Ionicons name="car-sport-outline" size={20} color={vehicleId === v._id ? '#F56E0F' : '#6B7280'} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.selectCardTitle, vehicleId === v._id && styles.selectCardTitleActive]}>
                    {v.make} {v.model} ({v.year})
                  </Text>
                  <Text style={styles.selectCardSub}>{v.registrationNo}</Text>
                </View>
                {vehicleId === v._id && <Ionicons name="checkmark-circle" size={20} color="#F56E0F" />}
              </TouchableOpacity>
            ))
          }
          {errors.vehicleId && <Text style={styles.errorText}>{errors.vehicleId}</Text>}
        </View>

        {/* WORKSHOP */}
        {!params.workshopId && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Select Workshop *</Text>
            {workshops.map(w => (
              <TouchableOpacity
                key={w._id ?? w.id}
                style={[styles.selectCard, workshopId === (w._id ?? w.id) && styles.selectCardActive]}
                onPress={() => setWorkshopId(w._id ?? w.id!)}
                activeOpacity={0.8}
              >
                <View style={styles.selectCardIcon}>
                  <Ionicons name="business-outline" size={20} color={workshopId === (w._id ?? w.id) ? '#F56E0F' : '#6B7280'} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.selectCardTitle, workshopId === (w._id ?? w.id) && styles.selectCardTitleActive]}>
                    {w.name}
                  </Text>
                  <Text style={styles.selectCardSub}>{w.district} · ⭐ {w.averageRating.toFixed(1)}</Text>
                </View>
                {workshopId === (w._id ?? w.id) && <Ionicons name="checkmark-circle" size={20} color="#F56E0F" />}
              </TouchableOpacity>
            ))}
            {errors.workshopId && <Text style={styles.errorText}>{errors.workshopId}</Text>}
          </View>
        )}

        {/* SERVICE TYPE */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Service Type *</Text>
          <View style={styles.chipGrid}>
            {SERVICE_TYPES.map(s => (
              <TouchableOpacity
                key={s}
                style={[styles.chip, serviceType === s && styles.chipActive]}
                onPress={() => setServiceType(s)}
                activeOpacity={0.8}
              >
                <Text style={[styles.chipText, serviceType === s && styles.chipTextActive]}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {serviceType === 'Other' && (
            <TextInput
              style={styles.input}
              placeholder="Describe the service..."
              placeholderTextColor="#9CA3AF"
              value={customService}
              onChangeText={setCustomService}
            />
          )}
          {errors.serviceType && <Text style={styles.errorText}>{errors.serviceType}</Text>}
        </View>

        {/* DATE */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Preferred Date *</Text>
          <View style={styles.dateInputRow}>
            <Ionicons name="calendar-outline" size={18} color="#F56E0F" />
            <TextInput
              style={styles.dateInput}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#9CA3AF"
              value={dateStr}
              onChangeText={setDateStr}
              keyboardType="numbers-and-punctuation"
              returnKeyType="done"
              maxLength={10}
            />
          </View>
          <Text style={styles.dateHint}>Enter date in YYYY-MM-DD format (must be tomorrow or later)</Text>
          {errors.date && <Text style={styles.errorText}>{errors.date}</Text>}
        </View>

        {/* NOTES */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Notes <Text style={styles.optional}>(optional)</Text></Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Any specific concerns or instructions..."
            placeholderTextColor="#9CA3AF"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* SUBMIT */}
        <TouchableOpacity
          style={[styles.bookBtn, isPending && styles.bookBtnDisabled]}
          onPress={handleBook}
          disabled={isPending}
          activeOpacity={0.85}
        >
          {isPending
            ? <ActivityIndicator color="#FFFFFF" />
            : <>
                <Ionicons name="calendar-outline" size={20} color="#FFFFFF" />
                <Text style={styles.bookBtnText}>Confirm Booking</Text>
              </>
          }
        </TouchableOpacity>

      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create(() => ({
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16,
    backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB',
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#1A1A2E' },

  scroll: { padding: 20, paddingBottom: 60 },

  section: { marginBottom: 28 },
  sectionLabel: { fontSize: 14, fontWeight: '800', color: '#1A1A2E', marginBottom: 12 },
  optional: { fontWeight: '500', color: '#9CA3AF' },
  emptyHint: { fontSize: 14, color: '#9CA3AF', fontStyle: 'italic' },

  selectCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: '#FFFFFF', borderRadius: 14, padding: 14, marginBottom: 8,
    borderWidth: 1.5, borderColor: '#E5E7EB',
  },
  selectCardActive: { borderColor: '#F56E0F', backgroundColor: '#FFF7ED' },
  selectCardIcon: {
    width: 40, height: 40, borderRadius: 10, backgroundColor: '#F9FAFB',
    alignItems: 'center', justifyContent: 'center',
  },
  selectCardTitle: { fontSize: 15, fontWeight: '700', color: '#1A1A2E' },
  selectCardTitleActive: { color: '#F56E0F' },
  selectCardSub: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },

  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10,
    borderWidth: 1.5, borderColor: '#E5E7EB', backgroundColor: '#FFFFFF',
  },
  chipActive: { borderColor: '#F56E0F', backgroundColor: '#FFF7ED' },
  chipText: { fontSize: 13, fontWeight: '700', color: '#6B7280' },
  chipTextActive: { color: '#F56E0F' },

  dateInputRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16,
    borderWidth: 1.5, borderColor: '#E5E7EB',
  },
  dateInput: { flex: 1, fontSize: 15, fontWeight: '600', color: '#1A1A2E' },
  dateHint: { fontSize: 11, color: '#9CA3AF', marginTop: 6, fontStyle: 'italic' },

  input: {
    borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 14,
    padding: 14, fontSize: 14, color: '#1A1A2E', backgroundColor: '#FFFFFF',
  },
  textArea: { minHeight: 90, textAlignVertical: 'top' },

  errorText: { fontSize: 12, color: '#DC2626', fontWeight: '600', marginTop: 4 },

  bookBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: '#F56E0F', borderRadius: 16, height: 58,
    shadowColor: '#F56E0F', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 12, elevation: 8,
  },
  bookBtnDisabled: { opacity: 0.65 },
  bookBtnText: { color: '#FFFFFF', fontSize: 17, fontWeight: '800' },
}));
