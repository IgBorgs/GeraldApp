// src/components/PrepListPDF.tsx
import React from "react";
import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 24, fontFamily: "Helvetica" },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    borderBottom: "2 solid #4b2e2b",
    paddingBottom: 6,
  },
  logo: { width: 40, height: 40 },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#4b2e2b" },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    fontSize: 11,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#fdf6ec",
    borderBottom: "1 solid #ccc",
    padding: 6,
    fontWeight: "bold",
    fontSize: 11,
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "0.5 solid #eee",
    padding: 6,
    fontSize: 10,
  },
  cell: { flex: 1 },
  summaryBox: {
    marginTop: 16,
    padding: 10,
    backgroundColor: "#fdf6ec",
    border: "1 solid #ccc",
    borderRadius: 4,
  },
  summaryTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 6,
    color: "#4b2e2b",
  },
  summaryText: {
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 2,
  },
  note: {
    fontSize: 9,
    marginTop: 8,
    fontStyle: "italic",
    color: "#666666",
    textAlign: "center",
  },
});

const getPriorityColor = (priority: string) => {
  if (priority === "A") return "#d9534f"; // red
  if (priority === "B") return "#f0ad4e"; // orange
  if (priority === "C") return "#5cb85c"; // green
  return "#000000";
};

interface PrepListPDFProps {
  items: {
    name: string;
    quantity: string | number;
    unit: string;
    priority: string;
    estimatedTime: number;
    completed: boolean;
  }[];
  prepStartTime: Date | null;
  prepEndTime: Date | null;
}

function calculateDuration(start: Date, end: Date) {
  const diffMs = end.getTime() - start.getTime();
  const hours = String(Math.floor(diffMs / 3600000)).padStart(2, "0");
  const minutes = String(Math.floor((diffMs % 3600000) / 60000)).padStart(2, "0");
  const seconds = String(Math.floor((diffMs % 60000) / 1000)).padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
}

function formatDate(date: Date) {
  return date.toLocaleDateString("en-GB");
}
function formatTime(date: Date) {
  return date.toLocaleTimeString("en-GB");
}

const PrepListPDF: React.FC<PrepListPDFProps> = ({ items, prepStartTime, prepEndTime }) => {
  const sortedItems = [...items].sort((a, b) => {
    const priorityOrder: Record<string, number> = { A: 0, B: 1, C: 2 };
    const aPriority = priorityOrder[a.priority] ?? 3;
    const bPriority = priorityOrder[b.priority] ?? 3;
    if (aPriority !== bPriority) return aPriority - bPriority;
    return a.name.localeCompare(b.name);
  });

  const priorities = ["A", "B", "C"];
  const breakdown = priorities.map((p) => {
    const itemsInPriority = sortedItems.filter((i) => i.priority === p);
    const done = itemsInPriority.filter((i) => i.completed).length;
    const needsPrep = itemsInPriority.length - done;
    return { p, done, needsPrep };
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.headerRow}>
          <Image src="/HatWithMustache.png" style={styles.logo} />
          <Text style={styles.headerTitle}>Gerald Daily Prep List</Text>
        </View>

        {prepStartTime && (
          <View style={styles.infoRow}>
            <Text>Date: {formatDate(prepStartTime)}</Text>
            <Text>
              Started: {formatTime(prepStartTime)} | Ended:{" "}
              {prepEndTime ? formatTime(prepEndTime) : "--:--:--"}
            </Text>
            {prepEndTime && <Text>Duration: {calculateDuration(prepStartTime, prepEndTime)}</Text>}
          </View>
        )}

        {/* Table Header */}
        <View style={styles.tableHeader}>
          <Text style={styles.cell}>Item</Text>
          <Text style={styles.cell}>Qty</Text>
          <Text style={styles.cell}>Unit</Text>
          <Text style={styles.cell}>Priority</Text>
          <Text style={styles.cell}>Time</Text>
          <Text style={styles.cell}>Status</Text>
        </View>

        {/* Rows with alternating background */}
        {sortedItems.map((item, i) => (
          <View
            key={i}
            style={[
              styles.tableRow,
              { backgroundColor: i % 2 === 0 ? "#ffffff" : "#fdf6ec" },
            ]}
          >
            <Text style={styles.cell}>{item.name}</Text>
            <Text style={styles.cell}>{item.quantity}</Text>
            <Text style={styles.cell}>{item.unit}</Text>
            <Text style={[styles.cell, { color: getPriorityColor(item.priority) }]}>
              {item.priority}
            </Text>
            <Text style={styles.cell}>{item.estimatedTime || "—"}</Text>
            <Text style={styles.cell}>{item.completed ? "Done" : "Needs prep"}</Text>
          </View>
        ))}

        {/* Footer Summary Card */}
        <View style={styles.summaryBox}>
          <Text style={styles.summaryTitle}>Summary</Text>
          <Text style={styles.summaryText}>Total items: {sortedItems.length}</Text>
          <Text style={styles.summaryText}>
            Completed: {sortedItems.filter((i) => i.completed).length}
          </Text>
          {breakdown.map((b) => (
            <Text key={b.p} style={styles.summaryText}>
              Priority {b.p} — Done: {b.done} / Needs prep: {b.needsPrep}
            </Text>
          ))}
          <Text style={styles.summaryText}>
            Estimated Time: {sortedItems.reduce((acc, i) => acc + (i.estimatedTime || 0), 0)} mins
          </Text>
        </View>

        <Text style={styles.note}>
          * Actual prep time may vary, since some tasks can be done simultaneously.
        </Text>
      </Page>
    </Document>
  );
};

export default PrepListPDF;







