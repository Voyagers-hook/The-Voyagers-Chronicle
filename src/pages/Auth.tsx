import { useState, useEffect } from "react";
import type { Session } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Mail } from "lucide-react";
import { Logo } from "@/components/game/Logo";

const Auth = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [verifyingLink, setVerifyingLink] = useState(
    () => window.location.hash.includes("access_token") || window.location.hash.includes("refresh_token"),
  );

  useEffect(() => {
    let isMounted = true;

    const handleSession = (session: Session | null) => {
      if (!isMounted) return;
      if (session) {
        navigate("/", { replace: true });
        return;
      }
      setVerifyingLink(false);
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      handleSession(session);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      handleSession(session);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
          options: { emailRedirectTo: `${window.location.origin}/auth` },
      });
      if (error) throw error;
      setSent(true);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-10 tcg-felt">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <Logo className="w-36 h-36 mx-auto mb-4 drop-shadow-xl" />
          <h1 className="font-display text-4xl text-foreground tracking-tight">
            The Voyagers Chronicle
          </h1>
          <p className="text-base text-muted-foreground mt-1">Digital trading card collection</p>
        </div>

        {verifyingLink ? (
          <div className="panel p-8 text-center">
            <h2 className="font-display text-2xl text-foreground mb-2">Signing you in</h2>
            <p className="text-muted-foreground">Finishing your magic link…</p>
          </div>
        ) : sent ? (
          <div className="panel p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent border-4 border-white shadow-[0_4px_0_hsl(188_85%_28%)] mb-3">
              <Mail className="w-8 h-8 text-white" strokeWidth={2.5} />
            </div>
            <h2 className="font-display text-2xl text-foreground mb-2">Check your inbox</h2>
            <p className="text-muted-foreground">
              A sign-in link has been sent to <span className="text-primary font-bold">{email}</span>.
            </p>
            <button onClick={() => setSent(false)} className="mt-5 text-sm text-accent font-display hover:underline">
              Use a different email
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="panel p-7 space-y-5">
            <div>
              <label className="font-display text-sm text-foreground/80">Email address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 w-full bg-input border-2 border-border rounded-xl px-5 py-3 text-base font-display focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all"
                placeholder="you@example.com"
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full text-base disabled:opacity-60">
              {loading ? "Sending link..." : "Send sign-in link"}
            </button>
            <p className="text-xs text-center text-muted-foreground">
              No password — we'll email you a link to sign in.
            </p>
          </form>
        )}
      </div>
    </main>
  );
};

export default Auth;
