"use client";

import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type HTMLMotionProps,
} from "motion/react";
import { useRef, type ReactNode } from "react";

const EASE_OUT_EXPO: [number, number, number, number] = [0.22, 1, 0.36, 1];

type FadeInProps = HTMLMotionProps<"div"> & {
  children: ReactNode;
  delay?: number;
  duration?: number;
  y?: number;
  x?: number;
  scale?: number;
  once?: boolean;
  amount?: number;
  inView?: boolean;
};

/**
 * Hiện dần kèm trượt nhẹ khi phần tử xuất hiện trên màn hình (hoặc ngay khi mount nếu inView=false).
 * Tự động tôn trọng thiết lập `prefers-reduced-motion` của người dùng.
 */
export function FadeIn({
  children,
  delay = 0,
  duration = 0.55,
  y = 20,
  x = 0,
  scale = 1,
  once = true,
  amount = 0.15,
  inView = true,
  ...rest
}: FadeInProps) {
  const prefersReduced = useReducedMotion();

  if (prefersReduced) {
    return <motion.div {...rest}>{children}</motion.div>;
  }

  const initial = { opacity: 0, y, x, scale };
  const target = { opacity: 1, y: 0, x: 0, scale: 1 };
  const transition = { duration, delay, ease: EASE_OUT_EXPO };

  return (
    <motion.div
      animate={inView ? undefined : target}
      initial={initial}
      transition={transition}
      viewport={inView ? { once, amount } : undefined}
      whileInView={inView ? target : undefined}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

type StaggerContainerProps = HTMLMotionProps<"div"> & {
  children: ReactNode;
  stagger?: number;
  delayChildren?: number;
  once?: boolean;
  amount?: number;
  inView?: boolean;
};

/**
 * Khung chứa điều phối hiệu ứng xuất hiện tuần tự cho các `StaggerItem` bên trong.
 */
export function StaggerContainer({
  children,
  stagger = 0.08,
  delayChildren = 0.04,
  once = true,
  amount = 0.12,
  inView = true,
  ...rest
}: StaggerContainerProps) {
  const prefersReduced = useReducedMotion();

  if (prefersReduced) {
    return <motion.div {...rest}>{children}</motion.div>;
  }

  return (
    <motion.div
      animate={inView ? undefined : "visible"}
      initial="hidden"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: stagger,
            delayChildren,
          },
        },
      }}
      viewport={inView ? { once, amount } : undefined}
      whileInView={inView ? "visible" : undefined}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

type StaggerItemProps = HTMLMotionProps<"div"> & {
  children: ReactNode;
  y?: number;
  x?: number;
  duration?: number;
};

/**
 * Phần tử con nằm trong `StaggerContainer`.
 */
export function StaggerItem({
  children,
  y = 18,
  x = 0,
  duration = 0.5,
  ...rest
}: StaggerItemProps) {
  const prefersReduced = useReducedMotion();

  if (prefersReduced) {
    return <motion.div {...rest}>{children}</motion.div>;
  }

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y, x },
        visible: {
          opacity: 1,
          y: 0,
          x: 0,
          transition: { duration, ease: EASE_OUT_EXPO },
        },
      }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

type FloatSlowProps = HTMLMotionProps<"div"> & {
  children: ReactNode;
  distance?: number;
  duration?: number;
  delay?: number;
};

/**
 * Hiệu ứng lơ lửng nhẹ nhàng lặp vô hạn cho ảnh minh họa hoặc huy hiệu.
 */
export function FloatSlow({
  children,
  distance = 8,
  duration = 5,
  delay = 0,
  ...rest
}: FloatSlowProps) {
  const prefersReduced = useReducedMotion();

  if (prefersReduced) {
    return <motion.div {...rest}>{children}</motion.div>;
  }

  return (
    <motion.div
      animate={{ y: [0, -distance, 0] }}
      transition={{
        duration,
        delay,
        repeat: Number.POSITIVE_INFINITY,
        ease: "easeInOut",
      }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

type ParallaxBoxProps = HTMLMotionProps<"div"> & {
  children: ReactNode;
  offset?: number;
};

/**
 * Hiệu ứng trượt parallax nhẹ theo vị trí cuộn của khung nhìn.
 */
export function ParallaxBox({
  children,
  offset = 24,
  ...rest
}: ParallaxBoxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [offset, -offset]);

  return (
    <motion.div
      ref={ref}
      style={prefersReduced ? undefined : { y }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

/**
 * Hiệu ứng mở/đóng chiều cao mượt mà cho accordion hoặc panel.
 */
export function SmoothCollapse({
  open,
  children,
  className,
}: {
  open: boolean;
  children: ReactNode;
  className?: string;
}) {
  const prefersReduced = useReducedMotion();

  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          animate={{ height: "auto", opacity: 1 }}
          className={`overflow-hidden ${className ?? ""}`}
          exit={{ height: 0, opacity: 0 }}
          initial={{ height: 0, opacity: 0 }}
          transition={
            prefersReduced
              ? { duration: 0 }
              : { duration: 0.28, ease: EASE_OUT_EXPO }
          }
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
