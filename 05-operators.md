---
layout: page
title: Using MongoDB
subtitle: Specify Conditions with Operators
minutes: 10
---
> ## Learning Objectives {.objectives}
>
> * Introduce operators like $gt and $lt
> * Combine conditions (logical AND and OR)

### Operators

MongoDB provides operators to specify query conditions, such as comparison operators. Although there are some exceptions, such as the `$or` conditional operator, query conditions using operators generally have the following form:

    { <field1>: { <operator1>: <value1> } }

Let's first define a custom helper object to reduce the boilerplate necessary for "testing" a query document by projecting a few fields for inspection.

~~~
my_proj = {material_id: 1, pretty_formula: 1, _id: 0}
~~~

Because MongoDB queries and projections are expressed as JSON, one can
programmatically build them without resorting to string manipulation.

Let's find some materials with at least three elements. At the same time, we'll
demonstrate a simple example of "building" a projection document on-the-fly. In
this case, because we're in the mongo shell, we use the Javascript
language. `Object.assign` takes a "destination" object as its first argument,
successively merges the key-value pairs of subsequently provided "source"
objects into the destination object (overwriting if necessary), and returns the
destination object.

~~~
db.materials.find({nelements: {$gte: 3}}, Object.assign({nelements: 1}, my_proj))
~~~
~~~ {.output}
{ "nelements" : 3, "pretty_formula" : "La2SiO5", "material_id" : "mp-5152" }
{ "nelements" : 3, "pretty_formula" : "Er2SO2", "material_id" : "mp-12671" }
{ "nelements" : 3, "pretty_formula" : "Fe4O7F", "material_id" : "mp-780541" }
...
~~~

And some with fewer than ("**l**ess **t**han") 3:

~~~
db.materials.find({nelements: {$lt: 3}}, Object.assign({nelements: 1}, my_proj))
~~~
~~~ {.output}
{ "nelements" : 1, "pretty_formula" : "Fe", "material_id" : "mp-568345" }
{ "nelements" : 2, "pretty_formula" : "YbZn", "material_id" : "mp-1703" }
{ "nelements" : 2, "pretty_formula" : "LuB6", "material_id" : "mp-12660" }
...
~~~

### Combining Conditions

You can specify a logical conjunction (**AND**) for a list of query conditions by separating the conditions with a comma in the conditions document:

~~~
db.materials.find({chemsys: "Fe-O", "spacegroup.crystal_system": "cubic"}).count()
~~~
~~~ {.output}
7
~~~

You can specify a logical disjunction (**OR**) for a list of query conditions by using the `$or` query operator.

~~~
db.materials.find({
    $or: [{nelements: 2}, {nelements: 4}]
}).count()
~~~
~~~{.output}
27370
~~~

> ## Combining Operators for the Same Key {.challenge}
>
> Which query document will find compounds that have between 2 and 4 elements, inclusive?
>
> A. `{nelements: {$gte: 2, $lte: 4}}`
>
> B. `{nelements: {$gte: 2}, nelements: {$lte: 4}}`
>
> C. `{$or: [{nelements: {$gte: 2}}, {nelements: {$lte: 4}}]}`

> ## On Being and Essence {.challenge}
>
> MongoDB has [lots](https://docs.mongodb.org/manual/reference/operator/query/) of query (and projection!) operators. `$exists` asks whether or not a field is present in a document. For example,
>
~~~
db.materials.find({elasticity: {$exists: true}})
~~~
> might find  documents that contain information on a material's mechanical behavior in the elastic limit.
>
> What prints out? What did you expect? What happens when
>
~~~
{elasticity: {$ne: null}}
~~~
> is your query document (`$ne` is the query operator for "not equal")?

