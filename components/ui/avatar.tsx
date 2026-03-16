import Image from "next/image";

const sizes = {
  sm: "w-6 h-6 text-[9px]",
  md: "w-8 h-8 text-xs",
  lg: "w-10 h-10 text-sm",
  xl: "w-12 h-12 text-base",
} as const;

export interface AvatarProps {
  src?: string | null;
  alt: string;
  fallback: string;
  size?: keyof typeof sizes;
  className?: string;
}

export function Avatar({ src, alt, fallback, size = "md", className = "" }: AvatarProps) {
  const sizeClass = sizes[size];
  const dimension = { sm: 24, md: 32, lg: 40, xl: 48 }[size];

  if (src) {
    return (
      <Image
        src={src}
        alt={alt}
        width={dimension}
        height={dimension}
        className={`${sizeClass} rounded-full object-cover ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} rounded-full bg-gradient-to-br from-accent to-accent-light flex items-center justify-center ${className}`}
      aria-label={alt}
    >
      <span className="text-white font-bold">{fallback}</span>
    </div>
  );
}
