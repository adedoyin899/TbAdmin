import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronDown, Check, X } from 'lucide-react';

export interface DateRangeValue {
  preset: string; // '7d' | '30d' | '90d' | '12m' | 'custom'
  startDate?: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
}

export interface DateRangeSelectorProps {
  value: DateRangeValue;
  onChange: (val: DateRangeValue) => void;
  idPrefix?: string;
}

const PRESET_OPTIONS = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: '12m', label: 'Last 12 months' },
  { value: 'custom', label: 'Custom Range…' },
];

export const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({
  value,
  onChange,
  idPrefix = 'date-range',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tempStart, setTempStart] = useState(value.startDate || getDefaultStartDate());
  const [tempEnd, setTempEnd] = useState(value.endDate || getDefaultEndDate());
  const containerRef = useRef<HTMLDivElement>(null);

  function getDefaultStartDate() {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  }

  function getDefaultEndDate() {
    return new Date().toISOString().split('T')[0];
  }

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectPreset = (preset: string) => {
    if (preset === 'custom') {
      setIsOpen(true);
    } else {
      onChange({ preset });
      setIsOpen(false);
    }
  };

  const handleApplyCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempStart || !tempEnd) return;
    onChange({
      preset: 'custom',
      startDate: tempStart,
      endDate: tempEnd,
    });
    setIsOpen(false);
  };

  const setThisMonth = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    setTempStart(start.toISOString().split('T')[0]);
    setTempEnd(now.toISOString().split('T')[0]);
  };

  const setLastMonth = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 0);
    setTempStart(start.toISOString().split('T')[0]);
    setTempEnd(end.toISOString().split('T')[0]);
  };

  const currentLabel = value.preset === 'custom' && value.startDate && value.endDate
    ? `${value.startDate} – ${value.endDate}`
    : PRESET_OPTIONS.find(p => p.value === value.preset)?.label || 'Last 30 days';

  return (
    <div ref={containerRef} style={{ position: 'relative', display: 'inline-block' }}>
      {/* Trigger button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <button
          id={`${idPrefix}-btn`}
          type="button"
          onClick={() => setIsOpen(prev => !prev)}
          className="btn btn-ghost"
          style={{
            background: 'var(--panel)',
            border: '1px solid var(--line)',
            padding: '7px 12px',
            fontSize: 13,
            gap: 8,
            color: 'var(--text)',
            borderRadius: 'var(--radius-xs)',
          }}
        >
          <Calendar size={14} color="var(--accent)" />
          <span style={{ fontWeight: 500 }}>{currentLabel}</span>
          <ChevronDown size={13} color="var(--dim)" />
        </button>

        {value.preset === 'custom' && (
          <button
            onClick={() => onChange({ preset: '30d' })}
            className="btn-icon"
            style={{ width: 26, height: 26, border: 'none', background: 'var(--panel-2)' }}
            title="Reset to default (30 days)"
          >
            <X size={12} />
          </button>
        )}
      </div>

      {/* Popover Dropdown */}
      {isOpen && (
        <div
          className="animate-slide-up"
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            right: 0,
            zIndex: 100,
            minWidth: 320,
            maxWidth: '90vw',
            background: 'var(--panel)',
            border: '1px solid var(--line)',
            borderRadius: 'var(--radius)',
            boxShadow: 'var(--shadow-lg)',
            padding: 16,
          }}
        >
          <div style={{ marginBottom: 12, borderBottom: '1px solid var(--line)', paddingBottom: 10 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--faint)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
              Standard Ranges
            </p>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {PRESET_OPTIONS.map(p => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => handleSelectPreset(p.value)}
                  style={{
                    padding: '5px 10px',
                    fontSize: 12,
                    borderRadius: 6,
                    border: '1px solid var(--line)',
                    background: value.preset === p.value ? 'var(--ink)' : 'var(--panel-2)',
                    color: value.preset === p.value ? '#2DD4BF' : 'var(--text-2)',
                    cursor: 'pointer',
                    fontWeight: value.preset === p.value ? 600 : 400,
                    transition: 'all 0.12s ease',
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Date Inputs Section */}
          <form onSubmit={handleApplyCustom}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--faint)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Exact Date Range
              </p>
              <div style={{ display: 'flex', gap: 4 }}>
                <button
                  type="button"
                  onClick={setThisMonth}
                  style={{ fontSize: 10, background: 'transparent', border: 'none', color: 'var(--accent)', cursor: 'pointer', textDecoration: 'underline' }}
                >
                  This Month
                </button>
                <span style={{ color: 'var(--line-2)', fontSize: 10 }}>•</span>
                <button
                  type="button"
                  onClick={setLastMonth}
                  style={{ fontSize: 10, background: 'transparent', border: 'none', color: 'var(--accent)', cursor: 'pointer', textDecoration: 'underline' }}
                >
                  Last Month
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
              <div>
                <label htmlFor={`${idPrefix}-start`} style={{ display: 'block', fontSize: 11, color: 'var(--text-2)', marginBottom: 4 }}>
                  Start Date
                </label>
                <input
                  id={`${idPrefix}-start`}
                  type="date"
                  value={tempStart}
                  onChange={e => setTempStart(e.target.value)}
                  className="input"
                  style={{ fontSize: 12, padding: '6px 8px', width: '100%' }}
                  required
                />
              </div>

              <div>
                <label htmlFor={`${idPrefix}-end`} style={{ display: 'block', fontSize: 11, color: 'var(--text-2)', marginBottom: 4 }}>
                  End Date
                </label>
                <input
                  id={`${idPrefix}-end`}
                  type="date"
                  value={tempEnd}
                  onChange={e => setTempEnd(e.target.value)}
                  className="input"
                  style={{ fontSize: 12, padding: '6px 8px', width: '100%' }}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="btn btn-ghost"
                style={{ padding: '6px 12px', fontSize: 12 }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ padding: '6px 14px', fontSize: 12, gap: 5 }}
              >
                <Check size={13} strokeWidth={2.5} />
                Apply Range
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
