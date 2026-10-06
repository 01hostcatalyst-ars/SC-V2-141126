'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Database,
  Download,
  Trash2,
  Layers,
  Clock,
  Sparkles,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Search,
} from 'lucide-react';

interface QueuedCreator {
  id: string;
  handle: string;
  platform: 'instagram' | 'youtube' | 'tiktok';
  status: 'idle' | 'processing' | 'success' | 'cached' | 'failed';
  error?: string;
  latencyMs?: number;
  displayName?: string;
  avatarUrl?: string;
  followerCount?: number;
  primaryNiche?: string;
  rateCardTypical?: string;
  aiDossierSummary?: string;
  secondaryPlatformsDiscovered?: string[];
  cacheAgeHours?: number;
}

const STORAGE_KEY = 'signcollab_batch_ingest_state_v1';

export default function BatchIngestAdminPage() {
  const [inputText, setInputText] = useState<string>(
    '@irfanjunejo, Instagram\n@mkbhd, Youtube\n@charlidamelio, Tiktok'
  );
  const [regionCode, setRegionCode] = useState<string>('US');
  const [forceRefresh, setForceRefresh] = useState<boolean>(false);
  const [concurrency, setConcurrency] = useState<number>(2);
  const [delayMs, setDelayMs] = useState<number>(1500);

  const [queue, setQueue] = useState<QueuedCreator[]>([]);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'success' | 'cached' | 'failed'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const isRunningRef = useRef<boolean>(false);
  isRunningRef.current = isRunning;

  const queueRef = useRef<QueuedCreator[]>(queue);
  queueRef.current = queue;

  // Restore state from localStorage on initial load
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setQueue(parsed);
        }
      }
    } catch {
      // Ignore parse errors
    }
  }, []);

  // Save state to localStorage whenever queue changes
  useEffect(() => {
    if (queue.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
      } catch {
        // Handle storage quota issues gracefully
      }
    }
  }, [queue]);

  // Parse raw text into structured queue
  const handleParseInput = () => {
    const lines = inputText
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);

    const parsed: QueuedCreator[] = [];
    const seen = new Set<string>();

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // Support comma, tab, or space separation
      const parts = line.split(/[,\t]+/).map((p) => p.trim());
      const rawHandle = parts[0] || '';
      const rawPlat = (parts[1] || 'instagram').toLowerCase();

      let platform: 'instagram' | 'youtube' | 'tiktok' = 'instagram';
      if (rawPlat.includes('yt') || rawPlat.includes('youtube')) platform = 'youtube';
      else if (rawPlat.includes('tt') || rawPlat.includes('tiktok')) platform = 'tiktok';

      let cleanHandle = rawHandle.trim();
      if (cleanHandle.startsWith('http://') || cleanHandle.startsWith('https://') || cleanHandle.includes('.com/')) {
        try {
          const urlStr = cleanHandle.startsWith('http') ? cleanHandle : `https://${cleanHandle}`;
          const parsedUrl = new URL(urlStr);
          const segments = parsedUrl.pathname.split('/').filter(Boolean);
          if (segments.length > 0) {
            if (segments[0] === 'channel' || segments[0] === 'c' || segments[0] === 'user') {
              cleanHandle = segments[1] || segments[0];
            } else {
              cleanHandle = segments[0];
            }
          }
        } catch {
          // Fallback
        }
      }
      cleanHandle = cleanHandle
        .replace(/^https?:\/\/(?:www\.)?(?:instagram\.com|youtube\.com|tiktok\.com)\/?(?:@|channel\/|c\/|user\/)?/i, '')
        .split('/')[0]
        .split('?')[0]
        .split('#')[0]
        .replace(/^@+/, '')
        .replace(/\/+$/, '')
        .trim()
        .toLowerCase();

      if (!cleanHandle) continue;

      const dedupeKey = `${platform}:${cleanHandle}`;
      if (seen.has(dedupeKey)) continue;
      seen.add(dedupeKey);

      parsed.push({
        id: `creator-${Date.now()}-${i}`,
        handle: cleanHandle,
        platform,
        status: 'idle',
      });
    }

    setQueue(parsed);
  };

  // CSV File Upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setInputText(text);
      }
    };
    reader.readAsText(file);
  };

  // Execution worker loop
  const processNextCreator = async (creator: QueuedCreator) => {
    setQueue((prev) =>
      prev.map((item) => (item.id === creator.id ? { ...item, status: 'processing' } : item))
    );
    queueRef.current = queueRef.current.map((item) =>
      item.id === creator.id ? { ...item, status: 'processing' } : item
    );

    try {
      const res = await fetch('/api/admin/batch-ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          handle: creator.handle,
          platform: creator.platform,
          regionCode,
          forceRefresh,
        }),
      });

      const data = await res.json();

      setQueue((prev) =>
        prev.map((item) => {
          if (item.id !== creator.id) return item;

          if (!data.success) {
            return {
              ...item,
              status: 'failed',
              error: data.error || 'Scrape execution failed.',
              latencyMs: data.latencyMs,
            };
          }

          return {
            ...item,
            status: data.status === 'cached' ? 'cached' : 'success',
            latencyMs: data.latencyMs,
            displayName: data.creator?.displayName || item.handle,
            avatarUrl: data.creator?.avatarUrl || '',
            followerCount: data.creator?.followerCount || 0,
            primaryNiche: data.primaryNiche || 'General',
            rateCardTypical: data.rateCardTypical || 'Standard',
            aiDossierSummary: data.aiDossierSummary || '',
            secondaryPlatformsDiscovered: data.creator?.secondaryPlatformsDiscovered || [],
            cacheAgeHours: data.creator?.cacheAgeHours,
          };
        })
      );
      queueRef.current = queueRef.current.map((item) => {
        if (item.id !== creator.id) return item;
        if (!data.success) {
          return {
            ...item,
            status: 'failed',
            error: data.error || 'Scrape execution failed.',
            latencyMs: data.latencyMs,
          };
        }
        return {
          ...item,
          status: data.status === 'cached' ? 'cached' : 'success',
          latencyMs: data.latencyMs,
          displayName: data.creator?.displayName || item.handle,
          avatarUrl: data.creator?.avatarUrl || '',
          followerCount: data.creator?.followerCount || 0,
          primaryNiche: data.primaryNiche || 'General',
          rateCardTypical: data.rateCardTypical || 'Standard',
          aiDossierSummary: data.aiDossierSummary || '',
          secondaryPlatformsDiscovered: data.creator?.secondaryPlatformsDiscovered || [],
          cacheAgeHours: data.creator?.cacheAgeHours,
        };
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network error during ingestion.';
      setQueue((prev) =>
        prev.map((item) =>
          item.id === creator.id ? { ...item, status: 'failed', error: msg } : item
        )
      );
      queueRef.current = queueRef.current.map((item) =>
        item.id === creator.id ? { ...item, status: 'failed', error: msg } : item
      );
    }
  };

  // Main runner controller
  useEffect(() => {
    if (!isRunning) return;

    let isSubscribed = true;

    const runBatch = async () => {
      while (isRunningRef.current && isSubscribed) {
        // Find next idle item from queueRef to avoid infinite re-render cycles
        const nextItem = queueRef.current.find((q) => q.status === 'idle');
        if (!nextItem) {
          setIsRunning(false);
          break;
        }

        await processNextCreator(nextItem);

        if (delayMs > 0 && isRunningRef.current) {
          await new Promise((r) => setTimeout(r, delayMs));
        }
      }
    };

    runBatch();

    return () => {
      isSubscribed = false;
    };
  }, [isRunning, delayMs]);

  // Retry a single failed creator
  const retrySingle = (creatorId: string) => {
    setQueue((prev) =>
      prev.map((item) => (item.id === creatorId ? { ...item, status: 'idle', error: undefined } : item))
    );
  };

  // Retry all failed creators
  const retryAllFailed = () => {
    setQueue((prev) =>
      prev.map((item) => (item.status === 'failed' ? { ...item, status: 'idle', error: undefined } : item))
    );
    setIsRunning(true);
  };

  // Clear queue
  const clearQueue = () => {
    if (isRunning) setIsRunning(false);
    setQueue([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  };

  // Export audit report to JSON
  const exportReportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(queue, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `signcollab_batch_ingest_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Metrics computation
  const metrics = useMemo(() => {
    const total = queue.length;
    const completed = queue.filter((q) => q.status === 'success').length;
    const cached = queue.filter((q) => q.status === 'cached').length;
    const failed = queue.filter((q) => q.status === 'failed').length;
    const processed = completed + cached + failed;
    const progressPercent = total > 0 ? Math.round((processed / total) * 100) : 0;

    return { total, completed, cached, failed, processed, progressPercent };
  }, [queue]);

  const filteredQueue = useMemo(() => {
    return queue.filter((item) => {
      if (activeFilter === 'success' && item.status !== 'success') return false;
      if (activeFilter === 'cached' && item.status !== 'cached') return false;
      if (activeFilter === 'failed' && item.status !== 'failed') return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.handle.toLowerCase().includes(q) ||
          (item.displayName && item.displayName.toLowerCase().includes(q)) ||
          item.platform.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [queue, activeFilter, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8 font-sans antialiased">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Top Header */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2.5 py-0.5 rounded-md">
                SignCollab Core
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-md flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                72h Snapshot Cache Active
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Creator Batch Ingestion Console
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Autonomous multi-platform pre-warming, bio unrolling, and 19-point dossier caching engine.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={exportReportJson}
              disabled={queue.length === 0}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 disabled:opacity-50 transition"
            >
              <Download className="w-3.5 h-3.5" />
              Export JSON
            </button>
            <button
              onClick={clearQueue}
              disabled={queue.length === 0}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 disabled:opacity-50 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear Console
            </button>
          </div>
        </div>

        {/* Input & Settings Deck */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left: Input Textarea & File Drop */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Layers className="w-4 h-4 text-rose-400" />
                Creator Seed Input (Handle, Platform)
              </label>

              <label className="cursor-pointer inline-flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 font-medium">
                <UploadCloud className="w-3.5 h-3.5" />
                Upload CSV/TSV
                <input
                  type="file"
                  accept=".csv,.tsv,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            <textarea
              rows={6}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste creator handles with platform (one per line):&#10;@irfanjunejo, Instagram&#10;@mkbhd, Youtube&#10;@charlidamelio, Tiktok"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-rose-500/60 focus:ring-1 focus:ring-rose-500/40"
            />

            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-[11px] text-slate-500">
                Formats accepted: Comma-separated, Tab-separated, or Handle + Platform.
              </span>
              <button
                onClick={handleParseInput}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold border border-slate-700 transition"
              >
                Parse &amp; Load Into Queue
              </button>
            </div>
          </div>

          {/* Right: Operational Configuration */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Execution Safeguards
              </h2>

              <div className="space-y-1">
                <label className="text-[11px] text-slate-400 font-medium">Target Region Valuation</label>
                <select
                  value={regionCode}
                  onChange={(e) => setRegionCode(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-slate-200 focus:outline-none"
                >
                  <option value="US">United States (USD)</option>
                  <option value="PK">Pakistan (PKR / USD)</option>
                  <option value="UK">United Kingdom (GBP)</option>
                  <option value="AE">UAE / GCC (AED)</option>
                  <option value="CA">Canada (CAD)</option>
                  <option value="AU">Australia (AUD)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-slate-400 font-medium">Worker Concurrency</label>
                <select
                  value={concurrency}
                  onChange={(e) => setConcurrency(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-slate-200 focus:outline-none"
                >
                  <option value={1}>1 Worker (Slowest, 100% Rate-Limit Safe)</option>
                  <option value={2}>2 Workers (Recommended Default)</option>
                  <option value={3}>3 Workers (Fast)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-slate-400 font-medium">Inter-Request Pacing Delay</label>
                <select
                  value={delayMs}
                  onChange={(e) => setDelayMs(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-slate-200 focus:outline-none"
                >
                  <option value={1000}>1.0 Second Delay</option>
                  <option value={1500}>1.5 Seconds Delay (Recommended)</option>
                  <option value={2500}>2.5 Seconds Delay</option>
                </select>
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={forceRefresh}
                  onChange={(e) => setForceRefresh(e.target.checked)}
                  className="rounded border-slate-700 text-rose-500 focus:ring-0 bg-slate-950"
                />
                <span className="text-[11px] text-slate-300 font-medium">
                  Force re-scrape (Bypass existing DB records)
                </span>
              </label>
            </div>

            <div className="pt-2">
              {!isRunning ? (
                <button
                  onClick={() => setIsRunning(true)}
                  disabled={queue.length === 0 || metrics.processed === metrics.total}
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-950/40 disabled:opacity-40 transition flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4 fill-white" />
                  {metrics.processed > 0 && metrics.processed < metrics.total
                    ? 'Resume Ingestion'
                    : 'Start Batch Ingestion'}
                </button>
              ) : (
                <button
                  onClick={() => setIsRunning(false)}
                  className="w-full py-2.5 px-4 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2"
                >
                  <Pause className="w-4 h-4 fill-amber-300" />
                  Pause Ingestion
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Progress & Live Telemetry HUD */}
        {queue.length > 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Ingestion Progress
                </span>
                <div className="text-xl sm:text-2xl font-black text-white mt-0.5">
                  {metrics.progressPercent}%{' '}
                  <span className="text-xs font-normal text-slate-400">
                    ({metrics.processed} of {metrics.total} creators processed)
                  </span>
                </div>
              </div>

              {/* KPI Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {metrics.completed} Fresh
                </span>
                <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5" />
                  {metrics.cached} Cached (72h)
                </span>
                {metrics.failed > 0 && (
                  <button
                    onClick={retryAllFailed}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30 transition flex items-center gap-1.5"
                  >
                    <AlertCircle className="w-3.5 h-3.5" />
                    {metrics.failed} Failed (Retry)
                  </button>
                )}
              </div>
            </div>

            {/* Visual Progress Bar */}
            <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
              <div
                className="bg-gradient-to-r from-rose-500 via-rose-400 to-emerald-400 h-full transition-all duration-300"
                style={{ width: `${metrics.progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Live Execution Table */}
        {queue.length > 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            {/* Filter Bar */}
            <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-1.5">
                {(['all', 'success', 'cached', 'failed'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${
                      activeFilter === filter
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {filter === 'all'
                      ? `All (${metrics.total})`
                      : filter === 'cached'
                      ? `Existing in DB (${metrics.cached})`
                      : filter}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Filter by handle..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none"
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/60 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Creator</th>
                    <th className="py-3 px-3">Seed</th>
                    <th className="py-3 px-3">Discovered Channels</th>
                    <th className="py-3 px-3">Niche</th>
                    <th className="py-3 px-3">Typical Rate Card</th>
                    <th className="py-3 px-3">Latency</th>
                    <th className="py-3 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredQueue.map((item) => (
                    <tr
                      key={item.id}
                      className={`hover:bg-slate-800/30 transition ${
                        item.status === 'processing' ? 'bg-rose-500/5' : ''
                      }`}
                    >
                      {/* Creator Avatar & Handle */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          {item.avatarUrl ? (
                            <img
                              src={item.avatarUrl}
                              alt={item.handle}
                              className="w-7 h-7 rounded-full object-cover border border-slate-700 bg-slate-800"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-[10px] text-slate-400">
                              {item.handle.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <div className="font-semibold text-slate-200">
                              @{item.handle}
                            </div>
                            <div className="text-[10px] text-slate-400 truncate max-w-[160px]">
                              {item.displayName || ''}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Seed Platform */}
                      <td className="py-3 px-3">
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                            item.platform === 'youtube'
                              ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                              : item.platform === 'tiktok'
                              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          }`}
                        >
                          {item.platform}
                        </span>
                      </td>

                      {/* Discovered Channels */}
                      <td className="py-3 px-3">
                        {item.secondaryPlatformsDiscovered &&
                        item.secondaryPlatformsDiscovered.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {item.secondaryPlatformsDiscovered.map((sec, idx) => (
                              <span
                                key={idx}
                                className="text-[9px] font-medium bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700"
                              >
                                {sec}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-600">None</span>
                        )}
                      </td>

                      {/* Niche */}
                      <td className="py-3 px-3 text-slate-300 text-[11px]">
                        {item.primaryNiche || '-'}
                      </td>

                      {/* Rate Card */}
                      <td className="py-3 px-3 text-slate-200 font-semibold text-[11px]">
                        {item.rateCardTypical || '-'}
                      </td>

                      {/* Latency */}
                      <td className="py-3 px-3 text-slate-400 text-[10px]">
                        {item.latencyMs ? `${(item.latencyMs / 1000).toFixed(1)}s` : '-'}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 text-right">
                        {item.status === 'idle' && (
                          <span className="text-[10px] text-slate-500 uppercase font-semibold">
                            Queued
                          </span>
                        )}
                        {item.status === 'processing' && (
                          <span className="text-[10px] text-rose-400 uppercase font-bold animate-pulse flex items-center justify-end gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
                            Scraping &amp; AI
                          </span>
                        )}
                        {item.status === 'success' && (
                          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            Saved to DB
                          </span>
                        )}
                        {item.status === 'cached' && (
                          <span className="text-[10px] font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                            Existing in DB
                          </span>
                        )}
                        {item.status === 'failed' && (
                          <div className="flex items-center justify-end gap-2">
                            <span
                              title={item.error}
                              className="text-[10px] font-bold text-rose-400 bg-rose-500/20 px-2 py-0.5 rounded border border-rose-500/30 truncate max-w-[120px]"
                            >
                              Failed
                            </span>
                            <button
                              onClick={() => retrySingle(item.id)}
                              className="p-1 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded"
                              title="Retry single creator"
                            >
                              <RotateCcw className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
