import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { useRouter } from 'expo-router';
import { Workshop } from '../types/workshops.types';

export function WorkshopCard({ workshop }: { workshop: Workshop }) {
  const { theme } = useUnistyles();
  const router = useRouter();

  const rating = workshop.averageRating ?? 0;
  const totalReviews = workshop.totalReviews ?? 0;
  const primaryService = workshop.servicesOffered?.[0];

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
      onPress={() => router.push(`/tabs/workshops/${workshop._id ?? workshop.id}` as any)}
    >
      {/* ICON + INFO */}
      <View style={styles.topRow}>
        <View style={styles.iconBox}>
          <Ionicons name="business-outline" size={22} color={theme.colors.brand} />
        </View>
        <View style={styles.mainInfo}>
          <Text style={styles.name} numberOfLines={1}>{workshop.name}</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={13} color={theme.colors.muted} />
            <Text style={styles.address} numberOfLines={1}>{workshop.district}</Text>
          </View>
        </View>
        <View style={styles.ratingBox}>
          <Ionicons name="star" size={13} color="#F59E0B" />
          <Text style={styles.ratingText}>{rating > 0 ? rating.toFixed(1) : '—'}</Text>
        </View>
      </View>

      {/* FOOTER */}
      <View style={styles.footerRow}>
        {primaryService ? (
          <View style={styles.serviceTag}>
            <Text style={styles.serviceText} numberOfLines={1}>{primaryService}</Text>
          </View>
        ) : (
          <View style={styles.serviceTag}>
            <Text style={styles.serviceText}>General Service</Text>
          </View>
        )}
        {totalReviews > 0 && (
          <Text style={styles.reviewCount}>{totalReviews} review{totalReviews !== 1 ? 's' : ''}</Text>
        )}
        <View style={styles.arrowBox}>
          <Ionicons name="chevron-forward" size={14} color={theme.colors.brand} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create((theme) => ({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.xl,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 12,
  },
  iconBox: {
    width: 46,
    height: 46,
    borderRadius: theme.radii.md,
    backgroundColor: theme.colors.brandSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainInfo: { flex: 1 },
  name: { fontSize: 16, fontWeight: '800', color: theme.colors.text, marginBottom: 3 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  address: { fontSize: 13, color: theme.colors.muted, fontWeight: '500', flex: 1 },

  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.radii.md,
  },
  ratingText: { fontSize: 12, fontWeight: '800', color: '#D97706' },

  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  serviceTag: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  serviceText: { fontSize: 11, fontWeight: '700', color: theme.colors.muted },
  reviewCount: { fontSize: 11, color: theme.colors.muted, fontWeight: '500' },
  arrowBox: {
    width: 28,
    height: 28,
    borderRadius: theme.radii.md,
    backgroundColor: theme.colors.brandSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
}));
