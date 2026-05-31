const LOCATION_STORAGE_KEY = 'tutor_location';

export function normalizeLocation(res = {}) {
  const longitude = Number(res.longitude);
  const latitude = Number(res.latitude);
  if (!longitude || !latitude || Number.isNaN(longitude) || Number.isNaN(latitude)) {
    return null;
  }
  const address = res.address || {};
  return {
    longitude,
    latitude,
    accuracy: res.accuracy,
    address: res.address || res.addr || '',
    province: res.province || address.provinceName || address.province || '',
    city: res.city || address.cityName || address.city || '',
    district: res.district || address.districtName || address.district || '',
    street: res.street || address.street || '',
    source: 'tencent',
    type: 'gcj02',
    locatedAt: Date.now(),
  };
}

export function getCachedLocation() {
  return uni.getStorageSync(LOCATION_STORAGE_KEY) || {};
}

export function setCachedLocation(location) {
  if (!location?.longitude || !location?.latitude) {
    return null;
  }
  uni.setStorageSync(LOCATION_STORAGE_KEY, location);
  return location;
}

export function getLocationPayload(fallback = {}) {
  const location = getCachedLocation();
  return {
    longitude: location.longitude || fallback.longitude,
    latitude: location.latitude || fallback.latitude,
  };
}

export function requestTencentLocation() {
  return new Promise((resolve, reject) => {
    uni.getLocation({
      type: 'gcj02',
      geocode: true,
      success: (res) => {
        const location = normalizeLocation(res);
        if (!location) {
          reject(new Error('定位结果缺少经纬度'));
          return;
        }
        setCachedLocation(location);
        resolve(location);
      },
      fail: reject,
    });
  });
}
