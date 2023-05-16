---
title: "A Few Lessons Learned (Re)writing a Referencing Implementation"
date: 2023-04-12
tags:
  - tooling
type: Engineering
cover: /img/posts/2023/referencing-implementation/pexels-lifepatiently-10394012.webp
authors:
  - name: Julian Berman
    photo: /img/avatars/julian.webp
    link: https://mastodon.social/@JulianWasTaken
    byline: JSON Schema Test Suite Maintainer & Technical Lead, API Specifications @Postman
excerpt: "Some pitfalls and lessons from writing a new referencing implementation for the Python ecosystem"
---

<!---
[comment]: # TODO: proofread
[comment]: # TODO: check voice (you, we, author)
[comment]: # TODO: interlink with the glossary
-->

I'd like to tell a brief tale of improving support for JSON Schema referencing in my [Python implementation](https://pypi.org/project/jsonschema/) of JSON Schema, which involved writing a [new implementation of the reference resolution bits](https://referencing.readthedocs.io/).
I can't tell the whole story, as some of it is still ongoing -- but retracing a bit of the journey might be useful to others, both schema authors and implementers.

What follows certainly contains opinions, and those specifically of the author. General familiarity with JSON Schema validation is also assumed.

# Referencing, in a Nutshell

Before I dive right in to nitty gritty details, let's review what referencing means in the context of JSON Schema.

*If you already have a good picture of what referencing is in the JSON Schema specifications you may want to skip down to the [implementation-specific bits](#ok-tell-me-about-the-implementation).*

There are a number of existing resources covering the topic, including [a section](/learn/getting-started-step-by-step.html#references) in the basic JSON Schema tutorial, [a page](https://json-schema.org/understanding-json-schema/structuring.html) in Understanding JSON Schema and a [number](/bundling-json-schema-compound-documents) [of](dynamicref-and-generics) [existing](validating-openapi-and-json-schema) [posts](/hyperborea) here on the blog.
The canonical resource is of course the specifications[^1] themselves, which divide discussion of referencing across a number of sections.

[^1]: "Specifications" in plural, as one of the keys, certainly for my own implementation, is the variance in referencing behavior between versions of JSON Schema.

But let's talk simple to start with two common examples of how schema authors use references in JSON Schema.

First -- you're writing a schema which contains some meaningfully reusable piece of validation logic.
For instance, consider some simple data like:

```json
{
  "order_id": 10000001,
  "item_quantity": 37,
}
```

representing someone ordering 37 products, or `{"order_id": 1000007, "item_quantity": 12}`, a second order of 12 products, from our imaginary business.
We wish to schematize these data, so we might try:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "order_id": {
      "type": "integer",
      "minimum": 0
    },
    "item_quantity": {
      "type": "integer",
      "minimum": 0
    }
  },
  "required": ["order_id", "item_quantity"]
}
```

which expresses that our data has the two properties mentioned, and that they must be integers bigger than 0 (along potentially with other properties which we haven't constrained).
Being good programmers, we notice some duplication -- we've twice attempted to express the notion of "positive integer" and repeated ourselves in doing so.
We wish to be able to name this concept (positive integer) and to use it in multiple places within our schema, just like naming a function we repeatedly call when writing a program.

Being able to take the *sub*-schema:

```json
{"type": "integer", "minimum": 0}
```

name or identify it somehow, and then use & reuse it from within our schemas is the fundamental problem that referencing addresses.
Our complexity in implementing support for this notion will come when dealing with all of the different places we might store our subschema, with slightly varying specified behavior across versions of JSON Schema, with the particulars of nailing down the "somehow" in "identify it somehow", and with doing all the above in a way that's both performant and easy enough to use.

## Getting a Bit More Specific

Still, before moving onto implementation details, let's consider a number of concrete examples taking our positive integer subschema, putting it somewhere, and referencing it from our "main" schema.

Perhaps the simplest thing we could hope for is to simply name our positive integer subschema `positiveInteger` as if it were a name or variable in a programming language, and then reference the name we've given it in various places, leaving everything else about our original schema unchanged.
Here's how to do so in Draft 2020-12 of the specification[^2]:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "order_id": {
      "$anchor": "positiveInteger",
      "type": "integer",
      "minimum": 1
    },
    "item_quantity": {"$ref": "#positiveInteger"}
  },
  "required": ["order_id", "item_quantity"]
}
```

[^2]: the most recent as of the publication of this article

There are 2 main bits to focus on which have changed -- the first will recur throughout the remainder of this post, which is the `$ref` keyword, which essentially is our way of "looking up" or "dereferencing" some subschema across all versions of JSON Schema.
The second is the `$anchor` keyword, which (in 2020-12) is our mechanism for giving our positive integer subschema a simple name[^3].
Once we have defined this name, we can reference it the second time we need it (in `item_quantity`) without repeating the contents of the subschema -- in other words, we get the same behavior as before, but with less duplication.

