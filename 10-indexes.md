---
layout: page
title: Using MongoDB
subtitle: Indexes
minutes: 10
---
> ## Learning Objectives {.objectives}
>
> * discuss the utility of an index
> * Create a single-field index
> * Create a compound index

Indexes can support the efficient execution of queries. MongoDB automatically creates an index on the `_id` field upon the creation of a collection.

To create an index on a field or fields, pass to the `create_index()` method a list of field and index type pairs:

    [ ( <field1>: <type1> ), ... ]

The format is that same as for `sort()`ing, with `1` for an ascending index and `-1` for a descending index.

> ## import this {.callout}
>
> `pymongo` provides the `pymongo.ASCENDING` and `pymongo.DESCENDING` constants, which equal 1 and -1 respectively. Explicit is better than implicit, so some prefer using these constants for readability.

`create_index()` only creates an index if the index does not exist.

Earlier, we ran the `distinct` aggregation method to get a list of crystal systems. Let's time this operation:

~~~ {.python}
%%timeit

db.materials.distinct("spacegroup.crystal_system")
~~~
~~~ {.output}
10 loops, best of 3: 47.1 ms per loop
~~~

Not bad, but what if our collection was bigger? Right now our collection is ~20 MB, so everything is loaded into RAM. What happens when our collection is tens of GB (or more) and MongoDB needs to fetch documents on disk and swap out from RAM?

Indexes for databases are like indexes for books -- rather than having to scan every page consecutively for what you want, you can flip to the index in back and quickly get a reference to page numbers (or documents) of interest.

Let's ensure a single-field index for the aggregation above:

~~~ {.python}
db.materials.create_index([("spacegroup.crystal_system", 1)])
~~~
~~~ {.output}
'spacegroup.crystal_system_1'
~~~
~~~ {.python}
pprint(db.materials.index_information())
~~~
~~~ {.output}
{'_id_': {'key': [('_id', 1)], 'ns': 'swc.materials', 'v': 1},
 'spacegroup.crystal_system_1': {'key': [('spacegroup.crystal_system', 1)],
                                 'ns': 'swc.materials',
                                 'v': 1}}
~~~

And let's re-time things:

~~~ {.python}
%%timeit

db.materials.distinct("spacegroup.crystal_system")
~~~
~~~ {.output}
1000 loops, best of 3: 296 µs per loop
~~~

The method is now 100× faster. Note, however, that there is overhead for indexes. Every time a document is inserted or updated, indexes need to be updated. Thus, indexes in write-heavy contexts, or for small collections, may not result in a net performance boost. However, if you are mostly finding/aggregating and only occasionally inserting/updating for large-sized collections, indexes are a capital idea.

MongoDB supports compound indexes, which are indexes on multiple fields. The order of the fields determine how the index stores its keys.

Let's say a common access pattern for our materials collection is to fetch a pretty formula given a material id:

~~~ {.python}
%timeit db.materials.find_one({"material_id": "mp-49"}, {"pretty_formula": 1, "_id": 0})
~~~
~~~ {.output}
100 loops, best of 3: 12.1 ms per loop
~~~

Let's make a compound index to cover this query:

~~~ {.python}
db.materials.create_index([("material_id", 1), ("pretty_formula", 1)])
~~~
~~~ {.output}
'material_id_1_pretty_formula_1'
~~~
~~~ {.python}
%timeit db.materials.find_one({"material_id": "mp-49"}, {"pretty_formula": 1, "_id": 0})
~~~
~~~ {.output}
1000 loops, best of 3: 187 µs per loop
~~~

For the above query, MongoDB doesn't actually hit the collection proper because the query is "covered" by the index -- it is an index-only query. Even if a query isn't covered by an index and MongoDB has to load full documents from the collection into working memory, index use is still often much more performant than full collection scans.

You can specify various properties for indexes, such as a unique constraint and a flag to build the index in the background. In the PyMongo documentation, see `create_index()` for the available options.

> ## Compound Index Ordering {.challenge}
>
> Use `drop_index()` to drop the `[("material_id", 1), ("pretty_formula", 1)]` index and re-create it but with the key-direction pairs reversed. Time the benchmark query again. What happens? Why?

> ## Cover the Queries {.challenge}
>
> Earlier, we ran queries on the `elements` and `materials` collections to `$set` a key on certain materials collection documents for later use in aggregation. Create two indexes, one on `elements` and one on `materials`, to cover those queries.

