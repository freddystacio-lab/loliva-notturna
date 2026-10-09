import type {Locale} from "@/i18n/routing";

export function FlagIcon({locale, className=""}:{locale:Locale;className?:string}) {
  const common={className:`flag-icon ${className}`,viewBox:"0 0 24 16",role:"img","aria-hidden":true} as const;
  if(locale==="es") return <svg {...common}><rect width="24" height="16" fill="#aa151b"/><rect y="4" width="24" height="8" fill="#f1bf00"/></svg>;
  if(locale==="it") return <svg {...common}><rect width="8" height="16" fill="#008c45"/><rect x="8" width="8" height="16" fill="#f4f5f0"/><rect x="16" width="8" height="16" fill="#cd212a"/></svg>;
  return <svg {...common}><rect width="24" height="16" fill="#012169"/><path d="M0 0l24 16M24 0L0 16" stroke="#fff" strokeWidth="3.2"/><path d="M0 0l24 16M24 0L0 16" stroke="#c8102e" strokeWidth="1.4"/><path d="M12 0v16M0 8h24" stroke="#fff" strokeWidth="5"/><path d="M12 0v16M0 8h24" stroke="#c8102e" strokeWidth="2.8"/></svg>;
}
