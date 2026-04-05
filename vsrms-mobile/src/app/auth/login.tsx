import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';

// WSO2 / Asgardeo brand palette
const BRAND   = '#FF7300';   // WSO2 orange
const BRAND_D = '#E05F00';   // darker shade for pressed
const WHITE   = '#FFFFFF';
const BG      = '#F5F5F5';
const CARD    = '#FFFFFF';
const TEXT    = '#1A1A2E';
const MUTED   = '#6B7280';
const BORDER  = '#D1D5DB';
const FOCUS   = '#FF7300';
const DIVIDER = '#E5E7EB';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();

  const [persona, setPersona] = useState<'owner' | 'garage' | 'admin' | 'staff'>('owner');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPwd,  setShowPwd]  = useState(false);
  const [focusField, setFocusField] = useState<string | null>(null);
  const [loading,  setLoading]  = useState(false);

  const canSubmit = email.trim().length > 0 && password.length >= 1;

  const handleLogin = async () => {
    if (!canSubmit) return;
    setLoading(true);
    try {
      await signIn(email, password, persona);
      
      // Navigate on success
      if (persona === 'owner') {
        router.replace('/tabs' as any);
      } else if (persona === 'admin') {
        router.replace('/admin' as any);
      } else if (persona === 'staff') {
        router.replace('/staff' as any);
      } else {
        router.replace('/garage' as any);
      }
    } catch (error: any) {
      alert('Authentication failed: ' + (error.message || 'Invalid credentials'));
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (field: string) => [
    styles.input,
    focusField === field && styles.inputFocused,
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={BG} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── CARD ── */}
          <View style={styles.card}>

            {/* Logo / Brand */}
            <View style={styles.brandRow}>
              <View style={styles.logoBox}>
                <View style={styles.logoInner}>
                  <View style={styles.logoSquare} />
                  <View style={[styles.logoSquare, styles.logoSquareOrange]} />
                </View>
              </View>
              <View>
                <Text style={styles.appName}>VSRMS</Text>
                <Text style={styles.appTagline}>Vehicle Service & Repair</Text>
              </View>
            </View>

            <View style={styles.dividerLine} />

            {/* Title */}
            <Text style={styles.title}>Sign In</Text>
            <Text style={styles.subtitle}>
              Sign in to your account to continue
            </Text>

            {/* Persona Selector */}
            <View style={styles.field}>
              <Text style={styles.label}>Login as</Text>
              <View style={styles.personaRow}>
                <TouchableOpacity 
                  style={[styles.personaChip, persona === 'owner' && styles.personaChipActive]}
                  onPress={() => setPersona('owner')}
                >
                  <Text style={[styles.personaText, persona === 'owner' && styles.personaTextActive]}>Vehicle Owner</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.personaChip, persona === 'garage' && styles.personaChipActive]}
                  onPress={() => setPersona('garage')}
                >
                  <Text style={[styles.personaText, persona === 'garage' && styles.personaTextActive]}>Service Center</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.personaChip, persona === 'admin' && styles.personaChipActive]}
                  onPress={() => setPersona('admin')}
                >
                  <Text style={[styles.personaText, persona === 'admin' && styles.personaTextActive]}>Admin</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.personaChip, persona === 'staff' && styles.personaChipActive]}
                  onPress={() => setPersona('staff')}
                >
                  <Text style={[styles.personaText, persona === 'staff' && styles.personaTextActive]}>Technician</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Email */}
            <View style={styles.field}>
              <Text style={styles.label}>Email / Username</Text>
              <TextInput
                style={inputStyle('email')}
                placeholder="Enter your email or username"
                placeholderTextColor={MUTED}
                value={email}
                onChangeText={setEmail}
                onFocus={() => setFocusField('email')}
                onBlur={() => setFocusField(null)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Password */}
            <View style={styles.field}>
              <Text style={styles.label}>Password</Text>
              <View style={[styles.inputRow, focusField === 'password' && styles.inputFocused]}>
                <TextInput
                  style={styles.inputFlat}
                  placeholder="Enter your password"
                  placeholderTextColor={MUTED}
                  value={password}
                  onChangeText={setPassword}
                  onFocus={() => setFocusField('password')}
                  onBlur={() => setFocusField(null)}
                  secureTextEntry={!showPwd}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowPwd(v => !v)} style={styles.eyeBtn}>
                  <Text style={styles.eyeText}>{showPwd ? 'Hide' : 'Show'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Forgot */}
            <TouchableOpacity style={styles.forgotRow} activeOpacity={0.7}>
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>

            {/* Sign In button */}
            <TouchableOpacity
              style={[styles.btnPrimary, !canSubmit && styles.btnMuted]}
              activeOpacity={0.85}
              onPress={handleLogin}
              disabled={!canSubmit || loading}
            >
              {loading
                ? <ActivityIndicator color={WHITE} size="small" />
                : <Text style={styles.btnText}>Sign In</Text>}
            </TouchableOpacity>

            {/* SSO Divider */}
            <View style={styles.orRow}>
              <View style={styles.orLine} />
              <Text style={styles.orText}>OR</Text>
              <View style={styles.orLine} />
            </View>

            {/* SSO buttons */}
            <TouchableOpacity style={styles.ssoBtn} activeOpacity={0.8}>
              <View style={styles.ssoIconBox}>
                <Text style={styles.ssoIconText}>G</Text>
              </View>
              <Text style={styles.ssoBtnText}>Continue with Google</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.ssoBtn, { marginTop: 10 }]} activeOpacity={0.8}>
              <View style={[styles.ssoIconBox, { backgroundColor: '#1877F2' }]}>
                <Text style={[styles.ssoIconText, { color: WHITE }]}>f</Text>
              </View>
              <Text style={styles.ssoBtnText}>Continue with Facebook</Text>
            </TouchableOpacity>

          </View>

          {/* Register link */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account?  </Text>
            <TouchableOpacity onPress={() => router.push('/auth/register' as any)} activeOpacity={0.7}>
              <Text style={styles.footerLink}>Create an account</Text>
            </TouchableOpacity>
          </View>

          {/* Powered by */}
          <View style={styles.poweredRow}>
            <Text style={styles.poweredText}>Secured by </Text>
            <Text style={styles.poweredBrand}>Asgardeo</Text>
            <Text style={styles.poweredText}> · WSO2</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:  { flex: 1, backgroundColor: BG },
  flex:  { flex: 1 },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },

  /* Card */
  card: {
    backgroundColor: CARD,
    borderRadius: 12,
    paddingHorizontal: 28,
    paddingVertical: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 20,
    elevation: 5,
  },

  /* Brand */
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 22,
  },
  logoBox: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#1A1A2E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoInner: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 24,
    height: 24,
    gap: 3,
  },
  logoSquare: {
    width: 10,
    height: 10,
    borderRadius: 2,
    backgroundColor: WHITE,
  },
  logoSquareOrange: {
    backgroundColor: BRAND,
  },
  appName:    { fontSize: 18, fontWeight: '800', color: TEXT, letterSpacing: 0.5 },
  appTagline: { fontSize: 11, color: MUTED, fontWeight: '500', marginTop: 1 },

  dividerLine: { height: 1, backgroundColor: DIVIDER, marginBottom: 24 },

  title:    { fontSize: 22, fontWeight: '800', color: TEXT, marginBottom: 6 },
  subtitle: { fontSize: 13.5, color: MUTED, fontWeight: '400', marginBottom: 28, lineHeight: 20 },

  /* Form */
  field:  { marginBottom: 18 },
  label:  { fontSize: 13, fontWeight: '600', color: TEXT, marginBottom: 7 },
  input: {
    height: 48,
    borderWidth: 1.5,
    borderColor: BORDER,
    borderRadius: 8,
    paddingHorizontal: 14,
    fontSize: 14,
    color: TEXT,
    backgroundColor: WHITE,
  },
  inputFocused: { borderColor: FOCUS },
  inputRow: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: BORDER,
    borderRadius: 8,
    paddingHorizontal: 14,
    backgroundColor: WHITE,
  },
  inputFlat: { flex: 1, fontSize: 14, color: TEXT, height: '100%' },
  eyeBtn:  { paddingLeft: 8 },
  eyeText: { fontSize: 12, color: BRAND, fontWeight: '700' },

  forgotRow: { alignSelf: 'flex-end', marginBottom: 24, marginTop: -6 },
  forgotText: { fontSize: 13, color: BRAND, fontWeight: '600' },

  /* Primary button */
  btnPrimary: {
    height: 50,
    backgroundColor: BRAND,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  btnMuted: { opacity: 0.5 },
  btnText:  { color: WHITE, fontSize: 15, fontWeight: '700', letterSpacing: 0.3 },

  /* OR divider */
  orRow:  { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  orLine: { flex: 1, height: 1, backgroundColor: DIVIDER },
  orText: { fontSize: 12, color: MUTED, fontWeight: '600' },

  /* SSO */
  ssoBtn: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: BORDER,
    backgroundColor: WHITE,
    paddingHorizontal: 16,
  },
  ssoIconBox: {
    width: 26,
    height: 26,
    borderRadius: 5,
    backgroundColor: '#EAEAEA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  ssoIconText: { fontSize: 14, fontWeight: '900', color: TEXT },
  ssoBtnText:  { fontSize: 14, fontWeight: '600', color: TEXT },

  /* Footer */
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  footerText: { fontSize: 13.5, color: MUTED },
  footerLink: { fontSize: 13.5, color: BRAND, fontWeight: '700' },

  poweredRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  poweredText:  { fontSize: 11, color: '#9CA3AF' },
  poweredBrand: { fontSize: 11, color: BRAND, fontWeight: '700' },

  personaRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  personaChip: { flex: 1, paddingVertical: 10, borderRadius: 8, borderWidth: 1.5, borderColor: BORDER, alignItems: 'center' },
  personaChipActive: { borderColor: BRAND, backgroundColor: '#FFF4EC' },
  personaText: { fontSize: 13, fontWeight: '700', color: MUTED },
  personaTextActive: { color: BRAND },
});
