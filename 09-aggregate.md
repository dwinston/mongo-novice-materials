---
layout: page
title: Using MongoDB
subtitle: Data Aggregation
minutes: 10
---
> ## Learning Objectives {.objectives}
>
> * Aggregation: Group documents by a field and calculate count
> * Aggregation: Filter and group documents

MongoDB can perform aggregation operations, such as grouping by a specified key and evaluating a total or a count for each distinct group.

Use the `aggregate()` method to perform a stage-based aggregation. The `aggregate()` method accepts as its argument an array of stages, where each stage, processed sequentially, describes a data processing step.

    db.collection.aggregate([<stage1>, <stage2>, ...])

Use the `$group` stage to group by a specified key. In the `$group` stage, specify the group by key in the `_id` field. `$group` accesses fields by the field path, which is the field name prefixed by a dollar sign **\$**. The `$group` stage can use accumulators to perform calculations for each group. The following example groups the documents in the **materials** collection by the **nelements** field and uses the $sum accumulator to count the documents for each group.

~~~
db.materials.aggregate([
    {$group: {_id: "$nelements", count: {$sum: 1}}}
])
~~~
~~~{.output}
{ "_id" : 8, "count" : 5 }
{ "_id" : 6, "count" : 866 }
{ "_id" : 4, "count" : 17561 }
{ "_id" : 3, "count" : 31522 }
{ "_id" : 7, "count" : 68 }
{ "_id" : 1, "count" : 419 }
{ "_id" : 5, "count" : 5890 }
{ "_id" : 2, "count" : 9809 }
~~~

The `_id` field contains the distinct **nelements** value. i.e. the group-by-key value.

Our aggregation output would look better with the counts sorted, no? We can compose the `$group`ing with `$sort`ing as a subsequent stage in the pipeline:

~~~
db.materials.aggregate([
    {$group: {_id: "$nelements", count: {$sum: 1}}},
    {$sort: {count: -1}}
])
~~~
~~~{.output}
{ "_id" : 3, "count" : 31522 }
{ "_id" : 4, "count" : 17561 }
{ "_id" : 2, "count" : 9809 }
{ "_id" : 5, "count" : 5890 }
{ "_id" : 6, "count" : 866 }
{ "_id" : 1, "count" : 419 }
{ "_id" : 7, "count" : 68 }
{ "_id" : 8, "count" : 5 }
~~~

To filter documents, you can use a `$match` stage in your aggregation pipeline. `$match` uses the MongoDB query syntax, i.e. the same as that you pass to `collection.find()`.

Let's restrict our previous aggregation to oxygen-containing compounds:

~~~
db.materials.aggregate([
    {$match: {elements: "O"}},
    {$group: {_id: "$nelements", count: {$sum: 1}}},
    {$sort: {count: -1}}
])
~~~
~~~ {.output}
{ "_id" : 3, "count" : 15117 }
{ "_id" : 4, "count" : 15113 }
{ "_id" : 5, "count" : 5484 }
{ "_id" : 2, "count" : 1519 }
{ "_id" : 6, "count" : 816 }
{ "_id" : 7, "count" : 65 }
{ "_id" : 1, "count" : 6 }
{ "_id" : 8, "count" : 5 }
~~~

The output of the aggregation can serve as a valid collection: the documents
yielded still have `_id` fields, but they are different than those in the
`materials` collection. We used the `$sum` accumulator to produce a new
field. You can find a pipeline stage reference [here](https://docs.mongodb.org/manual/meta/aggregation-quick-reference/).

For the exercises, we'll use aggregation to get the overall space group distribution and the marginal distributions for specific anion chemistries, to see e.g. if oxides, sulfides, fluorides and chlorides prefer different space groups. In preparation, let's mark each material by its most electronegative element -- a proxy of whether it is an oxide, fluoride, etc. [^1]. You can copy-paste the below into your mongo shell. The operation may take several seconds to complete.

[^1]: Thanks to Prof. Shyue P. Ong of UC San Diego for [this example](https://github.com/materialsvirtuallab/nano106/blob/8e150151e485d71e52dc91867b9ac78769ae9ffe/lectures/lecture_5_the_230_space_groups/Datamining%20the%20Materials%20Project%20for%20Space%20Group%20statistics.ipynb) of mining Materials Project data.

~~~
function getChemistry (doc) {
  var anion = db.elements.find(
    {symbol: {$in: doc.elements}},
    {symbol: 1, X: 1, _id: 0}
  ).sort({X: -1}).limit(1)[0].symbol;
  switch (anion) {
  case "O":
    return "Oxide";
  case "S":
    return "Sulfide";
  case "F":
    return "Fluoride";
  case "Cl":
    return "Chloride";
  default:
    return null;
  }
};

db.materials.find(
  {elements: {$in: ["O", "S", "F", "Cl"]}}, {elements: 1}
).forEach(function (doc) {
  var anion = getChemistry(doc);
  db.materials.update({_id: doc._id}, {$set: {anion_chemistry: anion}});
});
~~~

> ## Most Common Space Groups {.challenge}
>
> Perform an aggregation to get a "top twenty" list of the most common space groups and their respective counts (e.g., use `"$spacegroup.number"` as `$group._id`), sorted by descending count. Use a `$limit` stage in your pipeline to limit the results.

> ## Space Group Distributions for Specific Chemistries {.challenge}
>
> Let's datamine a bit and look at the statistics for specific chemisties: do oxides, sulfides, fluorides and chlorides prefer different space groups? Perform aggregations as in the previous exercise, but prepend your pipeline with a `$match` stage to filter for chemistry.
