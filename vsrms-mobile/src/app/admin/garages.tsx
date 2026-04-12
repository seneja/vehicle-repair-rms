import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, Modal, TextInput, ScrollView, ActivityIndicator, StatusBar,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet } from 'react-native-unistyles';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { useWorkshops } from '@/features/workshops/queries/queries';
import { useCreateWorkshop } from '@/features/workshops/queries/mutations';
import { ErrorScreen } from '@/components/feedback/ErrorScreen';
import { EmptyState } from '@/components/ui/EmptyState';
import { Workshop } from '@/features/workshops/types/workshops.types';

function WorkshopCard({ workshop }: { workshop: Workshop }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.workshopIcon}>
          <Ionicons name="business" size={24} color="#F56E0F" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.workshopName}>{workshop.name}</Text>
          <Text style={styles.workshopLocation}>{workshop.address}</Text>
        </View>
        <TouchableOpacity style={styles.manageBtn}>
           <Ionicons name="settings-outline" size={18} color="#6B7280" />
        </TouchableOpacity>
      </View>
      <View style={styles.cardFooter}>
        <View style={styles.stat}>
           <Ionicons name="star" size={12} color="#F59E0B" />
           <Text style={styles.statText}>{workshop.averageRating?.toFixed(1) || '0.0'}</Text>
        </View>
        <View style={styles.stat}>
           <Ionicons name="chatbubble-outline" size={12} color="#6B7280" />
           <Text style={styles.statText}>{workshop.totalReviews || 0} reviews</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: '#ECFDF5' }]}>
           <View style={[styles.statusDot, { backgroundColor: '#10B981' }]} />
           <Text style={[styles.statusText, { color: '#059669' }]}>Operational</Text>
        </View>
      </View>
    </View>
  );
}

