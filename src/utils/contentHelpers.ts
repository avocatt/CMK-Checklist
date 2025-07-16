export const formatDate = (isoString: string): string => {
  try {
    const date = new Date(isoString);
    // Turkish date format: DD.MM.YYYY
    return date.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return isoString;
  }
};

export const formatDateTime = (isoString: string): string => {
  try {
    const date = new Date(isoString);
    // Turkish datetime format: DD.MM.YYYY HH:mm
    return date.toLocaleString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  } catch (error) {
    console.error('Error formatting datetime:', error);
    return isoString;
  }
};

export const isContentOld = (lastUpdated: string, monthsThreshold: number = 6): boolean => {
  try {
    const lastUpdatedDate = new Date(lastUpdated);
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - monthsThreshold);
    
    return lastUpdatedDate < sixMonthsAgo;
  } catch (error) {
    console.error('Error checking content age:', error);
    return false;
  }
};

export const getTimeAgo = (isoString: string): string => {
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
      if (diffInHours === 0) {
        const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
        return diffInMinutes <= 1 ? 'Şimdi' : `${diffInMinutes} dakika önce`;
      }
      return diffInHours === 1 ? '1 saat önce' : `${diffInHours} saat önce`;
    } else if (diffInDays === 1) {
      return 'Dün';
    } else if (diffInDays < 7) {
      return `${diffInDays} gün önce`;
    } else if (diffInDays < 30) {
      const weeks = Math.floor(diffInDays / 7);
      return weeks === 1 ? '1 hafta önce' : `${weeks} hafta önce`;
    } else if (diffInDays < 365) {
      const months = Math.floor(diffInDays / 30);
      return months === 1 ? '1 ay önce' : `${months} ay önce`;
    } else {
      const years = Math.floor(diffInDays / 365);
      return years === 1 ? '1 yıl önce' : `${years} yıl önce`;
    }
  } catch (error) {
    console.error('Error calculating time ago:', error);
    return '';
  }
};

export const getContentAgeWarning = (lastUpdated: string): string | null => {
  const monthsOld = getMonthsSinceUpdate(lastUpdated);
  
  if (monthsOld >= 12) {
    return '⚠️ Bu içerik 1 yıldan daha eski olabilir';
  } else if (monthsOld >= 6) {
    return '⚠️ Bu içerik güncel olmayabilir';
  }
  
  return null;
};

function getMonthsSinceUpdate(lastUpdated: string): number {
  try {
    const lastUpdatedDate = new Date(lastUpdated);
    const now = new Date();
    
    const yearDiff = now.getFullYear() - lastUpdatedDate.getFullYear();
    const monthDiff = now.getMonth() - lastUpdatedDate.getMonth();
    
    return yearDiff * 12 + monthDiff;
  } catch (error) {
    console.error('Error calculating months since update:', error);
    return 0;
  }
}