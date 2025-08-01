import * as THREE from "three";
import {
  trackRadius,
  trackWidth,
  innerTrackRadius,
  outerTrackRadius,
  arcAngle1,
  deltaY,
  arcAngle2,
  arcCenterX,
  arcAngle3,
  arcAngle4,
} from "./help-values";

const getLineMarkings = (mapWidth: number, mapHeight: number) => {
  const canvas = document.createElement("canvas");
  canvas.width = mapWidth;
  canvas.height = mapHeight;
  const context = canvas.getContext("2d");
  if (context) {
    context.fillStyle = "#546e90";
    context.fillRect(0, 0, mapWidth, mapHeight);

    context.lineWidth = 2;
    context.strokeStyle = "#E0FFFF";
    context.setLineDash([10, 14]);

    // Left circle
    context.beginPath();
    context.arc(
      mapWidth / 2 - arcCenterX,
      mapHeight / 2,
      trackRadius,
      0,
      Math.PI * 2
    );
    context.stroke();

    // Right circle
    context.beginPath();
    context.arc(
      mapWidth / 2 + arcCenterX,
      mapHeight / 2,
      trackRadius,
      0,
      Math.PI * 2
    );
    context.stroke();
  }
  return new THREE.CanvasTexture(canvas);
};

const getLeftIsland = () => {
  const isLandLeft = new THREE.Shape();

  isLandLeft.absarc(
    -arcCenterX,
    0,
    innerTrackRadius,
    arcAngle1,
    -arcAngle1,
    false
  );

  isLandLeft.absarc(
    arcCenterX,
    0,
    outerTrackRadius,
    Math.PI + arcAngle2,
    Math.PI - arcAngle2,
    true
  );

  return isLandLeft;
};

const getRightIsland = () => {
  const isLandRight = new THREE.Shape();

  isLandRight.absarc(
    arcCenterX,
    0,
    innerTrackRadius,
    Math.PI - arcAngle1,
    Math.PI + arcAngle1,
    true
  );

  isLandRight.absarc(
    -arcCenterX,
    0,
    outerTrackRadius,
    -arcAngle2,
    arcAngle2,
    false
  );

  return isLandRight;
};
const getMiddleIsland = () => {
  const isLandMiddle = new THREE.Shape();

  isLandMiddle.absarc(
    -arcCenterX,
    0,
    innerTrackRadius,
    arcAngle3,
    -arcAngle3,
    true
  );

  isLandMiddle.absarc(
    arcCenterX,
    0,
    innerTrackRadius,
    Math.PI + arcAngle3,
    Math.PI - arcAngle3,
    true
  );

  return isLandMiddle;
};

const getOuterField = (mapWidth: number, mapHeight: number) => {
  const field = new THREE.Shape();

  field.moveTo(-mapWidth / 2, -mapHeight / 2);
  field.lineTo(0, -mapHeight / 2);

  field.absarc(-arcCenterX, 0, outerTrackRadius, -arcAngle4, arcAngle4, true);

  field.absarc(
    arcCenterX,
    0,
    outerTrackRadius,
    Math.PI - arcAngle4,
    Math.PI + arcAngle4,
    true
  );

  field.lineTo(0, -mapHeight / 2);
  field.lineTo(mapWidth / 2, -mapHeight / 2);
  field.lineTo(mapWidth / 2, mapHeight / 2);
  field.lineTo(-mapWidth / 2, mapHeight / 2);

  return field;
};
export const renderMap = (
  scene: THREE.Scene,
  mapWidth: number,
  mapHeight: number
) => {
  // Plane with line markings
  const lineMarkingsTexture = getLineMarkings(mapWidth, mapHeight);

  const planeGeometry = new THREE.PlaneGeometry(mapWidth, mapHeight);
  const planeMaterial = new THREE.MeshLambertMaterial({
    map: lineMarkingsTexture,
  });

  const plane = new THREE.Mesh(planeGeometry, planeMaterial);
  scene.add(plane);

  // Extruded geometry
  const isLandLeft = getLeftIsland();
  const isLandMiddle = getMiddleIsland();
  const isLandRight = getRightIsland();
  const outerField = getOuterField(mapWidth, mapHeight);

  const fieldGeometry = new THREE.ExtrudeGeometry(
    [isLandLeft, isLandMiddle, isLandRight, outerField],
    { depth: 6, bevelEnabled: false }
  );

  const fieldMesh = new THREE.Mesh(fieldGeometry, [
    new THREE.MeshLambertMaterial({ color: 0x67c240 }),
    new THREE.MeshLambertMaterial({ color: 0x23311c }),
  ]);
  scene.add(fieldMesh);
};
