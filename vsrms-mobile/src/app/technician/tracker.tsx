import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, StatusBar } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet } from 'react-native-unistyles';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { ErrorScreen } from '@/components/feedback/ErrorScreen';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAuth } from '@/hooks';
import { useWorkshopAppointments } from '@/features/appointments/queries/queries';
import { useUpdateAppointmentStatus } from '@/features/appointments/queries/mutations';
import { Appointment } from '@/features/appointments/types/appointments.types';
import { AppointmentCard } from '@/features/appointments/components/AppointmentCard';
import { useRouter } from 'expo-router';

// local helper and TrackerCard removed in favor of shared AppointmentCard

export default function StaffTrackerScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const workshopId = user?.workshopId;

  const { data, isLoading, isError, refetch } = useWorkshopAppointments(workshopId, 'in_progress');
  const { mutate: updateStatus, isPending } = useUpdateAppointmentStatus();

  const handleComplete = (id: string) => {
    router.push({ 
      pathname: '/technician/record', 
      params: { appointmentId: id } 
    } as any);
  };

  const list = (
    <FlashList
      data={(data ?? []) as Appointment[]}
      keyExtractor={(a: Appointment) => a._id || a.id || Math.random().toString()}
      renderItem={({ item }) => (
        <AppointmentCard 
          appointment={item} 
          isTechnician={true}
          onFinalize={() => handleComplete((item.id || item._id)!)}
        />
      )}
      // @ts-ignore
      estimatedItemSize={240}
      onRefresh={refetch}
      refreshing={isLoading}
      contentContainerStyle={styles.list}
      ListEmptyComponent={<EmptyState message="You're all caught up! No active jobs." />}
    />
  );

  return (
    <ScreenWrapper bg="#1A1A2E">
      <StatusBar barStyle="light-content" backgroundColor="#1A1A2E" />

      {/* ── DARK TOP SECTION ── */}
      <View style={styles.topSection}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerSub}>Real-time Tracker</Text>
            <Text style={styles.headerTitle}>Job Tracker</Text>
          </View>
          <View style={styles.countBadge}>
            {isPending
              ? <ActivityIndicator size="small" color="#F56E0F" />
              : <View style={{ alignItems: 'center' }}>
                  <Text style={styles.countNumber}>{data?.length ?? 0}</Text>
                  <Text style={styles.countLabel}>Active</Text>
                </View>
            }
          </View>
        </View>
        <View style={styles.decCircle1} />
        <View style={styles.decCircle2} />
      </View>

      {/* ── WHITE CARD SECTION ── */}
      <View style={[styles.mainCard, { overflow: 'hidden' }]}>
        {isLoading && !data ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color="#F56E0F" />
          </View>
        ) : isError ? (
          <ErrorScreen onRetry={refetch} variant="inline" />
        ) : list}
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create((theme) => ({
  topSection: { 
    paddingHorizontal: theme.spacing.screenPadding, 
    paddingTop: 16, 
    paddingBottom: 60, 
    position: 'relative', 
    overflow: 'hidden',
    backgroundColor: '#1A1A2E'
  },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', zIndex: 10, marginBottom: 24, marginTop: 12 },
  headerSub: { 
    fontSize: theme.fonts.sizes.caption, 
    color: 'rgba(255,255,255,0.7)', 
    fontWeight: '700', 
    textTransform: 'uppercase', 
    letterSpacing: 1 
  },
  headerTitle: { 
    fontSize: theme.fonts.sizes.pageTitle, 
    fontWeight: '900', 
    color: '#FFFFFF', 
    letterSpacing: -0.5, 
    marginTop: 4 
  },
  countBadge: { backgroundColor: 'rgba(245,110,15,0.2)', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 10, alignItems: 'center', borderWidth: 1, borderColor: '#F56E0F' },
  countNumber: { fontSize: 22, fontWeight: '900', color: '#F56E0F', lineHeight: 26 },
  countLabel: { fontSize: 10, fontWeight: '800', color: '#F56E0F', textTransform: 'uppercase', letterSpacing: 0.5 },
  
  decCircle1: { position: 'absolute', width: 140, height: 140, borderRadius: 70, backgroundColor: 'rgba(245,110,15,0.12)', top: -30, right: -20 },
  decCircle2: { position: 'absolute', width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(245,110,15,0.06)', bottom: 10, right: 90 },

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
}));
