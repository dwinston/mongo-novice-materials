---
layout: page
title: Using MongoDB
subtitle: Remove Data
minutes: 10
---
> ## Learning Objectives {.objectives}
>
> * Remove documents that match a condition, or all documents
> * Drop a collection

You can use the `delete_one()` method and the `delete_many()` method to remove documents from a collection. The method takes a conditions document that determines the documents to remove. To specify a remove condition, use the same structure and syntax as the query conditions.

Let's remove the fake material we may have upserted during a recent exercise:

~~~ {.python}
result = db.materials.delete_many({"material_id": "mp-NaN"})
~~~
~~~ {.python}
result.deleted_count
~~~
~~~ {.output}
1
~~~

Let's proceed to destroy our materials collection (dont' worry -- we'll reload everything at the beginning of the next topic).

First, let's delete all elemental compounts:

~~~ {.python}
result = db.materials.delete_many({"nelements": 1})
~~~
~~~ {.python}
result.deleted_count
~~~
~~~ {.output}
419
~~~

We're impatient. Let's just remove everything by specifying an empty conditions document:

~~~ {.python}
result = db.materials.delete_many({})
~~~
~~~ {.python}
result.deleted_count
~~~
~~~ {.output}
65721
~~~
~~~ {.python}
db.materials.count()
~~~
~~~ {.output}
0
~~~

I'm glad we have a backup!

The remove all operation only removes the documents from the collection. The collection itself, as well as any indexes for the collection (we'll go over indexes later), remain. To remove all documents from a collection, it may be more efficient to drop the entire collection, including the indexes, and then recreate the collection and rebuild the indexes. Use the drop() method to drop a collection, including any indexes.

~~~ {.python}
db.materials.drop()
~~~

> ## Trust but Verify {.callout}
>
> This should go without saying, but it's a good idea to pass any `delete_many()` conditions document to a `find()` first to be sure what you want to remove is what MongoDB thinks you want to remove!
