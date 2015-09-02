define(['jquery', 'knockout', './router', 'bootstrap', 'knockout-projections'], function($, ko, router) {

  // Components can be packaged as AMD modules, such as the following:
  ko.components.register('nav-bar', { require: 'components/nav-bar/nav-bar' });

  ko.components.register('jira-issue-transitions', { require: 'components/jira-issue-transitions/jira-issue-transitions' });

  ko.components.register('jira-issue-info', { require: 'components/jira-issue-info/jira-issue-info' });

  ko.components.register('jira-issue', { require: 'components/jira-issue/jira-issue' });

  ko.components.register('jira-issue-comment', { require: 'components/jira-issue-comment/jira-issue-comment' });

  ko.components.register('jira-issue-summary', { require: 'components/jira-issue-summary/jira-issue-summary' });

  ko.components.register('jira-issue-comment-last', { require: 'components/jira-issue-comment-last/jira-issue-comment-last' });

  // [Scaffolded component registrations will be inserted here. To retain this feature, don't remove this comment.]

  // Start the application
  ko.applyBindings({ route: router.currentRoute });
});
