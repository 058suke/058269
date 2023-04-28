import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site: "https://058suke.work/",
  integrations: [
    tailwind({
      config: {
        applyBaseStyles: false,
      },
    }),
    react(),
    sitemap(),
  ],
  markdown: {
    remarkPlugins: [],
    rehypePlugins: [
      "rehype-slug",
      [
        "rehype-autolink-headings",
        {
          behavior: 'prepend',
          properties: {
            className: ['anchor'],
            ariaHidden: true, 
            tabIndex: -1
          },
          content: {
            type: 'element',
            tagName: 'span',
            properties: {
              className: ['octicon', 'octicon-link']
            }
          }
        }
      ],
      [
        "rehype-toc",
        {
          headings: ["h2", "h3"],
          cssClasses: {
            toc: "post-toc",
            list: "post-toc-list"
          },
          customizeTOC: (toc) => {
            const replacer = (children) => {
              children.forEach(child => {
                if(child.type === 'element' && child.tagName === 'ol') {
                  child.tagName = 'ul';
                }
                if(child.children) {
                  replacer(child.children);
                }
              });
            };
            replacer([toc]);
          }
        }
      ]
    ],
    shikiConfig: {
      theme: "one-dark-pro",
      wrap: true,
    },
    extendDefaultPlugins: true,
  },
});
