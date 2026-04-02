import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { a, useSpring } from '@react-spring/three';
import * as THREE from 'three';

function ParticleField({ mode, intensity, accent }) {
  const pointsRef = useRef(null);
  const haloRef = useRef(null);
  const ribbonRef = useRef(null);
  const particleCount = 4200;

  const particles = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const base = new Float32Array(particleCount * 3);
    const offsets = new Float32Array(particleCount);
    const scales = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i += 1) {
      const i3 = i * 3;
      const radius = 1.2 + Math.random() * 6.8;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      const x = Math.sin(phi) * Math.cos(theta) * radius;
      const y = Math.sin(phi) * Math.sin(theta) * radius;
      const z = Math.cos(phi) * radius;

      positions[i3] = x;
      positions[i3 + 1] = y;
      positions[i3 + 2] = z;
      base[i3] = x;
      base[i3 + 1] = y;
      base[i3 + 2] = z;
      offsets[i] = Math.random() * Math.PI * 2;
      scales[i] = 0.7 + Math.random() * 1.4;
    }

    return { positions, base, offsets, scales };
  }, []);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    const positions = pointsRef.current.geometry.attributes.position.array;
    const pulse = 1 + intensity * 0.12;

    for (let i = 0; i < particleCount; i += 1) {
      const i3 = i * 3;
      const bx = particles.base[i3];
      const by = particles.base[i3 + 1];
      const bz = particles.base[i3 + 2];
      const offset = particles.offsets[i];
      const scale = particles.scales[i];

      if (mode === 'vortex') {
        const angle = time * 0.8 + offset + Math.atan2(by, bx);
        const radial = Math.hypot(bx, by) * (1 + intensity * 0.15);
        positions[i3] = Math.cos(angle) * radial;
        positions[i3 + 1] = Math.sin(angle) * radial;
        positions[i3 + 2] = bz + Math.sin(time * 1.8 + offset) * 1.8 * scale;
      } else if (mode === 'helix') {
        const strand = i % 2 === 0 ? 1 : -1;
        const angle = time * 1.4 + offset + strand * 0.9;
        const radius = 2 + Math.sin(offset * 2.4) * 0.5 + intensity * 0.45;
        positions[i3] = Math.cos(angle) * radius * scale;
        positions[i3 + 1] = Math.sin(angle) * radius * scale;
        positions[i3 + 2] = ((i / particleCount) * 18 - 9) + Math.sin(time + offset) * 0.5;
      } else if (mode === 'pyramid') {
        const tier = 1 + (i % 10) * 0.18;
        const face = i % 4;
        const local = (i / particleCount) * 2 - 1;
        const drift = Math.sin(time + offset) * 0.22 * scale;
        positions[i3] = (face < 2 ? local : local * 0.4) * tier + drift;
        positions[i3 + 1] = -3.4 + tier * 0.9 + Math.sin(time * 1.2 + offset) * 0.18;
        positions[i3 + 2] = (face >= 2 ? local : local * 0.4) * tier + Math.cos(time + offset) * 0.18;
      } else if (mode === 'lattice') {
        const grid = i % 14;
        const layer = Math.floor(i / 14) % 14;
        const depth = Math.floor(i / 196) % 14;
        positions[i3] = (grid - 6.5) * 0.68 + Math.sin(time + offset) * 0.08;
        positions[i3 + 1] = (layer - 6.5) * 0.48 + Math.cos(time * 1.2 + offset) * 0.08;
        positions[i3 + 2] = (depth - 6.5) * 0.68 + Math.sin(time * 0.8 + offset) * 0.08;
      } else if (mode === 'orbitals') {
        const band = 1 + (i % 7) * 0.42;
        const angle = time * (0.32 + band * 0.08) + offset;
        positions[i3] = Math.cos(angle) * band * (1.4 + intensity * 0.4);
        positions[i3 + 1] = Math.sin(angle * 1.35) * 0.9 * scale;
        positions[i3 + 2] = Math.sin(angle) * band * (1.4 + intensity * 0.4);
      } else {
        positions[i3] = bx + Math.sin(time * 0.55 + offset) * 0.45 * scale * pulse;
        positions[i3 + 1] = by + Math.cos(time * 0.6 + offset * 1.3) * 0.45 * scale * pulse;
        positions[i3 + 2] = bz + Math.sin(time * 0.75 + offset) * 0.85 * scale;
      }
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;
    pointsRef.current.rotation.y = time * (mode === 'helix' ? 0.18 : 0.08);
    pointsRef.current.rotation.x = Math.sin(time * 0.2) * 0.08;

    haloRef.current.rotation.z = time * (mode === 'orbitals' ? 0.4 : 0.18);
    haloRef.current.scale.setScalar(1 + Math.sin(time * 1.1) * 0.035);

    ribbonRef.current.rotation.x = Math.sin(time * 0.35) * 0.35;
    ribbonRef.current.rotation.y = time * 0.22;
  });

  return (
    <group>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            array={particles.positions}
            count={particles.positions.length / 3}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          color={accent}
          size={mode === 'helix' ? 0.045 : 0.055}
          sizeAttenuation
          transparent
          opacity={0.95}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      <mesh ref={haloRef}>
        <torusGeometry args={[3.2, 0.08, 32, 220]} />
        <meshBasicMaterial color={accent} transparent opacity={0.52} />
      </mesh>

      <mesh ref={ribbonRef}>
        <torusKnotGeometry args={[4.5, 0.12, 180, 24, 2, 5]} />
        <meshStandardMaterial
          color="#f6fbff"
          emissive={accent}
          emissiveIntensity={0.95}
          roughness={0.18}
          metalness={0.75}
          transparent
          opacity={mode === 'lattice' ? 0.08 : 0.14}
        />
      </mesh>
    </group>
  );
}

