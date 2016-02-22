---
layout: page
title: Using MongoDB
subtitle: Insert Data
minutes: 10
---
> ## Learning Objectives {.objectives}
>
> * Introduce the JSON format
> * Review Python data types and relate to the JSON format
> * Insert a document, understand the purpose of it's `_id`
> * Introduce MongoDB's "Binary JSON" (BSON) format

> ## Proper attribution {.callout}
>
> The intro to JSON here, including the railroad diagrams, were taken from [json.org](http://json.org).

[JSON](reference.html#json), i.e. JavaScript Object Notation, is a lightweight
data-interchange format built on two universal data structures:

* a mapping of names to values. In various languages, this is realized as an object, record, struct, dictionary, hash table, keyed list, or associative array.
* an ordered list of values. In most languages, this is realized as an array, vector, list, or sequence.

In JSON, they take on these forms:

* An *object* is an unordered set of name/value pairs.

![](./fig/json-object.gif)

* An *array* is an ordered collection of values.

![](./fig/json-array.gif)

* A *value* can be a *string* in double quotes, or a *number*, or **true** or **false** or **null**, or an *object* or an *array*. These structures can be nested.

![](./fig/json-value.gif)

* A *string* is a sequence of zero or more Unicode characters, wrapped in double quotes, using backslash escapes. A character is represented as a single character string. A string is very much like a C or Java string.

![](./fig/json-string.gif)

* A number is very much like a C or Java number, except that the octal and hexadecimal formats are not used. Engineering notation is supported.

![](./fig/json-number.gif)

In Python, built-in data types correspond to those in JSON:

* `list` → *array*
* `dict` → *object*
* `str`  → *string*
* `int`/`float` → *number*
* `True` → *true*
* `False` → *false*
* `None` → *null*

Now, let's explore the mechanics of inserting some (fake) data into our collection. In the process, we'll see how MongoDB extends JSON to allow representation of data types that are not part of the JSON specification.

<!-- a subset of https://materialsproject.org/materials/mp-2340/ -->
~~~ {.python}
from datetime import datetime
material = {"fake": True,
            "elements": ["Na", "O"],
            "band_gap": 1.736,
            "last_updated": datetime.utcnow(),
            "spacegroup": {"crystal_system": "hexagonal", "number": 189}}
result = db.materials.insert_one(material)
~~~

We first create a dictionary to correspond to a JSON object that we will insert as a document into our database collection. Note that we have created a timestamp. Note also that we know nothing about the formatting of other documents in the collection. Do the other documents have a "fake" key? We don't *need* to care.

Let's inspect the `result` to get the unique id of the inserted document:

~~~ {.python}
result.inserted_id
~~~
~~~ {.output}
ObjectId('56cb4595a62895f91556937e')
~~~

What's interesting is that the id is an object, not simply a JSON string. You can, for instance, ask when it was generated (down to the second):

~~~ {.python}
print(result.inserted_id.generation_time)
~~~
~~~ {.output}
2016-02-22 17:29:57+00:00
~~~

What is going on here? Well, MongoDB uses "Binary JSON" (aka [BSON](http://bsonspec.org/)), a binary-encoded serialization of JSON-like documents. This allows it to extend the JSON spec to support a richer set of data types. At the same time, all MongoDB documents are just JSON when in transit. We can use the `bson` package (included when you install `pymongo`) to see what's going on under the hood:

~~~ {.python}
from bson import json_util
print(json_util.dumps(db.materials.find_one(result.inserted_id), indent=2))
~~~
~~~ {.output}
{
  "elements": [
    "Na",
    "O"
  ],
  "band_gap": 1.736,
  "fake": true,
  "spacegroup": {
    "crystal_system": "hexagonal",
    "number": 189
  },
  "last_updated": {
    "$date": 1455734933569
  },
  "_id": {
    "$oid": "56c4c097a628958daa528c2f"
  }
}
~~~

MongoDB uses a convention of "$"-preceded key names to indicate that something special is going on. We'll use the dollar sign a lot when finding things because, as we'll see, queries are specified using JSON objects.

It's worth noting that the `_id` field is *very*, *very* likely to be unique. It might be (much?) more likely that we'll all be struck by a meteor this very second. This makes it reasonable to create documents in parallel without worrying about race conditions for increment-by-one id strategies.

Before we move on, let's delete any/all fake documents in our collection (we'll go over deletion again later):

~~~ {.python}
result = db.materials.delete_many({"fake": True})
result.deleted_count
~~~
~~~ {.output}
1
~~~

> ## About those `_id`s {.challenge}
>
> What are some properties of a generated MongoDB document `_id` (choose zero or more of the following)?
>
> 1. It can double as a "created-at" timestamp
> 2. It is guaranteed to be unique in the scope of the collection
> 3. It is valid JSON

> ## Multiple insertion {.challenge}
>
> What happens when you try to re-create and insert the example (fake) `material` document again?
