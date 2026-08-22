// src/tests/redditService.test.ts
// Unit and integration test for Reddit API Service, post parsing, viral scoring, and engagement metrics

import { redditService } from '../services/redditService.js';
import { REDDIT_SUBREDDITS, REDDIT_CONFIG } from '../config/redditConfig.js';
import type { RedditPostData } from '../types/reddit.js';

async function runRedditServiceVerification() {
  console.log('🧪 Starting Reddit Service Verification...\n');

  // Test 1: Configuration & Subreddit verification
  console.log('Test 1: Testing Reddit Config & Subreddits List');
  if (!Array.isArray(REDDIT_SUBREDDITS) || REDDIT_SUBREDDITS.length < 4) {
    throw new Error('REDDIT_SUBREDDITS is not properly configured with required subreddits!');
  }
  console.log(`  ✓ Configured subreddits (${REDDIT_SUBREDDITS.length}): ${REDDIT_SUBREDDITS.join(', ')}`);
  console.log(`  ✓ Viral score threshold: ${REDDIT_CONFIG.VIRAL_SCORE_THRESHOLD}`);

  // Test 2: OAuth Token Retrieval
  console.log('\nTest 2: Testing getRedditAccessToken');
  const token = await redditService.getRedditAccessToken();
  if (!token || typeof token !== 'string') {
    throw new Error('getRedditAccessToken failed to return a valid token!');
  }
  console.log(`  ✓ getRedditAccessToken returned token: ${token.slice(0, 25)}...`);

  // Test 3: fetchRedditPosts
  console.log('\nTest 3: Testing fetchRedditPosts');
  const posts = await redditService.fetchRedditPosts();
  if (!Array.isArray(posts) || posts.length === 0) {
    throw new Error('fetchRedditPosts returned no posts!');
  }
  console.log(`  ✓ fetchRedditPosts returned ${posts.length} posts from configured subreddits`);

  // Test 4: parseRedditPost & Viral Detection
  console.log('\nTest 4: Testing parseRedditPost & Viral Detection');
  const sampleViralPost: RedditPostData = posts[0];
  const parsedViral = redditService.parseRedditPost(sampleViralPost);

  if (
    !parsedViral.platform_post_id.startsWith('rd_') ||
    parsedViral.platform !== 'reddit' ||
    !parsedViral.reddit_subreddit.startsWith('r/') ||
    !(parsedViral.posted_at instanceof Date) ||
    typeof parsedViral.is_viral !== 'boolean'
  ) {
    throw new Error('parseRedditPost failed to extract expected fields!');
  }

  console.log('  ✓ parseRedditPost successfully extracted:');
  console.log(`     - Platform: ${parsedViral.platform}`);
  console.log(`     - Subreddit: ${parsedViral.reddit_subreddit}`);
  console.log(`     - Title/Content Preview: "${parsedViral.content_text.slice(0, 60)}..."`);
  console.log(`     - Link: ${parsedViral.link_url}`);
  console.log(`     - Score: ${sampleViralPost.score}`);
  console.log(`     - Is Viral (>100): ${parsedViral.is_viral ? '🔥 YES' : 'NO'}`);
  console.log(`     - Posted At: ${parsedViral.posted_at.toISOString()}`);

  if (sampleViralPost.score >= 100 && !parsedViral.is_viral) {
    throw new Error('Post with score >= 100 was not marked as viral!');
  }

  // Test 5: Full Sync Orchestration (syncRedditData)
  console.log('\nTest 5: Testing Full Sync Orchestration (syncRedditData)');
  const syncResult = await redditService.syncRedditData();
  console.log(`  ✓ syncRedditData completed: ${syncResult.syncedCount} posts synced, ${syncResult.viralCount} viral posts detected, ${syncResult.errors.length} errors`);
  if (syncResult.syncedCount === 0) {
    throw new Error('syncRedditData processed 0 posts!');
  }

  console.log('\n🎉 ALL REDDIT SERVICE TESTS PASSED SUCCESSFULLY!');
}

runRedditServiceVerification().catch((err) => {
  console.error('❌ Reddit service verification failed:', err);
  process.exit(1);
});
