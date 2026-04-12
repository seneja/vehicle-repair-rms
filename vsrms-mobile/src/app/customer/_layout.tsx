import React from 'react';
import { Tabs, Redirect } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';
import { View } from 'react-native';
import { Home, Search, CarFront, CalendarDays } from 'lucide-react-native';
import { CustomTabBar } from '@/components/navigation/CustomTabBar';
import { useUnistyles } from 'react-native-unistyles';

const ICONS = {
  index: Home,
  workshops: Search,
  vehicles: CarFront,
  schedule: CalendarDays,
};

const LABELS = {
  index: 'Home',
  workshops: 'Garages',
  vehicles: 'Vehicles',
  schedule: 'Schedule',
};

export default function TabsLayout() {
  const { user, isLoading } = useAuth();
  const { theme } = useUnistyles();

  if (isLoading) {
    return <View style={{ flex: 1, backgroundColor: theme.colors.white }} />;
  }

  if (!user) {
    return <Redirect href="/auth/login" />;
  }

  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} icons={ICONS} labels={LABELS} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="workshops" />
      <Tabs.Screen name="vehicles" />
      <Tabs.Screen name="schedule" />
    </Tabs>
  );
}
