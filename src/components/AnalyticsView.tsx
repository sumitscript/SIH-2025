import React, { useState } from 'react';
import { TrendingUp, Clock, Train, Users, BarChart3, PieChart, Activity, Zap } from 'lucide-react';

const AnalyticsView: React.FC = () => {
  const [timeRange, setTimeRange] = useState('24h');

  const performanceData = {
    onTimePerformance: 84.2,
    averageDelay: 12.8,
    totalTrains: 1247,
    passengersServed: 2856743,
    systemEfficiency: 91.5,
    aiOptimizations: 156
  };

  const chartData = {
    delays: [
      { hour: '00:00', delays: 3 },
      { hour: '04:00', delays: 1 },
      { hour: '08:00', delays: 8 },
      { hour: '12:00', delays: 12 },
      { hour: '16:00', delays: 15 },
      { hour: '20:00', delays: 9 }
    ],
    routes: [
      { route: 'Delhi-Mumbai', performance: 88.5, volume: 245 },
      { route: 'Mumbai-Chennai', performance: 92.1, volume: 198 },
      { route: 'Kolkata-Delhi', performance: 79.3, volume: 167 },
      { route: 'Bangalore-Hyderabad', performance: 95.2, volume: 134 },
      { route: 'Chennai-Bangalore', performance: 87.9, volume: 156 }
    ]
  };

  const MetricCard = ({ title, value, icon: Icon, color, unit = '' }: any) => (
    <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-400 text-sm font-medium">{title}</p>
          <p className={`text-3xl font-bold ${color} mt-2`}>
            {value}{unit}
          </p>
        </div>
        <Icon className={`w-10 h-10 ${color} opacity-80`} />
      </div>
    </div>
  );

  const DelayChart = () => (
    <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-white">Delay Patterns</h3>
        <div className="flex items-center space-x-2">
          <BarChart3 className="w-5 h-5 text-blue-400" />
          <span className="text-sm text-slate-400">Last 24 Hours</span>
        </div>
      </div>
      
      <div className="h-64 flex items-end justify-between space-x-2">
        {chartData.delays.map((data, index) => (
          <div key={index} className="flex-1 flex flex-col items-center">
            <div
              className="w-full bg-blue-500 rounded-t transition-all hover:bg-blue-400"
              style={{ height: `${(data.delays / 15) * 100}%`, minHeight: '4px' }}
            ></div>
            <span className="text-xs text-slate-400 mt-2">{data.hour}</span>
          </div>
        ))}
      </div>
      
      <div className="mt-4 text-center">
        <span className="text-sm text-slate-400">Peak delay time: 16:00-20:00</span>
      </div>
    </div>
  );

  const RoutePerformance = () => (
    <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-white">Route Performance</h3>
        <PieChart className="w-5 h-5 text-green-400" />
      </div>
      
      <div className="space-y-4">
        {chartData.routes.map((route, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-300">{route.route}</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-slate-400">{route.volume} trains</span>
                <span className={`text-sm font-medium ${
                  route.performance >= 90 ? 'text-green-400' :
                  route.performance >= 80 ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {route.performance}%
                </span>
              </div>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  route.performance >= 90 ? 'bg-green-500' :
                  route.performance >= 80 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${route.performance}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const AIInsights = () => (
    <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded-lg p-6 border border-purple-700/50">
      <div className="flex items-center space-x-3 mb-4">
        <Zap className="w-6 h-6 text-purple-400" />
        <h3 className="text-lg font-bold text-white">AI Performance Insights</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-800/50 rounded-lg p-4">
          <h4 className="font-medium text-blue-400 mb-2">Optimization Impact</h4>
          <p className="text-sm text-slate-300 mb-2">
            AI suggestions implemented in the last 24 hours have reduced average delays by 18.5%
          </p>
          <div className="text-2xl font-bold text-green-400">+18.5%</div>
        </div>
        
        <div className="bg-slate-800/50 rounded-lg p-4">
          <h4 className="font-medium text-yellow-400 mb-2">Predictive Accuracy</h4>
          <p className="text-sm text-slate-300 mb-2">
            Delay predictions have been accurate within 5 minutes for 92% of trains
          </p>
          <div className="text-2xl font-bold text-yellow-400">92%</div>
        </div>
        
        <div className="bg-slate-800/50 rounded-lg p-4">
          <h4 className="font-medium text-green-400 mb-2">Route Efficiency</h4>
          <p className="text-sm text-slate-300 mb-2">
            Dynamic rerouting has improved throughput on high-traffic corridors
          </p>
          <div className="text-2xl font-bold text-green-400">+12.3%</div>
        </div>
        
        <div className="bg-slate-800/50 rounded-lg p-4">
          <h4 className="font-medium text-red-400 mb-2">Cost Savings</h4>
          <p className="text-sm text-slate-300 mb-2">
            Optimized scheduling has reduced operational costs by ₹2.4 crores this month
          </p>
          <div className="text-2xl font-bold text-red-400">₹2.4Cr</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">System Analytics</h2>
          <p className="text-slate-400">Performance insights and operational metrics</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white"
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MetricCard
          title="On-Time Performance"
          value={performanceData.onTimePerformance}
          icon={Clock}
          color="text-green-400"
          unit="%"
        />
        <MetricCard
          title="Average Delay"
          value={performanceData.averageDelay}
          icon={Activity}
          color="text-yellow-400"
          unit=" min"
        />
        <MetricCard
          title="Total Trains"
          value={performanceData.totalTrains.toLocaleString()}
          icon={Train}
          color="text-blue-400"
        />
        <MetricCard
          title="Passengers Served"
          value={(performanceData.passengersServed / 1000000).toFixed(1)}
          icon={Users}
          color="text-purple-400"
          unit="M"
        />
        <MetricCard
          title="System Efficiency"
          value={performanceData.systemEfficiency}
          icon={TrendingUp}
          color="text-cyan-400"
          unit="%"
        />
        <MetricCard
          title="AI Optimizations"
          value={performanceData.aiOptimizations}
          icon={Zap}
          color="text-orange-400"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DelayChart />
        <RoutePerformance />
      </div>

      {/* AI Insights */}
      <AIInsights />

      {/* Additional Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h3 className="text-lg font-bold text-white mb-4">Peak Hours Analysis</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Morning Rush</span>
              <span className="text-red-400 font-medium">7:00 - 10:00</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Evening Rush</span>
              <span className="text-red-400 font-medium">17:00 - 20:00</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Off Peak</span>
              <span className="text-green-400 font-medium">10:00 - 17:00</span>
            </div>
          </div>
        </div>

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
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h3 className="text-lg font-bold text-white mb-4">Maintenance Windows</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Scheduled</span>
              <span className="text-blue-400 font-medium">23</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Emergency</span>
              <span className="text-red-400 font-medium">7</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Completed</span>
              <span className="text-green-400 font-medium">156</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsView;