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

const PrepListPDF: React.FC<PrepListPDFProps> = ({
  items,
  prepStartTime,
  prepEndTime,
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

export default PrepListPDF;
