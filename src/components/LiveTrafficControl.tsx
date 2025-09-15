import React, { useState, useEffect } from 'react';
import { Radio, Mic, MicOff, Volume2, VolumeX, Phone, Users, AlertTriangle, CheckCircle } from 'lucide-react';
import TrafficControl from './TrafficControl';

interface ControllerCommunication {
  id: string;
  controller: string;
  station: string;
  message: string;
  timestamp: string;
  priority: 'normal' | 'urgent' | 'emergency';
  status: 'active' | 'resolved' | 'pending';
}

const LiveTrafficControl: React.FC = () => {
  const [communications, setCommunications] = useState<ControllerCommunication[]>([]);
  const [isMicOn, setIsMicOn] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [selectedChannel, setSelectedChannel] = useState('main');

  useEffect(() => {
    // Generate mock communications
    const mockComms: ControllerCommunication[] = [
      {
        id: 'comm-001',
        controller: 'Controller Delhi-1',
        station: 'Delhi Junction',
        message: 'Express 12951 requesting platform 7, ETA 14:25',
        timestamp: new Date(Date.now() - 2 * 60 * 1000).toLocaleTimeString(),
        priority: 'normal',
        status: 'active'
      },
      {
        id: 'comm-002',
        controller: 'Controller Mumbai-2',
        station: 'Mumbai Central',
        message: 'URGENT: Signal failure at platform 12, need immediate maintenance',
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toLocaleTimeString(),
        priority: 'urgent',
        status: 'pending'
      },
      {
        id: 'comm-003',
        controller: 'Controller Nagpur',
        station: 'Nagpur Junction',
        message: 'Freight 16789 cleared, passenger trains can proceed',
        timestamp: new Date(Date.now() - 8 * 60 * 1000).toLocaleTimeString(),
        priority: 'normal',
        status: 'resolved'
      },
      {
        id: 'comm-004',
        controller: 'Emergency Coordinator',
        station: 'System Wide',
        message: 'EMERGENCY: Medical situation on Express 12723, priority clearance required',
        timestamp: new Date(Date.now() - 1 * 60 * 1000).toLocaleTimeString(),
        priority: 'emergency',
        status: 'active'
      }
    ];

    setCommunications(mockComms);

    // Simulate new communications
    const interval = setInterval(() => {
      const newComm: ControllerCommunication = {
        id: `comm-${Date.now()}`,
        controller: `Controller ${['Delhi', 'Mumbai', 'Kolkata', 'Chennai'][Math.floor(Math.random() * 4)]}-${Math.floor(Math.random() * 3) + 1}`,
        station: ['Delhi Junction', 'Mumbai Central', 'Kolkata Station', 'Chennai Central'][Math.floor(Math.random() * 4)],
        message: [
          'Platform clearance confirmed for next arrival',
          'Track inspection completed, all clear',
          'Passenger boarding complete, ready for departure',
          'Signal system restored to normal operation',
          'Weather update: visibility improving, speed restrictions lifted'
        ][Math.floor(Math.random() * 5)],
        timestamp: new Date().toLocaleTimeString(),
        priority: ['normal', 'urgent'][Math.floor(Math.random() * 2)] as 'normal' | 'urgent',
        status: 'active'
      };

      setCommunications(prev => [newComm, ...prev.slice(0, 9)]);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'emergency': return 'border-red-500 bg-red-500/10';
      case 'urgent': return 'border-yellow-500 bg-yellow-500/10';
      case 'normal': return 'border-slate-700 bg-slate-800';
      default: return 'border-slate-700 bg-slate-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Radio className="w-4 h-4 text-blue-400" />;
      case 'resolved': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'pending': return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      default: return <Radio className="w-4 h-4 text-gray-400" />;
    }
  };

  const channels = [
    { id: 'main', name: 'Main Control', active: 12 },
    { id: 'emergency', name: 'Emergency', active: 2 },
    { id: 'maintenance', name: 'Maintenance', active: 5 },
    { id: 'freight', name: 'Freight Coord', active: 8 }
  ];

  return (
    <div className="space-y-6">
      {/* Traffic Control Component */}
      <TrafficControl />
      
      {/* Communication Section */}
      <div className="border-t border-slate-700 pt-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Communication Center</h2>
            <p className="text-slate-400">Real-time communication and coordination hub</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-400">System Online</span>
            </div>
          </div>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Communication Channels */}
        <div className="lg:col-span-2 space-y-6">
          {/* Channel Selection */}
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Communication Channels</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsMicOn(!isMicOn)}
                  className={`p-2 rounded ${isMicOn ? 'bg-red-600' : 'bg-slate-700'}`}
                >
                  {isMicOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                  className={`p-2 rounded ${isSpeakerOn ? 'bg-green-600' : 'bg-slate-700'}`}
                >
                  {isSpeakerOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {channels.map((channel) => (
                <button
                  key={channel.id}
                  onClick={() => setSelectedChannel(channel.id)}
                  className={`p-3 rounded-lg border transition-all ${
                    selectedChannel === channel.id
                      ? 'border-blue-500 bg-blue-900/30'
                      : 'border-slate-700 bg-slate-900/50 hover:border-slate-600'
                  }`}
                >
                  <div className="text-center">
                    <p className="font-medium text-white text-sm">{channel.name}</p>
                    <div className="flex items-center justify-center space-x-1 mt-1">
                      <Users className="w-3 h-3 text-slate-400" />
                      <span className="text-xs text-slate-400">{channel.active}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Live Communications */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Live Communications</h3>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-400">Live</span>
              </div>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {communications.map((comm) => (
                <div
                  key={comm.id}
                  className={`rounded-lg p-4 border ${getPriorityColor(comm.priority)}`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getStatusIcon(comm.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-white">{comm.controller}</span>
                          <span className="text-xs text-slate-400">•</span>
                          <span className="text-sm text-slate-400">{comm.station}</span>
                        </div>
                        <span className="text-xs text-slate-500">{comm.timestamp}</span>
                      </div>
                      <p className="text-sm text-slate-300">{comm.message}</p>
                      
                      {comm.priority !== 'normal' && (
                        <div className="mt-2 flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            comm.priority === 'emergency' ? 'bg-red-500/20 text-red-400' :
                            'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {comm.priority.toUpperCase()}
                          </span>
                          {comm.status === 'pending' && (
                            <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs font-medium transition-colors">
                              Respond
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Control Panel */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full bg-red-600 hover:bg-red-700 px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2">
                <AlertTriangle className="w-4 h-4" />
                <span>Emergency Stop</span>
              </button>
              
              <button className="w-full bg-yellow-600 hover:bg-yellow-700 px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2">
                <Radio className="w-4 h-4" />
                <span>Broadcast Alert</span>
              </button>
              
              <button className="w-full bg-blue-600 hover:bg-blue-700 px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2">
                <Phone className="w-4 h-4" />
                <span>Call Station Master</span>
              </button>
              
              <button className="w-full bg-green-600 hover:bg-green-700 px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2">
                <CheckCircle className="w-4 h-4" />
                <span>Clear All Signals</span>
              </button>
            </div>
          </div>

          {/* Active Controllers */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h3 className="text-lg font-bold text-white mb-4">Active Controllers</h3>
            <div className="space-y-3">
              {[
                { name: 'Mohit Kumar', station: 'Jaipur Central', status: 'online', shift: 'Day' },
                { name: 'Sumit Soni', station: 'Delhi Central', status: 'online', shift: 'Day' },
      
      
                { name: 'Ashok Kumar', station: 'Mumbai Control', status: 'online', shift: 'Day' },
                { name: 'sugam Sharma', station: 'Kolkata Yard', status: 'busy', shift: 'Day' },
                { name: 'Nikita Chouhan', station: 'Chennai Control', status: 'online', shift: 'Day' },
                { name: 'Chirag Rawal', station: 'Emergency Coord', status: 'standby', shift: 'Day' }
              ].map((controller, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      controller.status === 'online' ? 'bg-green-500' :
                      controller.status === 'busy' ? 'bg-yellow-500' : 'bg-gray-500'
                    }`}></div>
                    <div>
                      <p className="font-medium text-white text-sm">{controller.name}</p>
                      <p className="text-xs text-slate-400">{controller.station}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400">{controller.shift} Shift</p>
                    <p className={`text-xs font-medium ${
                      controller.status === 'online' ? 'text-green-400' :
                      controller.status === 'busy' ? 'text-yellow-400' : 'text-gray-400'
                    }`}>
                      {controller.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* System Status */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h3 className="text-lg font-bold text-white mb-4">System Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Communication Network</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-green-400 text-sm">Operational</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Signal Coverage</span>
                <span className="text-green-400 text-sm font-medium">98.7%</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Active Channels</span>
                <span className="text-blue-400 text-sm font-medium">24/24</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Emergency Response</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-green-400 text-sm">Ready</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default LiveTrafficControl;