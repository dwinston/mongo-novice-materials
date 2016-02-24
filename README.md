# mongodb-novice-materials

Introduction to MongoDB for non-programmers using materials data from the [Materials Project](https://materialsproject.org). Uses a Python interface.

> Please see [swc-lesson-example](https://github.com/swcarpentry/lesson-example)
> for instructions on formatting, building, and submitting lessons,
> or run `make` in this directory for a list of helpful commands.

## Setting up a virtualenv for lesson development
The `env/` directory is `.gitignore`d, so you can do the following to get started:

```bash
# assumes you have python and the virtualenv package installed,
# e.g. via `pip install virtualenv`
# From this repository's root directory:
$ virtualenv -p python3 env
$ source env/bin/activate
$ pip install -r requirements.txt
```

And then `deactivate` to deactivate the virtual environment when you're done.

## Example setup for watching changes

There are many ways to do this. Here is a setup that works for OSX that uses
[entr](http://entrproject.org/) to generate e.g. HTML from MD sources, Python's
simple http request handler to serve the static site locally, and
[LiveReload](http://livereload.com/) to automatically refresh pages in the
browser.

In one terminal tab, use [entr](http://entrproject.org/) to track changes made
to files and rerun the `make preview` command automatically:

```bash
$ while true; do ls -d * | entr -d make preview; done
```

In another terminal tab, run `python -m http.server`, and then open a
browser to http://localhost:8000. With [LiveReload](http://livereload.com/)
installed, you can activate it on the folder for this repo, and the browser
will refresh automatically on file changes.

