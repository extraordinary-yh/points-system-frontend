import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        try {
          console.log('🔐 NextAuth attempting login to:', `${API_BASE_URL}/users/login/`);
          console.log('🔐 Username:', credentials.username);
          
          // Call your existing Django login endpoint
          const response = await fetch(`${API_BASE_URL}/users/login/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              username: credentials.username,
              password: credentials.password,
            }),
          });

          console.log('🔐 Django response status:', response.status);
          console.log('🔐 Django response headers:', Object.fromEntries(response.headers.entries()));

          const data = await response.json();
          console.log('🔐 Django response data:', data);

          if (response.ok && data.user && data.tokens) {
            // Return user data in NextAuth format
            return {
              id: data.user.id.toString(),
              username: data.user.username,
              email: data.user.email,
              role: data.user.role,
              total_points: data.user.total_points,
              discord_username: data.user.discord_username,
              discord_id: data.user.discord_id,
              university: data.user.university,
              major: data.user.major,
              graduation_year: data.user.graduation_year,
              company: data.user.company,
              is_suspended: data.user.is_suspended,
              suspension_reason: data.user.suspension_reason,
              created_at: data.user.created_at,
              updated_at: data.user.updated_at,
              // Store Django JWT tokens
              djangoAccessToken: data.tokens.access,
              djangoRefreshToken: data.tokens.refresh,
            };
          }

          // Handle specific error cases
          if (response.status === 401) {
            console.error('Authentication failed: Invalid credentials');
            throw new Error('Invalid username or password');
          } else if (response.status === 403) {
            console.error('Authentication failed: Account suspended or restricted');
            throw new Error('Account is suspended or restricted');
          } else {
            console.error('Authentication failed:', data.error || data.detail || 'Unknown error');
            throw new Error(data.error || data.detail || 'Authentication failed');
          }
        } catch (error) {
          console.error('Login error:', error);
          // Re-throw the error so NextAuth can handle it properly
          throw error;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      // Store Django user data and tokens in JWT
      if (user) {
        token.djangoAccessToken = user.djangoAccessToken;
        token.djangoRefreshToken = user.djangoRefreshToken;
        token.userData = {
          id: parseInt(user.id),
          username: user.username || '',
          email: user.email || '',
          role: user.role || 'student',
          total_points: user.total_points || 0,
          discord_username: user.discord_username,
          discord_id: user.discord_id,
          university: user.university,
          major: user.major,
          graduation_year: user.graduation_year,
          company: user.company,
          is_suspended: user.is_suspended || false,
          suspension_reason: user.suspension_reason,
          created_at: user.created_at || '',
          updated_at: user.updated_at || '',
        };
      }
      return token;
    },
    async session({ session, token }) {
      // Make Django tokens and user data available in session
      session.djangoAccessToken = token.djangoAccessToken as string;
      session.djangoRefreshToken = token.djangoRefreshToken as string;
      session.user = token.userData as any;
      return session;
    },
  },
  pages: {
    signIn: '/',
    error: '/',
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
