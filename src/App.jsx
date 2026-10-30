import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import {
  Code,
  Mail,
  MonitorSmartphone,
  Rocket,
  Briefcase,
  Cpu,
  ArrowRight,
  Layout,
  Server,
  Search,
  CheckCircle2,
  Sparkles,
  Star,
  ExternalLink,
  Copy,
  Check,
  Zap,
  ShieldCheck,
  Layers,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Send,
  MessageSquare,
  Lock,
  Menu,
  X,
  Ticket,
  Radio,
  Flame,
  Coffee,
  Lightbulb,
  Headphones,
  Activity,
  Sliders,
  Home,
  Terminal,
  Gamepad2,
  Sticker,
  EyeOff
} from 'lucide-react';

import SoundToggle from './components/SoundToggle';
import NeoSelect from './components/NeoSelect';
import ScrollProgressBar from './components/ScrollProgressBar';
import RetroTerminalModal from './components/RetroTerminalModal';
import StickerCanvas from './components/StickerCanvas';
import SpeedGameModal from './components/SpeedGameModal';
import NotFoundPage from './pages/NotFoundPage';
import { playClickSound, playPopSound, playFanfareSound } from './utils/audio';
import { triggerConfetti } from './utils/confetti';
import { copyText } from './utils/clipboard';
import { CONTACT_EMAIL, FORMSPREE_ENDPOINT } from './config';

const GithubIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

const getPageFromPath = (pathname) => pathname === '/' ? 'home' : 'not-found';

