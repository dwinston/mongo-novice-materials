---
layout: page
title: Using MongoDB
subtitle: Find Data
minutes: 10
---
> ## Learning Objectives {.objectives}
>
> * Query by a top-level field
> * Project to get only the fields you need
> * Query by a field in an embedded document
> * Query by a field in an array

You can use the `find()` method to issue a query to retrieve data from a collection in MongoDB. All queries in MongoDB have the scope of a single collection.[^1]

[^1]: Much of the format and language of this lesson from here on out borrow heavily (and occasionally are copied) from mongodb.org's [Getting Started](https://docs.mongodb.org/getting-started/python/) guide, available under the terms of a [Creative Commons License](http://creativecommons.org/licenses/by-nc-sa/3.0/).

Queries can return all documents in a collection or only the documents that match a specified filter or criteria. You can specify the filter or criteria in a document and pass it as a parameter to the `find()` method.

The `find()` method returns query results in a cursor, which is an iterable object that yields documents.

### Gotta catch 'em all

To return all documents in a collection, call the `find()` method without a criteria document.

~~~
db.materials.find()
~~~
~~~{.output}
{ "_id" : ObjectId("5703e9efbd8ea237cdace249"), "spacegroup" : { "source" : "spglib", "crystal_system" : "monoclinic", "hall" : "-P 2yab", "number" : 14, "symbol" : "P2_1/c", "point_group" : "2/m" }, "nelements" : 3, "pretty_formula" : "La2SiO5", "material_id" : "mp-5152", "elasticity" : null, "elements" : [ "La", "O", "Si" ], "chemsys" : "La-O-Si" }
{ "_id" : ObjectId("5703e9efbd8ea237cdace24a"), "spacegroup" : { "source" : "spglib", "crystal_system" : "cubic", "hall" : "-P 4 2 3", "number" : 221, "symbol" : "Pm-3m", "point_group" : "4/mmm" }, "nelements" : 1, "pretty_formula" : "Fe", "material_id" : "mp-568345", "elasticity" : null, "elements" : [ "Fe" ], "chemsys" : "Fe" }
...
Type "it" for more
~~~

Conveniently, the mongo shell will yield several documents from the cursor for you without trying to dump everything. You can type "it" to **it**erate over more of the results if you want.

### Query by a top-level field

Our documents have a field indicating the number of chemical elements in the corresponding material. Let's find documents whose **nelements** field equals **3**:

~~~
db.materials.find({nelements: 3})
~~~
~~~{.output}
{ "_id" : ObjectId("5703e9efbd8ea237cdace249"), "spacegroup" : { "source" : "spglib", "crystal_system" : "monoclinic", "hall" : "-P 2yab", "number" : 14, "symbol" : "P2_1/c", "point_group" : "2/m" }, "nelements" : 3, "pretty_formula" : "La2SiO5", "material_id" : "mp-5152", "elasticity" : null, "elements" : [ "La", "O", "Si" ], "chemsys" : "La-O-Si" }
{ "_id" : ObjectId("5703e9efbd8ea237cdace24d"), "spacegroup" : { "source" : "spglib", "crystal_system" : "trigonal", "hall" : "-P 3 2=", "number" : 164, "symbol" : "P-3m1", "point_group" : "-3m" }, "nelements" : 3, "pretty_formula" : "Er2SO2", "material_id" : "mp-12671", "elasticity" : null, "elements" : [ "Er", "O", "S" ], "chemsys" : "Er-O-S" }
...
Type "it" for more
~~~

Note the presence of an **elements** field that lists chemical elements. While we could formulate an equilavent query that derives our query condition as a function of existing document properties, e.g.

~~~
db.materials.find({$where: function() { return this.elements.length === 3; }})
~~~

