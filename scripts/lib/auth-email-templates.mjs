import { renderBrandedNotice } from '../../supabase/functions/_shared/emailBrand.mjs';

// Preserve Supabase's action URLs, codes and identity placeholders exactly.
// No auth setting, expiry, redirect destination or enabled channel is changed.
export function buildAuthEmailTemplates(original) {
  const result={};
  for(const [key,source] of Object.entries(original)) {
    if(key.startsWith('mailer_subjects_') && typeof source==='string') result[key]=source.startsWith('Eventra')?source:`Eventra — ${source}`;
    if(!key.startsWith('mailer_templates_') || !key.endsWith('_content') || typeof source!=='string') continue;
    const originalTitle=source.match(/<h2>([\s\S]*?)<\/h2>/)?.[1] || 'Your Eventra account';
    const title=({'Magic Link':'Your Eventra sign-in link','Confirm your signup':'Confirm your email address','Confirm Change of Email':'Confirm your new email address','Reset Password':'Reset your password'})[originalTitle] || originalTitle;
    let content=source.replace(/<h2>[\s\S]*?<\/h2>/,'');
    const action=content.match(/<p><a href="({{ \.ConfirmationURL }})">([^<]+)<\/a><\/p>/);
    if(action)content=content.replace(action[0],'');
    content=content.replace('Follow this link to reset the password for your user:','We received a request to reset your Eventra password. Use the button below to choose a new password.')
      .replace('Follow this link to login:','Use the button below to sign in to your Eventra account.')
      .replace('Follow this link to confirm your user:','Confirm your email address to finish setting up your Eventra account.')
      .replace('You have been invited to create a user on {{ .SiteURL }}. Follow this link to accept the invite:','You have been invited to Eventra ({{ .SiteURL }}). Accept the invitation to set up your account.');
    content=content.replace(/<p>/g,'<p class="eb-copy" style="font-size:15px;line-height:1.75;color:#526579;margin:0 0 16px">')
      .replace('{{ .Token }}','<strong style="display:block;font-family:monospace;font-size:28px;letter-spacing:5px;padding:18px;background:#eaf4ff;color:#0b2641;margin-top:14px">{{ .Token }}</strong>');
    result[key]=renderBrandedNotice({title,contentHtml:content,url:action?.[1],action:action?.[2],category:'ACCOUNT & SECURITY',footer:'Keep sign-in links and verification codes private. If you did not request this action, contact Eventra support.'});
    const tokens=value=>[...new Set(value.match(/{{[^}]+}}/g)||[])].sort();
    if(JSON.stringify(tokens(source))!==JSON.stringify(tokens(result[key])))throw new Error(`Auth placeholders changed: ${key}`);
  }
  return result;
}
