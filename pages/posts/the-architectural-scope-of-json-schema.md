---
title: "The Architectural Scope of JSON Schema"
date: 2022-07-15
tags:
  - Update
  - News
type: Community
cover: /img/posts/2022/the-architectural-scope-of-json-schema/cover.webp
authors:
  - name: Greg Dennis
    photo: /img/avatars/gregsdennis.webp
    link: https://twitter.com/gregsdennis
    byline: JSON Tooling Implementer, Specification & Tooling Architect @ Postman
excerpt: "What actually _is_ JSON Schema?!"
---

Recently, I've had a few conversations that got me thinking about JSON Schema's place architecturally.  Today I'd like to share some of those thoughts.

## What _is_ JSON Schema?

JSON Schema is a specification that defines a system of a set of behaviors that can be used to determine whether a JSON value meets certain rules, as well as how those rules can be expressed.

A single set of rules comprises a "schema."

This system takes an input of a schema, which itself is representable as a JSON value, and a JSON value (which we call the "instance") to which the rules in the schema will be applied.  For the purposes of this post, we'll call the application of these rules "evaluation."  (i.e. A schema "evaluates" an instance.)

The output of an evaluation is an aggregation of the individual results of each of the rules.

However, in general, a system of behaviors is somewhat abstract, and so it's not practically useful.  What we need is a realization of this system in code.  What we need is an implementation.

## Making JSON Schema useful

Before we can make JSON Schema useful, we need to ask who it should be useful for.  To answer _that_ we need to know why JSON Schema exists in the first place.

Well, we visited that in the previous section: a schema evaluates an instance to ensure that the instance complies with all of the rules represented by the schema.  If the instance does comply with the rules in the schema, then we say it is "valid" against that schema.

The reasons to ensure we have valid JSON data could be numerous: checking data before deserializing into programmatic models, checking form inputs before submission, etc.  **These are the needs of applications.**

So _applications_ are the consumers of JSON Schema.

But an application can't consume a specification without that specification being realized into code.  That's where implementations come in.

An implementation of JSON Schema is an embodiment of the specification that is directly consumable by an application.

## A nuance

Something I've seen a lot of lately, and I think the source of some of the confusion that has arisen in my discussions, is that many implementations are embedded into applications in such a way that they are inseperable from that application (at least, not without a lot of work).  This tends to give the appearance that the application itself is the implementation.  But I don't see it that way.  Even in these cases, there exists a distinction between the application and the implementation, even if that distinction is, in practice, really blurry.

Applications tend to have three basic components:  an interface (UX or API), some business logic, and data persistence.  **All** applications have an interface.  However, the business logic and data persistence components are optional to the degree that you can have one or the other or both.  (An application with only a UX is generally not very useful.)

An application may only provide an interface over data persistence (e.g. a Postgres web service), meaning that there's no need for any business logic.  Conversely, another application may provide a computational service (e.g. image processing) where there's no need to persist data.

For the recent conversations I've had, this second scenario seems to be the case: an implementation has been created _as_ an application that just evaluates instances against schemas.  But the unification of the application and implementation doesn't mean that they *are* the same thing.

These applications can be refactored so that the business logic (the implementation) is completely separate from the interface.  And it's important to recognize that JSON Schema as a specficiation can only cover the implementation part.

## Why any of this matters

It all comes back to what I touched on this in the opening section: JSON Schema needs to define inputs and outputs.  This comprises a minimal API that implementations and applications can use to communicate with each other.

When the line between implementation and application is blurred, it's natural to think that the specification is imposing requirements on how the application communicates with its users.  But that's not the case.

It is impossible for JSON Schema to know the needs of an application's users, and so it's impractical for the specification to attempt to define input and output to which applications must adhere.

Users of different applications have different needs.  Even when you consider two applications that essentially just provide a UX for implementations, say a web app and a CLI, the UX needs of their users are vastly different, despite the two applications doing basically the same thing.

## The scope of the specification

As a result of everything discussed above, it follows that the specification's input and output requirements are only applicable when there is a clear communication seam between an application and a JSON Schema implementation.

The specification recognizes that programming languages and frameworks likely will not be dealing with textual JSON, but rather they will use data models defined within the limitations of that language.  As such, it defines input and output in terms of the abstract JSON data model so that implemenations are free to use what they have at their disposal.

Specifically, these requirements only pertain to standalone implementations that are provided as general-use representations of the JSON Schema specification to be consumed by unknown parties.

Applications which have integrated implemenations or application/implemenatation pairs which have specialized contracts need not adhere to these requirements because these arrangements are out of scope of the specification.

_Cover photo by me_ 😁