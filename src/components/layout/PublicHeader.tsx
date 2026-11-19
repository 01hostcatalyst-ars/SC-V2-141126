"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, ArrowRight, ChevronDown, FileText, Menu, ShieldCheck, X } from "lucide-react";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";

export interface PublicHeaderProps {
  activeRoute?: string;
  authButton?: React.ReactNode;
  rightBadge?: React.ReactNode;
}

const TOOLS = [
  { name: "Rate calculator", description: "Explore creator profiles and estimate rates.", href: "/influencer-rate-calculator", icon: Activity, active: /^\/(influencer-rate-calculator|calculator|scrapers)(\/|$)/ },
  { name: "Contracts", description: "Build and sign a creator agreement.", href: "/instant", icon: FileText, active: /^\/(instant|contracts|c)(\/|$)/ },
  { name: "Contract verification", description: "Check a signed document’s integrity.", href: "/verify", icon: ShieldCheck, active: /^\/verify(\/|$)/ },
];

export function PublicHeader({ activeRoute, authButton, rightBadge }: PublicHeaderProps) {
  const pathname = usePathname() || activeRoute || "/";
  const [toolsOpen, setToolsOpen] = useState(false);
  const [headerHidden, setHeaderHidden] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const toolsRef = useRef<HTMLDivElement>(null);
  const toolsButton = useRef<HTMLButtonElement>(null);
  const mobileDialog = useRef<HTMLDialogElement>(null);
  const toolsId = useId();
  const mobileId = useId();
  const creatorsActive = /^\/creators(\/|$)/.test(pathname);
  const academyActive = /^\/knowledge(\/|$)/.test(pathname);
  const toolsActive = TOOLS.some((tool) => tool.active.test(pathname));

  useEffect(() => {
    const outside = (event: PointerEvent) => {
      if (toolsRef.current && !toolsRef.current.contains(event.target as Node)) setToolsOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && toolsOpen) {
        setToolsOpen(false);
        toolsButton.current?.focus();
      }
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("pointerdown", outside); document.removeEventListener("keydown", escape); };
  }, [toolsOpen]);

  useEffect(() => {
    setToolsOpen(false);
    setHeaderHidden(false);
    mobileDialog.current?.close();
  }, [pathname]);

  useEffect(() => {
    const wide = window.matchMedia("(min-width: 900px)");
    const closeOnDesktop = () => { if (wide.matches) mobileDialog.current?.close(); };
    wide.addEventListener("change", closeOnDesktop);
    return () => wide.removeEventListener("change", closeOnDesktop);
  }, []);

  useEffect(() => {
    let previousY = Math.max(0, window.scrollY);
    let movement = 0;
    let frame = 0;
    const update = () => {
      frame = 0;
      const y = Math.max(0, window.scrollY);
      const delta = y - previousY;
      previousY = y;
      if (y < 80 || toolsOpen || mobileOpen || document.activeElement?.closest(".site-island-header")) {
        movement = 0;
        setHeaderHidden(false);
        return;
      }
      if (delta === 0) return;
      movement = Math.sign(delta) === Math.sign(movement) ? movement + delta : delta;
      if (Math.abs(movement) >= 8) {
        setHeaderHidden(movement > 0);
        movement = 0;
      }
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); if (frame) cancelAnimationFrame(frame); };
  }, [toolsOpen, mobileOpen]);

  const closeMobile = () => mobileDialog.current?.close();

  return (
    <header className="site-island-header" data-hidden={headerHidden && !toolsOpen && !mobileOpen} onFocusCapture={() => setHeaderHidden(false)}>
      <div className="site-island">
        <Link href="/" className="island-brand" aria-label="SignCollab home">SIGNCOLLAB</Link>
        <nav className="island-desktop-nav" aria-label="Main navigation">
          <Link href="/creators" className="island-nav-link" aria-current={creatorsActive ? "page" : undefined}>Creators</Link>
          <div ref={toolsRef} className="island-tools" onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setToolsOpen(false);
          }}>
            <button ref={toolsButton} type="button" className="island-nav-link island-tools-trigger" data-active={toolsActive} aria-expanded={toolsOpen} aria-controls={toolsId} onClick={() => setToolsOpen((open) => !open)} onKeyDown={(event) => {
              if (event.key === "ArrowDown") { event.preventDefault(); setToolsOpen(true); requestAnimationFrame(() => toolsRef.current?.querySelector<HTMLAnchorElement>(".island-tool-link")?.focus()); }
            }}>
              Tools <ChevronDown aria-hidden="true" className="h-3.5 w-3.5" data-open={toolsOpen} />
            </button>
            {toolsOpen && (
              <div id={toolsId} className="island-tools-panel">
                <p className="island-panel-eyebrow">Free during beta</p>
                {TOOLS.map((tool) => {
                  const Icon = tool.icon;
                  return <Link key={tool.href} href={tool.href} className="island-tool-link" aria-current={tool.active.test(pathname) ? "page" : undefined} onClick={() => setToolsOpen(false)}>
                    <span className="island-tool-icon"><Icon aria-hidden="true" className="h-4 w-4" strokeWidth={1.75} /></span>
                    <span><strong>{tool.name}</strong></span>
                    <ArrowRight aria-hidden="true" className="island-tool-arrow h-3.5 w-3.5" />
                  </Link>;
                })}
              </div>
            )}
          </div>
          <Link href="/knowledge" className="island-nav-link" aria-current={academyActive ? "page" : undefined}>Academy</Link>
        </nav>
        <div className="island-desktop-actions">
          {rightBadge && <div className="island-status">{rightBadge}</div>}
          {authButton ?? <GoogleSignInButton className="island-primary" />}
        </div>
        <button type="button" className="island-menu-button" aria-label="Open navigation" aria-haspopup="dialog" aria-controls={mobileId} onClick={() => { setHeaderHidden(false); mobileDialog.current?.showModal(); setMobileOpen(true); }}><Menu aria-hidden="true" className="h-5 w-5" strokeWidth={1.75} /></button>
      </div>

      <dialog ref={mobileDialog} id={mobileId} className="island-mobile-dialog" aria-label="Navigation" onClose={() => setMobileOpen(false)} onClick={(event) => { if (event.target === event.currentTarget) closeMobile(); }}>
        <div className="island-mobile-panel">
          <div className="island-mobile-heading"><span className="island-brand">SIGNCOLLAB</span><button type="button" aria-label="Close navigation" onClick={closeMobile}><X aria-hidden="true" className="h-5 w-5" /></button></div>
          <nav aria-label="Mobile navigation">
            <Link href="/creators" className="island-mobile-link" aria-current={creatorsActive ? "page" : undefined} onClick={closeMobile}>Creators<ArrowRight aria-hidden="true" className="h-4 w-4" /></Link>
            <p className="island-panel-eyebrow">Tools · free during beta</p>
            {TOOLS.map((tool) => {
              const Icon = tool.icon;
              return <Link key={tool.href} href={tool.href} className="island-tool-link" aria-current={tool.active.test(pathname) ? "page" : undefined} onClick={closeMobile}><span className="island-tool-icon"><Icon aria-hidden="true" className="h-4 w-4" strokeWidth={1.75} /></span><span><strong>{tool.name}</strong></span></Link>;
            })}
            <Link href="/knowledge" className="island-mobile-link" aria-current={academyActive ? "page" : undefined} onClick={closeMobile}>Academy<ArrowRight aria-hidden="true" className="h-4 w-4" /></Link>
          </nav>
          {rightBadge && <div className="island-mobile-status">{rightBadge}</div>}
          <div className="island-mobile-actions">
            {authButton ?? <GoogleSignInButton className="island-primary" onNavigate={closeMobile} />}
          </div>
        </div>
      </dialog>
    </header>
  );
}

export { PublicHeader as SuiteHeader };
