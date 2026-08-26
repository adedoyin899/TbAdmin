import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Play, Pause, RotateCcw, ExternalLink, X,
  MousePointer, Maximize2, Minimize2, Shield, Check, Copy, Sparkles,
} from 'lucide-react';
import type { SessionRecording } from '../../types';
import { formatDateTime, formatRelativeTime } from '../../utils/formatters';

interface SessionReplayModalProps {
  recording: SessionRecording | null;
  onClose: () => void;
}

export const SessionReplayModal: React.FC<SessionReplayModalProps> = ({ recording, onClose }) => {
  if (!recording) return null;

  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [skipInactivity, setSkipInactivity] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'events' | 'meta'>('events');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  const duration = Math.max(1, recording.duration || 10);
  const animationFrameRef = useRef<number | null>(null);
  const lastTickRef = useRef<number>(Date.now());

  // Handle Playback Clock
  useEffect(() => {
    lastTickRef.current = Date.now();

    const tick = () => {
      const now = Date.now();
      const delta = (now - lastTickRef.current) / 1000;
      lastTickRef.current = now;

      if (isPlaying) {
        setCurrentTime(prev => {
          const next = prev + delta * playbackSpeed;
          if (next >= duration) {
            setIsPlaying(false);
            return duration;
          }
          return next;
        });
      }
      animationFrameRef.current = requestAnimationFrame(tick);
    };

    animationFrameRef.current = requestAnimationFrame(tick);
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isPlaying, playbackSpeed, duration]);

  // Keyboard shortcuts (Space = play/pause, Left/Right = scrub)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        setIsPlaying(p => !p);
      } else if (e.key === 'ArrowRight') {
        setCurrentTime(t => Math.min(duration, t + 3));
      } else if (e.key === 'ArrowLeft') {
        setCurrentTime(t => Math.max(0, t - 3));
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [duration, onClose]);

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Generate synthetic interaction events along the timeline
  const interactionEvents = useMemo(() => {
    const list = [
      { time: 0, type: '$pageview', label: 'Page Loaded', path: recording.startUrl },
      { time: Math.min(1.5, duration * 0.15), type: 'scroll', label: 'Scrolled Down Viewport', detail: 'scrollY: 340px' },
      { time: Math.min(3.2, duration * 0.35), type: '$autocapture', label: 'Clicked Action Block', target: 'button.btn-primary' },
      { time: Math.min(5.8, duration * 0.6), type: '$autocapture', label: 'Viewed 3D Case Study', target: 'div.showcase-block' },
      { time: Math.min(8.0, duration * 0.85), type: '$pageleave', label: 'Session Completed', path: recording.startUrl },
    ];
    return list.filter(e => e.time <= duration);
  }, [duration, recording.startUrl]);

  // Simulated cursor position calculation
  const progressRatio = currentTime / duration;
  const cursorX = 20 + Math.sin(progressRatio * Math.PI * 3) * 35 + progressRatio * 40;
  const cursorY = 25 + Math.cos(progressRatio * Math.PI * 2) * 20 + progressRatio * 35;
  const isClicking = interactionEvents.some(e => Math.abs(e.time - currentTime) < 0.35);

  const handleCopyId = () => {
    navigator.clipboard.writeText(recording.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 1800);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(5, 8, 15, 0.85)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isFullscreen ? 0 : 20,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: isFullscreen ? '100vw' : '94vw',
          maxWidth: isFullscreen ? '100vw' : 1240,
          height: isFullscreen ? '100vh' : '90vh',
          maxHeight: isFullscreen ? '100vh' : 820,
          background: '#0B0F17',
          borderRadius: isFullscreen ? 0 : 16,
          border: isFullscreen ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 25px 60px -12px rgba(0, 0, 0, 0.8)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* ── Top Window Bar / Browser Chrome ─────────────────── */}
        <div style={{
          padding: '12px 18px',
          background: '#111827',
          borderBottom: '1px solid #1F2937',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}>
          {/* Window Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#EF4444', cursor: 'pointer' }} onClick={onClose} />
            <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#F59E0B' }} />
            <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#10B981' }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: '#9CA3AF', marginLeft: 8, fontFamily: 'Sora' }}>
              PostHog Session Player
            </span>
            <span className="badge badge-teal" style={{ fontSize: 10, padding: '1px 6px' }}>
              LIVE REPLAY
            </span>
          </div>

          {/* Browser Address URL */}
          <div style={{
            flex: 1,
            maxWidth: 580,
            background: '#030712',
            borderRadius: 8,
            padding: '5px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            border: '1px solid #1F2937',
          }}>
            <Shield size={12} color="#10B981" />
            <span style={{
              fontSize: 12,
              fontFamily: 'JetBrains Mono, monospace',
              color: '#D1D5DB',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              flex: 1,
            }}>
              {recording.startUrl}
            </span>
          </div>

          {/* Actions: Open in PostHog, Fullscreen, Close */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <a
              href={recording.postHogReplayUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost"
              style={{ padding: '4px 10px', fontSize: 12, gap: 5, color: '#E5E7EB' }}
              title="Open Recording on PostHog EU"
            >
              <ExternalLink size={13} />
              Open in PostHog
            </a>

            <button
              onClick={() => setIsFullscreen(f => !f)}
              className="btn btn-ghost"
              style={{ padding: '4px 8px', color: '#9CA3AF' }}
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </button>

            <button
              onClick={onClose}
              className="btn btn-ghost"
              style={{ padding: '4px 8px', color: '#9CA3AF' }}
              title="Close Replay"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* ── Main Body: Video Player + Event Inspector ───────── */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
          {/* Replay Screen Canvas */}
          <div style={{
            flex: 1,
            background: '#030712',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
            borderRight: '1px solid #1F2937',
          }}>
            {/* Viewport Frame */}
            <div style={{
              width: '94%',
              height: '92%',
              background: '#0F172A',
              borderRadius: 12,
              border: '1px solid #334155',
              boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}>
              {/* Simulated Page Header */}
              <div style={{
                height: 48,
                background: '#1E293B',
                borderBottom: '1px solid #334155',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 18px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 22, height: 22, borderRadius: 6, background: '#FA520F', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Sparkles size={12} color="#FFF" />
                  </div>
                  <span style={{ fontWeight: 700, fontSize: 13, color: '#F8FAFC', fontFamily: 'Sora' }}>
                    TalentBridge Showcase
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ height: 8, width: 60, background: '#334155', borderRadius: 4 }} />
                  <div style={{ height: 8, width: 40, background: '#334155', borderRadius: 4 }} />
                  <div style={{ height: 24, width: 70, background: '#0D9488', borderRadius: 6 }} />
                </div>
              </div>

              {/* Simulated Page Content Canvas */}
              <div style={{
                flex: 1,
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
                transform: `translateY(-${progressRatio * 40}px)`,
                transition: 'transform 0.3s ease-out',
              }}>
                {/* Hero Showcase Card */}
                <div style={{
                  padding: 20,
                  borderRadius: 10,
                  background: '#1E293B',
                  border: '1px solid #334155',
                }}>
                  <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: '#0D9488', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#FFF' }}>
                      TB
                    </div>
                    <div>
                      <div style={{ height: 16, width: 140, background: '#F8FAFC', borderRadius: 4, marginBottom: 8 }} />
                      <div style={{ height: 10, width: 220, background: '#64748B', borderRadius: 4 }} />
                    </div>
                  </div>
                </div>

                {/* Grid of Telemetry Showcase Blocks */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                  <div style={{ height: 90, borderRadius: 8, background: '#1E293B', border: '1px solid #334155', padding: 12 }}>
                    <div style={{ height: 12, width: 80, background: '#0D9488', borderRadius: 4, marginBottom: 8 }} />
                    <div style={{ height: 28, width: 110, background: '#F8FAFC', borderRadius: 6 }} />
                  </div>
                  <div style={{ height: 90, borderRadius: 8, background: '#1E293B', border: '1px solid #334155', padding: 12 }}>
                    <div style={{ height: 12, width: 80, background: '#FA520F', borderRadius: 4, marginBottom: 8 }} />
                    <div style={{ height: 28, width: 110, background: '#F8FAFC', borderRadius: 6 }} />
                  </div>
                </div>

                {/* Case Studies Row */}
                <div style={{ height: 110, borderRadius: 8, background: '#1E293B', border: '1px solid #334155', padding: 14 }}>
                  <div style={{ height: 14, width: 180, background: '#94A3B8', borderRadius: 4, marginBottom: 10 }} />
                  <div style={{ height: 10, width: '90%', background: '#475569', borderRadius: 4, marginBottom: 6 }} />
                  <div style={{ height: 10, width: '70%', background: '#475569', borderRadius: 4 }} />
                </div>
              </div>

              {/* Simulated User Mouse Pointer */}
              <div
                style={{
                  position: 'absolute',
                  left: `${cursorX}%`,
                  top: `${cursorY}%`,
                  transform: 'translate(-2px, -2px)',
                  pointerEvents: 'none',
                  transition: 'left 0.12s linear, top 0.12s linear',
                  zIndex: 50,
                }}
              >
                <MousePointer size={20} color="#FA520F" fill="#FA520F" stroke="#FFF" strokeWidth={1.5} />
                {isClicking && (
                  <div
                    style={{
                      position: 'absolute',
                      top: -10,
                      left: -10,
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      background: 'rgba(250, 82, 15, 0.4)',
                      border: '2px solid #FA520F',
                      animation: 'ping 0.6s cubic-bezier(0, 0, 0.2, 1)',
                    }}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Right Panel: Synchronized Event Timeline & Metadata */}
          <div style={{ width: 340, background: '#0F172A', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Tab Headers */}
            <div style={{ display: 'flex', borderBottom: '1px solid #1E293B', background: '#111827' }}>
              <button
                onClick={() => setActiveTab('events')}
                style={{
                  flex: 1,
                  padding: '11px',
                  background: activeTab === 'events' ? '#1E293B' : 'transparent',
                  border: 'none',
                  color: activeTab === 'events' ? '#F8FAFC' : '#94A3B8',
                  fontWeight: 700,
                  fontSize: 12,
                  cursor: 'pointer',
                  fontFamily: 'Sora',
                }}
              >
                Events ({interactionEvents.length})
              </button>
              <button
                onClick={() => setActiveTab('meta')}
                style={{
                  flex: 1,
                  padding: '11px',
                  background: activeTab === 'meta' ? '#1E293B' : 'transparent',
                  border: 'none',
                  color: activeTab === 'meta' ? '#F8FAFC' : '#94A3B8',
                  fontWeight: 700,
                  fontSize: 12,
                  cursor: 'pointer',
                  fontFamily: 'Sora',
                }}
              >
                Session Details
              </button>
            </div>

            {/* Tab 1: Synchronized Events */}
            {activeTab === 'events' && (
              <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
                {interactionEvents.map((ev, idx) => {
                  const isCurrent = currentTime >= ev.time && (idx === interactionEvents.length - 1 || currentTime < interactionEvents[idx + 1].time);
                  const isPast = currentTime >= ev.time;

                  return (
                    <div
                      key={idx}
                      onClick={() => setCurrentTime(ev.time)}
                      style={{
                        padding: '10px 16px',
                        display: 'flex',
                        gap: 10,
                        alignItems: 'flex-start',
                        background: isCurrent ? 'rgba(13, 148, 136, 0.15)' : 'transparent',
                        borderLeft: isCurrent ? '3px solid #14B8A6' : '3px solid transparent',
                        cursor: 'pointer',
                        opacity: isPast ? 1 : 0.45,
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <span className="mono-metric" style={{ fontSize: 11, color: '#14B8A6', minWidth: 38 }}>
                        {formatTime(ev.time)}
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 12.5, fontWeight: 600, color: '#F8FAFC', marginBottom: 2 }}>
                          {ev.label}
                        </p>
                        <p className="mono-metric" style={{ fontSize: 11, color: '#94A3B8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {ev.path || ev.target || ev.detail}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Tab 2: Session Metadata */}
            {activeTab === 'meta' && (
              <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Distinct ID</span>
                  <p className="mono-metric" style={{ fontSize: 13, color: '#F8FAFC', fontWeight: 600, marginTop: 3 }}>
                    {recording.distinctId}
                  </p>
                </div>

                <div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Recording ID</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                    <span className="mono-metric" style={{ fontSize: 11.5, color: '#14B8A6' }}>
                      {recording.id.slice(0, 18)}…
                    </span>
                    <button onClick={handleCopyId} className="btn btn-ghost" style={{ padding: '2px 6px', fontSize: 11 }}>
                      {copiedId ? <Check size={11} color="#14B8A6" /> : <Copy size={11} />}
                    </button>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div style={{ padding: 10, background: '#1E293B', borderRadius: 8 }}>
                    <span style={{ fontSize: 10.5, color: '#64748B', fontWeight: 700 }}>DURATION</span>
                    <p className="mono-metric" style={{ fontSize: 16, color: '#F8FAFC', fontWeight: 700, marginTop: 2 }}>
                      {recording.duration}s
                    </p>
                  </div>
                  <div style={{ padding: 10, background: '#1E293B', borderRadius: 8 }}>
                    <span style={{ fontSize: 10.5, color: '#64748B', fontWeight: 700 }}>ACTIVE TIME</span>
                    <p className="mono-metric" style={{ fontSize: 16, color: '#14B8A6', fontWeight: 700, marginTop: 2 }}>
                      {recording.activeSeconds}s
                    </p>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div style={{ padding: 10, background: '#1E293B', borderRadius: 8 }}>
                    <span style={{ fontSize: 10.5, color: '#64748B', fontWeight: 700 }}>CLICKS</span>
                    <p className="mono-metric" style={{ fontSize: 16, color: '#FA520F', fontWeight: 700, marginTop: 2 }}>
                      {recording.clickCount} clicks
                    </p>
                  </div>
                  <div style={{ padding: 10, background: '#1E293B', borderRadius: 8 }}>
                    <span style={{ fontSize: 10.5, color: '#64748B', fontWeight: 700 }}>KEYPRESSES</span>
                    <p className="mono-metric" style={{ fontSize: 16, color: '#3B82F6', fontWeight: 700, marginTop: 2 }}>
                      {recording.keypressCount}
                    </p>
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Timestamp</span>
                  <p style={{ fontSize: 12, color: '#94A3B8', marginTop: 3 }}>
                    {formatDateTime(recording.startTime)} ({formatRelativeTime(recording.startTime)})
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Bottom Controls Bar ─────────────────────────────── */}
        <div style={{
          padding: '14px 20px',
          background: '#0B0F17',
          borderTop: '1px solid #1F2937',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}>
          {/* Scrub Timeline Slider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span className="mono-metric" style={{ fontSize: 12, color: '#94A3B8', minWidth: 44 }}>
              {formatTime(currentTime)}
            </span>

            <div style={{ position: 'relative', flex: 1, height: 18, display: 'flex', alignItems: 'center' }}>
              <input
                type="range"
                min={0}
                max={duration}
                step={0.1}
                value={currentTime}
                onChange={e => setCurrentTime(parseFloat(e.target.value))}
                style={{
                  width: '100%',
                  accentColor: '#FA520F',
                  cursor: 'pointer',
                  height: 6,
                  borderRadius: 3,
                }}
              />

              {/* Event Marker Dots */}
              {interactionEvents.map((ev, idx) => (
                <div
                  key={idx}
                  style={{
                    position: 'absolute',
                    left: `${(ev.time / duration) * 100}%`,
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: ev.type === '$autocapture' ? '#FA520F' : '#14B8A6',
                    pointerEvents: 'none',
                  }}
                  title={`${ev.label} (${formatTime(ev.time)})`}
                />
              ))}
            </div>

            <span className="mono-metric" style={{ fontSize: 12, color: '#64748B', minWidth: 44 }}>
              {formatTime(duration)}
            </span>
          </div>

          {/* Buttons Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            {/* Play/Pause & Scrub controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                onClick={() => setCurrentTime(0)}
                className="btn btn-ghost"
                style={{ padding: '6px 10px', color: '#9CA3AF' }}
                title="Restart"
              >
                <RotateCcw size={14} />
              </button>

              <button
                onClick={() => setCurrentTime(t => Math.max(0, t - 5))}
                className="btn btn-ghost"
                style={{ padding: '6px 10px', color: '#9CA3AF', fontSize: 11.5 }}
              >
                -5s
              </button>

              <button
                onClick={() => setIsPlaying(p => !p)}
                className="btn btn-primary"
                style={{ width: 38, height: 38, borderRadius: '50%', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
              >
                {isPlaying ? <Pause size={16} /> : <Play size={16} style={{ marginLeft: 2 }} />}
              </button>

              <button
                onClick={() => setCurrentTime(t => Math.min(duration, t + 5))}
                className="btn btn-ghost"
                style={{ padding: '6px 10px', color: '#9CA3AF', fontSize: 11.5 }}
              >
                +5s
              </button>
            </div>

            {/* Speed & Inactivity Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#9CA3AF', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={skipInactivity}
                  onChange={e => setSkipInactivity(e.target.checked)}
                  style={{ accentColor: '#14B8A6' }}
                />
                Skip Inactivity
              </label>

              {/* Speed Buttons */}
              <div className="pill-group">
                {[0.5, 1, 2, 4, 8].map(spd => (
                  <button
                    key={spd}
                    onClick={() => setPlaybackSpeed(spd)}
                    className={`pill-tab ${playbackSpeed === spd ? 'active' : ''}`}
                    style={{ padding: '2px 8px', fontSize: 11, minWidth: 32 }}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
