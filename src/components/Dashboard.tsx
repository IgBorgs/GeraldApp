import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChefHat, Clipboard, Pen, Trash2, Clock } from "lucide-react";
import Settings from "./Settings";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { pdf } from "@react-pdf/renderer";
import { usePrepList } from "./PrepListContext";
import PrepListPDF from "./PrepListPDF";
import { useNavigate } from "react-router-dom";

interface DashboardProps {
  userName?: string;
}

const TIMER_STORAGE_KEY = "gerald_prep_timer_v1";

function sameYMD(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatDuration(ms: number) {
  const h = String(Math.max(0, Math.floor(ms / 3600000))).padStart(2, "0");
  const m = String(Math.max(0, Math.floor((ms % 3600000) / 60000))).padStart(2, "0");
  const s = String(Math.max(0, Math.floor((ms % 60000) / 1000))).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

const Dashboard = ({ userName = "Chef" }: DashboardProps) => {
  const {
    prepList,
    isLoading,
    prepStartTime,
    prepEndTime,
    setPrepStartTime,
    setPrepEndTime,
  } = usePrepList();

  const [elapsedTime, setElapsedTime] = useState("00:00:00");
  const [showDialog, setShowDialog] = useState(false);
  const [summaryData, setSummaryData] = useState({
    totalItemsNeeded: 0,
    priorityA: 0,
    priorityB: 0,
    priorityC: 0,
    lastUpdated: "",
  });

  // Notes (by day)
  const [notes, setNotes] = useState<string[]>(() => {
    const today = new Date().toISOString().split("T")[0];
    const stored = localStorage.getItem(`kitchen_notes_${today}`);
    return stored ? JSON.parse(stored) : [];
  });
  const [newNote, setNewNote] = useState("");

  const navigate = useNavigate();

  // ----- Summary tiles -----
  useEffect(() => {
    if (!isLoading && prepList.length > 0) {
      const neededItems = prepList;
      setSummaryData({
        totalItemsNeeded: neededItems.length,
        priorityA: neededItems.filter((i) => i.priority === "A").length,
        priorityB: neededItems.filter((i) => i.priority === "B").length,
        priorityC: neededItems.filter((i) => i.priority === "C").length,
        lastUpdated: new Date().toLocaleString(),
      });
    }
  }, [prepList, isLoading]);

  // ----- Persist notes -----
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    localStorage.setItem(`kitchen_notes_${today}`, JSON.stringify(notes));
  }, [notes]);

  // ----- One-time hydration (and clear old days) -----
  const hydratedRef = useRef(false);
  useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;

    try {
      const raw = localStorage.getItem(TIMER_STORAGE_KEY);
      if (!raw) return;

      const parsed: { date: string; start: string | null; end: string | null } =
        JSON.parse(raw);

      const todayStr = new Date().toISOString().split("T")[0];
      if (parsed.date !== todayStr) {
        // new day -> clear old persisted state
        localStorage.removeItem(TIMER_STORAGE_KEY);
        setPrepStartTime(null);
        setPrepEndTime(null);
        return;
      }

      if (!prepStartTime && parsed.start) {
        setPrepStartTime(new Date(parsed.start));
      }
      if (
        !prepEndTime &&
        parsed.end &&
        parsed.start &&
        new Date(parsed.end) > new Date(parsed.start)
      ) {
        setPrepEndTime(new Date(parsed.end));
      }
    } catch {
      // ignore broken JSON
    }
  }, [prepStartTime, prepEndTime, setPrepStartTime, setPrepEndTime]);

  // ----- Persist timer state -----
  useEffect(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    const payload = {
      date: todayStr,
      start: prepStartTime ? prepStartTime.toISOString() : null,
      end:
        prepStartTime && prepEndTime && prepEndTime > prepStartTime
          ? prepEndTime.toISOString()
          : null,
    };
    localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(payload));
  }, [prepStartTime, prepEndTime]);

  // ----- Live elapsed time -----
  useEffect(() => {
    let id: number | null = null;

    const tick = () => {
      if (!prepStartTime) {
        setElapsedTime("00:00:00");
        return;
      }
      const effectiveEnd =
        prepStartTime && prepEndTime && prepEndTime > prepStartTime
          ? prepEndTime
          : null;

      const end = effectiveEnd ?? new Date();
      const diff = Math.max(0, end.getTime() - prepStartTime.getTime());
      setElapsedTime(formatDuration(diff));
    };

    if (prepStartTime && (!prepEndTime || prepEndTime <= prepStartTime)) {
      tick();
      id = window.setInterval(tick, 1000);
    } else {
      tick();
    }

    return () => {
      if (id) window.clearInterval(id);
    };
  }, [prepStartTime, prepEndTime]);

  // ----- Labels & flags -----
  const isRunning = Boolean(
    prepStartTime && (!prepEndTime || prepEndTime <= prepStartTime)
  );

  const hasFinishedToday = useMemo(() => {
    if (!prepStartTime || !prepEndTime) return false;
    return prepEndTime > prepStartTime && sameYMD(prepStartTime, new Date());
  }, [prepStartTime, prepEndTime]);

  const startedLabel = useMemo(() => {
    if (!prepStartTime) return null;
    try {
      return prepStartTime.toLocaleTimeString();
    } catch {
      return null;
    }
  }, [prepStartTime]);

  const endedLabel = useMemo(() => {
    if (!hasFinishedToday) return null;
    try {
      return prepEndTime!.toLocaleTimeString();
    } catch {
      return null;
    }
  }, [hasFinishedToday, prepEndTime]);

  const finishedDuration = useMemo(() => {
    if (!hasFinishedToday) return null;
    return formatDuration(prepEndTime!.getTime() - prepStartTime!.getTime());
  }, [hasFinishedToday, prepStartTime, prepEndTime]);

  // ----- Actions -----
  const onStart = () => {
    const now = new Date();
    setPrepStartTime(now);
    setPrepEndTime(null); // clear any leftover end
    const todayStr = new Date().toISOString().split("T")[0];
    localStorage.setItem(
      TIMER_STORAGE_KEY,
      JSON.stringify({ date: todayStr, start: now.toISOString(), end: null })
    );
  };

  const onConfirmEnd = () => {
    const now = new Date();
    if (prepStartTime && now > prepStartTime) {
      setPrepEndTime(now);
    } else {
      setPrepEndTime(null);
      setPrepStartTime(null);
    }
    setShowDialog(false);
  };

  const clearLastSession = () => {
    setPrepStartTime(null);
    setPrepEndTime(null);
    localStorage.removeItem(TIMER_STORAGE_KEY);
  };

  // ----- PDF -----
  const handleGeneratePDF = async () => {
    const today = new Date().toISOString().split("T")[0];
    const formattedItems = prepList.map((item) => ({
      ...item,
      quantity: item.quantity || 0,
      estimatedTime: item.estimated_time || 15,
    }));

    const blob = await pdf(
      <PrepListPDF
        items={formattedItems}
        prepStartTime={prepStartTime}
        prepEndTime={hasFinishedToday ? prepEndTime : null}
      />
    ).toBlob();

    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = `PrepList-${today}.pdf`;
    link.click();
  };

  return (
    <div className="w-full h-full min-h-screen bg-background p-4 md:p-6 lg:p-8">
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Prep List Generator</h1>
          <p className="text-muted-foreground">Welcome back, {userName}!</p>

          {/* ONLY show the running timer in the header */}
          {isRunning && (
            <div className="text-sm text-muted-foreground mt-2">
              Prep started at: <strong>{startedLabel ?? "—"}</strong>
              {" • "}
              Elapsed: <strong>{elapsedTime}</strong>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Settings />
          <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
            <Button
              size="sm"
              onClick={() => {
                if (!isRunning) onStart();
                else setShowDialog(true);
              }}
            >
              <ChefHat className="h-4 w-4 mr-2" />
              {isRunning ? "End Prep" : "Start Prep"}
            </Button>

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>End prep session?</AlertDialogTitle>
                <AlertDialogDescription>
                  This stops the timer and saves the end time for today&apos;s report.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={onConfirmEnd}>Confirm</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="w-full space-y-6">
        {/* Last prep (today) — shows ONLY when not running */}
        {!isRunning && hasFinishedToday && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Last prep (today)
              </CardTitle>
              <CardDescription>
                Started at <strong>{startedLabel}</strong> • Ended at{" "}
                <strong>{endedLabel}</strong> • Duration{" "}
                <strong>{finishedDuration}</strong>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" size="sm" onClick={clearLastSession}>
                Clear last prep
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Summary tiles */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {["Total Items Needed", "Priority A", "Priority B", "Priority C"].map(
            (title, idx) => (
              <Card key={title}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">{title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    className={`text-3xl font-bold ${
                      idx === 1
                        ? "text-red-500"
                        : idx === 2
                        ? "text-amber-500"
                        : idx === 3
                        ? "text-green-500"
                        : ""
                    }`}
                  >
                    {Object.values(summaryData)[idx]}
                  </div>
                </CardContent>
              </Card>
            )
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Button
                onClick={() => navigate("/inventory")}
                className="h-24 flex flex-col items-center justify-center gap-2"
              >
                <Clipboard className="h-6 w-6" />
                Input Today&apos;s Inventory
              </Button>

              <Button
                onClick={() => navigate("/prep")}
                className="h-24 flex flex-col items-center justify-center gap-2"
                variant="secondary"
              >
                <ChefHat className="h-6 w-6" />
                View Prep List
              </Button>

              <Button
                onClick={handleGeneratePDF}
                className="h-24 flex flex-col items-center justify-center gap-2"
                variant="outline"
              >
                <Clipboard className="h-6 w-6" />
                Prep List Document
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Kitchen Notes */}
        <div className="grid grid-cols-1 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <Pen className="h-5 w-5" />
                Kitchen Notes
              </CardTitle>
              <CardDescription>
                Write down any prep notes, special instructions, or reminders for today.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Write a note and press Add..."
                  className="flex-1 border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <Button
                  onClick={() => {
                    if (newNote.trim()) {
                      setNotes((prev) => [...prev, newNote.trim()]);
                      setNewNote("");
                    }
                  }}
                  className="bg-green-600 text-white hover:bg-green-700"
                >
                  Add
                </Button>
              </div>

              <div className="grid gap-3">
                {notes.map((note, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-md bg-muted text-sm text-muted-foreground flex justify-between items-start border"
                  >
                    <span className="text-primary">{note}</span>
                    <button
                      onClick={() =>
                        setNotes((prev) => prev.filter((_, i) => i !== idx))
                      }
                      className="ml-4 text-red-500 hover:text-red-700"
                      title="Delete note"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                {notes.length === 0 && (
                  <p className="text-muted-foreground text-sm">No notes yet.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;










