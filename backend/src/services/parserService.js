import XLSX from "xlsx";

export function parseWorkbook(buffer) {
  const workbook = XLSX.read(buffer, { type: "buffer", cellDates: true });
  const rows = [];

  workbook.SheetNames.forEach((sheetName) => {
    const ws = workbook.Sheets[sheetName];
    const jsonRows = XLSX.utils.sheet_to_json(ws, { defval: null, raw: false });
    rows.push(...jsonRows.map((row) => ({ ...row, __sheet: sheetName })));
  });

  return rows;
}
