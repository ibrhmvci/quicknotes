import { Redirect } from 'expo-router';

// Profile screen lives in (tabs)/profile.tsx
export default function ProfileRedirect() {
  return <Redirect href="/(app)/(tabs)/profile" />;
}
