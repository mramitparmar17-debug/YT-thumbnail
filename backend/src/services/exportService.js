import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";

export async function buildExcelSummary(summary) {
  const workbook = new ExcelJS.Workbook();
  const ws = workbook.addWorksheet("Summary");
  ws.columns = [
    { header: "Metric", key: "metric", width: 28 },
    { header: "Value", key: "value", width: 20 }
  ];

  Object.entries(summary).forEach(([metric, value]) => {
    if (typeof value !== "object") ws.addRow({ metric, value });
  });

  return workbook.xlsx.writeBuffer();
}

export function buildPdfSummary(summary) {
  return new Promise((resolve) => {
    const doc = new PDFDocument({ margin: 36 });
    const chunks = [];
    doc.on("data", (c) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));

    doc.fontSize(18).text("Business Dashboard Summary", { underline: true });
    doc.moveDown();

    Object.entries(summary).forEach(([k, v]) => {
      if (typeof v !== "object") doc.fontSize(12).text(`${k}: ${Number(v).toFixed(2)}`);
    });

    doc.end();
  });
}
