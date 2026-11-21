import React from 'react';
import { CheckCircle2 } from 'lucide-react';

export default function LegalCard({ icon: Icon, title, subtitle, items }) {
  return (
    <div className="bg-card border border-teal-500/15 rounded-2xl p-5 md:p-6 shadow-sm card-border-light">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center shrink-0">
          <Icon className="w-5 h-5 text-teal-600" />
        </div>
        <div className="min-w-0">
          <h3 className="font-bold text-foreground leading-tight">{title}</h3>
          <p className="text-[11px] text-muted-foreground">{subtitle}</p>
        </div>
      </div>

      <ul className="space-y-3.5">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-teal-500 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground leading-snug">{item.title}</p>
              <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{item.text}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}