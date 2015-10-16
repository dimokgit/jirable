/// <reference path="jira-settings.js" />
/// <reference path="../bower_modules/data-ui/lib/asSubscribable.js" />
/// <reference path="../bower_modules/monads/lib/promise-monad.js" />
/// <reference path="../bower_modules/jquery.extentions/lib/objecter.js" />
/// <reference path="../bower_modules/underscore/underscore.js" />
// require.js looks for the following global when initializing
var require = {
  baseUrl: ".",
  paths: {
    "bootstrap": "bower_modules/components-bootstrap/js/bootstrap.min",
    "crossroads": "bower_modules/crossroads/dist/crossroads.min",
    "hasher": "bower_modules/hasher/dist/js/hasher.min",
    "jquery": "bower_modules/jquery/dist/jquery",
    "knockout-projections": "bower_modules/knockout-projections/dist/knockout-projections",
    "signals": "bower_modules/js-signals/dist/signals.min",
    "text": "bower_modules/requirejs-text/text",
    "underscore":"bower_modules/underscore/underscore",

    "promise-monad": "bower_modules/monads/lib/promise-monad",
    "objecter": "bower_modules/jquery.extentions/lib/objecter",
    "jira-settings": "app/jira-settings",
    "asSubscribable": "bower_modules/data-ui/lib/asSubscribable"
  },
  map: {
    '*': {
      "knockout": "bower_modules/knockout/dist/knockout",
      "ko": "bower_modules/knockout/dist/knockout"
    }
  },
  shim: {
    "bootstrap": { deps: ["jquery"] }
  }
};
