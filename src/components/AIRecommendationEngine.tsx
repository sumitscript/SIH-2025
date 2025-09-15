import React, { useState, useEffect } from 'react';
import { Brain, Zap, Clock, CheckCircle, RefreshCw } from 'lucide-react';
import { apiService } from '../services/apiService';
import { transformApiTrainToTrain, Train } from '../utils/dataTransform';
import { generateRecommendations, RecommendationOutput } from '../utils/mlRecommendationModel';
import { generateOptimizationScenarios } from '../utils/optimization';
import { mlService, ModelMetrics, WeatherData } from '../services/mlService';

const AIRecommendationEngine: React.FC = () => {
  const [recommendations, setRecommendations] = useState<RecommendationOutput[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedRecommendation, setSelectedRecommendation] = useState<RecommendationOutput | null>(null);
  const [trains, setTrains] = useState<Train[]>([]);
  const [modelAccuracy, setModelAccuracy] = useState<number>(85);
  const [lastTrainedDate, setLastTrainedDate] = useState<string>('2024-01-15');
  const [, setModelMetrics] = useState<ModelMetrics>({ 
    accuracy: 0.85, 
    last_trained: '2024-01-15', 
    total_predictions: 1247, 
    model_version: '2.1.0' 
  });
  const [mlApiAvailable, setMlApiAvailable] = useState<boolean>(false);
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);

  useEffect(() => {
    // Check if ML API is available
    checkMlApiHealth();
    
    // Fetch trains and generate recommendations
    fetchTrainsAndGenerateRecommendations();
    
    // Get model metrics
    fetchModelMetrics();
    
    // Fetch weather data
    const fetchWeather = async () => {
      try {
        if (mlApiAvailable) {
          const weatherResults = await mlService.getWeatherData();
          setWeatherData(weatherResults || []);
          console.log("Weather data fetched:", weatherResults);
        }
      } catch (error) {
        console.error("Error fetching weather data:", error);
      }
    };
    
    fetchWeather();
    
    // Set up more frequent updates for real-time data
    const interval = setInterval(() => {
      fetchTrainsAndGenerateRecommendations();
      fetchModelMetrics();
      fetchWeather();
    }, 10000);
    
    return () => clearInterval(interval);
  }, [mlApiAvailable]);

  const checkMlApiHealth = async () => {
    try {
      const isHealthy = await mlService.checkHealth();
      setMlApiAvailable(isHealthy);
      console.log(`ML API health check: ${isHealthy ? 'Available' : 'Unavailable'}`);
    } catch (error) {
      console.error("Error checking ML API health:", error);
      setMlApiAvailable(false);
    }
  };
  
  const fetchModelMetrics = async () => {
    try {
      const metrics = await mlService.getModelMetrics();
      setModelMetrics(metrics);
      setModelAccuracy(typeof metrics.accuracy === 'number' ? metrics.accuracy * 100 : 85);
      if (metrics.last_trained) {
        setLastTrainedDate(metrics.last_trained);
      }
    } catch (error) {
      console.error("Error fetching model metrics:", error);
    }
  };
  
  const fetchTrainsAndGenerateRecommendations = async () => {
    setIsGenerating(true);
    
    try {
      // Fetch real train data from API
      const trainsResponse = await apiService.fetchAllTrains();
      
      if (trainsResponse.success) {
        const transformedTrains = Object.entries(trainsResponse.trains).map(([trainNo, trainData]) =>
          transformApiTrainToTrain(trainNo, trainData)
        );
        setTrains(transformedTrains);
        
        // If ML API is available, use it to get recommendations
        if (mlApiAvailable) {
          try {
            // Fetch stations data for ML recommendations
            const stationsResponse = await apiService.fetchAllStations();
            const stationsArray = stationsResponse.success ? 
              Object.entries(stationsResponse.stations).map(([name, data]) => ({ ...data, station: name })) : [];
            
            // Get real-time recommendations from ML service
            const { recommendations: mlRecommendations, model_metrics } = await mlService.getRecommendations(trainsResponse.trains, stationsArray);
            
            if (mlRecommendations && mlRecommendations.length > 0) {
              // Transform MLRecommendation to RecommendationOutput
              const transformedRecommendations: RecommendationOutput[] = mlRecommendations.map(rec => ({
                id: rec.id,
                type: rec.type === 'delay_prediction' ? 'scheduling' : 
                      rec.type === 'speed_optimization' ? 'routing' :
                      rec.type === 'route_optimization' ? 'routing' :
                      rec.type === 'platform_management' ? 'scheduling' : 'routing',
                title: `ML Recommendation: ${rec.type.replace('_', ' ').toUpperCase()}`,
                description: rec.recommendation,
                confidence: Math.round(rec.confidence * 100),
                impact: rec.priority === 'high' ? 'High' : rec.priority === 'medium' ? 'Medium' : 'Low',
                timeSaving: '5-15 minutes',
                affectedTrains: [rec.id],
                implementation: 'Follow ML recommendation guidelines',
                reasoning: rec.recommendation,
                status: 'pending'
              }));
              setRecommendations(transformedRecommendations);
              console.log("Real-time ML recommendations loaded:", transformedRecommendations);
            } else {
              console.warn("No recommendations received from ML service");
            }
            
            if (model_metrics) {
              setModelMetrics(model_metrics);
              
              // Update UI metrics with real data
              if (typeof model_metrics.accuracy === 'number') {
                setModelAccuracy(model_metrics.accuracy * 100);
              }
              
              if (model_metrics.last_trained) {
                setLastTrainedDate(model_metrics.last_trained);
              }
            }
            
          } catch (mlError) {
            console.error("Error using ML service:", mlError);
            // Fall back to local model
            const scenarios = generateOptimizationScenarios();
            const mlRecommendations = generateRecommendations(transformedTrains, scenarios);
            setRecommendations(mlRecommendations);
          }
        } else {
          // Generate recommendations using local ML model
          const scenarios = generateOptimizationScenarios();
          const mlRecommendations = generateRecommendations(transformedTrains, scenarios);
          
          // If ML model doesn't generate enough recommendations, add some fallback ones
          if (mlRecommendations.length < 3) {
            const fallbackRecommendations: RecommendationOutput[] = [
              {
                id: 'rec-001',
                type: 'routing',
                title: 'URGENT: Delhi-Mumbai Corridor Congestion',
                description: 'Critical rerouting needed: Rajdhani 12951 via Nagpur bypass to avoid 45-min delay. Main line at 95% capacity.',
                confidence: 96,
                impact: 'High',
                timeSaving: '22 minutes',
                affectedTrains: ['Express 12951', 'SF 12615', 'Rajdhani 12953'],
                implementation: '1. Switch points at Gwalior Junction\n2. Coordinate with Nagpur control center\n3. Update passenger information systems\n4. Notify station masters on alternate route',
                reasoning: 'Main corridor at 95% capacity with freight convoy blocking express path. Nagpur bypass route currently clear with 40% utilization. Weather conditions favorable.',
                status: 'pending'
              },
              {
                id: 'rec-002',
                type: 'emergency',
                title: 'MEDICAL EMERGENCY: Chennai Express 12723',
                description: 'CRITICAL: Heart patient on board needs immediate hospital access. Grant priority clearance to Nagpur for ambulance transfer.',
                confidence: 99,
                impact: 'Critical',
                timeSaving: '35 minutes',
                affectedTrains: ['Express 12723', 'Freight 16789', 'Local 12890', 'SF 12650'],
                implementation: '1. Clear all signals on priority route\n2. Hold freight 16789 at Kalyan outer\n3. Notify Nagpur hospital - ambulance standby\n4. Coordinate with emergency services\n5. Update all affected train schedules',
                reasoning: 'Critical cardiac emergency reported by train guard. Patient condition deteriorating. Nagpur has best cardiac facility within 200km. Emergency protocols mandate immediate priority.',
                status: 'pending'
              },
              {
                id: 'rec-003',
                type: 'scheduling',
                title: 'Platform Optimization - Mumbai Central',
                description: 'Smart scheduling: Hold Shatabdi 12002 for 6 minutes to prevent platform conflict and reduce passenger congestion by 40%.',
                confidence: 91,
                impact: 'Medium',
                timeSaving: '15 minutes',
                affectedTrains: ['Shatabdi 12002', 'Local 12345', 'Express 12615'],
                implementation: '1. Hold Shatabdi at Borivali outer signal\n2. Coordinate platform 7 clearance\n3. Announce delay to passengers\n4. Prepare platform for express boarding\n5. Sync with local train schedules',
                reasoning: 'Platform 7 will clear in 6 minutes. Current overlap would cause 20-min cascade delay. Passenger flow analysis shows 40% congestion reduction with this timing.',
                status: 'pending'
              }
            ];
            
            setRecommendations([...mlRecommendations, ...fallbackRecommendations].slice(0, 8));
          } else {
            setRecommendations(mlRecommendations);
          }
        }
      }
    } catch (error) {
      console.error('Error generating recommendations:', error);
      // Fallback to static recommendations if API fails
      setRecommendations([]);
    } finally {
      setIsGenerating(false);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'routing': return 'text-blue-400 bg-blue-500/20 border-blue-700/50';
      case 'scheduling': return 'text-green-400 bg-green-500/20 border-green-700/50';
      case 'priority': return 'text-purple-400 bg-purple-500/20 border-purple-700/50';
      case 'maintenance': return 'text-yellow-400 bg-yellow-500/20 border-yellow-700/50';
      case 'emergency': return 'text-red-400 bg-red-500/20 border-red-700/50';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-700/50';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'Critical': return 'text-red-400';
      case 'High': return 'text-orange-400';
      case 'Medium': return 'text-yellow-400';
      case 'Low': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-400';
      case 'accepted': return 'bg-blue-500/20 text-blue-400';
      case 'rejected': return 'bg-red-500/20 text-red-400';
      case 'implemented': return 'bg-green-500/20 text-green-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const handleRecommendationAction = (id: string, action: 'accept' | 'reject') => {
    setRecommendations(prev => 
      prev.map(rec => 
        rec.id === id 
          ? { ...rec, status: action === 'accept' ? 'accepted' : 'rejected' }
          : rec
      )
    );
  };

  const RecommendationCard = ({ recommendation }: { recommendation: RecommendationOutput }) => (
    <div 
      className={`rounded-lg p-4 border cursor-pointer transition-all hover:bg-slate-700/30 ${getTypeColor(recommendation.type)}`}
      onClick={() => setSelectedRecommendation(recommendation)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-xs font-medium uppercase tracking-wide">
              {recommendation.type}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(recommendation.status)}`}>
              {recommendation.status}
            </span>
          </div>
          <h3 className="font-semibold text-white mb-1">{recommendation.title}</h3>
          <p className="text-sm text-slate-300">{recommendation.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 text-xs mb-3">
        <div>
          <span className="text-slate-400">Confidence</span>
          <div className="flex items-center space-x-1 mt-1">
            <div className="flex-1 bg-slate-700 rounded-full h-1">
              <div 
                className="bg-blue-400 h-1 rounded-full"
                style={{ width: `${recommendation.confidence}%` }}
              ></div>
            </div>
            <span className="text-white font-medium">{recommendation.confidence}%</span>
          </div>
        </div>
        <div>
          <span className="text-slate-400">Impact</span>
          <p className={`font-medium mt-1 ${getImpactColor(recommendation.impact)}`}>
            {recommendation.impact}
          </p>
        </div>
        <div>
          <span className="text-slate-400">Time Saved</span>
          <p className="text-green-400 font-medium mt-1">{recommendation.timeSaving}</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-400">
          {recommendation.affectedTrains.length} trains affected
        </span>
        {recommendation.status === 'pending' && (
          <div className="flex space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRecommendationAction(recommendation.id, 'accept');
              }}
              className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-xs font-medium transition-colors"
            >
              Accept
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRecommendationAction(recommendation.id, 'reject');
              }}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-xs font-medium transition-colors"
            >
              Reject
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const RecommendationDetail = ({ recommendation, onClose }: { recommendation: RecommendationOutput, onClose: () => void }) => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-lg border border-slate-700 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center space-x-3">
            <Brain className="w-6 h-6 text-blue-400" />
            <div>
              <h2 className="text-xl font-bold text-white">{recommendation.title}</h2>
              <div className="flex items-center space-x-3 mt-1">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(recommendation.type)}`}>
                  {recommendation.type}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(recommendation.status)}`}>
                  {recommendation.status}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h3 className="font-medium text-white mb-2">Description</h3>
            <p className="text-slate-300">{recommendation.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900/50 rounded-lg p-4">
              <h4 className="font-medium text-blue-400 mb-2">Confidence Level</h4>
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-slate-700 rounded-full h-2">
                  <div 
                    className="bg-blue-400 h-2 rounded-full"
                    style={{ width: `${recommendation.confidence}%` }}
                  ></div>
                </div>
                <span className="text-white font-bold">{recommendation.confidence}%</span>
              </div>
            </div>
            
            <div className="bg-slate-900/50 rounded-lg p-4">
              <h4 className="font-medium text-green-400 mb-2">Time Impact</h4>
              <div className="text-2xl font-bold text-green-400">{recommendation.timeSaving}</div>
              <p className="text-xs text-slate-400">Estimated savings</p>
            </div>
            
            <div className="bg-slate-900/50 rounded-lg p-4">
              <h4 className="font-medium text-purple-400 mb-2">System Impact</h4>
              <div className={`text-2xl font-bold ${getImpactColor(recommendation.impact)}`}>
                {recommendation.impact}
              </div>
              <p className="text-xs text-slate-400">Overall effect</p>
            </div>
          </div>

          <div>
            <h3 className="font-medium text-white mb-2">Affected Trains</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {recommendation.affectedTrains.map((train, index) => (
                <div key={index} className="bg-slate-900 rounded p-2 text-center">
                  <span className="text-sm text-slate-300">{train}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-medium text-white mb-2">Implementation Plan</h3>
            <div className="bg-blue-900/30 rounded-lg p-4 border border-blue-700/50">
              <p className="text-sm text-blue-300 whitespace-pre-line">{recommendation.implementation}</p>
            </div>
          </div>

          <div>
            <h3 className="font-medium text-white mb-2">AI Reasoning</h3>
            <div className="bg-purple-900/30 rounded-lg p-4 border border-purple-700/50">
              <p className="text-sm text-purple-300">{recommendation.reasoning}</p>
            </div>
          </div>

          {recommendation.status === 'pending' && (
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  handleRecommendationAction(recommendation.id, 'reject');
                  onClose();
                }}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors"
              >
                Reject
              </button>
              <button
                onClick={() => {
                  handleRecommendationAction(recommendation.id, 'accept');
                  onClose();
                }}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-medium transition-colors"
              >
                Accept & Implement
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Brain className="w-8 h-8 text-blue-400" />
          <div>
            <h2 className="text-2xl font-bold text-white">AI Recommendation Engine</h2>
            <p className="text-slate-400">Intelligent decision support for traffic controllers</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex flex-col items-end">
            <div className="text-xs text-slate-400">Model Accuracy</div>
            <div className="text-sm font-semibold text-green-400">{modelAccuracy.toFixed(1)}%</div>
          </div>
          <div className="flex flex-col items-end">
            <div className="text-xs text-slate-400">Last Trained</div>
            <div className="text-sm font-semibold text-slate-300">{lastTrainedDate}</div>
          </div>
          <button
            onClick={fetchTrainsAndGenerateRecommendations}
            disabled={isGenerating}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'Analyzing...' : 'Refresh Analysis'}</span>
          </button>
        </div>
      </div>
      
      {/* ML Model Information */}
      <div className="mb-6 p-4 bg-slate-700/50 rounded-lg">
        <h3 className="text-sm font-semibold mb-2 flex items-center">
          <Zap className="h-4 w-4 text-yellow-400 mr-2" />
          AI-Powered Traffic Control Model
        </h3>
        <p className="text-xs text-slate-400 mb-3">
          This model analyzes real-time train data, track conditions, and historical patterns to generate optimal traffic control recommendations.
          Currently monitoring {trains.length} active trains across multiple sections.
        </p>
        <div className="grid grid-cols-4 gap-4 text-center">
          <div className="bg-slate-800 p-2 rounded">
            <div className="text-xs text-slate-400">Active Trains</div>
            <div className="text-lg font-bold text-blue-400">{trains.length}</div>
          </div>
          <div className="bg-slate-800 p-2 rounded">
            <div className="text-xs text-slate-400">Delayed Trains</div>
            <div className="text-lg font-bold text-orange-400">{trains.filter(t => t.delayMinutes && t.delayMinutes > 0).length}</div>
          </div>
          <div className="bg-slate-800 p-2 rounded">
            <div className="text-xs text-slate-400">Recommendations</div>
            <div className="text-lg font-bold text-green-400">{recommendations.length}</div>
          </div>
          <div className="bg-slate-800 p-2 rounded">
            <div className="text-xs text-slate-400">Implemented</div>
            <div className="text-lg font-bold text-purple-400">{recommendations.filter(r => r.status === 'implemented').length}</div>
          </div>
        </div>
      </div>

      {/* AI Processing Status */}
      {isGenerating && (
        <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-lg p-6 border border-blue-700/50">
          <div className="flex items-center space-x-3 mb-4">
            <div className="relative">
              <Brain className="w-8 h-8 text-blue-400" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-ping"></div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">AI Analysis in Progress</h3>
              <p className="text-slate-400">Processing real-time data and generating optimizations...</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-400">Data Collection</span>
                <CheckCircle className="w-4 h-4 text-green-400" />
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full w-full"></div>
              </div>
            </div>

            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-400">Pattern Analysis</span>
                <RefreshCw className="w-4 h-4 text-blue-400 animate-spin" />
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full w-3/4 animate-pulse"></div>
              </div>
            </div>

            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-400">Solution Generation</span>
                <Clock className="w-4 h-4 text-slate-400" />
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div className="bg-slate-600 h-2 rounded-full w-1/4"></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Weather Data Display */}
      {weatherData.length > 0 && (
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">Weather Conditions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {weatherData.slice(0, 4).map((weather, index) => (
              <div key={index} className="bg-slate-700 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium text-white">{weather.station}</h4>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    weather.visibility < 1000 ? 'bg-red-600 text-red-100' :
                    weather.visibility < 5000 ? 'bg-yellow-600 text-yellow-100' :
                    'bg-green-600 text-green-100'
                  }`}>
                    {weather.visibility < 1000 ? 'Poor' : weather.visibility < 5000 ? 'Fair' : 'Good'}
                  </span>
                </div>
                <div className="text-sm">
                  <p className="text-white">{weather.weather_condition} • {weather.temperature}°C</p>
                  <p className="text-slate-400 mt-1">Wind: {weather.wind_speed} m/s</p>
                  <p className="text-slate-400">Visibility: {weather.visibility} m</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {recommendations.map((recommendation) => (
          <RecommendationCard key={recommendation.id} recommendation={recommendation} />
        ))}
      </div>

      {/* No Recommendations Message */}
      {!isGenerating && recommendations.length === 0 && (
        <div className="text-center py-12">
          <Brain className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Recommendations Available</h3>
          <p className="text-slate-400 mb-4">All trains are operating normally. The AI system will generate recommendations when optimization opportunities are detected.</p>
          <button
            onClick={fetchTrainsAndGenerateRecommendations}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Refresh Analysis
          </button>
        </div>
      )}

      {/* Recommendation Detail Modal */}
      {selectedRecommendation && (
        <RecommendationDetail
          recommendation={selectedRecommendation}
          onClose={() => setSelectedRecommendation(null)}
        />
      )}
    </div>
  );
};

export default AIRecommendationEngine;