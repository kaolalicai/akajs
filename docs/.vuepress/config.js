module.exports = {
  title: 'Kalengo akajs',
  base: '/akajs_doc/',
  description: 'Just playing around',
  themeConfig: {
    nav: [
      {text: '首页', link: '/'},
      {text: '指南', link: '/core'},
      {text: 'Github', link: 'https://github.com/kaolalicai/akajs'},
    ],
    sidebar: [
      '/',
      ['/quickstart', '快速开始'],
      ['/core', '指南']
    ]
  }
}
