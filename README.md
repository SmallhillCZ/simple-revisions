# simple-revisions

A simple web app to anonymously gather revisions for document.

## Prerequisities

 - NodeJS

## Installation

```
npm install
npm run build
```

## Configuration

App configuration can be made in file ```config.js```, document-specific configuration can be made in file ```data/config.json``` (see section Data).


## Data

You have to create a directory ```data``` with following files
 - document.html
 - config.json
 - revisions.json (with an empty array)
 - style.css (optional)
 
 Example is directory ```data-example```.
 
 ## Startup
 
 ```
 npm start
 ```
