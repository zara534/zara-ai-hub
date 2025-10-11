import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../ui/Card';
import Button from '../ui/Button';

const AdminLoginPage: React.FC = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // A small delay to make the loading indicator visible and help prevent brute-force attacks.
      await new Promise(resolve => setTimeout(resolve, 300));

      const encoder = new TextEncoder();
      const data = encoder.encode(password);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      
      // SHA-256 hash for "zarahacks"
      const correctHash = '224213c7a36e45558716b412b0051172defc11543db4872c67d3390c58e5058e';

      if (hashHex === correctHash) {
        sessionStorage.setItem('isAdminAuthorized', 'true');
        // This event ensures other parts of the app listening to storage changes will update.
        window.dispatchEvent(new StorageEvent('storage', { key: 'isAdminAuthorized', newValue: 'true' }));
        navigate('/admin', { replace: true });
      } else {
        setError('Incorrect password.');
      }
    } catch (err) {
      console.error('Error during admin login:', err);
      setError('An unexpected error occurred. Your browser might not support the required crypto functions.');
    } finally {
      setIsLoading(false);
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
              disabled={isLoading}
            />
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <div>
            <Button type="submit" className="w-full" isLoading={isLoading}>
              Enter
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default AdminLoginPage;