[^3]: often referred to as a "plain-name fragment" or "location-independent identifier"

If you haven't seen this previously, you might immediately ask yourself whether the below schema works the same way:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "order_id": {"$ref": "#positiveInteger"},
    "item_quantity": {
      "$anchor": "positiveInteger",
      "type": "integer",
      "minimum": 1
    }
  },
  "required": ["order_id", "item_quantity"]
}
```

where we've now put our anchor in the `item_quantity` property rather than in `order_id` -- and it does of course.
Which property we define the anchor in and which we use `$ref` within is irrelevant, and though we'll definitely see examples where this isn't the case, we can expect identical behavior here.

Something is a bit unsatisfying about the specific example above, where both properties "feel" equally important and that they should somehow look similar in the schema, even though as-is there seems to be some asymmetry with one defining the anchor and the other referencing it.
We want a place to put these subschemas we're reusing, separate from within properties themselves, and (again in 2020-12) this is the `$defs` keyword ("definitions") which simply gives us a place to stash away subschemas for reuse.
We could use it as such:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "order_id": {"$ref": "#positiveInteger"},
    "item_quantity": {"$ref": "#positiveInteger"}
  },
  "$defs": {
    "positiveInteger": {
      "$anchor": "positiveInteger",
      "type": "integer",
      "minimum": 1
    }
  },
  "required": ["order_id", "item_quantity"]
}
```

where now we feel a bit better about the symmetry.
Take note that the actual *property name* we used in `$defs` -- here itself `"positiveInteger"` is effectively *meaningless* for this example; we could have equally written `"$defs": {"foobar": {"$anchor": "positiveInteger", "type": "integer", "minimum": 0}}` and gotten exactly the same behavior (with a less descriptive name).
All that matters for these kinds of references is the name used in the `$anchor` keyword, and that name is specified to be unique all throughout the schema we've included it in, regardless of where it is physically positioned in the schema.

So what *is* the property name we used good for?
The answer is a second kind of reference, one known as a JSON *pointer*.
This kind of reference is in some ways the opposite of our position-irrelevant named reference, it puts the position of our subschema front and center.
Here's an example of one:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "order_id": {"$ref": "#/$defs/positiveInteger"},
    "item_quantity": {"$ref": "#/$defs/positiveInteger"}
  },
  "$defs": {
    "positiveInteger": {
      "type": "integer",
      "minimum": 1
    }
  },
  "required": ["order_id", "item_quantity"]
}
```

This `#/$defs/positiveInteger` syntax is our JSON pointer, and perhaps you can already guess at how it works.
It essentially allows us to *index* into our schema, essentially expressing "within this schema is a property called `$defs`, within that is a property called `positiveInteger`, and the value of that property is the subschema I want to reference".
Note that to do so, we still use the `$ref` keyword we previously used, just with a different looking value than before (one that contains slashes).
Again, functionally equivalent, but here we refer to our subschema positionally within the document by pointing to it.
Both plain name fragments and JSON pointers are useful for different scenarios of course, so one isn't better than the other, but these are the most basic kinds of references for us to deal with -- at least for referencing subschemas which live within some single larger schema.


## Base URIs and `$id`

The two of these kinds of fragments are essentially the two kinds of destinations that a `$ref` might point to, but where things get more complicated (for implementers and for users) is when we introduce the notion of base URIs, and more specifically the notion of tracking the base URI in nested schema documents.

# OK, Tell Me About the Implementation!

## Deciding Where to Call It Quits

There are a number of places where someone might decide to stop investing additional effort into the referencing-related portions of a JSON Schema tool.
The first major consideration here is that strictly speaking according to the specification, an implementer might provide no discovery of subschema resources whatsoever -- in other words. 
Similarly, given the differences across versions of JSON Schema, one could choose not to support multiple versions, or certainly not all versions.

A further example which is extremely common for those extending the JSON Schema specifications is in the creation or extension of dialects of JSON Schema.
Imagine for instance that one wishes to create a new keyword called `exactlyNOf` and make it available for use when writing schemas.
This `exactlyNOf` keyword will be similar to the (existing) `anyOf`, `oneOf` and `allOf` keywords but we wish for it to mean "exactly `n` of the given schemas match".

So for instance:

```json
{
  "exactlyNOf": {
    "schemas": [
      {"type": "integer"},
      {"const": "foo"},
      {"minimum": 37}
    ],
    "n": 2
  }
}
```

