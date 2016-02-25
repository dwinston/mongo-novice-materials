---
layout: page
title: Using MongoDB
subtitle: Connect to / Import into a Mock Database
minutes: 10
---
> ## Learning Objectives {.objectives}
>
> * Use `mongomock` to put off needing a real database connection
> * Import JSON data from a file

> ## Playing Pretend {.callout}
>
> To accommodate folks who cannot get a real database server running locally on
their system, and also to demonstrate the utility of ["mocking"](reference.html#mock-object) for testing real
access patterns without an external dependency, we will use the `mongomock`
Python library to walk through MongoDB ideas for the first few topics. If you
have a Mongo server running, feel free to use `pymongo.MongoClient` instead.


First, let's connect to the (mock) server and get a handle for our client.

~~~ {.python}
from mongomock import MongoClient
#from pymongo import MongoClient

client = MongoClient()
~~~

A MongoDB instance can host multiple databases, which are created
dynamically. Here, we will supply a database name as an attribute of the client
object, which will prompt MongoDB to create the database with that name if it
doesn't exists.

~~~ {.python}
# Refer to the Software Carpentry ("swc") database
db = client.swc
print(db)
~~~
~~~ {.output}
Database(mongomock.MongoClient('localhost', 27017), 'swc')
~~~

We see here that what we're calling `db` is a Database with the name "swc" that
we're accessing through a Mongo client connected to localhost on port 27017.

~~~ {.python}
print(db.materials)
~~~
~~~ {.output}
Collection(Database(mongomock.MongoClient('localhost', 27017), 'swc'), 'materials')
~~~

A MongoDB database is organized as a set of collections, each of which contains
a set of documents. To first order, you can for now think of a collection as
corresponding to a table in [SQL](reference.html#sql) and a collection document as corresponding to a
table row in SQL.

Just as with databases themselves, database collections are created dynamically
in MongoDB. Above, we created a `materials` collection in our database simply
by referring to it by name.

Now, let's load data from a file and import it as documents into our
collection:

~~~ {.python}
import json
~~~

We first import the `json` module from the Python standard library. `JSON`,
which stands for "Javascript Object Notation", is a way to express simple data
structures that is widely used in web-based applications. We'll go over the
format in the next topic when we construct a document to insert into our
collection, but for now let's focus on importing data that we're given.

~~~ {.python}
with open('data/mongo-novice-materials.json') as f:
    db.materials.insert_many(json.load(f))
~~~

We are using a Python context manager to open a file and ensure that it is
closed when we are done processing the file contents. In this case, we use the
`json` module to load the file contents as Python-native data structures, which
we then hand off to the `insert_many` method of database collections to insert
all of the loaded documents.

~~~ {.python}
db.materials.count()
~~~

To confirm we have the data loaded, we use the `count()` method of a collection
object and see that we have more than zero documents in our `materials`
collection.

> ##  Loading JSON data {.challenge}
>
> Reload the dataset from the JSON file and assign it to a variable `dataset` instead of immediately inserting it into the database collection. What is `type(dataset)`, the type of the dataset?  What is the type of `dataset[0]`, the first ("zeroth") member of the imported data?
>
> 1. `collection` and `document`
> 2. `array` and `object`
> 3. `list` and `dict`
> 4. `set` and `member`

> ##  Unknown collections {.challenge}
>
> What happens when you run the following:
>
~~~ {.python}
db.publications.count()
~~~
>
> 1. `0`
> 2. `Error: no such collection "publications"`
> 3. `Error: no method "count" on Undefined`
