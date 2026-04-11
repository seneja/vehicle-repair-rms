import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

export function EmptyState({
  message = 'No data found.',
  icon = 'document-outline',
}: {
  message?: string;
  icon?: keyof typeof Ionicons.glyphMap;
}) {
  const { theme } = useUnistyles();

  return (
    <View style={styles.container}>
      <View style={styles.iconBox}>
        <Ionicons name={icon} size={36} color={theme.colors.muted} />
      </View>
      <Text style={styles.message}>{message}</Text>
      <Text style={styles.hint}>Pull down to refresh</Text>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 32, paddingVertical: 48,
  },
  iconBox: {
    width: 72, height: 72, borderRadius: 20,
    backgroundColor: theme.colors.surface,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1.5, borderColor: theme.colors.border,
  },
  message: {
    fontSize: 16, fontWeight: '700', color: theme.colors.text,
    textAlign: 'center', marginBottom: 6, lineHeight: 22,
  },
  hint: {
    fontSize: 13, color: theme.colors.muted, textAlign: 'center', fontWeight: '500',
  },
}));
