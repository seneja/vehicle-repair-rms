import React from 'react';
import { View, Text, TouchableOpacity, StatusBar, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { Ionicons } from '@expo/vector-icons';
import { AppLogo } from '@/components/ui/AppLogo';

const FEATURES = [
  {
    icon: 'search-outline' as const,
    title: 'Find Workshops',
    desc: 'Discover trusted repair shops near you across Sri Lanka.',
  },
  {
    icon: 'calendar-outline' as const,
    title: 'Book Instantly',
    desc: 'Schedule appointments without calls or waiting.',
  },
  {
    icon: 'document-text-outline' as const,
    title: 'Track History',
    desc: 'Full service records for every vehicle you own.',
  },
];

export default function WelcomeScreen() {
  const router = useRouter();
  const { theme } = useUnistyles();

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── NAV BAR ── */}
        <View style={styles.navbar}>
          <AppLogo size={40} showText={false} />
          <View style={styles.navBadge}>
            <View style={styles.navDot} />
            <Text style={styles.navBadgeText}>Sri Lanka's #1 Vehicle App</Text>
          </View>
        </View>

        {/* ── HERO ── */}
        <View style={styles.hero}>
          <View style={styles.heroIconRing}>
            <View style={styles.heroIconInner}>
              <Ionicons name="car-sport" size={56} color={theme.colors.brand} />
              <View style={styles.heroWrenchBadge}>
                <Ionicons name="construct" size={14} color="#FFFFFF" />
              </View>
            </View>
          </View>
        </View>

        {/* ── HEADLINE ── */}
        <View style={styles.headline}>
          <Text style={styles.h1}>Your Vehicle.</Text>
          <Text style={styles.h1Brand}>Fully Managed.</Text>
          <Text style={styles.sub}>
            Book garages, track repairs, and get smart maintenance reminders — all from your phone.
          </Text>
        </View>

        {/* ── FEATURE LIST ── */}
        <View style={styles.featuresCard}>
          {FEATURES.map((f, i) => (
            <View key={f.title} style={[styles.featureRow, i < FEATURES.length - 1 && styles.featureRowBorder]}>
              <View style={styles.featureIconBox}>
                <Ionicons name={f.icon} size={20} color={theme.colors.brand} />
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>{f.title}</Text>
                <Text style={styles.featureDesc}>{f.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* ── STATS ROW ── */}
        <View style={styles.statsRow}>
          {[
            { value: '500+', label: 'Garages' },
            { value: '12K+', label: 'Vehicles' },
            { value: '4.8★', label: 'Avg Rating' },
          ].map((s, i) => (
            <React.Fragment key={s.label}>
              <View style={styles.statCell}>
                <Text style={styles.statValue}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
              {i < 2 && <View style={styles.statSep} />}
            </React.Fragment>
          ))}
        </View>

        {/* ── CTA BUTTONS ── */}
        <View style={styles.btnGroup}>
          <TouchableOpacity
            style={styles.btnPrimary}
            activeOpacity={0.85}
            onPress={() => router.push('/auth/register' as any)}
          >
            <Ionicons name="rocket-outline" size={18} color="#FFFFFF" />
            <Text style={styles.btnPrimaryText}>Get Started Free</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.btnSecondary}
            activeOpacity={0.85}
            onPress={() => router.push('/auth/login' as any)}
          >
            <Text style={styles.btnSecondaryText}>I already have an account</Text>
          </TouchableOpacity>
        </View>

        {/* ── FOOTER ── */}
        <View style={styles.footerRow}>
          <Ionicons name="shield-checkmark-outline" size={13} color={theme.colors.muted} />
          <Text style={styles.footerText}> Secured by </Text>
          <Text style={styles.footerBrand}>Asgardeo · WSO2</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create((theme) => ({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  scrollContent: { flexGrow: 1, paddingBottom: 40 },

  /* Navbar */
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  navBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.colors.brandSoft,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.radii.full,
  },
  navDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: theme.colors.brand },
  navBadgeText: { fontSize: 11, fontWeight: '800', color: theme.colors.brand, letterSpacing: 0.4 },

  /* Hero */
  hero: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  heroIconRing: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: theme.colors.brandSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroIconInner: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  heroWrenchBadge: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: theme.colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.surface,
  },

  /* Headline */
  headline: { paddingHorizontal: 28, marginBottom: 28 },
  h1: {
    fontSize: 40,
    fontWeight: '900',
    color: theme.colors.text,
    letterSpacing: -1,
    lineHeight: 46,
  },
  h1Brand: {
    fontSize: 40,
    fontWeight: '900',
    color: theme.colors.brand,
    letterSpacing: -1,
    lineHeight: 46,
    marginBottom: 14,
  },
  sub: {
    fontSize: 15,
    color: theme.colors.muted,
    lineHeight: 24,
    fontWeight: '500',
  },

  /* Features card */
  featuresCard: {
    marginHorizontal: 20,
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  featureRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  featureIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: theme.colors.brandSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: { flex: 1 },
  featureTitle: { fontSize: 14, fontWeight: '800', color: theme.colors.text, marginBottom: 3 },
  featureDesc: { fontSize: 12, color: theme.colors.muted, lineHeight: 18 },

  /* Stats */
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: 20,
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    paddingVertical: 18,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  statCell: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: '900', color: theme.colors.brand, letterSpacing: -0.5 },
  statLabel: { fontSize: 11, color: theme.colors.muted, fontWeight: '700', marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.5 },
  statSep: { width: 1, marginVertical: 4, backgroundColor: theme.colors.border },

  /* Buttons */
  btnGroup: { gap: 12, paddingHorizontal: 20, marginBottom: 24 },
  btnPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: theme.colors.brand,
    paddingVertical: 18,
    borderRadius: 16,
    shadowColor: theme.colors.brand,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  btnPrimaryText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800', letterSpacing: 0.3 },
  btnSecondary: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  btnSecondaryText: { color: theme.colors.text, fontSize: 15, fontWeight: '700' },

  /* Footer */
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 8,
  },
  footerText: { fontSize: 12, color: theme.colors.muted },
  footerBrand: { fontSize: 12, color: theme.colors.brand, fontWeight: '700' },
}));
