import type { ThemeConfig } from 'antd';

const theme: ThemeConfig = {
  token: {
    fontSize: 16,
    colorPrimary: '#1890ff',
    colorText: '#FFFFFF',
    colorBgElevated: 'rgb(75 85 99)',
    colorSplit: '#f0f0f0',
  },
  components: {
    Modal: {
      // contentBg: 'transparent',
    },
  },
};

export default theme;
