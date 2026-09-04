import React, { useState } from 'react';
import { Sun, Moon, Menu, X } from 'lucide-react';
import tblogo from '../../assets/tblogo.svg';
import tbLogolight from '../../assets/tbLogolight.svg';

const NAV_LINKS = ['How it works', 'Features', 'Pricing', 'FAQ', 'About us'];

interface LandingNavProps {
  isDark: boolean;
  onToggleMode: () => void;
}

export const LandingNav: React.FC<LandingNavProps> = ({ isDark, onToggleMode }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Desktop floating pill nav */}
      <div
        className="fixed left-1/2 top-6 z-50 hidden w-[calc(100%-48px)] max-w-[1142px] -translate-x-1/2 items-center justify-between rounded-full px-4 py-2 backdrop-blur-md md:flex"
        style={{
          background: 'var(--panel)',
          border: '1px solid var(--line)',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <a href="#top" className="flex items-center gap-2">
          <img src={isDark ? tblogo : tbLogolight} alt="TalentBridge" style={{ height: 26 }} />
        </a>

        <nav className="hidden items-center gap-6 lg:flex">
          {NAV_LINKS.map(link => (
            <a
              key={link}
              href={`#${link.toLowerCase().replace(/\s+/g, '-')}`}
              style={{ color: 'var(--text-2)', fontSize: 14 }}
              className="transition-colors hover:opacity-80"
            >
              {link}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={onToggleMode}
            aria-label="Toggle theme"
            className="flex size-9 items-center justify-center rounded-full transition-colors"
            style={{ border: '1px solid var(--line)' }}
          >
            {isDark ? <Sun size={15} color="var(--text-2)" /> : <Moon size={15} color="var(--text-2)" />}
          </button>
          <a
            href="#early-access"
            className="rounded-full px-5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: 'var(--accent)' }}
          >
            Get early access
          </a>
        </div>
      </div>

      {/* Mobile top bar */}
      <div
        className="fixed inset-x-0 top-0 z-50 flex items-center justify-between px-4 py-3 md:hidden"
        style={{ background: 'var(--panel)', borderBottom: '1px solid var(--line)' }}
      >
        <a href="#top" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
          <img src={isDark ? tblogo : tbLogolight} alt="TalentBridge" style={{ height: 22 }} />
        </a>
        <button
          onClick={() => setMobileOpen(v => !v)}
          aria-label="Toggle menu"
          className="flex size-9 items-center justify-center rounded-md"
        >
          {mobileOpen ? <X size={20} color="var(--text)" /> : <Menu size={20} color="var(--text)" />}
        </button>
      </div>

      {mobileOpen && (
        <div
          className="fixed inset-x-0 top-[57px] z-40 flex flex-col gap-1 px-4 py-4 md:hidden"
          style={{ background: 'var(--panel)', borderBottom: '1px solid var(--line)', boxShadow: 'var(--shadow-lg)' }}
        >
          {NAV_LINKS.map(link => (
            <a
              key={link}
              href={`#${link.toLowerCase().replace(/\s+/g, '-')}`}
              onClick={() => setMobileOpen(false)}
              className="rounded-md px-2 py-2.5 text-sm"
              style={{ color: 'var(--text-2)' }}
            >
              {link}
            </a>
          ))}
          <div className="mt-2 flex items-center gap-2">
            <button
              onClick={onToggleMode}
              aria-label="Toggle theme"
              className="flex size-9 shrink-0 items-center justify-center rounded-full"
              style={{ border: '1px solid var(--line)' }}
            >
              {isDark ? <Sun size={15} color="var(--text-2)" /> : <Moon size={15} color="var(--text-2)" />}
            </button>
            <a
              href="#early-access"
              onClick={() => setMobileOpen(false)}
              className="flex-1 rounded-full px-5 py-2.5 text-center text-sm font-semibold text-white"
              style={{ background: 'var(--accent)' }}
            >
              Get early access
            </a>
          </div>
        </div>
      )}
    </>
  );
};
