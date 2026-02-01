import { useState, FormEvent } from 'react';
import { User, Save, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/Toast';
import Card, { CardHeader, CardTitle, CardContent } from '../components/Card';

export default function Profile() {
  const { user, displayName, avatarUrl, updateProfile } = useAuth();
  const toast = useToast();

  const [name, setName] = useState(displayName || '');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const trimmedName = name.trim();
    if (!trimmedName) {
      toast.error('Display name cannot be empty.');
      return;
    }

    setSaving(true);
    try {
      const { error } = await updateProfile({ full_name: trimmedName });

      if (error) {
        toast.error(error.message || 'Failed to update profile.');
      } else {
        toast.success('Profile updated successfully.');
      }
    } catch {
      toast.error('An unexpected error occurred.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="font-heading text-2xl font-bold text-text-primary tracking-tight">
          Profile Settings
        </h2>
        <p className="mt-1 text-text-secondary">
          Manage your display name and account details.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle as="h3">Your Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Avatar preview */}
            <div className="flex items-center gap-4">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Profile avatar"
                  className="w-16 h-16 rounded-full border-2 border-ocean-700/30"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-coral-400/20 to-gold-400/10 border-2 border-ocean-700/30 flex items-center justify-center">
                  <User className="w-7 h-7 text-coral-400" />
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-text-primary">
                  {displayName || 'No display name set'}
                </p>
                <p className="text-xs text-text-muted">{user?.email}</p>
              </div>
            </div>

            {/* Display Name */}
            <div className="space-y-1.5">
              <label htmlFor="displayName" className="block text-sm font-medium text-text-secondary">
                Display Name
              </label>
              <input
                id="displayName"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your display name"
                className="input-field"
                autoComplete="name"
              />
            </div>

            {/* Email (read-only) */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-sm font-medium text-text-secondary">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={user?.email || ''}
                readOnly
                className="input-field opacity-60 cursor-not-allowed"
              />
              <p className="text-xs text-text-muted">
                Email is managed by your authentication provider and cannot be changed here.
              </p>
            </div>

            {/* Save button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={saving}
                className="btn-primary inline-flex items-center gap-2"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
