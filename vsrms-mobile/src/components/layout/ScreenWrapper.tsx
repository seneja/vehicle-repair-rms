import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface ScreenWrapperProps {
  children: React.ReactNode;
  scroll?: boolean;
  bg?: string;
}

export function ScreenWrapper({ children, scroll = false, bg }: ScreenWrapperProps) {
  const insets = useSafeAreaInsets();
  const { theme } = useUnistyles();

  const content = (
    <View
      style={[
        styles.container,
        {
          paddingBottom: insets.bottom,
          backgroundColor: bg ?? theme.colors.background,
        },
      ]}
    >
      {children}
    </View>
  );

  if (scroll) {
    return (
      <KeyboardAwareScrollView contentContainerStyle={styles.scroll}>
        {content}
      </KeyboardAwareScrollView>
    );
  }
  return content;
}

const styles = StyleSheet.create(() => ({
  container: { flex: 1 },
  scroll: { flexGrow: 1 },
}));
