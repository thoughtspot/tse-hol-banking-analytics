import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function Icon({ children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export function LogoMark(props: IconProps) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" {...props}>
      <rect width="32" height="32" rx="8" fill="#1a73e8" />
      <path d="M16 6 6 11v2h20v-2L16 6Z" fill="#fff" />
      <rect x="8" y="15" width="3" height="8" rx="1" fill="#fff" />
      <rect x="14.5" y="15" width="3" height="8" rx="1" fill="#fff" />
      <rect x="21" y="15" width="3" height="8" rx="1" fill="#fff" />
      <rect x="6" y="24" width="20" height="2.5" rx="1" fill="#fff" />
    </svg>
  );
}

export function CardIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
      <path d="M2.5 9.5h19M6 15h4" />
    </Icon>
  );
}

export function CheckingIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="3" y="4" width="18" height="16" rx="2.5" />
      <path d="M7 9h10M7 13h6M15.5 15.5l1.5 1.5 3-3" />
    </Icon>
  );
}

export function SavingsIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 11a7 6 0 0 1 13-2h2l-1 3 2 1v3h-2.5a7 6 0 0 1-2.5 2V20h-3v-1.5h-3V20H6v-2.5A6 6 0 0 1 4 11Z" />
      <path d="M10 7.5h3" />
    </Icon>
  );
}

export function HomeLoanIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M3 11 12 4l9 7" />
      <path d="M5.5 9.5V20h13V9.5" />
      <path d="M10 20v-5h4v5" />
    </Icon>
  );
}

export function BriefcaseIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="3" y="7" width="18" height="13" rx="2.5" />
      <path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7M3 12.5h18" />
    </Icon>
  );
}

export function WealthIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 19h16M5 15l4-4 3 3 7-7" />
      <path d="M15 7h4v4" />
    </Icon>
  );
}

export function ChartIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 20V4M4 20h16" />
      <rect x="7" y="12" width="3" height="5" rx="0.75" />
      <rect x="12" y="8" width="3" height="9" rx="0.75" />
      <rect x="17" y="10" width="3" height="7" rx="0.75" />
    </Icon>
  );
}

export function SparkleIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 3.5 13.8 9a1.5 1.5 0 0 0 1 1l5.7 2-5.7 2a1.5 1.5 0 0 0-1 1L12 20.5 10.2 15a1.5 1.5 0 0 0-1-1L3.5 12l5.7-2a1.5 1.5 0 0 0 1-1L12 3.5Z" />
    </Icon>
  );
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </Icon>
  );
}

export function SendIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 12 20 4l-5 16-3-7-8-1Z" />
    </Icon>
  );
}
