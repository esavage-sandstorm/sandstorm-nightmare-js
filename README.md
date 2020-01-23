# sandstorm-nightmare-js
A test suite for Nightmare JS driven automated testing.

Goals:
	- Create modular tests that can be chained and adjusted  to suit the local environment.
	- Keep codebase lean: 
	- - Create custom modules for re-usable functionality.
	- - Load dependencies within sub-modules
## The .env file
A project should have a .env file which will contain (at minimum) the following information. This file will not be tracked by git for security's sake.:
- nightmare options
	- Show: display the electron browser when running tests
	- switches
		- ignore-certificate-errors: if true, Electron will ignore the errors caused by self-signed SSL certificates.
	- window: TBD
- Global Options
	- name: A friendly Display Name for the project.
	- username: the CMS username for Nightmare to use when logging in.
	- password: the password for the above user.
	- login: the path to the login page.
- Environments:
Any number of environments. These values will supercede the global settings. Minimum settings:
	- url: ie domain.local
### Testing
In the index.js file, tests can be queued:

Start testing:
	/*******************************************************************************
	* LET'S GET STARTED
	*******************************************************************************/

	let headerText = "SANDSTORM NIGHTMARE JS AUTOMATED TESTING: "+config.name;
	if (env){
	  headerText += ' ('+env+')';
	}
	sd.consoleHeader(headerText);

tests go here:
	drupal8.login();
	drupal8.deleteNode(3);
	drupal8.addBasicPage(+ new Date(), 'test body');
end testing:
	// End the instance
	drupal8.end(sd.bar, 'Testing complete');
### Example .env
	nightmare:
	  show: true,
	  switches:
	    ignore-certificate-errors: true
	global:
	  name: Sandtorm Drupal 8 Sandbox
	  username: stormtrooper
	  password: global-password
	  login: /login
	local:
	  url: https://sd-d8base.local
	  username: local-user
	  password: local-users-password
## Modules

### Nightmare JS
Automated testing.

[official github](https://github.com/segmentio/nightmare)
### Mocha JS
testing framework.
[official](https://mochajs.org/)
#### Anatomy of a test:
	describe('Logout from the drupal admin.', function(done) {
	  this.timeout('60s');
	  it('Log out', function*(){
	    this.timeout('10s');
	    let response = yield nightmare
	    .goto(logoutPage)
	    expect(response.code).to.equal(200, 'Invalid response: '+response.code);
	  });
	});
-Describe: the test header
-it: a checkable section of the process. Multiple can be chained within one describe block.

### Sandstorm
A central module for common functions, like reading / writing files, printing data to the console, etc.
#### Properties
- sandstorm.Symbol: '\*' the symbol used to draw lines and separators in the console
- sandstorm.Config: an object with configuration for the local environment.
- sandstorm.nightmareConfig: an object with Nightmare specific configuration.
#### Functions

###### sandstorm.getConfig(env)
Read the .env file (see above) and store values within the module.

@param **env** - a string to correspond with the environments in the .env file

@return void - Config values will be assigned to:

- sandstorm.nightmareConfig
- sandstorm.config

###### sandstorm.writeYaml(data, path)
Write out the provided data as YAML to the path provided.

@param data {object} The data to be written.

@param path {string} the path to write it to.

@return void

###### sandstorm.getYaml(path)
Read YAML data from path provided.

@param path {string} the path to be read.

@return {mixed} the data from the provided YAML file

###### sandstorm.consoleHeader(text)
Print the provided text as a full width header within the console.

@param text {string} the text to print

@return void the text will be logged to the console like so:

	******************************************************************************
	** INPUT TEXT                                                               **
	******************************************************************************

asterix can be replaced by changing the value of sandstorm.symbol

###### sandstorm.logError(text)
Print the error text in red and with obvious separation from other stack traces, etc.

@param text {string} the text to print

### Drupal8
A module with common Drupal functions for Nightmare

#### Properties
-config: see the sandstorm module for config.
-nightmare: An instance of Nightmare that will be used across functions
#### Functions

###### d8.nightmareGetMessages()
Get Drupal messages and evaluate them for further logic.

@return nightmare instance with an array of messages. 

Each message is an object:
-tyoe: status or error
-text: message text.

Example use:
	it('Save the node', function*(){
	  const message = yield nightmare.click('#edit-submit')
	  .use(d8.nightmareGetMessages());
	  expect(message[0].text).to.contain('has been created');
	});


###### d8.login()
Nightmare should:
- Go to the login page
- Verify CAPTCHA is not enabled
- Login in with credentials from config

###### d8.logout()
Nightmare should:
- Go to the /user/logout

###### d8.addNode(type, fields)
Nightmare should:
- Go to the /node/add/[type]
- Loop through fields and update each (See d8.updateField)
- save the node

###### d8.addBasicPage(title, body)
Pre-flights the title and body fields, and then  adds a basic page via d8.addNode.

###### d8.deleteNode(nid)
Nightmare should:
- Verify the node id exists
- Delete the node (go to /node/nid/delete)
- Verify the node no longer exists.

###### d8.updteField(field)
Nightmare will update a field's value. how this is done will vry depending on the type of field.
An example field:
	{
	  type: '',
	  selector: '',
	  display: '',
	  value: ''
	}

- type: text, ckeditor, autocomplete, select, dropdown
- selector: javascript selector for the input.
- display: friendly name for the ield in console output
- value: The value to set.

###### d8.end(describeText, itText)
Nightmare should:
- logout
- end the instance and tests.
This should be run at the end of the list of tests in index.js

### STRINGS
A module with common string manipulation functions
#### Functions

###### strings.titleCase(str)
Capitalize each word of a string.