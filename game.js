const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a75ff);
scene.fog = new THREE.FogExp2(0x1a75ff, 0.0004);

const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 10000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xfffaed, 0.9);
dirLight.position.set(400, 600, 300);
dirLight.castShadow = true;
scene.add(dirLight);

const inv = { wood: 10, stone: 5, coal: 0, gold: 0, diamond: 0, oil: 0 };
function updateUI() {
    document.getElementById('wood').innerText = inv.wood;
    document.getElementById('stone').innerText = inv.stone;
    document.getElementById('coal').innerText = inv.coal;
    document.getElementById('gold').innerText = inv.gold;
    document.getElementById('diamond').innerText = inv.diamond;
    document.getElementById('oil').innerText = inv.oil;
}

const oceanGeo = new THREE.PlaneGeometry(10000, 10000);
const oceanMat = new THREE.MeshStandardMaterial({ color: 0x0055ff, roughness: 0.3 });
const ocean = new THREE.Mesh(oceanGeo, oceanMat);
ocean.rotation.x = -Math.PI / 2;
ocean.position.y = -2;
scene.add(ocean);

// Ilhas Gigantes em Circuito
const islandRadius = 300; 
const circuitRadius = 1200;
const islandCount = 8;
const islands = [];

for (let i = 0; i < islandCount; i++) {
    const angle = (i / islandCount) * Math.PI * 2;
    const x = Math.cos(angle) * circuitRadius;
    const z = Math.sin(angle) * circuitRadius;

    const islandGeo = new THREE.CylinderGeometry(islandRadius, islandRadius - 30, 12, 32);
    const islandMat = new THREE.MeshStandardMaterial({ color: 0x2e8b57, roughness: 0.8 });
    const island = new THREE.Mesh(islandGeo, islandMat);
    island.position.set(x, 2, z);
    island.receiveShadow = true;
    scene.add(island);
    islands.push({ x, z, radius: islandRadius });

    // Florestas nas ilhas gigantes
    for(let j = 0; j < 50; j++) {
        const treeAngle = Math.random() * Math.PI * 2;
        const dist = Math.random() * (islandRadius - 30);
        const tx = x + Math.cos(treeAngle) * dist;
        const tz = z + Math.sin(treeAngle) * dist;

        const trunkGeo = new THREE.CylinderGeometry(4, 6, 16);
        const trunkMat = new THREE.MeshStandardMaterial({ color: 0x8b5a2b });
        const trunk = new THREE.Mesh(trunkGeo, trunkMat);
        trunk.position.set(tx, 10, tz);
        scene.add(trunk);

        const leavesGeo = new THREE.SphereGeometry(12, 8, 8);
        const leavesMat = new THREE.MeshStandardMaterial({ color: 0x228b22 });
        const leaves = new THREE.Mesh(leavesGeo, leavesMat);
        leaves.position.set(tx, 22, tz);
        scene.add(leaves);
    }
}

// --- FERROVIA CIRCULAR PASSANDO POR TODAS AS ILHAS ---
const railCurveRadius = circuitRadius;
const railSegments = 128;
const railTrackGeo = new THREE.TorusGeometry(railCurveRadius, 4, 16, railSegments);
const railMat = new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.8 });
const railway = new THREE.Mesh(railTrackGeo, railMat);
railway.rotation.x = Math.PI / 2;
railway.position.set(0, 8.5, 0);
scene.add(railway);

// Estação de Bilheteria
const stationGeo = new THREE.BoxGeometry(40, 25, 40);
const stationMat = new THREE.MeshStandardMaterial({ color: 0xb22222 });
const station = new THREE.Mesh(stationGeo, stationMat);
station.position.set(circuitRadius, 16, 0);
scene.add(station);

// Trem Circular
const trainGeo = new THREE.BoxGeometry(45, 14, 20);
const trainMat = new THREE.MeshStandardMaterial({ color: 0xffd700 });
const train = new THREE.Mesh(trainGeo, trainMat);
scene.add(train);

let trainAngle = 0;

// --- PERSONAGEM 3D ---
const playerGroup = new THREE.Group();
const bodyGeo = new THREE.BoxGeometry(4, 8, 2.4);
const bodyMat = new THREE.MeshStandardMaterial({ color: 0x0044ff });
const playerBody = new THREE.Mesh(bodyGeo, bodyMat);
playerBody.position.y = 4;
playerGroup.add(playerBody);

const headGeo = new THREE.BoxGeometry(2.8, 2.8, 2.8);
const headMat = new THREE.MeshStandardMaterial({ color: 0xffdbac });
const playerHead = new THREE.Mesh(headGeo, headMat);
playerHead.position.y = 9;
playerGroup.add(playerHead);

playerGroup.position.set(0, 10, 0);
scene.add(playerGroup);

let joystickMove = { x: 0, y: 0 };
const joystickBase = document.getElementById('joystick-base');
const joystickStick = document.getElementById('joystick-stick');
let touching = false;
let centerPos = { x: 0, y: 0 };

joystickBase.addEventListener('touchstart', (e) => {
    touching = true;
    const rect = joystickBase.getBoundingClientRect();
    centerPos = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
});

window.addEventListener('touchmove', (e) => {
    if (!touching) return;
    const touch = e.touches[0];
    const dx = touch.clientX - centerPos.x;
    const dy = touch.clientY - centerPos.y;
    const dist = Math.min(40, Math.sqrt(dx * dx + dy * dy));
    const angle = Math.atan2(dy, dx);

    const stickX = Math.cos(angle) * dist;
    const stickY = Math.sin(angle) * dist;
    joystickStick.style.transform = `translate(${stickX}px, ${stickY}px)`;

    joystickMove.x = stickX / 40;
    joystickMove.y = stickY / 40;
});

window.addEventListener('touchend', () => {
    touching = false;
    joystickMove = { x: 0, y: 0 };
    joystickStick.style.transform = `translate(0px, 0px)`;
});

function doAction() {
    inv.wood += 2;
    inv.stone += 1;
    inv.coal += Math.random() > 0.5 ? 1 : 0;
    inv.gold += Math.random() > 0.8 ? 1 : 0;
    inv.diamond += Math.random() > 0.95 ? 1 : 0;
    inv.oil += Math.random() > 0.98 ? 1 : 0;
    updateUI();
}

document.getElementById('action-btn').addEventListener('click', doAction);

const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();
    const speed = 70 * delta;

    playerGroup.position.x += joystickMove.x * speed;
    playerGroup.position.z += joystickMove.y * speed;

    trainAngle += 0.15 * delta;
    const trainX = Math.cos(trainAngle) * railCurveRadius;
    const trainZ = Math.sin(trainAngle) * railCurveRadius;
    train.position.set(trainX, 16, trainZ);
    train.rotation.y = -trainAngle;

    camera.position.x = playerGroup.position.x;
    camera.position.y = playerGroup.position.y + 150;
    camera.position.z = playerGroup.position.z + 180;
    camera.lookAt(playerGroup.position.x, playerGroup.position.y, playerGroup.position.z);

    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

updateUI();
animate();
