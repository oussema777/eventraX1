// Compatibility endpoint: use the same authorized, branded dispatcher as the web app.
// Caller-provided recipients/HTML are never a second mail-sending path.
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
const cors={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type'};
const json=(body:unknown,status:number)=>new Response(JSON.stringify(body),{status,headers:{...cors,'Content-Type':'application/json'}});
serve(async(req:Request)=>{
  if(req.method==='OPTIONS')return new Response(null,{status:204,headers:cors});
  if(req.method!=='POST')return json({error:'Method not allowed'},405);
  const authorization=req.headers.get('authorization');
  if(!authorization || !/^Bearer [^\s]+$/.test(authorization))return json({error:'Sign in required'},401);
  try {
    const text=await req.text();if(text.length>16384)return json({error:'Email command too large'},413);
    const command=JSON.parse(text);
    if(!command || typeof command!=='object' || Array.isArray(command) || typeof command.kind!=='string' || typeof command.entityId!=='string'
      || Object.keys(command).some(key=>!['kind','entityId','recipientId','subject','message','channel'].includes(key)))return json({error:'Use an authorized email command'},400);
    const origin=Deno.env.get('EVENTRA_APP_ORIGIN');
    if(origin!=='https://eventra.cloud')return json({error:'Email service unavailable'},503);
    const response=await fetch(origin+'/api/send-email',{method:'POST',redirect:'error',signal:AbortSignal.timeout(15000),headers:{'Content-Type':'application/json',Authorization:authorization},body:JSON.stringify(command)});
    const data=await response.json();
    return json(data,response.status);
  } catch { return json({error:'Email service unavailable'},503); }
});
