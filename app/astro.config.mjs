import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";
import rehypeToc from "@jsdevtools/rehype-toc";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
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
      rehypeSlug,
      [
        rehypeAutolinkHeadings,
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
        rehypeToc,
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
