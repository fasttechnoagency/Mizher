import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Loader2, LogIn } from 'lucide-react';
import { toast } from 'sonner';

const REDIRECT = {
  doctor:   '/doctor-console',
  retailer: '/retailer-console',
  lab:      '/lab-console',
  hospital: '/hospital-console',
  clinic:   '/clinic-console',
};

/**
 * Login form for provider credential-based login.
 * providerType: 'doctor' | 'retailer' | 'lab' | 'hospital' | 'clinic'
 * onBack: callback to go back to the landing screen
 */
export default function ProviderLoginForm({ providerType, onBack }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username.trim() || !password) {
      toast.error('Please enter your username and password.');
      return;
    }
    setLoading(true);
    try {
      // Authenticate via backend function (service role) — credentials are admin-read-only now,
      // so login must go through a server-side check rather than a direct entity query.
      const res = await base44.functions.invoke('providerLogin', {
        provider_type: providerType,
        username: username.trim(),
        password,
      });

      const { credential_id, session_token, provider_id, provider_name } = res.data;

      // Store provider session
      sessionStorage.setItem('provider_session', JSON.stringify({
        type: providerType,
        id: provider_id,
        name: provider_name,
        credentialId: credential_id,
        sessionToken: session_token,
      }));

      toast.success(`Welcome back, ${provider_name || username}!`);
      // Reload so the console picks up the new session
      window.location.reload();
    } catch (err) {
      const msg = err?.response?.data?.error || 'Invalid username or password.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-10">
      <div className="text-center mb-7">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-teal-500/20">
          <LogIn className="w-7 h-7 text-white" />
        </div>
        <h2 className="text-xl font-bold">Provider Login</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Enter the credentials you set up during registration.
        </p>
      </div>

      <div className="bg-card rounded-2xl border border-teal-100 p-6 space-y-4">
        <div className="space-y-1">
          <Label className="text-sm">Username</Label>
          <Input
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="Your username"
            className="h-10 rounded-xl border-teal-100"
            autoComplete="off"
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
          />

        </div>

        <div className="space-y-1">
          <Label className="text-sm">Password</Label>
          <div className="relative">
            <Input
              type={showPass ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Your password"
              className="h-10 rounded-xl border-teal-100 pr-10"
              autoComplete="off"
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
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

        <Button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-teal-500 hover:bg-teal-600 text-white rounded-xl h-11 font-semibold"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Login'}
        </Button>

        <button
          onClick={onBack}
          className="w-full text-sm text-muted-foreground hover:text-teal-600 transition-colors text-center py-1"
        >
          ← Back
        </button>
      </div>
    </div>
  );
}