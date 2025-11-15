'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import React from 'react';

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
  const maxX = Math.max(...data.nodes.map(n => n.position.x));
  const maxY = Math.max(...data.nodes.map(n => n.position.y));
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
        {data.nodes.map((node, idx) => {
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
        {data.nodes.map((node) => (
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
  params: { documentId: string };
}) {
  const router = useRouter();
  const [flowchart, setFlowchart] = useState<FlowchartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFlowchart = async () => {
      try {
        setLoading(true);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        const response = await fetch(`/api/flowchart?documentId=${params.documentId}`, {
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
  }, [params.documentId]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <Spinner className="h-8 w-8" />
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
    <main className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-6xl">
        {/* Navigation */}
        <div className="mb-6 flex gap-2">
          <Link href={`/results/${params.documentId}`}>
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

        {/* Header */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-3xl">Contract Processing Flowchart</CardTitle>
          </CardHeader>
        </Card>

        {/* Flowchart Visualization */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Process Flow</CardTitle>
          </CardHeader>
          <CardContent>
            <FlowchartRenderer data={flowchart} />
          </CardContent>
        </Card>

        {/* Description */}
        <Card>
          <CardHeader>
            <CardTitle>Flow Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="leading-relaxed text-foreground">{flowchart.description}</p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
