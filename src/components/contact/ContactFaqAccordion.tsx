import styles from '@/components/company/CompanyPages.module.css';
export const CONTACT_FAQS = [
 { question: 'Where will you send your reply?', answer: 'We reply to the email address you enter in the form. Please check that it is correct before sending.' },
 { question: 'What should I include when reporting a problem?', answer: 'Include the page URL, the steps that led to the issue, your browser and device, and any visible error message. Please leave out passwords and one-time verification codes.' },
 { question: 'Can I ask about partnerships or agency workflows?', answer: 'Yes. Choose Partnerships & sales in the form and tell us about your team, workflow, or collaboration idea.' },
 { question: 'Can I suggest a feature?', answer: 'Absolutely. Choose General question and describe what you are trying to achieve. Your feedback helps shape the product.' },
];
export function ContactFaqAccordion() { return <div className={styles.faqs}>{CONTACT_FAQS.map(item=><details key={item.question}><summary>{item.question}</summary><p>{item.answer}</p></details>)}</div>; }
