// src/data/helpKnowledgeBase.ts
// Knowledge base data dictionary, portal guides, and AI assistant response corpus for non-technical & technical users.

export interface GlossaryTerm {
  id: string;
  term: string;
  category: 'social' | 'email' | 'campaigns' | 'funnel' | 'rooms' | 'general';
  shortDefinition: string;
  detailedExplanation: string;
  formula?: string;
  benchmark?: string;
  howToImprove?: string;
  portalLocation: string;
  portalLink: string;
}

export interface PortalTouchpoint {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  route: string;
  badge?: string;
  description: string;
  keyMetrics: string[];
  bestFor: string;
  proTips: string[];
}

export interface PlaybookItem {
  id: string;
  title: string;
  summary: string;
  category: string;
  timeToComplete: string;
  steps: { stepNumber: number; title: string; instruction: string; tip?: string }[];
}

export interface BotQuickPrompt {
  id: string;
  label: string;
  query: string;
  category: 'basics' | 'calculations' | 'email' | 'strategy';
}

export const GLOSSARY_TERMS: GlossaryTerm[] = [
  {
    id: 'impressions',
    term: 'Impressions',
    category: 'social',
    shortDefinition: 'The total number of times your post or content was displayed on users\' screens.',
    detailedExplanation: 'Impressions count every single view, including multiple views by the same person. If 1 person scrolls past your LinkedIn post 3 times, that counts as 3 impressions.',
    benchmark: 'Higher impressions indicate good platform algorithmic reach or frequent reposts.',
    howToImprove: 'Post during peak engagement windows (Tuesdays/Thursdays 10:00–11:30 AM) and use clear visual media or carousel cards.',
    portalLocation: 'Social Media Overview & LinkedIn Detailed View',
    portalLink: '/dashboard/social-media',
  },
  {
    id: 'reach',
    term: 'Reach (Unique Views)',
    category: 'social',
    shortDefinition: 'The number of unique individual accounts who actually saw your content.',
    detailedExplanation: 'Unlike impressions (which can count repeats), reach measures unique people. If 1 person sees your post 5 times, reach is 1, but impressions is 5.',
    benchmark: 'Reach / Impressions ratio shows audience breadth vs repeat exposure.',
    howToImprove: 'Encourage team reposts and tag relevant community partners to expose content to new networks.',
    portalLocation: 'Social Media Overview & Campaign Performance',
    portalLink: '/dashboard/campaigns',
  },
  {
    id: 'engagement_rate',
    term: 'Engagement Rate (%)',
    category: 'social',
    shortDefinition: 'The percentage of people who interacted with your post after seeing it.',
    detailedExplanation: 'Interactions include likes/reactions, comments, shares, and link clicks. A high engagement rate proves your content resonates with the audience.',
    formula: '(Total Reactions + Comments + Shares + Clicks) / Total Impressions × 100',
    benchmark: 'LinkedIn B2B: 2.0% - 4.5% is good, >5% is exceptional. Reddit: >4% is strong.',
    howToImprove: 'End posts with an open question, share real technical candidate case studies, or showcase interactive demo clips.',
    portalLocation: 'Social Media Overview, LinkedIn & Reddit Views',
    portalLink: '/social-media/linkedin',
  },
  {
    id: 'cpc',
    term: 'Cost Per Click (CPC)',
    category: 'campaigns',
    shortDefinition: 'The average advertising or distribution cost spent for each user click.',
    detailedExplanation: 'Helps determine whether your paid or promoted campaigns are cost-effective at driving traffic to candidate showcase rooms or signup pages.',
    formula: 'Total Campaign Spend ($) / Total Clicks Generated',
    benchmark: 'B2B Tech & Recruiting: $3.00 - $7.00 per qualified click is typical.',
    howToImprove: 'Refine target audience job titles and test compelling copy hooks to increase click-through rates (CTR).',
    portalLocation: 'Campaign ROI Dashboard',
    portalLink: '/dashboard/campaigns',
  },
  {
    id: 'cps',
    term: 'Cost Per Signup (CPS / CAC)',
    category: 'campaigns',
    shortDefinition: 'The average amount spent to acquire one registered candidate or hiring company.',
    detailedExplanation: 'This is the golden metric for marketing efficiency. It measures bottom-funnel conversion directly from marketing spend.',
    formula: 'Total Campaign Spend ($) / Total Completed Signups',
    benchmark: 'Target CPS for qualified tech candidates: <$35.00.',
    howToImprove: 'Streamline signup friction, offer immediate access to showcase rooms, and align ad messaging directly with landing page value.',
    portalLocation: 'Campaign ROI Dashboard',
    portalLink: '/dashboard/campaigns',
  },
  {
    id: 'roi_multiplier',
    term: 'ROI Multiplier',
    category: 'campaigns',
    shortDefinition: 'The conversion efficiency ratio comparing acquired signups and estimated pipeline value against spend.',
    detailedExplanation: 'Displays how many multiples of pipeline value or signups your marketing dollars produced.',
    formula: '(Total Signups × Est. Lifetime Value - Total Spend) / Total Spend',
    benchmark: '>1.0 means net positive return on marketing capital.',
    portalLocation: 'Campaign Performance Details',
    portalLink: '/dashboard/campaigns',
  },
  {
    id: 'click_timing',
    term: 'Peak Click Timing (6am - 12am)',
    category: 'email',
    shortDefinition: 'Hourly breakdown revealing the exact times recipients click links in your emails.',
    detailedExplanation: 'Mailgun timestamp telemetry groups clicks into hourly buckets. Knowing when your recipients are most active allows you to schedule automated sequences right before peak engagement spikes.',
    benchmark: 'Tech recruiters and engineering managers frequently peak at 10:00 AM - 11:30 AM and 2:00 PM - 3:30 PM.',
    howToImprove: 'Adjust automated sequence trigger schedules to deliver 30 minutes before your peak hourly spike.',
    portalLocation: 'Enhanced Email Analytics',
    portalLink: '/email/detailed',
  },
  {
    id: 'click_heatmap',
    term: 'Link Density & Heatmap',
    category: 'email',
    shortDefinition: 'Visual distribution of which links and call-to-actions inside your email get clicked most.',
    detailedExplanation: 'Shows the percentage share of clicks across the Primary CTA, Secondary links, Showcase Room previews, and Footers.',
    benchmark: 'The primary CTA above the fold should capture >60% of all email clicks.',
    howToImprove: 'Place your single most important action in a high-contrast button above the email fold.',
    portalLocation: 'Enhanced Email Analytics (Heatmap Tab)',
    portalLink: '/email/detailed',
  },
  {
    id: 'upvote_ratio',
    term: 'Reddit Upvote Ratio',
    category: 'social',
    shortDefinition: 'The percentage of positive upvotes vs downvotes on your Reddit community posts.',
    detailedExplanation: 'A high upvote ratio (>90%) signals genuine community value, whereas lower ratios (<70%) indicate the post was perceived as overly promotional or spammy.',
    formula: 'Upvotes / (Upvotes + Downvotes) × 100',
    benchmark: 'Target >85% upvote ratio for successful developer community discussions.',
    howToImprove: 'Focus on transparent data, engineering learnings, and open-source contributions rather than direct sales pitches.',
    portalLocation: 'Reddit Community View',
    portalLink: '/social-media/reddit',
  },
  {
    id: 'showcase_rooms',
    term: 'Showcase Room Telemetry',
    category: 'rooms',
    shortDefinition: 'Interactive 3D candidate evaluation rooms where employers test candidate portfolios live.',
    detailedExplanation: 'Measures live session duration, interactive code demo executions, and employer candidate shortlisting rates directly in the platform.',
    benchmark: 'Average room session duration >4.5 minutes correlates with 3x higher interview offers.',
    portalLocation: 'Room Insights (Engagement & Media)',
    portalLink: '/dashboard/rooms',
  },
  {
    id: 'sync_status',
    term: 'Background Sync Status',
    category: 'general',
    shortDefinition: 'Real-time heartbeat indicator showing when data was last pulled from LinkedIn, Reddit, Buffer, and Mailgun.',
    detailedExplanation: 'Automated background cron jobs run on intervals (15m to 6h). The live indicator allows manual sync triggers on demand.',
    portalLocation: 'Top toolbar of all Marketing & Analytics views',
    portalLink: '/dashboard/social-media',
  },
];

