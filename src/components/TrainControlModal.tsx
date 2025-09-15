import React, { useState, useEffect } from 'react';
import { X, Radio, AlertTriangle, Clock, Phone, Zap, MapPin, Navigation, MessageSquare } from 'lucide-react';
import { Train } from '../utils/dataTransform';
import { apiService } from '../services/apiService';

interface TrainControlModalProps {
  train: Train;
  onClose: () => void;
}

interface SignalState {
  id: string;
  type: 'HOME' | 'DISTANT' | 'ADVANCED' | 'STARTER';
  status: 'GREEN' | 'RED' | 'YELLOW';
  position: { x: number; y: number };
}

interface BlockSection {
  id: string;
  name: string;
  occupied: boolean;
  length: number;
  signals: SignalState[];
}

const TrainControlModal: React.FC<TrainControlModalProps> = ({ train, onClose }) => {
  const [activeView, setActiveView] = useState<'overview' | 'timetable' | 'signals' | 'communication' | 'station-alert'>('overview');
  const [trainDetail, setTrainDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  // Removed unused blockSections state
  const [blockSections] = useState<BlockSection[]>([
    {
      id: 'block-1',
      name: 'STATION SECTION A',
      occupied: true,
      length: 1800,
      signals: [
        { id: 'sig-1', type: 'STARTER', status: 'GREEN', position: { x: 50, y: 100 } },
        { id: 'sig-2', type: 'HOME', status: 'RED', position: { x: 200, y: 100 } },
        { id: 'sig-3', type: 'DISTANT', status: 'YELLOW', position: { x: 350, y: 100 } }
      ]
    },
    {
      id: 'block-2',
      name: 'BLOCK SECTION',
      occupied: false,
      length: 2500,
      signals: [
        { id: 'sig-4', type: 'ADVANCED', status: 'GREEN', position: { x: 500, y: 100 } },
        { id: 'sig-5', type: 'DISTANT', status: 'GREEN', position: { x: 650, y: 100 } }
      ]
    },
    {
      id: 'block-3',
      name: 'STATION SECTION B',
      occupied: false,
      length: 1800,
      signals: [
        { id: 'sig-6', type: 'HOME', status: 'GREEN', position: { x: 800, y: 100 } },
        { id: 'sig-7', type: 'STARTER', status: 'RED', position: { x: 950, y: 100 } }
      ]
    }
  ]);

  const [stationMasterActions] = useState([
    { id: 1, action: `Train ${train.id} status updated`, time: new Date().toLocaleTimeString(), status: 'completed' },
    { id: 2, action: `Current location: ${train.currentLocation}`, time: new Date().toLocaleTimeString(), status: 'active' },
    { id: 3, action: `Direction: ${train.direction?.toUpperCase()}`, time: new Date().toLocaleTimeString(), status: 'active' }
  ]);

  useEffect(() => {
    const fetchTrainDetail = async () => {
      try {
        setLoading(true);
        const detail = await apiService.fetchTrain(train.id);
        setTrainDetail(detail);
      } catch (error) {
        console.error('Error fetching train detail:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrainDetail();
  }, [train.id]);

  // Removed unused functions toggleSignal and getSignalColor

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg w-full max-w-7xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-4">
            <div className={`w-3 h-3 rounded-full animate-pulse ${
              train.status === 'On Time' ? 'bg-green-500' : 
              train.status === 'Delayed' ? 'bg-red-500' : 'bg-blue-500'
            }`}></div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                Train {train.id} - {train.name}
              </h2>
              <p className="text-slate-400">{train.type} • {train.direction?.toUpperCase()} Direction</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              train.status === 'On Time' ? 'bg-green-600 text-green-100' :
              train.status === 'Delayed' ? 'bg-red-600 text-red-100' :
              'bg-blue-600 text-blue-100'
            }`}>
              {train.status}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-700">
          {[
            { id: 'overview', label: 'Train Overview', icon: Navigation },
            { id: 'timetable', label: 'Timetable', icon: Clock },
            { id: 'signals', label: 'Signal Control', icon: Zap },
            { id: 'communication', label: 'Communication', icon: Phone },
            { id: 'station-alert', label: 'Station Alert', icon: MessageSquare }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id as any)}
              className={`flex items-center space-x-2 px-6 py-4 transition-colors ${
                activeView === tab.id
                  ? 'bg-blue-600 text-white border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          {activeView === 'overview' && (
            <div className="p-6">
              {/* Train Information */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Current Status */}
                <div className="bg-gray-800 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-white mb-4">Current Status</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Train Number:</span>
                      <span className="text-white font-semibold">{train.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Current Station:</span>
                      <span className="text-white font-semibold capitalize">{train.currentLocation}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Direction:</span>
                      <span className="text-white font-semibold">{train.direction?.toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Status:</span>
                      <span className={`font-semibold ${
                        train.status === 'On Time' ? 'text-green-400' :
                        train.status === 'Delayed' ? 'text-red-400' : 'text-blue-400'
                      }`}>{train.status}</span>
                    </div>
                    {train.delay && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Delay:</span>
                        <span className="text-red-400 font-semibold">{train.delay}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Route Information */}
                <div className="bg-gray-800 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-white mb-4">Route Information</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Train Name:</span>
                      <span className="text-white font-semibold text-sm">{train.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Type:</span>
                      <span className="text-white font-semibold">{train.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">From:</span>
                      <span className="text-white font-semibold">{train.from}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">To:</span>
                      <span className="text-white font-semibold">{train.to}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Last Update:</span>
                      <span className="text-white font-semibold">{train.departure}</span>
                    </div>
                  </div>
                </div>

                {/* AI Recommendations */}
                <div className="bg-gray-800 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-white mb-4">System Status</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-green-400 text-sm">Tracking Active</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-blue-400 text-sm">Live Updates</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span className="text-yellow-400 text-sm">Monitoring Delays</span>
                    </div>
                  </div>
                  
                  {train.aiRecommendation && (
                    <div className="mt-4 p-3 bg-blue-900/30 rounded-lg border border-blue-700/50">
                      <div className="flex items-center space-x-2 mb-2">
                        <Zap className="w-4 h-4 text-blue-400" />
                        <span className="text-sm text-blue-400 font-medium">AI Recommendation</span>
                      </div>
                      <p className="text-sm text-slate-300">{train.aiRecommendation}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Actions */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-white mb-4">Recent Updates</h4>
                <div className="space-y-3">
                  {stationMasterActions.map(action => (
                    <div key={action.id} className="flex items-start space-x-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        action.status === 'completed' ? 'bg-green-500' :
                        action.status === 'active' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}></div>
                      <div className="flex-1">
                        <p className="text-white text-sm">{action.action}</p>
                        <p className="text-gray-400 text-xs">{action.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Station Alert */}
              {(train.status === 'Delayed' || train.delayMinutes && train.delayMinutes > 0) && (
                <div className="bg-gradient-to-r from-orange-900/50 to-red-900/50 border border-orange-700 rounded-lg p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <MessageSquare className="w-6 h-6 text-orange-400" />
                    <h4 className="text-lg font-semibold text-white">Station Alert for Delayed Train</h4>
                  </div>
                  <p className="text-gray-300 text-sm mb-4">
                    Train {train.id} is currently delayed by {train.delayMinutes || 'unknown'} minutes. 
                    Send an alert to {train.currentLocation} station to inform passengers.
                  </p>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => {
                        alert(`✅ Station Alert Sent!\n\nMessage: "Train ${train.id} (${train.name}) is delayed by ${train.delayMinutes || 15} minutes. Updated arrival time will be announced shortly."\n\nThis message has been sent to ${train.currentLocation} station display system and will be visible to passengers.`);
                      }}
                      className="bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded transition-colors flex items-center space-x-2"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Send Delay Alert</span>
                    </button>
                    <button
                      onClick={() => setActiveView('station-alert')}
                      className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors"
                    >
                      More Options
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeView === 'timetable' && (
            <div className="p-6">
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-white">Loading timetable...</div>
                </div>
              ) : trainDetail && trainDetail.timetable ? (
                <div className="bg-gray-800 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-white mb-6">Train Timetable - {train.name}</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-700">
                          <th className="text-left text-gray-400 py-3 px-4">Station</th>
                          <th className="text-left text-gray-400 py-3 px-4">Arrival</th>
                          <th className="text-left text-gray-400 py-3 px-4">Departure</th>
                          <th className="text-left text-gray-400 py-3 px-4">Platform</th>
                          <th className="text-left text-gray-400 py-3 px-4">Distance (km)</th>
                          <th className="text-left text-gray-400 py-3 px-4">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {trainDetail.timetable.map((stop: any, index: number) => (
                          <tr key={index} className={`border-b border-gray-700 ${
                            stop.station.toLowerCase() === train.currentLocation.toLowerCase() 
                              ? 'bg-blue-900/30' : ''
                          }`}>
                            <td className="py-3 px-4">
                              <div className="flex items-center space-x-2">
                                {stop.station.toLowerCase() === train.currentLocation.toLowerCase() && (
                                  <MapPin className="w-4 h-4 text-blue-400" />
                                )}
                                <span className={`font-medium capitalize ${
                                  stop.station.toLowerCase() === train.currentLocation.toLowerCase() 
                                    ? 'text-blue-400' : 'text-white'
                                }`}>
                                  {stop.station}
                                </span>
                              </div>
                            </td>
                            <td className="text-white py-3 px-4">{stop.arrival}</td>
                            <td className="text-white py-3 px-4">{stop.departure}</td>
                            <td className="text-white py-3 px-4">
                              <span className="bg-blue-600 text-blue-100 px-2 py-1 rounded text-xs">
                                {stop.platform || 'TBD'}
                              </span>
                            </td>
                            <td className="text-white py-3 px-4">{stop.distance}</td>
                            <td className="py-3 px-4">
                              {stop.station.toLowerCase() === train.currentLocation.toLowerCase() ? (
                                <span className="text-blue-400 font-medium">Current</span>
                              ) : index < trainDetail.timetable.findIndex((s: any) => 
                                s.station.toLowerCase() === train.currentLocation.toLowerCase()
                              ) ? (
                                <span className="text-green-400">Completed</span>
                              ) : (
                                <span className="text-gray-400">Upcoming</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-800 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">Train Timetable - {train.name}</h3>
                  <div className="text-center py-8">
                    <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400 mb-4">Loading timetable from train database...</p>
                    <div className="bg-gray-700 rounded-lg p-4 text-left">
                      <h4 className="text-white font-medium mb-2">Train Information:</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">Train Number:</span>
                          <span className="text-white ml-2">{train.id}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Train Type:</span>
                          <span className="text-white ml-2">{train.type}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Current Station:</span>
                          <span className="text-white ml-2 capitalize">{train.currentLocation}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Direction:</span>
                          <span className="text-white ml-2">{train.direction?.toUpperCase()}</span>
                        </div>
                        {train.currentPlatform && (
                          <div>
                            <span className="text-gray-400">Current Platform:</span>
                            <span className="text-blue-400 ml-2">Platform {train.currentPlatform}</span>
                          </div>
                        )}
                        {train.nextStation && (
                          <div>
                            <span className="text-gray-400">Next Station:</span>
                            <span className="text-white ml-2">{train.nextStation}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeView === 'signals' && (
            <div className="p-6">
              <div className="bg-gray-800 rounded-lg p-6 mb-6">
                <h3 className="text-xl font-semibold text-white mb-4">Signal Control System</h3>
                <p className="text-gray-400 mb-6">
                  Monitor and control railway signals for Train {train.id} on the Konkan Railway network.
                </p>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-white">Current Section Signals</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-700 rounded">
                        <div>
                          <span className="text-white font-medium">Home Signal</span>
                          <p className="text-gray-400 text-sm">Station Entry</p>
                        </div>
                        <div className="flex items-center space-x-2 px-3 py-2 bg-green-600 rounded">
                          <div className="w-3 h-3 bg-white rounded-full"></div>
                          <span className="text-white font-semibold">CLEAR</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-700 rounded">
                        <div>
                          <span className="text-white font-medium">Starter Signal</span>
                          <p className="text-gray-400 text-sm">Station Exit</p>
                        </div>
                        <div className="flex items-center space-x-2 px-3 py-2 bg-yellow-600 rounded">
                          <div className="w-3 h-3 bg-white rounded-full"></div>
                          <span className="text-white font-semibold">CAUTION</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-700 rounded">
                        <div>
                          <span className="text-white font-medium">Block Signal</span>
                          <p className="text-gray-400 text-sm">Next Section</p>
                        </div>
                        <div className="flex items-center space-x-2 px-3 py-2 bg-red-600 rounded">
                          <div className="w-3 h-3 bg-white rounded-full"></div>
                          <span className="text-white font-semibold">DANGER</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-white">Quick Actions</h4>
                    <div className="space-y-3">
                      <button className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded transition-colors">
                        Clear Path for Train {train.id}
                      </button>
                      <button className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-3 px-4 rounded transition-colors">
                        Set Caution Mode
                      </button>
                      <button className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded transition-colors">
                        Emergency Stop Signal
                      </button>
                      <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded transition-colors">
                        Request Control Room
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeView === 'communication' && (
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-800 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-white mb-4">Communication Center</h4>
                  <div className="space-y-4">
                    <button className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded flex items-center justify-center space-x-2">
                      <Phone className="w-4 h-4" />
                      <span>Call Konkan Railway Control</span>
                    </button>
                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded flex items-center justify-center space-x-2">
                      <Radio className="w-4 h-4" />
                      <span>Radio Train Driver</span>
                    </button>
                    <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded flex items-center justify-center space-x-2">
                      <MapPin className="w-4 h-4" />
                      <span>Contact Station {train.currentLocation}</span>
                    </button>
                    <button className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded flex items-center justify-center space-x-2">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Emergency Alert</span>
                    </button>
                  </div>
                </div>
                
                <div className="bg-gray-800 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-white mb-4">Active Communications</h4>
                  <div className="space-y-3">
                    <div className="p-3 bg-gray-700 rounded">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-medium">Konkan Railway Control</span>
                        <span className="text-green-400 text-sm">CONNECTED</span>
                      </div>
                      <p className="text-gray-400 text-sm">Monitoring Train {train.id} progress</p>
                    </div>
                    <div className="p-3 bg-gray-700 rounded">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-medium">Driver Train {train.id}</span>
                        <span className="text-blue-400 text-sm">STANDBY</span>
                      </div>
                      <p className="text-gray-400 text-sm">Currently at {train.currentLocation}</p>
                    </div>
                    <div className="p-3 bg-gray-700 rounded">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-medium capitalize">Station {train.currentLocation}</span>
                        <span className="text-yellow-400 text-sm">MONITORING</span>
                      </div>
                      <p className="text-gray-400 text-sm">Train status: {train.status}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeView === 'station-alert' && (
            <div className="p-6">
              <div className="max-w-4xl mx-auto">
                <div className="bg-gray-800 rounded-lg p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <MessageSquare className="w-6 h-6 text-blue-400" />
                    <h4 className="text-xl font-semibold text-white">Station Display Alert System</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Alert Information */}
                    <div className="space-y-4">
                      <div className="bg-gray-700 rounded-lg p-4">
                        <h5 className="text-lg font-medium text-white mb-3">Train Information</h5>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Train Number:</span>
                            <span className="text-white font-medium">{train.id}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Train Name:</span>
                            <span className="text-white font-medium">{train.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Current Station:</span>
                            <span className="text-white font-medium capitalize">{train.currentLocation}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Status:</span>
                            <span className={`font-medium ${
                              train.status === 'Delayed' ? 'text-red-400' :
                              train.status === 'On Time' ? 'text-green-400' : 'text-blue-400'
                            }`}>
                              {train.status}
                            </span>
                          </div>
                          {train.delayMinutes && train.delayMinutes > 0 && (
                            <div className="flex justify-between">
                              <span className="text-gray-400">Delay:</span>
                              <span className="text-red-400 font-medium">{train.delayMinutes} minutes</span>
                            </div>
                          )}
                          {train.currentPlatform && (
                            <div className="flex justify-between">
                              <span className="text-gray-400">Platform:</span>
                              <span className="text-white font-medium">Platform {train.currentPlatform}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Pre-defined Alert Messages */}
                      <div className="bg-gray-700 rounded-lg p-4">
                        <h5 className="text-lg font-medium text-white mb-3">Quick Alert Messages</h5>
                        <div className="space-y-2">
                          {[
                            `Train ${train.id} is delayed by ${train.delayMinutes || 15} minutes`,
                            `Train ${train.id} will arrive at Platform ${train.currentPlatform || '2'} shortly`,
                            `Passengers for Train ${train.id} please proceed to Platform ${train.currentPlatform || '2'}`,
                            `Train ${train.id} departure delayed - please wait for announcement`,
                            `Train ${train.id} boarding in progress at Platform ${train.currentPlatform || '2'}`
                          ].map((message, index) => (
                            <button
                              key={index}
                              onClick={() => {
                                alert(`✅ Station Alert Sent!\n\nMessage: "${message}"\n\nThis message has been sent to ${train.currentLocation} station display system and will be visible to passengers.`);
                              }}
                              className="w-full text-left p-3 bg-gray-600 hover:bg-gray-500 rounded text-white text-sm transition-colors"
                            >
                              {message}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Custom Message and Actions */}
                    <div className="space-y-4">
                      <div className="bg-gray-700 rounded-lg p-4">
                        <h5 className="text-lg font-medium text-white mb-3">Custom Alert Message</h5>
                        <textarea
                          placeholder={`Enter custom message for ${train.currentLocation} station display...`}
                          className="w-full h-32 p-3 bg-gray-600 border border-gray-500 rounded text-white placeholder-gray-400 resize-none focus:outline-none focus:border-blue-500"
                          defaultValue=""
                        />
                        <div className="mt-3 flex space-x-2">
                          <button
                            onClick={() => {
                              const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
                              const customMessage = textarea?.value || `Custom alert for Train ${train.id}`;
                              alert(`✅ Custom Station Alert Sent!\n\nMessage: "${customMessage}"\n\nThis message has been sent to ${train.currentLocation} station display system and will be visible to passengers.`);
                              if (textarea) textarea.value = '';
                            }}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors"
                          >
                            Send Custom Alert
                          </button>
                          <button
                            onClick={() => {
                              const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
                              if (textarea) textarea.value = '';
                            }}
                            className="bg-gray-600 hover:bg-gray-500 text-white py-2 px-4 rounded transition-colors"
                          >
                            Clear
                          </button>
                        </div>
                      </div>

                      {/* Emergency Alerts */}
                      <div className="bg-red-900/30 border border-red-700 rounded-lg p-4">
                        <h5 className="text-lg font-medium text-red-400 mb-3 flex items-center space-x-2">
                          <AlertTriangle className="w-5 h-5" />
                          <span>Emergency Alerts</span>
                        </h5>
                        <div className="space-y-2">
                          <button
                            onClick={() => {
                              alert(`🚨 EMERGENCY ALERT SENT!\n\nMessage: "URGENT: Train ${train.id} emergency situation - passengers please follow station staff instructions"\n\nThis emergency alert has been broadcast to all displays at ${train.currentLocation} station.`);
                            }}
                            className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded transition-colors text-sm"
                          >
                            🚨 Emergency Situation Alert
                          </button>
                          <button
                            onClick={() => {
                              alert(`⚠️ SAFETY ALERT SENT!\n\nMessage: "ATTENTION: Train ${train.id} safety announcement - please maintain safe distance from platform edge"\n\nThis safety alert has been sent to ${train.currentLocation} station display system.`);
                            }}
                            className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded transition-colors text-sm"
                          >
                            ⚠️ Safety Announcement
                          </button>
                        </div>
                      </div>

                      {/* Alert History */}
                      <div className="bg-gray-700 rounded-lg p-4">
                        <h5 className="text-lg font-medium text-white mb-3">Recent Alerts Sent</h5>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between items-center p-2 bg-gray-600 rounded">
                            <span className="text-gray-300">Delay notification sent</span>
                            <span className="text-gray-400">2 min ago</span>
                          </div>
                          <div className="flex justify-between items-center p-2 bg-gray-600 rounded">
                            <span className="text-gray-300">Platform announcement</span>
                            <span className="text-gray-400">5 min ago</span>
                          </div>
                          <div className="flex justify-between items-center p-2 bg-gray-600 rounded">
                            <span className="text-gray-300">Boarding alert sent</span>
                            <span className="text-gray-400">12 min ago</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-6 flex justify-center space-x-4">
                    <button
                      onClick={() => {
                        alert(`📢 GENERAL ANNOUNCEMENT SENT!\n\nMessage: "Attention passengers: Train ${train.id} (${train.name}) current status update available on display boards"\n\nThis announcement has been sent to all stations on the route.`);
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg transition-colors flex items-center space-x-2"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Send Route-wide Announcement</span>
                    </button>
                    <button
                      onClick={() => {
                        alert(`📱 SMS ALERT SENT!\n\nPassengers with registered mobile numbers for Train ${train.id} have been notified about the current status via SMS.`);
                      }}
                      className="bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-lg transition-colors flex items-center space-x-2"
                    >
                      <Phone className="w-4 h-4" />
                      <span>Send SMS to Passengers</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Status Bar */}
        <div className="border-t border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-400 text-sm">System Online</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-gray-400 text-sm">{new Date().toLocaleTimeString()}</span>
              </div>
            </div>
            <div className="text-gray-400 text-sm">
              Station Master: SM-{Math.floor(Math.random() * 1000)} | Shift: Day
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainControlModal;