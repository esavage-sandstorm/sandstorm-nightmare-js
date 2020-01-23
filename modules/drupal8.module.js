'use strict';

/** @module Drupal 8 Module */
const chai = require('chai');
chai.config.includeStack = false;
const expect = chai.expect;
require('mocha-generators').install();
const strings = require('./strings.module.js');
const sandstorm = require('./sandstorm.module.js');
const prompt = require('prompt-sync')({sigint: true});

/**
 * @class
 * Drupal 8 Module
 * @param object config Site configuration. See local .env file
 */
const drupal8module = function(config, nightmare){
  let d8 = this;

  // Get content types and fields and store as yaml locally
  d8.writeSchema = function(){
    if (!d8.loggedIn) {
      d8.login();
    }
    describe('Get Content Types', function(done) {
      this.timeout('60s');
      it('Has content types', function*(){
        const content_types = yield nightmare
          .goto(config.url+'/admin/structure/types')
          .evaluate(() => {
            const content_types = {};
            Array.from(document.querySelectorAll('.block-system-main-block tbody tr')).forEach(row => {

              const link = row.querySelector('.manage-fields a');
              if(link){
                const href = link.href;
                const type = href.split('/')[7];
                const title = row.querySelector('.menu-label').innerText;
                const description = row.querySelector('td:nth-of-type(2)').innerText;
                
                content_types[type] = {
                  name: title,
                  description: description,
                  fields: []
                }
              }
            });
            console.log(content_types);
            return content_types;
          });

        const schema = {
          updated: new Date().toString(),
          content_types: content_types
        };
        sandstorm.writeYaml(schema, 'test.yaml');
        expect(content_types).to.be.an('object');
      });
    });
  }

  // NIGHTMARE HELPER FUNCTIONS

  /**
   * Evaluate the contents of Drupal status messages
   * ex: .nightmare.use(d8.nightmareGetMessages())
   */
  d8.nightmareGetMessages = function(){
    return function(nightmare) {
      nightmare
      .wait('[data-drupal-messages]')
      .evaluate( () => {
        const messages = [];
        const msgs = Array.from(document.querySelectorAll('[data-drupal-messages] div'));
        msgs.forEach(message => {
          let msg = {};
          msg.type = message.className.replace('messages messages--','');
          msg.text = message.innerText.trim();
          messages.push(msg);
        });
        return messages;
      });
    }
  }

  // NIGHTMARE COMPLETE FUNCTIONS

  /**
   * Log out from the Drupal admin.
   * Nightmare will go to /user/logout
   */
  d8.logout = function() {
    const logoutPage = config.url + '/user/logout';
    describe('Logout from the drupal admin.', function(done) {
      this.timeout('60s');
      it('Log out', function*(){
        this.timeout('10s');
        let response = yield nightmare
        .goto(logoutPage)
        expect(response.code).to.equal(200, 'Invalid response: '+response.code);
      });
    });
    d8.loggedIn = false;
  }

  /**
   * Log in to the Drupal admin
   *
   * Nightmare will visit the /user page, 
   * verify no captcha is enabled,
   * fill in username and password,
   * and attempt to log in
   * 
   * @return void Nightmare instance is logged in to the admin, or exceptions are thrown
   */
  d8.login = function() {
    const loginPage = config.url + '/user';
    describe('Log in to drupal admin.', function(done) {
      this.timeout('60s');
      it('Go to '+loginPage, function*(){
        this.timeout('10s');
        let response = yield nightmare
        .goto(loginPage)
        expect(response.code).to.equal(200, 'Invalid response: '+response.code);
      });

      it('CAPTCHA is not enabled', function*(){
        const captcha = yield nightmare
          .evaluate(() => {
            return Array.from(document.querySelectorAll('#user-login .g-recaptcha')).length;
          })
        expect(captcha, 'CAPTCHA is enabled. Disable it to proceed').to.equal(0);
      });

      it('Log in as '+config.username, function*() {
        const response = yield nightmare
          .insert('#edit-name', config.username)
          .insert('#edit-pass', config.password)
          .click('#edit-submit')
          .wait('body')
          .wait(1000)
          .evaluate(() => {
            const response = {};
            response.loggedInUser = '';
            if(!!document.querySelector('#toolbar-item-user')){
              response.loggedInUser =  document.querySelector('#toolbar-item-user').innerText.toLowerCase();
            } else {
              response.error = document.querySelector('[data-drupal-messages]').innerText;
            }
            return response;
          });
          expect(response.loggedInUser.toLowerCase()).to.equal(config.username.toLowerCase(), response.error);
      });
    });
    d8.loggedIn = true;
  }

  /*
  field = {
    type: '',
    selector: '',
    display: '',
    value: ''
  }
  */
  d8.updateField = function(field){
    if (field.type == 'ckeditor'){
      field.srcBtn = field.selector+ ' .cke_button__source';
      field.selector += ' .cke_source';
      it('Enable '+field.display+' src so nightmare can edit', function*(){
        const ck = yield nightmare
        .click(field.srcBtn);
      });
          
    }

    if (field.type == 'text' || field.type == 'ckeditor'){
      it('Input '+field.display, function*(){

        const result = yield nightmare
        
        .wait(field.selector)
        .type(field.selector,field.value)
        .evaluate(selector => {
          let value = ''
          value = document.querySelector(selector).value;
          return value;
        }, field.selector)
        .then(value => {
          expect(value.toString()).to.equal(field.value.toString());
        });
      });
    }

    if (field.type == 'autocomplete'){
      it('Input '+field.display, function*(){

        const result = yield nightmare
        .wait(field.selector)
        .type(field.selector,field.value)
        .evaluate(selector => {
          let value = ''
          value = document.querySelector(selector).value;
          return value;
        }, field.selector)
        .then(value => {
          expect(value).to.equal(field.value);
        });
      });
    }

    if (field.type == 'select' || field.type == 'dropdown'){
      it('Select '+field.display, function*(){

        const result = yield nightmare
        
        .wait(field.selector)
        .select(field.selector,field.value)
        .evaluate(selector => {
          let value = ''
          value = document.querySelector(selector).value;
          return value;
        }, field.selector)
        .then(value => {
          expect(value.toString()).to.equal(field.value.toString());
        });
      });
    }



    if (field.type == 'ckeditor'){
      it('disable '+field.display+' src', function*(){
        const ck = yield nightmare
        .click(field.srcBtn);
      });
    }
  }

  d8.getSchema = function(){
    const schema = sandstorm.getYaml('./.schema', 'utf8');
    return schema;
  }

  d8.updateTitle = function(title){
    const titleField = {
      type: 'text',
      selector: '#edit-title-0-value',
      display: 'Title',
      value: title
    }
    d8.updateField(titleField);
  }

  d8.updateBody = function(body){
    const bodyField = {
      type: 'ckeditor',
      selector: '#cke_edit-body-0-value textarea',
      display: 'Body',
      value: body
    }
    d8.updateField(bodyField);
  }

  d8.addNodeInteractive = function(type){
    const schema = d8.getSchema();
    const node = schema.content_types[type].fields;
    for (let key in node){
      if(node.hasOwnProperty(key)){
        node[key].value = prompt(type.toUpperCase() + ' ' + key+': ');
      }
    }

    d8.addNode(type, node);
  }

  d8.addNode = function(type, fields) {
    if (!d8.loggedIn) {
      d8.login();
    }
    const descText = 'Add a ' + strings.titleCase(type.replace('_', ' ')) + ' node';
    describe(descText, function() {
      this.timeout('300s');
      const addUrl = config.url+'/node/add/'+type
      it('Go to '+addUrl, function*(){
        let response = yield nightmare
          .goto(addUrl);
        expect(response.code).to.equal(200, 'Invalid response: '+response.code);
      });

      for (let key in fields){
        if(fields.hasOwnProperty(key)){
          d8.updateField(fields[key]);
        }
      }

      it('Save the node', function*(){
        const message = yield nightmare.click('#edit-submit')
        .use(d8.nightmareGetMessages());
        expect(message[0].text).to.contain('has been created');
      });
    })
  }

  d8.deleteNode = function(nid) {
    if (!d8.loggedIn) {
      d8.login();
    }
    const descText = 'Delete node ID: ' + nid;
    describe(descText, function() {
      this.timeout('300s');
      const nodeUrl = config.url+'/node/'+nid;
      const deleteUrl = config.url+'/node/'+nid+'/delete';
      it('Node exists', function*(){
        this.timeout('10s');
        let response = yield nightmare
        .goto(nodeUrl)
        expect(response.code).to.equal(200, 'Invalid response: '+response.code);
      });

      it('Delete the node', function*(){
        this.timeout('10s');
        let messages = yield nightmare
        .goto(deleteUrl)
        .click('#edit-submit')
        .use(d8.nightmareGetMessages());
        expect(messages[0].text).to.contain('has been deleted');
      });

      it('Node no longer exists', function*(){
        this.timeout('10s');
        let response = yield nightmare
        .goto(nodeUrl)
        expect(response.code).to.not.equal(200, 'Node still exists.');
      });
    });
  }

  d8.end = function(describeText, itText){
    if (d8.loggedIn) {
      d8.logout();
    }
    describe(describeText, function() {
      it(itText, function*(){
        yield nightmare.end();
      });
    });
  }
}
module.exports = drupal8module;
