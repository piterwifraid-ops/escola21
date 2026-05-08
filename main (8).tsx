import { NavigateFunction } from 'react-router-dom';

export const navigateWithUTM = (navigate: NavigateFunction, path: string) => {
  const utmParams = '?utm_source=FB&utm_campaign={{campaign.name}}|{{campaign.id}}&utm_medium={{adset.name}}|{{adset.id}}&utm_content={{ad.name}}|{{ad.id}}&utm_term={{placement}}';
  navigate(`${path}${utmParams}`);
};