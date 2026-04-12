import React from 'react';
import { Tabs } from 'expo-router';
import { ListTodo, CalendarClock, Activity, FileText } from 'lucide-react-native';
import { CustomTabBar } from '@/components/navigation/CustomTabBar';

const ICONS = {
  index: ListTodo,
  appointments: CalendarClock,
  tracker: Activity,
  record: FileText,
};

const LABELS = {
  index: 'Tasks',
  appointments: 'Appts',
  tracker: 'Tracker',
  record: 'Log',
};

export default function StaffLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} icons={ICONS} labels={LABELS} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="appointments" />
      <Tabs.Screen name="tracker" />
      <Tabs.Screen name="record" />
    </Tabs>
  );
}
