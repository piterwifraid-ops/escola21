import { NavigateFunction } from 'react-router-dom';

export const navigateWithUTM = (navigate: NavigateFunction, path: string) => {
  const utmParams = '?utm_source=utm_source&utm_campaign=utm_campaign&utm_medium=utm_medium&utm_content=utm_content';
  navigate(`${path}${utmParams}`);
};