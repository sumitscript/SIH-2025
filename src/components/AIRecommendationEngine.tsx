import React, { useState, useEffect } from 'react';
import { Brain, Zap, TrendingUp, Clock, AlertTriangle, CheckCircle, RefreshCw, Target } from 'lucide-react';

interface AIRecommendation {
  id: string;
  type: 'routing' | 'scheduling' | 'priority' | 'maintenance' | 'emergency';
  title: string;
  description: string;
  confidence: number;
  impact: string;
  timeSaving: string;
  affectedTrains: string[];
  implementation: string;
  reasoning: string;
  status: 'pending' | 'accepted' | 'rejected' | 'implemented';
}

const AIRecommendationEngine: React.FC = () => {
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedRecommendation, setSelectedRecommendation] = useState<AIRecommendation | null>(null);

  useEffect(() => {
    generateRecommendations();
    const interval = setInterval(generateRecommendations, 15000);
    return () => clearInterval(interval);
  }, []);

  const generateRecommendations = async () => {
    setIsGenerating(true);
    
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const newRecommendations: AIRecommendation[] = [
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
      },
      {
        id: 'rec-004',
        type: 'maintenance',
        title: 'Predictive Maintenance Alert - Track KM 247-252',
        description: 'AI sensors detect 18% increase in track vibration. Schedule immediate inspection to prevent potential derailment risk.',
        confidence: 94,
        impact: 'Critical',
        timeSaving: 'Prevents 2hr+ delays',
        affectedTrains: ['All sector trains (12 services)'],
        implementation: '1. Schedule 90-minute maintenance window (02:00-03:30)\n2. Reroute all trains via bypass track\n3. Deploy track inspection team\n4. Coordinate with signal maintenance\n5. Update all affected schedules',
        reasoning: 'Vibration sensors show 18% increase in track irregularity over 72 hours. Pattern matches pre-failure signatures from historical data. Preventive action prevents major breakdown.',
        status: 'accepted'
      },
      {
        id: 'rec-005',
        type: 'priority',
        title: 'Weather Protocol - Chennai-Bangalore Route',
        description: 'Heavy rainfall detected: Implement 50 km/h speed limit and activate enhanced safety protocols for passenger safety.',
        confidence: 98,
        impact: 'High',
        timeSaving: 'Safety Priority',
        affectedTrains: ['Shatabdi 12002', 'Bangalore Express 12639', 'Lalbagh Express 12607'],
        implementation: '1. Activate automatic speed control systems\n2. Notify all train drivers of speed restrictions\n3. Update passenger ETA displays\n4. Deploy additional track monitors\n5. Coordinate with weather services',
        reasoning: 'Weather sensors report: visibility 150m, rainfall 45mm/hr, wind speed 35 km/h. Track flooding risk assessed as high. Safety protocols mandate speed reduction.',
        status: 'implemented'
      },
      {
        id: 'rec-006',
        type: 'routing',
        title: 'VIP Movement - Rajdhani 12951 Priority',
        description: 'Grant priority clearance for Rajdhani with VIP passengers. Coordinate all junctions for seamless transit.',
        confidence: 88,
        impact: 'Medium',
        timeSaving: '18 minutes',
        affectedTrains: ['Rajdhani 12951', 'Local services (8 trains)', 'Freight 16234'],
        implementation: '1. Clear priority signals on main line\n2. Hold local trains at outer signals\n3. Coordinate with all junction controllers\n4. Notify security personnel\n5. Prepare VIP reception at destination',
        reasoning: 'VIP movement protocol activated by Railway Board. Security clearance confirmed. High-priority passengers require minimal stops and delays for schedule adherence.',
        status: 'accepted'
      },
      {
        id: 'rec-007',
        type: 'routing',
        title: 'Freight Coordination - Western Corridor',
        description: 'Optimize freight-passenger coordination: Delay freight 16789 by 12 minutes to allow express trains priority passage.',
        confidence: 92,
        impact: 'Medium',
        timeSaving: '25 minutes',
        affectedTrains: ['Freight 16789', 'August Kranti 12615', 'Mumbai Express 12137'],
        implementation: '1. Hold freight at Vasai Road outer\n2. Allow passenger trains to pass\n3. Coordinate with goods shed for revised schedule\n4. Update freight delivery timeline\n5. Optimize subsequent freight movements',
        reasoning: 'Passenger trains have higher priority during peak hours (8-10 AM). Freight delay of 12 minutes prevents 25-minute passenger delays. Goods delivery impact minimal.',
        status: 'pending'
      },
      {
        id: 'rec-008',
        type: 'scheduling',
        title: 'Dynamic Platform Reallocation - Kolkata',
        description: 'Platform 3 technical issue: Reallocate Howrah Express to Platform 5 and adjust connecting train schedules.',
        confidence: 89,
        impact: 'Medium',
        timeSaving: '20 minutes',
        affectedTrains: ['Howrah Express 12809', 'Sealdah Local 30354', 'Duronto 12273'],
        implementation: '1. Switch Howrah Express to Platform 5\n2. Adjust local train timing by 8 minutes\n3. Update passenger announcements\n4. Coordinate with platform staff\n5. Repair Platform 3 technical issue',
        reasoning: 'Platform 3 signal malfunction detected. Platform 5 available with minor schedule adjustment. Prevents major disruption to evening services.',
        status: 'pending'
      }
    ];

    setRecommendations(newRecommendations);
    setIsGenerating(false);
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

  const RecommendationCard = ({ recommendation }: { recommendation: AIRecommendation }) => (
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

  const RecommendationDetail = ({ recommendation, onClose }: any) => (
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
              <p className="text-sm text-blue-300">{recommendation.implementation}</p>
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
          <button
            onClick={generateRecommendations}
            disabled={isGenerating}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'Analyzing...' : 'Refresh Analysis'}</span>
          </button>
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

      {/* Recommendations Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {recommendations.map((recommendation) => (
          <RecommendationCard key={recommendation.id} recommendation={recommendation} />
        ))}
      </div>

      {/* AI Performance Metrics */}
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h3 className="text-lg font-bold text-white mb-4">AI Engine Performance (Last 24 Hours)</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400">247</div>
            <p className="text-sm text-slate-400">Recommendations Today</p>
            <div className="text-xs text-green-400 mt-1">+23% from yesterday</div>
            <div className="text-xs text-green-400 mt-1">+23% from yesterday</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400">96.8%</div>
            <p className="text-sm text-slate-400">Acceptance Rate</p>
            <div className="text-xs text-green-400 mt-1">+2.1% improvement</div>
            <div className="text-xs text-green-400 mt-1">+2.1% improvement</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-400">28 min</div>
            <p className="text-sm text-slate-400">Avg Time Saved</p>
            <div className="text-xs text-purple-400 mt-1">Per recommendation</div>
            <div className="text-xs text-purple-400 mt-1">Per recommendation</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-400">1.8s</div>
            <p className="text-sm text-slate-400">Analysis Speed</p>
            <div className="text-xs text-yellow-400 mt-1">Real-time processing</div>
            <div className="text-xs text-yellow-400 mt-1">Real-time processing</div>
          </div>
        </div>
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900/50 rounded-lg p-4">
            <h4 className="font-medium text-cyan-400 mb-2">System Learning</h4>
            <p className="text-sm text-slate-300">AI model accuracy improved by 12% this month through continuous learning</p>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-4">
            <h4 className="font-medium text-orange-400 mb-2">Cost Savings</h4>
            <p className="text-sm text-slate-300">₹4.2 crores saved in operational costs through AI optimization</p>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-4">
            <h4 className="font-medium text-pink-400 mb-2">Safety Impact</h4>
            <p className="text-sm text-slate-300">Zero safety incidents in AI-managed sectors for 45 consecutive days</p>
          </div>
        </div>
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900/50 rounded-lg p-4">
            <h4 className="font-medium text-cyan-400 mb-2">System Learning</h4>
            <p className="text-sm text-slate-300">AI model accuracy improved by 12% this month through continuous learning</p>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-4">
            <h4 className="font-medium text-orange-400 mb-2">Cost Savings</h4>
            <p className="text-sm text-slate-300">₹4.2 crores saved in operational costs through AI optimization</p>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-4">
            <h4 className="font-medium text-pink-400 mb-2">Safety Impact</h4>
            <p className="text-sm text-slate-300">Zero safety incidents in AI-managed sectors for 45 consecutive days</p>
          </div>
        </div>
      </div>

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