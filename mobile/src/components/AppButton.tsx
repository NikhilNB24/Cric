import { Pressable, Text } from 'react-native';
import { styles } from './styles';

export type AppButtonProps = {
  children: string;
  disabled?: boolean;
  onPress: () => void;
  tone?: 'primary' | 'danger' | 'warning';
};

export function AppButton({ children, disabled, onPress, tone = 'primary' }: AppButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.appButton,
        tone === 'danger' && styles.appButtonDanger,
        tone === 'warning' && styles.appButtonWarning,
        disabled && styles.appButtonDisabled,
        pressed && !disabled && styles.appButtonPressed,
      ]}
    >
      <Text style={[styles.appButtonText, tone === 'warning' && styles.appButtonWarningText]}>
        {children}
      </Text>
    </Pressable>
  );
}
