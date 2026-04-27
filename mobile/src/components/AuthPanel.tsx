import { Ionicons } from '@expo/vector-icons';
import { Text, TextInput, View } from 'react-native';
import { AppButton } from './AppButton';
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
        <AppButton tone="danger" onPress={props.clearSession}>
          Sign out
        </AppButton>
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
      <AppButton onPress={props.authStep === 'phone' ? props.handleSendOtp : props.handleVerifyOtp}>
        {props.authStep === 'phone' ? 'Send OTP' : 'Verify OTP'}
      </AppButton>
    </View>
  );
}
