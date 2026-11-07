import { test, expect } from '@playwright/test';
const event = '20000000-0000-4000-8000-000000000001';
const user = { id:'10000000-0000-4000-8000-000000000001',email:'amel@example.test',aud:'authenticated',role:'authenticated',app_metadata:{},user_metadata:{},created_at:'2026-01-01T00:00:00Z' };
const encode = value => Buffer.from(JSON.stringify(value)).toString('base64url');
const session = { access_token:`${encode({alg:'HS256',typ:'JWT'})}.${encode({sub:user.id,exp:Math.floor(Date.now()/1000)+3600})}.${encode('fixture')}`,refresh_token:'fixture',token_type:'bearer',expires_in:3600,user };
async function setup(page,{locale='en',enabled=true}={}) {
  const actions=[]; const state={authUser:user,managerAllowed:true,permissions:[],failPermission:null,invitations:[],registrationNeeded:false,requests:[],attendees:[],designations:[],meetings:[],inventory:{active:false,scheduled_pending:2,unscheduled_matches:10,confirmed:1,fingerprint:'snapshot'}};
  await page.addInitScript(locale=>localStorage.setItem('eventra_locale',locale),locale);
  await page.route('**/auth/v1/**',r=>r.fulfill({json:state.authUser}));
  await page.route('**/auth/v1/token**',r=>r.fulfill({json:session}));
  await page.route('**/functions/v1/**',r=>r.fulfill({json:{}}));
  await page.route('**/rest/v1/**',r=>{
    const url=new URL(r.request().url()); const name=url.pathname.split('/').pop(); const args=r.request().postDataJSON();
    let data=[];
    if(url.pathname.includes('/rpc/')){
      actions.push({name,args});
      if(name==='get_event_review_capabilities') data={released:enabled,enabled,can_designate:state.managerAllowed,can_review:state.managerAllowed,can_configure:state.managerAllowed};
      if(name==='set_event_review_permissions'){if(state.failPermission===args.p_user)return r.fulfill({status:400,json:{message:'permission unavailable'}});state.permissions=state.permissions.filter(p=>p.user_id!==args.p_user).concat({user_id:args.p_user,can_review:args.p_review,can_designate:args.p_designate});data=null;}
      if(name==='preview_event_investor_assignment') data=state.inventory;
      if(name==='set_event_investor'){if(args.p_active===false)state.designations=state.designations.filter(d=>d.attendee_id!==args.p_attendee);data=null;}
      if(name==='revoke_event_investor_invitation'){state.invitations=state.invitations.map(i=>i.id===args.p_invitation?{...i,status:'revoked'}:i);data=null;}
      if(name==='decide_investor_booking'){state.requests=state.requests.filter(item=>item.id!==args.p_request);data={state:'forwarded'};}
      if(name==='issue_event_investor_invitation') data={token:'a'.repeat(64)};
      if(name==='get_event_investor_invitation') data={event_id:event,event_name:'Investment Forum',status:'pending'};
      if(name==='accept_event_investor_invitation'){
        if(state.registrationNeeded) return r.fulfill({status:400,json:{code:'23514',message:'INVESTOR_REGISTRATION_REQUIRED'}});
        data={event_id:event,event_name:'Investment Forum',status:'accepted'};
      }
    } else if(name==='profiles') data=url.searchParams.get('id')?.startsWith('in.') ? [{id:'requester',full_name:'Youssef Ben Ali',company:'Solar Lab'},{id:'recipient',full_name:'Amel Ben Salah',company:'Atlas Ventures'}] : {...user,full_name:'Amel Ben Salah',role:'user'};
    else if(name==='event_team_members') data=[{user_id:'requester',role:'coordinator'},{user_id:'recipient',role:'administrator'}];
    else if(name==='event_review_permissions') data=url.searchParams.has('user_id')?state.permissions.find(p=>'eq.'+p.user_id===url.searchParams.get('user_id'))||null:state.permissions;
    else if(name==='event_booking_requests') data=state.requests;
    else if(name==='event_investor_invitations') data=state.invitations;
    else if(name==='event_investor_designations') data=state.designations;
    else if(name==='event_attendees') data=state.attendees;
    else if(name==='event_b2b_meetings') data=state.meetings;
    else if(name==='events') data=url.searchParams.get('select')==='owner_id,organizer_id'?{owner_id:user.id,organizer_id:user.id}:url.searchParams.get('select')==='timezone'?{timezone:'Africa/Tunis'}:[{id:event,timezone:'Africa/Tunis'}];
    else if(name==='event_b2b_settings') data=url.searchParams.get('select')==='venue_config'?{venue_config:{}}:[{event_id:event,venue_config:{}}];
    return r.fulfill({json:data});
  });
  return {actions,state};
}
async function signIn(page){await page.evaluate(async session=>{const {supabase}=await import('/src/lib/supabase.ts');await supabase.auth.setSession(session);},session);}

