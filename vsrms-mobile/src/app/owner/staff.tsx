import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, Modal, TextInput, ScrollView,
  ActivityIndicator, StatusBar, Alert,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet } from 'react-native-unistyles';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { useWorkshopStaff } from '@/features/auth/queries/queries';
import { useRegisterStaff } from '@/features/auth/queries/mutations';
import { ErrorScreen } from '@/components/feedback/ErrorScreen';
import { EmptyState } from '@/components/ui/EmptyState';
import { User } from '@/features/auth/types/auth.types';

function StaffCard({ member }: { member: User }) {
  const initials = (member.fullName ?? member.email).split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  const isActive = member.active !== false;

  return (
    <View style={styles.card}>
      <View style={styles.cardRow}>
        <View style={[styles.avatar, !isActive && styles.avatarInactive]}>
          <Text style={[styles.avatarText, !isActive && { color: '#9CA3AF' }]}>{initials}</Text>
        </View>
        <View style={styles.cardMain}>
          <Text style={styles.memberName}>{member.fullName || 'Technician'}</Text>
          <Text style={styles.memberEmail}>{member.email}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: isActive ? '#ECFDF5' : '#F3F4F6' }]}>
          <View style={[styles.statusDot, { backgroundColor: isActive ? '#10B981' : '#9CA3AF' }]} />
          <Text style={[styles.statusText, { color: isActive ? '#059669' : '#9CA3AF' }]}>
            {isActive ? 'Active' : 'Inactive'}
          </Text>
        </View>
      </View>
      <View style={styles.roleBadge}>
        <Ionicons name="hammer-outline" size={12} color="#2563EB" />
        <Text style={styles.roleText}>Technician</Text>
      </View>
    </View>
  );
}

const EMPTY_FORM = { firstName: '', lastName: '', email: '', phone: '', password: '' };

