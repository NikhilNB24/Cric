import { Ionicons } from '@expo/vector-icons';
import { useMutation } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Button } from 'tamagui';
import { scorerBalls } from '../constants/mock-data';
import { submitBall, undoLastBall, type SubmitBallPayload } from '../lib/api';
import { useAuthStore } from '../stores/auth-store';
import { styles } from './styles';

export function ScorerTab() {
  const idToken = useAuthStore((state) => state.idToken);
  const [selectedBall, setSelectedBall] = useState(scorerBalls[1]);
  const [message, setMessage] = useState(
    'Create a match and innings, then wire the real player IDs to submit balls.',
  );
  const scoringContext = useMemo(
    () => ({
      inningsId: process.env.EXPO_PUBLIC_DEMO_INNINGS_ID,
      strikerId: process.env.EXPO_PUBLIC_DEMO_STRIKER_ID,
      nonStrikerId: process.env.EXPO_PUBLIC_DEMO_NON_STRIKER_ID,
      bowlerId: process.env.EXPO_PUBLIC_DEMO_BOWLER_ID,
    }),
    [],
  );
  const hasScoringContext = Boolean(
    idToken &&
      scoringContext.inningsId &&
      scoringContext.strikerId &&
      scoringContext.nonStrikerId &&
      scoringContext.bowlerId,
  );
  const submitMutation = useMutation({
    mutationFn: () => {
      const payload = buildBallPayload(selectedBall.label, {
        strikerId: scoringContext.strikerId ?? '',
        nonStrikerId: scoringContext.nonStrikerId ?? '',
        bowlerId: scoringContext.bowlerId ?? '',
      });

      return submitBall(idToken ?? '', scoringContext.inningsId ?? '', payload);
    },
    onSuccess: () => setMessage(`Submitted ${selectedBall.value}.`),
    onError: (error) => setMessage(error.message),
  });
  const undoMutation = useMutation({
    mutationFn: () => undoLastBall(idToken ?? '', scoringContext.inningsId ?? ''),
    onSuccess: () => setMessage('Last ball undone.'),
    onError: (error) => setMessage(error.message),
  });

  return (
    <View style={styles.stack}>
      <View style={styles.panel}>
        <View style={styles.panelHeader}>
          <View>
            <Text style={styles.sectionTitle}>Current innings</Text>
            <Text style={styles.helpText}>Falcons 82/3 after 9.4 overs</Text>
          </View>
          <Ionicons name="swap-horizontal-outline" size={26} color="#0f766e" />
        </View>
        <View style={styles.playersGrid}>
          <PlayerChip label="Striker" value="A. Rao" />
          <PlayerChip label="Non-striker" value="V. Shah" />
          <PlayerChip label="Bowler" value="M. Khan" />
        </View>
      </View>

      <View style={styles.listPanel}>
        <Text style={styles.sectionTitle}>Ball input</Text>
        <View style={styles.ballGrid}>
          {scorerBalls.map((ball) => (
            <Pressable
              key={ball.label}
              onPress={() => setSelectedBall(ball)}
              style={[
                styles.ballButton,
                selectedBall.label === ball.label && styles.ballButtonActive,
              ]}
            >
              <Text style={styles.ballLabel}>{ball.label}</Text>
              <Text style={styles.ballValue}>{ball.value}</Text>
            </Pressable>
          ))}
        </View>
        <Text style={styles.authMessage}>{message}</Text>
        <View style={styles.scorerActions}>
          <Button
            borderRadius="$3"
            disabled={!hasScoringContext || submitMutation.isPending}
            onPress={() => submitMutation.mutate()}
            theme="green"
          >
            Submit ball
          </Button>
          <Button
            borderRadius="$3"
            disabled={!hasScoringContext || undoMutation.isPending}
            onPress={() => undoMutation.mutate()}
            theme="yellow"
          >
            Undo last ball
          </Button>
        </View>
      </View>
    </View>
  );
}

function buildBallPayload(
  ballLabel: string,
  players: Pick<SubmitBallPayload, 'strikerId' | 'nonStrikerId' | 'bowlerId'>,
): SubmitBallPayload {
  const basePayload = {
    ...players,
    idempotencyKey: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
  };

  switch (ballLabel) {
    case 'Wd':
      return {
        ...basePayload,
        wides: 1,
      };
    case 'Nb':
      return {
        ...basePayload,
        noBalls: 1,
      };
    case 'W':
      return {
        ...basePayload,
        isWicket: true,
        dismissalType: 'BOWLED',
        playerOutId: players.strikerId,
      };
    default:
      return {
        ...basePayload,
        runsBat: Number(ballLabel),
      };
  }
}

function PlayerChip({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.playerChip}>
      <Text style={styles.playerLabel}>{label}</Text>
      <Text style={styles.playerValue}>{value}</Text>
    </View>
  );
}
