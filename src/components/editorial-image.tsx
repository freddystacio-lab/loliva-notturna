import Image from "next/image";

export function EditorialImage({className = "", label, src}: {className?: string; label: string; src?: string}) {
  return (
    <div role="img" aria-label={label} className={`relative overflow-hidden bg-[var(--olive)] ${className}`}>
      {src ? <Image src={src} alt="" fill priority sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" /> : <><div className="absolute inset-0 opacity-80 [background:radial-gradient(circle_at_70%_25%,#b5965a66,transparent_28%),linear-gradient(145deg,#435548,#172019_70%)]" /><div className="absolute right-[12%] bottom-[-15%] h-[65%] w-[45%] rounded-[50%] border border-white/10 bg-black/20 blur-sm" /></>}
    </div>
  );
}
