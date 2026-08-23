export default function Logo({ className = "", size = 32 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect x="20" y="20" width="60" height="60" rx="16" fill="var(--electric)" stroke="var(--ink)" strokeWidth="8" />
      <path d="M35 45L50 30L65 45" stroke="white" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M50 30V70" stroke="white" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="50" cy="50" r="4" fill="var(--hotpink)" />
    </svg>
  );
}
