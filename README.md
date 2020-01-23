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

### Sandstorm
A central module for common functions, like reading / writing files, printing data to the console, etc.

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