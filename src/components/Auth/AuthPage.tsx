'use client';
import { useState } from 'react';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';

export const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);

  const switchToLogin = () => setIsLogin(true);
  const switchToRegister = () => setIsLogin(false);

  if (isLogin) {
    return <LoginForm onSwitchToRegister={switchToRegister} />;
  } else {
    return <RegisterForm onSwitchToLogin={switchToLogin} />;
  }
};
