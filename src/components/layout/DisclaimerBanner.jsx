import React from 'react';
import { ShieldAlert } from 'lucide-react';

export default function DisclaimerBanner() {
  return (
    <div className="bg-amber-50/80 dark:bg-amber-950/40 border-b border-amber-200/60 dark:border-amber-900/40 py-2 px-4 text-center transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-center space-x-2 text-xs text-amber-800 dark:text-amber-300 font-medium">
        <ShieldAlert className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
        <span>
          <strong>Independent Practice Simulator:</strong> Not affiliated with, sponsored by, or endorsed by any employer. For skills practice & cognitive training only.
        </span>
      </div>
    </div>
  );
}
