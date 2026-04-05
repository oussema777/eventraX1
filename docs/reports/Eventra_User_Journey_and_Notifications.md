# Eventra Platform - User Journey & Notification Emails

**Document Version:** 1.0
**Date:** April 5, 2026
**Purpose:** Client review of user journey flows and all automated notification emails with their content.

---

## Table of Contents

1. [User Journey Overview](#1-user-journey-overview)
2. [Journey 1: Account Creation & Onboarding](#2-journey-1-account-creation--onboarding)
3. [Journey 2: Event Creation (Organizer)](#3-journey-2-event-creation-organizer)
4. [Journey 3: Event Moderation (Admin)](#4-journey-3-event-moderation-admin)
5. [Journey 4: Event Discovery & Registration (Attendee)](#5-journey-4-event-discovery--registration-attendee)
6. [Journey 5: B2B Networking & Meetings](#6-journey-5-b2b-networking--meetings)
7. [Journey 6: Business Marketplace](#7-journey-6-business-marketplace)
8. [All Notification Emails Summary](#8-all-notification-emails-summary)
9. [All In-App Notifications Summary](#9-all-in-app-notifications-summary)

---

## 1. User Journey Overview

Eventra has six core user journeys:

```
                        +-------------------+
                        |   Landing Page    |
                        +--------+----------+
                                 |
                    +------------+------------+
                    |                         |
             Sign Up / Login          Browse Events
                    |                         |
           +--------+--------+        +------+------+
           |                 |        |             |
      Dashboard        Edit Profile   Event Card   Filter/Search
           |                          |
    +------+------+            Register (Guest or Logged In)
    |             |                   |
 Create Event   My Events      Registration Flow
    |             |            (Personal Info -> Sessions -> Confirm)
 Wizard Steps    Manage Event         |
 (1->2->3->4)   Dashboard      Confirmation + Email
    |
 Publish -> Admin Review -> Live
```

---

## 2. Journey 1: Account Creation & Onboarding

### Flow
1. User visits the platform
2. Clicks "Sign Up"
3. Fills in name, email, password
4. Email verification sent (Supabase Auth)
5. User verifies email
6. Redirected to complete profile
7. Welcome email sent

### Email: Welcome Email

| Field | Content |
|-------|---------|
| **Trigger** | After successful account creation and profile setup |
| **Subject** | `Welcome to Eventra, {userName}!` |
| **Recipient** | New user |

**Email Body:**

```
EVENTRA

Welcome to the community, {userName}!

We're excited to have you on board. Your professional profile is now
live and ready for networking.

+----------------------------------+
|    Your Digital Business Card    |
|                                  |
|         [QR CODE IMAGE]         |
|                                  |
|  Others can scan this code to    |
|  view your public profile and    |
|  schedule meetings with you.     |
|                                  |
|      [View Your Profile]         |
+----------------------------------+

What's next?
  - Explore upcoming events in your sector
  - Connect with industry peers
  - Manage your B2B meetings

---
(c) 2026 Eventra.cloud. All rights reserved.
This email was sent to you as part of your registration on Eventra.
```

---

## 3. Journey 2: Event Creation (Organizer)

### Flow
1. Organizer clicks "Create Event" from Dashboard
2. **Step 1 - Event Details:** Name, type, format, dates, capacity, public/private toggle
3. **Step 2 - Design Studio:** Branding, colors, fonts, logo upload, landing page blocks
4. **Step 3 - Registration Setup:** Tickets, speakers, schedule, attendees, exhibitors, custom forms, QR badges
5. **Step 4 - Launch:** SEO settings, privacy/visibility, review checklist, publish

### In-App Notification: Draft Created

| Field | Content |
|-------|---------|
| **Trigger** | First time saving event details (Step 1 -> Step 2) |
| **Title** | `Draft created` |
| **Body** | `Your event "{eventName}" is ready for design.` |
| **Type** | System |
| **Action URL** | `/create/design/{eventId}` |

### In-App Notification: Draft Saved

| Field | Content |
|-------|---------|
| **Trigger** | Clicking "Save Draft" at any wizard step |
| **Title** | `Draft saved` |
| **Body** | `Your event "{eventName}" has been saved as a draft.` |
| **Type** | System |
| **Action URL** | `/event/{eventId}` |

### In-App Notification: Event Published

| Field | Content |
|-------|---------|
| **Trigger** | Clicking "Publish Event" in Step 4 |
| **Title** | `Event published` |
| **Body** | `{eventName} is now live.` |
| **Type** | System |
| **Action URL** | `/event/{eventId}` |

> **Note:** After publishing, the event enters a "pending" moderation state. It is not publicly visible in Browse Events until an admin approves it.

---

## 4. Journey 3: Event Moderation (Admin)

### Flow
1. Admin logs into the Admin Dashboard
2. Sees list of events pending moderation (`moderation_status: 'pending'`)
3. Reviews event details
4. Approves or rejects the event

### In-App Notification: Event Approved

| Field | Content |
|-------|---------|
| **Trigger** | Admin approves the event |
| **Recipient** | Event organizer |
| **Title** | `Event Approved: {eventName}` |
| **Body** | `Your event "{eventName}" has been approved and is now live on Eventra!` |
| **Type** | System |
| **Action URL** | `/event/{eventId}` |

### In-App Notification: Event Not Approved

| Field | Content |
|-------|---------|
| **Trigger** | Admin rejects the event |
| **Recipient** | Event organizer |
| **Title** | `Event Not Approved: {eventName}` |
| **Body** | `Your event "{eventName}" was not approved. Please review your event details and resubmit.` |
| **Type** | System |
| **Action URL** | `/event/{eventId}` |

---

## 5. Journey 4: Event Discovery & Registration (Attendee)

### Flow
1. User browses events at `/browse-events`
2. Events display with Public (green badge) or Private (amber badge) indicators
3. User clicks on an event card -> Event Landing Page
4. **If Private Event:** Access code modal appears before registration
5. User clicks "Register" -> Registration Flow page
6. **Step 1 - Personal Information:** Name, email, phone, organization, job title
7. **Step 2 - Session Selection:** Choose sessions/agenda items to attend
8. **Step 3 - Confirmation:** Review summary, receive confirmation code
9. Registration confirmation email sent
10. Organizer receives in-app notification

### Email: Registration Confirmation

| Field | Content |
|-------|---------|
| **Trigger** | Successful event registration (Step 3 completion) |
| **Subject** | `Registration Confirmed: {eventName}` |
| **Recipient** | Attendee (email provided during registration) |
| **Condition** | Only sent if organizer has email notifications enabled in Notification Center |

**Email Body:**

```
You're going to {eventName}!

Hi {attendeeName},

Thanks for registering. Here is your recap and check-in details.

+----------------------------------+
|     Your Check-in QR Code        |
|                                  |
|         [QR CODE IMAGE]         |
|                                  |
|  Show this code at the entrance. |
+----------------------------------+

Your Selected Agenda
  - {Session Title 1}
    {Time} - {Location}
  - {Session Title 2}
    {Time} - {Location}
  ...

---
Sent via Eventra Platform
```

**Additional section for anonymous (non-logged-in) registrants:**

```
+------------------------------------------+
|   Get more from this event               |
|                                          |
|   Create a free Eventra account to       |
|   unlock powerful networking features:   |
|                                          |
|   - B2B Networking                       |
|   - Meeting Scheduling                   |
|   - Professional Profile                 |
|   - Smart Check-in                       |
|                                          |
|   [Create Your Free Account]             |
+------------------------------------------+
```

### In-App Notification: New Registration (to Organizer)

| Field | Content |
|-------|---------|
| **Trigger** | Attendee completes registration |
| **Recipient** | Event organizer (event owner) |
| **Title** | `New event registration` |
| **Body** | `{attendeeEmail} registered for {eventName}.` |
| **Type** | Action |
| **Action URL** | `/manage-event/{eventId}` |
| **Condition** | Only sent if organizer has bell notifications enabled |

---

## 6. Journey 5: B2B Networking & Meetings

### Flow
1. User navigates to Networking Hub (`/my-networking`)
2. Views AI-suggested matches or searches for other attendees
3. Sends connection request
4. Recipient accepts/declines
5. If connected, either party can schedule a B2B meeting
6. Meeting request sent -> Recipient confirms/declines/reschedules
7. Both parties receive email confirmation with QR code

### In-App Notification: Connection Request

| Field | Content |
|-------|---------|
| **Trigger** | User sends a connection request |
| **Recipient** | Target user |
| **Title** | `New connection request` |
| **Body** | `{senderName} wants to connect with you.` |
| **Type** | Action |

### In-App Notification: Connection Accepted

| Field | Content |
|-------|---------|
| **Trigger** | User accepts a connection request |
| **Recipient** | Original requester |
| **Title** | `Connection accepted` |
| **Body** | `{accepterName} accepted your connection request.` |
| **Type** | System |

### In-App Notification: Connection Declined

| Field | Content |
|-------|---------|
| **Trigger** | User declines a connection request |
| **Recipient** | Original requester |
| **Title** | `Connection declined` |
| **Body** | `{declinerName} declined your connection request.` |
| **Type** | System |

### In-App Notification: Meeting Requested

| Field | Content |
|-------|---------|
| **Trigger** | User schedules a meeting with another user |
| **Recipient** | Meeting invitee |
| **Title** | `Meeting requested` |
| **Body** | `{requesterName} scheduled a meeting with you.` |
| **Type** | Action |

### In-App Notification: Meeting Confirmed

| Field | Content |
|-------|---------|
| **Trigger** | Invitee confirms the meeting |
| **Recipient** | Meeting organizer |
| **Title** | `Meeting confirmed` |
| **Body** | `{confirmerName} confirmed the meeting.` |
| **Type** | System |

### In-App Notification: Meeting Declined

| Field | Content |
|-------|---------|
| **Trigger** | Invitee declines the meeting |
| **Recipient** | Meeting organizer |
| **Title** | `Meeting declined` |
| **Body** | `{declinerName} declined the meeting.` |
| **Type** | System |

### In-App Notification: Meeting Rescheduled

| Field | Content |
|-------|---------|
| **Trigger** | Either party reschedules the meeting |
| **Recipient** | The other party |
| **Title** | `Meeting rescheduled` |
| **Body** | `{reschedulerName} rescheduled the meeting.` |
| **Type** | Action |

### In-App Notification: Meeting Cancelled

| Field | Content |
|-------|---------|
| **Trigger** | Either party cancels the meeting |
| **Recipient** | The other party |
| **Title** | `Meeting cancelled` |
| **Body** | `{cancellerName} cancelled the meeting.` |
| **Type** | System |

### Email: Meeting Request / Confirmation

| Field | Content |
|-------|---------|
| **Trigger** | Meeting is requested or confirmed |
| **Recipients** | Both organizer and invitee (2 separate emails) |

**Organizer Email Subject (Pending):** `Meeting Request: {recipientName} at {eventName}`
**Organizer Email Subject (Confirmed):** `Meeting Confirmed: {recipientName} at {eventName}`
**Recipient Email Subject (Pending):** `New Meeting Request for {eventName}`
**Recipient Email Subject (Confirmed):** `Meeting Confirmed for {eventName}`

**Email Body (Pending):**

```
New Meeting Request

Hello,

Your meeting request for {eventName} has been sent.
  -- OR --
You have received a new meeting request for {eventName}.

+----------------------------------+
|       Meeting Details            |
|                                  |
|  Status:       PENDING           |
|  Date:         {meetingDate}     |
|  Time:         {meetingTime}     |
|  Location:     {location}        |
|  Participants: {name1} & {name2} |
+----------------------------------+

        [Review Request]

Please manage your meetings through your Networking Dashboard.

---
Sent via Eventra Networking Engine
```

**Email Body (Confirmed):**

```
Meeting Confirmed!

Hello,

This is to confirm your B2B networking meeting for {eventName}.

+----------------------------------+
|       Meeting Details            |
|                                  |
|  Status:       CONFIRMED         |
|  Date:         {meetingDate}     |
|  Time:         {meetingTime}     |
|  Location:     {location}        |
|  Participants: {name1} & {name2} |
+----------------------------------+

        Meeting QR Code
        [QR CODE IMAGE]
  Scan this code at the meeting
  table for check-in.

Please manage your meetings through your Networking Dashboard.

---
Sent via Eventra Networking Engine
```

---

## 7. Journey 6: Business Marketplace

### Flow
1. User browses the B2B Marketplace
2. Views product/service listings from other businesses
3. Clicks on a product -> Product Detail Page
4. Sends a quote request to the seller

### In-App Notification: Quote Request

| Field | Content |
|-------|---------|
| **Trigger** | User requests a quote for a product/service |
| **Recipient** | Product owner (seller) |
| **Title** | `Quote request` |
| **Body** | `Quote request for {productName}.` |
| **Type** | Action |

---

## 8. All Notification Emails Summary

| # | Email Name | Trigger | Recipient | Subject Line |
|---|-----------|---------|-----------|-------------|
| 1 | **Welcome Email** | Account creation | New user | `Welcome to Eventra, {name}!` |
| 2 | **Registration Confirmation** | Event registration completed | Attendee | `Registration Confirmed: {eventName}` |
| 3 | **Meeting Request (Organizer)** | Meeting scheduled | Meeting organizer | `Meeting Request: {name} at {event}` |
| 4 | **Meeting Request (Recipient)** | Meeting scheduled | Meeting invitee | `New Meeting Request for {event}` |
| 5 | **Meeting Confirmed (Organizer)** | Meeting accepted | Meeting organizer | `Meeting Confirmed: {name} at {event}` |
| 6 | **Meeting Confirmed (Recipient)** | Meeting accepted | Meeting invitee | `Meeting Confirmed for {event}` |

> **Note:** Registration confirmation emails are only sent if the event organizer has enabled email notifications in the Event Notification Center (Settings tab).

---

## 9. All In-App Notifications Summary

| # | Notification | Trigger | Recipient | Type |
|---|-------------|---------|-----------|------|
| 1 | Draft created | Event saved for first time | Organizer | System |
| 2 | Draft saved | Save Draft clicked | Organizer | System |
| 3 | Event published | Publish clicked | Organizer | System |
| 4 | Event Approved | Admin approves event | Organizer | System |
| 5 | Event Not Approved | Admin rejects event | Organizer | System |
| 6 | New event registration | Attendee registers | Organizer | Action |
| 7 | New connection request | Connection request sent | Target user | Action |
| 8 | Connection accepted | Request accepted | Requester | System |
| 9 | Connection declined | Request declined | Requester | System |
| 10 | Meeting requested | Meeting scheduled | Invitee | Action |
| 11 | Meeting confirmed | Meeting accepted | Organizer | System |
| 12 | Meeting declined | Meeting declined | Organizer | System |
| 13 | Meeting rescheduled | Meeting rescheduled | Other party | Action |
| 14 | Meeting cancelled | Meeting cancelled | Other party | System |
| 15 | Quote request | Quote requested | Seller | Action |

---

## Configurable Notification Settings (Per Event)

Event organizers can configure notification behavior per event via the **Notification Center** tab in the Event Management Dashboard:

| Trigger | Email Toggle | In-App Bell Toggle |
|---------|-------------|-------------------|
| Meeting Booked | Yes/No | Yes/No |
| Event Registration | Yes/No | Yes/No |
| Form Submitted | Yes/No | Yes/No |
| Session Reminder | Yes/No | Yes/No |

---

*Document generated for client review. All email templates and notification content are extracted directly from the Eventra codebase.*
