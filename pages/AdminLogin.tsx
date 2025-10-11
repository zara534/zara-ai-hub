import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../ui/Card';
import Button from '../ui/Button';

const AdminLoginPage: React.FC = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real production app, this password should be stored in a secure environment variable.
    if (password === 'zarahacks') {
      sessionStorage.setItem('isAdminAuthorized', 'true');
      navigate('/admin', { replace: true });
    } else {
      setError('Incorrect password.');
    }
  };

  const inputStyles = "mt-1 block w-full px-3 py-2 bg-background border border-border-color rounded-md focus:outline-none focus:ring-primary text-text-primary";
  const labelStyles = "block text-sm font-medium text-text-secondary";

  return (
    <div className="flex items-center justify-center pt-16">
      <Card className="w-full max-w-md p-8">
        <h2 className="text-2xl font-bold text-center text-primary mb-6">Admin Access Required</h2>
        <form onSubmit={handleAdminLogin} className="space-y-6">
          <div>
            <label htmlFor="admin-password" className={labelStyles}>Password</label>
            <input
              type="password"
              id="admin-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputStyles}
              required
              autoFocus
            />
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <div>
            <Button type="submit" className="w-full">
              Enter
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default AdminLoginPage;