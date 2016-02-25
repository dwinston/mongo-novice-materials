---
layout: lesson
title: Using MongoDB
---

This lesson introduces MongoDB, a document-oriented database that departs from
the relational nature of SQL. Because SQL is so well-established and prevalent
as a database technology, the terms "relational database" and "SQL" are often
synonymous. Furthermore, the term "NoSQL" has come to encompass a whole class
of database technologies that are non-relational in nature. There are other
"NoSQL" technologies such as key-value stores and column stores that differ
from MongoDB's document/collection approach, but we will only cover MongoDB
today.

MongoDB trades off the strictness of SQL for a degree of simplicity and
flexibility desirable for scientists who are often not certain about the
best schema design for new/changing data sets. Whereas SQL lends itself well to
enforcing a schema and thus ensuring data validation at the database level, a
system like MongoDB does not require setting/migrating schemas to get started
with data management. However, this means that application-level data
validation (e.g. before adding to the database) is particularly
important. MongoDB can pick up on implicit schema in your data through the
creation of indexes, which will speed up queries significantly for large data
sets.

This lesson was originally developed at the
[Lawrence Berkeley National Laboratory](http://lbl.gov), where many scientists
use MongoDB servers hosted by [NERSC](http://nersc.gov) to
[manage workflows](https://pythonhosted.org/FireWorks/) and
[process data](https://pythonhosted.org/pymatgen-db/) on supercomputing
clusters. The example data for this lesson is from the
[Materials Project](https://materialsproject.org), which hosts computed
information for tens of thousands of known and predicted inorganic crystalline
compounds.

> ## Prerequisites {.prereq}
>
> There are no strict prerequisites. The following would be helpful:
>
> * Familiarity with the command line, for running a mongo server locally and importing data.
> * Familiarity with programming in Python, for learning commands using the `mongomock` (if no server is available) or `pymongo` packages.

> ## Getting ready {.getready}
>
> You need to download two data files to follow this lesson:
>
> 1. Make a new folder in your Desktop called `data`.
> 2. Download [mongo-novice-materials.json](./data/mongo-novice-materials.json) (~20 MB) (Right-click the link and "Save as...") to this folder.
> 3. Download [periodic_table.json](./data/periodic_table.json) (~120 KB) to the same folder.

## Topics

1.  [Introduction/Setup](01-intro.html)
2.  [Connect to / Import into a Mock Database](02-mockconn.html)
3.  [Insert Data](03-insert.html)
4.  [Find Data](04-find.html)
5.  [Specify Conditions with Operators](05-operators.html)
6.  [Sort Results](06-sort.html)
7.  [Update Data](07-update.html)
8.  [Remove Data](08-remove.html)
9.  [Data Aggregation](09-aggregate.html)
10. [Indexes](10-indexes.html)

## Other Resources

*   [Reference](reference.html)
*   [Discussion](discussion.html)
*   [Instructor's Guide](instructors.html)
