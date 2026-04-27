import { Ionicons } from '@expo/vector-icons';
import { Text, TextInput, View } from 'react-native';
import { Button } from 'tamagui';
import { styles } from './styles';

export type AuthPanelProps = {
  authMessage: string;
  authStep: 'phone' | 'otp';
  clearSession: () => void;
  handleSendOtp: () => void;
  handleVerifyOtp: () => void;
  otp: string;
  phone: string;
  roleLabel: string;
  setOtp: (value: string) => void;
  setPhone: (value: string) => void;
  userName: string | null;
};

export function AuthPanel(props: AuthPanelProps) {
  if (props.userName) {
    return (
      <View style={styles.panel}>
        <View style={styles.panelHeader}>
          <View>
            <Text style={styles.sectionTitle}>Signed in</Text>
            <Text style={styles.helpText}>
              {props.userName} is active as {props.roleLabel}.
            </Text>
          </View>
          <Ionicons name="checkmark-circle-outline" size={26} color="#0f766e" />
        </View>
        <Button theme="red" size="$4" borderRadius="$3" onPress={props.clearSession}>
          Sign out
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.panel}>
      <Text style={styles.sectionTitle}>Sign in with phone</Text>
      <Text style={styles.helpText}>
        Firebase verifies the phone number; the backend decides the CRIC role.
      </Text>
      <View style={styles.inputWrap}>
        <Ionicons name="call-outline" size={20} color="#64748b" />
        <TextInput
          keyboardType="phone-pad"
          onChangeText={props.setPhone}
          placeholder="+91 98765 43210"
          placeholderTextColor="#94a3b8"
          style={styles.input}
          value={props.phone}
        />
      </View>
      {props.authStep === 'otp' ? (
        <View style={styles.inputWrap}>
          <Ionicons name="keypad-outline" size={20} color="#64748b" />
          <TextInput
            keyboardType="number-pad"
            maxLength={6}
            onChangeText={props.setOtp}
            placeholder="123456"
            placeholderTextColor="#94a3b8"
            style={styles.input}
            value={props.otp}
          />
        </View>
      ) : null}
      <Text style={styles.authMessage}>{props.authMessage}</Text>
      <Button
        borderRadius="$3"
        onPress={props.authStep === 'phone' ? props.handleSendOtp : props.handleVerifyOtp}
        size="$4"
        theme="green"
      >
        {props.authStep === 'phone' ? 'Send OTP' : 'Verify OTP'}
      </Button>
    </View>
  );
}