is a schema which we intend to validate successfully anthing matching exactly 2 of the schemas listed (and fail otherwise).
Getting what we want the behavior to be out of the way, the key referencing-related question is -- how do we handle discovering and making available subschemas present in `schemas` array.
Specifically, what do we expect this to do?

```json
{
  "exactlyNOf": {
    "$id": "urn:example:exactlyNOf",
    "schemas": [
      {"type": "integer"},
      {"const": "foo"},
      {"minimum": 37}
    ],
    "n": 2
  }
}
```

or how about:

```json
{
  "exactlyNOf": {
    "schemas": [
      {"$id": "urn:example:subschema", "type": "integer"},
      {"const": "foo"},
      {"minimum": 37}
    ],
    "n": 2
  }
}
```

Should they make the URIs `urn:example:exactlyNOf` and/or `urn:example:subschema` referenceable elsewhere via a `$ref` keyword?
Most users (of our new keyword) will likely expect them to be, and doing so is potentially useful for the same reasons it is useful for any existing keyword.
In order to do so, our referencing library or API needs a way of registering or expressing which *keywords* (or really keyword values) are to be interpreted as schemas, and therefore where should it recurse into when looking for `$id` keywords.
One could imagine even more elaborate examples of keywords, with even more complex structures for where within them contain schemas, so it can get hairy!

The above is yet again not outside the bounds of the specification at all (other than that of course the specification does not govern the behavior of our new keyword).
The specifications overtly encourage extension in this way, to support more complex use cases, to support experimentation of new keywords, to support domain-specific behavior, et cetera [^4].

[^4]: We ignore here discussions of JSON Schema vocabularies and whether the keyword should ideally be part of one, as such things don't really affect the referencing behavior mentioned.

Note that if we think about implementing this kind of discovery, one *cannot* simply recursively walk any and all properties collected throughout the schema.
The reasons for this are somewhat simple, consider the schema:

```json
{"const": {"$id": "foo"}}
```

which seems to contain an `$id` keyword, but the object it sits within is *not* interpreted as a JSON Schema, as the `const` keyword simply exactly matches an instance against its value as if it were an opaque JSON value.
Blindly collecting this `$id` keyword might incorrectly change the base URI (for any nested objects within the discovered value), or in the case of `$anchor` might incorrectly create duplicate anchors, or an incorrect anchor, or otherwise cause non-schemas to be treated as schemas by some other part of processing.

Even more importantly are users asking for functionality *beyond* that proscribed by the specification...

## Beyond the Specification

JSON Schema is, thankfully, quite widely used, and often used in ways "beyond" the strict letter of the JSON Schema specifications.
Arguably, this is a good thing, as though it puts pressure on both the specification maintainers as well as implementers, it also equally indicates JSON Schema's wide applicability and is useful as a feedback mechanism for JSON Schema's potential future growth areas.

Referencing in particular seems to be an area where users often want things beyond those mandated or proscribed by the specifications.

Users seem to often want to retrieve and reference schemas written in YAML or other file formats, to automatically retrieve schemas over the network [^5], to dynamically generate schemas, or to otherwise press the boundaries of what's strictly within the specified behavior.
There's plenty of complexity already, even in specified behavior -- but in a sense, it's understandable that most users care about this sort of flexibility much more than they do about edge cases from the specification (and about the correctness of their implementation under them).
So ideally an implementation would have both correct behavior under the specification as well as ways to allow users to do many of these things they want to do.

In the case of the `referencing` Python library that was the impetus for this post, the approach taken was to simply provide a general "retrieval" callback hook which could be used by users to lookup any URI which was not preconfigured.
In other words, by providing a callable themselves, users of the library can hook into the retrieval process to dynamically retrieve whatever they'd like.
A simplified example, where here a single resource is pre-loaded and additional schemas are dynamically loaded from TOML looks like:

```python
from pathlib import Path
import tomllib

from referencing import Registry
from referencing.jsonschema import DRAFT202012

ROOT_DIRECTORY = Path("/tmp/my-schemas/")

preloaded_resource = DRAFT202012.create_resource(
    {"type": "integer", "minimum": 37},
)

def load_from_toml(uri):
    path = ROOT_DIRECTORY / uri
    contents = tomllib.loads(path.read_text())
    return DRAFT202012.create_resource(contents)

registry = Registry(retrieve=load_from_toml).with_resource(
    uri="http://example.com/atLeast37/",
    resource=preloaded_resource,
)
```

This allows users who want the freedom to do things like "map http://example.com/ to a directory on my computer" if they choose to do so (within the retrieval callback), or to do any of the various things mentioned previously, all without a JSON Schema implementation needing to worry specifically about implementing these scenarios.

