import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';
import type { CurrentUser } from '../lib/api';
import { AppButton } from './AppButton';
import { styles } from './styles';

type ProfileTabProps = {
  clearSession: () => void;
  roleLabel: string;
  user: CurrentUser;
};

export function ProfileTab({ clearSession, roleLabel, user }: ProfileTabProps) {
  return (
    <View style={styles.stack}>
      <View style={styles.panel}>
        <View style={styles.panelHeader}>
          <View style={styles.matchText}>
            <Text style={styles.sectionTitle}>{user.name ?? 'Local user'}</Text>
            <Text style={styles.helpText}>{user.phone}</Text>
          </View>
          <Ionicons name="person-circle-outline" size={34} color="#0f766e" />
        </View>
        <View style={styles.profileMetaGrid}>
          <View style={styles.profileMetaTile}>
            <Text style={styles.statLabel}>Role</Text>
            <Text style={styles.matchTitle}>{roleLabel}</Text>
          </View>
          <View style={styles.profileMetaTile}>
            <Text style={styles.statLabel}>Status</Text>
            <Text style={styles.matchTitle}>{user.status.toLowerCase()}</Text>
          </View>
        </View>
        <AppButton tone="danger" onPress={clearSession}>
          Sign out
        </AppButton>
      </View>
    </View>
  );
}
