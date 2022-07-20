---
title: "Experimenting with Output"
date: 2022-07-23
tags:
  - Engineering
  - Future
type: Community
cover: /img/posts/2022/and-then-there-were-three/cover.webp
authors:
  - name: Greg Dennis
    photo: /img/avatars/gregsdennis.webp
    link: https://twitter.com/gregsdennis
    byline: JSON Tooling Implementer, Specification & Tooling Architect @Postman
excerpt: ""
---

I have a problem: when I read GitHub issues, they occasionally resonate with me, and I obsess about them until they're resolved.  That may not sound like a problem to some, but when that resolution causes JSON Schema implementation developers to ask fundamental design questions for three years... yeah, that's a problem.

And that's precisely what happened coming out of draft 2019-09.  For this version of the specification we released the very first official output format.  It was actually multiple formats that were supposed to cater to multiple needs.

- While most people wanted to know what the errors were, some just wanted a pass/fail result, so we created the `flag` format.
- Among those who wanted some more detail about what actually failed, some preferred a flat list, while others figured a hierarchy that matched the schema would work better.  So we created `basic` for the list people.
- Finally of those that wanted a hierarchy, some wanted a condensed version (which became `detailed`), and others wanted the fully-realized hierarchy (`verbose`).

***ASIDE** Some people wanted a hierarhy that mimicked the instance data, but we couldn't figure out how to make that work in a realistic way, so we just kinda swept it under the rug and moved on.*

## Adding stuff to the spec

At the time, I hadn't contributed anything major to the spec, but I'd been pretty involved in making direction-type decisions, so I thought I'd take a crack at authorship.  That's not to say that I hadn't contributed _any_ text to the spec; just not anything significant.

So I spent a couple weeks writing up a new section on output.

Man, I thought I had everything!  I defined the properties, the overall structure, validation examples, and I wrote it all in that wonderful spec-ese that we all love.

I even implemented it in my library, Manatee.Json, before the spec was released just to make sure that it worked.

But I missed something: annotations.  I mean, I considered them, and provided requirements for them.  But I didn't provide an example of the results from a passing instance that generated annotations.  I guess _technically_ I did, but it was buried, nested way down inside the `verbose` example, which happened to be so big that I decided it needed to be in its own file, separate from the specification document.  (Yeah, like anyone was gonna read _that_.)

(I haven't even mentioned the "algorithm" I defined to reduce a `verbose` result to the condensed `detailed` format.)

The highlight of the following years would be the numerous questions I would receive regarding confusion about the output, mainly around how annotations should be represented.  And my response to these questions wasn't great either:  "They're in the output just like errors."  I thought it was a trivial exercise.

Fortunately, we listed the output as a whole as a "SHOULD" requirement, so implementations weren't _required_ to do it.  The idea behind this was that we were in the early stages of defining it and we didn't want to put too much of a burden on implementations knowing that we were likely going to tweak it in future releases.

## Tasting my own medicine

It wasn't until I decided to deprecate Manatee.Json to build JsonSchema.Net _the way the spec said_ (i.e. using annotations as messages between keywords) that I realized why everyone was asking questions about the output.  Having to reimplement the output opened my eyes.

Wow.  I left out a lot!

Knowing what I originally intended helped me quite a bit, but I can't imagine what it must have been like trying to implement what I wrote while not also having written it.

So, I started taking notes.

## Time for an update

Draft 2020-12 had come and gone, and I decided to do something about the output.  I created this mess, and it was my responsibility to clean it up.  (Now it's actually my job to clean it up!)  I organized all of my notes and dumped out a [massive opening discussion comment](https://github.com/orgs/json-schema-org/discussions/63) on improvements that I think could be made to the formats.

First up was a isolating purpose for and renaming some of the output properties.  These properties served a purpose, but [naming things is hard](https://martinfowler.com/bliki/TwoHardThings.html), and the names for these could be better.  This one got a quick-n-easy PR that's already been merged, so that's one thing done.

You can read the dicussion for the rest of the proposed changes, but at some point in the discussion, I had an epiphany, and I now wonder how many of the other changes still apply.

The epiphany was this:  Why is the output designed to capture errors and annotations from individual keywords instead of from subschemas when it's the subschemas that ultimately collect errors and annotation and provide the final result?

In my next post, we'll dig into what I mean by this (with some examples) and the consequences of this difference from the viewpoint of the specification. We'll also cover some of the unexpected benefits I discovered while implementing it in JsonSchema.Net.