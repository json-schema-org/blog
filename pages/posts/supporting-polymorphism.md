---
title: "Modelling Type Hierarchies"
date: 2022-09-21
tags:
  - annotations
  - type modelling
type: Engineering
cover: /img/posts/2022/supporting-polymorphism/cover.webp
authors:
  - name: Greg Dennis
    photo: /img/avatars/gregsdennis.webp
    link: https://twitter.com/gregsdennis
    byline: JSON Tooling Implementer, Specification & Tooling Architect @Postman
excerpt: ""
---

Continuing on the theme of my previous post on [how to support generic types with JSON Schema](dynamicref-and-generics), I'd like to cover what is probably the most-asked question:

> How can I model type inheritance with JSON Schema?

## Type Inheritance

For this post, "type inheritance" is the ability for one data type to be defined in such a way that it builds on top of another type.

Often inheritance is used as a mechanism for abstraction, but for our purposes, we want for focus on the case where multiple types have a set of common and related properties, which we can factor out as a base type.

To start, let's try to model some vehicles.

```c#
class Vehicle
{
    int PassengerCapacity { get; set; }
    string Make { get; set; }
    string Model { get; set; }
}

class Boat : Vehicle
{
    int MotorCount { get; set; }
    string Name { get; set; }
}

class Car : Vehicle
{
    int DoorCount { get; set; }
    double RangeInMiles { get; set; }
}
```

For these models, `Boat` and `Car` have the properties that are explicitly defined within their definitions, but they also both have all the properties that are defined by `Vehicle`.

When we put these in our API, people are going to be sending us JSON data that correspond with these models, and we want to develop some JSON Schemas to be able to validate the data as it comes in.

## Modelling with JSON Schema

As with any programming task, there are multiple ways these can be modelled.  Let's start simple and work toward a more advanced setup.

### Independent Models

The simplest way to define schemas for each of these types is just to have completely independent schemas for each one.

```json
{
  "id": "vehicle",
  "type": "object",
  "properties": {
    "passengerCapacity": { "type": "integer" },
    "make": { "type": "string" },
    "model": { "type": "string" }
  }
}

{
  "id": "boat",
  "type": "object",
  "properties": {
    "passengerCapacity": { "type": "integer" },
    "make": { "type": "string" },
    "model": { "type": "string" },
    "motorCount": { "type": "integer" },
    "name": { "type": "string" }
  }
}

{
  "id": "car",
  "type": "object",
  "properties": {
    "passengerCapacity": { "type": "integer" },
    "make": { "type": "string" },
    "model": { "type": "string" },
    "doorCount": { "type": "integer" },
    "rangeInMiles": { "type": "number" },
  }
}
```

This works, but independent models have a lot of repetition.  Additionally, if `Vehicle` is updated, `Boat` and `Car` don't get those updates.

### Don't Repeat Yourself

Instead of copying all of the `Vehicle` stuff to the other two, let's just reference it with `$ref`.

```json
{
  "id": "vehicle",
  "type": "object",
  "properties": {
    "passengerCapacity": { "type": "integer" },
    "make": { "type": "string" },
    "model": { "type": "string" }
  }
}

{
  "id": "boat",
  "allOf": [
    { "$ref": "vehicle" }
  ],
  "properties": {
    "motorCount": { "type": "integer" },
    "name": { "type": "string" }
  }
}

{
  "id": "car",
  "allOf": [
    { "$ref": "vehicle" }
  ],
  "properties": {
    "doorCount": { "type": "integer" },
    "rangeInMiles": { "type": "number" },
  }
}
```

Prior to draft 2019-09, schemas with a `$ref` were supposed to ignore any sibling keywords.  As a result, the recommended way to include them was to wrap them in an `allOf` as seen in these examples.  However since draft 2019-09, `$ref` can have sibling keywords, so the `allOf` isn't necessary.  I'm leaving it in for two reasons:

