import React, { useEffect, useState } from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { useAuthStore } from './store/authStore';
import { lightTheme, darkTheme } from './utils/theme';
import AuthNavigator from './navigation/AuthNavigator';
import AppNavigator from './navigation/AppNavigator';
import SplashScreen from './screens/SplashScreen';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const colorScheme = useColorScheme();
  const { isAuthenticated, initializeAuth } = useAuthStore();

  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;

  useEffect(() => {
    const initApp = async () => {
      try {
        await initializeAuth();
      } catch (error) {
        console.error('App initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initApp();
  }, [initializeAuth]);

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PaperProvider theme={{
          ...theme,
          colors: {
            ...theme.colors,
            primary: theme.colors.primary,
            background: theme.colors.background,
            surface: theme.colors.surface,
            accent: theme.colors.accent,
            error: theme.colors.error,
            text: theme.colors.text,
            onSurface: theme.colors.text,
            disabled: theme.colors.textSecondary,
            placeholder: theme.colors.textSecondary,
            backdrop: 'rgba(0, 0, 0, 0.5)',
            notification: theme.colors.accent,
          },
        }}>
          <StatusBar
            barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
            backgroundColor={theme.colors.background}
          />
          <NavigationContainer
            theme={{
              dark: colorScheme === 'dark',
              colors: {
                primary: theme.colors.primary,
                background: theme.colors.background,
                card: theme.colors.surface,
                text: theme.colors.text,
                border: theme.colors.border,
                notification: theme.colors.accent,
              },
            }}
          >
            {isAuthenticated ? <AppNavigator /> : <AuthNavigator />}
          </NavigationContainer>
        </PaperProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;