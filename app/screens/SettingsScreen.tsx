import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { List, Switch, Divider, Text, RadioButton } from 'react-native-paper';
import { useApp } from '../contexts/AppContext';
import { useThemeColors } from '../utils/themeUtils';

const SettingsScreen = () => {
  const { settings, updateSettings, themeMode, setThemeMode } = useApp();
  const colors = useThemeColors();

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setThemeMode(newTheme);
  };

  const handleNotificationToggle = () => {
    if (settings) {
      updateSettings({
        notificationsEnabled: !settings.notificationsEnabled
      });
    }
  };

  const handleAutoSyncToggle = () => {
    if (settings) {
      updateSettings({
        autoSync: !settings.autoSync
      });
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView>
        <List.Section>
          <List.Subheader style={{ color: colors.text }}>Appearance</List.Subheader>
          
          <List.Item
            title="Theme"
            description="Choose how Expensaur looks"
            titleStyle={{ color: colors.text }}
            descriptionStyle={{ color: colors.subText }}
            left={props => <List.Icon {...props} icon="theme-light-dark" color={colors.primary} />}
          />
          
          <RadioButton.Group onValueChange={value => handleThemeChange(value as any)} value={themeMode}>
            <View style={styles.radioOption}>
              <RadioButton value="light" />
              <Text style={[styles.radioText, { color: colors.text }]}>Light Mode</Text>
            </View>
            <View style={styles.radioOption}>
              <RadioButton value="dark" />
              <Text style={[styles.radioText, { color: colors.text }]}>Dark Mode</Text>
            </View>
            <View style={styles.radioOption}>
              <RadioButton value="system" />
              <Text style={[styles.radioText, { color: colors.text }]}>System Default</Text>
            </View>
          </RadioButton.Group>
          
          <Divider style={[styles.divider, { backgroundColor: colors.border }]} />
          
          <List.Subheader style={{ color: colors.text }}>Notifications</List.Subheader>
          
          <List.Item
            title="Enable Notifications"
            description="Get reminders and updates"
            titleStyle={{ color: colors.text }}
            descriptionStyle={{ color: colors.subText }}
            left={props => <List.Icon {...props} icon="bell" color={colors.primary} />}
            right={() => (
              <Switch
                value={settings?.notificationsEnabled ?? false}
                onValueChange={handleNotificationToggle}
                color={colors.primary}
              />
            )}
          />
          
          <Divider style={[styles.divider, { backgroundColor: colors.border }]} />
          
          <List.Subheader style={{ color: colors.text }}>Data</List.Subheader>
          
          <List.Item
            title="Auto Sync"
            description="Automatically sync data when changes are made"
            titleStyle={{ color: colors.text }}
            descriptionStyle={{ color: colors.subText }}
            left={props => <List.Icon {...props} icon="sync" color={colors.primary} />}
            right={() => (
              <Switch
                value={settings?.autoSync ?? false}
                onValueChange={handleAutoSyncToggle}
                color={colors.primary}
              />
            )}
          />
          
          <List.Item
            title="Default Currency"
            description={settings?.defaultCurrency || 'USD'}
            titleStyle={{ color: colors.text }}
            descriptionStyle={{ color: colors.subText }}
            left={props => <List.Icon {...props} icon="currency-usd" color={colors.primary} />}
            onPress={() => {/* Navigate to currency selection */}}
          />
          
          <Divider style={[styles.divider, { backgroundColor: colors.border }]} />
          
          <List.Subheader style={{ color: colors.text }}>About</List.Subheader>
          
          <List.Item
            title="Version"
            description="1.0.0"
            titleStyle={{ color: colors.text }}
            descriptionStyle={{ color: colors.subText }}
            left={props => <List.Icon {...props} icon="information" color={colors.primary} />}
          />
        </List.Section>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  divider: {
    height: 1,
    marginVertical: 8,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  radioText: {
    marginLeft: 8,
    fontSize: 16,
  },
});

export default SettingsScreen; 