import React from 'react';
import { ArrowRight, GripVertical, Eye, MousePointerClick, TrendingUp, Play } from 'lucide-react';

const ROLE_CHIPS = ['DevOps', 'Compliance', 'Design', 'Data', 'Student'];
const SKILL_BADGES = ['AWS', 'Kubernetes', 'Terraform', 'GitHub Actions', 'Go · Python'];

const RoomRowHeader: React.FC<{ label: string; showBadge?: boolean }> = ({ label, showBadge = true }) => (
  <div className="flex w-full items-center justify-between">
    <div className="flex items-center gap-2">
      <GripVertical size={13} color="var(--dim)" />
      <p className="text-xs font-medium tracking-wide" style={{ color: 'var(--dim)' }}>{label}</p>
    </div>
    {showBadge && (
      <span
        className="rounded-full px-2 py-0.5 text-[11px] font-medium"
        style={{ background: 'rgba(13,148,136,0.1)', color: 'var(--accent)' }}
      >
        Core
      </span>
    )}
  </div>
);

const DashedPlaceholder: React.FC<{ height?: number }> = ({ height = 79 }) => (
  <div
    className="w-full rounded-[10px] border-2 border-dashed"
    style={{ height, background: 'var(--panel-2)', borderColor: 'var(--line)' }}
  />
);

