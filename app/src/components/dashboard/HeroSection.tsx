import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Sparkles } from 'lucide-react';
import * as THREE from 'three';

const VERTEX_SHADER = `
precision mediump float;
uniform float u_time;
uniform float u_height;
uniform float u_width;
uniform vec3 u_color;
uniform float u_layer;
varying vec3 v_color;
const float PI = 3.14159265359;

float band(vec3 position) {
  float angle = 0.1 * (u_layer + 1.0) * position.x + 0.05 * u_time + u_layer * 100.0;
  float yOff = 0.3 * (u_layer + 1.0) * sin(angle);
  float y = 3.0 * (((position.y + yOff) / u_height) - 0.5);
  float width = 0.05 + 0.2 * pow(abs(sin(0.4 * u_layer + 0.1 * u_time)), 2.0);
  float dist = abs(y) / sqrt(1.0 + 0.5 * pow(u_layer, 0.5));
  float mask = pow(exp(-pow(dist, 2.0) / pow(width, 2.0)), 2.0);
  return mask;
}

void main() {
  float aspect = u_width / u_height;
  vec3 center = vec3(0.0, u_height * 0.5, 0.0);
  float dist = distance(position, center);
  float wave = sin(0.005 * dist - 0.05 * u_time - u_layer);
  float strength = 0.3 + 0.7 * pow(abs(wave), 2.0);
  float hBand = band(position);
  float alpha = hBand * strength * (1.0 / (u_layer + 1.0));
  float finalAlpha = pow(alpha, 2.0);
  gl_PointSize = 1.0 + u_layer * 0.5;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  v_color = u_color * finalAlpha;
}
`;

const FRAGMENT_SHADER = `
precision mediump float;
varying vec3 v_color;
void main() {
  gl_FragColor = vec4(v_color, 1.0);
}
`;

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return [h, s, l];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  if (s === 0) return [l, l, l];
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return [hue2rgb(p, q, h + 1 / 3), hue2rgb(p, q, h), hue2rgb(p, q, h - 1 / 3)];
}

function lerpHue(h1: number, h2: number, t: number): number {
  let d = h2 - h1;
  if (d > 0.5) d -= 1.0;
  if (d < -0.5) d += 1.0;
  return (h1 + t * d + 1.0) % 1.0;
}

interface AuroraCanvasProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
}

