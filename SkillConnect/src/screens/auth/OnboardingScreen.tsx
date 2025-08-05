import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, Card } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

type NavigationProp = StackNavigationProp<any>;

const OnboardingScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  const handleUserTypeSelection = (userType: 'customer' | 'worker') => {
    navigation.navigate('Register', { userType });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.logo}>🔧</Text>
          <Text style={styles.title}>Welcome to SkillConnect</Text>
          <Text style={styles.subtitle}>
            Connect with skilled workers or offer your services
          </Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Choose your role:</Text>
          
          <Card style={styles.card} onPress={() => handleUserTypeSelection('customer')}>
            <Card.Content style={styles.cardContent}>
              <Text style={styles.cardIcon}>🏠</Text>
              <Text style={styles.cardTitle}>I need services</Text>
              <Text style={styles.cardSubtitle}>
                Find and book skilled workers for your needs
              </Text>
            </Card.Content>
          </Card>

          <Card style={styles.card} onPress={() => handleUserTypeSelection('worker')}>
            <Card.Content style={styles.cardContent}>
              <Text style={styles.cardIcon}>👷</Text>
              <Text style={styles.cardTitle}>I offer services</Text>
              <Text style={styles.cardSubtitle}>
                Register as a skilled worker and find clients
              </Text>
            </Card.Content>
          </Card>
        </View>

        <View style={styles.footer}>
          <Button
            mode="text"
            onPress={() => navigation.navigate('Login')}
            style={styles.loginButton}
          >
            Already have an account? Login
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
  content: {
    flex: 1,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 24,
    textAlign: 'center',
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  cardContent: {
    alignItems: 'center',
    padding: 24,
  },
  cardIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#6D6D70',
    textAlign: 'center',
  },
  footer: {
    alignItems: 'center',
  },
  loginButton: {
    marginTop: 16,
  },
});

export default OnboardingScreen;