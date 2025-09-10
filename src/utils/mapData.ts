export interface TrafficPrediction {
  route: string;
  congestion: string;
  estimatedDelay: string;
  confidence: number;
}

export interface RouteRecommendation {
  train: string;
  recommendation: string;
  priority: string;
  timeSaved: string;
  confidence: number;
  reasoning: string;
}

export const generateTrafficPredictions = (): TrafficPrediction[] => {
  const routes = [
    'Delhi-Mumbai', 'Mumbai-Chennai', 'Kolkata-Delhi', 'Bangalore-Hyderabad',
    'Chennai-Bangalore', 'Pune-Mumbai', 'Ahmedabad-Jaipur', 'Delhi-Nagpur'
  ];

  const congestionLevels = ['High', 'Medium', 'Low'];
  
  return routes.map((route, index) => ({
    route,
    congestion: congestionLevels[Math.floor(Math.random() * congestionLevels.length)],
    estimatedDelay: `${Math.floor(Math.random() * 30) + 5} min`,
    confidence: Math.floor(Math.random() * 20) + 80
  }));
};

export const generateRouteRecommendations = (): RouteRecommendation[] => {
  const trains = [
    'Express 12001', 'SF 12345', 'Rajdhani 12951', 'Shatabdi 12002',
    'Express 12615', 'SF 12650', 'Express 12723', 'Intercity 12345'
  ];

  const recommendations = [
    'Switch to alternate route via Nagpur bypass to avoid congestion',
    'Delay departure by 10 minutes for optimal platform coordination',
    'Increase speed on clear section to recover lost time',
    'Hold at junction for freight train clearance',
    'Reroute through secondary corridor for faster transit',
    'Coordinate with local trains for platform sharing',
    'Activate priority signaling for express service',
    'Use maintenance track for next 15km to avoid delays'
  ];

  const priorities = ['High', 'Medium', 'Low'];
  const reasonings = [
    'Heavy traffic detected on primary route',
    'Signal timing optimization opportunity',
    'Platform availability window identified',
    'Weather conditions favor alternate route',
    'Freight coordination required',
    'Passenger safety priority',
    'Maintenance window approaching',
    'System efficiency improvement'
  ];

  return trains.slice(0, 6).map((train, index) => ({
    train,
    recommendation: recommendations[Math.floor(Math.random() * recommendations.length)],
    priority: priorities[Math.floor(Math.random() * priorities.length)],
    timeSaved: `${Math.floor(Math.random() * 25) + 5} min`,
    confidence: Math.floor(Math.random() * 15) + 85,
    reasoning: reasonings[Math.floor(Math.random() * reasonings.length)]
  }));
};

export interface NetworkNode {
  id: string;
  name: string;
  x: number;
  y: number;
  type: 'station' | 'junction' | 'signal' | 'yard';
  capacity: number;
  currentOccupancy: number;
  status: 'operational' | 'maintenance' | 'congested' | 'blocked';
}

export interface NetworkEdge {
  id: string;
  from: string;
  to: string;
  distance: number;
  maxSpeed: number;
  currentSpeed: number;
  trackType: 'single' | 'double' | 'multiple';
  electrified: boolean;
  trafficDensity: 'low' | 'medium' | 'high';
  maintenanceStatus: 'good' | 'fair' | 'poor';
}

export const generateNetworkTopology = () => {
  const nodes: NetworkNode[] = [
    { id: 'DEL', name: 'Delhi', x: 30, y: 20, type: 'station', capacity: 12, currentOccupancy: 8, status: 'operational' },
    { id: 'MUM', name: 'Mumbai', x: 15, y: 60, type: 'station', capacity: 16, currentOccupancy: 12, status: 'congested' },
    { id: 'KOL', name: 'Kolkata', x: 70, y: 30, type: 'station', capacity: 14, currentOccupancy: 6, status: 'operational' },
    { id: 'CHE', name: 'Chennai', x: 50, y: 85, type: 'station', capacity: 10, currentOccupancy: 7, status: 'operational' },
    { id: 'BAN', name: 'Bangalore', x: 45, y: 75, type: 'station', capacity: 8, currentOccupancy: 5, status: 'operational' },
    { id: 'HYD', name: 'Hyderabad', x: 40, y: 55, type: 'junction', capacity: 6, currentOccupancy: 4, status: 'operational' },
    { id: 'PUN', name: 'Pune', x: 25, y: 65, type: 'station', capacity: 6, currentOccupancy: 3, status: 'operational' },
    { id: 'JAI', name: 'Jaipur', x: 25, y: 30, type: 'station', capacity: 5, currentOccupancy: 2, status: 'operational' },
    { id: 'AHM', name: 'Ahmedabad', x: 18, y: 45, type: 'station', capacity: 7, currentOccupancy: 4, status: 'operational' },
    { id: 'NAG', name: 'Nagpur', x: 42, y: 42, type: 'junction', capacity: 5, currentOccupancy: 3, status: 'maintenance' }
  ];

  const edges: NetworkEdge[] = [
    { id: 'DEL-MUM', from: 'DEL', to: 'MUM', distance: 1384, maxSpeed: 130, currentSpeed: 95, trackType: 'double', electrified: true, trafficDensity: 'high', maintenanceStatus: 'good' },
    { id: 'DEL-KOL', from: 'DEL', to: 'KOL', distance: 1472, maxSpeed: 110, currentSpeed: 85, trackType: 'double', electrified: true, trafficDensity: 'medium', maintenanceStatus: 'fair' },
    { id: 'MUM-CHE', from: 'MUM', to: 'CHE', distance: 1279, maxSpeed: 120, currentSpeed: 100, trackType: 'double', electrified: true, trafficDensity: 'high', maintenanceStatus: 'good' },
    { id: 'BAN-HYD', from: 'BAN', to: 'HYD', distance: 569, maxSpeed: 110, currentSpeed: 90, trackType: 'single', electrified: true, trafficDensity: 'medium', maintenanceStatus: 'good' },
    { id: 'MUM-PUN', from: 'MUM', to: 'PUN', distance: 149, maxSpeed: 100, currentSpeed: 85, trackType: 'double', electrified: true, trafficDensity: 'high', maintenanceStatus: 'good' },
    { id: 'DEL-JAI', from: 'DEL', to: 'JAI', distance: 308, maxSpeed: 120, currentSpeed: 100, trackType: 'double', electrified: true, trafficDensity: 'medium', maintenanceStatus: 'good' },
    { id: 'AHM-MUM', from: 'AHM', to: 'MUM', distance: 492, maxSpeed: 110, currentSpeed: 90, trackType: 'double', electrified: true, trafficDensity: 'medium', maintenanceStatus: 'good' }
  ];

  return { nodes, edges };
};

