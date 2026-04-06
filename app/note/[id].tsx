import { StyleSheet, TextInput, TouchableOpacity, ScrollView, View, Platform, Alert, Image, KeyboardAvoidingView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState, useEffect } from 'react';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { getNoteById, deleteNote, updateNote, Note } from '@/services/storage';
import { cancelNotification, scheduleReminderNotification } from '@/services/notifications';
import { Colors, Typography } from '@/constants/theme';

export default function NoteDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [note, setNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const themeColors = Colors.dark;

  // Edit states
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editDays, setEditDays] = useState('');

  const loadNote = useCallback(async () => {
    if (typeof id === 'string') {
      const data = await getNoteById(id);
      if (data) {
        setNote(data);
        setEditTitle(data.title);
        setEditDescription(data.description);
        setEditDays(data.intervalDays.toString());
      } else {
        router.back();
      }
    }
  }, [id]);

  useEffect(() => {
    loadNote();
  }, [loadNote]);

  const handleDelete = async () => {
    if (!note) return;
    
    Alert.alert(
      "Eliminar Recordatorio",
      "¿Estás seguro de que quieres eliminar este recordatorio?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Eliminar", 
          style: "destructive",
          onPress: async () => {
            await cancelNotification(note.notificationId);
            await deleteNote(note.id);
            router.replace('/(tabs)');
          }
        }
      ]
    );
  };

  const handleUpdate = async () => {
    if (!note) return;

    if (!editTitle || !editDescription || !editDays) {
      Alert.alert('Error', 'Por favor completa todos los campos.');
      return;
    }

    const intervalDays = parseInt(editDays, 10);
    if (isNaN(intervalDays) || intervalDays <= 0) {
      Alert.alert('Error', 'El número de días debe ser mayor a 0.');
      return;
    }

    try {
      // Re-schedule notification if it's changing
      let notificationId = note.notificationId;
      if (editTitle !== note.title || intervalDays !== note.intervalDays || editDescription !== note.description) {
        await cancelNotification(note.notificationId);
        notificationId = await scheduleReminderNotification(editTitle, editDescription, intervalDays);
      }

      const updatedNote: Note = {
        ...note,
        title: editTitle,
        description: editDescription,
        intervalDays: intervalDays,
        notificationId: notificationId,
      };

      await updateNote(updatedNote);
      setNote(updatedNote);
      setIsEditing(false);
      Alert.alert('Éxito', 'Recordatorio actualizado correctamente.');
    } catch (e) {
      Alert.alert('Error', 'Hubo un problema al actualizar el recordatorio.');
      console.error(e);
    }
  };

  if (!note) return null;

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
      >
        {/* Background Blobs */}
        <View style={styles.topBlob} />
        
        {/* Custom Header */}
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <TouchableOpacity onPress={() => isEditing ? setIsEditing(false) : router.back()} style={styles.backButton}>
            <Ionicons name={isEditing ? "close" : "chevron-back"} size={28} color={themeColors.primary} />
          </TouchableOpacity>
          {!isEditing && (
            <TouchableOpacity onPress={handleDelete} style={styles.deleteIconButton}>
              <Ionicons name="trash-outline" size={24} color="#EF4444" />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView 
          contentContainerStyle={[styles.content, { paddingBottom: 150 + insets.bottom }]}
          showsVerticalScrollIndicator={false}
        >
          <ThemedText style={[styles.label, Typography.label, { color: themeColors.outline }]}>
            {isEditing ? 'EDITANDO' : 'RECORDATORIO'}
          </ThemedText>

          {isEditing ? (
            <TextInput
              style={[styles.titleInput, Typography.display, { color: '#FFF' }]}
              value={editTitle}
              onChangeText={setEditTitle}
              placeholder="Título"
              placeholderTextColor="rgba(255,255,255,0.2)"
              multiline
            />
          ) : (
            <ThemedText style={[styles.title, Typography.display, { color: '#FFF' }]}>{note.title}</ThemedText>
          )}

          <View style={styles.statsContainer}>
            <View style={[styles.statBox, { backgroundColor: themeColors.surfaceContainerLow }]}>
              <MaterialCommunityIcons name="clock-outline" size={20} color={themeColors.primary} />
              <View style={{ flex: 1 }}>
                <ThemedText style={[styles.statLabel, Typography.label, { color: themeColors.outline }]}>FRECUENCIA</ThemedText>
                {isEditing ? (
                  <View style={styles.inlineEditRow}>
                    <TextInput
                      style={[styles.statValueInput, Typography.title, { color: themeColors.primary, minWidth: 80, minHeight: 40 }]}
                      value={editDays}
                      onChangeText={setEditDays}
                      keyboardType="number-pad"
                      selectTextOnFocus={true}
                    />
                    <ThemedText style={[styles.statValueUnit, Typography.body, { color: themeColors.outline }]}> d.</ThemedText>
                  </View>
                ) : (
                  <ThemedText style={[styles.statValue, Typography.title]}>Cada {note.intervalDays} {note.intervalDays === 1 ? 'Día' : 'Días'}</ThemedText>
                )}
              </View>
            </View>
          </View>

          <View style={styles.descriptionSection}>
            <ThemedText style={[styles.label, Typography.label, { color: themeColors.outline }]}>NOTAS Y DETALLES</ThemedText>
            <View style={[styles.descriptionCard, { backgroundColor: themeColors.surfaceContainer }]}>
              {isEditing ? (
                <TextInput
                  style={[styles.descriptionInput, Typography.body, { color: themeColors.onSurfaceVariant }]}
                  value={editDescription}
                  onChangeText={setEditDescription}
                  placeholder="Añade notas..."
                  placeholderTextColor="rgba(255,255,255,0.1)"
                  multiline
                />
              ) : (
                <ThemedText style={[styles.descriptionText, Typography.body, { color: themeColors.onSurfaceVariant }]}>
                  {note.description}
                </ThemedText>
              )}
            </View>
          </View>

          {!isEditing && (
            <View style={styles.visualContainer}>
              <LinearGradient
                colors={[themeColors.primary + '20', themeColors.secondary + '20']}
                style={styles.visualOverlay}
              />
              <Image 
                source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAnD_G7U-qB7Jk5Yh6-c9h-V6f9y-0E_0I9bZ5z4E0z4m0l-X0H1I_2X3Z4A5B6C7D8E9F0G1H2I3J4K5L6M7N8O9P0Q1R2S3T4U5V6W7X8Y9Z0' }}
                style={styles.visualImage}
              />
              <MaterialCommunityIcons name="bell-ring-outline" size={80} color={themeColors.primary + '40'} style={styles.visualIcon} />
            </View>
          )}
        </ScrollView>

        {/* Footer Actions */}
        <View style={[styles.footer, { paddingBottom: insets.bottom + 24, backgroundColor: 'rgba(14, 14, 15, 0.8)' }]}>
          <TouchableOpacity 
            style={styles.actionButton} 
            activeOpacity={0.8}
            onPress={() => isEditing ? handleUpdate() : setIsEditing(true)}
          >
            <LinearGradient
              colors={isEditing ? ['#10B981', '#059669'] : [themeColors.primary, themeColors.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.actionButtonGradient}
            >
              <Ionicons name={isEditing ? "checkmark" : "pencil"} size={20} color="#0e0e0f" />
              <ThemedText style={[styles.actionButtonText, Typography.title, { color: '#0e0e0f' }]}>
                {isEditing ? 'Guardar Cambios' : 'Editar Recordatorio'}
              </ThemedText>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0e0e0f',
  },
  topBlob: {
    position: 'absolute',
    top: -150,
    left: -100,
    width: 600,
    height: 600,
    borderRadius: 300,
    backgroundColor: 'rgba(148, 170, 255, 0.05)',
    zIndex: -1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    zIndex: 10,
  },
  backButton: {
    padding: 12,
  },
  deleteIconButton: {
    padding: 12,
  },
  content: {
    paddingHorizontal: 28,
    paddingTop: 32,
  },
  label: {
    marginBottom: 12,
    letterSpacing: 1.5,
  },
  title: {
    fontSize: 42,
    lineHeight: 50,
    marginBottom: 40,
  },
  titleInput: {
    fontSize: 42,
    lineHeight: 50,
    marginBottom: 40,
    padding: 0,
  },
  statsContainer: {
    marginBottom: 48,
  },
  statBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(72, 72, 73, 0.1)',
  },
  statLabel: {
    fontSize: 10,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 18,
  },
  statValueInput: {
    fontSize: 24,
    fontWeight: '700',
    padding: 0,
  },
  statValueUnit: {
    fontSize: 16,
  },
  inlineEditRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  descriptionSection: {
    marginBottom: 48,
  },
  descriptionCard: {
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(72, 72, 73, 0.1)',
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 24,
  },
  descriptionInput: {
    fontSize: 16,
    lineHeight: 24,
    padding: 0,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  visualContainer: {
    height: 240,
    borderRadius: 32,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  visualOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  visualImage: {
    width: '100%',
    height: '100%',
    opacity: 0.3,
  },
  visualIcon: {
    position: 'absolute',
    zIndex: 2,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 28,
    paddingTop: 24,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    zIndex: 100,
  },
  actionButton: {
    width: '100%',
    shadowColor: '#94aaff',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    borderRadius: 99,
    gap: 12,
  },
  actionButtonText: {
    fontSize: 18,
    fontWeight: '800',
  },
});
