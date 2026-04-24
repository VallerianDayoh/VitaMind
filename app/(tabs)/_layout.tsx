import { Colors } from '@/src/constants/Colors';
import { Tabs } from 'expo-router';
import { Compass, GlassWater, Home, Moon, Smile, User } from 'lucide-react-native';
import React from 'react';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarStyle: {
          height: 60,
          paddingBottom: 10,
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#F3F4F6',
        },
        headerShown: false,
      }}>
      
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Home color={color} size={24} />,
        }}
      />

      <Tabs.Screen
        name="mood"
        options={{
          title: 'Mood',
          tabBarIcon: ({ color }) => <Smile color={color} size={24} />,
        }}
      />

      <Tabs.Screen
        name="sleep"
        options={{
          title: 'Tidur',
          tabBarIcon: ({ color }) => <Moon color={color} size={24} />,
        }}
      />

      <Tabs.Screen
        name="water"
        options={{
          title: 'Air',
          tabBarIcon: ({ color }) => <GlassWater color={color} size={24} />,
        }}
      />

      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => <Compass color={color} size={24} />,
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color }) => <User color={color} size={24} />,
        }}
      />

      {/* Tetap ada tapi tidak muncul di menu bawah */}
      <Tabs.Screen
        name="chat"
        options={{
          href: null, 
        }}
      />
    </Tabs>
  );
}