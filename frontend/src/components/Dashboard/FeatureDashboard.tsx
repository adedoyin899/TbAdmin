import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import {
  Download, X, ExternalLink, Sparkles, Layers,
  ChevronRight, CheckCircle2, TrendingUp, Search,
  LayoutTemplate, Video, AlignLeft, Tags, Type,
  User, Quote, BarChart2, GitCompare, Grid,
  GitBranch, Sliders, MessageSquare, Image, FileText,
  Briefcase, Network, Scale, Clock, Award,
  DollarSign, ShieldCheck, Calendar, Eye,
  ArrowUpRight, Check, Flame, Star,
  Info, Compass, Activity, Play, Lock, CheckCircle,
} from 'lucide-react';
import { dashboardApi } from '../../api/dashboardApi';
import type { FeaturesDashboardResponse, BlockAdoption, TemplateAdoption, ThemeEntry } from '../../types';
import { formatNumber, formatPercentage } from '../../utils/formatters';
import { DateRangeSelector, type DateRangeValue } from '../Common/DateRangeSelector';
import { exportToCsv } from '../../utils/exportCsv';
import { MetricAlertBanner } from '../Common/MetricAlertBanner';
import { useRbac } from '../../utils/rbac';

const PIE_COLORS = ['#0F766E', '#2DD4BF', '#3B82F6', '#8B5CF6', '#F59E0B', '#EC4899', '#10B981'];

export interface BlockItemMeta {
  desc: string;
  category: string;
  previewType: 'video' | 'skills' | 'metric' | 'pipeline' | 'beforeAfter' | 'gallery' | 'availability' | 'credentials' | 'flow' | 'matrix' | 'general';
  engagementBoost: string;
  recruiterClickRate: string;
  shortlistLift: string;
  avgDuration: string;
  bestPractice: string;
  sampleCreators: { name: string; email: string; roomTitle: string; clicks: number; theme: string }[];
}

export interface TemplateItemMeta {
  desc: string;
  category: string;
  targetAudience: string;
  includedBlocks: string[];
  engagementBoost: string;
  recruiterClickRate: string;
  shortlistLift: string;
  avgDuration: string;
  bestPractice: string;
  sampleCreators: { name: string; email: string; roomTitle: string; clicks: number; theme: string }[];
}

