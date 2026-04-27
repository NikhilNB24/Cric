import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';
import { styles } from './styles';

export type NumberSelectorProps = {
  helperText?: string;
  label: string;
  max: number;
  min: number;
  onChange: (value: number) => void;
  unit?: string;
  value: number;
};

export function NumberSelector({
  helperText,
  label,
  max,
  min,
  onChange,
  unit,
  value,
}: NumberSelectorProps) {
  const decrease = () => onChange(Math.max(min, value - 1));
  const increase = () => onChange(Math.min(max, value + 1));

  return (
    <View style={styles.numberSelector}>
      <View style={styles.numberSelectorCopy}>
        <Text style={styles.numberSelectorLabel}>{label}</Text>
        {helperText ? <Text style={styles.numberSelectorHelp}>{helperText}</Text> : null}
      </View>
      <View style={styles.numberStepper}>
        <Pressable
          accessibilityLabel={`Decrease ${label}`}
          accessibilityRole="button"
          disabled={value <= min}
          onPress={decrease}
          style={({ pressed }) => [
            styles.numberStepperButton,
            value <= min && styles.numberStepperButtonDisabled,
            pressed && value > min && styles.appButtonPressed,
          ]}
        >
          <Ionicons name="remove-outline" size={20} color={value <= min ? '#94a3b8' : '#0f172a'} />
        </Pressable>
        <View style={styles.numberValueWrap}>
          <Text style={styles.numberValue}>{value}</Text>
          {unit ? <Text style={styles.numberUnit}>{unit}</Text> : null}
        </View>
        <Pressable
          accessibilityLabel={`Increase ${label}`}
          accessibilityRole="button"
          disabled={value >= max}
          onPress={increase}
          style={({ pressed }) => [
            styles.numberStepperButton,
            value >= max && styles.numberStepperButtonDisabled,
            pressed && value < max && styles.appButtonPressed,
          ]}
        >
          <Ionicons name="add-outline" size={20} color={value >= max ? '#94a3b8' : '#0f172a'} />
        </Pressable>
      </View>
    </View>
  );
}
