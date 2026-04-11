import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ActivityIndicator, Alert, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet } from 'react-native-unistyles';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { useCreateVehicle } from '../queries/mutations';
import { handleApiError } from '@/services/error.handler';

const VEHICLE_TYPES = [
  { value: 'car',        label: 'Car',        icon: 'car-outline' },
  { value: 'motorcycle', label: 'Motorcycle',  icon: 'bicycle-outline' },
  { value: 'tuk',        label: 'Tuk Tuk',    icon: 'car-outline' },
  { value: 'van',        label: 'Van / SUV',  icon: 'bus-outline' },
] as const;

export type VehicleType = (typeof VEHICLE_TYPES)[number]['value'];
const CURRENT_YEAR = new Date().getFullYear();

export default function AddVehicleScreen() {
  const router = useRouter();
  const { mutate: create, isPending } = useCreateVehicle();

  const [form, setForm] = useState({
    registrationNo: '',
    make: '',
    model: '',
    year: '',
    vehicleType: 'car' as VehicleType,
    mileage: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const setField = (key: keyof typeof form) => (val: string) => {
    setForm((f) => ({ ...f, [key]: val }));
    if (errors[key]) setErrors(e => { const n = { ...e }; delete n[key]; return n; });
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.registrationNo.trim()) e.registrationNo = 'Registration number is required';
    if (!form.make.trim())           e.make = 'Make is required';
    if (!form.model.trim())          e.model = 'Model is required';
    const year = parseInt(form.year);
    if (!form.year || isNaN(year))   e.year = 'Valid year is required';
    else if (year < 1990 || year > CURRENT_YEAR + 1) e.year = `Year must be 1990–${CURRENT_YEAR + 1}`;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    create(
      {
        registrationNo: form.registrationNo.trim().toUpperCase(),
        make: form.make.trim(),
        model: form.model.trim(),
        year: parseInt(form.year),
        vehicleType: form.vehicleType,
        mileage: form.mileage ? parseInt(form.mileage, 10) : undefined,
      },
      {
        onSuccess: () => router.back(),
        onError: (err) => Alert.alert('Error', handleApiError(err)),
      }
    );
  };

  return (
    <ScreenWrapper>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={24} color="#1A1A2E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Vehicle</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          {/* VEHICLE TYPE */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Vehicle Type</Text>
            <View style={styles.typeGrid}>
              {VEHICLE_TYPES.map((t) => (
                <TouchableOpacity
                  key={t.value}
                  style={[styles.typeCard, form.vehicleType === t.value && styles.typeCardActive]}
                  onPress={() => setForm(f => ({ ...f, vehicleType: t.value }))}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={t.icon as any}
                    size={22}
                    color={form.vehicleType === t.value ? '#F56E0F' : '#6B7280'}
                  />
                  <Text style={[styles.typeLabel, form.vehicleType === t.value && styles.typeLabelActive]}>
                    {t.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* FORM FIELDS */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Vehicle Details</Text>
            <View style={styles.card}>

              <FieldInput
                label="Registration No."
                placeholder="WP-CAB-1234"
                value={form.registrationNo}
                onChangeText={setField('registrationNo')}
                autoCapitalize="characters"
                error={errors.registrationNo}
              />

              <View style={styles.rowFields}>
                <View style={{ flex: 1 }}>
                  <FieldInput
                    label="Make"
                    placeholder="Toyota"
                    value={form.make}
                    onChangeText={setField('make')}
                    error={errors.make}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <FieldInput
                    label="Model"
                    placeholder="Premio"
                    value={form.model}
                    onChangeText={setField('model')}
                    error={errors.model}
                  />
                </View>
              </View>

              <View style={styles.rowFields}>
                <View style={{ flex: 1 }}>
                  <FieldInput
                    label="Year"
                    placeholder="2020"
                    value={form.year}
                    onChangeText={setField('year')}
                    keyboardType="numeric"
                    maxLength={4}
                    error={errors.year}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <FieldInput
                    label="Mileage (km)"
                    placeholder="45000"
                    value={form.mileage}
                    onChangeText={setField('mileage')}
                    keyboardType="numeric"
                    optional
                  />
                </View>
              </View>

            </View>
          </View>

          {/* SUBMIT */}
          <TouchableOpacity
            style={[styles.submitBtn, isPending && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={isPending}
            activeOpacity={0.85}
          >
            {isPending
              ? <ActivityIndicator color="#FFFFFF" />
              : <>
                  <Ionicons name="add-circle-outline" size={20} color="#FFFFFF" />
                  <Text style={styles.submitBtnText}>Add Vehicle</Text>
                </>
            }
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}

function FieldInput({
  label, placeholder, value, onChangeText, error, optional, ...rest
}: {
  label: string; placeholder: string; value: string;
  onChangeText: (v: string) => void; error?: string; optional?: boolean;
  [key: string]: any;
}) {
  return (
    <View style={fieldStyles.group}>
      <Text style={fieldStyles.label}>
        {label}{optional ? <Text style={fieldStyles.optional}> (optional)</Text> : null}
      </Text>
      <TextInput
        style={[fieldStyles.input, error && fieldStyles.inputError]}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        value={value}
        onChangeText={onChangeText}
        {...rest}
      />
      {error ? <Text style={fieldStyles.errorText}>{error}</Text> : null}
    </View>
  );
}

const fieldStyles = StyleSheet.create(() => ({
  group: { marginBottom: 16 },
  label: { fontSize: 12, fontWeight: '700', color: '#1A1A2E', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  optional: { fontWeight: '400', color: '#9CA3AF', textTransform: 'none' },
  input: {
    borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 12,
    paddingHorizontal: 14, height: 48, fontSize: 14, color: '#1A1A2E', backgroundColor: '#FAFAFA',
  },
  inputError: { borderColor: '#EF4444' },
  errorText: { fontSize: 11, color: '#DC2626', fontWeight: '600', marginTop: 4 },
}));

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
  sectionLabel: { fontSize: 13, fontWeight: '800', color: '#1A1A2E', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },

  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  typeCard: {
    flex: 1, minWidth: '45%', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 8,
    borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 14,
    backgroundColor: '#FFFFFF', gap: 6,
  },
  typeCardActive: { borderColor: '#F56E0F', backgroundColor: '#FFF7ED' },
  typeLabel: { fontSize: 11, fontWeight: '700', color: '#6B7280', textAlign: 'center' },
  typeLabelActive: { color: '#F56E0F' },

  card: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20,
    borderWidth: 1.5, borderColor: '#E5E7EB',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  rowFields: { flexDirection: 'row', gap: 12 },

  submitBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: '#F56E0F', borderRadius: 16, height: 56,
    shadowColor: '#F56E0F', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8,
  },
  submitBtnDisabled: { opacity: 0.65 },
  submitBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
}));
