"use client";

import { useEffect, useState, type ReactNode } from "react";
import { ChevronDown, Loader2, Plus, Trash2, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type FieldType = "text" | "textarea" | "number" | "select" | "toggle" | "url" | "file" | "list" | "json" | "color";

export interface FieldDef {
  key: string;
  id?: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  hint?: string;
  options?: Array<{ value: string; label: string }>;
  accept?: string;
  rows?: number;
  /** Stable Cloudinary asset key for file/image uploads. */
  uploadKey?: string;
}

type Obj = Record<string, unknown>;

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function getPath(object: Obj, path: string): unknown {
  return path.split(".").reduce<unknown>((current, key) => {
    if (!current || typeof current !== "object") return undefined;
    return (current as Obj)[key];
  }, object);
}

function setPath(object: Obj, path: string, value: unknown) {
  const keys = path.split(".");
  let cursor: Obj = object;
  for (let i = 0; i < keys.length - 1; i += 1) {
    const key = keys[i];
    if (!cursor[key] || typeof cursor[key] !== "object") cursor[key] = {};
    cursor = cursor[key] as Obj;
  }
  cursor[keys[keys.length - 1]] = value;
}

const inputClass =
  "w-full rounded-[2px] border border-[#d8d2c4] bg-[#fffefb] px-3.5 py-2.5 font-body text-sm text-[#171717] outline-none transition-colors placeholder:text-[#b0aa9c] focus:border-[#b18a50] focus:ring-2 focus:ring-[rgba(177,138,80,0.18)]";

function FieldShell({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-accent text-[0.66rem] font-semibold uppercase tracking-[0.14em] text-[#8b8579]">{label}</span>
      {children}
      {hint && <span className="mt-1.5 block font-body text-[0.68rem] leading-5 text-[#9b968b]">{hint}</span>}
    </label>
  );
}

export function JsonField({ value, onChange, rows = 8 }: { value: unknown; onChange: (value: unknown) => void; rows?: number }) {
  const [text, setText] = useState(() => JSON.stringify(value ?? {}, null, 2));
  const [error, setError] = useState("");

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setText(JSON.stringify(value ?? {}, null, 2)));
    return () => window.cancelAnimationFrame(frame);
  }, [value]);

  return (
    <div>
      <textarea
        rows={rows}
        className={cn(inputClass, "font-mono text-xs leading-5")}
        value={text}
        onChange={(event) => {
          setText(event.target.value);
          setError("");
        }}
        onBlur={() => {
          try {
            onChange(JSON.parse(text));
            setError("");
          } catch {
            setError("Invalid JSON — changes were not applied.");
          }
        }}
      />
      {error && <p className="mt-1.5 text-xs text-[#a33a2f]">{error}</p>}
    </div>
  );
}

export interface FileFieldProps {
  value: unknown;
  onChange: (value: string | null) => void;
  accept?: string;
  /** Stable key tying this upload to a Cloudinary asset record in the database. */
  uploadKey?: string;
}

