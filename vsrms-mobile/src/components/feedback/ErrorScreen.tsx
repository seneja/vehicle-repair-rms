import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

export function ErrorScreen({
  onRetry,
  message = 'Something went wrong. Please try again.',
}: {
  onRetry: () => void;
  message?: string;
}) {
  const { theme } = useUnistyles();

  return (
    <View style={styles.container}>
      <View style={styles.iconBox}>
        <Ionicons name="cloud-offline-outline" size={40} color="#EF4444" />
      </View>
      <Text style={styles.title}>Unable to load</Text>
      <Text style={styles.message}>{message}</Text>
      <TouchableOpacity style={styles.button} onPress={onRetry} activeOpacity={0.85}>
        <Ionicons name="refresh-outline" size={16} color="#FFFFFF" />
        <Text style={styles.buttonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    backgroundColor: theme.colors.background, paddingHorizontal: 32,
  },
  iconBox: {
    width: 80, height: 80, borderRadius: 24,
    backgroundColor: '#FEF2F2',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1.5, borderColor: '#FECACA',
  },
  title: {
    fontSize: 20, fontWeight: '900', color: theme.colors.text,
    marginBottom: 8, letterSpacing: -0.5,
  },
  message: {
    fontSize: 14, color: theme.colors.muted, textAlign: 'center',
    lineHeight: 22, marginBottom: 28, fontWeight: '500',
  },
  button: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: theme.colors.brand,
    paddingHorizontal: 28, paddingVertical: 14,
    borderRadius: 14,
    shadowColor: theme.colors.brand,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25, shadowRadius: 8, elevation: 6,
  },
  buttonText: { color: '#FFFFFF', fontWeight: '800', fontSize: 15 },
}));
