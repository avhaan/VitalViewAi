'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import React from 'react';
import MedicalChartVisualizer from '@/components/MedicalChartVisualizer';
import AdvancedMedicalVisualizer from '@/components/AdvancedMedicalVisualizer';
import { parseVisualAidsFromText } from '@/lib/parseVisualAids';

// Helper function to parse inline markdown (bold text)
function parseInlineMarkdown(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  const regex = /\*\*(.*?)\*\*/g;
  let match;

  while ((match = regex.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    // Add bold text
    parts.push(<strong key={match.index} className="font-bold text-gray-900 dark:text-gray-100">{match[1]}</strong>);
    lastIndex = regex.lastIndex;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
}

interface FlowchartNode {
  id: string;
  label: string;
  type: 'start' | 'process' | 'decision' | 'end';
  position: { x: number; y: number };
}

interface FlowchartData {
  nodes: FlowchartNode[];
  description: string;
}

// Simple SVG Flowchart Renderer
function FlowchartRenderer({ data }: { data: FlowchartData }) {
  const padding = 40;
  const nodeWidth = 160;
  const nodeHeight = 60;

  // Calculate SVG dimensions
  const maxX = Array.isArray(data.nodes) && data.nodes.length > 0 ? Math.max(...data.nodes.map(n => n.position.x)) : 0;
  const maxY = Array.isArray(data.nodes) && data.nodes.length > 0 ? Math.max(...data.nodes.map(n => n.position.y)) : 0;
  const width = maxX + nodeWidth + padding * 2;
  const height = maxY + nodeHeight + padding * 2;

  // Get color based on node type
  const getNodeColor = (type: string) => {
    switch (type) {
      case 'start':
        return '#10b981'; // green
      case 'end':
        return '#ef4444'; // red
      case 'decision':
        return '#f59e0b'; // amber
      default:
        return '#3b82f6'; // blue
    }
  };

  // Get shape path based on node type
  const getNodeShape = (node: FlowchartNode) => {
    const { x, y } = node.position;
    const x1 = x + padding;
    const y1 = y + padding;

    if (node.type === 'decision') {
      // Diamond shape for decisions
      return `M ${x1 + nodeWidth / 2} ${y1} L ${x1 + nodeWidth} ${y1 + nodeHeight / 2} L ${x1 + nodeWidth / 2} ${y1 + nodeHeight} L ${x1} ${y1 + nodeHeight / 2} Z`;
    } else if (node.type === 'start' || node.type === 'end') {
      // Rounded rectangle for start/end
      const radius = 10;
      return `M ${x1 + radius} ${y1} L ${x1 + nodeWidth - radius} ${y1} Q ${x1 + nodeWidth} ${y1} ${x1 + nodeWidth} ${y1 + radius} L ${x1 + nodeWidth} ${y1 + nodeHeight - radius} Q ${x1 + nodeWidth} ${y1 + nodeHeight} ${x1 + nodeWidth - radius} ${y1 + nodeHeight} L ${x1 + radius} ${y1 + nodeHeight} Q ${x1} ${y1 + nodeHeight} ${x1} ${y1 + nodeHeight - radius} L ${x1} ${y1 + radius} Q ${x1} ${y1} ${x1 + radius} ${y1} Z`;
    }
    // Rectangle for process
    return `M ${x1} ${y1} L ${x1 + nodeWidth} ${y1} L ${x1 + nodeWidth} ${y1 + nodeHeight} L ${x1} ${y1 + nodeHeight} Z`;
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-white">
      <svg width={width} height={height} className="min-w-full">
        {/* Draw connections between nodes */}
        {Array.isArray(data.nodes) && data.nodes.map((node, idx) => {
          if (idx < data.nodes.length - 1) {
            const nextNode = data.nodes[idx + 1];
            const x1 = node.position.x + padding + nodeWidth / 2;
            const y1 = node.position.y + padding + nodeHeight;
            const x2 = nextNode.position.x + padding + nodeWidth / 2;
            const y2 = nextNode.position.y + padding;

            return (
              <line
                key={`line-${idx}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#d1d5db"
                strokeWidth="2"
                markerEnd="url(#arrowhead)"
              />
            );
          }
          return null;
        })}

        {/* Arrow marker definition */}
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 10 3, 0 6" fill="#d1d5db" />
          </marker>
        </defs>

        {/* Draw nodes */}
        {Array.isArray(data.nodes) && data.nodes.map((node) => (
          <g key={node.id}>
            <path
              d={getNodeShape(node)}
              fill={getNodeColor(node.type)}
              stroke="white"
              strokeWidth="2"
            />
            <text
              x={node.position.x + padding + nodeWidth / 2}
              y={node.position.y + padding + nodeHeight / 2}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-xs font-semibold text-white"
              style={{ pointerEvents: 'none' }}
            >
              {node.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

export default function FlowchartPage({
  params,
}: {
  params: Promise<{ documentId: string }>;
}) {
  const router = useRouter();
  const [flowchart, setFlowchart] = useState<FlowchartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [documentId, setDocumentId] = useState<string>('');
  const [summary, setSummary] = useState<string>('');
  const [visualAids, setVisualAids] = useState<any[]>([]);
  const [vizData, setVizData] = useState<any>(null);

  useEffect(() => {
    const fetchFlowchart = async () => {
      try {
        setLoading(true);
        const resolvedParams = await params;
        const docId = resolvedParams.documentId;
        setDocumentId(docId);
        
        // Get document data from localStorage
        const key = `document-${docId}`;
        const storedData = localStorage.getItem(key);
        
        if (!storedData) {
          throw new Error('Document data not found in localStorage');
        }
        
        const documentData = JSON.parse(storedData);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 120000); // 120 second timeout for AI processing

        // Send document data to API for flowchart generation (also requests AI summary)
        const response = await fetch(`/api/flowchart?documentId=${docId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fileData: documentData.fileData || null,
            extractedText: documentData.extractedText || '',
            fileName: documentData.fileName || 'Unknown Document',
            generateSummary: true, // Request AI-generated summary
          }),
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        console.log('[v0] Flowchart data received:', data);
        
        if (!data.nodes || !Array.isArray(data.nodes)) {
          throw new Error('Invalid flowchart data structure');
        }

        setFlowchart(data);
        
        // Set AI-generated summary if available
        if (data.aiSummary) {
          setSummary(data.aiSummary);
          
          // Store vizData from API
          if (data.vizData) {
            console.log('[Flowchart] Received visualization metadata:', data.vizData);
            setVizData(data.vizData);
          }
          
          // Parse visual aids from the summary (fallback)
          try {
            const parsedVisualAids = parseVisualAidsFromText(data.aiSummary);
            console.log('[Flowchart] Parsed visual aids:', parsedVisualAids);
            setVisualAids(parsedVisualAids);
          } catch (parseError) {
            console.error('[Flowchart] Error parsing visual aids:', parseError);
          }
        } else {
          setSummary(documentData.summary || 'No summary available');
        }
      } catch (err) {
        console.error('[v0] Error fetching flowchart:', err);
        setFlowchart({
          nodes: [
            { id: '1', label: 'Upload PDF', type: 'start', position: { x: 0, y: 0 } },
            { id: '2', label: 'Extract Text', type: 'process', position: { x: 0, y: 120 } },
            { id: '3', label: 'Valid Text?', type: 'decision', position: { x: 0, y: 240 } },
            { id: '4', label: 'Analyze with AI', type: 'process', position: { x: 0, y: 360 } },
            { id: '5', label: 'Save Results', type: 'process', position: { x: 0, y: 480 } },
            { id: '6', label: 'Complete', type: 'end', position: { x: 0, y: 600 } },
          ],
          description: 'This flowchart shows the contract analysis process. Unable to fetch AI-generated flowchart, showing default flow instead.',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchFlowchart();
  }, [params]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="text-center max-w-md">
          <div className="mb-8">
            <div className="inline-block animate-bounce">
              <div className="text-8xl mb-4">🩺</div>
            </div>
          </div>
          <div className="flex justify-center mb-6">
            <Spinner className="w-8 h-8 text-indigo-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            Analyzing Your Medical Report
          </h2>
          <p className="mt-3 text-gray-600 dark:text-gray-400">
            Our AI is carefully reading your report and preparing detailed visualizations...
          </p>
          <div className="mt-6 flex justify-center gap-2">
            <div className="w-3 h-3 bg-indigo-500 rounded-full animate-pulse"></div>
            <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse delay-75"></div>
            <div className="w-3 h-3 bg-pink-500 rounded-full animate-pulse delay-150"></div>
          </div>
        </div>
      </main>
    );
  }

  if (!flowchart) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600">Error</h2>
          <p className="mt-2 text-muted-foreground">Flowchart not found</p>
          <Button onClick={() => router.back()} className="mt-4" variant="outline">
            Go Back
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 px-4 py-8">
      <div className="mx-auto max-w-6xl">
        {/* Navigation */}
        <div className="mb-6 flex gap-2">
          <Link href={`/results/${documentId}`}>
            <Button variant="ghost">
              ← Back to Results
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline">
              Home
            </Button>
          </Link>
        </div>

        {/* Hero Section with Gradient */}
        <div className="mb-8 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-8 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-10"></div>
          <div className="relative z-10">
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <span className="text-5xl">🩺</span>
              Your Medical Report Analysis
            </h1>
            <p className="text-indigo-100 text-lg">
              Interactive visualization of your health data
            </p>
          </div>
        </div>

        {/* Quick Summary Cards */}
        {(vizData?.tests?.length > 0 || visualAids.length > 0) && (
          <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 rounded-xl p-5 border-2 border-green-200 dark:border-green-800">
              <div className="text-3xl mb-2">📊</div>
              <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                {vizData?.tests?.length || visualAids.length}
              </div>
              <div className="text-sm text-green-600 dark:text-green-400 font-medium">Tests Analyzed</div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 rounded-xl p-5 border-2 border-blue-200 dark:border-blue-800">
              <div className="text-3xl mb-2">✓</div>
              <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                {vizData?.tests 
                  ? vizData.tests.filter((t: any) => t.severity === 'normal').length
                  : visualAids.filter(v => v.patientValue >= v.normalMin && v.patientValue <= v.normalMax).length
                }
              </div>
              <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">Normal Results</div>
            </div>
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950 rounded-xl p-5 border-2 border-amber-200 dark:border-amber-800">
              <div className="text-3xl mb-2">⚠</div>
              <div className="text-2xl font-bold text-amber-700 dark:text-amber-300">
                {vizData?.tests 
                  ? vizData.tests.filter((t: any) => t.severity !== 'normal').length
                  : visualAids.filter(v => v.patientValue < v.normalMin || v.patientValue > v.normalMax).length
                }
              </div>
              <div className="text-sm text-amber-600 dark:text-amber-400 font-medium">Needs Attention</div>
            </div>
          </div>
        )}

        {/* Interactive Charts Section */}
        {vizData && vizData.tests && vizData.tests.length > 0 ? (
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-100 flex items-center gap-3">
              <span className="text-4xl">📈</span>
              Your Test Results Visualized
            </h2>
            
            {/* Affected Organs Summary */}
            {vizData.affectedOrgans && vizData.affectedOrgans.length > 0 && (
              <div className="mb-6 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950 rounded-xl border border-indigo-200 dark:border-indigo-800">
                <h3 className="font-bold text-lg mb-3 text-indigo-900 dark:text-indigo-100">
                  🫁 Affected Systems/Organs
                </h3>
                <div className="flex flex-wrap gap-2">
                  {Array.isArray(vizData.affectedOrgans) && vizData.affectedOrgans.map((organ: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-4 py-2 bg-white dark:bg-slate-800 rounded-full text-sm font-medium border border-indigo-200 dark:border-indigo-700"
                    >
                      {organ.charAt(0).toUpperCase() + organ.slice(1)}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Advanced Visualizations - 2x2 Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {Array.isArray(vizData.tests) && vizData.tests.map((test: any, index: number) => (
                <AdvancedMedicalVisualizer 
                  key={index} 
                  test={test} 
                  reportType={vizData.reportType}
                />
              ))}
            </div>
          </div>
        ) : visualAids.length > 0 ? (
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-100 flex items-center gap-3">
              <span className="text-4xl">📈</span>
              Your Test Results Visualized
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {visualAids.map((aid, index) => (
                <MedicalChartVisualizer key={index} data={aid} />
              ))}
            </div>
          </div>
        ) : null}

        {/* Text Analysis Section - Collapsible */}
        <Card className="mb-8 border-2 border-gray-200 dark:border-gray-700 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
            <CardTitle className="text-2xl flex items-center gap-3">
              <span className="text-3xl">📋</span>
              Detailed Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="prose prose-slate max-w-none">
              <div className="text-foreground leading-relaxed space-y-4">
                {(() => {
                  const lines = summary.split('\n');
                  const elements: React.ReactNode[] = [];
                  let visualAidIndex = 0;
                  let inVisualAidSection = false;

                  for (let idx = 0; idx < lines.length; idx++) {
                    const line = lines[idx];

                    // Check for Visual Aid section start
                    if (line.match(/^### 📊/)) {
                      inVisualAidSection = true;
                      
                      // Inject the actual chart instead of instructions
                      if (visualAidIndex < visualAids.length) {
                        elements.push(
                          <MedicalChartVisualizer 
                            key={`chart-${visualAidIndex}`}
                            data={visualAids[visualAidIndex]}
                          />
                        );
                        visualAidIndex++;
                      }
                      
                      // Skip all lines until next ### or ## section
                      continue;
                    }

                    // Check if we're exiting visual aid section
                    if (inVisualAidSection && (line.match(/^###/) || line.match(/^##/))) {
                      inVisualAidSection = false;
                    }

                    // Skip lines within visual aid instruction section
                    if (inVisualAidSection) {
                      continue;
                    }

                    // Main title (# heading)
                    if (line.match(/^# /)) {
                      elements.push(
                        <div key={idx} className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950 rounded-lg p-4 my-6 border-l-4 border-indigo-500">
                          <h1 className="font-bold text-3xl text-indigo-700 dark:text-indigo-300">
                            {line.replace(/^# /, '')}
                          </h1>
                        </div>
                      );
                      continue;
                    }

                    // Section headings (##)
                    if (line.match(/^## /)) {
                      const headingText = line.replace(/^## /, '');
                      elements.push(
                        <h2 key={idx} className="font-bold text-2xl mt-8 mb-4 text-gray-800 dark:text-gray-100 border-b-2 border-indigo-200 dark:border-indigo-800 pb-3 flex items-center gap-2">
                          <span className="text-indigo-500">▸</span>
                          {parseInlineMarkdown(headingText)}
                        </h2>
                      );
                      continue;
                    }

                    // Subsection headings (### with emoji)
                    if (line.match(/^### 🔹/)) {
                      const subheadingText = line.replace(/^### /, '');
                      elements.push(
                        <div key={idx} className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4 my-4 border-l-4 border-blue-500">
                          <h3 className="font-bold text-xl text-blue-700 dark:text-blue-300">
                            {parseInlineMarkdown(subheadingText)}
                          </h3>
                        </div>
                      );
                      continue;
                    }

                    // Bold text (**text**)
                    if (line.match(/^\*\*.*\*\*$/)) {
                      elements.push(
                        <div key={idx} className="font-bold text-lg mt-4 mb-2 text-gray-800 dark:text-gray-200">
                          {line.replace(/\*\*/g, '')}
                        </div>
                      );
                      continue;
                    }

                    // Bullet points
                    if (line.match(/^[•\-]/)) {
                      const bulletText = line.replace(/^[•\-]\s*/, '');
                      elements.push(
                        <div key={idx} className="ml-6 my-2 flex items-start gap-2">
                          <span className="text-indigo-500 mt-1">●</span>
                          <span className="flex-1">{parseInlineMarkdown(bulletText)}</span>
                        </div>
                      );
                      continue;
                    }

                    // Indented content
                    if (line.match(/^\s{2,}/)) {
                      elements.push(
                        <div key={idx} className="ml-8 my-1 text-sm text-gray-600 dark:text-gray-400 italic">
                          {parseInlineMarkdown(line)}
                        </div>
                      );
                      continue;
                    }

                    // Regular paragraphs
                    if (line.trim()) {
                      elements.push(
                        <p key={idx} className="my-3 text-gray-700 dark:text-gray-300 leading-relaxed">
                          {parseInlineMarkdown(line)}
                        </p>
                      );
                      continue;
                    }

                    // Empty lines
                    elements.push(<div key={idx} className="h-3" />);
                  }

                  return elements;
                })()}
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </main>
  );
}
