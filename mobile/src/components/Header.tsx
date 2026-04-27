import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';
import { styles } from './styles';

export function Header() {
  return (
    <View style={styles.header}>
      <View style={styles.headerCopy}>
        <Text style={styles.kicker}>CRIC</Text>
        <Text style={styles.title}>Match day control room</Text>
        <Text style={styles.subtitle}>
          Refresh-friendly scoring, setup, and live views for local tournaments.
        </Text>
      </View>
      <View style={styles.logoMark}>
        <Ionicons name="tennisball-outline" size={27} color="#f8fafc" />
      </View>
    </View>
  );
}