export const PORTAL_TOUCHPOINTS: PortalTouchpoint[] = [
  {
    id: 'tp_overview',
    title: 'Social Media Overview',
    subtitle: 'High-level multi-channel executive pulse',
    icon: 'Share2',
    route: '/dashboard/social-media',
    badge: 'Marketing',
    description: 'Central hub for monitoring multi-platform organic traction. Aggregates weekly totals for LinkedIn, Reddit, and Buffer with a 4-week historical trendline and searchable posts database.',
    keyMetrics: ['Total Posts Published', 'Total Engagement', 'Avg Engagement Rate (%)', 'Top Performing Platform'],
    bestFor: 'Daily morning standups and cross-channel performance tracking.',
    proTips: [
      'Use the Date Range filter (7d, 30d, 90d) to isolate recent campaign surges.',
      'Click any post row to open the full hourly engagement breakdown modal.',
      'Click "Export CSV" to pull all post performance numbers into Excel or Google Sheets.',
    ],
  },
  {
    id: 'tp_linkedin',
    title: 'LinkedIn Organic Analytics',
    subtitle: 'B2B audience demographics & 48h velocity',
    icon: 'Share2',
    route: '/social-media/linkedin',
    badge: 'B2B Growth',
    description: 'Detailed analytics for TalentBridge LinkedIn company page. Features 48-hour impression velocity curve, job title and seniority breakdown, company size distributions, and AI posting recommendations.',
    keyMetrics: ['48h Hourly Velocity', 'Top Job Titles (e.g. Hiring Managers)', 'Company Sizes', 'Best Posting Time Recommendation'],
    bestFor: 'Optimizing B2B content strategy and targeting talent acquisition decision-makers.',
    proTips: [
      'Check the AI Strategy card for the recommended best day and time to publish.',
      'Review Job Title percentages to confirm content reaches Hiring Managers rather than only students.',
    ],
  },
  {
    id: 'tp_reddit',
    title: 'Reddit Community Intelligence',
    subtitle: 'Developer sentiment & viral discussion tracking',
    icon: 'MessageSquare',
    route: '/social-media/reddit',
    badge: 'Community',
    description: 'Monitors developer discussions and viral threads across tech and recruiting subreddits (r/TalentBridge, r/Recruiting, r/hiring). Tracks karma scores, upvote ratios, and comment velocity.',
    keyMetrics: ['Karma Score', 'Total Comments', 'Upvote Ratio (%)', 'Viral Posts Count (>500 score)'],
    bestFor: 'Tracking technical community sentiment and developer advocate reach.',
    proTips: [
      'Posts with >90% upvote ratio make great candidates for LinkedIn cross-reposting.',
      'Watch comment spikes to join live discussions and answer candidate questions early.',
    ],
  },
  {
    id: 'tp_campaigns',
    title: 'Campaign ROI & Multi-Touch Attribution',
    subtitle: 'Budget allocation, spend, CPC & candidate signups',
    icon: 'Target',
    route: '/dashboard/campaigns',
    badge: 'ROI & Spend',
    description: 'End-to-end campaign tracking across Email, LinkedIn, and Reddit. Compares budgeted dollars against realized candidate signups, Cost Per Click (CPC), and Cost Per Signup (CPS).',
    keyMetrics: ['Total Spend vs Budget', 'Total Signups', 'Signup Conversion Rate (%)', 'Cost Per Signup (CPS)', 'Channel Share'],
    bestFor: 'Executive ROI reviews and paid/promoted marketing allocation decisions.',
    proTips: [
      'Click "Export Report" inside any campaign to generate an executive-ready multi-channel CSV summary.',
      'Use the ComposedChart to identify which campaign day yielded the highest signup surge.',
    ],
  },
  {
    id: 'tp_email',
    title: 'Enhanced Email & Delivery Telemetry',
    subtitle: 'Click timing heatmaps & conversion journeys',
    icon: 'Mail',
    route: '/email/detailed',
    badge: 'Mailgun v2',
    description: 'Deep dive into transactional and marketing email sequences. Features hourly click timing distribution (6am-12am), device breakdown (Desktop/Mobile/Tablet), client rendering, and click-to-signup conversion funnel.',
    keyMetrics: ['Delivery & Open Rate (%)', 'Peak Click Timing Hour', 'Device Breakdown', 'Click-to-Signup Conversion Rate (%)'],
    bestFor: 'Refining email copywriting, CTA placement, and sequence delivery schedules.',
    proTips: [
      'Check the Device Breakdown card before designing complex multi-column email layouts.',
      'Align scheduled Mailgun sends to fire 30 minutes before your peak click timing window.',
    ],
  },
  {
    id: 'tp_funnel',
    title: 'Product & Onboarding Funnel',
    subtitle: 'User drop-off stages and activation bottlenecks',
    icon: 'TrendingDown',
    route: '/dashboard/funnel',
    badge: 'Core Analytics',
    description: 'Tracks user progression from initial landing through signup, room creation, and first hire assessment. Highlights conversion percentages and critical drop-off stages.',
    keyMetrics: ['Stage Conversion (%)', 'Drop-off Volume', 'Time to Next Stage'],
    bestFor: 'Product managers and growth teams fixing registration and activation bottlenecks.',
    proTips: [
      'Focus optimization on any step with >40% drop-off rate.',
      'Combine funnel drop-off insights with user lookup to inspect individual user journeys.',
    ],
  },
];

