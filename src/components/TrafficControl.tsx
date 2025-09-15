import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Clock, Zap, MapPin, ArrowRight, Pause, Play, RotateCcw, RefreshCw } from 'lucide-react';
import { apiService } from '../services/apiService';
import { transformApiTrainToTrain, Train } from '../utils/dataTransform';
import { mlService } from '../services/mlService';

interface TrafficControlProps {
  trains?: Train[];
  onTrainAction?: (trainId: string, action: string, details?: any) => void;
}

interface TrafficDecision {
  trainId: string;
  action: 'hold' | 'release' | 'reroute' | 'speed_adjust' | 'platform_change';
  reason: string;
  duration?: number;
  alternativeRoute?: string;
  expectedBenefit: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'executing' | 'completed';
}

interface ConflictAnalysis {
  conflictId: string;
  trainsInvolved: string[];
  conflictType: 'platform' | 'route' | 'timing';
  severity: 'high' | 'medium' | 'low';
  location: string;
  recommendedActions: TrafficDecision[];
}

const TrafficControl: React.FC<TrafficControlProps> = ({ trains: propTrains, onTrainAction }) => {
  const [trains, setTrains] = useState<Train[]>(propTrains || []);
  const [decisions, setDecisions] = useState<TrafficDecision[]>([]);
  const [conflicts, setConflicts] = useState<ConflictAnalysis[]>([]);
  const [loading, setLoading] = useState(false);
  // Removed unused selectedTrain state
  const [autoMode, setAutoMode] = useState(false);
  const [actionLog, setActionLog] = useState<Array<{
    timestamp: string;
    trainId: string;
    action: string;
    status: string;
  }>>([]);

  const fetchTrainsData = async () => {
    if (propTrains) return; // Use provided trains if available
    
    try {
      setLoading(true);
      const trainsResponse = await apiService.fetchAllTrains();
      
      if (trainsResponse.success) {
        const transformedTrains = Object.entries(trainsResponse.trains).map(([trainNo, trainData]) =>
          transformApiTrainToTrain(trainNo, trainData)
        );
        setTrains(transformedTrains);
        console.log('Loaded trains for traffic control:', transformedTrains.length);
      } else {
        console.warn('Failed to fetch trains data');
        // Set some mock data for demonstration
        setTrains([
          {
            id: '12951',
            name: 'Mumbai Rajdhani',
            type: 'Express',
            from: 'Mumbai',
            to: 'Delhi',
            departure: '16:00',
            arrival: '08:00',
            status: 'En Route',
            priority: 'High',
            currentLocation: 'Panvel',
            direction: 'up',
            delayMinutes: 15,
            currentPlatform: '2',
            nextStation: 'Ratnagiri',
            nextPlatform: '1'
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching trains data:', error);
      // Set some mock data for demonstration
      setTrains([
        {
          id: '12951',
          name: 'Mumbai Rajdhani',
          type: 'Express',
          from: 'Mumbai',
          to: 'Delhi',
          departure: '16:00',
          arrival: '08:00',
          status: 'En Route',
          priority: 'High',
          currentLocation: 'Panvel',
          direction: 'up',
          delayMinutes: 15,
          currentPlatform: '2',
          nextStation: 'Ratnagiri',
          nextPlatform: '1'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!propTrains) {
      fetchTrainsData();
    } else {
      setTrains(propTrains);
      setLoading(false);
    }
  }, [propTrains]);

  useEffect(() => {
    if (trains.length > 0) {
      analyzeTrafficSituation();
    }
  }, [trains]);

  const analyzeTrafficSituation = async () => {
    if (trains.length === 0) return;
    
    try {
      // Try to get ML-powered traffic control decisions
      const mlDecisions = await mlService.getTrafficControlDecisions(trains, []);
      
      // Transform ML decisions to our format
      const trafficDecisions: TrafficDecision[] = mlDecisions.decisions.map(decision => ({
        trainId: decision.trainId,
        action: decision.action as any,
        reason: decision.reason,
        duration: decision.duration,
        alternativeRoute: decision.alternativeRoute,
        expectedBenefit: decision.expectedBenefit,
        priority: 'medium',
        status: 'pending'
      }));
      
      setDecisions(trafficDecisions);
    } catch (error) {
      console.warn('ML traffic analysis unavailable, using fallback:', error);
      // Generate fallback decisions
      const fallbackDecisions = generateFallbackDecisions(trains);
      setDecisions(fallbackDecisions);
    }
    
    // Analyze conflicts
    const detectedConflicts = detectConflicts(trains);
    setConflicts(detectedConflicts);
  };

  const detectConflicts = (trains: Train[]): ConflictAnalysis[] => {
    const conflicts: ConflictAnalysis[] = [];
    
    // Platform conflicts
    const stationGroups = new Map<string, Train[]>();
    trains.forEach(train => {
      const station = train.currentLocation.toLowerCase();
      if (!stationGroups.has(station)) {
        stationGroups.set(station, []);
      }
      stationGroups.get(station)!.push(train);
    });

    stationGroups.forEach((stationTrains, station) => {
      if (stationTrains.length > 2) {
        conflicts.push({
          conflictId: `platform-${station}`,
          trainsInvolved: stationTrains.map(t => t.id),
          conflictType: 'platform',
          severity: stationTrains.length > 3 ? 'high' : 'medium',
          location: station,
          recommendedActions: [
            {
              trainId: stationTrains[0].id,
              action: 'hold',
              reason: 'Platform congestion detected',
              duration: 10,
              expectedBenefit: 'Reduce platform conflicts',
              priority: 'high',
              status: 'pending'
            }
          ]
        });
      }
    });

    // Timing conflicts (trains with high delays)
    const delayedTrains = trains.filter(t => t.delayMinutes && t.delayMinutes > 20);
    if (delayedTrains.length > 1) {
      conflicts.push({
        conflictId: 'timing-delays',
        trainsInvolved: delayedTrains.map(t => t.id),
        conflictType: 'timing',
        severity: 'medium',
        location: 'Multiple sections',
        recommendedActions: delayedTrains.map(train => ({
          trainId: train.id,
          action: train.type === 'Express' ? 'release' : 'hold',
          reason: `${train.type} priority management`,
          expectedBenefit: 'Optimize overall system performance',
          priority: train.type === 'Express' ? 'high' : 'medium',
          status: 'pending'
        }))
      });
    }

    return conflicts;
  };

  const generateFallbackDecisions = (trains: Train[]): TrafficDecision[] => {
    const decisions: TrafficDecision[] = [];
    
    trains.forEach(train => {
      const delayMinutes = train.delayMinutes || 0;
      
      if (delayMinutes > 30) {
        decisions.push({
          trainId: train.id,
          action: 'hold',
          reason: `Significant delay detected (${delayMinutes} min)`,
          duration: 15,
          expectedBenefit: 'Prevent cascade delays to other trains',
          priority: 'high',
          status: 'pending'
        });
      } else if (train.type === 'Express' && delayMinutes > 10) {
        decisions.push({
          trainId: train.id,
          action: 'release',
          reason: 'Express service priority',
          expectedBenefit: 'Maintain express schedule integrity',
          priority: 'high',
          status: 'pending'
        });
      } else if (delayMinutes > 15) {
        decisions.push({
          trainId: train.id,
          action: 'speed_adjust',
          reason: 'Moderate delay recovery',
          expectedBenefit: 'Recover 5-8 minutes through speed optimization',
          priority: 'medium',
          status: 'pending'
        });
      }
    });

    // If no specific decisions, add some general optimization recommendations
    if (decisions.length === 0 && trains.length > 0) {
      decisions.push({
        trainId: trains[0].id,
        action: 'speed_adjust',
        reason: 'Routine optimization check',
        expectedBenefit: 'Maintain optimal schedule adherence',
        priority: 'low',
        status: 'pending'
      });

      if (trains.length > 1) {
        decisions.push({
          trainId: trains[1].id,
          action: 'platform_change',
          reason: 'Platform utilization optimization',
          expectedBenefit: 'Improve passenger flow and reduce congestion',
          priority: 'medium',
          status: 'pending'
        });
      }
    }

    return decisions.slice(0, 8); // Limit to top 8 decisions
  };

  const executeDecision = async (decision: TrafficDecision) => {
    // Update decision status
    setDecisions(prev => prev.map(d => 
      d.trainId === decision.trainId && d.action === decision.action
        ? { ...d, status: 'executing' }
        : d
    ));

    // Add to action log
    setActionLog(prev => [{
      timestamp: new Date().toLocaleTimeString(),
      trainId: decision.trainId,
      action: decision.action,
      status: 'executing'
    }, ...prev.slice(0, 9)]);

    // Simulate execution time
    setTimeout(() => {
      setDecisions(prev => prev.map(d => 
        d.trainId === decision.trainId && d.action === decision.action
          ? { ...d, status: 'completed' }
          : d
      ));

      // Update action log
      setActionLog(prev => prev.map(log => 
        log.trainId === decision.trainId && log.action === decision.action
          ? { ...log, status: 'completed' }
          : log
      ));

      // Notify parent component if callback provided
      if (onTrainAction) {
        onTrainAction(decision.trainId, decision.action, {
          reason: decision.reason,
          duration: decision.duration,
          alternativeRoute: decision.alternativeRoute
        });
      }
    }, 2000);
  };

  const executeAllDecisions = async () => {
    const pendingDecisions = decisions.filter(d => d.status === 'pending');
    for (const decision of pendingDecisions) {
      await executeDecision(decision);
      // Small delay between executions
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'hold': return <Pause className="w-4 h-4" />;
      case 'release': return <Play className="w-4 h-4" />;
      case 'reroute': return <RotateCcw className="w-4 h-4" />;
      case 'speed_adjust': return <Zap className="w-4 h-4" />;
      case 'platform_change': return <MapPin className="w-4 h-4" />;
      default: return <ArrowRight className="w-4 h-4" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'hold': return 'text-red-400 bg-red-900/30 border-red-700';
      case 'release': return 'text-green-400 bg-green-900/30 border-green-700';
      case 'reroute': return 'text-blue-400 bg-blue-900/30 border-blue-700';
      case 'speed_adjust': return 'text-yellow-400 bg-yellow-900/30 border-yellow-700';
      case 'platform_change': return 'text-purple-400 bg-purple-900/30 border-purple-700';
      default: return 'text-slate-400 bg-slate-900/30 border-slate-700';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-slate-400';
    }
  };

  if (loading && trains.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-3">
          <RefreshCw className="w-6 h-6 text-blue-400 animate-spin" />
          <span className="text-white text-lg">Loading traffic data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Traffic Control Center</h2>
          <p className="text-slate-400">AI-powered traffic management and optimization</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${trains.length > 0 ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
            <span className="text-sm text-slate-400">
              {trains.length > 0 ? `${trains.length} trains loaded` : 'No data'}
            </span>
          </div>
          <button
            onClick={() => setAutoMode(!autoMode)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              autoMode ? 'bg-green-600 hover:bg-green-700' : 'bg-slate-600 hover:bg-slate-700'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>{autoMode ? 'Auto Mode ON' : 'Manual Mode'}</span>
          </button>
          <button
            onClick={() => {
              if (!propTrains) {
                fetchTrainsData();
              }
              analyzeTrafficSituation();
            }}
            disabled={loading}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Loading...' : 'Refresh Analysis'}</span>
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={executeAllDecisions}
          disabled={decisions.filter(d => d.status === 'pending').length === 0}
          className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed p-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
        >
          <CheckCircle className="w-5 h-5" />
          <span className="font-medium">Execute All Actions</span>
        </button>
        <button 
          onClick={() => {
            setActionLog(prev => [{
              timestamp: new Date().toLocaleTimeString(),
              trainId: 'ALL',
              action: 'emergency_stop',
              status: 'executed'
            }, ...prev.slice(0, 9)]);
            alert('Emergency stop activated for all trains!');
          }}
          className="bg-red-600 hover:bg-red-700 p-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
        >
          <AlertTriangle className="w-5 h-5" />
          <span className="font-medium">Emergency Stop</span>
        </button>
        <button 
          onClick={() => {
            trains.forEach(train => {
              setActionLog(prev => [{
                timestamp: new Date().toLocaleTimeString(),
                trainId: train.id,
                action: 'hold',
                status: 'executed'
              }, ...prev.slice(0, 9)]);
            });
            alert(`Holding all ${trains.length} trains at current positions!`);
          }}
          className="bg-yellow-600 hover:bg-yellow-700 p-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
        >
          <Clock className="w-5 h-5" />
          <span className="font-medium">Hold All Trains</span>
        </button>
        <button 
          onClick={() => {
            trains.forEach(train => {
              setActionLog(prev => [{
                timestamp: new Date().toLocaleTimeString(),
                trainId: train.id,
                action: 'release',
                status: 'executed'
              }, ...prev.slice(0, 9)]);
            });
            alert(`Released all ${trains.length} trains for normal operation!`);
          }}
          className="bg-blue-600 hover:bg-blue-700 p-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
        >
          <Play className="w-5 h-5" />
          <span className="font-medium">Release All</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Traffic Decisions */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Recommended Actions</h3>
              <span className="text-sm text-slate-400">{decisions.length} decisions</span>
            </div>
            
            {trains.length === 0 ? (
              <div className="text-center py-8">
                <RefreshCw className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-400">No train data available</p>
                <p className="text-sm text-slate-500">Click refresh to load train information</p>
                <button
                  onClick={() => {
                    if (!propTrains) {
                      fetchTrainsData();
                    }
                  }}
                  className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Load Train Data
                </button>
              </div>
            ) : decisions.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
                <p className="text-slate-400">No traffic control actions needed</p>
                <p className="text-sm text-slate-500">All {trains.length} trains operating normally</p>
              </div>
            ) : (
              <div className="space-y-4">
                {decisions.map((decision, index) => (
                  <div
                    key={index}
                    className={`rounded-lg p-4 border ${getActionColor(decision.action)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">
                          {getActionIcon(decision.action)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-medium text-white">Train {decision.trainId}</h4>
                            <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(decision.priority)}`}>
                              {decision.priority.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-sm text-slate-300 mb-2">{decision.reason}</p>
                          <p className="text-xs text-slate-400">{decision.expectedBenefit}</p>
                          {decision.duration && (
                            <p className="text-xs text-slate-400 mt-1">Duration: {decision.duration} minutes</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {decision.status === 'pending' && (
                          <button
                            onClick={() => executeDecision(decision)}
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs font-medium transition-colors"
                          >
                            Execute
                          </button>
                        )}
                        {decision.status === 'executing' && (
                          <span className="px-3 py-1 bg-yellow-600 rounded text-xs font-medium">
                            Executing...
                          </span>
                        )}
                        {decision.status === 'completed' && (
                          <span className="px-3 py-1 bg-green-600 rounded text-xs font-medium">
                            Completed
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Conflict Analysis */}
          {conflicts.length > 0 && (
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <h3 className="text-xl font-semibold text-white mb-6">Conflict Analysis</h3>
              <div className="space-y-4">
                {conflicts.map((conflict, index) => (
                  <div key={index} className="bg-slate-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-white capitalize">
                        {conflict.conflictType} Conflict
                      </h4>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        conflict.severity === 'high' ? 'bg-red-600 text-red-100' :
                        conflict.severity === 'medium' ? 'bg-yellow-600 text-yellow-100' :
                        'bg-green-600 text-green-100'
                      }`}>
                        {conflict.severity.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-slate-300 mb-2">Location: {conflict.location}</p>
                    <p className="text-sm text-slate-400">
                      Trains involved: {conflict.trainsInvolved.join(', ')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Control Panel */}
        <div className="space-y-6">
          {/* Action Log */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-4">Action Log</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {actionLog.length === 0 ? (
                <p className="text-slate-400 text-sm">No actions executed yet</p>
              ) : (
                actionLog.map((log, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-slate-700 rounded">
                    <div>
                      <p className="text-sm text-white">Train {log.trainId}</p>
                      <p className="text-xs text-slate-400">{log.action}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-400">{log.timestamp}</p>
                      <span className={`text-xs px-2 py-1 rounded ${
                        log.status === 'completed' ? 'bg-green-600 text-green-100' :
                        'bg-yellow-600 text-yellow-100'
                      }`}>
                        {log.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* System Status */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-4">System Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Active Trains</span>
                <span className="text-white font-medium">{trains.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Pending Actions</span>
                <span className="text-yellow-400 font-medium">
                  {decisions.filter(d => d.status === 'pending').length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Conflicts Detected</span>
                <span className="text-red-400 font-medium">{conflicts.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">System Mode</span>
                <span className={`font-medium ${autoMode ? 'text-green-400' : 'text-blue-400'}`}>
                  {autoMode ? 'Automatic' : 'Manual'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrafficControl;