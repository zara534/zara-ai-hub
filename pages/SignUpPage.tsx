import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAI } from '../contexts/AIContext';
import Button from '../ui/Button';
import Card from '../ui/Card';

const SignUpPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSigningUp, setIsSigningUp] = useState(false);
  const navigate = useNavigate();
  const { signUp } = useAI();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
        setError('Please enter a username.');
        return;
    }
    setIsSigningUp(true);
    setError('');
    try {
      await signUp(email, password, username);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSigningUp(false);
    }
  };

  const inputStyles = "block w-full px-3 py-2 bg-background border border-border-color rounded-md focus:outline-none focus:ring-primary text-text-primary";
  const labelStyles = "block text-sm font-medium text-text-secondary";

  return (
    <div className="container mx-auto p-4 h-full">
        <div className="flex items-center justify-center h-full">
            <div className="w-full max-w-md mx-auto">
                <Card className="p-8">
                    <h2 className="text-3xl font-bold text-center text-primary mb-2">Create Your Account</h2>
                    <p className="text-center text-text-secondary mb-6">Join the ZARA AI HUB creative community.</p>
                    <form onSubmit={handleSignUp} className="space-y-6">
                    <div>
                        <label htmlFor="username" className={labelStyles}>Username</label>
                        <input
                          type="text"
                          id="username"
                          value={username}
                          autoComplete="username"
                          onChange={(e) => setUsername(e.target.value)}
                          className={`${inputStyles} mt-1`}
                          required
                          minLength={3}
                        />
                      </div>
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
                              autoComplete="new-password"
                              onChange={(e) => setPassword(e.target.value)}
                              className={`${inputStyles} pr-10`}
                              required
                              minLength={6}
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
                        <p className="mt-1 text-xs text-text-secondary">Password should be at least 6 characters.</p>
                      </div>
                      {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                      <div>
                        <Button type="submit" className="w-full" isLoading={isSigningUp}>
                          Sign Up
                        </Button>
                      </div>
                      <p className="text-center text-sm text-text-secondary">
                        Already have an account?{' '}
                        <Link to="/login" className="font-medium text-primary hover:underline">
                          Login
                        </Link>
                      </p>
                    </form>
                </Card>
            </div>
        </div>
    </div>
  );
};

export default SignUpPage;