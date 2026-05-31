import packageInfo from '@/package.json';

const { version } = packageInfo;

// 开发环境配置
export let baseUrl;
if (process.env.NODE_ENV === 'development') {
  baseUrl = import.meta.env.TUTOR_DEV_BASE_URL;
} else {
  baseUrl = import.meta.env.TUTOR_BASE_URL;
}
if (typeof baseUrl === 'undefined') {
  console.error('请检查.env配置文件是否存在');
} else {
  console.log(`[家教 ${version}]`);
}

export const apiPath = import.meta.env.TUTOR_API_PATH;
export const staticUrl = import.meta.env.TUTOR_STATIC_URL;
export const tenantId = import.meta.env.TUTOR_TENANT_ID;
export const websocketPath = import.meta.env.TUTOR_WEBSOCKET_PATH;
export const h5Url = import.meta.env.TUTOR_H5_URL;
export const tencentMapKey = import.meta.env.TUTOR_TENCENT_MAP_KEY;

export default {
  baseUrl,
  apiPath,
  staticUrl,
  tenantId,
  websocketPath,
  h5Url,
  tencentMapKey,
};
