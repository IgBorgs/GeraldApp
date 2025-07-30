import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChefHat, Clipboard, AlertCircle } from "lucide-react";
import Settings from "./Settings";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  pdf,
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import { usePrepList } from "./PrepListContext"; 
import PrepListPDF from "./PrepListPDF";
import { Pen, Trash2 } from "lucide-react";





interface DashboardProps {
  userName?: string;
}

const styles = StyleSheet.create({
  page: { padding: 24 },
  header: {
    fontSize: 20,
    marginBottom: 10,
    textAlign: "center",
    fontWeight: "bold",
  },
  tableHeader: {
    flexDirection: "row",
    borderBottom: 1,
    paddingBottom: 5,
    marginTop: 10,
  },
  tableRow: { flexDirection: "row", paddingVertical: 4 },
  cell: { flex: 1, fontSize: 10 },
  summary: { marginTop: 20, fontSize: 12 },
});



const Dashboard = ({ userName = "Chef" }: DashboardProps) => {
  const {
    prepList,
    isLoading,
    prepStartTime,
    prepEndTime,
    setPrepStartTime,
    setPrepEndTime,
  } = usePrepList();
  
  console.log("📦 prepList from context:", prepList);

  
  const [prepStartedAt, setPrepStartedAt] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState("00:00:00");
  const [showDialog, setShowDialog] = useState(false);
  const [summaryData, setSummaryData] = useState({
    totalItemsNeeded: 0,
    priorityA: 0,
    priorityB: 0,
    priorityC: 0,
    lastUpdated: "",
  });

  const [notes, setNotes] = useState<string[]>(() => {
    const today = new Date().toISOString().split("T")[0];
    const stored = localStorage.getItem(`kitchen_notes_${today}`);
    return stored ? JSON.parse(stored) : [];
  });
  
  const [newNote, setNewNote] = useState("");
  



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
  

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (prepStartedAt) {
      timer = setInterval(() => {
        const now = new Date();
        const diff = now.getTime() - prepStartedAt.getTime();
        const hours = String(Math.floor(diff / 3600000)).padStart(2, "0");
        const minutes = String(Math.floor((diff % 3600000) / 60000)).padStart(2, "0");
        const seconds = String(Math.floor((diff % 60000) / 1000)).padStart(2, "0");
        setElapsedTime(`${hours}:${minutes}:${seconds}`);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [prepStartedAt]);


  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    localStorage.setItem(`kitchen_notes_${today}`, JSON.stringify(notes));
  }, [notes]);
  


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
        prepEndTime={prepEndTime}
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
          {prepStartedAt && (
            <div className="text-sm text-muted-foreground mt-2">
              Prep started at: <strong>{prepStartedAt.toLocaleTimeString()}</strong> • Elapsed: <strong>{elapsedTime}</strong>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Settings />
          <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
            <Button
              size="sm"
              onClick={() => {
                if (!prepStartedAt) {
                  const now = new Date();
                  setPrepStartedAt(now);
                  setPrepStartTime(now);
                  setPrepEndTime(null);
                } else {
                  setShowDialog(true);
                }
              }}
            >
              <ChefHat className="h-4 w-4 mr-2" />
              {prepStartedAt ? "End Prep" : "Start Prep"}
            </Button>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>End prep session?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will reset the timer and clear your prep tracking.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    const now = new Date();
                    setPrepStartedAt(null);
                    setElapsedTime("00:00:00");
                    setShowDialog(false);
                    setPrepEndTime(now);
                  }}
                >
                  Confirm
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="w-full space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {["Total Items Needed", "Priority A", "Priority B", "Priority C"].map((title, idx) => (
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
          ))}
        </div>

        {/* Quick Actions as full width row */}
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Button
                  onClick={() => (window.location.href = "/inventory")}
                  className="h-24 flex flex-col items-center justify-center gap-2"
                >
                  <Clipboard className="h-6 w-6" />
                  Input Today's Inventory
                </Button>
                <Button
                  onClick={() => (window.location.href = "/prep")}
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

          {/* Kitchen Notes separate card underneath */}
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
              onClick={() => setNotes((prev) => prev.filter((_, i) => i !== idx))}
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








