// Alert system for Konkan Railway operations
import { Train } from './dataTransform';
import { StationData } from './stationData';

export interface Alert {
  id: string;
  type: 'delay' | 'platform_conflict' | 'congestion' | 'incident' | 'weather' | 'maintenance';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  location: string;
  affectedTrains: string[];
  timestamp: string;
  estimatedResolution?: string;
  recommendations: string[];
}

export class KonkanAlertSystem {
  private stations: StationData[] = [];
  
  constructor(stationData: StationData[]) {
    this.stations = stationData;
  }

  generateAlerts(trains: Train[]): Alert[] {
    const alerts: Alert[] = [];
    
    // Delay-based alerts
    alerts.push(...this.generateDelayAlerts(trains));
    
    // Platform conflict alerts
    alerts.push(...this.generatePlatformConflictAlerts(trains));
    
    // Congestion alerts
    alerts.push(...this.generateCongestionAlerts(trains));
    
    // Incident simulation alerts
    alerts.push(...this.generateIncidentAlerts(trains));
    
    // Weather impact alerts
    alerts.push(...this.generateWeatherAlerts(trains));
    
    return alerts.sort((a, b) => {
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });
  }

  private generateDelayAlerts(trains: Train[]): Alert[] {
    const alerts: Alert[] = [];
    
    trains.forEach(train => {
      if (train.delayMinutes && train.delayMinutes > 30) {
        alerts.push({
          id: `delay-${train.id}`,
          type: 'delay',
          severity: train.delayMinutes > 60 ? 'high' : 'medium',
          title: `Significant Delay - Train ${train.id}`,
          description: `${train.name} is delayed by ${train.delayMinutes} minutes at ${train.currentLocation}`,
          location: train.currentLocation,
          affectedTrains: [train.id],
          timestamp: new Date().toISOString(),
          estimatedResolution: this.calculateResolutionTime(train.delayMinutes),
          recommendations: [
            `Consider rerouting via alternative sections`,
            `Notify passengers of revised arrival times`,
            `Coordinate with connecting services`,
            train.type === 'Express' ? 'Priority handling required' : 'Monitor for cascade delays'
          ]
        });
      }
    });
    
    return alerts;
  }

  private generatePlatformConflictAlerts(trains: Train[]): Alert[] {
    const alerts: Alert[] = [];
    const stationTrainMap = new Map<string, Train[]>();
    
    // Group trains by current station
    trains.forEach(train => {
      const station = train.currentLocation.toLowerCase();
      if (!stationTrainMap.has(station)) {
        stationTrainMap.set(station, []);
      }
      stationTrainMap.get(station)!.push(train);
    });
    
    // Check for platform conflicts
    stationTrainMap.forEach((stationTrains, stationName) => {
      if (stationTrains.length > 1) {
        const stationData = this.stations.find(s => s.station.toLowerCase() === stationName);
        const platformCount = stationData?.platforms || 1;
        
        if (stationTrains.length > platformCount) {
          alerts.push({
            id: `platform-conflict-${stationName}`,
            type: 'platform_conflict',
            severity: 'high',
            title: `Platform Capacity Exceeded`,
            description: `${stationTrains.length} trains at ${stationName} (${platformCount} platforms available)`,
            location: stationName,
            affectedTrains: stationTrains.map(t => t.id),
            timestamp: new Date().toISOString(),
            recommendations: [
              'Implement staggered arrival times',
              'Use loop lines for holding trains',
              'Coordinate with adjacent stations',
              'Consider platform reallocation'
            ]
          });
        }
      }
    });
    
    return alerts;
  }

  private generateCongestionAlerts(trains: Train[]): Alert[] {
    const alerts: Alert[] = [];
    const majorStations = ['ratnagiri', 'panvel', 'madgaon', 'kankavali', 'chiplun'];
    
    majorStations.forEach(stationName => {
      const trainsAtStation = trains.filter(train => 
        train.currentLocation.toLowerCase().includes(stationName)
      );
      
      if (trainsAtStation.length >= 3) {
        alerts.push({
          id: `congestion-${stationName}`,
          type: 'congestion',
          severity: trainsAtStation.length >= 4 ? 'high' : 'medium',
          title: `Traffic Congestion at ${stationName.charAt(0).toUpperCase() + stationName.slice(1)}`,
          description: `${trainsAtStation.length} trains converging at major junction`,
          location: stationName,
          affectedTrains: trainsAtStation.map(t => t.id),
          timestamp: new Date().toISOString(),
          recommendations: [
            'Activate traffic control protocols',
            'Implement train holding strategies',
            'Coordinate with section controllers',
            'Monitor for cascade effects'
          ]
        });
      }
    });
    
    return alerts;
  }

