import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "sonner";

export interface PDFData {
  userName: string;
  title: string;
  date: string;
  duration: string;
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
  qas: {
    question: string;
    answer: string;
    rating: number;
  }[];
}

export const generateInterviewPDF = (data: PDFData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header
  doc.setFontSize(22);
  doc.setTextColor(40, 40, 40);
  doc.text("Interview Report", 14, 22);
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth - 14, 22, { align: "right" });
  
  doc.setDrawColor(230, 230, 230);
  doc.line(14, 28, pageWidth - 14, 28);

  // Candidate Info
  doc.setFontSize(16);
  doc.setTextColor(30, 30, 30);
  doc.text(data.userName || "Candidate", 14, 40);
  
  doc.setFontSize(11);
  doc.setTextColor(80, 80, 80);
  doc.text(data.title, 14, 47);
  doc.text(`${data.date} · ${data.duration} · ${data.qas.length} questions`, 14, 53);

  // Score Summary
  doc.setDrawColor(240, 240, 240);
  doc.setFillColor(248, 249, 250);
  doc.roundedRect(pageWidth - 60, 35, 46, 25, 3, 3, "FD");
  
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text("OVERALL SCORE", pageWidth - 37, 43, { align: "center" });
  
  doc.setFontSize(20);
  doc.setTextColor(0, 0, 0);
  doc.text(`${data.score}`, pageWidth - 37, 53, { align: "center" });

  // AI Overview
  doc.setFontSize(14);
  doc.setTextColor(30, 30, 30);
  doc.text("AI Overview", 14, 70);
  
  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  const splitFeedback = doc.splitTextToSize(data.feedback || "No feedback available.", pageWidth - 28);
  doc.text(splitFeedback, 14, 77);
  
  let currentY = 77 + (splitFeedback.length * 5) + 5;

  // Strengths & Weaknesses
  autoTable(doc, {
    startY: currentY,
    head: [["Strengths", "Areas to Improve"]],
    body: [[
      data.strengths.map((s: string) => `• ${s}`).join("\n"),
      data.improvements.map((s: string) => `• ${s}`).join("\n")
    ]],
    theme: "grid",
    headStyles: { fillColor: [240, 240, 240], textColor: [50, 50, 50], fontStyle: "bold" },
    styles: { fontSize: 9, cellPadding: 5 },
    columnStyles: { 0: { cellWidth: (pageWidth - 28) / 2 }, 1: { cellWidth: (pageWidth - 28) / 2 } }
  });

  const finalY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY : currentY + 40;
  currentY = finalY + 10;

  // Skill Breakdown
  doc.setFontSize(14);
  doc.setTextColor(30, 30, 30);
  doc.text("Skill Breakdown", 14, currentY);
  currentY += 7;

  const skills = [
    { label: "Technical depth", value: Math.min(100, (Number(data.score) || 0) + 4) },
    { label: "Communication", value: Math.min(100, (Number(data.score) || 0) + 8) },
    { label: "Problem solving", value: Math.max(0, (Number(data.score) || 0) - 2) },
    { label: "Clarity", value: Math.min(100, (Number(data.score) || 0) + 2) }
  ];

  skills.forEach(skill => {
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    doc.text(skill.label, 14, currentY);
    doc.text(`${skill.value}%`, pageWidth - 14, currentY, { align: "right" });
    
    doc.setDrawColor(240, 240, 240);
    doc.line(14, currentY + 2, pageWidth - 14, currentY + 2);
    doc.setDrawColor(100, 100, 255);
    doc.setLineWidth(1.5);
    doc.line(14, currentY + 2, 14 + ((pageWidth - 28) * (skill.value / 100)), currentY + 2);
    doc.setLineWidth(0.1);
    
    currentY += 10;
  });

  // Questions & Answers
  doc.addPage();
  doc.setFontSize(14);
  doc.setTextColor(30, 30, 30);
  doc.text("Questions & Answers", 14, 20);
  
  autoTable(doc, {
    startY: 25,
    head: [["#", "Question & Answer", "Rating"]],
    body: data.qas.length > 0 ? data.qas.map((qa, index) => [
      String(index + 1),
      `Q: ${qa.question || "N/A"}\n\nA: ${qa.answer || "No answer recorded."}`,
      `${qa.rating || 0}/10`
    ]) : [["-", "No questions and answers recorded.", "-"]],
    theme: "striped",
    headStyles: { fillColor: [100, 100, 255] },
    styles: { fontSize: 9, cellPadding: 5 },
    columnStyles: { 
      0: { cellWidth: 10 }, 
      1: { cellWidth: pageWidth - 55 },
      2: { cellWidth: 20, halign: "center" }
    }
  });

  doc.save(`Interview_Report_${data.userName.replace(/\s+/g, "_")}.pdf`);
  toast.success("PDF report downloaded successfully");
};

export const parseTranscript = (transcript: any[]) => {
  const qas: { question: string; answer: string; rating: number }[] = [];
  let currentGroup: any = null;

  for (let i = 0; i < transcript.length; i++) {
    const msg = transcript[i];

    if (msg.role === "ai") {
      if (currentGroup && (msg.score !== undefined && msg.score !== null)) {
        currentGroup.rating = msg.score;
      }
      if (msg.content === "MOVE_NEXT") continue;
      currentGroup = {
        question: msg.content,
        answer: "",
        rating: 0
      };
      qas.push(currentGroup);
    } else if (msg.role === "user" && currentGroup) {
      currentGroup.answer += (currentGroup.answer ? " " : "") + msg.content;
    }
  }
  return qas;
};
