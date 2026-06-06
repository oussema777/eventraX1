# 🎫 Eventra Mock Event Data
This document contains mock data for testing the full Eventra Event Creation Wizard (Steps 01-04).

---

## 🏗️ Step 01: Event Details
**Purpose:** Basic identification and logistical setup.

| Field | Mock Value |
| :--- | :--- |
| **Event Name** | Global Tech Innovation Summit 2026 |
| **Tagline** | Shaping the Future of Decentralized Intelligence |
| **Event Type** | Summit |
| **Event Status** | Paid |
| **Event Format** | In-Person |
| **Venue Address** | Palais des Congrès, Tunis, Tunisia |
| **Start Date** | 2026-05-15T09:00:00Z |
| **End Date** | 2026-05-17T18:00:00Z |
| **Timezone** | UTC+1 (Tunis) |
| **Capacity Limit** | 500 |
| **Waitlist Enabled** | True |
| **Waitlist Capacity**| 100 |

---

## 🎨 Step 02: Design Studio
**Purpose:** Visual branding and landing page structure.

### Global Branding
- **Primary Brand Color:** `#0684F5` (Eventra Blue)
- **Secondary Brand Color:** `#0B2641` (Deep Navy)
- **Font Family:** `Inter`
- **Button Radius:** `8px`
- **Logo URL:** `https://eventra.io/assets/logo-white.png`

### Active Blocks (Order & Configuration)
1. **Hero Block**
   - Title: "Global Tech Innovation Summit 2026"
   - Subtitle: "The premier gathering for AI and Web3 pioneers."
   - Button Text: "Register Now"
2. **About Block**
   - Title: "About the Summit"
   - Description: "Three days of deep dives into AI, Blockchain, and the future of work."
   - Features: ["30+ Keynotes", "Workshops", "B2B Networking"]
3. **Event Details Block** (Shows date/location from Step 1)
4. **Speakers Block** (Dynamic from Step 3.2)
5. **Agenda Block** (Dynamic from Step 3.5)
6. **Tickets Block** (Dynamic from Step 3.1)
7. **Footer Block**
   - Copyright: "© 2026 iLab Agency"
   - Socials: [Twitter, LinkedIn, Instagram]

---

## 📋 Step 03: Registration & Logistics
**Purpose:** Defining the event content and attendee experience.

### 3.1 Tickets (Paid Event)
- **Ticket A:** "Early Bird Access" - 150 TND (Includes: Main Stage, Coffee Breaks)
- **Ticket B:** "VIP Experience" - 450 TND (Includes: VIP Lounge, Speaker Dinner, All Stages)

### 3.2 Speakers
- **Speaker 1:** Firas Belhia (CEO, iLab) - "The Future of 3D Printing in Tech"
- **Speaker 2:** Sarah J. (CTO, Eventra) - "Scaling Enterprise SaaS in 2026"

### 3.5 Schedule (Agenda)
- **Day 1, 09:00:** "Opening Ceremony" - Main Hall
- **Day 1, 10:30:** "AI Revolutionizing DevTools" - Room A
- **Day 2, 14:00:** "Web3 & The New Economy" - Room B

### 3.8 Custom Registration Form
- **Field 1:** "Job Title" (Text) - Required
- **Field 2:** "Company Size" (Dropdown: 1-10, 11-50, 50+) - Required
- **Field 3:** "Dietary Requirements" (Multi-select: Vegan, Gluten-Free, None)

---

## 🚀 Step 04: Launch Configuration
**Purpose:** Final visibility and community settings.

| Setting | Selection |
| :--- | :--- |
| **Event Visibility** | Public (Visible in Eventra Directory) |
| **Community Visibility**| Enabled (Attendees can network in Global Community) |
| **SEO Indexing** | Enabled |
| **Automatic Reminders** | Enabled (24h before event) |

---

## 🛠️ Developer Snippet (JSON Payload)
```json
{
  "name": "Global Tech Innovation Summit 2026",
  "tagline": "Shaping the Future of Decentralized Intelligence",
  "event_type": "Summit",
  "event_status": "paid",
  "event_format": "in-person",
  "location_address": "Palais des Congrès, Tunis, Tunisia",
  "start_date": "2026-05-15T09:00:00Z",
  "end_date": "2026-05-17T18:00:00Z",
  "branding_settings": {
    "design_studio": {
      "brandColor": "#0684F5",
      "fontFamily": "Inter",
      "buttonRadius": 8,
      "activeBlocks": ["hero", "about", "details", "speakers", "agenda", "tickets", "footer"]
    }
  },
  "visibility": "public",
  "community_enabled": true
}
```
