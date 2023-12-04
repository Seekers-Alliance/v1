import type { ThemeConfig } from 'antd';

const theme: ThemeConfig = {
  token: {
    fontSize: 16,
    colorPrimary: '#1890ff',
    colorText: '#FFFFFF',
    colorBgElevated: '#000000',
  },
  components: {
    Modal: {
      // contentBg: 'transparent',
    },
  },
};

export default theme;
