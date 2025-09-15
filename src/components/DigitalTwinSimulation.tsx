import React, { useState, useEffect } from 'react';
import { Monitor, Play, Pause, RotateCcw, Zap, Brain, AlertTriangle, CheckCircle, Settings } from 'lucide-react';

interface VirtualTrain {
  id: string;
  name: string;
  virtualPosition: { x: number; y: number };
  realPosition: { x: number; y: number };
  speed: number;
  status: 'running' | 'stopped' | 'delayed' | 'rerouted';
  passengers: number;
  nextStation: string;
  platform: number;
  delay: number;
  trackSection: string;
  direction: 'up' | 'down';
  signalAspect: 'green' | 'yellow' | 'red' | 'flashing';
}

interface Signal {
  id: string;
  name: string;
  position: { x: number; y: number };
  aspect: 'green' | 'yellow' | 'red' | 'flashing';
  type: 'main' | 'ground' | 'distant';
  controlledBy: string;
  trackSection: string;
}

interface TrackSection {
  id: string;
  name: string;
  occupied: boolean;
  trains: string[];
  signals: string[];
}

interface NetworkChange {
  id: string;
  type: 'signal' | 'platform' | 'route' | 'speed' | 'priority';
  description: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  affectedTrains: string[];
  estimatedDelay: number;
  passengerImpact: number;
  costImpact: number;
}

interface SimulationResult {
  scenario: string;
  duration: number;
  totalTrains: number;
  delayReduction: number;
  passengerSatisfaction: number;
  safetyScore: number;
  efficiency: number;
  recommendations: string[];
  risks: string[];
}

