import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function Svg({ children, strokeWidth = 2, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

export const IconHeartPlus = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 20.5s-7.5-4.7-7.5-10A4.3 4.3 0 0 1 12 7.4a4.3 4.3 0 0 1 7.5 3.1c0 5.3-7.5 10-7.5 10Z" />
    <path d="M12 11.4v3.4M10.3 13.1h3.4" />
  </Svg>
);

export const IconPlus = (p: IconProps) => (
  <Svg strokeWidth={2.2} {...p}>
    <path d="M12 5v14M5 12h14" />
  </Svg>
);

export const IconArrowRight = (p: IconProps) => (
  <Svg strokeWidth={2.2} {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Svg>
);

export const IconArrowLeft = (p: IconProps) => (
  <Svg strokeWidth={2.2} {...p}>
    <path d="M19 12H5M11 6l-6 6 6 6" />
  </Svg>
);

export const IconBell = (p: IconProps) => (
  <Svg strokeWidth={1.8} {...p}>
    <path d="M18 8.5a6 6 0 1 0-12 0c0 5-2 6.5-2 6.5h16s-2-1.5-2-6.5Z" />
    <path d="M13.7 19a2 2 0 0 1-3.4 0" />
  </Svg>
);

export const IconChevronDown = (p: IconProps) => (
  <Svg strokeWidth={2.2} {...p}>
    <path d="m6 9 6 6 6-6" />
  </Svg>
);

export const IconMenu = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </Svg>
);

export const IconClose = (p: IconProps) => (
  <Svg {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Svg>
);

export const IconSend = (p: IconProps) => (
  <Svg {...p}>
    <path d="M21 3 10 14" />
    <path d="m21 3-7 18-4-7-7-4 18-7Z" />
  </Svg>
);

export const IconCalendar = (p: IconProps) => (
  <Svg strokeWidth={1.8} {...p}>
    <rect x="3" y="5" width="18" height="16" rx="3" />
    <path d="M3 10h18M8 3v4M16 3v4" />
  </Svg>
);

export const IconMessage = (p: IconProps) => (
  <Svg strokeWidth={1.8} {...p}>
    <path d="M21 12a8 8 0 0 1-11.7 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z" />
  </Svg>
);

export const IconCheck = (p: IconProps) => (
  <Svg strokeWidth={2.4} {...p}>
    <path d="m5 12 5 5 9-10" />
  </Svg>
);
