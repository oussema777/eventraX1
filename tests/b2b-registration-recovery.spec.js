import { fillRequiredRegistration } from './fixtures/registration-answers.js';
import { test, expect } from '@playwright/test';
const eventId='769d7854-9bae-49e6-9db9-c88c0586a402';
for(const scenario of ['pending','review','fallback','unavailable']) test(`registration recovery: ${scenario}`,async({page})=>{
 let fallbackWrites=0,emails=0;
 await page.route('**/auth/v1/**',r=>r.fulfill({json:{}}));
 await page.route('**/functions/v1/create-event-registration',r=>r.fulfill(
   ['fallback','unavailable'].includes(scenario)?{status:503,json:{error:'Unavailable'}}:
   {json:{success:true,attendee_id:'saved-attendee',confirmation_code:'EVT-SAVED',user_id:null,b2b_access_status:scenario,confirmation_email_sent:true,access_email_sent:false}}
 ));
 await page.route('**/send-email',r=>{emails++;return r.fulfill({json:{}});});
 await page.route('**/rest/v1/**',r=>{
   const table=new URL(r.request().url()).pathname.split('/').pop();let data=[];
   if(table==='events')data={id:eventId,name:'B2B registration test',status:'published',workshop_selection_limit:null};
   if(table==='event_forms')data=[{form_type:'registration',status:'active',schema:{fields:[]}}];
   if(table==='create_event_attendee_with_sessions'){
     fallbackWrites++;
     if(scenario==='unavailable')return r.fulfill({status:503,json:{message:'Database unavailable'}});
     const body=r.request().postDataJSON();
     expect(body.p_attendee.meta.b2bOptIn).toBe(true);
     expect(body.p_attendee.meta.b2bAccessStatus).toBe('pending');
     expect(body.p_attendee.profile_id).toBeNull();
     data={id:'saved-attendee'};
   }
   return r.fulfill({json:data});
 });
 await page.goto(`/event/${eventId}/register`,{waitUntil:'domcontentloaded'});
 await page.locator('.registration-language select').selectOption('en');
 await fillRequiredRegistration(page);
 await page.getByRole('radio',{name:'Yes',exact:true}).check();
 await page.locator('.registration-action-buttons button').last().click();
 await page.getByRole('button',{name:'Complete Registration'}).click();
 if(scenario==='unavailable'){
   await expect(page.getByRole('alert')).toContainText('We couldn’t save your registration right now');
   await expect(page.getByRole('alert')).toBeFocused();
   await expect(page.getByRole('button',{name:'Try again',exact:true})).toBeEnabled();
   await page.getByRole('button',{name:'Check my details',exact:true}).click();
   await expect(page.getByPlaceholder('john@company.com')).toHaveValue('guest@example.test');
   await expect(page.getByRole('radio',{name:'Yes',exact:true})).toBeChecked();
 }else{
   const status=page.locator('.registration-networking-pending');
   await expect(status).toContainText('Your registration is saved');
   await expect(status).toContainText(scenario==='review'?'needs help from the organizer':'retry automatically');
   await expect(status).toContainText('You don’t need to register again');
   await expect(page.getByText('Your Eventra account is ready.',{exact:false})).toHaveCount(0);
   await expect(page.getByRole('button',{name:'Complete Registration'})).toHaveCount(0);
   await page.locator('.registration-language select').selectOption('fr');
   await expect(status).toContainText('Votre inscription est enregistrée');
   await page.setViewportSize({width:390,height:844});
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
   await page.screenshot({path:`.tmp/registration-access-${scenario}.png`,fullPage:true});
 }
 expect(fallbackWrites).toBe(['fallback','unavailable'].includes(scenario)?1:0);
 expect(emails).toBe(0);
});
