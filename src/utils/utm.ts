export const UTM_TEMPLATE = 'utm_source=FB&utm_campaign={{campaign.name}}|{{campaign.id}}&utm_medium={{adset.name}}|{{adset.id}}&utm_content={{ad.name}}|{{ad.id}}&utm_term={{placement}}';

export function appendUtm(url: string) {
  if (!url) return url;
  try {
    const sep = url.includes('?') ? '&' : '?';
    return url + sep + UTM_TEMPLATE;
  } catch (e) {
    return url;
  }
}
