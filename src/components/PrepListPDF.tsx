// src/components/PrepListPDF.tsx
import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

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
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

function formatTime(date: Date) {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
}

const PrepListPDF: React.FC<PrepListPDFProps> = ({
  items,
  prepStartTime,
  prepEndTime,
}) => {
  // Sort A > B > C > others, then alphabetically
  const sortedItems = [...items].sort((a, b) => {
    const priorityOrder: Record<string, number> = { A: 0, B: 1, C: 2 };
    const aPriority = priorityOrder[a.priority] ?? 3;
    const bPriority = priorityOrder[b.priority] ?? 3;
    if (aPriority !== bPriority) return aPriority - bPriority;
    return a.name.localeCompare(b.name);
  });

  // ---- Priority breakdown ----
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
        <Text style={styles.header}>Gerald Daily Prep List</Text>

        {prepStartTime && (
          <>
            <Text style={{ fontSize: 12, marginBottom: 2 }}>
              • Prep Date: {formatDate(prepStartTime)}
            </Text>
            <Text style={{ fontSize: 12, marginBottom: 2 }}>
              • Started at: {formatTime(prepStartTime)}  -  Ended at:{" "}
              {prepEndTime ? formatTime(prepEndTime) : "--:--:--"}
            </Text>
            {prepEndTime && (
              <Text style={{ fontSize: 12, marginBottom: 10 }}>
                • Duration: {calculateDuration(prepStartTime, prepEndTime)}
              </Text>
            )}
          </>
        )}

        <View style={styles.tableHeader}>
          <Text style={styles.cell}>Item</Text>
          <Text style={styles.cell}>Qty</Text>
          <Text style={styles.cell}>Unit</Text>
          <Text style={styles.cell}>Priority</Text>
          <Text style={styles.cell}>Time</Text>
          <Text style={styles.cell}>Status</Text>
        </View>

        {sortedItems.map((item, i) => (
          <View key={i} style={styles.tableRow}>
            <Text style={styles.cell}>{item.name}</Text>
            <Text style={styles.cell}>{item.quantity}</Text>
            <Text style={styles.cell}>{item.unit}</Text>
            <Text style={styles.cell}>{item.priority}</Text>
            <Text style={styles.cell}>{item.estimatedTime || "—"}</Text>
            <Text style={styles.cell}>
              {item.completed ? "Done" : "Needs prep"}
            </Text>
          </View>
        ))}

        {/* ---- Footer summary ---- */}
        <Text style={styles.summary}>Total items: {sortedItems.length}</Text>
        <Text style={styles.summary}>
          Completed: {sortedItems.filter((i) => i.completed).length}
        </Text>
        {breakdown.map((b) => (
          <Text key={b.p} style={styles.summary}>
            Priority {b.p} — Done: {b.done} / Needs prep: {b.needsPrep}
          </Text>
        ))}
        <Text style={styles.summary}>
          Estimated Time:{" "}
          {sortedItems.reduce((acc, i) => acc + (i.estimatedTime || 0), 0)} mins
        </Text>
      </Page>
    </Document>
  );
};

export default PrepListPDF;


