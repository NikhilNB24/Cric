import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';
import { tabs, type TabKey } from '../constants/mock-data';
import { styles } from './styles';

type TabBarProps = {
  activeTab: TabKey;
  setActiveTab: (tab: TabKey) => void;
};

export function TabBar({ activeTab, setActiveTab }: TabBarProps) {
  return (
    <View style={styles.tabBar}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <Pressable
            key={tab.key}
            accessibilityRole="button"
            onPress={() => setActiveTab(tab.key)}
            style={[styles.tabButton, isActive && styles.tabButtonActive]}
          >
            <Ionicons name={tab.icon} size={18} color={isActive ? '#ffffff' : '#475569'} />
            <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
