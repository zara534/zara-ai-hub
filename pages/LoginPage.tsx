import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAI } from '../contexts/AIContext';
import Button from '../ui/Button';
import Card from '../ui/Card';
import ThemeSwitcher from '../components/layout/ThemeSwitcher';
import AboutSection from '../components/layout/AboutSection';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const navigate = useNavigate();
  const { login } = useAI();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setError('');
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any)      {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const inputStyles = "block w-full px-3 py-2 bg-background border border-border-color rounded-md focus:outline-none focus:ring-primary text-text-primary";
  const labelStyles = "block text-sm font-medium text-text-secondary";

  return (
    <div className="relative flex items-center justify-center min-h-[calc(100vh-100px)] py-12">
        <div className="absolute top-4 right-4 z-10">
            <ThemeSwitcher />
        </div>
        <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
                <AboutSection />
                <div className="w-full max-w-md mx-auto">
                    <Card className="p-8">
                        <h2 className="text-3xl font-bold text-center text-primary mb-2">Welcome Back!</h2>
                        <p className="text-center text-text-secondary mb-6">Log in to continue to ZARA AI HUB.</p>
                        <form onSubmit={handleLogin} className="space-y-6">
                          <div>
                            <label htmlFor="email" className={labelStyles}>Email</label>
                            <input
                              type="email"
                              id="email"
                              value={email}
                              autoComplete="email"
                              onChange={(e) => setEmail(e.target.value)}
                              className={`${inputStyles} mt-1`}
                              required
                            />
                          </div>
                           <div>
                            <label htmlFor="password" className={labelStyles}>Password</label>
                            <div className="relative mt-1">
                                <input
                                  type={showPassword ? 'text' : 'password'}
                                  id="password"
                                  value={password}
                                  autoComplete="current-password"
                                  onChange={(e) => setPassword(e.target.value)}
                                  className={`${inputStyles} pr-10`}
                                  required
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowPassword(!showPassword)}
                                  className="absolute inset-y-0 right-0 px-3 flex items-center text-text-secondary hover:text-text-primary focus:outline-none"
                                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                  {showPassword ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 13.522 3 10 3a9.95 9.95 0 00-4.522 1.071L3.707 2.293zM10.707 10.707a2 2 0 00-2.828-2.828l2.828 2.828zM10 12a2 2 0 110-4 2 2 0 010 4z" clipRule="evenodd" />
                                      <path d="M2.042 10C3.316 14.057 6.478 17 10 17a9.95 9.95 0 005.478-1.742l-1.46-1.46A8.007 8.007 0 0110 15c-3.522 0-6.268-1.943-7.958-5z" />
                                    </svg>
                                  ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                      <path fillRule="evenodd" d="M.458 10C3.732 4.943 9.522 3 10 3s6.268 1.943 9.542 7c-3.274 5.057-9.042 7-9.542 7S3.732 15.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                    </svg>
                                  )}
                                </button>
                            </div>
                            <p className="mt-1 text-xs text-text-secondary">Passwords are case-sensitive.</p>
                          </div>
                          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                          <div>
                            <Button type="submit" className="w-full" isLoading={isLoggingIn}>
                              Login
                            </Button>
                          </div>
                          <p className="text-center text-sm text-text-secondary">
                            Don't have an account?{' '}
                            <Link to="/signup" className="font-medium text-primary hover:underline">
                              Sign up
                            </Link>
                          </p>
                        </form>
                    </Card>
                </div>
            </div>
        </div>
    </div>
  );
};

export default LoginPage;