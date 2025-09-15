const ML_BASE_URL = 'http://localhost:5000/api';

export interface MLRecommendation {
  id: string;
  recommendation: string;
  confidence: number;
  priority: 'high' | 'medium' | 'low';
  type: 'delay_prediction' | 'speed_optimization' | 'route_optimization' | 'platform_management';
}

export interface ModelMetrics {
  accuracy: number;
  last_trained: string;
  total_predictions: number;
  model_version: string;
}

export interface WeatherData {
  station: string;
  temperature: number;
  humidity: number;
  weather_condition: string;
  visibility: number;
  wind_speed: number;
}

export interface TrainFeatures {
  train_number: string;
  current_station: string;
  delay_minutes: number;
  train_type: string;
  direction: string;
  weather_conditions?: WeatherData;
}

export interface SectionFeatures {
  section_name: string;
  train_count: number;
  weather_conditions: WeatherData;
  time_of_day: string;
}

class MLService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = ML_BASE_URL;
  }

  /**
   * Check if the ML API is healthy
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      return response.ok;
    } catch (error) {
      console.error('ML API health check failed:', error);
      return false;
    }
  }

  /**
   * Get ML model metrics
   */
  async getModelMetrics(): Promise<ModelMetrics> {
    try {
      const response = await fetch(`${this.baseUrl}/ml/metrics`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching model metrics:', error);
      // Return default metrics if API fails
      return {
        accuracy: 0.85,
        last_trained: new Date().toISOString(),
        total_predictions: 0,
        model_version: '1.0.0'
      };
    }
  }

  /**
   * Get weather data for all stations
   */
  async getWeatherData(): Promise<WeatherData[]> {
    try {
      const response = await fetch(`${this.baseUrl}/weather/all`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching weather data:', error);
      return [];
    }
  }

  /**
   * Get ML recommendations based on train and station data
   */
  async getRecommendations(trains: any, stations: any): Promise<{
    recommendations: MLRecommendation[];
    model_metrics: ModelMetrics;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/ml/recommendations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          trains,
          stations
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        recommendations: data.recommendations || [],
        model_metrics: data.model_metrics || await this.getModelMetrics()
      };
    } catch (error) {
      console.error('Error fetching ML recommendations:', error);
      // Return fallback recommendations
      return {
        recommendations: this.generateFallbackRecommendations(trains),
        model_metrics: await this.getModelMetrics()
      };
    }
  }

  /**
   * Predict delay for a train
   */
  async predictTrainDelay(trainFeatures: TrainFeatures): Promise<number> {
    try {
      const response = await fetch(`${this.baseUrl}/ml/train_delay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(trainFeatures),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.predicted_delay || 0;
    } catch (error) {
      console.error('Error predicting train delay:', error);
      return 0;
    }
  }

  /**
   * Predict congestion for a section
   */
  async predictSectionCongestion(sectionFeatures: SectionFeatures): Promise<number> {
    try {
      const response = await fetch(`${this.baseUrl}/ml/congestion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sectionFeatures),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.congestion_level || 0;
    } catch (error) {
      console.error('Error predicting section congestion:', error);
      return 0;
    }
  }

  /**
   * Recommend optimal speed for a train
   */
  async recommendOptimalSpeed(trainFeatures: TrainFeatures, congestionLevel: number): Promise<number> {
    try {
      const response = await fetch(`${this.baseUrl}/ml/optimal_speed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...trainFeatures,
          congestion_level: congestionLevel
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.optimal_speed || 60;
    } catch (error) {
      console.error('Error getting optimal speed recommendation:', error);
      return 60; // Default speed
    }
  }

  /**
   * Train the ML model with provided data
   */
  async trainModel(trains: any, stations: any): Promise<{
    success: boolean;
    model_metrics: ModelMetrics;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/ml/train`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          trains,
          stations
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error training ML model:', error);
      return {
        success: false,
        model_metrics: await this.getModelMetrics()
      };
    }
  }

  /**
   * Get traffic control decisions from ML API
   */
  async getTrafficControlDecisions(trains: any[], stations: any[]): Promise<{
    decisions: Array<{
      trainId: string;
      action: string;
      reason: string;
      duration?: number;
      alternativeRoute?: string;
      expectedBenefit: string;
    }>;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/ml/traffic_control`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          trains,
          stations
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        decisions: data.decisions || []
      };
    } catch (error) {
      console.error('Error fetching traffic control decisions:', error);
      // Return fallback decisions
      return {
        decisions: this.generateFallbackTrafficDecisions(trains)
      };
    }
  }

  /**
   * Generate fallback traffic control decisions
   */
  private generateFallbackTrafficDecisions(trains: any[]): Array<{
    trainId: string;
    action: string;
    reason: string;
    duration?: number;
    alternativeRoute?: string;
    expectedBenefit: string;
  }> {
    const decisions: Array<{
      trainId: string;
      action: string;
      reason: string;
      duration?: number;
      alternativeRoute?: string;
      expectedBenefit: string;
    }> = [];

    trains.forEach(train => {
      const delayMinutes = train.delayMinutes || 0;
      
      if (delayMinutes > 30) {
        decisions.push({
          trainId: train.id,
          action: 'hold',
          reason: `Significant delay detected (${delayMinutes} min)`,
          duration: 15,
          expectedBenefit: 'Prevent cascade delays to other trains'
        });
      } else if (train.type === 'Express' && delayMinutes > 10) {
        decisions.push({
          trainId: train.id,
          action: 'release',
          reason: 'Express service priority',
          expectedBenefit: 'Maintain express schedule integrity'
        });
      }
    });

    return decisions;
  }

  /**
   * Generate fallback recommendations when ML API is unavailable
   */
  private generateFallbackRecommendations(trains: any): MLRecommendation[] {
    const recommendations: MLRecommendation[] = [];
    
    if (trains && typeof trains === 'object') {
      Object.entries(trains).forEach(([trainId, trainData]: [string, any]) => {
        const delayMinutes = parseInt(trainData.delayedTime?.hours || '0') * 60 + 
                           parseInt(trainData.delayedTime?.minutes || '0');
        
        if (delayMinutes > 15) {
          recommendations.push({
            id: trainId,
            recommendation: `Train ${trainId} is delayed by ${delayMinutes} minutes. Consider speed optimization to recover time.`,
            confidence: 0.75,
            priority: delayMinutes > 30 ? 'high' : 'medium',
            type: 'delay_prediction'
          });
        }

        if (trainData.type === 'Express' && delayMinutes > 0) {
          recommendations.push({
            id: trainId,
            recommendation: `Express train ${trainId} priority routing recommended to minimize passenger impact.`,
            confidence: 0.80,
            priority: 'high',
            type: 'route_optimization'
          });
        }
      });
    }

    return recommendations;
  }
}

export const mlService = new MLService();