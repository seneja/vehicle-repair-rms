import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, StatusBar, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet } from 'react-native-unistyles';
import * as ImagePicker from 'expo-image-picker';

import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { useVehicle } from '../queries/queries';
import { useUploadVehicleImage } from '../queries/mutations';
import { useVehicleRecords } from '@/features/records/queries/queries';
import { ServiceRecord } from '@/features/records/types/records.types';
import { ErrorScreen } from '@/components/feedback/ErrorScreen';

const TYPE_ICON: Record<string, string> = {
  car:        'car-outline',
  motorcycle: 'bicycle-outline',
  tuk:        'car-outline',
  van:        'bus-outline',
};

export function VehicleDetailScreen({ id }: { id: string }) {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);

  const { data: vehicle, isLoading: vLoading } = useVehicle(id);
  const { data: records, isLoading: rLoading } = useVehicleRecords(id);
  const uploadImage = useUploadVehicleImage();

  const iconName = vehicle?.vehicleType ? (TYPE_ICON[vehicle.vehicleType] ?? 'car-outline') : 'car-outline';

  async function handlePickImage() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Allow photo library access to upload a vehicle photo.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });
    if (result.canceled || !result.assets[0]) return;
    setUploading(true);
    uploadImage.mutate(
      { id, uri: result.assets[0].uri },
      { onSettled: () => setUploading(false) },
    );
  }

  return (
    <ScreenWrapper bg="#1A1A2E">
      <StatusBar barStyle="light-content" backgroundColor="#1A1A2E" />

      {/* ── DARK TOP SECTION ── */}
      <View style={styles.topSection}>
        <View style={styles.headerTextRow}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Vehicle Details</Text>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => router.push(`/customer/vehicles/edit/${id}` as any)}
            activeOpacity={0.7}
          >
            <Ionicons name="create-outline" size={20} color="#F56E0F" />
          </TouchableOpacity>
        </View>

        <View style={styles.decCircle1} />
        <View style={styles.decCircle2} />
      </View>

      {/* ── WHITE CARD SECTION ── */}
      <View style={[styles.mainCard, { overflow: 'hidden' }]}>
        {vLoading ? (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
               <ActivityIndicator size="large" color="#F56E0F" />
            </View>
        ) : !vehicle ? (
            <ErrorScreen onRetry={() => router.back()} message="Vehicle not found." />
        ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} bounces={true}>

          {/* VEHICLE INFO CARD */}
          <View style={styles.infoCard}>
            {/* Vehicle photo banner */}
            <TouchableOpacity style={styles.photoBanner} onPress={handlePickImage} activeOpacity={0.85}>
              {vehicle.imageUrl ? (
                <Image source={{ uri: vehicle.imageUrl }} style={styles.vehicleImage} resizeMode="cover" />
              ) : (
                <View style={styles.photoPlaceholder}>
                  <Ionicons name={iconName as any} size={48} color="#D1D5DB" />
                </View>
              )}
              <View style={styles.photoOverlay}>
                {uploading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="camera-outline" size={16} color="#FFFFFF" />
                    <Text style={styles.photoOverlayText}>{vehicle.imageUrl ? 'Change photo' : 'Add photo'}</Text>
                  </>
                )}
              </View>
            </TouchableOpacity>

            <View style={styles.cardTop}>
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
              <ActivityIndicator color="#F56E0F" style={{ marginTop: 12 }} />
            ) : !records || records.length === 0 ? (
              <View style={styles.emptyHistory}>
                <Ionicons name="document-text-outline" size={32} color="#D1D5DB" />
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
                            <Ionicons name="person-outline" size={12} color="#6B7280" />
                            <Text style={styles.historyGarage}>{rec.technicianName}</Text>
                          </View>
                        ) : null}
                        {rec.mileageAtService ? (
                          <View style={styles.techRow}>
                            <Ionicons name="speedometer-outline" size={12} color="#6B7280" />
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
        )}
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create((theme) => ({
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  notFoundText: { fontSize: 16, color: 'rgba(255,255,255,0.7)', fontWeight: '600' },

  topSection: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 68, position: 'relative', overflow: 'hidden' },
  headerTextRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', zIndex: 10, marginTop: 12 },
  backBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '900', color: '#FFFFFF', letterSpacing: -0.3 },
  editBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(245,110,15,0.15)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(245,110,15,0.3)' },
  
  decCircle1: { position: 'absolute', width: 130, height: 130, borderRadius: 65, backgroundColor: 'rgba(245,110,15,0.13)', top: -25, right: -25 },
  decCircle2: { position: 'absolute', width: 70, height: 70, borderRadius: 35, backgroundColor: 'rgba(245,110,15,0.08)', bottom: 10, right: 90 },

  mainCard: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 32, borderTopRightRadius: 32, marginTop: -38, flex: 1, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 16 },
  scroll: { padding: 24, paddingBottom: 130 },

  infoCard: { backgroundColor: '#FFFFFF', borderRadius: 20, overflow: 'hidden', borderWidth: 1.5, borderColor: '#F3F4F6', marginBottom: 32, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 10, elevation: 2 },

  photoBanner: { width: '100%', height: 160, position: 'relative' },
  vehicleImage: { width: '100%', height: '100%' },
  photoPlaceholder: { width: '100%', height: '100%', backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  photoOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.45)', paddingVertical: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  photoOverlayText: { fontSize: 12, fontWeight: '700', color: '#FFFFFF' },

  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 20, paddingBottom: 0 },
  infoTextContainer: { flex: 1 },
  vehicleName: { fontSize: 20, fontWeight: '900', color: '#1A1A2E', letterSpacing: -0.5 },
  vehicleReg: { fontSize: 13, color: '#6B7280', fontWeight: '700', marginTop: 2, letterSpacing: 0.5 },
  typeBadge: { backgroundColor: '#FFF7ED', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  typeBadgeText: { fontSize: 10, fontWeight: '900', color: '#C2410C' },

  divider: { height: 1.5, backgroundColor: '#F3F4F6', marginVertical: 18, marginHorizontal: 20 },

  metaGrid: { flexDirection: 'row', paddingHorizontal: 20, paddingBottom: 20 },
  metaCell: { flex: 1, paddingHorizontal: 4, alignItems: 'center' },
  metaCellBorder: { borderLeftWidth: 1.5, borderRightWidth: 1.5, borderColor: '#F3F4F6' },
  metaLabel: { fontSize: 10, color: '#9CA3AF', fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6, textAlign: 'center' },
  metaValue: { fontSize: 14, color: '#1A1A2E', fontWeight: '700', textAlign: 'center' },

  section: { marginBottom: 32 },
  sectionTitle: { fontSize: 18, fontWeight: '900', color: '#1A1A2E', marginBottom: 20, letterSpacing: -0.3 },

  emptyHistory: { alignItems: 'center', paddingVertical: 36, gap: 10, backgroundColor: '#FAFAFA', borderRadius: 16, borderWidth: 1.5, borderColor: '#F3F4F6', borderStyle: 'dashed' },
  emptyHistoryText: { fontSize: 14, color: '#9CA3AF', fontWeight: '600' },

  timeline: { paddingLeft: 6 },
  timelineItem: { flexDirection: 'row', marginBottom: 24 },
  timelineLeft: { alignItems: 'center', width: 24, marginRight: 16 },
  timelineDot: { width: 14, height: 14, borderRadius: 7, backgroundColor: '#F56E0F', zIndex: 10, borderWidth: 3, borderColor: '#FFF7ED' },
  timelineLine: { width: 2, flex: 1, backgroundColor: '#F3F4F6', marginTop: 4 },

  timelineContent: { flex: 1, marginTop: -4 },
  historyDate: { fontSize: 11, fontWeight: '800', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  historyCard: { backgroundColor: '#FAFAFA', borderRadius: 16, padding: 16, borderWidth: 1.5, borderColor: '#F3F4F6' },
  historyTitle: { fontSize: 15, fontWeight: '800', color: '#1A1A2E', marginBottom: 6 },
  techRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  historyGarage: { fontSize: 12, color: '#6B7280', fontWeight: '600' },
  partsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8, marginBottom: 6 },
  partChip: { backgroundColor: '#FFFFFF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: '#E5E7EB' },
  partChipText: { fontSize: 11, color: '#4B5563', fontWeight: '700' },
  costRow: {},
  historyDivider: { height: 1, backgroundColor: '#E5E7EB', marginVertical: 12 },
  historyCost: { fontSize: 14, fontWeight: '900', color: '#F56E0F' },
}));