export const PLAYBOOKS: PlaybookItem[] = [
  {
    id: 'pb_weekly_review',
    title: 'Weekly Executive Marketing Review Playbook',
    summary: 'A 5-minute routine to evaluate all marketing channels and report KPI health to executive leadership.',
    category: 'Executive Routine',
    timeToComplete: '5 - 10 mins',
    steps: [
      {
        stepNumber: 1,
        title: 'Open Social Media Overview',
        instruction: 'Navigate to Engagement & Media → Social Media → Overview. Verify the 4-week engagement trend is positive.',
        tip: 'Click "Sync Now" if you want to ensure the latest morning numbers are loaded.',
      },
      {
        stepNumber: 2,
        title: 'Check LinkedIn Demographics',
        instruction: 'Navigate to LinkedIn Organic. Inspect the Top Job Titles chart to confirm hiring managers and decision-makers represent >35% of viewers.',
      },
      {
        stepNumber: 3,
        title: 'Inspect Campaign ROI & Costs',
        instruction: 'Go to Campaign ROI. Check active campaigns and verify Cost Per Signup (CPS) remains under the $35 target.',
      },
      {
        stepNumber: 4,
        title: 'Export Performance Report',
        instruction: 'Click "Export Report" on the active campaign page to download a clean CSV for the leadership summary deck.',
      },
    ],
  },
  {
    id: 'pb_email_optimization',
    title: 'Email Sequence Timing & CTA Optimization',
    summary: 'How to use Mailgun click telemetry to boost open and click-through rates on automated sequences.',
    category: 'Email Strategy',
    timeToComplete: '5 mins',
    steps: [
      {
        stepNumber: 1,
        title: 'View Enhanced Email Analytics',
        instruction: 'Go to Engagement & Media → Email Campaigns → Timing & Heatmap.',
      },
      {
        stepNumber: 2,
        title: 'Identify Peak Click Hours',
        instruction: 'Look at the "Click Timing Analysis (6am - 12am)" bar chart. Note the highest bar (e.g. 10:00 AM).',
        tip: 'Ensure your timezone in the top toolbar matches your primary recipient market (e.g. EST or PST).',
      },
      {
        stepNumber: 3,
        title: 'Adjust Sequence Dispatch Schedule',
        instruction: 'In your email delivery settings, set sequence dispatch to 30 minutes before peak (e.g., 9:30 AM).',
      },
      {
        stepNumber: 4,
        title: 'Review Heatmap Link Density',
        instruction: 'Check the email link visual layout. Confirm your primary CTA button receives at least 60% of total clicks.',
      },
    ],
  },
  {
    id: 'pb_launch_campaign',
    title: 'Launching & Tracking a Multi-Channel Sprint',
    summary: 'Step-by-step guidance on setting up, budgeting, and measuring cross-platform campaign attribution.',
    category: 'Campaign Management',
    timeToComplete: '10 mins',
    steps: [
      {
        stepNumber: 1,
        title: 'Define Goal & Channels',
        instruction: 'Navigate to Campaign ROI and click "New Campaign". Enter your campaign title, budget, target audience, and select channels (Email, LinkedIn, Reddit).',
      },
      {
        stepNumber: 2,
        title: 'Tag Social Posts & Sequences',
        instruction: 'When publishing through Buffer or Mailgun, include the campaign UTM tags or select the campaign ID in the post composer.',
      },
      {
        stepNumber: 3,
        title: 'Monitor Daily Timeline',
        instruction: 'Inspect the ComposedChart on the campaign page. Watch how daily reach turns into cumulative candidate signups.',
      },
    ],
  },
];