, we instead *denormalize* (a fancy word for "duplicate") our data in a way
that makes a common query pattern (let's say this query is common) both simple
to express and efficient to process -- simple properties can be *indexed*,
whereas a `$where` query, as you might imagine, must evaluate a function on
every document in a collection. Denormalization can be tricky, i.e. one must
ensure that "derived" fields are kept up-to-date with their sources of truth
when the latter are updated, but many feel that the extra bookkeeping is worth
the benefits to usability and performance.

### Projection to select fields

That last query returned all fields for each document. We can use a projection, specified as JSON, to indicate which fields we want. Let's yield a few material ids.

~~~
db.materials.find({},{material_id: 1})
~~~
~~~ {.output}
{ "_id" : ObjectId("5703e9efbd8ea237cdace249"), "material_id" : "mp-5152" }
{ "_id" : ObjectId("5703e9efbd8ea237cdace24a"), "material_id" : "mp-568345" }
{ "_id" : ObjectId("5703e9efbd8ea237cdace24b"), "material_id" : "mp-1703" }
...
Type "it" for more
~~~

The `_id` field is included by default -- we must be explicit if we don't want it returned:

~~~
db.materials.find({},{_id: 0, material_id: 1})
~~~
~~~ {.output}
{ "material_id" : "mp-5152" }
{ "material_id" : "mp-568345" }
{ "material_id" : "mp-1703" }
...
Type "it" for more
~~~

Let's combine what we've learned so far about querying by a top-level and projecting to select fields:

~~~
db.materials.find({nelements: 3}, {material_id: 1, pretty_formula: 1, _id: 0})
~~~
~~~ {.output}
 "pretty_formula" : "La2SiO5", "material_id" : "mp-5152" }
{ "pretty_formula" : "Er2SO2", "material_id" : "mp-12671" }
{ "pretty_formula" : "Fe4O7F", "material_id" : "mp-780541" }
...
Type "it" for more
~~~

### Query by a field in an embedded document

To specify a condition on a field within an embedded document, use dot notation. Dot notation requires quotes around the whole dotted field name. This time, let's also chain the `count()` method to the cursor to return only a count of the number of documents that match the query filter document:

~~~
db.materials.find({"spacegroup.crystal_system": "cubic"}).count()
~~~
~~~ {.output}
9408
~~~

Projection can take advantage of the same dot notation:

~~~
db.materials.find({nelements: 2}, {"spacegroup.crystal_system": 1, elements: 1, _id: 0}).limit(3)
~~~
~~~ {.output}
{ "spacegroup" : { "crystal_system" : "cubic" }, "elements" : [ "Yb", "Zn" ] }
{ "spacegroup" : { "crystal_system" : "cubic" }, "elements" : [ "B", "Lu" ] }
{ "spacegroup" : { "crystal_system" : "orthorhombic" }, "elements" : [ "Se", "U" ] }
~~~

We also demonstrated another cursor method, `limit()`, that limits the number of documents yielded by the cursor to a specific number. While this is unnecessary when working in the mongo shell because of the 'Type "it" for more' functionality, `limit()` comes in handy when fetching results programmatically if only a limited number of results are needed by your application.

### Query by a field in an array

How many materials in our collection contain iron ("Fe")? When a MongoDB field is an array, testing for membership has the same form as testing for equality:

~~~
db.materials.find({elements: "Fe"}).count()
~~~
~~~ {.output}
5813
~~~

If you supply an array as the value under test, we can see that four forms ("polymorphs") of elemental iron are present in our collection:

~~~
db.materials.find({elements: ["Fe"]}).count()
~~~
~~~ {.output}
4
~~~

It may be more natural for you to express the above condition the following way:

~~~
db.materials.find({elements: "Fe", nelements: 1}).count()
~~~
~~~{.output}
4
~~~

> ## Dot Notation and Projections {.challenge}
>
> Which query below yields documents containing the crystal system and spacegroup number for all exactly-two-element-containing ("binary") compounds?
>
> A. `db.materials.find({nelements: 2}, {spacegroup: {crystal_system: 1, number: 1}})`
>
> B. `db.materials.find({nelements: 2}, {"spacegroup.crystal_system": 1, "spacegroup.number": 1})`

> ## Combining Conditions {.challenge}
>
> Which query below returns the number of oxygen-containing, two-element materials ("binary oxides") in our collection?
>
> A. `db.materials.find({elements: "O"}).limit(2).count()`
>
> B. `db.materials.find({elements: "O", nelements: 2}).count()`
>
> C. `db.materials.find({elements: ["O"], nelements: 2}).count()`
