# Site Problems Scan

## Demo/placeholder behavior exposed
- Demo auth route is publicly registered and accessible (`frontend/src/App.tsx:75`).
- Design studio uses blocking alerts for "Coming soon"/"Upgrade" actions (`frontend/src/pages/04_Wizard_Step2_DesignStudio.tsx:145`, `frontend/src/pages/04_Wizard_Step2_DesignStudio.tsx:149`).
- Sessions export modal is marked placeholder (no real export) (`frontend/src/components/wizard/SessionsTab.tsx:2139`).

## Console-only actions (no real behavior)
- Upgrade modal buttons only log to console (`frontend/src/components/wizard/modals/UpgradeModal.tsx:108`, `frontend/src/components/wizard/modals/UpgradeModal.tsx:119`).
- Success actions log to console instead of performing actions (`frontend/src/components/success/PrimaryActionsBar.tsx:17`, `frontend/src/components/success/NextStepsSection.tsx:18`).
- Business profile invite uses console log only (`frontend/src/components/business/BusinessProfilePage.tsx:175`).
- Contact support link logs only (`frontend/src/components/modals/ModalEmailVerification.tsx:292`).
- User dropdown logout fallback logs to console when no handler provided (`frontend/src/components/navigation/UserDropdownMenu.tsx:122`).

## Mock/demo data masking real data
- Marketing tab filters out campaigns/promo codes that match mock lists (can hide real items) (`frontend/src/components/dashboard/EventMarketingTab.tsx:140-155`).
- Demo attendees array exists (risk of mixing with real data) (`frontend/src/components/dashboard/EventAttendeesTab.tsx:798`).

## Non-modal prompts/confirm dialogs
- Multiple flows rely on `window.prompt` for editing content in profile, industries, certifications, etc. (`frontend/src/pages/09_My_Profile.tsx:906`, `frontend/src/pages/09_My_Profile.tsx:920`, `frontend/src/pages/09_My_Profile.tsx:940`, `frontend/src/pages/09_My_Profile.tsx:959`, `frontend/src/pages/09_My_Profile.tsx:1635`, `frontend/src/pages/09_My_Profile.tsx:1689`, `frontend/src/pages/09_My_Profile.tsx:1803-1805`, `frontend/src/pages/09_My_Profile.tsx:1854-1856`, `frontend/src/pages/09_My_Profile.tsx:1992`, `frontend/src/pages/09_My_Profile.tsx:2071`).
- Destructive actions use `confirm()` (no custom modal) in tickets, sponsors, speakers, sessions, exhibitors, attendees, and design studio (`frontend/src/components/wizard/TicketsTab.tsx:90`, `frontend/src/components/wizard/SponsorsTab.tsx:105`, `frontend/src/components/wizard/SpeakersTab.tsx:94`, `frontend/src/components/wizard/SessionsTab.tsx:143`, `frontend/src/components/wizard/ExhibitorsTab.tsx:81`, `frontend/src/components/dashboard/EventSpeakersTab.tsx:968`, `frontend/src/components/dashboard/EventSpeakersTab.tsx:985`, `frontend/src/components/dashboard/EventAttendeesTab.tsx:2818`, `frontend/src/components/design-studio/BlockLibraryPanel.tsx:615`, `frontend/src/components/design-studio/BlockLibraryPanel.tsx:836`).

## Demo/placeholder comments in page logic
- View-created event page indicates free/pro placeholders (potentially shipped demo logic) (`frontend/src/pages/28_View_Created_Event.tsx:14`).
- Browse events page has a demo "filling fast" behavior note (may imply mock logic) (`frontend/src/pages/07_Browse_Events_Public.tsx:63`).
