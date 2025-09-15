// Station data utility for Konkan Railway
export interface StationData {
  station: string;
  url: string;
  platforms: number;
  zone: string;
  division: string;
  state: string;
  elevation: string;
  type: string;
  category: string;
  nearby_stations: Record<string, string>;
  ratings: {
    cleanliness: string;
    porters_escalators: string;
    food: string;
    transportation: string;
    lodging: string;
    railfanning: string;
    sightseeing: string;
    safety: string;
  };
  coordinates?: {
    lat: string;
    lon: string;
  };
}

// Load station data from the JSON file
export const loadStationData = async (): Promise<StationData[]> => {
  try {
    const response = await fetch('/stations.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error loading station data:', error);
    return [];
  }
};

// Get station by name
export const getStationByName = (stations: StationData[], stationName: string): StationData | undefined => {
  return stations.find(station => 
    station.station.toLowerCase() === stationName.toLowerCase() ||
    station.station.toLowerCase().includes(stationName.toLowerCase())
  );
};

// Get platform count for a station
export const getPlatformCount = (stations: StationData[], stationName: string): number => {
  const station = getStationByName(stations, stationName);
  return station?.platforms || 1;
};

// Get nearby stations
export const getNearbyStations = (stations: StationData[], stationName: string): string[] => {
  const station = getStationByName(stations, stationName);
  return station ? Object.keys(station.nearby_stations) : [];
};

// Check if station is a major junction
export const isMajorJunction = (stations: StationData[], stationName: string): boolean => {
  const station = getStationByName(stations, stationName);
  if (!station) return false;
  
  return station.platforms >= 3 || 
         station.category.includes('NSG-3') || 
         station.category.includes('NSG-4') ||
         station.type === 'Junction';
};

// Get station capacity score (based on platforms and category)
export const getStationCapacityScore = (stations: StationData[], stationName: string): number => {
  const station = getStationByName(stations, stationName);
  if (!station) return 1;
  
  let score = station.platforms;
  
  // Adjust based on category
  if (station.category.includes('NSG-3')) score += 2;
  else if (station.category.includes('NSG-4')) score += 1.5;
  else if (station.category.includes('NSG-5')) score += 1;
  
  return Math.min(score, 10); // Cap at 10
};

// Get congestion risk based on station characteristics
export const getCongestionRisk = (stations: StationData[], stationName: string, currentTrainCount: number): 'low' | 'medium' | 'high' => {
  const capacityScore = getStationCapacityScore(stations, stationName);
  const utilizationRatio = currentTrainCount / capacityScore;
  
  if (utilizationRatio > 0.8) return 'high';
  if (utilizationRatio > 0.6) return 'medium';
  return 'low';
};