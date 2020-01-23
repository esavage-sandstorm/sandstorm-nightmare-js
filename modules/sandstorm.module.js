'use strict';
const terminal = require('window-size');
const fs   = require('fs');
const yaml = require('js-yaml');


const sandstorm = function() {
  const symbol = '*';
  
  let module = this;
  
  module.bar = symbol.padStart(terminal.width - 2, symbol);

  module.getConfig = function(env){
    module.config = {};
    module.nightmareConfig = {};
    if (settings = module.getYaml('./.env')){
      Object.assign(module.nightmareConfig, settings.nightmare);
      Object.assign(module.config, settings.global);
      if (env){
        Object.assign(module.config, settings[env]);
      }
    }
  }
  module.writeYaml = function(data, filename) {
    let yamlStr = yaml.safeDump(data);
    fs.writeFileSync(filename, yamlStr, 'utf8');
  }
  module.getYaml = function(file){
    try {
      const data = yaml.safeLoad(fs.readFileSync(file, 'utf8'));
      return data;
    } catch(e) {
      console.error(e);
      return false;
    }
  }

  module.consoleHeader = function(text){
    console.log(module.bar);
    text = (symbol+symbol+' '+text).padEnd(module.bar.length - 2, ' ')+symbol+symbol;
    console.log(text);
    console.log(module.bar);
  }

  module.logError = function(text) {
    const red = '\x1b[31m%s\x1b[0m';
    console.log('');
    console.log(red, module.bar);
    text = (symbol+symbol+' '+text).padEnd(module.bar.length - 2, ' ')+symbol+symbol;
    console.log(red, text);
    console.log(red, module.bar);
    console.log('');
  }
}

module.exports = new sandstorm();
