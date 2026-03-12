export const ease = [0.16, 1, 0.3, 1] as const;

export const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
};

export const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

export const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.3 } },
};