test('review permissions require explicit selection and save separately from investor access',async({page},testInfo)=>{
  const {actions}=await setup(page);
  await page.goto('/tests/fixtures/investor-review.html?mode=settings');await signIn(page);
  await expect(page.getByRole('button',{name:'Save permissions'})).toBeDisabled();
  await page.getByRole('checkbox',{name:'Youssef Ben Ali',exact:true}).check();
  await page.getByLabel('Review meeting requests',{exact:true}).check();
  await page.getByRole('button',{name:'Save permissions'}).click();
  await expect.poll(()=>actions.find(a=>a.name==='set_event_review_permissions')?.args).toEqual({p_event:event,p_user:'requester',p_designate:false,p_review:true});
  await page.screenshot({path:testInfo.outputPath('review-settings.png'),fullPage:true});
});

test('creator cannot approve their own request even with review permission',async({page})=>{
  const {state}=await setup(page);
  state.requests=[{id:'own-request',created_by:user.id,event_id:event,requester_id:'requester',recipient_id:'recipient',starts_at:'2027-11-26T14:00:00Z',ends_at:'2027-11-26T14:30:00Z',format:'in-person',message:'Team arranged meeting',state:'awaiting_review',revision:1,meeting_id:null}];
  await page.goto('/tests/fixtures/investor-review.html?mode=queue');await signIn(page);
  await expect(page.getByRole('button',{name:'Approve and forward'})).toBeDisabled();
  await expect(page.getByRole('button',{name:'Reject request'})).toBeDisabled();
});
test('assignment requires an explicit existing-invitation choice and uses the reviewed snapshot',async({page},testInfo)=>{
  const {actions}=await setup(page);
  await page.goto('/tests/fixtures/investor-review.html');
  await signIn(page);
  await page.getByLabel('Choose an attendee').selectOption('attendee-1');
  await page.getByRole('button',{name:'Review assignment'}).click();
  await expect(page.getByRole('button',{name:'Assign Investor',exact:true})).toBeDisabled();
  await expect(page.getByText('Unscheduled matches: 10')).toBeVisible();
  await page.getByLabel('Review incoming invitations first').check();
  await page.screenshot({path:testInfo.outputPath('investor-assignment-desktop.png'),fullPage:true});
  await page.getByRole('button',{name:'Assign Investor',exact:true}).click();
  await expect(page.getByRole('status')).toContainText('Investor access updated');
  expect(actions.find(a=>a.name==='set_event_investor').args).toMatchObject({p_existing:'review',p_expected:{fingerprint:'snapshot'}});
});
test('feature release lock hides organizer actions',async({page})=>{
  await setup(page,{enabled:false}); await page.goto('/tests/fixtures/investor-review.html');
  await signIn(page);
  await expect(page.getByRole('button',{name:'Create invitation link'})).toHaveCount(0);
});
test('invitation previews never accept automatically and strip bearer secret from navigation',async({page})=>{
  const {actions}=await setup(page);
  await page.goto(`/tests/fixtures/investor-review.html?mode=invitation#token=${'a'.repeat(64)}`); await signIn(page);
  await expect(page.getByRole('button',{name:'Accept investor invitation',exact:true})).toBeVisible();
  expect(page.url()).not.toContain('aaaa');
  expect(actions.filter(a=>a.name==='accept_event_investor_invitation')).toHaveLength(0);
  await page.getByRole('button',{name:'Accept investor invitation',exact:true}).click();
  await expect(page.getByRole('heading',{name:'You’re registered as an investor'})).toBeVisible();
  expect(await page.evaluate(()=>sessionStorage.getItem('eventra:investor-invitation'))).toBeNull();
});
test('missing registration uses the normal event registration flow',async({page})=>{
  const {state}=await setup(page);state.registrationNeeded=true;
  await page.goto(`/tests/fixtures/investor-review.html?mode=invitation#token=${'a'.repeat(64)}`);await signIn(page);
  await page.getByRole('button',{name:'Accept investor invitation',exact:true}).click();
  await expect(page.getByRole('link',{name:'Complete event registration'})).toHaveAttribute('href',`/event/${event}/register`);
  state.registrationNeeded=false; await page.getByRole('button',{name:'I’ve registered — check again'}).click();
  await expect(page.getByRole('link',{name:'Open event'})).toBeVisible();
});
for(const locale of ['fr','ar']) test(`${locale} organizer controls fit mobile`,async({page},testInfo)=>{
  await setup(page,{locale});await page.setViewportSize({width:390,height:844});await page.goto('/tests/fixtures/investor-review.html');
  await signIn(page);
  await expect(page.locator('.investor-review')).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.screenshot({path:testInfo.outputPath(`investor-${locale}-mobile.png`),fullPage:true});
});

