import React, { useState, useEffect } from 'react';
import { Train, Clock, AlertCircle, TrendingUp, Zap, MapPin, RefreshCw } from 'lucide-react';
import { apiService } from '../services/apiService';
import { transformApiTrainToTrain, calculateSystemMetrics, Train as TrainType, Station, transformApiStationToStation } from '../utils/dataTransform';
import TrainControlModal from './TrainControlModal';

const Dashboard: React.FC = () => {
  const [trains, setTrains] = useState<TrainType[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [metrics, setMetrics] = useState({ activeTrains: 0, onTimePercentage: 0, activeAlerts: 0, efficiency: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [selectedTrain, setSelectedTrain] = useState<TrainType | null>(null);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch trains and stations in parallel
      const [trainsResponse, stationsResponse] = await Promise.all([
        apiService.fetchAllTrains(),
        apiService.fetchAllStations()
      ]);

      if (trainsResponse.success) {
        const transformedTrains = Object.entries(trainsResponse.trains).map(([trainNo, trainData]) =>
          transformApiTrainToTrain(trainNo, trainData)
        );
        setTrains(transformedTrains);
        setMetrics(calculateSystemMetrics(transformedTrains));
        setLastUpdated(trainsResponse.lastUpdatedAt);
      }

      if (stationsResponse.success) {
        const transformedStations = Object.entries(stationsResponse.stations).map(([stationName, stationData]) =>
          transformApiStationToStation(stationName, stationData)
        );
        setStations(transformedStations);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const MetricCard = ({ title, value, icon: Icon, color, trend }: any) => (
    <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-400 text-sm font-medium">{title}</p>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
          {trend && (
            <div className="flex items-center mt-2">
              <TrendingUp className={`w-4 h-4 mr-1 ${trend > 0 ? 'text-green-400' : 'text-red-400'}`} />
              <span className={`text-sm ${trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {trend > 0 ? '+' : ''}{trend}%
              </span>
            </div>
          )}
        </div>
        <Icon className={`w-8 h-8 ${color}`} />
      </div>
    </div>
  );

  const TrainStatusCard = ({ train }: { train: TrainType }) => {
    const getStatusColor = (status: string) => {
      switch (status) {
        case 'On Time': return 'text-green-400';
        case 'Delayed': return 'text-red-400';
        case 'En Route': return 'text-blue-400';
        case 'Arrived': return 'text-purple-400';
        default: return 'text-slate-400';
      }
    };

    const getPriorityColor = (priority: string) => {
      switch (priority) {
        case 'High': return 'bg-red-500';
        case 'Medium': return 'bg-yellow-500';
        case 'Low': return 'bg-green-500';
        default: return 'bg-slate-500';
      }
    };

    return (
      <div 
        className="bg-slate-800 rounded-lg p-4 border border-slate-700 hover:border-slate-600 transition-colors cursor-pointer"
        onClick={() => setSelectedTrain(train)}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${getPriorityColor(train.priority)}`}></div>
            <div>
              <h3 className="font-semibold text-white">{train.name}</h3>
              <p className="text-sm text-slate-400">{train.type} • Train {train.id}</p>
            </div>
          </div>
          <div className="text-right">
            <span className={`text-sm font-medium ${getStatusColor(train.status)}`}>
              {train.status}
            </span>
            {train.direction && (
              <p className="text-xs text-slate-400 mt-1">
                {train.direction === 'up' ? '↑ UP' : '↓ DOWN'}
              </p>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-slate-400">Current Station</p>
            <p className="text-white font-medium">{train.currentLocation}</p>
          </div>
          <div>
            <p className="text-slate-400">Last Update</p>
            <p className="text-white font-medium">{train.departure}</p>
          </div>
          {train.delay && (
            <div className="col-span-2">
              <p className="text-slate-400">Delay</p>
              <p className="text-red-400 font-medium">{train.delay}</p>
            </div>
          )}
        </div>

        {train.aiRecommendation && (
          <div className="mt-3 p-3 bg-blue-900/30 rounded-lg border border-blue-700/50">
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-blue-400 font-medium">AI Recommendation</span>
            </div>
            <p className="text-sm text-slate-300 mt-1">{train.aiRecommendation}</p>
          </div>
        )}
      </div>
    );
  };

  const StationCard = ({ station }: { station: Station }) => {
    return (
      <div 
        className="bg-slate-800 rounded-lg p-4 border border-slate-700 hover:border-slate-600 transition-colors cursor-pointer"
        onClick={() => setSelectedStation(station)}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <MapPin className={`w-5 h-5 ${station.type === 'big' ? 'text-blue-400' : 'text-green-400'}`} />
            <div>
              <h3 className="font-semibold text-white capitalize">{station.name}</h3>
              <p className="text-sm text-slate-400">{station.state}</p>
            </div>
          </div>
          <span className={`text-xs px-2 py-1 rounded-full ${
            station.type === 'big' ? 'bg-blue-600 text-blue-100' : 'bg-green-600 text-green-100'
          }`}>
            {station.type.toUpperCase()}
          </span>
        </div>
        
        <div className="text-sm">
          <p className="text-slate-400 mb-1">Distance from origin</p>
          <p className="text-white font-medium">{station.distance} km</p>
          <p className="text-slate-300 text-xs mt-2">{station.description}</p>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-3">
          <RefreshCw className="w-6 h-6 text-blue-400 animate-spin" />
          <span className="text-white text-lg">Loading live data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/50 border border-red-700 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <AlertCircle className="w-6 h-6 text-red-400" />
          <h3 className="text-xl font-bold text-white">Connection Error</h3>
        </div>
        <p className="text-red-200 mb-4">{error}</p>
        <button
          onClick={fetchData}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* System Overview */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Konkan Railway Live Status</h2>
          <div className="flex items-center space-x-4">
            <button
              onClick={fetchData}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
            {lastUpdated && (
              <span className="text-sm text-slate-400">
                Last updated: {new Date(lastUpdated).toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Active Trains"
            value={metrics.activeTrains}
            icon={Train}
            color="text-blue-400"
          />
          <MetricCard
            title="On-Time Performance"
            value={`${metrics.onTimePercentage}%`}
            icon={Clock}
            color="text-green-400"
          />
          <MetricCard
            title="Active Alerts"
            value={metrics.activeAlerts}
            icon={AlertCircle}
            color="text-red-400"
          />
          <MetricCard
            title="System Efficiency"
            value={`${metrics.efficiency}%`}
            icon={TrendingUp}
            color="text-purple-400"
          />
        </div>
      </div>

      {/* Live Train Status */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Live Train Status</h2>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-slate-400">Live updates every 30s</span>
            </div>
          </div>
        </div>
        {trains.length === 0 ? (
          <div className="bg-slate-800 rounded-lg p-8 text-center">
            <Train className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-400">No trains currently active on Konkan Railway</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {trains.map((train) => (
              <TrainStatusCard key={train.id} train={train} />
            ))}
          </div>
        )}
      </div>

      {/* Stations Overview */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-6">Konkan Railway Stations</h2>
        {stations.length === 0 ? (
          <div className="bg-slate-800 rounded-lg p-8 text-center">
            <MapPin className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-400">Loading station information...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {stations.slice(0, 12).map((station) => (
              <StationCard key={station.id} station={station} />
            ))}
          </div>
        )}
      </div>

      {/* Train Detail Modal */}
      {selectedTrain && (
        <TrainControlModal
          train={selectedTrain}
          onClose={() => setSelectedTrain(null)}
        />
      )}

      {/* Station Detail Modal */}
      {selectedStation && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-lg max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <MapPin className={`w-6 h-6 ${selectedStation.type === 'big' ? 'text-blue-400' : 'text-green-400'}`} />
                <h2 className="text-2xl font-bold text-white capitalize">{selectedStation.name}</h2>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  selectedStation.type === 'big' ? 'bg-blue-600 text-blue-100' : 'bg-green-600 text-green-100'
                }`}>
                  {selectedStation.type.toUpperCase()} STATION
                </span>
              </div>
              <button
                onClick={() => setSelectedStation(null)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Station Details</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-slate-400">State</p>
                    <p className="text-white font-medium">{selectedStation.state}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Distance from Origin</p>
                    <p className="text-white font-medium">{selectedStation.distance} km</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Station Type</p>
                    <p className="text-white font-medium capitalize">{selectedStation.type} Station</p>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Description</h3>
                <p className="text-slate-300">{selectedStation.description}</p>
                
                <div className="mt-4">
                  <h4 className="text-md font-semibold text-white mb-2">Trains at this Station</h4>
                  <div className="space-y-2">
                    {trains.filter(train => 
                      train.currentLocation.toLowerCase() === selectedStation.name.toLowerCase()
                    ).map(train => (
                      <div key={train.id} className="bg-slate-700 rounded p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-white font-medium">Train {train.id}</span>
                          <span className="text-sm text-slate-400">{train.status}</span>
                        </div>
                        <p className="text-sm text-slate-300">{train.name}</p>
                      </div>
                    ))}
                    {trains.filter(train => 
                      train.currentLocation.toLowerCase() === selectedStation.name.toLowerCase()
                    ).length === 0 && (
                      <p className="text-slate-400 text-sm">No trains currently at this station</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;