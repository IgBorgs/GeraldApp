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
import { usePrepList } from "./PrepListContext"; // ✅ NEW

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

const PrepListPDF = ({
  items,
  prepStartTime,
  prepEndTime,
}: {
  items: any[];
  prepStartTime: Date | null;
  prepEndTime: Date | null;
}) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.header}>Gerald Daily Prep List</Text>
      {prepStartTime && (
        <Text style={{ fontSize: 12, marginBottom: 4 }}>
          Prep Started: {prepStartTime.toLocaleTimeString()}
        </Text>
      )}
      {prepEndTime && (
        <Text style={{ fontSize: 12, marginBottom: 10 }}>
          Prep Ended: {prepEndTime.toLocaleTimeString()}
        </Text>
      )}
      <View style={styles.tableHeader}>
        <Text style={styles.cell}>Item</Text>
        <Text style={styles.cell}>Qty</Text>
        <Text style={styles.cell}>Unit</Text>
        <Text style={styles.cell}>Priority</Text>
        <Text style={styles.cell}>Time</Text>
        <Text style={styles.cell}>Done</Text>
      </View>
      {items.map((item, i) => (
        <View key={i} style={styles.tableRow}>
          <Text style={styles.cell}>{item.name}</Text>
          <Text style={styles.cell}>{item.quantity}</Text>
          <Text style={styles.cell}>{item.unit}</Text>
          <Text style={styles.cell}>{item.priority}</Text>
          <Text style={styles.cell}>{item.estimatedTime || "—"}</Text>
          <Text style={styles.cell}>{item.completed ? "✓" : "✗"}</Text>
        </View>
      ))}
      <Text style={styles.summary}>Total items: {items.length}</Text>
      <Text style={styles.summary}>
        Completed: {items.filter((i) => i.completed).length}
      </Text>
      <Text style={styles.summary}>
        Estimated Time: {items.reduce((acc, i) => acc + (i.estimatedTime || 0), 0)} mins
      </Text>
    </Page>
  </Document>
);

const Dashboard = ({ userName = "Chef" }: DashboardProps) => {
  const { prepList, isLoading } = usePrepList(); // ✅ NEW
  console.log("📦 prepList from context:", prepList);

  const [prepStartedAt, setPrepStartedAt] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState("00:00:00");
  const [showDialog, setShowDialog] = useState(false);
  const [prepStartTime, setPrepStartTime] = useState<Date | null>(null);
  const [prepEndTime, setPrepEndTime] = useState<Date | null>(null);
  const [summaryData, setSummaryData] = useState({
    totalItemsNeeded: 0,
    priorityA: 0,
    priorityB: 0,
    priorityC: 0,
    lastUpdated: "",
  });

  useEffect(() => {
    if (!isLoading && prepList.length > 0) {
      const neededItems = prepList.filter((i) => i.needed_quantity > 0);
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2">
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
                onClick={() => (window.location.href = "/preplist")}
                className="h-24 flex flex-col items-center justify-center gap-2"
                variant="secondary"
              >
                <ChefHat className="h-6 w-6" />
                View Prep Lists
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

          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-500" />
                <span className="text-sm">Live data from app state</span>
              </div>
              <div className="text-sm text-muted-foreground">
                Last updated: {summaryData.lastUpdated}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => {
                  if (!isLoading) {
                    const incompleteItems = prepList.filter((item) => item.needed_quantity > 0 && !item.completed);
                    setSummaryData({
                      totalItemsNeeded: incompleteItems.length,
                      priorityA: incompleteItems.filter((i) => i.priority === "A").length,
                      priorityB: incompleteItems.filter((i) => i.priority === "B").length,
                      priorityC: incompleteItems.filter((i) => i.priority === "C").length,
                      lastUpdated: new Date().toLocaleString(),
                    });

                  }
                }}
              >
                Refresh Data
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;