test('review queue shows participant context and submits a versioned decision',async({page},testInfo)=>{
  const {state,actions}=await setup(page);
  state.requests=[{id:'review-1',event_id:event,requester_id:'requester',recipient_id:'recipient',starts_at:'2027-11-26T14:00:00Z',ends_at:'2027-11-26T14:30:00Z',format:'in-person',message:'We are raising funding to expand our solar installations.',state:'awaiting_review',revision:3,meeting_id:null}];
  await page.goto('/tests/fixtures/investor-review.html?mode=queue');await signIn(page);
  await expect(page.getByRole('link',{name:'Youssef Ben Ali · Solar Lab'})).toBeVisible();
  await expect(page.getByText('We are raising funding to expand our solar installations.')).toBeVisible();
  await page.screenshot({path:testInfo.outputPath('investor-review-queue.png'),fullPage:true});
  await page.getByRole('button',{name:'Approve and forward'}).click();
  await expect(page.getByText('No requests awaiting review')).toBeVisible();
  expect(actions.find(a=>a.name==='decide_investor_booking').args).toMatchObject({p_request:'review-1',p_revision:3,p_decision:'approve'});
});

test('switching accounts cannot reuse the previous organizer invitation cache',async({page})=>{
  const {state,actions}=await setup(page);
  state.invitations=[{id:'private-invite',email:'privateinvestor@example.test',status:'pending',expires_at:'2027-12-01T00:00:00Z'}];
  await page.goto('/tests/fixtures/investor-review.html');await signIn(page);
  await expect(page.getByText('privateinvestor@example.test')).toBeVisible();
  state.authUser={...user,id:'10000000-0000-4000-8000-000000000099',email:'different@example.test'};state.managerAllowed=false;
  await signIn(page);
  await expect(page.getByText('privateinvestor@example.test')).toHaveCount(0);
  await expect(page.getByRole('button',{name:'Create invitation link'})).toHaveCount(0);
  expect(actions.filter(a=>a.name==='get_event_review_capabilities').length).toBeGreaterThanOrEqual(2);
});

function seedDirectory(state) {
  state.attendees=[{id:'investor-1',profile_id:'recipient',name:'Amel Ben Salah',email:'amel@example.test',company:'Atlas Ventures',status:'registered'},
    {id:'founder-1',profile_id:'requester',name:'Youssef Ben Ali',email:'youssef@example.test',company:'Solar Lab',status:'approved'}];
  state.designations=[{attendee_id:'investor-1',source:'invitation',assigned_at:'2026-11-07T10:00:00Z'}];
  state.meetings=[{id:'meeting-1',attendee_a_id:'investor-1',attendee_b_id:'founder-1',start_at:'2027-11-26T14:00:00Z',end_at:'2027-11-26T14:30:00Z',status:'confirmed',location:'Table-01'}];
  state.invitations=[{id:'invite-1',email:'new@example.test',status:'pending',expires_at:'2099-12-01T00:00:00Z'}];
}

