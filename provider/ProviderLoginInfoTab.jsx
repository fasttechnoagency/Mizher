import React, { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { getProviderSession } from '@/lib/useProviderSession';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { KeyRound, Loader2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

/**
 * Reusable "Login Info" tab for any provider console (doctor, retailer, lab, hospital, clinic).
 * Lets the provider view/change the username and password used to log into their console.
 */
export default function ProviderLoginInfoTab({ providerType, providerId }) {
  const providerSession = getProviderSession();
  const isProviderLogin = providerSession?.type === providerType && providerSession?.id === providerId;

  const baseArgs = {
    provider_type: providerType,
    provider_id: providerId,
    credential_id: isProviderLogin ? providerSession.credentialId : undefined,
    session_token: isProviderLogin ? providerSession.sessionToken : undefined,
  };

  const [username, setUsername] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);

  const qc = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['provider-credential', providerType, providerId],
    queryFn: async () => {
      const res = await base44.functions.invoke('manageProviderCredential', { ...baseArgs, action: 'get' });
      return res.data;
    },
    retry: false,
  });

  useEffect(() => {
    if (data?.username) {
      setUsername(data.username);
      setNewUsername(data.username);
    }
  }, [data]);

  const updateMutation = useMutation({
    mutationFn: () => base44.functions.invoke('manageProviderCredential', {
      ...baseArgs,
      action: 'update',
      username: newUsername !== username ? newUsername : undefined,
      password: password || undefined,
    }),
    onSuccess: (res) => {
      toast.success('Login info updated.');
      setUsername(res.data.username);
      setNewUsername(res.data.username);
      setPassword('');
      setConfirm('');
      qc.invalidateQueries(['provider-credential', providerType, providerId]);
    },
    onError: (err) => toast.error(err?.response?.data?.error || 'Failed to update login info.'),
  });

  const handleSubmit = () => {
    if (!newUsername.trim()) return toast.error('Username cannot be empty.');
    if (password && password.length < 6) return toast.error('Password must be at least 6 characters.');
    if (password && password !== confirm) return toast.error('Passwords do not match.');
    if (newUsername === username && !password) return toast.error('No changes to save.');
    updateMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="w-6 h-6 text-teal-500 animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-card rounded-2xl border border-teal-100 p-6 max-w-md text-center text-sm text-muted-foreground">
        You're not authorized to view login info for this account.
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl border border-teal-100 p-6 max-w-md space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <KeyRound className="w-5 h-5 text-teal-600" />
        <h3 className="font-bold text-base">Login Info</h3>
      </div>
      <p className="text-xs text-muted-foreground -mt-2">Update the username and password you use to access your console.</p>

      <div className="space-y-1">
        <Label className="text-sm">Username</Label>
        <Input value={newUsername} onChange={e => setNewUsername(e.target.value)} className="h-10 rounded-xl border-teal-100" autoComplete="off" />
      </div>

      <div className="space-y-1">
        <Label className="text-sm">New Password</Label>
        <div className="relative">
          <Input
            type={showPass ? 'text' : 'password'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Leave blank to keep current password"
            className="h-10 rounded-xl border-teal-100 pr-10"
            autoComplete="new-password"
          />
          <button type="button" onClick={() => setShowPass(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {password && (
        <div className="space-y-1">
          <Label className="text-sm">Confirm Password</Label>
          <Input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} className="h-10 rounded-xl border-teal-100" />
        </div>
      )}

      <Button onClick={handleSubmit} disabled={updateMutation.isPending} className="w-full bg-teal-500 hover:bg-teal-600 text-white rounded-xl h-11 font-semibold">
        {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
      </Button>
    </div>
  );
}