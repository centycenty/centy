import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, FlatList } from 'react-native';
import { Text, Card, Button, Searchbar, Chip } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/Ionicons';

import { useAuthStore } from '../../store/authStore';
import { workerCategories } from '../../utils/theme';
import { Worker } from '../../types';

type NavigationProp = StackNavigationProp<any>;

const CustomerHomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredWorkers, setFeaturedWorkers] = useState<Worker[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Simulate fetching featured workers
    setIsLoading(true);
    setTimeout(() => {
      setFeaturedWorkers([
        {
          id: '1',
          name: 'John Electrician',
          email: 'john@example.com',
          phone: '08012345678',
          type: 'worker',
          category: 'electrician',
          skills: ['Wiring', 'Installation', 'Repair'],
          experience: 5,
          availability: 'available',
          rating: 4.8,
          reviewCount: 124,
          hourlyRate: 5000,
          location: {
            latitude: 6.5244,
            longitude: 3.3792,
            address: 'Victoria Island, Lagos',
            city: 'Lagos',
            state: 'Lagos',
            country: 'Nigeria',
          },
          isVerified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        // Add more mock workers...
      ]);
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleSearch = () => {
    navigation.navigate('Search', { query: searchQuery });
  };

  const handleCategoryPress = (categoryId: string) => {
    navigation.navigate('Search', { category: categoryId });
  };

  const handleWorkerPress = (workerId: string) => {
    navigation.navigate('WorkerDetail', { workerId });
  };

  const renderCategoryItem = ({ item }: { item: typeof workerCategories[0] }) => (
    <Card style={styles.categoryCard} onPress={() => handleCategoryPress(item.id)}>
      <Card.Content style={styles.categoryContent}>
        <Text style={[styles.categoryIcon, { color: item.color }]}>{item.icon}</Text>
        <Text style={styles.categoryName}>{item.name}</Text>
      </Card.Content>
    </Card>
  );

  const renderWorkerItem = ({ item }: { item: Worker }) => (
    <Card style={styles.workerCard} onPress={() => handleWorkerPress(item.id)}>
      <Card.Content style={styles.workerContent}>
        <View style={styles.workerHeader}>
          <View style={styles.workerInfo}>
            <Text style={styles.workerName}>{item.name}</Text>
            <Text style={styles.workerCategory}>{item.category}</Text>
            <View style={styles.ratingContainer}>
              <Icon name="star" size={16} color="#FF9500" />
              <Text style={styles.rating}>{item.rating.toFixed(1)}</Text>
              <Text style={styles.reviewCount}>({item.reviewCount} reviews)</Text>
            </View>
          </View>
          {item.isVerified && (
            <Chip icon="check-circle" style={styles.verifiedChip}>
              Verified
            </Chip>
          )}
        </View>
        <Text style={styles.workerLocation}>{item.location.address}</Text>
        <Text style={styles.workerRate}>₦{item.hourlyRate?.toLocaleString()}/hr</Text>
      </Card.Content>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Hello, {user?.name || 'User'}! 👋</Text>
          <Text style={styles.subGreeting}>What service do you need today?</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Searchbar
            placeholder="Search for services..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            onSubmitEditing={handleSearch}
            style={styles.searchBar}
          />
        </View>

        {/* Emergency Button */}
        <Button
          mode="contained"
          icon="alert-circle"
          buttonColor="#FF3B30"
          onPress={() => {/* Handle emergency */}}
          style={styles.emergencyButton}
          contentStyle={styles.emergencyContent}
        >
          Emergency Help Needed!
        </Button>

        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Service Categories</Text>
          <FlatList
            data={workerCategories.slice(0, 6)}
            renderItem={renderCategoryItem}
            keyExtractor={(item) => item.id}
            numColumns={3}
            style={styles.categoriesGrid}
            scrollEnabled={false}
          />
          <Button
            mode="text"
            onPress={() => navigation.navigate('Search')}
            style={styles.viewAllButton}
          >
            View All Categories
          </Button>
        </View>

        {/* Featured Workers */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Workers</Text>
            <Button
              mode="text"
              onPress={() => navigation.navigate('Search')}
              compact
            >
              View All
            </Button>
          </View>
          
          {featuredWorkers.map((worker) => (
            <View key={worker.id}>
              {renderWorkerItem({ item: worker })}
            </View>
          ))}
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
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingBottom: 16,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  subGreeting: {
    fontSize: 16,
    color: '#6D6D70',
  },
  searchContainer: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  searchBar: {
    elevation: 2,
  },
  emergencyButton: {
    marginHorizontal: 24,
    marginBottom: 24,
  },
  emergencyContent: {
    paddingVertical: 8,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  categoriesGrid: {
    paddingHorizontal: 24,
  },
  categoryCard: {
    flex: 1,
    margin: 4,
    elevation: 1,
  },
  categoryContent: {
    alignItems: 'center',
    padding: 16,
  },
  categoryIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 12,
    textAlign: 'center',
    color: '#000000',
  },
  viewAllButton: {
    alignSelf: 'center',
    marginTop: 16,
  },
  workerCard: {
    marginHorizontal: 24,
    marginBottom: 12,
    elevation: 2,
  },
  workerContent: {
    padding: 16,
  },
  workerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  workerInfo: {
    flex: 1,
  },
  workerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  workerCategory: {
    fontSize: 14,
    color: '#007AFF',
    textTransform: 'capitalize',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 14,
    color: '#000000',
    marginLeft: 4,
    fontWeight: '500',
  },
  reviewCount: {
    fontSize: 12,
    color: '#6D6D70',
    marginLeft: 4,
  },
  verifiedChip: {
    backgroundColor: '#34C759',
  },
  workerLocation: {
    fontSize: 14,
    color: '#6D6D70',
    marginBottom: 4,
  },
  workerRate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
});

export default CustomerHomeScreen;