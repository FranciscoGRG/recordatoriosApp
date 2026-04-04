import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Note {
  id: string;
  title: string;
  description: string;
  intervalDays: number;
  notificationId: string;
}

const STORAGE_KEY = '@reminders_notes';

export async function getNotes(): Promise<Note[]> {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error("Error reading notes", e);
    return [];
  }
}

export async function saveNote(note: Note): Promise<void> {
  try {
    const currentNotes = await getNotes();
    const newNotes = [...currentNotes, note];
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newNotes));
  } catch (e) {
    console.error("Error saving note", e);
  }
}

export async function deleteNote(id: string): Promise<void> {
  try {
    const currentNotes = await getNotes();
    const newNotes = currentNotes.filter(note => note.id !== id);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newNotes));
  } catch (e) {
    console.error("Error deleting note", e);
  }
}
