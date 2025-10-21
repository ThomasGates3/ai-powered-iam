import { useState } from 'react';

export interface IAMPolicy {
  Version: string;
  Statement: Statement[];
}

export interface Statement {
  Sid: string;
  Effect: 'Allow' | 'Deny';
  Action: string | string[];
  Resource: string | string[];
  Condition?: Record<string, Record<string, string | string[]>>;
}

export interface GenerationResult {
  policy: IAMPolicy;
  explanation: string;
  warnings?: string[];
}

interface UsePolicyGeneratorReturn {
  policy: IAMPolicy | null;
  loading: boolean;
  error: string | null;
  generate: (description: string) => Promise<void>;
}

const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT || 'http://localhost:3000/api';

export const usePolicyGenerator = (): UsePolicyGeneratorReturn => {
  const [policy, setPolicy] = useState<IAMPolicy | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async (description: string) => {
    if (!description.trim()) {
      setError('Please provide a description');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_ENDPOINT}/generate-policy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ description }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const data: GenerationResult = await response.json();
      setPolicy(data.policy);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(message);
      setPolicy(null);
    } finally {
      setLoading(false);
    }
  };

  return { policy, loading, error, generate };
};
