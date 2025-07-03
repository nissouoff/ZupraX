import * as THREE from 'three';

let scene, camera, renderer;
let rocket, stars, launchPad, flame, flameLight, smokeParticles = [];
let flameMaterial;
let launched = false;
let preLaunch = false;
let rocketStartY = 0;
let startTime = 0;
let multiplier = 1.0;

const speed = 0.06;
const multiplierSpeed = 0.2;
const maxMultiplier = 100;
let afterMax = false;
let transitionStart = null;


const infoText = document.getElementById('info');
const multiplierText = document.getElementById('multiplier');
const timerText = document.getElementById('timer');

const audio = new Audio('/rocket.mp3');
const audio2 = new Audio('/rocket2.mp3');
audio2.loop = true;

const textureLoader = new THREE.TextureLoader();
const smokeTexture = textureLoader.load('/smoke.png');
const smokeTextureAfter = textureLoader.load('/smoke1.png');

const isMobile = /Mobi|Android/i.test(navigator.userAgent);

init();
animate();

function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000011);

  camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 1.2, 5.5);
  camera.lookAt(new THREE.Vector3(0, 1.2, 0));

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  document.body.appendChild(renderer.domElement);

  const ambient = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambient);

  const spotLight = new THREE.PointLight(0xffaa00, 2, 10);
  spotLight.position.set(0, 1, 0);
  scene.add(spotLight);

  const padGeometry = new THREE.CircleGeometry(1.5, 32);
  const padMaterial = new THREE.MeshStandardMaterial({ color: 0x444444 });
  launchPad = new THREE.Mesh(padGeometry, padMaterial);
  launchPad.rotation.x = -Math.PI / 2;
  scene.add(launchPad);

  const starGeometry = new THREE.BufferGeometry();
  const starCount = 1500;
  const starVertices = [];
  for (let i = 0; i < starCount; i++) {
    const x = (Math.random() - 0.5) * 1000;
    const y = Math.random() * 1000;
    const z = (Math.random() - 0.5) * 1000;
    starVertices.push(x, y, z);
  }
  starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
  const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.3, sizeAttenuation: true });
  stars = new THREE.Points(starGeometry, starMaterial);
  scene.add(stars);

  rocket = new THREE.Group();

  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(0.14, 0.14, 2, 16),
    new THREE.MeshStandardMaterial({ color: 0xff0000 })
  );
  body.position.y = 1;

  const nose = new THREE.Mesh(
    new THREE.ConeGeometry(0.14, 0.35, 16),
    new THREE.MeshStandardMaterial({ color: 0xffffff })
  );
  nose.position.y = 2.175;

  const engine = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.15, 0.15, 12),
    new THREE.MeshStandardMaterial({ color: 0x333333 })
  );
  engine.position.y = -0.1;

  const wingGeometry = new THREE.BoxGeometry(0.05, 0.25, 0.15);
  const wingMaterial = new THREE.MeshStandardMaterial({ color: 0xd00000 });

  const wing1 = new THREE.Mesh(wingGeometry, wingMaterial);
  wing1.position.set(0.15, 0.3, 0);
  wing1.rotation.z = Math.PI / 8;

  const wing2 = wing1.clone();
  wing2.position.set(-0.15, 0.3, 0);
  wing2.rotation.z = -Math.PI / 8;

  const stabilizer = new THREE.Mesh(
    new THREE.BoxGeometry(0.05, 0.25, 0.15),
    wingMaterial
  );
  stabilizer.position.set(0, 0.3, -0.15);
  stabilizer.rotation.x = Math.PI / 8;

  const windowGeometry = new THREE.CircleGeometry(0.07, 32);
  const windowMaterial = new THREE.MeshStandardMaterial({ color: 0x66ccff, emissive: 0x2266ff, emissiveIntensity: 0.4 });

  const window1 = new THREE.Mesh(windowGeometry, windowMaterial);
  window1.position.set(0.14, 1.2, 0);
  window1.rotation.y = -Math.PI / 2;

  const window2 = window1.clone();
  window2.position.y = 1.5;

  rocket.add(body, nose, engine, wing1, wing2, stabilizer, window1, window2);

  flameMaterial = new THREE.MeshBasicMaterial({ color: 0xff6600, transparent: true, opacity: 0.8 });
  const flameGeometry = new THREE.ConeGeometry(0.2, 0.8, 20);
  flame = new THREE.Mesh(flameGeometry, flameMaterial);
  flame.position.y = -0.8;
  flame.rotation.x = Math.PI;
  flame.visible = false;

  flameLight = new THREE.PointLight(0xff4400, isMobile ? 0.8 : 1.0, 5);
  flameLight.position.set(0, 0.2, 0);

  rocket.add(flame);
  rocket.add(flameLight);

  rocket.position.set(0, rocketStartY + 0.3, 0);
  scene.add(rocket);

  document.getElementById('startBtn').onclick = () => {
  if (!launched && !preLaunch) {
    document.getElementById('startBtn').style.display = 'none';
    document.getElementById('bottomNav').style.display = 'none'; // 👈 cache la navbar

    preLaunch = true;
    infoText.innerText = 'Préparation au décollage...';
    startTime = Date.now();
    audio.play();

    let count = 0;
    const smokeInterval = setInterval(() => {
      for (let i = 0; i < 6; i++) generateSmoke(rocket.position.y - 0.5, true);
      count++;
      if (count >= 15) {
        clearInterval(smokeInterval);
        launched = true;
        preLaunch = false;
        multiplier = 1.0;
        startTime = Date.now();
        infoText.innerText = '';
        flame.visible = true;
      }
    }, 100);
  }
};

  window.addEventListener('resize', onWindowResize);
}

