// Navigation route mapping
export const ROUTES = {
  LANDING: '/',
  DASHBOARD: '/dashboard',
  WIZARD_STEP_1: '/create-event',
  WIZARD_STEP_2: '/create-event',
  WIZARD_STEP_3: '/create-event',
  WIZARD_STEP_4: '/create-event',
  WIZARD_STEP_4_NEW: '/create/launch-new',
  SUCCESS: '/success',
  SUCCESS_LIVE: '/success-live',
  DRAFT_SAVED: '/draft-saved'
} as const;

// Frame name to route mapping (for consistency with your naming convention)
export const FRAME_TO_ROUTE: { [key: string]: string } = {
  '01_Landing_Page': ROUTES.LANDING,
  '02_My_Events_Dashboard': ROUTES.DASHBOARD,
  '03_Wizard_Step1_Details': ROUTES.WIZARD_STEP_1,
  '04_Wizard_Step2_Design': ROUTES.WIZARD_STEP_2,
  '05_Wizard_Step3_Registration': ROUTES.WIZARD_STEP_3,
  '06_Wizard_Step4_Launch': ROUTES.WIZARD_STEP_4,
  '07_Success_Published': ROUTES.SUCCESS,
  '08_Draft_Saved': ROUTES.DRAFT_SAVED
};
