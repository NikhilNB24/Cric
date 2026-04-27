import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Button, TamaguiProvider, Theme } from 'tamagui';
import tamaguiConfig from './tamagui.config';

const queryClient = new QueryClient();
const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:3000';

const roleActions = [
  { label: 'Create match', icon: 'add-circle-outline' as const, tone: '#0f766e' },
  { label: 'Score innings', icon: 'radio-button-on-outline' as const, tone: '#b45309' },
  { label: 'Live scores', icon: 'pulse-outline' as const, tone: '#2563eb' },
];

const matchRows = [
  { title: 'Falcons vs Royals', meta: 'Falcons 82/3, 9.4 ov', status: 'In progress' },
  { title: 'Strikers vs Titans', meta: 'Starts at 7:30 PM', status: 'Scheduled' },
  { title: 'Royals vs Kings', meta: 'Royals won by 18 runs', status: 'Complete' },
];

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TamaguiProvider config={tamaguiConfig as any} defaultTheme="light">
        <Theme name="light">
          <SafeAreaView style={styles.safeArea}>
            <StatusBar style="dark" />
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
              <View style={styles.header}>
                <View>
                  <Text style={styles.kicker}>CRIC SCORING</Text>
                  <Text style={styles.title}>Match control, without the clutter.</Text>
                </View>
                <View style={styles.logoMark}>
                  <Ionicons name="tennisball-outline" size={26} color="#f8fafc" />
                </View>
              </View>

              <View style={styles.livePanel}>
                <View style={styles.liveHeader}>
                  <View>
                    <Text style={styles.liveLabel}>Live now</Text>
                    <Text style={styles.liveTitle}>Falcons vs Royals</Text>
                  </View>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>9.4 ov</Text>
                  </View>
                </View>
                <View style={styles.scoreRow}>
                  <Text style={styles.score}>82/3</Text>
                  <View style={styles.scoreMeta}>
                    <Text style={styles.scoreMetaText}>Target pending</Text>
                    <Text style={styles.scoreMetaSub}>Last ball: 1 run, striker retained</Text>
                  </View>
                </View>
              </View>

              <View style={styles.loginPanel}>
                <Text style={styles.sectionTitle}>Sign in with phone</Text>
                <Text style={styles.helpText}>Only admin-approved phone numbers can score or manage matches.</Text>
                <View style={styles.inputWrap}>
                  <Ionicons name="call-outline" size={20} color="#64748b" />
                  <TextInput
                    style={styles.input}
                    placeholder="+91 98765 43210"
                    placeholderTextColor="#94a3b8"
                    keyboardType="phone-pad"
                  />
                </View>
                <Button theme="green" size="$4" borderRadius="$3">
                  Send OTP
                </Button>
              </View>

              <View style={styles.actions}>
                {roleActions.map((action) => (
                  <View key={action.label} style={styles.actionTile}>
                    <View style={[styles.actionIcon, { backgroundColor: action.tone }]}>
                      <Ionicons name={action.icon} size={21} color="#ffffff" />
                    </View>
                    <Text style={styles.actionText}>{action.label}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.listHeader}>
                <Text style={styles.sectionTitle}>Recent matches</Text>
                <Text style={styles.apiText}>API {apiBaseUrl}</Text>
              </View>

              <View style={styles.matchList}>
                {matchRows.map((match) => (
                  <View key={match.title} style={styles.matchRow}>
                    <View style={styles.matchText}>
                      <Text style={styles.matchTitle}>{match.title}</Text>
                      <Text style={styles.matchMeta}>{match.meta}</Text>
                    </View>
                    <Text style={styles.matchStatus}>{match.status}</Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          </SafeAreaView>
        </Theme>
      </TamaguiProvider>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 20,
    gap: 18,
  },
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  kicker: {
    color: '#0f766e',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0,
    marginBottom: 8,
  },
  title: {
    color: '#0f172a',
    flexShrink: 1,
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 38,
    maxWidth: 300,
  },
  logoMark: {
    alignItems: 'center',
    backgroundColor: '#0f172a',
    borderRadius: 8,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  livePanel: {
    backgroundColor: '#111827',
    borderRadius: 8,
    padding: 18,
    gap: 18,
  },
  liveHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  liveLabel: {
    color: '#5eead4',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 5,
  },
  liveTitle: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '800',
  },
  badge: {
    backgroundColor: '#f59e0b',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  badgeText: {
    color: '#111827',
    fontSize: 12,
    fontWeight: '800',
  },
  scoreRow: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: 16,
  },
  score: {
    color: '#ffffff',
    fontSize: 48,
    fontWeight: '900',
    lineHeight: 54,
  },
  scoreMeta: {
    flex: 1,
    paddingBottom: 5,
  },
  scoreMetaText: {
    color: '#e2e8f0',
    fontSize: 15,
    fontWeight: '700',
  },
  scoreMetaSub: {
    color: '#94a3b8',
    fontSize: 13,
    marginTop: 4,
  },
  loginPanel: {
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
    borderRadius: 8,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  sectionTitle: {
    color: '#0f172a',
    fontSize: 18,
    fontWeight: '800',
  },
  helpText: {
    color: '#64748b',
    fontSize: 14,
    lineHeight: 20,
  },
  inputWrap: {
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderColor: '#cbd5e1',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    minHeight: 50,
    paddingHorizontal: 14,
  },
  input: {
    color: '#0f172a',
    flex: 1,
    fontSize: 16,
    minWidth: 0,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionTile: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    gap: 10,
    minHeight: 104,
    padding: 12,
  },
  actionIcon: {
    alignItems: 'center',
    borderRadius: 8,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  actionText: {
    color: '#334155',
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
  },
  listHeader: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  apiText: {
    color: '#64748b',
    flex: 1,
    fontSize: 11,
    textAlign: 'right',
  },
  matchList: {
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
    borderRadius: 8,
    borderWidth: 1,
  },
  matchRow: {
    alignItems: 'center',
    borderBottomColor: '#e2e8f0',
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    minHeight: 72,
    padding: 14,
  },
  matchText: {
    flex: 1,
    minWidth: 0,
  },
  matchTitle: {
    color: '#0f172a',
    fontSize: 15,
    fontWeight: '800',
  },
  matchMeta: {
    color: '#64748b',
    fontSize: 13,
    marginTop: 4,
  },
  matchStatus: {
    color: '#0f766e',
    fontSize: 12,
    fontWeight: '800',
  },
});
