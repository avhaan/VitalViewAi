'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function HomePage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFile = (selectedFile: File) => {
    if (selectedFile.type !== 'application/pdf') {
      setError('Please upload a PDF file');
      return;
    }
    setFile(selectedFile);
    setError(null);
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const base64 = btoa(
        new Uint8Array(arrayBuffer).reduce(
          (data, byte) => data + String.fromCharCode(byte),
          ''
        )
      );
      
      const documentId = `doc-${Date.now()}`;
      const tempData = {
        fileName: file.name,
        fileData: base64,
        fileSize: file.size,
        documentId: documentId
      };
      
      localStorage.setItem(`document-${documentId}`, JSON.stringify(tempData));
      router.push(`/results/${documentId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process PDF');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EEF8FF] via-white to-[#EEF8FF]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#0B7BD6] to-[#66D1C9] rounded-xl flex items-center justify-center text-white font-bold text-xl">
              V
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-[#0B7BD6] to-[#66D1C9] bg-clip-text text-transparent">
              VitalView AI
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-[#1A1A1A] hover:text-[#0B7BD6] transition-colors font-medium">
              Home
            </Link>
            <Link href="#about" className="text-[#1A1A1A] hover:text-[#0B7BD6] transition-colors font-medium">
              About
            </Link>
            <Link href="/nearby-care" className="text-[#1A1A1A] hover:text-[#0B7BD6] transition-colors font-medium flex items-center gap-1">
              <span>📍</span>
              Find Care
            </Link>
            <Link href="/bmi" className="text-[#1A1A1A] hover:text-[#0B7BD6] transition-colors font-medium">
              BMI Calculator
            </Link>
            <Link href="#upload" className="text-[#1A1A1A] hover:text-[#0B7BD6] transition-colors font-medium">
              Upload Report
            </Link>
            <Button className="bg-gradient-to-r from-[#0B7BD6] to-[#66D1C9] hover:opacity-90 transition-opacity rounded-full px-6">
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-[#66D1C9]/30 rounded-full px-6 py-3 mb-8">
              <span className="text-2xl">✨</span>
              <span className="text-sm font-medium text-[#0B7BD6]">Powered by Advanced Medical AI</span>
            </div>
            
            <h1 className="text-6xl md:text-7xl font-bold text-[#1A1A1A] mb-6 leading-tight">
              Understand Your Health
              <br />
              <span className="bg-gradient-to-r from-[#0B7BD6] to-[#66D1C9] bg-clip-text text-transparent">
                in Seconds
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
              AI-powered medical report analysis with clear explanations and auto-generated health visuals.
              Transform complex lab results into insights you can actually understand.
            </p>

            {/* Upload Section in Hero */}
            <div className="max-w-xl mx-auto">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="relative cursor-pointer group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#0B7BD6] to-[#66D1C9] rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
                <div className="relative bg-white/80 backdrop-blur-xl border-2 border-dashed border-[#0B7BD6]/30 rounded-3xl p-12 hover:border-[#0B7BD6] transition-all">
                  <div className="text-6xl mb-4">🩺</div>
                  <p className="text-lg font-semibold text-[#1A1A1A] mb-2">
                    {file ? file.name : 'Upload Medical Report'}
                  </p>
                  <p className="text-sm text-gray-500">
                    PDF format • Blood tests, prescriptions, lab results
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                    className="hidden"
                  />
                </div>
              </div>

              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm">
                  {error}
                </div>
              )}

              <Button
                onClick={handleAnalyze}
                disabled={!file || loading}
                size="lg"
                className="mt-6 bg-gradient-to-r from-[#0B7BD6] to-[#66D1C9] hover:opacity-90 transition-opacity rounded-full px-12 py-7 text-lg font-semibold shadow-xl shadow-[#0B7BD6]/20 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <span className="mr-2 animate-spin">⏳</span>
                    Analyzing Your Report...
                  </>
                ) : (
                  <>
                    <span className="mr-2">🔍</span>
                    Analyze Now
                  </>
                )}
              </Button>
            </div>

            {/* Sample Visuals Carousel */}
            <div className="mt-16 flex flex-wrap justify-center gap-4">
              {['Blood Sugar Chart', 'Cholesterol Analysis', 'Vitamin D Status'].map((label, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 * i }}
                  className="bg-white/60 backdrop-blur-sm border border-gray-200 rounded-2xl px-6 py-4 flex items-center gap-3"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-[#0B7BD6] to-[#66D1C9] rounded-xl flex items-center justify-center text-white text-xl">
                    {['📊', '🫀', '☀️'][i]}
                  </div>
                  <span className="font-medium text-[#1A1A1A]">{label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[#1A1A1A] mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Three simple steps to clarity
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: '📤', title: 'Upload Report', desc: 'Drop your PDF medical report, lab results, or blood test' },
              { icon: '🤖', title: 'AI Analyzes', desc: 'Our advanced AI reads and interprets your results in seconds' },
              { icon: '📊', title: 'Get Insights + Visuals', desc: 'Receive clear explanations with interactive charts and graphics' }
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="bg-white backdrop-blur-xl border border-gray-200 rounded-3xl p-8 hover:shadow-2xl hover:border-[#66D1C9] transition-all">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#0B7BD6] to-[#66D1C9] rounded-2xl flex items-center justify-center text-3xl mb-6">
                    {step.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-[#1A1A1A] mb-3">
                    {i + 1}. {step.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* What You'll See */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[#1A1A1A] mb-4">
              What You'll See
            </h2>
            <p className="text-xl text-gray-600">
              Comprehensive insights tailored to you
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: '📋', title: 'Your Health Summary', desc: 'Top findings in plain English', color: 'from-blue-500 to-cyan-500' },
              { icon: '⚠️', title: 'Key Problems Identified', desc: 'What needs attention', color: 'from-orange-500 to-red-500' },
              { icon: '📈', title: 'Visual Insights', desc: 'Charts, graphs, test tubes', color: 'from-purple-500 to-pink-500' },
              { icon: '💡', title: 'Actionable Advice', desc: 'Daily steps you can take', color: 'from-green-500 to-teal-500' }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * i }}
                viewport={{ once: true }}
                className="bg-white border border-gray-200 rounded-3xl p-8 hover:shadow-xl transition-all group cursor-pointer"
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform`}>
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold text-[#1A1A1A] mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Example Visual Analysis */}
      <section className="py-20 px-6 bg-gradient-to-br from-[#EEF8FF] to-white">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white border border-gray-200 rounded-3xl p-12 shadow-2xl"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-[#1A1A1A] mb-3">
                We Turn Lab Numbers Into Visuals
              </h2>
              <p className="text-gray-600">
                Example: Blood Sugar Analysis
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-8 border-2 border-indigo-200">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Glucose Level</div>
                  <div className="text-4xl font-bold text-indigo-600">145 mg/dL</div>
                </div>
                <div className="text-6xl">🩸</div>
              </div>
              
              {/* Placeholder chart */}
              <div className="h-48 bg-white rounded-xl flex items-center justify-center border border-gray-200">
                <div className="text-center">
                  <div className="text-5xl mb-2">📊</div>
                  <div className="text-gray-500 font-medium">Interactive Chart Preview</div>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-white rounded-xl border border-indigo-200">
                <p className="text-sm text-gray-700">
                  <strong className="text-indigo-600">What this means:</strong> Your glucose is slightly elevated. Consider reducing sugar intake and increasing physical activity.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Why VitalView AI */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[#1A1A1A] mb-4">
              Why VitalView AI?
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: '💬', title: 'Clear Explanations', desc: 'No medical jargon, just simple language' },
              { icon: '🎨', title: 'AI-Powered Visuals', desc: 'Automatic charts and graphics' },
              { icon: '🔒', title: 'Private & Secure', desc: 'Your data stays on your device' },
              { icon: '👨‍⚕️', title: 'Doctor-Friendly', desc: 'Share with your healthcare provider' }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
                viewport={{ once: true }}
                className="bg-gradient-to-br from-white to-[#EEF8FF] border border-[#66D1C9]/30 rounded-3xl p-8 hover:shadow-xl transition-all"
              >
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-[#1A1A1A] mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Access Tools */}
      <section className="py-20 px-6 bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[#1A1A1A] mb-4">
              Quick Access Tools
            </h2>
            <p className="text-xl text-gray-600">
              Essential healthcare tools at your fingertips
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Find Care Near You Card */}
            <Link href="/nearby-care">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="group relative overflow-hidden bg-white backdrop-blur-xl border-2 border-teal-200 rounded-3xl p-8 hover:shadow-2xl hover:border-teal-400 transition-all cursor-pointer h-full"
              >
                <div className="absolute top-0 right-0 text-8xl opacity-5 group-hover:opacity-10 transition-opacity">
                  🧭
                </div>
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-2xl flex items-center justify-center text-4xl mb-6 group-hover:scale-110 transition-transform">
                    📍
                  </div>
                  <h3 className="text-2xl font-bold text-[#1A1A1A] mb-3">
                    Find Care Near You
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    Locate the closest hospitals, clinics, and pharmacies instantly using your location.
                  </p>
                  <div className="inline-flex items-center text-teal-600 font-semibold group-hover:gap-3 gap-2 transition-all">
                    Get Started
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
              </motion.div>
            </Link>

            {/* BMI Calculator Card */}
            <Link href="/bmi">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                viewport={{ once: true }}
                className="group relative overflow-hidden bg-white backdrop-blur-xl border-2 border-purple-200 rounded-3xl p-8 hover:shadow-2xl hover:border-purple-400 transition-all cursor-pointer h-full"
              >
                <div className="absolute top-0 right-0 text-8xl opacity-5 group-hover:opacity-10 transition-opacity">
                  ⚖️
                </div>
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-4xl mb-6 group-hover:scale-110 transition-transform">
                    📏
                  </div>
                  <h3 className="text-2xl font-bold text-[#1A1A1A] mb-3">
                    BMI Calculator
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    Calculate your Body Mass Index and understand your health metrics.
                  </p>
                  <div className="inline-flex items-center text-purple-600 font-semibold group-hover:gap-3 gap-2 transition-all">
                    Calculate Now
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
              </motion.div>
            </Link>

            {/* Coming Soon Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              viewport={{ once: true }}
              className="group relative overflow-hidden bg-white backdrop-blur-xl border-2 border-gray-200 rounded-3xl p-8 opacity-60 h-full"
            >
              <div className="absolute top-0 right-0 text-8xl opacity-5">
                🔮
              </div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-400 to-gray-500 rounded-2xl flex items-center justify-center text-4xl mb-6">
                  💊
                </div>
                <h3 className="text-2xl font-bold text-[#1A1A1A] mb-3">
                  Medication Tracker
                </h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Track your prescriptions and get reminders. Coming soon!
                </p>
                <div className="inline-flex items-center text-gray-500 font-semibold gap-2">
                  Coming Soon
                  <span className="text-xl">⏳</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section id="upload" className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative overflow-hidden bg-gradient-to-br from-[#0B7BD6] to-[#66D1C9] rounded-3xl p-12 text-center text-white shadow-2xl"
          >
            <div className="absolute top-0 right-0 text-9xl opacity-10">🩺</div>
            <h2 className="text-4xl font-bold mb-4 relative z-10">
              Ready to Understand Your Medical Report?
            </h2>
            <p className="text-xl mb-8 opacity-90 relative z-10">
              Get started in seconds. No signup required.
            </p>
            <Button
              onClick={() => fileInputRef.current?.click()}
              size="lg"
              className="bg-white text-[#0B7BD6] hover:bg-gray-100 rounded-full px-12 py-7 text-lg font-semibold shadow-xl relative z-10"
            >
              <span className="mr-2">📤</span>
              Upload Your Report
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#0B7BD6] to-[#66D1C9] rounded-xl flex items-center justify-center text-white font-bold text-xl">
                V
              </div>
              <span className="text-xl font-bold text-[#1A1A1A]">
                VitalView AI
              </span>
            </div>
            <div className="flex gap-8 text-sm text-gray-600">
              <Link href="#about" className="hover:text-[#0B7BD6] transition-colors">About</Link>
              <Link href="#privacy" className="hover:text-[#0B7BD6] transition-colors">Privacy</Link>
              <Link href="#terms" className="hover:text-[#0B7BD6] transition-colors">Terms</Link>
              <Link href="#contact" className="hover:text-[#0B7BD6] transition-colors">Contact</Link>
            </div>
          </div>
          <div className="mt-8 text-center text-sm text-gray-500">
            © 2025 VitalView AI. Transforming medical reports into clarity.
          </div>
        </div>
      </footer>
    </div>
  );
}
