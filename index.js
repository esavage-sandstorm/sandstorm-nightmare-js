'use strict';

// require modules
const fs   = require('fs');
const yaml = require('js-yaml');
const Nightmare = require('nightmare');
const drupal8module = require('./modules/drupal8.module.js');

const env = process.env.env;

const config = {};
const nightmareConfig = {};

// Get settings and pass them around
try {
  const settings = yaml.safeLoad(fs.readFileSync('./.env', 'utf8'));
  Object.assign(nightmareConfig, settings.nightmare);
  Object.assign(config, settings.global);
  if (env){
    Object.assign(config, settings[env]);
  }
} catch (e) {
  console.error(e);
}

// Build modules

const sd = require('./modules/sandstorm.module.js');

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



// drupal8.login();

// drupal8.deleteNode(3);
// drupal8.addBasicPage(+ new Date(), 'test body');

// drupal8.getSchema('page.content-type');

// drupal8.writeSchema();
// drupal8.addNodeInteractive('page');

// End the instance
drupal8.end(sd.bar, 'Testing complete');
