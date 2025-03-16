import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { COLORS } from '../theme';

const ExchangeRatesScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Exchange Rates Screen</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  text: {
    fontSize: 18,
    color: COLORS.black,
  },
});

export default ExchangeRatesScreen; 