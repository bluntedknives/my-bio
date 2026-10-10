"use client";

export type SectionId =
  | "about"
  | "projects"
  | "socials"
  | "wallets"
  | "terminal";

type Section = {
  id: SectionId;
  label: string;
  icon: React.ReactNode;
};

const S = { width: 16, height: 16, viewBox: "0 0 24 24" } as const;

const SECTIONS: Section[] = [
  {
    id: "about",
    label: "About",
    icon: (
      <svg {...S} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="3.4" />
        <path d="M5 20c0-3.6 3.1-6 7-6s7 2.4 7 6" />
      </svg>
    ),
  },
  {
    id: "projects",
    label: "Projects",
    icon: (
      <svg {...S} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="4" width="6.5" height="6.5" rx="1.4" />
        <rect x="13.5" y="4" width="6.5" height="6.5" rx="1.4" />
        <rect x="4" y="13.5" width="6.5" height="6.5" rx="1.4" />
        <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.4" />
      </svg>
    ),
  },
  {
    id: "socials",
    label: "Socials",
    icon: (
      <svg {...S} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.6 13.4a4 4 0 0 0 5.7 0l2.6-2.6a4 4 0 1 0-5.7-5.7l-1.1 1.1" />
        <path d="M13.4 10.6a4 4 0 0 0-5.7 0l-2.6 2.6a4 4 0 1 0 5.7 5.7l1.1-1.1" />
      </svg>
    ),
  },
  {
    id: "wallets",
    label: "Wallets",
    icon: (
      <svg {...S} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="6" width="18" height="13" rx="2.4" />
        <path d="M3 9.5h18" />
        <circle cx="16.5" cy="13.5" r="1.1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    id: "terminal",
    label: "Terminal",
    icon: (
      <svg {...S} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4.5" width="18" height="15" rx="2.4" />
        <path d="M7.5 9.5l3 2.5-3 2.5M13 14.5h4" />
      </svg>
    ),
  },
];

type Props = {
  active: SectionId;
  onChange: (id: SectionId) => void;
  visible: boolean;
};

export default function SectionRail({ active, onChange, visible }: Props) {
  const index = SECTIONS.findIndex((s) => s.id === active);

  return (
    <nav
      aria-label="Sections"
      className={`bio-nav ${visible ? "is-in" : ""}`}
    >
      <ul className="bio-nav-list">
        <span
          aria-hidden="true"
          className="bio-nav-indicator"
          style={{ ["--i" as string]: index }}
        />
        {SECTIONS.map((s) => (
          <li key={s.id}>
            <button
              type="button"
              onClick={() => onChange(s.id)}
              aria-label={s.label}
              aria-current={active === s.id ? "true" : undefined}
              className={`bio-nav-btn ${active === s.id ? "is-active" : ""}`}
            >
              {s.icon}
              <span className="bio-nav-tip">{s.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
