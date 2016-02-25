---
layout: page
title: Using MongoDB
subtitle: Specify Conditions with Operators
minutes: 10
---
> ## Learning Objectives {.objectives}
>
> * Introduce operators like $gt and $lt
> * Combine conditions (logical AND and OR)

### Operators

MongoDB provides operators to specify query conditions, such as comparison operators. Although there are some exceptions, such as the `$or` conditional operator, query conditions using operators generally have the following form:

    { <field1>: { <operator1>: <value1> } }

Let's first define a few custom helpers to reduce the boilerplate necessary for our emerging pattern of "testing" a query document by projecting a few fields and printing out a few documents for inspection.

~~~ {.python}
COMMON_PROJ = {
    "material_id": 1,
    "pretty_formula": 1,
    "_id": 0,
}

def print_a_few_for(query):
    proj = {k: 1 for k in query}
    proj.update(COMMON_PROJ)
    for doc in db.materials.find(query, proj).limit(5):
        pprint(doc)
~~~

Note that because MongoDB queries and projections are expressed as JSON, which map to ubiquitous data structures such as Python dictionaries and lists, one can programmatically build cursors without resorting to string manipulation.

Now, let's print some materials with at least three elements:

~~~ {.python}
print_a_few_for({"nelements": {"$gte": 3}})
~~~
~~~ {.output}
{'material_id': 'mp-12671', 'nelements': 3, 'pretty_formula': 'Er2SO2'}
{'material_id': 'mp-5152', 'nelements': 3, 'pretty_formula': 'La2SiO5'}
{'material_id': 'mp-552787', 'nelements': 3, 'pretty_formula': 'FeClO'}
{'material_id': 'mp-780541', 'nelements': 3, 'pretty_formula': 'Fe4O7F'}
{'material_id': 'mp-31899', 'nelements': 4, 'pretty_formula': 'Ba2MnReO6'}
~~~

And some with fewer than 3:

~~~ {.python}
print_a_few_for({"nelements": {"$lt": 3}})
~~~
~~~ {.output}
{'material_id': 'mp-568345', 'nelements': 1, 'pretty_formula': 'Fe'}
{'material_id': 'mp-1703', 'nelements': 2, 'pretty_formula': 'YbZn'}
{'material_id': 'mp-569624', 'nelements': 2, 'pretty_formula': 'HfCr2'}
{'material_id': 'mp-12660', 'nelements': 2, 'pretty_formula': 'LuB6'}
{'material_id': 'mp-188', 'nelements': 2, 'pretty_formula': 'AlPt3'}
~~~

### Combining Conditions

You can specify a logical conjunction (**AND**) for a list of query conditions by separating the conditions with a comma in the conditions document:

~~~ {.python}
db.materials.find({"chemsys": "Fe-O", "spacegroup.crystal_system": "cubic"}).count()
~~~
~~~ {.output}
7
~~~

You can specify a logical disjunction (**OR**) for a list of query conditions by using the `$or` query operator.

~~~ {.python}
db.materials.find({
    "$or": [{"nelements": 2}, {"nelements": 4}]
}).count()
~~~

> ## Combining Operators for the Same Key {.challenge}
>
> Which query document will find compounds that have between 2 and 4 elements, inclusive?
>
> 1. `{"nelements": {"$gte": 2, "$lte": 4}}`
> 2. `{"nelements": {"$gte": 2}, "nelements": {"$lte": 4}}`
> 3. `{"$or": [{"nelements": {"$gte": 2}}, {"nelements": {"$lte": 4}}]}`

> ## On Being and Essence {.challenge}
>
> MongoDB has [lots](https://docs.mongodb.org/manual/reference/operator/query/) of query (and projection!) operators. `$exists` asks whether or not a field is present in a document. For example,
>
~~~ {.python}
print_a_few_for({"elasticity": {"$exists": True}})
~~~
> might print some documents that contain information on a material's mechanical behavior in the elastic limit.
>
> What prints out? What did you expect? What happens when
>
~~~ {.python}
{"elasticity": {"$ne": None}}
~~~
> is your query document (`$ne` is the query operator for "not equal")?

