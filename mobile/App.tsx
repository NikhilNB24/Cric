import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, Text } from 'react-native';
import { TamaguiProvider, Theme } from 'tamagui';
import tamaguiConfig from './tamagui.config';
import { AdminTab } from './src/components/AdminTab';
import { AuthPanel } from './src/components/AuthPanel';
import { Header } from './src/components/Header';
import { ScorerTab } from './src/components/ScorerTab';
import { TabBar } from './src/components/TabBar';
import { ViewerTab } from './src/components/ViewerTab';
import { styles } from './src/components/styles';
import { type TabKey } from './src/constants/mock-data';
import { apiBaseUrl } from './src/lib/api';
import { useAuthStore } from './src/stores/auth-store';

const queryClient = new QueryClient();

export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('viewer');
  const [phone, setPhone] = useState('+918310827940');
  const [otp, setOtp] = useState('');
  const [authStep, setAuthStep] = useState<'phone' | 'otp'>('phone');
  const [authMessage, setAuthMessage] = useState(
    'Use your Firebase test phone number for local sign-in.',
  );
  const { user, clearSession } = useAuthStore();
  const roleLabel = useMemo(
    () => user?.role.replaceAll('_', ' ').toLowerCase() ?? 'demo preview',
    [user],
  );

  const handleSendOtp = () => {
    setAuthStep('otp');
    setAuthMessage('OTP entry is ready. Device verifier wiring comes next.');
  };

  const handleVerifyOtp = () => {
    setAuthMessage('Firebase ID token exchange will run after verifier testing.');
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TamaguiProvider config={tamaguiConfig as any} defaultTheme="light">
        <Theme name="light">
          <SafeAreaView style={styles.safeArea}>
            <StatusBar style="dark" />
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
              <Header />
              <AuthPanel
                authMessage={authMessage}
                authStep={authStep}
                clearSession={clearSession}
                handleSendOtp={handleSendOtp}
                handleVerifyOtp={handleVerifyOtp}
                otp={otp}
                phone={phone}
                roleLabel={roleLabel}
                setOtp={setOtp}
                setPhone={setPhone}
                userName={user?.name ?? user?.phone ?? null}
              />
              <TabBar activeTab={activeTab} setActiveTab={setActiveTab} />
              {activeTab === 'viewer' ? <ViewerTab /> : null}
              {activeTab === 'scorer' ? <ScorerTab /> : null}
              {activeTab === 'admin' ? <AdminTab /> : null}
              <Text style={styles.apiText}>API {apiBaseUrl}</Text>
            </ScrollView>
          </SafeAreaView>
        </Theme>
      </TamaguiProvider>
    </QueryClientProvider>
  );
}
