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

// ─── Role definitions ─────────────────────────────────────────────────────────
type RoleLabel = 'Vehicle Owner' | 'Garage Owner';

const ROLES: { label: RoleLabel; icon: keyof typeof Ionicons.glyphMap; desc: string }[] = [
  {
    label: 'Vehicle Owner',
    icon: 'car-sport-outline',
    desc: 'Book workshops & track your vehicles',
  },
  {
    label: 'Garage Owner',
    icon: 'business-outline',
    desc: 'Manage your workshop & bookings',
  },
];

// ─── Step definitions ─────────────────────────────────────────────────────────
const STEPS = [
  { number: 1, title: 'Who are you?',        subtitle: 'Choose your role in VSRMS' },
  { number: 2, title: 'Basic information',   subtitle: 'Tell us a little about yourself' },
  { number: 3, title: 'Secure your account', subtitle: 'Create a strong password' },
];

// ─── Password strength helper ─────────────────────────────────────────────────
function getStrength(pw: string): { level: number; label: string } {
  if (pw.length === 0) return { level: 0, label: '' };
  if (pw.length < 8)   return { level: 1, label: 'Weak' };
  if (pw.length < 12)  return { level: 2, label: 'Good' };
  return { level: 3, label: 'Strong' };
}

// ─── Component ────────────────────────────────────────────────────────────────
export function RegisterScreen() {
  const router = useRouter();

  const [step, setStep]                   = useState(1);
  const [role, setRole]                   = useState<RoleLabel>('Vehicle Owner');
  const [firstName, setFirstName]         = useState('');
  const [lastName, setLastName]           = useState('');
  const [email, setEmail]                 = useState('');
  const [phone, setPhone]                 = useState('');
  const [password, setPassword]           = useState('');
  const [confirmPw, setConfirmPw]         = useState('');
  const [showPw, setShowPw]               = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState<string | null>(null);
  const [fieldErrors, setFieldErrors]     = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPw: ''
  });

  const clearFieldError = (field: keyof typeof fieldErrors) => {
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // ── Per-step validation ──────────────────────────────────────────────────────
  const validateStep = (): boolean => {
    setError(null);
    let newErrors = { firstName: '', lastName: '', email: '', password: '', confirmPw: '' };
    let isValid = true;

    if (step === 1) return true; // role always has a default
    
    if (step === 2) {
      if (!firstName.trim()) { newErrors.firstName = 'First name is required'; isValid = false; }
      if (!lastName.trim()) { newErrors.lastName = 'Last name is required'; isValid = false; }
      if (!email.trim() || !email.includes('@')) { newErrors.email = 'Valid email is required'; isValid = false; }
    }
    
    if (step === 3) {
      if (password.length < 8) { 
        newErrors.password = 'Password must be at least 8 characters'; 
        isValid = false; 
      }
      if (confirmPw.length === 0) {
        newErrors.confirmPw = 'Please confirm your password';
        isValid = false;
      } else if (password !== confirmPw) { 
        newErrors.confirmPw = 'Passwords do not match'; 
        isValid = false; 
      }
    }
    
    setFieldErrors(newErrors);
    return isValid;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    setStep(s => s + 1);
  };

  const handleBack = () => {
    setError(null);
    setFieldErrors({ firstName: '', lastName: '', email: '', password: '', confirmPw: '' });
    if (step === 1) { router.back(); return; }
    setStep(s => s - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    setLoading(true);
    setError(null);
    try {
      await register({
        firstName,
        lastName,
        email: email.trim().toLowerCase(),
        phone,
        password,
        role,
      });
      router.replace('/auth/login' as any);
    } catch (err: any) {
      setError(err?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const current  = STEPS[step - 1];
  const strength = getStrength(password);

  // ─── Strength bar colours ────────────────────────────────────────────────────
  const barClr = (idx: number) => {
    if (strength.level === 0) return '#E5E7EB';
    if (idx + 1 > strength.level) return '#E5E7EB';
    if (strength.level === 1) return '#EF4444';
    if (strength.level === 2) return '#F59E0B';
    return '#10B981';
  };

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
          {/* ── DARK TOP SECTION ── */}
          <View style={styles.topSection}>

            {/* Nav row */}
            <View style={styles.topRow}>
              <TouchableOpacity style={styles.backBtn} onPress={handleBack} activeOpacity={0.8}>
                <Ionicons name="chevron-back" size={20} color="#FFFFFF" />
              </TouchableOpacity>
              <AppLogoIcon size={34} />
            </View>

            {/* Step pill progress */}
            <View style={styles.stepPills}>
              {STEPS.map(s => (
                <View key={s.number} style={styles.stepPillWrap}>
                  <View
                    style={[
                      styles.stepPill,
                      step === s.number && styles.stepPillActive,
                      step > s.number  && styles.stepPillDone,
                    ]}
                  >
                    {step > s.number
                      ? <Ionicons name="checkmark" size={13} color="#FFFFFF" />
                      : <Text style={[styles.stepPillNum, step === s.number && styles.stepPillNumActive]}>
                          {s.number}
                        </Text>
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

            {/* Decorative circles (matching Login pill) */}
            <View style={styles.decCircle1} />
            <View style={styles.decCircle2} />
          </View>

          {/* ── WHITE FORM CARD ── */}
          <View style={styles.formCard}>

            {/* Server Error banner */}
            {error ? (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle" size={16} color="#B91C1C" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* ── STEP 1: Role selector ── */}
            {step === 1 && (
              <View style={styles.stepContent}>
                {ROLES.map(r => (
                  <TouchableOpacity
                    key={r.label}
                    style={[styles.roleCard, role === r.label && styles.roleCardActive]}
                    onPress={() => setRole(r.label)}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.roleIconBox, role === r.label && styles.roleIconBoxActive]}>
                      <Ionicons
                        name={r.icon}
                        size={24}
                        color={role === r.label ? '#FFFFFF' : '#6B7280'}
                      />
                    </View>
                    <View style={styles.roleTextCol}>
                      <Text style={[styles.roleLabel, role === r.label && styles.roleLabelActive]}>
                        {r.label}
                      </Text>
                      <Text style={styles.roleDesc}>{r.desc}</Text>
                    </View>
                    <View style={[styles.roleRadio, role === r.label && styles.roleRadioActive]}>
                      {role === r.label && <View style={styles.roleRadioDot} />}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* ── STEP 2: Basic details ── */}
            {step === 2 && (
              <View style={styles.stepContent}>
                {/* Name row */}
                <View style={styles.nameRow}>
                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.label}>First Name</Text>
                    <View style={[styles.inputRow, fieldErrors.firstName ? styles.inputRowError : null]}>
                      <Ionicons name="person-outline" size={17} color="#9CA3AF" style={styles.inputIcon} />
                      <TextInput
                        style={styles.textInput}
                        placeholder="John"
                        placeholderTextColor="#9CA3AF"
                        value={firstName}
                        onChangeText={(t) => { setFirstName(t); clearFieldError('firstName'); }}
                        autoCapitalize="words"
                        returnKeyType="next"
                        autoFocus
                      />
                    </View>
                    {fieldErrors.firstName ? <Text style={styles.inlineErrorText}>{fieldErrors.firstName}</Text> : null}
                  </View>

                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.label}>Last Name</Text>
                    <View style={[styles.inputRow, fieldErrors.lastName ? styles.inputRowError : null]}>
                      <TextInput
                        style={[styles.textInput, { paddingLeft: 12 }]}
                        placeholder="Perera"
                        placeholderTextColor="#9CA3AF"
                        value={lastName}
                        onChangeText={(t) => { setLastName(t); clearFieldError('lastName'); }}
                        autoCapitalize="words"
                        returnKeyType="next"
                      />
                    </View>
                    {fieldErrors.lastName ? <Text style={styles.inlineErrorText}>{fieldErrors.lastName}</Text> : null}
                  </View>
                </View>

                {/* Email */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Email Address</Text>
                  <View style={[styles.inputRow, fieldErrors.email ? styles.inputRowError : null]}>
                    <Ionicons name="mail-outline" size={18} color="#9CA3AF" style={styles.inputIcon} />
                    <TextInput
                      style={styles.textInput}
                      placeholder="john@example.com"
                      placeholderTextColor="#9CA3AF"
                      value={email}
                      onChangeText={(t) => { setEmail(t); clearFieldError('email'); }}
                      autoCapitalize="none"
                      keyboardType="email-address"
                      returnKeyType="next"
                      autoCorrect={false}
                    />
                  </View>
                  {fieldErrors.email ? <Text style={styles.inlineErrorText}>{fieldErrors.email}</Text> : null}
                </View>

                {/* Phone */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>
                    Phone{'  '}
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
                {/* Hint box */}
                <View style={styles.hintBox}>
                  <Ionicons name="information-circle-outline" size={16} color="#F56E0F" />
                  <Text style={styles.hintText}>
                    Use at least 8 characters with a mix of letters, numbers and symbols.
                  </Text>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Password</Text>
                  <View style={[styles.inputRow, fieldErrors.password ? styles.inputRowError : null]}>
                    <Ionicons name="lock-closed-outline" size={18} color="#9CA3AF" style={styles.inputIcon} />
                    <TextInput
                      style={styles.textInput}
                      placeholder="Min. 8 characters"
                      placeholderTextColor="#9CA3AF"
                      secureTextEntry={!showPw}
                      value={password}
                      onChangeText={(t) => { setPassword(t); clearFieldError('password'); }}
                      returnKeyType="next"
                      autoFocus
                    />
                    <TouchableOpacity onPress={() => setShowPw(v => !v)} hitSlop={10}>
                      <Ionicons
                        name={showPw ? 'eye-off-outline' : 'eye-outline'}
                        size={18}
                        color="#9CA3AF"
                      />
                    </TouchableOpacity>
                  </View>
                  {fieldErrors.password ? <Text style={styles.inlineErrorText}>{fieldErrors.password}</Text> : null}

                  {/* Strength bar */}
                  {password.length > 0 && !fieldErrors.password && (
                    <View style={styles.strengthRow}>
                      {[0, 1, 2].map(i => (
                        <View key={i} style={[styles.strengthBar, { backgroundColor: barClr(i) }]} />
                      ))}
                      <Text style={[
                        styles.strengthLabel,
                        strength.level === 1 && { color: '#EF4444' },
                        strength.level === 2 && { color: '#F59E0B' },
                        strength.level === 3 && { color: '#10B981' },
                      ]}>
                        {strength.label}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Confirm Password</Text>
                  <View style={[
                    styles.inputRow,
                    fieldErrors.confirmPw ? styles.inputRowError : null,
                    confirmPw.length > 0 && password === confirmPw && !fieldErrors.confirmPw ? styles.inputRowSuccess : null,
                  ]}>
                    <Ionicons name="shield-checkmark-outline" size={18} color="#9CA3AF" style={styles.inputIcon} />
                    <TextInput
                      style={styles.textInput}
                      placeholder="Re-enter password"
                      placeholderTextColor="#9CA3AF"
                      secureTextEntry={!showConfirmPw}
                      value={confirmPw}
                      onChangeText={(t) => { setConfirmPw(t); clearFieldError('confirmPw'); }}
                      returnKeyType="done"
                      onSubmitEditing={handleSubmit}
                    />
                    <TouchableOpacity onPress={() => setShowConfirmPw(v => !v)} hitSlop={10}>
                      <Ionicons
                        name={showConfirmPw ? 'eye-off-outline' : 'eye-outline'}
                        size={18}
                        color="#9CA3AF"
                      />
                    </TouchableOpacity>
                  </View>
                  {fieldErrors.confirmPw ? <Text style={styles.inlineErrorText}>{fieldErrors.confirmPw}</Text> : null}
                  {confirmPw.length > 0 && password === confirmPw && !fieldErrors.confirmPw && (
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
                    <View style={styles.btnInner}>
                      <Ionicons name="person-add-outline" size={18} color="#FFFFFF" />
                      <Text style={styles.primaryBtnText}>Create Account</Text>
                    </View>
                  )
                }
              </TouchableOpacity>
            )}

            {/* Sign-in link */}
            <View style={styles.signinRow}>
              <Text style={styles.signinText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.replace('/auth/login' as any)}>
                <Text style={styles.signinLink}>Sign In</Text>
              </TouchableOpacity>
            </View>

          </View>

          {/* ── FOOTER ── */}
          <View style={styles.footer}>
            <Ionicons name="shield-checkmark-outline" size={13} color="#9CA3AF" />
            <Text style={styles.footerText}> Secured by </Text>
            <Text style={styles.footerBrand}>Asgardeo · WSO2</Text>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create((_theme) => ({
  safe:   { flex: 1, backgroundColor: '#1A1A2E' },
  scroll: { flexGrow: 1 },

  /* ── Dark top — matches LoginScreen exactly ── */
  topSection: {
    backgroundColor: '#1A1A2E',
    paddingHorizontal: 28,
    paddingTop: 16,
    paddingBottom: 56,
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
  stepPills:      { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  stepPillWrap:   { flexDirection: 'row', alignItems: 'center' },
  stepPill: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  stepPillActive:      { backgroundColor: '#F56E0F', borderColor: '#F56E0F' },
  stepPillDone:        { backgroundColor: '#10B981', borderColor: '#10B981' },
  stepPillNum:         { fontSize: 12, fontWeight: '800', color: 'rgba(255,255,255,0.5)' },
  stepPillNumActive:   { color: '#FFFFFF' },
  stepConnector: {
    width: (SCREEN_W - 56 - 84) / 2,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.12)',
    marginHorizontal: 6,
  },
  stepConnectorDone:   { backgroundColor: '#10B981' },

  stepLabel:   { fontSize: 11, fontWeight: '700', color: '#F56E0F', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 },
  heading:     { fontSize: 30, fontWeight: '900', color: '#FFFFFF', letterSpacing: -0.7, marginBottom: 4 },
  headingSub:  { fontSize: 14, color: 'rgba(255,255,255,0.5)', fontWeight: '500' },

  decCircle1: {
    position: 'absolute', width: 130, height: 130, borderRadius: 65,
    backgroundColor: 'rgba(245,110,15,0.13)', top: -25, right: -25,
  },
  decCircle2: {
    position: 'absolute', width: 70, height: 70, borderRadius: 35,
    backgroundColor: 'rgba(245,110,15,0.08)', bottom: 10, right: 90,
  },

  /* ── White form card — matches LoginScreen exactly ── */
  formCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -28,
    paddingHorizontal: 28,
    paddingTop: 36,
    paddingBottom: 32,
    flex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 16,
  },
  stepContent:  { marginBottom: 8 },

  /* Error banner for Backend issues */
  errorBanner: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FEF2F2', borderRadius: 12, padding: 14,
    marginBottom: 24, gap: 8, borderWidth: 1, borderColor: '#FECACA',
  },
  errorText:  { color: '#B91C1C', fontSize: 13, fontWeight: '600', flex: 1 },

  /* Inline Field Errors */
  inputRowError: { borderColor: '#EF4444', backgroundColor: '#FEF2F2' },
  inlineErrorText: { color: '#EF4444', fontSize: 12, marginTop: 6, marginLeft: 4, fontWeight: '600' },

  /* ── Step 1: Role cards ── */
  roleCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    padding: 16, borderRadius: 16, marginBottom: 12,
    borderWidth: 1.5, borderColor: '#E5E7EB',
    backgroundColor: '#FAFAFA',
  },
  roleCardActive:    { borderColor: '#F56E0F', backgroundColor: '#FFF7ED' },
  roleIconBox: {
    width: 48, height: 48, borderRadius: 14,
    backgroundColor: '#F3F4F6',
    alignItems: 'center', justifyContent: 'center',
  },
  roleIconBoxActive: { backgroundColor: '#F56E0F' },
  roleTextCol:       { flex: 1 },
  roleLabel:         { fontSize: 15, fontWeight: '800', color: '#1A1A2E', marginBottom: 2 },
  roleLabelActive:   { color: '#F56E0F' },
  roleDesc:          { fontSize: 12, color: '#6B7280', lineHeight: 17 },
  roleRadio: {
    width: 20, height: 20, borderRadius: 10,
    borderWidth: 2, borderColor: '#D1D5DB',
    alignItems: 'center', justifyContent: 'center',
  },
  roleRadioActive:   { borderColor: '#F56E0F' },
  roleRadioDot:      { width: 10, height: 10, borderRadius: 5, backgroundColor: '#F56E0F' },

  /* ── Step 2 ── */
  nameRow:    { flexDirection: 'row', gap: 12 },
  inputGroup: { marginBottom: 20 },
  label: {
    fontSize: 12, fontWeight: '800', color: '#6B7280',
    textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 8,
  },
  optional: { fontWeight: '500', color: '#9CA3AF', textTransform: 'none', letterSpacing: 0 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 14,
    paddingHorizontal: 16, height: 54,
    backgroundColor: '#FAFAFA',
  },
  inputRowSuccess: { borderColor: '#10B981', backgroundColor: '#F0FDF4' },
  inputIcon:       { marginRight: 10 },
  textInput:       { flex: 1, fontSize: 15, color: '#1A1A2E', fontWeight: '500' },

  /* ── Step 3 ── */
  hintBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: '#FFF7ED', borderRadius: 10, padding: 12,
    marginBottom: 20, borderWidth: 1, borderColor: 'rgba(245,110,15,0.2)',
  },
  hintText: { flex: 1, fontSize: 12, color: '#92400E', lineHeight: 18, fontWeight: '500' },

  strengthRow:  { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 10 },
  strengthBar:  { flex: 1, height: 3, borderRadius: 2 },
  strengthLabel: { fontSize: 11, fontWeight: '700', color: '#6B7280', marginLeft: 2, width: 44 },

  matchRow:  { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 6 },
  matchText: { fontSize: 12, color: '#10B981', fontWeight: '600' },

  /* ── Buttons ── */
  primaryBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: '#F56E0F', borderRadius: 14, height: 56,
    marginTop: 8, marginBottom: 24,
    shadowColor: '#F56E0F', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35, shadowRadius: 12, elevation: 8,
  },
  btnDisabled:    { opacity: 0.6 },
  btnInner:       { flexDirection: 'row', alignItems: 'center', gap: 10 },
  primaryBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800', letterSpacing: 0.3 },

  /* Sign-in link */
  signinRow:  { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  signinText: { fontSize: 14, color: '#6B7280' },
  signinLink: { fontSize: 14, color: '#F56E0F', fontWeight: '800' },

  /* Footer */
  footer: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 20,
  },
  footerText:  { fontSize: 12, color: '#9CA3AF' },
  footerBrand: { fontSize: 12, color: '#F56E0F', fontWeight: '700' },
}));
