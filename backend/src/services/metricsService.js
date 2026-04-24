function sum(list, key) {
  return list.reduce((acc, row) => acc + (row[key] || 0), 0);
}

function uniqueCount(list, key) {
  return new Set(list.map((x) => x[key]).filter(Boolean)).size;
}

function pct(numerator, denominator) {
  if (!denominator) return 0;
  return (numerator / denominator) * 100;
}

export function filterByQuery(records, query = {}) {
  const { startDate, endDate, channel } = query;
  return records.filter((r) => {
    const inDateRange = (!startDate || r.date >= startDate) && (!endDate || r.date <= endDate);
    const inChannel = !channel || r.channel === channel;
    return inDateRange && inChannel;
  });
}

export function dashboardSummary(records) {
  const revenue = sum(records, "revenue");
  const spend = sum(records, "spend");
  const orders = sum(records, "orders");
  const leads = sum(records, "leads");
  const newCustomers = sum(records, "newCustomers");
  const repeatCustomers = sum(records, "repeatCustomers");

  const aov = orders ? revenue / orders : 0;
  const roas = spend ? revenue / spend : 0;
  const cpl = leads ? spend / leads : 0;
  const totalCustomers = uniqueCount(records, "customerId");
  const repeatRatio = pct(repeatCustomers, newCustomers + repeatCustomers || totalCustomers);
  const cac = (newCustomers + repeatCustomers) ? spend / (newCustomers + repeatCustomers) : 0;
  const funnelVisitToLead = pct(sum(records, "stageLeads"), sum(records, "stageVisits"));
  const funnelLeadToSale = pct(sum(records, "stageSales"), sum(records, "stageLeads"));

  return {
    totalRevenue: revenue,
    totalSpend: spend,
    totalOrders: orders,
    totalLeads: leads,
    totalCustomers,
    newCustomers,
    repeatCustomers,
    aov,
    roas,
    cpl,
    cac,
    repeatRatio,
    conversionRate: pct(orders, leads),
    funnel: {
      visitToLeadPct: funnelVisitToLead,
      leadToSalePct: funnelLeadToSale,
      visitToSalePct: pct(sum(records, "stageSales"), sum(records, "stageVisits"))
    }
  };
}

export function salesTrends(records, grain = "daily") {
  const bucketFormat = (isoDate) => (grain === "monthly" ? isoDate?.slice(0, 7) : isoDate);
  const map = new Map();

  records.forEach((row) => {
    const bucket = bucketFormat(row.date);
    if (!bucket) return;
    const prior = map.get(bucket) || { period: bucket, revenue: 0, orders: 0, spend: 0, leads: 0 };
    prior.revenue += row.revenue || 0;
    prior.orders += row.orders || 0;
    prior.spend += row.spend || 0;
    prior.leads += row.leads || 0;
    map.set(bucket, prior);
  });

  const rows = [...map.values()].sort((a, b) => a.period.localeCompare(b.period));
  rows.forEach((row, idx) => {
    const prev = rows[idx - 1];
    row.growthPct = prev && prev.revenue ? ((row.revenue - prev.revenue) / prev.revenue) * 100 : 0;
  });

  return rows;
}

export function campaignPerformance(records) {
  const grouped = new Map();

  records.forEach((r) => {
    const key = `${r.channel}::${r.campaign}`;
    const prior = grouped.get(key) || {
      channel: r.channel,
      campaign: r.campaign,
      revenue: 0,
      spend: 0,
      leads: 0,
      orders: 0,
      customers: new Set()
    };

    prior.revenue += r.revenue || 0;
    prior.spend += r.spend || 0;
    prior.leads += r.leads || 0;
    prior.orders += r.orders || 0;
    if (r.customerId) prior.customers.add(r.customerId);
    grouped.set(key, prior);
  });

  return [...grouped.values()].map((x) => ({
    channel: x.channel,
    campaign: x.campaign,
    revenue: x.revenue,
    spend: x.spend,
    roas: x.spend ? x.revenue / x.spend : 0,
    roiPct: x.spend ? ((x.revenue - x.spend) / x.spend) * 100 : 0,
    cpl: x.leads ? x.spend / x.leads : 0,
    conversionRate: x.leads ? (x.orders / x.leads) * 100 : 0,
    customers: x.customers.size
  }));
}

export function customerInsights(records) {
  const customerMap = new Map();

  records.forEach((r) => {
    const id = r.customerId || "anonymous";
    const prior = customerMap.get(id) || { customerId: id, orders: 0, revenue: 0, channels: new Set(), visits: 0 };
    prior.orders += r.orders || 0;
    prior.revenue += r.revenue || 0;
    prior.visits += 1;
    if (r.channel) prior.channels.add(r.channel);
    customerMap.set(id, prior);
  });

  const customers = [...customerMap.values()].map((x) => ({
    customerId: x.customerId,
    orders: x.orders,
    revenue: x.revenue,
    purchaseFrequency: x.visits,
    channels: [...x.channels]
  }));

  const topCustomers = [...customers].sort((a, b) => b.revenue - a.revenue).slice(0, 10);
  const repeat = customers.filter((c) => c.orders > 1).length;

  return {
    totalCustomers: customers.length,
    repeatCustomers: repeat,
    newCustomers: customers.length - repeat,
    repeatRatio: customers.length ? (repeat / customers.length) * 100 : 0,
    topCustomers
  };
}
