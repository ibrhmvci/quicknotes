import React from 'react';
import { Stack } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import { NotesProvider } from '../../context/NotesContext';

export default function AppLayout() {
  const { isLoaded } = useAuth();

  if (!isLoaded) return null;

  return (
    <NotesProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="editor"
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen name="index" />
        <Stack.Screen name="profile" />
      </Stack>
    </NotesProvider>
  );
}