  private generateIncidentAlerts(trains: Train[]): Alert[] {
    const alerts: Alert[] = [];
    
    // Simulate incident detection based on unusual delay patterns
    const highDelayTrains = trains.filter(train => train.delayMinutes && train.delayMinutes > 45);
    
    if (highDelayTrains.length >= 2) {
      // Check if trains are in same section
      const commonSections = this.findCommonSections(highDelayTrains);
      
      commonSections.forEach(section => {
        const sectionTrains = highDelayTrains.filter(train => 
          this.isInSection(train, section)
        );
        
        if (sectionTrains.length >= 2) {
          alerts.push({
            id: `incident-${section}`,
            type: 'incident',
            severity: 'critical',
            title: `Possible Incident Detected`,
            description: `Multiple trains experiencing significant delays in ${section} section`,
            location: section,
            affectedTrains: sectionTrains.map(t => t.id),
            timestamp: new Date().toISOString(),
            estimatedResolution: '60-90 minutes',
            recommendations: [
              'Dispatch emergency response team',
              'Activate incident management protocol',
              'Reroute incoming trains',
              'Coordinate with local authorities',
              'Implement passenger communication plan'
            ]
          });
        }
      });
    }
    
    return alerts;
  }

  private generateWeatherAlerts(trains: Train[]): Alert[] {
    const alerts: Alert[] = [];
    
    // Simulate weather impact on coastal sections
    const coastalSections = ['ratnagiri', 'kankavali', 'madgaon'];
    const affectedTrains = trains.filter(train => 
      coastalSections.some(section => 
        train.currentLocation.toLowerCase().includes(section)
      )
    );
    
    if (affectedTrains.length > 0 && Math.random() > 0.7) { // 30% chance of weather alert
      alerts.push({
        id: 'weather-coastal',
        type: 'weather',
        severity: 'medium',
        title: 'Weather Advisory - Coastal Sections',
        description: 'Heavy rainfall affecting visibility and track conditions',
        location: 'Konkan Coast',
        affectedTrains: affectedTrains.map(t => t.id),
        timestamp: new Date().toISOString(),
        estimatedResolution: '2-4 hours',
        recommendations: [
          'Reduce train speeds in affected sections',
          'Monitor track conditions closely',
          'Prepare for potential service disruptions',
          'Keep passengers informed of delays'
        ]
      });
    }
    
    return alerts;
  }

  private calculateResolutionTime(delayMinutes: number): string {
    const baseResolution = Math.max(30, delayMinutes * 0.5);
    const resolutionTime = new Date(Date.now() + baseResolution * 60000);
    return resolutionTime.toLocaleTimeString();
  }

  private findCommonSections(trains: Train[]): string[] {
    const sections = ['ratnagiri-kankavali', 'panvel-roha', 'chiplun-ratnagiri'];
    return sections.filter(section => 
      trains.filter(train => this.isInSection(train, section)).length >= 2
    );
  }

  private isInSection(train: Train, section: string): boolean {
    const sectionStations = {
      'ratnagiri-kankavali': ['ratnagiri', 'adavali', 'kankavali'],
      'panvel-roha': ['panvel', 'pen', 'roha'],
      'chiplun-ratnagiri': ['chiplun', 'sangameshwar', 'ratnagiri']
    };
    
    const stations = sectionStations[section as keyof typeof sectionStations] || [];
    return stations.some(station => 
      train.currentLocation.toLowerCase().includes(station)
    );
  }
}

export const generateKonkanAlerts = (trains: Train[], stations: StationData[]): Alert[] => {
  const alertSystem = new KonkanAlertSystem(stations);
  return alertSystem.generateAlerts(trains);
};