function AuroraCanvas({ containerRef }: AuroraCanvasProps) {
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!canvasContainerRef.current || !containerRef.current) return;

    const container = canvasContainerRef.current;
    const parent = containerRef.current;
    const width = parent.offsetWidth;
    const height = 400;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 50;

    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
    renderer.setSize(width / 2, height / 4, false);
    renderer.setPixelRatio(1);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.imageRendering = 'pixelated';
    renderer.domElement.style.display = 'block';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const clock = new THREE.Clock();
    let lastTime = 0;
    let smoothedPhaseDelta = 0;
    let phaseAccumulator = 0;
    const phaseDuration = 8.0;
    const waveCount = 6;

    const palette = [
      { r: 0.80, g: 0.30, b: 0.95 },
      { r: 0.30, g: 0.50, b: 1.00 },
      { r: 0.10, g: 0.90, b: 0.70 },
      { r: 0.60, g: 0.90, b: 0.30 },
      { r: 1.00, g: 0.60, b: 0.20 },
    ];

    function getColor(layer: number, phase: number) {
      const p1 = palette[Math.floor(phase) % palette.length];
      const p2 = palette[(Math.floor(phase) + 1) % palette.length];
      const f = phase - Math.floor(phase);
      const [h1, s1, l1] = rgbToHsl(p1.r, p1.g, p1.b);
      const [h2, s2, l2] = rgbToHsl(p2.r, p2.g, p2.b);
      const h = lerpHue(h1, h2, f);
      const s = s1 + (s2 - s1) * f;
      const l = l1 + (l2 - l1) * f;
      const [r, g, b] = hslToRgb(h, s, l);
      const dim = 1.0 - (layer / waveCount) * 0.5;
      return { r: r * dim, g: g * dim, b: b * dim };
    }

    const layers: { mesh: THREE.Points; speed: number }[] = [];

    function createLayerMesh(mesh: THREE.Points, _layerIndex: number) {
      const geometry = mesh.geometry;
      const positions = new Float32Array(4000 * 3);
      for (let i = 0; i < 4000; i++) {
        positions[i * 3] = (Math.random() - 0.5) * width;
        positions[i * 3 + 1] = (Math.random() - 0.5) * height;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
      }
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    }

    for (let i = 0; i < waveCount; i++) {
      const material = new THREE.ShaderMaterial({
        vertexShader: VERTEX_SHADER,
        fragmentShader: FRAGMENT_SHADER,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        uniforms: {
          u_time: { value: 0 },
          u_height: { value: height },
          u_width: { value: width },
          u_color: { value: new THREE.Color(1, 1, 1) },
          u_layer: { value: i },
        },
      });
      const geometry = new THREE.BufferGeometry();
      const mesh = new THREE.Points(geometry, material);
      createLayerMesh(mesh, i);
      scene.add(mesh);
      layers.push({ mesh, speed: 0.0005 + i * 0.0001 });
    }

    function animate() {
      const time = clock.getElapsedTime();
      const delta = Math.min(time - lastTime, 0.1);
      lastTime = time;

      phaseAccumulator += (delta / phaseDuration) * 0.5;
      const phase = phaseAccumulator % palette.length;

      const targetPhaseDelta = Math.abs(phase - Math.floor(phase) - 0.5) * 2.0;
      smoothedPhaseDelta += (targetPhaseDelta - smoothedPhaseDelta) * 0.1;
      const pulseIntensity = Math.pow(smoothedPhaseDelta, 4.0);
      const baseIntensity = 0.3 + 0.7 * (1.0 - pulseIntensity);

      for (let i = 0; i < layers.length; i++) {
        const mat = layers[i].mesh.material as THREE.ShaderMaterial;
        mat.uniforms.u_time.value = time;
        const c = getColor(i, phase);
        (mat.uniforms.u_color.value as THREE.Color).setRGB(
          c.r * baseIntensity,
          c.g * baseIntensity,
          c.b * baseIntensity
        );
      }

      scene.rotation.y = Math.sin(time * 0.02) * 0.05;
      scene.rotation.z = Math.cos(time * 0.017) * 0.02;

      renderer.render(scene, camera);
      rafRef.current = requestAnimationFrame(animate);
    }

    rafRef.current = requestAnimationFrame(animate);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && rafRef.current === 0) {
          rafRef.current = requestAnimationFrame(animate);
        } else if (!entry.isIntersecting && rafRef.current !== 0) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = 0;
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(parent);

    const handleResize = () => {
      const w = parent.offsetWidth;
      renderer.setSize(w / 2, height / 4, false);
      camera.aspect = w / height;
      camera.updateProjectionMatrix();
      for (let i = 0; i < layers.length; i++) {
        const mat = layers[i].mesh.material as THREE.ShaderMaterial;
        mat.uniforms.u_width.value = w;
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(rafRef.current);
      observer.disconnect();
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      layers.forEach((l) => {
        l.mesh.geometry.dispose();
        (l.mesh.material as THREE.ShaderMaterial).dispose();
      });
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [containerRef]);

  return (
    <div
      ref={canvasContainerRef}
      className="absolute inset-0 overflow-hidden rounded-xl"
      style={{ imageRendering: 'pixelated' }}
    />
  );
}

interface HeroSectionProps {
  userName: string;
  taskCount: number;
  onNewTask: () => void;
}

export function HeroSection({ userName, taskCount, onNewTask }: HeroSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const timeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    return 'evening';
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[300px] lg:h-[400px] rounded-xl overflow-hidden"
    >
      {/* Aurora Background */}
      <AuroraCanvas containerRef={containerRef} />

      {/* Scanline Overlay */}
      <div
        className="absolute inset-0 z-[5] pointer-events-none"
        style={{
          background: 'repeating-linear-gradient(to bottom, transparent 0, transparent 3px, rgba(0,0,0,0.07) 3px, rgba(0,0,0,0.07) 4px)',
          mixBlendMode: 'multiply',
        }}
      />

      {/* Content Overlay */}
      <div className="relative z-10 h-full flex flex-col justify-center px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-[#a78bfa]" />
            <span className="text-[#a78bfa] text-sm font-medium">Welcome back</span>
          </div>
          <h1 className="text-[#f8fafc] text-3xl lg:text-4xl font-bold tracking-tight mb-2">
            Good {timeOfDay()}, {userName}
          </h1>
          <p className="text-[#94a3b8] text-sm lg:text-base mb-6 max-w-lg">
            {taskCount > 0
              ? `You have ${taskCount} task${taskCount > 1 ? 's' : ''} due today. Here's your productivity overview.`
              : 'No tasks due today. Enjoy your free time!'}
          </p>
          <motion.button
            onClick={onNewTask}
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            className="
              inline-flex items-center gap-2 px-5 py-2.5 rounded-lg
              bg-gradient-to-r from-[#8b5cf6] to-[#6366f1]
              text-white font-medium text-sm
              shadow-[0_4px_16px_rgba(139,92,246,0.35)]
              hover:shadow-[0_6px_20px_rgba(139,92,246,0.45)]
              transition-all duration-150
            "
          >
            <Plus className="w-4 h-4" />
            New Task
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