[^5]: despite the specification discouraging doing so. See e.g. [§8.2.3 from the 2020-12 specification](https://json-schema.org/draft/2020-12/json-schema-core.html#name-schema-references).

# Developing a Referencing Suite

We have a robust [test suite](https://github.com/json-schema-org/JSON-Schema-Test-Suite) for the JSON Schema specifications.
It covers huge portions of the validation behavior specified across versions of JSON Schema, and gets contributions from many implementers and spec contributors.

But despite how good it is, I felt it wasn't enough on its own to write a reliable referencing implementation, so I created a [suite specifically for referencing behavior](https://github.com/python-jsonschema/referencing-suite).
There were a couple of reasons for doing so:

* the validation test suite has known gaps in what it is *able* to represent.
  In other words, there are `$ref`-related things which we would love to test but which are not currently present in the validation test suite.
  A simple example today concerns tests which somehow tickle error conditions -- invalid schemas or more relevant, invalid references.
  A second concrete example is a test which ensures that assigns a *retrieval URI* of `urn:example:schema` to a schema with no `$id` and makes assertions about what an implementation does when resolving relative references within this schema.
  The precise reasons the validation suite cannot represent these examples today is sufficiently off-topic for this post to elaborate on, but suffice it to say it isn't purely for technical reasons, and has more to do with backwards compatibility concerns with messing with the specific format of tests within the validation suite, given how many implementations use it today (and may rely on "guarantees" that hold today within it).
  The new referencing suite here has a fresh slate.
* The validation test suite focuses very strictly on the "letter of the law" -- a great virtue in my opinion.
  Specifically, it aims to be widely runnable, such that nothing that's against the specification is contained in it of course, but things which are not strictly *required* by the specification are treated differently within it.
  If the specification grants room for *some* implementation to do something (i.e. uses MAY language), the test suite generally does too.
  I wanted a referencing suite that was slightly more opinionated -- again of course consistent with the specification, but also making a small number of value judgements beyond the specification for things which are technically allowed but I believed lead to worse user experience.
* starting from scratch meant I could carefully comb the specifications for tests, and be sure that as I built up an implementation that I had specific unit tests within the referencing suite for each change in behavior.
  This would be more difficult to do today with the validation test suite, which doesn't necessarily "order" tests in a way one might want when developing something from scratch.
* It's a second check -- doing so means I got extra confirmation that I was on the right track if all of my new tests passed *and* all of the validation test suite passed once I wired the referencing implementation up into a validator

All in all I think the two suites complement each other quite well -- and indeed I have hopes we can actually incorporate tests from the referencing suite to fill in gaps in the validation suite, perhaps even in an automated way (i.e. by cross-converting tests from one to the other).
But someone who is writing referencing tooling and *not* a validator implementation now has a second option![^6]

[^6]: Do note that as of today, the validation test suite has been reviewed and used by many more people!
      It's quite possible the referencing suite has issues, though my hope is it's made less likely by virtue of my implementation passing both suites simultaneously, as mentioned.

# How It Went

Things are still early, as the `referencing` library that was authored will remain in beta for a period to ensure the APIs it has are the right ones, and don't need any major overhauls if an issue is uncovered.
Early signs however are that things are significantly improved both for JSON Schema validation as well as for the prospect of future tooling in the Python + JSON Schema ecosystem.
[Bowtie](../bowtie-intro), which [reports on correctness of implementations](https://bowtie-json-schema.github.io/bowtie/), now reports all referencing related tests pass for `python-jsonschema`, a huge improvement over the previous implementation where approximately 15 tests were known to fail (mostly surrounding proper base URI tracking).
A number of users have already ported their code bases to use the `referencing`-based APIs successfully.
All in all, in the case of `python-jsonschema` and `referencing` specifically, more than *20* open issues were closed as part of the authoring of `referencing`, most having to do with either correctness issues or feature requests like the ones mentioned above (ones that were difficult to service using the old interfaces).

# Conclusion

I hope some of the above was insightful, or at least a good walkthrough of some of the ins and outs of supporting reference resolution in JSON Schema.
For Python programmers -- if you use the aforementioned Python implementation of JSON Schema, feedback on the new referencing APIs is very welcome, particularly to ensure it is flexible and correct enough before it is marked stable.
Similarly if you *develop* libraries in Python which might make use of this behavior, I'd love to hear about your experience attempting to integrate the [`referencing`](https://referencing.readthedocs.io) package into your own JSON Schema library or application.

Special thanks also must be given to [Postman](https://www.postman.com/) who employs me full-time to be able to do work like this on behalf of the community.
Without Postman, this work would never have happened!
I hope there's a lot more to come.
Please do share feedback, it's very welcome, and if you do want to get involved, that'd be very much appreciated!

Cover photo by Lifepatiently.