const ExampleRoomMockup: React.FC = () => (
  <div className="flex w-full max-w-[880px] flex-col items-center gap-3.5">
    <p className="text-[11px] uppercase tracking-[1.5px]" style={{ color: 'var(--accent)' }}>Live example room</p>

    <div
      className="w-full max-w-[776px] overflow-hidden rounded-[10px] border"
      style={{ background: 'var(--panel)', borderColor: 'var(--line)', boxShadow: 'var(--shadow-lg)' }}
    >
      {/* Browser chrome header */}
      <div
        className="flex items-center gap-3 border-b px-[18px] py-3"
        style={{ background: 'var(--panel-2)', borderColor: 'var(--line)' }}
      >
        <div className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full" style={{ background: 'var(--line-2)' }} />
          <span className="size-2.5 rounded-full" style={{ background: 'var(--line-2)' }} />
          <span className="size-2.5 rounded-full" style={{ background: 'var(--line-2)' }} />
        </div>
        <div className="flex flex-1 justify-center">
          <div
            className="rounded-full border px-4 py-1.5 text-xs"
            style={{ background: 'var(--panel)', borderColor: 'var(--line)', color: 'var(--dim)' }}
          >
            talentbridge.cv/r/daniel-okafor · <span style={{ color: 'var(--accent)' }}>private link</span>
          </div>
        </div>
        <span
          className="rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-wider"
          style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}
        >
          Live
        </span>
      </div>

      <div className="flex flex-col gap-6 px-6 py-6">
        {/* Video Introduction */}
        <div className="flex flex-col gap-4">
          <RoomRowHeader label="VIDEO INTRODUCTION" />
          <DashedPlaceholder height={200} />
        </div>
        <div className="h-px w-full" style={{ background: 'var(--line)' }} />

        {/* Profile */}
        <div className="flex flex-col gap-4">
          <RoomRowHeader label="PROFILE" />
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div
                className="flex size-12 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
                style={{ background: 'linear-gradient(135deg, var(--accent-light), var(--accent2))' }}
              >
                KM
              </div>
              <div className="flex flex-col gap-1">
                <p className="font-semibold" style={{ fontFamily: 'Sora, sans-serif', color: 'var(--text)' }}>Kofi Mensah</p>
                <p className="text-sm" style={{ color: 'var(--text-2)' }}>IAM Specialists &amp; Contractor · London · UK &amp; remote EMEA</p>
              </div>
            </div>
            <div className="flex items-center gap-1 opacity-60">
              <Eye size={16} color="var(--dim)" />
              <span style={{ color: 'var(--dim)' }}>4</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {SKILL_BADGES.map(skill => (
              <span
                key={skill}
                className="rounded-full px-3 py-2 text-xs"
                style={{ background: 'var(--teal-subtle, rgba(45,212,191,0.12))', color: 'var(--accent2)' }}
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
        <div className="h-px w-full" style={{ background: 'var(--line)' }} />

        {[
          { label: 'HEADLINE METRICS', height: 79 },
          { label: 'FEATURED PROJECTS', height: 79 },
          { label: 'WORK GALLERY', height: 79, badge: false },
          { label: 'CASE STUDIES', height: 79 },
          { label: 'REFERENCES', height: 79 },
        ].map((row, idx, arr) => (
          <React.Fragment key={row.label}>
            <div className="flex flex-col gap-4">
              <RoomRowHeader label={row.label} showBadge={row.badge !== false} />
              <DashedPlaceholder height={row.height} />
            </div>
            {idx < arr.length - 1 && <div className="h-px w-full" style={{ background: 'var(--line)' }} />}
          </React.Fragment>
        ))}

        <div className="relative flex justify-center">
          <MousePointerClick size={26} color="var(--dim)" style={{ position: 'absolute', left: '38%', top: -18 }} />
        </div>
      </div>
    </div>

    {/* Role filter chips */}
    <div className="flex flex-wrap items-center justify-center gap-2 pt-1.5">
      {ROLE_CHIPS.map((chip, idx) => (
        <span
          key={chip}
          className="rounded-full border px-4 py-2 text-[11px] tracking-wide"
          style={
            idx === 0
              ? { background: 'rgba(13,148,136,0.07)', borderColor: 'var(--accent)', color: 'var(--text)' }
              : { borderColor: 'var(--line-2)', color: 'var(--text-2)' }
          }
        >
          {chip}
        </span>
      ))}
    </div>

    <p className="pt-1.5 text-[11px] uppercase tracking-wider opacity-70" style={{ color: 'var(--text-2)' }}>
      This is a Showcase Room · yours can look like this in 10 minutes
    </p>
  </div>
);

const FLOATING_CARDS: { title: string; top: number; left?: number; right?: number; rotate: number; icon: React.ReactNode }[] = [
  { title: 'Video intro', top: 20, right: -80, rotate: 10, icon: <Play size={10} color="var(--accent)" /> },
  { title: 'Skill tags', top: 260, right: -110, rotate: 7, icon: null },
  { title: 'Reference', top: 520, right: -70, rotate: 10, icon: null },
  { title: 'Document card', top: 780, right: -110, rotate: 10, icon: null },
  { title: 'Profile', top: 10, left: -90, rotate: -10, icon: null },
  { title: 'Pull quote', top: 250, left: -60, rotate: -10, icon: <TrendingUp size={11} color="var(--accent)" /> },
  { title: 'Work gallery', top: 490, left: -100, rotate: -10, icon: null },
];

const FloatingCard: React.FC<(typeof FLOATING_CARDS)[number]> = ({ title, top, left, right, rotate, icon }) => (
  <div
    className="absolute hidden w-[146px] rounded-[10px] border p-3 2xl:block"
    style={{
      top,
      left,
      right,
      transform: `rotate(${rotate}deg)`,
      background: 'var(--panel)',
      borderColor: 'var(--accent)',
      boxShadow: 'var(--shadow)',
    }}
  >
    <div className="mb-4 flex h-[72px] items-center justify-center rounded-lg" style={{ background: 'var(--panel-2)' }}>
      {icon}
    </div>
    <div className="flex items-center justify-between">
      <p className="text-sm font-semibold" style={{ color: 'var(--text-2)' }}>{title}</p>
      <span className="flex size-6 items-center justify-center rounded-md" style={{ background: 'var(--accent)' }}>
        <span className="text-xs leading-none text-white">+</span>
      </span>
    </div>
  </div>
);

export const HeroSection: React.FC = () => {
  return (
    <section id="top" className="relative pb-16 pt-24 sm:pb-20 sm:pt-28 md:pb-[120px] md:pt-[208px]" style={{ background: 'var(--bg)' }}>
      {/* Ambient brand glow, matching the login page's radial-glow convention */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute left-1/2 top-0 h-[600px] w-[920px] -translate-x-1/2 rounded-full"
          style={{ background: 'radial-gradient(ellipse at center, rgba(13,148,136,0.12) 0%, transparent 65%)' }}
        />
      </div>

      <div className="relative mx-auto flex max-w-[1440px] flex-col items-center gap-12 px-6">
        <div className="flex flex-col items-center gap-8">
          <div className="flex flex-col items-center gap-4 text-center">
            <h1
              className="text-[40px] leading-[1.08] tracking-tight sm:text-[64px] md:text-[84px] md:leading-[1.05]"
              style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, color: 'var(--text)' }}
            >
              You&apos;re not a
              <br className="sm:hidden" />{' '}
              <span
                style={{
                  background: 'linear-gradient(90deg, var(--accent), var(--sunset))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                2-page summary.
              </span>
            </h1>
            <p className="max-w-[659px] text-lg md:text-xl" style={{ color: 'var(--text-2)' }}>
              Your new secret weapon. A dynamic, skills-first portfolio that lets you present your expertise the way it actually deserves to be seen.
            </p>
          </div>

          <div className="flex w-full flex-col items-center gap-6 px-6 sm:w-auto sm:px-0">
            <div className="flex w-full flex-col items-center gap-4 sm:w-auto sm:flex-row sm:flex-wrap sm:justify-center sm:gap-2.5">
              <a
                href="#early-access"
                className="flex h-10 w-full items-center justify-center gap-2 rounded-full px-6 text-sm font-medium text-white transition-opacity hover:opacity-90 sm:w-auto"
                style={{ background: 'var(--accent)' }}
              >
                Get early access
                <ArrowRight size={16} />
              </a>
              <a
                href="#example-room"
                className="flex h-10 w-full items-center justify-center rounded-full border px-6 text-sm font-medium transition-colors hover:opacity-80 sm:w-auto"
                style={{ borderColor: 'var(--line-2)', color: 'var(--text)' }}
              >
                See an example room
              </a>
            </div>
            <p className="text-center text-sm uppercase tracking-wide opacity-70" style={{ color: 'var(--text-2)' }}>
              Private by default · You control every view <span className="block sm:inline">· UK GDPR native</span>
            </p>
          </div>
        </div>

        {/* The room mockup only appears in the Figma design from md (tablet) upward — on
            mobile the Hero section is just headline + CTAs + subcopy. */}
        <div className="relative hidden w-full flex-col items-center md:flex">
          {FLOATING_CARDS.map(card => (
            <FloatingCard key={card.title} {...card} />
          ))}
          <ExampleRoomMockup />
        </div>
      </div>
    </section>
  );
};