test('investor directory separates tools, searches people and opens their meeting details',async({page},testInfo)=>{
  const {state}=await setup(page);seedDirectory(state);
  await page.goto('/tests/fixtures/investor-review.html?mode=directory');await signIn(page);
  await expect(page.getByRole('cell',{name:'Atlas Ventures',exact:true})).toBeVisible();
  await expect(page.getByRole('button',{name:'Create invitation link'})).toHaveCount(0);
  await expect(page.getByRole('button',{name:'Save permissions'})).toHaveCount(0);
  await page.getByRole('textbox',{name:'Search name, company or email'}).fill('missing person');
  await expect(page.getByText('No investors match your search')).toBeVisible();
  await page.getByRole('button',{name:'Clear search'}).click();
  await page.screenshot({path:testInfo.outputPath('investor-directory-desktop.png'),fullPage:true});
  await page.getByRole('button',{name:'See meetings: Amel Ben Salah',exact:true}).click();
  await expect(page.getByRole('dialog')).toContainText('Youssef Ben Ali');
  await expect(page.getByRole('dialog')).toContainText('Confirmed');
  await expect(page.getByRole('dialog')).toContainText('Africa/Tunis');
  await page.screenshot({path:testInfo.outputPath('investor-meetings.png'),fullPage:true});
  await page.keyboard.press('Escape');await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('add investor focuses on one path and only shows eligible unassigned attendees',async({page})=>{
  const {state,actions}=await setup(page);seedDirectory(state);
  await page.goto('/tests/fixtures/investor-review.html?mode=directory');await signIn(page);
  await page.getByRole('button',{name:'Add investor',exact:true}).click();
  await page.getByRole('button',{name:/Choose a registered attendee/}).click();
  await expect(page.getByRole('button',{name:'Create invitation link'})).toHaveCount(0);
  await expect(page.getByLabel('Choose an attendee').locator('option')).toHaveCount(2);
  await page.getByLabel('Choose an attendee').selectOption('founder-1');
  await page.getByRole('button',{name:'Review assignment'}).click();
  await expect(page.getByRole('button',{name:'Assign Investor',exact:true})).toBeDisabled();
  await page.getByLabel('Keep existing invitations').check();
  await page.getByRole('button',{name:'Assign Investor',exact:true}).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  expect(actions.find(a=>a.name==='set_event_investor').args).toMatchObject({p_attendee:'founder-1',p_existing:'preserve',p_expected:{fingerprint:'snapshot'}});
});

test('removing investor access requires confirmation and updates the directory',async({page})=>{
  const {state,actions}=await setup(page);seedDirectory(state);
  await page.goto('/tests/fixtures/investor-review.html?mode=directory');await signIn(page);
  await page.getByRole('button',{name:'View: Amel Ben Salah',exact:true}).click();
  await expect(page.getByRole('link',{name:'Open full profile'})).toHaveAttribute('href',`/event/${event}/profile/recipient`);
  await page.getByRole('button',{name:'Remove investor access',exact:true}).click();
  expect(actions.filter(a=>a.name==='set_event_investor')).toHaveLength(0);
  await page.getByRole('button',{name:'Remove access',exact:true}).click();
  await expect(page.getByText('Build your investor directory')).toBeVisible();
  expect(actions.find(a=>a.name==='set_event_investor').args).toEqual({p_event:event,p_attendee:'investor-1',p_active:false});
});

test('invitation table separates pending invitations and confirms revocation',async({page})=>{
  const {state,actions}=await setup(page);seedDirectory(state);
  await page.goto('/tests/fixtures/investor-review.html?mode=directory');await signIn(page);
  await page.getByRole('button',{name:/^Invitations/}).click();
  await expect(page.getByRole('cell',{name:'new@example.test'})).toBeVisible();
  await page.getByRole('button',{name:'Revoke link',exact:true}).click();
  expect(actions.filter(a=>a.name==='revoke_event_investor_invitation')).toHaveLength(0);
  await page.getByRole('dialog').getByRole('button',{name:'Revoke link',exact:true}).click();
  await expect(page.getByRole('cell',{name:'Revoked',exact:true})).toBeVisible();
});

for (const locale of ['fr','ar']) test(`${locale} investor directory and add dialog fit mobile`,async({page},testInfo)=>{
  const {state}=await setup(page,{locale});seedDirectory(state);await page.setViewportSize({width:390,height:844});
  await page.goto('/tests/fixtures/investor-review.html?mode=directory');await signIn(page);
  await expect(page.locator('.investors-person')).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.screenshot({path:testInfo.outputPath(`directory-${locale}-mobile.png`),fullPage:true});
  await page.locator('.investors-heading .investors-primary').click();
  await expect(page.getByRole('dialog')).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.screenshot({path:testInfo.outputPath(`add-${locale}-mobile.png`),fullPage:true});
});

test('directory permission changes hide management and reviewer controls',async({page})=>{
  const {state}=await setup(page);seedDirectory(state);state.managerAllowed=false;
  await page.goto('/tests/fixtures/investor-review.html?mode=directory');await signIn(page);
  await expect(page.getByRole('cell',{name:'Atlas Ventures'})).toBeVisible();
  await expect(page.getByRole('button',{name:'Add investor'})).toHaveCount(0);
  await page.getByRole('button',{name:'Meeting requests',exact:true}).click();
  await expect(page.getByText('Meeting review access is required')).toBeVisible();
  await expect(page.getByRole('button',{name:'Approve and forward'})).toHaveCount(0);
});


test('granting multiple members preserves existing rights and lists individual access',async({page})=>{
  const {state,actions}=await setup(page);
  state.permissions=[{user_id:'requester',can_designate:true,can_review:false}];
  await page.goto('/tests/fixtures/investor-review.html?mode=settings');await signIn(page);
  await page.getByRole('checkbox',{name:'Youssef Ben Ali',exact:true}).check();
  await page.getByRole('checkbox',{name:'Amel Ben Salah',exact:true}).check();
  await page.locator('form').getByLabel('Review meeting requests',{exact:true}).check();
  await page.getByRole('button',{name:'Save permissions'}).click();
  await expect(page.getByRole('heading',{name:'People with access (2)'})).toBeVisible();
  expect(actions.filter(a=>a.name==='set_event_review_permissions').map(a=>a.args)).toEqual([
    {p_event:event,p_user:'requester',p_designate:true,p_review:true},
    {p_event:event,p_user:'recipient',p_designate:false,p_review:true}
  ]);
  const member=page.getByRole('article',{name:'Youssef Ben Ali'});
  await member.getByLabel('Manage investor access',{exact:true}).click();
  await expect(member.getByLabel('Manage investor access',{exact:true})).not.toBeChecked();
  await expect(member.getByLabel('Review meeting requests',{exact:true})).toBeChecked();
  await member.getByRole('button',{name:'Remove access'}).click();
  await expect(page.getByRole('heading',{name:'People with access (1)'})).toBeVisible();
  await expect(page.getByRole('article',{name:'Amel Ben Salah'})).toBeVisible();
});

test('partial bulk permission failure keeps successful grants and retries only remaining members',async({page})=>{
  const {state,actions}=await setup(page);state.failPermission='recipient';
  await page.goto('/tests/fixtures/investor-review.html?mode=settings');await signIn(page);
  await page.getByRole('checkbox',{name:'Youssef Ben Ali',exact:true}).check();
  await page.getByRole('checkbox',{name:'Amel Ben Salah',exact:true}).check();
  await page.locator('form').getByLabel('Review meeting requests',{exact:true}).check();
  await page.getByRole('button',{name:'Save permissions'}).click();
  await expect(page.getByRole('alert')).toContainText('Some changes could not be saved');
  await expect(page.getByRole('heading',{name:'People with access (1)'})).toBeVisible();
  await expect(page.getByRole('checkbox',{name:'Youssef Ben Ali',exact:true})).not.toBeChecked();
  await expect(page.getByRole('checkbox',{name:'Amel Ben Salah',exact:true})).toBeChecked();
  state.failPermission=null;
  await page.getByRole('button',{name:'Save permissions'}).click();
  await expect(page.getByRole('heading',{name:'People with access (2)'})).toBeVisible();
  expect(actions.filter(a=>a.name==='set_event_review_permissions'&&a.args.p_user==='requester')).toHaveLength(1);
});

test('French access list fits mobile and review toolbar buttons have spacing',async({page},testInfo)=>{
  const {state}=await setup(page,{locale:'fr'});state.permissions=[{user_id:'requester',can_designate:true,can_review:true},{user_id:'recipient',can_designate:false,can_review:true}];
  await page.setViewportSize({width:390,height:844});
  await page.goto('/tests/fixtures/investor-review.html?mode=settings');await signIn(page);
  await expect(page.locator('.investor-review__access-person')).toHaveCount(2);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.screenshot({path:testInfo.outputPath('permissions-fr-mobile.png'),fullPage:true});
  await page.goto('/tests/fixtures/investor-review.html?mode=queue');await signIn(page);
  const toolbar=page.locator('.investor-review__toolbar');await expect(toolbar).toBeVisible();
  const boxes=await toolbar.locator('button').evaluateAll(buttons=>buttons.map(b=>{const r=b.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom};}));
  expect(boxes[1].left-boxes[0].right>=10||boxes[1].top-boxes[0].bottom>=10).toBe(true);
  await page.screenshot({path:testInfo.outputPath('review-toolbar-fr-mobile.png'),fullPage:true});
});
