// src/components/Common/TimezoneSelector.tsx
// Compact timezone selector dropdown for time-based metrics (e.g., Mailgun click timing, LinkedIn hourly engagement)

import React, { useState } from 'react';
import { Globe } from 'lucide-react';


export interface TimezoneOption {
  value: string;
  label: string;
  abbr: string;
  offset: string;
}

export const TIMEZONE_OPTIONS: TimezoneOption[] = [
  { value: 'UTC', label: 'Coordinated Universal Time', abbr: 'UTC', offset: '+00:00' },
  { value: 'America/New_York', label: 'Eastern Time (US)', abbr: 'EST/EDT', offset: '-05:00' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (US)', abbr: 'PST/PDT', offset: '-08:00' },
  { value: 'Europe/London', label: 'London Time (UK)', abbr: 'GMT/BST', offset: '+00:00' },
  { value: 'Asia/Tokyo', label: 'Tokyo Time (JST)', abbr: 'JST', offset: '+09:00' },
];

interface TimezoneSelectorProps {
  value?: string;
  onChange?: (tz: string) => void;
  className?: string;
}

export const TimezoneSelector: React.FC<TimezoneSelectorProps> = ({
  value = 'UTC',
  onChange,
  className = '',
}) => {
  const [selectedTz, setSelectedTz] = useState<string>(value);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedTz(val);
    if (onChange) onChange(val);
  };

  return (

    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium ${className}`}
      style={{
        background: 'var(--panel-2)',
        borderColor: 'var(--line)',
        position: 'relative',
      }}
    >
      <Globe size={13} color="var(--dim)" />
      <span style={{ color: 'var(--text-2)', marginRight: 2 }}>TZ:</span>
      <select
        value={selectedTz}
        onChange={handleChange}
        style={{
          background: 'transparent',
          border: 'none',
          color: 'var(--text)',
          fontSize: 12,
          fontWeight: 600,
          outline: 'none',
          cursor: 'pointer',
          paddingRight: 4,
        }}
      >
        {TIMEZONE_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value} style={{ background: 'var(--panel)', color: 'var(--text)' }}>
            {opt.abbr} ({opt.offset})
          </option>
        ))}
      </select>
    </div>
  );
};
