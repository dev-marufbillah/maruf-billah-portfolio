"use client";

import { usePathname } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import { CONTENT_STORAGE_KEY, defaultContent } from "@/lib/default-content";
import { deepMerge } from "@/lib/deep-merge";
import { SECTION_KEYS } from "@/lib/section-keys";
import type { AdminSessionInfo, PortfolioContent } from "@/types/content";

interface SaveState {
  status: "idle" | "loading" | "success" | "error";
  message: string;
}

interface ContentContextValue {
  content: PortfolioContent;
  setContent: Dispatch<SetStateAction<PortfolioContent>>;
  loaded: boolean;
  saveStatus: string;
  sessionInfo: AdminSessionInfo;
  refreshSession: () => Promise<void>;
  resetContent: () => void;
  importContent: (json: string) => void;
  exportContent: () => string;
  /** Public/desktop/mobile/admin all read the same no-store API. */
  source: "database" | "defaults" | "error";
  hasData: boolean;
  dirtyKeys: string[];
  saveState: SaveState;
  saveSections: (keys: string[]) => Promise<boolean>;
  refetch: () => Promise<void>;
}

const defaultSession: AdminSessionInfo = {
  passwordRequired: true,
  passwordConfigured: false,
  setupAllowed: false,
  authenticated: false,
  persistent: true,
  localMode: false,
  message: "Sign in at /login to edit this portfolio.",
};

const ContentContext = createContext<ContentContextValue>({
  content: defaultContent,
  setContent: () => undefined,
  loaded: false,
  saveStatus: "",
  sessionInfo: defaultSession,
  refreshSession: async () => undefined,
  resetContent: () => undefined,
  importContent: () => undefined,
  exportContent: () => "",
  source: "defaults",
  hasData: false,
  dirtyKeys: [],
  saveState: { status: "idle", message: "" },
  saveSections: async () => false,
  refetch: async () => undefined,
});

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function applyAppearance(content: PortfolioContent) {
  const root = document.documentElement;
  const { appearance, seo } = content;
  const intensity = Math.min(100, Math.max(0, appearance.backgroundIntensity)) / 100;

  root.dataset.font = appearance.fontPreset;
  root.dataset.animation = appearance.animationLevel;
  root.dataset.codeMotifs = appearance.showCodeMotifs ? "on" : "off";
  root.style.setProperty("--accent-electric", appearance.accentColor);
  root.style.setProperty("--accent-violet", appearance.accentSecondary);
  root.style.setProperty("--glow-gold", (0.018 + intensity * 0.055).toFixed(3));
  root.style.setProperty("--glow-warm", (0.01 + intensity * 0.042).toFixed(3));

  const isAdminPage = window.location.pathname.startsWith("/admin");
  if (!isAdminPage) {
    const title = seo.title || defaultContent.seo.title;
    const descriptionText = seo.description || defaultContent.seo.description;
    const applyMeta = () => {
      document.title = title;
      const titleNode = document.querySelector("title");
      if (titleNode && titleNode.textContent !== title) titleNode.textContent = title;
      const description = document.querySelector('meta[name="description"]');
      if (description) description.setAttribute("content", descriptionText);
    };
    applyMeta();
    // Next's metadata hydration / Lenis re-renders can restore the build-time
    // <title> after this effect. Re-apply on the next frame so the DB value wins
    // on desktop and mobile alike.
    window.requestAnimationFrame(applyMeta);
  }
}

