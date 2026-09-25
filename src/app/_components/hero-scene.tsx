const FACE_COLORS = [
  "border-accent/60 bg-accent/10",
  "border-sky-400/60 bg-sky-400/10",
  "border-violet-400/60 bg-violet-400/10",
  "border-sky-400/60 bg-sky-400/10",
  "border-violet-400/60 bg-violet-400/10",
  "border-accent/60 bg-accent/10",
];

function Cube() {
  const size = 96;
  const half = size / 2;
  return (
    <div
      className="animate-cube-spin relative"
      style={{ width: size, height: size, transformStyle: "preserve-3d" }}
      aria-hidden="true"
    >
      {[
        `rotateY(0deg) translateZ(${half}px)`,
        `rotateY(90deg) translateZ(${half}px)`,
        `rotateY(180deg) translateZ(${half}px)`,
        `rotateY(270deg) translateZ(${half}px)`,
        `rotateX(90deg) translateZ(${half}px)`,
        `rotateX(-90deg) translateZ(${half}px)`,
      ].map((transform, i) => (
        <div
          key={i}
          className={`absolute inset-0 rounded-xl border-2 backdrop-blur-[1px] ${FACE_COLORS[i]}`}
          style={{ transform, backfaceVisibility: "hidden" }}
        />
      ))}
      <div className="absolute inset-0 rounded-xl bg-accent/20 blur-xl" />
    </div>
  );
}

function OrbitRings() {
  return (
    <div
      className="absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2"
      style={{ transformStyle: "preserve-3d", perspective: "900px" }}
      aria-hidden="true"
    >
      <div
        className="animate-orbit-ring absolute inset-0 rounded-full border border-accent/25"
        style={{ transformStyle: "preserve-3d" }}
      />
      <div
        className="animate-orbit-ring-reverse absolute inset-8 rounded-full border border-sky-400/20"
        style={{ transformStyle: "preserve-3d" }}
      />
      <div
        className="animate-orbit-ring absolute inset-16 rounded-full border border-violet-400/20"
        style={{ transformStyle: "preserve-3d" }}
      />
    </div>
  );
}

function GridFloor() {
  return (
    <div
      className="animate-grid-scroll absolute inset-x-0 bottom-0 h-40"
      style={{
        backgroundImage:
          "linear-gradient(rgba(45,107,255,0.16) 1px, transparent 1px), linear-gradient(90deg, rgba(45,107,255,0.16) 1px, transparent 1px)",
        backgroundSize: "48px 48px",
        transform: "perspective(420px) rotateX(62deg) scale(1.5)",
        transformOrigin: "center top",
        maskImage: "linear-gradient(to top, black 30%, transparent)",
        WebkitMaskImage: "linear-gradient(to top, black 30%, transparent)",
      }}
      aria-hidden="true"
    />
  );
}

const PARTICLES = [
  { left: "12%", delay: "0s", duration: "11s", size: 6 },
  { left: "24%", delay: "1.8s", duration: "12s", size: 4 },
  { left: "38%", delay: "3s", duration: "10s", size: 5 },
  { left: "55%", delay: "0.8s", duration: "14s", size: 3 },
  { left: "68%", delay: "2.4s", duration: "12s", size: 6 },
  { left: "80%", delay: "4s", duration: "13s", size: 4 },
  { left: "90%", delay: "1.2s", duration: "11s", size: 5 },
];

function Particles() {
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      {PARTICLES.map((particle, i) => (
        <span
          key={i}
          className="absolute bottom-0 rounded-full bg-accent/60"
          style={{
            left: particle.left,
            width: particle.size,
            height: particle.size,
            animation: `particle-rise ${particle.duration} linear infinite`,
            animationDelay: particle.delay,
            boxShadow: "0 0 8px rgba(45,107,255,0.5)",
          }}
        />
      ))}
    </div>
  );
}

export function HeroScene() {
  return (
    <div
      className="relative hidden h-[480px] w-[520px] shrink-0 lg:block"
      style={{ perspective: "1200px" }}
      aria-hidden="true"
    >
      <div className="animate-float-y absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <Cube />
      </div>
      <OrbitRings />
      <GridFloor />
      <Particles />
    </div>
  );
}
