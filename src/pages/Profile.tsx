import { useState, FormEvent } from 'react';
import { User, Save, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

export default function Profile() {
  const { user, displayName, avatarUrl, updateProfile } = useAuth();

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
        <h2 className="text-2xl font-bold text-foreground tracking-tight">
          Profile Settings
        </h2>
        <p className="mt-1 text-muted-foreground">
          Manage your display name and account details.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Avatar preview */}
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16 border-2 border-border">
                {avatarUrl ? (
                  <AvatarImage
                    src={avatarUrl}
                    alt="Profile avatar"
                    referrerPolicy="no-referrer"
                  />
                ) : null}
                <AvatarFallback className="bg-muted">
                  <User className="w-7 h-7 text-muted-foreground" />
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {displayName || 'No display name set'}
                </p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </div>

            {/* Display Name */}
            <div className="space-y-1.5">
              <Label htmlFor="displayName">
                Display Name
              </Label>
              <Input
                id="displayName"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your display name"
                autoComplete="name"
              />
            </div>

            {/* Email (read-only) */}
            <div className="space-y-1.5">
              <Label htmlFor="email">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={user?.email || ''}
                readOnly
                className="opacity-60 cursor-not-allowed"
              />
              <p className="text-xs text-muted-foreground">
                Email is managed by your authentication provider and cannot be changed here.
              </p>
            </div>

            {/* Save button */}
            <div className="pt-2">
              <Button
                type="submit"
                disabled={saving}
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
