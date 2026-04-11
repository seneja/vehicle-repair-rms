import React from 'react';
import { View, Text } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { StyleSheet } from 'react-native-unistyles';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { RecordCard } from '../components/RecordCard';
import { useVehicleRecords } from '../queries/queries';
import { ErrorScreen } from '@/components/feedback/ErrorScreen';
import { VehicleSkeleton } from '@/components/feedback/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ServiceRecord } from '../types/records.types';

export function RecordListScreen({ vehicleId = '' }: { vehicleId?: string }) {
  const { data, isLoading, isError, refetch } = useVehicleRecords(vehicleId);

  if (isLoading) return <VehicleSkeleton />;
  if (isError) return <ErrorScreen onRetry={refetch} />;

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <Text style={styles.title}>Service History</Text>
        <FlashList<ServiceRecord>
          data={data || []}
          renderItem={({ item }) => <RecordCard record={item} />}
          estimatedItemSize={120}
          onRefresh={refetch}
          refreshing={isLoading}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<EmptyState message="No service records found." />}
        />
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: { flex: 1 },
  title: { 
    fontSize: theme.fonts.sizes.xl, 
    fontWeight: '800', 
    color: theme.colors.text, 
    padding: theme.spacing.md 
  },
  list: { padding: theme.spacing.md },
}));
