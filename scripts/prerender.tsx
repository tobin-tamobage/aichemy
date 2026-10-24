import React from "react";
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom";
import { readFile, writeFile } from "node:fs/promises";
import Landing from "../web/V2Landing";
const filename = new URL("../dist/index.html", import.meta.url);
let html = await readFile(filename, "utf8");
const markup = renderToString(
  <StaticRouter location="/">
    <Landing />
  </StaticRouter>,
);
html = html.replace('<div id="root"></div>', `<div id="root">${markup}</div>`);
const appUrl = process.env.APP_URL;
if (appUrl?.startsWith("https://")) {
  html = html
    .replace(
      "</head>",
      `<link rel="canonical" href="${new URL("/", appUrl).href}" /><meta property="og:url" content="${new URL("/", appUrl).href}" /></head>`,
    )
    .replace(
      'content="/assets/brand/social-v4.png"',
      `content="${new URL("/assets/brand/social-v4.png", appUrl).href}"`,
    );
}
await writeFile(filename, html);
console.log("Landing page Indonesia berhasil diprarender.");
