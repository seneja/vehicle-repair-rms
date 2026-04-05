import React, { useEffect } from 'react';
import { Tabs, Redirect } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

const BRAND = '#F56E0F'; // Precise requested orange
const WHITE = '#FFFFFF';
const MUTED = '#6B7280';
const TEXT = '#1A1A2E';
const BORDER = '#E5E7EB';

/**
 * Premium Animated Tab Icon Component
 * Handles scaling and pill background transition
 */
function AnimatedTabIcon({
  iconName,
  focused,
  label
}: {
  iconName: { active: keyof typeof Ionicons.glyphMap; inactive: keyof typeof Ionicons.glyphMap };
  focused: boolean;
  label: string;
}) {
  const scale = useSharedValue(focused ? 1.1 : 1);
  const pillOpacity = useSharedValue(focused ? 1 : 0);

  useEffect(() => {
    scale.value = withSpring(focused ? 1.15 : 1, { damping: 15 });
    pillOpacity.value = withSpring(focused ? 1 : 0);
  }, [focused]);

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const animatedPillStyle = useAnimatedStyle(() => ({
    opacity: pillOpacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={styles.tabItemContainer}>
      <Animated.View style={[styles.pill, animatedPillStyle]} />
      <Animated.View style={[styles.iconWrapper, animatedIconStyle]}>
        <Ionicons
          name={focused ? iconName.active : iconName.inactive}
          size={24}
          color={focused ? BRAND : MUTED}
        />
        <Text style={[
          styles.label,
          { color: focused ? BRAND : MUTED, fontWeight: focused ? '800' : '600' }
        ]}>
          {label}
        </Text>
      </Animated.View>
    </View>
  );
}

export default function TabsLayout() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <View style={{ flex: 1, backgroundColor: WHITE }} />;
  }

  if (!user) {
    return <Redirect href="/auth/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false, // Custom component handles label
        tabBarActiveTintColor: BRAND,
        tabBarInactiveTintColor: MUTED,
        tabBarStyle: {
          backgroundColor: WHITE,
          borderTopWidth: 0,
          height: 85,
          paddingBottom: 20,
          paddingTop: 10,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 25,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -8 },
          shadowOpacity: 0.12,
          shadowRadius: 16,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }: { focused: boolean }) => (
            <AnimatedTabIcon
              iconName={{ active: 'speedometer', inactive: 'speedometer-outline' }}
              focused={focused}
              label="Dashboard"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          tabBarIcon: ({ focused }: { focused: boolean }) => (
            <AnimatedTabIcon
              iconName={{ active: 'map', inactive: 'map-outline' }}
              focused={focused}
              label="Garages"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="vehicles"
        options={{
          tabBarIcon: ({ focused }: { focused: boolean }) => (
            <AnimatedTabIcon
              iconName={{ active: 'car-sport', inactive: 'car-sport-outline' }}
              focused={focused}
              label="Vehicles"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="appointments"
        options={{
          tabBarIcon: ({ focused }: { focused: boolean }) => (
            <AnimatedTabIcon
              iconName={{ active: 'calendar', inactive: 'calendar-outline' }}
              focused={focused}
              label="Schedule"
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabItemContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    width: 80,
  },
  pill: {
    position: 'absolute',
    width: 60,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(245, 110, 15, 0.08)', // Very soft soft orange
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 10,
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
