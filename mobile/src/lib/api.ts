const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:3000';

export type CurrentUser = {
  id: string;
  phone: string;
  name: string | null;
  role: 'SUPER_ADMIN' | 'TOURNAMENT_ADMIN' | 'SCORER' | 'VIEWER';
  status: 'ACTIVE' | 'INACTIVE';
};

export async function getCurrentUser(idToken: string): Promise<CurrentUser> {
  const response = await fetch(`${apiBaseUrl}/me`, {
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('This phone number is not active in CRIC.');
  }

  const payload = (await response.json()) as { user: CurrentUser };
  return payload.user;
}

export { apiBaseUrl };
