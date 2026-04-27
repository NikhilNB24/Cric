import { Text, View } from 'react-native';
import { liveMatches } from '../constants/mock-data';
import { styles } from './styles';

export function ViewerTab() {
  const primaryMatch = liveMatches[0];

  return (
    <View style={styles.stack}>
      <View style={styles.liveHero}>
        <View style={styles.liveHeader}>
          <View>
            <Text style={styles.liveLabel}>Live now</Text>
            <Text style={styles.liveTitle}>{primaryMatch.title}</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{primaryMatch.overs}</Text>
          </View>
        </View>
        <View style={styles.scoreRow}>
          <Text style={styles.score}>{primaryMatch.score}</Text>
          <Text style={styles.scoreMeta}>{primaryMatch.summary}</Text>
        </View>
      </View>

      <View style={styles.listPanel}>
        <Text style={styles.sectionTitle}>Recent matches</Text>
        {liveMatches.map((match) => (
          <View key={match.id} style={styles.matchRow}>
            <View style={styles.matchText}>
              <Text style={styles.matchTitle}>{match.title}</Text>
              <Text style={styles.matchMeta}>{match.summary}</Text>
            </View>
            <View style={styles.statusPill}>
              <Text style={styles.statusText}>{match.status}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
