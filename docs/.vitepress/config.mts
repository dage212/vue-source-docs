import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "vue-source-docs",
  description: "vue source docs provides a detailed explanation of the Vue source code architecture and principles.",
  head: [['link', { rel: 'icon', href: '/vue-source-docs/logo.ico' }]],
  themeConfig: {
    logo: '/logo.png',
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'vue源码', link: '/api-examples.md' },
      { text: 'vue其它', link: '/markdown-examples' }
    ],

    sidebar: {
      '/vue': [
        { text: 'vue原理', link: '/index' },
      ],
      '/vite/': [
        { text: 'vite项目概览', link: '/vite/index' },
        { text: 'vite源码', link: '/vite/vite' },
        { text: 'create-vite源码', link: '/vite/create-vite' },
        { text: 'plugin-legacy源码', link: '/vite/plugin-legacy' },
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://dage212.github.io/' }
    ],
    footer: {
      message: 'MIT Licensed | thanks vue team',
      copyright: 'Copyright © 2024-present dage212'
    }
  },
  base: '/vue-source-docs/'
})
