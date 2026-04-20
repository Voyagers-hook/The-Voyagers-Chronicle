import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Camera, Send, Clock, CheckCircle2, XCircle } from "lucide-react";

type Submission = {
  id: string;
  species: string;
  weight: string | null;
  photo_url: string | null;
  status: string;
  admin_notes: string | null;
  created_at: string;
};

export const CatchSubmission = ({ userId }: { userId: string }) => {
  const [species, setSpecies] = useState("");
  const [weight, setWeight] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  const loadSubmissions = async () => {
    const { data } = await supabase
      .from("catch_submissions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (data) setSubmissions(data as Submission[]);
  };

  useEffect(() => {
    loadSubmissions();
  }, [userId]);

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!species.trim()) {
      toast.error("Please enter the species");
      return;
    }
    setSubmitting(true);
    try {
      let photo_url: string | null = null;
      if (photo) {
        const ext = photo.name.split(".").pop();
        const path = `${userId}/${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage.from("catch-photos").upload(path, photo);
        if (upErr) throw upErr;
        const { data } = supabase.storage.from("catch-photos").getPublicUrl(path);
        photo_url = data.publicUrl;
      }

      const { error } = await supabase.from("catch_submissions").insert({
        user_id: userId,
        species: species.trim(),
        weight: weight.trim() || null,
        photo_url,
      });
      if (error) throw error;

      toast.success("Catch submitted for review!");
      setSpecies("");
      setWeight("");
      setPhoto(null);
      setPhotoPreview(null);
      loadSubmissions();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const statusIcon = (status: string) => {
    if (status === "pending") return <Clock className="w-4 h-4 text-yellow-500" />;
    if (status === "approved") return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    return <XCircle className="w-4 h-4 text-red-500" />;
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Submit form */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="font-display text-lg uppercase tracking-wider mb-4">Submit a Catch</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-display uppercase tracking-wider text-muted-foreground">Species</label>
            <input
              type="text"
              required
              value={species}
              onChange={(e) => setSpecies(e.target.value)}
              className="mt-1 w-full bg-input border border-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="e.g. Brown Trout"
            />
          </div>
          <div>
            <label className="text-xs font-display uppercase tracking-wider text-muted-foreground">Weight (optional)</label>
            <input
              type="text"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="mt-1 w-full bg-input border border-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="e.g. 2.5 lbs"
            />
          </div>
          <div>
            <label className="text-xs font-display uppercase tracking-wider text-muted-foreground">Photo</label>
            <label className="mt-1 flex items-center justify-center gap-2 border-2 border-dashed border-border rounded-lg py-6 cursor-pointer hover:border-primary/50 transition-colors">
              <Camera className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{photo ? photo.name : "Upload photo"}</span>
              <input type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
            </label>
            {photoPreview && (
              <img src={photoPreview} alt="Preview" className="mt-2 w-full h-40 object-cover rounded-lg" />
            )}
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-primary text-primary-foreground font-display uppercase tracking-wider py-2.5 rounded text-sm hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            {submitting ? "Submitting..." : "Submit Catch"}
          </button>
        </form>
      </div>

      {/* History */}
      <div>
        <h3 className="font-display text-lg uppercase tracking-wider mb-4">Your Submissions</h3>
        {submissions.length === 0 ? (
          <p className="text-sm text-muted-foreground">No submissions yet.</p>
        ) : (
          <div className="space-y-2">
            {submissions.map((s) => (
              <div key={s.id} className="bg-card border border-border rounded-lg p-3 flex items-center gap-3">
                {s.photo_url && (
                  <img src={s.photo_url} alt="" className="w-12 h-12 rounded object-cover shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-display text-sm uppercase">{s.species}</div>
                  {s.weight && <div className="text-xs text-muted-foreground">{s.weight}</div>}
                  {s.admin_notes && <div className="text-xs text-muted-foreground mt-1 italic">{s.admin_notes}</div>}
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {statusIcon(s.status)}
                  <span className="text-xs font-display uppercase">{s.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
