import type { SocialObjects } from "./types";

export const SITE = {
  website: "https://058suke.work/",
  author: "058suke",
  desc: "福岡で働くWebエンジニアのブログ。",
  title: "058269",
  ogImage: "./assets/058269ogimage.png",
  lightAndDarkMode: true,
  postPerPage: 3,
  favicon: "./assets/058269favicon.png"
};

export const LOGO_IMAGE = {
  enable: true,
  svg: false,
  width: 100,
  height: 100,
};

export const SOCIALS: SocialObjects = [
  {
    name: "Github",
    href: "https://github.com/058suke",
    linkTitle: `Github`,
    active: true,
  },
  {
    name: "Instagram",
    href: "https://www.instagram.com/058suke/",
    linkTitle: `Instagram`,
    active: true,
  },
  {
    name: "Twitter",
    href: "https://twitter.com/058suke",
    linkTitle: `Twitter`,
    active: true,
  },
];
