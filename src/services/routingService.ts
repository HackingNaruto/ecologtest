// src/services/routingService.ts

export const determineDestination = (deviceType: string, condition: string): string => {
  const type = deviceType.toLowerCase();
  const cond = condition.toLowerCase();

  // Rules Engine
  if (cond === 'working' || cond === 'refurbishable') return 'Refurbisher';
  if (['copper', 'aluminum', 'lithium', 'gold'].includes(type)) return 'Material Marketplace';
  if (['motherboard', 'screen', 'monitor'].includes(type)) return 'Recycler';
  
  return 'General Waste Facility';
};