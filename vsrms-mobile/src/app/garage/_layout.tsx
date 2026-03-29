import React, { useEffect } from 'react';
import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

const BRAND = '#F56E0F'; // Maintain branding consistency
const WHITE = '#FFFFFF';
const MUTED = '#6B7280';

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
          size={22}
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

export default function GarageLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
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
          tabBarIcon: ({ focused }) => (
            <AnimatedTabIcon
              iconName={{ active: 'stats-chart', inactive: 'stats-chart-outline' }}
              focused={focused}
              label="Overview"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          tabBarIcon: ({ focused }) => (
            <AnimatedTabIcon
              iconName={{ active: 'calendar-clear', inactive: 'calendar-clear-outline' }}
              focused={focused}
              label="Bookings"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="jobs"
        options={{
          tabBarIcon: ({ focused }) => (
            <AnimatedTabIcon
              iconName={{ active: 'hammer', inactive: 'hammer-outline' }}
              focused={focused}
              label="Jobs"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="create-record"
        options={{
          tabBarIcon: ({ focused }) => (
            <AnimatedTabIcon
              iconName={{ active: 'add-circle', inactive: 'add-circle-outline' }}
              focused={focused}
              label="Record"
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
    backgroundColor: 'rgba(245, 110, 15, 0.08)',
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
