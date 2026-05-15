'use client';

import { motion, useMotionValue } from 'framer-motion';
import { useEffect, useRef } from 'react';

interface HolaMundoProps {
  title: string;
  subtitle: string;
  description: string;
}

function Particles() {
  const count = 60;
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: count }, (_, i) => {
        const size = Math.random() * 2 + 0.5;
        const x = Math.random() * 100;
        const delay = Math.random() * 8;
        const duration = Math.random() * 10 + 8;
        const opacity = Math.random() * 0.35 + 0.08;
        return (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white"
            style={{ width: size, height: size, left: `${x}%`, bottom: '-4px', opacity }}
            animate={{ y: [0, -(Math.random() * 600 + 400)], opacity: [opacity, 0], x: [0, (Math.random() - 0.5) * 80] }}
            transition={{ duration, delay, repeat: Infinity, ease: 'easeOut' }}
          />
        );
      })}
    </div>
  );
}

function RevealText({ text, startDelay = 0 }: { text: string; startDelay?: number }) {
  return (
    <span style={{ display: 'inline-block' }}>
      {text.split('').map((letter, i) => (
        <motion.span
          key={i}
          initial={{ color: 'rgba(255,255,255,0.06)', textShadow: 'none' }}
          animate={{
            color: ['rgba(255,255,255,0.06)', 'rgba(255,255,255,1)', 'rgba(255,255,255,0.82)'],
            textShadow: [
              'none',
              '0 0 80px rgba(255,255,255,1), 0 0 40px rgba(255,255,255,0.8)',
              '0 0 20px rgba(255,255,255,0.12)',
            ],
          }}
          transition={{ delay: startDelay + i * 0.06, duration: 0.7, times: [0, 0.35, 1], ease: 'easeOut' }}
          style={{ display: 'inline-block' }}
        >
          {letter === ' ' ? '\u00A0' : letter}
        </motion.span>
      ))}
    </span>
  );
}

export default function HolaMundo({ title, subtitle }: HolaMundoProps) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handle = (e: MouseEvent) => { mouseX.set(e.clientX); mouseY.set(e.clientY); };
    window.addEventListener('mousemove', handle);
    return () => window.removeEventListener('mousemove', handle);
  }, [mouseX, mouseY]);

  const titleDelay = title.length * 0.06;
  const subtitleDelay = titleDelay + 0.8;

  return (
    <div ref={containerRef} className="relative min-h-screen w-full flex items-center justify-center bg-[#060608] overflow-hidden">

      <Particles />

      {/* Glow central */}
      <div className="absolute pointer-events-none" style={{ width: '700px', height: '350px', top: '50%', left: '50%', transform: 'translate(-50%, -60%)', background: 'radial-gradient(ellipse, rgba(255,255,255,0.025) 0%, transparent 70%)', filter: 'blur(40px)' }} />

      {/* Spotlight mouse */}
      <motion.div
        className="pointer-events-none fixed inset-0 z-10"
        style={{
          background: `radial-gradient(380px circle at ${mouseX}px ${mouseY}px, rgba(255,255,255,0.035), transparent 70%)`,
        } as React.CSSProperties}
      />

      <div className="relative z-20 flex flex-col items-center text-center px-6 select-none">

        {/* Línea superior */}
        <motion.div initial={{ scaleY: 0, opacity: 0 }} animate={{ scaleY: 1, opacity: 1 }} transition={{ delay: 0.1, duration: 1 }}
          style={{ width: '1px', height: '60px', background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.18))', marginBottom: '2rem' }} />

        {/* Título */}
        <h1 style={{ fontSize: 'clamp(4rem, 13vw, 10rem)', fontFamily: 'var(--font-display)', fontWeight: 300, letterSpacing: '0.06em', lineHeight: 1, marginBottom: '2rem' }}>
          <RevealText text={title} startDelay={0.3} />
        </h1>

        {/* Separador */}
        <motion.div initial={{ scaleX: 0, opacity: 0 }} animate={{ scaleX: 1, opacity: 1 }} transition={{ delay: subtitleDelay - 0.3, duration: 0.8 }}
          style={{ width: '80px', height: '1px', background: 'rgba(255,255,255,0.12)', marginBottom: '2rem' }} />

        {/* Subtítulo */}
        <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: subtitleDelay, duration: 0.8 }}
          style={{ fontSize: '0.65rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.22)', fontFamily: 'var(--font-sans)', fontWeight: 300, marginBottom: '3rem' }}>
          {subtitle}
        </motion.p>

        {/* Tarjeta nombre/rol */}
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: subtitleDelay + 0.4, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          style={{ border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '1.5rem 2.5rem', background: 'rgba(255,255,255,0.018)', backdropFilter: 'blur(12px)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem', minWidth: '260px' }}
        >
          <span style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,0.82)', fontFamily: 'var(--font-display)', fontWeight: 400, letterSpacing: '0.06em' }}>
            Laura
          </span>
          <span style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.22)', fontFamily: 'var(--font-sans)', fontWeight: 300, letterSpacing: '0.22em', textTransform: 'uppercase' }}>
            Desarrolladora Fullstack
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '0.6rem' }}>
            <motion.div animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 2, repeat: Infinity }}
              style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 8px rgba(74,222,128,0.9)' }} />
            <span style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.18)', letterSpacing: '0.18em', textTransform: 'uppercase' }}>
              sistema activo
            </span>
          </div>
        </motion.div>

        {/* Línea inferior */}
        <motion.div initial={{ scaleY: 0, opacity: 0 }} animate={{ scaleY: 1, opacity: 1 }} transition={{ delay: subtitleDelay + 0.9, duration: 1 }}
          style={{ width: '1px', height: '60px', background: 'linear-gradient(to bottom, rgba(255,255,255,0.18), transparent)', marginTop: '2rem' }} />
      </div>
    </div>
  );
}
