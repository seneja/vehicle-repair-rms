import React from 'react';
import {
  View, Text, Image, ScrollView, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { useWorkshop } from '../queries/queries';
import { useWorkshopReviews } from '@/features/reviews/queries/queries';
import { RatingStars } from '../components/RatingStars';
import { ReviewCard } from '@/features/reviews/components/ReviewCard';
import { ErrorScreen } from '@/components/feedback/ErrorScreen';

export function WorkshopDetailScreen({ id: propId }: { id?: string }) {
  const params = useLocalSearchParams<{ id: string }>();
  const id = propId || params.id;
  const router = useRouter();
  const { theme } = useUnistyles();

  const { data: workshop, isLoading, isError, refetch } = useWorkshop(id!);
  const { data: reviews } = useWorkshopReviews(id ?? '');

  if (isLoading) return (
    <View style={styles.centered}>
      <ActivityIndicator size="large" color={theme.colors.brand} />
    </View>
  );
  if (isError) return <ErrorScreen onRetry={refetch} />;
  if (!workshop) return (
    <View style={styles.centered}>
      <Text style={{ color: theme.colors.muted }}>Workshop not found.</Text>
    </View>
  );

  return (
    <ScreenWrapper>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>

        {/* HERO IMAGE */}
        {workshop.imageUrl
          ? <Image source={{ uri: workshop.imageUrl }} style={styles.heroImage} resizeMode="cover" />
          : (
            <View style={[styles.heroImage, styles.heroPlaceholder]}>
              <Ionicons name="business" size={56} color="#D1D5DB" />
            </View>
          )
        }

        {/* BACK BUTTON overlay */}
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color="#1A1A2E" />
        </TouchableOpacity>

        <View style={styles.body}>
          {/* NAME + RATING */}
          <Text style={styles.name}>{workshop.name}</Text>
          <View style={styles.ratingRow}>
            <RatingStars rating={workshop.averageRating ?? 0} size={16} />
            <Text style={styles.ratingText}>
              {(workshop.averageRating ?? 0).toFixed(1)}
            </Text>
            <Text style={styles.reviewCount}>
              ({workshop.totalReviews ?? 0} review{workshop.totalReviews !== 1 ? 's' : ''})
            </Text>
          </View>

          {/* INFO CHIPS */}
          <View style={styles.infoGrid}>
            <View style={styles.infoChip}>
              <Ionicons name="location-outline" size={15} color={theme.colors.brand} />
              <Text style={styles.infoChipText}>{workshop.district}</Text>
            </View>
            {workshop.contactNumber ? (
              <View style={styles.infoChip}>
                <Ionicons name="call-outline" size={15} color={theme.colors.brand} />
                <Text style={styles.infoChipText}>{workshop.contactNumber}</Text>
              </View>
            ) : null}
          </View>

          {/* ADDRESS */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Address</Text>
            <View style={styles.addressBox}>
              <Ionicons name="map-outline" size={16} color={theme.colors.muted} />
              <Text style={styles.sectionText}>{workshop.address}</Text>
            </View>
          </View>

          {/* DESCRIPTION */}
          {workshop.description ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About</Text>
              <Text style={styles.sectionText}>{workshop.description}</Text>
            </View>
          ) : null}

          {/* SERVICES OFFERED */}
          {(workshop.servicesOffered?.length ?? 0) > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Services Offered</Text>
              <View style={styles.chipWrap}>
                {workshop.servicesOffered!.map(s => (
                  <View key={s} style={styles.serviceChip}>
                    <Ionicons name="checkmark-circle-outline" size={14} color={theme.colors.brand} />
                    <Text style={styles.serviceChipText}>{s}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* REVIEWS */}
          {reviews && reviews.length > 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Customer Reviews</Text>
              {reviews.slice(0, 3).map(r => (
                <ReviewCard key={r._id} review={r} />
              ))}
              {reviews.length > 3 ? (
                <Text style={styles.moreReviews}>+{reviews.length - 3} more reviews</Text>
              ) : null}
            </View>
          ) : null}
        </View>
      </ScrollView>

      {/* STICKY BOOK BUTTON */}
      <View style={styles.stickyFooter}>
        <TouchableOpacity
          style={styles.bookBtn}
          onPress={() => router.push(`/tabs/schedule/book?workshopId=${workshop._id ?? workshop.id}` as any)}
          activeOpacity={0.85}
        >
          <Ionicons name="calendar-outline" size={20} color="#FFFFFF" />
          <Text style={styles.bookBtnText}>Book Appointment</Text>
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create((theme) => ({
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  heroImage: { width: '100%', height: 240 },
  heroPlaceholder: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#F3F4F6' },

  backBtn: {
    position: 'absolute', top: 52, left: 20,
    width: 42, height: 42, borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 6, elevation: 4,
  },

  body: { padding: 24 },

  name: { fontSize: 26, fontWeight: '900', color: theme.colors.text, letterSpacing: -0.5, marginBottom: 10 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16 },
  ratingText: { fontSize: 14, fontWeight: '800', color: theme.colors.text },
  reviewCount: { fontSize: 13, color: theme.colors.muted, fontWeight: '500' },

  infoGrid: { flexDirection: 'row', gap: 10, marginBottom: 24, flexWrap: 'wrap' },
  infoChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: theme.colors.brandSoft, paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: theme.radii.full,
  },
  infoChipText: { fontSize: 13, fontWeight: '700', color: theme.colors.brand },

  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: theme.colors.text, marginBottom: 10 },
  addressBox: {
    flexDirection: 'row', gap: 8, alignItems: 'flex-start',
    backgroundColor: theme.colors.surface, borderRadius: 10, padding: 12,
    borderWidth: 1, borderColor: theme.colors.border,
  },
  sectionText: { flex: 1, fontSize: 14, color: theme.colors.muted, lineHeight: 22 },
  moreReviews: { fontSize: 13, color: theme.colors.brand, fontWeight: '700', textAlign: 'center', marginTop: 8 },

  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  serviceChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: theme.colors.surface, paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: theme.radii.full, borderWidth: 1, borderColor: theme.colors.border,
  },
  serviceChipText: { fontSize: 13, fontWeight: '600', color: theme.colors.text },

  stickyFooter: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: 20, paddingBottom: 36,
    backgroundColor: 'rgba(255,255,255,0.97)',
    borderTopWidth: 1, borderTopColor: theme.colors.border,
  },
  bookBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: theme.colors.brand, borderRadius: 16, height: 56,
    shadowColor: theme.colors.brand, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8,
  },
  bookBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
}));
