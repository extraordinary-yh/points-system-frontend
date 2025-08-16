import 'next-auth';
import { User as ApiUser } from '../services/api';

declare module 'next-auth' {
  interface Session {
    djangoAccessToken: string;
    djangoRefreshToken: string;
    user: ApiUser;
  }

  interface User extends ApiUser {
    djangoAccessToken: string;
    djangoRefreshToken: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    djangoAccessToken: string;
    djangoRefreshToken: string;
    userData: ApiUser;
  }
}
