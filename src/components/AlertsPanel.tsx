import React, { useState, useEffect } from 'react';
import { AlertTriangle, Clock, MapPin, Zap, CheckCircle, X, Filter, RefreshCw } from 'lucide-react';
import { apiService } from '../services/apiService';
import { transformApiTrainToTrain } from '../utils/dataTransform';
import { generateKonkanAlerts, Alert } from '../utils/alertSystem';
import { loadStationData } from '../utils/stationData';

const AlertsPanel: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filter, setFilter] = useState('all');
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAlertsData = async () => {
    try {
      setLoading(true);
      
      // Fetch trains and stations data
      const [trainsResponse, stationsData] = await Promise.all([
        apiService.fetchAllTrains(),
        loadStationData()
      ]);
      
      if (trainsResponse.success) {
        const transformedTrains = Object.entries(trainsResponse.trains).map(([trainNo, trainData]) =>
          transformApiTrainToTrain(trainNo, trainData)
        );
        
        // Generate alerts based on real data
        const generatedAlerts = generateKonkanAlerts(transformedTrains, stationsData);
        setAlerts(generatedAlerts);
      }
    } catch (error) {
      console.error('Error fetching alerts data:', error);
      // Fallback to empty alerts
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlertsData();
    
    // Refresh alerts every 30 seconds
    const interval = setInterval(fetchAlertsData, 30000);
    return () => clearInterval(interval);
  }, []);

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'all') return true;
    return alert.severity.toLowerCase() === filter.toLowerCase();
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-700/50';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-700/50';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-700/50';
      case 'low': return 'bg-green-500/20 text-green-400 border-green-700/50';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-700/50';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="w-5 h-5" />;
      case 'high': return <AlertTriangle className="w-5 h-5" />;
      case 'medium': return <Clock className="w-5 h-5" />;
      case 'low': return <MapPin className="w-5 h-5" />;
      default: return <AlertTriangle className="w-5 h-5" />;
    }
  };

  const handleResolveAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
    setSelectedAlert(null);
  };

  const handleTakeAction = (alert: Alert) => {
    // Simulate taking action based on alert type
    const actionMessages = {
      delay: `Initiated speed optimization for delayed trains: ${alert.affectedTrains.join(', ')}`,
      platform_conflict: `Activated platform reallocation protocol at ${alert.location}`,
      congestion: `Implemented traffic flow management at ${alert.location}`,
      incident: `Emergency response team dispatched to ${alert.location}`,
      weather: `Weather safety protocols activated for affected section`,
      maintenance: `Maintenance team notified and scheduled for ${alert.location}`
    };

    const message = actionMessages[alert.type] || `Action taken for ${alert.type} alert at ${alert.location}`;
    
    // Update alert recommendations to show action taken
    setAlerts(prev => prev.map(a => 
      a.id === alert.id 
        ? { ...a, recommendations: [...a.recommendations, `✓ ${message}`] }
        : a
    ));

    alert(`Action Taken: ${message}`);
    setSelectedAlert(null);
  };

  const AlertCard = ({ alert, onClick }: { alert: Alert; onClick: (alert: Alert) => void }) => (
    <div
      className={`rounded-lg p-4 border cursor-pointer transition-all hover:bg-slate-700/50 ${getSeverityColor(alert.severity)}`}
      onClick={() => onClick(alert)}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-0.5">
          {getSeverityIcon(alert.severity)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-white truncate">{alert.title}</h3>
            <span className="text-xs text-slate-400 whitespace-nowrap ml-2">
              {new Date(alert.timestamp).toLocaleTimeString()}
            </span>
          </div>
          <p className="text-sm text-slate-300 mb-3">{alert.description}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MapPin className="w-3 h-3" />
              <span className="text-xs text-slate-400 capitalize">{alert.location}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {alert.affectedTrains.length > 0 && (
                  <span className="text-xs text-slate-400">
                    {alert.affectedTrains.length} trains
                  </span>
                )}
                <div className="flex items-center space-x-1">
                  <Zap className="w-3 h-3 text-blue-400" />
                  <span className="text-xs text-blue-400">System</span>
                </div>
              </div>
              <div className="flex space-x-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTakeAction(alert);
                  }}
                  className="px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs font-medium transition-colors"
                >
                  Act
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleResolveAlert(alert.id);
                  }}
                  className="px-2 py-1 bg-green-600 hover:bg-green-700 rounded text-xs font-medium transition-colors"
                >
                  Resolve
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const AlertDetail = ({ alert, onClose }: { alert: Alert; onClose: () => void }) => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-lg border border-slate-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center space-x-3">
            {getSeverityIcon(alert.severity)}
            <div>
              <h2 className="text-xl font-bold text-white">{alert.title}</h2>
              <div className="flex items-center space-x-4 mt-1">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                  {alert.severity.toUpperCase()}
                </span>
                <span className="text-sm text-slate-400">
                  {new Date(alert.timestamp).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h3 className="font-medium text-white mb-2">Description</h3>
            <p className="text-slate-300">{alert.description}</p>
          </div>

          <div>
            <h3 className="font-medium text-white mb-2">Location</h3>
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-slate-400" />
              <span className="text-slate-300 capitalize">{alert.location}</span>
            </div>
          </div>

          {alert.affectedTrains && alert.affectedTrains.length > 0 && (
            <div>
              <h3 className="font-medium text-white mb-2">Affected Trains</h3>
              <div className="grid grid-cols-2 gap-2">
                {alert.affectedTrains.map((trainId: string, index: number) => (
                  <div key={index} className="bg-slate-900 rounded p-2">
                    <span className="text-sm text-slate-300">Train {trainId}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {alert.estimatedResolution && (
            <div>
              <h3 className="font-medium text-white mb-2">Estimated Resolution</h3>
              <div className="bg-yellow-900/30 rounded-lg p-3 border border-yellow-700/50">
                <p className="text-sm text-yellow-300">{alert.estimatedResolution}</p>
              </div>
            </div>
          )}

          {alert.recommendations && alert.recommendations.length > 0 && (
            <div>
              <h3 className="font-medium text-blue-400 mb-2 flex items-center space-x-2">
                <Zap className="w-4 h-4" />
                <span>System Recommendations</span>
              </h3>
              <div className="bg-blue-900/30 rounded-lg p-4 border border-blue-700/50">
                <div className="space-y-2">
                  <ul className="space-y-1">
                    {alert.recommendations.map((recommendation: string, index: number) => (
                      <li key={index} className="flex items-center space-x-2 text-sm text-blue-300">
                        <CheckCircle className="w-3 h-3" />
                        <span>{recommendation}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg font-medium transition-colors"
            >
              Close
            </button>
            <button 
              onClick={() => handleResolveAlert(alert.id)}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-medium transition-colors"
            >
              Mark Resolved
            </button>
            <button 
              onClick={() => handleTakeAction(alert)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
            >
              Take Action
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-3">
          <RefreshCw className="w-6 h-6 text-blue-400 animate-spin" />
          <span className="text-white text-lg">Loading alerts...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Konkan Railway Alerts</h2>
          <p className="text-slate-400">Real-time monitoring and system recommendations</p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={fetchAlertsData}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded px-3 py-1 text-white"
            >
              <option value="all">All Alerts</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div className="text-sm text-slate-400">
            {filteredAlerts.length} of {alerts.length} alerts
          </div>
        </div>
      </div>

      {/* Alert Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {['critical', 'high', 'medium', 'low'].map((severity) => {
          const count = alerts.filter(a => a.severity === severity).length;
          return (
            <div key={severity} className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm capitalize">{severity}</p>
                  <p className={`text-2xl font-bold ${
                    severity === 'critical' ? 'text-red-400' :
                    severity === 'high' ? 'text-orange-400' :
                    severity === 'medium' ? 'text-yellow-400' :
                    'text-green-400'
                  }`}>
                    {count}
                  </p>
                </div>
                {getSeverityIcon(severity)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Alerts List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredAlerts.map((alert) => (
          <AlertCard
            key={alert.id}
            alert={alert}
            onClick={() => setSelectedAlert(alert)}
          />
        ))}
      </div>

      {/* Alert Detail Modal */}
      {selectedAlert && (
        <AlertDetail
          alert={selectedAlert}
          onClose={() => setSelectedAlert(null)}
        />
      )}
    </div>
  );
};

export default AlertsPanel;