export function ContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<PortfolioContent>(defaultContent);
  const [savedSnapshot, setSavedSnapshot] = useState<PortfolioContent>(defaultContent);
  const [loaded, setLoaded] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");
  const [sessionInfo, setSessionInfo] = useState<AdminSessionInfo>(defaultSession);
  const [source, setSource] = useState<"database" | "defaults" | "error">("defaults");
  const [hasData, setHasData] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>({ status: "idle", message: "" });
  const pathname = usePathname();

  const refreshSession = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/session", { cache: "no-store", credentials: "same-origin" });
      const data = (await response.json().catch(() => ({}))) as { session?: AdminSessionInfo };
      if (data.session) setSessionInfo(data.session);
    } catch {
      // Keep the last known session state if the API is temporarily unavailable.
    }
  }, []);

  const refetch = useCallback(async () => {
    const response = await fetch("/api/content", { cache: "no-store" });
    const data = (await response.json().catch(() => ({}))) as {
      ok?: boolean;
      content?: unknown;
      hasData?: boolean;
      source?: "database" | "defaults" | "error";
      error?: string;
    };
    if (!response.ok || data.ok === false) {
      throw new Error(data.error || "Could not load content from the server.");
    }
    // Database values always win; defaults only fill sections never written to the DB.
    const merged = deepMerge(defaultContent, data.hasData ? data.content : undefined);
    setContent(merged);
    setSavedSnapshot(clone(merged));
    setHasData(Boolean(data.hasData));
    setSource(data.hasData ? "database" : "defaults");
  }, []);

  useEffect(() => {
    let cancelled = false;
    // Defer the async load out of the effect body (React 19 lint rule).
    const frame = window.requestAnimationFrame(() => {
      void refetch()
        .catch((error: unknown) => {
          if (cancelled) return;
          console.error("[content] load failed:", error);
          setSource("error");
          setContent(defaultContent);
          setSavedSnapshot(clone(defaultContent));
          setSaveStatus(error instanceof Error ? error.message : "Could not load saved content.");
        })
        .finally(() => {
          if (!cancelled) setLoaded(true);
        });
      void refreshSession();
    });
    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frame);
    };
  }, [refetch, refreshSession]);

  useEffect(() => {
    if (!loaded) return;
    applyAppearance(content);
  }, [content, loaded]);

  // Re-read the Better Auth session after client-side navigation (e.g. /login -> /admin).
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => void refreshSession());
    return () => window.cancelAnimationFrame(frame);
  }, [pathname, refreshSession]);

  const dirtyKeys = useMemo(
    () =>
      SECTION_KEYS.filter((key) => {
        const current = JSON.stringify(content[key as keyof PortfolioContent]);
        const saved = JSON.stringify(savedSnapshot[key as keyof PortfolioContent]);
        return current !== saved;
      }) as unknown as string[],
    [content, savedSnapshot],
  );

  // Warn before leaving the page with unsaved edits.
  useEffect(() => {
    if (dirtyKeys.length === 0) return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirtyKeys.length]);

  const saveSections = useCallback(
    async (keys: string[]) => {
      const valid = keys.filter((key) => (SECTION_KEYS as readonly string[]).includes(key));
      if (valid.length === 0) {
        setSaveState({ status: "error", message: "Nothing to save in this section." });
        return false;
      }
      setSaveState({ status: "loading", message: "Saving to the database…" });
      setSaveStatus("Saving…");
      try {
        const sections: Record<string, unknown> = {};
        for (const key of valid) sections[key] = content[key as keyof PortfolioContent];
        const response = await fetch("/api/admin/content", {
          method: "PUT",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sections }),
        });
        const result = (await response.json().catch(() => ({}))) as { ok?: boolean; error?: string; message?: string };
        if (!response.ok || !result.ok) {
          throw new Error(result.error || `Save failed (${response.status}).`);
        }
        // UI now shows the data returned by the database, never a false success.
        await refetch();
        setSaveState({ status: "success", message: result.message || "Saved to the database." });
        setSaveStatus(result.message || "Saved to database");
        return true;
      } catch (error) {
        const message = error instanceof Error ? error.message : "Save failed. Please try again.";
        setSaveState({ status: "error", message });
        setSaveStatus(message);
        return false;
      }
    },
    [content, refetch],
  );

  const resetContent = useCallback(() => {
    setContent(defaultContent);
    setSaveStatus("Reset locally — press Save to persist the defaults.");
    setSaveState({ status: "idle", message: "" });
  }, []);

  const importContent = useCallback((json: string) => {
    const parsed = JSON.parse(json) as unknown;
    const merged = deepMerge(defaultContent, parsed);
    setContent(merged);
    setSaveStatus("Imported locally — press Save to persist.");
    setSaveState({ status: "idle", message: "" });
  }, []);

  const exportContent = useCallback(() => JSON.stringify(content, null, 2), [content]);

  /** Reads legacy browser data for the one-click migration button (never overrides the DB). */
  const value = useMemo(
    () => ({
      content,
      setContent,
      loaded,
      saveStatus,
      sessionInfo,
      refreshSession,
      resetContent,
      importContent,
      exportContent,
      source,
      hasData,
      dirtyKeys,
      saveState,
      saveSections,
      refetch,
    }),
    [
      content,
      loaded,
      saveStatus,
      sessionInfo,
      refreshSession,
      resetContent,
      importContent,
      exportContent,
      source,
      hasData,
      dirtyKeys,
      saveState,
      saveSections,
      refetch,
    ],
  );

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

export function useContent() {
  return useContext(ContentContext);
}

/** Local-only data, used solely by the migration helper. Not a data source. */
export function readLegacyLocalContent(): unknown | null {
  try {
    const stored = window.localStorage.getItem(CONTENT_STORAGE_KEY);
    return stored ? (JSON.parse(stored) as unknown) : null;
  } catch {
    return null;
  }
}
