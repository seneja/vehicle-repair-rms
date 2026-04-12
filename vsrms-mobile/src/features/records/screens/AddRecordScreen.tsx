import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, StatusBar, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { useCreateRecord } from '../queries/mutations';
import { handleApiError } from '@/services/error.handler';

export function AddRecordScreen() {
  const { vehicleId } = useLocalSearchParams<{ vehicleId: string }>();
  const router = useRouter();
  const { theme } = useUnistyles();
  const { mutate: create, isPending } = useCreateRecord();
  
  const [form, setForm] = useState({
    workDone: '',
    totalCost: '',
    serviceDate: new Date().toISOString().split('T')[0],
  });

  const handleSubmit = () => {
    if (!form.workDone || !form.serviceDate) {
      Alert.alert('Validation', 'Work description and date are required');
      return;
    }
    if (form.totalCost && isNaN(parseFloat(form.totalCost))) {
      Alert.alert('Validation', 'Total cost must be a valid number');
      return;
    }

    create({
      vehicleId: vehicleId!,
      workDone: form.workDone,
      totalCost: form.totalCost ? parseFloat(form.totalCost) : 0,
      serviceDate: form.serviceDate,
    }, {
      onSuccess: () => router.back(),
      onError: (err) => Alert.alert('Error', handleApiError(err))
    });
  };

  return (
    <ScreenWrapper bg="#1A1A2E">
      <StatusBar barStyle="light-content" backgroundColor="#1A1A2E" />

      {/* ── DARK TOP SECTION ── */}
      <View style={styles.topSection}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerSub}>Technical Entry</Text>
            <Text style={styles.headerTitle}>Add Record</Text>
          </View>
        </View>

        <View style={styles.decCircle1} />
        <View style={styles.decCircle2} />
      </View>

      {/* ── WHITE CARD SECTION ── */}
      <View style={styles.mainCard}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Service Date</Text>
            <TextInput 
              style={styles.input} 
              value={form.serviceDate} 
              onChangeText={(v) => setForm(f => ({ ...f, serviceDate: v }))} 
              placeholder="YYYY-MM-DD (e.g. 2024-04-11)" 
              placeholderTextColor="#9CA3AF"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description of Work</Text>
            <TextInput 
              style={[styles.input, styles.textArea]} 
              value={form.workDone} 
              onChangeText={(v) => setForm(f => ({ ...f, workDone: v }))} 
              placeholder="Details of the repairs or maintenance performed..." 
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={4}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Total Cost (LKR)</Text>
            <TextInput 
              style={styles.input} 
              value={form.totalCost} 
              onChangeText={(v) => setForm(f => ({ ...f, totalCost: v }))} 
              keyboardType="numeric" 
              placeholder="e.g. 15000" 
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <TouchableOpacity 
            style={[styles.saveBtn, isPending && { opacity: 0.7 }]} 
            onPress={handleSubmit} 
            disabled={isPending}
            activeOpacity={0.8}
          >
            {isPending ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Save Service Record</Text>}
          </TouchableOpacity>

        </ScrollView>
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
    overflow: 'hidden' 
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 20, zIndex: 10, marginTop: 12 },
  backBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
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
    elevation: 16 
  },
  scroll: { 
    paddingHorizontal: theme.spacing.screenPadding, 
    paddingTop: 32, 
    paddingBottom: 130 
  },

  inputGroup: { marginBottom: 24 },
  label: { fontSize: 13, fontWeight: '800', color: theme.colors.text, textTransform: 'uppercase', marginBottom: 10, marginLeft: 4, letterSpacing: 0.5 },
  input: { 
    backgroundColor: '#F9FAFB', 
    borderWidth: 1.5, 
    borderColor: '#F3F4F6', 
    borderRadius: 16, 
    padding: 16, 
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text 
  },
  textArea: { height: 120, textAlignVertical: 'top' },
  
  saveBtn: { 
    backgroundColor: theme.colors.brand, 
    borderRadius: 18, 
    height: 58,
    alignItems: 'center', 
    justifyContent: 'center',
    marginTop: 16,
    shadowColor: theme.colors.brand,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  saveBtnText: { color: '#fff', fontWeight: '900', fontSize: 16, letterSpacing: 0.5 },
}));
