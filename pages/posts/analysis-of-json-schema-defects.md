---
title: "An Analysis of JSON Schema Defects"
date: 2023-09-10
tags:
  - Specification
type: Opinion
cover: /img/posts/2023/analysis-of-json-schema-defects/cover.webp
authors:
  - name: Fabien Coelho
    photo: /img/avatars/fabien.jpg
    link: https://www.linkedin.com/in/fabien-coelho-65433a18/
    byline: Professor in Computer Science
  - name: Claire Medrala
    photo: /img/avatars/claire.jpg
    link: https://www.linkedin.com/in/claire-medrala/
    byline: Research Engineer
excerpt: Evidences show that schemas are hard to write, and suggest changes in the spec
---

We have studied the quality of available public schemas
(see [paper](https://www.cri.minesparis.psl.eu/classement/doc/A-794.pdf)) through static analysis.
Over **60%** of schemas are shown to have some type of defects, resulting in
unintended data to be validated, risking system breakage or even cybersecurity issues.
These findings suggest key changes in JSON Schema specification which would block most
of encountered defects.
The recommended changes go beyond [Last Breaking Change](/blog/posts/the-last-breaking-change).

## Common Defects

Defects come mostly from JSON Schema lax independent keywords and loose defaults.
Mistyping, misnaming, misspelling or misplacing a keyword simply results in the
keyword being silently ignored.

Consider the following schema extract (line 614 of
[.NET Template](https://json.schemastore.org/template.json)), where `uniqueItems`
applies to a string, thus is ignored: 

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
where `propertyNames` applies to a string and is also ignored.

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
the misplaced `additionalProperties` is taken as a forbidden property name.

```json
{
  "type": "object",
  "properties": {
    "image": { "type": "string" },
    "additionalProperties": false
  }
}
```

We have found many other issues in our corpus of *57,800* distinct schemas.
Users have a hard time remembering the 60 keywords and writing schemas.
We think that this can be significantly improved with limited changes to
the spec.

## Recommendations

Based on these evidences, we recommend to tighten the JSON Schema specification
by adding restrictions to keyword occurences:

- type declarations, either explicit (`type`), implicit (`enum`, `const`, `$ref`),
  or through combinators (`allOf`, `anyOf`, `oneOf`) should be mandatory and appear
  only **once**, i.e. these keywords should be exclusive.
- type declarations should be simple scalars, i.e. union can only be achieved with combinators.
- type-specific keywords must appear only with their type, at the same level.
- unknown keywords must be rejected, although there should be some place for extensions,
  eg with prefixed property names such as `x-*`.
- about 20 seldom-used keywords could be removed.

With these rules, the first two examples above become illegal.
These changes result in schema descriptions which are easier to understand and
maintain.
Although some description tricks are not possible anymore with these
restrictions, we believe that they bring a dignificant software engineering benefit.

Moreover, many existing schemas already conform to these restrictive rules and
would not need to be changed at all.

## References

- [Research Paper](https://www.cri.minesparis.psl.eu/classement/doc/A-794.pdf)
- [Corpus](https://github.com/clairey-zx81/yac)
- [Tools](https://github.com/clairey-zx81/json-schema-stats)
- [JSON Model](https://github.com/clairey-zx81/json-model)

_Cover photo by [Arnold Francisca](https://unsplash.com/@clark_fransa) on [Unsplash](https://unsplash.com/photos/f77Bh3inUpE)_
