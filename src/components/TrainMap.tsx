import React, { useState, useEffect } from 'react';
import { MapPin, Train, Clock, AlertTriangle, Zap, Eye, Activity, Navigation, RefreshCw } from 'lucide-react';
import { generateNetworkTopology, generateTrafficPredictions, generateRouteRecommendations, calculateRouteMetrics } from '../utils/mapData';
import { apiService } from '../services/apiService';
import { transformApiTrainToTrain, Train as TrainType } from '../utils/dataTransform';
import TrainControlModal from './TrainControlModal';

const TrainMap: React.FC = () => {
  const [viewMode, setViewMode] = useState('network');
  const [selectedTrain, setSelectedTrain] = useState<any>(null);
  const [selectedStation, setSelectedStation] = useState<any>(null);
  const [showTrainControl, setShowTrainControl] = useState(false);
  const [liveTrains, setLiveTrains] = useState<TrainType[]>([]);
  const [trafficPredictions, setTrafficPredictions] = useState(generateTrafficPredictions());
  const [routeRecommendations, setRouteRecommendations] = useState(generateRouteRecommendations());
  const [networkData, setNetworkData] = useState(generateNetworkTopology());
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const fetchTrainsData = async () => {
    try {
      setLoading(true);
      const trainsResponse = await apiService.fetchAllTrains();
      
      if (trainsResponse.success) {
        const transformedTrains = Object.entries(trainsResponse.trains).map(([trainNo, trainData]) =>
          transformApiTrainToTrain(trainNo, trainData)
        );
        
        // Add map coordinates for visualization
        const trainsWithCoords = transformedTrains.map((train, index) => ({
          ...train,
          x: 20 + (index * 15) % 60, // Distribute trains across the map
          y: 20 + (index * 10) % 60,
          progress: Math.random() * 100,
          speed: 60 + Math.random() * 40,
          eta: new Date(Date.now() + Math.random() * 3600000).toLocaleTimeString(),
          nextStation: train.nextStation || 'Destination',
          route: `${train.from} - ${train.to}`
        }));
        
        setLiveTrains(trainsWithCoords);
        setLastUpdated(trainsResponse.lastUpdatedAt);
      }
    } catch (error) {
      console.error('Error fetching trains data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainsData();
    
    const interval = setInterval(() => {
      fetchTrainsData(); // Fetch real data instead of mock updates
      
      if (Math.random() > 0.7) {
        setTrafficPredictions(generateTrafficPredictions());
        setRouteRecommendations(generateRouteRecommendations());
      }
    }, 15000); // Update every 15 seconds

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'On Time': return 'text-green-400 bg-green-500/20';
      case 'Delayed': return 'text-red-400 bg-red-500/20';
      case 'En Route': return 'text-blue-400 bg-blue-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'border-red-500 bg-red-500';
      case 'Medium': return 'border-yellow-500 bg-yellow-500';
      case 'Low': return 'border-green-500 bg-green-500';
      default: return 'border-gray-500 bg-gray-500';
    }
  };

  const getStationStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'bg-green-500';
      case 'congested': return 'bg-red-500';
      case 'maintenance': return 'bg-yellow-500';
      case 'blocked': return 'bg-gray-500';
      default: return 'bg-blue-500';
    }
  };

  const handleTrainClick = (train: any) => {
    setSelectedTrain(train);
    setSelectedStation(null);
    setShowTrainControl(true);
  };

  const TrainDetail = ({ train, onClose }: any) => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-lg border border-slate-700 max-w-md w-full">
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <div className="flex items-center space-x-3">
            <Train className="w-6 h-6 text-blue-400" />
            <div>
              <h3 className="text-lg font-bold text-white">{train.name}</h3>
              <p className="text-sm text-slate-400">{train.route}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">×</button>
        </div>
        
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-slate-400 text-sm">Current Speed</p>
              <p className="text-white font-bold">{Math.round(train.speed)} km/h</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm">ETA</p>
              <p className="text-white font-bold">{train.eta}</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm">Progress</p>
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-slate-700 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${train.progress}%` }}
                  ></div>
                </div>
                <span className="text-white text-sm">{Math.round(train.progress)}%</span>
              </div>
            </div>
            <div>
              <p className="text-slate-400 text-sm">Next Station</p>
              <p className="text-white font-bold">{train.nextStation}</p>
            </div>
          </div>
          
          <div>
            <p className="text-slate-400 text-sm mb-2">Status</p>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(train.status)}`}>
              {train.status}
            </span>
          </div>
          
          <div>
            <p className="text-slate-400 text-sm mb-2">Priority Level</p>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${getPriorityColor(train.priority).split(' ')[1]}`}></div>
              <span className="text-white">{train.priority}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const StationDetail = ({ station, onClose }: any) => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-lg border border-slate-700 max-w-md w-full">
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <div className="flex items-center space-x-3">
            <MapPin className="w-6 h-6 text-green-400" />
            <div>
              <h3 className="text-lg font-bold text-white">{station.name}</h3>
              <p className="text-sm text-slate-400">{station.type.charAt(0).toUpperCase() + station.type.slice(1)}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">×</button>
        </div>
        
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-slate-400 text-sm">Capacity</p>
              <p className="text-white font-bold">{station.capacity} platforms</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm">Current Usage</p>
              <p className="text-white font-bold">{station.currentOccupancy}/{station.capacity}</p>
            </div>
          </div>
          
          <div>
            <p className="text-slate-400 text-sm mb-2">Utilization</p>
            <div className="flex items-center space-x-2">
              <div className="flex-1 bg-slate-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    (station.currentOccupancy / station.capacity) > 0.8 ? 'bg-red-500' :
                    (station.currentOccupancy / station.capacity) > 0.6 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${(station.currentOccupancy / station.capacity) * 100}%` }}
                ></div>
              </div>
              <span className="text-white text-sm">{Math.round((station.currentOccupancy / station.capacity) * 100)}%</span>
            </div>
          </div>
          
          <div>
            <p className="text-slate-400 text-sm mb-2">Status</p>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${getStationStatusColor(station.status)}`}></div>
              <span className="text-white capitalize">{station.status}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const metrics = calculateRouteMetrics(liveTrains);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Live Railway Network Map</h2>
          <p className="text-slate-400">Real-time train tracking and route optimization</p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={fetchTrainsData}
            disabled={loading}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 px-3 py-2 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-green-400">Live Tracking Active</span>
          </div>
          {lastUpdated && (
            <span className="text-sm text-slate-400">
              Updated: {new Date(lastUpdated).toLocaleTimeString()}
            </span>
          )}
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white"
          >
            <option value="network">Network Overview</option>
            <option value="traffic">Traffic Density</option>
            <option value="delays">Delay Hotspots</option>
          </select>
        </div>
      </div>

      {/* System Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center space-x-2">
            <Train className="w-5 h-5 text-blue-400" />
            <span className="text-slate-400">Active Trains</span>
          </div>
          <p className="text-2xl font-bold text-white mt-1">{metrics.totalTrains}</p>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-green-400" />
            <span className="text-slate-400">On Time</span>
          </div>
          <p className="text-2xl font-bold text-green-400 mt-1">{metrics.onTimePercentage}%</p>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <span className="text-slate-400">Delayed</span>
          </div>
          <p className="text-2xl font-bold text-red-400 mt-1">{metrics.delayedPercentage}%</p>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-purple-400" />
            <span className="text-slate-400">Efficiency</span>
          </div>
          <p className="text-2xl font-bold text-purple-400 mt-1">{metrics.systemEfficiency}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Map */}
        <div className="lg:col-span-2">
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Interactive Network Map</h3>
              <div className="flex items-center space-x-2">
                <Eye className="w-4 h-4 text-slate-400" />
                <span className="text-sm text-slate-400">Click trains/stations for details</span>
              </div>
            </div>
            
            {/* Map Container */}
            <div className="relative bg-slate-900 rounded-lg border border-slate-600" style={{ height: '500px' }}>
              {/* Railway Network Lines */}
              <svg className="absolute inset-0 w-full h-full">
                {networkData.edges.map((edge) => {
                  const fromNode = networkData.nodes.find(n => n.id === edge.from);
                  const toNode = networkData.nodes.find(n => n.id === edge.to);
                  if (!fromNode || !toNode) return null;
                  
                  return (
                    <line
                      key={edge.id}
                      x1={`${fromNode.x}%`}
                      y1={`${fromNode.y}%`}
                      x2={`${toNode.x}%`}
                      y2={`${toNode.y}%`}
                      stroke={
                        edge.trafficDensity === 'high' ? '#ef4444' :
                        edge.trafficDensity === 'medium' ? '#f59e0b' : '#10b981'
                      }
                      strokeWidth="3"
                      strokeDasharray={edge.trackType === 'single' ? '5,5' : 'none'}
                      opacity="0.7"
                    />
                  );
                })}
              </svg>

              {/* Railway Stations */}
              {networkData.nodes.map((station) => (
                <div
                  key={station.id}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                  style={{ left: `${station.x}%`, top: `${station.y}%` }}
                  onClick={() => setSelectedStation(station)}
                >
                  <div className={`w-4 h-4 rounded-full border-2 border-white ${getStationStatusColor(station.status)} group-hover:scale-125 transition-transform`}></div>
                  <div className="absolute top-5 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white px-3 py-1 rounded-lg text-sm font-medium border border-slate-600 whitespace-nowrap shadow-lg">
                    <div className="font-bold">{station.name}</div>
                    <div className="text-xs text-slate-400">{station.currentOccupancy}/{station.capacity}</div>
                  </div>
                </div>
              ))}

              {/* Live Trains */}
              {liveTrains.map((train) => (
                <div
                  key={train.id}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                  style={{ left: `${Math.max(5, Math.min(95, train.x))}%`, top: `${Math.max(5, Math.min(95, train.y))}%` }}
                  onClick={() => handleTrainClick(train)}
                >
                  <div className={`w-3 h-3 rounded-full border-2 ${getPriorityColor(train.priority)} group-hover:scale-150 transition-all duration-200 animate-pulse`}></div>
                  <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white px-2 py-1 rounded text-xs font-medium border border-slate-600 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                    <div className="font-bold">{train.name}</div>
                    <div className="text-slate-400">{Math.round(train.speed)} km/h</div>
                  </div>
                </div>
              ))}

              {/* Map Legend */}
              <div className="absolute bottom-4 left-4 bg-slate-800/90 rounded-lg p-3 border border-slate-600">
                <h4 className="text-white font-medium mb-2 text-sm">Legend</h4>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-slate-300">High Priority</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-slate-300">Medium Priority</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-slate-300">Low Priority / Operational</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Side Panel */}
        <div className="space-y-6">
          {/* Traffic Predictions */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="flex items-center space-x-2 mb-4">
              <Zap className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-bold text-white">Traffic Predictions</h3>
            </div>
            <div className="space-y-3">
              {trafficPredictions.slice(0, 4).map((prediction, index) => (
                <div key={index} className="bg-slate-900/50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white font-medium text-sm">{prediction.route}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      prediction.congestion === 'High' ? 'bg-red-500/20 text-red-400' :
                      prediction.congestion === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-green-500/20 text-green-400'
                    }`}>
                      {prediction.congestion}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Delay: {prediction.estimatedDelay}</span>
                    <span className="text-blue-400">{prediction.confidence}% confidence</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Route Recommendations */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="flex items-center space-x-2 mb-4">
              <Navigation className="w-5 h-5 text-green-400" />
              <h3 className="text-lg font-bold text-white">AI Recommendations</h3>
            </div>
            <div className="space-y-3">
              {routeRecommendations.slice(0, 3).map((rec, index) => (
                <div key={index} className="bg-slate-900/50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium text-sm">{rec.train}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      rec.priority === 'High' ? 'bg-red-500/20 text-red-400' :
                      rec.priority === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-green-500/20 text-green-400'
                    }`}>
                      {rec.priority}
                    </span>
                  </div>
                  <p className="text-slate-300 text-xs mb-2">{rec.recommendation}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-green-400">Saves: {rec.timeSaved}</span>
                    <span className="text-blue-400">{rec.confidence}% confidence</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Live Train Status */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h3 className="text-lg font-bold text-white mb-4">Recent Updates</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-slate-300">Rajdhani 12951 on schedule</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-slate-300">Platform 7 Mumbai - congestion cleared</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-slate-300">Weather update: Clear conditions</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-slate-300">Signal maintenance at KM 247</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {selectedTrain && (
        <TrainDetail train={selectedTrain} onClose={() => setSelectedTrain(null)} />
      )}
      
      {selectedStation && (
        <StationDetail station={selectedStation} onClose={() => setSelectedStation(null)} />
      )}

      {/* Train Control Modal */}
      {showTrainControl && selectedTrain && (
        <TrainControlModal
          train={selectedTrain}
          onClose={() => {
            setShowTrainControl(false);
            setSelectedTrain(null);
          }}
        />
      )}
    </div>
  );
};

export default TrainMap;