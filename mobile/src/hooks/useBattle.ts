import { useState, useEffect, useCallback } from 'react';
import { fetchBattle, voteOnResponse } from '../lib/skills';

export function useBattle(skillId: number) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [voting, setVoting] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetchBattle(skillId);
      setData(res);
      setError(null);
    } catch (e: any) {
      setError(e.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  }, [skillId]);

  useEffect(() => {
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, [load]);

  const vote = useCallback(async (responseId: number) => {
    setVoting(true);
    try {
      await voteOnResponse(skillId, responseId);
      await load();
    } catch (e: any) {
      setError(e.response?.data?.error || e.message);
    } finally {
      setVoting(false);
    }
  }, [skillId, load]);

  return { data, loading, error, voting, vote, reload: load };
}
