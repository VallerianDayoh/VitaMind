import { useMutation } from 'convex/react';
import { useState } from 'react';
import { Alert, Button, StyleSheet, Text, TextInput, View } from 'react-native';
import { api } from '../../convex/_generated/api';

export default function MonitoringScreen() {
  const [mood, setMood] = useState('5'); // Skala 1-10
  const [sleep, setSleep] = useState(''); // Jam tidur
  const addLog = useMutation(api.logs.addLog);

  const submitData = async () => {
    // Simpan Mood
    await addLog({ type: 'mood', value: parseInt(mood) });
    // Simpan Sleep
    await addLog({ type: 'sleep', value: parseFloat(sleep) });
    
    Alert.alert("Sukses", "Data harianmu sudah tersimpan!");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Monitoring Kesehatan</Text>
      
      <Text>Mood (1-10):</Text>
      <TextInput style={styles.input} value={mood} onChangeText={setMood} keyboardType="numeric" />
      
      <Text>Jam Tidur (misal: 7.5):</Text>
      <TextInput style={styles.input} value={sleep} onChangeText={setSleep} keyboardType="numeric" />
      
      <Button title="Simpan Log Hari Ini" onPress={submitData} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  input: { borderWidth: 1, padding: 10, marginBottom: 15, borderRadius: 5 }
});