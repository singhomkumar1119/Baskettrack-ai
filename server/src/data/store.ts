import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { AnalysisRecord } from '../types/basketball.js';
import { DEFAULT_ANALYSES } from './defaultAnalyses.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, '../../data/analyses.json');

class DataStore {
  private analyses: Map<string, AnalysisRecord> = new Map();

  constructor() {
    this.init();
  }

  private init() {
    try {
      const dataDir = path.dirname(DATA_FILE);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        const list: AnalysisRecord[] = JSON.parse(raw);
        for (const item of list) {
          this.analyses.set(item.id, item);
        }
      } else {
        // Populate defaults
        for (const item of DEFAULT_ANALYSES) {
          this.analyses.set(item.id, item);
        }
        this.persist();
      }
    } catch (e) {
      console.warn('Could not read from persistent store, using defaults in memory', e);
      for (const item of DEFAULT_ANALYSES) {
        this.analyses.set(item.id, item);
      }
    }
  }

  private persist() {
    try {
      const list = Array.from(this.analyses.values());
      fs.writeFileSync(DATA_FILE, JSON.stringify(list, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error persisting analyses to disk:', e);
    }
  }

  public getAll(): AnalysisRecord[] {
    return Array.from(this.analyses.values()).sort(
      (a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
    );
  }

  public getById(id: string): AnalysisRecord | undefined {
    return this.analyses.get(id);
  }

  public set(analysis: AnalysisRecord): void {
    this.analyses.set(analysis.id, analysis);
    this.persist();
  }

  public update(id: string, patch: Partial<AnalysisRecord>): AnalysisRecord | undefined {
    const existing = this.analyses.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...patch };
    this.analyses.set(id, updated);
    this.persist();
    return updated;
  }

  public delete(id: string): boolean {
    const deleted = this.analyses.delete(id);
    if (deleted) {
      this.persist();
    }
    return deleted;
  }
}

export const dataStore = new DataStore();
