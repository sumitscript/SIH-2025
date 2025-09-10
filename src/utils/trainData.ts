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
  aiRecommendation?: string;
}

const trainTypes = ['Express', 'Superfast', 'Passenger', 'Freight', 'Intercity', 'Shatabdi', 'Rajdhani'];
const stations = ['Delhi', 'Mumbai', 'Kolkata', 'Chennai', 'Bangalore', 'Hyderabad', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow'];
const statuses = ['On Time', 'Delayed', 'En Route', 'Boarding', 'Maintenance'];
const priorities = ['High', 'Medium', 'Low'];

const aiRecommendations = [
  'Switch to alternate route via Nagpur to avoid congestion',
  'Delay departure by 15 minutes to optimize platform utilization',
  'Priority boarding at next station to reduce dwell time',
  'Coordinate with freight traffic for optimal track sharing',
  'Reroute through bypass to maintain schedule',
  'Adjust speed profile to recover 8 minutes',
  'Hold at current station for 5 minutes to resolve conflict',
  'Switch to maintenance track for next 20km segment',
  'Implement dynamic signal control for faster transit',
  'Coordinate with emergency services for medical priority',
  'Activate weather protocol for reduced visibility conditions',
  'Optimize platform allocation for passenger safety',
  'Enable freight coordination mode for mixed traffic',
  'Implement predictive braking for energy efficiency',
  'Activate crowd control measures at destination station'
];

const delayReasons = [
  'Signal failure at junction - estimated 20 min delay',
  'Track maintenance ahead - 15 min delay expected',
  'Weather conditions causing speed restrictions',
  'Congestion at major junction - 12 min delay',
  'Technical issue resolved - minimal impact',
  'Late departure from originating station',
  'Heavy freight traffic on shared corridor'
];

export const generateMockTrains = (count: number): Train[] => {
  const trains: Train[] = [];
  
  for (let i = 0; i < count; i++) {
    const type = trainTypes[Math.floor(Math.random() * trainTypes.length)];
    const from = stations[Math.floor(Math.random() * stations.length)];
    let to = stations[Math.floor(Math.random() * stations.length)];
    while (to === from) {
      to = stations[Math.floor(Math.random() * stations.length)];
    }
    
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const priority = priorities[Math.floor(Math.random() * priorities.length)];
    
    const train: Train = {
      id: `T${1000 + i}`,
      name: `${type} ${1200 + i}`,
      type,
      from,
      to,
      departure: `${Math.floor(Math.random() * 24).toString().padStart(2, '0')}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
      arrival: `${Math.floor(Math.random() * 24).toString().padStart(2, '0')}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
      status,
      priority,
      currentLocation: stations[Math.floor(Math.random() * stations.length)]
    };

    // Add delay information for delayed trains
    if (status === 'Delayed') {
      train.delay = delayReasons[Math.floor(Math.random() * delayReasons.length)];
    }

    // Add AI recommendations for some trains
    if (Math.random() > 0.6) {
      train.aiRecommendation = aiRecommendations[Math.floor(Math.random() * aiRecommendations.length)];
    }

    trains.push(train);
  }
  
  return trains;
};

export const calculateSystemMetrics = (trains: Train[]) => {
  const activeTrains = trains.length;
  const onTimeTrains = trains.filter(t => t.status === 'On Time').length;
  const onTimePercentage = Math.round((onTimeTrains / activeTrains) * 100);
  const activeAlerts = Math.floor(Math.random() * 15) + 5;
  const efficiency = Math.round(85 + Math.random() * 10);

  return {
    activeTrains,
    onTimePercentage,
    activeAlerts,
    efficiency
  };
};