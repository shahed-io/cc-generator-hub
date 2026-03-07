import { useState, useEffect } from "react";
import {
  loadHistory,
  deleteHistoryBatch,
  clearHistory,
  HistoryBatch,
  BRAND_CONFIGS,
  GeneratedCard,
  exportCsv,
  exportTxt,
  formatCardNumber,
} from "@/lib/cardUtils";
import { BrandBadge } from "@/components/BrandBadge";
import { CopyButton } from "@/components/CopyButton";
import { toast } from "@/hooks/use-toast";
import {
  Clock, Trash2, Download, FileText, ChevronDown, ChevronRight,
  AlertTriangle, Database, Calendar, Hash
} from "lucide-react";
import { useNavigate } from "react-router-dom";

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export default function HistoryPage() {
  const [batches, setBatches] = useState<HistoryBatch[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    setBatches(loadHistory());
  }, []);

  const handleDelete = (id: string) => {
    deleteHistoryBatch(id);
    setBatches((p) => p.filter((b) => b.id !== id));
    if (expanded === id) setExpanded(null);
    toast({ title: "Batch deleted", duration: 1500 });
  };

  const handleClearAll = () => {
    clearHistory();
    setBatches([]);
    setExpanded(null);
    toast({ title: "History cleared", duration: 1500 });
  };

  const toggleExpand = (id: string) => setExpanded((p) => (p === id ? null : id));

  const cardLine = (c: GeneratedCard) =>
    `${c.number} | ${c.expMonth}/${c.expYear} | ${c.cvv} | ${c.name} | ${BRAND_CONFIGS[c.brand].label}`;

  const reloadBatch = (batch: HistoryBatch) => {
    sessionStorage.setItem("ccgen_preset", JSON.stringify({
      brand: batch.brand,
      bin: batch.bin || "",
      length: batch.cards[0]?.number.length ?? 16,
      quantity: batch.quantity,
      expMonth: "01",
      expYear: "27",
      cvv: "123",
      name: batch.cards[0]?.name ?? "TEST USER",
      randomExp: true,
      randomCvv: true,
    }));
    navigate("/generator");
  };

  // Stats
  const totalCards = batches.reduce((a, b) => a + b.quantity, 0);
  const brandBreakdown = batches.reduce((acc, b) => {
    acc[b.brand] = (acc[b.brand] || 0) + b.quantity;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-start justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2 mb-1">
              <Clock className="w-6 h-6 text-primary" />
              Generation History
            </h1>
            <p className="text-sm text-muted-foreground">
              {batches.length} of 50 batches · {totalCards} total cards · Stored locally in your browser
            </p>
          </div>
          {batches.length > 0 && (
            <button
              onClick={handleClearAll}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold text-destructive border border-destructive/30 hover:bg-destructive/10 transition-all shrink-0"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear All
            </button>
          )}
        </div>

        {/* Stats bar */}
        {batches.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {[
              { label: "Batches", value: batches.length, icon: <Database className="w-4 h-4" /> },
              { label: "Total Cards", value: totalCards, icon: <Hash className="w-4 h-4" /> },
              { label: "Last Generated", value: timeAgo(batches[0]?.timestamp ?? 0), icon: <Calendar className="w-4 h-4" /> },
              { label: "Top Brand", value: Object.entries(brandBreakdown).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—", icon: <Clock className="w-4 h-4" /> },
            ].map((s) => (
              <div key={s.label} className="bg-card border border-border rounded-xl p-3">
                <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                  {s.icon}
                  <span className="text-xs">{s.label}</span>
                </div>
                <p className="font-bold text-sm capitalize">{s.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {batches.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-28 text-center bg-card rounded-2xl border border-border">
            <div className="w-16 h-16 rounded-2xl bg-secondary/60 flex items-center justify-center mb-4">
              <Clock className="w-8 h-8 text-muted-foreground/30" />
            </div>
            <p className="font-semibold text-muted-foreground text-base">No history yet</p>
            <p className="text-xs text-muted-foreground/60 mt-1.5 max-w-xs">
              Generated batches will appear here automatically after you use the Generator
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {batches.map((batch) => {
              const isOpen = expanded === batch.id;
              const date = new Date(batch.timestamp);
              const allText = batch.cards.map(cardLine).join("\n");
              return (
                <div key={batch.id} className="bg-card rounded-2xl border border-border overflow-hidden transition-all hover:border-border/80">
                  {/* Batch header */}
                  <div className="flex items-center justify-between px-4 py-3.5 gap-3">
                    <button
                      onClick={() => toggleExpand(batch.id)}
                      className="flex items-center gap-3 flex-1 text-left min-w-0"
                    >
                      {isOpen
                        ? <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                        : <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-0.5">
                          <BrandBadge brand={batch.brand} size="md" />
                          <span className="font-bold text-sm">{batch.quantity} cards</span>
                          {batch.bin && (
                            <span className="font-mono text-xs bg-secondary px-2 py-0.5 rounded-lg border border-border text-muted-foreground">
                              BIN: {batch.bin}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                          {" · "}
                          {date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                          {" · "}
                          <span className="text-primary/70">{timeAgo(batch.timestamp)}</span>
                        </p>
                      </div>
                    </button>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => reloadBatch(batch)}
                        className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all"
                        title="Regenerate with same settings"
                      >
                        ↺ Reuse
                      </button>
                      <CopyButton text={allText} variant="outline" label="Copy" successMsg="Batch copied!" />
                      <button
                        onClick={() => { exportCsv(batch.cards); toast({ title: "CSV downloaded", duration: 2000 }); }}
                        className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium bg-secondary border border-border hover:border-primary/40 transition-all text-muted-foreground hover:text-foreground"
                      >
                        <Download className="w-3 h-3" />
                        <span className="hidden sm:inline">CSV</span>
                      </button>
                      <button
                        onClick={() => { exportTxt(batch.cards); toast({ title: "TXT downloaded", duration: 2000 }); }}
                        className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium bg-secondary border border-border hover:border-primary/40 transition-all text-muted-foreground hover:text-foreground"
                      >
                        <FileText className="w-3 h-3" />
                        <span className="hidden sm:inline">TXT</span>
                      </button>
                      <button
                        onClick={() => handleDelete(batch.id)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                        title="Delete batch"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Expanded cards */}
                  {isOpen && (
                    <div className="border-t border-border overflow-auto max-h-72 scrollbar-thin animate-slide-up">
                      <table className="w-full text-xs font-mono">
                        <thead className="bg-secondary/40 sticky top-0">
                          <tr>
                            <th className="text-left px-3 py-2 text-muted-foreground font-semibold">#</th>
                            <th className="text-left px-3 py-2 text-muted-foreground font-semibold">Number</th>
                            <th className="text-left px-3 py-2 text-muted-foreground font-semibold">Expiry</th>
                            <th className="text-left px-3 py-2 text-muted-foreground font-semibold">CVV</th>
                            <th className="text-left px-3 py-2 text-muted-foreground font-semibold">Name</th>
                            <th className="px-3 py-2 w-8"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {batch.cards.map((card, idx) => (
                            <tr key={card.id} className="border-t border-border/30 hover:bg-secondary/20 group transition-colors">
                              <td className="px-3 py-2 text-muted-foreground/40">{idx + 1}</td>
                              <td className="px-3 py-2 tracking-wider">{formatCardNumber(card.number, card.brand)}</td>
                              <td className="px-3 py-2">{card.expMonth}/{card.expYear}</td>
                              <td className="px-3 py-2">{card.cvv}</td>
                              <td className="px-3 py-2 text-muted-foreground uppercase text-[11px]">{card.name}</td>
                              <td className="px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <CopyButton text={cardLine(card)} successMsg="Copied!" />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <p className="text-xs text-muted-foreground text-center mt-8 flex items-center justify-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5" />
          History is stored only in your browser's localStorage — clearing browser data will erase it
        </p>
      </div>
    </div>
  );
}
