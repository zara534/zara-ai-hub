import React, { useState } from 'react';
import { useAI } from '../contexts/AIContext';
import Button from '../ui/Button';
import Card from '../ui/Card';

const AdminPasswordPage: React.FC = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { authenticateAdmin } = useAI();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    // Short delay to give user feedback
    setTimeout(() => {
        const success = authenticateAdmin(password);
        if (!success) {
            setError('Incorrect password.');
            setIsLoading(false);
        }
        // On success, context change will re-render AdminProtectedRoute and show the admin page
    }, 500);
  };

  const inputStyles = "block w-full px-3 py-2 bg-background border border-border-color rounded-md focus:outline-none focus:ring-primary text-text-primary";
  const labelStyles = "block text-sm font-medium text-text-secondary";

  return (
    <div className="container mx-auto p-4 h-full">
      <div className="flex items-center justify-center h-full">
        <div className="w-full max-w-md mx-auto">
          <Card className="p-8">
            <h2 className="text-3xl font-bold text-center text-primary mb-2">Admin Access</h2>
            <p className="text-center text-text-secondary mb-6">Enter the password to access the admin panel.</p>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="password" className={labelStyles}>Password</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  autoComplete="current-password"
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${inputStyles} mt-1`}
                  required
                />
              </div>
              {error && <p className="text-red-500 text-sm text-center">{error}</p>}
              <div>
                <Button type="submit" className="w-full" isLoading={isLoading}>
                  Continue
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminPasswordPage;