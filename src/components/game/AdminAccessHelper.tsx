import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ShieldCheck, Copy, ExternalLink } from "lucide-react";

export function AdminAccessHelper({ userId, email }: { userId: string; email: string }) {
  const [open, setOpen] = useState(false);

  const sql = useMemo(() => {
    const safeEmail = email.replaceAll("'", "''");
    return `-- Grant admin role to this user
-- user_id: ${userId}
-- email: ${safeEmail || "(unknown)"}
insert into public.user_roles (user_id, role)
values ('${userId}', 'admin')
on conflict (user_id, role) do nothing;`;
  }, [userId, email]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(sql);
      toast.success("Copied SQL to clipboard");
    } catch {
      toast.error("Couldn’t copy automatically. Select and copy the SQL.");
    }
  };

  return (
    <div className="mt-10">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full panel p-5 flex items-start gap-4 text-left hover:brightness-[1.02] transition-all"
      >
        <div className="shrink-0 w-12 h-12 rounded-2xl bg-primary border-4 border-white shadow-[0_4px_0_hsl(22_90%_38%)] flex items-center justify-center">
          <ShieldCheck className="w-6 h-6 text-white" strokeWidth={2.5} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-display text-lg leading-none">Need admin access?</div>
          <div className="text-sm text-muted-foreground mt-1.5">
            I can’t grant admin from the browser (Supabase security). Tap to reveal the exact SQL to run in Supabase.
          </div>
        </div>
        <span className="tab-pill text-xs !py-1 !px-3">{open ? "Hide" : "Show"}</span>
      </button>

      {open && (
        <div className="panel p-5 mt-3">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="text-sm text-muted-foreground">
              Run this in Supabase SQL Editor for your project, then refresh the app.
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={copy} className="tab-pill !py-1.5 !px-3 text-xs flex items-center gap-1.5">
                <Copy className="w-3.5 h-3.5" /> Copy SQL
              </button>
              <a
                className="tab-pill !py-1.5 !px-3 text-xs flex items-center gap-1.5"
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noreferrer"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Open Supabase
              </a>
            </div>
          </div>
          <pre className="mt-4 text-xs bg-muted/60 border-2 border-border rounded-2xl p-4 overflow-auto leading-relaxed">
            {sql}
          </pre>
        </div>
      )}
    </div>
  );
}

