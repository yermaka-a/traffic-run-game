import * as THREE from "three";
const vehicleColors = [0xa52523, 0xbdb638, 0x78b14b];

export const Car = () => {
  const car = new THREE.Group();

  const backWheel = new THREE.Mesh(
    new THREE.BoxGeometry(12, 33, 12),
    new THREE.MeshLambertMaterial({ color: 0x333333 })
  );
  backWheel.position.z = 6;
  backWheel.position.x = -18;
  car.add(backWheel);

  const frontWheel = new THREE.Mesh(
    new THREE.BoxGeometry(12, 33, 12),
    new THREE.MeshLambertMaterial({ color: 0x333333 })
  );
  frontWheel.position.z = 6;
  frontWheel.position.x = 18;
  car.add(frontWheel);
  const main = new THREE.Mesh(
    new THREE.BoxGeometry(60, 30, 15),
    new THREE.MeshLambertMaterial({ color: 0xa52523 })
  );
  main.position.z = 12;
  car.add(main);
  const cabin = new THREE.Mesh(
    new THREE.BoxGeometry(33, 24, 12),
    new THREE.MeshLambertMaterial({ color: 0xffffff })
  );
  cabin.position.x = -6;
  cabin.position.z = 25.5;
  car.add(cabin);
  return car;
};