export const BOT_QUICK_PROMPTS: BotQuickPrompt[] = [
  {
    id: 'qp_er',
    label: 'What is a good engagement rate?',
    query: 'What is considered a good engagement rate on LinkedIn and Reddit, and how is it calculated?',
    category: 'basics',
  },
  {
    id: 'qp_cps',
    label: 'How is Cost Per Signup calculated?',
    query: 'How is Cost Per Signup (CPS) calculated and what is our target benchmark for talent acquisition?',
    category: 'calculations',
  },
  {
    id: 'qp_email_timing',
    label: 'How do I use the Email Timing chart?',
    query: 'How do I interpret the Email Click Timing chart to pick the best time to send marketing emails?',
    category: 'email',
  },
  {
    id: 'qp_heatmap',
    label: 'What does the Email Heatmap tell me?',
    query: 'What does the Email Click Location Heatmap show, and what should I do if clicks are too dispersed?',
    category: 'email',
  },
  {
    id: 'qp_reddit',
    label: 'Why is Reddit upvote ratio important?',
    query: 'Why does the Reddit Upvote Ratio matter for developer marketing, and how do I improve it?',
    category: 'basics',
  },
  {
    id: 'qp_export',
    label: 'How do I export campaign reports?',
    query: 'How do I export campaign reports to CSV or Excel for stakeholders?',
    category: 'strategy',
  },
  {
    id: 'qp_sync',
    label: 'How often does data sync automatically?',
    query: 'How often does data sync from LinkedIn, Reddit, Buffer, and Mailgun, and can I sync manually?',
    category: 'basics',
  },
  {
    id: 'qp_roi',
    label: 'Explain the ROI Multiplier metric',
    query: 'What does the ROI Multiplier metric mean on the Campaign dashboard and how is it measured?',
    category: 'calculations',
  },
];

