import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../constants/theme';

import DashboardScreen from '../screens/DashboardScreen';
import TasksScreen from '../screens/TasksScreen';
import ScheduleScreen from '../screens/ScheduleScreen';
import CoursesScreen from '../screens/CoursesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import StudyMateModal from '../components/StudyMateModal';

const Tab = createBottomTabNavigator();

export default function MainTabNavigator() {
  const [aiModalVisible, setAiModalVisible] = useState(false);

  return (
    <View style={styles.container}>
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

      {/* Floating StudyMate AI FAB (Tersedia di semua tab) */}
      <TouchableOpacity
        style={[styles.floatingAiBtn, SHADOWS.md]}
        onPress={() => setAiModalVisible(true)}
        activeOpacity={0.85}
      >
        <View style={styles.onlineDot} />
        <Text style={{ fontSize: 18 }}>🤖</Text>
      </TouchableOpacity>

      {/* StudyMate AI Modal */}
      <StudyMateModal
        visible={aiModalVisible}
        onClose={() => setAiModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  floatingAiBtn: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 98 : 74,
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  onlineDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
});
