'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

export default function BMICalculatorPage() {
  const [height, setHeight] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const [unit, setUnit] = useState<'metric' | 'imperial'>('metric');
  const [bmi, setBmi] = useState<number | null>(null);
  const [category, setCategory] = useState<string>('');

  const calculateBMI = () => {
    const h = parseFloat(height);
    const w = parseFloat(weight);

    if (!h || !w || h <= 0 || w <= 0) {
      alert('Please enter valid height and weight values');
      return;
    }

    let bmiValue: number;
    
    if (unit === 'metric') {
      // BMI = weight (kg) / (height (m))^2
      const heightInMeters = h / 100;
      bmiValue = w / (heightInMeters * heightInMeters);
    } else {
      // BMI = (weight (lbs) / (height (inches))^2) * 703
      bmiValue = (w / (h * h)) * 703;
    }

    setBmi(parseFloat(bmiValue.toFixed(1)));
    
    // Determine category
    if (bmiValue < 18.5) {
      setCategory('Underweight');
    } else if (bmiValue >= 18.5 && bmiValue < 25) {
      setCategory('Normal Weight');
    } else if (bmiValue >= 25 && bmiValue < 30) {
      setCategory('Overweight');
    } else {
      setCategory('Obese');
    }
  };

  const getCategoryColor = () => {
    if (category === 'Underweight') return 'from-blue-500 to-cyan-500';
    if (category === 'Normal Weight') return 'from-green-500 to-emerald-500';
    if (category === 'Overweight') return 'from-yellow-500 to-orange-500';
    if (category === 'Obese') return 'from-red-500 to-rose-500';
    return 'from-gray-500 to-gray-600';
  };

  const getCategoryIcon = () => {
    if (category === 'Underweight') return '📉';
    if (category === 'Normal Weight') return '✅';
    if (category === 'Overweight') return '⚠️';
    if (category === 'Obese') return '🚨';
    return '📊';
  };

  const reset = () => {
    setHeight('');
    setWeight('');
    setBmi(null);
    setCategory('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EEF8FF] via-white to-[#EEF8FF]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#0B7BD6] to-[#66D1C9] rounded-xl flex items-center justify-center text-white font-bold text-xl">
              V
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-[#0B7BD6] to-[#66D1C9] bg-clip-text text-transparent">
              VitalView AI
            </span>
          </Link>
          <Link href="/">
            <Button variant="outline" className="rounded-full">
              ← Back to Home
            </Button>
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-24 pb-12 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl font-bold text-[#1A1A1A] mb-4">
              BMI Calculator
            </h1>
            <p className="text-xl text-gray-600">
              Calculate your Body Mass Index and understand your health status
            </p>
          </motion.div>

          {/* Calculator Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl shadow-2xl border border-gray-200 p-8 md:p-12"
          >
            {/* Unit Toggle */}
            <div className="flex justify-center mb-8">
              <div className="inline-flex bg-gray-100 rounded-full p-1">
                <button
                  onClick={() => setUnit('metric')}
                  className={`px-6 py-2 rounded-full font-medium transition-all ${
                    unit === 'metric'
                      ? 'bg-gradient-to-r from-[#0B7BD6] to-[#66D1C9] text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Metric (cm, kg)
                </button>
                <button
                  onClick={() => setUnit('imperial')}
                  className={`px-6 py-2 rounded-full font-medium transition-all ${
                    unit === 'imperial'
                      ? 'bg-gradient-to-r from-[#0B7BD6] to-[#66D1C9] text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Imperial (in, lbs)
                </button>
              </div>
            </div>

            {/* Input Fields */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Height {unit === 'metric' ? '(cm)' : '(inches)'}
                </label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder={unit === 'metric' ? '170' : '67'}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#0B7BD6] focus:outline-none text-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Weight {unit === 'metric' ? '(kg)' : '(lbs)'}
                </label>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder={unit === 'metric' ? '70' : '154'}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#0B7BD6] focus:outline-none text-lg"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mb-8">
              <Button
                onClick={calculateBMI}
                className="flex-1 bg-gradient-to-r from-[#0B7BD6] to-[#66D1C9] hover:opacity-90 text-white rounded-full py-6 text-lg font-semibold shadow-xl"
              >
                Calculate BMI
              </Button>
              <Button
                onClick={reset}
                variant="outline"
                className="rounded-full px-8 py-6 text-lg border-2"
              >
                Reset
              </Button>
            </div>

            {/* Result Display */}
            {bmi !== null && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-8"
              >
                <div className={`bg-gradient-to-r ${getCategoryColor()} rounded-3xl p-8 text-white text-center shadow-2xl`}>
                  <div className="text-6xl mb-4">{getCategoryIcon()}</div>
                  <div className="text-5xl font-bold mb-2">{bmi}</div>
                  <div className="text-2xl font-semibold mb-4">Your BMI</div>
                  <div className="text-xl opacity-90">{category}</div>
                </div>

                {/* BMI Chart */}
                <div className="mt-8 bg-gray-50 rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">BMI Categories</h3>
                  <div className="space-y-3">
                    {[
                      { range: '< 18.5', label: 'Underweight', color: 'bg-blue-500' },
                      { range: '18.5 - 24.9', label: 'Normal Weight', color: 'bg-green-500' },
                      { range: '25.0 - 29.9', label: 'Overweight', color: 'bg-yellow-500' },
                      { range: '≥ 30.0', label: 'Obese', color: 'bg-red-500' }
                    ].map((item, i) => (
                      <div
                        key={i}
                        className={`flex items-center justify-between p-3 rounded-xl ${
                          category === item.label ? 'bg-white shadow-md border-2 border-gray-300' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-4 h-4 rounded-full ${item.color}`}></div>
                          <span className="font-semibold text-gray-700">{item.label}</span>
                        </div>
                        <span className="text-gray-600 font-medium">{item.range}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Health Tips */}
                <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border-l-4 border-[#0B7BD6]">
                  <div className="flex items-start gap-3">
                    <div className="text-3xl">💡</div>
                    <div>
                      <h4 className="font-bold text-gray-800 mb-2">Health Tip</h4>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {category === 'Underweight' && 'Consider consulting a healthcare provider to discuss healthy weight gain strategies.'}
                        {category === 'Normal Weight' && 'Great! Maintain your healthy weight through balanced diet and regular exercise.'}
                        {category === 'Overweight' && 'Consider adopting a healthier lifestyle with balanced nutrition and regular physical activity.'}
                        {category === 'Obese' && 'Consult with a healthcare professional for personalized guidance on achieving a healthier weight.'}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Info Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-8 text-center text-sm text-gray-500"
          >
            <p>💡 BMI is a screening tool and may not reflect health status in all cases.</p>
            <p>Consult healthcare professionals for personalized health advice.</p>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
