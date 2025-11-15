'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';

interface Clause {
  clauseId: string;
  type: string;
  riskLevel: 'low' | 'medium' | 'high';
}

type RiskLevel = 'low' | 'medium' | 'high';

const getRiskLevelStyles = (riskLevel: RiskLevel) => {
  switch (riskLevel) {
    case 'low':
      return 'bg-green-100 text-green-800';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'high':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default function ResultsPage({
  params,
}: {
  params: { documentId: string };
}) {
  const router = useRouter();
  const [summary, setSummary] = useState<string>('');
  const [clauses, setClauses] = useState<Clause[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      setLoading(true);
      const storedData = localStorage.getItem(`document-${params.documentId}`);
      
      if (!storedData) {
        throw new Error('Document not found');
      }

      const data = JSON.parse(storedData);
      setSummary(data.summary || '');
      setClauses(data.clauses || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [params.documentId]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <Spinner className="h-8 w-8" />
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600">Error</h2>
          <p className="mt-2 text-muted-foreground">{error}</p>
          <Button onClick={() => router.push('/')} className="mt-4">
            Back to Upload
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Contract Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground">{summary}</p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {clauses.map((clause) => (
            <Card key={clause.clauseId} className="flex flex-col">
              <CardHeader>
                <CardTitle className="text-lg">{clause.type}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col justify-between">
                <div className="mb-4">
                  <span
                    className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${getRiskLevelStyles(clause.riskLevel)}`}
                  >
                    {clause.riskLevel.charAt(0).toUpperCase() +
                      clause.riskLevel.slice(1)}{' '}
                    Risk
                  </span>
                </div>

                <Link href={`/clause/${clause.clauseId}`}>
                  <Button variant="outline" className="w-full">
                    View Details
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <Link href={`/flowchart/${params.documentId}`}>
            <Button size="lg" variant="secondary">
              📊 View Process Flowchart
            </Button>
          </Link>
        </div>

        {clauses.length === 0 && (
          <div className="text-center text-muted-foreground">
            <p>No clauses found for this document.</p>
          </div>
        )}
      </div>
    </main>
  );
}
