import React from 'react';
import { Tabs } from 'expo-router';
import { LayoutDashboard, CalendarRange, Wrench, Users, ClipboardList } from 'lucide-react-native';
import { CustomTabBar } from '@/components/navigation/CustomTabBar';

const ICONS = {
  index:    LayoutDashboard,
  bookings: CalendarRange,
  jobs:     Wrench,
  logs:     ClipboardList,
  staff:    Users,
};

const LABELS = {
  index:    'Stats',
  bookings: 'Bookings',
  jobs:     'Active',
  logs:     'Logs',
  staff:    'Staff',
};

export default function GarageLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} icons={ICONS} labels={LABELS} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="bookings" />
      <Tabs.Screen name="jobs" />
      <Tabs.Screen name="logs" />
      <Tabs.Screen name="staff" />
      {/* create-record file still exists as a route — hide it from the tab bar */}
      <Tabs.Screen name="create-record" options={{ href: null }} />
    </Tabs>
  );
}
