import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Button, H1, Paragraph, TamaguiProvider, Theme, YStack } from 'tamagui';
import tamaguiConfig from './tamagui.config';

const queryClient = new QueryClient();
const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:3000';

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TamaguiProvider config={tamaguiConfig as any} defaultTheme="light">
        <Theme name="light">
          <YStack
            flex={1}
            backgroundColor="$background"
            alignItems="center"
            justifyContent="center"
            padding="$5"
            gap="$4"
          >
            <H1 textAlign="center">CRIC</H1>
            <Paragraph textAlign="center" maxWidth={320}>
              Cricket scoring app local environment is ready for feature work.
            </Paragraph>
            <Paragraph textAlign="center" color="$gray10">
              API: {apiBaseUrl}
            </Paragraph>
            <Button theme="green">Start scoring</Button>
          </YStack>
        </Theme>
      </TamaguiProvider>
      <StatusBar style="auto" />
    </QueryClientProvider>
  );
}