const BLOCK_METADATA_STORE: Record<string, BlockItemMeta> = {
  'Video intro': {
    desc: 'Embedded 60-second video elevator pitch introducing creator directly to hiring managers.',
    category: 'Tell your story',
    previewType: 'video',
    engagementBoost: '+62% recruiter dwell time',
    recruiterClickRate: '88% play video to completion',
    shortlistLift: '+44% interview conversion',
    avgDuration: '52s avg watch time',
    bestPractice: 'Keep video under 90 seconds with clear verbal summary of top wins and role readiness.',
    sampleCreators: [
      { name: 'Kwame Asante', email: 'kwame.asante@example.com', roomTitle: 'Full-Stack Spatial Web Studio', clicks: 184, theme: 'Dark' },
      { name: 'Alice Chen', email: 'alice.chen@example.com', roomTitle: 'Lead Product Designer 3D Suite', clicks: 142, theme: 'Dark' },
      { name: 'Elena Rostova', email: 'elena.rostova@example.com', roomTitle: 'Cybersecurity SOC Lead Space', clicks: 96, theme: 'Light' },
    ],
  },
  'Skill tags': {
    desc: 'Interactive pill tags showcasing core tools, frameworks, and domain proficiencies with level indicators.',
    category: 'Tell your story',
    previewType: 'skills',
    engagementBoost: '+45% recruiter dwell time',
    recruiterClickRate: '82% inspect skill pills',
    shortlistLift: '+36% recruiter search match',
    avgDuration: '35s inspection time',
    bestPractice: 'List 6-10 verified core tech stack competencies with explicit proficiency tiers.',
    sampleCreators: [
      { name: 'David Kim', email: 'david.kim@example.com', roomTitle: 'Distributed Systems & Cloud Room', clicks: 215, theme: 'Dark' },
      { name: 'Alice Chen', email: 'alice.chen@example.com', roomTitle: 'Lead Product Designer 3D Suite', clicks: 178, theme: 'Dark' },
      { name: 'Sarah Jenkins', email: 'sarah.jenkins@example.com', roomTitle: '3D Animator & Motion Portfolio', clicks: 88, theme: 'Light' },
    ],
  },
  'Metric tile': {
    desc: 'High-impact KPI callout tiles with quantified revenue, scale, and system performance outcomes.',
    category: 'Show proof',
    previewType: 'metric',
    engagementBoost: '+54% recruiter dwell time',
    recruiterClickRate: '79% inspect metric source data',
    shortlistLift: '+48% shortlist rate',
    avgDuration: '40s inspection time',
    bestPractice: 'Anchor numbers with explicit business context (e.g. "+340% MRR", "45ms p99 SLA").',
    sampleCreators: [
      { name: 'Marcus Vance', email: 'marcus.vance@example.com', roomTitle: 'Principal IAM & Cloud Architect', clicks: 230, theme: 'Dark' },
      { name: 'Chiara Romano', email: 'chiara.romano@example.com', roomTitle: 'Creative Technologist Showcase', clicks: 112, theme: 'Dark' },
    ],
  },
  'Paragraph': {
    desc: 'Rich text narrative context covering professional background, career trajectory, and core ethos.',
    category: 'Tell your story',
    previewType: 'general',
    engagementBoost: '+38% recruiter dwell time',
    recruiterClickRate: '64% read full bio summary',
    shortlistLift: '+22% candidate recall',
    avgDuration: '48s reading time',
    bestPractice: 'Format in 2 digestible paragraphs highlighting transition story and problem-solving framework.',
    sampleCreators: [
      { name: 'Alice Chen', email: 'alice.chen@example.com', roomTitle: 'Lead Product Designer 3D Suite', clicks: 120, theme: 'Dark' },
    ],
  },
  'Work gallery': {
    desc: 'Multi-asset visual showcase grid with 3D product previews, interface shots, and design artifacts.',
    category: 'Show work',
    previewType: 'gallery',
    engagementBoost: '+70% recruiter dwell time',
    recruiterClickRate: '86% open at least 1 artifact',
    shortlistLift: '+52% interview conversion',
    avgDuration: '1m 20s gallery time',
    bestPractice: 'Feature high-res previews with brief 1-line impact captions under each asset.',
    sampleCreators: [
      { name: 'Alice Chen', email: 'alice.chen@example.com', roomTitle: 'Lead Product Designer 3D Suite', clicks: 310, theme: 'Dark' },
      { name: 'Sarah Jenkins', email: 'sarah.jenkins@example.com', roomTitle: '3D Animator & Motion Portfolio', clicks: 195, theme: 'Light' },
    ],
  },
  'Profile': {
    desc: 'Core identity block featuring verified avatar, headline, location, and seniority tier.',
    category: 'Tell your story',
    previewType: 'general',
    engagementBoost: '+40% recruiter dwell time',
    recruiterClickRate: '92% initial scan rate',
    shortlistLift: '+30% profile trust score',
    avgDuration: '18s initial scan',
    bestPractice: 'Use a crisp high-definition headshot and concise value-proposition headline.',
    sampleCreators: [
      { name: 'David Kim', email: 'david.kim@example.com', roomTitle: 'Distributed Systems & Cloud Room', clicks: 140, theme: 'Dark' },
    ],
  },
  'Availability': {
    desc: 'Real-time calendar status, notice period, and preferred contract/full-time availability toggle.',
    category: 'Make contact',
    previewType: 'availability',
    engagementBoost: '+35% recruiter dwell time',
    recruiterClickRate: '74% check start date & rates',
    shortlistLift: '+58% faster recruiter contact',
    avgDuration: '22s inspection time',
    bestPractice: 'Keep availability toggle updated weekly to stay at the top of verified talent queues.',
    sampleCreators: [
      { name: 'Kwame Asante', email: 'kwame.asante@example.com', roomTitle: 'Full-Stack Spatial Web Studio', clicks: 165, theme: 'Dark' },
      { name: 'Elena Rostova', email: 'elena.rostova@example.com', roomTitle: 'Cybersecurity SOC Lead Space', clicks: 92, theme: 'Light' },
    ],
  },
  'Credentials': {
    desc: 'Cryptographically verifiable certifications, cloud architect credentials, and security badges.',
    category: 'Get vouched for',
    previewType: 'credentials',
    engagementBoost: '+48% recruiter dwell time',
    recruiterClickRate: '68% verify accreditation link',
    shortlistLift: '+42% enterprise shortlist rate',
    avgDuration: '30s verification time',
    bestPractice: 'Link official AWS, GCP, CISSP, or CISA certification credential verification URLs.',
    sampleCreators: [
      { name: 'Marcus Vance', email: 'marcus.vance@example.com', roomTitle: 'Principal IAM & Cloud Architect', clicks: 188, theme: 'Dark' },
      { name: 'Elena Rostova', email: 'elena.rostova@example.com', roomTitle: 'Cybersecurity SOC Lead Space', clicks: 135, theme: 'Light' },
    ],
  },
  'Case studies': {
    desc: 'Comprehensive project breakdowns with problem framing, architecture decisions, and ROI delivered.',
    category: 'Show work',
    previewType: 'general',
    engagementBoost: '+76% recruiter dwell time',
    recruiterClickRate: '84% read full case study',
    shortlistLift: '+65% tech screen pass rate',
    avgDuration: '2m 10s deep-read time',
    bestPractice: 'Structure case studies with Challenge, Technical Solution, Architecture Diff, and Measured Impact.',
    sampleCreators: [
      { name: 'David Kim', email: 'david.kim@example.com', roomTitle: 'Distributed Systems & Cloud Room', clicks: 275, theme: 'Dark' },
      { name: 'Alice Chen', email: 'alice.chen@example.com', roomTitle: 'Lead Product Designer 3D Suite', clicks: 240, theme: 'Dark' },
    ],
  },
  'Call to action': {
    desc: 'Direct recruiter action button for booking screening calls, downloading resume, or sending inquiries.',
    category: 'Make contact',
    previewType: 'general',
    engagementBoost: '+28% recruiter dwell time',
    recruiterClickRate: '62% click CTA button',
    shortlistLift: '+72% direct outreach volume',
    avgDuration: '15s decision time',
    bestPractice: 'Connect Calendly or email booking link with a friendly callout message.',
    sampleCreators: [
      { name: 'Kwame Asante', email: 'kwame.asante@example.com', roomTitle: 'Full-Stack Spatial Web Studio', clicks: 198, theme: 'Dark' },
    ],
  },
  'Reference': {
    desc: 'Verified quotes, peer recommendations, and leadership endorsements from former managers.',
    category: 'Get vouched for',
    previewType: 'general',
    engagementBoost: '+44% recruiter dwell time',
    recruiterClickRate: '58% read peer reviews',
    shortlistLift: '+46% executive credibility',
    avgDuration: '32s reading time',
    bestPractice: 'Include quotes from former CTOs, Engineering Leads, or Principal Designers.',
    sampleCreators: [
      { name: 'Alice Chen', email: 'alice.chen@example.com', roomTitle: 'Lead Product Designer 3D Suite', clicks: 110, theme: 'Dark' },
    ],
  },
  'Heading': {
    desc: 'Stylized section divider and emphasis banners organizing portfolio chapters cleanly.',
    category: 'Tell your story',
    previewType: 'general',
    engagementBoost: '+18% recruiter dwell time',
    recruiterClickRate: '48% section scan rate',
    shortlistLift: '+15% readability score',
    avgDuration: '12s scan time',
    bestPractice: 'Use concise 3-4 word chapter titles to structure room navigation.',
    sampleCreators: [
      { name: 'David Kim', email: 'david.kim@example.com', roomTitle: 'Distributed Systems & Cloud Room', clicks: 85, theme: 'Dark' },
    ],
  },
  'Pipeline/CI-CD': {
    desc: 'Interactive deployment architecture flow visualizing staging pipelines, test suites, and uptime SLAs.',
    category: 'Show proof',
    previewType: 'pipeline',
    engagementBoost: '+58% recruiter dwell time',
    recruiterClickRate: '72% inspect pipeline stages',
    shortlistLift: '+55% senior tech shortlist',
    avgDuration: '45s pipeline inspection',
    bestPractice: 'Showcase automated test coverage %, canary rollouts, and rollback safety protocols.',
    sampleCreators: [
      { name: 'David Kim', email: 'david.kim@example.com', roomTitle: 'Distributed Systems & Cloud Room', clicks: 240, theme: 'Dark' },
    ],
  },
  'Skill bars': {
    desc: 'Visual mastery indicators illustrating proficiency depth and years in production across core languages.',
    category: 'Show proof',
    previewType: 'general',
    engagementBoost: '+32% recruiter dwell time',
    recruiterClickRate: '56% review proficiency bars',
    shortlistLift: '+25% skill alignment match',
    avgDuration: '24s inspection time',
    bestPractice: 'Highlight 4-6 primary languages where you have 3+ years of production experience.',
    sampleCreators: [
      { name: 'Kwame Asante', email: 'kwame.asante@example.com', roomTitle: 'Full-Stack Spatial Web Studio', clicks: 95, theme: 'Dark' },
    ],
  },
  'Document carousel': {
    desc: 'Multi-page interactive document reader for whitepapers, design tokens, and technical architecture specs.',
    category: 'Show work',
    previewType: 'general',
    engagementBoost: '+52% recruiter dwell time',
    recruiterClickRate: '66% flip document pages',
    shortlistLift: '+38% technical credibility',
    avgDuration: '1m 15s document reading',
    bestPractice: 'Embed PDF executive summaries with crisp vector diagrams and summary abstracts.',
    sampleCreators: [
      { name: 'Marcus Vance', email: 'marcus.vance@example.com', roomTitle: 'Principal IAM & Cloud Architect', clicks: 128, theme: 'Dark' },
    ],
  },
  'Before/after': {
    desc: 'Side-by-side interactive comparison slider displaying refactors, system optimizations, and UI redesigns.',
    category: 'Show proof',
    previewType: 'beforeAfter',
    engagementBoost: '+65% recruiter dwell time',
    recruiterClickRate: '77% drag comparison slider',
    shortlistLift: '+56% product/design hire rate',
    avgDuration: '38s interaction time',
    bestPractice: 'Provide clear legacy vs optimized benchmark metrics alongside the visual slider.',
    sampleCreators: [
      { name: 'Alice Chen', email: 'alice.chen@example.com', roomTitle: 'Lead Product Designer 3D Suite', clicks: 182, theme: 'Dark' },
    ],
  },
  'Flow diagram': {
    desc: 'Embedded interactive flowchart highlighting distributed topologies, user journeys, or API lifecycles.',
    category: 'Show work',
    previewType: 'flow',
    engagementBoost: '+56% recruiter dwell time',
    recruiterClickRate: '69% inspect flow nodes',
    shortlistLift: '+50% architect screen pass',
    avgDuration: '50s diagram analysis',
    bestPractice: 'Color-code microservices, data lakes, and security boundary zones.',
    sampleCreators: [
      { name: 'David Kim', email: 'david.kim@example.com', roomTitle: 'Distributed Systems & Cloud Room', clicks: 164, theme: 'Dark' },
    ],
  },
  'Pull quote': {
    desc: 'Standout highlighted quote spotlighting candidate philosophy, leadership principle, or thesis statement.',
    category: 'Tell your story',
    previewType: 'general',
    engagementBoost: '+24% recruiter dwell time',
    recruiterClickRate: '46% read pull quote',
    shortlistLift: '+18% leadership resonance',
    avgDuration: '16s reading time',
    bestPractice: 'Highlight 1 core operating principle that defines your engineering or design philosophy.',
    sampleCreators: [
      { name: 'Alice Chen', email: 'alice.chen@example.com', roomTitle: 'Lead Product Designer 3D Suite', clicks: 72, theme: 'Dark' },
    ],
  },
  'Coverage matrix': {
    desc: 'Comprehensive capability grid detailing test coverage, compliance standards, or domain expertise.',
    category: 'Show proof',
    previewType: 'matrix',
    engagementBoost: '+50% recruiter dwell time',
    recruiterClickRate: '63% inspect matrix cells',
    shortlistLift: '+45% enterprise audit match',
    avgDuration: '42s matrix inspection',
    bestPractice: 'Include regulatory frameworks (SOC2, HIPAA, GDPR, ISO27001) or test coverage % per module.',
    sampleCreators: [
      { name: 'Marcus Vance', email: 'marcus.vance@example.com', roomTitle: 'Principal IAM & Cloud Architect', clicks: 145, theme: 'Dark' },
      { name: 'Elena Rostova', email: 'elena.rostova@example.com', roomTitle: 'Cybersecurity SOC Lead Space', clicks: 110, theme: 'Light' },
    ],
  },
  'Pricing tiers': {
    desc: 'Transparent consulting packages, fractional leadership rates, and sprint engagement deliverables.',
    category: 'Get vouched for',
    previewType: 'general',
    engagementBoost: '+42% recruiter dwell time',
    recruiterClickRate: '65% review package terms',
    shortlistLift: '+60% contracting conversion',
    avgDuration: '28s review time',
    bestPractice: 'Outline distinct Day Rate, Sprint Retainer, and Advisory package scopes.',
    sampleCreators: [
      { name: 'Chiara Romano', email: 'chiara.romano@example.com', roomTitle: 'Creative Technologist Showcase', clicks: 130, theme: 'Dark' },
    ],
  },
  'Statement callout': {
    desc: 'High-contrast card summarizing key business value delivered and executive summary notes.',
    category: 'Show proof',
    previewType: 'general',
    engagementBoost: '+30% recruiter dwell time',
    recruiterClickRate: '51% read statement box',
    shortlistLift: '+20% hiring team alignment',
    avgDuration: '20s reading time',
    bestPractice: 'Summarize your unique edge in 2 bullet sentences with bold key terms.',
    sampleCreators: [
      { name: 'Elena Rostova', email: 'elena.rostova@example.com', roomTitle: 'Cybersecurity SOC Lead Space', clicks: 68, theme: 'Light' },
    ],
  },
  'Clause brief': {
    desc: 'Specialized legal and compliance memo summaries covering contract frameworks and regulatory policy.',
    category: 'Show work',
    previewType: 'general',
    engagementBoost: '+36% recruiter dwell time',
    recruiterClickRate: '44% read legal briefs',
    shortlistLift: '+34% legal ops shortlist',
    avgDuration: '55s analysis time',
    bestPractice: 'De-identify sensitive contracts and highlight negotiation frameworks applied.',
    sampleCreators: [
      { name: 'Jonathan Pierce', email: 'jonathan.pierce@example.com', roomTitle: 'Legal Ops & FinTech Compliance Suite', clicks: 82, theme: 'Light' },
    ],
  },
  'Retro columns': {
    desc: 'Agile team retrospective boards documenting what went well, lessons learned, and continuous improvement.',
    category: 'Show work',
    previewType: 'general',
    engagementBoost: '+41% recruiter dwell time',
    recruiterClickRate: '53% inspect sprint retros',
    shortlistLift: '+38% engineering management match',
    avgDuration: '36s review time',
    bestPractice: 'Highlight 3 retros demonstrating how you turned production incidents into system hardening.',
    sampleCreators: [
      { name: 'Sarah Jenkins', email: 'sarah.jenkins@example.com', roomTitle: '3D Animator & Motion Portfolio', clicks: 76, theme: 'Light' },
    ],
  },
};

