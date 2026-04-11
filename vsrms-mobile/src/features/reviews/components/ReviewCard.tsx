import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { Review } from '../types/reviews.types';

function StarRating({ rating }: { rating: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <Ionicons
          key={i}
          name={i <= rating ? 'star' : 'star-outline'}
          size={14}
          color={i <= rating ? '#F59E0B' : '#D1D5DB'}
        />
      ))}
    </View>
  );
}

function getUserLabel(userId: Review['userId']): string {
  if (typeof userId === 'object' && userId) return userId.fullName ?? userId.email ?? 'Anonymous';
  return 'Customer';
}

function getUserInitial(userId: Review['userId']): string {
  const label = getUserLabel(userId);
  return label[0]?.toUpperCase() ?? '?';
}

export function ReviewCard({ review }: { review: Review }) {
  const { theme } = useUnistyles();

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getUserInitial(review.userId)}</Text>
        </View>
        <View style={styles.reviewerInfo}>
          <Text style={styles.reviewerName}>{getUserLabel(review.userId)}</Text>
          <StarRating rating={review.rating} />
        </View>
        <Text style={styles.dateText}>
          {new Date(review.createdAt || Date.now()).toLocaleDateString('en-LK', {
            day: 'numeric', month: 'short', year: 'numeric',
          })}
        </Text>
      </View>
      {review.comment ? (
        <Text style={styles.comment}>{review.comment}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
  avatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: theme.colors.brandSoft,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 14, fontWeight: '800', color: theme.colors.brand },
  reviewerInfo: { flex: 1, gap: 3 },
  reviewerName: { fontSize: 14, fontWeight: '700', color: theme.colors.text },
  dateText: { fontSize: 11, color: theme.colors.muted, fontWeight: '500', marginTop: 2 },
  comment: { fontSize: 13, color: theme.colors.muted, lineHeight: 20, fontStyle: 'italic' },
}));
