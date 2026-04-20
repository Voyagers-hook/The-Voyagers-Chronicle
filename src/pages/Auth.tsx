import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Mail, Sparkles } from "lucide-react";

const Auth = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate("/");
    });
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { emailRedirectTo: window.location.origin },
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
    <main className="min-h-screen flex items-center justify-center px-4 py-10 sticker-page">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary border-4 border-white shadow-[0_6px_0_hsl(22_90%_40%)] mb-4 -rotate-6">
            <Sparkles className="w-12 h-12 text-white" strokeWidth={2.5} />
          </div>
          <h1 className="font-display text-4xl text-foreground tracking-tight">
            The Voyagers Chronicle
          </h1>
          <p className="font-hand text-2xl text-primary mt-1">Your fishy sticker book!</p>
        </div>

        {sent ? (
          <div className="paper-card p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent border-4 border-white shadow-[0_4px_0_hsl(210_80%_35%)] mb-3">
              <Mail className="w-8 h-8 text-white" strokeWidth={2.5} />
            </div>
            <h2 className="font-display text-2xl text-foreground mb-2">Check your inbox!</h2>
            <p className="text-muted-foreground">
              We sent a magic link to <span className="text-primary font-bold">{email}</span>.
              Click it to hop into your sticker book.
            </p>
            <button onClick={() => setSent(false)} className="mt-5 text-sm text-accent font-display hover:underline">
              Use a different email
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="paper-card p-7 space-y-5">
            <div>
              <label className="font-display text-sm text-foreground/80">Your email address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 w-full bg-input border-2 border-border rounded-2xl px-5 py-3 text-base font-display focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all"
                placeholder="you@example.com"
              />
            </div>
            <button type="submit" disabled={loading} className="btn-bouncy w-full text-lg disabled:opacity-60">
              {loading ? "Sending magic..." : "Send my magic link"}
            </button>
            <p className="text-xs text-center text-muted-foreground">
              No password needed — we'll email you a link to sign in.
            </p>
          </form>
        )}
      </div>
    </main>
  );
};

export default Auth;
