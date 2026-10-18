#!/bin/sh
# Netlify build: copies only the site files into _site.
set -eu
rm -rf _site
mkdir _site
cp index.html 404.html styles.css main.js i18n.js robots.txt sitemap.xml _site/
cp -R assets _site/
