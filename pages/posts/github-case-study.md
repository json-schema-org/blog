---
title: "How JSON Schema Was an Obvious Choice at GitHub"
date: 2023-07-31
type: Case Study
cover: /img/posts/2023/github-case-study/github-mark.svg
authors:
  - name: Julian Berman
    photo: /img/avatars/julian.webp
    link: https://mastodon.social/@JulianWasTaken
    byline: JSON Schema Test Suite Maintainer & Technical Lead, API Specifications @Postman
excerpt: "At GitHub's Docs Engineering team, while shipping releases to production 20 times per day or more, JSON Schema is critical in increasing confidence in changes to data, content and APIs."
---

## Challenge

GitHub stands as a ubiquitous and invaluable tool for software developers and those in related fields, enabling efficient code management, seamless collaboration, automation, project management and more.
More than 100 million users rely on the platform, many of them making use of it daily for building and sharing open source software.

There is a staggering amount of functionality packed into GitHub, assisting across all parts of the development lifecycle, and supporting this ever-growing list of functionality is an undoubtedly powerful and complex underlying platform developed within GitHub, as well as extensive documentation covering features new and old.

Documentation at GitHub is housed at [docs.github.com](https://docs.github.com), itself a massive undertaking, covering pages upon pages of functionality within the platform.
Historically, this documentation was split into two statically generated sites (help.github.com and developer.github.com), but in 2020 these static sites were combined in a new dynamic application hosted at docs.github.com.
The full story of the rebirth of GitHub's documentation is told best on the GitHub blog [here](https://github.blog/2020-10-14-how-we-open-sourced-docs-github-com/) and [here](https://github.blog/2020-07-02-how-we-launched-docs-github-com/), but an important outcome of this change was a move towards data-driven documentation, and in particular a big investment in the use of JSON both to drive content as well as for intercommunication within the application's platform itself.

More specifically, some of page content is assembled fully automatically from JSON data files and some JSON is manually authored by content writers.
Within the platform, the application's entire queryable in-memory context is retrievable as JSON.

"Not being able to validate our JSON data against a JSON schema would result in bugs in production like missing data on automated documentation pages or unavailable pages", explain Rachael Sewell and Robert Sese, software engineers who work on GitHub's Docs Engineering team.

Without proper schemas for their JSON data, there was no way to verify whether code changes introduced new bugs, or to ensure that data consumed from external sources was in the format needed for automated documentation pages.

## Solution


## Impact

Introducing JSON Schema into the platform produced meaningful impact in productivity, in discoverability, as well as in reliability.

<p className="text-2xl my-10">"JSON schema makes it so much easier to see the shape of a data and its property types. I can quickly open the file on disk and understand what the data structure looks like. This saves the whole team time when extending a feature that relies on data backed by a schema." - Rachael Sewell, Docs Engineer at GitHub</p>

The GitHub team moves quickly, with the documentation team releasing to production 20 times per day or more, and relying heavily on continuous integration checking each and every commit to ensure changes work as intended.
Failures in continuous integration alert the team before the change is shipped out to production, with JSON Schema validation an integral piece of ensuring all of the various pieces of JSON data needed for the application are properly formed.

## GitHub - The Company

<p className="text-2xl my-10">GitHub is the world's largest developer platform, helping developers and organizations around the world to build, scale and deliver secure software.</p>

Founded in 2008, GitHub's $7.5 billion acquisition by Microsoft was finalized in 2018, and the company has only continued to grow since, currently with approximately 2,000 employees worldwide.
It is based in San Francisco, CA, though its hiring and work culture is remote-first.

Particular to the subject at hand, within GitHub is an internal organization called Education, Community, and Open Source Software, which houses the Docs team responsible for the documentation application.
This Docs team consists of content writers, content designers, docs product managers, and docs designers and docs engineers.

## Further Benefits

Thank you to [Rachael Sewell](https://github.com/rachmari) and [Robert Sese](https://github.com/rsese), Software Engineers at GitHub's Docs Engineering team who maintain the wonderful [docs.github.com](https://docs.github.com), as well as to the entire team at GitHub, for sharing their experiences and allowing us to further share them with you.
