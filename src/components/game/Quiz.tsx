import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { HelpCircle, Sparkles, RotateCcw } from "lucide-react";

type Card = {
  id: string;
  name: string;
  image_url: string | null;
  fact: string | null;
};

type Question = {
  cardId: string;
  prompt: string;
  correctName: string;
  options: { id: string; label: string }[];
};

function shuffle<T>(arr: T[]) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function Quiz({ userId }: { userId: string }) {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [answered, setAnswered] = useState<string | null>(null);
  const [score, setScore] = useState<{ correct: number; total: number }>(() => {
    try {
      const raw = localStorage.getItem(`vc-quiz-score-${userId}`);
      return raw ? JSON.parse(raw) : { correct: 0, total: 0 };
    } catch {
      return { correct: 0, total: 0 };
    }
  });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data } = await supabase.from("cards").select("id, name, image_url, fact").not("fact", "is", null);
      setCards((data as Card[]) ?? []);
      setLoading(false);
    };
    void load();
  }, [userId]);

  useEffect(() => {
    try {
      localStorage.setItem(`vc-quiz-score-${userId}`, JSON.stringify(score));
    } catch {
      // ignore
    }
  }, [score, userId]);

  const question: Question | null = useMemo(() => {
    if (cards.length < 4) return null;
    const pool = shuffle(cards).slice(0, 12);
    const target = pool.find((c) => c.fact) ?? pool[0];
    const distractors = shuffle(pool.filter((c) => c.id !== target.id)).slice(0, 3);
    const options = shuffle([
      { id: target.id, label: target.name },
      ...distractors.map((d) => ({ id: d.id, label: d.name })),
    ]);

    return {
      cardId: target.id,
      prompt: target.fact ?? "Which card is this?",
      correctName: target.name,
      options,
    };
  }, [cards, score.total]);

  const answer = (id: string) => {
    if (!question || answered) return;
    setAnswered(id);
    const isCorrect = id === question.cardId;
    setScore((s) => ({ correct: s.correct + (isCorrect ? 1 : 0), total: s.total + 1 }));
    toast[isCorrect ? "success" : "error"](isCorrect ? "Correct!" : `Oops — it was ${question.correctName}.`);
    setTimeout(() => setAnswered(null), 650);
  };

  const reset = () => {
    setScore({ correct: 0, total: 0 });
    setAnswered(null);
    toast.message("Quiz progress reset");
  };

  if (loading) {
    return <div className="text-center py-16 font-display text-xl text-muted-foreground">Packing your quiz…</div>;
  }

  if (!question) {
    return (
      <div className="panel p-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary border-4 border-white shadow-[0_4px_0_hsl(22_90%_38%)] mb-3">
          <HelpCircle className="w-8 h-8 text-white" strokeWidth={2.5} />
        </div>
        <h2 className="font-display text-2xl">Quiz coming soon</h2>
        <p className="text-sm text-muted-foreground mt-2">
          Add at least 4 cards with fun facts and this quiz will unlock.
        </p>
      </div>
    );
  }

  return (
    <section className="panel p-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-primary" />
            <h2 className="font-display text-2xl leading-none">Trail Quiz</h2>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Read the clue. Pick the right card. Earn bragging rights.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="tab-pill tab-pill-active text-xs !py-1.5 !px-3">
            <span className="font-display">{score.correct}</span> / {score.total || 0} correct
          </div>
          <button onClick={reset} className="tab-pill text-xs !py-1.5 !px-3 flex items-center gap-1.5">
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
        </div>
      </div>

      <div className="mt-6 bg-card/70 border-2 border-border rounded-3xl p-6">
        <div className="flex items-center gap-2 text-muted-foreground text-xs font-display uppercase tracking-wide">
          <Sparkles className="w-4 h-4" /> Clue
        </div>
        <div className="font-display text-2xl mt-2 leading-snug">{question.prompt}</div>
      </div>

      <div className="mt-5 grid sm:grid-cols-2 gap-3">
        {question.options.map((o) => {
          const isPicked = answered === o.id;
          const isCorrect = answered && o.id === question.cardId;
          const isWrong = answered && isPicked && o.id !== question.cardId;
          return (
            <button
              key={o.id}
              onClick={() => answer(o.id)}
              disabled={!!answered}
              className={[
                "panel p-4 text-left transition-all",
                "hover:brightness-[1.02] active:translate-y-[1px]",
                isCorrect ? "border-2 border-green-500" : "",
                isWrong ? "border-2 border-destructive" : "",
              ].join(" ")}
            >
              <div className="font-display text-lg leading-none">{o.label}</div>
              <div className="text-xs text-muted-foreground mt-1">Tap to choose</div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

