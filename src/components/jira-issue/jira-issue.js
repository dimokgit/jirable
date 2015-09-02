define(['knockout', 'text!./jira-issue.html'], function(ko, templateMarkup) {

  function JiraIssue(params) {
    this.issueKey = ko.observable("ops-1");
    var issue = this.issue = ko.observable({});
    this.hasIssue = ko.pureComputed(function () {
      return (issue() || {}).key;
    });
    this.issueFields = ko.pureComputed(function () {
      return (issue() || {}).fields || {};
    });
    this.commentNew = ko.observable("");
    this.commentLast = ko.observable("");
    this.issueRefreshInterval = 5 * 1000;
    this.lastError = ko.observable("");
    this.lastErrorString = ko.pureComputed(function () {
      var le = this.lastError();
      return typeof le === "string" ? le : JSON.stringify(le, null, 2);
    },this);
  }

  // This runs when the component is torn down. Put here any logic necessary to clean up,
  // for example cancelling setTimeouts or disposing Knockout subscriptions/computeds.
  JiraIssue.prototype.dispose = function() { };
  
  return { viewModel: JiraIssue, template: templateMarkup };

});
