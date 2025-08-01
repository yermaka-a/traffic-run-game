import * as THREE from "three";

import { Car, Truck } from "./Vehicles";
import { renderMap } from "./Map";
import { trackRadius, arcCenterX, config } from "./help-values";
import { pickRandom } from "./helpers";
window.focus(); // Capture keys right away (by default focus is on editor)

const resultsElement = document.getElementById("results");

function getDistance(coordinate1, coordinate2) {
  const horizontalDistance = coordinate2.x - coordinate1.x;
  const verticalDistance = coordinate2.y - coordinate1.y;
  return Math.sqrt(horizontalDistance ** 2 + verticalDistance ** 2);
}

interface OtherVehicle {
  mesh: THREE.Group<THREE.Object3DEventMap>;
  type: string | number;
  clockWise: boolean;
  angle: number;
  speed: number;
}

let ready: boolean = false;
let playerAngleMoved;
let score;

const playerAngleInitial = Math.PI;
const scoreElement = document.getElementById("score");
let otherVehicles: OtherVehicle[] = [];
let lastTimestamp;
const speed = 0.0017;
let accelerate = false;
let decelerate = false;

const scene = new THREE.Scene();

const playerCar = Car();

scene.add(playerCar);

// set up lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
dirLight.position.set(100, -300, 400);
scene.add(dirLight);
// set up camera
const aspectRatio = window.innerWidth / window.innerHeight;
const cameraWidth = 960;
const cameraHeight = cameraWidth / aspectRatio;

const camera = new THREE.OrthographicCamera(
  cameraWidth / -2, // left
  cameraWidth / 2, // right
  cameraHeight / 2, // top
  cameraHeight / -2, // bottom
  0, // near plane
  1000 // far plane
);

camera.position.set(0, -210, 300);
// camera.up.set(0, 0, 1);
camera.lookAt(0, 0, 0);

// set up renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);

renderMap(scene, cameraWidth, cameraHeight * 2);

document.body.appendChild(renderer.domElement);

const getVehicleSpeed = (type: string | number): number => {
  if (type === "car") {
    const minSpeed = 1;
    const maxSpeed = 2;
    return minSpeed * Math.random() * (maxSpeed - minSpeed);
  } else {
    const minSpeed = 0.6;
    const maxSpeed = 1.5;
    return minSpeed * Math.random() * (maxSpeed - minSpeed);
  }
};

const addVehicle = () => {
  const vehicleTypes = ["car", "truck"];

  const type = pickRandom(vehicleTypes);
  const mesh = type === "car" ? Car() : Truck(scene);
  scene.add(mesh);

  const clockWise = Math.random() >= 0.5;
  const angle = clockWise ? Math.PI / 2 : -Math.PI / 2;

  const speed = getVehicleSpeed(type);

  otherVehicles.push({ mesh, type, clockWise, angle, speed });
};

const moveOtherVehicles = (timeDelta: number) => {
  otherVehicles.forEach((vehicle) => {
    if (vehicle.clockWise) {
      vehicle.angle -= speed * timeDelta * vehicle.speed;
    } else {
      vehicle.angle += speed * timeDelta * vehicle.speed;
    }

    const vehicleX = Math.cos(vehicle.angle) * trackRadius + arcCenterX;
    const vehicleY = Math.sin(vehicle.angle) * trackRadius;
    const rotation =
      vehicle.angle + (vehicle.clockWise ? -Math.PI / 2 : Math.PI / 2);
    vehicle.mesh.position.x = vehicleX;
    vehicle.mesh.position.y = vehicleY;
    vehicle.mesh.rotation.z = rotation;
  });
};

const getHitZonePosition = (center, angle, clockwise, distance) => {
  const directionAngle = angle + clockwise ? -Math.PI / 2 : +Math.PI / 2;
  return {
    x: center.x + Math.cos(directionAngle) * distance,
    y: center.y + Math.sin(directionAngle) * distance,
  };
};

