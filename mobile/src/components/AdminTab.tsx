import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { Button } from 'tamagui';
import { adminStats, type IconName } from '../constants/mock-data';
import {
  createMatch,
  createPlayer,
  createTeam,
  createTournament,
  createUser,
  listTournaments,
  listUsers,
} from '../lib/api';
import { useAuthStore } from '../stores/auth-store';
import { styles } from './styles';

export function AdminTab() {
  const queryClient = useQueryClient();
  const idToken = useAuthStore((state) => state.idToken);
  const [userPhone, setUserPhone] = useState('+91');
  const [userName, setUserName] = useState('');
  const [tournamentName, setTournamentName] = useState('');
  const [teamName, setTeamName] = useState('');
  const [teamShortName, setTeamShortName] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [matchOvers, setMatchOvers] = useState('15');
  const [message, setMessage] = useState('Sign in as an admin to manage setup data.');
  const setupIds = {
    tournamentId: process.env.EXPO_PUBLIC_DEMO_TOURNAMENT_ID,
    teamId: process.env.EXPO_PUBLIC_DEMO_TEAM_ID,
    homeTeamId: process.env.EXPO_PUBLIC_DEMO_HOME_TEAM_ID,
    awayTeamId: process.env.EXPO_PUBLIC_DEMO_AWAY_TEAM_ID,
  };
  const usersQuery = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () => listUsers(idToken ?? ''),
    enabled: Boolean(idToken),
  });
  const tournamentsQuery = useQuery({
    queryKey: ['admin', 'tournaments'],
    queryFn: () => listTournaments(idToken ?? ''),
    enabled: Boolean(idToken),
  });
  const createUserMutation = useMutation({
    mutationFn: () =>
      createUser(idToken ?? '', {
        phone: userPhone.trim(),
        name: userName.trim() || null,
        role: 'VIEWER',
      }),
    onSuccess: async () => {
      setMessage('User approved as viewer.');
      setUserPhone('+91');
      setUserName('');
      await queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
    onError: (error) => setMessage(error.message),
  });
  const createTournamentMutation = useMutation({
    mutationFn: () =>
      createTournament(idToken ?? '', {
        name: tournamentName.trim(),
      }),
    onSuccess: async () => {
      setMessage('Tournament created.');
      setTournamentName('');
      await queryClient.invalidateQueries({ queryKey: ['admin', 'tournaments'] });
    },
    onError: (error) => setMessage(error.message),
  });
  const createTeamMutation = useMutation({
    mutationFn: () =>
      createTeam(idToken ?? '', setupIds.tournamentId ?? '', {
        name: teamName.trim(),
        shortName: teamShortName.trim() || null,
      }),
    onSuccess: async () => {
      setMessage('Team created.');
      setTeamName('');
      setTeamShortName('');
      await queryClient.invalidateQueries({ queryKey: ['admin', 'tournaments'] });
    },
    onError: (error) => setMessage(error.message),
  });
  const createPlayerMutation = useMutation({
    mutationFn: () =>
      createPlayer(idToken ?? '', setupIds.teamId ?? '', {
        name: playerName.trim(),
      }),
    onSuccess: async () => {
      setMessage('Player added.');
      setPlayerName('');
      await queryClient.invalidateQueries({ queryKey: ['admin', 'tournaments'] });
    },
    onError: (error) => setMessage(error.message),
  });
  const createMatchMutation = useMutation({
    mutationFn: () =>
      createMatch(idToken ?? '', {
        tournamentId: setupIds.tournamentId ?? '',
        homeTeamId: setupIds.homeTeamId ?? '',
        awayTeamId: setupIds.awayTeamId ?? '',
        overs: Number(matchOvers),
      }),
    onSuccess: async () => {
      setMessage('Match created.');
      await queryClient.invalidateQueries({ queryKey: ['admin', 'tournaments'] });
    },
    onError: (error) => setMessage(error.message),
  });
  const stats = [
    {
      ...adminStats[0],
      value: String(usersQuery.data?.length ?? adminStats[0].value),
    },
    {
      ...adminStats[1],
      value: String(
        tournamentsQuery.data?.reduce((total, tournament) => {
          return total + (tournament._count?.teams ?? 0);
        }, 0) ?? adminStats[1].value,
      ),
    },
    {
      ...adminStats[2],
      value: String(
        tournamentsQuery.data?.reduce((total, tournament) => {
          return total + (tournament._count?.matches ?? 0);
        }, 0) ?? adminStats[2].value,
      ),
    },
  ];

  return (
    <View style={styles.stack}>
      <View style={styles.adminStats}>
        {stats.map((item) => (
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

      <View style={styles.panel}>
        <Text style={styles.sectionTitle}>Approve user</Text>
        <Text style={styles.helpText}>Creates an active viewer account by phone number.</Text>
        <View style={styles.inputWrap}>
          <Ionicons name="call-outline" size={20} color="#64748b" />
          <TextInput
            keyboardType="phone-pad"
            onChangeText={setUserPhone}
            placeholder="+918310827940"
            placeholderTextColor="#94a3b8"
            style={styles.input}
            value={userPhone}
          />
        </View>
        <View style={styles.inputWrap}>
          <Ionicons name="person-outline" size={20} color="#64748b" />
          <TextInput
            onChangeText={setUserName}
            placeholder="Display name"
            placeholderTextColor="#94a3b8"
            style={styles.input}
            value={userName}
          />
        </View>
        <Button
          borderRadius="$3"
          disabled={!idToken || createUserMutation.isPending}
          onPress={() => createUserMutation.mutate()}
          theme="green"
        >
          Approve viewer
        </Button>
      </View>

      <View style={styles.panel}>
        <Text style={styles.sectionTitle}>Create tournament</Text>
        <Text style={styles.helpText}>Start setup with a tournament container.</Text>
        <View style={styles.inputWrap}>
          <Ionicons name="trophy-outline" size={20} color="#64748b" />
          <TextInput
            onChangeText={setTournamentName}
            placeholder="Sunday Premier League"
            placeholderTextColor="#94a3b8"
            style={styles.input}
            value={tournamentName}
          />
        </View>
        <Button
          borderRadius="$3"
          disabled={!idToken || createTournamentMutation.isPending}
          onPress={() => createTournamentMutation.mutate()}
          theme="green"
        >
          Create tournament
        </Button>
        <Text style={styles.authMessage}>{message}</Text>
      </View>

      <View style={styles.panel}>
        <Text style={styles.sectionTitle}>Add team</Text>
        <Text style={styles.helpText}>
          Uses `EXPO_PUBLIC_DEMO_TOURNAMENT_ID` until tournament selection is built.
        </Text>
        <View style={styles.inputWrap}>
          <Ionicons name="shield-outline" size={20} color="#64748b" />
          <TextInput
            onChangeText={setTeamName}
            placeholder="Falcons"
            placeholderTextColor="#94a3b8"
            style={styles.input}
            value={teamName}
          />
        </View>
        <View style={styles.inputWrap}>
          <Ionicons name="text-outline" size={20} color="#64748b" />
          <TextInput
            autoCapitalize="characters"
            onChangeText={setTeamShortName}
            placeholder="FAL"
            placeholderTextColor="#94a3b8"
            style={styles.input}
            value={teamShortName}
          />
        </View>
        <Button
          borderRadius="$3"
          disabled={!idToken || !setupIds.tournamentId || createTeamMutation.isPending}
          onPress={() => createTeamMutation.mutate()}
          theme="green"
        >
          Add team
        </Button>
      </View>

      <View style={styles.panel}>
        <Text style={styles.sectionTitle}>Add player</Text>
        <Text style={styles.helpText}>
          Uses `EXPO_PUBLIC_DEMO_TEAM_ID` until team selection is built.
        </Text>
        <View style={styles.inputWrap}>
          <Ionicons name="person-add-outline" size={20} color="#64748b" />
          <TextInput
            onChangeText={setPlayerName}
            placeholder="A. Rao"
            placeholderTextColor="#94a3b8"
            style={styles.input}
            value={playerName}
          />
        </View>
        <Button
          borderRadius="$3"
          disabled={!idToken || !setupIds.teamId || createPlayerMutation.isPending}
          onPress={() => createPlayerMutation.mutate()}
          theme="green"
        >
          Add player
        </Button>
      </View>

      <View style={styles.panel}>
        <Text style={styles.sectionTitle}>Create match</Text>
        <Text style={styles.helpText}>
          Uses demo tournament and team IDs until match setup selection is built.
        </Text>
        <View style={styles.inputWrap}>
          <Ionicons name="time-outline" size={20} color="#64748b" />
          <TextInput
            keyboardType="number-pad"
            onChangeText={setMatchOvers}
            placeholder="15"
            placeholderTextColor="#94a3b8"
            style={styles.input}
            value={matchOvers}
          />
        </View>
        <Button
          borderRadius="$3"
          disabled={
            !idToken ||
            !setupIds.tournamentId ||
            !setupIds.homeTeamId ||
            !setupIds.awayTeamId ||
            createMatchMutation.isPending
          }
          onPress={() => createMatchMutation.mutate()}
          theme="green"
        >
          Create match
        </Button>
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
