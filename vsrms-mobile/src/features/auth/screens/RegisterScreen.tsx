import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StyleSheet } from 'react-native-unistyles';
import { register } from '../api/auth.api';
import { AppLogoIcon } from '@/components/ui/AppLogo';

const { width: SCREEN_W } = Dimensions.get('window');

// ─── Types ────────────────────────────────────────────────────────────────────
type RoleValue = 'Vehicle Owner' | 'Garage Owner' | 'Technician';

const ROLES: { label: string; value: RoleValue; icon: string; desc: string }[] = [
  { label: 'Vehicle Owner', value: 'Vehicle Owner', icon: 'car-sport-outline',  desc: 'Book workshops & track your vehicles' },
  { label: 'Garage Owner',  value: 'Garage Owner',  icon: 'business-outline',   desc: 'Manage your workshop & bookings' },
  { label: 'Technician',    value: 'Technician',    icon: 'construct-outline',   desc: 'Handle jobs & service records' },
];

const STEPS = [
  { number: 1, title: 'Choose your role',     subtitle: 'How will you use VSRMS?' },
  { number: 2, title: 'Basic information',    subtitle: 'Tell us a little about yourself' },
  { number: 3, title: 'Secure your account',  subtitle: 'Create a strong password' },
];

// ─── Component ────────────────────────────────────────────────────────────────
export function RegisterScreen() {
  const router = useRouter();

  const [step, setStep]             = useState(1);
  const [role, setRole]             = useState<RoleValue>('Vehicle Owner');
  const [firstName, setFirstName]   = useState('');
  const [lastName, setLastName]     = useState('');
  const [email, setEmail]           = useState('');
  const [phone, setPhone]           = useState('');
  const [password, setPassword]     = useState('');
  const [confirmPw, setConfirmPw]   = useState('');
  const [showPw, setShowPw]         = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState<string | null>(null);

  // ── Validation per step ────────────────────────────────────────────────────
  const validateStep = () => {
    setError(null);
    if (step === 1) {
      return true; // role always has a default
    }
    if (step === 2) {
      if (!firstName.trim())                     { setError('First name is required.'); return false; }
      if (!lastName.trim())                      { setError('Last name is required.'); return false; }
      if (!email.trim() || !email.includes('@')) { setError('Please enter a valid email.'); return false; }
      return true;
    }
    if (step === 3) {
      if (password.length < 8)       { setError('Password must be at least 8 characters.'); return false; }
      if (password !== confirmPw)    { setError('Passwords do not match.'); return false; }
      return true;
    }
    return true;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    setStep(s => s + 1);
  };

  const handleBack = () => {
    setError(null);
    if (step === 1) { router.back(); return; }
    setStep(s => s - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    setLoading(true);
    setError(null);
    try {
      await register({ firstName, lastName, email: email.trim().toLowerCase(), phone, password, role });
      router.replace('/auth/login' as any);
    } catch (err: any) {
      setError(err?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const current = STEPS[step - 1];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#1A1A2E" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >

          {/* ── DARK TOP ── */}
          <View style={styles.topSection}>
            {/* Nav row */}
            <View style={styles.topRow}>
              <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
                <Ionicons name="chevron-back" size={20} color="#FFFFFF" />
              </TouchableOpacity>
              <AppLogoIcon size={34} />
            </View>

            {/* Step pills */}
            <View style={styles.stepPills}>
              {STEPS.map(s => (
                <View key={s.number} style={styles.stepPillWrap}>
                  <View style={[styles.stepPill, step === s.number && styles.stepPillActive, step > s.number && styles.stepPillDone]}>
                    {step > s.number
                      ? <Ionicons name="checkmark" size={13} color="#FFFFFF" />
                      : <Text style={[styles.stepPillNum, step === s.number && styles.stepPillNumActive]}>{s.number}</Text>
                    }
                  </View>
                  {s.number < STEPS.length && (
                    <View style={[styles.stepConnector, step > s.number && styles.stepConnectorDone]} />
                  )}
                </View>
              ))}
            </View>

            <Text style={styles.stepLabel}>Step {step} of {STEPS.length}</Text>
            <Text style={styles.heading}>{current.title}</Text>
            <Text style={styles.headingSub}>{current.subtitle}</Text>

            {/* decorative circles */}
            <View style={styles.decCircle1} />
            <View style={styles.decCircle2} />
          </View>

          {/* ── WHITE PANEL ── */}
          <View style={styles.formPanel}>

            {/* Error */}
            {error ? (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle" size={16} color="#B91C1C" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* ── STEP 1: Role ── */}
            {step === 1 && (
              <View style={styles.stepContent}>
                {ROLES.map(r => (
                  <TouchableOpacity
                    key={r.value}
                    style={[styles.roleCard, role === r.value && styles.roleCardActive]}
                    onPress={() => setRole(r.value)}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.roleIconBox, role === r.value && styles.roleIconBoxActive]}>
                      <Ionicons name={r.icon as any} size={24} color={role === r.value ? '#FFFFFF' : '#6B7280'} />
                    </View>
                    <View style={styles.roleTextCol}>
                      <Text style={[styles.roleLabel, role === r.value && styles.roleLabelActive]}>{r.label}</Text>
                      <Text style={styles.roleDesc}>{r.desc}</Text>
                    </View>
                    <View style={[styles.roleRadio, role === r.value && styles.roleRadioActive]}>
                      {role === r.value && <View style={styles.roleRadioDot} />}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* ── STEP 2: Basic details ── */}
            {step === 2 && (
              <View style={styles.stepContent}>
                <View style={styles.nameRow}>
                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.label}>First Name</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="John"
                      placeholderTextColor="#9CA3AF"
                      value={firstName}
                      onChangeText={setFirstName}
                      returnKeyType="next"
                      autoFocus
                    />
                  </View>
                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.label}>Last Name</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Perera"
                      placeholderTextColor="#9CA3AF"
                      value={lastName}
                      onChangeText={setLastName}
                      returnKeyType="next"
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Email Address</Text>
                  <View style={styles.inputRow}>
                    <Ionicons name="mail-outline" size={18} color="#9CA3AF" style={styles.inputIcon} />
                    <TextInput
                      style={styles.textInput}
                      placeholder="john@example.com"
                      placeholderTextColor="#9CA3AF"
                      value={email}
                      onChangeText={setEmail}
                      autoCapitalize="none"
                      keyboardType="email-address"
                      returnKeyType="next"
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>
                    Phone{' '}
                    <Text style={styles.optional}>(optional)</Text>
                  </Text>
                  <View style={styles.inputRow}>
                    <Ionicons name="call-outline" size={18} color="#9CA3AF" style={styles.inputIcon} />
                    <TextInput
                      style={styles.textInput}
                      placeholder="07X XXX XXXX"
                      placeholderTextColor="#9CA3AF"
                      value={phone}
                      onChangeText={setPhone}
                      keyboardType="phone-pad"
                      returnKeyType="done"
                    />
                  </View>
                </View>
              </View>
            )}

            {/* ── STEP 3: Password ── */}
            {step === 3 && (
              <View style={styles.stepContent}>
                {/* strength hint */}
                <View style={styles.hintBox}>
                  <Ionicons name="information-circle-outline" size={16} color="#F56E0F" />
                  <Text style={styles.hintText}>Use at least 8 characters with a mix of letters and numbers.</Text>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Password</Text>
                  <View style={styles.inputRow}>
                    <Ionicons name="lock-closed-outline" size={18} color="#9CA3AF" style={styles.inputIcon} />
                    <TextInput
                      style={styles.textInput}
                      placeholder="Min. 8 characters"
                      placeholderTextColor="#9CA3AF"
                      secureTextEntry={!showPw}
                      value={password}
                      onChangeText={setPassword}
                      returnKeyType="next"
                      autoFocus
                    />
                    <TouchableOpacity onPress={() => setShowPw(v => !v)} hitSlop={10}>
                      <Ionicons name={showPw ? 'eye-off-outline' : 'eye-outline'} size={18} color="#9CA3AF" />
                    </TouchableOpacity>
                  </View>

                  {/* strength bar */}
                  {password.length > 0 && (
                    <View style={styles.strengthRow}>
                      {[0, 1, 2, 3].map(i => (
                        <View
                          key={i}
                          style={[
                            styles.strengthBar,
                            password.length > i * 3 + 2 && styles.strengthBarFill,
                            password.length >= 12 && styles.strengthBarStrong,
                          ]}
                        />
                      ))}
                      <Text style={styles.strengthLabel}>
                        {password.length < 8 ? 'Weak' : password.length < 12 ? 'Good' : 'Strong'}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Confirm Password</Text>
                  <View style={[styles.inputRow, confirmPw && password !== confirmPw && styles.inputRowError]}>
                    <Ionicons name="shield-checkmark-outline" size={18} color="#9CA3AF" style={styles.inputIcon} />
                    <TextInput
                      style={styles.textInput}
                      placeholder="Re-enter password"
                      placeholderTextColor="#9CA3AF"
                      secureTextEntry={!showConfirmPw}
                      value={confirmPw}
                      onChangeText={setConfirmPw}
                      returnKeyType="done"
                      onSubmitEditing={handleSubmit}
                    />
                    <TouchableOpacity onPress={() => setShowConfirmPw(v => !v)} hitSlop={10}>
                      <Ionicons name={showConfirmPw ? 'eye-off-outline' : 'eye-outline'} size={18} color="#9CA3AF" />
                    </TouchableOpacity>
                  </View>
                  {confirmPw.length > 0 && password === confirmPw && (
                    <View style={styles.matchRow}>
                      <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                      <Text style={styles.matchText}>Passwords match</Text>
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* ── ACTION BUTTON ── */}
            {step < 3 ? (
              <TouchableOpacity style={styles.primaryBtn} onPress={handleNext} activeOpacity={0.85}>
                <Text style={styles.primaryBtnText}>Continue</Text>
                <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.primaryBtn, loading && styles.btnDisabled]}
                onPress={handleSubmit}
                disabled={loading}
                activeOpacity={0.85}
              >
                {loading
                  ? <ActivityIndicator color="#FFFFFF" />
                  : (
                    <>
                      <Ionicons name="person-add-outline" size={18} color="#FFFFFF" />
                      <Text style={styles.primaryBtnText}>Create Account</Text>
                    </>
                  )
                }
              </TouchableOpacity>
            )}

            {/* Sign in link */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.replace('/auth/login' as any)}>
                <Text style={styles.loginLink}>Sign In</Text>
              </TouchableOpacity>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create((_theme) => ({
  safe: { flex: 1, backgroundColor: '#1A1A2E' },
  scroll: { flexGrow: 1 },

  /* ── Dark top ── */
  topSection: {
    backgroundColor: '#1A1A2E',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 52,
    position: 'relative',
    overflow: 'hidden',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 11,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)',
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center', justifyContent: 'center',
  },

  /* Step pills */
  stepPills: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  stepPillWrap: { flexDirection: 'row', alignItems: 'center' },
  stepPill: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  stepPillActive: {
    backgroundColor: '#F56E0F',
    borderColor: '#F56E0F',
  },
  stepPillDone: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  stepPillNum: { fontSize: 12, fontWeight: '800', color: 'rgba(255,255,255,0.5)' },
  stepPillNumActive: { color: '#FFFFFF' },
  stepConnector: {
    width: (SCREEN_W - 48 - 84) / 2,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.12)',
    marginHorizontal: 6,
  },
  stepConnectorDone: { backgroundColor: '#10B981' },

  stepLabel: { fontSize: 11, fontWeight: '700', color: '#F56E0F', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 },
  heading: { fontSize: 28, fontWeight: '900', color: '#FFFFFF', letterSpacing: -0.6, marginBottom: 4 },
  headingSub: { fontSize: 14, color: 'rgba(255,255,255,0.5)', fontWeight: '500' },

  decCircle1: {
    position: 'absolute', width: 130, height: 130, borderRadius: 65,
    backgroundColor: 'rgba(245,110,15,0.12)', top: -25, right: -25,
  },
  decCircle2: {
    position: 'absolute', width: 70, height: 70, borderRadius: 35,
    backgroundColor: 'rgba(245,110,15,0.07)', bottom: 8, right: 90,
  },

  /* ── White panel ── */
  formPanel: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -28,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
    flex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 16,
  },
  stepContent: { marginBottom: 8 },

  errorBanner: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FEF2F2', borderRadius: 12, padding: 14,
    marginBottom: 20, gap: 8, borderWidth: 1, borderColor: '#FECACA',
  },
  errorText: { color: '#B91C1C', fontSize: 13, fontWeight: '600', flex: 1 },

  /* ── Step 1: Role cards ── */
  roleCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    padding: 16, borderRadius: 16, marginBottom: 12,
    borderWidth: 1.5, borderColor: '#E5E7EB',
    backgroundColor: '#FAFAFA',
  },
  roleCardActive: {
    borderColor: '#F56E0F', backgroundColor: '#FFF7ED',
  },
  roleIconBox: {
    width: 48, height: 48, borderRadius: 14,
    backgroundColor: '#F3F4F6',
    alignItems: 'center', justifyContent: 'center',
  },
  roleIconBoxActive: { backgroundColor: '#F56E0F' },
  roleTextCol: { flex: 1 },
  roleLabel: { fontSize: 15, fontWeight: '800', color: '#1A1A2E', marginBottom: 2 },
  roleLabelActive: { color: '#F56E0F' },
  roleDesc: { fontSize: 12, color: '#6B7280', lineHeight: 17 },
  roleRadio: {
    width: 20, height: 20, borderRadius: 10,
    borderWidth: 2, borderColor: '#D1D5DB',
    alignItems: 'center', justifyContent: 'center',
  },
  roleRadioActive: { borderColor: '#F56E0F' },
  roleRadioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#F56E0F' },

  /* ── Step 2: Basic details ── */
  nameRow: { flexDirection: 'row', gap: 12 },
  inputGroup: { marginBottom: 18 },
  label: {
    fontSize: 11, fontWeight: '800', color: '#6B7280',
    textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 8,
  },
  optional: { fontWeight: '500', color: '#9CA3AF', textTransform: 'none', letterSpacing: 0 },
  input: {
    borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 12,
    paddingHorizontal: 14, height: 52,
    fontSize: 14, color: '#1A1A2E', fontWeight: '500',
    backgroundColor: '#FAFAFA',
  },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 12,
    paddingHorizontal: 14, height: 52, backgroundColor: '#FAFAFA',
  },
  inputRowError: { borderColor: '#EF4444' },
  inputIcon: { marginRight: 10 },
  textInput: { flex: 1, fontSize: 14, color: '#1A1A2E', fontWeight: '500' },

  /* ── Step 3: Password ── */
  hintBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: '#FFF7ED', borderRadius: 10, padding: 12,
    marginBottom: 20, borderWidth: 1, borderColor: 'rgba(245,110,15,0.2)',
  },
  hintText: { flex: 1, fontSize: 12, color: '#92400E', lineHeight: 18, fontWeight: '500' },

  strengthRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 },
  strengthBar: {
    flex: 1, height: 3, borderRadius: 2, backgroundColor: '#E5E7EB',
  },
  strengthBarFill: { backgroundColor: '#F59E0B' },
  strengthBarStrong: { backgroundColor: '#10B981' },
  strengthLabel: { fontSize: 11, fontWeight: '700', color: '#6B7280', marginLeft: 4, width: 40 },

  matchRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 6 },
  matchText: { fontSize: 12, color: '#10B981', fontWeight: '600' },

  /* ── Buttons ── */
  primaryBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: '#F56E0F', borderRadius: 14, height: 56,
    marginTop: 8, marginBottom: 24,
    shadowColor: '#F56E0F', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35, shadowRadius: 12, elevation: 8,
  },
  btnDisabled: { opacity: 0.6 },
  primaryBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800', letterSpacing: 0.3 },

  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  footerText: { fontSize: 14, color: '#6B7280' },
  loginLink: { fontSize: 14, color: '#F56E0F', fontWeight: '800' },
}));
