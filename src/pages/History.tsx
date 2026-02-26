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
import { Clock, Trash2, Download, FileText, ChevronDown, ChevronRight, AlertTriangle, RefreshCw } from "lucide-react";

export default function HistoryPage() {
  const [batches, setBatches] = useState<HistoryBatch[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    setBatches(loadHistory());
  }, []);

  const handleDelete = (id: string) => {
    deleteHistoryBatch(id);
    setBatches((p) => p.filter((b) => b.id !== id));
    toast({ title: "Batch deleted", duration: 1500 });
  };

  const handleClearAll = () => {
    clearHistory();
    setBatches([]);
    toast({ title: "History cleared", duration: 1500 });
  };

  const toggleExpand = (id: string) => setExpanded((p) => (p === id ? null : id));

  const cardLine = (c: GeneratedCard) =>
    `${c.number} | ${c.expMonth}/${c.expYear} | ${c.cvv} | ${c.name} | ${BRAND_CONFIGS[c.brand].label}`;

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Clock className="w-6 h-6 text-primary" />
              History
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Last {batches.length} of 50 batches stored locally in your browser.
            </p>
          </div>
          {batches.length > 0 && (
            <button
              onClick={handleClearAll}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-destructive border border-destructive/30 hover:bg-destructive/10 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear All
            </button>
          )}
        </div>

        {batches.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center bg-card rounded-xl border border-border">
            <Clock className="w-12 h-12 text-muted-foreground/30 mb-4" />
            <p className="font-medium text-muted-foreground">No history yet</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Generated batches will appear here automatically</p>
          </div>
        ) : (
          <div className="space-y-3">
            {batches.map((batch) => {
              const isOpen = expanded === batch.id;
              const date = new Date(batch.timestamp);
              const allText = batch.cards.map(cardLine).join("\n");
              return (
                <div key={batch.id} className="bg-card rounded-xl border border-border overflow-hidden">
                  {/* Batch header */}
                  <div className="flex items-center justify-between px-4 py-3">
                    <button
                      onClick={() => toggleExpand(batch.id)}
                      className="flex items-center gap-3 flex-1 text-left"
                    >
                      {isOpen ? (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <BrandBadge brand={batch.brand} size="md" />
                          <span className="font-semibold text-sm">{batch.quantity} cards</span>
                          {batch.bin && (
                            <span className="font-mono text-xs text-muted-foreground">BIN: {batch.bin}</span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {date.toLocaleDateString()} at {date.toLocaleTimeString()}
                        </p>
                      </div>
                    </button>
                    <div className="flex items-center gap-2">
                      <CopyButton text={allText} variant="outline" label="Copy" successMsg="Batch copied!" />
                      <button
                        onClick={() => { exportCsv(batch.cards); toast({ title: "CSV downloaded", duration: 2000 }); }}
                        className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium bg-secondary border border-border hover:border-primary/40 transition-all text-muted-foreground hover:text-foreground"
                      >
                        <Download className="w-3 h-3" /> CSV
                      </button>
                      <button
                        onClick={() => { exportTxt(batch.cards); toast({ title: "TXT downloaded", duration: 2000 }); }}
                        className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium bg-secondary border border-border hover:border-primary/40 transition-all text-muted-foreground hover:text-foreground"
                      >
                        <FileText className="w-3 h-3" /> TXT
                      </button>
                      <button
                        onClick={() => handleDelete(batch.id)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Expanded cards */}
                  {isOpen && (
                    <div className="border-t border-border overflow-auto max-h-72 scrollbar-thin">
                      <table className="w-full text-xs font-mono">
                        <thead className="bg-secondary/30 sticky top-0">
                          <tr>
                            <th className="text-left px-3 py-2 text-muted-foreground">#</th>
                            <th className="text-left px-3 py-2 text-muted-foreground">Number</th>
                            <th className="text-left px-3 py-2 text-muted-foreground">Exp</th>
                            <th className="text-left px-3 py-2 text-muted-foreground">CVV</th>
                            <th className="text-left px-3 py-2 text-muted-foreground">Name</th>
                            <th className="px-3 py-2"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {batch.cards.map((card, idx) => (
                            <tr key={card.id} className="border-t border-border/30 hover:bg-secondary/20 group">
                              <td className="px-3 py-1.5 text-muted-foreground/50">{idx + 1}</td>
                              <td className="px-3 py-1.5 tracking-wider">{card.number}</td>
                              <td className="px-3 py-1.5">{card.expMonth}/{card.expYear}</td>
                              <td className="px-3 py-1.5">{card.cvv}</td>
                              <td className="px-3 py-1.5 text-muted-foreground">{card.name}</td>
                              <td className="px-3 py-1.5 opacity-0 group-hover:opacity-100">
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

        <p className="text-xs text-muted-foreground text-center mt-6 flex items-center justify-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          History is stored in your browser's localStorage only. Clearing browser data will erase it.
        </p>
      </div>
    </div>
  );
}
