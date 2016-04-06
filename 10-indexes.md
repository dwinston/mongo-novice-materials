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

To create an index for a collection on a field or fields, pass to the `createIndex()` method a document of field and index-type pairs:

    { ( <field1>: <type1> ), ... }

The format is that same as for `sort()`ing, with `1` for an ascending index and `-1` for a descending index.

`createIndex()` only creates an index if the index does not exist.

Let's examine the running time of a "shortcut" aggregation method, `distinct`, to get a list of distinct crystal system. First, running the command normally:

~~~
db.materials.distinct("spacegroup.crystal_system")
~~~
~~~ {.output}
[
	"cubic",
	"monoclinic",
	"trigonal",
	"orthorhombic",
	"hexagonal",
	"tetragonal",
	"triclinic",
	null
]
~~~

We see that some materials have uncertain crystal symmetry (the `null` value). To get more insight into what's happening under the hood here, including running time, we can use `db.runCommand`:

~~~
db.runCommand({distinct: "materials", key: "spacegroup.crystal_system"})
~~~
~~~{.output}
{
	"waitedMS" : NumberLong(0),
	"values" : [
		"cubic",
		"monoclinic",
		"trigonal",
		"orthorhombic",
		"hexagonal",
		"tetragonal",
		"triclinic",
		null
	],
	"stats" : {
		"n" : 66140,
		"nscanned" : 0,
		"nscannedObjects" : 66140,
		"timems" : 32,
		"planSummary" : "COLLSCAN"
	},
	"ok" : 1
}
~~~

We from `stats.timems` that the operation took 32 milliseconds. Not bad, but what if our collection was bigger? Right now our collection is ~20 MB, so everything is loaded into RAM. What happens when our collection is tens of GB (or more) and MongoDB needs to fetch documents on disk and swap out from RAM?

Indexes for databases are like indexes for books -- rather than having to scan every page consecutively for what you want (indicated in `stats.planSummary` above as `COLLSCAN`, a **coll**ection **scan**), you can flip to the index and quickly get a reference to page numbers (or here, documents) of interest.

Let's ensure a single-field index for the aggregation above:

~~~
db.materials.createIndex({"spacegroup.crystal_system": 1})
~~~
~~~ {.output}
{
	"createdCollectionAutomatically" : false,
	"numIndexesBefore" : 1,
	"numIndexesAfter" : 2,
	"ok" : 1
}
~~~
~~~
db.materials.getIndexSpecs()
~~~
~~~ {.output}
[
	{
		"v" : 1,
		"key" : {
			"_id" : 1
		},
		"name" : "_id_",
		"ns" : "swc.materials"
	},
	{
		"v" : 1,
		"key" : {
			"spacegroup.crystal_system" : 1
		},
		"name" : "spacegroup.crystal_system_1",
		"ns" : "swc.materials"
	}
]
~~~

And let's re-run the operation:

~~~
db.runCommand({distinct: "materials", key: "spacegroup.crystal_system"})
~~~
~~~ {.output}
{
	"waitedMS" : NumberLong(0),
	"values" : [
		null,
		"cubic",
		"hexagonal",
		"monoclinic",
		"orthorhombic",
		"tetragonal",
		"triclinic",
		"trigonal"
	],
	"stats" : {
		"n" : 8,
		"nscanned" : 8,
		"nscannedObjects" : 8,
		"timems" : 0,
		"planSummary" : "DISTINCT_SCAN { spacegroup.crystal_system: 1.0 }"
	},
	"ok" : 1
}
~~~

The method now takes under 1 millisecond. Woohoo! Note, however, that there is overhead for indexes. Every time a document is inserted or updated, indexes need to be updated. Thus, indexes in write-heavy contexts, or for small collections, may not result in a net performance boost. However, if you are mostly finding/aggregating and only occasionally inserting/updating for large-sized collections, indexes are a capital idea.

MongoDB supports compound indexes, which are indexes on multiple fields. The order of the fields determine how the index stores its keys.

Let's say a common access pattern for our materials collection is to fetch a pretty formula given a material id:

~~~
db.materials.find(
    {material_id: "mp-49"}, {pretty_formula: 1, _id: 0}
).explain()
~~~
~~~ {.output}
{
	"queryPlanner" : {
		"plannerVersion" : 1,
		"namespace" : "swc.materials",
		"indexFilterSet" : false,
		"parsedQuery" : {
			"material_id" : {
				"$eq" : "mp-49"
			}
		},
		"winningPlan" : {
			"stage" : "PROJECTION",
			"transformBy" : {
				"pretty_formula" : 1,
				"_id" : 0
			},
			"inputStage" : {
				"stage" : "COLLSCAN",
				"filter" : {
					"material_id" : {
						"$eq" : "mp-49"
					}
				},
				"direction" : "forward"
			}
		},
		"rejectedPlans" : [ ]
	},
    ...
}
~~~

We can use `explain()` to see how MongoDB planned to execute the query. If this query were running slowly, we could see right away that the `COLLSCAN` value indicates that no index is being used. Let's make a compound index to cover this query:

~~~
db.materials.createIndex({material_id: 1, pretty_formula: 1})
~~~
~~~ {.output}
{
	"createdCollectionAutomatically" : false,
	"numIndexesBefore" : 2,
	"numIndexesAfter" : 3,
	"ok" : 1
}
~~~
~~~
db.materials.find(
    {material_id: "mp-49"}, {pretty_formula: 1, _id: 0}
).explain()
~~~
~~~ {.output}
{
	"queryPlanner" : {
		"plannerVersion" : 1,
		"namespace" : "swc.materials",
		"indexFilterSet" : false,
		"parsedQuery" : {
			"material_id" : {
				"$eq" : "mp-49"
			}
		},
		"winningPlan" : {
			"stage" : "PROJECTION",
			"transformBy" : {
				"pretty_formula" : 1,
				"_id" : 0
			},
			"inputStage" : {
				"stage" : "IXSCAN",
				"keyPattern" : {
					"material_id" : 1,
					"pretty_formula" : 1
				},
				"indexName" : "material_id_1_pretty_formula_1",
				"isMultiKey" : false,
				"isUnique" : false,
				"isSparse" : false,
				"isPartial" : false,
				"indexVersion" : 1,
				"direction" : "forward",
				"indexBounds" : {
					"material_id" : [
						"[\"mp-49\", \"mp-49\"]"
					],
					"pretty_formula" : [
						"[MinKey, MaxKey]"
					]
				}
			}
		},
		"rejectedPlans" : [ ]
	},
    ...
}
~~~

For the above query, MongoDB doesn't actually hit the collection proper because the query is "covered" by the index -- it is an index-only query. Try repeating the above find-and-explain operation but without the `{_id: 0}` in the projection. You'll see an intermediate `FETCH` stage between the index scan (`IXSCAN`) and final projection. Even if a query isn't covered by an index and MongoDB has to load full documents from the collection into working memory (i.e., "fetch" them), index use is still typically much more performant than full collection scans.

You can specify various properties for indexes, such as a unique constraint and a flag to build the index in the background. In the MongoDB documentation, see `createIndex()` for the available options.

> ## Compound Index Ordering {.challenge}
>
> Use `dropIndex()` to drop the `"material_id_1_pretty_formula_1"` index and re-create it but with the key-direction pairs reversed. `explain` the benchmark query again. What happens? Why?

> ## Cover the Queries {.challenge}
>
> Earlier, we ran queries on the `elements` and `materials` collections to `$set` a key on certain materials collection documents for later use in aggregation. Create two indexes, one on `elements` and one on `materials`, to cover those queries.

