import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {renderBrandedNotice} from '../supabase/functions/_shared/emailBrand.mjs';
import {buildAuthEmailTemplates} from '../scripts/lib/auth-email-templates.mjs';
const original=JSON.parse(readFileSync(new URL('../scripts/lib/auth-email-content.json',import.meta.url),'utf8'));

test('all 13 auth templates are branded and keep their original provider variables',()=>{
 const result=buildAuthEmailTemplates(original);
 const keys=Object.keys(result).filter(key=>key.startsWith('mailer_templates_'));
 assert.equal(keys.length,13);
 for(const key of keys){
  const tokens=value=>[...new Set(value.match(/{{[^}]+}}/g)||[])].sort();
  assert.deepEqual(tokens(result[key]),tokens(original[key]));
  assert.match(result[key],/bgcolor="#0b2641"/);assert.match(result[key],/role="presentation"/);
  assert.match(result[key],/<!doctype html>/);
 }
 assert.match(result.mailer_templates_recovery_content,/href="{{ \.ConfirmationURL }}"/);
 assert.match(result.mailer_templates_reauthentication_content,/{{ \.Token }}/);
 assert.equal(Object.keys(result).length,26);
});

test('shared branded notice escapes all ordinary content and keeps one valid document',()=>{
 const html=renderBrandedNotice({title:'<script>unsafe</script>',body:'<img src=x onerror=alert(1)>',url:'https://eventra.cloud/messages?x=1&y=2',action:'<b>Read</b>',details:[['<name>','<private>']]});
 assert.doesNotMatch(html,/<script>|<img/);assert.match(html,/&lt;private&gt;/);
 assert.match(html,/x=1&amp;y=2/);assert.equal((html.match(/<body/g)||[]).length,1);
 assert.throws(()=>renderBrandedNotice({title:'test',url:'javascript:alert(1)'}));
});
