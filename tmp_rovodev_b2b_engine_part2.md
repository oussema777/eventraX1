# 4. Scoring System

## 4.1 Weighted Score Calculation

**Formula:**
`
Final Score = Σ(Criterion_Score × Criterion_Weight) / Σ(Weights)
`

**Process:**
1. Calculate individual criterion scores (0-100)
2. Filter out null/zero scores
3. Multiply each score by its weight
4. Sum weighted scores
5. Divide by total weights
6. Round to integer (0-100)

**Example Calculation:**
`javascript
// Attendee A: FinTech Founder seeking investment
// Attendee B: VC Investor in FinTech

Criteria:
- Industry: 90% (FinTech match) × Weight 85 = 7,650
- Role: 95% (Investor-Founder) × Weight 60 = 5,700
- Stage: 70% (Seed vs Growth) × Weight 70 = 4,900
- Goals: 85% (fundraising) × Weight 80 = 6,800
- Interests: 60% (AI, blockchain) × Weight 90 = 5,400

Total Weighted: 30,450
Total Weights: 385
Final Score: 30,450 / 385 = 79%
`

## 4.2 Signal Detection

**hasSignal Flag:** Determines if a match has meaningful compatibility

**Conditions:**
- At least one criterion must have a positive score
- Total weighted score > 0
- Total weights > 0

**Fallback Behavior:**
- If hasSignal = false: Assigns random score (30-40%)
- If hasSignal = true: Uses calculated weighted score

**Why?** Prevents matches with zero data from scoring 0% (better UX)

## 4.3 Score Thresholding

**Minimum Match Score:** Configurable (default 75%)

**Application:**
- Only suggestions above threshold are saved
- **Exception:** If NO matches meet threshold, the best match is still included
- Ensures at least 1 suggestion exists if candidates exist

## 4.4 Metadata Generation

**Tags:** Quick-view highlights
`javascript
tags = [
  "Industry: FinTech",
  "Investor ↔ Founder pairing",
  "Goal: Fundraising",
  "Interest: AI",
  "Stage: Seed"
]
`

**Insights:** Natural language explanations
`javascript
insights = [
  "Both operate in FinTech, SaaS",
  "Investor ↔ Founder pairing",
  "Aligned on fundraising, partnerships",
  "Shared interests include AI, blockchain"
]
`

**Topics:** Conversation starters
`javascript
topics = ["fundraising", "partnerships", "AI", "blockchain"]
`

**Breakdown:** Criterion-by-criterion scores
`javascript
breakdown = [
  { key: 'industry', label: 'Industry Alignment', score: 90, detail: 'Both in FinTech' },
  { key: 'role', label: 'Job Role Compatibility', score: 95, detail: 'Investor ↔ Founder' },
  // ...
]
`

---

# 5. Suggestion Generation Process

## Function: generateSuggestions()

**Purpose:** Creates optimal pairings from attendee pool.

### 5.1 Pre-Processing

#### Step 1: Fetch Existing Data
`javascript
// Prevent duplicate suggestions
const existingSuggestions = await supabase
  .from('event_b2b_suggestions')
  .select('attendee_a_id, attendee_b_id, status')
  .eq('event_id', eventId);

const existingMeetings = await supabase
  .from('event_b2b_meetings')
  .select('attendee_a_id, attendee_b_id')
  .eq('event_id', eventId);

// Create blocked pairs set
const blockedPairs = new Set();
existingSuggestions.forEach(s => {
  const key = [s.attendee_a_id, s.attendee_b_id].sort().join(':');
  blockedPairs.add(key);
});
existingMeetings.forEach(m => {
  const key = [m.attendee_a_id, m.attendee_b_id].sort().join(':');
  blockedPairs.add(key);
});
`

#### Step 2: Apply Matching Mode Filter

**Mode 1: All Attendees** (matchingSelection = 'all')
- Uses entire attendee pool
- No filtering

**Mode 2: Opt-In Only** (matchingSelection = 'individuals')
- Filters to optIn = true attendees
- Fallback to all if none opted in

