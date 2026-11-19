import Link from "next/link";
import { getCompanyConfig } from "@/lib/config";
import styles from "./PublicFooter.module.css";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";

const linkGroups = [
  {
    title: "Tools",
    links: [
      { label: "Rate calculator", href: "/influencer-rate-calculator" },
      { label: "Create a contract", href: "/instant" },
      { label: "Verify a document", href: "/verify" },
      { label: "Features", href: "/features" },
      { label: "Pricing", href: "/pricing" },
    ],
  },
  {
    title: "Explore",
    links: [
      { label: "Creator directory", href: "/creators" },
      { label: "Knowledge base", href: "/knowledge" },
      { label: "Pricing survey", href: "/survey" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About us", href: "/about" },
      { label: "Vision & mission", href: "/vision" },
      { label: "Contact & support", href: "/contact" },
    ],
  },
];

export function PublicFooter() {
  const company = getCompanyConfig();
  return <footer className={styles.footer}>
    <div className={styles.container}>
      <div className={styles.main}>
        <div className={styles.brand}>
          <Link href="/" className={styles.logo} aria-label="SignCollab home">SIGNCOLLAB</Link>
          <p>Discover creators, understand sponsorship rates, and build clear partnership agreements.</p>
        </div>
        {linkGroups.map(group => <nav key={group.title} aria-label={`Footer ${group.title.toLowerCase()}`} className={group.title === "Company" ? styles.company : undefined}>
          <h2>{group.title}</h2>
          <ul>
            {group.links.map(link => <li key={link.href}><Link href={link.href}>{link.label}</Link></li>)}
            {group.title === "Company" && <li><GoogleSignInButton className="google-auth-footer" /></li>}
          </ul>
        </nav>)}
      </div>
      <div className={styles.bottom}>
        <p className={styles.copyright}>© {new Date().getFullYear()} SignCollab. All rights reserved.</p>
        <nav aria-label="Footer legal" className={styles.legal}>
          <Link href="/terms">Terms</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/data-deletion">Data deletion</Link>
        </nav>
        <a href={`mailto:${company.supportEmail}`} className={styles.email}>{company.supportEmail}</a>
      </div>
    </div>
  </footer>;
}
