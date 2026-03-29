import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const BRAND = '#F56E0F';
const WHITE = '#FFFFFF';
const BG = '#F9FAFB';
const TEXT = '#111827';
const MUTED = '#6B7280';
const BORDER = '#E5E7EB';

export default function CreateRecordScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={BG} />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="close" size={24} color={TEXT} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Service Record</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          
          <Text style={styles.sectionDesc}>Enter details of the services performed on the vehicle.</Text>

          {/* CUSTOMER SEARCH */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Vehicle / License Plate</Text>
            <View style={styles.searchBox}>
              <Ionicons name="search" size={18} color={MUTED} />
              <TextInput style={styles.input} placeholder="e.g. CBA-1234" placeholderTextColor="#9CA3AF" />
            </View>
          </View>

          {/* SERVICE TYPE */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Service Type</Text>
            <TextInput style={styles.inputStd} placeholder="e.g. Full Service, Brake Pad Change" placeholderTextColor="#9CA3AF" />
          </View>

          {/* MILEAGE */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Current Mileage (km)</Text>
            <TextInput style={styles.inputStd} keyboardType="numeric" placeholder="45200" placeholderTextColor="#9CA3AF" />
          </View>

          {/* NOTES */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Technician Notes</Text>
            <TextInput 
              style={[styles.inputStd, styles.textArea]} 
              multiline 
              numberOfLines={4} 
              placeholder="List parts replaced and any observations..." 
              placeholderTextColor="#9CA3AF" 
            />
          </View>

          {/* COST */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Total Labor & Parts Cost (LKR)</Text>
            <TextInput style={styles.inputStd} keyboardType="numeric" placeholder="15000" placeholderTextColor="#9CA3AF" />
          </View>

          <TouchableOpacity 
            style={styles.submitBtn} 
            activeOpacity={0.8}
            onPress={() => {
              setLoading(true);
              setTimeout(() => {
                router.back();
              }, 1000);
            }}
          >
            <Text style={styles.submitBtnText}>{loading ? 'Saving...' : 'Finalize & Save Record'}</Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
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

  scroll: { padding: 24, paddingBottom: 60 },
  sectionDesc: { fontSize: 14, color: MUTED, marginBottom: 24, fontWeight: '500' },

  formGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '700', color: TEXT, marginBottom: 8 },
  
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: WHITE,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
    borderWidth: 1.5,
    borderColor: BORDER,
  },
  input: { flex: 1, fontSize: 15, color: TEXT, fontWeight: '600' },
  inputStd: {
    backgroundColor: WHITE,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
    borderWidth: 1.5,
    borderColor: BORDER,
    fontSize: 15,
    color: TEXT,
    fontWeight: '600',
  },
  textArea: { height: 120, paddingTop: 16, textAlignVertical: 'top' },

  submitBtn: {
    backgroundColor: BRAND,
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 12,
    shadowColor: BRAND,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnText: { color: WHITE, fontSize: 16, fontWeight: '800' },
});
