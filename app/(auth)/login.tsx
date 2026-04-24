import { Colors } from '@/src/constants/Colors';
import { useRouter } from 'expo-router';
import { ArrowRight, Lock, Mail } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // Navigasi ke halaman utama (tabs) setelah login berhasil
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Selamat Datang</Text>
          <Text style={styles.subtitle}>Masuk untuk melanjutkan kesehatan mentalmu</Text>
        </View>

        <View style={styles.form}>
          {/* Input Email */}
          <View style={styles.inputContainer}>
            <Mail size={20} color="#9CA3AF" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email Mahasiswa"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Input Password */}
          <View style={styles.inputContainer}>
            <Lock size={20} color="#9CA3AF" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity style={styles.forgotBtn}>
            <Text style={styles.forgotText}>Lupa Password?</Text>
          </TouchableOpacity>

          {/* Tombol Login */}
          <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
            <Text style={styles.loginBtnText}>Masuk</Text>
            <ArrowRight size={20} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* Bagian Daftar Sekarang */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Belum punya akun? </Text>
          <TouchableOpacity onPress={() => router.push('/register')}>
            <Text style={styles.registerText}>Daftar Sekarang</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  content: { flex: 1, padding: 30, justifyContent: 'center' },
  header: { marginBottom: 40 },
  title: { fontSize: 28, fontWeight: '800', color: '#111827', marginBottom: 10 },
  subtitle: { fontSize: 16, color: '#6B7280', lineHeight: 24 },
  form: { marginBottom: 30 },
  inputContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#F3F4F6', 
    borderRadius: 15, 
    marginBottom: 15, 
    paddingHorizontal: 15 
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, height: 55, fontSize: 15, color: '#111827' },
  forgotBtn: { alignSelf: 'flex-end', marginBottom: 30 },
  forgotText: { color: Colors.primary, fontWeight: '600' },
  loginBtn: { 
    backgroundColor: Colors.primary, 
    flexDirection: 'row', 
    height: 55, 
    borderRadius: 15, 
    justifyContent: 'center', 
    alignItems: 'center', 
    gap: 10,
    elevation: 4
  },
  loginBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  footerText: { color: '#6B7280', fontSize: 15 },
  registerText: { color: Colors.primary, fontSize: 15, fontWeight: '700' }
});