const DigitalTwinSimulation: React.FC = () => {
  const [isSimulationRunning, setIsSimulationRunning] = useState(false);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [virtualTrains, setVirtualTrains] = useState<VirtualTrain[]>([]);
  const [realTrains, setRealTrains] = useState<VirtualTrain[]>([]);
  const [virtualSignals, setVirtualSignals] = useState<Signal[]>([]);
  const [realSignals, setRealSignals] = useState<Signal[]>([]);
  const [, setTrackSections] = useState<TrackSection[]>([]);
  const [pendingChanges, setPendingChanges] = useState<NetworkChange[]>([]);
  const [simulationResults, setSimulationResults] = useState<SimulationResult | null>(null);
  const [selectedScenario, setSelectedScenario] = useState('current');
  const [syncStatus, setSyncStatus] = useState<'synced' | 'diverged' | 'testing'>('synced');

  useEffect(() => {
    // Initialize digital twin with current network state
    initializeDigitalTwin();
    
    // Sync with real network every 5 seconds
    const syncInterval = setInterval(() => {
      if (!isSimulationRunning) {
        syncWithRealNetwork();
      }
    }, 5000);

    return () => clearInterval(syncInterval);
  }, []);

  useEffect(() => {
    let simulationInterval: number;
    
    if (isSimulationRunning) {
      simulationInterval = setInterval(() => {
        updateVirtualTrains();
      }, 1000 / simulationSpeed);
    }

    return () => {
      if (simulationInterval) {
        clearInterval(simulationInterval);
      }
    };
  }, [isSimulationRunning, simulationSpeed]);

  const initializeDigitalTwin = () => {
    // Initialize track sections
    const initialTrackSections: TrackSection[] = [
      { id: 'TS01', name: 'Main Line Up', occupied: false, trains: [], signals: ['S01', 'S02', 'S03'] },
      { id: 'TS02', name: 'Main Line Down', occupied: false, trains: [], signals: ['S04', 'S05', 'S06'] },
      { id: 'TS03', name: 'Platform 1', occupied: false, trains: [], signals: ['S07', 'S08'] },
      { id: 'TS04', name: 'Platform 2/3', occupied: false, trains: [], signals: ['S09', 'S10'] },
      { id: 'TS05', name: 'Siding A', occupied: false, trains: [], signals: ['S11'] },
      { id: 'TS06', name: 'Siding B', occupied: false, trains: [], signals: ['S12'] }
    ];

    // Initialize signals
    const initialSignals: Signal[] = [
      { id: 'S01', name: 'Signal 01', position: { x: 15, y: 30 }, aspect: 'green', type: 'main', controlledBy: 'SC1-617', trackSection: 'TS01' },
      { id: 'S02', name: 'Signal 02', position: { x: 35, y: 30 }, aspect: 'green', type: 'main', controlledBy: 'SC1-601', trackSection: 'TS01' },
      { id: 'S03', name: 'Signal 03', position: { x: 55, y: 30 }, aspect: 'yellow', type: 'main', controlledBy: 'SC1-633', trackSection: 'TS01' },
      { id: 'S04', name: 'Signal 04', position: { x: 15, y: 70 }, aspect: 'green', type: 'main', controlledBy: 'SC1-609', trackSection: 'TS02' },
      { id: 'S05', name: 'Signal 05', position: { x: 35, y: 70 }, aspect: 'red', type: 'main', controlledBy: 'SC1-605', trackSection: 'TS02' },
      { id: 'S06', name: 'Signal 06', position: { x: 55, y: 70 }, aspect: 'green', type: 'main', controlledBy: 'SC1-617', trackSection: 'TS02' },
      { id: 'S07', name: 'Ground Signal 07', position: { x: 75, y: 50 }, aspect: 'red', type: 'ground', controlledBy: 'SC1-605', trackSection: 'TS03' },
      { id: 'S08', name: 'Signal 08', position: { x: 85, y: 50 }, aspect: 'flashing', type: 'main', controlledBy: 'SC1-617', trackSection: 'TS03' },
      { id: 'S09', name: 'Ground Signal 09', position: { x: 25, y: 50 }, aspect: 'red', type: 'ground', controlledBy: 'SC1-609', trackSection: 'TS04' },
      { id: 'S10', name: 'Signal 10', position: { x: 45, y: 50 }, aspect: 'green', type: 'main', controlledBy: 'SC1-601', trackSection: 'TS04' },
      { id: 'S11', name: 'Ground Signal 11', position: { x: 5, y: 50 }, aspect: 'red', type: 'ground', controlledBy: 'SC1-609', trackSection: 'TS05' },
      { id: 'S12', name: 'Ground Signal 12', position: { x: 95, y: 50 }, aspect: 'red', type: 'ground', controlledBy: 'SC1-605', trackSection: 'TS06' }
    ];

    // Initialize trains with realistic positions on tracks
    const initialTrains: VirtualTrain[] = [
      {
        id: '12201',
        name: 'LTT-TCVN GARIB',
        virtualPosition: { x: 25, y: 30 },
        realPosition: { x: 25, y: 30 },
        speed: 120,
        status: 'running',
        passengers: 1250,
        nextStation: 'sangameshwar road',
        platform: 2,
        delay: 0,
        trackSection: 'TS01',
        direction: 'up',
        signalAspect: 'green'
      },
      {
        id: '12619',
        name: 'MATSYAGANDHA Express',
        virtualPosition: { x: 45, y: 70 },
        realPosition: { x: 45, y: 70 },
        speed: 95,
        status: 'running',
        passengers: 980,
        nextStation: 'nivasar',
        platform: 7,
        delay: 12,
        trackSection: 'TS02',
        direction: 'down',
        signalAspect: 'green'
      },
      {
        id: '20112',
        name: 'MAO-CSMT KONKAN',
        virtualPosition: { x: 75, y: 50 },
        realPosition: { x: 75, y: 50 },
        speed: 85,
        status: 'stopped',
        passengers: 1450,
        nextStation: '',
        platform: 1,
        delay: 0,
        trackSection: 'TS03',
        direction: 'up',
        signalAspect: 'red'
      },
      {
        id: '20910',
        name: 'PBR- TVCN EXP',
        virtualPosition: { x: 35, y: 50 },
        realPosition: { x: 35, y: 50 },
        speed: 70,
        status: 'delayed',
        passengers: 850,
        nextStation: 'majorda jn',
        platform: 3,
        delay: 16,
        trackSection: 'TS04',
        direction: 'down',
        signalAspect: 'yellow'
      }
    ];

    setVirtualTrains(initialTrains);
    setRealTrains([...initialTrains]);
    setVirtualSignals(initialSignals);
    setRealSignals([...initialSignals]);
    setTrackSections(initialTrackSections);
  };

  const syncWithRealNetwork = () => {
    // Simulate syncing with real network data
    setRealTrains(prev => prev.map(train => ({
      ...train,
      realPosition: {
        x: train.realPosition.x + (Math.random() - 0.5) * 2,
        y: train.realPosition.y + (Math.random() - 0.5) * 2
      },
      speed: Math.max(0, train.speed + (Math.random() - 0.5) * 10),
      delay: Math.max(0, train.delay + (Math.random() - 0.7) * 2)
    })));

    // Update real signals
    setRealSignals(prev => prev.map(signal => ({
      ...signal,
      aspect: Math.random() > 0.8 ? 
        (['green', 'yellow', 'red', 'flashing'][Math.floor(Math.random() * 4)] as any) : 
        signal.aspect
    })));

    // Update sync status
    const hasChanges = pendingChanges.length > 0 || isSimulationRunning;
    setSyncStatus(hasChanges ? 'testing' : 'synced');
  };

  const updateVirtualTrains = () => {
    setVirtualTrains(prev => prev.map(train => ({
      ...train,
      virtualPosition: {
        x: Math.max(5, Math.min(95, train.virtualPosition.x + (Math.random() - 0.5) * 3)),
        y: Math.max(5, Math.min(95, train.virtualPosition.y + (Math.random() - 0.5) * 3))
      },
      speed: Math.max(0, train.speed + (Math.random() - 0.5) * 5),
      delay: Math.max(0, train.delay + (Math.random() - 0.8) * 1)
    })));
  };

  const startSimulation = () => {
    setIsSimulationRunning(true);
    setSyncStatus('testing');
  };

  const pauseSimulation = () => {
    setIsSimulationRunning(false);
  };

  const resetSimulation = () => {
    setIsSimulationRunning(false);
    setPendingChanges([]);
    setSimulationResults(null);
    initializeDigitalTwin();
    setSyncStatus('synced');
  };

  const runFullSimulation = async () => {
    setIsSimulationRunning(true);
    
    // Simulate running for 30 seconds at high speed
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const results: SimulationResult = {
      scenario: selectedScenario,
      duration: 30,
      totalTrains: virtualTrains.length,
      delayReduction: Math.floor(Math.random() * 25) + 10,
      passengerSatisfaction: Math.floor(Math.random() * 15) + 80,
      safetyScore: Math.floor(Math.random() * 10) + 90,
      efficiency: Math.floor(Math.random() * 20) + 75,
      recommendations: [
        'Implement dynamic platform allocation for 15% efficiency gain',
        'Reroute freight trains during peak hours to reduce passenger delays',
        'Upgrade signal system at Junction A for better throughput',
        'Deploy additional staff at Platform 7 during evening rush'
      ],
      risks: [
        'Platform 2 congestion may increase by 8% during implementation',
        'Signal upgrade requires 4-hour maintenance window',
        'Staff reallocation may temporarily reduce service at Platform 5'
      ]
    };

    setSimulationResults(results);
    setIsSimulationRunning(false);
  };

  const addNetworkChange = (change: NetworkChange) => {
    setPendingChanges(prev => [...prev, change]);
    setSyncStatus('diverged');
  };

  const applyToRealNetwork = () => {
    // Simulate applying changes to real network
    alert('Changes applied to real network! All controllers have been notified.');
    setPendingChanges([]);
    setSyncStatus('synced');
  };

  const scenarios = [
    { id: 'current', name: 'Current Operations', description: 'Test current network state' },
    { id: 'peak-hour', name: 'Peak Hour Rush', description: 'Simulate morning/evening rush conditions' },
    { id: 'weather-impact', name: 'Weather Disruption', description: 'Heavy rain/fog impact simulation' },
    { id: 'maintenance', name: 'Maintenance Mode', description: 'Track maintenance scenario' },
    { id: 'emergency', name: 'Emergency Response', description: 'Medical emergency priority routing' }
  ];

  const getSyncStatusColor = (status: string) => {
    switch (status) {
      case 'synced': return 'text-green-400 bg-green-500/20';
      case 'diverged': return 'text-yellow-400 bg-yellow-500/20';
      case 'testing': return 'text-blue-400 bg-blue-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Monitor className="w-8 h-8 text-purple-400" />
          <div>
            <h2 className="text-2xl font-bold text-white">Digital Twin Simulation</h2>
            <p className="text-slate-400">Virtual railway network for safe testing before real-world deployment</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${getSyncStatusColor(syncStatus)}`}>
            {syncStatus === 'synced' && 'Synced with Real Network'}
            {syncStatus === 'diverged' && 'Testing Changes'}
            {syncStatus === 'testing' && 'Simulation Running'}
          </div>
        </div>
      </div>

      {/* Control Panel */}
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">Simulation Control Center</h3>
          <div className="flex items-center space-x-3">
            <select
              value={selectedScenario}
              onChange={(e) => setSelectedScenario(e.target.value)}
              className="bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
            >
              {scenarios.map(scenario => (
                <option key={scenario.id} value={scenario.id}>{scenario.name}</option>
              ))}
            </select>
            <div className="flex items-center space-x-2">
              <label className="text-slate-400 text-sm">Speed:</label>
              <select
                value={simulationSpeed}
                onChange={(e) => setSimulationSpeed(Number(e.target.value))}
                className="bg-slate-700 border border-slate-600 rounded px-2 py-1 text-white"
              >
                <option value={0.5}>0.5x</option>
                <option value={1}>1x</option>
                <option value={2}>2x</option>
                <option value={5}>5x</option>
                <option value={10}>10x</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={isSimulationRunning ? pauseSimulation : startSimulation}
            className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium transition-colors ${
              isSimulationRunning 
                ? 'bg-yellow-600 hover:bg-yellow-700' 
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {isSimulationRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isSimulationRunning ? 'Pause' : 'Start'} Simulation</span>
          </button>

          <button
            onClick={resetSimulation}
            className="flex items-center justify-center space-x-2 px-4 py-3 bg-slate-600 hover:bg-slate-700 rounded-lg font-medium transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>

          <button
            onClick={runFullSimulation}
            disabled={isSimulationRunning}
            className="flex items-center justify-center space-x-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 rounded-lg font-medium transition-colors"
          >
            <Brain className="w-4 h-4" />
            <span>Run Full Test</span>
          </button>

          <button
            onClick={applyToRealNetwork}
            disabled={pendingChanges.length === 0}
            className="flex items-center justify-center space-x-2 px-4 py-3 bg-red-600 hover:bg-red-700 disabled:bg-slate-600 rounded-lg font-medium transition-colors"
          >
            <Zap className="w-4 h-4" />
            <span>Apply to Real</span>
          </button>
        </div>
      </div>

      {/* Twin Comparison View */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Virtual Network */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">Virtual Network (Digital Twin)</h3>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-purple-400">Simulation Active</span>
            </div>
          </div>

          <div className="relative bg-slate-900 rounded-lg h-80 overflow-hidden">
            {/* Virtual Railway Network Layout */}
            <svg className="absolute inset-0 w-full h-full">
              {/* Main Lines */}
              <line x1="10%" y1="30%" x2="90%" y2="30%" stroke="#8B5CF6" strokeWidth="4" />
              <line x1="10%" y1="70%" x2="90%" y2="70%" stroke="#8B5CF6" strokeWidth="4" />
              
              {/* Platform Lines */}
              <line x1="70%" y1="45%" x2="90%" y2="45%" stroke="#8B5CF6" strokeWidth="3" />
              <line x1="20%" y1="50%" x2="50%" y2="50%" stroke="#8B5CF6" strokeWidth="3" />
              
              {/* Sidings */}
              <line x1="5%" y1="45%" x2="15%" y2="45%" stroke="#8B5CF6" strokeWidth="2" strokeDasharray="3,3" />
              <line x1="85%" y1="55%" x2="95%" y2="55%" stroke="#8B5CF6" strokeWidth="2" strokeDasharray="3,3" />
              
              {/* Crossovers */}
              <line x1="35%" y1="30%" x2="35%" y2="70%" stroke="#8B5CF6" strokeWidth="2" />
              <line x1="55%" y1="30%" x2="55%" y2="70%" stroke="#8B5CF6" strokeWidth="2" />
              
              {/* Platform Areas */}
              <rect x="70%" y="40%" width="20%" height="10%" fill="none" stroke="#8B5CF6" strokeWidth="2" strokeDasharray="5,5" />
              <rect x="20%" y="45%" width="30%" height="10%" fill="none" stroke="#8B5CF6" strokeWidth="2" strokeDasharray="5,5" />
            </svg>

            {/* Virtual Signals */}
            {virtualSignals.map((signal) => (
              <div
                key={`virtual-signal-${signal.id}`}
                className="absolute transform -translate-x-1/2 -translate-y-1/2"
                style={{ 
                  left: `${signal.position.x}%`, 
                  top: `${signal.position.y}%`
                }}
              >
                <div className={`w-3 h-3 rounded-full border border-white ${
                  signal.aspect === 'green' ? 'bg-green-500' :
                  signal.aspect === 'yellow' ? 'bg-yellow-500' :
                  signal.aspect === 'red' ? 'bg-red-500' :
                  'bg-blue-500 animate-pulse'
                }`}></div>
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-xs text-purple-400 font-mono">
                  {signal.name}
                </div>
              </div>
            ))}

            {/* Virtual Trains */}
            {virtualTrains.map((train) => (
              <div
                key={`virtual-${train.id}`}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                style={{ 
                  left: `${train.virtualPosition.x}%`, 
                  top: `${train.virtualPosition.y}%`,
                  transition: 'all 0.5s ease-in-out'
                }}
              >
                <div className={`w-5 h-3 rounded border-2 border-white ${
                  train.status === 'running' ? 'bg-purple-500' :
                  train.status === 'stopped' ? 'bg-red-500' :
                  train.status === 'delayed' ? 'bg-yellow-500' :
                  'bg-orange-500'
                } ${train.status === 'running' ? 'animate-pulse' : ''}`}></div>
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white px-2 py-1 rounded text-xs whitespace-nowrap border border-purple-500">
                  <div className="font-bold text-purple-300">{train.id}</div>
                  <div className="text-xs">{Math.round(train.speed)} km/h</div>
                  {train.delay > 0 && <div className="text-red-400">+{train.delay}m</div>}
                </div>
              </div>
            ))}

            {/* Track Section Labels */}
            <div className="absolute top-2 left-2 text-xs text-purple-400 font-mono">
              <div>TS01: Main Line Up</div>
              <div>TS02: Main Line Down</div>
              <div>TS03: Platform 1</div>
              <div>TS04: Platform 2/3</div>
            </div>

            <div className="absolute bottom-4 left-4 text-purple-400 text-sm">
              Virtual Network - Testing Environment
            </div>
          </div>
        </div>

        {/* Real Network */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">Real Network (Live)</h3>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-400">Live Data</span>
            </div>
          </div>

          <div className="relative bg-slate-900 rounded-lg h-80 overflow-hidden">
            {/* Real Railway Network Layout */}
            <svg className="absolute inset-0 w-full h-full">
              {/* Main Lines */}
              <line x1="10%" y1="30%" x2="90%" y2="30%" stroke="#10B981" strokeWidth="4" />
              <line x1="10%" y1="70%" x2="90%" y2="70%" stroke="#10B981" strokeWidth="4" />
              
              {/* Platform Lines */}
              <line x1="70%" y1="45%" x2="90%" y2="45%" stroke="#10B981" strokeWidth="3" />
              <line x1="20%" y1="50%" x2="50%" y2="50%" stroke="#10B981" strokeWidth="3" />
              
              {/* Sidings */}
              <line x1="5%" y1="45%" x2="15%" y2="45%" stroke="#10B981" strokeWidth="2" strokeDasharray="3,3" />
              <line x1="85%" y1="55%" x2="95%" y2="55%" stroke="#10B981" strokeWidth="2" strokeDasharray="3,3" />
              
              {/* Crossovers */}
              <line x1="35%" y1="30%" x2="35%" y2="70%" stroke="#10B981" strokeWidth="2" />
              <line x1="55%" y1="30%" x2="55%" y2="70%" stroke="#10B981" strokeWidth="2" />
              
              {/* Platform Areas */}
              <rect x="70%" y="40%" width="20%" height="10%" fill="none" stroke="#10B981" strokeWidth="2" strokeDasharray="5,5" />
              <rect x="20%" y="45%" width="30%" height="10%" fill="none" stroke="#10B981" strokeWidth="2" strokeDasharray="5,5" />
            </svg>

            {/* Real Signals */}
            {realSignals.map((signal) => (
              <div
                key={`real-signal-${signal.id}`}
                className="absolute transform -translate-x-1/2 -translate-y-1/2"
                style={{ 
                  left: `${signal.position.x}%`, 
                  top: `${signal.position.y}%`
                }}
              >
                <div className={`w-3 h-3 rounded-full border border-white ${
                  signal.aspect === 'green' ? 'bg-green-500' :
                  signal.aspect === 'yellow' ? 'bg-yellow-500' :
                  signal.aspect === 'red' ? 'bg-red-500' :
                  'bg-blue-500 animate-pulse'
                }`}></div>
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-xs text-green-400 font-mono">
                  {signal.name}
                </div>
              </div>
            ))}

            {/* Real Trains */}
            {realTrains.map((train) => (
              <div
                key={`real-${train.id}`}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                style={{ 
                  left: `${train.realPosition.x}%`, 
                  top: `${train.realPosition.y}%`,
                  transition: 'all 0.5s ease-in-out'
                }}
              >
                <div className={`w-5 h-3 rounded border-2 border-white ${
                  train.status === 'running' ? 'bg-green-500' :
                  train.status === 'stopped' ? 'bg-red-500' :
                  train.status === 'delayed' ? 'bg-yellow-500' :
                  'bg-orange-500'
                } ${train.status === 'running' ? 'animate-pulse' : ''}`}></div>
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white px-2 py-1 rounded text-xs whitespace-nowrap border border-green-500">
                  <div className="font-bold text-green-300">{train.id}</div>
                  <div className="text-xs">{Math.round(train.speed)} km/h</div>
                  {train.delay > 0 && <div className="text-red-400">+{train.delay}m</div>}
                </div>
              </div>
            ))}

            {/* Track Section Labels */}
            <div className="absolute top-2 left-2 text-xs text-green-400 font-mono">
              <div>TS01: Main Line Up</div>
              <div>TS02: Main Line Down</div>
              <div>TS03: Platform 1</div>
              <div>TS04: Platform 2/3</div>
            </div>

            <div className="absolute bottom-4 left-4 text-green-400 text-sm">
              Real Network - Live Operations
            </div>
          </div>
        </div>
      </div>

      {/* Pending Changes */}
      {pendingChanges.length > 0 && (
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h3 className="text-lg font-bold text-white mb-4">Pending Network Changes</h3>
          <div className="space-y-3">
            {pendingChanges.map((change) => (
              <div key={change.id} className="bg-slate-900/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-white">{change.description}</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    change.impact === 'critical' ? 'bg-red-500/20 text-red-400' :
                    change.impact === 'high' ? 'bg-orange-500/20 text-orange-400' :
                    change.impact === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-green-500/20 text-green-400'
                  }`}>
                    {change.impact} impact
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-slate-400">Affected Trains:</span>
                    <span className="ml-2 text-white">{change.affectedTrains.length}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Est. Delay:</span>
                    <span className="ml-2 text-white">{change.estimatedDelay} min</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Passengers:</span>
                    <span className="ml-2 text-white">{change.passengerImpact.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Simulation Results */}
      {simulationResults && (
        <div className="bg-gradient-to-r from-green-900/50 to-blue-900/50 rounded-lg p-6 border border-green-700/50">
          <div className="flex items-center space-x-3 mb-4">
            <CheckCircle className="w-8 h-8 text-green-400" />
            <div>
              <h3 className="text-xl font-bold text-white">Simulation Results</h3>
              <p className="text-slate-400">30-second full network simulation completed</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-400">{simulationResults.delayReduction}%</div>
              <p className="text-sm text-slate-400">Delay Reduction</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-400">{simulationResults.passengerSatisfaction}%</div>
              <p className="text-sm text-slate-400">Passenger Satisfaction</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="text-2xl font-bold text-purple-400">{simulationResults.safetyScore}%</div>
              <p className="text-sm text-slate-400">Safety Score</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="text-2xl font-bold text-yellow-400">{simulationResults.efficiency}%</div>
              <p className="text-sm text-slate-400">System Efficiency</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-green-400 mb-3">Recommendations</h4>
              <div className="space-y-2">
                {simulationResults.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                    <span className="text-sm text-slate-300">{rec}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-yellow-400 mb-3">Identified Risks</h4>
              <div className="space-y-2">
                {simulationResults.risks.map((risk, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5" />
                    <span className="text-sm text-slate-300">{risk}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Signal Control Panel
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h3 className="text-lg font-bold text-white mb-4">Signal Control Panel</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {virtualSignals.map((signal) => (
            <div key={signal.id} className="bg-slate-900/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-white">{signal.name}</span>
                <div className={`w-3 h-3 rounded-full ${
                  signal.aspect === 'green' ? 'bg-green-500' :
                  signal.aspect === 'yellow' ? 'bg-yellow-500' :
                  signal.aspect === 'red' ? 'bg-red-500' :
                  'bg-blue-500 animate-pulse'
                }`}></div>
              </div>
              <div className="text-xs text-slate-400 mb-2">
                {signal.type} • {signal.controlledBy} • {signal.trackSection}
              </div>
              <div className="flex space-x-1">
                <button 
                  onClick={() => setVirtualSignals(prev => prev.map(s => 
                    s.id === signal.id ? { ...s, aspect: 'green' } : s
                  ))}
                  className="px-2 py-1 bg-green-600 hover:bg-green-700 rounded text-xs"
                >
                  Green
                </button>
                <button 
                  onClick={() => setVirtualSignals(prev => prev.map(s => 
                    s.id === signal.id ? { ...s, aspect: 'yellow' } : s
                  ))}
                  className="px-2 py-1 bg-yellow-600 hover:bg-yellow-700 rounded text-xs"
                >
                  Yellow
                </button>
                <button 
                  onClick={() => setVirtualSignals(prev => prev.map(s => 
                    s.id === signal.id ? { ...s, aspect: 'red' } : s
                  ))}
                  className="px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-xs"
                >
                  Red
                </button>
                <button 
                  onClick={() => setVirtualSignals(prev => prev.map(s => 
                    s.id === signal.id ? { ...s, aspect: 'flashing' } : s
                  ))}
                  className="px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs"
                >
                  Flash
                </button>
              </div>
            </div>
          ))}
        </div>
      </div> */}

      {/* Quick Actions */}
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h3 className="text-lg font-bold text-white mb-4">Quick Test Scenarios</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button
            onClick={() => {
              // Set all signals to red for emergency stop
              setVirtualSignals(prev => prev.map(signal => ({ ...signal, aspect: 'red' })));
              addNetworkChange({
                id: 'change-1',
                type: 'signal',
                description: 'Emergency stop - All signals to RED',
                impact: 'critical',
                affectedTrains: virtualTrains.map(t => t.id),
                estimatedDelay: 30,
                passengerImpact: virtualTrains.reduce((sum, t) => sum + t.passengers, 0),
                costImpact: 50000
              });
            }}
            className="p-4 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
          >
            <AlertTriangle className="w-6 h-6 mx-auto mb-2" />
            <div className="font-medium">Emergency Stop</div>
            <div className="text-sm opacity-80">All signals to RED</div>
          </button>

          <button
            onClick={() => {
              // Set main line signals to green
              setVirtualSignals(prev => prev.map(signal => 
                signal.trackSection === 'TS01' || signal.trackSection === 'TS02' 
                  ? { ...signal, aspect: 'green' } 
                  : signal
              ));
              addNetworkChange({
                id: 'change-2',
                type: 'signal',
                description: 'Clear main lines - Set to GREEN',
                impact: 'medium',
                affectedTrains: ['12201', '12619'],
                estimatedDelay: 5,
                passengerImpact: 2230,
                costImpact: 10000
              });
            }}
            className="p-4 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
          >
            <CheckCircle className="w-6 h-6 mx-auto mb-2" />
            <div className="font-medium">Clear Main Lines</div>
            <div className="text-sm opacity-80">Main signals to GREEN</div>
          </button>

          <button
            onClick={() => {
              // Set platform signals to flashing
              setVirtualSignals(prev => prev.map(signal => 
                signal.trackSection === 'TS03' || signal.trackSection === 'TS04' 
                  ? { ...signal, aspect: 'flashing' } 
                  : signal
              ));
              addNetworkChange({
                id: 'change-3',
                type: 'signal',
                description: 'Platform approach control - Flashing aspects',
                impact: 'low',
                affectedTrains: ['20112', '20910'],
                estimatedDelay: 3,
                passengerImpact: 2300,
                costImpact: 5000
              });
            }}
            className="p-4 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            <Settings className="w-6 h-6 mx-auto mb-2" />
            <div className="font-medium">Platform Control</div>
            <div className="text-sm opacity-80">Flashing aspects</div>
          </button>

          <button
            onClick={() => {
              // Reset all signals to normal operation
              setVirtualSignals(prev => prev.map(signal => ({
                ...signal,
                aspect: signal.id === 'S03' ? 'yellow' : 
                       signal.id === 'S05' ? 'red' :
                       signal.id === 'S07' ? 'red' :
                       signal.id === 'S08' ? 'flashing' :
                       signal.id === 'S09' ? 'red' :
                       'green'
              })));
              addNetworkChange({
                id: 'change-4',
                type: 'signal',
                description: 'Reset to normal operation',
                impact: 'low',
                affectedTrains: [],
                estimatedDelay: 0,
                passengerImpact: 0,
                costImpact: 0
              });
            }}
            className="p-4 bg-slate-600 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <RotateCcw className="w-6 h-6 mx-auto mb-2" />
            <div className="font-medium">Reset Signals</div>
            <div className="text-sm opacity-80">Normal operation</div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DigitalTwinSimulation;