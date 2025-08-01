export const pickRandom = (array: (number | string)[]) => {
  return array[Math.floor(Math.random() * array.length)];
};
