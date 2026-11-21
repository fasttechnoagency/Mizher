import React, { useState } from "react";
import { Link } from '@/lib/router-compat';
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn, Mail, Lock, Loader2, Phone, Stethoscope, Store, FlaskConical, Building2, Ambulance } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";
import { safeReturnTo } from "@/lib/authReturnTo";
import GoogleIcon from "@/components/GoogleIcon";

const PROVIDER_CATEGORIES = [
  { key: "doctor",   label: "Doctor",   icon: Stethoscope,  color: "bg-blue-200",   defaultRedirect: "/doctor-console"   },
  { key: "retailer", label: "Retailer", icon: Store,        color: "bg-orange-200", defaultRedirect: "/retailer-console" },
  { key: "lab",      label: "Lab",      icon: FlaskConical, color: "bg-violet-200", defaultRedirect: "/lab-console"     },
  { key: "hospital", label: "Hospital", icon: Building2,    color: "bg-green-200",  defaultRedirect: "/hospital-console" },
  { key: "clinic",   label: "Clinic",   icon: Ambulance,    color: "bg-teal-200",   defaultRedirect: "/clinic-console"   },
];

function ProviderLoginModal({ providerType, onClose }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const cat = PROVIDER_CATEGORIES.find(c => c.key === providerType);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await base44.functions.invoke('providerLogin', { provider_type: providerType, username, password });
      const { credential_id, session_token, provider_id, provider_name, redirect_path } = res.data;
      // Store provider session info and redirect
      sessionStorage.setItem("provider_session", JSON.stringify({ type: providerType, id: provider_id, name: provider_name, credentialId: credential_id, sessionToken: session_token }));
      const fallback = cat?.defaultRedirect || "/";
      window.location.href = redirect_path || fallback;
    } catch (err) {
      setError(err?.response?.data?.error || "Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            {cat && <cat.icon className="w-5 h-5" />}
            <h3 className="font-bold text-lg">{cat?.label} Login</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>
        {error && <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm">{error}</div>}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <Label>Username</Label>
            <Input value={username} onChange={e => setUsername(e.target.value)} placeholder="Enter username" required autoFocus />
          </div>
          <div className="space-y-1">
            <Label>Password</Label>
            <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required autoComplete="off" />
          </div>
          <Button type="submit" className="w-full h-11" disabled={loading}>
            {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Logging in...</> : "Log in"}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default function Login() {
  const [mode, setMode] = useState("email"); // email sign-in (phone sign-in needs an SMS provider)
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const identifier = mode === "phone" ? phone : email;
      await base44.auth.loginViaEmailPassword(identifier, password);
      window.location.href = safeReturnTo();
    } catch (err) {
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => {
    base44.auth.loginWithProvider("google", safeReturnTo());
  };

  return (
    <AuthLayout
      icon={LogIn}
      title="Welcome back"
      subtitle="Log in to your account"
      footer={
        <>
          Don't have an account?{" "}
          <Link to="/register" className="text-primary font-medium hover:underline">
            Create one
          </Link>
        </>
      }
    >
      <div className="flex gap-3 mb-6">
        <Button variant="outline" className="flex-1 h-12 text-sm font-medium" onClick={handleGoogle}>
          <GoogleIcon className="w-5 h-5 mr-2" />
          Continue with Google
        </Button>
      </div>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-3 text-muted-foreground">or</span>
        </div>
      </div>


      {error && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === "email" ? (
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
              <Input id="email" type="email" autoComplete="email" autoFocus
                placeholder="you@example.com" value={email}
                onChange={(e) => setEmail(e.target.value)} className="pl-10 h-12" required />
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
              <Input id="phone" type="tel" autoComplete="tel" autoFocus
                placeholder="+962 7X XXX XXXX" value={phone}
                onChange={(e) => setPhone(e.target.value)} className="pl-10 h-12" required />
            </div>
          </div>
        )}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link to="/forgot-password" className="text-xs text-primary hover:underline">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 h-12"
              required
            />
          </div>
        </div>
        <Button type="submit" className="w-full h-12 font-medium" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Logging in...
            </>
          ) : (
            "Log in"
          )}
        </Button>
      </form>

      <div className="mt-8 pt-6 border-t border-border">
        <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-1">Provider Login</h3>
        <p className="text-xs sm:text-sm text-muted-foreground mb-4">For doctors, retailers, labs, hospitals & clinics to access their console</p>
        <div className="grid grid-cols-5 gap-1.5 sm:gap-3">
          {PROVIDER_CATEGORIES.map(cat => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.key}
                to={cat.defaultRedirect}
                className="flex flex-col rounded-xl sm:rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white"
              >
                <div className={`flex items-center justify-center aspect-square ${cat.color}`}>
                  <Icon className="w-6 h-6 sm:w-9 sm:h-9 text-gray-800" strokeWidth={1.5} />
                </div>
                <div className="py-1.5 sm:py-3 text-center">
                  <span className="text-[10px] sm:text-sm font-bold text-foreground">{cat.label}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </AuthLayout>
  );
}