export const calculateRouteMetrics = (trains: any[]) => {
  const totalTrains = trains.length;
  const onTimeTrains = trains.filter(t => t.status === 'On Time').length;
  const delayedTrains = trains.filter(t => t.status === 'Delayed').length;
  const enRouteTrains = trains.filter(t => t.status === 'En Route').length;
  
  return {
    totalTrains,
    onTimePercentage: Math.round((onTimeTrains / totalTrains) * 100),
    delayedPercentage: Math.round((delayedTrains / totalTrains) * 100),
    enRoutePercentage: Math.round((enRouteTrains / totalTrains) * 100),
    averageDelay: Math.floor(Math.random() * 20) + 5,
    systemEfficiency: Math.floor(Math.random() * 10) + 88
  };
};

export const generateLiveTrains = () => {
  const trains = [
    { id: 'T001', name: 'Rajdhani 12951', route: 'Delhi-Mumbai', x: 25, y: 35, speed: 120, eta: '14:30', priority: 'High', progress: 65, nextStation: 'Jhansi', status: 'On Time' },
    { id: 'T002', name: 'Shatabdi 12002', route: 'Mumbai-Pune', x: 18, y: 58, speed: 95, eta: '16:45', priority: 'Medium', progress: 40, nextStation: 'Lonavala', status: 'Delayed' },
    { id: 'T003', name: 'Chennai Express 12615', route: 'Chennai-Bangalore', x: 47, y: 80, speed: 85, eta: '18:20', priority: 'Low', progress: 75, nextStation: 'Hosur', status: 'En Route' },
    { id: 'T004', name: 'Howrah Mail 12809', route: 'Kolkata-Delhi', x: 55, y: 25, speed: 110, eta: '12:15', priority: 'High', progress: 55, nextStation: 'Kanpur', status: 'On Time' },
    { id: 'T005', name: 'Bangalore Express 12639', route: 'Hyderabad-Bangalore', x: 42, y: 65, speed: 70, eta: '19:30', priority: 'Low', progress: 30, nextStation: 'Kurnool', status: 'Delayed' },
    { id: 'T006', name: 'Gujarat Express 12901', route: 'Ahmedabad-Mumbai', x: 20, y: 50, speed: 105, eta: '15:45', priority: 'Medium', progress: 60, nextStation: 'Surat', status: 'On Time' },
    { id: 'T007', name: 'Pink City Express 12956', route: 'Delhi-Jaipur', x: 27, y: 25, speed: 90, eta: '11:30', priority: 'Medium', progress: 80, nextStation: 'Alwar', status: 'En Route' },
    { id: 'T008', name: 'Deccan Queen 12123', route: 'Mumbai-Pune', x: 22, y: 62, speed: 80, eta: '17:15', priority: 'High', progress: 45, nextStation: 'Karjat', status: 'On Time' },
    { id: 'T009', name: 'Coromandel Express 12841', route: 'Chennai-Kolkata', x: 60, y: 55, speed: 115, eta: '20:45', priority: 'High', progress: 35, nextStation: 'Visakhapatnam', status: 'En Route' },
    { id: 'T010', name: 'Duronto Express 12273', route: 'Delhi-Hyderabad', x: 35, y: 40, speed: 125, eta: '22:30', priority: 'High', progress: 50, nextStation: 'Bhopal', status: 'On Time' },
    { id: 'T011', name: 'Freight 16789', route: 'Mumbai-Delhi', x: 28, y: 45, speed: 60, eta: '08:00+1', priority: 'Low', progress: 25, nextStation: 'Vadodara', status: 'En Route' },
    { id: 'T012', name: 'Superfast 12650', route: 'Chennai-Delhi', x: 45, y: 50, speed: 100, eta: '06:30+1', priority: 'Medium', progress: 40, nextStation: 'Nagpur', status: 'Delayed' }
  ];
  
  return trains;
};