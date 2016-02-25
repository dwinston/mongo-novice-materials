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
> * Connect to a real database using `pymongo`
> * Restore example data from the command line using `mongoimport`
> * `mongoimport` expects one document per line (**not** a valid JSON file)

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

### (Re)Importing Your Data

If you are using `mongomock` (or even if you are connecting to a real database using `pymongo`), you can load the JSON data file and `insert_many()` as before:

~~~ {.python}
import json
from mongomock import MongoClient
#from pymongo import MongoClient

def reset_materials():
    client = MongoClient()
    db = client.swc
    db.materials.drop()
    with open('data/mongo-novice-materials.json') as f:
        db.materials.insert_many(json.load(f))
~~~
~~~ {.python}
reset_materials()
~~~

However, this operation is a bit sluggish, and it gets worse for larger sets of data.

~~~ {.python}
%timeit reset_materials()
~~~
~~~ {.output}
1 loop, best of 3: 3.03 s per loop
~~~

MongoDB's `mongoimport` command-line imports data provided one-document-per-line, like

    {key1: val1, key2: val2}
    {key1: val3, key2: val4}
    {key1: val5, key3: val5}
    {key2: val7, key5: val8}
    ...

Note that while this is a stream of JSON documents, one per line, it would not make for a valid JSON file -- for it to be valid, it would need to have open (`[`) and closing (`]`) brackets and have a comma after each document (except the last). Let's write a file in the proper format:

~~~ {.python}
with open('data/materials.mongoimportable.json', 'w') as outfile:
    with open('data/mongo-novice-materials.json') as infile:
        docs = json.load(infile)
        outfile.writelines([json.dumps(doc)+'\n' for doc in docs])
~~~

Now, if you're on a Unix system (like Linux or Mac OS X), you can execute shell commands from within your Jupyter Notebook by prefacing the line with a `!`. In any case, the following shell command will import the data to the `materials` collection on the `swc` database on the default host and port:

~~~ {.python}
!mongoimport --db swc --collection materials < data/materials.mongoimportable.json
~~~
~~~ {.output}
connected to: 127.0.0.1
2016-02-25T10:37:14.001-0800 			36300	12100/second
2016-02-25T10:37:15.412-0800 check 9 66140
2016-02-25T10:37:15.420-0800 imported 66140 objects
~~~

> ## mongorestore {.callout}
>
> For importing whole databases, or very large collections, `mongorestore` is your friend for importing BSON files into MongoDB.


