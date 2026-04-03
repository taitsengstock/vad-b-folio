// 200 colors assigned sequentially to users in order of first session
const COLORS: string[] = Array.from({ length: 200 }, (_, i) => {
  const hue = (i * 137.508) % 360; // golden angle distribution for visual variety
  const saturation = 65 + (i % 3) * 10; // alternates 65, 75, 85
  const lightness = 55 + (i % 4) * 5;  // alternates 55, 60, 65, 70
  return `hsl(${Math.round(hue)}, ${saturation}%, ${lightness}%)`;
});

export default COLORS;
