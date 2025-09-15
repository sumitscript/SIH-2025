import { Train } from './dataTransform';
import { OptimizationScenario } from './optimization';

// Define interfaces for ML model input and output
export interface TrainFeatures {
  trainId: string;
  trainType: string;
  delayMinutes: number;
  priority: string;
  direction: 'up' | 'down';
  isExpressTrain: boolean;
  currentLocation: string;
  nextStation?: string;
  weatherCondition: string;
  trackCongestion: number; // 0-100%
  platformAvailability: number; // 0-100%
  timeOfDay: number; // 0-23 hours
}

export interface SectionFeatures {
  sectionId: string;
  currentTrafficDensity: number; // 0-100%
  weatherCondition: string;
  maintenanceStatus: 'normal' | 'scheduled' | 'urgent';
  signalStatus: 'normal' | 'degraded' | 'faulty';
  trackCondition: 'normal' | 'caution' | 'alert';
  expectedTraffic: number; // Number of trains expected in next hour
  historicalDelays: number; // Average delay in minutes for this section
  priorityTrainsCount: number;
  freightTrainsCount: number;
}

export interface RecommendationOutput {
  id: string;
  type: 'routing' | 'scheduling' | 'priority' | 'maintenance' | 'emergency';
  title: string;
  description: string;
  confidence: number;
  impact: 'Critical' | 'High' | 'Medium' | 'Low';
  timeSaving: string;
  affectedTrains: string[];
  implementation: string;
  reasoning: string;
  status: 'pending' | 'accepted' | 'rejected' | 'implemented';
}

// Mock weather and track conditions for simulation
const weatherConditions = ['Clear', 'Rain', 'Fog', 'Storm', 'Snow'];
const trackConditions = ['normal', 'caution', 'alert'];
const signalStatuses = ['normal', 'degraded', 'faulty'];
const maintenanceStatuses = ['normal', 'scheduled', 'urgent'];

// Generate mock section features for simulation
export const generateSectionFeatures = (sectionId: string): SectionFeatures => {
  return {
    sectionId,
    currentTrafficDensity: Math.random() * 100,
    weatherCondition: weatherConditions[Math.floor(Math.random() * weatherConditions.length)],
    maintenanceStatus: maintenanceStatuses[Math.floor(Math.random() * maintenanceStatuses.length)] as 'normal' | 'scheduled' | 'urgent',
    signalStatus: signalStatuses[Math.floor(Math.random() * signalStatuses.length)] as 'normal' | 'degraded' | 'faulty',
    trackCondition: trackConditions[Math.floor(Math.random() * trackConditions.length)] as 'normal' | 'caution' | 'alert',
    expectedTraffic: Math.floor(Math.random() * 20) + 5,
    historicalDelays: Math.floor(Math.random() * 30),
    priorityTrainsCount: Math.floor(Math.random() * 5) + 1,
    freightTrainsCount: Math.floor(Math.random() * 8)
  };
};

// Extract features from train data
export const extractTrainFeatures = (train: Train): TrainFeatures => {
  return {
    trainId: train.id,
    trainType: train.type,
    delayMinutes: train.delayMinutes || 0,
    priority: train.priority,
    direction: train.direction || 'up',
    isExpressTrain: ['Express', 'Superfast', 'Rajdhani', 'Shatabdi'].includes(train.type),
    currentLocation: train.currentLocation,
    nextStation: train.nextStation,
    weatherCondition: weatherConditions[Math.floor(Math.random() * weatherConditions.length)],
    trackCongestion: Math.random() * 100,
    platformAvailability: Math.random() * 100,
    timeOfDay: new Date().getHours()
  };
};

