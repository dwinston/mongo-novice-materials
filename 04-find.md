---
layout: page
title: Using MongoDB
subtitle: Find Data
minutes: 10
---
> ## Learning Objectives {.objectives}
>
> * Query by a top-level field
> * Project to get only the fields you need
> * Query by a field in an embedded document
> * Query by a field in an array

You can use the `find()` method to issue a query to retrieve data from a collection in MongoDB. All queries in MongoDB have the scope of a single collection.[^1]

[^1]: Much of the format and language of this lesson from here on out borrow heavily (and occasionally are copied) from mongodb.org's [Getting Started](https://docs.mongodb.org/getting-started/python/) guide, available under the terms of a [Creative Commons License](http://creativecommons.org/licenses/by-nc-sa/3.0/).

Queries can return all documents in a collection or only the documents that match a specified filter or criteria. You can specify the filter or criteria in a document and pass it as a parameter to the `find()` method.

The `find()` method returns query results in a cursor, which is an iterable object that yields documents.

### Gotta catch 'em all

To return all documents in a collection, call the `find()` method without a criteria document.

~~~ {.python}
cursor = db.materials.find()
~~~

Let's iterate over the cursor and print a few material ids.

~~~ {.python}
how_many = 5
counter = 0
for document in cursor:
    if counter < how_many:
        print(document['material_id'])
        counter += 1
    else:
        break
~~~
~~~ {.output}
mp-568345
mp-12671
mp-1703
mp-5152
mp-569624
~~~

There's an easier way to limit how many documents are yielded by a cursor, via method chaining:

~~~ {.python}
for document in cursor.limit(5):
    print(document['material_id'])
~~~
~~~ {.output}
mp-31899
mp-567842
mp-6574
mp-6947
mp-3236
~~~

### Query by a top-level field

The following operation finds documents whose **nelements** field equals **3**:

~~~ {.python}
cursor = db.materials.find({"nelements": 3})
~~~

Let's print ("pretty print", for nice indentation) a few of the results:

~~~ {.python}
from pprint import pprint

for doc in cursor.limit(3):
    pprint(doc)
~~~

~~~ {.output}
{'_id': ObjectId('56ce22947943f62692bdada6'),
 'chemsys': 'Er-O-S',
 'elasticity': None,
 'elements': ['Er', 'O', 'S'],
 'material_id': 'mp-12671',
 'nelements': 3,
 'pretty_formula': 'Er2SO2',
 'spacegroup': {'crystal_system': 'trigonal',
                'hall': '-P 3 2=',
                'number': 164,
                'point_group': '-3m',
                'source': 'spglib',
                'symbol': 'P-3m1'}}
{'_id': ObjectId('56ce22947943f62692bdada8'),
 'chemsys': 'La-O-Si',
 'elasticity': None,
 'elements': ['La', 'O', 'Si'],
 'material_id': 'mp-5152',
 'nelements': 3,
 'pretty_formula': 'La2SiO5',
 'spacegroup': {'crystal_system': 'monoclinic',
                'hall': '-P 2yab',
                'number': 14,
                'point_group': '2/m',
                'source': 'spglib',
                'symbol': 'P2_1/c'}}
{'_id': ObjectId('56ce22947943f62692bdadab'),
 'chemsys': 'Cl-Fe-O',
 'elasticity': {'G_Reuss': 4.800058831100799,
                'G_VRH': 15.695815587428928,
                'G_Voigt': 26.591572343757058,
                'K_Reuss': 12.632559688113227,
                'K_VRH': 27.637901832532986,
                'K_Voigt': 42.643243976952746,
                'calculations': {'energy_cutoff': 700.0,
                                 'kpoint_density': 7000,
                                 'pseudopotentials': ['Fe_pv', 'Cl', 'O']},
                'elastic_anisotropy': 25.074876418379876,
                'elastic_tensor': [[132.83779269421643,
                                    4.717792594504168,
                                    41.313046328714506,
                                    0.0,
                                    0.0,
                                    0.0],
                                   [4.717792594504168,
                                    13.477772725303467,
                                    4.593045165520949,
                                    0.0,
                                    0.0,
                                    0.0],
                                   [41.313046328714506,
                                    4.593045165520949,
                                    136.22586219557556,
                                    0.0,
                                    0.0,
                                    0.0],
                                   [0.0, 0.0, 0.0, 1.98697116, 0.0, 0.0],
                                   [0.0, 0.0, 0.0, 0.0, 51.08350865666667, 0.0],
                                   [0.0,
                                    0.0,
                                    0.0,
                                    0.0,
                                    0.0,
                                    2.581534060000001]],
                'poisson_ratio': 0.26124289904174286},
 'elements': ['Cl', 'Fe', 'O'],
 'material_id': 'mp-552787',
 'nelements': 3,
 'pretty_formula': 'FeClO',
 'spacegroup': {'crystal_system': 'orthorhombic',
                'hall': 'P 2 2ab -1ab',
                'number': 59,
                'point_group': 'mmm',
                'source': 'spglib',
                'symbol': 'Pmmn'}}
