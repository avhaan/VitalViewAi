'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MetricExplainerPopupProps {
  metricName: string;
  category: string;
}

// Health metric explanations database
const metricExplanations: Record<string, { title: string; explanation: string; why: string; emoji: string }> = {
  // Blood Sugar & Metabolic
  'glucose': {
    title: 'Glucose (Blood Sugar)',
    explanation: 'Glucose is the main type of sugar in your blood. It comes from the food you eat and provides energy to all your cells.',
    why: 'Monitoring glucose helps detect diabetes and ensures your body is processing sugar correctly.',
    emoji: '🍬'
  },
  'hemoglobin a1c': {
    title: 'Hemoglobin A1C',
    explanation: 'This test shows your average blood sugar level over the past 2-3 months. It helps diagnose and monitor diabetes.',
    why: 'Unlike daily glucose tests, A1C gives a long-term picture of blood sugar control.',
    emoji: '📊'
  },
  
  // Electrolytes
  'sodium': {
    title: 'Sodium',
    explanation: 'Sodium is an electrolyte that helps regulate water balance and nerve function in your body.',
    why: 'Too much or too little sodium can affect your heart, kidneys, and overall fluid balance.',
    emoji: '🧂'
  },
  'potassium': {
    title: 'Potassium',
    explanation: 'Potassium is an essential mineral that helps your heart beat properly and your muscles contract.',
    why: 'Abnormal potassium levels can cause heart rhythm problems and muscle weakness.',
    emoji: '🍌'
  },
  'chloride': {
    title: 'Chloride',
    explanation: 'Chloride is an electrolyte that helps maintain proper fluid balance and pH levels in your blood.',
    why: 'It works with sodium to keep your body\'s water and acid levels balanced.',
    emoji: '💧'
  },
  'calcium': {
    title: 'Calcium',
    explanation: 'Calcium is a mineral essential for strong bones, teeth, and proper muscle and nerve function.',
    why: 'Low calcium can lead to weak bones (osteoporosis) and muscle problems.',
    emoji: '🦴'
  },
  
  // Kidney Function
  'creatinine': {
    title: 'Creatinine',
    explanation: 'Creatinine is a waste product from muscle breakdown that your kidneys filter out of your blood.',
    why: 'High creatinine levels can indicate your kidneys aren\'t filtering waste properly.',
    emoji: '🫘'
  },
  'blood urea nitrogen': {
    title: 'Blood Urea Nitrogen (BUN)',
    explanation: 'BUN measures the amount of urea nitrogen in your blood, a waste product from protein breakdown.',
    why: 'It helps assess kidney function and can indicate dehydration or kidney disease.',
    emoji: '🔬'
  },
  
  // Liver Function
  'alt': {
    title: 'ALT (Alanine Aminotransferase)',
    explanation: 'ALT is an enzyme found mainly in your liver. High levels can indicate liver damage or inflammation.',
    why: 'It\'s a key marker for detecting liver problems like hepatitis or fatty liver disease.',
    emoji: '🫀'
  },
  'ast': {
    title: 'AST (Aspartate Aminotransferase)',
    explanation: 'AST is an enzyme found in your liver, heart, and muscles. Elevated levels may indicate liver or heart damage.',
    why: 'Combined with ALT, it helps diagnose liver disease and assess its severity.',
    emoji: '🩺'
  },
  'bilirubin': {
    title: 'Bilirubin',
    explanation: 'Bilirubin is a yellowish substance produced when red blood cells break down. Your liver processes it.',
    why: 'High bilirubin can cause jaundice and may indicate liver problems or blood disorders.',
    emoji: '🟡'
  },
  
  // Blood Cells
  'hemoglobin': {
    title: 'Hemoglobin',
    explanation: 'Hemoglobin is the protein in red blood cells that carries oxygen throughout your body.',
    why: 'Low hemoglobin (anemia) can make you tired and weak. High levels may indicate dehydration or lung disease.',
    emoji: '🔴'
  },
  'white blood cells': {
    title: 'White Blood Cells (WBC)',
    explanation: 'White blood cells are part of your immune system and help fight infections and diseases.',
    why: 'High WBC can mean infection or inflammation. Low WBC makes you more prone to infections.',
    emoji: '⚪'
  },
  'platelets': {
    title: 'Platelets',
    explanation: 'Platelets are tiny blood cells that help your blood clot and stop bleeding.',
    why: 'Low platelets can cause excessive bleeding. High platelets may increase clotting risk.',
    emoji: '🩸'
  },
  
  // Cholesterol & Lipids
  'cholesterol': {
    title: 'Total Cholesterol',
    explanation: 'Cholesterol is a waxy substance in your blood. Your body needs some, but too much increases heart disease risk.',
    why: 'High cholesterol can clog arteries and lead to heart attacks or strokes.',
    emoji: '❤️'
  },
  'ldl': {
    title: 'LDL (Bad Cholesterol)',
    explanation: 'LDL is "bad" cholesterol that can build up in your arteries and cause blockages.',
    why: 'Lower LDL reduces your risk of heart disease and stroke.',
    emoji: '⚠️'
  },
  'hdl': {
    title: 'HDL (Good Cholesterol)',
    explanation: 'HDL is "good" cholesterol that helps remove bad cholesterol from your arteries.',
    why: 'Higher HDL protects against heart disease. Think of it as your arterial cleanup crew!',
    emoji: '✅'
  },
  'triglycerides': {
    title: 'Triglycerides',
    explanation: 'Triglycerides are a type of fat in your blood. They come from food and are stored for energy.',
    why: 'High triglycerides increase heart disease risk, especially when combined with high cholesterol.',
    emoji: '🧈'
  },
  
  // Thyroid
  'tsh': {
    title: 'TSH (Thyroid Stimulating Hormone)',
    explanation: 'TSH is a hormone that tells your thyroid gland how much thyroid hormone to make.',
    why: 'It helps diagnose thyroid problems that affect metabolism, energy, and weight.',
    emoji: '🦋'
  },
  
  // General
  'default': {
    title: 'Health Metric',
    explanation: 'This is a measurement from your lab test that helps assess your health status.',
    why: 'Your doctor uses this value along with other tests to understand your overall health.',
    emoji: '📋'
  }
};

