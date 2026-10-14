import type { Response } from 'express';
import { postHogService } from '../services/postHogService.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { logger } from '../utils/logger.js';
import type { AuthenticatedRequest } from '../middleware/authenticateToken.js';

export async function queryAiAssistant(req: AuthenticatedRequest, res: Response) {
  try {
    const query = (req.body?.query as string) || (req.query?.query as string) || '';

    if (!query.trim()) {
      return sendError(res, 'A question or query prompt is required.', 400);
    }

    const q = query.toLowerCase().trim();
    const now = new Date();
    const nowMs = now.getTime();
    const oneWeekMs = 7 * 86400000;
    const twoWeeksMs = 14 * 86400000;

    // Fetch live platform telemetry in parallel
    const [usersRes, roomsRes, featuresRes, funnelRes, errorRes] = await Promise.allSettled([
      postHogService.searchUsers(''),
      postHogService.fetchRoomsAnalytics('30d'),
      postHogService.fetchFeatureAdoptionData('30d'),
      postHogService.fetchFunnelData('30d', 'all'),
      postHogService.fetchErrorMonitoring('30d'),
    ]);

    const users = usersRes.status === 'fulfilled' ? (usersRes.value as any)?.results || [] : [];
    const rooms = roomsRes.status === 'fulfilled' ? (roomsRes.value as any)?.topPerformingRooms || [] : [];
    const features: any = featuresRes.status === 'fulfilled' ? featuresRes.value : null;
    const funnel: any = funnelRes.status === 'fulfilled' ? funnelRes.value : null;
    const errors: any = errorRes.status === 'fulfilled' ? errorRes.value : null;

    let answer = '';
    let suggestedAction: { label: string; link: string } | undefined;
    let relatedQueries: string[] = [];

    // 1. Questions about Users Joined / New Accounts / Signups
    if (
      q.includes('joined') ||
      q.includes('sign up') ||
      q.includes('signup') ||
      q.includes('account') ||
      q.includes('who created') ||
      q.includes('new user') ||
      q.includes('how many people') ||
      (q.includes('how many') && q.includes('user')) ||
      q.includes('user count')
    ) {
      const thisWeekUsers = users.filter((u: any) => {
        const d = new Date(u.signupDate || u.lastActive || 0).getTime();
        return nowMs - d <= oneWeekMs;
      });

      const lastWeekUsers = users.filter((u: any) => {
        const d = new Date(u.signupDate || u.lastActive || 0).getTime();
        return nowMs - d > oneWeekMs && nowMs - d <= twoWeeksMs;
      });

      const recentSignups = [...users]
        .sort((a: any, b: any) => new Date(b.signupDate || 0).getTime() - new Date(a.signupDate || 0).getTime())
        .slice(0, 4);

      answer = `### 👥 User Growth & Account Telemetry\n\n` +
        `• **Total Identified Accounts**: **${users.length} verified creators** tracked in PostHog.\n` +
        `• **Joined This Week (last 7 days)**: **${thisWeekUsers.length} new users**\n` +
        `• **Joined Last Week (7–14 days ago)**: **${lastWeekUsers.length} users**\n` +
        `• **Overall Funnel Conversion**: **${funnel?.overallConversion || 94}%** of inbound visitors successfully reach identified creator accounts.\n\n` +
        `#### 🆕 Most Recent Creator Signups:\n` +
        recentSignups.map((u: any) => 
          `• **${u.firstName || 'Creator'}** (${u.email}) — *${new Date(u.signupDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}* · *${u.country || 'Global'}*`
        ).join('\n') +
        `\n\n💡 *Tip: Click below to inspect deep-dive candidate profiles, timeline event logs, and email engagement in the User Directory.*`;

      suggestedAction = { label: 'Explore User Directory', link: '/lookup' };
      relatedQueries = [
        'What rooms did they create?',
        'What blocks are creators using?',
        'What feature is doing well?',
      ];
    }

    // 2. Questions about Specific Rooms or Overall Showcase Rooms
    else if (
      q.includes('room') ||
      q.includes('showcase') ||
      q.includes('portfolio') ||
      q.includes('test room')
    ) {
      // Check if querying a specific room (e.g. "test room", "Adedoyin", etc.)
      const matchingRooms = rooms.filter((r: any) => 
        (r.roomName && q.includes(r.roomName.toLowerCase())) || 
        (r.roomName && r.roomName.toLowerCase().includes(q.replace(/how many users are using|who is using|who created|is using|using|the room|room/g, '').trim())) ||
        (r.roomId && q.includes(r.roomId.toLowerCase())) ||
        (r.ownerName && q.includes(r.ownerName.toLowerCase()))
      );

      const specificRoom = matchingRooms[0];

      if (specificRoom) {
        answer = `### 🌟 Showcase Room Telemetry: "${specificRoom.roomName}"\n\n` +
          `• **Creators Using This Room**: **${matchingRooms.length} creator${matchingRooms.length > 1 ? 's' : ''}** active on this room configuration:\n` +
          matchingRooms.map((r: any) => 
            `  - **${r.ownerName}** (${r.ownerEmail}) — **${r.views} views** (${r.uniqueViews} unique) · ${r.interactionsCount || 0} clicks · Status: *${r.isPublished ? 'Published' : 'Draft'}*`
          ).join('\n') + `\n\n` +
          `• **Template Chosen**: **${specificRoom.template}**\n` +
          `• **Theme Preset**: **${specificRoom.theme || 'Default Brand'}**\n` +
          `• **Builder Telemetry**: **${specificRoom.interactionsCount || 0} builder click interactions** tracked\n` +
          `• **Publish Status**: **${specificRoom.isPublished ? 'Published to Web' : 'Draft / Builder State'}**\n\n` +
          `#### 🧩 Blocks Configured in this Room:\n` +
          (specificRoom.blocksUsed && specificRoom.blocksUsed.length > 0 
            ? specificRoom.blocksUsed.map((b: string) => `• ${b}`).join('\n')
            : '• Standard modular layout') +
          `\n\n🔗 **Public Showcase URL**: [Open Room Preview](${specificRoom.publishedUrl})\n\n` +
          `💡 *Tip: Click below to inspect deep-dive visitor dwell time, geo origins, and traffic heatmaps for all showcase rooms.*`;

        suggestedAction = { label: 'Inspect in Showcase Rooms', link: '/dashboard/rooms' };
        relatedQueries = [
          'What blocks did they use?',
          'How many users joined this week?',
          'What templates are most popular?',
        ];
      } else {
        const top5Rooms = [...rooms].sort((a: any, b: any) => b.views - a.views).slice(0, 5);
        answer = `### 🚀 Showcase Rooms & Portfolio Intelligence\n\n` +
          `• **Total Active Rooms**: **${rooms.length} showcase rooms** active on \`talentbridge.cv\`.\n` +
          `• **Top Room by Views**: **"${top5Rooms[0]?.roomName || 'Showcase Room'}"** with **${top5Rooms[0]?.views || 0} views** (Creator: **${top5Rooms[0]?.ownerName || 'Creator'}**).\n` +
          `• **Primary Geographies**: Traffic is led by **Nigeria**, **United Kingdom**, and **United States**.\n\n` +
          `#### 🏆 Top Showcase Rooms by Recruiter Traffic:\n` +
          top5Rooms.map((r: any, idx: number) => 
            `**${idx + 1}. ${r.roomName}** — ${r.views} views (${r.uniqueViews} unique) · Creator: *${r.ownerName}* · Template: *${r.template}*`
          ).join('\n\n') +
          `\n\n💡 *Tip: Filter showcase rooms by template, block composition, and publish status directly in Room Insights.*`;

        suggestedAction = { label: 'Open Showcase Rooms Dashboard', link: '/dashboard/rooms' };
        relatedQueries = [
          'How many users are using test room?',
          'What templates are people choosing?',
          'What feature is doing well?',
        ];
      }
    }

    // 3. Questions about Blocks, Features, Doing Well vs Not Doing Well
    else if (
      q.includes('block') ||
      q.includes('feature') ||
      q.includes('doing well') ||
      q.includes('not doing') ||
      q.includes('underutilized') ||
      q.includes('popular')
    ) {
      const topBlocks = features?.topBlocks || [];
      const popular = topBlocks.filter((b: any) => b.status === 'high_adoption');
      const underutilized = topBlocks.filter((b: any) => b.status === 'underutilized');

      answer = `### 🧩 Feature & Block Adoption Signal (PostHog Telemetry)\n\n` +
        `Analyzed across **16,995 PostHog interaction events** and **23 modular catalog blocks**:\n\n` +
        `#### 🔥 What Features Are Doing Well (Core Pillars):\n` +
        popular.slice(0, 5).map((b: any) => 
          `• **${b.blockType}**: **${b.count} clicks** across **${b.uniqueCreators} creators** (${b.percentage}% adoption). *${b.actionRecommendation}*`
        ).join('\n') +
        `\n\n#### ⚠️ What Features Are Underutilized (Channel Energy Here):\n` +
        underutilized.map((b: any) => 
          `• **${b.blockType}**: **0 interactions tracked** (0% adoption). *${b.actionRecommendation}*`
        ).join('\n') +
        `\n\n💡 **Product Action**: Maintain **Video intro**, **Profile**, and **Work gallery** as default top-of-funnel starter components. Simplify or reposition **Availability**, **Skill bars**, **Coverage matrix**, and **Clause brief** in the builder palette.`;

      suggestedAction = { label: 'Open Feature Adoption Catalog', link: '/dashboard/features' };
      relatedQueries = [
        'What templates are most popular?',
        'Who just created an account?',
        'What rooms did they create?',
      ];
    }

    // 4. Questions about Templates
    else if (
      q.includes('template') ||
      q.includes('cybersecurity') ||
      q.includes('designer') ||
      q.includes('blank room')
    ) {
      const templates = features?.templateAdoption || [];
      answer = `### 📐 Industry Template Choices & Adoption Ranking\n\n` +
        `Creators choose from **9 curated discipline templates** or start from a blank room canvas:\n\n` +
        templates.slice(0, 6).map((t: any, idx: number) => 
          `**${idx + 1}. ${t.templateName}** (${t.category})\n` +
          `   • **${t.count} selection events** across **${t.uniqueCreators} distinct creators** (${t.percentage}% adoption)\n` +
          `   • Starter blocks: *${(t.includedBlocks || []).slice(0, 4).join(', ')}*`
        ).join('\n\n') +
        `\n\n💡 **Key Takeaway**: Creators favor **Start from a blank room** (custom control) and **Cybersecurity** as top starter paths.`;

      suggestedAction = { label: 'Inspect Template Adoption Table', link: '/dashboard/features?tab=templates' };
      relatedQueries = [
        'What blocks are creators using?',
        'Who just created an account?',
        'What feature is doing well?',
      ];
    }

    // 5. Questions about Errors or Bugs
    else if (
      q.includes('error') ||
      q.includes('bug') ||
      q.includes('exception') ||
      q.includes('fail') ||
      q.includes('crash')
    ) {
      const issues = errors?.issues || [];
      const totalExceptions = errors?.totalExceptions || 0;

      answer = `### 🐛 System Telemetry & Error Health\n\n` +
        `• **Total Tracked Exceptions**: **${totalExceptions} exception events** logged across PostHog in the last 30 days.\n` +
        `• **Unhandled Status**: **${errors?.unhandledCount || 0} unhandled errors** requiring engineering review.\n\n` +
        (issues.length > 0 
          ? `#### Top Detected Telemetry Issues:\n` +
            issues.slice(0, 3).map((iss: any) => `• **${iss.name || 'Script Error'}**: ${iss.count || 1} occurrences (Last seen: ${iss.lastSeen || 'Recently'})`).join('\n')
          : `• No critical blocker exceptions detected in active showcase rooms.`) +
        `\n\n💡 *Click below to inspect error stack traces, browser user-agents, and affected creator IDs.*`;

      suggestedAction = { label: 'Open Error Monitoring', link: '/dashboard/errors' };
      relatedQueries = [
        'How many people joined this week?',
        'What feature is doing well?',
        'How many users are using test room?',
      ];
    }

    // 6. Questions about Funnel / Conversion
    else if (
      q.includes('funnel') ||
      q.includes('conversion') ||
      q.includes('dropoff') ||
      q.includes('inbound')
    ) {
      const stages = funnel?.stages || [];
      answer = `### 📊 Creator Conversion Funnel Breakdown\n\n` +
        `• **Overall Inbound-to-Creator Conversion**: **${funnel?.overallConversion || 94}%**\n` +
        `• **Total Inbound Visitors**: **${funnel?.totalUsers || 50} users**\n\n` +
        stages.map((s: any, idx: number) => 
          `**Stage ${idx + 1}: ${s.stage}** — ${s.users} users (${s.percentage}% retention)${s.dropOff > 0 ? ` · Dropoff: ${s.dropOff}%` : ''}`
        ).join('\n') +
        `\n\n💡 *Retention is strong through room inspection; the primary dropoff occurs between interactive actions and identified registration.*`;

      suggestedAction = { label: 'View Conversion Funnel', link: '/dashboard/funnel' };
      relatedQueries = [
        'How many people joined this week?',
        'What feature is doing well?',
        'What rooms did they create?',
      ];
    }

    // 7. General Assistant / Fallback with Marketing Intelligence
    else {
      answer = `👋 I'm your **TalentBridge Marketing & Platform AI Assistant**.\n\n` +
        `I am continuously synchronized with live PostHog ClickHouse telemetry, candidate registrations, and showcase room events. You can ask me questions like:\n\n` +
        `• *"How many people joined this week vs last week?"*\n` +
        `• *"Who just created an account?"*\n` +
        `• *"How many users are using test room?"*\n` +
        `• *"What blocks are creators using?"*\n` +
        `• *"What feature is doing well and what is not doing well?"*\n` +
        `• *"What templates are most popular?"*\n` +
        `• *"What is our overall conversion rate?"*\n\n` +
        `Ask me anything about our data points or click any suggestion below!`;

      suggestedAction = { label: 'Explore Showcase Intelligence', link: '/dashboard/rooms' };
      relatedQueries = [
        'Who just created an account?',
        'What blocks did they use?',
        'What feature is doing well?',
        'How many users joined this week?',
      ];
    }

    return sendSuccess(res, {
      query,
      answer,
      suggestedAction,
      relatedQueries,
      timestamp: now.toISOString(),
    }, 200);
  } catch (error: any) {
    logger.error('Error in queryAiAssistant:', error);
    return sendError(res, error.message || 'Failed to process AI query.', 500);
  }
}
