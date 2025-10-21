import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePolicyGenerator } from '../hooks/usePolicyGenerator';

vi.stubGlobal('fetch', vi.fn());

describe('usePolicyGenerator Hook', () => {
  beforeEach(() => {
    vi.mocked(fetch).mockClear();
  });

  afterEach(() => {
    vi.mocked(fetch).mockReset();
  });

  it('initializes with correct default state', () => {
    const { result } = renderHook(() => usePolicyGenerator());

    expect(result.current.policy).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('sets error when description is empty', async () => {
    const { result } = renderHook(() => usePolicyGenerator());

    await act(async () => {
      await result.current.generate('');
    });

    expect(result.current.error).toBe('Please provide a description');
    expect(result.current.policy).toBeNull();
  });

  it('calls API endpoint with correct payload', async () => {
    const { result } = renderHook(() => usePolicyGenerator());

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        policy: { Version: '2012-10-17', Statement: [] },
        explanation: 'Test policy',
      }),
    });

    await act(async () => {
      await result.current.generate('Test description');
    });

    expect(vi.mocked(fetch)).toHaveBeenCalledWith(
      expect.stringContaining('/generate-policy'),
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: 'Test description' }),
      })
    );
  });

  it('sets policy on successful API response', async () => {
    const { result } = renderHook(() => usePolicyGenerator());
    const mockPolicy = { Version: '2012-10-17', Statement: [] };

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        policy: mockPolicy,
        explanation: 'Test policy',
      }),
    });

    await act(async () => {
      await result.current.generate('Test description');
    });

    expect(result.current.policy).toEqual(mockPolicy);
    expect(result.current.error).toBeNull();
  });

  it('sets error on API failure', async () => {
    const { result } = renderHook(() => usePolicyGenerator());

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      statusText: 'Internal Server Error',
    });

    await act(async () => {
      await result.current.generate('Test description');
    });

    expect(result.current.error).toBeTruthy();
    expect(result.current.policy).toBeNull();
  });

  it('sets loading state during API call', async () => {
    const { result } = renderHook(() => usePolicyGenerator());

    (global.fetch as any).mockImplementationOnce(() => new Promise(() => {}));

    const generatePromise = act(async () => {
      const promise = result.current.generate('Test description');
      await waitFor(() => expect(result.current.loading).toBe(true));
      return promise;
    });

    await expect(generatePromise).rejects.toThrow();
  });

  it('handles network errors gracefully', async () => {
    const { result } = renderHook(() => usePolicyGenerator());

    vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));

    await act(async () => {
      await result.current.generate('Test description');
    });

    expect(result.current.error).toBeTruthy();
    expect(result.current.policy).toBeNull();
  });
});
