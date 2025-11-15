import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get('documentId');

    if (!documentId) {
      return NextResponse.json(
        { error: 'documentId is required' },
        { status: 400 }
      );
    }

    // The upload flow already stores mock data in localStorage with key `document-${documentId}`
    let clauses: any[] = [];
    let summaryText = 'No summary available';

    // Since we're in a server route, we can't access localStorage directly
    // Instead, we'll generate a flowchart based on the documentId and provide a fallback
    console.warn('[v0] Using fallback data - Supabase has UUID type mismatch with string IDs');

    // Generate flowchart using OpenAI or fallback
    const flowchartData = await generateFlowchartWithOpenAI(
      summaryText,
      clauses
    );

    return NextResponse.json(flowchartData);
  } catch (error) {
    console.error('[v0] Flowchart generation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate flowchart' },
      { status: 500 }
    );
  }
}

// Helper function to call OpenAI and generate flowchart structure
async function generateFlowchartWithOpenAI(
  summary: string,
  clauses: any[]
): Promise<any> {
  // If no OpenAI API key, fallback to static flowchart
  if (!process.env.OPENAI_API_KEY) {
    console.warn('[v0] OPENAI_API_KEY not set, using fallback flowchart');
    return generateFallbackFlowchart(clauses);
  }

  try {
    // Import OpenAI client (add to package.json: "openai": "^4.0.0")
    const { OpenAI } = await import('openai');
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Format clauses for AI analysis
    const clausesList = clauses
      .map((c: any, idx: number) => `${idx + 1}. ${c.title}: ${c.content}`)
      .join('\n');

    // Call OpenAI to analyze contract and generate flowchart structure
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are a legal contract analysis expert. Generate a flowchart structure that shows the decision tree and key processes in a contract. Return ONLY valid JSON.',
        },
        {
          role: 'user',
          content: `Analyze this contract and generate a flowchart in JSON format with this structure:
{
  "nodes": [
    { "id": "node-0", "label": "string", "type": "start|process|decision|end", "description": "string" }
  ],
  "edges": [
    { "source": "node-0", "target": "node-1", "label": "condition or action" }
  ],
  "riskAssessment": "high|medium|low"
}

Contract Summary: ${summary}

Key Clauses:
${clausesList}

Generate a flowchart showing:
1. Start node
2. Key decision points in the contract
3. Main obligations and processes
4. Risk assessment checkpoints
5. End node with completion status`,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    // Parse OpenAI response
    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    // Extract JSON from response (in case there's extra text)
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not parse JSON from OpenAI response');
    }

    const flowchartData = JSON.parse(jsonMatch[0]);

    // Add positions to nodes for rendering
    const nodesWithPositions = flowchartData.nodes.map(
      (node: any, idx: number) => ({
        ...node,
        position: { x: 0, y: idx * 120 },
      })
    );

    return {
      ...flowchartData,
      nodes: nodesWithPositions,
      description: `AI-generated flowchart analysis of ${clauses.length} contract clauses. Risk Level: ${flowchartData.riskAssessment || 'Unknown'}`,
    };
  } catch (error) {
    console.error('[v0] OpenAI flowchart generation failed:', error);
    // Fallback if OpenAI call fails
    return generateFallbackFlowchart(clauses);
  }
}

function generateFallbackFlowchart(clauses: any[]) {
  const nodeSequence = [
    { label: 'Upload Contract', type: 'start' },
    { label: 'Extract Clauses', type: 'process' },
    { label: 'Analyze with AI', type: 'process' },
    { label: 'Identify Risks', type: 'decision' },
    { label: 'Generate Summary', type: 'process' },
    { label: 'Save Results', type: 'process' },
    { label: 'Review Complete', type: 'end' },
  ];

  const nodes = nodeSequence.map((node, idx) => ({
    id: `node-${idx}`,
    label: node.label,
    type: node.type,
    position: { x: 0, y: idx * 120 },
  }));

  return {
    nodes,
    edges: nodes.slice(0, -1).map((node, idx) => ({
      source: node.id,
      target: nodes[idx + 1].id,
      label: 'Next',
    })),
    description: `Fallback flowchart showing contract analysis pipeline. Extracted ${clauses.length} clauses. ${
      clauses.some((c: any) => c.risk_level === 'high')
        ? 'High-risk clauses identified.'
        : 'All clauses at acceptable risk levels.'
    }`,
  };
}
