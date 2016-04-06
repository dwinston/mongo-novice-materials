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

To specify an order for the result set, you can append the `sort()` method to a cursor. For ascending-order sorting by a single key of interest:

~~~
filt = {elasticity: {$ne: null}}
proj = {"elasticity.poisson_ratio": 1}
Object.assign(proj, my_proj)
db.materials.find(filt, proj).sort({"elasticity.poisson_ratio": 1})
~~~
~~~ {.output}
{ "pretty_formula" : "WO3", "material_id" : "mp-771798", "elasticity" : { "poisson_ratio" : -0.07595596751510682 } }
{ "pretty_formula" : "Be", "material_id" : "mp-87", "elasticity" : { "poisson_ratio" : 0.042582069532848744 } }
{ "pretty_formula" : "MnCoO4", "material_id" : "mp-765892", "elasticity" : { "poisson_ratio" : 0.05989488523534276 } }
...
~~~

To specify descending-order sorting by a key:

~~~
db.materials.find(filt, proj).sort({"elasticity.poisson_ratio": -1}).pretty()
~~~
~~~ {.output}
{
	"pretty_formula" : "AlV3",
	"material_id" : "mp-1387",
	"elasticity" : {
		"poisson_ratio" : 0.46752282089107655
	}
}
{
	"pretty_formula" : "Cu2O",
	"material_id" : "mp-361",
	"elasticity" : {
		"poisson_ratio" : 0.46347893160099135
	}
}
...
~~~

I also chose to chain `pretty()` on the cursor to pretty-print the results, i.e. auto-indent things. To turn pretty-printing on for this shell session, we can set

~~~
DBQuery.prototype._prettyShell = true
~~~

What happens if we want secondary sorting? The argument to `sort()` is still an object. The first key-value pair specifies the primary sorting, the second pair the secondary sorting after the first is done, and so on.

~~~
db.materials.find(filt, proj).sort(
    {nelements: -1, "elasticity.poisson_ratio": -1}
)
~~~
~~~ {.output}
{
	"pretty_formula" : "SrSbSe2F",
	"material_id" : "mp-556194",
	"elasticity" : {
		"poisson_ratio" : 0.3419981312210572
	}
}
{
	"pretty_formula" : "KAg2PS4",
	"material_id" : "mp-12532",
	"elasticity" : {
		"poisson_ratio" : 0.34027796672596883
	}
}
...
~~~

> ## Ordering of Key-Value Pairs {.callout}
>
> If you are using MongoDB via a driver for another language, there may be a different format for specifying sorting by multiple keys. For example, in Python, the notation `{nelements: -1, "elasticity.poisson_ratio": -1}` results in an unordered dictionary type, meaning key ordering is lost. Thus, for the MongoDB Python driver (`pymongo`), a different notation is used for sorting.
>


