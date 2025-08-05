import React from 'react';
import { RouteProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

interface TabBarIconProps {
  route: RouteProp<any, any>;
  focused: boolean;
  color: string;
  size: number;
}

const TabBarIcon: React.FC<TabBarIconProps> = ({ route, focused, color, size }) => {
  let iconName: string;

  switch (route.name) {
    case 'Home':
      iconName = focused ? 'home' : 'home-outline';
      break;
    case 'Search':
      iconName = focused ? 'search' : 'search-outline';
      break;
    case 'Bookings':
      iconName = focused ? 'calendar' : 'calendar-outline';
      break;
    case 'Earnings':
      iconName = focused ? 'wallet' : 'wallet-outline';
      break;
    case 'Profile':
      iconName = focused ? 'person' : 'person-outline';
      break;
    default:
      iconName = 'help-outline';
  }

  return <Icon name={iconName} size={size} color={color} />;
};

export default TabBarIcon;