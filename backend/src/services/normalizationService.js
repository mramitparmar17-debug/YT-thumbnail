import { CHANNEL_ALIASES, REPORT_TYPES } from "../utils/constants.js";

const FIELD_SYNONYMS = {
  date: ["date", "order_date", "created_at", "day"],
  revenue: ["revenue", "sales", "amount", "total_revenue", "gmv"],
  orders: ["orders", "order_count", "transactions"],
  customerId: ["customer_id", "customer", "client_id", "email", "phone"],
  campaign: ["campaign", "campaign_name", "ad_name"],
  channel: ["channel", "source", "platform"],
  spend: ["spend", "cost", "ad_spend", "amount_spent"],
  leads: ["leads", "lead_count", "prospects"],
  newCustomers: ["new_customers", "new", "first_time_customers"],
  repeatCustomers: ["repeat_customers", "repeat", "returning_customers"],
  stageVisits: ["visits", "website_visits", "sessions"],
  stageLeads: ["qualified_leads", "mql", "sql"],
  stageSales: ["sales_count", "won_deals", "conversions"]
};

const parseNumber = (v) => {
  if (v === null || v === undefined || v === "") return 0;
  return Number(String(v).replace(/[^\d.-]/g, "")) || 0;
};

const toISODate = (v) => {
  if (!v) return null;
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
};

function pickValue(row, aliases) {
  const map = Object.fromEntries(
    Object.entries(row).map(([k, v]) => [String(k).trim().toLowerCase(), v])
  );
  for (const a of aliases) {
    if (map[a] !== undefined) return map[a];
  }
  return null;
}

function normalizeChannel(input) {
  const raw = String(input || "unknown").toLowerCase();
  for (const [canonical, aliases] of Object.entries(CHANNEL_ALIASES)) {
    if (aliases.some((a) => raw.includes(a))) return canonical;
  }
  return raw;
}

export function detectReportType(row) {
  const keys = Object.keys(row).map((k) => k.toLowerCase());
  if (keys.some((k) => ["campaign", "ad_spend", "roas", "leads"].includes(k))) return REPORT_TYPES.CAMPAIGN;
  if (keys.some((k) => ["customer_id", "returning_customers", "new_customers"].includes(k))) return REPORT_TYPES.CRM;
  if (keys.some((k) => ["order_count", "revenue", "gmv"].includes(k))) return REPORT_TYPES.SALES;
  return REPORT_TYPES.UNKNOWN;
}

export function normalizeRows(rows, sourceFile) {
  return rows.map((row) => {
    const reportType = detectReportType(row);
    const revenue = parseNumber(pickValue(row, FIELD_SYNONYMS.revenue));
    const orders = parseNumber(pickValue(row, FIELD_SYNONYMS.orders));
    const spend = parseNumber(pickValue(row, FIELD_SYNONYMS.spend));
    const leads = parseNumber(pickValue(row, FIELD_SYNONYMS.leads));
    const newCustomers = parseNumber(pickValue(row, FIELD_SYNONYMS.newCustomers));
    const repeatCustomers = parseNumber(pickValue(row, FIELD_SYNONYMS.repeatCustomers));
    const stageVisits = parseNumber(pickValue(row, FIELD_SYNONYMS.stageVisits));
    const stageLeads = parseNumber(pickValue(row, FIELD_SYNONYMS.stageLeads)) || leads;
    const stageSales = parseNumber(pickValue(row, FIELD_SYNONYMS.stageSales)) || orders;

    return {
      date: toISODate(pickValue(row, FIELD_SYNONYMS.date)),
      reportType,
      channel: normalizeChannel(pickValue(row, FIELD_SYNONYMS.channel)),
      campaign: String(pickValue(row, FIELD_SYNONYMS.campaign) || "Unknown Campaign"),
      customerId: String(pickValue(row, FIELD_SYNONYMS.customerId) || "anonymous"),
      revenue,
      orders,
      spend,
      leads,
      newCustomers,
      repeatCustomers,
      stageVisits,
      stageLeads,
      stageSales,
      sourceFile
    };
  });
}

export const unifiedSchema = {
  type: "object",
  required: ["date", "reportType", "channel", "campaign", "revenue", "orders", "spend"],
  properties: {
    date: { type: "string", format: "date" },
    reportType: { enum: ["sales", "campaign", "crm", "unknown"] },
    channel: { type: "string" },
    campaign: { type: "string" },
    customerId: { type: "string" },
    revenue: { type: "number" },
    orders: { type: "number" },
    spend: { type: "number" },
    leads: { type: "number" },
    newCustomers: { type: "number" },
    repeatCustomers: { type: "number" },
    stageVisits: { type: "number" },
    stageLeads: { type: "number" },
    stageSales: { type: "number" },
    sourceFile: { type: "string" }
  }
};
