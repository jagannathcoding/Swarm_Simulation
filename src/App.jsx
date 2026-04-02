import { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { animated, useSpring } from '@react-spring/web';
import gsap from 'gsap';

const SCENES = {
  nebula: {
    label: 'Nebula Core',
    accent: '#7df9ff',
    description: 'Layered atmospheric particles with a cinematic bloom-heavy drift.',
  },
  vortex: {
    label: 'Photon Vortex',
    accent: '#ff8fd8',
    description: 'A fast spiraling field with compressed energy around a glowing center.',
  },
  helix: {
    label: 'Quantum Helix',
    accent: '#ffd36e',
    description: 'Twin helical ribbons that feel precise, premium, and engineered.',
  },
  pyramid: {
    label: 'Prism Pyramid',
    accent: '#8effa1',
    description: 'A luminous stepped pyramid suspended inside a drifting particle chamber.',
  },
  lattice: {
    label: 'Crystal Lattice',
    accent: '#9a9cff',
    description: 'Structured nodes and gridded energy lines for an architectural 3D mood.',
  },
  orbitals: {
    label: 'Orbital Crown',
    accent: '#ffb86b',
    description: 'Nested orbital rings and dense metallic forms with elegant radial motion.',
  },
};

const PANEL_EASE = [0.22, 1, 0.36, 1];
const Scene = lazy(() => import('./SceneExperience.jsx'));

function StatCard({ label, value, delay }) {
  const spring = useSpring({
    from: { opacity: 0, transform: 'translate3d(0, 20px, 0) scale(0.96)' },
    to: { opacity: 1, transform: 'translate3d(0, 0, 0) scale(1)' },
    delay,
    config: { tension: 180, friction: 18 },
  });

  return (
    <animated.div className="stat-card" style={spring}>
      <span>{label}</span>
      <strong>{value}</strong>
    </animated.div>
  );
}

export default function App() {
  const [mode, setMode] = useState('nebula');
  const [intensity, setIntensity] = useState(72);
  const heroRef = useRef(null);
  const subtitleRef = useRef(null);
  const panelRef = useRef(null);

  useEffect(() => {
    const timeline = gsap.timeline({ defaults: { ease: 'power4.out' } });
    timeline.fromTo(heroRef.current, { y: 44, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1 });
    timeline.fromTo(subtitleRef.current, { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9 }, '-=0.7');
    timeline.fromTo(
      panelRef.current,
      { y: 28, opacity: 0, filter: 'blur(16px)' },
      { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.95 },
      '-=0.55',
    );

    return () => timeline.kill();
  }, []);

  const pointerGlow = useSpring({
    boxShadow: `0 0 ${24 + intensity * 0.5}px ${SCENES[mode].accent}55`,
    background: `linear-gradient(135deg, ${SCENES[mode].accent}28, rgba(255,255,255,0.08))`,
    config: { tension: 140, friction: 16 },
  });

  return (
    <main className={`app-shell theme-${mode}`}>
      <div className="ambient-grid" />
      <div className="noise-overlay" />

      <section className="scene-wrap">
        <Suspense fallback={<div className="scene-fallback" />}>
          <Scene mode={mode} intensity={intensity / 100} accent={SCENES[mode].accent} />
        </Suspense>
      </section>

      <motion.section
        className="content-shell"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.9 }}
      >
        <motion.div
          className="hero-copy"
          initial={{ x: -32, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: PANEL_EASE }}
        >
          <p className="eyebrow">High-End React Particle Direction</p>
          <h1 ref={heroRef}>
            React + Three.js
            <br />
            motion with luxury polish
          </h1>
          <p ref={subtitleRef} className="hero-text">
            Built with `React Three Fiber`, `Framer Motion`, `react-spring`, and `GSAP` for a more cinematic,
            premium interaction layer.
          </p>

          <div className="hero-actions">
            {Object.entries(SCENES).map(([key, item], index) => (
              <motion.button
                key={key}
                type="button"
                className={key === mode ? 'chip is-active' : 'chip'}
                onClick={() => setMode(key)}
                whileHover={{ y: -3, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.25, delay: index * 0.04 }}
              >
                {item.label}
              </motion.button>
            ))}
          </div>
        </motion.div>

        <motion.aside
          ref={panelRef}
          className="control-panel"
          initial={{ x: 36, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.85, ease: PANEL_EASE, delay: 0.1 }}
        >
          <animated.div className="panel-accent" style={pointerGlow} />
          <div className="panel-head">
            <p className="eyebrow">Scene Tuning</p>
            <h2>{SCENES[mode].label}</h2>
            <p>{SCENES[mode].description}</p>
          </div>

          <label className="slider-wrap">
            <span>
              Intensity
              <strong>{intensity}%</strong>
            </span>
            <input
              type="range"
              min="35"
              max="100"
              value={intensity}
              onChange={(event) => setIntensity(Number(event.target.value))}
            />
          </label>

          <div className="stat-grid">
            <StatCard label="Renderer" value="R3F + Three" delay={100} />
            <StatCard label="Motion" value="Framer + GSAP" delay={180} />
            <StatCard label="Particles" value="4.2K reactive points" delay={260} />
            <StatCard label="Feel" value="Spring-driven 3D" delay={340} />
          </div>
        </motion.aside>
      </motion.section>
    </main>
  );
}
