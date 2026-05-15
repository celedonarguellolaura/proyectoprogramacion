'use client';

import { motion } from 'framer-motion';

interface AnimatedTextProps {
  text: string;
  delay?: number;
  className?: string;
}

const letterVariants = {
  hidden: { opacity: 0, y: 60, rotateX: -90 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: {
      delay: i * 0.07,
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

export default function AnimatedText({ text, delay = 0, className = '' }: AnimatedTextProps) {
  const letters = text.split('');

  return (
    <span aria-label={text} style={{ perspective: '800px', display: 'inline-block' }}>
      {letters.map((letter, i) => (
        <motion.span
          key={i}
          custom={i + delay / 0.07}
          variants={letterVariants}
          initial="hidden"
          animate="visible"
          className={`inline-block ${className}`}
          style={{ transformOrigin: 'top center' }}
        >
          {letter === ' ' ? '\u00A0' : letter}
        </motion.span>
      ))}
    </span>
  );
}