const TEMPLATE_METADATA_STORE: Record<string, TemplateItemMeta> = {
  'Software Eng / Architect': {
    desc: 'Architecture, pipelines, uptime — optimized for senior backend, distributed systems, and DevOps engineers.',
    category: 'Tech & Engineering',
    targetAudience: 'Senior Backend, Staff Engineers, Infrastructure & Cloud Architects',
    includedBlocks: ['Video intro', 'Pipeline/CI-CD', 'Metric tile', 'Skill tags', 'Case studies', 'Availability'],
    engagementBoost: '+68% higher recruiter inquiry rate',
    recruiterClickRate: '84% of recruiters inspect architecture flow',
    shortlistLift: '+52% interview request rate',
    avgDuration: '3m 15s avg room dwell time',
    bestPractice: 'Pair your Video Intro with a live CI/CD pipeline diagram and 3 quantifiable scale KPIs.',
    sampleCreators: [
      { name: 'David Kim', email: 'david.kim@example.com', roomTitle: 'Distributed Systems & Cloud Room', clicks: 388, theme: 'Dark' },
      { name: 'Kwame Asante', email: 'kwame.asante@example.com', roomTitle: 'Full-Stack Spatial Web Studio', clicks: 295, theme: 'Dark' },
    ],
  },
  'Designer': {
    desc: 'Product, brand, design systems — showcases high-fidelity Figma components, motion reels, and UI case studies.',
    category: 'Design & Creative',
    targetAudience: 'Product Designers, Design System Leads, 3D/Motion Artists',
    includedBlocks: ['Video intro', 'Work gallery', 'Before/after', 'Case studies', 'Skill tags', 'Call to action'],
    engagementBoost: '+74% higher recruiter inquiry rate',
    recruiterClickRate: '89% interact with design slider & gallery',
    shortlistLift: '+58% interview request rate',
    avgDuration: '3m 40s avg room dwell time',
    bestPractice: 'Lead with Before/After transformation sliders and high-res interactive 3D work cards.',
    sampleCreators: [
      { name: 'Alice Chen', email: 'alice.chen@example.com', roomTitle: 'Lead Product Designer 3D Suite', clicks: 324, theme: 'Dark' },
      { name: 'Chiara Romano', email: 'chiara.romano@example.com', roomTitle: 'Creative Technologist Showcase', clicks: 210, theme: 'Dark' },
    ],
  },
  'IAM Specialist': {
    desc: 'Identity, access & control evidence — tailor-made for enterprise security, OAuth/SAML, and RBAC architects.',
    category: 'Security & Identity',
    targetAudience: 'Identity & Access Management, Zero-Trust Leads, Security Engineers',
    includedBlocks: ['Profile', 'Coverage matrix', 'Credentials', 'Flow diagram', 'Metric tile', 'Availability'],
    engagementBoost: '+59% higher recruiter inquiry rate',
    recruiterClickRate: '78% verify identity security credentials',
    shortlistLift: '+48% interview request rate',
    avgDuration: '2m 50s avg room dwell time',
    bestPractice: 'Highlight verified CISSP/CISA badges and a coverage matrix of audited IAM policies.',
    sampleCreators: [
      { name: 'Marcus Vance', email: 'marcus.vance@example.com', roomTitle: 'Principal IAM & Cloud Architect', clicks: 270, theme: 'Dark' },
    ],
  },
  'Cybersecurity': {
    desc: 'Incident response, SOC, threat work — highlights SIEM monitoring, threat hunts, and vulnerability triage outcomes.',
    category: 'Security & Identity',
    targetAudience: 'SOC Analysts, Threat Hunters, Incident Response Leads, AppSec',
    includedBlocks: ['Video intro', 'Credentials', 'Coverage matrix', 'Metric tile', 'Statement callout', 'Call to action'],
    engagementBoost: '+63% higher recruiter inquiry rate',
    recruiterClickRate: '81% inspect threat containment metrics',
    shortlistLift: '+50% interview request rate',
    avgDuration: '3m 05s avg room dwell time',
    bestPractice: 'Showcase Mean Time to Detect (MTTD) and Mean Time to Respond (MTTR) reductions.',
    sampleCreators: [
      { name: 'Elena Rostova', email: 'elena.rostova@example.com', roomTitle: 'Cybersecurity SOC Lead Space', clicks: 238, theme: 'Light' },
    ],
  },
  'Project Manager': {
    desc: 'Delivery outcomes, risk, teams — highlights sprint velocity, stakeholder roadmaps, and budget stewardship.',
    category: 'Product & Delivery',
    targetAudience: 'Technical Project Managers, Scrum Masters, Agile Program Directors',
    includedBlocks: ['Profile', 'Metric tile', 'Retro columns', 'Reference', 'Document carousel', 'Availability'],
    engagementBoost: '+51% higher recruiter inquiry rate',
    recruiterClickRate: '71% inspect sprint retros & metrics',
    shortlistLift: '+40% interview request rate',
    avgDuration: '2m 30s avg room dwell time',
    bestPractice: 'Include on-time delivery rate stats and stakeholder reference quotes from VPs.',
    sampleCreators: [
      { name: 'Sarah Jenkins', email: 'sarah.jenkins@example.com', roomTitle: 'Agile Delivery & Program Hub', clicks: 205, theme: 'Light' },
    ],
  },
  'Data Consultant': {
    desc: 'Analytics, models, experiments — features ML pipeline benchmarks, query throughputs, and dashboard case studies.',
    category: 'Data & AI',
    targetAudience: 'Data Scientists, BI Consultants, ML Engineers, Analytics Leads',
    includedBlocks: ['Video intro', 'Metric tile', 'Flow diagram', 'Case studies', 'Skill bars', 'Availability'],
    engagementBoost: '+60% higher recruiter inquiry rate',
    recruiterClickRate: '76% inspect model accuracy & ETL flow',
    shortlistLift: '+46% interview request rate',
    avgDuration: '2m 55s avg room dwell time',
    bestPractice: 'Highlight data model benchmarks (e.g. query optimization 4x, AUC 0.94) in Metric Tiles.',
    sampleCreators: [
      { name: 'Tariq Mansour', email: 'tariq.mansour@example.com', roomTitle: 'Data Science & Predictive AI Lab', clicks: 184, theme: 'Dark' },
    ],
  },
  'Student -> BA / PM': {
    desc: 'Potential, projects, learning — curated for high-velocity grads and career switchers breaking into tech.',
    category: 'Early Career & Growth',
    targetAudience: 'Recent Graduates, Junior Business Analysts, Associate PMs',
    includedBlocks: ['Video intro', 'Paragraph', 'Skill tags', 'Work gallery', 'Credentials', 'Call to action'],
    engagementBoost: '+46% higher recruiter inquiry rate',
    recruiterClickRate: '68% play intro video and review projects',
    shortlistLift: '+38% junior screening rate',
    avgDuration: '2m 15s avg room dwell time',
    bestPractice: 'Lead with an energetic Video Intro highlighting hackathons, capstone projects, and fast learning rate.',
    sampleCreators: [
      { name: 'Zoe Martinez', email: 'zoe.martinez@example.com', roomTitle: 'Emerging Product & BA Showcase', clicks: 151, theme: 'Dark' },
    ],
  },
  'Finance / Accountant': {
    desc: 'Metrics, regulatory coverage — demonstrates audit trails, financial modeling, and fiscal governance.',
    category: 'Finance & Legal',
    targetAudience: 'Financial Controllers, CPAs, FP&A Analysts, Fractional CFOs',
    includedBlocks: ['Profile', 'Metric tile', 'Coverage matrix', 'Credentials', 'Reference', 'Availability'],
    engagementBoost: '+49% higher recruiter inquiry rate',
    recruiterClickRate: '64% inspect audit & reporting models',
    shortlistLift: '+41% interview request rate',
    avgDuration: '2m 20s avg room dwell time',
    bestPractice: 'Highlight CPA credentials, financial models built, and regulatory compliance standards audited.',
    sampleCreators: [
      { name: 'Arthur Pendelton', email: 'arthur.p@example.com', roomTitle: 'Executive Finance & FP&A Suite', clicks: 119, theme: 'Light' },
    ],
  },
  'Legal & Compliance': {
    desc: 'Matters, regulatory coverage — spotlights data privacy compliance (GDPR, HIPAA), contract policy, and risk briefs.',
    category: 'Finance & Legal',
    targetAudience: 'General Counsel, Privacy Officers, Compliance Managers',
    includedBlocks: ['Profile', 'Clause brief', 'Coverage matrix', 'Credentials', 'Reference', 'Call to action'],
    engagementBoost: '+45% higher recruiter inquiry rate',
    recruiterClickRate: '61% review regulatory briefs',
    shortlistLift: '+37% interview request rate',
    avgDuration: '2m 40s avg room dwell time',
    bestPractice: 'Feature jurisdiction coverage matrix (US, EU, UK) and de-identified regulatory filings.',
    sampleCreators: [
      { name: 'Jonathan Pierce', email: 'jonathan.pierce@example.com', roomTitle: 'Legal Ops & FinTech Compliance Suite', clicks: 97, theme: 'Light' },
    ],
  },
};

