import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { Text, TextInput, Button, Surface } from 'react-native-paper';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../contexts/AppContext';
import { useThemeColors } from '../utils/themeUtils';
import { COLORS } from '../theme';

type EditCategoryScreenRouteProp = RouteProp<RootStackParamList, 'EditCategory'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Predefined colors for categories
const COLOR_OPTIONS = [
  COLORS.primary,
  COLORS.secondary,
  COLORS.food,
  COLORS.transport,
  COLORS.entertainment,
  COLORS.shopping,
  COLORS.health,
  COLORS.housing,
  COLORS.education,
  COLORS.utilities,
  COLORS.other,
];

// Predefined icons for categories
const ICON_OPTIONS: (keyof typeof Ionicons.glyphMap)[] = [
  'restaurant', 'car', 'film', 'cart', 'medkit', 
  'home', 'school', 'water', 'wallet', 'card', 
  'cash', 'gift', 'pricetags', 'airplane', 'fitness',
  'phone-portrait', 'shirt', 'cafe'
];

const EditCategoryScreen = () => {
  const route = useRoute<EditCategoryScreenRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { categoryId } = route.params || {};
  const { categories, addCategory, updateCategory } = useApp();
  const colors = useThemeColors();
  
  // Form state
  const [name, setName] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>(COLOR_OPTIONS[0]);
  const [selectedIcon, setSelectedIcon] = useState<string>(ICON_OPTIONS[0]);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [nameError, setNameError] = useState<string>('');
  
  // Load category data if editing
  useEffect(() => {
    if (categoryId) {
      const category = categories.find(c => c.id === categoryId);
      if (category) {
        setName(category.name);
        setSelectedColor(category.color);
        setSelectedIcon(category.icon);
        setIsEditing(true);
      }
    }
  }, [categoryId, categories]);
  
  // Handle save category
  const handleSaveCategory = async () => {
    // Validate form
    if (!name.trim()) {
      setNameError('Category name is required');
      return;
    }
    
    try {
      if (isEditing) {
        // Update existing category
        const category = categories.find(c => c.id === categoryId);
        if (category) {
          await updateCategory({
            ...category,
            name,
            color: selectedColor,
            icon: selectedIcon,
          });
        }
      } else {
        // Add new category
        await addCategory({
          name,
          color: selectedColor,
          icon: selectedIcon,
        });
      }
      
      // Navigate back
      navigation.goBack();
    } catch (error) {
      console.error('Error saving category:', error);
    }
  };
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView>
        {/* Name Input */}
        <Surface style={[styles.card, { backgroundColor: colors.card }]}>
          <TextInput
            label="Category Name"
            value={name}
            onChangeText={(text) => {
              setName(text);
              setNameError('');
            }}
            style={[styles.input, { backgroundColor: colors.card }]}
            error={!!nameError}
          />
          {nameError ? (
            <Text style={styles.errorText}>{nameError}</Text>
          ) : null}
        </Surface>
        
        {/* Color Selection */}
        <Surface style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Color</Text>
          <View style={styles.colorGrid}>
            {COLOR_OPTIONS.map((color, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.colorOption,
                  { backgroundColor: color },
                  selectedColor === color && styles.selectedColorOption,
                ]}
                onPress={() => setSelectedColor(color)}
              >
                {selectedColor === color && (
                  <Ionicons name="checkmark" size={20} color="white" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </Surface>
        
        {/* Icon Selection */}
        <Surface style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Icon</Text>
          <View style={styles.iconGrid}>
            {ICON_OPTIONS.map((icon, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.iconOption,
                  selectedIcon === icon && [
                    styles.selectedIconOption,
                    { backgroundColor: selectedColor }
                  ],
                ]}
                onPress={() => setSelectedIcon(icon)}
              >
                <Ionicons
                  name={icon}
                  size={24}
                  color={selectedIcon === icon ? 'white' : colors.text}
                />
              </TouchableOpacity>
            ))}
          </View>
        </Surface>
        
        {/* Submit Button */}
        <Button
          mode="contained"
          onPress={handleSaveCategory}
          style={[styles.saveButton, { backgroundColor: selectedColor }]}
        >
          {isEditing ? 'Update Category' : 'Add Category'}
        </Button>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
  },
  input: {
    marginBottom: 5,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 5,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    margin: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedColorOption: {
    borderWidth: 2,
    borderColor: 'white',
    elevation: 4,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  iconOption: {
    width: 50,
    height: 50,
    borderRadius: 25,
    margin: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  selectedIconOption: {
    elevation: 4,
  },
  saveButton: {
    marginVertical: 24,
    paddingVertical: 8,
  },
});

export default EditCategoryScreen; 