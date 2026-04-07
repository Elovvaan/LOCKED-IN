import { useState, useCallback } from 'react';
import { createSkill } from '../lib/skills';

export function useCreateSkill() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(async (data: { videoUrl: string; title: string; caption?: string; endsAt?: string }) => {
    setLoading(true);
    setError(null);
    try {
      const result = await createSkill(data);
      return result;
    } catch (e: any) {
      const msg = e.response?.data?.error || e.message;
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { submit, loading, error };
}
