import type { ReactNode } from "react";

type IconProps = { className?: string };

function StrokeIcon({
  className,
  children,
  strokeWidth = 2,
  viewBox = "0 0 24 24",
}: IconProps & { children: ReactNode; strokeWidth?: number; viewBox?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={strokeWidth}
      viewBox={viewBox}
    >
      {children}
    </svg>
  );
}

function FilledIcon({
  className,
  children,
  viewBox = "0 0 24 24",
}: IconProps & { children: ReactNode; viewBox?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="currentColor"
      viewBox={viewBox}
    >
      {children}
    </svg>
  );
}

export function ArrowRightIcon({ className }: IconProps) {
  return (
    <StrokeIcon className={className}>
      <path d="M14 5l7 7m0 0l-7 7m7-7H3" />
    </StrokeIcon>
  );
}

export function ChevronRightIcon({ className }: IconProps) {
  return (
    <StrokeIcon className={className} strokeWidth={2.5}>
      <path d="M9 5l7 7-7 7" />
    </StrokeIcon>
  );
}

export function ChevronDownIcon({ className }: IconProps) {
  return (
    <StrokeIcon className={className}>
      <path d="M19 9l-7 7-7-7" />
    </StrokeIcon>
  );
}

export function HeartIcon({ className }: IconProps) {
  return (
    <StrokeIcon className={className}>
      <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </StrokeIcon>
  );
}

export function PencilIcon({ className }: IconProps) {
  return (
    <StrokeIcon className={className}>
      <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
    </StrokeIcon>
  );
}

export function CalendarIcon({ className }: IconProps) {
  return (
    <StrokeIcon className={className}>
      <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </StrokeIcon>
  );
}

export function UserIcon({ className }: IconProps) {
  return (
    <StrokeIcon className={className}>
      <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </StrokeIcon>
  );
}

export function MapPinOutlineIcon({ className }: IconProps) {
  return (
    <StrokeIcon className={className}>
      <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </StrokeIcon>
  );
}

export function HomeOutlineIcon({ className }: IconProps) {
  return (
    <StrokeIcon className={className}>
      <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </StrokeIcon>
  );
}

export function BookOutlineIcon({ className }: IconProps) {
  return (
    <StrokeIcon className={className}>
      <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </StrokeIcon>
  );
}

export function SmileOutlineIcon({ className }: IconProps) {
  return (
    <StrokeIcon className={className}>
      <path d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </StrokeIcon>
  );
}

export function WifiIcon({ className }: IconProps) {
  return (
    <StrokeIcon className={className}>
      <path d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
    </StrokeIcon>
  );
}

export function BreakfastIcon({ className }: IconProps) {
  return (
    <StrokeIcon className={className}>
      <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253" />
    </StrokeIcon>
  );
}

export function OceanViewIcon({ className }: IconProps) {
  return (
    <StrokeIcon className={className}>
      <path d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 00-9.78 2.096A4.001 4.001 0 003 15z" />
    </StrokeIcon>
  );
}

export function FamilyIcon({ className }: IconProps) {
  return (
    <StrokeIcon className={className}>
      <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </StrokeIcon>
  );
}

export function HandDrawnArrowIcon({ className }: IconProps) {
  return (
    <StrokeIcon className={className} strokeWidth={1.8}>
      <path d="M7 4C14 4 19 8 18 17M18 17L13 14M18 17L21 13" />
    </StrokeIcon>
  );
}

export function SmallPinIcon({ className }: IconProps) {
  return (
    <FilledIcon className={className} viewBox="0 0 20 20">
      <path
        clipRule="evenodd"
        d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
        fillRule="evenodd"
      />
    </FilledIcon>
  );
}

export function GridFilledIcon({ className }: IconProps) {
  return (
    <FilledIcon className={className}>
      <path d="M4 4h6v6H4V4zm10 0h6v6h-6V4zM4 14h6v6H4v-6zm10 0h6v6h-6v-6z" />
    </FilledIcon>
  );
}

export function MapPinFilledIcon({ className }: IconProps) {
  return (
    <FilledIcon className={className}>
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
    </FilledIcon>
  );
}

export function BedFilledIcon({ className }: IconProps) {
  return (
    <FilledIcon className={className}>
      <path d="M7 13c1.66 0 3-1.34 3-3S8.66 7 7 7s-3 1.34-3 3 1.34 3 3 3zm12-6h-8v7H3V5H1v15h2v-3h18v3h2v-9c0-2.21-1.79-4-4-4z" />
    </FilledIcon>
  );
}

export function UtensilsFilledIcon({ className }: IconProps) {
  return (
    <FilledIcon className={className}>
      <path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z" />
    </FilledIcon>
  );
}

export function CompassFilledIcon({ className }: IconProps) {
  return (
    <FilledIcon className={className}>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1.79 13.79l-1.42-3.58 3.58 1.42 3.58-1.42-3.58 1.42zm1.79-11.79c4.41 0 8 3.59 8 8s-3.59 8-8 8-8-3.59-8-8 3.59-8 8-8zm-1.88 5.71l-1.91 4.79 4.79-1.91 1.91-4.79-4.79 1.91zm1.88 3.79a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" />
    </FilledIcon>
  );
}

export function PoolIcon({ className }: IconProps) {
  return (
    <FilledIcon className={className}>
      <path d="M2 19c2 0 3-1 4-1s2 1 4 1 3-1 4-1 2 1 4 1 3-1 4-1v2c-1 0-2 1-4 1s-3-1-4-1-2 1-4 1-3-1-4-1-2 1-4 1V19zm0-4c2 0 3-1 4-1s2 1 4 1 3-1 4-1 2 1 4 1 3-1 4-1v2c-1 0-2 1-4 1s-3-1-4-1-2 1-4 1-3-1-4-1-2 1-4 1V15z" />
    </FilledIcon>
  );
}

export function PetIcon({ className }: IconProps) {
  return (
    <FilledIcon className={className}>
      <path d="M12 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm-6 8c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm12 0c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zM4 17c0-2.2 1.8-4 4-4 1.3 0 2.5.6 3.2 1.6.2.2.4.4.8.4s.6-.2.8-.4c.7-1 1.9-1.6 3.2-1.6 2.2 0 4 1.8 4 4 0 2.8-3.4 5.6-7.3 6.9-.5.2-.9.2-1.4 0C7.4 22.6 4 19.8 4 17z" />
    </FilledIcon>
  );
}

export function RobotMascotIcon({ className }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      viewBox="0 0 24 24"
    >
      <rect fill="#EEF2FF" height="10" rx="3" width="18" x="3" y="11" />
      <circle cx="9" cy="16" fill="#4F46E5" r="1.5" />
      <circle cx="15" cy="16" fill="#4F46E5" r="1.5" />
      <path d="M12 2v4M8 6h8" strokeLinecap="round" />
      <path d="M2 15h1M21 15h1" strokeLinecap="round" />
    </svg>
  );
}
