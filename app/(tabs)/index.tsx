import { StyleSheet, FlatList, TouchableOpacity, View, useColorScheme } from 'react-native';
import { useCallback, useState } from 'react';
import { useFocusEffect, Link, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { getNotes, deleteNote, Note } from '@/services/storage';
import { cancelNotification } from '@/services/notifications';
import { Colors } from '@/constants/theme';

export default function HomeScreen() {
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]);
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];

  const loadNotes = async () => {
    const loadedNotes = await getNotes();
    setNotes(loadedNotes);
  };

  useFocusEffect(
    useCallback(() => {
      loadNotes();
    }, [])
  );

  const handleDelete = async (id: string, notificationId: string) => {
    await cancelNotification(notificationId);
    await deleteNote(id);
    loadNotes();
  };

  const renderItem = ({ item }: { item: Note }) => (
    <View style={[styles.card, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.cardBorder }]}>
      <View style={styles.cardHeader}>
        <ThemedText type="subtitle" style={styles.title}>{item.title}</ThemedText>
        <TouchableOpacity onPress={() => handleDelete(item.id, item.notificationId)} style={styles.deleteButton}>
          <Ionicons name="trash-outline" size={24} color="#EF4444" />
        </TouchableOpacity>
      </View>
      <ThemedText style={styles.description}>{item.description}</ThemedText>
      
      <View style={[styles.badge, { backgroundColor: themeColors.tint + '1A' }]}>
        <Ionicons name="time-outline" size={16} color={themeColors.tint} style={styles.badgeIcon} />
        <ThemedText style={[styles.badgeText, { color: themeColors.tint }]}>
          Cada {item.intervalDays} {item.intervalDays === 1 ? 'día' : 'días'}
        </ThemedText>
      </View>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <View>
          <ThemedText type="title" style={styles.headerTitle}>Recordatorios</ThemedText>
          <ThemedText style={styles.headerSubtitle}>Tus tareas activas</ThemedText>
        </View>
      </View>

      {notes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name="notifications-off" size={48} color={themeColors.icon} />
          </View>
          <ThemedText style={styles.emptyText}>No tienes recordatorios activos.</ThemedText>
          <ThemedText style={styles.emptySubtext}>Toca el botón '+' para crear uno nuevo.</ThemedText>
        </View>
      ) : (
        <FlatList
          data={notes}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Floating Action Button */}
      <TouchableOpacity 
        style={[styles.fab, { backgroundColor: themeColors.tint }]}
        onPress={() => router.push('/modal')}
      >
        <Ionicons name="add" size={32} color="#FFF" />
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
  },
  headerTitle: {
    fontSize: 32,
    lineHeight: 38,
  },
  headerSubtitle: {
    fontSize: 16,
    opacity: 0.6,
    marginTop: 4,
  },
  fab: {
    position: 'absolute',
    bottom: 90,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    zIndex: 50,
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 120, // Space for FAB
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    marginTop: -60,
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(150, 150, 150, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    opacity: 0.6,
    textAlign: 'center',
  },
  card: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  title: {
    flex: 1,
    marginRight: 12,
    fontSize: 20,
  },
  deleteButton: {
    padding: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 12,
  },
  description: {
    marginBottom: 20,
    fontSize: 15,
    opacity: 0.8,
    lineHeight: 22,
  },
  badge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeIcon: {
    marginRight: 6,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
