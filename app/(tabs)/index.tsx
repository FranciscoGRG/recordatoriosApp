import { StyleSheet, FlatList, TouchableOpacity, View, useColorScheme, Image, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCallback, useState, useMemo } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { getNotes, deleteNote, Note } from '@/services/storage';
import { cancelNotification } from '@/services/notifications';
import { Colors, Typography } from '@/constants/theme';

export default function HomeScreen() {
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]);
  const themeColors = Colors.dark;
  const insets = useSafeAreaInsets();

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

  const renderItem = (item: Note) => (
    <View key={item.id} style={[styles.card, { backgroundColor: themeColors.surfaceContainer }]}>
      <TouchableOpacity 
        activeOpacity={0.75}
        onPress={() => router.push(`/note/${item.id}`)}
        style={styles.cardHeader}
      >
        <TouchableOpacity style={[styles.checkCircle, { borderColor: themeColors.primary }]}>
           <MaterialCommunityIcons name="circle-outline" size={24} color={themeColors.primary} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <View style={styles.titleRow}>
            <ThemedText style={[styles.title, Typography.title]}>{item.title}</ThemedText>
            {item.intervalDays <= 1 && (
              <View style={[styles.urgentBadge, { backgroundColor: themeColors.primary + '20' }]}>
                <ThemedText style={[styles.urgentText, Typography.label, { color: themeColors.primary }]}>URGENTE</ThemedText>
              </View>
            )}
          </View>
          <ThemedText style={[styles.description, Typography.body, { color: themeColors.onSurfaceVariant }]} numberOfLines={1}>
            {item.description}
          </ThemedText>
          <View style={styles.timeRow}>
            <MaterialCommunityIcons name="clock-outline" size={14} color={themeColors.outline} />
            <ThemedText style={[styles.timeText, Typography.label, { color: themeColors.outline }]}>
              CADA {item.intervalDays} {item.intervalDays === 1 ? 'DÍA' : 'DÍAS'}
            </ThemedText>
          </View>
        </View>
      </TouchableOpacity>
      
      <TouchableOpacity 
        onPress={() => handleDelete(item.id, item.notificationId)} 
        style={styles.absDelete}
      >
        <Ionicons name="trash-outline" size={16} color="#EF4444" />
      </TouchableOpacity>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      {/* Absolute Gradient Overlays */}
      <View style={styles.topBlob} />
      <View style={styles.bottomBlob} />

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 200 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <ThemedText style={[styles.dateLabel, Typography.label, { color: themeColors.outline }]}>
                Martes, 10 de Marzo
              </ThemedText>
              <ThemedText style={[styles.mainTitle, Typography.display, { color: themeColors.primary, textTransform: 'uppercase' }]}>
                Recordatorios
              </ThemedText>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity>
                <MaterialCommunityIcons name="menu" size={28} color={themeColors.primary} />
              </TouchableOpacity>
              <Image 
                source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAZNSVQgQD89Rxh2hsorlr3zTolsaU0K0IPS7Bc0i3m2Q6yENli6q0L6ZjCYMvx6DU4jjX7HOKq7q5RhdgA7G3JR8zpjB_LPfBPrilniAWJJ1F0WNiSTPHkpd_YdT4DT4dnllLZGCtC4vL4Xvlsi9wMfhN8n2FlzRWTXQozleaTq6-b72MgnGrzuXF4nEscnQ52_6-gwsC2QgyZvtEg96a_CoHwgrtn9_Uy5_VgI9RdUZdfBh9l6YtRF7tdqE-B5EsZgbwTurpmODU' }}
                style={styles.profileImg}
              />
            </View>
          </View>
        </View>

        {/* Bento Stats */}
        <View style={[styles.bentoCard, { backgroundColor: themeColors.surfaceContainerLow }]}>
          <View style={styles.bentoContent}>
            <ThemedText style={[styles.bentoTag, Typography.label, { color: themeColors.primaryDim }]}>
              RESUMEN DIARIO
            </ThemedText>
            <ThemedText style={[styles.bentoTitle, Typography.headline]}>Casi terminas.</ThemedText>
            <ThemedText style={[styles.bentoSubtitle, Typography.body, { color: themeColors.onSurfaceVariant }]}>
              {notes.length} recordatorios activos para gestionar.
            </ThemedText>
          </View>
          <MaterialCommunityIcons 
            name="check-circle" 
            size={120} 
            color={themeColors.onSurface} 
            style={styles.bentoIcon} 
          />
        </View>

        {/* Categories / List */}
        <View style={styles.sectionHeader}>
          <ThemedText style={[styles.sectionTitle, Typography.headline]}>General</ThemedText>
          <ThemedText style={[styles.sectionCount, Typography.label, { color: themeColors.outline }]}>
            {notes.length} PENDIENTES
          </ThemedText>
        </View>

        {notes.length === 0 ? (
          <View style={styles.emptyContainer}>
            <ThemedText style={styles.emptyText}>No hay tareas.</ThemedText>
          </View>
        ) : (
          <View style={styles.listContainer}>
            {notes.map((item) => renderItem(item))}
          </View>
        )}
      </ScrollView>

      {/* Floating Bottom Nav */}
      <View style={[styles.navContainer, { bottom: 24 + insets.bottom }]}>
        <View style={[styles.navBar, { backgroundColor: 'rgba(26, 25, 27, 0.8)', borderColor: themeColors.outlineVariant }]}>
          <TouchableOpacity style={[styles.navItemActive]}>
             <LinearGradient
                colors={['#94aaff', '#a68cff']}
                style={styles.navItemGradient}
              >
                <MaterialCommunityIcons name="calendar-today" size={24} color="#0e0e0f" />
              </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem}>
             <MaterialCommunityIcons name="calendar-month" size={24} color={themeColors.outline} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem}>
             <MaterialCommunityIcons name="format-list-bulleted" size={24} color={themeColors.outline} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem}>
             <MaterialCommunityIcons name="check-circle-outline" size={24} color={themeColors.outline} />
          </TouchableOpacity>
        </View>
      </View>

      {/* FAB */}
      <TouchableOpacity 
        activeOpacity={0.9}
        style={[styles.fabContainer, { bottom: 100 + insets.bottom }]}
        onPress={() => router.push('/modal')}
      >
        <LinearGradient
          colors={['#94aaff', '#a68cff']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fab}
        >
          <Ionicons name="add" size={36} color="#0e0e0f" />
        </LinearGradient>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBlob: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 500,
    height: 500,
    borderRadius: 250,
    backgroundColor: 'rgba(148, 170, 255, 0.05)',
    zIndex: -1,
  },
  bottomBlob: {
    position: 'absolute',
    bottom: -100,
    left: -100,
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: 'rgba(166, 140, 255, 0.05)',
    zIndex: -1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 60,
    paddingBottom: 200,
  },
  header: {
    paddingHorizontal: 24,
    marginBottom: 40,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  dateLabel: {
    marginBottom: 4,
  },
  mainTitle: {
    fontSize: 44,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingBottom: 8,
  },
  profileImg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(118, 117, 118, 0.15)',
  },
  bentoCard: {
    marginHorizontal: 24,
    padding: 24,
    borderRadius: 32,
    flexDirection: 'row',
    overflow: 'hidden',
    marginBottom: 48,
    borderWidth: 1,
    borderColor: 'rgba(72, 72, 73, 0.05)',
  },
  bentoContent: {
    flex: 1,
    zIndex: 10,
  },
  bentoTag: {
    marginBottom: 8,
  },
  bentoTitle: {
    fontSize: 28,
    marginBottom: 4,
  },
  bentoSubtitle: {
    fontSize: 13,
  },
  bentoIcon: {
    position: 'absolute',
    right: -20,
    bottom: -20,
    opacity: 0.05,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 32,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
  },
  sectionCount: {
    fontSize: 10,
  },
  listContainer: {
    paddingHorizontal: 24,
    gap: 16,
  },
  card: {
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderWidth: 1,
    borderColor: 'rgba(72, 72, 73, 0.1)',
  },
  cardHeader: {
    flex: 1,
    flexDirection: 'row',
    gap: 16,
    alignItems: 'flex-start',
  },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    flex: 1,
    fontSize: 16,
  },
  urgentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 99,
  },
  urgentText: {
    fontSize: 9,
  },
  description: {
    fontSize: 12,
    marginBottom: 12,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timeText: {
    fontSize: 10,
  },
  absDelete: {
    padding: 8,
  },
  navContainer: {
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 90,
  },
  navBar: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 99,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
  },
  navItem: {
    padding: 12,
  },
  navItemActive: {
    borderRadius: 99,
    overflow: 'hidden',
  },
  navItemGradient: {
    padding: 12,
    borderRadius: 99,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 100,
    right: 24,
    elevation: 20,
    shadowColor: '#94aaff',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    zIndex: 100,
  },
  fab: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 40,
  },
  emptyText: {
    opacity: 0.5,
  },
});
