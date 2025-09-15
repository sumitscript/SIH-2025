import React, { useState, useEffect } from 'react';
import { TrendingUp, Clock, BarChart3, Calendar, Download, AlertTriangle, CheckCircle } from 'lucide-react';

interface AnalyticsData {
  timeFrame: '7d' | '15d' | '30d' | '3m' | '6m' | '1y';
  onTimePerformance: number;
  averageDelay: number;
  totalTrains: number;
  delayedTrains: number;
  platformUtilization: Record<string, number>;
  stationPerformance: Array<{
    station: string;
    onTimeRate: number;
    avgDelay: number;
    trainCount: number;
  }>;
  delayTrends: Array<{
    date: string;
    avgDelay: number;
    trainCount: number;
  }>;
  incidentReports: Array<{
    date: string;
    type: string;
    location: string;
    impact: string;
    resolution: string;
  }>;
}

const AnalyticsView: React.FC = () => {
  const [selectedTimeFrame, setSelectedTimeFrame] = useState<'7d' | '15d' | '30d' | '3m' | '6m' | '1y'>('30d');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);

  const timeFrameOptions = [
    { value: '7d', label: '7 Days' },
    { value: '15d', label: '15 Days' },
    { value: '30d', label: '30 Days' },
    { value: '3m', label: '3 Months' },
    { value: '6m', label: '6 Months' },
    { value: '1y', label: '1 Year' }
  ];

  useEffect(() => {
    generateAnalyticsData();
  }, [selectedTimeFrame]);

  const generateAnalyticsData = () => {
    setLoading(true);
    // Simulate data generation based on time frame
    setTimeout(() => {
      const baseTrains = selectedTimeFrame === '7d' ? 50 : 
                        selectedTimeFrame === '15d' ? 120 : 
                        selectedTimeFrame === '30d' ? 250 : 
                        selectedTimeFrame === '3m' ? 750 : 
                        selectedTimeFrame === '6m' ? 1500 : 3000;
      
      const totalTrains = baseTrains + Math.floor(Math.random() * 50);
      const delayedTrains = Math.floor(totalTrains * (0.15 + Math.random() * 0.1));
      const onTimeTrains = totalTrains - delayedTrains;
      const onTimePerformance = Math.round((onTimeTrains / totalTrains) * 100);
      const averageDelay = Math.round(8 + Math.random() * 15);

      // Generate station performance data
      const stations = ['Ratnagiri', 'Panvel', 'Madgaon', 'Kankavali', 'Chiplun', 'Roha', 'Sawantwadi'];
      const stationPerformance = stations.map(station => {
        const trainCount = Math.floor(totalTrains / stations.length) + Math.floor(Math.random() * 20);
        const avgDelay = Math.round(5 + Math.random() * 20);
        const onTimeRate = Math.round(75 + Math.random() * 20);
        return {
          station,
          onTimeRate,
          avgDelay,
          trainCount
        };
      }).sort((a, b) => b.trainCount - a.trainCount);

      // Generate delay trends
      const delayTrends = generateDelayTrends(selectedTimeFrame);
      
      // Generate incident reports
      const incidentReports = generateIncidentReports(selectedTimeFrame);
      
      // Platform utilization
      const platformUtilization = {
        'Platform 1': 75 + Math.floor(Math.random() * 20),
        'Platform 2': 65 + Math.floor(Math.random() * 20),
        'Platform 3': 55 + Math.floor(Math.random() * 25),
        'Platform 4': 35 + Math.floor(Math.random() * 30)
      };

      setAnalyticsData({
        timeFrame: selectedTimeFrame,
        onTimePerformance,
        averageDelay,
        totalTrains,
        delayedTrains,
        platformUtilization,
        stationPerformance,
        delayTrends,
        incidentReports
      });
      setLoading(false);
    }, 1000);
  };

  const generateDelayTrends = (timeFrame: string) => {
    const days = timeFrame === '7d' ? 7 : timeFrame === '15d' ? 15 : timeFrame === '30d' ? 30 : 
                 timeFrame === '3m' ? 90 : timeFrame === '6m' ? 180 : 365;
    const trends = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      trends.push({
        date: date.toLocaleDateString(),
        avgDelay: Math.floor(Math.random() * 30) + 5,
        trainCount: Math.floor(Math.random() * 20) + 10
      });
    }
    return trends;
  };

  const generateIncidentReports = (timeFrame: string) => {
    const incidents = [
      {
        date: '2024-01-15',
        type: 'Signal Failure',
        location: 'Ratnagiri Junction',
        impact: '3 trains delayed by avg 25 minutes',
        resolution: 'Signal system restored in 45 minutes'
      },
      {
        date: '2024-01-12',
        type: 'Track Maintenance',
        location: 'Chiplun-Ratnagiri Section',
        impact: '5 trains rerouted via loop line',
        resolution: 'Maintenance completed as scheduled'
      },
      {
        date: '2024-01-10',
        type: 'Weather Disruption',
        location: 'Coastal Section',
        impact: 'Speed restrictions, avg 15 min delay',
        resolution: 'Normal operations resumed after weather cleared'
      },
      {
        date: '2024-01-08',
        type: 'Platform Congestion',
        location: 'Panvel Junction',
        impact: '4 trains held for platform allocation',
        resolution: 'Traffic control protocols activated'
      },
      {
        date: '2024-01-05',
        type: 'Equipment Failure',
        location: 'Madgaon Station',
        impact: '2 trains delayed by 30 minutes',
        resolution: 'Backup systems activated'
      }
    ];
    
    const maxIncidents = timeFrame === '7d' ? 2 : timeFrame === '15d' ? 3 : timeFrame === '30d' ? 4 : 5;
    return incidents.slice(0, maxIncidents);
  };

  const exportReport = () => {
    if (!analyticsData) return;
    const reportData = {
      generatedAt: new Date().toISOString(),
      timeFrame: selectedTimeFrame,
      summary: {
        totalTrains: analyticsData.totalTrains,
        onTimePerformance: analyticsData.onTimePerformance,
        averageDelay: analyticsData.averageDelay,
        delayedTrains: analyticsData.delayedTrains
      },
      stationPerformance: analyticsData.stationPerformance,
      incidentReports: analyticsData.incidentReports
    };
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `konkan-railway-analytics-${selectedTimeFrame}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };



  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-3">
          <BarChart3 className="w-6 h-6 text-blue-400 animate-pulse" />
          <span className="text-white text-lg">Generating analytics report...</span>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="text-center py-8">
        <BarChart3 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
        <p className="text-slate-400">No analytics data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Time Frame Selection */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Konkan Railway Analytics</h2>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <select
              value={selectedTimeFrame}
              onChange={(e) => setSelectedTimeFrame(e.target.value as any)}
              className="bg-slate-800 border border-slate-600 text-white px-3 py-2 rounded-lg focus:outline-none focus:border-blue-500"
            >
              {timeFrameOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={exportReport}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">On-Time Performance</p>
              <p className="text-2xl font-bold text-green-400">{analyticsData.onTimePerformance}%</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
          <p className="text-xs text-slate-500 mt-2">
            {analyticsData.totalTrains - analyticsData.delayedTrains} of {analyticsData.totalTrains} trains on time
          </p>
        </div>
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Average Delay</p>
              <p className="text-2xl font-bold text-orange-400">{analyticsData.averageDelay} min</p>
            </div>
            <Clock className="w-8 h-8 text-orange-400" />
          </div>
          <p className="text-xs text-slate-500 mt-2">
            {analyticsData.delayedTrains} trains with delays
          </p>
        </div>
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Total Trains</p>
              <p className="text-2xl font-bold text-blue-400">{analyticsData.totalTrains}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-400" />
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Active in {selectedTimeFrame} period
          </p>
        </div>
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Incidents</p>
              <p className="text-2xl font-bold text-red-400">{analyticsData.incidentReports.length}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Reported in {selectedTimeFrame}
          </p>
        </div>
      </div>

      {/* Station Performance */}
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h3 className="text-xl font-semibold text-white mb-6">Station Performance Analysis</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left text-slate-400 py-3 px-4">Station</th>
                <th className="text-left text-slate-400 py-3 px-4">On-Time Rate</th>
                <th className="text-left text-slate-400 py-3 px-4">Avg Delay</th>
                <th className="text-left text-slate-400 py-3 px-4">Train Count</th>
                <th className="text-left text-slate-400 py-3 px-4">Performance</th>
              </tr>
            </thead>
            <tbody>
              {analyticsData.stationPerformance.map((station, index) => (
                <tr key={index} className="border-b border-slate-700">
                  <td className="py-3 px-4 text-white font-medium capitalize">{station.station}</td>
                  <td className="py-3 px-4">
                    <span className={`font-medium ${
                      station.onTimeRate >= 80 ? 'text-green-400' :
                      station.onTimeRate >= 60 ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {station.onTimeRate}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-white">{station.avgDelay} min</td>
                  <td className="py-3 px-4 text-white">{station.trainCount}</td>
                  <td className="py-3 px-4">
                    <div className={`w-full bg-slate-700 rounded-full h-2`}>
                      <div 
                        className={`h-2 rounded-full ${
                          station.onTimeRate >= 80 ? 'bg-green-400' :
                          station.onTimeRate >= 60 ? 'bg-yellow-400' : 'bg-red-400'
                        }`}
                        style={{ width: `${station.onTimeRate}%` }}
                      ></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Platform Utilization */}
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h3 className="text-xl font-semibold text-white mb-6">Platform Utilization</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(analyticsData.platformUtilization).map(([platform, utilization]) => (
            <div key={platform} className="bg-slate-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-medium">{platform}</span>
                <span className="text-slate-400 text-sm">{utilization}%</span>
              </div>
              <div className="w-full bg-slate-600 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    utilization >= 80 ? 'bg-red-400' :
                    utilization >= 60 ? 'bg-yellow-400' : 'bg-green-400'
                  }`}
                  style={{ width: `${utilization}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Advanced Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Delay Trends Chart */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h3 className="text-xl font-semibold text-white mb-6">Delay Trends Over Time</h3>
          <div className="h-64 flex items-end justify-between space-x-1">
            {analyticsData.delayTrends.slice(-14).map((trend, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-gradient-to-t from-red-600 to-red-400 rounded-t transition-all hover:from-red-500 hover:to-red-300"
                  style={{ 
                    height: `${Math.max(4, (trend.avgDelay / 30) * 100)}%`,
                    minHeight: '4px'
                  }}
                ></div>
                <span className="text-xs text-slate-400 mt-2 transform -rotate-45 origin-top-left">
                  {trend.date.split('/').slice(0, 2).join('/')}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <span className="text-sm text-slate-400">
              Average delay: {Math.round(analyticsData.delayTrends.reduce((sum, t) => sum + t.avgDelay, 0) / analyticsData.delayTrends.length)} minutes
            </span>
          </div>
        </div>

        {/* Train Volume Analysis */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h3 className="text-xl font-semibold text-white mb-6">Daily Train Volume</h3>
          <div className="h-64 flex items-end justify-between space-x-1">
            {analyticsData.delayTrends.slice(-14).map((trend, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t transition-all hover:from-blue-500 hover:to-blue-300"
                  style={{ 
                    height: `${Math.max(4, (trend.trainCount / 30) * 100)}%`,
                    minHeight: '4px'
                  }}
                ></div>
                <span className="text-xs text-slate-400 mt-2 transform -rotate-45 origin-top-left">
                  {trend.date.split('/').slice(0, 2).join('/')}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <span className="text-sm text-slate-400">
              Peak volume: {Math.max(...analyticsData.delayTrends.map(t => t.trainCount))} trains/day
            </span>
          </div>
        </div>
      </div>

      {/* Performance Heatmap */}
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h3 className="text-xl font-semibold text-white mb-6">Station Performance Heatmap</h3>
        <div className="grid grid-cols-7 gap-2">
          {analyticsData.stationPerformance.map((station, index) => (
            <div key={index} className="text-center">
              <div className="text-xs text-slate-400 mb-2 truncate">{station.station}</div>
              <div 
                className={`h-16 rounded flex items-center justify-center text-white font-bold text-sm ${
                  station.onTimeRate >= 90 ? 'bg-green-500' :
                  station.onTimeRate >= 80 ? 'bg-yellow-500' :
                  station.onTimeRate >= 70 ? 'bg-orange-500' : 'bg-red-500'
                }`}
              >
                {station.onTimeRate}%
              </div>
              <div className="text-xs text-slate-500 mt-1">{station.trainCount} trains</div>
            </div>
          ))}
        </div>
      </div>

      {/* Advanced Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Peak Hours Analysis */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h3 className="text-lg font-bold text-white mb-4">Peak Hours Analysis</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Morning Rush (6-10 AM)</span>
              <div className="flex items-center space-x-2">
                <div className="w-16 bg-slate-700 rounded-full h-2">
                  <div className="bg-red-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
                <span className="text-red-400 font-medium text-sm">85%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Evening Rush (5-9 PM)</span>
              <div className="flex items-center space-x-2">
                <div className="w-16 bg-slate-700 rounded-full h-2">
                  <div className="bg-red-500 h-2 rounded-full" style={{ width: '92%' }}></div>
                </div>
                <span className="text-red-400 font-medium text-sm">92%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Off Peak (10 AM-5 PM)</span>
              <div className="flex items-center space-x-2">
                <div className="w-16 bg-slate-700 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                </div>
                <span className="text-green-400 font-medium text-sm">45%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Night (9 PM-6 AM)</span>
              <div className="flex items-center space-x-2">
                <div className="w-16 bg-slate-700 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '25%' }}></div>
                </div>
                <span className="text-green-400 font-medium text-sm">25%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Weather Impact Analysis */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h3 className="text-lg font-bold text-white mb-4">Weather Impact</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Clear Weather</span>
              <span className="text-green-400 font-medium">94% OTP</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Light Rain</span>
              <span className="text-yellow-400 font-medium">87% OTP</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Heavy Rain</span>
              <span className="text-red-400 font-medium">72% OTP</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Fog</span>
              <span className="text-orange-400 font-medium">68% OTP</span>
            </div>
            <div className="mt-4 p-3 bg-blue-900/30 rounded-lg">
              <p className="text-blue-300 text-sm">
                Weather accounts for 23% of all delays in the {selectedTimeFrame} period
              </p>
            </div>
          </div>
        </div>

        {/* Route Efficiency */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h3 className="text-lg font-bold text-white mb-4">Route Efficiency</h3>
          <div className="space-y-3">
            {[
              { route: 'Mumbai-Goa', efficiency: 89, volume: 45 },
              { route: 'Panvel-Ratnagiri', efficiency: 92, volume: 38 },
              { route: 'Ratnagiri-Madgaon', efficiency: 85, volume: 42 },
              { route: 'Local Sections', efficiency: 78, volume: 67 }
            ].map((route, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-300">{route.route}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-slate-400">{route.volume} trains</span>
                    <span className={`text-sm font-medium ${
                      route.efficiency >= 90 ? 'text-green-400' :
                      route.efficiency >= 80 ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {route.efficiency}%
                    </span>
                  </div>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      route.efficiency >= 90 ? 'bg-green-500' :
                      route.efficiency >= 80 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${route.efficiency}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Incident Reports */}
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h3 className="text-xl font-semibold text-white mb-6">Incident Reports & Analysis</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            {analyticsData.incidentReports.map((incident, index) => (
              <div key={index} className="bg-slate-700 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="w-5 h-5 text-orange-400" />
                    <div>
                      <h4 className="text-white font-medium">{incident.type}</h4>
                      <p className="text-slate-400 text-sm">{incident.location} • {incident.date}</p>
                    </div>
                  </div>
                </div>
                <div className="ml-8 space-y-1">
                  <p className="text-slate-300 text-sm"><strong>Impact:</strong> {incident.impact}</p>
                  <p className="text-slate-300 text-sm"><strong>Resolution:</strong> {incident.resolution}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-slate-700 rounded-lg p-4">
            <h4 className="text-white font-medium mb-4">Incident Categories</h4>
            <div className="space-y-3">
              {[
                { type: 'Signal Failures', count: 12, trend: '+2' },
                { type: 'Track Maintenance', count: 8, trend: '-1' },
                { type: 'Weather Disruptions', count: 15, trend: '+5' },
                { type: 'Equipment Issues', count: 6, trend: '0' },
                { type: 'Platform Congestion', count: 9, trend: '+1' }
              ].map((category, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-slate-300 text-sm">{category.type}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-white font-medium">{category.count}</span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      category.trend.startsWith('+') ? 'bg-red-600 text-red-100' :
                      category.trend.startsWith('-') ? 'bg-green-600 text-green-100' :
                      'bg-slate-600 text-slate-100'
                    }`}>
                      {category.trend}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsView;