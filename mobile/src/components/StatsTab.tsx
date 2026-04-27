import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import {
  getPlayerStats,
  searchPlayerStats,
  type PlayerCareerStat,
  type PlayerWithStats,
} from '../lib/api';
import { useAuthStore } from '../stores/auth-store';
import { AppButton } from './AppButton';
import { styles } from './styles';

export function StatsTab() {
  const idToken = useAuthStore((state) => state.idToken);
  const [query, setQuery] = useState('');
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const leaderboardQuery = useQuery({
    queryKey: ['player-stats', 'search', query],
    queryFn: () => searchPlayerStats(idToken ?? '', query),
    enabled: Boolean(idToken && query.trim().length >= 2),
  });
  const selectedStatsQuery = useQuery({
    queryKey: ['player-stats', 'player', selectedPlayerId],
    queryFn: () => getPlayerStats(idToken ?? '', selectedPlayerId ?? ''),
    enabled: Boolean(idToken && selectedPlayerId),
  });
  const searchMutation = useMutation({
    mutationFn: async () => {
      if (query.trim().length < 2) {
        return [];
      }

      return searchPlayerStats(idToken ?? '', query.trim());
    },
  });
  const searchResults = searchMutation.data ?? leaderboardQuery.data ?? [];
  const selectedStats = selectedStatsQuery.data?.careerStat;
  const selectedPlayer = selectedStatsQuery.data?.player;

  return (
    <View style={styles.stack}>
      <View style={styles.panel}>
        <Text style={styles.sectionTitle}>Player stats lookup</Text>
        <Text style={styles.helpText}>Search any player by name or phone number.</Text>
        <View style={styles.inputWrap}>
          <Ionicons name="search-outline" size={20} color="#64748b" />
          <TextInput
            onChangeText={(value) => {
              setQuery(value);
              setSelectedPlayerId(null);
            }}
            placeholder="Search player"
            placeholderTextColor="#94a3b8"
            style={styles.input}
            value={query}
          />
        </View>
        <AppButton
          disabled={!idToken || query.trim().length < 2 || searchMutation.isPending}
          onPress={() => searchMutation.mutate()}
        >
          Search players
        </AppButton>
      </View>

      <View style={styles.listPanel}>
        <Text style={styles.sectionTitle}>Results</Text>
        {searchResults.length > 0 ? (
          searchResults.map((player) => (
            <PlayerResultRow
              key={player.id}
              onPress={() => setSelectedPlayerId(player.id)}
              player={player}
            />
          ))
        ) : (
          <Text style={styles.helpText}>Enter at least two characters to find players.</Text>
        )}
      </View>

      {selectedPlayer && selectedStats ? (
        <View style={styles.panel}>
          <Text style={styles.sectionTitle}>{selectedPlayer.name}</Text>
          <Text style={styles.helpText}>{selectedPlayer.team.name}</Text>
          <StatsGrid stats={selectedStats} />
        </View>
      ) : null}
    </View>
  );
}

function PlayerResultRow({
  onPress,
  player,
}: {
  onPress: () => void;
  player: PlayerWithStats;
}) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.matchRow}>
      <View style={styles.matchText}>
        <Text style={styles.matchTitle}>{player.name}</Text>
        <Text style={styles.matchMeta}>{player.team.name}</Text>
      </View>
      <View style={styles.statusPill}>
        <Text style={styles.statusText}>{player.careerStat?.matches ?? 0} matches</Text>
      </View>
    </Pressable>
  );
}

function StatsGrid({ stats }: { stats: PlayerCareerStat }) {
  const items = [
    ['Matches', stats.matches],
    ['Runs', stats.runs],
    ['High', stats.highestScore],
    ['Wickets', stats.wickets],
    ['Catches', stats.catches],
    ['Balls', stats.ballsFaced],
  ];

  return (
    <View style={styles.statsGrid}>
      {items.map(([label, value]) => (
        <View key={label} style={styles.profileMetaTile}>
          <Text style={styles.statLabel}>{label}</Text>
          <Text style={styles.statValueSmall}>{value}</Text>
        </View>
      ))}
    </View>
  );
}
