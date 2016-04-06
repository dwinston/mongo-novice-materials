---
layout: page
title: Using MongoDB
subtitle: Connect to / Import into a Database
minutes: 10
---
> ## Learning Objectives {.objectives}
>
> * Connect using the mongo shell
> * Import JSON data from a file


First, let's connect to our server through the `mongo` shell program:

~~~
mongo
~~~
~~~{.output}
MongoDB shell version: 3.2.3
connecting to: test
~~~
A MongoDB instance can host multiple databases, which are created
dynamically. In the shell, you can type `show dbs` to see what exists already. In general, you can type `help` to see a list of available commands.

Let's tell mongo we want to `use swc`, i.e. use a database with the name `swc`. Mongo will create the database for us if it doesn't exist.

~~~
// Refer to the Software Carpentry ("swc") database
use swc
~~~
~~~ {.output}
switched to db swc
~~~
The mongo shell, in addition to responding to its special command language, is also a JavaScript interpreter. Comment lines in Javascript are preceded with `//`, so the line before `use swc` above is a comment.

A MongoDB database is organized as a set of collections, each of which contains
a set of documents. Just as with databases themselves, database collections are
created dynamically in MongoDB. Let's ask for a count of the number of
documents in the `materials` collection of our database:

~~~
db.materials.count()
~~~
~~~{.output}
0
~~~

This is to be expected -- we have no documents in the (hypothetical) `swc` database's (hypothetical) `materials` collection. Let's make things more real by importing some data. `exit` out of the mongo shell and let's use `mongoimport` to load some documents into `swc.materials`:

~~~
exit
~~~
~~~{.output}
bye
~~~
~~~
mongoimport mongo-novice-materials.json --db swc --collection materials --jsonArray
~~~
~~~{.output}
connected to: localhost
imported 66140 documents
~~~

`JSON`, which stands for "Javascript Object Notation", is a way to express
simple data structures that is widely used in many applications, particularly
in web-based applications. We'll go over the format in the next topic when we
construct a document to insert into our collection, but for now let's focus on
importing data that we're given.

Now, let's re-enter the shell and get a count of our collection:

~~~
mongo
use swc
db.materials.count()
~~~
~~~{.output}
66140
~~~

`mongoimport` is a flexible way to import data into a database collection. If you exit the shell, you can enter `mongoimport --help` to get a sense of the options available. In particular, importing of data stored in tab-separated-values (TSV) or comma-separated-values (CSV) formats are supported.

`mongorestore` is a command to restore an entire database (i.e., multiple collections) from a backup. `mongodump` is a command to "dump" a database for backup.

> ##  Unknown collections {.challenge}
>
> What happens when you run the following?
>
~~~
db.publications.count()
~~~
>
> A. `0`
>
> B. `Error: no such collection "publications"`
>
> C. `Error: no method "count" on Undefined`
>