~~~

### Projection to select fields

That last query returned all fields for each document. We can use a projection, specified as JSON, to indicate which fields we want. The `_id` field is included by default -- we must be explicit if we don't want it returned.

~~~ {.python}
cursor = db.materials.find({"nelements": 3},
                           {"material_id": 1, "pretty_formula": 1, "_id": 0})

for doc in cursor.limit(3):
    pprint(doc)
~~~
~~~ {.output}
{'material_id': 'mp-12671', 'pretty_formula': 'Er2SO2'}
{'material_id': 'mp-5152', 'pretty_formula': 'La2SiO5'}
{'material_id': 'mp-552787', 'pretty_formula': 'FeClO'}
~~~

### Query by a field in an embedded document

To specify a condition on a field within an embedded document, use dot notation. Dot notation requires quotes around the whole dotted field name.

~~~ {.python}
cursor = db.materials.find({"spacegroup.crystal_system": "cubic"})

print(cursor.count())
~~~
~~~ {.output}
9408
~~~

Projection can take advantage of the same dot notation:

~~~ {.python}
cursor = db.materials.find({"nelements": 2}, {"spacegroup.crystal_system": 1, "elements": 1, "_id": 0})

for doc in cursor.limit(3):
    pprint(doc)
~~~
~~~ {.output}
{'elements': ['Yb', 'Zn'], 'spacegroup': {'crystal_system': 'cubic'}}
{'elements': ['Cr', 'Hf'], 'spacegroup': {'crystal_system': 'hexagonal'}}
{'elements': ['B', 'Lu'], 'spacegroup': {'crystal_system': 'cubic'}}
~~~

### Query by a field in an array

How many materials in our collection contain iron? When a field is an array, testing for membership has the same form as testing for equality:

~~~ {.python}
db.materials.find({"elements": "Fe"}).count()
~~~
~~~ {.output}
5813
~~~

If you supply an array as the value under test, we can see that four polymorphs of iron are present in our collection:

~~~ {.python}
db.materials.find({"elements": ["Fe"]}).count()
~~~
~~~ {.output}
4
~~~

> ## Dot Notation and Projections {.challenge}
>
> Which query below yields documents containing the crystal system and spacegroup number for all binary compounds?
>
> 1. `db.materials.find({"nelements": 2}, {"spacegroup": {"crystal_system": 1, "number": 1}})`
> 2. `db.materials.find({"nelements": 2}, {"spacegroup.crystal_system": 1, "spacegroup.number": 1})`

> ## Combining Conditions {.challenge}
>
> Which query below returns the number of binary oxides (oxygen-containing, two-element materials) in our collection?
>
> 1. `db.materials.find({"elements": "O"}).limit(2).count()`
> 2. `db.materials.find({"elements": "O", "nelements": 2}).count()`
> 3. `db.materials.find({"elements": ["O"], "nelements": 2}).count()`
