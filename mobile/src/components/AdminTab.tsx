import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';
import { adminStats, type IconName } from '../constants/mock-data';
import { styles } from './styles';

export function AdminTab() {
  return (
    <View style={styles.stack}>
      <View style={styles.adminStats}>
        {adminStats.map((item) => (
          <View key={item.label} style={styles.statTile}>
            <Ionicons name={item.icon} size={22} color="#0f766e" />
            <Text style={styles.statValue}>{item.value}</Text>
            <Text style={styles.statLabel}>{item.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.panel}>
        <Text style={styles.sectionTitle}>Setup queue</Text>
        <SetupRow icon="trophy-outline" title="Create tournament" value="Name, description" />
        <SetupRow icon="shield-outline" title="Add teams" value="4-11 players each" />
        <SetupRow icon="calendar-outline" title="Create match" value="3-15 overs" />
        <SetupRow icon="person-add-outline" title="Approve scorer" value="Phone number role" />
      </View>
    </View>
  );
}

function SetupRow({
  icon,
  title,
  value,
}: {
  icon: IconName;
  title: string;
  value: string;
}) {
  return (
    <View style={styles.setupRow}>
      <View style={styles.setupIcon}>
        <Ionicons name={icon} size={19} color="#0f172a" />
      </View>
      <View style={styles.matchText}>
        <Text style={styles.matchTitle}>{title}</Text>
        <Text style={styles.matchMeta}>{value}</Text>
      </View>
      <Ionicons name="chevron-forward-outline" size={18} color="#94a3b8" />
    </View>
  );
}
