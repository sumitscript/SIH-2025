import React, { useState, useEffect } from 'react';
import { TrainIcon, AlertTriangle, Clock, MapPin, Zap, Users, TrendingUp, Settings, Brain, Radio } from 'lucide-react';
import Dashboard from './components/Dashboard';
import TrainMap from './components/TrainMap';
import ScheduleOptimizer from './components/ScheduleOptimizer';
import AlertsPanel from './components/AlertsPanel';
import AnalyticsView from './components/AnalyticsView';
import AIRecommendationEngine from './components/AIRecommendationEngine';
import LiveTrafficControl from './components/LiveTrafficControl';
import DigitalTwinSimulation from './components/DigitalTwinSimulation';

function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
    { id: 'map', label: 'Live Map', icon: MapPin },
    { id: 'ai-engine', label: 'AI Engine', icon: Brain },
    { id: 'scheduler', label: 'AI Optimizer', icon: Zap },
    { id: 'control', label: 'Traffic Control', icon: Radio },
    { id: 'alerts', label: 'Alerts', icon: AlertTriangle },
    {id:'Digital',label:'Digitalsimiultor',icon:Radio},
    { id: 'analytics', label: 'Analytics', icon: Users }
  ];

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />;
      case 'map':
        return <TrainMap />;
      case 'ai-engine':
        return <AIRecommendationEngine />;
      case 'scheduler':
        return <ScheduleOptimizer />;
      case 'control':
        return <LiveTrafficControl />;
      case 'alerts':
        return <AlertsPanel />;
      case 'Digital':
        return <DigitalTwinSimulation/>;
      case 'analytics':
        return <AnalyticsView />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <TrainIcon className="w-8 h-8 text-blue-400" />
              <div>
                <h1 className="text-xl font-bold">RailAI Traffic Control</h1>
                <p className="text-sm text-slate-400">Intelligent Railway Management System</p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <div className="text-right">
              <p className="text-sm text-slate-400">System Time</p>
              <p className="font-mono text-green-400">
                {currentTime.toLocaleTimeString('en-IN')}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-400">AI Active</span>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-slate-800 border-b border-slate-700">
        <div className="px-6">
          <div className="flex space-x-6 overflow-x-auto">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={`flex items-center space-x-2 px-4 py-3 border-b-2 transition-colors ${
                    activeView === item.id
                      ? 'border-blue-500 text-blue-400'
                      : 'border-transparent text-slate-400 hover:text-white whitespace-nowrap'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="p-6">
        {renderView()}
      </main>
    </div>
  );
}

export default App;