export function answerHelpBotQuery(question: string): {
  answer: string;
  relatedTerms: string[];
  suggestedAction?: { label: string; link: string };
} {
  const q = question.toLowerCase().trim();

  // 1. Engagement Rate
  if (q.includes('engagement') || q.includes('er') || (q.includes('rate') && q.includes('social'))) {
    return {
      answer: `**Engagement Rate** measures how effectively your content captures attention and drives action from people who see it.\n\n` +
        `• **How it's calculated**: \`((Reactions + Comments + Shares + Clicks) / Impressions) × 100\`\n` +
        `• **What good looks like**: On LinkedIn B2B, **2.0% – 4.5%** is healthy, and **>5.0%** is top-tier. On Reddit, **>4.0%** with high comment volume signals strong organic community resonance.\n\n` +
        `💡 **Recommended Action**: If your rate dips below 2.5%, share real candidate case studies, include interactive 3D showcase demo links, and end posts with an open question.`,
      relatedTerms: ['Engagement Rate (%)', 'Impressions', 'Reach (Unique Views)', 'Reddit Upvote Ratio'],
      suggestedAction: { label: 'Explore Social Media Overview', link: '/dashboard/social-media' },
    };
  }

  // 2. Cost Per Signup / CAC
  if (q.includes('cps') || q.includes('cost per signup') || q.includes('cac') || q.includes('acquisition cost')) {
    return {
      answer: `**Cost Per Signup (CPS)** is your core marketing efficiency metric: the exact amount spent to acquire one registered candidate or hiring company.\n\n` +
        `• **How it's calculated**: \`Total Campaign Spend ($) / Total Attributed Signups\`\n` +
        `• **What good looks like**: Our target benchmark for technical talent acquisition is **<$35.00** per verified signup.\n\n` +
        `💡 **Recommended Action**: Review your multi-channel breakdown on the Campaign ROI dashboard. If LinkedIn or Reddit shows lower CPS than email outreach, reallocate budget to the higher-yield channel.`,
      relatedTerms: ['Cost Per Signup (CPS)', 'Cost Per Click (CPC)', 'ROI Multiplier'],
      suggestedAction: { label: 'Open Campaign ROI Dashboard', link: '/dashboard/campaigns' },
    };
  }

  // 3. Cost Per Click (CPC)
  if (q.includes('cpc') || q.includes('cost per click') || q.includes('click cost')) {
    return {
      answer: `**Cost Per Click (CPC)** measures how much you pay on average for each candidate or recruiter who clicks through to your landing page or showcase room.\n\n` +
        `• **How it's calculated**: \`Total Campaign Spend ($) / Total Link Clicks\`\n` +
        `• **What good looks like**: In B2B tech recruiting, **$3.00 – $6.50** is typical for qualified technical traffic.\n\n` +
        `💡 **Recommended Action**: Pair high-performing copy hooks with targeted job-title filters to raise your Click-Through Rate (CTR), which naturally brings down your CPC.`,
      relatedTerms: ['Cost Per Click (CPC)', 'Cost Per Signup (CPS)', 'Engagement Rate (%)'],
      suggestedAction: { label: 'Review Campaign Performance', link: '/dashboard/campaigns' },
    };
  }

  // 4. Email Timing & Sending Strategy
  if (q.includes('timing') || q.includes('when') || q.includes('hour') || (q.includes('email') && q.includes('send'))) {
    return {
      answer: `The **Email Click Timing Curve** reveals the exact hours your recipients open and interact with links in your outreach emails.\n\n` +
        `• **Key Insight**: Link clicks concentrate heavily between **10:00 AM – 11:30 AM** and **2:00 PM – 3:30 PM** local recipient time.\n` +
        `• **The Golden Rule**: Schedule automated sequences to dispatch **30 minutes prior to peak activity** (e.g. 9:30 AM) so your message sits at the top of their inbox when they triage.\n\n` +
        `💡 **Recommended Action**: Switch the Timezone dropdown in the toolbar to match your primary target region (e.g., EST or PST) before reviewing send timing.`,
      relatedTerms: ['Peak Click Timing', 'Email Link Heatmap', 'Device Breakdown'],
      suggestedAction: { label: 'Inspect Email Timing & Devices', link: '/email/detailed' },
    };
  }

  // 5. Email Link Heatmap & Density
  if (q.includes('heatmap') || q.includes('link') || q.includes('density') || q.includes('cta')) {
    return {
      answer: `The **Email Click Location Heatmap** visualizes which links, buttons, and demo previews capture user attention inside your email layouts.\n\n` +
        `• **Target Distribution**: Your **Primary CTA Button** above the fold should capture **>60%** of all clicks.\n` +
        `⚡ *Manual Sync*: You can click the **Sync pulse button** in the top toolbar on any marketing view to trigger an immediate live refresh at any time.`,
      relatedTerms: ['Background Sync Status', 'Sync Logs'],
      suggestedAction: { label: 'Go to Social Media Overview', link: '/dashboard/social-media' },
    };
  }

  if (q.includes('export') || q.includes('csv') || q.includes('report') || q.includes('download')) {
    return {
      answer: `You can export data across all views into standardized CSV files for Excel, Google Sheets, or executive slide decks:\n\n` +
        `1. **Campaign ROI**: Click **"Export Report"** on any campaign page for a multi-channel breakdown.\n` +
        `2. **Social Media Posts**: Click **"Export CSV"** on the Overview, LinkedIn, or Reddit views.\n` +
        `3. **Email Telemetry**: Click **"Export CSV"** on the Enhanced Email view.`,
      relatedTerms: ['Cost Per Signup (CPS)', 'ROI Multiplier'],
      suggestedAction: { label: 'View Campaigns List', link: '/dashboard/campaigns' },
    };
  }

  if (q.includes('room') || q.includes('3d') || q.includes('showcase')) {
    return {
      answer: `**TalentBridge Showcase Rooms** are interactive 3D candidate evaluation environments where recruiters and tech leads assess developer code, technical presentations, and project telemetry live.\n\n` +
        `• **Average Session Duration**: >4.5 minutes correlates with 3x higher interview pass rates.\n` +
        `• **Employer Action Rates**: Tracks live shortlisting and feedback clicks during demo sessions.`,
      relatedTerms: ['Showcase Room Telemetry', 'Conversion Funnel'],
      suggestedAction: { label: 'Explore Room Insights', link: '/dashboard/rooms' },
    };
  }

  // Fallback comprehensive response
  return {
    answer: `TalentBridge Marketing & Admin Intelligence helps both technical and non-technical team members monitor organic social reach, email delivery, 3D room evaluations, and cross-channel campaign ROI.\n\n` +
      `• **To track Social Media**: Visit \`/dashboard/social-media\` for LinkedIn, Reddit, and Buffer metrics.\n` +
      `• **To track Campaign ROI**: Visit \`/dashboard/campaigns\` to inspect budget, CPC, and Cost Per Signup.\n` +
      `• **To optimize Email Timing**: Visit \`/email/detailed\` to see peak click hours (6am-12am) and link heatmaps.\n\n` +
      `💡 Feel free to ask specific questions about any marketing term (e.g. *CPC*, *CPS*, *Engagement Rate*, *Heatmap*, *Upvote Ratio*).`,
    relatedTerms: ['Engagement Rate (%)', 'Cost Per Signup (CPS)', 'Peak Click Timing', 'Showcase Room Telemetry'],
    suggestedAction: { label: 'Explore Knowledge Glossary', link: '/help/guide' },
  };
}