export default function OwnerStaffScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm]                 = useState(EMPTY_FORM);
  const [formError, setFormError]       = useState('');

  const { data, isLoading, isError, refetch } = useWorkshopStaff();
  const { mutate: register, isPending }       = useRegisterStaff();

  const staffList = data?.data ?? [];

  const handleRegister = () => {
    setFormError('');
    if (!form.firstName || !form.lastName || !form.email || !form.password) {
      setFormError('All required fields must be filled.');
      return;
    }
    if (form.password.length < 8) {
      setFormError('Password must be at least 8 characters.');
      return;
    }

    register(
      {
        firstName: form.firstName.trim(),
        lastName:  form.lastName.trim(),
        email:     form.email.trim().toLowerCase(),
        phone:     form.phone.trim() || undefined,
        password:  form.password,
      },
      {
        onSuccess: () => {
          setModalVisible(false);
          setForm(EMPTY_FORM);
        },
        onError: (e: any) => {
          setFormError(e?.message ?? 'Registration failed');
        },
      },
    );
  };

  return (
    <ScreenWrapper bg="#1A1A2E">
      <StatusBar barStyle="light-content" backgroundColor="#1A1A2E" />

      {/* ── DARK TOP SECTION ── */}
      <View style={styles.topSection}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerSub}>Workforce</Text>
            <Text style={styles.headerTitle}>My Technicians</Text>
          </View>
          <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)} activeOpacity={0.8}>
            <Ionicons name="person-add-outline" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        <View style={styles.decCircle1} />
        <View style={styles.decCircle2} />
      </View>

      {/* ── WHITE CARD SECTION ── */}
      <View style={[styles.mainCard, { overflow: 'hidden' }]}>
        {isLoading && !data ? (
          <View style={styles.centered}><ActivityIndicator size="large" color="#F56E0F" /></View>
        ) : isError ? (
          <ErrorScreen onRetry={refetch} variant="inline" />
        ) : (
          <FlashList<User>
            data={staffList}
            keyExtractor={m => m.id ?? m.email}
            renderItem={({ item }) => <StaffCard member={item} />}
            estimatedItemSize={110}
            onRefresh={refetch}
            refreshing={isLoading}
            contentContainerStyle={styles.list}
            ListHeaderComponent={
              <View style={styles.listHeader}>
                <Text style={styles.listHeaderText}>
                  {staffList.length} technician{staffList.length !== 1 ? 's' : ''} registered
                </Text>
                <TouchableOpacity
                  style={styles.addInlineBtn}
                  onPress={() => setModalVisible(true)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="add" size={16} color="#F56E0F" />
                  <Text style={styles.addInlineBtnText}>Add Technician</Text>
                </TouchableOpacity>
              </View>
            }
            ListEmptyComponent={
              <EmptyState message="No technicians registered yet. Tap + to add your first team member." />
            }
          />
        )}
      </View>

      {/* REGISTER MODAL */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Register Technician</Text>
                <Text style={styles.modalSub}>Create a login account for your staff member</Text>
              </View>
              <TouchableOpacity onPress={() => { setModalVisible(false); setForm(EMPTY_FORM); setFormError(''); }}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              {formError ? (
                <View style={styles.errorBanner}>
                  <Ionicons name="alert-circle" size={18} color="#DC2626" />
                  <Text style={styles.errorText}>{formError}</Text>
                </View>
              ) : null}

              <View style={styles.nameRow}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>First Name *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Kamal"
                    value={form.firstName}
                    onChangeText={t => setForm(f => ({ ...f, firstName: t }))}
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Last Name *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Perera"
                    value={form.lastName}
                    onChangeText={t => setForm(f => ({ ...f, lastName: t }))}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email Address *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="kamal@workshop.lk"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={form.email}
                  onChangeText={t => setForm(f => ({ ...f, email: t }))}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Phone Number</Text>
                <TextInput
                  style={styles.input}
                  placeholder="+94 77 123 4567"
                  keyboardType="phone-pad"
                  value={form.phone}
                  onChangeText={t => setForm(f => ({ ...f, phone: t }))}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Password * (min 8 characters)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Secure password"
                  secureTextEntry
                  value={form.password}
                  onChangeText={t => setForm(f => ({ ...f, password: t }))}
                />
              </View>

              <View style={styles.infoBox}>
                <Ionicons name="information-circle-outline" size={16} color="#2563EB" />
                <Text style={styles.infoText}>
                  The technician will be able to log in with this email and password, and will be linked to your workshop automatically.
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.saveBtn, isPending && { opacity: 0.7 }]}
                onPress={handleRegister}
                disabled={isPending}
                activeOpacity={0.85}
              >
                {isPending ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <>
                    <Ionicons name="person-add-outline" size={18} color="#FFF" />
                    <Text style={styles.saveBtnText}>Register Technician</Text>
                  </>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  addBtn: {
    width: 44, height: 44, borderRadius: 12, backgroundColor: '#F56E0F',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#F56E0F', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
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
    elevation: 16,
  },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { paddingHorizontal: theme.spacing.screenPadding, paddingTop: 24, paddingBottom: 130 },

  listHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  listHeaderText: { fontSize: 13, fontWeight: '700', color: '#6B7280' },
  addInlineBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#FFF7ED', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10 },
  addInlineBtnText: { fontSize: 13, fontWeight: '800', color: '#F56E0F' },

  card: {
    backgroundColor: '#FFFFFF', borderRadius: 20, padding: 16, marginBottom: 14,
    borderWidth: 1.5, borderColor: '#F3F4F6',
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.04, shadowRadius: 10, elevation: 2,
  },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  avatar: {
    width: 50, height: 50, borderRadius: 14,
    backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: '#BFDBFE',
  },
  avatarInactive: { backgroundColor: '#F9FAFB', borderColor: '#E5E7EB' },
  avatarText: { fontSize: 18, fontWeight: '900', color: '#2563EB' },
  cardMain: { flex: 1 },
  memberName: { fontSize: 16, fontWeight: '900', color: '#1A1A2E' },
  memberEmail: { fontSize: 12, color: '#9CA3AF', fontWeight: '500', marginTop: 2 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusDot: { width: 5, height: 5, borderRadius: 2.5 },
  statusText: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  roleBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', backgroundColor: '#EFF6FF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  roleText: { fontSize: 10, fontWeight: '900', color: '#2563EB', textTransform: 'uppercase', letterSpacing: 0.3 },

  modalBg: { flex: 1, backgroundColor: 'rgba(26,26,46,0.7)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: '#FFFFFF', borderTopLeftRadius: 32, borderTopRightRadius: 32,
    padding: 24, paddingTop: 12, maxHeight: '90%',
  },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#E5E7EB', alignSelf: 'center', marginBottom: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  modalTitle: { fontSize: 20, fontWeight: '900', color: '#1A1A2E' },
  modalSub: { fontSize: 13, color: '#6B7280', fontWeight: '500', marginTop: 3 },

  errorBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#FEF2F2', padding: 14, borderRadius: 14,
    borderWidth: 1.5, borderColor: '#FECACA', marginBottom: 20,
  },
  errorText: { flex: 1, fontSize: 13, color: '#DC2626', fontWeight: '700' },

  nameRow: { flexDirection: 'row', gap: 12 },
  inputGroup: { marginBottom: 16 },
  inputLabel: { fontSize: 11, fontWeight: '800', color: '#6B7280', textTransform: 'uppercase', marginBottom: 8, marginLeft: 4, letterSpacing: 0.5 },
  input: {
    backgroundColor: '#F9FAFB', borderRadius: 14, height: 50,
    paddingHorizontal: 16, fontSize: 15, color: '#1A1A2E',
    borderWidth: 1.5, borderColor: '#F3F4F6', fontWeight: '600',
  },

  infoBox: {
    flexDirection: 'row', gap: 10, alignItems: 'flex-start',
    backgroundColor: '#EFF6FF', borderRadius: 14, padding: 14,
    marginBottom: 20, borderWidth: 1, borderColor: '#BFDBFE',
  },
  infoText: { flex: 1, fontSize: 12, color: '#2563EB', fontWeight: '600', lineHeight: 18 },

  saveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: '#F56E0F', borderRadius: 16, height: 56, marginBottom: 12,
    shadowColor: '#F56E0F', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 6,
  },
  saveBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
}));
