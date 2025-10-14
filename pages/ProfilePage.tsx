import React, { useState, FormEvent } from 'react';
import { useAI } from '../contexts/AIContext';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Toast from '../ui/Toast';

const ProfilePage: React.FC = () => {
    const { user, updateUserUsername, updateUserPassword } = useAI();

    // State for username update
    const [newUsername, setNewUsername] = useState(user?.user_metadata?.username || '');
    const [isUpdatingUsername, setIsUpdatingUsername] = useState(false);
    
    // State for password update
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

    // General state
    const [error, setError] = useState<{ type: 'username' | 'password', message: string } | null>(null);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    const handleUsernameUpdate = async (e: FormEvent) => {
        e.preventDefault();
        if (!newUsername || newUsername.length < 3) {
            setError({ type: 'username', message: 'Username must be at least 3 characters.' });
            return;
        }
        setIsUpdatingUsername(true);
        setError(null);
        try {
            await updateUserUsername(newUsername);
            showToast('Username updated successfully!');
        } catch (err: any) {
            setError({ type: 'username', message: err.message || 'Failed to update username.' });
        } finally {
            setIsUpdatingUsername(false);
        }
    };

    const handlePasswordUpdate = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        if (newPassword.length < 6) {
            setError({ type: 'password', message: 'Password must be at least 6 characters.' });
            return;
        }
        if (newPassword !== confirmPassword) {
            setError({ type: 'password', message: 'Passwords do not match.' });
            return;
        }
        setIsUpdatingPassword(true);
        try {
            await updateUserPassword(newPassword);
            showToast('Password updated successfully!');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err: any) {
            setError({ type: 'password', message: err.message || 'Failed to update password.' });
        } finally {
            setIsUpdatingPassword(false);
        }
    };

    const inputStyles = "block w-full px-3 py-2 bg-background border border-border-color rounded-md focus:outline-none focus:ring-primary text-text-primary";
    const labelStyles = "block text-sm font-medium text-text-secondary mb-1";

    return (
        <>
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            <div className="container mx-auto p-4 md:p-6 lg:p-8">
                <div className="max-w-3xl mx-auto space-y-8">
                    <div className="text-center">
                        <h1 className="text-4xl font-extrabold text-primary">My Profile</h1>
                        <p className="mt-2 text-lg text-text-secondary">Manage your account settings.</p>
                    </div>

                    <Card>
                        <div className="p-6">
                            <h2 className="text-2xl font-bold mb-4">Profile Information</h2>
                            <form onSubmit={handleUsernameUpdate} className="space-y-4">
                                <div>
                                    <label className={labelStyles}>Email Address</label>
                                    <input type="email" value={user?.email || ''} className={`${inputStyles} cursor-not-allowed bg-border-color/20`} disabled />
                                </div>
                                <div>
                                    <label htmlFor="username" className={labelStyles}>Username</label>
                                    <input id="username" type="text" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} className={inputStyles} required />
                                    {error?.type === 'username' && <p className="text-red-500 text-sm mt-1">{error.message}</p>}
                                </div>
                                <div className="text-right">
                                    <Button type="submit" isLoading={isUpdatingUsername}>Save Changes</Button>
                                </div>
                            </form>
                        </div>
                    </Card>

                    <Card>
                        <div className="p-6">
                            <h2 className="text-2xl font-bold mb-4">Change Password</h2>
                            <form onSubmit={handlePasswordUpdate} className="space-y-4">
                                <div>
                                    <label htmlFor="newPassword" className={labelStyles}>New Password</label>
                                    <input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={inputStyles} required />
                                </div>
                                <div>
                                    <label htmlFor="confirmPassword" className={labelStyles}>Confirm New Password</label>
                                    <input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={inputStyles} required />
                                    {error?.type === 'password' && <p className="text-red-500 text-sm mt-1">{error.message}</p>}
                                </div>
                                <div className="text-right">
                                    <Button type="submit" isLoading={isUpdatingPassword}>Update Password</Button>
                                </div>
                            </form>
                        </div>
                    </Card>
                </div>
            </div>
        </>
    );
};

export default ProfilePage;