import React from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity } from 'react-native';
import { Text, FAB, Searchbar, List, Avatar, Divider } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useApp } from '../contexts/AppContext';
import { useThemeColors } from '../utils/themeUtils';
import { Category } from '../models';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const CategoriesScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { categories } = useApp();
  const colors = useThemeColors();
  
  // Handle navigation to category details
  const handleCategoryPress = (categoryId: string) => {
    navigation.navigate('CategoryDetails', { categoryId });
  };
  
  // Handle navigation to add category
  const handleAddCategory = () => {
    navigation.navigate('EditCategory', {});
  };
  
  // Render category item
  const renderCategoryItem = ({ item }: { item: Category }) => (
    <TouchableOpacity
      onPress={() => handleCategoryPress(item.id)}
      style={[styles.categoryItem, { backgroundColor: colors.card }]}
    >
      <View style={[styles.categoryIcon, { backgroundColor: item.color }]}>
        <Text style={styles.categoryIconText}>{item.name.charAt(0)}</Text>
      </View>
      <View style={styles.categoryContent}>
        <Text style={[styles.categoryName, { color: colors.text }]}>{item.name}</Text>
        {item.isDefault && (
          <Text style={[styles.defaultBadge, { color: colors.subText }]}>Default</Text>
        )}
      </View>
      <Ionicons 
        name="chevron-forward" 
        size={20} 
        color={colors.subText} 
      />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Categories List */}
      <FlatList
        data={categories.sort((a, b) => a.name.localeCompare(b.name))}
        renderItem={renderCategoryItem}
        keyExtractor={item => item.id}
        ItemSeparatorComponent={() => <Divider style={{ backgroundColor: colors.border }} />}
        contentContainerStyle={styles.listContent}
      />
      
      {/* Add Button */}
      <FAB
        style={[styles.fab, { backgroundColor: colors.primary }]}
        icon="plus"
        onPress={handleAddCategory}
        color="white"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 80,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryIconText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  categoryContent: {
    flex: 1,
    marginLeft: 16,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '500',
  },
  defaultBadge: {
    fontSize: 12,
    marginTop: 4,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default CategoriesScreen; 