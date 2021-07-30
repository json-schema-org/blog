# JSON Schema blog

A fork from https://github.com/asyncapi/website at 34eba91120505a5065715337f73c66bfcf126736
In effort to avoid having to build a whole new blog and get something up quickly!
With complements of the AsyncAPI team!

TODO: Initial setup, Update link / info / description for JSON Schema in files such as...
- [x] scripts/build-rss.js
- [x] change favicon in the /public folders
- [x] update main description/keywords etc for page in the components/Head
- [x] update desc for footer in the components/Footer
- [x] Search whole repo for mention of AsyncAPI.
- [x] Google analytics tracking?
- [ ] Include first article

---

## Overview

This repository contains the sources of JSON Schema blog website:

- It's powered by [Next.js](https://nextjs.org/)
- It uses [Tailwind](https://tailwindcss.com/) CSS framework
- It WILL be deployed using cloudflare pages

## Requirements

Use the following tools to set up the project:

- [Node.js](https://nodejs.org/) v14.17+
- [yarn](https://yarnpkg.com/) v1.22+

We recommend using [Volta](https://volta.sh/) to easily use the correct versions of node and yarn

## Usage

### Install dependencies

To install all dependencies, run this command:

```bash
yarn
```

Yarn [automagically](https://classic.yarnpkg.com/en/docs/cli/install/) installs the correct dependencies you need, develop by default.

### Develop

Launch the development server with the hot reloading functionality that allows any change in files to be immediately visible in the browser (code only, not content). Use this command:

```bash
yarn dev
```

You can access the live development server at [localhost:8080](http://localhost:8080).

### Build

To build a production-ready website, run the following command:

```bash
yarn build
```

Generated files of the website go to the `.next` folder.

## Project structure

This repository has the following structure:

<!-- If you make any changes in the project structure, remember to update it. -->

```text
  ├── .github                     # Definitions of Github workflows, pull request and issue templates
  ├── components                  # Various generic components such as "Button", "Figure", etc.
  ├── config                      # Transformed static data to display on the pages such as blog posts etc.
  ├── context                     # Various React's contexts used in website
  ├── css                         # Various CSS files
  ├── lib                         # Various JS code for preparing static data to render in pages
  ├── pages                       # Website's pages source. Only the blog!
  │    ├── blog                   # Blog posts
  ├── public                      # Data for site metadata and static content such as images
  ├── scripts                     # Scripts used in the build and dev processes
  ├── next.config.js              # Next.js configuration file
  ├── postcss.config.js           # PostCSS configuration file
  └── tailwind.config.js          # TailwindCSS configuration file
```
