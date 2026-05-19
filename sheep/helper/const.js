export const TerminalEnum = {
  UNKNOWN: 0,
  WECHAT_MINI_PROGRAM: 10,
  WECHAT_WAP: 11,
  H5: 20,
  APP: 31,
};

export const getTerminal = () => {
  const platformType = uni.getAppBaseInfo().uniPlatform;
  switch (platformType) {
    case 'app':
      return TerminalEnum.APP;
    case 'web':
      return TerminalEnum.H5;
    case 'mp-weixin':
      return TerminalEnum.WECHAT_MINI_PROGRAM;
    default:
      return TerminalEnum.UNKNOWN;
  }
};

export const SharePageEnum = {
  HOME: {
    name: '首页',
    page: '/pages/index/index',
    value: '1',
  },
};
