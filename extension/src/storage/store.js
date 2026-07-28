import { SESSION_SCHEMA_VERSION } from "../shared/models.js";

const SETTINGS_KEY = "ejt.settings";
const SESSION_KEY = "ejt.session";
const RESUME_KEY = "ejt.defaultResume";
const HISTORY_KEY = "ejt.history";

const memoryStorage = new Map();
const chromeStorage = globalThis.chrome?.storage?.local;

async function get(keys) {
  if (chromeStorage) return chromeStorage.get(keys);
  const result = {};
  for (const key of keys) result[key] = memoryStorage.get(key);
  return result;
}

async function set(value) {
  if (chromeStorage) return chromeStorage.set(value);
  for (const [key, item] of Object.entries(value)) memoryStorage.set(key, item);
}

export async function loadSettings() {
  const result = await get([SETTINGS_KEY]);
  return result[SETTINGS_KEY] ?? { provider: "openai-compatible", baseUrl: "https://api.openai.com/v1", apiKey: "", model: "", fastModel: "", reportModel: "" };
}

export const saveSettings = (settings) => set({ [SETTINGS_KEY]: settings });

export async function loadSession() {
  const result = await get([SESSION_KEY]);
  const stored = result[SESSION_KEY] ?? null;
  const { session, migrated } = migrateSession(stored);
  if (migrated) await set({ [SESSION_KEY]: session });
  return session;
}

export const saveSession = (session) => set({ [SESSION_KEY]: { ...session, sessionSchemaVersion: SESSION_SCHEMA_VERSION } });

export function migrateSession(session) {
  if (!session || session.sessionSchemaVersion === SESSION_SCHEMA_VERSION) {
    return { session, migrated: false };
  }

  const hasLegacyAnalysis = Boolean(
    session.scoring
    || session.report
    || session.finalReport
    || session.finalResume
    || session.facts?.length
    || session.evidence?.length
    || session.questions?.length
    || session.suggestions?.length,
  );
  if (!hasLegacyAnalysis) {
    return {
      session: { ...session, sessionSchemaVersion: SESSION_SCHEMA_VERSION },
      migrated: true,
    };
  }

  const materialsConfirmed = Boolean(session.jd?.confirmedAt && session.resume?.confirmedAt);
  const nextStep = materialsConfirmed
    ? "diagnosing"
    : session.jd?.confirmedAt
      ? "resume_review"
      : session.jd
        ? "jd_review"
        : "setup";

  return {
    migrated: true,
    session: {
      ...session,
      sessionSchemaVersion: SESSION_SCHEMA_VERSION,
      step: nextStep,
      facts: [],
      evidence: [],
      questions: [],
      answers: [],
      scoring: null,
      suggestions: [],
      report: null,
      timings: {},
      finalResume: null,
      finalReport: null,
      migrationNotice: "检测到旧版本分析结果。已保留 JD 与简历，请按 v0.3 规则重新诊断。",
      updatedAt: new Date().toISOString(),
    },
  };
}

export async function loadDefaultResume() {
  const result = await get([RESUME_KEY]);
  return result[RESUME_KEY] ?? null;
}

export const saveDefaultResume = (resume) => set({ [RESUME_KEY]: resume });

export async function loadHistory() {
  const result = await get([HISTORY_KEY]);
  return result[HISTORY_KEY] ?? [];
}

export async function addHistory(item) {
  const history = await loadHistory();
  const next = [item, ...history.filter((candidate) => candidate.id !== item.id)].slice(0, 20);
  await set({ [HISTORY_KEY]: next });
  return next;
}

export async function clearAllData() {
  if (chromeStorage) return chromeStorage.remove([SETTINGS_KEY, SESSION_KEY, RESUME_KEY, HISTORY_KEY]);
  for (const key of [SETTINGS_KEY, SESSION_KEY, RESUME_KEY, HISTORY_KEY]) memoryStorage.delete(key);
}
