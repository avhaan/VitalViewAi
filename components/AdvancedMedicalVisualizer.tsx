'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, RadialBarChart, RadialBar } from 'recharts';
import { motion } from 'framer-motion';
import React from 'react';
import MetricExplainerPopup from './MetricExplainerPopup';

interface TestData {
  testName: string;
  category: string;
  visualizationType: string;
  patientValue: number;
  normalMin: number;
  normalMax: number;
  unit: string;
  trend?: string;
  historicalValues?: number[];
  organAffected?: string;
  severity: string;
  icon?: string;
}

interface Props {
  test: TestData;
  reportType?: string;
}

// Helper function to extract numeric value from patientValue (handles objects, strings, numbers)
function getNumericValue(value: any): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  }
  if (typeof value === 'object' && value !== null) {
    // For objects like {systolic: 152, diastolic: 94}, take the first numeric value
    const firstValue = Object.values(value)[0];
    return getNumericValue(firstValue);
  }
  return 0;
}

// Helper function to display patientValue (handles objects, strings, numbers)
function displayValue(value: any): string {
  if (typeof value === 'object' && value !== null) {
    // For objects like {systolic: 152, diastolic: 94}, format as "152/94"
    return Object.values(value).join('/');
  }
  return String(value);
}

// Test Tube Visualization
function TestTubeViz({ test }: { test: TestData }) {
  const numericValue = getNumericValue(test.patientValue);
  // Balanced range - shows 50-70% for high values
  const rangeMax = Math.max(numericValue * 1.5, test.normalMax * 2.0);
  const fillPercentage = Math.max((numericValue / rangeMax) * 100, 10); // Min 10% for visibility
  
  const getColor = () => {
    if (test.severity === 'critical') return '#dc2626';
    if (test.severity === 'concerning') return '#ea580c';
    if (test.severity === 'borderline') return '#eab308';
    return '#22c55e';
  };

  return (
    <div className="relative w-24 h-48 mx-auto mb-4">
      {/* Test tube body */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-14 h-32 bg-white dark:bg-slate-800 border-3 border-gray-300 dark:border-gray-600 rounded-b-full overflow-hidden">
        {/* Liquid fill with animation */}
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: `${fillPercentage}%` }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute bottom-0 w-full rounded-b-full"
          style={{ backgroundColor: getColor() }}
        >
          {/* Bubbles effect */}
          <div className="absolute top-1 left-2 w-1.5 h-1.5 bg-white rounded-full opacity-50 animate-pulse"></div>
          <div className="absolute top-4 right-3 w-1 h-1 bg-white rounded-full opacity-40 animate-pulse delay-75"></div>
        </motion.div>
        
        {/* Graduation marks */}
        <div className="absolute left-0 w-full h-full">
          <div className="absolute w-full h-px bg-gray-400 top-1/4 left-0"></div>
          <div className="absolute w-full h-px bg-gray-400 top-1/2 left-0"></div>
          <div className="absolute w-full h-px bg-gray-400 top-3/4 left-0"></div>
        </div>
      </div>

      {/* Test tube cap */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-6 bg-gray-400 dark:bg-gray-600 rounded-t-lg"></div>
      
      {/* Value label */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center w-full">
        <div className="text-xl font-bold" style={{ color: getColor() }}>
          {displayValue(test.patientValue)}
        </div>
        <div className="text-xs text-gray-500">{test.unit}</div>
      </div>
    </div>
  );
}

// Gauge Meter Visualization
function GaugeViz({ test }: { test: TestData }) {
  const numericValue = getNumericValue(test.patientValue);
  // Balanced range - shows 50-70% for high values
  const rangeMin = 0;
  const rangeMax = Math.max(numericValue * 1.5, test.normalMax * 2.0);
  
  // Calculate percentage based on full range
  const percentage = (numericValue / rangeMax) * 100;
  
  // Calculate where normal range sits on the gauge
  const normalMinPercent = (test.normalMin / rangeMax) * 100;
  const normalMaxPercent = (test.normalMax / rangeMax) * 100;
  
  const getColor = () => {
    if (test.severity === 'critical') return '#dc2626';
    if (test.severity === 'concerning') return '#ea580c';
    if (test.severity === 'borderline') return '#eab308';
    return '#22c55e';
  };

  const data = [
    { name: 'value', value: percentage, fill: getColor() },
  ];

  return (
    <div className="w-full mb-2">
      <ResponsiveContainer width="100%" height={150}>
        <RadialBarChart
          cx="50%"
          cy="70%"
          innerRadius="70%"
          outerRadius="100%"
          barSize={20}
          data={data}
          startAngle={180}
          endAngle={0}
        >
          <RadialBar
            background={{ fill: '#e5e7eb' }}
            dataKey="value"
            cornerRadius={15}
          />
          <text
            x="50%"
            y="60%"
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-3xl font-bold"
            fill={getColor()}
          >
            {displayValue(test.patientValue)}
          </text>
          <text
            x="50%"
            y="75%"
            textAnchor="middle"
            className="text-xs"
            fill="#6b7280"
          >
            {test.unit}
          </text>
        </RadialBarChart>
      </ResponsiveContainer>
      
      {/* Normal range indicator */}
      <div className="mt-3 text-center">
        <p className="text-xs text-gray-500 font-medium">
          Normal: {test.normalMin}-{test.normalMax} {test.unit}
        </p>
      </div>
    </div>
  );
}

// Line Graph with Trend
function LineGraphViz({ test }: { test: TestData }) {
  const numericValue = getNumericValue(test.patientValue);
  const data = test.historicalValues && test.historicalValues.length > 0
    ? test.historicalValues.map((value, index) => ({
        name: `Test ${index + 1}`,
        value,
      }))
    : [
        { name: 'Previous', value: test.normalMin + (test.normalMax - test.normalMin) / 2 },
        { name: 'Current', value: numericValue },
      ];

  const getColor = () => {
    if (test.severity === 'critical') return '#dc2626';
    if (test.severity === 'concerning') return '#ea580c';
    if (test.severity === 'borderline') return '#eab308';
    return '#22c55e';
  };

  return (
    <ResponsiveContainer width="100%" height={140}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id={`colorValue-${test.testName}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={getColor()} stopOpacity={0.8}/>
            <stop offset="95%" stopColor={getColor()} stopOpacity={0.1}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
        <XAxis dataKey="name" tick={{ fontSize: 10 }} />
        <YAxis tick={{ fontSize: 10 }} domain={[0, Math.max(test.normalMax * 1.5, numericValue * 1.2)]} />
        <Tooltip />
        <Area
          type="monotone"
          dataKey="value"
          stroke={getColor()}
          strokeWidth={2}
          fill={`url(#colorValue-${test.testName})`}
          animationDuration={2000}
        />
        {/* Reference lines for normal range */}
        <line x1="0" y1={test.normalMin} x2="100%" y2={test.normalMin} stroke="#22c55e" strokeDasharray="5 5" />
        <line x1="0" y1={test.normalMax} x2="100%" y2={test.normalMax} stroke="#22c55e" strokeDasharray="5 5" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// Organ Diagram Indicator
function OrganViz({ test }: { test: TestData }) {
  const organIcons: Record<string, string> = {
    heart: '🫀',
    liver: '🫁', // Using lungs as placeholder
    kidney: '🫁',
    pancreas: '🩸',
    thyroid: '🧠',
    lungs: '🫁',
    brain: '🧠',
    stomach: '🫃',
  };

  const organ = test.organAffected || 'general';
  const icon = organIcons[organ] || '🩺';

  return (
    <div className="text-center p-4">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', duration: 0.8 }}
        className="text-6xl mb-3"
      >
        {test.icon || icon}
      </motion.div>
      <div className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-2">
        Affects: {organ.charAt(0).toUpperCase() + organ.slice(1)}
      </div>
      <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
        test.severity === 'critical' ? 'bg-red-100 text-red-700' :
        test.severity === 'concerning' ? 'bg-orange-100 text-orange-700' :
        test.severity === 'borderline' ? 'bg-yellow-100 text-yellow-700' :
        'bg-green-100 text-green-700'
      }`}>
        {test.severity.charAt(0).toUpperCase() + test.severity.slice(1)} Status
      </div>
    </div>
  );
}

// Main Advanced Visualizer Component
export default function AdvancedMedicalVisualizer({ test, reportType }: Props) {
  const renderVisualization = () => {
    switch (test.visualizationType) {
      case 'test_tube':
        return <TestTubeViz test={test} />;
      case 'gauge':
        return <GaugeViz test={test} />;
      case 'line_graph':
        return <LineGraphViz test={test} />;
      case 'organ_diagram':
        return <OrganViz test={test} />;
      default:
        return <GaugeViz test={test} />;
    }
  };

  const getHeaderColor = () => {
    if (test.severity === 'critical') return 'from-red-500 via-rose-500 to-pink-500';
    if (test.severity === 'concerning') return 'from-orange-500 via-amber-500 to-yellow-500';
    if (test.severity === 'borderline') return 'from-yellow-500 via-amber-400 to-orange-400';
    return 'from-green-500 via-emerald-500 to-teal-500';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mb-6"
    >
      {/* Header */}
      <div className={`relative bg-gradient-to-br ${getHeaderColor()} rounded-t-xl p-5 text-white`}>
        <div className="absolute inset-0 bg-black opacity-10 rounded-t-xl"></div>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <div className="text-2xl mb-1">{test.icon || '🩺'}</div>
            <div className="flex items-center">
              <h3 className="text-lg font-bold">{test.testName}</h3>
              <MetricExplainerPopup metricName={test.testName} category={test.category} />
            </div>
            <p className="text-xs opacity-90">{test.category}</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">
              {displayValue(test.patientValue)}
            </div>
            <div className="text-xs opacity-90">{test.unit}</div>
          </div>
        </div>
      </div>

      {/* Visualization Body */}
      <div className="bg-white dark:bg-slate-900 rounded-b-xl shadow-xl border-x border-b border-gray-200 dark:border-slate-700 p-6">
        {renderVisualization()}

        {/* Normal Range Info */}
        <div className="mt-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-700 rounded-lg">
          <div className="text-center">
            <div className="text-xs text-gray-600 dark:text-gray-300 mb-1.5">Normal Range</div>
            <div className="text-sm font-bold text-gray-800 dark:text-gray-100">
              {test.normalMin} - {test.normalMax} {test.unit}
            </div>
          </div>
        </div>

        {/* Trend indicator */}
        {test.trend && (
          <div className="mt-4 text-center">
            <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium ${
              test.trend === 'increasing' ? 'bg-red-50 text-red-700' :
              test.trend === 'decreasing' ? 'bg-blue-50 text-blue-700' :
              'bg-gray-50 text-gray-700'
            }`}>
              {test.trend === 'increasing' && '📈 Trending Up'}
              {test.trend === 'decreasing' && '📉 Trending Down'}
              {test.trend === 'stable' && '➡️ Stable'}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
