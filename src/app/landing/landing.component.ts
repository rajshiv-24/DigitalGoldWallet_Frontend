import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule }  from '@angular/common';
import { RouterLink }    from '@angular/router';

interface Feature {
  icon:        string;
  title:       string;
  description: string;
  accentClass: string;
}

interface Stat {
  value:  string;
  label:  string;
  prefix: string;
  suffix: string;
}

interface FooterLink {
  label: string;
  route: string;
}

@Component({
  selector:    'app-landing',
  standalone:  true,
  imports:     [CommonModule, RouterLink],
  templateUrl: './landing.component.html',
  styleUrls:   ['./landing.component.css']
})
export class LandingComponent implements OnInit, OnDestroy {

  isNavScrolled    = false;
  isMobileNavOpen  = false;
  currentYear      = new Date().getFullYear();

  // ── Animated counters ─────────────────────────────────────
  animatedStats: { value: number; target: number; display: string }[] = [];
  private counterInterval: ReturnType<typeof setInterval> | null = null;
  private hasAnimated = false;

  readonly stats: Stat[] = [
    { value: '2,50,000', label: 'Active investors',       prefix: '',  suffix: '+'  },
    { value: '500',      label: 'Crore assets managed',   prefix: '₹', suffix: 'Cr+' },
    { value: '99.9',     label: 'Platform uptime',        prefix: '',  suffix: '%'  },
    { value: '4.9',      label: 'App store rating',       prefix: '',  suffix: '★'  }
  ];

  readonly features: Feature[] = [
    {
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28"
               viewBox="0 0 24 24" fill="none" stroke="currentColor"
               stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
               <circle cx="12" cy="12" r="10"/>
               <line x1="12" y1="8" x2="12" y2="16"/>
               <line x1="8" y1="12" x2="16" y2="12"/>
             </svg>`,
      title:       'Buy digital gold',
      description: 'Purchase 24K pure gold starting from ₹1. Instant credit to your wallet with live market pricing and zero hidden charges.',
      accentClass: 'accent-gold'
    },
    {
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28"
               viewBox="0 0 24 24" fill="none" stroke="currentColor"
               stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
               <circle cx="12" cy="12" r="10"/>
               <line x1="8" y1="12" x2="16" y2="12"/>
             </svg>`,
      title:       'Sell anytime',
      description: 'Liquidate your gold holdings instantly at the best market rate. Proceeds are credited to your wallet within minutes.',
      accentClass: 'accent-red'
    },
    {
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28"
               viewBox="0 0 24 24" fill="none" stroke="currentColor"
               stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
               <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/>
               <path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/>
               <path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/>
             </svg>`,
      title:       'Wallet management',
      description: 'Top up your wallet, track balances, and manage funds with a clean, intuitive interface built for serious investors.',
      accentClass: 'accent-blue'
    },
    {
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28"
               viewBox="0 0 24 24" fill="none" stroke="currentColor"
               stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
               <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
               <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
             </svg>`,
      title:       'Secure transactions',
      description: 'Bank-grade 256-bit encryption, JWT-authenticated sessions, and real-time fraud monitoring protect every transaction.',
      accentClass: 'accent-green'
    },
    {
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28"
               viewBox="0 0 24 24" fill="none" stroke="currentColor"
               stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
               <rect x="2" y="7" width="20" height="14" rx="2"/>
               <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
             </svg>`,
      title:       'Physical delivery',
      description: 'Convert your digital gold to physical coins or bars and have them delivered securely to your doorstep.',
      accentClass: 'accent-purple'
    },
    {
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28"
               viewBox="0 0 24 24" fill="none" stroke="currentColor"
               stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
               <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
               <polyline points="17 6 23 6 23 12"/>
             </svg>`,
      title:       'Portfolio analytics',
      description: 'Track your gold portfolio performance with detailed charts, historical data, and gain/loss summaries in one place.',
      accentClass: 'accent-teal'
    }
  ];

  readonly footerProducts: FooterLink[] = [
    { label: 'Buy gold',       route: '/auth/login' },
    { label: 'Sell gold',      route: '/auth/login' },
    { label: 'Digital wallet', route: '/auth/login' },
    { label: 'Physical gold',  route: '/auth/login' }
  ];

  readonly footerCompany: FooterLink[] = [
    { label: 'About us',    route: '/' },
    { label: 'Careers',     route: '/' },
    { label: 'Press',       route: '/' },
    { label: 'Contact',     route: '/' }
  ];

  readonly footerLegal: FooterLink[] = [
    { label: 'Privacy policy',    route: '/' },
    { label: 'Terms of service',  route: '/' },
    { label: 'Cookie policy',     route: '/' },
    { label: 'Grievance redress', route: '/' }
  ];

  // ── Scroll listener: shrink navbar ────────────────────────
  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.isNavScrolled = window.scrollY > 40;
    this.tryStartCounter();
  }

  ngOnInit(): void {
    // Pre-fill animated display values
    this.animatedStats = this.stats.map(() => ({
      value:   0,
      target:  0,
      display: '0'
    }));
  }

  toggleMobileNav(): void {
    this.isMobileNavOpen = !this.isMobileNavOpen;
  }

  closeMobileNav(): void {
    this.isMobileNavOpen = false;
  }

  // ── Start counter animation once stats section is visible ─
  private tryStartCounter(): void {
    if (this.hasAnimated) return;

    const statsEl = document.getElementById('stats-section');
    if (!statsEl) return;

    const rect = statsEl.getBoundingClientRect();
    if (rect.top > window.innerHeight) return;

    this.hasAnimated = true;
    this.runCounters();
  }

  private runCounters(): void {
    const numericTargets = [250000, 500, 99.9, 4.9];
    const duration       = 1800;
    const steps          = 60;
    const interval       = duration / steps;
    let   step           = 0;

    this.counterInterval = setInterval(() => {
      step++;
      const progress = this.easeOutQuad(step / steps);

      this.animatedStats = numericTargets.map((target, i) => {
        const current = target * progress;
        let display: string;

        if (i === 0) {
          // 2,50,000 — Indian number format
          display = Math.floor(current).toLocaleString('en-IN');
        } else if (i === 2) {
          display = current.toFixed(1);
        } else if (i === 3) {
          display = current.toFixed(1);
        } else {
          display = Math.floor(current).toString();
        }

        return { value: current, target, display };
      });

      if (step >= steps) {
        clearInterval(this.counterInterval!);
        this.counterInterval = null;
        // Snap to exact final values
        this.animatedStats = [
          { value: 250000, target: 250000, display: '2,50,000' },
          { value: 500,    target: 500,    display: '500'       },
          { value: 99.9,   target: 99.9,   display: '99.9'      },
          { value: 4.9,    target: 4.9,    display: '4.9'       }
        ];
      }
    }, interval);
  }

  private easeOutQuad(t: number): number {
    return t * (2 - t);
  }

  ngOnDestroy(): void {
    if (this.counterInterval) {
      clearInterval(this.counterInterval);
    }
  }
}