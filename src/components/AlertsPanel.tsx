import React, { useState, useEffect } from 'react';
import { AlertTriangle, Clock, MapPin, Zap, CheckCircle, X, Filter } from 'lucide-react';
import { generateAlerts } from '../utils/alertsData';

const AlertsPanel: React.FC = () => {
  const [alerts, setAlerts] = useState(generateAlerts(25));
  const [filter, setFilter] = useState('all');
  const [selectedAlert, setSelectedAlert] = useState<any>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setAlerts(generateAlerts(25));
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'all') return true;
    return alert.severity.toLowerCase() === filter.toLowerCase();
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical': return 'bg-red-500/20 text-red-400 border-red-700/50';
      case 'High': return 'bg-orange-500/20 text-orange-400 border-orange-700/50';
      case 'Medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-700/50';
      case 'Low': return 'bg-green-500/20 text-green-400 border-green-700/50';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-700/50';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'Critical': return <AlertTriangle className="w-5 h-5" />;
      case 'High': return <AlertTriangle className="w-5 h-5" />;
      case 'Medium': return <Clock className="w-5 h-5" />;
      case 'Low': return <MapPin className="w-5 h-5" />;
      default: return <AlertTriangle className="w-5 h-5" />;
    }
  };

  const AlertCard = ({ alert, onClick }: any) => (
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
            <span className="text-xs text-slate-400 whitespace-nowrap ml-2">{alert.timestamp}</span>
          </div>
          <p className="text-sm text-slate-300 mb-3">{alert.description}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MapPin className="w-3 h-3" />
              <span className="text-xs text-slate-400">{alert.location}</span>
            </div>
            {alert.aiRecommendation && (
              <div className="flex items-center space-x-1">
                <Zap className="w-3 h-3 text-blue-400" />
                <span className="text-xs text-blue-400">AI</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const AlertDetail = ({ alert, onClose }: any) => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-lg border border-slate-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center space-x-3">
            {getSeverityIcon(alert.severity)}
            <div>
              <h2 className="text-xl font-bold text-white">{alert.title}</h2>
              <div className="flex items-center space-x-4 mt-1">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                  {alert.severity}
                </span>
                <span className="text-sm text-slate-400">{alert.timestamp}</span>
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
            <p className="text-slate-300">{alert.detailedDescription || alert.description}</p>
          </div>

          <div>
            <h3 className="font-medium text-white mb-2">Location</h3>
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-slate-400" />
              <span className="text-slate-300">{alert.location}</span>
            </div>
          </div>

          {alert.affectedTrains && (
            <div>
              <h3 className="font-medium text-white mb-2">Affected Trains</h3>
              <div className="grid grid-cols-2 gap-2">
                {alert.affectedTrains.map((train: string, index: number) => (
                  <div key={index} className="bg-slate-900 rounded p-2">
                    <span className="text-sm text-slate-300">{train}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {alert.estimatedImpact && (
            <div>
              <h3 className="font-medium text-white mb-2">Estimated Impact</h3>
              <div className="bg-yellow-900/30 rounded-lg p-3 border border-yellow-700/50">
                <p className="text-sm text-yellow-300">{alert.estimatedImpact}</p>
              </div>
            </div>
          )}

          {alert.aiRecommendation && (
            <div>
              <h3 className="font-medium text-blue-400 mb-2 flex items-center space-x-2">
                <Zap className="w-4 h-4" />
                <span>AI Recommendation</span>
              </h3>
              <div className="bg-blue-900/30 rounded-lg p-4 border border-blue-700/50">
                <p className="text-sm text-blue-300 mb-3">{alert.aiRecommendation}</p>
                {alert.aiActions && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-blue-400">Suggested Actions:</h4>
                    <ul className="space-y-1">
                      {alert.aiActions.map((action: string, index: number) => (
                        <li key={index} className="flex items-center space-x-2 text-sm text-blue-300">
                          <CheckCircle className="w-3 h-3" />
                          <span>{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
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
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors">
              Take Action
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">System Alerts</h2>
          <p className="text-slate-400">Real-time monitoring and AI-powered recommendations</p>
        </div>
        <div className="flex items-center space-x-4">
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
        {['Critical', 'High', 'Medium', 'Low'].map((severity) => {
          const count = alerts.filter(a => a.severity === severity).length;
          return (
            <div key={severity} className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">{severity}</p>
                  <p className={`text-2xl font-bold ${
                    severity === 'Critical' ? 'text-red-400' :
                    severity === 'High' ? 'text-orange-400' :
                    severity === 'Medium' ? 'text-yellow-400' :
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
            onClick={setSelectedAlert}
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