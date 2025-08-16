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

          const data = await response.json();

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

          return null;
        } catch (error) {
          console.error('Login error:', error);
          return null;
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
    signIn: '/auth',
    error: '/auth',
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
