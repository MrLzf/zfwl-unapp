import request from '@/sheep/request';

const PayWalletApi = {
  getWallet: () =>
    request({
      url: '/pay/wallet/get',
      method: 'GET',
      custom: { auth: true, showLoading: false },
    }),

  getRechargePackageList: () =>
    request({
      url: '/pay/wallet-recharge-package/list',
      method: 'GET',
      custom: { auth: true, showLoading: false },
    }),

  createRecharge: (data) =>
    request({
      url: '/pay/wallet-recharge/create',
      method: 'POST',
      data,
      custom: { auth: true, showLoading: true },
    }),

  getRechargePage: (params) =>
    request({
      url: '/pay/wallet-recharge/page',
      params,
      method: 'GET',
      custom: { auth: true, showLoading: false },
    }),
};

export default PayWalletApi;
