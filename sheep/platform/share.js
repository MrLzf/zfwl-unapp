import $store from '@/sheep/store';
import $platform from '@/sheep/platform';
import $router from '@/sheep/router';
import $url from '@/sheep/url';
import { SharePageEnum } from '@/sheep/helper/const';

// #ifdef H5
import $wxsdk from '@/sheep/libs/sdk-h5-weixin';
// #endif

const platformMap = ['H5', 'WechatOfficialAccount', 'WechatMiniProgram', 'App'];

const getShareInfo = (
  scene = {
    title: '家教',
    desc: '本地家教信息服务',
    image: '',
    params: {},
  },
) => {
  const shareInfo = {
    title: scene.title || '家教',
    desc: scene.desc || '本地家教信息服务',
    image: $url.cdn(scene.image || ''),
    path: '',
    link: '',
    query: '',
    forward: {},
  };
  const app = $store('app');
  const shareConfig = app.platform.share;
  const query = buildSpmQuery(scene.params || {});

  shareInfo.query = query;
  shareInfo.link = `${shareConfig.linkAddress}?${query}`;
  shareInfo.path = buildSpmPath(query);
  if (shareConfig.methods.includes('forward')) {
    shareInfo.forward.path = shareInfo.path;
  }
  return shareInfo;
};

const buildSpmQuery = (params) => {
  const user = $store('user');
  const shareId = params.shareId || (user.isLogin ? user.userInfo.id : '0') || '0';
  const platform = platformMap.indexOf($platform.name) + 1;
  return `spm=${shareId}.${SharePageEnum.HOME.value}.0.${platform}.1`;
};

const buildSpmPath = (query) => {
  return query ? `pages/index/index?${query}` : 'pages/index/index';
};

const decryptSpm = (spm) => {
  if (spm) {
    uni.setStorageSync('shareId', spm.split('.')[0] || '0');
  }
  $router.go(SharePageEnum.HOME.page);
};

const bindBrokerageUser = async () => {};

const updateShareInfo = (shareInfo) => {
  // #ifdef H5
  if ($platform.name === 'WechatOfficialAccount') {
    $wxsdk.updateShareInfo(shareInfo);
  }
  // #endif
};

export default {
  getShareInfo,
  updateShareInfo,
  decryptSpm,
  bindBrokerageUser,
};
