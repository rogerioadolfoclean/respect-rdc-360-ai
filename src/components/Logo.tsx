export default function Logo({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden>
      <path
        d="M32 4 L56 12 V32 C56 46 46 56 32 60 C18 56 8 46 8 32 V12 Z"
        fill="#0d2a5c"
        stroke="#f5c518"
        strokeWidth="3"
      />
      <path
        d="M22 34 C22 28 27 25 31 27 C33 22 41 22 42 28 C46 29 46 35 42 36 L26 36 C24 36 22 36 22 34 Z"
        fill="#ffffff"
      />
      <path d="M30 38 L34 38 L32 44 Z" fill="#f5c518" />
      <circle cx="32" cy="16" r="4" fill="#ce1021" />
    </svg>
  );
}
