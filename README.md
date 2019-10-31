# Omaha System Terminology
A translation tool for the terminology of the [Omaha System](http://omahasystem.org) care taxonomy.

##Features
* has Omaha System terminology in English and German as structured JSON format
* view terminology side-by-side in source and target language
* edit target language translation in browser and download target language as JSON file __(no persistence in your browser or server-side!)__
* updated translation in downloaded JSON file should be merged with corresponding JSON file in this repository
* print view: open `print.html` in Firefox and get a view on Omaha System domains with problems and intervention targets optimized for print on A4 portrait pages (WebKit browsers don't print columns so you definetly need Firefox for printing)

##Installation

* requirements: node.js and npm
* run `npm install`

#### Development and local testing

* run `npm start`

#### Production and deployment

* run `npm run build`
* deploy `index.html` and `dist/*` to your webserver

