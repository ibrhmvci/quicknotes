import { Redirect } from 'expo-router';

// This route is unused — tabs navigator handles all app screens via (tabs)/
export default function AppIndex() {
  return <Redirect href="/(app)/(tabs)" />;
}
