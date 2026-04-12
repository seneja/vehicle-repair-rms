import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, Alert, TextInput, ActivityIndicator, StatusBar,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet } from 'react-native-unistyles';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { ErrorScreen } from '@/components/feedback/ErrorScreen';
import { EmptyState } from '@/components/ui/EmptyState';
import { useUsers } from '@/features/auth/queries/queries';
import { useDeactivateUser } from '@/features/auth/queries/mutations';
import { User } from '@/features/auth/types/auth.types';

const ROLE_CONFIG: Record<string, { label: string; bg: string; text: string; icon: any }> = {
  admin:           { label: 'Platform Admin',  bg: '#FFF7ED', text: '#F56E0F', icon: 'shield-checkmark' },
  workshop_owner:  { label: 'Garage Owner',   bg: '#FFFBEB', text: '#D97706', icon: 'business' },
  workshop_staff:  { label: 'Technician',     bg: '#EFF6FF', text: '#2563EB', icon: 'hammer' },
  customer:        { label: 'Customer',       bg: '#F0FDF4', text: '#059669', icon: 'person' },
};

function UserCard({ user, onDeactivate }: { user: User; onDeactivate: (id: string) => void }) {
  const roleCfg = ROLE_CONFIG[user.role] ?? { label: user.role, bg: '#F9FAFB', text: '#6B7280', icon: 'person-outline' };
  const initials = (user.fullName ?? user.email).split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  const isActive = user.active !== false;

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={[styles.avatar, !isActive && styles.avatarInactive]}>
          <Text style={[styles.avatarText, !isActive && { color: '#9CA3AF' }]}>{initials}</Text>
        </View>
        <View style={styles.headerMain}>
           <Text style={styles.userName} numberOfLines={1}>{user.fullName || 'User'}</Text>
           <Text style={styles.userEmail} numberOfLines={1}>{user.email}</Text>
        </View>
        {isActive ? (
          <TouchableOpacity style={styles.actionBtn} onPress={() => onDeactivate(user.id ?? '')} activeOpacity={0.7}>
             <Ionicons name="ban-outline" size={18} color="#DC2626" />
          </TouchableOpacity>
        ) : (
          <View style={styles.blockedBadge}>
             <Ionicons name="lock-closed" size={12} color="#9CA3AF" />
             <Text style={styles.blockedText}>Blocked</Text>
          </View>
        )}
      </View>

      <View style={styles.cardFooter}>
         <View style={[styles.roleLabel, { backgroundColor: roleCfg.bg }]}>
            <Ionicons name={roleCfg.icon} size={12} color={roleCfg.text} />
            <Text style={[styles.roleLabelText, { color: roleCfg.text }]}>{roleCfg.label}</Text>
         </View>
         <View style={styles.statusRow}>
            <View style={[styles.statusDot, { backgroundColor: isActive ? '#10B981' : '#9CA3AF' }]} />
            <Text style={[styles.statusText, { color: isActive ? '#059669' : '#9CA3AF' }]}>
               {isActive ? 'Active' : 'Disabled'}
            </Text>
         </View>
      </View>
    </View>
  );
}

export default function UserManagementScreen() {
  const [search, setSearch] = useState('');
  const { data, isLoading, isError, refetch } = useUsers();
  const { mutate: deactivate, isPending: deactivating } = useDeactivateUser();

  const handleDeactivate = (id: string) => {
    Alert.alert(
      'Deactivate User',
      'This user will lose access to the platform immediately.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Deactivate', style: 'destructive', onPress: () => deactivate(id) },
      ],
    );
  };

  const users = (data?.data ?? []).filter(u => 
    (u.fullName ?? '').toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <ScreenWrapper bg="#1A1A2E">
      <StatusBar barStyle="light-content" backgroundColor="#1A1A2E" />

      {/* ── DARK TOP SECTION ── */}
      <View style={styles.topSection}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerSub}>Platform Staff</Text>
            <Text style={styles.headerTitle}>User Accounts</Text>
          </View>
          <View style={styles.countBadge}>
            {deactivating 
              ? <ActivityIndicator size="small" color="#F56E0F" />
              : <Text style={styles.countText}>{data?.total ?? 0}</Text>
            }
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={18} color="rgba(255,255,255,0.6)" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search accounts..."
            placeholderTextColor="rgba(255,255,255,0.4)"
            value={search}
            onChangeText={setSearch}
          />
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
          // @ts-expect-error - FlashList requires estimatedItemSize dynamically
          <FlashList<User>
            data={users}
            keyExtractor={u => u.id ?? u.email}
            renderItem={({ item }) => <UserCard user={item} onDeactivate={handleDeactivate} />}
            estimatedItemSize={120}
            onRefresh={refetch}
            refreshing={isLoading}
            contentContainerStyle={styles.list}
            ListEmptyComponent={<EmptyState message="No users matching your search." />}
          />
        )}
      </View>
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
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
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
  
  countBadge: { width: 48, height: 48, borderRadius: 14, backgroundColor: 'rgba(245,110,15,0.2)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#F56E0F' },
  countText: { fontSize: 18, fontWeight: '900', color: '#F56E0F' },

  searchBox: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 14, paddingHorizontal: 16, height: 50, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', zIndex: 10 },
  searchInput: { flex: 1, color: '#FFF', fontSize: 14, fontWeight: '600' },

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
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  avatar: { width: 50, height: 50, borderRadius: 14, backgroundColor: '#FFF7ED', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#FDE68A' },
  avatarInactive: { backgroundColor: '#F9FAFB', borderColor: '#E5E7EB' },
  avatarText: { fontSize: 18, fontWeight: '900', color: '#F56E0F' },
  headerMain: { flex: 1 },
  userName: { fontSize: 16, fontWeight: '900', color: '#1A1A2E' },
  userEmail: { fontSize: 13, color: '#9CA3AF', fontWeight: '500', marginTop: 1 },
  actionBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#FEF2F2', alignItems: 'center', justifyContent: 'center' },
  blockedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F3F4F6', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  blockedText: { fontSize: 10, color: '#9CA3AF', fontWeight: '800', textTransform: 'uppercase' },

  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  roleLabel: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  roleLabelText: { fontSize: 10, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.3 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 11, fontWeight: '700' },
}));
