import { test, expect } from '@playwright/test';
const event='20000000-0000-4000-8000-000000000001';
const viewer='10000000-0000-4000-8000-000000000001';
const investor='10000000-0000-4000-8000-000000000002';
const ordinary='10000000-0000-4000-8000-000000000003';
const user={id:viewer,email:'attendee@example.test',aud:'authenticated',role:'authenticated',app_metadata:{},user_metadata:{},created_at:'2026-01-01T00:00:00Z'};
const profiles=[{id:viewer,full_name:'Youssef Ben Ali',company:'Solar Lab',job_title:'Founder',sector:'Energy',industry:'Energy'},
{id:investor,full_name:'Amel Ben Salah',company:'Atlas Ventures',job_title:'Investment Director',sector:'Energy',industry:'Energy',avatar_url:null},
{id:ordinary,full_name:'Ordinary Participant',company:'Other Company',job_title:'Founder',sector:'Technology',industry:'Technology'}];
async function setup(page,{locale='en',registered=true,fail=false,signedIn=true}={}){
 const writes=[];const requests=[];const mail=[];const reads=[];
 await page.addInitScript(locale=>localStorage.setItem('eventra_locale',locale),locale);
 await page.route('**/auth/v1/**',r=>r.fulfill({json:user}));
 await page.route('**/functions/v1/**',r=>r.fulfill({json:{}}));
 await page.route('**/api/send-email',r=>{mail.push(r.request().postData());return r.fulfill({json:{}});});
 await page.route('**/rest/v1/**',r=>{
  const url=new URL(r.request().url());const name=url.pathname.split('/').pop();const method=r.request().method();let data=[];
  reads.push({name,select:url.searchParams.get('select')});
  if(name==='events')data=url.searchParams.get('id')?.startsWith('in.')?[{id:event,name:'Investment Forum',timezone:'Africa/Tunis'}]:{id:event,name:'Investment Forum',status:'published',timezone:'Africa/Tunis',start_date:'2027-11-20',end_date:'2027-11-21',branding_settings:{}};
  if(name==='event_can')data=false;
  if(name==='list_event_investors'){
    if(fail)return r.fulfill({status:503,json:{message:'Temporary failure'}});
    data=[{attendee_id:'investor-attendee',profile_id:investor}];
  }
  if(name==='profiles'){
    const id=url.searchParams.get('id');data=id?.startsWith('in.')?profiles:profiles.find(p=>`eq.${p.id}`===id)||profiles[0];
    if(id?.startsWith('in.'))expect(url.searchParams.get('select')).not.toMatch(/email|phone|\*/);
  }
  if(name==='event_attendees'){
    if(url.searchParams.has('meta->>b2bOptIn'))data=profiles.map(p=>({profile_id:p.id,interests:['Investment'],sector:p.sector}));
    else if(url.searchParams.get('select')==='id')data=registered?(url.searchParams.has('limit')?[{id:'my-registration'}]:{id:'my-registration'}):null;
    else data=profiles.map(p=>({id:p.id===investor?'investor-attendee':'other-attendee',event_id:event,profile_id:p.id,name:p.full_name}));
  }
  if(name==='event_b2b_settings')data={venue_config:{tableCount:2,slotDuration:30,allowedMeetingFormats:['in-person'],schedules:[{date:'2027-11-20',start:'14:00',end:'17:00'}]}};
  if(name==='b2b_event_eligible')data=true;
  if(name==='get_investor_booking_policy')data={investor:true,requires_review:true,use_workflow:true,available:true,awaiting_acceptance:false};
  if(name==='submit_investor_booking'){requests.push(r.request().postDataJSON());data={id:'held-request',state:'awaiting_review'};}
  if(name==='event_b2b_meetings'&&method==='POST'){writes.push(r.request().postDataJSON());data={id:'unexpected'};}
  return r.fulfill({json:data});
 });
 await page.goto(`/event/${event}/investors`);
 if(signedIn){await page.evaluate(async user=>{
   const {supabase}=await import('/src/lib/supabase.ts');const encode=v=>btoa(JSON.stringify(v)).replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_');
   await supabase.auth.setSession({access_token:`${encode({alg:'HS256',typ:'JWT'})}.${encode({sub:user.id,exp:Math.floor(Date.now()/1000)+3600})}.${encode('fixture')}`,refresh_token:'fixture'});
 },user);}
 return {requests,writes,mail,reads};
}
test('dedicated investor page discovers investors and submits through organizer review',async({page},testInfo)=>{
 const {requests,writes,mail}=await setup(page);
 await expect(page.getByRole('heading',{name:'Meet the investors',exact:true})).toBeVisible();
 await expect(page.getByRole('heading',{name:'Amel Ben Salah',exact:true})).toBeVisible();
 await expect(page.getByRole('heading',{name:'Ordinary Participant',exact:true})).toHaveCount(0);
 await expect(page.getByRole('link',{name:'View profile',exact:true})).toHaveAttribute('href',`/event/${event}/profile/${investor}`);
 await page.getByRole('searchbox').fill('nothing matches');await expect(page.getByText('No investors match your search')).toBeVisible();
 await page.getByRole('button',{name:'Clear search'}).click();
 await page.screenshot({path:testInfo.outputPath('investors-public-desktop.png'),fullPage:true});
 await page.getByRole('button',{name:'Request a meeting',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Schedule Meeting',exact:true})).toBeVisible();
 await expect(page.getByText('With Amel Ben Salah',{exact:true})).toBeVisible();
 await page.getByRole('button',{name:'14:00',exact:true}).click();
 await page.locator('textarea').fill('Discuss our solar project');
 await page.getByRole('button',{name:'Submit for review',exact:true}).click();
 await expect.poll(()=>requests.length).toBe(1);
 await expect(page.getByRole('heading',{name:'Schedule Meeting',exact:true})).toHaveCount(0);
 expect(requests).toHaveLength(1);expect(requests[0]).toMatchObject({p_event:event,p_recipient:investor,p_message:'Discuss our solar project'});
 expect(writes).toHaveLength(0);expect(mail).toHaveLength(0);
});
test('anonymous visitors get a sign-in entry preserving the investor destination',async({page})=>{
 const {reads}=await setup(page,{signedIn:false});
 await expect(page.getByRole('heading',{name:'Sign in to meet the investors'})).toBeVisible();
 await expect(page.locator('.investor-showcase').getByRole('link',{name:'Sign in',exact:true})).toHaveAttribute('href',`/event-auth?redirect=${encodeURIComponent(`/event/${event}/investors`)}`);
 await expect(page.getByRole('button',{name:'Request a meeting',exact:true})).toHaveCount(0);
 expect(reads.filter(r=>r.name==='list_event_investors')).toHaveLength(0);
});
test('unregistered users cannot load investor profiles',async({page})=>{
 const {reads}=await setup(page,{registered:false});
 await expect(page.getByRole('heading',{name:'Join the event to meet its investors'})).toBeVisible();
 expect(reads.filter(r=>r.name==='list_event_investors')).toHaveLength(0);
});
test('investor directory errors offer retry rather than an empty roster',async({page})=>{
 await setup(page,{fail:true});await expect(page.getByRole('alert')).toContainText('We could not load the investor directory.');
 await expect(page.getByRole('button',{name:'Try again',exact:true})).toBeVisible();
});
for(const locale of ['fr','ar'])test(`${locale} investor navigation and booking action stay visible on mobile`,async({page},testInfo)=>{
 await page.setViewportSize({width:390,height:844});await setup(page,{locale});
 await expect(page.getByRole('heading',{name:'Amel Ben Salah',exact:true})).toBeVisible();
 await expect(page.locator('.nav-item--investors')).toBeInViewport();
 await expect(page.locator('.investor-showcase__card .investor-showcase__primary')).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.screenshot({path:testInfo.outputPath(`investors-public-${locale}-mobile.png`),fullPage:true});
});
