---
title: "How the W3C Web of Things brings JSON Schema to the Internet of Things"
date: 2022-08-17T06:00:00+00:00
type: Case Study
cover: /img/posts/2022/w3c-wot-case-study/cover.webp
authors:
  - name: Juan Cruz Viotti
    photo: /img/avatars/jviotti.webp
    link: https://twitter.com/jviottidc
excerpt: "Using JSON Schema at the W3C Web of Things to counter the fragmentation of the Internet of Things"
language: en
---

## Challenge

The Internet of Things (IoT) is the network of physical "smart" objects that
exchange data with other devices over the Internet. While communication and
interoperability are by definition the crux of the Internet of Things, the
emergence of custom or proprietary solutions results in devices that cannot
talk to each other due to differences in data interchange mechanisms.

To integrate these disparate devices, developers must work with a growing set
of protocols, serialization formats and API specifications. This results in
repetitive, non-scalable and error-prone work that is difficult to automate.

While technologies like OpenAPI and AsyncAPI largely solve this problem in the
context of Web APIs, they fall short for describing networks of non-HTTP
multi-protocol devices and do not consider different modes of interaction based
on their meaning in the physical world.

## Solution

To solve these problems, the W3C Web of Things works on providing standardized
building blocks that make use of JSON Schema.

JSON Schema is used for validating abstractions of physical entities called
[Thing Descriptions][thing-description], and to model and describe data sent by
Internet of Things consumers and producers in a multi-protocol manner.

We are on-board with JSON Schema since Draft 4, and even the first draft
versions were quite enough to model data models of Internet of Things devices.
Currently, we are on Draft 7 and expect to move to 2020-12 or a newer one when
starting our new charter in February 2023.

We observe JSON Schema becoming more and more stable over the years and
Postman's support to the community gives us even more confidence on it. JSON
Schema is delivering exciting features, and more importantly these features are
becoming more and more consistent across implementations.  For example,
vocabularies are very promising and we plan to explore them further in
conjunction with Semantic Web technologies.

## Impact

The W3C Web of Things relies on JSON-LD for linking vocabularies and ontologies
that already exist on the web, such as [SAREF][saref], [Units of
Measure][units-of-measure] and [Schema.org][schema-org]. Being based on the
JSON data model, JSON Schema fits well with JSON-LD when integrating both
technologies as part of a single specification.

Adopting JSON Schema means that we do not need to invest effort on inventing
our own schema language. As a consequence of the popularity of JSON Schema, we
can often rely on existing tooling instead of implementing our own parsers,
validators, code generators and UI generators for all the programming languages
that our community might be interested in.

JSON Schema has proven to be a foundational block for creating higher-level
tooling that is specific to our needs. As a notable example, the W3C Web of
Things community has developed a tool that makes use of JSON Schema definitions
inside Thing Descriptions to generate matching payloads for the purpose of
stress and penetration testing.

Given the growing popularity of using JSON Schema to generate web-based forms,
W3C Web of Things specifications can be used to automatically generate
dashboards and user interfaces to interact with the objects modeled by Thing
Descriptions.

## Key Impact Results

The ultimate metric of success for a standard like the W3C Web of Things is
adoption, and community adoption is not something you can just "engineer".
Because we adopt JSON Schema, developers who are familiar with it have a
smaller learning curve when learning the W3C Web of Things standard.

## W3C Web of Things

World Wide Web Consortium (W3C) is the standardization organization behind most
of the standards used in the Web. We are the Web of Things Working and Interest
Groups, who work on the standardization of Web of Things at the W3C.

We aim to create an interoperability layer so that different Internet of Things
platforms, protocols and standards can operate together.

The work has started as a discussion in the Web of Things Community Group in
2013-2014.  It has proceed to an Interest Group in 2015 that has collected the
use cases and defined the standards to be worked on. Since 2016, the working
group is working on different standards on the Web of Things with the first
publications of the Thing Description and Architecture recommendations in 2019.

At the time of this writing, our Working Group consists of 96 participants
representing 36 organizations and the our Interest Group consists of 131
participants representing 48 organizations. 

![W3C Web of Things Examples](/blog/img/posts/2022/w3c-wot-case-study/wot-examples.webp)

## Getting Started

We invite you to leverage your existing JSON Schema knowledge to play with the
Internet of Things through the use of our specifications and tools. You might
already have a smart device next to you that does not come with a Thing
Description!

If you write your own Thing Description, you can programatically interact with
your device by using our [Node.js Web of Things
implementation](https://github.com/eclipse/thingweb.node-wot), or play with it
through our [Node-RED](https://www.youtube.com/watch?v=oAcYbJ6P9bU)
integration.

To learn more, head over to our
[documentation](https://www.w3.org/WoT/documentation/), watch our [introductory
videos](https://www.w3.org/WoT/videos/), have a look at the many examples
provided as part of the [Thing Description specification](thing-description)
and try them out on the [Thing Description
Playground](http://plugfest.thingweb.io/playground/) app.

[thing-description]: https://www.w3.org/TR/2020/REC-wot-thing-description-20200409/
[saref]: https://saref.etsi.org
[units-of-measure]: https://bioportal.bioontology.org/ontologies/UO
[schema-org]: https://schema.org