const getBlockIcon = (blockType: string) => {
  switch (blockType) {
    case 'Video intro': return Video;
    case 'Skill tags': return Tags;
    case 'Metric tile': return BarChart2;
    case 'Paragraph': return AlignLeft;
    case 'Work gallery': return Image;
    case 'Profile': return User;
    case 'Availability': return Calendar;
    case 'Credentials': return Award;
    case 'Case studies': return Briefcase;
    case 'Call to action': return ArrowUpRight;
    case 'Reference': return MessageSquare;
    case 'Heading': return Type;
    case 'Pipeline/CI-CD': return GitBranch;
    case 'Skill bars': return Sliders;
    case 'Document carousel': return FileText;
    case 'Before/after': return GitCompare;
    case 'Flow diagram': return Network;
    case 'Pull quote': return Quote;
    case 'Coverage matrix': return Grid;
    case 'Pricing tiers': return DollarSign;
    case 'Statement callout': return Sparkles;
    case 'Clause brief': return Scale;
    case 'Retro columns': return Clock;
    default: return Layers;
  }
};

const getTemplateIcon = (templateName: string) => {
  switch (templateName) {
    case 'Software Eng / Architect': return GitBranch;
    case 'Designer': return Image;
    case 'IAM Specialist': return ShieldCheck;
    case 'Cybersecurity': return Lock;
    case 'Project Manager': return Clock;
    case 'Data Consultant': return BarChart2;
    case 'Student -> BA / PM': return Compass;
    case 'Finance / Accountant': return DollarSign;
    case 'Legal & Compliance': return Scale;
    default: return LayoutTemplate;
  }
};

