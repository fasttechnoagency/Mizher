import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LogIn, UserPlus } from 'lucide-react';
import ProviderLoginForm from '@/components/provider/ProviderLoginForm';

/**
 * Shows two options: Register or Login.
 * onRegister: callback to proceed to registration form
 * providerType: for the login form
 * icon: React element (the provider icon)
 * title / subtitle: strings shown in the header
 */
export default function ProviderLandingScreen({ onRegister, providerType, icon, title, subtitle }) {
  const [mode, setMode] = useState(null); // null | 'login'

  if (mode === 'login') {
    return <ProviderLoginForm providerType={providerType} onBack={() => setMode(null)} />;
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-14">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-teal-500/20">
            {icon}
          </div>
          <h1 className="text-2xl font-bold mb-2">{title}</h1>
          {subtitle && <p className="text-muted-foreground text-sm max-w-md mx-auto">{subtitle}</p>}
        </div>

        {/* Two option cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Register */}
          <button
            onClick={onRegister}
            className="group flex flex-col items-center gap-4 p-6 bg-card border-2 border-teal-100 hover:border-teal-400 rounded-2xl transition-all text-center shadow-sm hover:shadow-md"
          >
            <div className="w-12 h-12 rounded-xl bg-teal-50 group-hover:bg-teal-100 flex items-center justify-center transition-colors">
              <UserPlus className="w-6 h-6 text-teal-600" />
            </div>
            <div>
              <p className="font-semibold text-foreground text-base">Register</p>
              <p className="text-xs text-muted-foreground mt-1">New here? Create your provider profile</p>
            </div>
          </button>

          {/* Login */}
          <button
            onClick={() => setMode('login')}
            className="group flex flex-col items-center gap-4 p-6 bg-card border-2 border-teal-100 hover:border-teal-400 rounded-2xl transition-all text-center shadow-sm hover:shadow-md"
          >
            <div className="w-12 h-12 rounded-xl bg-teal-50 group-hover:bg-teal-100 flex items-center justify-center transition-colors">
              <LogIn className="w-6 h-6 text-teal-600" />
            </div>
            <div>
              <p className="font-semibold text-foreground text-base">Login</p>
              <p className="text-xs text-muted-foreground mt-1">Already registered? Access your dashboard</p>
            </div>
          </button>
        </div>
      </motion.div>
    </div>
  );
}