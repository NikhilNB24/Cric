import { useQuery } from '@tanstack/react-query';
import { Text, View } from 'react-native';
import { liveMatches } from '../constants/mock-data';
import { listLiveMatches, listRecentMatches, type ViewerMatch } from '../lib/api';
import { useAuthStore } from '../stores/auth-store';
import { styles } from './styles';

export function ViewerTab() {
  const idToken = useAuthStore((state) => state.idToken);
  const liveQuery = useQuery({
    queryKey: ['viewer', 'matches', 'live'],
    queryFn: () => listLiveMatches(idToken ?? ''),
    enabled: Boolean(idToken),
  });
  const recentQuery = useQuery({
    queryKey: ['viewer', 'matches', 'recent'],
    queryFn: () => listRecentMatches(idToken ?? ''),
    enabled: Boolean(idToken),
  });
  const liveApiMatches = liveQuery.data ?? [];
  const recentApiMatches = recentQuery.data ?? [];
  const primaryMatch = liveApiMatches[0];
  const fallbackPrimaryMatch = liveMatches[0];
  const recentMatches = recentApiMatches.length > 0 ? recentApiMatches : null;

  return (
    <View style={styles.stack}>
      <View style={styles.liveHero}>
        <View style={styles.liveHeader}>
          <View>
            <Text style={styles.liveLabel}>Live now</Text>
            <Text style={styles.liveTitle}>
              {primaryMatch ? getMatchTitle(primaryMatch) : fallbackPrimaryMatch.title}
            </Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {primaryMatch ? `${primaryMatch.overs} ov` : fallbackPrimaryMatch.overs}
            </Text>
          </View>
        </View>
        <View style={styles.scoreRow}>
          <Text style={styles.score}>
            {primaryMatch?.scoreSnapshot?.currentScore ?? fallbackPrimaryMatch.score}
          </Text>
          <Text style={styles.scoreMeta}>
            {primaryMatch?.scoreSnapshot?.summary ??
              (idToken ? 'No live matches yet.' : fallbackPrimaryMatch.summary)}
          </Text>
        </View>
      </View>

      <View style={styles.listPanel}>
        <Text style={styles.sectionTitle}>Recent matches</Text>
        {recentMatches
          ? recentMatches.map((match) => <ApiMatchRow key={match.id} match={match} />)
          : liveMatches.map((match) => (
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

function ApiMatchRow({ match }: { match: ViewerMatch }) {
  return (
    <View style={styles.matchRow}>
      <View style={styles.matchText}>
        <Text style={styles.matchTitle}>{getMatchTitle(match)}</Text>
        <Text style={styles.matchMeta}>
          {match.scoreSnapshot?.summary ?? `${match.overs} over match`}
        </Text>
      </View>
      <View style={styles.statusPill}>
        <Text style={styles.statusText}>{match.status.replaceAll('_', ' ')}</Text>
      </View>
    </View>
  );
}

function getMatchTitle(match: ViewerMatch) {
  return `${match.homeTeam.shortName ?? match.homeTeam.name} vs ${
    match.awayTeam.shortName ?? match.awayTeam.name
  }`;
}
