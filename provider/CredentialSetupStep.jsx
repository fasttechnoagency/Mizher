import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { KeyRound, Loader2, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

const REDIRECT = {
  doctor: '/doctor-console',
  retailer: '/retailer-console',
  lab: '/lab-console',
  hospital: '/hospital-console',
  clinic: '/clinic-console',
};

export default function CredentialSetupStep({ providerType, providerId, providerName, onDone }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [done, setDone] = useState(false);

  const createMutation = useMutation({
    mutationFn: () =>
      base44.functions.invoke('manageProviderCredential', {
        action: 'create',
        provider_type: providerType,
        provider_id: providerId,
        provider_name: providerName,
        username: username.trim(),
        password,
        redirect_path: REDIRECT[providerType] || '/',
      }).then((r) => {
        if (r.data?.error) throw new Error(r.data.error);
        return r.data;
      }),
    onSuccess: () => {
      setDone(true);
      toast.success('Credentials submitted! Waiting for admin approval.');
      if (onDone) onDone();
    },
    onError: () => toast.error('Failed to save credentials. Please try again.'),
  });

  const handleSubmit = () => {
    if (!username.trim()) return toast.error('Please enter a username.');
    if (password.length < 6) return toast.error('Password must be at least 6 characters.');
    if (password !== confirm) return toast.error('Passwords do not match.');
    createMutation.mutate();
  };

  if (done) {
    return (
      <div className="text-center py-10 space-y-3">
        <div className="w-14 h-14 rounded-full bg-teal-50 flex items-center justify-center mx-auto">
          <CheckCircle className="w-7 h-7 text-teal-500" />
        </div>
        <h2 className="text-lg font-semibold">Profile Submitted!</h2>
        <p className="text-sm text-muted-foreground max-w-xs mx-auto">
          Your credentials have been saved and are awaiting admin approval. You'll be able to log in once approved.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <div className="text-center mb-7">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-teal-500/20">
          <KeyRound className="w-7 h-7 text-white" />
        </div>
        <h2 className="text-xl font-bold">Create Your Login</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Set up the username and password you'll use to access your dashboard. An admin will approve your account shortly.
        </p>
      </div>

      <div className="bg-card rounded-2xl border border-teal-100 p-6 space-y-4">
        <div className="space-y-1">
          <Label className="text-sm">Username</Label>
          <Input
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="e.g. dr.ahmed"
            className="h-10 rounded-xl border-teal-100"
            autoComplete="off"
          />
        </div>

        <div className="space-y-1">
          <Label className="text-sm">Password</Label>
          <div className="relative">
            <Input
              type={showPass ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Min. 6 characters"
              className="h-10 rounded-xl border-teal-100 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPass(p => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="space-y-1">
          <Label className="text-sm">Confirm Password</Label>
          <Input
            type="password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            placeholder="Re-enter password"
            className="h-10 rounded-xl border-teal-100"
          />
        </div>

        <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-xs text-amber-700">
          ⚠️ Your account will be activated after admin approval. You'll receive access to your full dashboard once approved.
        </div>

        <Button
          onClick={handleSubmit}
          disabled={createMutation.isPending}
          className="w-full bg-teal-500 hover:bg-teal-600 text-white rounded-xl h-11 font-semibold"
        >
          {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit Credentials'}
        </Button>
      </div>
    </div>
  );
}