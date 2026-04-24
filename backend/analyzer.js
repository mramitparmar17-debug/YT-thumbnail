const CHANNEL_FIELDS = ['channel', 'source', 'platform'];

const toNumber = (value) => {
  if (value == null || value === '') return 0;
  const parsed = Number(String(value).replace(/[^\d.-]/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
};

const normalize = (value, fallback = 'Unknown') => {
  if (!value) return fallback;
  return String(value).trim();
};

const monthKey = (value) => {
  const date = value ? new Date(value) : null;
  if (date && !Number.isNaN(date.getTime())) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  }
  return 'Unknown';
};

const getCampaign = (row) => normalize(row.campaign || row.campaign_name || row.ad_name || row.utm_campaign);

const getChannel = (row) => {
  const field = CHANNEL_FIELDS.find((key) => row[key]);
  return normalize(field ? row[field] : null);
};

const isRepeatCustomer = (row) => {
  const marker = normalize(row.customer_type || row.segment || row.status || '').toLowerCase();
  if (marker.includes('repeat') || marker.includes('existing')) return true;
  return toNumber(row.order_count || row.purchases || row.total_orders) > 1;
};

const aggregateBy = (rows, keyFn, valueFn) => {
  const map = new Map();
  rows.forEach((row) => {
    const key = keyFn(row);
    const value = valueFn(row);
    map.set(key, (map.get(key) || 0) + value);
  });
  return [...map.entries()].map(([name, value]) => ({ name, value }));
};

const calculateAnalysis = (crmRows, adsRows) => {
  const normalizedCRM = crmRows.map((row) => ({
    ...row,
    revenue: toNumber(row.revenue || row.amount || row.sales || row.order_value),
    campaign: getCampaign(row),
    channel: getChannel(row),
    month: monthKey(row.date || row.order_date || row.created_at),
    repeat: isRepeatCustomer(row)
  }));

  const normalizedAds = adsRows.map((row) => ({
    ...row,
    campaign: getCampaign(row),
    spend: toNumber(row.spend || row.amount_spent || row.cost),
    clicks: toNumber(row.clicks),
    impressions: toNumber(row.impressions)
  }));

  const channelRevenue = aggregateBy(normalizedCRM, (r) => r.channel, (r) => r.revenue);
  const monthlyRevenue = aggregateBy(normalizedCRM, (r) => r.month, (r) => r.revenue).sort((a, b) => a.name.localeCompare(b.name));

  const segmentMap = normalizedCRM.reduce(
    (acc, row) => {
      if (row.repeat) acc.repeat += row.revenue;
      else acc.new += row.revenue;
      return acc;
    },
    { new: 0, repeat: 0 }
  );

  const campaignPerformanceMap = new Map();
  normalizedCRM.forEach((row) => {
    const current = campaignPerformanceMap.get(row.campaign) || { campaign: row.campaign, revenue: 0, spend: 0, clicks: 0, impressions: 0 };
    current.revenue += row.revenue;
    campaignPerformanceMap.set(row.campaign, current);
  });

  normalizedAds.forEach((row) => {
    const current = campaignPerformanceMap.get(row.campaign) || { campaign: row.campaign, revenue: 0, spend: 0, clicks: 0, impressions: 0 };
    current.spend += row.spend;
    current.clicks += row.clicks;
    current.impressions += row.impressions;
    campaignPerformanceMap.set(row.campaign, current);
  });

  const campaignPerformance = [...campaignPerformanceMap.values()].map((item) => ({
    ...item,
    roas: item.spend > 0 ? Number((item.revenue / item.spend).toFixed(2)) : 0,
    ctr: item.impressions > 0 ? Number(((item.clicks / item.impressions) * 100).toFixed(2)) : 0
  }));

  const totalRevenue = normalizedCRM.reduce((sum, item) => sum + item.revenue, 0);
  const totalSpend = normalizedAds.reduce((sum, item) => sum + item.spend, 0);
  const overallROAS = totalSpend > 0 ? Number((totalRevenue / totalSpend).toFixed(2)) : 0;

  return {
    kpis: {
      totalRevenue,
      totalSpend,
      overallROAS,
      totalCampaigns: campaignPerformance.length
    },
    channelRevenue,
    monthlyRevenue,
    customerSegmentation: [
      { name: 'New Customers', value: segmentMap.new },
      { name: 'Repeat Customers', value: segmentMap.repeat }
    ],
    campaignPerformance
  };
};

module.exports = { calculateAnalysis };
