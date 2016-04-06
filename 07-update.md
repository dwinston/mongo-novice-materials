---
layout: page
title: Using MongoDB
subtitle: Update Data
minutes: 10
---
> ## Learning Objectives {.objectives}
>
> * Update specific fields (top-level, embedded) in a single document
> * Update multiple documents at once

You can use the `update()` method to update documents of a collection. The `update()` method updates a single document by default. You can update all documents that match your criteria by passing an extra parameter. `update()` accept the following parameters:

* a filter document to match the documents to update,
* an update document to specify the modification to perform, and
* an options document setting parameters such as `upsert` and `multi`.

To change a field value, MongoDB provides [update operators](http://docs.mongodb.org/manual/reference/operator/update) to modify values. Some update operators, such as `$set`, will create the field if the field does not exist.

The following operation updates the first document in the Copper-Fluorine (**Cu-F**) chemical system (**chemsys**), using the `$set` operator to update the **tags** field and the `$currentDate` operator to update the **lastModified** field with the current date.

~~~
db.materials.update(
    {chemsys: "Cu-F"},
    {
        $set: {
            tags: ["halide"]
        },
        $currentDate: {lastModified: true}
    }
)
~~~
~~~{.output}
WriteResult({ "nMatched" : 1, "nUpserted" : 0, "nModified" : 1 })
~~~

The object returned reports the count of documents matched and modified.

~~~
db.materials.findOne({chemsys: "Cu-F"}, {tags: 1, lastModified: 1, material_id: 1})
~~~
~~~ {.output}
{
	"_id" : ObjectId("5703e9efbd8ea237cdacea45"),
	"material_id" : "mp-1229",
	"tags" : [
		"halide"
	],
	"lastModified" : ISODate("2016-04-05T20:33:44.917Z")
}
~~~

To update an embedded field, use the dot notation:

~~~
db.materials.update(
    {material_id: "mp-1229"},
    {$set: {"elasticity.calculations.source": "Private communication"}}
)
~~~
~~~ {.output}
WriteResult({ "nMatched" : 1, "nUpserted" : 0, "nModified" : 1 })
~~~

> ## Replacing a document versus updating fields {.callout}
> You must use `$set` to merely update fields but retain the rest of a document. The command
>```
>db.materials.update(
>    {material_id: "mp-1229"},
>    {"elasticity.calculations.source": "Private communication"}
>)
>```
> will *replace* the matched document with the object given as the second argument (the `_id` will be the same as that of the matched document).

The `update()` method updates a single document by default. To update multiple documents, pass `{multi: true}` as the third argument to `update()`. Let's tag all of the halides, where a halide is a two-element compound for which one part is a halogen atom and the other part is an element that is less electronegative than the halogen. Specifically, we will use the `$addToSet` update operator to add "halide" without duplication to a compound's **tags** array, creating the array if it does not exist.

First, let's generate a list of halide chemical systems. The [pymatgen](http://pymatgen.org/) Python package includes a JSON file, a copy of which you downloaded earlier, with basic information on chemical elements, including Pauling electronegativity ("X") if known. Let's load it into a new collection in our database:

~~~
exit
~~~
~~~{.output}
bye
~~~
~~~
# After exiting the mongo shell:
mongoimport periodic_table.json --db swc --collection periodic_tables
~~~
~~~{.output}
connected to: localhost
imported 1 document
~~~
~~~
# Re-enter the mongo shell:
mongo
~~~
~~~{.output}
MongoDB shell version: 3.2.3
connecting to: test
~~~
~~~
use swc
~~~
~~~{.output}
switched to db swc
~~~

The file contains a single object, where keys are chemical element symbols (e.g. "H" for hydrogen) and values are data for the corresponding element. Thus, we loaded it into a "periodic_tables" collection. Now, we need to do a bit of transformation to map the periodic table to a MongoDB collection of elements:

~~~
db.elements.drop(); // If it exists, drop it
pt = db.periodic_tables.findOne();
Object.keys(pt).forEach(function (symbol) {
  if (symbol === '_id') return;
  doc = {symbol: symbol};
  Object.assign(doc, pt[symbol]);
  db.elements.insert(doc);
});
~~~

If we added the lines `conn = new Mongo();` and `db = conn.getDB("swc");` to
the top of the last block, and saved it all to a file
(e.g. "makeElementsCollection.js"), we could then call
`load("makeElementsCollection.js")` from within the `mongo` shell to execute
the script and get the same result.

Now, let's use our new collection to define a function that returns a list of
halide chemical systems. The **chemsys** values in our materials collection are
sorted alphabetically, i.e. we say "Cu-F" rather than "F-Cu", so we have to
account for that. You are not expected to know the Javascript syntax for doing
this -- the point here is to demonstrate how a JSON data source can quickly be
ingested by MongoDB and how what you've learned so far about query operators
can be used effectively to find what we need from the data. You can do
something similar using your programming language of choice; Javascript is
convenient here because an interpreter for that language is built into the
mongo shell. You can copy-paste the following into your shell:

~~~
halogens = ["F", "Cl", "Br", "I", "At"]
function lessElectronegBinaries (symbols) {
  var elements = symbols.map(function (s) {
    return db.elements.findOne({symbol: s});
  });
  var systems = [];
  elements.forEach(function (elt) {
    db.elements.find({X: {$lt: elt.X}}).forEach(function (other) {
      systems.push([elt.symbol, other.symbol].sort().join("-"));
    });
  });
  return systems;
};
~~~

To demonstrate use of the function let's see which systems contain copper:

~~~
lessElectronegBinaries(halogens).filter(function (h) {
    return h.indexOf("Cu") !== -1;
})
~~~
~~~ {.output}
[ "Cu-F", "Cl-Cu", "Br-Cu", "Cu-I", "At-Cu" ]
~~~

Now, we're ready for the show. We use the `$in` query operator to test for membership of a compound's **chemsys** in our list of halide systems:

~~~
db.materials.update(
    {chemsys: {$in: lessElectronegBinaries(halogens)}},
    {$addToSet: {tags: "halide"}},
    {multi: true}
)
~~~
~~~{.output}
WriteResult({ "nMatched" : 1127, "nUpserted" : 0, "nModified" : 1126 })
~~~

It looks like we have 1127 halides in our materials collection, and we modified all but one of them (the "Cu-F" document we updated manually earlier) with the `update()` operation. Confirming:

~~~
db.materials.find({"tags": "halide"}).count()
~~~
~~~ {.output}
1127
~~~

> ## Write Operation Atomicity {.callout}
>
> In MongoDB, write operations are atomic on the level of a single document. If a single update operation modifies multiple documents of a collection, the operation can interleave with other write operations on that collection.

> ## Upsert {.challenge}
>
> What is the result of
>
>```
>db.materials.update(
>    {material_id: "mp-NaN"},
>    {$set: {"elasticity.calculations.source": "Private communication"}}
>)
>```
> ? What does
>```
>db.materials.findOne({material_id: "mp-NaN"})
>```
>return? What is the result of
>```
>db.materials.update(
>    {material_id: "mp-NaN"},
>    {$set: {"elasticity.calculations.source": "Private communication"}},
>    {upsert: true}
>)
>```
>? What does the **upsert** parameter do?


> ## How's Your Phase-change Memory? {.challenge}
>
> A chalcogenide is a chemical compound consisting of at least one chalcogen anion (commonly restricted to 'S', 'Se', or 'Te') and at least one less electronegative element. Use the `lessElectronegBinaries` function we defined earlier and `db.materials.update` to ensure a "chalcogenide" tag for all binary (two-element) chalcogenides.