// Decision tree-based recommendation logic
const decisionTreeRecommendation = (trainFeatures: TrainFeatures, sectionFeatures: SectionFeatures): RecommendationOutput | null => {
  // Emergency recommendations (highest priority)
  if (sectionFeatures.trackCondition === 'alert' || sectionFeatures.signalStatus === 'faulty') {
    return {
      id: `rec-${Math.random().toString(36).substr(2, 9)}`,
      type: 'emergency',
      title: `SAFETY ALERT: ${sectionFeatures.trackCondition === 'alert' ? 'Track Condition' : 'Signal Failure'}`,
      description: `URGENT: ${sectionFeatures.trackCondition === 'alert' ? 'Critical track condition detected' : 'Signal failure detected'}. Implement immediate safety protocols.`,
      confidence: 99,
      impact: 'Critical',
      timeSaving: 'Safety Priority',
      affectedTrains: [trainFeatures.trainId],
      implementation: `1. Reduce speed to 30km/h\n2. Notify all trains in section\n3. Dispatch maintenance team\n4. Prepare alternative routing\n5. Update passenger information systems`,
      reasoning: `Safety sensors detected ${sectionFeatures.trackCondition === 'alert' ? 'critical track condition' : 'signal failure'} in section ${sectionFeatures.sectionId}. Safety protocols mandate immediate action.`,
      status: 'pending'
    };
  }

  // Weather-related recommendations
  if (sectionFeatures.weatherCondition === 'Storm' || sectionFeatures.weatherCondition === 'Snow' || sectionFeatures.weatherCondition === 'Fog') {
    return {
      id: `rec-${Math.random().toString(36).substr(2, 9)}`,
      type: 'priority',
      title: `Weather Protocol - ${sectionFeatures.sectionId}`,
      description: `${sectionFeatures.weatherCondition} detected: Implement reduced speed protocol and activate enhanced safety measures.`,
      confidence: 95,
      impact: 'High',
      timeSaving: 'Safety Priority',
      affectedTrains: [trainFeatures.trainId],
      implementation: `1. Reduce speed to 50km/h\n2. Activate automatic weather protocols\n3. Update passenger ETAs\n4. Deploy additional track monitors\n5. Coordinate with weather services`,
      reasoning: `Weather sensors report: ${sectionFeatures.weatherCondition} conditions in section ${sectionFeatures.sectionId}. Safety protocols mandate speed reduction.`,
      status: 'pending'
    };
  }

  // High delay recommendations
  if (trainFeatures.delayMinutes > 30 && trainFeatures.isExpressTrain) {
    return {
      id: `rec-${Math.random().toString(36).substr(2, 9)}`,
      type: 'routing',
      title: `Delay Recovery: ${trainFeatures.trainId}`,
      description: `Express train ${trainFeatures.trainId} delayed by ${trainFeatures.delayMinutes} minutes. Implement priority routing to recover time.`,
      confidence: 90,
      impact: 'High',
      timeSaving: `${Math.floor(trainFeatures.delayMinutes * 0.6)} minutes`,
      affectedTrains: [trainFeatures.trainId],
      implementation: `1. Grant priority at all signals\n2. Hold non-priority trains at suitable locations\n3. Optimize speed profile\n4. Update passenger information\n5. Coordinate with destination station`,
      reasoning: `High-priority express train with significant delay. Network conditions allow for priority routing to recover approximately 60% of delay time.`,
      status: 'pending'
    };
  }

  // Congestion management
  if (sectionFeatures.currentTrafficDensity > 80) {
    return {
      id: `rec-${Math.random().toString(36).substr(2, 9)}`,
      type: 'scheduling',
      title: `Congestion Management: ${sectionFeatures.sectionId}`,
      description: `Section at ${Math.round(sectionFeatures.currentTrafficDensity)}% capacity. Implement traffic flow optimization to prevent cascading delays.`,
      confidence: 85,
      impact: 'Medium',
      timeSaving: '15-20 minutes',
      affectedTrains: [trainFeatures.trainId],
      implementation: `1. Adjust train spacing\n2. Optimize platform allocation\n3. Implement dynamic speed control\n4. Coordinate with adjacent sections\n5. Prioritize express and passenger services`,
      reasoning: `High traffic density detected in section ${sectionFeatures.sectionId}. Proactive flow management can prevent bottlenecks and cascading delays.`,
      status: 'pending'
    };
  }

  // Maintenance recommendations
  if (sectionFeatures.maintenanceStatus === 'urgent') {
    return {
      id: `rec-${Math.random().toString(36).substr(2, 9)}`,
      type: 'maintenance',
      title: `Maintenance Alert: ${sectionFeatures.sectionId}`,
      description: `Predictive maintenance required in section ${sectionFeatures.sectionId}. Schedule maintenance window to prevent failures.`,
      confidence: 92,
      impact: 'Medium',
      timeSaving: 'Prevents 30+ min delays',
      affectedTrains: [trainFeatures.trainId],
      implementation: `1. Schedule 60-minute maintenance window\n2. Reroute trains via alternate sections\n3. Deploy maintenance team\n4. Update train schedules\n5. Notify affected stations`,
      reasoning: `Predictive maintenance algorithms indicate urgent maintenance required in section ${sectionFeatures.sectionId}. Preventive action will avoid major disruptions.`,
      status: 'pending'
    };
  }

  // No specific recommendation needed
  return null;
};

// Main recommendation engine function
export const generateRecommendations = (trains: Train[], scenarios: OptimizationScenario[] = []): RecommendationOutput[] => {
  const recommendations: RecommendationOutput[] = [];
  
  // Generate section features for different sections
  const sections = ['SEC001', 'SEC002', 'SEC003', 'SEC004', 'SEC005'];
  const sectionFeatures = sections.map(secId => generateSectionFeatures(secId));
  
  // Process each train to generate recommendations
  trains.forEach(train => {
    // Skip trains with no issues
    if (!train.delayMinutes || train.delayMinutes < 5) return;
    
    // Extract features
    const trainFeatures = extractTrainFeatures(train);
    
    // Randomly select a section for this train
    const sectionFeature = sectionFeatures[Math.floor(Math.random() * sectionFeatures.length)];
    
    // Generate recommendation using decision tree
    const recommendation = decisionTreeRecommendation(trainFeatures, sectionFeature);
    if (recommendation) {
      recommendations.push(recommendation);
    }
  });
  
  // Add scenario-based recommendations
  scenarios.forEach(scenario => {
    if (Math.random() > 0.5) { // 50% chance to generate recommendation for a scenario
      recommendations.push({
        id: `rec-${Math.random().toString(36).substr(2, 9)}`,
        type: scenario.severity === 'Critical' ? 'emergency' : 
              scenario.severity === 'High' ? 'routing' : 
              'scheduling',
        title: scenario.title,
        description: scenario.description,
        confidence: 80 + Math.floor(Math.random() * 15),
        impact: scenario.severity as 'Critical' | 'High' | 'Medium' | 'Low',
        timeSaving: scenario.estimatedDelay,
        affectedTrains: Array(scenario.affectedTrains).fill(0).map((_, i) => `Train-${1000 + i}`),
        implementation: scenario.expectedImprovements.join('\n'),
        reasoning: scenario.detailedDescription,
        status: 'pending'
      });
    }
  });
  
  // Sort recommendations by impact and confidence
  return recommendations.sort((a, b) => {
    const impactOrder = { 'Critical': 0, 'High': 1, 'Medium': 2, 'Low': 3 };
    const impactDiff = impactOrder[a.impact] - impactOrder[b.impact];
    if (impactDiff !== 0) return impactDiff;
    return b.confidence - a.confidence;
  }).slice(0, 8); // Limit to 8 recommendations
};