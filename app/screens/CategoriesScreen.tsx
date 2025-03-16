import React from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity } from 'react-native';
import { Text, FAB, Searchbar, List, Avatar, Divider } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useApp } from '../contexts/AppContext';
import { useThemeColors } from '../utils/themeUtils';
import { Category } from '../models';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type CategoryScreenRouteProp = RouteProp<RootStackParamList, 'Categories'>;

const CategoriesScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<CategoryScreenRouteProp>();
  const { categories } = useApp();
  const colors = useThemeColors();
  
  // Get selection mode from route params
  const selectionMode = route.params?.selectionMode || false;
  
  // Handle category press based on mode
  const handleCategoryPress = (categoryId: string) => {
    if (selectionMode) {
      // In selection mode, return to previous screen with the selected category
      const selectedCategory = categories.find(c => c.id === categoryId);
      if (selectedCategory) {
        // Go back to AddExpense screen with the selected category
        navigation.navigate('AddExpense', { 
          categoryId: categoryId,
          categoryName: selectedCategory.name,
          categoryColor: selectedCategory.color
        });
      }
    } else {
      // In regular mode, navigate to category details
      navigation.navigate('CategoryDetails', { categoryId });
    }
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
      
      {/* Show different icon based on mode */}
      <Ionicons 
        name={selectionMode ? "checkmark-circle-outline" : "chevron-forward"} 
        size={20} 
        color={colors.subText} 
      />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Add selection mode title if in selection mode */}
      {selectionMode && (
        <View style={styles.selectionHeader}>
          <Text style={[styles.selectionHeaderText, { color: colors.text }]}>
            Select a category
          </Text>
        </View>
      )}
      
      {/* Categories List */}
      <FlatList
        data={categories.sort((a, b) => a.name.localeCompare(b.name))}
        renderItem={renderCategoryItem}
        keyExtractor={item => item.id}
        ItemSeparatorComponent={() => <Divider style={{ backgroundColor: colors.border }} />}
        contentContainerStyle={styles.listContent}
      />
      
      {/* Only show Add button in non-selection mode */}
      {!selectionMode && (
        <FAB
          style={[styles.fab, { backgroundColor: colors.primary }]}
          icon="plus"
          onPress={handleAddCategory}
          color="white"
        />
      )}
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
  selectionHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  selectionHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default CategoriesScreen;