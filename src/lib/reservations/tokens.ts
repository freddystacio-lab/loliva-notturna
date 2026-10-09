import {createHash, createHmac, timingSafeEqual} from "node:crypto";

export function hashManageToken(token: string) { return createHash("sha256").update(token).digest("hex"); }
export const RESERVATION_ACCESS_COOKIE = "loliva_reservation_access";

export function createReservationSession(code: string) {
  const secret = process.env.RESERVATION_TOKEN_SECRET; if (!secret) return null;
  const payload = Buffer.from(JSON.stringify({code:code.toUpperCase(),exp:Date.now()+24*60*60*1000})).toString("base64url");
  const signature = createHmac("sha256",secret).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

export function verifyReservationSession(code: string, session: string | undefined) {
  const secret=process.env.RESERVATION_TOKEN_SECRET; if(!secret||!session)return false;
  const [payload,provided]=session.split("."); if(!payload||!provided)return false;
  const expected=createHmac("sha256",secret).update(payload).digest("base64url");
  const left=Buffer.from(provided); const right=Buffer.from(expected);
  if(left.length!==right.length||!timingSafeEqual(left,right))return false;
  try { const parsed=JSON.parse(Buffer.from(payload,"base64url").toString()) as {code?:unknown;exp?:unknown}; return parsed.code===code.toUpperCase()&&typeof parsed.exp==="number"&&parsed.exp>Date.now(); }
  catch{return false;}
}