export function FileField({ value, onChange, accept, uploadKey }: FileFieldProps) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const current = typeof value === "string" && value.trim() ? value : null;
  const isImage = Boolean(current && /\.(png|jpe?g|webp|gif|avif|svg)(\?|$)/i.test(current)) || current?.startsWith("data:image/");

  const onSelect = async (file: File) => {
    setError("");
    setSuccess("");
    setBusy(true);
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => (typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("Could not read the file.")));
        reader.onerror = () => reject(new Error("Could not read the file."));
        reader.readAsDataURL(file);
      });
      // Signed upload happens on the server; CLOUDINARY_API_SECRET never reaches the browser.
      const response = await fetch("/api/admin/upload", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: uploadKey || "asset", dataUrl }),
      });
      const result = (await response.json().catch(() => ({}))) as { ok?: boolean; url?: string; error?: string; message?: string };
      if (!response.ok || !result.ok || !result.url) {
        throw new Error(result.error || `Upload failed (${response.status}).`);
      }
      onChange(result.url);
      setSuccess(result.message || "Uploaded and saved to the database.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  };

  const onRemove = async () => {
    setError("");
    setSuccess("");
    if (uploadKey && current && !current.startsWith("data:")) {
      setBusy(true);
      try {
        const response = await fetch(`/api/admin/upload?key=${encodeURIComponent(uploadKey)}`, {
          method: "DELETE",
          credentials: "same-origin",
        });
        const result = (await response.json().catch(() => ({}))) as { ok?: boolean; error?: string };
        if (!response.ok || !result.ok) throw new Error(result.error || "Could not remove the cloud asset.");
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "Could not remove the cloud asset.");
      } finally {
        setBusy(false);
      }
    }
    onChange(null);
  };

  return (
    <div className="space-y-2">
      <label className={cn("flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-[#d8d2c4] bg-[#fffefb] px-4 py-3 font-accent text-[0.66rem] font-semibold uppercase tracking-[0.12em] text-[#6f6a60] transition-colors hover:border-[#b18a50] hover:text-[#171717]", busy && "pointer-events-none opacity-60")}>
        {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Upload className="h-4 w-4" aria-hidden="true" />}
        {busy ? "Uploading…" : current ? "Replace uploaded file" : "Upload file"}
        <input
          type="file"
          accept={accept}
          className="sr-only"
          disabled={busy}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void onSelect(file);
            event.target.value = "";
          }}
        />
      </label>

      {isImage && current && !current.startsWith("data:") && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={current} alt="Uploaded preview" className="h-28 w-full rounded-[2px] border border-[#e5e2da] object-cover" />
      )}
      {current && (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-[#e5e2da] px-3 py-2 font-body text-[0.68rem] text-[#6f6a60]">
          <span className="truncate" title={current}>{current.startsWith("data:") ? "Legacy inline file — re-upload to store it permanently" : current}</span>
          <button type="button" onClick={() => void onRemove()} disabled={busy} className="inline-flex items-center gap-1 font-accent text-[0.62rem] font-semibold uppercase tracking-[0.1em] text-[#a33a2f] hover:text-[#a33a2f] disabled:opacity-50" aria-label="Remove uploaded file">
            <X className="h-3.5 w-3.5" /> Remove
          </button>
        </div>
      )}
      {error && <p role="alert" className="text-xs text-[#a33a2f]">{error}</p>}
      {success && <p role="status" className="text-xs text-[#4f6b52]">{success}</p>}
    </div>
  );
}

