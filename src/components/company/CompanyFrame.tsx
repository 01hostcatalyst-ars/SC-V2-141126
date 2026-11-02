import type { ReactNode } from 'react';
import Link from 'next/link';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicFooter } from '@/components/layout/PublicFooter';
import styles from './CompanyPages.module.css';

export function CompanyFrame({ current, children }: { current: string; children: ReactNode }) {
  return <div className={styles.page}><PublicHeader activeRoute={current} /><main className={styles.main}><nav className={styles.companyNav} aria-label="Company pages">{[['/about','About us'],['/vision','Our vision'],['/contact','Contact']].map(([href,label])=><Link key={href} href={href} aria-current={current===href?'page':undefined}>{label}</Link>)}</nav>{children}</main><PublicFooter /></div>;
}
