import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Fish } from "lucide-react";

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
        options: {
          emailRedirectTo: window.location.origin,
        },
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
    <main className="min-h-screen flex items-center justify-center px-4 sticker-page">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/20 mb-4">
            <Fish className="w-10 h-10 text-primary" />
          </div>
          <h1 className="font-display text-3xl text-primary tracking-tight">
            The Voyagers Chronicle
          </h1>
          <p className="text-muted-foreground text-sm mt-2">
            Your digital fishing card collection
          </p>
        </div>

        {sent ? (
          <div className="bg-card border-2 border-primary/30 rounded-2xl p-8 text-center">
            <div className="text-4xl mb-3">&#x2709;</div>
            <h2 className="font-display text-xl text-foreground mb-2">Check your email!</h2>
            <p className="text-sm text-muted-foreground">
              We sent a magic link to <span className="text-primary font-semibold">{email}</span>. 
              Click it to sign in.
            </p>
            <button
              onClick={() => setSent(false)}
              className="mt-4 text-sm text-primary hover:underline"
            >
              Try a different email
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-card border-2 border-border rounded-2xl p-8 space-y-5">
            <div>
              <label className="text-sm font-display text-muted-foreground">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 w-full bg-input border-2 border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
                placeholder="your.email@example.com"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground font-display text-base py-3 rounded-xl hover:brightness-110 transition-all disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send Magic Link"}
            </button>
            <p className="text-xs text-center text-muted-foreground">
              No password needed -- we'll email you a link to sign in
            </p>
          </form>
        )}
      </div>
    </main>
  );
};

export default Auth;