export default function MetricExplainerPopup({ metricName, category }: MetricExplainerPopupProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Get explanation (case-insensitive match)
  const metricKey = metricName.toLowerCase();
  const info = metricExplanations[metricKey] || metricExplanations['default'];

  return (
    <div className="inline-block relative">
      {/* Question Mark Icon - Hoverable */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        className="ml-2 w-5 h-5 rounded-full bg-white/30 hover:bg-white/50 backdrop-blur-sm flex items-center justify-center text-xs font-bold transition-all cursor-help"
        title="Ask Dr. Chick about this"
      >
        ?
      </motion.button>

      {/* Popup Explanation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 top-full mt-2 w-80 z-50"
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
          >
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border-2 border-[#0B7BD6]/20 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-[#0B7BD6] to-[#66D1C9] p-4 text-white">
                <div className="flex items-center gap-2">
                  <div className="text-2xl">{info.emoji}</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-base">{info.title}</h4>
                    </div>
                    <p className="text-xs opacity-90">Ask Dr. Chick 🐥</p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 space-y-3">
                {/* What is it? */}
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <span className="text-sm font-semibold text-[#0B7BD6]">💡 What is it?</span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    {info.explanation}
                  </p>
                </div>

                {/* Why it matters */}
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <span className="text-sm font-semibold text-[#0B7BD6]">🎯 Why it matters</span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    {info.why}
                  </p>
                </div>

                {/* Footer */}
                <div className="pt-2 border-t border-gray-200 dark:border-slate-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    💊 Always consult your doctor for personalized medical advice
                  </p>
                </div>
              </div>
            </div>

            {/* Arrow pointer */}
            <div className="absolute left-4 -top-2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-[#0B7BD6]" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
