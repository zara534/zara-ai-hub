
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { useAI } from '../contexts/AIContext';
import { supabase } from '../services/supabaseClient';

const ADMIN_EMAIL = 'admin@zaraaihub.com';

const AdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAI();

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { user } = await login(email, password);

      if (user && user.email === ADMIN_EMAIL) {
        // Success! The onAuthStateChange will handle setting context state.
        navigate('/admin', { replace: true });
      } else {
        // Logged in as non-admin, or login failed silently (user is null).
        // Log them out just in case a session was created for a non-admin.
        await supabase.auth.signOut();
        setError('Access Denied. Please use administrator credentials.');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyles = "mt-1 block w-full px-3 py-2 bg-background border border-border-color rounded-md focus:outline-none focus:ring-primary text-text-primary";
  const labelStyles = "block text-sm font-medium text-text-secondary";

  return (
    <div className="flex items-center justify-center pt-16">
      <Card className="w-full max-w-md p-8">
        <h2 className="text-2xl font-bold text-center text-primary mb-2">Admin Panel Login</h2>
        <p className="text-center text-text-secondary mb-6">
          Log in with the designated admin account to continue.
        </p>
        <div className="text-center text-xs text-text-secondary bg-surface p-3 rounded-md mb-6 border border-border-color">
            The admin email is <strong className="text-text-primary">{ADMIN_EMAIL}</strong>.
            <br />
            If you've forgotten the password, please reset it in your Supabase dashboard.
        </div>
        <form onSubmit={handleAdminLogin} className="space-y-6">
          <div>
            <label htmlFor="admin-email" className={labelStyles}>Email</label>
            <input
              type="email"
              id="admin-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputStyles}
              required
              autoFocus
              disabled={isLoading}
              placeholder="admin@zaraaihub.com"
            />
          </div>
          <div>
            <label htmlFor="admin-password" className={labelStyles}>Password</label>
            <input
              type="password"
              id="admin-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputStyles}
              required
              disabled={isLoading}
            />
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <div>
            <Button type="submit" className="w-full" isLoading={isLoading}>
              Login as Admin
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default AdminLoginPage;
