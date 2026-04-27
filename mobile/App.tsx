import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, Text } from 'react-native';
import { AdminTab } from './src/components/AdminTab';
import { AuthPanel } from './src/components/AuthPanel';
import { HamburgerMenu } from './src/components/HamburgerMenu';
import { Header } from './src/components/Header';
import { ProfileTab } from './src/components/ProfileTab';
import { ScorerTab } from './src/components/ScorerTab';
import { StatsTab } from './src/components/StatsTab';
import { ViewerTab } from './src/components/ViewerTab';
import { styles } from './src/components/styles';
import { type TabKey } from './src/constants/mock-data';
import { apiBaseUrl } from './src/lib/api';
import { useAuthStore } from './src/stores/auth-store';

const queryClient = new QueryClient();

export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('profile');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [phone, setPhone] = useState('+918310827940');
  const [otp, setOtp] = useState('');
  const [authStep, setAuthStep] = useState<'phone' | 'otp'>('phone');
  const [authMessage, setAuthMessage] = useState(
    'Use your Firebase test phone number for local sign-in.',
  );
  const { user, setSession, clearSession } = useAuthStore();
  const roleLabel = useMemo(
    () => user?.role.replaceAll('_', ' ').toLowerCase() ?? 'demo preview',
    [user],
  );

  const handleSendOtp = () => {
    setAuthStep('otp');
    setAuthMessage('OTP entry is ready. Device verifier wiring comes next.');
  };

  const handleVerifyOtp = () => {
    if (!otp.trim()) {
      setAuthMessage('Enter any OTP to continue in local dev mode.');
      return;
    }

    const normalizedPhone = phone.trim();

    setSession(
      {
        id: `local-${normalizedPhone}`,
        phone: normalizedPhone,
        name: 'Local Admin',
        role: 'SUPER_ADMIN',
        status: 'ACTIVE',
      },
      `dev-local:${normalizedPhone}`,
    );
    setAuthMessage('Signed in with local dev OTP bypass.');
  };

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="dark" />
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Header />
          {!user ? (
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
              userName={null}
            />
          ) : (
            <>
              <HamburgerMenu
                activeTab={activeTab}
                isOpen={isMenuOpen}
                setActiveTab={setActiveTab}
                setIsOpen={setIsMenuOpen}
              />
              {activeTab === 'profile' ? (
                <ProfileTab clearSession={clearSession} roleLabel={roleLabel} user={user} />
              ) : null}
              {activeTab === 'matches' ? <ViewerTab /> : null}
              {activeTab === 'stats' ? <StatsTab /> : null}
              {activeTab === 'scorer' ? <ScorerTab /> : null}
              {activeTab === 'admin' ? <AdminTab /> : null}
              <Text style={styles.apiText}>API {apiBaseUrl}</Text>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </QueryClientProvider>
  );
}
