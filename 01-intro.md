---
layout: page
title: Using MongoDB
subtitle: Introduction/Setup
minutes: 10
---
> ## Learning Objectives {.objectives}
>
> * Ensure participants have a running local mongodb, the sample data, and an open notebook
> * Introduce the Jupyter Notebook environment

### Setup for Windows

#### W.1 MongoDB

Full setup instructions are at
[https://docs.mongodb.org/manual/tutorial/install-mongodb-on-windows/](https://docs.mongodb.org/manual/tutorial/install-mongodb-on-windows/).

##### W.1.1 Determine which MongoDB you need, download it, and install it
1. Go to [https://www.mongodb.org/downloads](https://www.mongodb.org/downloads) and download the MSI installer. [This section](https://docs.mongodb.org/manual/tutorial/install-mongodb-on-windows/#determine-which-mongodb-build-you-need) of the above installation tutorial walks through how to determine which version of the installer will be best for your system.
2. Run the installer, accept the license, and choose a "Complete" installation.

##### W.1.2 Set up the MongoDB environment
Once, installed, open a **Command Prompt** and type in

~~~ {.command}
md \data\db
~~~

to create the default data directory for MongoDB to use on your system. Then,
start the server (called the **mongo** **d**aemon) by typing in

~~~ {.command}
"C:\Program Files\MongoDB\Server\3.2\bin\mongod.exe"
~~~

or whatever the path is to where you have MongoDB installed. If you get an
error when running `mongod.exe`, you may have to specify another storage
engine:

~~~ {.command}
"C:\Program Files\MongoDB\Server\3.2\bin\mongod.exe" --storageEngine=mmapv1
~~~

##### W.1.3 Connect to MongoDB

Open *another* **Command Prompt** window, and this time call `mongo.exe` (no
**d** at the end) to open a connection to your running server:

~~~ {.command}
"C:\Program Files\MongoDB\Server\3.2\bin\mongo.exe"
~~~

Type `help` and hit enter, and you should see a listing of commands. Type
`exit` and hit enter to exit the MongoDB shell and return to your Windows
command prompt.

Congratulations! You have a running MongoDB server that will be sufficient for the lesson.

#### W.2 Python and Interactive Notebooks

##### W.2.1 Install Anaconda

Go to
[https://www.continuum.io/downloads#_windows](https://www.continuum.io/downloads#_windows)
to download and install Anaconda for Windows, the Python 3.5 version. This will
give you an *isolated* installation that you can use in this lesson and
beyond. It's isolated because all files will be in a single folder -- no
existing or future Python environments on your system will be affected, and you
can delete it all at any time by simply deleting the folder.

##### W.2.2 Install extra packages used by this lesson

Open **Anaconda Prompt** (there should be a link in your Start Menu) and

~~~ {.command}
pip install mongomock
pip install pymongo
~~~

to install the `mongomock` and `pymongo` packages. Now, you can close the
Anaconda Prompt window and open **Jupyter Notebook**. This will start a
notebook server and open its interface in your web browser.

##### W.2.3 Connect to MongoDB through Python

Now, Let's work on your Desktop and test your local MongoDB connection.

1. Click the `Desktop` link in the directory listing
2. Click on the `New` dropdown at the upper right and select `Python 3`.
3. In the cell, put in the following lines:

    ~~~ {.python}
    from pymongo import MongoClient
    client = MongoClient()
    db = client.swc_lbl
    db.labs.insert_one({"name": "LBL"})
    db.labs.count()
    ~~~

and run qthe cell. If the output is `1` (or just not an error; if you run it
multiple times, the count will keep going up!), then you should be good to go
for the lesson! Congratulations!

### Setup for Mac OS X

#### M.1 MongoDB

[Homebrew](http://brew.sh/), "the missing package manager for OS X", installs
binary packages based on published "formulae". To install, open a **Terminal**
window and enter (one line)

~~~ {.command}
/usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
~~~

and if you already have `brew` installed, run `brew update` to update your
installation's package database.


To install the MongoDB binaries, run the following:

##### M.1.1 Download and install MongoDB

At a **Terminal** prompt,

~~~ {.command}
brew install mongodb
~~~

##### M.1.2 Launch MongoDB

Use `brew services` to launch the mongodb daemon (`mongod`) and ensure it
re-launches if your system restarts:

~~~ {.command}
brew tap homebrew/services
brew services restart mongodb
~~~

##### M.1.3 Connect to MongoDB

Run `mongo` at a terminal prompt to open a connection to your running
server. Type `help` and hit enter, and you should see a listing of
commands. Type `exit` and hit enter to exit the MongoDB shell.

Congratulations! You have a running MongoDB server that will be sufficient for
the lesson.

#### M.2 Python and Interactive Notebooks

##### M.2.1 Install Anaconda

Go to
[https://www.continuum.io/downloads#_macosx](https://www.continuum.io/downloads#_macosx)
to download and install Anaconda for OS X, the Python 3.5 version. This will
give you an *isolated* installation that you can use in this lesson and
beyond. It's isolated because all files will be in a single folder -- no
existing or future Python environments on your system will be affected, and you
can delete it all at any time by simply deleting the folder.

##### M.2.2 Install extra packages used by this lesson

At your terminal prompt, prepend Anaconda's binaries to your PATH for the
current terminal window by entering the following (replacing `jdoe` with your
username):

~~~ {.command}
export PATH="/Users/jdoe/anaconda/bin:$PATH"
~~~

This assumes you installed Anaconda to the `anaconda` folder in your home
directory (the default). It's possible the Anaconda installer already added a
line to the end of your `~/.bash_profile` file to do this automatically every
time you open a terminal prompt.

Ensure that when you type `python` at the prompt, "Python 3.5" and "Anaconda"
appears in the first line of output. Enter `exit()` to enter the Python
session. Next, enter the commands

~~~ {.command}
pip install mongomock
pip install pymongo
~~~

to install the `mongomock` and `pymongo` packages. Finally, enter `jupyter
notebook` at the prompt. This will start a notebook server and open its
interface in your web browser.

##### M.2.3 Connect to MongoDB through Python

Now, Let's work on your Desktop and test your local MongoDB connection.

1. Click the `Desktop` link in the directory listing
2. Click on the `New` dropdown at the upper right and select `Python 3`.
3. In the cell, put in the following lines:

    ~~~ {.python}
    from pymongo import MongoClient
    client = MongoClient()
    db = client.swc_lbl
    db.labs.insert_one({"name": "LBL"})
    db.labs.count()
    ~~~

and run the cell. If the output is `1` (or just not an error; if you run it
multiple times, the count will keep going up!), then you should be good to go
for the lesson! Congratulations!

### Setup for Linux

The procedure maps more or less to that for Mac OS X above. Consult
[https://docs.mongodb.org/manual/administration/install-on-linux/](https://docs.mongodb.org/manual/administration/install-on-linux/)
for MongoDB setup intructions particular to your flavor of Linux, use the Linux
installer for Anaconda, and ensure everything works as described in the Mac OS
X instructions above.

> ## Tour the Jupyter Interface {.challenge}
>
> Go to Help->User Interface Tour in your open Jupyter notebook to learn about the interface.

> ## Learn a few Jupyter Keyboard Shortcuts {.challenge}
>
> Go to Help->Keyboard Shortcuts in an open Jupyter notebook. Practice running cells, inserting cells, and switching between Code and Markdown modes.