**Mode 3: Category-Based** (matchingSelection = 'category')
- Only matches within same category/ticket type
- E.g., VIP with VIP, Investor with Investor

### 5.2 Candidate Generation

**Algorithm:** Nested Loop (All Pairs)

`javascript
for (let i = 0; i < pool.length - 1; i++) {
  for (let j = i + 1; j < pool.length; j++) {
    const a = pool[i];
    const b = pool[j];
    
    // Skip if already matched
    const key = [a.id, b.id].sort().join(':');
    if (blockedPairs.has(key)) continue;
    
    // Category filter (if mode = 'category')
    if (matchingSelection === 'category') {
      if (a.category !== b.category) continue;
    }
    
    // Calculate match score
    const meta = buildMatchMeta(a, b);
    candidates.push({ a, b, score: meta.score, meta });
    
    // Apply threshold
    const threshold = meta.hasSignal ? minMatchScore : 0;
    if (meta.score >= threshold) {
      pairs.push({ a, b, score: meta.score, meta });
    }
  }
}
`

**Complexity:** O(n²) where n = attendee count
- 100 attendees: 4,950 comparisons
- 200 attendees: 19,900 comparisons
- 600 attendees (limit): 179,700 comparisons

### 5.3 Pair Selection & Balancing

**Goal:** Maximize total matches while distributing connections fairly

#### Step 1: Sort by Score
`javascript
pairs.sort((a, b) => b.score - a.score); // Highest first
`

#### Step 2: Calculate Limits
`javascript
const maxSuggestions = min(200, max(10, pool.length × 0.4));
const perAttendeeLimit = max(3, round(maxSuggestions / pool.length × 6));
`

**Examples:**
- 50 attendees: max 20 suggestions, 3 per person
- 100 attendees: max 40 suggestions, 3 per person
- 300 attendees: max 120 suggestions, 3 per person
- 500 attendees: max 200 suggestions, 3 per person

#### Step 3: Greedy Selection with Fair Distribution
`javascript
const attendeeCounts = {}; // Track matches per person
const picked = [];

for (const pair of pairs) {
  if (picked.length >= maxSuggestions) break;
  
  const aCount = attendeeCounts[pair.a.id] || 0;
  const bCount = attendeeCounts[pair.b.id] || 0;
  
  // Skip if either person has too many matches
  if (aCount >= perAttendeeLimit || bCount >= perAttendeeLimit) continue;
  
  picked.push(pair);
  attendeeCounts[pair.a.id] = aCount + 1;
  attendeeCounts[pair.b.id] = bCount + 1;
}
`

**Why Greedy Works:**
- Pairs are sorted by score
- Always picks highest-score available match
- Prevents one person from getting 50 suggestions while others get 0

### 5.4 Database Persistence

#### Step 1: Clear Old Pending Suggestions
`javascript
await supabase
  .from('event_b2b_suggestions')
  .delete()
  .eq('event_id', eventId)
  .eq('status', 'pending');
`
**Note:** Only deletes 'pending', preserves 'accepted' and 'dismissed'

#### Step 2: Bulk Insert
`javascript
const payload = picked.map(pair => ({
  event_id: eventId,
  attendee_a_id: pair.a.id,
  attendee_b_id: pair.b.id,
  score: pair.score,
  status: 'pending',
  meta: {
    tags: pair.meta.tags,
    breakdown: pair.meta.breakdown,
    insights: pair.meta.insights,
    topics: pair.meta.topics
  }
}));

await supabase.from('event_b2b_suggestions').insert(payload);
`

### 5.5 Statistics & Tracking

**Returned Metrics:**
`javascript
return {
  created: picked.length,
  avgScore: round(sum(picked.scores) / picked.length),
  attendeesMatched: unique(picked.flatMap(p => [p.a.id, p.b.id])).length
};
`

**Saved to Settings:**
`javascript
await persistB2BSettings({
  lastRunAt: new Date().toISOString(),
  lastRunCount: result.created,
  lastRunAvgScore: result.avgScore,
  lastRunAttendeesMatched: result.attendeesMatched
});
`

---
