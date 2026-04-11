import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { useUsers } from '@/features/auth/queries/queries';
import { useWorkshops } from '@/features/workshops/queries/queries';
import { useAuth } from '@/hooks';

export default function AdminOverviewScreen() {
  const router = useRouter();
  const { theme } = useUnistyles();
  const { signOut } = useAuth();

  const { data: users,     isLoading: uLoad } = useUsers();
  const { data: workshops, isLoading: wLoad } = useWorkshops();

  const totalUsers     = users?.total ?? 0;
  const totalWorkshops = workshops?.length ?? 0;

  const stats = [
    { label: 'Platform Users', value: uLoad ? '...' : String(totalUsers),     icon: 'people-outline'   as const, color: '#3B82F6',        trend: '+12%' },
    { label: 'Workshops',      value: wLoad ? '...' : String(totalWorkshops), icon: 'business-outline' as const, color: theme.colors.brand, trend: '+3%'  },
  ];

  return (
    <ScreenWrapper>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.surface} />

      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerSubtitle}>Platform Admin</Text>
          <Text style={styles.headerTitle}>Overview</Text>
        </View>
        <TouchableOpacity style={styles.avatarBox} onPress={() => signOut()} activeOpacity={0.7}>
          <Ionicons name="log-out-outline" size={20} color={theme.colors.surface} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* STATS GRID */}
        <View style={styles.statsGrid}>
          {stats.map((s, i) => (
            <View key={i} style={styles.statCard}>
              <View style={styles.statLine}>
                <View style={[styles.iconBox, { backgroundColor: s.color + '15' }]}>
                  <Ionicons name={s.icon as any} size={20} color={s.color} />
                </View>
                <View style={styles.trendBadge}>
                  <Text style={[styles.trendText, { color: s.color }]}>{s.trend}</Text>
                </View>
              </View>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* ANALYTICS PREVIEW (MOCK) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Monthly Growth</Text>
          <View style={styles.chartPlaceholder}>
            <View style={styles.chartBars}>
              {[40, 60, 45, 80, 55, 90, 70].map((h, i) => (
                <View key={i} style={[styles.bar, { height: h * 1.5, backgroundColor: i === 5 ? theme.colors.brand : theme.colors.border }]} />
              ))}
            </View>
            <View style={styles.chartLabels}>
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map(l => (
                <Text key={l} style={styles.chartLabel}>{l}</Text>
              ))}
            </View>
          </View>
        </View>

        {/* RECENT LOGS */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>System Activity</Text>
            <TouchableOpacity><Text style={styles.linkText}>View Logs</Text></TouchableOpacity>
          </View>
          <View style={styles.logsCard}>
            <View style={styles.logItem}>
              <Ionicons name="add-circle" size={18} color="#10B981" />
              <View style={styles.logInfo}>
                <Text style={styles.logText}>New Service Center registered: "Premium Auto"</Text>
                <Text style={styles.logTime}>2 mins ago</Text>
              </View>
            </View>
            <View style={[styles.logItem, { borderBottomWidth: 0 }]}>
              <Ionicons name="alert-circle" size={18} color="#F59E0B" />
              <View style={styles.logInfo}>
                <Text style={styles.logText}>High server load detected on API Gateway</Text>
                <Text style={styles.logTime}>15 mins ago</Text>
              </View>
            </View>
          </View>
        </View>

      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create((theme) => ({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border
  },
  headerSubtitle: { fontSize: 13, color: theme.colors.muted, fontWeight: '600' },
  headerTitle: { fontSize: 24, fontWeight: '900', color: theme.colors.text, letterSpacing: -0.5 },
  avatarBox: {
    width: 44,
    height: 44,
    borderRadius: theme.radii.md,
    backgroundColor: '#1A1A2E',
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarText: { fontSize: 16, fontWeight: '800', color: theme.colors.surface },

  scroll: { padding: theme.spacing.md, paddingBottom: 120 },

  statsGrid: { flexDirection: 'row', gap: 12, marginBottom: 28 },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    elevation: 2,
    shadowColor: theme.colors.black, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8
  },
  statLine: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  iconBox: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  trendBadge: { backgroundColor: theme.colors.background, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  trendText: { fontSize: 10, fontWeight: '700' },
  statValue: { fontSize: 18, fontWeight: '900', color: theme.colors.text, marginBottom: 2 },
  statLabel: { fontSize: 11, color: theme.colors.muted, fontWeight: '600', textTransform: 'uppercase' },

  section: { marginBottom: 32 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: theme.colors.text, marginBottom: 16 },
  linkText: { fontSize: 14, fontWeight: '700', color: theme.colors.brand },

  chartPlaceholder: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    padding: 24,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center'
  },
  chartBars: { flexDirection: 'row', alignItems: 'flex-end', gap: 16, height: 160, marginBottom: 16 },
  bar: { width: 28, borderRadius: 4 },
  chartLabels: { flexDirection: 'row', gap: 16 },
  chartLabel: { width: 28, textAlign: 'center', fontSize: 12, color: theme.colors.muted, fontWeight: '600' },

  logsCard: { backgroundColor: theme.colors.surface, borderRadius: theme.radii.lg, padding: 16, borderWidth: 1, borderColor: theme.colors.border },
  logItem: { flexDirection: 'row', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.colors.border, alignItems: 'flex-start' },
  logInfo: { flex: 1 },
  logText: { fontSize: 14, fontWeight: '600', color: theme.colors.text, lineHeight: 20 },
  logTime: { fontSize: 12, color: theme.colors.muted, marginTop: 2 }
}));
