import { useEffect, useState, useRef } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function Reports() {
  const [summary, setSummary] = useState({
    totalWeight: 0,
    totalValue: 0,
    totalLogs: 0,
  });

  const [topSchools, setTopSchools] = useState([]);
  const [topReps, setTopReps] = useState([]);

  const reportRef = useRef();

  useEffect(() => {
    const loadReports = async () => {
      try {
        const schoolSnap = await getDocs(collection(db, "schools"));
        const repSnap = await getDocs(collection(db, "representatives"));
        const logsSnap = await getDocs(collection(db, "pendingLogs"));

        const schools = schoolSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        const reps = repSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        const logs = logsSnap.docs.map(d => d.data());

        // ✅ Approved logs only
        const approvedLogs = logs.filter(l => l.status === "approved");

        // 📊 Summary
        const totalWeight = approvedLogs.reduce(
          (sum, l) => sum + (l.totalWeight || 0),
          0
        );

        const totalValue = approvedLogs.reduce(
          (sum, l) => sum + (l.totalValue || 0),
          0
        );

        setSummary({
          totalWeight,
          totalValue,
          totalLogs: approvedLogs.length,
        });

        // 🏫 School ranking
        const schoolStats = schools.map(s => {
          const sLogs = approvedLogs.filter(l => l.schoolId === s.id);

          const total = sLogs.reduce(
            (sum, l) => sum + (l.totalWeight || 0),
            0
          );

          return { name: s.schoolName, total };
        });

        schoolStats.sort((a, b) => b.total - a.total);

        // 👤 Rep ranking
        const repStats = reps.map(r => {
          const rLogs = approvedLogs.filter(l => l.repId === r.id);

          const total = rLogs.reduce(
            (sum, l) => sum + (l.totalWeight || 0),
            0
          );

          return { name: r.fullName, total };
        });

        repStats.sort((a, b) => b.total - a.total);

        setTopSchools(schoolStats.slice(0, 5));
        setTopReps(repStats.slice(0, 5));
      } catch (error) {
        console.error("Error loading reports:", error);
      }
    };

    loadReports();
  }, []);

  // 📄 PDF Export
  const downloadPDF = async () => {
    const element = reportRef.current;

    const canvas = await html2canvas(element);
    const data = canvas.toDataURL("image/png");

    const pdf = new jsPDF();
    const imgProps = pdf.getImageProperties(data);

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(data, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save("w2wa-report.pdf");
  };

  return (
    <div style={{ padding: 20 }}>
      <button onClick={downloadPDF} style={button}>
        Download PDF
      </button>

      <div ref={reportRef}>
        <h2>📊 Reports Dashboard</h2>

        {/* SUMMARY */}
        <div style={summaryContainer}>
          <div style={card}>
            <h3>Total Waste</h3>
            <h2>{summary.totalWeight} kg</h2>
          </div>

          <div style={card}>
            <h3>Total Value</h3>
            <h2>₦{summary.totalValue.toLocaleString()}</h2>
          </div>

          <div style={card}>
            <h3>Approved Logs</h3>
            <h2>{summary.totalLogs}</h2>
          </div>
        </div>

        {/* TOP SCHOOLS */}
        <h3>🏫 Top Schools</h3>
        {topSchools.map((s, i) => (
          <div key={i} style={listItem}>
            #{i + 1} - {s.name} ({s.total} kg)
          </div>
        ))}

        {/* TOP REPS */}
        <h3 style={{ marginTop: 20 }}>👤 Top Reps</h3>
        {topReps.map((r, i) => (
          <div key={i} style={listItem}>
            #{i + 1} - {r.name} ({r.total} kg)
          </div>
        ))}
      </div>
    </div>
  );
}

// 🎨 Styles
const button = {
  marginBottom: "15px",
  padding: "10px",
  backgroundColor: "black",
  color: "white",
  border: "none",
  cursor: "pointer",
};

const summaryContainer = {
  display: "flex",
  gap: "20px",
  marginBottom: "20px",
  flexWrap: "wrap",
};

const card = {
  background: "#f4f6f8",
  padding: "15px",
  borderRadius: "10px",
  minWidth: "150px",
};

const listItem = {
  padding: "8px",
  borderBottom: "1px solid #ccc",
};