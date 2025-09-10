import React, { useState, useEffect } from 'react';
import { Zap, Brain, TrendingUp, Clock, AlertTriangle, CheckCircle, Play, Pause } from 'lucide-react';
import { generateOptimizationScenarios, runOptimization } from '../utils/optimization';

const ScheduleOptimizer: React.FC = () => {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [scenarios, setScenarios] = useState(generateOptimizationScenarios());
  const [selectedScenario, setSelectedScenario] = useState<any>(null);
  const [optimizationResults, setOptimizationResults] = useState<any>(null);

  const handleOptimization = async () => {
    if (!selectedScenario) return;
    
    setIsOptimizing(true);
    
    // Simulate AI optimization process
    const results = await runOptimization(selectedScenario);
    setOptimizationResults(results);
    
    setTimeout(() => {
      setIsOptimizing(false);
    }, 3000);
  };

  const ScenarioCard = ({ scenario, isSelected, onClick }: any) => (
    <div
      className={`bg-slate-800 rounded-lg p-4 border cursor-pointer transition-all ${
        isSelected 
          ? 'border-blue-500 bg-blue-900/20' 
          : 'border-slate-700 hover:border-slate-600'
      }`}
      onClick={() => onClick(scenario)}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-white">{scenario.title}</h3>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          scenario.severity === 'High' ? 'bg-red-500/20 text-red-400' :
          scenario.severity === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
          'bg-green-500/20 text-green-400'
        }`}>
          {scenario.severity}
        </span>
      </div>
      <p className="text-sm text-slate-400 mb-3">{scenario.description}</p>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <span className="text-slate-500">Affected Trains:</span>
          <span className="ml-1 text-white font-medium">{scenario.affectedTrains}</span>
        </div>
        <div>
          <span className="text-slate-500">Est. Delay:</span>
          <span className="ml-1 text-white font-medium">{scenario.estimatedDelay}</span>
        </div>
      </div>
    </div>
  );

  const OptimizationProgress = () => (
    <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
      <div className="flex items-center space-x-3 mb-4">
        <div className="relative">
          <Brain className="w-8 h-8 text-blue-400" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-ping"></div>
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">AI Optimization in Progress</h3>
          <p className="text-slate-400">Analyzing constraints and generating solutions...</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-slate-900 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">Constraint Analysis</span>
            <span className="text-sm text-green-400">Complete</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div className="bg-green-500 h-2 rounded-full w-full"></div>
          </div>
        </div>

        <div className="bg-slate-900 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">Route Optimization</span>
            <span className="text-sm text-blue-400">Processing...</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div className="bg-blue-500 h-2 rounded-full w-3/4 animate-pulse"></div>
          </div>
        </div>

        <div className="bg-slate-900 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">Solution Validation</span>
            <span className="text-sm text-slate-400">Pending</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div className="bg-slate-600 h-2 rounded-full w-1/4"></div>
          </div>
        </div>
      </div>
    </div>
  );

  const OptimizationResults = ({ results }: any) => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-900/50 to-blue-900/50 rounded-lg p-6 border border-green-700/50">
        <div className="flex items-center space-x-3 mb-4">
          <CheckCircle className="w-8 h-8 text-green-400" />
          <div>
            <h3 className="text-xl font-bold text-white">Optimization Complete</h3>
            <p className="text-slate-400">AI has generated optimal scheduling solutions</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-800/50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              <span className="font-medium text-green-400">Delay Reduction</span>
            </div>
            <p className="text-2xl font-bold text-white">{results.delayReduction}</p>
            <p className="text-sm text-slate-400">Average delay improvement</p>
          </div>

          <div className="bg-slate-800/50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="w-5 h-5 text-blue-400" />
              <span className="font-medium text-blue-400">Time Saved</span>
            </div>
            <p className="text-2xl font-bold text-white">{results.timeSaved}</p>
            <p className="text-sm text-slate-400">Total system time saved</p>
          </div>

          <div className="bg-slate-800/50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Zap className="w-5 h-5 text-purple-400" />
              <span className="font-medium text-purple-400">Efficiency Gain</span>
            </div>
            <p className="text-2xl font-bold text-white">{results.efficiencyGain}</p>
            <p className="text-sm text-slate-400">Overall system improvement</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h4 className="text-lg font-bold text-white mb-4">Recommended Actions</h4>
          <div className="space-y-3">
            {results.recommendations.map((rec: any, index: number) => (
              <div key={index} className="flex items-start space-x-3">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  rec.priority === 'High' ? 'bg-red-400' :
                  rec.priority === 'Medium' ? 'bg-yellow-400' : 'bg-green-400'
                }`}></div>
                <div className="flex-1">
                  <p className="text-white font-medium">{rec.action}</p>
                  <p className="text-sm text-slate-400">{rec.description}</p>
                  <span className={`inline-block mt-1 px-2 py-1 rounded-full text-xs ${
                    rec.priority === 'High' ? 'bg-red-500/20 text-red-400' :
                    rec.priority === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' : 
                    'bg-green-500/20 text-green-400'
                  }`}>
                    {rec.priority} Priority
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h4 className="text-lg font-bold text-white mb-4">Impact Analysis</h4>
          <div className="space-y-4">
            {results.impacts.map((impact: any, index: number) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">{impact.metric}</span>
                  <span className={`font-medium ${
                    impact.change.startsWith('+') ? 'text-green-400' : 'text-blue-400'
                  }`}>
                    {impact.change}
                  </span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      impact.change.startsWith('+') ? 'bg-green-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${Math.abs(parseFloat(impact.change))}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">AI Schedule Optimizer</h2>
          <p className="text-slate-400">Intelligent route and schedule optimization using machine learning</p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={handleOptimization}
            disabled={!selectedScenario || isOptimizing}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 px-4 py-2 rounded-lg font-medium transition-colors"
          >
            {isOptimizing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isOptimizing ? 'Optimizing...' : 'Run Optimization'}</span>
          </button>
        </div>
      </div>

      {isOptimizing ? (
        <OptimizationProgress />
      ) : optimizationResults ? (
        <OptimizationResults results={optimizationResults} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Scenario Selection */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4">Select Optimization Scenario</h3>
            <div className="space-y-4">
              {scenarios.map((scenario) => (
                <ScenarioCard
                  key={scenario.id}
                  scenario={scenario}
                  isSelected={selectedScenario?.id === scenario.id}
                  onClick={setSelectedScenario}
                />
              ))}
            </div>
          </div>

          {/* Scenario Details */}
          <div className="space-y-6">
            {selectedScenario ? (
              <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                <h3 className="text-lg font-bold text-white mb-4">Scenario Analysis</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-blue-400 mb-2">Problem Description</h4>
                    <p className="text-sm text-slate-300">{selectedScenario.detailedDescription}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-yellow-400 mb-2">Constraints</h4>
                    <ul className="text-sm text-slate-300 space-y-1">
                      {selectedScenario.constraints.map((constraint: string, index: number) => (
                        <li key={index} className="flex items-center space-x-2">
                          <div className="w-1 h-1 bg-yellow-400 rounded-full"></div>
                          <span>{constraint}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium text-green-400 mb-2">Expected Improvements</h4>
                    <ul className="text-sm text-slate-300 space-y-1">
                      {selectedScenario.expectedImprovements.map((improvement: string, index: number) => (
                        <li key={index} className="flex items-center space-x-2">
                          <CheckCircle className="w-3 h-3 text-green-400" />
                          <span>{improvement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                <div className="text-center py-8">
                  <Brain className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-400 mb-2">Select a Scenario</h3>
                  <p className="text-sm text-slate-500">Choose an optimization scenario to analyze and get AI-powered recommendations</p>
                </div>
              </div>
            )}

            {/* AI Capabilities */}
            <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded-lg p-6 border border-purple-700/50">
              <div className="flex items-center space-x-3 mb-4">
                <Zap className="w-6 h-6 text-purple-400" />
                <h3 className="text-lg font-bold text-white">AI Optimization Features</h3>
              </div>
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-sm text-slate-300">Real-time constraint solving</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-sm text-slate-300">Predictive delay analysis</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <span className="text-sm text-slate-300">Multi-objective optimization</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span className="text-sm text-slate-300">Dynamic rerouting suggestions</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleOptimizer;