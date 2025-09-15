export interface OptimizationScenario {
  id: string;
  title: string;
  description: string;
  detailedDescription: string;
  severity: string;
  affectedTrains: number;
  estimatedDelay: string;
  constraints: string[];
  expectedImprovements: string[];
}

export const generateOptimizationScenarios = (): OptimizationScenario[] => {
  return [
    {
      id: 'peak-hour-congestion',
      title: 'Peak Hour Congestion Management',
      description: 'High traffic density during morning rush hour causing cascading delays',
      detailedDescription: 'Multiple express trains converging on Delhi-Mumbai corridor during 8-10 AM slot creating bottleneck at major junctions. Current scheduling allows insufficient buffer time between trains.',
      severity: 'High',
      affectedTrains: 23,
      estimatedDelay: '15-25 min',
      constraints: [
        'Platform availability at major stations',
        'Freight train schedules cannot be modified',
        'Passenger safety regulations for minimum headway',
        'Track maintenance windows between 2-4 AM'
      ],
      expectedImprovements: [
        'Reduce average delay by 18 minutes',
        'Improve passenger satisfaction by 25%',
        'Optimize track utilization by 15%',
        'Decrease fuel consumption by 8%'
      ]
    },
    {
      id: 'weather-disruption',
      title: 'Weather-Related Route Optimization',
      description: 'Heavy rainfall affecting eastern corridor requiring dynamic rerouting',
      detailedDescription: 'Monsoon conditions have reduced visibility and track conditions on Kolkata-Chennai route. Speed restrictions and potential track flooding require immediate intervention.',
      severity: 'Critical',
      affectedTrains: 18,
      estimatedDelay: '30-45 min',
      constraints: [
        'Weather safety protocols must be followed',
        'Limited alternate route capacity',
        'Emergency services accessibility',
        'Real-time weather monitoring integration'
      ],
      expectedImprovements: [
        'Ensure passenger safety compliance',
        'Minimize weather-related delays by 40%',
        'Maintain service continuity',
        'Reduce cancellation risk by 60%'
      ]
    },
    {
      id: 'freight-coordination',
      title: 'Passenger-Freight Traffic Optimization',
      description: 'Coordinating passenger and freight trains on shared corridors for optimal throughput',
      detailedDescription: 'Mixed traffic on Mumbai-Pune route with freight trains causing delays to passenger services. Need dynamic priority-based scheduling system.',
      severity: 'Medium',
      affectedTrains: 31,
      estimatedDelay: '8-12 min',
      constraints: [
        'Freight delivery commitments',
        'Passenger service priority during peak hours',
        'Loading/unloading time requirements',
        'Track gradient limitations for freight'
      ],
      expectedImprovements: [
        'Increase passenger train priority',
        'Improve freight delivery reliability',
        'Optimize shared infrastructure usage',
        'Reduce operational conflicts by 45%'
      ]
    },
    {
      id: 'maintenance-scheduling',
      title: 'Predictive Maintenance Integration',
      description: 'Optimizing schedules around predicted maintenance requirements',
      detailedDescription: 'AI predictive models indicate potential track degradation on high-speed corridor. Proactive scheduling needed to accommodate maintenance without major disruptions.',
      severity: 'Medium',
      affectedTrains: 12,
      estimatedDelay: '5-10 min',
      constraints: [
        'Maintenance crew availability',
        'Safety requirements for track work',
        'Equipment transportation logistics',
        'Weather conditions for outdoor work'
      ],
      expectedImprovements: [
        'Prevent major breakdown incidents',
        'Reduce emergency maintenance by 70%',
        'Extend infrastructure lifespan',
        'Minimize passenger inconvenience'
      ]
    },
    {
      id: 'emergency-response',
      title: 'Emergency Response Optimization',
      description: 'Dynamic rerouting for emergency vehicle access and incident management',
      detailedDescription: 'Medical emergency on board requires immediate priority routing to nearest hospital-accessible station with ambulance coordination.',
      severity: 'Critical',
      affectedTrains: 8,
      estimatedDelay: '20-30 min',
      constraints: [
        'Emergency service response time',
        'Hospital accessibility from stations',
        'Medical equipment availability on trains',
        'Passenger evacuation procedures'
      ],
      expectedImprovements: [
        'Minimize medical response time',
        'Ensure passenger safety protocols',
        'Coordinate with emergency services',
        'Maintain system stability during crisis'
      ]
    }
  ];
};

export const runOptimization = (_scenario: OptimizationScenario): Promise<any> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const results = {
        delayReduction: `${15 + Math.floor(Math.random() * 20)} min`,
        timeSaved: `${45 + Math.floor(Math.random() * 30)} min`,
        efficiencyGain: `${8 + Math.floor(Math.random() * 15)}%`,
        recommendations: [
          {
            action: 'Implement dynamic signal control',
            description: 'Adjust signal timing based on real-time train positions',
            priority: 'High'
          },
          {
            action: 'Activate alternate route protocols',
            description: 'Reroute select trains through less congested corridors',
            priority: 'Medium'
          },
          {
            action: 'Coordinate with freight operators',
            description: 'Temporary freight schedule adjustment for passenger priority',
            priority: 'High'
          },
          {
            action: 'Deploy additional platform staff',
            description: 'Reduce dwell time at major stations during peak hours',
            priority: 'Medium'
          }
        ],
        impacts: [
          { metric: 'On-time Performance', change: '+12.8' },
          { metric: 'Average Delay', change: '-8.5' },
          { metric: 'Passenger Satisfaction', change: '+15.2' },
          { metric: 'Fuel Efficiency', change: '+6.3' },
          { metric: 'Track Utilization', change: '+9.7' }
        ]
      };
      
      resolve(results);
    }, 2000 + Math.random() * 1000);
  });
};