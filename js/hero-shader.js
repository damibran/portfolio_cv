const container = document.getElementById('shader-bg');
if (!container) {
  throw new Error('shader-bg container not found');
}

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x05070c);

const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
camera.position.z = 3.5;

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 0.15));
container.appendChild(renderer.domElement);

const group = new THREE.Group();

const coreMaterial = new THREE.MeshBasicMaterial({ color: 0x112244, transparent: true, opacity: 0.4 });

const geometry = new THREE.IcosahedronGeometry(1, 1);
const core = new THREE.Mesh(geometry, coreMaterial);

const wireGeometry = geometry.clone();
const count = wireGeometry.attributes.position.count;
const colors = new Float32Array(count * 3);
const palette = [
  new THREE.Color(0xff0000),
  new THREE.Color(0x00ff00),
  new THREE.Color(0x0000ff)
];
for (let i = 0; i < count; i++) {
  const c = palette[Math.floor(Math.random() * palette.length)];
  colors[i * 3] = c.r;
  colors[i * 3 + 1] = c.g;
  colors[i * 3 + 2] = c.b;
}
wireGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

const wireMaterial = new THREE.MeshBasicMaterial({ vertexColors: true, wireframe: true, transparent: true, opacity: 0.6 });
const wire = new THREE.Mesh(wireGeometry, wireMaterial);
group.add(core);
group.add(wire);

const particleCount = 128;
const positions = new Float32Array(particleCount * 3);
for (let i = 0; i < particleCount; i++) {
  const r = 2 + Math.random() * 2;
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(2 * Math.random() - 1);
  positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
  positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
  positions[i * 3 + 2] = r * Math.cos(phi);
}
const particleGeometry = new THREE.BufferGeometry();
particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
const particleMaterial = new THREE.PointsMaterial({ color: 0x66ccff, size: 0.03, transparent: true, opacity: 0.5 });
const particles = new THREE.Points(particleGeometry, particleMaterial);
group.add(particles);

scene.add(group);

const targetMouse = new THREE.Vector2(0, 0);
const currentMouse = new THREE.Vector2(0, 0);
let targetScroll = 0;
let currentScroll = 0;

function resize() {
  const w = container.clientWidth;
  const h = container.clientHeight;
  renderer.setSize(w, h);
  renderer.domElement.style.imageRendering = 'pixelated';
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}

window.addEventListener('mousemove', (e) => {
  targetMouse.x = e.clientX / window.innerWidth - 0.5;
  targetMouse.y = 0.5 - e.clientY / window.innerHeight;
});

window.addEventListener('scroll', () => {
  const maxScroll = document.body.scrollHeight - window.innerHeight;
  targetScroll = maxScroll > 0 ? window.scrollY / maxScroll : 0;
});

let visible = true;
const observer = new IntersectionObserver((entries) => {
  visible = entries[0].isIntersecting;
});
observer.observe(container);

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  if (!visible) return;
  const t = clock.getElapsedTime();
  currentMouse.lerp(targetMouse, 0.05);
  currentScroll += (targetScroll - currentScroll) * 0.05;
  group.rotation.x = t * 0.1 + currentMouse.y * 0.5 + currentScroll * 1.5;
  group.rotation.y = t * 0.15 + currentMouse.x * 0.5;
  group.rotation.z = t * 0.05;
  particles.rotation.y = -t * 0.05;
  camera.position.x = currentMouse.x * 0.5;
  camera.position.y = currentMouse.y * 0.5;
  camera.lookAt(0, 0, 0);
  renderer.render(scene, camera);
}

const ro = new ResizeObserver((entries) => {
  for (const entry of entries) {
    resize();
  }
});
ro.observe(container);
window.addEventListener('load', resize);

resize();
animate();
