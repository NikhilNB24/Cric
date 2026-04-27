import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';
import { Button } from 'tamagui';
import { scorerBalls } from '../constants/mock-data';
import { styles } from './styles';

export function ScorerTab() {
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
            <Pressable key={ball.label} style={styles.ballButton}>
              <Text style={styles.ballLabel}>{ball.label}</Text>
              <Text style={styles.ballValue}>{ball.value}</Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.scorerActions}>
          <Button borderRadius="$3" theme="green">
            Submit ball
          </Button>
          <Button borderRadius="$3" theme="yellow">
            Undo last ball
          </Button>
        </View>
      </View>
    </View>
  );
}

function PlayerChip({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.playerChip}>
      <Text style={styles.playerLabel}>{label}</Text>
      <Text style={styles.playerValue}>{value}</Text>
    </View>
  );
}
