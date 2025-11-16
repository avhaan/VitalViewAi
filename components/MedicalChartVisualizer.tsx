'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine, Area, AreaChart, RadialBarChart, RadialBar, Legend, PieChart, Pie } from 'recharts';
import { motion } from 'framer-motion';
import MetricExplainerPopup from './MetricExplainerPopup';

interface VisualAidData {
  type: string;
  patientValue: number;
  normalMin: number;
  normalMax: number;
  testName: string;
  unit: string;
  thresholds?: {
    label: string;
    value: number;
    color: string;
  }[];
  caption?: string;
}

interface Props {
  data: VisualAidData;
}

export default function MedicalChartVisualizer({ data }: Props) {
  const { patientValue, normalMin, normalMax, testName, unit, caption } = data;

  // Determine status and color based on value
  const getStatus = () => {
    if (patientValue < normalMin) return { status: 'LOW', color: '#ef4444', bgColor: 'bg-red-500', textColor: 'text-red-700' };
    if (patientValue > normalMax) return { status: 'HIGH', color: '#ef4444', bgColor: 'bg-red-500', textColor: 'text-red-700' };
    if (patientValue >= normalMin * 0.95 && patientValue <= normalMin) return { status: 'BORDERLINE', color: '#eab308', bgColor: 'bg-yellow-500', textColor: 'text-yellow-700' };
    if (patientValue >= normalMax && patientValue <= normalMax * 1.05) return { status: 'BORDERLINE', color: '#eab308', bgColor: 'bg-yellow-500', textColor: 'text-yellow-700' };
    return { status: 'NORMAL', color: '#22c55e', bgColor: 'bg-green-500', textColor: 'text-green-700' };
  };

  const statusInfo = getStatus();
  
  // Balanced range - shows 50-70% for high values
  const rangeMin = 0;
  const rangeMax = Math.max(patientValue * 1.5, normalMax * 2.0);
  const percentage = (patientValue / rangeMax) * 100;

  // Data for radial progress
  const radialData = [
    {
      name: testName,
      value: percentage,
      fill: statusInfo.color,
    },
  ];

  // Create chart data for bar chart
  const chartData = [
    {
      name: 'Low',
      value: normalMin,
      fill: '#94a3b8',
    },
    {
      name: 'You',
      value: patientValue,
      fill: statusInfo.color,
    },
    {
      name: 'High',
      value: normalMax,
      fill: '#94a3b8',
    },
  ];

  const maxValue = Math.max(patientValue, normalMax) * 1.2;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mb-8 overflow-hidden"
    >
      {/* Header with animated gradient background */}
      <div className="relative bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-t-xl p-5 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center mb-1">
                <h3 className="text-lg font-bold">{testName}</h3>
                <MetricExplainerPopup metricName={testName} category="Clinical Test" />
              </div>
              <p className="text-blue-100 text-xs">Clinical Test Result</p>
            </div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring' }}
              className={`px-3 py-1 ${statusInfo.bgColor} bg-opacity-90 rounded-full font-bold text-white text-xs shadow-lg`}
            >
              {statusInfo.status}
            </motion.div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-b-xl shadow-xl border border-gray-200 dark:border-slate-700">
        {/* Large Value Display */}
        <div className="p-6 text-center border-b border-gray-100 dark:border-slate-800">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="inline-block"
          >
            <div className="text-4xl font-bold mb-1" style={{ color: statusInfo.color }}>
              {patientValue}
              <span className="text-lg ml-2 text-gray-500">{unit}</span>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              Normal Range: {normalMin} - {normalMax} {unit}
            </div>
          </motion.div>
        </div>

        {/* Two Column Charts Container */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5">
          {/* Radial Progress Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-900 rounded-xl p-3"
          >
            <h4 className="font-semibold text-center mb-2 text-sm text-gray-700 dark:text-gray-200">Progress Indicator</h4>
            <ResponsiveContainer width="100%" height={130}>
              <RadialBarChart
                cx="50%"
                cy="70%"
                innerRadius="60%"
                outerRadius="100%"
                barSize={20}
                data={radialData}
                startAngle={180}
                endAngle={0}
              >
                <RadialBar
                  background
                  dataKey="value"
                  cornerRadius={10}
                  fill={statusInfo.color}
                />
                <text
                  x="50%"
                  y="65%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-3xl font-bold"
                  fill={statusInfo.color}
                >
                  {Math.round(percentage)}%
                </text>
              </RadialBarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Bar Comparison Chart */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-900 rounded-xl p-3"
          >
            <h4 className="font-semibold text-center mb-2 text-sm text-gray-700 dark:text-gray-200">Value Comparison</h4>
            <ResponsiveContainer width="100%" height={130}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.3} />
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 10 }} domain={[0, maxValue]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '6px',
                  }}
                  formatter={(value: number) => [`${value} ${unit}`, '']}
                />
                <ReferenceLine y={normalMin} stroke="#22c55e" strokeDasharray="3 3" />
                <ReferenceLine y={normalMax} stroke="#22c55e" strokeDasharray="3 3" />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} animationDuration={1000}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Status Card */}
        {caption && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="m-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 rounded-lg border-l-4 border-blue-500"
          >
            <div className="flex items-start gap-2">
              <div className="text-xl">💡</div>
              <div>
                <h5 className="font-bold text-blue-900 dark:text-blue-100 mb-1 text-xs">What This Means</h5>
                <p className="text-xs text-blue-800 dark:text-blue-200 leading-relaxed">{caption}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Status Badge with Animation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="p-4 pb-5 text-center"
        >
          {patientValue >= normalMin && patientValue <= normalMax ? (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full text-xs font-bold shadow-md transform hover:scale-105 transition-transform">
              <span className="text-lg">✓</span>
              <span>Within Normal Range</span>
            </div>
          ) : patientValue < normalMin ? (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-full text-xs font-bold shadow-md transform hover:scale-105 transition-transform">
              <span className="text-lg">⚠</span>
              <span>Below Normal Range</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-full text-xs font-bold shadow-md transform hover:scale-105 transition-transform">
              <span className="text-lg">⚠</span>
              <span>Above Normal Range</span>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