// Budget options for the contact form dropdown. `value` must match the exact
// strings pre-filled by the cost calculator and retro terminal integrations.
const BUDGET_OPTIONS = [
  { value: '$500 - $1,500 (Speed Audit / Small Fixes)', label: '$500 – $1,500', hint: 'Speed Audit / Small Fixes' },
  { value: '$1,500 - $3,500 (Custom Theme / Elementor Site)', label: '$1,500 – $3,500', hint: 'Custom Theme / Elementor Site' },
  { value: '$3,500 - $8,000+ (Headless WordPress + React)', label: '$3,500 – $8,000+', hint: 'Headless WordPress + React' },
  { value: 'Ongoing Retainer / Consultation', label: 'Ongoing Retainer', hint: 'Monthly Consultation & Care' },
];
const DEFAULT_BUDGET = BUDGET_OPTIONS[1].value;

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPage = getPageFromPath(location.pathname);

  const [activeTab, setActiveTab] = useState('all');
  const [activeSection, setActiveSection] = useState('hero');
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', budget: '$1,500 - $3,500 (Custom Theme / Elementor Site)', message: '' });
  const [selectedTech, setSelectedTech] = useState('WordPress');
  const [projectModes, setProjectModes] = useState({});
  const projectSliderRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [reactions, setReactions] = useState(() => {
    const defaults = {
      fire: { count: 342, userReacted: false },
      ship: { count: 289, userReacted: false },
      fuel: { count: 415, userReacted: false },
      aesthetic: { count: 512, userReacted: false }
    };
    if (typeof window === 'undefined') return defaults;
    try {
      const stored = JSON.parse(localStorage.getItem('neo_reactions'));
      if (stored && stored.fire && stored.ship && stored.fuel && stored.aesthetic) {
        return {
          fire: { ...defaults.fire, ...stored.fire },
          ship: { ...defaults.ship, ...stored.ship },
          fuel: { ...defaults.fuel, ...stored.fuel },
          aesthetic: { ...defaults.aesthetic, ...stored.aesthetic }
        };
      }
    } catch {
      // fall back to defaults
    }
    return defaults;
  });
  const [reactionFeedback, setReactionFeedback] = useState(null);

  // Konami code easter egg + live Dhaka clock
  const [konamiToast, setKonamiToast] = useState(false);
  const [konamiProgress, setKonamiProgress] = useState(0);
  const [dhakaTime, setDhakaTime] = useState('');

  // Persist reaction counts locally so they survive reloads
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('neo_reactions', JSON.stringify(reactions));
    }
  }, [reactions]);

  // Konami Code Easter Egg: ↑ ↑ ↓ ↓ ← → ← → B A
  // Rewards the visitor with confetti, a fanfare, the sticker canvas, and a toast.
  useEffect(() => {
    const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    let index = 0;
    let resetTimer = null;

    const clearResetTimer = () => {
      if (resetTimer) {
        clearTimeout(resetTimer);
        resetTimer = null;
      }
    };

    const handleKeyDown = (e) => {
      // Never hijack typing inside form fields, selects, or the terminal
      const tag = e.target && e.target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (e.target && e.target.isContentEditable)) return;

      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if (key === KONAMI[index]) {
        index += 1;
        if (index === KONAMI.length) {
          index = 0;
          clearResetTimer();
          setKonamiProgress(0);
          triggerConfetti(3200);
          playFanfareSound();
          setIsStickersOpen(true);
          setKonamiToast(true);
          setTimeout(() => setKonamiToast(false), 6000);
          return;
        }
      } else {
        // Wrong key: restart from scratch, unless this key could begin a fresh run
        index = key === KONAMI[0] ? 1 : 0;
      }

      // Show live pips while entering the code; drop them if the user pauses
      setKonamiProgress(index);
      clearResetTimer();
      if (index > 0) {
        resetTimer = setTimeout(() => {
          index = 0;
          setKonamiProgress(0);
        }, 4000);
      }
    };

    // Capture phase so no other handler can swallow the keys first
    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      clearResetTimer();
    };
  }, []);

  // Live Dhaka (GMT+6) clock for the hero status chip
  useEffect(() => {
    const update = () => {
      try {
        setDhakaTime(
          new Intl.DateTimeFormat('en-GB', {
            timeZone: 'Asia/Dhaka',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          }).format(new Date())
        );
      } catch {
        setDhakaTime('');
      }
    };
    update();
    const timer = setInterval(update, 30000);
    return () => clearInterval(timer);
  }, []);

  // Scroll-reveal for home page sections (IntersectionObserver, respects reduced motion via CSS)
  useEffect(() => {
    if (currentPage !== 'home') return;
    const sectionIds = ['services', 'skills', 'projects', 'process', 'faq', 'contact'];
    const els = sectionIds.map((id) => document.getElementById(id)).filter(Boolean);
    if (els.length === 0) return;

    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('neo-reveal-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('neo-reveal-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );

    els.forEach((el) => {
      el.classList.add('neo-reveal');
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, [currentPage]);

  // Creative Suite Modals & Tool States
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [isGameOpen, setIsGameOpen] = useState(false);
  const [isStickersOpen, setIsStickersOpen] = useState(false);

  // Active section observer for mobile bottom navigation dock on home page
  useEffect(() => {
    if (currentPage !== 'home') return;

    const handleScroll = () => {
      const sections = ['hero', 'services', 'skills', 'projects', 'process', 'faq', 'contact'];
      const scrollPos = window.scrollY + 200;

      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i]);
        if (el && el.offsetTop <= scrollPos) {
          setActiveSection(sections[i]);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentPage]);

  const goToPage = (page, options = {}) => {
    playClickSound(650);
    setMobileMenuOpen(false);

    const path = page === 'home' ? '/' : `/${page}`;
    navigate(path, { state: options.scrollTo ? { scrollTo: options.scrollTo } : undefined });
  };

  // Scroll to the target section when navigating (handles cross-page scrollTo)
  useEffect(() => {
    const scrollTarget = location.state?.scrollTo;
    if (scrollTarget) {
      setTimeout(() => {
        const element = document.getElementById(scrollTarget);
        if (element) {
          const yOffset = -70;
          const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }, 150);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key]);

  const scrollToSection = (id) => {
    playClickSound(650);
    setMobileMenuOpen(false);
    if (currentPage !== 'home') {
      goToPage('home', { scrollTo: id });
      return;
    }
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -70;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const handlePreFillContact = ({ budget, message }) => {
    setFormData(prev => ({
      ...prev,
      budget: budget || prev.budget,
      message: message || prev.message
    }));
    goToPage('home', { scrollTo: 'contact' });
  };

  const handleApplyDiscountCode = (codeText) => {
    setFormData(prev => ({
      ...prev,
      message: (prev.message ? prev.message + '\n\n' : '') + `[PROMO CODE]: ${codeText}`
    }));
    scrollToSection('contact');
  };

  const handleReactionClick = (key, label) => {
    playPopSound(600);
    setReactions(prev => {
      const current = prev[key];
      const nextReacted = !current.userReacted;
      return {
        ...prev,
        [key]: {
          count: nextReacted ? current.count + 1 : current.count - 1,
          userReacted: nextReacted
        }
      };
    });
    setReactionFeedback(`Awesome! You reacted with ${label}`);
    setTimeout(() => {
      setReactionFeedback(null);
    }, 2800);
  };

  const handleCopyEmail = async () => {
    const ok = await copyText(CONTACT_EMAIL);
    if (ok) {
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2500);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!FORMSPREE_ENDPOINT) {
      setFormError('The contact form is not configured yet. Email me directly at ' + CONTACT_EMAIL + '.');
      return;
    }

    setFormSubmitting(true);
    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          _replyto: formData.email,
          budget: formData.budget,
          message: formData.message,
          _subject: `New project request from ${formData.name || 'your portfolio'}`,
          _gotcha: '', // Formspree honeypot — must stay empty
        }),
      });
      if (!res.ok) {
        throw new Error(`Formspree returned ${res.status}`);
      }
      setFormSubmitted(true);
      setTimeout(() => {
        setFormSubmitted(false);
        setFormData({ name: '', email: '', budget: DEFAULT_BUDGET, message: '' });
      }, 4000);
    } catch {
      setFormError('Something went wrong sending your message. Please try again, or email me directly at ' + CONTACT_EMAIL + '.');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Resolve the visible slide index by finding the child whose left edge
  // is closest to the current scroll position (breakpoint-agnostic).
  const getActiveSlideIndex = () => {
    const container = projectSliderRef.current;
    if (!container) return 0;
    const children = Array.from(container.children);
    let best = 0;
    let bestDistance = Infinity;
    children.forEach((child, i) => {
      const distance = Math.abs(child.offsetLeft - container.scrollLeft);
      if (distance < bestDistance) {
        bestDistance = distance;
        best = i;
      }
    });
    return best;
  };

  const scrollProjects = (direction) => {
    const container = projectSliderRef.current;
    if (!container) return;
    const children = Array.from(container.children);
    if (!children.length) return;
    const current = getActiveSlideIndex();
    const target = Math.min(children.length - 1, Math.max(0, current + (direction === 'left' ? -1 : 1)));
    container.scrollTo({ left: children[target].offsetLeft, behavior: 'smooth' });
  };

  const handleSliderScroll = () => {
    const container = projectSliderRef.current;
    if (!container) return;
    const { scrollLeft, scrollWidth, clientWidth } = container;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    setActiveSlideIndex(getActiveSlideIndex());
  };

  const handleProjectTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  // After a tab switch re-renders the track, reset scroll and re-measure arrows
  // (a shorter filtered list may fit fully, so "canScrollRight" must update).
  useEffect(() => {
    const container = projectSliderRef.current;
    if (container) container.scrollTo({ left: 0 });
    setActiveSlideIndex(0);
    setCanScrollLeft(false);
    handleSliderScroll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const stats = [
    { label: 'WordPress & Web Projects', value: '45+', icon: <Layers className="w-5 h-5 text-[#121316]" /> },
    { label: 'Years of Experience', value: '4+ yrs', icon: <Briefcase className="w-5 h-5 text-[#121316]" /> },
    { label: 'Average PageSpeed Score', value: '95+', icon: <Zap className="w-5 h-5 text-[#121316]" /> },
    { label: 'Client Satisfaction', value: '100%', icon: <Star className="w-5 h-5 text-[#121316]" /> }
  ];

  const services = [
    {
      id: 'custom-wp',
      number: '01',
      title: 'Custom WordPress & PHP',
      category: 'CMS Architecture',
      badgeColor: 'bg-neo-yellow text-black',
      icon: <MonitorSmartphone className="w-6 h-6 text-[#121316]" />,
      speedRating: 'PageSpeed 95+ Score',
      turnaround: '1 - 2 Weeks',
      desc: 'Bespoke themes, modular architecture, custom post types, and tailor-made plugins built with clean, secure PHP standards.',
      techIngredients: ['PHP 8.2+', 'ACF Pro', 'WP Hooks', 'MySQL'],
      features: ['ACF Pro & Custom Fields', 'Zero Bloat Theme Code', 'WooCommerce Customization', 'Legacy WP Migration']
    },
    {
      id: 'headless-wp',
      number: '02',
      title: 'Headless WordPress + React',
      category: 'Modern Decoupled Web',
      badgeColor: 'bg-neo-cyan text-black',
      icon: <Server className="w-6 h-6 text-[#121316]" />,
      speedRating: 'Sub-Second FCP Loads',
      turnaround: '2 - 3 Weeks',
      desc: 'Blazing fast user experiences utilizing WordPress as an intuitive CMS backend with a custom React / Next.js frontend.',
      techIngredients: ['Next.js 15', 'WP REST API', 'GraphQL', 'Tailwind'],
      features: ['WP REST API & GraphQL', 'Static Generation / SSR', 'Ultra Fast Sub-second Loads', 'Bank-grade Security']
    },
    {
      id: 'elementor-pro',
      number: '03',
      title: 'Elementor Pro & Page Building',
      category: 'Design to Code',
      badgeColor: 'bg-neo-pink text-white',
      icon: <Layout className="w-6 h-6 text-[#121316]" />,
      speedRating: 'High-Converting UI',
      turnaround: '1 - 2 Weeks',
      desc: 'Pixel-perfect, responsive Elementor builds designed for marketing teams to easily edit content without breaking layouts.',
      techIngredients: ['Elementor Pro', 'Dynamic Loops', 'Custom CSS', 'ACF'],
      features: ['Custom Elementor Widgets', 'Design System Integration', 'Mobile-first Optimization', 'Dynamic Content Loops']
    },
    {
      id: 'speed-vitals',
      number: '04',
      title: 'Core Web Vitals & Speed Tuning',
      category: 'Performance & SEO',
      badgeColor: 'bg-neo-lime text-black',
      icon: <Search className="w-6 h-6 text-[#121316]" />,
      speedRating: '99/100 Mobile Vitals',
      turnaround: '3 - 5 Days',
      desc: 'Complete technical audit and code-level performance tuning to achieve 90+ mobile PageSpeed scores and rank higher on Google.',
      techIngredients: ['Lighthouse Audit', 'Redis Cache', 'Asset Deferral', 'CDN'],
      features: ['Database Indexing & Cleanup', 'Asset Minification & Deferral', 'LCP / CLS / INP Optimization', 'Server & Object Cache Setup']
    }
  ];

  const techDictionary = {
    'WordPress': {
      title: 'WordPress Core & Theme Engine',
      role: 'Enterprise Content Management',
      proficiency: 98,
      status: 'Primary CMS Engine',
      tagColor: 'bg-neo-yellow',
      codeSnippet: '// Clean custom taxonomy & ACF registration\nregister_post_type("case_study", [\n  "public" => true,\n  "show_in_rest" => true,\n  "supports" => ["title", "editor", "thumbnail", "custom-fields"]\n]);',
      benefits: ['Custom REST API endpoints', 'Clean ACF Pro Block schemas', 'Scalable relational data models']
    },
    'React': {
      title: 'React 19 & Next.js Ecosystem',
      role: 'Decoupled Modern Frontend Layer',
      proficiency: 94,
      status: 'Daily Driver Framework',
      tagColor: 'bg-neo-cyan',
      codeSnippet: '// Modern Headless WP Fetch with caching\nexport async function getPosts() {\n  const res = await fetch("https://api.domain/wp-json/wp/v2/posts", {\n    next: { revalidate: 60 }\n  });\n  return res.json();\n}',
      benefits: ['Instant page transitions', 'Component-based UI design', 'Superior mobile rendering speed']
    },
    'PHP': {
      title: 'Modern PHP 8.x & OOP',
      role: 'Backend Logic & Plugin Architecture',
      proficiency: 95,
      status: 'Senior Level Backend',
      tagColor: 'bg-neo-lime',
      codeSnippet: 'final class PerformanceOptimizer {\n  public function __construct() {\n    add_action("wp_enqueue_scripts", [$this, "defer_heavy_scripts"], 999);\n    add_filter("script_loader_tag", [$this, "add_async_attributes"], 10, 2);\n  }\n}',
      benefits: ['Strict type safety', 'Custom database query optimization', 'Zero-bloat modular plugins']
    },
    'Elementor': {
      title: 'Elementor Pro Custom Widget Dev',
      role: 'Marketing Page & Dynamic Template Engine',
      proficiency: 99,
      status: 'Certified Specialist',
      tagColor: 'bg-neo-pink',
      codeSnippet: 'class Custom_Matrix_Widget extends \\Elementor\\Widget_Base {\n  public function get_name() { return "neo_matrix"; }\n  protected function render() {\n    $settings = $this->get_settings_for_display();\n    include "views/template.php";\n  }\n}',
      benefits: ['Tailored bespoke widgets', 'Non-breaking client editing', 'Strict CSS asset minification']
    },
    'Tailwind': {
      title: 'Tailwind CSS v4 & Styling Tokens',
      role: 'Utility & Neo-Brutalist Design System',
      proficiency: 96,
      status: 'Design Token Master',
      tagColor: 'bg-neo-purple',
      codeSnippet: '@theme {\n  --color-neo-yellow: #fde047;\n  --shadow-neo: 4px 4px 0px #121316;\n}\n.neo-card { @apply bg-white border-2 border-black shadow-neo; }',
      benefits: ['Zero runtime styling overhead', 'Rapid prototype to production', 'Crisp high-contrast responsive layouts']
    },
    'Optimization': {
      title: 'Core Web Vitals & Lighthouse 95+',
      role: 'Speed, Indexing & Technical SEO',
      proficiency: 97,
      status: 'Performance Guaranteed',
      tagColor: 'bg-neo-orange',
      codeSnippet: '// Server Cache & Object Caching Config\ndefine("WP_CACHE", true);\ndefine("WP_REDIS_HOST", "127.0.0.1");\ndefine("DISALLOW_FILE_EDIT", true); // Security hardening',
      benefits: ['Sub-second LCP & low CLS', 'Database index optimization', 'Google Search ranking uplift']
    }
  };

  const projects = [
    {
      id: 'nda-01',
      name: 'Fintech Landing Platform',
      tagline: 'High-Conversion SaaS Landing',
      category: 'headless',
      tags: ['TypeScript', 'React / Next.js', 'Tailwind CSS', 'Framer Motion'],
      metrics: { speed: '99/100', loadTime: '0.4s', architecture: 'Modern Edge' },
      desc: 'High-converting fintech landing platform featuring responsive neo-brutalist and minimal UI, optimized animations, and instant load times.',
      specs: 'Engineered with TypeScript & Next.js, component-driven design system with strict type safety, asset minification, and SEO structured schemas.',
      bgColor: 'bg-neo-cyan/25',
      accentColor: 'bg-neo-cyan text-black'
    },
    {
      id: 'nda-02',
      name: 'AI-Powered Dashboard Suite',
      tagline: 'Interactive Web & AI Platform',
      category: 'headless',
      tags: ['TypeScript', 'React 19', 'Tailwind CSS', 'REST API'],
      metrics: { speed: '98/100', loadTime: '0.5s', architecture: 'Client Hydration' },
      desc: 'Interactive TypeScript web application engineered with modular state management, rich dashboards, and responsive component system.',
      specs: 'Built with TypeScript and modern tooling, responsive CSS grid layouts, and seamless asynchronous API data handling.',
      bgColor: 'bg-neo-purple/20',
      accentColor: 'bg-neo-purple text-white'
    },
    {
      id: 'nda-03',
      name: 'Custom PHP Service Backend',
      tagline: 'Core PHP Architecture & Services',
      category: 'wordpress',
      tags: ['PHP 8.2+', 'OOP Architecture', 'MySQL', 'REST API'],
      metrics: { speed: '100/100', loadTime: '0.3s', architecture: 'Modular Backend' },
      desc: 'Robust PHP backend architecture engineered with clean object-oriented patterns, database query caching, and security hardening.',
      specs: 'Custom PHP 8.x logic with strict typing, optimized MySQL schemas, and low-latency API response endpoints.',
      bgColor: 'bg-neo-lime/25',
      accentColor: 'bg-neo-lime text-black'
    },
    {
      id: 'nda-04',
      name: 'Enterprise WordPress Plugin',
      tagline: 'Custom Plugin & Core Engine',
      category: 'wordpress',
      tags: ['WordPress Plugin', 'PHP 8.2', 'WP REST API', 'ACF Pro'],
      metrics: { speed: '99/100', loadTime: '0.4s', architecture: 'Custom WP Plugin' },
      desc: 'Custom enterprise WordPress plugin providing bespoke data structures, dynamic endpoints, and secure admin management interfaces.',
      specs: 'Follows WordPress VIP coding standards, custom hook architecture, database table indexing, and role-based access controls.',
      bgColor: 'bg-neo-yellow/25',
      accentColor: 'bg-neo-yellow text-black'
    },
    {
      id: 'nda-05',
      name: 'Decoupled Headless Client',
      tagline: 'Decoupled TypeScript Application',
      category: 'headless',
      tags: ['TypeScript', 'React / Next.js', 'WP Backend API', 'Tailwind'],
      metrics: { speed: '97/100', loadTime: '0.5s', architecture: 'Decoupled Client' },
      desc: 'Frontend client connected to a custom WordPress headless engine for decoupled, high-speed user experiences.',
      specs: 'Full TypeScript implementation with reactive state stores, client-side caching, and responsive UI components.',
      bgColor: 'bg-neo-pink/20',
      accentColor: 'bg-neo-pink text-white'
    },
    {
      id: 'nda-06',
      name: 'SSR Business Platform v3',
      tagline: 'Next-Gen TypeScript Web Platform',
      category: 'headless',
      tags: ['TypeScript', 'Next.js 15', 'Tailwind CSS', 'REST API'],
      metrics: { speed: '99/100', loadTime: '0.35s', architecture: 'SSR & ISR' },
      desc: 'Third-generation platform overhaul featuring server-side rendering, sub-second route changes, and dynamic dashboards.',
      specs: 'Next.js 15 app router architecture with TypeScript type safety, optimistic UI updates, and Core Web Vitals optimization.',
      bgColor: 'bg-neo-cyan/25',
      accentColor: 'bg-neo-cyan text-black'
    },
    {
      id: 'nda-07',
      name: 'Secure VPN Client Portal',
      tagline: 'High-Performance PHP Gateway Portal',
      category: 'wordpress',
      tags: ['PHP 8.2', 'Network API', 'Security Hardening', 'MySQL'],
      metrics: { speed: '98/100', loadTime: '0.4s', architecture: 'Secure Portal' },
      desc: 'Secure VPN service portal and client backend built with strict PHP security practices, session tokens, and automated billing hooks.',
      specs: 'Engineered with encrypted data payloads, webhook listeners, automated user provisioning, and high-concurrency database queries.',
      bgColor: 'bg-neo-lime/25',
      accentColor: 'bg-neo-lime text-black'
    },
    {
      id: 'nda-08',
      name: 'Fintech Client Portal',
      tagline: 'Fintech Application & Client Portal',
      category: 'headless',
      tags: ['TypeScript', 'React 19', 'State Machine', 'Tailwind'],
      metrics: { speed: '99/100', loadTime: '0.45s', architecture: 'SPA / Edge' },
      desc: 'Comprehensive trading and agreement frontend with real-time state synchronization, interactive modals, and data validation.',
      specs: 'Built with strict TypeScript schemas, responsive financial tables, chart integrations, and secure JWT authentication handling.',
      bgColor: 'bg-neo-yellow/25',
      accentColor: 'bg-neo-yellow text-black'
    },
    {
      id: 'nda-09',
      name: 'Headless Creative Portfolio',
      tagline: 'Headless WordPress & Creative Site',
      category: 'headless',
      tags: ['JavaScript (ES6+)', 'React 19', 'WP REST API', 'PHP 8'],
      metrics: { speed: '99/100', loadTime: '0.4s', architecture: 'Decoupled SSR' },
      desc: 'High-performance web presence decoupling WordPress content management from a slick, modern React frontend interface with custom animations.',
      specs: 'Utilizes WordPress custom post types exposed via authenticated REST endpoints. Front-end statically generates dynamic portfolio pages.',
      bgColor: 'bg-neo-purple/20',
      accentColor: 'bg-neo-purple text-white'
    },
    {
      id: 'nda-10',
      name: 'Astro Site Builder Tooling',
      tagline: 'Ultra-Fast Static Site Builder',
      category: 'headless',
      tags: ['Astro', 'TypeScript', 'Zero JS Baseline', 'Tailwind'],
      metrics: { speed: '100/100', loadTime: '0.2s', architecture: 'Island Architecture' },
      desc: 'Static site generator and developer builder tool built on Astro Islands architecture for zero-JS initial payload and unmatched PageSpeed.',
      specs: 'Astro component islands with selective hydration, markdown / CMS data adapters, and automated asset inlining.',
      bgColor: 'bg-neo-pink/25',
      accentColor: 'bg-neo-pink text-white'
    },
    {
      id: 'nda-11',
      name: 'Microservice API Engine',
      tagline: 'REST API & Microservice Engine',
      category: 'headless',
      tags: ['Python 3.12', 'FastAPI / Django', 'PostgreSQL', 'Docker'],
      metrics: { speed: '99/100', loadTime: 'Instant', architecture: 'Microservice API' },
      desc: 'Scalable backend API engine powering core business logic, document verification, and transactional data flows.',
      specs: 'Asynchronous endpoint handlers, relational database ORM with automated migrations, rate limiting, and Dockerized deployment.',
      bgColor: 'bg-neo-lime/25',
      accentColor: 'bg-neo-lime text-black'
    },
    {
      id: 'nda-12',
      name: 'Document & Knowledge Portal',
      tagline: 'Enterprise Document Portal',
      category: 'headless',
      tags: ['TypeScript', 'React', 'Tailwind CSS', 'Search Indexing'],
      metrics: { speed: '97/100', loadTime: '0.5s', architecture: 'Document Engine' },
      desc: 'Internal knowledgebase and document portal with instant fuzzy search, hierarchical category trees, and responsive reading view.',
      specs: 'Client-side search indexing, markdown rendering with syntax highlighting, and access-controlled document repository.',
      bgColor: 'bg-neo-cyan/25',
      accentColor: 'bg-neo-cyan text-black'
    },
    {
      id: 'nda-13',
      name: 'Business Dashboard SPA',
      tagline: 'Core Web Application & Dashboard',
      category: 'headless',
      tags: ['JavaScript', 'React', 'Tailwind CSS', 'REST API'],
      metrics: { speed: '96/100', loadTime: '0.6s', architecture: 'Client SPA' },
      desc: 'Interactive business management dashboard with dynamic charts, client onboarding workflows, and customizable widget grids.',
      specs: 'Modular component hierarchy, custom CSS theming tokens, and bidirectional API sync with background worker queues.',
      bgColor: 'bg-neo-yellow/25',
      accentColor: 'bg-neo-yellow text-black'
    },
    {
      id: 'nda-14',
      name: 'Site Health Automation Suite',
      tagline: 'Automated Maintenance & Health Suite',
      category: 'wordpress',
      tags: ['TypeScript', 'Automation', 'Health Auditing', 'WP CLI'],
      metrics: { speed: '100/100', loadTime: 'Instant', architecture: 'CLI & Cron Tool' },
      desc: 'Automated maintenance mode tool and site health monitoring script for WordPress and decoupled web deployments.',
      specs: 'Configurable countdown timers, secret bypass cookies, server status health-checks, and automated alert webhooks.',
      bgColor: 'bg-neo-pink/25',
      accentColor: 'bg-neo-pink text-white'
    },
    {
      id: 'nda-15',
      name: 'Developer Tooling Ecosystem',
      tagline: 'Full-Stack WordPress & Headless Ecosystem',
      category: 'wordpress',
      tags: ['GitHub Actions', 'PHP Standards', 'Elementor', 'Vite CI/CD'],
      metrics: { speed: '100/100', loadTime: 'Instant', architecture: 'Profile & Tooling' },
      desc: 'Full-stack WordPress developer ecosystem showcasing Elementor Pro, PHP 8 standards, headless React boilerplates, and automated CI/CD.',
      specs: 'PHP CodeSniffer WordPress VIP standards, automated Vite bundling, GitHub actions pipeline, and open-source boilerplates.',
      bgColor: 'bg-neo-yellow/25',
      accentColor: 'bg-neo-yellow text-black'
    },
    {
      id: 'nda-16',
      name: 'WooCommerce Storefront Build',
      tagline: 'Custom E-Commerce Storefront',
      category: 'wordpress',
      tags: ['WooCommerce', 'PHP 8.2', 'Stripe API', 'ACF Pro'],
      metrics: { speed: '98/100', loadTime: '0.5s', architecture: 'Custom Woo Theme' },
      desc: 'High-converting WooCommerce storefront with a fully custom theme, streamlined one-page checkout, and dynamic product filtering.',
      specs: 'Custom cart & checkout hooks, payment gateway integration with webhook reconciliation, and indexed product attribute queries.',
      bgColor: 'bg-neo-lime/25',
      accentColor: 'bg-neo-lime text-black'
    },
    {
      id: 'nda-17',
      name: 'SaaS Marketing Platform',
      tagline: 'Conversion-Focused SaaS Site',
      category: 'headless',
      tags: ['Next.js', 'TypeScript', 'MDX Blog', 'Segment API'],
      metrics: { speed: '100/100', loadTime: '0.3s', architecture: 'Static + ISR' },
      desc: 'Blazing-fast SaaS marketing site with animated feature pages, SEO-structured MDX blog engine, and A/B-ready landing variants.',
      specs: 'Incremental static regeneration for marketing pages, typed content schemas, sitemap automation, and analytics event pipeline.',
      bgColor: 'bg-neo-cyan/25',
      accentColor: 'bg-neo-cyan text-black'
    },
    {
      id: 'nda-18',
      name: 'Booking & Reservation System',
      tagline: 'Real-Time Booking Platform',
      category: 'headless',
      tags: ['React', 'Node.js', 'WebSockets', 'PostgreSQL'],
      metrics: { speed: '97/100', loadTime: '0.45s', architecture: 'Realtime SPA' },
      desc: 'Real-time reservation platform with live availability calendars, conflict-proof slot locking, and automated email/SMS reminders.',
      specs: 'WebSocket-driven availability sync, transactional slot locking to prevent double bookings, and timezone-aware scheduling logic.',
      bgColor: 'bg-neo-purple/20',
      accentColor: 'bg-neo-purple text-white'
    },
    {
      id: 'nda-19',
      name: 'Learning Management Portal',
      tagline: 'LMS & Course Delivery Engine',
      category: 'wordpress',
      tags: ['WordPress', 'LearnDash', 'REST API', 'Video Streaming'],
      metrics: { speed: '96/100', loadTime: '0.6s', architecture: 'Custom LMS Layer' },
      desc: 'Custom learning management layer with course progress tracking, quiz engines, gated video lessons, and student dashboard analytics.',
      specs: 'Custom progress tables over LearnDash, signed streaming URLs for protected lessons, and REST endpoints for a React student portal.',
      bgColor: 'bg-neo-yellow/25',
      accentColor: 'bg-neo-yellow text-black'
    },
    {
      id: 'nda-20',
      name: 'Multi-Vendor Marketplace',
      tagline: 'Scalable Marketplace Build',
      category: 'wordpress',
      tags: ['WooCommerce', 'Dokan', 'ElasticPress', 'Redis'],
      metrics: { speed: '95/100', loadTime: '0.7s', architecture: 'Vendor Marketplace' },
      desc: 'Multi-vendor marketplace with vendor dashboards, commission automation, split payouts, and instant faceted product search.',
      specs: 'Vendor role architecture with per-vendor storefronts, automated commission ledgers, and Elasticsearch-backed product indexing via Redis cache.',
      bgColor: 'bg-neo-pink/25',
      accentColor: 'bg-neo-pink text-white'
    }
  ];

  const filteredProjects = activeTab === 'all' 
    ? projects 
    : projects.filter(p => p.category === activeTab);

  const skillsBento = [
    {
      group: 'CMS & WordPress Core',
      icon: <Layout className="w-5 h-5 text-black" />,
      color: 'bg-neo-yellow',
      items: ['WordPress Architecture', 'Elementor & Elementor Pro', 'ACF Pro & Custom Fields', 'WooCommerce', 'Theme & Plugin Dev', 'WP REST API']
    },
    {
      group: 'Frontend Engineering',
      icon: <Code className="w-5 h-5 text-black" />,
      color: 'bg-neo-cyan',
      items: ['React.js', 'Next.js', 'Tailwind CSS', 'JavaScript (ES6+)', 'TypeScript Basics', 'HTML5 / CSS3 Grid']
    },
    {
      group: 'Backend & Database',
      icon: <Server className="w-5 h-5 text-black" />,
      color: 'bg-neo-lime',
      items: ['PHP 8.x', 'MySQL & Query Optimization', 'RESTful API Design', 'GraphQL Basics', 'Node.js Scripts', 'JSON / Webhooks']
    },
    {
      group: 'Speed, SEO & DevOps',
      icon: <Zap className="w-5 h-5 text-black" />,
      color: 'bg-neo-pink',
      items: ['Core Web Vitals Tuning', 'Technical SEO & Schema', 'Git / GitHub Workflow', 'Redis & Caching', 'Cloudflare CDN', 'Server Security']
    }
  ];

  const processSteps = [
    { step: '01', title: 'Discovery & Architecture', desc: 'Understanding your business targets, analyzing site architecture, and planning the ideal tech stack (Standard WP vs. Headless).' },
    { step: '02', title: 'Clean Development', desc: 'Writing clean, modular PHP or React code with structured custom fields so non-technical team members can manage content effortlessly.' },
    { step: '03', title: 'Performance & QA', desc: 'Rigorous testing across all devices, optimizing images/scripts, and fine-tuning Core Web Vitals to hit high PageSpeed benchmarks.' },
    { step: '04', title: 'Seamless Launch', desc: 'Smooth production deployment, DNS configuration, security hardening, and hands-on walkthroughs for your team.' }
  ];

  const faqs = [
    {
      q: 'Why should I consider Headless WordPress instead of traditional WordPress?',
      a: 'Headless WordPress gives you the best of both worlds: your content editors get the familiar, intuitive WordPress admin, while your users get the lightning-fast speed, rich animations, and superior security of a modern React/Next.js frontend.'
    },
    {
      q: 'Can you speed up my existing, slow WordPress website?',
      a: 'Yes! I conduct thorough code and database audits to eliminate plugin bloat, optimize image delivery, configure caching/CDN layers, and resolve render-blocking scripts to get your site into the 90+ PageSpeed tier.'
    },
    {
      q: 'Do you create custom Elementor widgets from scratch?',
      a: 'Absolutely. If Elementor’s default widgets cannot achieve your required UI or custom dynamic queries, I develop native, lightweight Elementor addon widgets using PHP and JavaScript.'
    },
    {
      q: 'What is your typical project timeline and collaboration model?',
      a: 'Typical landing page or custom theme projects take 1 to 3 weeks depending on scope. I provide regular progress demos, milestone updates, and clear communication via Slack/WhatsApp or email.'
    }
  ];

  const testimonials = [
    {
      quote: "Raiyan took our heavy, sluggish WordPress site and transformed it into a lightning-fast digital asset. Our mobile bounce rate dropped noticeably!",
      author: "Alex Morgan",
      role: "Product Marketing Lead",
      company: "SaaS Wave",
      rating: 5
    },
    {
      quote: "The cleanest Elementor integration we’ve seen. Everything is dynamic, easy to update, and doesn’t break when updating plugins. Highly recommended.",
      author: "Sarah Jenkins",
      role: "Founder & Creative Director",
      company: "Studio Brand",
      rating: 5
    }
  ];

  const mobileNavItems = [
    { id: 'home', label: 'Home', icon: <Home className="w-5 h-5" />, action: () => goToPage('home') },
    { id: 'projects', label: 'Work', icon: <Rocket className="w-5 h-5" />, action: () => scrollToSection('projects') },
    { id: 'contact', label: 'Contact', icon: <MessageSquare className="w-5 h-5" />, action: () => scrollToSection('contact') }
  ];

  return (
    <div className="min-h-screen flex flex-col selection:bg-neo-yellow selection:text-black overflow-x-clip pb-20 md:pb-0">
      {/* Skip to content link for keyboard/AT users */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:bg-white focus:text-black focus:px-4 focus:py-2 focus:font-bold focus:border-2 focus:border-[#121316]"
      >
        Skip to content
      </a>

      {/* Scroll Progress Bar */}
      <ScrollProgressBar />

      {/* 1. TOP ANNOUNCEMENT BAR */}
      <div className="bg-[#121316] text-white py-1.5 sm:py-2 border-b-2 border-[#121316] text-[11px] sm:text-xs md:text-sm font-semibold">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center gap-2">
          <div className="flex items-center gap-2 truncate">
            <span className="w-2 h-2 rounded-full bg-neo-lime animate-ping flex-shrink-0"></span>
            <span className="text-neo-lime font-bold truncate">● Open for Q3/Q4 Projects</span>
            <span className="hidden lg:inline text-neutral-400">| Custom WordPress & Headless Engineering</span>
          </div>
          
          {/* Top Bar Controls: Sound */}
          <div className="flex items-center gap-2 sm:gap-2.5 text-xs flex-shrink-0">
            <SoundToggle />
            <span className="hidden md:inline text-neutral-400 text-[11px]">Dhaka, BD (GMT+6)</span>
            <button 
              onClick={handleCopyEmail}
              className="bg-white text-[#121316] px-2.5 py-1 sm:py-0.5 font-bold hover:bg-neo-yellow hover:text-black transition-colors flex items-center gap-1 neo-box-sm text-[11px] cursor-pointer"
            >
              {copiedEmail ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
              <span>{copiedEmail ? 'Copied!' : 'Email'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. STICKY NAVBAR */}
      <header className="sticky top-0 z-40 bg-neo-bg/95 backdrop-blur-md border-b-[2.5px] border-[#121316]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-3.5 flex justify-between items-center">
          <button 
            type="button"
            onClick={() => goToPage('home')} 
            className="flex items-center gap-2 group cursor-pointer text-left bg-transparent border-0 p-0"
          >
            <div className="bg-neo-yellow text-black px-2.5 py-1 font-black text-lg border-2 border-[#121316] shadow-[2px_2px_0px_#121316] group-hover:bg-neo-pink group-hover:text-white transition-colors">
              R
            </div>
            <span className="font-extrabold text-lg sm:text-xl tracking-tight text-[#121316]">RAIYAN<span className="text-neo-pink">.DEV</span></span>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-3 lg:gap-4 font-bold text-sm text-[#121316]">
            <button 
              onClick={() => goToPage('home')} 
              className={`cursor-pointer hover:text-neo-pink transition-colors px-1 py-0.5 ${currentPage === 'home' && activeSection === 'hero' ? 'text-neo-pink underline underline-offset-4 decoration-2 font-black' : ''}`}
            >
              Home
            </button>
            <button 
              onClick={() => scrollToSection('services')} 
              className={`cursor-pointer hover:text-neo-pink transition-colors px-1 py-0.5 ${currentPage === 'home' && activeSection === 'services' ? 'text-neo-pink underline underline-offset-4 decoration-2 font-black' : ''}`}
            >
              Services
            </button>
            <button 
              onClick={() => scrollToSection('skills')} 
              className={`cursor-pointer hover:text-neo-pink transition-colors px-1 py-0.5 ${currentPage === 'home' && activeSection === 'skills' ? 'text-neo-pink underline underline-offset-4 decoration-2 font-black' : ''}`}
            >
              Stack
            </button>
            <button 
              onClick={() => scrollToSection('projects')} 
              className={`cursor-pointer hover:text-neo-pink transition-colors px-1 py-0.5 ${currentPage === 'home' && activeSection === 'projects' ? 'text-neo-pink underline underline-offset-4 decoration-2 font-black' : ''}`}
            >
              Work
            </button>
            
            <button 
              onClick={() => scrollToSection('faq')} 
              className={`cursor-pointer hover:text-neo-pink transition-colors px-1 py-0.5 ${currentPage === 'home' && activeSection === 'faq' ? 'text-neo-pink underline underline-offset-4 decoration-2 font-black' : ''}`}
            >
              FAQ
            </button>
          </nav>

          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* CLI Terminal Trigger */}
            <button
              type="button"
              onClick={() => {
                setIsTerminalOpen(true);
                playClickSound(800);
              }}
              title="Open Terminal (Ctrl + K)"
              className="hidden lg:inline-flex items-center gap-1.5 px-3 h-9 text-xs font-mono font-black bg-[#121316] text-neo-lime neo-btn hover:bg-neutral-800 cursor-pointer"
            >
              <Terminal className="w-3.5 h-3.5 text-neo-lime" />
              <span>CLI (Ctrl+K)</span>
            </button>

            {/* Mini Game Trigger */}
            <button
              type="button"
              onClick={() => {
                setIsGameOpen(true);
                playPopSound(700);
              }}
              title="Play 25s Speed Game"
              className="hidden xl:inline-flex items-center gap-1.5 px-3 h-9 text-xs font-black bg-neo-yellow text-black neo-btn hover:bg-neo-pink hover:text-white cursor-pointer"
            >
              <Gamepad2 className="w-3.5 h-3.5" />
              <span>Game</span>
            </button>

            <a 
              href="https://github.com/mrra1yan" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center justify-center gap-2 px-3.5 sm:px-4 h-9 text-xs font-extrabold bg-white text-[#121316] neo-btn hover:bg-[#faf7f2]"
            >
              <GithubIcon className="w-4 h-4" />
              <span>GitHub</span>
            </a>

            <button 
              onClick={() => scrollToSection('contact')} 
              className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 h-9 text-xs font-extrabold bg-neo-lime text-black neo-btn hover:bg-neo-yellow cursor-pointer"
            >
              <span>Let's Talk</span>
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-9 h-9 flex items-center justify-center bg-white text-[#121316] neo-btn cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile App Drawer / Sheet */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t-2 border-[#121316] p-4 sm:p-5 shadow-2xl animate-fadeIn">
            {/* User Info Card in Drawer */}
            <div className="flex items-center gap-3 p-3 bg-[#faf7f2] neo-box-sm mb-3">
              <img 
                src="https://github.com/mrra1yan.png" 
                alt="Raiyan Imon"
                loading="lazy"
                decoding="async"
                className="w-12 h-12 border-2 border-[#121316] object-cover bg-neo-lime"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <h4 className="font-extrabold text-sm text-[#121316] truncate">Raiyan Imon</h4>
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                </div>
                <p className="text-[11px] font-semibold text-neutral-600 truncate">WordPress & Headless Specialist</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-[10px] font-bold text-emerald-500">Available for hire</span>
                </div>
              </div>
            </div>

            {/* Interactive Creative Quick Bar in Mobile Drawer */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsTerminalOpen(true);
                }}
                className="p-2 bg-[#121316] text-neo-lime neo-box-sm flex flex-col items-center justify-center gap-1 cursor-pointer font-mono"
              >
                <Terminal className="w-4 h-4 text-neo-lime" />
                <span className="text-[10px] font-bold">CLI Shell</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsGameOpen(true);
                }}
                className="p-2 bg-neo-yellow text-black neo-box-sm flex flex-col items-center justify-center gap-1 cursor-pointer"
              >
                <Gamepad2 className="w-4 h-4 text-black" />
                <span className="text-[10px] font-black">Play Game</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsStickersOpen(true);
                }}
                className="p-2 bg-neo-pink text-white neo-box-sm flex flex-col items-center justify-center gap-1 cursor-pointer"
              >
                <Sticker className="w-4 h-4 text-white" />
                <span className="text-[10px] font-black">Stickers</span>
              </button>
            </div>

            {/* App-like Navigation List */}
            <div className="grid grid-cols-2 gap-2 mb-4 font-bold text-xs">
              <button 
                onClick={() => goToPage('home')} 
                className={`p-2.5 bg-white text-[#121316] neo-box-sm flex items-center gap-2 hover:bg-neo-yellow hover:text-black text-left cursor-pointer ${
                  currentPage === 'home' && activeSection === 'hero' ? 'bg-neo-yellow text-black font-black' : ''
                }`}
              >
                <Home className="w-4 h-4 text-neo-pink" />
                <span>Home</span>
              </button>

              <button 
                onClick={() => scrollToSection('services')} 
                className="p-2.5 bg-white text-[#121316] neo-box-sm flex items-center gap-2 hover:bg-neo-yellow hover:text-black text-left cursor-pointer"
              >
                <Briefcase className="w-4 h-4 text-neo-cyan" />
                <span>Services</span>
              </button>
              <button 
                onClick={() => scrollToSection('skills')} 
                className="p-2.5 bg-white text-[#121316] neo-box-sm flex items-center gap-2 hover:bg-neo-yellow hover:text-black text-left cursor-pointer"
              >
                <Cpu className="w-4 h-4 text-neo-lime" />
                <span>Tech Stack</span>
              </button>
              <button 
                onClick={() => scrollToSection('projects')} 
                className="p-2.5 bg-white text-[#121316] neo-box-sm flex items-center gap-2 hover:bg-neo-yellow hover:text-black text-left cursor-pointer"
              >
                <Rocket className="w-4 h-4 text-neo-purple" />
                <span>Projects</span>
              </button>
            </div>

            {/* Quick Actions in Drawer */}
            <div className="flex gap-2">
              <button 
                onClick={handleCopyEmail}
                className="flex-1 bg-white text-[#121316] neo-btn py-2 text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedEmail ? 'Email Copied' : 'Copy Email'}</span>
              </button>
              <a 
                href="https://github.com/mrra1yan" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-black text-white neo-btn px-3 py-2 text-xs font-bold flex items-center justify-center gap-1"
              >
                <GithubIcon className="w-4 h-4" />
                <span>GitHub</span>
              </a>
            </div>
          </div>
        )}
      </header>

      <main id="main">
        <Routes>
          <Route
            path="/"
            element={
              <>
                {/* 3. HERO SECTION */}
                <section id="hero" className="pt-8 sm:pt-14 pb-12 sm:pb-16 relative">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 flex flex-col items-start text-left">
              
              {/* Status Pill + Live Dhaka Clock */}
              <div className="flex flex-wrap items-center gap-2 mb-5 sm:mb-6">
                <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 bg-neo-yellow text-black neo-badge text-xs sm:text-sm font-extrabold uppercase">
                  <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-black" />
                  <span>Full-Stack WordPress & Headless Engineer</span>
                </div>
                <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 bg-white text-[#121316] neo-badge text-xs sm:text-sm font-extrabold uppercase">
                  <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-neo-cyan" />
                  <span>Dhaka HQ — {dhakaTime || '--:--'} GMT+6</span>
                </div>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-extrabold tracking-tight leading-[1.18] sm:leading-[1.15] mb-4 sm:mb-5 text-[#121316]">
                Building <span className="bg-neo-cyan text-black px-2 py-0.5 neo-badge inline-block transform -rotate-1">fast, modern</span> & high-converting websites.
              </h1>

              {/* Subtitle */}
              <p className="text-sm sm:text-base md:text-lg text-neutral-600 font-medium leading-relaxed mb-6 sm:mb-8 max-w-xl">
                Hi, I'm <strong className="text-[#121316] font-bold">Raiyan Imon</strong>. I bridge the gap between design and solid engineering — crafting custom WordPress themes, bespoke PHP solutions, and headless architectures with React.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6 sm:mb-8 w-full sm:w-auto">
                <button 
                  onClick={() => scrollToSection('projects')} 
                  className="bg-neo-pink text-white px-6 h-12 text-sm sm:text-base font-extrabold neo-btn hover:bg-rose-500 inline-flex items-center justify-center gap-2 cursor-pointer shadow-[3px_3px_0px_#121316]"
                >
                  <Rocket className="w-4 h-4" />
                  <span>View Selected Work</span>
                </button>
                
                <button 
                  onClick={handleCopyEmail}
                  className="bg-white text-[#121316] px-6 h-12 text-sm sm:text-base font-bold neo-btn hover:bg-[#faf7f2] inline-flex items-center justify-center gap-2 cursor-pointer shadow-[3px_3px_0px_#121316]"
                >
                  {copiedEmail ? <Check className="w-4 h-4 text-green-500" /> : <Mail className="w-4 h-4" />}
                  <span>{copiedEmail ? 'Email Copied!' : 'Get In Touch'}</span>
                </button>
              </div>

              {/* Trust Badges */}
              <div className="pt-4 border-t-2 border-[#121316]/30 w-full flex flex-wrap gap-y-2 gap-x-4 sm:gap-x-6 text-xs sm:text-sm font-semibold text-neutral-600">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500 flex-shrink-0" />
                  <span>Custom PHP & Clean Code</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500 flex-shrink-0" />
                  <span>PageSpeed 90+ Guaranteed</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500 flex-shrink-0" />
                  <span>Seamless Elementor Editing</span>
                </div>
              </div>
            </div>

            {/* Right Card / Visual */}
            <div className="lg:col-span-5 w-full flex justify-end">
              <div className="w-full bg-white neo-box p-4 sm:p-6 relative">
                
                {/* Header of Card */}
                <div className="flex items-center justify-between pb-3 sm:pb-4 mb-3 sm:mb-4 border-b-2 border-[#121316]">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-rose-400 border border-black"></div>
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-amber-400 border border-black"></div>
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-emerald-400 border border-black"></div>
                  </div>
                  <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider bg-neo-yellow text-black px-2 py-0.5 neo-badge">
                    raiyan.config.json
                  </span>
                </div>

                {/* Profile Card Center */}
                <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-5">
                  <div className="relative flex-shrink-0">
                    <img 
                      src="https://github.com/mrra1yan.png" 
                      alt="Raiyan Imon"
                      className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 border-[2.5px] border-[#121316] object-cover bg-neo-lime"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-neo-lime p-1 neo-badge rounded-none" title="Online & Available">
                      <div className="w-2.5 h-2.5 bg-emerald-600 rounded-full"></div>
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 mb-1">
                      <h3 className="font-extrabold text-base sm:text-lg text-[#121316] truncate">Raiyan Imon</h3>
                      <ShieldCheck className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    </div>
                    <p className="text-[11px] sm:text-xs font-semibold text-neutral-600 mb-2 truncate">WordPress & Headless Specialist</p>
                    <div className="flex flex-wrap gap-1.5">
                      <span className="text-[10px] sm:text-[11px] font-bold bg-neo-pink/20 text-neo-pink px-1.5 py-0.5 border border-neo-pink/40">PHP 8+</span>
                      <span className="text-[10px] sm:text-[11px] font-bold bg-neo-cyan/20 text-neo-cyan px-1.5 py-0.5 border border-neo-cyan/40">React 19</span>
                      <span className="text-[10px] sm:text-[11px] font-bold bg-neo-yellow/20 text-neo-yellow px-1.5 py-0.5 border border-neo-yellow/40">Elementor</span>
                    </div>
                  </div>
                </div>

                {/* Live Snippet Box */}
                <div className="bg-[#0f1117] text-neutral-200 p-3 sm:p-3.5 rounded-none font-mono text-[11px] sm:text-xs mb-3 sm:mb-4 border-2 border-[#121316] overflow-x-auto">
                  <div className="text-neutral-400 mb-1.5 flex items-center justify-between">
                    <span>// Current Focus</span>
                    <span className="text-neo-lime font-bold">Active</span>
                  </div>
                  <p className="text-emerald-400 font-semibold mb-0.5">const developer = &#123;</p>
                  <p className="pl-3 sm:pl-4 text-neutral-300">stack: ["WordPress", "PHP", "Headless React"],</p>
                  <p className="pl-3 sm:pl-4 text-neutral-300">experience: "Custom Themes & Speed",</p>
                  <p className="pl-3 sm:pl-4 text-neo-yellow truncate">status: "Ready for your milestone"</p>
                  <p className="text-emerald-400 font-semibold">&#125;;</p>
                </div>

                {/* Quick Interactive GitHub link */}
                <div className="flex items-center justify-between pt-2.5 sm:pt-3 border-t-2 border-dashed border-[#121316]/30 text-xs font-bold">
                  <span className="text-neutral-600">GitHub Profile:</span>
                  <a 
                    href="https://github.com/mrra1yan" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-[#121316] hover:text-neo-pink flex items-center gap-1 underline underline-offset-2"
                  >
                    <span>@mrra1yan</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. MARQUEE STRIP */}
      <div className="bg-neo-yellow text-black border-y-[2.5px] border-[#121316] py-2.5 sm:py-3 overflow-hidden font-extrabold text-xs sm:text-sm md:text-base tracking-wider uppercase">
        <div className="marquee-container">
          <div className="marquee-content gap-6 sm:gap-8 items-center">
            <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-black" /> Custom WordPress Themes</span>
            <span className="w-1.5 h-1.5 rounded-full bg-black"></span>
            <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-black" /> Headless CMS + React</span>
            <span className="w-1.5 h-1.5 rounded-full bg-black"></span>
            <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-black" /> Elementor Pro Custom Widgets</span>
            <span className="w-1.5 h-1.5 rounded-full bg-black"></span>
            <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-black" /> 90+ Core Web Vitals Guaranteed</span>
            <span className="w-1.5 h-1.5 rounded-full bg-black"></span>
            <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-black" /> WooCommerce Checkout Optimization</span>
            <span className="w-1.5 h-1.5 rounded-full bg-black"></span>
            <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-black" /> Custom WordPress Themes</span>
            <span className="w-1.5 h-1.5 rounded-full bg-black"></span>
            <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-black" /> Headless CMS + React</span>
          </div>
        </div>
      </div>

      {/* 5. IMPACT STATS SECTION */}
      <section className="py-8 sm:py-12 bg-white border-b-[2.5px] border-[#121316]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
            {stats.map((stat, idx) => (
              <div key={idx} className="p-3.5 sm:p-5 bg-[#faf7f2] neo-box-sm flex flex-col justify-between">
                <div className="flex justify-between items-center mb-2 sm:mb-3">
                  <span className="p-1.5 sm:p-2 bg-white neo-box-sm">{stat.icon}</span>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl md:text-3xl font-black text-[#121316] tracking-tight">{stat.value}</div>
                  <div className="text-[11px] sm:text-xs md:text-sm font-bold text-neutral-600 mt-0.5 sm:mt-1 leading-tight">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. SERVICES SECTION */}
      <section id="services" className="py-12 sm:py-20">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-neo-cyan text-black neo-badge text-xs font-bold uppercase mb-2 sm:mb-3">
                <Briefcase className="w-3.5 h-3.5" />
                <span>Specialized Offerings</span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-[#121316]">
                Architectural Expertise & Services.
              </h2>
            </div>
            <p className="text-xs sm:text-sm md:text-base text-neutral-600 font-medium max-w-md mt-2 sm:mt-3 md:mt-0">
              Battle-tested development scopes designed for speed, security, effortless content management, and commercial scale.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {services.map((service) => (
              <div 
                key={service.id} 
                className="bg-white neo-box p-4 sm:p-5 md:p-6 flex flex-col justify-between relative neo-box-hover overflow-hidden group"
              >
                {/* Decorative Top Accent Tag */}
                <div className="flex items-center justify-between mb-3 pb-2.5 border-b-2 border-[#121316]">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 bg-[#121316] text-white font-mono font-black text-xs flex items-center justify-center neo-box-sm">
                      {service.number}
                    </span>
                    <span className={`text-[10px] sm:text-[11px] font-extrabold uppercase px-2 py-0.5 neo-badge ${service.badgeColor}`}>
                      {service.category}
                    </span>
                  </div>

                  {/* Turnaround Badge */}
                  <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-bold bg-[#faf7f2] px-2 py-0.5 neo-box-sm text-[#121316]">
                    <Clock className="w-3 h-3 text-neo-pink" />
                    <span>{service.turnaround}</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2.5 mb-2">
                    <span className="p-1.5 bg-[#faf7f2] neo-box-sm">{service.icon}</span>
                    <h3 className="text-base sm:text-lg md:text-xl font-extrabold text-[#121316]">{service.title}</h3>
                  </div>

                  <p className="text-xs sm:text-sm text-neutral-600 font-medium leading-relaxed mb-3">
                    {service.desc}
                  </p>

                  {/* Tech Ingredients Pills */}
                  <div className="flex flex-wrap items-center gap-1.5 mb-3.5">
                    <span className="text-[10px] font-mono uppercase text-neutral-600 font-bold mr-0.5">Tech:</span>
                    {service.techIngredients.map((tech, tIdx) => (
                      <span key={tIdx} className="text-[10px] sm:text-[11px] font-mono font-bold bg-[#faf7f2] text-[#121316] px-1.5 py-0.5 border border-[#121316]">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Deliverables Checklist & CTA */}
                <div className="pt-3 border-t-2 border-[#121316]/30 mt-auto">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-neutral-600">Deliverables</span>
                    <span className="text-[10px] sm:text-[11px] font-extrabold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 border border-emerald-500/40 flex items-center gap-1">
                      <Zap className="w-3 h-3 text-amber-500" />
                      {service.speedRating}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mb-3">
                    {service.features.map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold text-[#121316]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                        <span className="truncate">{feat}</span>
                      </div>
                    ))}
                  </div>

                  <button 
                    onClick={() => scrollToSection('contact')} 
                    className="w-full bg-[#faf7f2] hover:bg-neo-yellow hover:text-black text-xs font-extrabold py-2 px-3 neo-btn flex items-center justify-between text-[#121316] cursor-pointer transition-colors"
                  >
                    <span>Request Architecture</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 7. TECH STACK WITH INTERACTIVE INSPECTOR */}
      <section id="skills" className="py-12 sm:py-20 bg-white border-y-[2.5px] border-[#121316]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-neo-lime text-black neo-badge text-xs font-bold uppercase mb-2 sm:mb-3">
              <Cpu className="w-3.5 h-3.5" />
              <span>Interactive Tech Stack</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight mb-2 sm:mb-3 text-[#121316]">
              Engineered for Speed, Maintainability & Scale.
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-neutral-600 font-medium">
              Tap any technology below to inspect live code samples, architecture roles, and production benchmarks.
            </p>
          </div>

          {/* Interactive Stack Selector Tabs */}
          <div className="flex overflow-x-auto no-scrollbar gap-2 sm:gap-3 mb-6 sm:mb-10 pb-2 sm:pb-0 sm:flex-wrap sm:justify-center touch-pan-x">
            {Object.keys(techDictionary).map((techKey) => {
              const isSelected = selectedTech === techKey;
              return (
                <button
                  key={techKey}
                  onClick={() => setSelectedTech(techKey)}
                  className={`px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-black neo-btn transition-all flex items-center gap-2 flex-shrink-0 cursor-pointer ${
                    isSelected 
                      ? 'bg-neo-yellow text-black shadow-[3px_3px_0px_#121316] -translate-y-0.5' 
                      : 'bg-[#faf7f2] text-[#121316] hover:bg-white'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-neo-pink animate-ping' : 'bg-neutral-400'}`}></span>
                  <span>{techKey}</span>
                </button>
              );
            })}
          </div>

          {/* Interactive Tech Inspector Card */}
          {techDictionary[selectedTech] && (
            <div className="bg-white neo-box p-4 sm:p-6 md:p-8 mb-10 sm:mb-16 relative overflow-hidden">
              
              {/* Header */}
              <div className="flex flex-col lg:flex-row justify-between gap-4 sm:gap-8 items-start lg:items-center pb-4 sm:pb-6 border-b-2 border-[#121316]">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1.5 sm:mb-2">
                    <span className="text-[10px] sm:text-[11px] font-mono font-extrabold text-black bg-neo-lime px-2.5 py-0.5 neo-badge uppercase tracking-wider flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-black" />
                      {techDictionary[selectedTech].status}
                    </span>
                    <span className="text-[11px] sm:text-xs text-neutral-600 font-bold font-mono">| {techDictionary[selectedTech].role}</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-[#121316]">{techDictionary[selectedTech].title}</h3>
                </div>

                {/* Proficiency Gauge */}
                <div className="bg-[#faf7f2] border-2 border-[#121316] px-4 sm:px-5 py-2.5 sm:py-3 neo-box-sm flex items-center gap-3 sm:gap-4 w-full sm:w-auto justify-between sm:justify-start">
                  <div>
                    <div className="text-[9px] sm:text-[10px] font-mono text-neutral-600 font-bold uppercase">Production Mastery</div>
                    <div className="text-lg sm:text-xl font-black text-[#121316]">{techDictionary[selectedTech].proficiency}%</div>
                  </div>
                  <div className="w-28 sm:w-32 bg-white h-3 border-2 border-[#121316] rounded-none overflow-hidden">
                    <div 
                      className="bg-neo-lime h-full transition-all duration-500" 
                      style={{ width: `${techDictionary[selectedTech].proficiency}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Code Terminal & Advantages Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 pt-4 sm:pt-6 items-stretch">
                
                {/* Developer IDE / Code Terminal Window */}
                <div className="lg:col-span-7 bg-[#121316] text-neutral-200 border-2 border-[#121316] neo-box-sm flex flex-col justify-between h-full overflow-hidden">
                  {/* Terminal Header Bar */}
                  <div className="bg-[#1e222d] text-neutral-300 px-3.5 py-2 border-b-2 border-[#121316] flex items-center justify-between font-mono text-xs">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                      <span className="text-[10px] sm:text-[11px] text-neutral-400 ml-1.5 font-bold">
                        implementation.{selectedTech.toLowerCase()}
                      </span>
                    </div>
                    <span className="text-[9px] font-bold bg-neo-pink text-white px-1.5 py-0.5 neo-badge">
                      VERIFIED
                    </span>
                  </div>

                  {/* Code Body */}
                  <div className="p-3.5 sm:p-4 font-mono text-[11px] sm:text-xs overflow-x-auto flex-1 flex flex-col justify-center bg-[#0d0e12]">
                    <pre className="text-emerald-400 font-medium leading-relaxed whitespace-pre overflow-x-auto">
                      {techDictionary[selectedTech].codeSnippet}
                    </pre>
                  </div>

                  {/* Terminal Footer */}
                  <div className="bg-[#1e222d] px-3.5 py-2 border-t-2 border-[#121316] text-[10px] sm:text-[11px] text-neutral-400 flex items-center justify-between font-mono">
                    <span className="truncate">Syntax: Strict OOP & Type Safety</span>
                    <span className="text-neo-lime font-bold flex-shrink-0 ml-2">● Active Spec</span>
                  </div>
                </div>

                {/* Architectural Advantages Bento Card */}
                <div className="lg:col-span-5 bg-[#faf7f2] border-2 border-[#121316] p-4 sm:p-5 flex flex-col justify-between h-full neo-box-sm">
                  <div>
                    <div className="text-xs font-mono font-extrabold uppercase text-[#121316] mb-3 flex items-center gap-1.5 pb-2 border-b-2 border-[#121316]/30">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      <span>Why I Chose This Stack</span>
                    </div>

                    <div className="space-y-2 sm:space-y-2.5">
                      {techDictionary[selectedTech].benefits.map((b, bIdx) => (
                        <div key={bIdx} className="flex items-start gap-2.5 text-xs sm:text-sm font-bold text-[#121316] bg-white p-2.5 border border-[#121316] neo-box-sm">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                          <span>{b}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t-2 border-[#121316]/30 text-[10px] sm:text-[11px] font-mono font-bold text-neutral-600 flex items-center justify-between">
                    <span>Ready for custom production deploy</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* 4-Bento Summary Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {skillsBento.map((bento, idx) => (
              <div key={idx} className="p-4 sm:p-6 bg-[#faf7f2] neo-box flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-3 sm:mb-4 pb-2.5 sm:pb-3 border-b-2 border-[#121316]">
                    <span className={`p-1.5 sm:p-2 neo-box-sm ${bento.color}`}>{bento.icon}</span>
                    <h3 className="font-extrabold text-sm sm:text-base text-[#121316]">{bento.group}</h3>
                  </div>
                  <div className="flex flex-col gap-1.5 sm:gap-2">
                    {bento.items.map((item, iIdx) => (
                      <div 
                        key={iIdx} 
                        className="px-2.5 sm:px-3 py-1.5 sm:py-2 bg-white neo-box-sm text-[11px] sm:text-xs md:text-sm font-bold text-[#121316] flex items-center justify-between"
                      >
                        <span className="truncate">{item}</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-neo-border flex-shrink-0 ml-1"></span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 8. PROJECTS SHOWCASE (INTERACTIVE SLIDER) */}
      <section id="projects" className="py-12 sm:py-20">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header & Controls */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-6 sm:mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-neo-purple text-black neo-badge text-xs font-bold uppercase mb-2 sm:mb-3">
                <Rocket className="w-3.5 h-3.5" />
                <span>Confidential Client Engagements</span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-[#121316]">
                Real Work. Zero Disclosure.
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 font-medium mt-1">
                Slide or swipe through anonymized case studies — client names, links & screenshots stay private under NDA. The metrics and stacks are real.
              </p>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex overflow-x-auto no-scrollbar gap-1.5 pb-1 sm:pb-0 touch-pan-x w-full sm:w-auto">
              {[
                { id: 'all', label: 'All', count: projects.length },
                { id: 'headless', label: 'Headless', count: projects.filter(p => p.category === 'headless').length },
                { id: 'wordpress', label: 'WordPress', count: projects.filter(p => p.category === 'wordpress').length }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => handleProjectTabChange(tab.id)}
                  className={`px-3 py-1.5 text-xs font-bold neo-btn flex items-center gap-1.5 flex-shrink-0 cursor-pointer ${
                    activeTab === tab.id 
                      ? 'bg-neo-yellow text-black shadow-[2.5px_2.5px_0px_#121316]' 
                      : 'bg-white text-[#121316] hover:bg-[#faf7f2]'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className="text-[10px] font-mono px-1 py-0.5 bg-black text-white">
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Project Slider Track */}
          <div className="relative">
            <div 
              ref={projectSliderRef}
              onScroll={handleSliderScroll}
              className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 pt-1.5 snap-x snap-mandatory no-scrollbar touch-pan-x scroll-smooth"
            >
              {filteredProjects.map((project) => {
                const currentMode = projectModes[project.id] || 'overview';
                return (
                  <div 
                    key={project.id} 
                    className="project-slide-card flex-shrink-0 w-[84vw] sm:w-[350px] md:w-[370px] lg:w-[390px] bg-white neo-box flex flex-col overflow-hidden neo-box-hover snap-start"
                  >
                    {/* Retro Browser Window Header */}
                    <div className="bg-[#121316] text-neutral-300 px-3 py-1.5 sm:py-2 border-b-2 border-[#121316] flex items-center justify-between text-xs font-mono">
                      <div className="flex items-center gap-1.5 truncate">
                        <div className="w-2 h-2 rounded-full bg-rose-500 flex-shrink-0"></div>
                        <div className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0"></div>
                        <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0"></div>
                        <span className="text-[10px] sm:text-[11px] text-neutral-400 ml-1 truncate">
                          app://{project.id}
                        </span>
                      </div>

                      {/* Mode Switcher Toggle */}
                      <div className="flex items-center gap-0.5 bg-[#222634] p-0.5 border border-neutral-700 flex-shrink-0">
                        <button
                          onClick={() => setProjectModes({ ...projectModes, [project.id]: 'overview' })}
                          className={`px-1.5 py-0.5 text-[9px] font-bold uppercase transition-colors cursor-pointer ${
                            currentMode === 'overview' ? 'bg-neo-yellow text-black' : 'text-neutral-400 hover:text-white'
                          }`}
                        >
                          Preview
                        </button>
                        <button
                          onClick={() => setProjectModes({ ...projectModes, [project.id]: 'specs' })}
                          className={`px-1.5 py-0.5 text-[9px] font-bold uppercase transition-colors cursor-pointer ${
                            currentMode === 'specs' ? 'bg-neo-cyan text-black' : 'text-neutral-400 hover:text-white'
                          }`}
                        >
                          Specs
                        </button>
                      </div>
                    </div>

                    {/* Project Visual / Specs View */}
                    {currentMode === 'overview' ? (
                      <div className="h-36 sm:h-40 md:h-44 border-b-2 border-[#121316] relative overflow-hidden bg-neutral-900">
                        {/* NDA-Safe Visual: pattern + lock instead of a real screenshot */}
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0d_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0d_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 text-neutral-400">
                          <EyeOff className="w-7 h-7 sm:w-8 sm:h-8" />
                          <span className="font-mono text-[10px] sm:text-xs font-bold tracking-widest uppercase">
                            Screenshot Protected
                          </span>
                          <span className="text-[9px] sm:text-[10px] font-mono text-neutral-500">
                            sha256:••••••••••••
                          </span>
                        </div>
                        <div className="absolute top-2 left-2 max-w-[80%]">
                          <span className={`text-[9px] sm:text-[10px] font-extrabold uppercase px-1.5 py-0.5 neo-badge truncate block ${project.accentColor}`}>
                            {project.tagline}
                          </span>
                        </div>

                        {/* NDA Stamp */}
                        <div className="absolute bottom-2 left-2 bg-rose-500/10 border-2 border-rose-500 text-rose-500 px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-black uppercase tracking-widest transform -rotate-3 shadow-[2px_2px_0px_#e11d48] flex items-center gap-1">
                          <Lock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                          <span>NDA</span>
                        </div>

                        {/* Performance Metric Badge */}
                        <div className="absolute bottom-2 right-2 bg-white text-[#121316] px-1.5 sm:px-2 py-0.5 neo-badge text-[10px] sm:text-[11px] font-black flex items-center gap-1">
                          <Zap className="w-3 h-3 text-amber-500" />
                          <span>{project.metrics.speed}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="h-36 sm:h-40 md:h-44 border-b-2 border-[#121316] p-3 sm:p-3.5 bg-[#0f1117] text-neutral-300 font-mono text-[11px] flex flex-col justify-between overflow-y-auto">
                        <div>
                          <div className="text-neo-lime font-bold uppercase tracking-wider mb-1 flex items-center gap-1 text-[10px]">
                            <Sliders className="w-3 h-3" />
                            <span>Technical Architecture:</span>
                          </div>
                          <p className="text-neutral-300 leading-snug font-sans text-xs line-clamp-3">
                            {project.specs}
                          </p>
                        </div>

                        <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-neutral-800 text-[9px] sm:text-[10px]">
                          <div>
                            <span className="text-neutral-500 block">Performance</span>
                            <span className="font-bold text-neo-yellow">{project.metrics.speed}</span>
                          </div>
                          <div>
                            <span className="text-neutral-500 block">FCP Metric</span>
                            <span className="font-bold text-neo-cyan">{project.metrics.loadTime}</span>
                          </div>
                          <div>
                            <span className="text-neutral-500 block">Model</span>
                            <span className="font-bold text-neo-lime truncate block">{project.metrics.architecture}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Content */}
                    <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-base sm:text-lg font-black text-[#121316] mb-1 truncate">{project.name}</h3>
                        <p className="text-xs sm:text-[13px] text-neutral-600 font-medium leading-relaxed mb-2.5 line-clamp-2">
                          {project.desc}
                        </p>

                        {/* Tech Badges */}
                        <div className="flex flex-wrap gap-1 mb-3">
                          {project.tags.map((t, tIdx) => (
                            <span key={tIdx} className="text-[10px] sm:text-[11px] font-bold px-1.5 py-0.5 bg-[#faf7f2] neo-box-sm text-[#121316]">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* NDA Action */}
                      <div className="pt-2.5 border-t-2 border-[#121316]/30">
                        <button
                          onClick={() => scrollToSection('contact')}
                          className="w-full bg-neo-yellow text-black hover:bg-amber-300 text-xs font-black py-1.5 sm:py-2 px-2 neo-btn flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Lock className="w-3.5 h-3.5" />
                          <span>NDA Protected — Details on Call</span>
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>

          {/* Slider Progress Bar & Navigation Controls */}
          <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t-2 border-dashed border-[#121316]/30">
            {/* Slide Progress Indicator Bar */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <span className="text-[11px] sm:text-xs font-bold font-mono text-neutral-600 flex-shrink-0">
                {String(activeSlideIndex + 1).padStart(2, '0')} / {String(filteredProjects.length).padStart(2, '0')} Projects
              </span>
              <div className="w-full sm:w-48 bg-[#faf7f2] h-2 border border-[#121316] overflow-hidden">
                <div 
                  className="bg-neo-pink h-full transition-all duration-300 ease-out"
                  style={{ width: `${Math.min(100, Math.max(10, ((activeSlideIndex + 1) / filteredProjects.length) * 100))}%` }}
                ></div>
              </div>
            </div>

            {/* Mobile & Desktop navigation hint and arrow buttons */}
            <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
              <span className="text-[11px] font-bold text-neutral-600">Swipe or use arrows to explore</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => scrollProjects('left')}
                  disabled={!canScrollLeft}
                  aria-label="Previous project"
                  className="p-1.5 sm:p-2 bg-white hover:bg-neo-yellow text-[#121316] hover:text-black neo-btn disabled:opacity-30 disabled:hover:bg-white flex items-center justify-center cursor-pointer disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => scrollProjects('right')}
                  disabled={!canScrollRight}
                  aria-label="Next project"
                  className="p-1.5 sm:p-2 bg-white hover:bg-neo-yellow text-[#121316] hover:text-black neo-btn disabled:opacity-30 disabled:hover:bg-white flex items-center justify-center cursor-pointer disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 9. WORK PROCESS SECTION */}
      <section id="process" className="py-12 sm:py-20 bg-white border-y-[2.5px] border-[#121316]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-xl mx-auto mb-8 sm:mb-14">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-neo-pink text-white neo-badge text-xs font-bold uppercase mb-2 sm:mb-3">
              <Clock className="w-3.5 h-3.5" />
              <span>Workflow</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight mb-2 sm:mb-3 text-[#121316]">
              Simple, Transparent 4-Step Process.
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-neutral-600 font-medium">
              From concept to live production with clear milestones and zero technical ambiguity.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {processSteps.map((step, idx) => (
              <div key={idx} className="p-4 sm:p-6 bg-[#faf7f2] neo-box flex flex-col justify-between relative">
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-neo-pink mb-2 sm:mb-3 font-mono">
                    {step.step}
                  </div>
                  <h3 className="text-base sm:text-lg font-extrabold text-[#121316] mb-1.5 sm:mb-2">{step.title}</h3>
                  <p className="text-xs sm:text-sm text-neutral-600 font-medium leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 10. CLIENT REVIEWS */}
      <section className="py-12 sm:py-20">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
            
            <div className="lg:col-span-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-neo-lime text-black neo-badge text-xs font-bold uppercase mb-2 sm:mb-3">
                <Star className="w-3.5 h-3.5 fill-black" />
                <span>Testimonials</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2 sm:mb-4 text-[#121316]">
                What Collaborators Say About Working With Me.
              </h2>
              <p className="text-xs sm:text-sm md:text-base text-neutral-600 font-medium">
                Proven track record of delivering clean code, fast turnaround, and proactive communication.
              </p>
            </div>

            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {testimonials.map((testi, idx) => (
                <div key={idx} className="bg-white neo-box p-4 sm:p-6 flex flex-col justify-between">
                  <div>
                    {/* 5 Stars */}
                    <div className="flex gap-1 mb-3 sm:mb-4 text-amber-400">
                      {[...Array(testi.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-500" />
                      ))}
                    </div>
                    <p className="text-xs sm:text-sm md:text-base font-semibold text-[#121316] leading-relaxed mb-4 sm:mb-6 italic">
                      "{testi.quote}"
                    </p>
                  </div>
                  <div className="pt-3 sm:pt-4 border-t-2 border-[#121316]/30 flex items-center justify-between">
                    <div>
                      <div className="font-extrabold text-xs sm:text-sm text-[#121316]">{testi.author}</div>
                      <div className="text-[11px] sm:text-xs font-semibold text-neutral-600">{testi.role}, {testi.company}</div>
                    </div>
                    <span className="text-[10px] sm:text-xs font-bold bg-neo-yellow text-black px-2 py-0.5 neo-badge">Verified</span>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* 11. FAQ ACCORDION */}
      <section id="faq" className="py-12 sm:py-20 bg-white border-y-[2.5px] border-[#121316]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            
            <div className="text-center mb-8 sm:mb-12">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-neo-cyan text-black neo-badge text-xs font-bold uppercase mb-2 sm:mb-3">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Questions & Answers</span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight mb-2 sm:mb-3 text-[#121316]">
                Frequently Asked Questions.
              </h2>
              <p className="text-xs sm:text-sm md:text-base text-neutral-600 font-medium">
                Clear answers regarding tech decisions, workflow, and project kickoff.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:gap-4">
              {faqs.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div 
                    key={idx} 
                    className={`neo-box overflow-hidden transition-all duration-300 ${isOpen ? 'bg-white shadow-[5px_5px_0px_#121316]' : 'bg-[#faf7f2]'}`}
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? -1 : idx)}
                      className={`w-full p-4 sm:p-5 text-left font-extrabold text-xs sm:text-sm md:text-base flex justify-between items-center gap-3 sm:gap-4 transition-colors cursor-pointer ${
                        isOpen ? 'bg-neo-yellow/20 text-[#121316]' : 'hover:bg-white text-[#121316]'
                      }`}
                    >
                      <span className="flex items-center gap-2 sm:gap-3">
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 transition-colors ${isOpen ? 'bg-neo-pink' : 'bg-neutral-400'}`}></span>
                        <span>{faq.q}</span>
                      </span>
                      <div className={`p-1 sm:p-1.5 neo-box-sm transition-transform duration-300 ease-out flex-shrink-0 ${isOpen ? 'rotate-180 bg-neo-yellow text-black' : 'bg-white text-[#121316]'}`}>
                        <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </div>
                    </button>
                    
                    {/* Smooth Accordion Content Transition */}
                    <div 
                      className={`grid transition-all duration-300 ease-in-out ${
                        isOpen 
                          ? 'grid-rows-[1fr] opacity-100 border-t-2 border-[#121316]' 
                          : 'grid-rows-[0fr] opacity-0 border-t-0'
                      }`}
                    >
                      <div className="overflow-hidden">
                        <div className="p-4 sm:p-5 text-xs sm:text-sm text-neutral-600 font-medium leading-relaxed bg-white">
                          {faq.a}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      </section>


      {/* 12. HIGH CONVERTING CONTACT SECTION */}
      <section id="contact" className="py-12 sm:py-20">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="bg-neo-yellow text-black neo-box p-5 sm:p-8 md:p-12 relative overflow-hidden border-4 border-[#121316]">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
              
              {/* Left Column */}
              <div className="lg:col-span-5 flex flex-col justify-between">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white text-black neo-badge text-xs font-bold uppercase mb-3 sm:mb-4">
                    <Mail className="w-3.5 h-3.5" />
                    <span>Project Kickoff</span>
                  </div>
                  
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-black mb-3 sm:mb-4">
                    Have a project in mind? Let’s make it real.
                  </h2>
                  
                  <p className="text-xs sm:text-sm md:text-base text-neutral-800 font-medium leading-relaxed mb-5 sm:mb-6">
                    Whether you need a full headless WordPress build, Elementor page development, or speed tuning, send a message and I'll respond within 24 hours.
                  </p>
                </div>

                <div className="space-y-2.5 sm:space-y-3 pt-4 sm:pt-6 border-t-2 border-black">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white neo-box-sm">
                      <Mail className="w-4 h-4 text-black" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] sm:text-[11px] font-bold text-neutral-700 uppercase">Direct Email</div>
                      <div className="font-extrabold text-xs sm:text-sm text-black truncate">{CONTACT_EMAIL}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white neo-box-sm">
                      <Clock className="w-4 h-4 text-black" />
                    </div>
                    <div>
                      <div className="text-[10px] sm:text-[11px] font-bold text-neutral-700 uppercase">Availability</div>
                      <div className="font-extrabold text-xs sm:text-sm text-black">Open for freelance & contracts</div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Right Column: Form */}
              <div className="lg:col-span-7">
                <form onSubmit={handleFormSubmit} className="bg-white text-[#121316] neo-box p-4 sm:p-6 md:p-8 flex flex-col gap-3.5 sm:gap-4 border-[3px] border-[#121316]">
                  {formError && (
                    <div role="alert" className="p-3 bg-rose-500/10 border-2 border-rose-500 text-rose-700 text-xs sm:text-sm font-bold">
                      {formError}
                    </div>
                  )}
                  {formSubmitted ? (
                    <div className="py-8 sm:py-12 text-center">
                      <div className="w-12 h-12 bg-neo-lime rounded-full neo-box-sm flex items-center justify-center mx-auto mb-3">
                        <Check className="w-6 h-6 text-black" />
                      </div>
                      <h3 className="text-lg sm:text-xl font-extrabold text-[#121316] mb-1">Message Sent Successfully!</h3>
                      <p className="text-xs sm:text-sm font-medium text-neutral-600">Thank you for reaching out. I'll get back to you shortly.</p>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div>
                          <label className="block text-xs font-extrabold uppercase mb-1 text-[#121316]">Your Name *</label>
                          <input 
                            type="text" 
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Alex Morgan" 
                            className="w-full px-3.5 py-2.5 bg-[#faf7f2] border-2 border-[#121316] text-[#121316] font-medium text-base sm:text-sm focus:outline-none focus:bg-white focus:shadow-[2px_2px_0px_#121316]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-extrabold uppercase mb-1 text-[#121316]">Email Address *</label>
                          <input 
                            type="email" 
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="alex@company.com" 
                            className="w-full px-3.5 py-2.5 bg-[#faf7f2] border-2 border-[#121316] text-[#121316] font-medium text-base sm:text-sm focus:outline-none focus:bg-white focus:shadow-[2px_2px_0px_#121316]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-extrabold uppercase mb-1 text-[#121316]">Project Budget / Scope</label>
                        <NeoSelect
                          name="budget"
                          value={formData.budget}
                          onChange={(budget) => setFormData({ ...formData, budget })}
                          options={BUDGET_OPTIONS}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-extrabold uppercase mb-1 text-[#121316]">Project Overview *</label>
                        <textarea 
                          rows="4" 
                          required
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          placeholder="Briefly describe your goals, required pages, or existing challenges..." 
                          className="w-full px-3.5 py-2.5 bg-[#faf7f2] border-2 border-[#121316] text-[#121316] font-medium text-base sm:text-sm focus:outline-none focus:bg-white focus:shadow-[2px_2px_0px_#121316]"
                        ></textarea>
                      </div>

                      <button 
                        type="submit" 
                        disabled={formSubmitting}
                        className="w-full bg-[#121316] text-white py-3.5 text-sm sm:text-base font-extrabold neo-btn hover:bg-neo-pink hover:text-white transition-colors flex items-center justify-center gap-2 mt-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#121316] shadow-[3px_3px_0px_#fff]"
                      >
                        <Send className="w-4 h-4" />
                        <span>{formSubmitting ? 'Sending...' : 'Send Project Request'}</span>
                      </button>
                    </>
                  )}
                </form>
              </div>

            </div>
          </div>

        </div>
      </section>
              </>
            }
          />
          <Route path="*" element={<NotFoundPage onNavigate={goToPage} onOpenTerminal={() => setIsTerminalOpen(true)} />} />
        </Routes>
      </main>

      {/* 13. CREATIVE INTERACTIVE FOOTER */}
      <footer className="bg-[#121316] text-white pt-10 sm:pt-16 pb-12 sm:pb-16 border-t-[3px] border-[#121316] relative overflow-hidden">
        
        {/* Background Retro Grid Texture */}
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[linear-gradient(to_right,#ffffff15_1px,transparent_1px),linear-gradient(to_bottom,#ffffff15_1px,transparent_1px)] bg-[size:32px_32px]"></div>

        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

          {/* A. RETRO BOARDING PASS / LAUNCH TICKET */}
          <div className="bg-white text-[#121316] neo-box p-4 sm:p-6 md:p-8 mb-10 sm:mb-16 relative border-4 border-[#121316] shadow-[6px_6px_0px_#121316]">
            
            {/* Perforated Side Cutouts / Ticket Notches */}
            <div className="hidden sm:block absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#121316] border-2 border-[#121316]"></div>
            <div className="hidden sm:block absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#121316] border-2 border-[#121316]"></div>

            <div className="flex flex-col lg:flex-row justify-between gap-4 sm:gap-8 items-start lg:items-center pb-4 sm:pb-6 border-b-2 border-dashed border-[#121316]/40">
              
              {/* Ticket Left: Origin -> Destination */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6">
                <div className="bg-neo-yellow text-black p-2.5 sm:p-3 neo-box-sm">
                  <Ticket className="w-6 h-6 sm:w-8 sm:h-8 text-black" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1">
                    <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest bg-neo-pink text-white px-2 py-0.5 neo-badge">
                      BOARDING PASS: 2026-SHP
                    </span>
                    <span className="text-[10px] sm:text-xs font-bold text-neutral-600">GATE: WP-01</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-base sm:text-xl md:text-2xl font-black">
                    <span className="text-[#121316] flex items-center gap-1">
                      <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
                      CLIENT VISION
                    </span>
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-neo-pink flex-shrink-0 animate-pulse" />
                    <span className="text-emerald-500 bg-emerald-500/15 px-1.5 sm:px-2 border border-emerald-500 flex items-center gap-1">
                      <Rocket className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" />
                      100/100 PRODUCTION
                    </span>
                  </div>
                </div>
              </div>

              {/* Ticket Right: Verified Stamp & Status */}
              <div className="flex items-center gap-3 sm:gap-4 self-start sm:self-auto mt-2 sm:mt-0">
                <div className="text-right hidden md:block">
                  <div className="text-[10px] font-extrabold uppercase text-neutral-600">Passenger</div>
                  <div className="font-black text-xs sm:text-sm text-[#121316]">YOU (FUTURE CLIENT)</div>
                  <div className="text-[10px] font-bold text-emerald-500 flex items-center justify-end gap-1">
                    <CheckCircle2 className="w-3 h-3" /> SEAT: PRIORITY
                  </div>
                </div>
                
                {/* Approved Rubber Stamp */}
                <div className="border-[2.5px] sm:border-[3px] border-rose-500 text-rose-500 font-black text-[10px] sm:text-xs px-2.5 sm:px-3 py-1.5 sm:py-2 uppercase tracking-widest transform rotate-3 sm:rotate-6 bg-rose-500/10 shadow-[2px_2px_0px_#e11d48]">
                  APPROVED FOR SHIPMENT
                </div>
              </div>

            </div>

            {/* Ticket Bottom Details Strip */}
            <div className="pt-4 sm:pt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 text-xs font-bold text-neutral-600">
              
              {/* Barcode Graphic */}
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="font-mono tracking-widest text-sm sm:text-lg font-black text-[#121316] select-none">
                  ||| | |||| || | ||||| |||
                </div>
                <span className="text-[10px] sm:text-[11px] font-mono text-neutral-600">#RAIYAN-DEV-PASS</span>
              </div>

              {/* Live Audio / Vibe Indicator */}
              <div className="flex items-center gap-2 bg-[#faf7f2] px-2.5 sm:px-3 py-1 sm:py-1.5 neo-box-sm text-[11px] sm:text-xs text-[#121316]">
                <Radio className="w-3.5 h-3.5 text-neo-pink animate-pulse" />
                <span className="text-neutral-600">Soundtrack:</span>
                <span className="font-extrabold text-[#121316] flex items-center gap-1">
                  <Headphones className="w-3.5 h-3.5 text-neo-pink" />
                  <span>Lo-Fi Beats</span>
                </span>
                <div className="flex items-end gap-0.5 h-3 ml-1">
                  <span className="w-1 bg-neo-pink h-3 animate-pulse"></span>
                  <span className="w-1 bg-neo-yellow h-2 animate-pulse" style={{ animationDelay: '0.2s' }}></span>
                  <span className="w-1 bg-neo-cyan h-3.5 animate-pulse" style={{ animationDelay: '0.4s' }}></span>
                </div>
              </div>

            </div>

          </div>

          {/* B. INTERACTIVE MOODBOARD / REACTION BADGES + MINI TERMINAL */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 mb-10 sm:mb-16">
            
            {/* 1. Icon Reaction Station */}
            <div className="lg:col-span-6 bg-[#1a1c23] border-2 border-neutral-700 p-4 sm:p-6 neo-box-sm text-white flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3 sm:mb-4 pb-2.5 sm:pb-3 border-b border-neutral-800">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-neo-yellow" />
                    <span className="text-xs font-extrabold uppercase tracking-wider text-neo-yellow">Interactive Feedback</span>
                  </div>
                  <span className="text-[10px] sm:text-[11px] font-bold text-neutral-400">Tap to react</span>
                </div>
                <h4 className="text-base sm:text-lg font-extrabold text-white mb-1 sm:mb-2">How’s the portfolio vibe so far?</h4>
                <p className="text-xs text-neutral-400 font-medium mb-4 sm:mb-5">Tap any badge to drop instant appreciation into the live counter!</p>
              </div>

              {/* Reaction Buttons Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
                {[
                  {
                    id: 'fire',
                    icon: <Flame className="w-4 h-4 sm:w-5 sm:h-5" />,
                    label: 'Super Fire',
                    hoverClasses: 'hover:bg-neo-pink hover:border-black hover:text-black hover:shadow-[3px_3px_0px_#ffffff]',
                    activeBg: 'bg-neo-pink text-white',
                    iconColor: 'text-[#fb7185]'
                  },
                  {
                    id: 'ship',
                    icon: <Rocket className="w-4 h-4 sm:w-5 sm:h-5" />,
                    label: 'Ship Ready',
                    hoverClasses: 'hover:bg-neo-cyan hover:border-black hover:text-black hover:shadow-[3px_3px_0px_#ffffff]',
                    activeBg: 'bg-neo-cyan text-black',
                    iconColor: 'text-[#38bdf8]'
                  },
                  {
                    id: 'fuel',
                    icon: <Coffee className="w-4 h-4 sm:w-5 sm:h-5" />,
                    label: 'Dev Fuel',
                    hoverClasses: 'hover:bg-neo-yellow hover:border-black hover:text-black hover:shadow-[3px_3px_0px_#ffffff]',
                    activeBg: 'bg-neo-yellow text-black',
                    iconColor: 'text-[#fde047]'
                  },
                  {
                    id: 'aesthetic',
                    icon: <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />,
                    label: 'Aesthetic',
                    hoverClasses: 'hover:bg-neo-purple hover:border-black hover:text-black hover:shadow-[3px_3px_0px_#ffffff]',
                    activeBg: 'bg-neo-purple text-black',
                    iconColor: 'text-[#c084fc]'
                  }
                ].map((react) => (
                  <button
                    key={react.id}
                    type="button"
                    onClick={() => handleReactionClick(react.id, react.label)}
                    className={`relative p-2.5 sm:p-3 bg-[#1e222d] border-2 flex flex-col items-center justify-between gap-1.5 sm:gap-2 transition-all duration-200 cursor-pointer select-none group text-center ${
                      reactions[react.id].userReacted
                        ? `${react.activeBg} border-white shadow-[3px_3px_0px_#ffffff] -translate-y-0.5`
                        : `border-neutral-700/80 text-white ${react.hoverClasses} hover:-translate-y-0.5`
                    } active:translate-x-0.5 active:translate-y-0.5`}
                  >
                    {reactions[react.id].userReacted && (
                      <span className="absolute -top-2 -right-1 bg-[#121316] text-white text-[9px] font-black px-1 py-0.5 border border-white">
                        +1
                      </span>
                    )}

                    <div className={`w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center border transition-all duration-200 ${
                      reactions[react.id].userReacted
                        ? 'bg-[#121316] border-[#121316] text-white'
                        : `bg-[#121316]/70 border-neutral-700/80 ${react.iconColor} group-hover:bg-[#121316] group-hover:border-[#121316]`
                    }`}>
                      {react.icon}
                    </div>

                    <span className={`text-[11px] sm:text-xs font-black tracking-tight ${
                      reactions[react.id].userReacted ? 'text-inherit' : 'text-neutral-200 group-hover:text-black'
                    }`}>
                      {react.label}
                    </span>

                    <span className={`text-[9px] sm:text-[10px] font-mono font-bold px-1.5 py-0.5 border ${
                      reactions[react.id].userReacted
                        ? 'bg-black/20 border-black/30 text-inherit'
                        : 'bg-[#121316]/60 border-neutral-700/70 text-neutral-300 group-hover:bg-black/15 group-hover:border-black/30 group-hover:text-black'
                    }`}>
                      {reactions[react.id].count}
                    </span>
                  </button>
                ))}
              </div>

              {reactionFeedback && (
                <div className="mt-3 p-2 bg-[#121316] border border-neo-lime/50 text-neo-lime text-xs font-bold flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-neo-lime flex-shrink-0" />
                    <span>{reactionFeedback}</span>
                  </div>
                  <span className="text-[10px] font-mono text-neutral-400 bg-neutral-800 px-1.5 py-0.5">Saved on this device</span>
                </div>
              )}
            </div>

            {/* 2. Mini Retro Terminal */}
            <div className="lg:col-span-6 bg-[#0d0e12] border-2 border-neutral-700 p-4 sm:p-6 neo-box-sm text-neutral-200 font-mono flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2.5 sm:pb-3 mb-2.5 sm:mb-3 border-b border-neutral-800">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                    <span className="text-[11px] sm:text-xs font-bold text-neutral-400 ml-1 sm:ml-2">bash ~ raiyan-shell</span>
                  </div>
                  <span className="text-[10px] sm:text-[11px] text-neo-lime font-bold">online_v2.4</span>
                </div>

                <div className="text-[11px] sm:text-xs space-y-1 mb-3 sm:mb-4 text-neutral-300 overflow-x-auto">
                  <p><span className="text-neo-pink">raiyan@imon:~$</span> ping -c 1 raiyan.dev</p>
                  <p className="text-emerald-400">64 bytes from raiyan.dev: time=0.42ms [100% OK]</p>
                  <p><span className="text-neo-pink">raiyan@imon:~$</span> echo $CURRENT_STATUS</p>
                  <p className="text-neo-yellow">"Ready to engineer WordPress & Headless apps"</p>
                </div>
              </div>

              {/* Quick Terminal Action Chips */}
              <div>
                <div className="text-[10px] sm:text-[11px] font-bold text-neutral-500 mb-1.5 sm:mb-2">QUICK ACTIONS:</div>
                <div className="flex flex-wrap gap-2 text-xs">
                  <button 
                    onClick={handleCopyEmail}
                    className="bg-[#1f2430] hover:bg-neo-yellow hover:text-black text-neutral-200 px-2.5 sm:px-3 py-1 sm:py-1.5 border border-neutral-700 font-bold transition-colors inline-flex items-center gap-1.5 cursor-pointer text-[11px] sm:text-xs"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>copy-email</span>
                  </button>
                  <a 
                    href="https://github.com/mrra1yan" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-[#1f2430] hover:bg-neo-cyan hover:text-black text-neutral-200 px-2.5 sm:px-3 py-1 sm:py-1.5 border border-neutral-700 font-bold transition-colors inline-flex items-center gap-1.5 text-[11px] sm:text-xs"
                  >
                    <GithubIcon className="w-3.5 h-3.5" />
                    <span>view-github</span>
                  </a>
                  <button 
                    onClick={() => scrollToSection('contact')}
                    className="bg-[#1f2430] hover:bg-neo-lime hover:text-black text-neutral-200 px-2.5 sm:px-3 py-1 sm:py-1.5 border border-neutral-700 font-bold transition-colors inline-flex items-center gap-1.5 cursor-pointer text-[11px] sm:text-xs"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>hire-now</span>
                  </button>
                </div>
              </div>

            </div>

          </div>

          {/* C. GIANT 3D SIGNATURE LOGO */}
          <div className="text-center my-8 sm:my-12 relative select-none">
            <div className="inline-block relative max-w-full">
              <p className="text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter uppercase text-white hover:text-neo-yellow transition-colors duration-300 drop-shadow-[3px_3px_0px_#fb7185] sm:drop-shadow-[4px_4px_0px_#fb7185] break-words">
                RAIYAN IMON
              </p>
              {/* Floating Retro Stamp */}
              <div className="hidden sm:flex absolute -top-4 -right-6 md:-top-6 md:-right-10 bg-neo-cyan text-black px-2.5 sm:px-3 py-1 sm:py-1.5 font-black text-[10px] sm:text-xs uppercase neo-badge transform rotate-12 items-center gap-1 shadow-[2px_2px_0px_#000]">
                <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-black" />
                <span>2026 EDITION</span>
              </div>
            </div>
            <p className="text-[10px] sm:text-xs md:text-sm text-neutral-400 font-bold uppercase tracking-widest mt-2 px-2">
              Full-Stack WordPress Developer • Headless React Architect • Speed Specialist
            </p>
          </div>

          {/* D. BOTTOM MATRIX & BACK TO TOP */}
          <div className="pt-6 sm:pt-8 border-t border-neutral-800 flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6 text-xs font-bold text-neutral-400 text-center md:text-left">
            
            {/* Copyright */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-1.5 sm:gap-2">
              <span>© {new Date().getFullYear()} Raiyan Imon.</span>
              <span className="hidden sm:inline">•</span>
              <span className="text-neutral-300">Crafted with React 19, Tailwind v4 & Neo-Brutalism.</span>
              <span className="hidden lg:inline text-neutral-600 font-mono text-[10px]" title="A cheat code from the arcade era">
                psst… try ↑ ↑ ↓ ↓ ← → ← → B A
              </span>
            </div>

            {/* Quick Links */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-5 text-neutral-300 text-xs">
              <button onClick={() => goToPage('home')} className="hover:text-neo-yellow transition-colors cursor-pointer">Home</button>
              <button onClick={() => scrollToSection('services')} className="hover:text-neo-yellow transition-colors cursor-pointer">Services</button>
              <button onClick={() => scrollToSection('projects')} className="hover:text-neo-cyan transition-colors cursor-pointer">Projects</button>
              <button onClick={() => scrollToSection('skills')} className="hover:text-neo-lime transition-colors cursor-pointer">Stack</button>
              <button onClick={() => scrollToSection('contact')} className="hover:text-neo-pink transition-colors cursor-pointer">Contact</button>
            </div>

            {/* Back to Top Button */}
            <button 
              onClick={() => {
                if (currentPage !== 'home') {
                  goToPage('home');
                } else {
                  scrollToSection('hero');
                }
              }} 
              className="bg-white text-black px-3.5 sm:px-4 py-2 font-black neo-btn hover:bg-neo-yellow flex items-center gap-2 group text-xs cursor-pointer shadow-[3px_3px_0px_#fff]"
            >
              <span>Rocket to Top</span>
              <Rocket className="w-3.5 h-3.5 group-hover:-translate-y-1 transition-transform text-neo-pink" />
            </button>

          </div>

        </div>
      </footer>

      {/* 14. MOBILE APP BOTTOM NAVIGATION DOCK */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t-[2.5px] border-[#121316] pb-safe shadow-[0_-4px_16px_rgba(0,0,0,0.12)] text-[#121316]">
        <div className="grid grid-cols-3 h-16 items-center px-1">
          {mobileNavItems.map((item) => {
            const isActive = item.id === 'home' 
              ? currentPage === 'home' && activeSection !== 'contact' && activeSection !== 'projects'
              : currentPage === 'home' && activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={item.action}
                className={`flex flex-col items-center justify-center h-full py-1 transition-all duration-150 cursor-pointer select-none active:scale-90 ${
                  isActive ? 'text-[#121316]' : 'text-neutral-600 hover:text-[#121316]'
                }`}
              >
                <div className={`p-1 rounded-none transition-all flex items-center justify-center ${
                  isActive ? 'bg-neo-yellow text-black border-2 border-[#121316] shadow-[2px_2px_0px_#121316] -translate-y-1' : ''
                }`}>
                  {item.icon}
                </div>
                <span className={`text-[10px] font-black tracking-tight mt-0.5 ${
                  isActive ? 'text-[#121316] font-black' : 'font-semibold'
                }`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 15. DESKTOP FLOATING CREATIVE ACTION BAR (BOTTOM-RIGHT) */}
      <aside aria-label="Quick Actions" className="hidden md:flex fixed bottom-6 right-6 z-40 flex-col items-end gap-2.5">
        {/* Quick Sticker Toggle */}
        <button
          type="button"
          onClick={() => {
            setIsStickersOpen(!isStickersOpen);
            playPopSound(700);
          }}
          className="bg-neo-pink text-white font-black text-xs px-3.5 py-2 neo-badge border-2 border-[#121316] shadow-[3px_3px_0px_#121316] hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
          title="Open Draggable Stickers"
        >
          <Sticker className="w-4 h-4 text-white" />
          <span>Stickers</span>
        </button>

        {/* Quick Game Trigger */}
        <button
          type="button"
          onClick={() => {
            setIsGameOpen(true);
            playPopSound(600);
          }}
          className="bg-neo-yellow text-black font-black text-xs px-3.5 py-2 neo-badge border-2 border-[#121316] shadow-[3px_3px_0px_#121316] hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
          title="Play 25s Bug Hunter Mini Game"
        >
          <Gamepad2 className="w-4 h-4 text-black" />
          <span>Speed Game</span>
        </button>

        {/* Quick Terminal Trigger */}
        <button
          type="button"
          onClick={() => {
            setIsTerminalOpen(true);
            playClickSound(800);
          }}
          className="bg-[#121316] text-neo-lime font-mono font-black text-xs px-4 py-2.5 neo-badge border-2 border-[#121316] shadow-[4px_4px_0px_#121316] hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer group"
          title="Open Retro Dev Terminal (Ctrl + K)"
        >
          <Terminal className="w-4 h-4 text-neo-lime group-hover:rotate-12 transition-transform" />
          <span>CLI Shell (Ctrl+K)</span>
        </button>
      </aside>

      {/* Konami Live Progress Pips (feedback while entering the code) */}
      {konamiProgress > 0 && !konamiToast && (
        <div
          className="fixed bottom-24 md:bottom-6 left-4 z-[95] bg-white text-[#121316] neo-box-sm px-3 py-2 animate-fadeIn pointer-events-none flex items-center gap-2"
          aria-hidden="true"
        >
          <Gamepad2 className="w-3.5 h-3.5 text-neo-pink flex-shrink-0" />
          <div className="flex gap-1">
            {Array.from({ length: 10 }).map((_, i) => (
              <span
                key={i}
                className={`w-2 h-2 border-[1.5px] border-[#121316] ${i < konamiProgress ? 'bg-neo-lime' : 'bg-neutral-200'}`}
              />
            ))}
          </div>
          <span className="text-[10px] font-black">{konamiProgress}/10</span>
        </div>
      )}

      {/* Konami Code Toast */}
      {konamiToast && (
        <div className="fixed bottom-24 md:bottom-6 left-4 right-4 sm:right-auto sm:max-w-xs z-[95] bg-neo-yellow text-black neo-box px-4 py-3 animate-slideUp pointer-events-none">
          <div className="flex items-center gap-2 font-black text-sm">
            <Sparkles className="w-4 h-4 flex-shrink-0" />
            <span>KONAMI CODE ACCEPTED!</span>
          </div>
          <p className="text-xs font-bold mt-1 leading-snug">
            Cheat code unlocked: sticker mode engaged. Enter ↑ ↑ ↓ ↓ ← → ← → B A anytime for more confetti.
          </p>
        </div>
      )}

      {/* 16. MODAL SYSTEM & CANVASES */}
      <RetroTerminalModal 
        isOpen={isTerminalOpen} 
        onClose={() => setIsTerminalOpen(false)} 
        onNavigate={goToPage}
        onNavigateToSection={scrollToSection}
        onPreFillContact={handlePreFillContact}
        onOpenGame={() => setIsGameOpen(true)}
      />

      <SpeedGameModal 
        isOpen={isGameOpen} 
        onClose={() => setIsGameOpen(false)} 
        onApplyDiscountCode={handleApplyDiscountCode}
      />

      <StickerCanvas 
        isOpen={isStickersOpen} 
        onClose={() => setIsStickersOpen(false)} 
      />

    </div>
  );
}
