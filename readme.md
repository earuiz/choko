# ![Choko](https://raw.github.com/recidive/choko/master/applications/default/public/img/logo.png)

  Web Application Framework for Node.js. With Choko you can develop complex
  single page web applications within minutes, without requiring any kind of
  rocket science knowledge.

  Choko comes with a build in Content Management System and Framework, so you
  can manage your application and the content related to it on a central place,
  with flexible and powerful APIs.

## Installation

  You can install the latest version of Choko globally using
  [NPM](http://npmjs.org):

    sudo npm install -g choko

## Dependencies

  Choko depends on [Node.js](http://nodejs.org), [NPM](http://npmjs.org) and
  [MongoDB](http://www.mongodb.org).

## Getting started

  To create your first application with Choko, you should create a folder that
  will be your applications repository, then run Choko on that folder.

    mkdir applications
    choko applications

  Then follow the steps to have access to the installer.

## Update

  To update to the latest version of Choko you can run:

    sudo npm update -g choko

## Running from the sources

  If you have some specific development needs, you might want to install and run
  Choko from the sources. In order to do so, you can clone the repository and
  build Choko by hand.

    git clone https://github.com/recidive/choko.git
    cd choko
    npm install
    bower install

  You also need to run bower install on the theme extension folder in order to
  download Bootswatch themes.

    cd choko/applications/default/extensions/theme
    bower install

  Now you can start the Choko server by going to the choko main folder and
  running it.

    cd ../../../..
    node server.js

  You can also run it using the choko script like this:

    bin/choko

## Directory structure

```
applications   -> Where core applications live.
  default      -> Default application, all other applications extend this.
    extensions -> Default application extensions.
    public     -> Default application public files.
  example      -> Sample application to show case Choko features.
lib            -> Choko serverside libraries.
```

The only place it's advised to add or change files is in your own applications
repository folder.

## Coding style

We try to conform to [Felix's Node.js Style Guide](https://github.com/felixge/node-style-guide)
for all of our JavaScript code. For coding documentation we use [JSDoc](http://usejsdoc.org/)
style.
