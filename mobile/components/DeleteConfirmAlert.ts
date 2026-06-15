import { Alert } from 'react-native';

export function showDeleteConfirmAlert(onConfirm: () => void): void {
  Alert.alert(
    'Delete Note?',
    'Are you sure you want to delete this note? This cannot be undone.',
    [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: onConfirm },
    ]
  );
}
