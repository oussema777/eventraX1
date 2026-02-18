# 1. Architecture Overview

## System Components

The B2B Matchmaking Engine consists of 4 core components:

### 1.1 Profile Builder (uildMatchProfile)
Extracts and normalizes attendee data into a structured matching profile.

### 1.2 Scoring Engine (uildMatchMeta)
Calculates compatibility scores using weighted multi-criteria analysis.

### 1.3 Suggestion Generator (generateSuggestions)
Creates optimal pairings while respecting constraints and limits.

### 1.4 Meeting Scheduler
Converts accepted suggestions into scheduled meetings with notifications.

---

# 2. Profile Building System

## Function: uildMatchProfile(attendee)

**Purpose:** Transforms raw attendee data into a normalized matching profile.

**Input:** Attendee object with meta, business, and ticket data
**Output:** Structured profile with normalized fields

### 2.1 Data Extraction

`javascript
const buildMatchProfile = (attendee: any) => {
  const meta = attendee?.meta || {};
  const business = attendee?.business || {};
  
  // Extract job title from multiple possible fields
  const title = meta.jobTitle || meta.job_title || meta.title || meta.role || '';
  
  // Normalize industries from multiple sources
  const industries = normalizeTokens(
    meta.industry, meta.industries, meta.sector, meta.sectors, 
    meta.market, meta.markets, meta.industryFocus,
    business.industry, business.sector
  );
  
  // Extract interests and topics
  const interests = normalizeTokens(
    meta.interests, meta.interest, meta.topics, meta.tags,
    business.tags, business.offerings
  );
  
  // Extract networking goals
  const goals = normalizeTokens(
    meta.goals, meta.goal, meta.objectives, 
    meta.networkingGoals, meta.networking_goals,
    business.mission
  );
  
  // Company stage (Pre-seed, Seed, Series A, etc.)
  const stage = normalizeStage(meta.companyStage || meta.company_stage || meta.stage || business.stage);
  
  // Attendee category/ticket type
  const category = meta.category || meta.attendeeCategory || attendee?.ticket_type || meta.ticketType || '';
  
  // Opt-in status for matchmaking
  const optIn = meta.b2bOptIn ?? meta.b2b_opt_in ?? meta.matchmakingOptIn ?? 
                meta.matchmaking_opt_in ?? meta.matchmaking ?? meta.selectedForMatch ?? 
                meta.shortlist ?? meta.isSelected ?? meta.b2b_selected;
  
  return {
    title,
    industries,
    interests,
    goals,
    stage,
    category,
    optIn: optIn === true,
    meta,
    business
  };
};
`

### 2.2 Token Normalization (
ormalizeTokens)

**Purpose:** Converts various data formats into clean string arrays.

**Process:**
1. Accepts multiple values (strings, arrays, numbers)
2. Splits strings by delimiters: ,, ;, |, /
3. Trims whitespace
4. Removes duplicates
5. Filters empty values

**Example:**
`
Input: "AI, Machine Learning; Data Science"
Output: ["AI", "Machine Learning", "Data Science"]
`

### 2.3 Stage Normalization (
ormalizeStage)

**Purpose:** Maps company stage strings to ranked categories.

**Ranking System:**
1. Pre-seed (Rank 1)
2. Seed (Rank 2)
3. Series A (Rank 3)
4. Series B (Rank 4)
5. Series C (Rank 5)
6. Growth (Rank 6)
7. Enterprise (Rank 7)

Default: Rank 4 for unknown stages

**Why Ranking?** Enables calculation of stage proximity (e.g., Series A and Series B are closer than Seed and Enterprise)

---

# 3. Matching Algorithm

## Function: uildMatchMeta(a, b)

**Purpose:** Calculates match compatibility between two attendees.

**Algorithm Type:** Weighted Multi-Criteria Decision Analysis (MCDA)

### 3.1 Scoring Criteria (5 Dimensions)

#### Criterion 1: Industry Alignment
- **Weight:** Configurable (default 85%)
- **Calculation:** Jaccard similarity of industry sets
- **Formula:** score = (common_industries / total_unique_industries) × 100
- **Example:** 
  - Person A: ["FinTech", "AI", "SaaS"]
  - Person B: ["FinTech", "Healthcare"]
  - Common: 1, Union: 4 → Score = 25%

#### Criterion 2: Role Compatibility
- **Weight:** Configurable (default 60%)
- **Calculation:** Role category matching + special pairings
- **Categories:** tech, product, sales, marketing, leadership, investor, ops, other
- **Special Bonuses:**
  - Investor ↔ Founder: 95%
  - Product ↔ Tech: 85%
  - Sales ↔ Marketing: 82%
  - Same role: 90%
  - Complementary: 60%

#### Criterion 3: Company Stage Alignment
- **Weight:** Configurable (default 70%)
- **Calculation:** score = max(0, 100 - |rankA - rankB| × 15)
- **Example:**
  - Series A (rank 3) ↔ Series B (rank 4): 100 - (1 × 15) = 85%
  - Seed (rank 2) ↔ Enterprise (rank 7): 100 - (5 × 15) = 25%

#### Criterion 4: Goal Alignment
- **Weight:** Configurable (default 80%)
- **Calculation:** Jaccard similarity of goals
- **Example:** Both seeking "fundraising" and "partnerships"

#### Criterion 5: Common Interests
- **Weight:** Configurable (default 90%)
- **Calculation:** Jaccard similarity of interests
- **Most Important:** This gets highest default weight

---
