---
title: "An Analysis of JSON Schema Defects"
date: 2023-09-26
tags:
  - Specification
type: Opinion
cover: /img/posts/2023/analysis-of-json-schema-defects/cover.webp
authors:
  - name: Fabien Coelho
    photo: /img/avatars/fabien.jpg
    link: https://www.linkedin.com/in/fabien-coelho-65433a18/
    byline: Professor in CS
  - name: Claire Medrala
    photo: /img/avatars/claire.jpg
    link: https://www.linkedin.com/in/claire-medrala/
    byline: Research Engineer
excerpt: Evidences suggest that schemas are hard to write, and possible changes to the spec
---

## Context

While teaching back-end programming at [Mines Paris](https://minesparis.psl.eu/),
an engineering school which is part of [PSL University](https://psl.eu/), we have
looked at how JSON data could be validated when transfered from a front-end (eg react-native)
to a back-end (eg a REST API with Flask) and to storage (eg a Postgres database).

We have stumbled upon JSON Schema, and our investigation lead to an *academic* study
which analyses many schemas, finds common defects, and propose changes to the spec
which would rule out syntactically most of these defects, at the price of some
contraints. The results are described in
[this paper](https://www.cri.minesparis.psl.eu/classement/doc/A-794.pdf).

More precisely, the methodology consisted in
- reading all versions of the specs (yes, really!),
- collecting all the public schemas we could find (especially aggregating corpura from prior academic studies),
- writing several tools to analyze schemas and report *definite* or *probable* defects,
- looking at the reported defects to try to guess *why* these defects are there
  (most of the time some typo, a misplaced `}`, some type errors…),
- thinking about what changes in the spec could rule out these schemas, while
  still allowing to describe useful JSON data structures.

Overall, the quality of publicly available schemas is… not great:
Over **60%** of schemas are shown to have some type of defects, resulting in
the worst case in unintended data to be validated, possibly risking system breakage
or even cybersecurity issues.

The changes we recommend go beyond [Last Breaking Change](/blog/posts/the-last-breaking-change),
and somehow change the philosophy of the specification, so can be perceived as controversial.
However they reach their target, which is to turn most defects into errors.
Although the added restrictions would require to update some existing schemas, we found
that a significant number of public schemas already conform to our proposed restrictions.

## Common Defects

Defects come mostly from JSON Schema lax independent keywords and loose defaults:
With JSON Schema, there is *no* constraint on where you put valid keywords, and
unknown keywords are silently ignored for ensuring *upward* compatibility.
As a result, mistyping, misnaming, misspelling or misplacing a keyword simply
results in the keyword being silently ignored, and these unintentional errors
tend to stay in schemas without being ever detected.

In the worst case, schemas may not be satisfiable at all. Consider for
instance this schema (Ansible 2.5), where both allowed values are integers,
which mean that it will always fail when checking that they are also strings:

```json
{
  "type": "string",
  "enum": [ 80, 443 ]
}
```

Other defects manifest themselves as ignored keywords.
Consider the following schema extract (line 614 of
[.NET Template](https://json.schemastore.org/template.json)), where `uniqueItems`
applies to a string, thus is ignored, and should have been attached to the upper
level:

```json
{
  "type": "array",
  "items": {
    "type": "string",
    "uniqueItems": true
  }
}
```

Or this extract (line 55 of
[Azure Device Update Manifest](https://json.schemastore.org/azure-deviceupdate-manifest-definitions-4.0.json)),
where `propertyNames` applies to a string thus is also ignored, and should also be moved upward to
be effective.

```json
{
  "type": "object",
  "additionalProperties": {
    "type": "string",
    "propertyNames": {
      "minLength": 1,
      "maxLength": 32
    }
  }
}
```

Or this extract (line 443 of [Fly](https://json.schemastore.org/fly.json)), where
the misplaced `additionalProperties` is taken as a forbidden property name instead
of applying to the surrounding object.

```json
{
  "type": "object",
  "properties": {
    "image": { "type": "string" },
    "additionalProperties": false
  }
}
```

We have found many such issues in our corpus of *57,800* distinct schemas.
We think that this could be significantly improved with limited although bold
changes to the spec.

## Recommendations

Based on these evidences, we recommend to tighten the JSON Schema specification
by adding restrictions to keyword occurences. The strictest version of these
proposed changes are:

- type declarations, either explicit (`type`), implicit (`enum`, `const`, `$ref`),
  or through combinators (`allOf`, `anyOf`, `oneOf`) should be **mandatory** and appear
  only **once**, i.e. these keywords should be **exclusive**.
- type declarations should be simple scalars, i.e. union could only be achieved
  with combinators.
- type-specific keywords must appear only with their `type`, at the same level.
- unknown keywords must be rejected, although there should be some allowance for extensions,
  eg with prefixed property names such as `x-*`.
- about 20 seldom-used keywords could be removed, for various reasons:
  implementation complexity for `dynamicRef` and `dynamicAnchor`,
  understanding complexity for `if`/`then`/`else` (which can in most cases be removed),
  underusage for some others.

Note that other syntactic and semantic changes could help reduce the number of defects
by ruling out some cases but allowing others. Our proposal is simple (constraints
are in the syntax) and effective (most defects are ruled out).

With these rules, the first three examples above become illegal.
We think that such changes result in schema descriptions which are easier to
understand and maintain, and that validation could be more efficient.

Although some description tricks are not possible anymore with these restrictions,
we believe that they bring a significant overall software engineering benefit.
Moreover, many existing schemas already conform to these restrictive rules and
would not need to be changed at all.

## Caveats

This is an academic study, done by people who are fully  *independent* from the
JSON Schema community and the companies that support services around it.

From an academic perspective, it is very hard to dismiss some data because
it could be interpreted as if we would have kept only data which support some point of view,
which would constitute a bias. Thus we collected and analyzed all the schemas we could find.
If someone can provide other public sources, we will be very happy to rerun our
analysis and update our figures. In particular, we would love to extract schemas
from OpenAPI and other specs, but we have not found a simple way to scrap these yet.

Note that there is no magic: we can only analyse data that we can access.
Maybe the public schemas we found are somehow not representative, and the
picture could be different if we could access privately held schemas.
Well, we cannot say anything about what we cannot see!

The changes we propose may break some use cases.
However, which would be broken without a possible solution is unclear.

## References

- [Research Paper](https://www.cri.minesparis.psl.eu/classement/doc/A-794.pdf)
- [Corpus](https://github.com/clairey-zx81/yac)
- [Tools](https://github.com/clairey-zx81/json-schema-stats).

_Cover photo by [Arnold Francisca](https://unsplash.com/@clark_fransa) on [Unsplash](https://unsplash.com/photos/f77Bh3inUpE)_