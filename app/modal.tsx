import { StyleSheet, TextInput, TouchableOpacity, ScrollView, View, useColorScheme, KeyboardAvoidingView, Platform, Image, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { ThemedText } from '@/components/themed-text';
import { saveNote } from '@/services/storage';
import { scheduleReminderNotification } from '@/services/notifications';
import { Colors, Typography } from '@/constants/theme';

export default function ModalScreen() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [days, setDays] = useState('1');

  const themeColors = Colors.dark;
  const insets = useSafeAreaInsets();

  const handleSave = async () => {
    if (!title || !description || !days) {
      Alert.alert('Error', 'Por favor completa todos los campos.');
      return;
    }

    const intervalDays = parseInt(days, 10);
    if (isNaN(intervalDays) || intervalDays <= 0) {
      Alert.alert('Error', 'El número de días debe ser mayor a 0.');
      return;
    }

    try {
      const notificationId = await scheduleReminderNotification(title, description, intervalDays);
      
      const newNote = {
        id: Date.now().toString(),
        title,
        description,
        intervalDays,
        notificationId,
      };

      await saveNote(newNote);
      router.back();
    } catch (e) {
      Alert.alert('Error', 'Hubo un problema al guardar el recordatorio.');
      console.error(e);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      {/* Absolute Glows */}
      <View style={styles.topGlow} />
      <View style={styles.bottomGlow} />

      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: 220 + insets.bottom }]} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.hero}>
          <ThemedText style={[styles.heroTag, Typography.label, { color: themeColors.onSurfaceVariant }]}>
            PREMIUM CURATOR
          </ThemedText>
          <ThemedText style={[styles.heroTitle, Typography.display, { fontSize: 52, lineHeight: 56 }]}>
            Crear Nuevo
          </ThemedText>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.fieldGroup}>
            <ThemedText style={[styles.fieldLabel, Typography.label, { color: themeColors.onSurfaceVariant }]}>TÍTULO</ThemedText>
            <View style={[styles.inputWrapper, { backgroundColor: themeColors.surfaceContainerLowest, borderColor: themeColors.outlineVariant + '30' }]}>
              <TextInput
                style={[styles.input, Typography.title, { color: themeColors.text }]}
                placeholder="¿Qué necesitas recordar?"
                placeholderTextColor={themeColors.onSurfaceVariant + '60'}
                value={title}
                onChangeText={setTitle}
              />
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <ThemedText style={[styles.fieldLabel, Typography.label, { color: themeColors.onSurfaceVariant }]}>DESCRIPCIÓN</ThemedText>
            <View style={[styles.inputWrapper, { backgroundColor: themeColors.surfaceContainerLow, borderColor: themeColors.outlineVariant + '30', height: 120 }]}>
              <TextInput
                style={[styles.input, Typography.body, { color: themeColors.onSurfaceVariant, height: '100%', textAlignVertical: 'top' }]}
                placeholder="Añade detalles adicionales o notas..."
                placeholderTextColor={themeColors.onSurfaceVariant + '40'}
                value={description}
                onChangeText={setDescription}
                multiline
              />
            </View>
          </View>

          <View style={styles.frequencyRow}>
            <View style={{ flex: 1 }}>
              <ThemedText style={[styles.fieldLabel, Typography.label, { color: themeColors.onSurfaceVariant }]}>NOTIFICAR CADA</ThemedText>
              <View style={[styles.pillInput, { backgroundColor: themeColors.surfaceContainer, borderColor: themeColors.outlineVariant + '30' }]}>
                <TextInput
                  style={[styles.freqInput, Typography.headline, { color: themeColors.primary }]}
                  keyboardType="numeric"
                  value={days}
                  onChangeText={setDays}
                />
                <ThemedText style={[styles.freqUnit, Typography.body, { color: themeColors.onSurfaceVariant }]}>días</ThemedText>
              </View>
            </View>
            <View style={styles.decorationContainer}>
                <LinearGradient 
                  colors={[themeColors.primary + '30', themeColors.secondary + '30']}
                  style={styles.decorationOverlay}
                />
                <Image 
                  source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAbEygc0pMFKcVPgLvMntHKEhB4tc7mrZCoS2fzM0fxbJkfBiQCsc0V7EQrmbl5E8LFckXb-kZWsH0W_p3kvwqJrt5hJtP5ptddIGi8xhOaavisAg6zBdOffv8FUWRvDmlEN8gmgvxoJGPtZovMboLP6QuwrGmfTDJDMG9sZj52EDovRjwdfpiZAOKLq5mHHOqXjETrrkRJ63uslkca6Xz1Xe-s9yGob1pTPDA5Z6QEKIrbkNiT5JozmSGzG9O6m7XUgxwy_JpF2vg' }}
                  style={styles.decorationImg}
                />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Fixed Action Bottom */}
      <View style={[styles.actionContainer, { backgroundColor: 'rgba(26, 25, 27, 0.4)', paddingBottom: 32 + insets.bottom }]}>
        <TouchableOpacity 
          activeOpacity={0.9} 
          style={styles.submitButtonContainer}
          onPress={handleSave}
        >
          <LinearGradient
            colors={[themeColors.primary, themeColors.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.submitButton}
          >
            <Ionicons name="sparkles" size={20} color="#0e0e0f" />
            <ThemedText style={[styles.submitText, Typography.title, { color: '#0e0e0f' }]}>Crear Recordatorio</ThemedText>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0e0e0f',
  },
  topGlow: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 500,
    height: 500,
    borderRadius: 250,
    backgroundColor: 'rgba(148, 170, 255, 0.08)',
    zIndex: -1,
  },
  bottomGlow: {
    position: 'absolute',
    bottom: -100,
    left: -100,
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: 'rgba(166, 140, 255, 0.08)',
    zIndex: -1,
  },
  header: {
    paddingTop: 16,
    zIndex: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 8,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    color: '#FFF',
  },
  saveText: {
    fontSize: 16,
    fontWeight: '700',
  },
  headerDivider: {
    height: 2,
    width: '100%',
  },
  scrollContent: {
    paddingHorizontal: 28,
    paddingTop: 80,
    paddingBottom: 220,
  },
  hero: {
    marginBottom: 48,
  },
  heroTag: {
    marginBottom: 8,
  },
  heroTitle: {
    color: '#FFF',
  },
  form: {
    gap: 40,
  },
  fieldGroup: {},
  fieldLabel: {
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  inputWrapper: {
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 4,
  },
  input: {
    paddingVertical: 14,
  },
  frequencyRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 24,
  },
  pillInput: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 4,
    borderRadius: 99,
    borderWidth: 1,
  },
  freqInput: {
    width: 60,
    fontSize: 24,
    paddingVertical: 12,
  },
  freqUnit: {
    fontSize: 16,
    marginLeft: 4,
  },
  decorationContainer: {
    width: 120,
    height: 120,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.5,
    shadowRadius: 32,
    elevation: 10,
  },
  decorationOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  decorationImg: {
    width: '100%',
    height: '100%',
  },
  actionContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 32,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    zIndex: 100,
  },
  submitButtonContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    shadowColor: 'rgba(148, 170, 255, 0.4)',
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.6,
    shadowRadius: 32,
    elevation: 12,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    borderRadius: 99,
    gap: 12,
  },
  submitText: {
    fontSize: 18,
    fontWeight: '800',
  },
});
