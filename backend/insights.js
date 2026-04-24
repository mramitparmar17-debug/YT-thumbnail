const buildInsights = (analysis) => {
  const insights = [];
  const { kpis, campaignPerformance, channelRevenue, customerSegmentation } = analysis;

  if (kpis.overallROAS < 2) {
    insights.push('Overall ROAS is below target (2.0). Rebalance spend toward higher-converting campaigns.');
  } else {
    insights.push('ROAS is healthy. Scale top-performing campaigns while preserving CPA guardrails.');
  }

  const topCampaign = [...campaignPerformance].sort((a, b) => b.roas - a.roas)[0];
  const weakCampaign = [...campaignPerformance].sort((a, b) => a.roas - b.roas)[0];

  if (topCampaign) {
    insights.push(`Top campaign: ${topCampaign.campaign} with ROAS ${topCampaign.roas}. Consider increasing budget by 15-20%.`);
  }

  if (weakCampaign && weakCampaign.spend > 0) {
    insights.push(`Underperforming campaign: ${weakCampaign.campaign}. Refresh creatives and narrow audience targeting.`);
  }

  const repeat = customerSegmentation.find((x) => x.name === 'Repeat Customers')?.value || 0;
  const newcomer = customerSegmentation.find((x) => x.name === 'New Customers')?.value || 0;
  if (repeat < newcomer) {
    insights.push('New customer share is dominating. Launch retention offers (bundles, email automation) to improve LTV.');
  } else {
    insights.push('Repeat customer revenue is strong. Introduce loyalty tiers to amplify recurring purchases.');
  }

  const topChannel = [...channelRevenue].sort((a, b) => b.value - a.value)[0];
  if (topChannel) {
    insights.push(`Best channel is ${topChannel.name}. Replicate its messaging and funnel structure in weaker channels.`);
  }

  return insights;
};

const buildRecommendations = (analysis) => {
  return analysis.campaignPerformance
    .map((campaign) => {
      if (campaign.spend === 0) {
        return {
          campaign: campaign.campaign,
          recommendation: 'No ad spend data found. Validate campaign mapping between CRM and ad report.'
        };
      }

      if (campaign.roas >= 3) {
        return {
          campaign: campaign.campaign,
          recommendation: 'Scale budget by 10-25%, keep creative rotation every 10 days.'
        };
      }

      if (campaign.roas >= 1.5) {
        return {
          campaign: campaign.campaign,
          recommendation: 'Maintain spend, test one new creative and one audience split this week.'
        };
      }

      return {
        campaign: campaign.campaign,
        recommendation: 'Reduce spend, rebuild offer-angle fit, and test a shorter conversion path.'
      };
    })
    .sort((a, b) => a.campaign.localeCompare(b.campaign));
};

module.exports = { buildInsights, buildRecommendations };
