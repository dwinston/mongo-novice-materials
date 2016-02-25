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

You can use the `update_one()` and the `update_many()` methods to update documents of a collection. The `update_one()` method updates a single document. Use `update_many()` to update all documents that match the criteria. The methods accept the following parameters:

* a filter document to match the documents to update,
* an update document to specify the modification to perform, and
* an optional `upsert` parameter.

To change a field value, MongoDB provides [update operators](http://docs.mongodb.org/manual/reference/operator/update) to modify values. Some update operators, such as `$set`, will create the field if the field does not exist.

The following operation updates the first document in the **Cu-F** chemical system (**chemsys**), using the `$set` operator to update the **tags** field and the `$currentDate` operator to update the **lastModified** field with the current date.

~~~ {.python}
result = db.materials.update_one(
    {"chemsys": "Cu-F"},
    {
        "$set": {
            "tags": ["halide"]
        },
        "$currentDate": {"lastModified": True}
    }
)
~~~

The object returned reports the count of documents matched and modified:

~~~ {.python}
result.matched_count
~~~
~~~ {.output}
1
~~~
~~~ {.python}
result.modified_count
~~~
~~~ {.output}
1
~~~
~~~ {.python}
db.materials.find_one({"chemsys": "Cu-F"},
                      {"tags": 1, "lastModified": 1, "material_id": 1})
~~~
~~~ {.output}
{'_id': ObjectId('56ced2fb7943f6405b32a0b6'),
 'lastModified': datetime.datetime(2016, 2, 25, 10, 10, 7, 525000),
 'material_id': 'mp-1229',
 'tags': ['halide']}
~~~

To update an embedded field, use the dot notation:

~~~ {.python}
result = db.materials.update_one(
    {"material_id": "mp-1229"},
    {"$set": {"elasticity.calculations.source": "Private communication"}}
)

print(result.matched_count, result.modified_count)
~~~
~~~ {.output}
1 1
~~~

The `update_one()` method updates a single document. To update multiple documents, use the `update_many()` method. Let's tag all of the halides, where a halide is a binary compounds for which one part is a halogen atom and the other part is an element that is less electronegative than the halogen. Specifically, we will use the `$addToSet` update operator to add "halide" idempotently to a compound's **tags** array, creating the array if it does not exist.

First, let's generate a list of halide chemical systems. The [pymatgen](http://pymatgen.org/) Python package includes a JSON file, a copy of which you downloaded earlier, with basic information on chemical elements, including Pauling electronegativity ("X") if known. Let's load it as a new MongoDB collection:

~~~ {.python}
import json

db.elements.drop() # If it exists, clear it
with open('data/periodic_table.json') as f:
    for symbol, rest in json.load(f).items():
        doc = {"Symbol": symbol}
        doc.update(rest)
        db.elements.insert_one(doc)
~~~

Now, let's use our new collection to write a generator for halide systems. The **chemsys** values in our materials collection are sorted alphabetically, i.e. we say "Cu-F" rather than "F-Cu", so we have to account for that. You are not expected to know the Python syntax for doing this -- the point here is to demonstrate how a JSON data source can quickly be ingested by MongoDB and how what you've learned so far about query operators can be used effectively to find what we need from the data.

~~~ {.python}
halogens = ["F", "Cl", "Br", "I", "At"]
def halide_systems():
    for halogen in halogens:
        X = db.elements.find_one({"Symbol": halogen})["X"]
        for doc in db.elements.find({"X": {"$lt": X}}):
            yield "-".join(sorted([doc["Symbol"], halogen]))
~~~

To demonstrate use of the generator let's see which systems contain copper:

~~~ {.python}
[s for s in list(halide_systems()) if 'Cu' in s]
~~~
~~~ {.output}
['Cu-F', 'Cl-Cu', 'Br-Cu', 'Cu-I', 'At-Cu']
~~~

Now, we're ready for the show. We use the `$in` query operator to test for membership of a compound's **chemsys** in our list of halide systems:

~~~ {.python}
result = db.restaurants.update_many(
    {"chemsys": {"$in": list(halide_systems())}},
    {"$addToSet": {"tags": "halide"}}
)
~~~

What's the damage?

~~~ {.python}
result.matched_count, result.modified_count
~~~
~~~ {.output}
(1127, 1127)
~~~

It looks like we have 1127 halides in our materials collection. Equivalently,

~~~ {.python}
db.materials.find({"tags": "halide"}).count()
~~~
~~~ {.output}
1127
~~~

> ## Write Operation Atomicity {.callout}
>
> In MongoDB, write operations are atomic on the level of a single document. If a single update operation modifies multiple documents of a collection, the operation can interleave with other write operations on that collection.

> ## Replacing Documents {.callout}
>
> To replace an entire document (except for the `_id` field), `replace_one()` is similar to `update_one()` except that you pass an entirely new document as the second argument. The replacement document can have different fields from the original document. In the replacement document, you can omit the `_id` field because the `_id` field is immutable. If you do include the `_id` field, it must be the same value as the existing value.

> ## Upsert {.challenge}
>
> What is the result (`matched_count` and `modified_count`) of
>
>```python
>result = db.materials.update_one(
>    {"material_id": "mp-NaN"},
>    {"$set": {"elasticity.calculations.source": "Private communication"}}
>)
>```
> ? What does
>```python
>db.materials.find_one({"material_id": "mp-NaN"})
>```
>return? What is the result of
>```python
>result = db.materials.update_one(
>    {"material_id": "mp-NaN"},
>    {"$set": {"elasticity.calculations.source": "Private communication"}},
>    upsert=True
>)
>```
>? What does the **upsert** keyword argument do? Check out other attributes of `result`.

> ## How's Your Phase-change Memory? {.challenge}
>
> A chalcogenide is a chemical compound consisting of at least one chalcogen anion (commonly restricted to 'S', 'Se', or 'Te') and at least one more electropositive element. Modify the `halide_systems` generator we wrote and use `update_many()` to ensure a "chalcogenide" tag for all binary chalcogenides.