function animate() {
  requestAnimationFrame(animate);

  if (preLaunch) {
    rocketShake(0.15);
    cameraShake(0.12);
    generateSmoke(rocket.position.y, true);
    updateSmoke();
    renderer.render(scene, camera);
    return;
  }

  if (launched) {
    if (multiplier >= maxMultiplier && !afterMax) {
      afterMax = true;
      transitionStart = Date.now();

      // 🔁 Lancer le nouveau son en boucle
      audio2.currentTime = 0;
      audio2.play().catch(e => console.warn('Loop audio failed', e));
    }

    multiplier += multiplierSpeed;
    multiplierText.innerText = `x${multiplier.toFixed(2)}`;
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    timerText.innerText = `⏱ ${elapsed}s`;

    let vibrationIntensity = 0.08;
    let currentSpeed = speed;

    if (afterMax) {
      const t = Math.min((Date.now() - transitionStart) / 2000, 1);
      vibrationIntensity = 0.08 * (1 - t) + 0.01 * t;
      currentSpeed = speed * (1 - t) + 0.02 * t;
    }

    rocket.position.y += currentSpeed;

    rocketShake(vibrationIntensity);
    cameraShake(vibrationIntensity);

    stars.position.y = -rocket.position.y * 0.9;

    let flameScale = 1;
    if (afterMax) {
      const t = Math.min((Date.now() - transitionStart) / 2000, 1);
      flameScale = 1 - 0.5 * t;
    }

    flame.scale.y = flameScale * (1 + Math.sin(Date.now() * 0.05) * 0.6);
    flameMaterial.opacity = 0.7 + Math.sin(Date.now() * 0.03) * 0.2;
    flameLight.intensity = 1 + Math.sin(Date.now() * 0.04) * 0.5;

    generateSmoke(rocket.position.y);
    updateSmoke();
  }

  renderer.render(scene, camera);
}

function rocketShake(intensity) {
  rocket.rotation.x = (Math.random() - 0.5) * intensity;
  rocket.rotation.z = (Math.random() - 0.5) * intensity;
}

function cameraShake(intensity) {
  const camShakeX = (Math.random() - 0.5) * intensity * 0.5;
  const camShakeY = (Math.random() - 0.5) * intensity * 0.5;
  camera.position.set(camShakeX, rocket.position.y + 2 + camShakeY, 6);
  camera.lookAt(new THREE.Vector3(0, rocket.position.y + 1, 0));
}

function generateSmoke(y, burst = false) {
  const count = burst ? 2 : 1;

  for (let i = 0; i < count; i++) {
    const texture = multiplier >= maxMultiplier ? smokeTextureAfter : smokeTexture;

    const material = new THREE.SpriteMaterial({
      map: texture,
      color: 0xffffff,
      transparent: true,
      opacity: isMobile ? 0.15 : 0.25,
      depthWrite: false
    });

    const sprite = new THREE.Sprite(material);
    sprite.position.set(
      (Math.random() - 0.5) * (burst ? 2 : 0.6),
      (multiplier >= maxMultiplier ? y - 0.8 : y),
      (Math.random() - 0.5) * (burst ? 2 : 0.6)
    );

    const scale = Math.random() * 1 + 0.5;
    sprite.scale.set(scale, scale, scale);

    scene.add(sprite);
    smokeParticles.push({ mesh: sprite, life: 3.0 + Math.random() });
  }
}

function updateSmoke() {
  smokeParticles.forEach(p => {
    p.mesh.position.y += 0.003;
    p.mesh.material.opacity -= 0.003;
    p.life -= 0.007;
    if (p.life <= 0) scene.remove(p.mesh);
  });
  smokeParticles = smokeParticles.filter(p => p.life > 0);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
