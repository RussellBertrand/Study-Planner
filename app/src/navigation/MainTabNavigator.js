import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import { COLORS } from '../constants/theme';

import DashboardScreen from '../screens/DashboardScreen';
import TasksScreen from '../screens/TasksScreen';
import ScheduleScreen from '../screens/ScheduleScreen';
import CoursesScreen from '../screens/CoursesScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textLight,
        tabBarStyle: {
          backgroundColor: COLORS.card,
          borderTopColor: COLORS.borderLight,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingBottom: Platform.OS === 'ios' ? 28 : 10,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Tasks') {
            iconName = focused ? 'checkbox' : 'checkbox-outline';
          } else if (route.name === 'Schedule') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Courses') {
            iconName = focused ? 'school' : 'school-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={20} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ tabBarLabel: 'Beranda' }}
      />
      <Tab.Screen
        name="Tasks"
        component={TasksScreen}
        options={{ tabBarLabel: 'Tugas' }}
      />
      <Tab.Screen
        name="Schedule"
        component={ScheduleScreen}
        options={{ tabBarLabel: 'Jadwal' }}
      />
      <Tab.Screen
        name="Courses"
        component={CoursesScreen}
        options={{ tabBarLabel: 'Kursus' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: 'Profil' }}
      />
    </Tab.Navigator>
  );
}

