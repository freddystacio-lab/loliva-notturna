"use client";

import {useEffect} from "react";
import {usePathname, useSearchParams} from "next/navigation";

export function AnalyticsBeacon({locale}: {locale: "es" | "en" | "it"}) {
  const pathname = usePathname(); const search = useSearchParams();
  useEffect(() => {
    const event = pathname.endsWith("/menu") ? "menu_view" : "page_view";
    const properties: Record<string,string> = {section: pathname.split("/").filter(Boolean)[1] ?? "home"};
    if (search.get("source") === "qr") properties.source = "qr";
    const body = JSON.stringify({event,locale,properties});
    if (navigator.sendBeacon) navigator.sendBeacon("/api/analytics", new Blob([body],{type:"application/json"}));
    else fetch("/api/analytics",{method:"POST",headers:{"content-type":"application/json"},body,keepalive:true});
  }, [locale, pathname, search]);
  return null;
}
