import { getTenantByWebsite } from '@/sheep/api/infra/tenant';
import { getTenantId } from '@/sheep/request';
import { defineStore } from 'pinia';
import $platform from '@/sheep/platform';
import $router from '@/sheep/router';
import user from './user';
import sys from './sys';
import { baseUrl, h5Url } from '@/sheep/config';

const defaultTabbar = {
  mode: 1,
  style: {
    color: '#6b7280',
    activeColor: '#2563eb',
    bgType: 'color',
    bgColor: '#ffffff',
  },
  badgeStyle: {},
  items: [
    {
      text: '首页',
      url: '/pages/index/index',
      iconUrl: '',
      activeIconUrl: '',
    },
    {
      text: '我的',
      url: '/pages/index/user',
      iconUrl: '',
      activeIconUrl: '',
    },
  ],
};

const app = defineStore({
  id: 'app',
  state: () => ({
    paramsForTabbar: {},
    info: {
      name: '家教',
      logo: '',
      version: '2026.03',
      copyright: '',
      copytime: '',
      cdnurl: '',
      filesystem: '',
    },
    platform: {
      share: {
        methods: ['forward', 'link'],
        forwardInfo: {
          title: '家教',
          image: '',
          desc: '本地家教信息服务',
        },
        posterInfo: {},
        linkAddress: h5Url,
      },
      bind_mobile: 0,
    },
    template: {
      basic: {
        tabbar: defaultTabbar,
        theme: {
          main: '#2563eb',
        },
      },
      home: {
        style: {},
        data: [],
      },
      user: {
        style: {},
        data: [],
      },
    },
    shareInfo: {},
    has_wechat_trade_managed: 0,
  }),
  actions: {
    async init() {
      const networkStatus = await $platform.checkNetwork();
      if (!networkStatus) {
        $router.error('NetworkError');
      }

      if (typeof baseUrl === 'undefined') {
        $router.error('EnvError');
      }

      await adaptTenant();

      this.info = {
        name: '家教',
        logo: '',
        version: '2026.03',
        copyright: '',
        copytime: '',
        cdnurl: '',
        filesystem: '',
      };
      this.platform = {
        share: {
          methods: ['forward', 'link'],
          forwardInfo: {
            title: '家教',
            image: '',
            desc: '本地家教信息服务',
          },
          posterInfo: {},
          linkAddress: h5Url,
        },
        bind_mobile: 0,
      };
      this.template.basic.tabbar = JSON.parse(JSON.stringify(defaultTabbar));

      const sysStore = sys();
      sysStore.setTheme();

      const userStore = user();
      if (userStore.isLogin) {
        userStore.loginAfter();
      }
      return true;
    },
    setParamsForTabbar(params = {}) {
      this.paramsForTabbar = params;
    },
    clearParamsForTabbar() {
      this.paramsForTabbar = {};
    },
  },
  persist: {
    enabled: true,
    strategies: [
      {
        key: 'app-store',
      },
    ],
  },
});

const adaptTenant = async () => {
  const oldTenantId = getTenantId();
  let newTenantId = null;

  try {
    // #ifdef H5
    if (window?.location) {
      const urlParams = new URLSearchParams(window.location.search);
      newTenantId = urlParams.get('tenantId');
      if (!newTenantId && window.location.host) {
        const { data } = await getTenantByWebsite(window.location.host);
        newTenantId = data?.id;
      }
    }
    // #endif

    // #ifdef MP
    const appId = uni.getAccountInfoSync()?.miniProgram?.appId;
    if (appId) {
      const { data } = await getTenantByWebsite(appId);
      newTenantId = data?.id;
    }
    // #endif

    if (newTenantId && newTenantId != oldTenantId) {
      const userStore = user();
      userStore.setToken();
      uni.setStorageSync('tenant-id', newTenantId);
    }
  } catch (error) {
    console.error('adaptTenant 执行失败:', error);
  }
};

export default app;
