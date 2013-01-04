Gombot Client (Chrome)
----------------------

These are the browser extensions for Gombot, an new experimental cross-platform password manager from Mozilla.

For more information on packaging and running this extension in Chrome, see [http://developer.chrome.com/extensions/packaging.html](this page).

Setup
-----

Make sure to check out submodules (` git submodule update --init `) before running.

Building the site configuration file requires running `build_site_configs.rb`. This is only needed when site_configs.yml is updated. This script uses the js-yaml commmand line tool [https://github.com/nodeca/js-yaml], which must be in your PATH.