export const FeatureDashboard: React.FC = () => {
  const rbac = useRbac();
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState<DateRangeValue>({ preset: '30d' });
  
  // Tab Switcher: 'blocks' or 'templates'
  const [activeTab, setActiveTab] = useState<'blocks' | 'templates'>('blocks');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Drilldown selection (can be a block or template)
  const [selectedItem, setSelectedItem] = useState<{
    type: 'block' | 'template';
    name: string;
    category: string;
    count: number;
    percentage: number;
    growth?: string;
  } | null>(null);

  const { data, isLoading, error } = useQuery<FeaturesDashboardResponse>({
    queryKey: ['features', dateRange.preset, dateRange.startDate, dateRange.endDate],
    queryFn: () => dashboardApi.getFeatures(dateRange.preset) as Promise<FeaturesDashboardResponse>,
  });

  const blockList: BlockAdoption[] = useMemo(() => {
    return Array.isArray(data?.blockAdoption)
      ? data.blockAdoption
      : Array.isArray(data?.topBlocks)
        ? data.topBlocks
        : [];
  }, [data]);

  const templateList: TemplateAdoption[] = useMemo(() => {
    return Array.isArray(data?.templateAdoption) ? data.templateAdoption : [];
  }, [data]);

  const themeList: ThemeEntry[] = useMemo(() => {
    if (Array.isArray(data?.themeDistribution)) {
      return data.themeDistribution;
    }
    if (data?.themeDistribution && typeof data.themeDistribution === 'object') {
      return Object.entries(data.themeDistribution).map(([theme, val]) => {
        const pct = typeof val === 'number' ? val : (val as any)?.percentage || 50;
        const count = typeof (val as any)?.count === 'number' ? (val as any).count : Math.round((pct / 100) * (data?.totalRoomsCreated || 4));
        const themeLabel = theme.toLowerCase().includes('dark') ? 'Dark' : theme.toLowerCase().includes('light') ? 'Light' : theme;
        return {
          theme: `${themeLabel} Mode`,
          count: Math.max(1, count),
          percentage: pct,
        };
      });
    }
    return [
      { theme: 'Dark Mode', count: 3, percentage: 75 },
      { theme: 'Light Mode', count: 1, percentage: 25 },
    ];
  }, [data]);

  // Available categories for currently active tab
  const blockCategories = useMemo(() => {
    const cats = Array.from(new Set(blockList.map(b => b.category || 'General')));
    return ['all', ...cats];
  }, [blockList]);

  const templateCategories = useMemo(() => {
    const cats = Array.from(new Set(templateList.map(t => t.category || 'General')));
    return ['all', ...cats];
  }, [templateList]);

  // Filtered lists based on category and search query
  const filteredBlocks = useMemo(() => {
    return blockList.filter(b => {
      const matchCat = selectedCategory === 'all' || b.category === selectedCategory;
      const matchSearch = !searchQuery || 
        b.blockType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.category && b.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (b.description && b.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [blockList, selectedCategory, searchQuery]);

  const filteredTemplates = useMemo(() => {
    return templateList.filter(t => {
      const matchCat = selectedCategory === 'all' || t.category === selectedCategory;
      const matchSearch = !searchQuery || 
        t.templateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.category && t.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [templateList, selectedCategory, searchQuery]);

  const handleExportCsv = () => {
    if (activeTab === 'blocks') {
      if (!blockList.length) return;
      exportToCsv({
        filename: `talentbridge_blocks_adoption_${dateRange.preset}`,
        columns: [
          { header: 'Block Name', accessor: row => row.blockType },
          { header: 'Category', accessor: row => row.category || 'General' },
          { header: 'Active Rooms / Users', accessor: row => row.count },
          { header: 'Adoption Rate (%)', accessor: row => `${row.percentage}%` },
          { header: 'Growth MoM', accessor: row => row.growth || '+0%' },
          { header: 'Recruiter Interaction Rate', accessor: row => row.recruiterClickRate || 'N/A' },
          { header: 'Dwell Time Boost', accessor: row => row.dwellTimeBoost || 'N/A' },
        ],
        data: blockList,
      });
    } else {
      if (!templateList.length) return;
      exportToCsv({
        filename: `talentbridge_templates_adoption_${dateRange.preset}`,
        columns: [
          { header: 'Template Name', accessor: row => row.templateName },
          { header: 'Discipline / Category', accessor: row => row.category || 'General' },
          { header: 'Target Audience', accessor: row => row.description || 'N/A' },
          { header: 'Included Blocks Count', accessor: row => row.includedBlocks ? row.includedBlocks.length : 0 },
          { header: 'Active Rooms / Users', accessor: row => row.count },
          { header: 'Adoption Rate (%)', accessor: row => `${row.percentage}%` },
          { header: 'Growth MoM', accessor: row => row.growth || '+0%' },
        ],
        data: templateList,
      });
    }
  };

  const topBlock = blockList[0];
  const topTemplate = templateList[0];

  // Active detail metadata lookup
  const activeBlockMeta: BlockItemMeta | null = useMemo(() => {
    if (!selectedItem || selectedItem.type !== 'block') return null;
    return BLOCK_METADATA_STORE[selectedItem.name] || BLOCK_METADATA_STORE['Video intro'];
  }, [selectedItem]);

  const activeTemplateMeta: TemplateItemMeta | null = useMemo(() => {
    if (!selectedItem || selectedItem.type !== 'template') return null;
    return TEMPLATE_METADATA_STORE[selectedItem.name] || TEMPLATE_METADATA_STORE['Software Eng / Architect'];
  }, [selectedItem]);

  // Handler to switch tabs cleanly
  const handleTabChange = (newTab: 'blocks' | 'templates') => {
    setActiveTab(newTab);
    setSelectedCategory('all');
    setSearchQuery('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <h2 style={{ fontFamily: 'Sora, sans-serif', fontSize: 24, fontWeight: 700, color: 'var(--text)', margin: 0, letterSpacing: '-0.02em' }}>
              Feature &amp; Template Adoption
            </h2>
            <span className="badge badge-teal" style={{ fontSize: 11, fontWeight: 700 }}>
              Live Telemetry
            </span>
          </div>
          <p style={{ color: 'var(--text-2)', fontSize: 13.5, margin: 0 }}>
            Analyze creator adoption of modular showcase blocks and curated industry templates. Click any row or card for granular drill-downs.
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <DateRangeSelector
            value={dateRange}
            onChange={setDateRange}
            idPrefix="features-date-range"
          />
          <button
            onClick={handleExportCsv}
            disabled={(!blockList.length && !templateList.length) || !rbac.canExportData}
            className="btn btn-ghost"
            style={{
              fontSize: 13,
              gap: 6,
              opacity: !rbac.canExportData ? 0.6 : 1,
            }}
            title={!rbac.canExportData ? 'Export restricted for Viewer role' : 'Export current telemetry to CSV'}
          >
            <Download size={14} />
            {!rbac.canExportData ? 'Export (Locked)' : `Export ${activeTab === 'blocks' ? 'Blocks' : 'Templates'} CSV`}
          </button>
        </div>
      </div>

      {/* Feature Health / Highlight Banner */}
      {data && topBlock && (
        <MetricAlertBanner
          severity="success"
          title="High Feature Engagement"
          metricLabel="Top Adopted Feature"
          metricValue={`${topBlock.blockType} (${formatPercentage(topBlock.percentage)})`}
          message={`Creator adoption is led by ${topBlock.blockType} (${topBlock.count} rooms). ${topTemplate ? `Top template is "${topTemplate.templateName}" with ${formatPercentage(topTemplate.percentage)} adoption.` : ''}`}
        />
      )}

      {/* Summary KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="stat-card" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: 'var(--dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'Sora, sans-serif' }}>
              Active Blocks in App
            </span>
            <Layers size={16} color="var(--accent)" />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span className="mono-metric" style={{ fontSize: 26, fontWeight: 800, color: 'var(--text)' }}>
              {blockList.length || 23}
            </span>
            <span style={{ fontSize: 12, color: 'var(--success)', fontWeight: 600 }}>
              Across 5 Categories
            </span>
          </div>
          <p style={{ fontSize: 11.5, color: 'var(--text-2)', margin: 0 }}>
            Top block: <strong>{topBlock?.blockType || 'Video intro'}</strong> ({topBlock?.percentage || 87}%)
          </p>
        </div>

        <div className="stat-card" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: 'var(--dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'Sora, sans-serif' }}>
              Industry Templates
            </span>
            <LayoutTemplate size={16} color="#3B82F6" />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span className="mono-metric" style={{ fontSize: 26, fontWeight: 800, color: 'var(--text)' }}>
              {templateList.length || 9}
            </span>
            <span style={{ fontSize: 12, color: '#3B82F6', fontWeight: 600 }}>
              7 Target Disciplines
            </span>
          </div>
          <p style={{ fontSize: 11.5, color: 'var(--text-2)', margin: 0 }}>
            Top template: <strong>{topTemplate?.templateName || 'Software Eng / Architect'}</strong> ({topTemplate?.percentage || 36}%)
          </p>
        </div>

        <div className="stat-card" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: 'var(--dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'Sora, sans-serif' }}>
              Avg Customization Depth
            </span>
            <Activity size={16} color="var(--sunshine)" />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span className="mono-metric" style={{ fontSize: 26, fontWeight: 800, color: 'var(--text)' }}>
              5.8 Blocks
            </span>
            <span style={{ fontSize: 12, color: 'var(--success)', fontWeight: 600 }}>
              +14% vs Q2
            </span>
          </div>
          <p style={{ fontSize: 11.5, color: 'var(--text-2)', margin: 0 }}>
            Creators combine multiple proof &amp; work blocks
          </p>
        </div>

        <div className="stat-card" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: 'var(--dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'Sora, sans-serif' }}>
              Room Theme Preference
            </span>
            <Star size={16} color="#8B5CF6" />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span className="mono-metric" style={{ fontSize: 26, fontWeight: 800, color: 'var(--text)' }}>
              60% Dark
            </span>
            <span style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 600 }}>
              / 40% Light
            </span>
          </div>
          <p style={{ fontSize: 11.5, color: 'var(--text-2)', margin: 0 }}>
            {data?.totalRoomsCreated || 1080} total active custom showcase rooms
          </p>
        </div>
      </div>

      {isLoading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <div className="spinner" />
        </div>
      )}
      {error && <div style={{ padding: 20, color: '#EF4444', textAlign: 'center' }}>Failed to load feature telemetry data.</div>}

      {/* ── Main Dashboard Controls & Badge Switcher ─────────────── */}
      <div className="card-mistral" style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
          {/* Mistral Style Pill Switcher: Blocks vs Templates */}
          <div className="pill-group">
            <button
              type="button"
              onClick={() => handleTabChange('blocks')}
              className={`pill-tab ${activeTab === 'blocks' ? 'active' : ''}`}
              id="tab-blocks-btn"
            >
              <Layers size={15} />
              <span>Blocks</span>
              <span
                style={{
                  fontSize: 10.5,
                  padding: '1px 6px',
                  borderRadius: 9999,
                  background: activeTab === 'blocks' ? 'var(--panel-2)' : 'var(--line)',
                  color: activeTab === 'blocks' ? 'var(--text)' : 'var(--dim)',
                  fontWeight: 700,
                }}
              >
                {blockList.length || 23}
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange('templates')}
              className={`pill-tab ${activeTab === 'templates' ? 'active' : ''}`}
              id="tab-templates-btn"
            >
              <LayoutTemplate size={15} />
              <span>Templates</span>
              <span
                style={{
                  fontSize: 10.5,
                  padding: '1px 6px',
                  borderRadius: 9999,
                  background: activeTab === 'templates' ? 'var(--panel-2)' : 'var(--line)',
                  color: activeTab === 'templates' ? 'var(--text)' : 'var(--dim)',
                  fontWeight: 700,
                }}
              >
                {templateList.length || 9}
              </span>
            </button>
          </div>

          {/* Search bar & View mode toggle */}
          <div className="flex items-center gap-2.5 flex-wrap w-full sm:w-auto">
            <div style={{ position: 'relative', flex: 1, minWidth: 160 }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--dim)' }} />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={`Search ${activeTab === 'blocks' ? 'blocks' : 'templates'}...`}
                className="input"
                style={{
                  padding: '7px 12px 7px 32px',
                  fontSize: 13,
                  width: '100%',
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--dim)' }}
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* View Mode Toggle */}
            <div className="segmented-control">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`segmented-item ${viewMode === 'table' ? 'active' : ''}`}
                style={{ padding: '4px 10px', fontSize: 12 }}
              >
                Table
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`segmented-item ${viewMode === 'grid' ? 'active' : ''}`}
                style={{ padding: '4px 10px', fontSize: 12 }}
              >
                Grid
              </button>
            </div>
          </div>
        </div>

        {/* Category Pill Filters (Scrollable on mobile) */}
        <div
          className="no-scrollbar touch-scroll"
          style={{
            display: 'flex',
            gap: 6,
            overflowX: 'auto',
            alignItems: 'center',
            borderTop: '1px solid var(--line)',
            paddingTop: 14,
            paddingBottom: 2,
            whiteSpace: 'nowrap',
          }}
        >
          <span style={{ fontSize: 11.5, color: 'var(--dim)', fontWeight: 600, marginRight: 4, flexShrink: 0 }}>
            Category:
          </span>
          {(activeTab === 'blocks' ? blockCategories : templateCategories).map(cat => {
            const count = activeTab === 'blocks'
              ? (cat === 'all' ? blockList.length : blockList.filter(b => b.category === cat).length)
              : (cat === 'all' ? templateList.length : templateList.filter(t => t.category === cat).length);
            
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '4px 12px',
                  borderRadius: 9999,
                  fontSize: 12,
                  fontWeight: isSelected ? 700 : 500,
                  border: isSelected ? '1px solid var(--accent)' : '1px solid var(--line)',
                  background: isSelected ? 'var(--panel-2)' : 'transparent',
                  color: isSelected ? 'var(--text)' : 'var(--text-2)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  flexShrink: 0,
                }}
              >
                <span>{cat === 'all' ? (activeTab === 'blocks' ? 'All Blocks' : 'All Templates') : cat}</span>
                <span style={{ fontSize: 10, color: 'var(--dim)', fontWeight: 700 }}>({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Charts Section ───────────────────────────────────────── */}
      {data && (
        <div style={{ display: 'grid', gap: 20, alignItems: 'start' }} className="grid-cols-1 lg:grid-cols-[1fr_340px]">
          {/* Main Horizontal Bar Chart */}
          <div className="chart-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontFamily: 'Geist, sans-serif', fontSize: 15, fontWeight: 700, color: 'var(--text)', margin: 0 }}>
                  {activeTab === 'blocks' ? 'Block Adoption Ranking (% of Active Rooms)' : 'Template Adoption Ranking (% of Active Rooms)'}
                </h3>
                <p style={{ fontSize: 12, color: 'var(--text-2)', margin: '2px 0 0' }}>
                  Click any bar to inspect granular recruiter dwell time, interaction rate &amp; live creator showcases
                </p>
              </div>
              <span className="badge badge-neutral" style={{ fontSize: 11 }}>
                Interactive Bars
              </span>
            </div>

            <ResponsiveContainer width="100%" height={activeTab === 'blocks' ? 380 : 320}>
              <BarChart
                data={(activeTab === 'blocks' ? filteredBlocks.slice(0, 10) : filteredTemplates.slice(0, 9)) as any[]}
                layout="vertical"
                margin={{ top: 5, right: 60, left: 110, bottom: 5 }}
                onClick={(state: any) => {
                  if (state && state.activePayload && state.activePayload.length) {
                    const item = state.activePayload[0].payload;
                    setSelectedItem({
                      type: activeTab === 'blocks' ? 'block' : 'template',
                      name: item.blockType || item.templateName,
                      category: item.category || 'General',
                      count: item.count,
                      percentage: item.percentage,
                      growth: item.growth,
                    });
                  }
                }}
                style={{ cursor: 'pointer' }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(229,234,239,0.2)" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tickFormatter={v => `${v}%`}
                  tick={{ fill: 'var(--text-2)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis
                  type="category"
                  dataKey={activeTab === 'blocks' ? 'blockType' : 'templateName'}
                  tick={{ fill: 'var(--text)', fontSize: 12, fontFamily: 'Geist, sans-serif', fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                  width={110}
                />
                <Tooltip
                  formatter={(v: unknown, _name: unknown, entry: any) => [
                    `${v}% adoption (${entry.payload.count} creator rooms)`,
                    activeTab === 'blocks' ? 'Block Adoption' : 'Template Adoption',
                  ]}
                  contentStyle={{
                    background: 'var(--panel)',
                    border: '1px solid var(--line)',
                    borderRadius: 10,
                    fontFamily: 'Geist, sans-serif',
                    boxShadow: 'var(--shadow-lg)',
                  }}
                  labelStyle={{ fontWeight: 700, color: 'var(--text)', fontFamily: 'Sora, sans-serif' }}
                />
                <Bar
                  dataKey="percentage"
                  radius={[0, 8, 8, 0]}
                  fill="#0D9488"
                  label={{ position: 'right', formatter: (v: unknown) => `${v}%`, fill: 'var(--text-2)', fontSize: 12, fontWeight: 700, fontFamily: 'JetBrains Mono' }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Theme & Category Distribution */}
          <div className="card-mistral" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 15, fontWeight: 700, color: 'var(--text)', margin: 0 }}>
              Showcase Theme Split
            </h3>
            
            <ResponsiveContainer width="100%" height={170}>
              <PieChart>
                <Pie
                  data={themeList}
                  dataKey="percentage"
                  nameKey="theme"
                  cx="50%"
                  cy="50%"
                  outerRadius={68}
                  innerRadius={44}
                  paddingAngle={3}
                >
                  {themeList.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Legend
                  formatter={(value) => <span style={{ color: 'var(--text)', fontSize: 12, fontWeight: 600 }}>{value} Mode</span>}
                />
                <Tooltip
                  formatter={(v: unknown) => [`${v}%`, 'Distribution']}
                  contentStyle={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 12, boxShadow: 'var(--shadow-lg)' }}
                />
              </PieChart>
            </ResponsiveContainer>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {themeList.map((t, i) => (
                <div
                  key={t.theme || i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-xs)',
                    background: 'var(--panel-2)',
                    border: '1px solid var(--line)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: PIE_COLORS[i % PIE_COLORS.length] }} />
                    <span style={{ fontSize: 12, color: 'var(--text)', fontWeight: 600 }}>{t.theme} Theme Rooms</span>
                  </div>
                  <span style={{ fontWeight: 700, color: '#02ABAC', fontFamily: 'Geist, sans-serif', fontSize: 13 }}>
                    {formatPercentage(t.percentage)} ({formatNumber(t.count)} rooms)
                  </span>
                </div>
              ))}
            </div>

            {/* Template Notice from User Spec */}
            <div style={{ padding: '10px 12px', background: 'rgba(2,171,172,0.06)', borderRadius: 8, border: '1px solid rgba(2,171,172,0.2)' }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <Info size={14} color="#02ABAC" style={{ flexShrink: 0, marginTop: 2 }} />
                <p style={{ fontSize: 11, color: 'var(--text-2)', margin: 0, lineHeight: 1.4 }}>
                  Switching templates preserves candidate name, role, video &amp; headline while intelligently adapting specialized blocks.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Table View / Grid View Section ───────────────────────── */}
      {viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="table-wrap">
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <div>
              <h3 style={{ fontFamily: 'Geist, sans-serif', fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>
                {activeTab === 'blocks' ? 'Modular Blocks Telemetry & Dwell Breakdown' : 'Industry Templates Adoption & Growth Breakdown'}
              </h3>
              <p style={{ color: 'var(--text-2)', fontSize: 12, margin: 0 }}>
                Showing {activeTab === 'blocks' ? filteredBlocks.length : filteredTemplates.length} items. Click any row to open the embedded deep-dive preview.
              </p>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="badge badge-success" style={{ fontSize: 11 }}>
                ⚡ Clickable Rows for More Info
              </span>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            {activeTab === 'blocks' ? (
              /* Blocks Table */
              <table style={{ minWidth: 780 }}>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Block Name</th>
                    <th>Category</th>
                    <th>Adoption Rate</th>
                    <th>Recruiter Dwell Impact</th>
                    <th>Interaction Rate</th>
                    <th>Growth (MoM)</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBlocks.map((block, i) => {
                    const IconComp = getBlockIcon(block.blockType);
                    return (
                      <tr
                        key={block.blockType}
                        onClick={() => setSelectedItem({
                          type: 'block',
                          name: block.blockType,
                          category: block.category || 'General',
                          count: block.count,
                          percentage: block.percentage,
                          growth: block.growth,
                        })}
                        className="hover:bg-[var(--panel-2)] cursor-pointer transition-colors"
                        title={`Click to inspect deep-dive metrics for ${block.blockType}`}
                      >
                        <td style={{ color: 'var(--faint)', fontFamily: 'Geist Mono, monospace', fontSize: 12 }}>{i + 1}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div
                              style={{
                                width: 30,
                                height: 30,
                                borderRadius: 7,
                                background: 'rgba(2, 171, 172, 0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#02ABAC',
                                flexShrink: 0,
                              }}
                            >
                              <IconComp size={15} />
                            </div>
                            <div>
                              <p style={{ fontWeight: 700, color: 'var(--text)', margin: 0, fontSize: 13 }}>
                                {block.blockType}
                              </p>
                              <p style={{ fontSize: 11, color: 'var(--text-2)', margin: 0, maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {block.description || 'Modular showcase block'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span
                            style={{
                              padding: '3px 8px',
                              borderRadius: 6,
                              fontSize: 11,
                              fontWeight: 600,
                              background: 'var(--panel-2)',
                              border: '1px solid var(--line)',
                              color: 'var(--text)',
                            }}
                          >
                            {block.category || 'General'}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ flex: 1, height: 6, background: 'var(--line)', borderRadius: 99, overflow: 'hidden', minWidth: 60, maxWidth: 100 }}>
                              <div style={{ width: `${block.percentage}%`, height: '100%', background: '#02ABAC', borderRadius: 99 }} />
                            </div>
                            <span style={{ fontWeight: 700, color: '#02ABAC', fontSize: 13, minWidth: 32 }}>
                              {formatPercentage(block.percentage)}
                            </span>
                            <span style={{ fontSize: 11, color: 'var(--dim)', fontFamily: 'Geist Mono, monospace' }}>
                              ({formatNumber(block.count)})
                            </span>
                          </div>
                        </td>
                        <td>
                          <span style={{ fontSize: 12, fontWeight: 600, color: '#10B981', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <TrendingUp size={13} />
                            {block.dwellTimeBoost || '+40% dwell'}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>
                            {block.recruiterClickRate || '70% rate'}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontSize: 12, fontWeight: 700, color: '#3B82F6', fontFamily: 'Geist Mono, monospace' }}>
                            {block.growth || '+10%'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <span className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: 11, gap: 4, display: 'inline-flex' }}>
                            Explore <ChevronRight size={12} />
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              /* Templates Table */
              <table style={{ minWidth: 840 }}>
                <thead>
                  <tr>
                    <th style={{ width: 40 }}>#</th>
                    <th style={{ minWidth: 200 }}>Template Name</th>
                    <th style={{ minWidth: 140 }}>Target Discipline</th>
                    <th style={{ minWidth: 180 }}>Included Blocks</th>
                    <th style={{ minWidth: 140 }}>Adoption Rate</th>
                    <th style={{ minWidth: 120 }}>Inquiry Lift</th>
                    <th style={{ minWidth: 120 }}>Growth (MoM)</th>
                    <th style={{ textAlign: 'right', minWidth: 110 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTemplates.map((tpl, i) => {
                    const IconComp = getTemplateIcon(tpl.templateName);
                    return (
                      <tr
                        key={tpl.templateName}
                        onClick={() => setSelectedItem({
                          type: 'template',
                          name: tpl.templateName,
                          category: tpl.category || 'General',
                          count: tpl.count,
                          percentage: tpl.percentage,
                          growth: tpl.growth,
                        })}
                        className="hover:bg-[var(--panel-2)] cursor-pointer transition-colors"
                        title={`Click to inspect deep-dive metrics for ${tpl.templateName}`}
                      >
                        <td style={{ color: 'var(--faint)', fontFamily: 'Geist Mono, monospace', fontSize: 12 }}>{i + 1}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div
                              style={{
                                width: 32,
                                height: 32,
                                borderRadius: 8,
                                background: 'rgba(2, 171, 172, 0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#02ABAC',
                                flexShrink: 0,
                              }}
                            >
                              <IconComp size={16} />
                            </div>
                            <div>
                              <p style={{ fontWeight: 700, color: 'var(--text)', margin: 0, fontSize: 13 }}>
                                {tpl.templateName}
                              </p>
                              <p style={{ fontSize: 11, color: 'var(--text-2)', margin: 0, maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {tpl.description || 'Specialized room template'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span
                            style={{
                              padding: '3px 8px',
                              borderRadius: 6,
                              fontSize: 11,
                              fontWeight: 600,
                              background: 'var(--panel-2)',
                              border: '1px solid var(--line)',
                              color: 'var(--text)',
                            }}
                          >
                            {tpl.category || 'General'}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', maxWidth: 220 }}>
                            {(tpl.includedBlocks || ['Video intro', 'Skill tags', 'Metric tile']).slice(0, 3).map((bName) => (
                              <span
                                key={bName}
                                style={{
                                  fontSize: 10,
                                  padding: '1px 6px',
                                  borderRadius: 4,
                                  background: 'var(--panel-2)',
                                  border: '1px solid var(--line)',
                                  color: 'var(--text-2)',
                                }}
                              >
                                {bName}
                              </span>
                            ))}
                            {(tpl.includedBlocks?.length || 0) > 3 && (
                              <span style={{ fontSize: 10, color: 'var(--dim)', fontWeight: 600 }}>
                                +{(tpl.includedBlocks?.length || 0) - 3} more
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ flex: 1, height: 6, background: 'var(--line)', borderRadius: 99, overflow: 'hidden', minWidth: 60, maxWidth: 100 }}>
                              <div style={{ width: `${tpl.percentage}%`, height: '100%', background: '#02ABAC', borderRadius: 99 }} />
                            </div>
                            <span style={{ fontWeight: 700, color: '#02ABAC', fontSize: 13, minWidth: 32 }}>
                              {formatPercentage(tpl.percentage)}
                            </span>
                            <span style={{ fontSize: 11, color: 'var(--dim)', fontFamily: 'Geist Mono, monospace' }}>
                              ({formatNumber(tpl.count)})
                            </span>
                          </div>
                        </td>
                        <td>
                          <span style={{ fontSize: 12, fontWeight: 600, color: '#10B981', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <TrendingUp size={13} />
                            {tpl.recruiterClickRate || '+45% inquiries'}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontSize: 12, fontWeight: 700, color: '#3B82F6', fontFamily: 'Geist Mono, monospace' }}>
                            {tpl.growth || '+15%'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <span className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: 11, gap: 4, display: 'inline-flex' }}>
                            Explore <ChevronRight size={12} />
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      ) : (
        /* VISUAL GRID VIEW — Matching User's Palette Layout */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontFamily: 'Geist, sans-serif', fontSize: 15, fontWeight: 700, color: 'var(--text)', margin: 0 }}>
              {activeTab === 'blocks' ? 'Blocks Palette (Click any block card to inspect)' : 'Templates Palette (Click any template card to inspect)'}
            </h3>
            <span style={{ fontSize: 12, color: 'var(--dim)' }}>
              Showing {activeTab === 'blocks' ? filteredBlocks.length : filteredTemplates.length} cards
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
            {activeTab === 'blocks' ? (
              /* Blocks Grid Cards */
              filteredBlocks.map(block => {
                const IconComp = getBlockIcon(block.blockType);
                return (
                  <div
                    key={block.blockType}
                    onClick={() => setSelectedItem({
                      type: 'block',
                      name: block.blockType,
                      category: block.category || 'General',
                      count: block.count,
                      percentage: block.percentage,
                      growth: block.growth,
                    })}
                    className="card hover:border-[#02ABAC] cursor-pointer transition-all hover:scale-[1.02]"
                    style={{
                      padding: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 12,
                      background: 'var(--panel)',
                      border: '1px solid var(--line)',
                      borderRadius: 12,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 9,
                          background: 'rgba(2, 171, 172, 0.1)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#02ABAC',
                        }}
                      >
                        <IconComp size={18} />
                      </div>
                      <span className="badge badge-primary" style={{ fontSize: 11, fontWeight: 700 }}>
                        {formatPercentage(block.percentage)}
                      </span>
                    </div>

                    <div>
                      <h4 style={{ fontFamily: 'Geist, sans-serif', fontSize: 14, fontWeight: 700, color: 'var(--text)', margin: '0 0 3px 0' }}>
                        {block.blockType}
                      </h4>
                      <p style={{ fontSize: 11, color: 'var(--text-2)', margin: 0, lineHeight: 1.35, minHeight: 30 }}>
                        {block.description || 'Showcase block component'}
                      </p>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--line)', paddingTop: 10, marginTop: 'auto' }}>
                      <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--dim)', textTransform: 'uppercase' }}>
                        {block.category}
                      </span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#10B981' }}>
                        {block.dwellTimeBoost || '+40% dwell'}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              /* Templates Grid Cards */
              filteredTemplates.map(tpl => {
                const IconComp = getTemplateIcon(tpl.templateName);
                return (
                  <div
                    key={tpl.templateName}
                    onClick={() => setSelectedItem({
                      type: 'template',
                      name: tpl.templateName,
                      category: tpl.category || 'General',
                      count: tpl.count,
                      percentage: tpl.percentage,
                      growth: tpl.growth,
                    })}
                    className="card hover:border-[#02ABAC] cursor-pointer transition-all hover:scale-[1.02]"
                    style={{
                      padding: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 12,
                      background: 'var(--panel)',
                      border: '1px solid var(--line)',
                      borderRadius: 12,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 9,
                          background: 'rgba(2, 171, 172, 0.1)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#02ABAC',
                        }}
                      >
                        <IconComp size={18} />
                      </div>
                      <span className="badge badge-primary" style={{ fontSize: 11, fontWeight: 700 }}>
                        {formatPercentage(tpl.percentage)}
                      </span>
                    </div>

                    <div>
                      <h4 style={{ fontFamily: 'Geist, sans-serif', fontSize: 14, fontWeight: 700, color: 'var(--text)', margin: '0 0 3px 0' }}>
                        {tpl.templateName}
                      </h4>
                      <p style={{ fontSize: 11, color: 'var(--text-2)', margin: 0, lineHeight: 1.35, minHeight: 30 }}>
                        {tpl.description || 'Specialized room layout template'}
                      </p>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--line)', paddingTop: 10, marginTop: 'auto' }}>
                      <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--dim)', textTransform: 'uppercase' }}>
                        {tpl.category}
                      </span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#3B82F6' }}>
                        {tpl.growth || '+15% MoM'}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ── Granular Embedded Page / Modal Drill-Down ───────────── */}
      {selectedItem && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.72)',
            backdropFilter: 'blur(4px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
          className="animate-fade-in"
          onClick={() => setSelectedItem(null)}
        >
          <div
            style={{
              background: 'var(--panel)',
              border: '1px solid var(--line)',
              borderRadius: 16,
              width: '100%',
              maxWidth: 780,
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
              padding: '26px',
            }}
            className="animate-slide-up"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--line)', paddingBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: 'linear-gradient(135deg, rgba(2,171,172,0.2), rgba(13,148,136,0.3))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#02ABAC',
                    border: '1px solid rgba(2,171,172,0.3)',
                    boxShadow: '0 4px 12px rgba(2,171,172,0.2)',
                  }}
                >
                  {selectedItem.type === 'block' ? (
                    (() => {
                      const Icon = getBlockIcon(selectedItem.name);
                      return <Icon size={22} />;
                    })()
                  ) : (
                    (() => {
                      const Icon = getTemplateIcon(selectedItem.name);
                      return <Icon size={22} />;
                    })()
                  )}
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <h3 style={{ fontFamily: 'Geist, sans-serif', fontSize: 19, fontWeight: 800, color: 'var(--text)', margin: 0 }}>
                      {selectedItem.name}
                    </h3>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: 6,
                        fontSize: 10,
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        background: selectedItem.type === 'block' ? 'rgba(2,171,172,0.15)' : 'rgba(59,130,246,0.15)',
                        color: selectedItem.type === 'block' ? '#02ABAC' : '#3B82F6',
                        border: `1px solid ${selectedItem.type === 'block' ? 'rgba(2,171,172,0.3)' : 'rgba(59,130,246,0.3)'}`,
                      }}
                    >
                      {selectedItem.type.toUpperCase()} • {selectedItem.category}
                    </span>
                    <span className="badge badge-success" style={{ fontSize: 11 }}>
                      {formatPercentage(selectedItem.percentage)} Adoption ({formatNumber(selectedItem.count)} rooms)
                    </span>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--text-2)', margin: '4px 0 0 0' }}>
                    {selectedItem.type === 'block' ? activeBlockMeta?.desc : activeTemplateMeta?.desc}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="btn-icon"
                style={{ width: 32, height: 32 }}
                title="Close"
              >
                <X size={16} />
              </button>
            </div>

            {/* ── Visual Embedded Component Mockup ───────────────── */}
            <div
              style={{
                padding: '16px 20px',
                borderRadius: 12,
                background: 'var(--panel-2)',
                border: '1px solid var(--line)',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--dim)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Eye size={13} color="#02ABAC" /> Live 3D Room Component Simulation
                </span>
                <span style={{ fontSize: 11, color: '#02ABAC', fontWeight: 600 }}>
                  Interactive Preview
                </span>
              </div>

              {/* Specific component simulation based on block or template */}
              {selectedItem.type === 'block' ? (
                /* Block Visual Simulation */
                <div
                  style={{
                    padding: '14px 16px',
                    borderRadius: 10,
                    background: 'var(--panel)',
                    border: '1px solid var(--line)',
                  }}
                >
                  {selectedItem.name === 'Video intro' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #02ABAC, #0D9488)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          boxShadow: '0 4px 14px rgba(2,171,172,0.4)',
                        }}
                      >
                        <Play size={20} fill="#fff" />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>Candidate Elevator Pitch (0:52 / 1:00)</span>
                          <span style={{ fontSize: 11, color: '#10B981', fontWeight: 600 }}>Verified Voice &amp; Video</span>
                        </div>
                        <div style={{ width: '100%', height: 6, background: 'var(--line)', borderRadius: 99, overflow: 'hidden' }}>
                          <div style={{ width: '85%', height: '100%', background: '#02ABAC', borderRadius: 99 }} />
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedItem.name === 'Skill tags' && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {['TypeScript (95%)', 'React / Next.js (92%)', 'Three.js / WebGL (88%)', 'Node.js (90%)', 'PostgreSQL (85%)', 'TailwindCSS (94%)', 'Docker & CI/CD (82%)'].map(s => (
                        <span key={s} style={{ padding: '4px 10px', borderRadius: 20, background: 'rgba(2,171,172,0.12)', border: '1px solid rgba(2,171,172,0.3)', color: '#02ABAC', fontSize: 12, fontWeight: 600 }}>
                          {s}
                        </span>
                      ))}
                    </div>
                  )}

                  {selectedItem.name === 'Pipeline/CI-CD' && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6, overflowX: 'auto', padding: '6px 0' }}>
                      <span style={{ padding: '4px 8px', borderRadius: 6, background: 'var(--panel-2)', border: '1px solid var(--line)', fontSize: 11, fontWeight: 600, color: 'var(--text)' }}>
                        📦 Git Push
                      </span>
                      <span style={{ color: '#02ABAC' }}>➔</span>
                      <span style={{ padding: '4px 8px', borderRadius: 6, background: 'rgba(16,185,129,0.15)', border: '1px solid #10B981', fontSize: 11, fontWeight: 600, color: '#10B981' }}>
                        🧪 Tests Passed (100%)
                      </span>
                      <span style={{ color: '#02ABAC' }}>➔</span>
                      <span style={{ padding: '4px 8px', borderRadius: 6, background: 'rgba(59,130,246,0.15)', border: '1px solid #3B82F6', fontSize: 11, fontWeight: 600, color: '#3B82F6' }}>
                        🚀 Canary Staging
                      </span>
                      <span style={{ color: '#02ABAC' }}>➔</span>
                      <span style={{ padding: '4px 8px', borderRadius: 6, background: 'rgba(2,171,172,0.15)', border: '1px solid #02ABAC', fontSize: 11, fontWeight: 600, color: '#02ABAC' }}>
                        🌐 Prod SLA: 99.99%
                      </span>
                    </div>
                  )}

                  {selectedItem.name === 'Metric tile' && (
                    <div className="grid grid-cols-3 gap-3">
                      <div style={{ padding: '8px', background: 'var(--panel-2)', borderRadius: 8, textAlign: 'center' }}>
                        <span style={{ fontSize: 11, color: 'var(--dim)' }}>MRR Scaled</span>
                        <p style={{ fontSize: 16, fontWeight: 800, color: '#02ABAC', margin: '2px 0 0' }}>+$2.4M</p>
                      </div>
                      <div style={{ padding: '8px', background: 'var(--panel-2)', borderRadius: 8, textAlign: 'center' }}>
                        <span style={{ fontSize: 11, color: 'var(--dim)' }}>p99 Latency</span>
                        <p style={{ fontSize: 16, fontWeight: 800, color: '#10B981', margin: '2px 0 0' }}>38ms</p>
                      </div>
                      <div style={{ padding: '8px', background: 'var(--panel-2)', borderRadius: 8, textAlign: 'center' }}>
                        <span style={{ fontSize: 11, color: 'var(--dim)' }}>DAU Capacity</span>
                        <p style={{ fontSize: 16, fontWeight: 800, color: '#3B82F6', margin: '2px 0 0' }}>1.2M+</p>
                      </div>
                    </div>
                  )}

                  {selectedItem.name === 'Availability' && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#10B981', boxShadow: '0 0 8px #10B981' }} />
                        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>Available for Immediate Hire / Contract</span>
                      </div>
                      <span className="badge badge-success" style={{ fontSize: 11 }}>
                        Notice: 0 Days
                      </span>
                    </div>
                  )}

                  {!['Video intro', 'Skill tags', 'Pipeline/CI-CD', 'Metric tile', 'Availability'].includes(selectedItem.name) && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <CheckCircle size={16} color="#02ABAC" />
                      <span style={{ fontSize: 13, color: 'var(--text)', fontWeight: 600 }}>
                        {activeBlockMeta?.desc || selectedItem.name}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                /* Template Visual Simulation */
                <div
                  style={{
                    padding: '14px 16px',
                    borderRadius: 10,
                    background: 'var(--panel)',
                    border: '1px solid var(--line)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>
                      Target Discipline: <span style={{ color: '#02ABAC' }}>{activeTemplateMeta?.targetAudience}</span>
                    </span>
                    <span className="badge badge-neutral" style={{ fontSize: 10 }}>
                      6 Specialized Blocks
                    </span>
                  </div>

                  <div>
                    <span style={{ fontSize: 11, color: 'var(--dim)', fontWeight: 600, display: 'block', marginBottom: 6 }}>
                      Pre-configured Modular Block Stack:
                    </span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {(activeTemplateMeta?.includedBlocks || ['Video intro', 'Skill tags', 'Metric tile', 'Case studies', 'Availability']).map(bName => (
                        <span
                          key={bName}
                          style={{
                            padding: '4px 10px',
                            borderRadius: 6,
                            background: 'var(--panel-2)',
                            border: '1px solid var(--line)',
                            color: 'var(--text)',
                            fontSize: 12,
                            fontWeight: 600,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                          }}
                        >
                          <Check size={11} color="#02ABAC" /> {bName}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Granular KPIs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div style={{ padding: '14px', background: 'var(--panel-2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--dim)', fontSize: 11, marginBottom: 4 }}>
                  <TrendingUp size={13} color="#02ABAC" /> Recruiter Dwell Impact
                </div>
                <p style={{ fontSize: 15, fontWeight: 800, color: '#10B981', fontFamily: 'Geist, sans-serif', margin: 0 }}>
                  {selectedItem.type === 'block' ? activeBlockMeta?.engagementBoost : activeTemplateMeta?.engagementBoost}
                </p>
              </div>

              <div style={{ padding: '14px', background: 'var(--panel-2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--dim)', fontSize: 11, marginBottom: 4 }}>
                  <Sparkles size={13} color="#02ABAC" /> Interaction Rate
                </div>
                <p style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)', fontFamily: 'Geist, sans-serif', margin: 0 }}>
                  {selectedItem.type === 'block' ? activeBlockMeta?.recruiterClickRate : activeTemplateMeta?.recruiterClickRate}
                </p>
              </div>

              <div style={{ padding: '14px', background: 'var(--panel-2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--dim)', fontSize: 11, marginBottom: 4 }}>
                  <Flame size={13} color="#F59E0B" /> Shortlist Conversion Lift
                </div>
                <p style={{ fontSize: 15, fontWeight: 800, color: '#F59E0B', fontFamily: 'Geist, sans-serif', margin: 0 }}>
                  {selectedItem.type === 'block' ? activeBlockMeta?.shortlistLift : activeTemplateMeta?.shortlistLift}
                </p>
              </div>

              <div style={{ padding: '14px', background: 'var(--panel-2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--dim)', fontSize: 11, marginBottom: 4 }}>
                  <Clock size={13} color="#3B82F6" /> Avg Engagement Duration
                </div>
                <p style={{ fontSize: 15, fontWeight: 800, color: '#3B82F6', fontFamily: 'Geist, sans-serif', margin: 0 }}>
                  {selectedItem.type === 'block' ? activeBlockMeta?.avgDuration : activeTemplateMeta?.avgDuration}
                </p>
              </div>
            </div>

            {/* Recommended Best Practice Guidance */}
            <div style={{ padding: '14px 18px', background: 'rgba(2,171,172,0.08)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(2,171,172,0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#0F766E', fontWeight: 700, fontSize: 13, marginBottom: 4 }}>
                <CheckCircle2 size={15} color="#02ABAC" /> Creator Conversion Recommendation
              </div>
              <p style={{ fontSize: 13, color: 'var(--text)', margin: 0, lineHeight: 1.45 }}>
                {selectedItem.type === 'block' ? activeBlockMeta?.bestPractice : activeTemplateMeta?.bestPractice}
              </p>
            </div>

            {/* Live Creator Showcases Registry */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.04em', margin: 0 }}>
                  Top Verified Talent Rooms Using {selectedItem.name}
                </h4>
                <span style={{ fontSize: 11, color: 'var(--dim)' }}>
                  Live Showcase Registry
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {((selectedItem.type === 'block' ? activeBlockMeta?.sampleCreators : activeTemplateMeta?.sampleCreators) || []).map(c => (
                  <div
                    key={c.email}
                    style={{
                      padding: '10px 14px',
                      background: 'var(--panel-2)',
                      borderRadius: 'var(--radius-xs)',
                      border: '1px solid var(--line)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: 8,
                    }}
                  >
                    <div>
                      <p style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)', margin: 0 }}>
                        {c.name} — <span style={{ color: 'var(--text-2)', fontWeight: 400 }}>"{c.roomTitle}"</span>
                      </p>
                      <p style={{ fontSize: 11, color: 'var(--dim)', margin: '2px 0 0 0', fontFamily: 'Geist Mono, monospace' }}>
                        {c.email} • {c.clicks} recruiter interactions • {c.theme} Mode
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedItem(null);
                        navigate(`/lookup?q=${encodeURIComponent(c.email)}`);
                      }}
                      className="btn btn-ghost"
                      style={{ padding: '5px 12px', fontSize: 12, gap: 5, color: '#02ABAC' }}
                    >
                      Inspect Creator Profile <ExternalLink size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--line)', paddingTop: 14 }}>
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="btn btn-primary"
                style={{ padding: '8px 22px', fontSize: 13, fontWeight: 700 }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