function FieldControl({ field, value, onChange }: { field: FieldDef; value: unknown; onChange: (value: unknown) => void }) {
  const stringValue = typeof value === "string" ? value : value == null ? "" : String(value);

  if (field.type === "toggle") {
    return (
      <label className="flex cursor-pointer items-center justify-between gap-4 rounded-[2px] border border-[#e5e2da] bg-[#fffefb] px-3.5 py-3">
        <span className="font-body text-sm text-[#171717]">{Boolean(value) ? "Enabled" : "Disabled"}</span>
        <input type="checkbox" checked={Boolean(value)} onChange={(event) => onChange(event.target.checked)} className="h-4 w-4 accent-[#7c83ff]" />
      </label>
    );
  }

  if (field.type === "select") {
    return (
      <select className={inputClass} value={stringValue} onChange={(event) => onChange(event.target.value)}>
        {(field.options ?? []).map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    );
  }

  if (field.type === "textarea") {
    return <textarea rows={field.rows ?? 4} className={inputClass} placeholder={field.placeholder} value={stringValue} onChange={(event) => onChange(event.target.value)} />;
  }

  if (field.type === "list") {
    const items = Array.isArray(value) ? value.map(String) : [];
    return (
      <textarea
        rows={field.rows ?? 4}
        className={cn(inputClass, "font-mono text-xs")}
        placeholder={field.placeholder ?? "One item per line"}
        value={items.join("\n")}
        onChange={(event) => onChange(event.target.value.split("\n").map((line) => line.trim()).filter(Boolean))}
      />
    );
  }

  if (field.type === "json") {
    return <JsonField value={value} onChange={onChange} rows={field.rows ?? 8} />;
  }

  if (field.type === "file") {
    return <FileField value={value} onChange={onChange} accept={field.accept} uploadKey={field.uploadKey ?? field.key} />;
  }

  if (field.type === "color") {
    return (
      <div className="flex items-center gap-3">
        <input type="color" value={/^#[0-9a-f]{6}$/i.test(stringValue) ? stringValue : "#7c83ff"} onChange={(event) => onChange(event.target.value)} className="h-10 w-14 cursor-pointer rounded-[2px] border border-[#d8d2c4] bg-transparent" />
        <input className={inputClass} value={stringValue} placeholder="#7C83FF" onChange={(event) => onChange(event.target.value)} />
      </div>
    );
  }

  if (field.type === "number") {
    return <input type="number" className={inputClass} placeholder={field.placeholder} value={stringValue} onChange={(event) => onChange(Number(event.target.value))} />;
  }

  return <input type={field.type === "url" ? "url" : "text"} className={inputClass} placeholder={field.placeholder} value={stringValue} onChange={(event) => onChange(event.target.value)} />;
}

export function ObjectEditor({ value, fields, onChange, columns = 2 }: { value: Obj; fields: FieldDef[]; onChange: (value: Obj) => void; columns?: 1 | 2 | 3 }) {
  const update = (path: string, next: unknown) => {
    const draft = clone(value);
    setPath(draft, path, next);
    onChange(draft);
  };

  return (
    <div className={cn("grid gap-4", columns === 1 && "grid-cols-1", columns === 2 && "grid-cols-1 md:grid-cols-2", columns === 3 && "grid-cols-1 md:grid-cols-2 xl:grid-cols-3")}>
      {fields.map((field) => (
        <div key={field.id ?? field.key} className={cn((field.type === "json" || field.type === "list" || field.type === "textarea" || field.type === "file") && "md:col-span-2")}>
          <FieldShell label={field.label} hint={field.hint}>
            <FieldControl field={field} value={getPath(value, field.key)} onChange={(next) => update(field.key, next)} />
          </FieldShell>
        </div>
      ))}
    </div>
  );
}

export function ObjectArrayEditor({
  title,
  description,
  value,
  fields,
  createItem,
  itemTitle,
  onChange,
}: {
  title: string;
  description?: string;
  value: Obj[];
  fields: FieldDef[];
  createItem: () => Obj;
  itemTitle: (item: Obj, index: number) => string;
  onChange: (value: Obj[]) => void;
}) {
  const updateItem = (index: number, next: Obj) => {
    const draft = clone(value);
    draft[index] = next;
    onChange(draft);
  };

  return (
    <section className="premium-card rounded-[3px] p-5 sm:p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-medium text-[#171717]">{title}</h2>
          {description && <p className="mt-1.5 max-w-2xl text-xs leading-6 text-muted">{description}</p>}
        </div>
        <button type="button" onClick={() => onChange([...clone(value), createItem()])} className="inline-flex h-10 items-center gap-2 rounded-[2px] border border-[#d8c9a9] bg-[rgba(177,138,80,0.1)] px-4 font-accent text-[0.66rem] font-semibold uppercase tracking-[0.12em] text-[#8a6a3b] transition-colors hover:bg-[rgba(177,138,80,0.2)]">
          <Plus className="h-4 w-4" aria-hidden="true" /> Add item
        </button>
      </div>

      {value.length === 0 && <div className="dashed-placeholder rounded-[2px] px-4 py-6 font-body text-sm text-[#77756f]">No items yet. Add one to publish content.</div>}

      <div className="space-y-3">
        {value.map((item, index) => (
          <details key={`${itemTitle(item, index)}-${index}`} open={index === 0} className="group rounded-[2px] border border-[#e5e2da] bg-[#fffefb]">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 border-b border-[#e5e2da] px-4 py-3">
              <span className="flex min-w-0 items-center gap-3">
                <ChevronDown className="h-4 w-4 shrink-0 text-electric transition-transform group-open:rotate-180" aria-hidden="true" />
                <span className="truncate font-body text-sm font-medium text-[#171717]">{itemTitle(item, index)}</span>
              </span>
              <button
                type="button"
                onClick={(event) => {
                  event.preventDefault();
                  onChange(value.filter((_, itemIndex) => itemIndex !== index));
                }}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-[rgba(163,58,47,0.08)] hover:text-[#a33a2f]"
                aria-label={`Remove ${itemTitle(item, index)}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </summary>
            <div className="border-t border-[#e5e2da] p-4">
              <ObjectEditor value={item} fields={fields} onChange={(next) => updateItem(index, next)} />
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
