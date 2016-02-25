---
layout: page
title: Using MongoDB
subtitle: Sort Results
minutes: 10
---
> ## Learning Objectives {.objectives}
>
> * Understand sorting as a method chained to the cursor
> * Sorting by multiple keys

> ## Might Need a Real Connection {.callout}
>
> This topic may require a real database connection through `pymongo`.

To specify an order for the result set, you can append the `sort()` method to a cursor. The argument to sort can be as simple as a key of interest:

~~~ {.python}
filt = {"elasticity": {"$ne": None}}
proj = {"elasticity.poisson_ratio": 1}
proj.update(COMMON_PROJ)
cursor = db.materials.find(filt, proj).sort("elasticity.poisson_ratio")
for doc in cursor.limit(5):
    pprint(doc)
~~~
~~~ {.output}
{'elasticity': {'poisson_ratio': -0.07595596751510682},
 'material_id': 'mp-771798',
 'pretty_formula': 'WO3',
 'spacegroup': {'number': 204}}
{'elasticity': {'poisson_ratio': 0.042582069532848744},
 'material_id': 'mp-87',
 'pretty_formula': 'Be',
 'spacegroup': {'number': 194}}
{'elasticity': {'poisson_ratio': 0.05989488523534276},
 'material_id': 'mp-765892',
 'pretty_formula': 'MnCoO4',
 'spacegroup': {'number': 10}}
{'elasticity': {'poisson_ratio': 0.07135395365323711},
 'material_id': 'mp-611426',
 'pretty_formula': 'C',
 'spacegroup': {'number': 194}}
{'elasticity': {'poisson_ratio': 0.07391837849830045},
 'material_id': 'mp-23703',
 'pretty_formula': 'LiH',
 'spacegroup': {'number': 225}}
~~~

If just a key is given, then the sorting is in ascending order. To specify descending-order sorting by a key:

~~~ {.python}
cursor = db.materials.find(filt, proj).sort("elasticity.poisson_ratio", -1)
for doc in cursor.limit(5):
    pprint(doc)
~~~
~~~ {.output}
{'elasticity': {'poisson_ratio': 0.46752282089107655},
 'material_id': 'mp-1387',
 'pretty_formula': 'AlV3',
 'spacegroup': {'number': 223}}
{'elasticity': {'poisson_ratio': 0.46347893160099135},
 'material_id': 'mp-361',
 'pretty_formula': 'Cu2O',
 'spacegroup': {'number': 224}}
{'elasticity': {'poisson_ratio': 0.4622062265482987},
 'material_id': 'mp-544',
 'pretty_formula': 'Ti3Ir',
 'spacegroup': {'number': 223}}
{'elasticity': {'poisson_ratio': 0.4461861025154294},
 'material_id': 'mp-22060',
 'pretty_formula': 'Nb3In',
 'spacegroup': {'number': 223}}
{'elasticity': {'poisson_ratio': 0.4450687838211702},
 'material_id': 'mp-75',
 'pretty_formula': 'Nb',
 'spacegroup': {'number': 229}}
~~~

What happens if we want secondary sorting? The argument to `sort()` is then a list of pairs, where each pair specifies a key to sort by and a direction, either ascending (1) or descending (-1) order. The first pair specifies the primary sorting, and the second pair the secondary sorting after the first is done.

~~~ {.python}
cursor = db.materials.find(filt, proj).sort([
        ("nelements", -1),
        ("elasticity.poisson_ratio", -1),
    ])
for doc in cursor.limit(5):
    pprint(doc)
~~~
~~~ {.output}
{'elasticity': {'poisson_ratio': 0.3419981312210572},
 'material_id': 'mp-556194',
 'pretty_formula': 'SrSbSe2F',
 'spacegroup': {'number': 129}}
{'elasticity': {'poisson_ratio': 0.34027796672596883},
 'material_id': 'mp-12532',
 'pretty_formula': 'KAg2PS4',
 'spacegroup': {'number': 121}}
{'elasticity': {'poisson_ratio': 0.3349886462699885},
 'material_id': 'mp-557862',
 'pretty_formula': 'BaAg2(HgO2)2',
 'spacegroup': {'number': 125}}
{'elasticity': {'poisson_ratio': 0.3050725032443602},
 'material_id': 'mp-11806',
 'pretty_formula': 'LiMgSnPt',
 'spacegroup': {'number': 216}}
{'elasticity': {'poisson_ratio': 0.3042911533524732},
 'material_id': 'mp-546011',
 'pretty_formula': 'YZnAsO',
 'spacegroup': {'number': 129}}
~~~

You can also pass a keyword argument to `find()` to specify sorting:

~~~ {.python}
cursor = db.materials.find({
        "nelements": {"$lt": 3}
    }, {
        "_id": 0,
        "nelements": 1,
        "elasticity.K_VRH": 1,
        "pretty_formula": 1,
        "spacegroup.crystal_system": 1,
        "material_id": 1,
    }, sort=[
        ("nelements", 1),
        ("elasticity.K_VRH", -1)
    ])

for doc in cursor.limit(5):
    pprint(doc)
~~~
~~~ {.output}
{'elasticity': {'K_VRH': 435.66148729813784},
 'material_id': 'mp-611426',
 'nelements': 1,
 'pretty_formula': 'C',
 'spacegroup': {'crystal_system': 'hexagonal'}}
{'elasticity': {'K_VRH': 401.3286154019227},
 'material_id': 'mp-49',
 'nelements': 1,
 'pretty_formula': 'Os',
 'spacegroup': {'crystal_system': 'hexagonal'}}
{'elasticity': {'K_VRH': 365.08592365295135},
 'material_id': 'mp-8',
 'nelements': 1,
 'pretty_formula': 'Re',
 'spacegroup': {'crystal_system': 'hexagonal'}}
{'elasticity': {'K_VRH': 346.3227612888041},
 'material_id': 'mp-101',
 'nelements': 1,
 'pretty_formula': 'Ir',
 'spacegroup': {'crystal_system': 'cubic'}}
{'elasticity': {'K_VRH': 307.5241654938898},
 'material_id': 'mp-33',
 'nelements': 1,
 'pretty_formula': 'Ru',
 'spacegroup': {'crystal_system': 'hexagonal'}}
~~~

> ## Why a List of Pairs? {.challenge}
>
> A query filter is specified as a `dict` of key-value pairs, and so is a query projection. Why can't we just use, for example, `{"key1": 1, "key2": -1}` as an argument to `sort()` to specify a primary ascending sort by "key1" and a secondary descending sort by "key2"?

> ## Take a Number {.challenge}
>
> Each crystal system maps to a consecutive range of space group numbers. Verify this is the case by inspection through sorting. It may be helpful to use the `distinct` aggregation method on a collection to get a list of the crystal systems present in the collection:
>
>```python
># Filter out compounds with unknown crystal symmetry
>systems = filter(None, db.materials.distinct("spacegroup.crystal_system"))
>for s in systems:
>    # do stuff
>```


