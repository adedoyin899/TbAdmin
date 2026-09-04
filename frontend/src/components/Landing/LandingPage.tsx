import React, { useState, useEffect } from 'react';
import { LandingNav } from './LandingNav';
import { HeroSection } from './sections/HeroSection';

export const LandingPage: React.FC = () => {
  const [isDark, setIsDark] = useState(
    document.documentElement.getAttribute('data-mode') !== 'light'
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.getAttribute('data-mode') !== 'light');
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-mode'] });
    return () => observer.disconnect();
  }, []);

  const toggleMode = () => {
    const next = isDark ? 'light' : 'dark';
    document.documentElement.setAttribute('data-mode', next);
    localStorage.setItem('theme-mode', next);
    setIsDark(!isDark);
  };

  return (
    <div
      data-landing-root
      className="fixed inset-0 overflow-y-auto"
      style={{ background: 'var(--bg)' }}
    >
      <LandingNav isDark={isDark} onToggleMode={toggleMode} />
      <HeroSection />
      {/* Remaining sections are being built incrementally, verified one at a time. */}
    </div>
  );
};
