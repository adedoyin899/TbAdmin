// src/components/Help/GlossarySection.tsx
// Searchable metric glossary and data dictionary for non-technical and executive users

import React, { useState } from 'react';
import {
  Search,
  Calculator,
  TrendingUp,
  ExternalLink,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { GLOSSARY_TERMS } from '../../data/helpKnowledgeBase';


export const GlossarySection: React.FC<{ onAskBot?: (query: string) => void }> = ({ onAskBot }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All Terms' },
    { id: 'social', label: 'Social & Organic' },
    { id: 'campaigns', label: 'Campaigns & ROI' },
    { id: 'email', label: 'Email & Delivery' },
    { id: 'rooms', label: 'Showcase Rooms' },
    { id: 'general', label: 'General & Sync' },
  ];

  const filteredTerms = GLOSSARY_TERMS.filter((t) => {
    const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      t.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.shortDefinition.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.detailedExplanation.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Search & Category Filter Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          padding: '14px 18px',
          background: 'var(--panel)',
          border: '1px solid var(--line)',
          borderRadius: 'var(--radius)',
        }}
      >
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className="btn"
              style={{
                fontSize: 12,
                padding: '5px 12px',
                borderRadius: 16,
                background: selectedCategory === cat.id ? 'var(--accent)' : 'var(--panel-2)',
                color: selectedCategory === cat.id ? '#FFFFFF' : 'var(--text-2)',
                border: selectedCategory === cat.id ? 'none' : '1px solid var(--line)',
                fontWeight: selectedCategory === cat.id ? 700 : 500,
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', minWidth: 260 }}>
          <Search
            size={14}
            color="var(--dim)"
            style={{ position: 'absolute', left: 10, top: 10, pointerEvents: 'none' }}
          />
          <input
            type="text"
            placeholder="Search metric (e.g. CTR, CPS, Heatmap)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '7px 12px 7px 32px',
              background: 'var(--panel-2)',
              border: '1px solid var(--line)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text)',
              fontSize: 13,
              outline: 'none',
            }}
          />
        </div>
      </div>

      {/* Terms Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 16 }}>
        {filteredTerms.map((item) => (
          <div
            key={item.id}
            className="card card-hover"
            style={{
              background: 'var(--panel)',
              border: '1px solid var(--line)',
              borderRadius: 'var(--radius)',
              padding: 20,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: 14,
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 6 }}>
                <h3
                  style={{
                    fontFamily: 'Sora, sans-serif',
                    fontSize: 16,
                    fontWeight: 700,
                    color: 'var(--text)',
                    margin: 0,
                  }}
                >
                  {item.term}
                </h3>
                <span
                  style={{
                    fontSize: 10.5,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    background: 'var(--panel-2)',
                    color: 'var(--accent)',
                    border: '1px solid var(--line)',
                    padding: '2px 8px',
                    borderRadius: 12,
                  }}
                >
                  {item.category}
                </span>
              </div>

              <p style={{ fontSize: 13.5, color: 'var(--text-2)', lineHeight: 1.5, margin: '0 0 10px 0' }}>
                {item.shortDefinition}
              </p>

              <div
                style={{
                  background: 'var(--bg-main)',
                  border: '1px solid var(--line)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '10px 12px',
                  fontSize: 12.5,
                  color: 'var(--text)',
                  lineHeight: 1.45,
                  marginBottom: 10,
                }}
              >
                {item.detailedExplanation}
              </div>

              {/* Formula badge if available */}
              {item.formula && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: 11.5,
                    color: 'var(--accent)',
                    background: 'rgba(13, 148, 136, 0.08)',
                    border: '1px solid rgba(13, 148, 136, 0.2)',
                    padding: '6px 10px',
                    borderRadius: 6,
                    marginBottom: 10,
                  }}
                >
                  <Calculator size={13} flex-shrink={0} />
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>{item.formula}</span>
                </div>
              )}

              {/* Benchmark guidance */}
              {item.benchmark && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, fontSize: 12, color: 'var(--text-2)', marginBottom: 8 }}>
                  <TrendingUp size={13} color="var(--success)" style={{ marginTop: 2, flexShrink: 0 }} />
                  <span>
                    <strong style={{ color: 'var(--text)' }}>Benchmark:</strong> {item.benchmark}
                  </span>
                </div>
              )}
            </div>

            {/* Bottom Actions Toolbar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: 12,
                borderTop: '1px solid var(--line)',
                gap: 8,
              }}
            >
              <button
                onClick={() => navigate(item.portalLink)}
                className="btn btn-ghost"
                style={{
                  fontSize: 11.5,
                  padding: '4px 8px',
                  gap: 5,
                  color: 'var(--accent)',
                }}
              >
                <span>{item.portalLocation}</span>
                <ExternalLink size={12} />
              </button>

              {onAskBot && (
                <button
                  onClick={() => onAskBot(`Explain how to improve ${item.term} on TalentBridge`)}
                  className="btn btn-ghost"
                  style={{
                    fontSize: 11,
                    padding: '3px 8px',
                    color: 'var(--text-2)',
                  }}
                  title="Ask AI Assistant about this metric"
                >
                  Ask AI
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
