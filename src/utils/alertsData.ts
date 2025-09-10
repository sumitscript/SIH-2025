export interface Alert {
  id: string;
  title: string;
  description: string;
  detailedDescription?: string;
  severity: string;
  timestamp: string;
  location: string;
  affectedTrains?: string[];
  estimatedImpact?: string;
  aiRecommendation?: string;
  aiActions?: string[];
}

const alertTitles = [
  'Signal System Malfunction',
  'Track Maintenance Required',
  'Weather Advisory Active',
  'Platform Overcrowding Alert',
  'Freight Train Delay Impact',
  'Power Supply Interruption',
  'Speed Restriction Activated',
  'Station Equipment Failure',
  'Passenger Medical Emergency',
  'Security Alert - Unauthorized Access',
  'Bridge Inspection Scheduled',
  'Overhead Wire Damage',
  'Level Crossing Gate Fault',
  'Communication System Down',
  'Train Door Malfunction'
];

const locations = [
  'Delhi Junction KM-23.5',
  'Mumbai Central Yard',
  'Kolkata Station Platform 12',
  'Chennai Express Terminal',
  'Bangalore City Junction',
  'Hyderabad Deccan Yard',
  'Pune Junction Bridge-7',
  'Ahmedabad Station Complex',
  'Jaipur Central KM-145',
  'Lucknow North Yard',
  'Nagpur Junction KM-67',
  'Bhopal Station Approach',
  'Indore City Platform 3',
  'Kanpur Central Yard',
  'Allahabad Junction KM-89'
];

const severityLevels = ['Critical', 'High', 'Medium', 'Low'];

const aiRecommendationTemplates = [
  'Implement immediate rerouting via alternate corridor',
  'Activate emergency protocols and notify all affected trains',
  'Deploy maintenance crew within 30 minutes',
  'Coordinate with station management for passenger safety',
  'Adjust signal timing to minimize impact on adjacent sections',
  'Initiate backup power systems and monitor consumption',
  'Schedule emergency track inspection before next service',
  'Activate passenger information systems with real-time updates'
];

const aiActionsTemplates = [
  ['Reroute affected trains via bypass', 'Notify passengers of delays', 'Deploy additional staff'],
  ['Activate backup systems', 'Monitor power consumption', 'Contact utility provider'],
  ['Restrict train speeds to 40 km/h', 'Increase signal spacing', 'Deploy track inspectors'],
  ['Open additional platforms', 'Increase PA announcements', 'Deploy crowd control staff'],
  ['Coordinate with freight operators', 'Adjust passenger schedules', 'Optimize track sharing']
];

export const generateAlerts = (count: number): Alert[] => {
  const alerts: Alert[] = [];
  
  for (let i = 0; i < count; i++) {
    const severity = severityLevels[Math.floor(Math.random() * severityLevels.length)];
    const title = alertTitles[Math.floor(Math.random() * alertTitles.length)];
    const location = locations[Math.floor(Math.random() * locations.length)];
    
    const currentTime = new Date();
    const alertTime = new Date(currentTime.getTime() - Math.random() * 24 * 60 * 60 * 1000);
    const timestamp = alertTime.toLocaleString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const alert: Alert = {
      id: `ALT${1000 + i}`,
      title,
      description: generateAlertDescription(title, severity),
      detailedDescription: generateDetailedDescription(title, location),
      severity,
      timestamp,
      location
    };

    // Add affected trains for higher severity alerts
    if (severity === 'Critical' || severity === 'High') {
      alert.affectedTrains = generateAffectedTrains();
      alert.estimatedImpact = generateEstimatedImpact(severity);
    }

    // Add AI recommendations for most alerts
    if (Math.random() > 0.3) {
      alert.aiRecommendation = aiRecommendationTemplates[Math.floor(Math.random() * aiRecommendationTemplates.length)];
      alert.aiActions = aiActionsTemplates[Math.floor(Math.random() * aiActionsTemplates.length)];
    }

    alerts.push(alert);
  }
  
  return alerts.sort((a, b) => {
    const severityOrder = { 'Critical': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
    return severityOrder[b.severity as keyof typeof severityOrder] - severityOrder[a.severity as keyof typeof severityOrder];
  });
};

const generateAlertDescription = (title: string, severity: string): string => {
  const descriptions: { [key: string]: string[] } = {
    'Signal System Malfunction': [
      'Automatic signaling system experiencing intermittent failures',
      'Manual signal operation required until system restoration',
      'Signal timing delays causing train movement restrictions'
    ],
    'Track Maintenance Required': [
      'Routine track inspection revealed wear beyond acceptable limits',
      'Emergency track repair needed to maintain safety standards',
      'Scheduled maintenance window extended due to additional work required'
    ],
    'Weather Advisory Active': [
      'Heavy rainfall forecast affecting track conditions and visibility',
      'Strong winds may impact overhead electrical systems',
      'Dense fog reducing visibility below operational minimums'
    ],
    'Platform Overcrowding Alert': [
      'Passenger volume exceeding platform capacity during peak hours',
      'Multiple train delays causing passenger accumulation',
      'Special event causing unusual passenger traffic patterns'
    ]
  };

  const titleDescriptions = descriptions[title];
  if (titleDescriptions) {
    return titleDescriptions[Math.floor(Math.random() * titleDescriptions.length)];
  }

  return `${severity} priority alert requiring immediate attention from operations team`;
};

const generateDetailedDescription = (title: string, location: string): string => {
  const templates = [
    `Incident reported at ${location}. Operations team dispatched for immediate assessment and resolution.`,
    `System monitoring detected anomaly at ${location}. Automated safety protocols activated.`,
    `Field maintenance crew identified issue at ${location}. Coordination with traffic control underway.`,
    `Real-time sensors triggered alert condition at ${location}. Manual verification in progress.`
  ];

  return templates[Math.floor(Math.random() * templates.length)];
};

const generateAffectedTrains = (): string[] => {
  const trainPrefixes = ['Express', 'SF', 'Pass', 'MEMU', 'EMU'];
  const count = Math.floor(Math.random() * 8) + 2;
  const trains = [];

  for (let i = 0; i < count; i++) {
    const prefix = trainPrefixes[Math.floor(Math.random() * trainPrefixes.length)];
    const number = 12000 + Math.floor(Math.random() * 8000);
    trains.push(`${prefix} ${number}`);
  }

  return trains;
};

const generateEstimatedImpact = (severity: string): string => {
  const impacts = {
    'Critical': [
      'Service disruption expected for 2-4 hours affecting 15+ trains',
      'Major corridor blockage requiring extensive rerouting operations',
      'Emergency response protocols activated with potential service cancellations'
    ],
    'High': [
      'Delays of 30-60 minutes expected for multiple train services',
      'Significant impact on schedule adherence requiring passenger notifications',
      'Alternative arrangements may be needed for affected passengers'
    ],
    'Medium': [
      'Minor delays of 10-20 minutes possible for select trains',
      'Localized impact with manageable schedule adjustments',
      'Normal operations expected to resume within 2 hours'
    ],
    'Low': [
      'Minimal impact on current operations',
      'Preventive measures in place to avoid service disruption',
      'Monitoring situation with backup plans ready'
    ]
  };

  const severityImpacts = impacts[severity as keyof typeof impacts];
  return severityImpacts[Math.floor(Math.random() * severityImpacts.length)];
};