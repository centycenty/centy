import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, TextInput, Button, HelperText } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { useAuthStore } from '../../store/authStore';

type NavigationProp = StackNavigationProp<any>;
type RouteProp = any;

const OTPScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp>();
  const { login } = useAuthStore();
  
  const { phone } = route.params;
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(300); // 5 minutes

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleVerifyOTP = async () => {
    setError('');
    
    if (!otp.trim()) {
      setError('Please enter the OTP');
      return;
    }

    if (otp.length !== 6) {
      setError('OTP must be 6 digits');
      return;
    }

    setIsLoading(true);
    
    try {
      const success = await login(phone, otp);
      if (success) {
        // Navigation will be handled by the App component based on auth state
      } else {
        setError('Invalid OTP. Please try again.');
      }
    } catch (err) {
      setError('Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = () => {
    // Implement resend OTP logic
    setTimer(300);
    setOtp('');
    setError('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.logo}>🔧</Text>
          <Text style={styles.title}>Verify Phone Number</Text>
          <Text style={styles.subtitle}>
            Enter the 6-digit code sent to {phone}
          </Text>
        </View>

        <View style={styles.form}>
          <TextInput
            mode="outlined"
            label="OTP Code"
            placeholder="123456"
            value={otp}
            onChangeText={setOtp}
            keyboardType="number-pad"
            maxLength={6}
            style={styles.input}
            error={!!error}
            left={<TextInput.Icon icon="shield-check" />}
          />
          <HelperText type="error" visible={!!error}>
            {error}
          </HelperText>

          {timer > 0 && (
            <Text style={styles.timer}>
              Code expires in {formatTime(timer)}
            </Text>
          )}

          <Button
            mode="contained"
            onPress={handleVerifyOTP}
            loading={isLoading}
            disabled={isLoading || otp.length !== 6}
            style={styles.button}
            contentStyle={styles.buttonContent}
          >
            Verify OTP
          </Button>

          {timer === 0 && (
            <Button
              mode="text"
              onPress={handleResendOTP}
              style={styles.resendButton}
            >
              Resend OTP
            </Button>
          )}
        </View>

        <View style={styles.footer}>
          <Button
            mode="text"
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            Change Phone Number
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
    marginTop: 32,
  },
  logo: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6D6D70',
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  form: {
    flex: 1,
    marginBottom: 32,
  },
  input: {
    marginBottom: 8,
    textAlign: 'center',
  },
  timer: {
    fontSize: 14,
    color: '#FF9500',
    textAlign: 'center',
    marginBottom: 16,
  },
  button: {
    marginTop: 24,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  resendButton: {
    marginTop: 16,
    alignSelf: 'center',
  },
  footer: {
    alignItems: 'center',
  },
  backButton: {
    marginTop: 16,
  },
});

export default OTPScreen;