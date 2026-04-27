import type { ComponentProps } from 'react';
import { Ionicons } from '@expo/vector-icons';

export type IconName = ComponentProps<typeof Ionicons>['name'];
export type TabKey = 'viewer' | 'scorer' | 'admin';

export const tabs: Array<{ key: TabKey; label: string; icon: IconName }> = [
  { key: 'viewer', label: 'Live', icon: 'pulse-outline' },
  { key: 'scorer', label: 'Score', icon: 'radio-button-on-outline' },
  { key: 'admin', label: 'Admin', icon: 'settings-outline' },
];

export const liveMatches = [
  {
    id: 'match-1',
    title: 'Falcons vs Royals',
    score: 'FAL 82/3',
    overs: '9.4 ov',
    summary: 'Royals need wickets before the death overs',
    status: 'In progress',
  },
  {
    id: 'match-2',
    title: 'Strikers vs Titans',
    score: 'Starts 7:30 PM',
    overs: '15 ov',
    summary: 'Toss and playing four pending',
    status: 'Scheduled',
  },
];

export const scorerBalls = [
  { label: '0', value: 'Dot' },
  { label: '1', value: 'Single' },
  { label: '2', value: 'Two' },
  { label: '4', value: 'Four' },
  { label: '6', value: 'Six' },
  { label: 'Wd', value: 'Wide' },
  { label: 'Nb', value: 'No ball' },
  { label: 'W', value: 'Wicket' },
];

export const adminStats = [
  { label: 'Users', value: '1', icon: 'people-outline' as IconName },
  { label: 'Teams', value: '0', icon: 'shield-outline' as IconName },
  { label: 'Matches', value: '0', icon: 'calendar-outline' as IconName },
];