function StructuralCore({ mode, intensity, accent }) {
  const groupRef = useRef(null);

  const spring = useSpring({
    scale: mode === 'pyramid' ? 1.22 : mode === 'lattice' ? 1.08 : mode === 'orbitals' ? 1.16 : 1,
    rotationY: mode === 'vortex' ? Math.PI * 0.45 : mode === 'helix' ? Math.PI * 0.22 : 0,
    positionY: mode === 'pyramid' ? -0.35 : 0,
    config: { mass: 1.8, tension: 180, friction: 20 },
  });

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    if (!groupRef.current) {
      return;
    }
    groupRef.current.rotation.x = Math.sin(time * 0.55) * 0.12;
    groupRef.current.rotation.z = Math.cos(time * 0.35) * 0.08;
  });

  return (
    <a.group
      ref={groupRef}
      scale={spring.scale}
      rotation-y={spring.rotationY}
      position-y={spring.positionY}
    >
      {mode === 'pyramid' ? (
        <Float speed={2} rotationIntensity={0.4} floatIntensity={0.5}>
          <group>
            <mesh position={[0, -1.25, 0]}>
              <cylinderGeometry args={[3.1, 3.7, 0.7, 4]} />
              <meshStandardMaterial color="#f3f7fb" emissive={accent} emissiveIntensity={0.55} metalness={0.8} roughness={0.2} />
            </mesh>
            <mesh position={[0, -0.35, 0]}>
              <cylinderGeometry args={[2.2, 2.7, 0.7, 4]} />
              <meshStandardMaterial color="#f7fcff" emissive={accent} emissiveIntensity={0.75} metalness={0.84} roughness={0.16} />
            </mesh>
            <mesh position={[0, 0.55, 0]}>
              <coneGeometry args={[1.65, 2.4, 4]} />
              <meshPhysicalMaterial
                color="#ffffff"
                emissive={accent}
                emissiveIntensity={1.15}
                roughness={0.08}
                metalness={0.3}
                transparent
                opacity={0.92}
                clearcoat={1}
                clearcoatRoughness={0.08}
              />
            </mesh>
          </group>
        </Float>
      ) : mode === 'lattice' ? (
        <group>
          {[-1.8, 0, 1.8].map((x) =>
            [-1.8, 0, 1.8].map((y) => (
              <mesh key={`${x}-${y}`} position={[x, y, 0]}>
                <boxGeometry args={[0.55, 0.55, 0.55]} />
                <meshStandardMaterial color="#f0f4ff" emissive={accent} emissiveIntensity={0.7} metalness={0.88} roughness={0.16} />
              </mesh>
            )),
          )}
          <lineSegments>
            <edgesGeometry args={[new THREE.BoxGeometry(4.9, 4.9, 4.9)]} />
            <lineBasicMaterial color={accent} transparent opacity={0.45} />
          </lineSegments>
        </group>
      ) : mode === 'orbitals' ? (
        <Float speed={2.2} rotationIntensity={0.6} floatIntensity={0.7}>
          <group>
            <mesh>
              <octahedronGeometry args={[1.5, 0]} />
              <meshPhysicalMaterial
                color="#fff7ef"
                emissive={accent}
                emissiveIntensity={1.1}
                roughness={0.08}
                metalness={0.46}
                clearcoat={1}
                clearcoatRoughness={0.08}
              />
            </mesh>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[2.8, 0.08, 24, 180]} />
              <meshBasicMaterial color={accent} transparent opacity={0.78} />
            </mesh>
            <mesh rotation={[0.55, 0.3, 0]}>
              <torusGeometry args={[3.8, 0.05, 24, 180]} />
              <meshBasicMaterial color="#ffffff" transparent opacity={0.35} />
            </mesh>
          </group>
        </Float>
      ) : mode === 'helix' ? (
        <Float speed={2.5} rotationIntensity={0.8} floatIntensity={0.7}>
          <mesh>
            <torusKnotGeometry args={[1.6, 0.32, 240, 18, 2, 3]} />
            <meshPhysicalMaterial
              color="#ffffff"
              emissive={accent}
              emissiveIntensity={1.45}
              roughness={0.05}
              metalness={0.3}
              transparent
              opacity={0.9}
              clearcoat={1}
              clearcoatRoughness={0.08}
            />
          </mesh>
        </Float>
      ) : mode === 'vortex' ? (
        <Float speed={2.3} rotationIntensity={0.8} floatIntensity={0.85}>
          <mesh>
            <dodecahedronGeometry args={[1.6, 0]} />
            <meshPhysicalMaterial
              color="#ffffff"
              emissive={accent}
              emissiveIntensity={1.55}
              roughness={0.06}
              metalness={0.28}
              transparent
              opacity={0.86}
              clearcoat={1}
              clearcoatRoughness={0.08}
            />
          </mesh>
        </Float>
      ) : (
        <Float speed={2.4} rotationIntensity={0.65} floatIntensity={0.8}>
          <mesh>
            <icosahedronGeometry args={[1.5, 8]} />
            <meshPhysicalMaterial
              color="#ffffff"
              emissive={accent}
              emissiveIntensity={1.6}
              roughness={0.06}
              metalness={0.28}
              transparent
              opacity={0.82}
              clearcoat={1}
              clearcoatRoughness={0.08}
            />
          </mesh>
        </Float>
      )}
    </a.group>
  );
}

export default function SceneExperience({ mode, intensity, accent }) {
  return (
    <Canvas
      dpr={[1, 1.8]}
      gl={{ antialias: true, alpha: false, toneMapping: THREE.ACESFilmicToneMapping }}
      onCreated={({ gl, scene }) => {
        gl.setClearColor('#050816');
        gl.toneMappingExposure = 0.82;
        scene.background = new THREE.Color('#050816');
      }}
    >
      <color attach="background" args={['#050816']} />
      <fog attach="fog" args={['#050816', 10, 28]} />
      <PerspectiveCamera makeDefault position={[0, 0, 12]} fov={48} />
      <ambientLight intensity={0.2} />
      <directionalLight position={[6, 6, 4]} intensity={0.7} color="#dce8ff" />
      <pointLight position={[-6, -2, 6]} intensity={1.3} color={accent} />
      <pointLight position={[3, 1, -4]} intensity={0.45} color="#5d7cff" />
      <ParticleField mode={mode} intensity={intensity} accent={accent} />
      <StructuralCore mode={mode} intensity={intensity} accent={accent} />
      <OrbitControls enablePan={false} enableZoom={false} autoRotate autoRotateSpeed={0.35} />
    </Canvas>
  );
}
