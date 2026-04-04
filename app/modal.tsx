import { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, Alert, View, useColorScheme } from 'react-native';
import { router } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { saveNote } from '@/services/storage';
import { scheduleReminderNotification } from '@/services/notifications';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

export default function ModalScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [days, setDays] = useState('');

  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];

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
    <ThemedView style={styles.container}>
      <View style={styles.formContainer}>
        {/* Helper illustration/icon */}
        <View style={styles.iconWrapper}>
            <Ionicons name="create-outline" size={48} color={themeColors.tint} />
        </View>

        <ThemedText type="title" style={styles.mainTitle}>Nuevo Recordatorio</ThemedText>

        <View style={[styles.inputGroup, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.cardBorder }]}>
          <ThemedText style={styles.label}>TÍTULO</ThemedText>
          <TextInput
            style={[styles.input, { color: themeColors.text }]}
            placeholder="Ej: Tomar medicina"
            placeholderTextColor={themeColors.icon}
            value={title}
            onChangeText={setTitle}
          />
        </View>

        <View style={[styles.inputGroup, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.cardBorder }]}>
          <ThemedText style={styles.label}>DESCRIPCIÓN</ThemedText>
          <TextInput
            style={[styles.input, styles.textArea, { color: themeColors.text }]}
            placeholder="Ej: Pastilla para la presión"
            placeholderTextColor={themeColors.icon}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={[styles.inputGroup, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.cardBorder }]}>
          <ThemedText style={styles.label}>NOTIFICAR CADA (DÍAS)</ThemedText>
          <TextInput
            style={[styles.input, { color: themeColors.text }]}
            placeholder="Ej: 1"
            placeholderTextColor={themeColors.icon}
            value={days}
            onChangeText={setDays}
            keyboardType="numeric"
          />
        </View>

        <TouchableOpacity 
          style={[styles.button, { backgroundColor: themeColors.tint }]} 
          onPress={handleSave}
          activeOpacity={0.8}
        >
          <ThemedText style={styles.buttonText}>Crear Recordatorio</ThemedText>
          <Ionicons name="checkmark-circle-outline" size={24} color="#FFF" style={{marginLeft: 8}} />
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  formContainer: {
    marginTop: 20,
  },
  iconWrapper: {
    alignItems: 'center',
    marginBottom: 16,
  },
  mainTitle: {
    fontSize: 28,
    textAlign: 'center',
    marginBottom: 32,
  },
  inputGroup: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
    borderWidth: 1,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: 1,
    opacity: 0.6,
  },
  input: {
    fontSize: 18,
    paddingVertical: 4,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  button: {
    flexDirection: 'row',
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
