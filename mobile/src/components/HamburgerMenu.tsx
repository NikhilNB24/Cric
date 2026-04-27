import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';
import { tabs, type TabKey } from '../constants/mock-data';
import { styles } from './styles';

type HamburgerMenuProps = {
  activeTab: TabKey;
  isOpen: boolean;
  setActiveTab: (tab: TabKey) => void;
  setIsOpen: (isOpen: boolean) => void;
};

export function HamburgerMenu({
  activeTab,
  isOpen,
  setActiveTab,
  setIsOpen,
}: HamburgerMenuProps) {
  const activeItem = tabs.find((tab) => tab.key === activeTab) ?? tabs[0];

  return (
    <View style={styles.menuWrap}>
      <Pressable
        accessibilityRole="button"
        onPress={() => setIsOpen(!isOpen)}
        style={styles.menuButton}
      >
        <Ionicons name={isOpen ? 'close-outline' : 'menu-outline'} size={24} color="#0f172a" />
        <Text style={styles.menuButtonText}>{activeItem.label}</Text>
      </Pressable>
      {isOpen ? (
        <View style={styles.menuPanel}>
          {tabs.map((tab) => {
            const isActive = tab.key === activeTab;
            return (
              <Pressable
                key={tab.key}
                accessibilityRole="button"
                onPress={() => {
                  setActiveTab(tab.key);
                  setIsOpen(false);
                }}
                style={[styles.menuItem, isActive && styles.menuItemActive]}
              >
                <Ionicons name={tab.icon} size={19} color={isActive ? '#ffffff' : '#475569'} />
                <Text style={[styles.menuItemText, isActive && styles.menuItemTextActive]}>
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}
