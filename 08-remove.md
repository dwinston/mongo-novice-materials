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
> * Restore example data from the command line using `mongoimport`
> * `mongoimport` expects one document per line (**not** a valid JSON file)

You can use the `remove()` method to remove documents from a collection. The method takes a conditions document that determines the documents to remove. To specify a remove condition, use the same structure and syntax as the query conditions.

Let's remove the fake material we may have upserted during a recent exercise:

~~~
db.materials.remove({material_id: "mp-NaN"})
~~~
~~~ {.output}
WriteResult({ "nRemoved" : 1 })
~~~

Let's proceed to destroy our materials collection (dont' worry -- we'll reload everything at the beginning of the next topic).

First, let's delete all one-element compounts:

~~~
db.materials.remove({"nelements": 1})
~~~
~~~ {.output}
WriteResult({ "nRemoved" : 419 })
~~~

We're impatient. Let's just remove everything by specifying an empty conditions document:

~~~
db.materials.remove({})
~~~
~~~ {.output}
WriteResult({ "nRemoved" : 65721 })
~~~
~~~
db.materials.count()
~~~
~~~ {.output}
0
~~~

I'm glad we have a backup!

The `remove()` operation only removes the documents from the collection. The collection itself, as well as any indexes for the collection (we'll go over indexes later), remain. To remove all documents from a collection, it may be more efficient to drop the entire collection, including the indexes, and then recreate the collection and rebuild the indexes. Use the drop() method to drop a collection, including any indexes.

~~~
db.materials.drop()
~~~
~~~{.output}
true
~~~

> ## Trust but Verify {.callout}
>
> This should go without saying, but it's a good idea to pass any `remove()` conditions document to a `find()` first to be sure what you want to remove is what MongoDB thinks you want to remove!

### (Re)Importing Your Data

Now, let's re-import the data to the `materials` collection on the `swc` database on the default host and port:

~~~
exit
~~~
~~~{.output}
bye
~~~
~~~
mongoimport mongo-novice-materials.json --db swc --collection materials --jsonArray
~~~
~~~ {.output}
connected to: localhost
imported 66140 objects
~~~
~~~
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

> ## mongorestore {.callout}
>
> For importing whole databases, or very large collections, `mongorestore` is your friend for importing BSON files into MongoDB.


