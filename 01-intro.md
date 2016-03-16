---
layout: page
title: Using MongoDB
subtitle: Introduction/Setup
minutes: 10
---
> ## Learning Objectives {.objectives}
>
> * Ensure participants have a running local mongod, the sample data, and an open mongo shell

## Setup for Windows

Go to <a href="https://www.mongodb.org/downloads" class="uri">https://www.mongodb.org/downloads</a> and download the MSI installer. The <a href="https://docs.mongodb.org/manual/tutorial/install-mongodb-on-windows/#determine-which-mongodb-build-you-need">official installation tutorial</a> walks through how to determine which version of the installer will be best for your system. Run the installer, accept the license, and choose a “Complete” installation.

Once, installed, open a **Powershell** window and type in

~~~ {.command}
md \data\db
~~~

to create the default data directory for MongoDB to use on your system. Then, add the MongoDB **bin**ary files directory to your Path environment by typing in

~~~{.command}
$env:Path += ";C:\Program Files\MongoDB\Server\3.2\bin"
~~~

and then start the server (called the **mongo** **d**aemon) by typing in

~~~ {.command}
mongod
~~~

Now, open *another* **Powershell** window, and this time call `mongo` (no
**d** at the end) to open a connection to your running server:

~~~ {.command}
$env:Path += ";C:\Program Files\MongoDB\Server\3.2\bin"
mongo
~~~

Type `help` and hit enter, and you should see a listing of commands. Type
`exit` and hit enter to exit the MongoDB shell and return to your Windows
command prompt.

## Setup for Mac OS X

[Homebrew](http://brew.sh/), "the missing package manager for OS X", installs
binary packages based on published "formulae". To install, open a **Terminal**
window and enter (one line)

~~~ {.command}
/usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
~~~

and if you already have `brew` installed, run `brew update` to update your
installation's package database.


To install the MongoDB binaries, run the following:

At a **Terminal** prompt,

~~~ {.command}
brew install mongodb
~~~

Use `brew services` to launch the mongodb daemon (`mongod`) and ensure it
re-launches if your system restarts:

~~~ {.command}
brew tap homebrew/services
brew services restart mongodb
~~~

Run `mongo` at a terminal prompt to open a connection to your running
server. Type `help` and hit enter, and you should see a listing of
commands. Type `exit` and hit enter to exit the MongoDB shell.

## Setup for Linux

The procedure maps more or less to that for Mac OS X above. Consult
[https://docs.mongodb.org/manual/administration/install-on-linux/](https://docs.mongodb.org/manual/administration/install-on-linux/)
for MongoDB setup intructions particular to your flavor of Linux, and ensure
everything works as described in the Mac OS X instructions.
