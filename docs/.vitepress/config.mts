import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "SourceCodeDocs",
  description: "SourceCodeDocs provides a detailed explanation of the VueSourceCode architecture and principles.",
  head: [
    ['link', { rel: 'icon', href: '/vue-source-docs/logo.ico' }], 
    ['script', {}, `
      var _hmt = _hmt || [];
      (function() {
        var hm = document.createElement("script");
        hm.src = "https://hm.baidu.com/hm.js?0e2aade999bb365c5cf476fe3d46c079";
        var s = document.getElementsByTagName("script")[0]; 
        s.parentNode.insertBefore(hm, s);
      })();
    `]
],
  themeConfig: {
    logo: '/logo.png',
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'vite源码', link: '/vite/index' },
      { text: 'vue源码', link: '/vue/index' }
    ],

    sidebar: {
      '/vue': [
        { text: 'vue原理', link: '/vue/index' },
      ],
      '/vite/': [
        { text: 'vite项目概览', link: '/vite/index' },
        { text: 'vite源码', link: '/vite/vite' },
        { text: 'create-vite源码', link: '/vite/create-vite' },
        { text: 'plugin-legacy源码', link: '/vite/plugin-legacy' },
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/dage212' }
    ],
    footer: {
      message: 'MIT Licensed | thanks vue team',
      copyright: 'Copyright © 2024-present dage212'
    }
  },
  base: '/vue-source-docs/',
  sitemap: {
    hostname: 'https://www.dage212.xin/vue-source-docs/'
  },
  lastUpdated: true
})
