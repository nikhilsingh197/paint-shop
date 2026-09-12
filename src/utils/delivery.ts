export const getDeliveryTime = (area?: string): string => {
  if (!area) return '4 HOURS';
  const fastAreas = ['mango', 'dimna', 'pardih', 'baliguma'];
  const lowerArea = area.toLowerCase();
  
  const isFast = fastAreas.some(fa => lowerArea.includes(fa));
  
  if (isFast) {
    return '2 HOURS';
  }
  return '4 HOURS';
};
