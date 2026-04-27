import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { scorerBalls } from '../constants/mock-data';
import {
  getMatchScorecard,
  submitBall,
  undoLastBall,
  type ScorecardInnings,
  type SubmitBallPayload,
} from '../lib/api';
import { useAuthStore } from '../stores/auth-store';
import { AppButton } from './AppButton';
import { styles } from './styles';

export function ScorerTab() {
  const idToken = useAuthStore((state) => state.idToken);
  const [selectedBall, setSelectedBall] = useState(scorerBalls[1]);
  const [isStrikeSwapped, setIsStrikeSwapped] = useState(false);
  const [message, setMessage] = useState(
    'Create a match and innings, then wire the real player IDs to submit balls.',
  );
  const scoringContext = useMemo(
    () => ({
      matchId: process.env.EXPO_PUBLIC_DEMO_MATCH_ID,
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
  const striker = isStrikeSwapped
    ? { id: scoringContext.nonStrikerId, name: 'V. Shah' }
    : { id: scoringContext.strikerId, name: 'A. Rao' };
  const nonStriker = isStrikeSwapped
    ? { id: scoringContext.strikerId, name: 'A. Rao' }
    : { id: scoringContext.nonStrikerId, name: 'V. Shah' };
  const submitMutation = useMutation({
    mutationFn: () => {
      const payload = buildBallPayload(selectedBall.label, {
        strikerId: striker.id ?? '',
        nonStrikerId: nonStriker.id ?? '',
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
  const scorecardQuery = useQuery({
    queryKey: ['scorecard', scoringContext.matchId],
    queryFn: () => getMatchScorecard(idToken ?? '', scoringContext.matchId ?? ''),
    enabled: Boolean(idToken && scoringContext.matchId),
  });
  const currentInnings = scorecardQuery.data?.innings.at(-1);

  return (
    <View style={styles.stack}>
      <ScorecardPanel
        innings={scorecardQuery.data?.innings ?? []}
        isLoading={scorecardQuery.isLoading}
        title={
          scorecardQuery.data
            ? `${scorecardQuery.data.homeTeam.shortName ?? scorecardQuery.data.homeTeam.name} vs ${
                scorecardQuery.data.awayTeam.shortName ?? scorecardQuery.data.awayTeam.name
              }`
            : 'Current match scorecard'
        }
      />
      <CurrentOverPanel innings={currentInnings} />

      <View style={styles.panel}>
        <View style={styles.panelHeader}>
          <View>
            <Text style={styles.sectionTitle}>Current innings</Text>
            <Text style={styles.helpText}>
              {currentInnings
                ? `${currentInnings.battingTeam.shortName ?? currentInnings.battingTeam.name} ${
                    currentInnings.runs
                  }/${currentInnings.wickets} after ${formatOvers(currentInnings.legalBalls)}`
                : 'Set EXPO_PUBLIC_DEMO_MATCH_ID to load scorecard.'}
            </Text>
          </View>
          <Pressable
            accessibilityLabel="Swap striker and non-striker"
            accessibilityRole="button"
            onPress={() => {
              setIsStrikeSwapped((value) => !value);
              setMessage('Strike swapped.');
            }}
            style={({ pressed }) => [styles.iconButton, pressed && styles.appButtonPressed]}
          >
            <Ionicons name="swap-horizontal-outline" size={24} color="#0f766e" />
          </Pressable>
        </View>
        <View style={styles.playersGrid}>
          <PlayerChip label="Striker" value={striker.name} />
          <PlayerChip label="Non-striker" value={nonStriker.name} />
          <PlayerChip label="Bowler" value="M. Khan" />
        </View>
      </View>

      <View style={styles.listPanel}>
        <Text style={styles.sectionTitle}>Ball input</Text>
        <View style={styles.ballGrid}>
          {scorerBalls.map((ball) => (
            <Pressable
              key={ball.label}
              onPress={() => {
                setSelectedBall(ball);
                setMessage(`${ball.value} selected.`);
              }}
              style={({ pressed }) => [
                styles.ballButton,
                selectedBall.label === ball.label && styles.ballButtonActive,
                pressed && styles.appButtonPressed,
              ]}
            >
              <Text style={styles.ballLabel}>{ball.label}</Text>
              <Text style={styles.ballValue}>{ball.value}</Text>
            </Pressable>
          ))}
        </View>
        <Text style={styles.authMessage}>{message}</Text>
        <View style={styles.scorerActions}>
          <AppButton
            disabled={!hasScoringContext || submitMutation.isPending}
            onPress={() => submitMutation.mutate()}
          >
            Submit ball
          </AppButton>
          <AppButton
            disabled={!hasScoringContext || undoMutation.isPending}
            onPress={() => undoMutation.mutate()}
            tone="warning"
          >
            Undo last ball
          </AppButton>
        </View>
      </View>
    </View>
  );
}

function ScorecardPanel({
  innings,
  isLoading,
  title,
}: {
  innings: ScorecardInnings[];
  isLoading: boolean;
  title: string;
}) {
  return (
    <View style={styles.panel}>
      <View style={styles.panelHeader}>
        <View style={styles.matchText}>
          <Text style={styles.sectionTitle}>{title}</Text>
          <Text style={styles.helpText}>
            {isLoading ? 'Loading scorecard...' : `${innings.length} innings recorded`}
          </Text>
        </View>
        <Ionicons name="document-text-outline" size={26} color="#0f766e" />
      </View>
      {innings.length > 0 ? (
        innings.map((item) => <InningsScoreRow key={item.id} innings={item} />)
      ) : (
        <Text style={styles.authMessage}>
          No scorecard yet. Start a match and innings, or set demo match IDs in `mobile/.env`.
        </Text>
      )}
    </View>
  );
}

function CurrentOverPanel({ innings }: { innings?: ScorecardInnings }) {
  const currentOverBalls = getCurrentOverBalls(innings);
  const overNumber = currentOverBalls[0]?.overNumber ?? Math.floor((innings?.legalBalls ?? 0) / 6);

  return (
    <View style={styles.panel}>
      <View style={styles.panelHeader}>
        <View style={styles.matchText}>
          <Text style={styles.sectionTitle}>Current over</Text>
          <Text style={styles.helpText}>Over {overNumber + 1}</Text>
        </View>
        <Ionicons name="time-outline" size={26} color="#0f766e" />
      </View>
      <View style={styles.overHistoryRow}>
        {currentOverBalls.length > 0 ? (
          currentOverBalls.map((ball) => (
            <View key={ball.id} style={styles.overBallPill}>
              <Text style={styles.overBallText}>{getBallLabel(ball)}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.authMessage}>No deliveries in the current over yet.</Text>
        )}
      </View>
    </View>
  );
}

function InningsScoreRow({ innings }: { innings: ScorecardInnings }) {
  const recentBalls = innings.ballEvents.slice(-6);

  return (
    <View style={styles.scorecardInnings}>
      <View style={styles.panelHeader}>
        <View style={styles.matchText}>
          <Text style={styles.matchTitle}>
            {innings.battingTeam.shortName ?? innings.battingTeam.name}
          </Text>
          <Text style={styles.matchMeta}>
            Innings {innings.inningsNumber} against{' '}
            {innings.bowlingTeam.shortName ?? innings.bowlingTeam.name}
          </Text>
        </View>
        <Text style={styles.scorecardScore}>
          {innings.runs}/{innings.wickets}
        </Text>
      </View>
      <Text style={styles.matchMeta}>
        {formatOvers(innings.legalBalls)} overs | Extras {innings.extras} | {innings.status}
      </Text>
      <View style={styles.recentBallsRow}>
        {recentBalls.length > 0 ? (
          recentBalls.map((ball) => (
            <View key={ball.id} style={styles.recentBallPill}>
              <Text style={styles.recentBallText}>{getBallLabel(ball)}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.authMessage}>No balls recorded.</Text>
        )}
      </View>
    </View>
  );
}

function getCurrentOverBalls(innings?: ScorecardInnings) {
  const latestBall = innings?.ballEvents.at(-1);

  if (!innings || !latestBall) {
    return [];
  }

  return innings.ballEvents.filter((ball) => ball.overNumber === latestBall.overNumber);
}

function getBallLabel(ball: {
  runsBat: number;
  wides: number;
  noBalls: number;
  byes: number;
  legByes: number;
  isWicket: boolean;
}) {
  if (ball.isWicket) {
    return 'W';
  }

  if (ball.wides > 0) {
    return 'Wd';
  }

  if (ball.noBalls > 0) {
    return 'Nb';
  }

  if (ball.byes > 0) {
    return 'B';
  }

  if (ball.legByes > 0) {
    return 'LB';
  }

  return String(ball.runsBat);
}

function formatOvers(legalBalls: number) {
  return `${Math.floor(legalBalls / 6)}.${legalBalls % 6} ov`;
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
    case 'B':
      return {
        ...basePayload,
        byes: 1,
      };
    case 'LB':
      return {
        ...basePayload,
        legByes: 1,
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
