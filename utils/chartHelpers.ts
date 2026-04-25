import { Colors } from '../constants/theme';
import { MoodType } from '../types';

// ── Shared Types ───────────────────────────────────────────

export interface ChartPoint {
  label: string;
  value: number;
  frontColor?: string;
  annotation?: string;
}

// ── Input Types ────────────────────────────────────────────

interface RawMoodLog {
  mood: MoodType;
  timestamp: number;
  _creationTime?: number;
}

interface RawSleepLog {
  durationInHours: number;
  date: string;
  _creationTime?: number;
}

interface RawStressLog {
  level: number;
  timestamp: number;
  note?: string;
  _creationTime?: number;
}

// ── Constants ──────────────────────────────────────────────

const MOOD_SCORE: Record<MoodType, number> = {
  rad: 5,
  good: 4,
  meh: 3,
  bad: 2,
  awful: 1,
};

const moodColor = (avg: number): string => {
  if (avg >= 4.5) return Colors.success;
  if (avg >= 3.5) return Colors.primary;
  if (avg >= 2.5) return Colors.warning;
  return Colors.error;
};

const sleepColor = (avg: number): string => {
  if (avg >= 7) return Colors.success;
  if (avg >= 5) return Colors.warning;
  return Colors.error;
};

const stressColor = (avg: number): string => {
  if (avg <= 5) return Colors.success;
  if (avg <= 10) return Colors.warning;
  return Colors.error;
};

// ── Helpers ────────────────────────────────────────────────

/** Convert any timestamp (number) to YYYY-MM-DD */
const tsToDate = (ts: number): string =>
  new Date(ts).toISOString().split('T')[0];

/** Short display label from YYYY-MM-DD, e.g. "26/4" */
const shortLabel = (dateStr: string): string => {
  if (!dateStr || !dateStr.includes('-')) return dateStr || '??';
  const [, m, d] = dateStr.split('-');
  return `${parseInt(d)}/${parseInt(m)}`;
};

/** Group an array by a string key and compute mean of numeric values */
function groupAndAverage<T>(
  items: T[],
  keyFn: (item: T) => string,
  valueFn: (item: T) => number,
): Map<string, number> {
  const buckets = new Map<string, number[]>();
  for (const item of items) {
    const key = keyFn(item);
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key)!.push(valueFn(item));
  }
  const averages = new Map<string, number>();
  for (const [key, values] of buckets) {
    averages.set(key, values.reduce((a, b) => a + b, 0) / values.length);
  }
  return averages;
}

// ── Public API ─────────────────────────────────────────────

/**
 * Aggregates mood logs by day (averages mood score), returns last 7 days sorted asc.
 */
export function processMoodChartData(logs: RawMoodLog[]): ChartPoint[] {
  const grouped = groupAndAverage(
    logs,
    (l) => tsToDate(l.timestamp ?? l._creationTime ?? 0),
    (l) => MOOD_SCORE[l.mood] ?? 3,
  );

  return [...grouped.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-7)
    .map(([date, avg]) => ({
      label: shortLabel(date),
      value: parseFloat(avg.toFixed(2)),
      frontColor: moodColor(avg),
    }));
}

/**
 * Aggregates sleep logs by day (averages duration), returns last 7 days sorted asc.
 * Sleep logs use a string `date` field (YYYY-MM-DD).
 */
export function processSleepChartData(logs: RawSleepLog[]): ChartPoint[] {
  const grouped = groupAndAverage(
    logs,
    (l) => l.date || tsToDate(l._creationTime ?? 0),
    (l) => l.durationInHours,
  );

  return [...grouped.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-7)
    .map(([date, avg]) => ({
      label: shortLabel(date),
      value: parseFloat(avg.toFixed(1)),
      frontColor: sleepColor(avg),
    }));
}

/**
 * Aggregates stress logs by day (averages level), returns last 7 days sorted asc.
 * Uses the latest note annotation for that day when available.
 */
export function processStressChartData(logs: RawStressLog[]): ChartPoint[] {
  // Group levels for averaging
  const grouped = groupAndAverage(
    logs,
    (l) => tsToDate(l.timestamp ?? l._creationTime ?? 0),
    (l) => l.level,
  );

  // Collect last note per day for annotation
  const noteByDay = new Map<string, string | undefined>();
  for (const log of logs) {
    const key = tsToDate(log.timestamp ?? log._creationTime ?? 0);
    if (log.note) noteByDay.set(key, log.note);
  }

  return [...grouped.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-7)
    .map(([date, avg]) => ({
      label: shortLabel(date),
      value: parseFloat(avg.toFixed(1)),
      frontColor: stressColor(avg),
      annotation: noteByDay.get(date),
    }));
}
