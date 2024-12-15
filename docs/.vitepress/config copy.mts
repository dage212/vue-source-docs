import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "vue-source-docs",
  description: "vue source docs provides a detailed explanation of the Vue source code architecture and principles.",
  head: [['link', { rel: 'icon', href: '/vue-source-docs/logo.ico' }]],
  themeConfig: {
    logo: 'logo.png',
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'vue源码', link: '/' },
      { text: 'vue其它', link: '/markdown-examples' }
    ],

    sidebar: [
      {
        text: 'Examples',
        items: [
          { text: 'Markdown Examples', link: '/markdown-examples' },
          { text: 'Runtime API Examples', link: '/api-examples' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://dage212.github.io/' }
    ]
  },
  base: '/vue-source-docs/'
})