export default function AdminGaragesScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    contactNumber: '',
    district: 'Colombo',
    description: '',
    servicesOffered: '',
    lat: '6.9271',   // default: Colombo
    lng: '79.8612',
  });
  const { data: workshops, isLoading, isError, refetch } = useWorkshops();
  const { mutate: create, isPending } = useCreateWorkshop();

  const handleCreate = () => {
    if (!formData.name || !formData.address || !formData.contactNumber) return;
    const lat = parseFloat(formData.lat);
    const lng = parseFloat(formData.lng);
    if (isNaN(lat) || isNaN(lng)) return;

    create(
      {
        name: formData.name,
        address: formData.address,
        contactNumber: formData.contactNumber,
        district: formData.district,
        description: formData.description || undefined,
        servicesOffered: formData.servicesOffered
          ? formData.servicesOffered.split(',').map(s => s.trim()).filter(Boolean)
          : [],
        location: { type: 'Point', coordinates: [lng, lat] }, // GeoJSON: [lng, lat]
      },
      {
        onSuccess: () => {
          setModalVisible(false);
          setFormData({ name: '', address: '', contactNumber: '', district: 'Colombo', description: '', servicesOffered: '', lat: '6.9271', lng: '79.8612' });
        },
      }
    );
  };

  return (
    <ScreenWrapper bg="#1A1A2E">
      <StatusBar barStyle="light-content" backgroundColor="#1A1A2E" />

      {/* ── DARK TOP SECTION ── */}
      <View style={styles.topSection}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerSub}>Infrastructure</Text>
            <Text style={styles.headerTitle}>Garages</Text>
          </View>
          <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)} activeOpacity={0.8}>
            <Ionicons name="add" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.decCircle1} />
        <View style={styles.decCircle2} />
      </View>

      {/* ── WHITE CARD SECTION ── */}
      <View style={[styles.mainCard, { overflow: 'hidden' }]}>
        {isLoading && !workshops ? (
           <View style={styles.centered}><ActivityIndicator size="large" color="#F56E0F" /></View>
        ) : isError ? (
          <ErrorScreen onRetry={refetch} variant="inline" />
        ) : (
          <FlashList<Workshop>
            data={workshops || []}
            keyExtractor={item => item._id || item.id}
            renderItem={({ item }) => <WorkshopCard workshop={item} />}
            estimatedItemSize={140}
            onRefresh={refetch}
            refreshing={isLoading}
            contentContainerStyle={styles.list}
            ListEmptyComponent={<EmptyState message="No workshops found. Create your first one!" />}
          />
        )}
      </View>

      {/* CREATE MODAL */}
      <Modal visible={modalVisible} animationType="fade" transparent>
        <View style={styles.modalBg}>
          <View style={styles.modalContent}>
             <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Register Workshop</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                   <Ionicons name="close" size={24} color="#6B7280" />
                </TouchableOpacity>
             </View>

             <ScrollView showsVerticalScrollIndicator={false}>
                 <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Workshop Name</Text>
                    <TextInput style={styles.input} placeholder="e.g. Master Motors" value={formData.name} onChangeText={t => setFormData(f => ({...f, name:t}))} />
                 </View>
                 <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Full Address</Text>
                    <TextInput style={styles.input} placeholder="Street, City" value={formData.address} onChangeText={t => setFormData(f => ({...f, address:t}))} />
                 </View>
                 <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Contact Number</Text>
                    <TextInput style={styles.input} placeholder="+94 XX XXX XXXX" value={formData.contactNumber} onChangeText={t => setFormData(f => ({...f, contactNumber:t}))} />
                 </View>
                 <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>District</Text>
                    <TextInput style={styles.input} placeholder="Colombo" value={formData.district} onChangeText={t => setFormData(f => ({...f, district:t}))} />
                 </View>
                 <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Description (optional)</Text>
                    <TextInput style={[styles.input, { height: 80 }]} placeholder="Brief description of the workshop..." multiline textAlignVertical="top" value={formData.description} onChangeText={t => setFormData(f => ({...f, description:t}))} />
                 </View>
                 <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Services Offered (comma-separated)</Text>
                    <TextInput style={styles.input} placeholder="Oil Change, Brake Service, AC Repair" value={formData.servicesOffered} onChangeText={t => setFormData(f => ({...f, servicesOffered:t}))} />
                 </View>
                 <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Latitude</Text>
                    <TextInput style={styles.input} placeholder="e.g. 6.9271" keyboardType="numeric" value={formData.lat} onChangeText={t => setFormData(f => ({...f, lat:t}))} />
                 </View>
                 <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Longitude</Text>
                    <TextInput style={styles.input} placeholder="e.g. 79.8612" keyboardType="numeric" value={formData.lng} onChangeText={t => setFormData(f => ({...f, lng:t}))} />
                 </View>
             </ScrollView>

             <TouchableOpacity 
               style={[styles.saveBtn, isPending && { opacity: 0.7 }]} 
               onPress={handleCreate} 
               disabled={isPending}
             >
                {isPending ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveBtnText}>Save Workshop</Text>}
             </TouchableOpacity>
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
    overflow: 'hidden' 
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', zIndex: 10 },
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
  addBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#F56E0F', alignItems: 'center', justifyContent: 'center', shadowColor: '#F56E0F', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },

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
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { 
    paddingHorizontal: theme.spacing.screenPadding, 
    paddingTop: 24, 
    paddingBottom: 130 
  },

  card: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 18, marginBottom: 16, borderWidth: 1.5, borderColor: '#F3F4F6', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 2 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 14 },
  workshopIcon: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#FFF7ED', alignItems: 'center', justifyContent: 'center' },
  workshopName: { fontSize: 16, fontWeight: '900', color: '#1A1A2E' },
  workshopLocation: { fontSize: 13, color: '#9CA3AF', fontWeight: '500', marginTop: 1 },
  manageBtn: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#F9FAFB', alignItems: 'center', justifyContent: 'center' },
  
  cardFooter: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statText: { fontSize: 12, fontWeight: '700', color: '#6B7280' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, marginLeft: 'auto' },
  statusDot: { width: 5, height: 5, borderRadius: 2.5 },
  statusText: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },

  modalBg: { flex: 1, backgroundColor: 'rgba(26,26,46,0.8)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 20, fontWeight: '900', color: '#1A1A2E' },
  inputGroup: { marginBottom: 16 },
  inputLabel: { fontSize: 12, fontWeight: '800', color: '#6B7280', textTransform: 'uppercase', marginBottom: 8, marginLeft: 4 },
  input: { backgroundColor: '#F9FAFB', borderRadius: 14, height: 50, paddingHorizontal: 16, fontSize: 15, color: '#1A1A2E', borderWidth: 1, borderColor: '#E5E7EB' },
  saveBtn: { backgroundColor: '#F56E0F', borderRadius: 16, height: 56, alignItems: 'center', justifyContent: 'center', marginTop: 16, shadowColor: '#F56E0F', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 6 },
  saveBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' }
}));
