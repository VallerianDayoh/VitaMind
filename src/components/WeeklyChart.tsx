import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../constants/Colors';

const DATA = [
  { day: 'S', value: 40 },
  { day: 'S', value: 70 },
  { day: 'R', value: 50 },
  { day: 'K', value: 90 },
  { day: 'J', value: 65 },
  { day: 'S', value: 80 },
  { day: 'M', value: 30 },
];

export const WeeklyChart = () => {
  return (
    <View style={styles.container}>
      <View style={styles.chartRow}>
        {DATA.map((item, index) => (
          <View key={index} style={styles.barColumn}>
            <View style={styles.barBackground}>
              <View style={[styles.barValue, { height: `${item.value}%` }]} />
            </View>
            <Text style={styles.dayLabel}>{item.day}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginTop: 10 },
  chartRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 120 },
  barColumn: { alignItems: 'center', flex: 1 },
  barBackground: { width: 12, height: 100, backgroundColor: Colors.surface, borderRadius: 10, justifyContent: 'flex-end', overflow: 'hidden' },
  barValue: { width: '100%', backgroundColor: Colors.primary, borderRadius: 10 },
  dayLabel: { marginTop: 8, fontSize: 12, color: Colors.textSecondary, fontWeight: '600' }
});