const hitDetection = () => {
  const playerHitZone1 = getHitZonePosition(
    playerCar.position,
    playerAngleInitial + playerAngleMoved,
    true,
    15
  );

  const playerHitZone2 = getHitZonePosition(
    playerCar.position,
    playerAngleInitial + playerAngleMoved,
    true,
    -15
  );

  if (config.showHitZones) {
    playerCar.userData.hitZone1.position.x = playerHitZone1.x;
    playerCar.userData.hitZone1.position.y = playerHitZone1.y;

    playerCar.userData.hitZone2.position.x = playerHitZone2.x;
    playerCar.userData.hitZone2.position.y = playerHitZone2.y;
  }

  const hit = otherVehicles.some((vehicle) => {
    if (vehicle.type == "car") {
      const vehicleHitZone1 = getHitZonePosition(
        vehicle.mesh.position,
        vehicle.angle,
        vehicle.clockWise,
        15
      );

      const vehicleHitZone2 = getHitZonePosition(
        vehicle.mesh.position,
        vehicle.angle,
        vehicle.clockWise,
        -15
      );

      if (config.showHitZones) {
        vehicle.mesh.userData.hitZone1.position.x = vehicleHitZone1.x;
        vehicle.mesh.userData.hitZone1.position.y = vehicleHitZone1.y;

        vehicle.mesh.userData.hitZone2.position.x = vehicleHitZone2.x;
        vehicle.mesh.userData.hitZone2.position.y = vehicleHitZone2.y;
      }

      // The player hits another vehicle
      if (getDistance(playerHitZone1, vehicleHitZone1) < 40) return true;
      if (getDistance(playerHitZone1, vehicleHitZone2) < 40) return true;

      // Another vehicle hits the player
      if (getDistance(playerHitZone2, vehicleHitZone1) < 40) return true;
    }

    if (vehicle.type == "truck") {
      const vehicleHitZone1 = getHitZonePosition(
        vehicle.mesh.position,
        vehicle.angle,
        vehicle.clockWise,
        35
      );

      const vehicleHitZone2 = getHitZonePosition(
        vehicle.mesh.position,
        vehicle.angle,
        vehicle.clockWise,
        0
      );

      const vehicleHitZone3 = getHitZonePosition(
        vehicle.mesh.position,
        vehicle.angle,
        vehicle.clockWise,
        -35
      );

      if (config.showHitZones) {
        vehicle.mesh.userData.hitZone1.position.x = vehicleHitZone1.x;
        vehicle.mesh.userData.hitZone1.position.y = vehicleHitZone1.y;

        vehicle.mesh.userData.hitZone2.position.x = vehicleHitZone2.x;
        vehicle.mesh.userData.hitZone2.position.y = vehicleHitZone2.y;

        vehicle.mesh.userData.hitZone3.position.x = vehicleHitZone3.x;
        vehicle.mesh.userData.hitZone3.position.y = vehicleHitZone3.y;
      }

      // The player hits another vehicle
      if (getDistance(playerHitZone1, vehicleHitZone1) < 40) return true;
      if (getDistance(playerHitZone1, vehicleHitZone2) < 40) return true;
      if (getDistance(playerHitZone1, vehicleHitZone3) < 40) return true;

      // Another vehicle hits the player
      if (getDistance(playerHitZone2, vehicleHitZone1) < 40) return true;
    }
  });

  if (hit) {
    if (resultsElement) resultsElement.style.display = "flex";
    renderer.setAnimationLoop(null); // Stop animation loop
  }
};

const animation = (timestamp: number) => {
  if (!lastTimestamp) {
    lastTimestamp = timestamp;
    return;
  }

  const timeDelta = timestamp - lastTimestamp;
  movePlayerCar(timeDelta);

  const laps = Math.floor(Math.abs(playerAngleMoved) / (Math.PI * 2));

  // update score if it changed
  if (laps != score) {
    score = laps;
    if (scoreElement) scoreElement.innerText = score;
  }

  // add a new vehicle at start and with every 5th lap
  if (otherVehicles.length < (laps + 1) / 5) addVehicle();

  moveOtherVehicles(timeDelta);
  hitDetection();

  renderer.render(scene, camera);
  lastTimestamp = timestamp;
};

const movePlayerCar = (timeDelta: number) => {
  const playerSpeed = getPlayerSpeed();
  playerAngleMoved -= playerSpeed * timeDelta;

  const totalPlayerAngle = playerAngleInitial + playerAngleMoved;

  const playerX = Math.cos(totalPlayerAngle) * trackRadius - arcCenterX;
  const playerY = Math.sin(totalPlayerAngle) * trackRadius;

  playerCar.position.x = playerX;
  playerCar.position.y = playerY;

  playerCar.rotation.z = totalPlayerAngle - Math.PI / 2;
};

const getPlayerSpeed = () => {
  if (accelerate) return speed * 2;
  if (decelerate) return speed * 0.5;
  return speed;
};

const reset = () => {
  // reset pos and score
  playerAngleMoved = 0;
  movePlayerCar(0);
  score = 0;
  if (scoreElement) scoreElement.innerText = score;
  lastTimestamp = undefined;

  // remove other vehicles
  otherVehicles.forEach((v) => {
    scene.remove(v.mesh);
  });
  otherVehicles = [];

  renderer.render(scene, camera);
  ready = true;
};
reset();
const startGame = () => {
  if (ready) {
    ready = false;
    renderer.setAnimationLoop(animation);
  }
};

window.addEventListener("keydown", (e) => {
  e.preventDefault();
  if (e.key == "ArrowUp") {
    startGame();
    accelerate = true;
    return;
  }

  if (e.key == "ArrowDown") {
    decelerate = true;
    return;
  }

  if (e.key == "R" || e.key == "r") {
    reset();
    return;
  }
});

window.addEventListener("keyup", (e) => {
  e.preventDefault();
  if (e.key == "ArrowUp") {
    accelerate = false;
    return;
  }

  if (e.key == "ArrowDown") {
    decelerate = false;
    return;
  }
});
