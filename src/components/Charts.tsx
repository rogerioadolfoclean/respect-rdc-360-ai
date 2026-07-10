// Graphiques SVG côté serveur — tableau de bord national

const PALETTE = ["#123a7a", "#007fff", "#f5c518", "#ce1021", "#0e9f6e", "#7c3aed", "#f97316", "#0891b2"];

export function BarresHorizontales({ data, couleur = "#123a7a" }: { data: { nom: string; total: number }[]; couleur?: string }) {
  const max = Math.max(1, ...data.map((d) => d.total));
  return (
    <div className="space-y-2">
      {data.map((d, i) => (
        <div key={d.nom} className="flex items-center gap-2 text-xs">
          <div className="w-28 truncate text-right font-medium" title={d.nom}>{d.nom}</div>
          <div className="flex-1 bg-slate-100 rounded h-5 overflow-hidden">
            <div
              className="h-full rounded flex items-center justify-end pr-1.5 text-[10px] font-bold text-white"
              style={{ width: `${Math.max(8, (d.total / max) * 100)}%`, background: i === 0 ? "#ce1021" : couleur }}
            >
              {d.total}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function Donut({ data, taille = 170 }: { data: { nom: string; total: number; couleur?: string }[]; taille?: number }) {
  const total = Math.max(1, data.reduce((s, d) => s + d.total, 0));
  const r = 60;
  const c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div className="flex items-center gap-4 flex-wrap">
      <svg width={taille} height={taille} viewBox="0 0 160 160">
        {data.map((d, i) => {
          const frac = d.total / total;
          const el = (
            <circle
              key={d.nom}
              cx="80" cy="80" r={r}
              fill="none"
              stroke={d.couleur ?? PALETTE[i % PALETTE.length]}
              strokeWidth="26"
              strokeDasharray={`${frac * c} ${c}`}
              strokeDashoffset={-offset * c}
              transform="rotate(-90 80 80)"
            />
          );
          offset += frac;
          return el;
        })}
        <text x="80" y="76" textAnchor="middle" className="font-black" fontSize="22" fill="#0a2148">{total}</text>
        <text x="80" y="94" textAnchor="middle" fontSize="10" fill="#64748b">total</text>
      </svg>
      <div className="space-y-1 text-xs">
        {data.map((d, i) => (
          <div key={d.nom} className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm inline-block" style={{ background: d.couleur ?? PALETTE[i % PALETTE.length] }} />
            <span className="font-medium">{d.nom}</span>
            <span className="text-slate-500">— {d.total} ({Math.round((d.total / total) * 100)}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Courbe({ data }: { data: { mois: string; total: number }[] }) {
  if (data.length === 0) return <div className="text-sm text-slate-400">Aucune donnée.</div>;
  const w = 560, h = 180, pad = 30;
  const max = Math.max(1, ...data.map((d) => d.total));
  const pts = data.map((d, i) => ({
    x: pad + (i * (w - pad * 2)) / Math.max(1, data.length - 1),
    y: h - pad - (d.total / max) * (h - pad * 2),
  }));
  const path = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full">
      {[0.25, 0.5, 0.75, 1].map((f) => (
        <line key={f} x1={pad} x2={w - pad} y1={h - pad - f * (h - pad * 2)} y2={h - pad - f * (h - pad * 2)} stroke="#e2e8f0" strokeDasharray="4 4" />
      ))}
      <path d={`${path} L${pts[pts.length - 1].x},${h - pad} L${pts[0].x},${h - pad} Z`} fill="#007fff22" />
      <path d={path} fill="none" stroke="#123a7a" strokeWidth="2.5" />
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="3.5" fill="#ce1021" />
          <text x={p.x} y={h - 8} textAnchor="middle" fontSize="9" fill="#64748b">{data[i].mois}</text>
          <text x={p.x} y={p.y - 8} textAnchor="middle" fontSize="9" fontWeight="bold" fill="#0a2148">{data[i].total}</text>
        </g>
      ))}
    </svg>
  );
}

export function JaugeGravite({ gravite }: { gravite: string | null }) {
  const niveaux = ["faible", "moyen", "eleve", "tres_eleve"];
  const labels = ["Faible", "Moyen", "Élevé", "Très élevé"];
  const couleurs = ["#0e9f6e", "#f5c518", "#f97316", "#ce1021"];
  const idx = gravite ? niveaux.indexOf(gravite) : -1;
  return (
    <div className="flex gap-1 items-center">
      {niveaux.map((n, i) => (
        <span
          key={n}
          className="px-2 py-0.5 rounded text-[10px] font-bold"
          style={idx === i ? { background: couleurs[i], color: i === 1 ? "#0a2148" : "white" } : { background: "#f1f5f9", color: "#94a3b8" }}
        >
          {labels[i]}
        </span>
      ))}
    </div>
  );
}

export function BadgeGravite({ gravite }: { gravite: string | null }) {
  const map: Record<string, { l: string; c: string; t?: string }> = {
    faible: { l: "Faible", c: "#0e9f6e" },
    moyen: { l: "Moyen", c: "#f5c518", t: "#0a2148" },
    eleve: { l: "Élevé", c: "#f97316" },
    tres_eleve: { l: "Très élevé", c: "#ce1021" },
  };
  const m = gravite ? map[gravite] : null;
  if (!m) return <span className="text-xs text-slate-400">—</span>;
  return (
    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold" style={{ background: m.c, color: m.t ?? "white" }}>
      {m.l}
    </span>
  );
}

export function BadgeStatut({ statut, labels }: { statut: string; labels: Record<string, string> }) {
  const couleurs: Record<string, string> = {
    plainte_recue: "bg-blue-100 text-blue-800",
    analyse_ia: "bg-purple-100 text-purple-800",
    mediation: "bg-amber-100 text-amber-800",
    enquete: "bg-orange-100 text-orange-800",
    audience: "bg-cyan-100 text-cyan-800",
    decision: "bg-indigo-100 text-indigo-800",
    cloture: "bg-emerald-100 text-emerald-800",
    recue: "bg-blue-100 text-blue-800",
    en_traitement: "bg-amber-100 text-amber-800",
    cloturee: "bg-emerald-100 text-emerald-800",
    rejetee: "bg-slate-200 text-slate-600",
    envoyee: "bg-blue-100 text-blue-800",
    notifie: "bg-cyan-100 text-cyan-800",
    conteste: "bg-red-100 text-red-800",
    present: "bg-emerald-100 text-emerald-800",
    absent: "bg-slate-200 text-slate-600",
    en_cours: "bg-amber-100 text-amber-800",
    reussie: "bg-emerald-100 text-emerald-800",
    echouee: "bg-red-100 text-red-800",
    prononcee: "bg-indigo-100 text-indigo-800",
    executee: "bg-emerald-100 text-emerald-800",
    payee: "bg-emerald-100 text-emerald-800",
    confirme: "bg-emerald-100 text-emerald-800",
    en_attente: "bg-amber-100 text-amber-800",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${couleurs[statut] ?? "bg-slate-100 text-slate-700"}`}>
      {labels[statut] ?? statut}
    </span>
  );
}
