import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export const useAuth = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const syncAuthState = async (sess: Session | null) => {
      if (!isMounted) return;

      setSession(sess);
      setUser(sess?.user ?? null);

      if (!sess?.user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", sess.user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (!isMounted) return;
      setIsAdmin(!!data);
      setLoading(false);
    };

    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      void syncAuthState(sess);
    });

    supabase.auth.getSession().then(({ data: { session: sess } }) => {
      void syncAuthState(sess);
    });

    return () => {
      isMounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signOut = () => supabase.auth.signOut();

  return { session, user, isAdmin, loading, signOut };
};
