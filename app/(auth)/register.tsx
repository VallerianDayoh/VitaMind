import { Colors } from '@/src/constants/Colors';
import { Stack, useRouter } from 'expo-router';
import { ArrowLeft, Lock, Mail, User } from 'lucide-react-native';
import React, { useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

export default function RegisterScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <SafeAreaView style={styles.container}>
      {/* Menghilangkan header hitam (auth)/register di bagian atas */}
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Mengatur warna bar status (baterai/jam) agar serasi dengan background putih */}
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        {/* Tombol Kembali (Custom) */}
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>Daftar Akun</Text>
          <Text style={styles.subtitle}>Mulai perjalanan sehatmu bersama MentalHealth UNKLAB</Text>
        </View>

        <View style={styles.form}>
          {/* Input Nama */}
          <View style={styles.inputContainer}>
            <User size={20} color="#9CA3AF" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Nama Lengkap"
              value={name}
              onChangeText={setName}
              placeholderTextColor="#9CA3AF"
            />
          </View>

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
              placeholderTextColor="#9CA3AF"
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
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Tombol Daftar */}
          <TouchableOpacity 
            style={styles.registerBtn} 
            onPress={() => router.replace('/(tabs)')}
          >
            <Text style={styles.registerBtnText}>Daftar</Text>
          </TouchableOpacity>
        </View>

        {/* Footer Navigasi ke Login */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Sudah punya akun? </Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.loginLink}>Masuk</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#FFFFFF' 
  },
  content: { 
    flex: 1, 
    paddingHorizontal: 30 
  },
  backBtn: { 
    marginTop: 20, 
    marginBottom: 20, 
    width: 40, 
    height: 40, 
    justifyContent: 'center' 
  },
  header: { 
    marginBottom: 30 
  },
  title: { 
    fontSize: 28, 
    fontWeight: '800', 
    color: '#111827', 
    marginBottom: 10 
  },
  subtitle: { 
    fontSize: 15, 
    color: '#6B7280', 
    lineHeight: 22 
  },
  form: { 
    marginBottom: 30 
  },
  inputContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#F3F4F6', 
    borderRadius: 16, 
    marginBottom: 16, 
    paddingHorizontal: 16 
  },
  inputIcon: { 
    marginRight: 12 
  },
  input: { 
    flex: 1, 
    height: 56, 
    fontSize: 15, 
    color: '#111827' 
  },
  registerBtn: { 
    backgroundColor: Colors.primary, 
    height: 56, 
    borderRadius: 16, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginTop: 12, 
    elevation: 4,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  registerBtnText: { 
    color: '#FFFFFF', 
    fontSize: 16, 
    fontWeight: '700' 
  },
  footer: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    marginTop: 10 
  },
  footerText: { 
    color: '#6B7280', 
    fontSize: 15 
  },
  loginLink: { 
    color: Colors.primary, 
    fontSize: 15, 
    fontWeight: '700' 
  }
});