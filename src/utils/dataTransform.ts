import { ApiTrain, ApiTrainDetail, ApiStation } from '../services/apiService';
import { getPlatformForStation, getNextStation as getTimetableNextStation } from './timetableData';

export interface Train {
  id: string;
  name: string;
  type: string;
  from: string;
  to: string;
  departure: string;
  arrival: string;
  status: string;
  priority: string;
  currentLocation: string;
  delay?: string;
  delayMinutes?: number;
  direction: 'up' | 'down';
  lastUpdated?: string;
  nextStation?: string;
  currentPlatform?: string;
  nextPlatform?: string;
  aiRecommendation?: string;
  expectedDelay?: string;
  speedRecommendation?: string;
  mlRecommendations?: Array<{
    type: string;
    message: string;
    confidence: number;
    priority: string;
  }>;
}

export interface Station {
  id: string;
  name: string;
  type: 'big' | 'small';
  state: string;
  description: string;
  distance: number;
}

const aiRecommendations = [
  'Optimize speed to recover delay time',
  'Coordinate with next station for platform allocation',
  'Monitor track conditions ahead',
  'Prepare for passenger boarding at next station',
  'Check signal clearance for optimal routing',
  'Maintain current speed for schedule adherence',
  'Prepare for freight coordination at junction',
  'Monitor weather conditions for safety',
];

export const transformApiTrainToTrain = (trainNo: string, apiTrain: ApiTrain): Train => {
  // Calculate delay in minutes
  const delayMinutes = parseInt(apiTrain.delayedTime.hours) * 60 + parseInt(apiTrain.delayedTime.minutes);

  // Determine status based on API status and delay
  let status = 'En Route';
  if (apiTrain.status === 'left') {
    status = delayMinutes > 15 ? 'Delayed' : 'On Time';
  } else if (apiTrain.status === 'arrived') {
    status = 'Arrived';
  }

  // Determine priority based on delay and train type
  let priority = 'Low';
  if (delayMinutes > 30 || apiTrain.type === 'Express') {
    priority = 'High';
  } else if (delayMinutes > 15 || apiTrain.type === 'Superfast') {
    priority = 'Medium';
  }

  // Extract route information from train name
  const nameParts = apiTrain.name.split('-');
  const from = nameParts[0]?.trim() || 'Unknown';
  const to = nameParts[1]?.trim() || 'Unknown';

  // Format time
  const statusTime = `${apiTrain.statusTime.hours}:${apiTrain.statusTime.minutes}`;

  // Calculate estimated arrival (simple estimation)
  const currentHour = parseInt(apiTrain.statusTime.hours);
  const currentMinute = parseInt(apiTrain.statusTime.minutes);
  const estimatedArrivalHour = (currentHour + 2 + Math.floor((currentMinute + delayMinutes) / 60)) % 24;
  const estimatedArrivalMinute = (currentMinute + delayMinutes) % 60;
  const arrival = `${estimatedArrivalHour.toString().padStart(2, '0')}:${estimatedArrivalMinute.toString().padStart(2, '0')}`;

  // Get platform information from timetable data
  const currentPlatform = getPlatformForStation(trainNo, apiTrain.station);
  const nextStationInfo = getTimetableNextStation(trainNo, apiTrain.station);

  const train: Train = {
    id: trainNo,
    name: apiTrain.name,
    type: apiTrain.type,
    from,
    to,
    departure: statusTime,
    arrival,
    status,
    priority,
    currentLocation: apiTrain.station,
    direction: apiTrain.direction,
    delayMinutes,
    lastUpdated: new Date().toISOString(),
    currentPlatform,
    nextStation: nextStationInfo?.station,
    nextPlatform: nextStationInfo?.platform,
  };

  // Add delay information if delayed
  if (delayMinutes > 0) {
    train.delay = `Delayed by ${Math.floor(delayMinutes / 60)}h ${delayMinutes % 60}m`;
  }

  // Reduce dummy AI recommendations - only add for significantly delayed trains
  if (delayMinutes > 30) {
    train.aiRecommendation = `Train ${trainNo} is significantly delayed. Consider priority routing and speed optimization.`;
  } else if (delayMinutes > 15 && apiTrain.type === 'Express') {
    train.aiRecommendation = `Express service delayed. Monitor passenger connections and platform availability.`;
  }

  return train;
};

export const transformApiStationToStation = (stationName: string, apiStation: ApiStation): Station => {
  return {
    id: stationName.toLowerCase().replace(/\s+/g, '-'),
    name: stationName,
    type: apiStation.type,
    state: apiStation.state,
    description: apiStation.description,
    distance: apiStation.distance,
  };
};

export const calculateSystemMetrics = (trains: Train[]) => {
  const activeTrains = trains.length;
  const onTimeTrains = trains.filter(t => t.status === 'On Time' || t.status === 'Arrived').length;
  const onTimePercentage = activeTrains > 0 ? Math.round((onTimeTrains / activeTrains) * 100) : 0;
  const delayedTrains = trains.filter(t => t.status === 'Delayed').length;
  const activeAlerts = delayedTrains + Math.floor(Math.random() * 5); // Some additional system alerts
  const efficiency = Math.max(60, Math.min(95, 100 - (delayedTrains / activeTrains) * 40));

  return {
    activeTrains,
    onTimePercentage,
    activeAlerts,
    efficiency: Math.round(efficiency),
  };
};

export const getNextStation = (trainDetail: ApiTrainDetail, currentStation: string): string => {
  const currentIndex = trainDetail.timetable.findIndex(
    stop => stop.station.toLowerCase() === currentStation.toLowerCase()
  );

  if (currentIndex >= 0 && currentIndex < trainDetail.timetable.length - 1) {
    return trainDetail.timetable[currentIndex + 1].station;
  }

  return 'Destination';
};