import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { WorkerTabParamList } from '../types';
import WorkerHomeScreen from '../screens/worker/WorkerHomeScreen';
import WorkerBookingsScreen from '../screens/worker/WorkerBookingsScreen';
import EarningsScreen from '../screens/worker/EarningsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import TabBarIcon from '../components/TabBarIcon';

const Tab = createBottomTabNavigator<WorkerTabParamList>();

const WorkerTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => (
          <TabBarIcon route={route} focused={focused} color={color} size={size} />
        ),
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E5EA',
          paddingBottom: 8,
          height: 88,
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={WorkerHomeScreen}
        options={{ title: 'Home' }}
      />
      <Tab.Screen 
        name="Bookings" 
        component={WorkerBookingsScreen}
        options={{ title: 'Bookings' }}
      />
      <Tab.Screen 
        name="Earnings" 
        component={EarningsScreen}
        options={{ title: 'Earnings' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

export default WorkerTabNavigator;