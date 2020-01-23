'use strict';
/*******************************************************************************
* INCLUDE MODULES
*******************************************************************************/
const fs   = require('fs');
const yaml = require('js-yaml');
const Nightmare = require('nightmare');
const drupal8module = require('./modules/drupal8.module.js');
const sd = require('./modules/sandstorm.module.js');
/*******************************************************************************
* GET THE ENVIRONMENT READY
*******************************************************************************/
const env = process.env.env;
sd.getConfig(env);

const nightmare = Nightmare(sd.nightmareConfig);
const drupal8 = new drupal8module(sd.config, nightmare);
/*******************************************************************************
* LET'S GET STARTED
*******************************************************************************/
let headerText = "SANDSTORM NIGHTMARE JS AUTOMATED TESTING: "+config.name;
if (env){
  headerText += ' ('+env+')';
}
sd.consoleHeader(headerText);
/*******************************************************************************
* TESTS HERE
*******************************************************************************/

// drupal8.login();

// drupal8.deleteNode(3);
// drupal8.addBasicPage(+ new Date(), 'test body');

// drupal8.getSchema('page.content-type');

// drupal8.writeSchema();
// drupal8.addNodeInteractive('page');

/*******************************************************************************
* END TESTING
*******************************************************************************/
drupal8.end(sd.bar, 'Testing complete');
