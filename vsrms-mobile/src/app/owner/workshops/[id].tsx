import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Modal, TextInput,
  ActivityIndicator, StatusBar, Alert, Image,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { StyleSheet } from 'react-native-unistyles';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { ErrorScreen } from '@/components/feedback/ErrorScreen';
import { useWorkshop, useWorkshopTechnicians } from '@/features/workshops/queries/queries';
import { useRemoveTechnician, useUpdateWorkshop, useUploadWorkshopImage } from '@/features/workshops/queries/mutations';
import { useRegisterStaff } from '@/features/auth/queries/mutations';
import { useWorkshopAppointments } from '@/features/appointments/queries/queries';
import { User } from '@/features/auth/types/auth.types';

const EMPTY_TECH = { firstName: '', lastName: '', email: '', phone: '', password: '' };

// ── Technician card ───────────────────────────────────────────────────────────

function TechCard({ member, onRemove }: { member: User; onRemove: () => void }) {
  const name = member.fullName || member.email;
  const initials = name
    .split(/[ @._-]/)
    .filter(Boolean)
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return (
    <View style={styles.techCard}>
      <View style={styles.techAvatar}>
        <Text style={styles.techAvatarText}>{initials}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.techName}>{member.fullName || 'Technician'}</Text>
        <Text style={styles.techEmail}>{member.email}</Text>
      </View>
      <TouchableOpacity
        style={styles.removeBtn}
        onPress={onRemove}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons name="person-remove-outline" size={18} color="#EF4444" />
      </TouchableOpacity>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export default function WorkshopManageScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router  = useRouter();

  const { data: workshop, isLoading: wLoading, isError: wError, refetch: wRefetch } = useWorkshop(id!);
  const { data: technicians = [], isLoading: tLoading, refetch: tRefetch } = useWorkshopTechnicians(id!);
  const { data: pending }    = useWorkshopAppointments(id, 'pending');
  const { data: confirmed }  = useWorkshopAppointments(id, 'confirmed');
  const { data: inProgress } = useWorkshopAppointments(id, 'in_progress');

  const { mutate: registerTech, isPending: addPending } = useRegisterStaff();
  const { mutate: removeTech,   isPending: removePending } = useRemoveTechnician(id!);
  const { mutate: updateWS,     isPending: updatePending } = useUpdateWorkshop(id!);
  const { mutate: uploadImage,  isPending: uploadPending } = useUploadWorkshopImage(id!);

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please allow photo access to upload a workshop image.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
      aspect: [16, 9],
    });
    if (!result.canceled && result.assets[0]) {
      uploadImage(result.assets[0].uri);
    }
  };

  // Add technician modal
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [techForm, setTechForm]               = useState(EMPTY_TECH);
  const [techFormError, setTechFormError]     = useState('');
  const [showPassword, setShowPassword]       = useState(false);

  // Edit workshop modal
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '', address: '', district: '', contactNumber: '', description: '', servicesOffered: '',
  });

  const openEdit = () => {
    if (!workshop) return;
    setEditForm({
      name:            workshop.name,
      address:         workshop.address,
      district:        workshop.district,
      contactNumber:   workshop.contactNumber ?? '',
      description:     workshop.description ?? '',
      servicesOffered: (workshop.servicesOffered ?? []).join(', '),
    });
    setEditModalVisible(true);
  };

  const handleUpdate = () => {
    if (!editForm.name || !editForm.address || !editForm.contactNumber) return;
    updateWS(
      {
        name:            editForm.name,
        address:         editForm.address,
        district:        editForm.district,
        contactNumber:   editForm.contactNumber,
        description:     editForm.description || undefined,
        servicesOffered: editForm.servicesOffered
          ? editForm.servicesOffered.split(',').map(s => s.trim()).filter(Boolean)
          : [],
      },
      { onSuccess: () => setEditModalVisible(false) },
    );
  };

  const handleAddTech = () => {
    setTechFormError('');
    if (!techForm.firstName || !techForm.lastName || !techForm.email || !techForm.password) {
      setTechFormError('First name, last name, email and password are required.');
      return;
    }
    if (techForm.password.length < 8) {
      setTechFormError('Password must be at least 8 characters.');
      return;
    }
    if (!id) {
      setTechFormError('Workshop ID missing.');
      return;
    }
    registerTech(
      {
        firstName: techForm.firstName,
        lastName: techForm.lastName,
        email: techForm.email,
        password: techForm.password,
        workshopId: id,
        phone: techForm.phone || undefined,
      },
      {
        onSuccess: () => { setAddModalVisible(false); setTechForm(EMPTY_TECH); setShowPassword(false); },
        onError: (e: any) => setTechFormError(e?.response?.data?.message ?? e?.message ?? 'Failed to register technician'),
      },
    );
  };

  const handleRemoveTech = (userId: string, name: string) => {
    Alert.alert(
      'Remove Technician',
      `Remove ${name} from this workshop?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => removeTech(userId) },
      ],
    );
  };

  if (wLoading) return (
    <ScreenWrapper bg="#1A1A2E">
      <View style={styles.centered}><ActivityIndicator color="#F56E0F" size="large" /></View>
    </ScreenWrapper>
  );
  if (wError || !workshop) return <ErrorScreen onRetry={wRefetch} />;

  const stats = [
    { label: 'Pending',     value: pending?.length ?? 0,    color: '#D97706', bg: '#FEF3C7' },
    { label: 'Active',      value: inProgress?.length ?? 0, color: '#F56E0F', bg: '#FFF7ED' },
    { label: 'Confirmed',   value: confirmed?.length ?? 0,  color: '#059669', bg: '#D1FAE5' },
  ];

  return (
    <ScreenWrapper bg="#1A1A2E">
      <StatusBar barStyle="light-content" backgroundColor="#1A1A2E" />

      {/* ── Dark header ── */}
      <View style={styles.topSection}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.headerSub}>Manage Workshop</Text>
            <Text style={styles.headerTitle} numberOfLines={1}>{workshop.name}</Text>
          </View>
          <TouchableOpacity style={styles.editBtn} onPress={openEdit}>
            <Ionicons name="pencil-outline" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        <View style={styles.decCircle1} />
        <View style={styles.decCircle2} />
      </View>

      {/* ── White card ── */}
      <View style={styles.mainCard}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          {/* Workshop photo */}
          <TouchableOpacity style={styles.imageContainer} onPress={handlePickImage} activeOpacity={0.85} disabled={uploadPending}>
            {workshop.imageUrl ? (
              <Image source={{ uri: workshop.imageUrl }} style={styles.workshopImage} resizeMode="cover" />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons name="image-outline" size={36} color="#D1D5DB" />
                <Text style={styles.imagePlaceholderText}>Add Workshop Photo</Text>
              </View>
            )}
            <View style={styles.imageOverlay}>
              {uploadPending
                ? <ActivityIndicator size="small" color="#FFFFFF" />
                : <Ionicons name="camera" size={18} color="#FFFFFF" />}
              <Text style={styles.imageOverlayText}>{workshop.imageUrl ? 'Change Photo' : 'Upload Photo'}</Text>
            </View>
          </TouchableOpacity>

          {/* Workshop info chips */}
          <View style={styles.infoRow}>
            <View style={styles.infoChip}>
              <Ionicons name="location-outline" size={14} color="#F56E0F" />
              <Text style={styles.infoChipText}>{workshop.district}</Text>
            </View>
            <View style={styles.infoChip}>
              <Ionicons name="call-outline" size={14} color="#F56E0F" />
              <Text style={styles.infoChipText}>{workshop.contactNumber}</Text>
            </View>
            <View style={[styles.infoChip, { backgroundColor: workshop.active !== false ? '#ECFDF5' : '#FEF2F2' }]}>
              <View style={[styles.statusDot, { backgroundColor: workshop.active !== false ? '#10B981' : '#EF4444' }]} />
              <Text style={[styles.infoChipText, { color: workshop.active !== false ? '#059669' : '#DC2626' }]}>
                {workshop.active !== false ? 'Active' : 'Inactive'}
              </Text>
            </View>
          </View>

          {/* Appointment stats */}
          <Text style={styles.sectionTitle}>Today's Overview</Text>
          <View style={styles.statsRow}>
            {stats.map(s => (
              <View key={s.label} style={[styles.statCard, { borderColor: `${s.color}30` }]}>
                <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>

          {/* Quick actions */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => router.push({ pathname: '/owner/bookings', params: { workshopId: workshop._id || workshop.id } } as any)}
            >
              <Ionicons name="calendar-outline" size={20} color="#2563EB" />
              <Text style={styles.actionBtnText}>Bookings</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => router.push({ pathname: '/owner/jobs', params: { workshopId: workshop._id || workshop.id } } as any)}
            >
              <Ionicons name="hammer-outline" size={20} color="#F56E0F" />
              <Text style={styles.actionBtnText}>Active Jobs</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => router.push({ pathname: '/owner/logs', params: { workshopId: workshop._id || workshop.id } } as any)}
            >
              <Ionicons name="document-text-outline" size={20} color="#6B7280" />
              <Text style={styles.actionBtnText}>Records</Text>
            </TouchableOpacity>
          </View>

          {/* Technicians section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Technicians</Text>
            <TouchableOpacity
              style={styles.addTechBtn}
              onPress={() => { setTechForm(EMPTY_TECH); setTechFormError(''); setAddModalVisible(true); }}
            >
              <Ionicons name="person-add-outline" size={16} color="#F56E0F" />
              <Text style={styles.addTechBtnText}>Add</Text>
            </TouchableOpacity>
          </View>

          {tLoading ? (
            <ActivityIndicator color="#F56E0F" style={{ marginVertical: 12 }} />
          ) : technicians.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="people-outline" size={28} color="#D1D5DB" />
              <Text style={styles.emptyText}>No technicians yet. Tap Add to invite your first team member.</Text>
            </View>
          ) : (
            (technicians as User[]).map(t => (
              <TechCard
                key={t.id ?? t.email}
                member={t}
                onRemove={() => handleRemoveTech(t.id, t.fullName ?? t.email)}
              />
            ))
          )}

        </ScrollView>
      </View>

      {/* ── Add technician modal ── */}
      <Modal visible={addModalVisible} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Add Technician</Text>
                <Text style={styles.modalSub}>They'll get an account linked to {workshop.name}</Text>
              </View>
              <TouchableOpacity onPress={() => setAddModalVisible(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              {!!techFormError && (
                <View style={styles.errorBanner}>
                  <Ionicons name="alert-circle" size={16} color="#DC2626" />
                  <Text style={styles.errorText}>{techFormError}</Text>
                </View>
              )}

              <View style={styles.nameRow}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>First Name *</Text>
                  <TextInput style={styles.input} placeholder="Kamal" value={techForm.firstName} onChangeText={t => setTechForm(f => ({ ...f, firstName: t }))} />
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Last Name *</Text>
                  <TextInput style={styles.input} placeholder="Perera" value={techForm.lastName} onChangeText={t => setTechForm(f => ({ ...f, lastName: t }))} />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email *</Text>
                <TextInput style={styles.input} placeholder="kamal@workshop.lk" keyboardType="email-address" autoCapitalize="none" value={techForm.email} onChangeText={t => setTechForm(f => ({ ...f, email: t }))} />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Phone (optional)</Text>
                <TextInput style={styles.input} placeholder="+94 77 123 4567" keyboardType="phone-pad" value={techForm.phone} onChangeText={t => setTechForm(f => ({ ...f, phone: t }))} />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Password *</Text>
                <View style={styles.passwordRow}>
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    placeholder="Min. 8 characters"
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    value={techForm.password}
                    onChangeText={t => setTechForm(f => ({ ...f, password: t }))}
                  />
                  <TouchableOpacity
                    style={styles.eyeBtn}
                    onPress={() => setShowPassword(v => !v)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color="#9CA3AF"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.infoBox}>
                <Ionicons name="information-circle-outline" size={16} color="#2563EB" />
                <Text style={styles.infoText}>
                  The technician can log in immediately with this email and password — no additional registration required. They'll be automatically linked to {workshop.name}.
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.saveBtn, addPending && { opacity: 0.7 }]}
                onPress={handleAddTech}
                disabled={addPending}
              >
                {addPending
                  ? <ActivityIndicator color="#FFF" />
                  : <><Ionicons name="person-add-outline" size={18} color="#FFF" /><Text style={styles.saveBtnText}>Add Technician</Text></>
                }
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ── Edit workshop modal ── */}
      <Modal visible={editModalVisible} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Workshop</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              {(['name', 'address', 'district', 'contactNumber'] as const).map(field => (
                <View key={field} style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>{field === 'contactNumber' ? 'Contact Number' : field.charAt(0).toUpperCase() + field.slice(1)} *</Text>
                  <TextInput
                    style={styles.input}
                    value={editForm[field]}
                    onChangeText={t => setEditForm(f => ({ ...f, [field]: t }))}
                    keyboardType={field === 'contactNumber' ? 'phone-pad' : 'default'}
                  />
                </View>
              ))}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Description</Text>
                <TextInput style={[styles.input, { height: 80 }]} value={editForm.description} onChangeText={t => setEditForm(f => ({ ...f, description: t }))} multiline textAlignVertical="top" />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Services (comma-separated)</Text>
                <TextInput style={styles.input} value={editForm.servicesOffered} onChangeText={t => setEditForm(f => ({ ...f, servicesOffered: t }))} placeholder="Oil Change, Brake Service" />
              </View>

              <TouchableOpacity
                style={[styles.saveBtn, updatePending && { opacity: 0.7 }]}
                onPress={handleUpdate}
                disabled={updatePending}
              >
                {updatePending
                  ? <ActivityIndicator color="#FFF" />
                  : <Text style={styles.saveBtnText}>Save Changes</Text>
                }
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create((theme) => ({
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  topSection: {
    paddingHorizontal: theme.spacing.screenPadding,
    paddingTop: 16, paddingBottom: theme.spacing.headerBottom,
    position: 'relative', overflow: 'hidden',
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', zIndex: 10 },
  backBtn: { width: 38, height: 38, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  editBtn: { width: 38, height: 38, borderRadius: 10, backgroundColor: '#F56E0F', alignItems: 'center', justifyContent: 'center' },
  headerSub: { fontSize: theme.fonts.sizes.caption, color: 'rgba(255,255,255,0.7)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  headerTitle: { fontSize: theme.fonts.sizes.pageTitle, color: '#FFFFFF', fontWeight: '900', letterSpacing: -0.5, marginTop: 2 },
  decCircle1: { position: 'absolute', width: 130, height: 130, borderRadius: 65, backgroundColor: 'rgba(245,110,15,0.13)', top: -25, right: -25 },
  decCircle2: { position: 'absolute', width: 70, height: 70, borderRadius: 35, backgroundColor: 'rgba(245,110,15,0.08)', bottom: 10, right: 90 },

  mainCard: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 32, borderTopRightRadius: 32, marginTop: theme.spacing.cardOverlap, flex: 1 },
  scroll: { paddingHorizontal: theme.spacing.screenPadding, paddingTop: 24, paddingBottom: 60 },

  imageContainer: {
    height: 160,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  workshopImage: { width: '100%', height: '100%' },
  imagePlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  imagePlaceholderText: { fontSize: 14, fontWeight: '600', color: '#9CA3AF' },
  imageOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: 'rgba(0,0,0,0.45)', paddingVertical: 8,
  },
  imageOverlayText: { fontSize: 13, fontWeight: '700', color: '#FFFFFF' },

  infoRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  infoChip: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#FFF7ED', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#FED7AA' },
  infoChipText: { fontSize: 12, fontWeight: '700', color: '#F56E0F' },
  statusDot: { width: 6, height: 6, borderRadius: 3 },

  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  statCard: { flex: 1, borderRadius: 16, paddingVertical: 14, alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1.5 },
  statValue: { fontSize: 24, fontWeight: '900' },
  statLabel: { fontSize: 10, fontWeight: '800', color: '#9CA3AF', textTransform: 'uppercase', marginTop: 2 },

  actionsRow: { flexDirection: 'row', gap: 10, marginBottom: 28 },
  actionBtn: { flex: 1, alignItems: 'center', backgroundColor: '#F9FAFB', borderRadius: 16, paddingVertical: 14, borderWidth: 1.5, borderColor: '#F3F4F6', gap: 6 },
  actionBtnText: { fontSize: 11, fontWeight: '800', color: '#374151' },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { fontSize: 18, fontWeight: '900', color: '#1A1A2E', marginBottom: 14 },
  addTechBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#FFF7ED', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10 },
  addTechBtnText: { fontSize: 13, fontWeight: '800', color: '#F56E0F' },

  techCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#FFFFFF', borderRadius: 16, padding: 14, marginBottom: 10, borderWidth: 1.5, borderColor: '#F3F4F6' },
  techAvatar: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#BFDBFE' },
  techAvatarText: { fontSize: 15, fontWeight: '900', color: '#2563EB' },
  techName: { fontSize: 15, fontWeight: '800', color: '#1A1A2E' },
  techEmail: { fontSize: 12, color: '#9CA3AF', fontWeight: '500', marginTop: 2 },
  removeBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#FEF2F2', alignItems: 'center', justifyContent: 'center' },

  emptyCard: { backgroundColor: '#FAFAFA', borderRadius: 16, padding: 24, alignItems: 'center', borderWidth: 1.5, borderColor: '#F3F4F6', borderStyle: 'dashed', gap: 10 },
  emptyText: { fontSize: 13, fontWeight: '600', color: '#9CA3AF', textAlign: 'center' },

  // Modal
  modalBg: { flex: 1, backgroundColor: 'rgba(26,26,46,0.7)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, paddingTop: 12, maxHeight: '90%' },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#E5E7EB', alignSelf: 'center', marginBottom: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '900', color: '#1A1A2E' },
  modalSub: { fontSize: 12, color: '#6B7280', marginTop: 3 },
  nameRow: { flexDirection: 'row', gap: 12 },
  inputGroup: { marginBottom: 14 },
  inputLabel: { fontSize: 11, fontWeight: '800', color: '#6B7280', textTransform: 'uppercase', marginBottom: 6, marginLeft: 2 },
  input: { backgroundColor: '#F9FAFB', borderRadius: 12, height: 48, paddingHorizontal: 14, fontSize: 15, color: '#1A1A2E', borderWidth: 1.5, borderColor: '#F3F4F6' },
  infoBox: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', backgroundColor: '#EFF6FF', borderRadius: 12, padding: 12, marginBottom: 18, borderWidth: 1, borderColor: '#BFDBFE' },
  infoText: { flex: 1, fontSize: 12, color: '#2563EB', fontWeight: '600', lineHeight: 18 },
  errorBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FEF2F2', padding: 12, borderRadius: 12, borderWidth: 1.5, borderColor: '#FECACA', marginBottom: 16 },
  errorText: { flex: 1, fontSize: 13, color: '#DC2626', fontWeight: '700' },
  saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#F56E0F', borderRadius: 14, height: 54, marginBottom: 12, shadowColor: '#F56E0F', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 6 },
  saveBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },

  passwordRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  eyeBtn: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#F9FAFB', borderWidth: 1.5, borderColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
}));