1. I don't specify a `$schema`, so implementations that only understand draft 7 will still be able to process these.
2. You could technically support multiple inheritance (e.g. implementing multiple interfaces in C#) by putting multiple `$ref`s in the `allOf`.

Also, notice that the `type` keyword has also been removed from the derived schemas.  The `$ref`'d schema validates this for us, so having `type` in the derives schemas is redundant.

### A Step Back to Think

At this point there are two things we might think of doing: requiring properties and disallowing properties we haven't declared.

#### Requiring Properties

Let's suppose for `Vehicle` that we require all of the properties.  That means that every instance **must** have `passengerCapacity`, `make`, and `model` present in the JSON.  However, it's common practice to omit properties if they don't have a value.  This isn't to say you _can't_ require them; just that it's less common to do so, which means consumers of whatever API this supports may find working with it more cumbersome.  Best practice is to generally follow the expectations of your consumers.

For kicks, let's see what adding `required` does to our type system.

```json
{
  "id": "vehicle",
  "type": "object",
  "properties": {
    "passengerCapacity": { "type": "integer" },
    "make": { "type": "string" },
    "model": { "type": "string" }
  },
  "required": [ "passengerCapacity", "make", "model" ]
}

{
  "id": "boat",
  "allOf": [
    { "$ref": "vehicle" }
  ],
  "properties": {
    "motorCount": { "type": "integer" },
    "name": { "type": "string" }
  },
  "required": [ "motorCount", "name" ]
}

{
  "id": "car",
  "allOf": [
    { "$ref": "vehicle" }
  ],
  "properties": {
    "doorCount": { "type": "integer" },
    "rangeInMiles": { "type": "number" },
  },
  "required": [ "doorCount", "rangeInMiles" ]
}
```

It doesn't seem like the type system is impacted much, if at all.  If I were to get JSON data that met the requirements of `boat`, it would also meet the requirements of `vehicle`.  The "is-a" relationship still works fine.

However, I think the reduced usability of not being able to omit properties hinders this approach enough that having `required` isn't worth it.

#### Disallowing Undeclared Properties

Disallowing undeclared properties serves two purposes.

First, we tend not to want junk in our data.  This also attempts to align the subtractive constraints model available in JSON Schema to the additive type definition models that are present in programming languages.  JSON Schema starts with "everything is valid" and narrows the valid space by adding constraints.  By disallowing _all_ undeclared properties, we, in effect, move (somewhat) to an additive model where declaring a property expands the valid space.

Second, JSON data (and YAML, if that's your thing) is often written by humans.  Humans make mistakes.  By disallowing undeclared properties, we protect against mistakes like mistyping property names.  (This kind of protection is a surprisingly common request.)

There are two keywords that are typically cited to help, and they work subtly differently: `additionalProperties` and `unevaluatedProperties`.

`additionalProperties` works by validating any properties left behind by `properties` and `patternProperties`.   The limitation is that it can't "look inside" of subschemas defined in keywords like `allOf`, `anyOf`, or `$ref`.  That means that this schema

```json
{
  "allOf": [
    {
      "properties": {
        "foo": true
      }
    }
  ],
  "additionalProperties": false
}
```

will fail any object with a property, even if that property is `foo`.  This presents a problem for our derived models because some of the properties we want to allow are defined in another schema (i.e. `vehicle`).

To support this "looking inside" other keywords behavior, we introduced `unevaluatedProperties` with draft 2019-09.  `unevaluatedProperties` does exactly the same thing as `additionalProperties` except that it can "look inside" subschemas of the schema object to which it belongs.  So this schema

```json
{
  "allOf": [
    {
      "properties": {
        "foo": true
      }
    }
  ],
  "unevaluatedProperties": false
}
```

will properly allow objects with a `foo` property because it can "see" the `foo` property declaration inside the subschema in `allOf`.

So let's add `"unevaluatedProperties": false` to our schemas and see what happens.

```json
{
  "id": "vehicle",
  "type": "object",
  "properties": {
    "passengerCapacity": { "type": "integer" },
    "make": { "type": "string" },
    "model": { "type": "string" }
  },
  "unevaluatedProperties": false
}

{
  "id": "boat",
  "allOf": [
    { "$ref": "vehicle" }
  ],
  "properties": {
    "motorCount": { "type": "integer" },
    "name": { "type": "string" }
  },
  "unevaluatedProperties": false
}

{
  "id": "car",
  "allOf": [
    { "$ref": "vehicle" }
  ],
  "properties": {
    "doorCount": { "type": "integer" },
    "rangeInMiles": { "type": "number" },
  },
  "unevaluatedProperties": false
}
```

Now, when you get JSON data for a boat

```json
{
  "passengerCapacity": 4,
  "motorCount": 2,
  "name": "S.S. Unevaluated"
}
```

validation... fails.  Why?

It's the `vehicle#/unevaluatedProperties`.  The `vehicle` schema doesn't know about the `motorCount` or `name` properties, so the `$ref` in `boat` fails now.

So maybe we just remove `unevaluatedProperties` from `vehicle`.  We know it's a base type and there will be extra properties from derive types, and we probably won't validate using that schema directly (only validate using `boat` and `car` which reference it), so it should be fine without that, right?

For now, yes.  But what happens when you want to derive from `boat` or `car`?  Do you remove `unevaluatedProperties` from those, too?  Where do you stop?

_**NOTE** This problem also exists when you try to link the schemas using `$dynamicRef`/`$dynamicAnchor` instead of `$ref`.  Verifying this is left as an exercise for the reader._

It doesn't seem like `unevaluatedProperties` is going to be viable for this specific use case.

So what now?  `unevaluatedProperties` was the best chance to support this model.  Indeed, this model is closely related to the purpose for which it was created: permitting properties to be declared in subschemas and referenced schemas.

Luckily, there was another, less advertised feature that made it into draft 2019-09, and it's actually the mechanism that the JSON Schema specification uses to explain how `unevaluatedProperties` works: annotations.

## Annotations and `unevaluatedProperties`

The specification states that `properties`, `patternProperties`, `additionalProperties`, and `unevaluatedProperties` all produce annotations of the collection of properties that each one validates (evaluates with a successful validation result).  `unevaluatedProperties` then reads the annotations that have been produced by the local schema object, its subschemas, and its referenced schemas, checks the instance for any properties which haven't been validated, and evaluates those.

Using the example from before

```json
{
  "allOf": [
    {
      "properties": {
        "foo": true
      }
    }
  ],
  "unevaluatedProperties": false
}
```

For the instance `{ "foo": 1 }`, the following would occur:

1. `/allOf/0/properties`
   1. evaluates `foo` to be valid
   2. produces an annotation of `[ "foo" ]`.
2. `/unevaluatedProperties`
   1. reads the annotation
   2. sees that `foo` has been evaluated, so that property is skipped
   3. sees that no other properties are present

Validation passes.

## Using Annotations to Help Model Polymorphism

The draft 2019-09 specification also recommends an output format that includes any annotations that are produced.  This means that the host application can use these annotations.

_**NOTE** The next version of JSON Schema will be updating the output formats to make annotations a bit easier to consume.  This post isn't going to go into this change, but you can read about it [here](fixing-json-schema-output)._

What we're going to do is set up our schemas so that the application can, after validation, determine whether any undeclared properties are present.  And it's actually really simple!

First, instead of adding `"unevaluatedProperties": false` to the schemas, we're going to add `"additionalProperties": true`.  This addition will allow any undeclared properties to pass validation, _but_ we get an annotation that includes those properties.

```json
{
  "id": "vehicle",
  "type": "object",
  "properties": {
    "passengerCapacity": { "type": "integer" },
    "make": { "type": "string" },
    "model": { "type": "string" }
  },
  "additionalProperties": true
}

{
  "id": "boat",
  "allOf": [
    { "$ref": "vehicle" }
  ],
  "properties": {
    "motorCount": { "type": "integer" },
    "name": { "type": "string" }
  },
  "additionalProperties": true
}

{
  "id": "car",
  "allOf": [
    { "$ref": "vehicle" }
  ],
  "properties": {
    "doorCount": { "type": "integer" },
    "rangeInMiles": { "type": "number" },
  },
  "additionalProperties": true
}
```

To verify this, let's look at that JSON data from before

```json
{
  "passengerCapacity": 4,
  "motorCount": 2,
  "name": "S.S. Unevaluated"
}
```

This now passes validation of `vehicle` because any undeclared properties are validated against the `true` schema, which just allows everything.

More importantly, we get annotations of any extra properties at each stage.

- From `vehicle#/additionalProperties`, we get `[ "motorCount", "name" ]` (properties that aren't in `vehicle`)
- From `boat#/additionalProperties`, we get `[ "passengerCapacity" ]` (properties that aren't in `boat`)

Okay... so each schema reports the properties that aren't declared _by that schema_.

Let's also look at what comes from evaluating data that has an extra property:

```json
{
  "passengerCapacity": 4,
  "motorCount": 2,
  "name": "S.S. Unevaluated",
  "unwanted": "this shouldn't be here"
}
```

Annotations produced when evaluating this are:

- From `vehicle#/additionalProperties`, we get `[ "motorCount", "name", "unwanted" ]`
- From `boat#/additionalProperties`, we get `[ "passengerCapacity", "unwanted" ]`

This reveals that undeclared properties will appear in all of the `additionalProperties` annotations.  From this, we can deduce the rule:

> If the intersection of all of the `additionalProperties` annotations is empty, we have no extra properties.

So after validation finishes, in our application code, we just need to check for `additionalProperties` annotations and intersect them.  If we get an empty array, the data is good; if we get a non-empty array, the data contained something we didn't want.

## Conclusion

While `unevaluatedProperties` doesn't completely solve the needs of modelling polymorphism, annotations, combined with some post-evaluation processing, absolutely can.  There are two requirements to get this to work:

1. You **must** be using an implementation that support annotations.  While the number of implementations that do is growing, that number is quite small at this point.  (If you have an implementation that doesn't support annotations, please consider it.)
2. You're going to need to do some processing of the evaluation results.  Validation alone isn't going to be able to handle this.
