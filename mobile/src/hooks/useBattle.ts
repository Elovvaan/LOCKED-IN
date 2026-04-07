import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchBattle, voteOnResponse } from '../lib/skills';

export function useBattle(skillId: number) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pollError, setPollError] = useState<string | null>(null);
  const [voting, setVoting] = useState(false);
  const initialLoaded = useRef(false);

  const load = useCallback(async (isPoll = false) => {
    try {
      if (!isPoll) setLoading(true);
      const res = await fetchBattle(skillId);
      setData(res);
      setError(null);
      setPollError(null);
      initialLoaded.current = true;
    } catch (e: any) {
      const msg = e.response?.data?.error || e.message;
      if (!initialLoaded.current) {
        setError(msg);
      } else {
        setPollError(msg);
      }
    } finally {
      if (!isPoll) setLoading(false);
    }
  }, [skillId]);

  const reload = useCallback(() => load(false), [load]);

  useEffect(() => {
    load(false);
    const interval = setInterval(() => load(true), 2500);
    return () => clearInterval(interval);
  }, [load]);

  const vote = useCallback(async (responseId: number) => {
    setVoting(true);
    try {
      await voteOnResponse(skillId, responseId);
      await load(false);
    } catch (e: any) {
      throw e;
    } finally {
      setVoting(false);
    }
  }, [skillId, load]);

  return { data, loading, error, pollError, voting, vote, reload };
}
