const trackRadius = 225;
const trackWidth = 45;
const innerTrackRadius = trackRadius - trackWidth;
const outerTrackRadius = trackRadius + trackWidth;
const vehicleColors = [0xa52523, 0xbdb638, 0x78b14b];
const arcAngle1 = (1 / 3) * Math.PI; // 60 degrees

const deltaY = Math.sin(arcAngle1) * innerTrackRadius;
const arcAngle2 = Math.asin(deltaY / outerTrackRadius);

const config = {
  showHitZones: false,
  shadows: true, // Use shadow
  trees: true, // Add trees to the map
  curbs: true, // Show texture on the extruded geometry
  grid: false, // Show grid helper
};

const arcCenterX =
  (Math.cos(arcAngle1) * innerTrackRadius +
    Math.cos(arcAngle2) * outerTrackRadius) /
  2;

const arcAngle3 = Math.acos(arcCenterX / innerTrackRadius);

const arcAngle4 = Math.acos(arcCenterX / outerTrackRadius);

export {
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
  vehicleColors,
  config,
};
