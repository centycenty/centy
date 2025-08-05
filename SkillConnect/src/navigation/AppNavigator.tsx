import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuthStore } from '../store/authStore';
import CustomerTabNavigator from './CustomerTabNavigator';
import WorkerTabNavigator from './WorkerTabNavigator';
import WorkerDetailScreen from '../screens/WorkerDetailScreen';
import BookingDetailScreen from '../screens/BookingDetailScreen';
import ChatScreen from '../screens/ChatScreen';
import MapScreen from '../screens/MapScreen';
import { RootStackParamList } from '../types';

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  const { user } = useAuthStore();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      {user?.type === 'customer' ? (
        <Stack.Screen name="CustomerHome" component={CustomerTabNavigator} />
      ) : (
        <Stack.Screen name="WorkerHome" component={WorkerTabNavigator} />
      )}
      
      {/* Shared screens */}
      <Stack.Screen 
        name="WorkerDetail" 
        component={WorkerDetailScreen}
        options={{ headerShown: true, title: 'Worker Profile' }}
      />
      <Stack.Screen 
        name="BookingDetail" 
        component={BookingDetailScreen}
        options={{ headerShown: true, title: 'Booking Details' }}
      />
      <Stack.Screen 
        name="Chat" 
        component={ChatScreen}
        options={{ headerShown: true, title: 'Chat' }}
      />
      <Stack.Screen 
        name="Map" 
        component={MapScreen}
        options={{ headerShown: true, title: 'Map' }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;