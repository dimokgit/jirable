define(['knockout', 'text!./jira-issue.html', 'objecter', 'asSubscribable', "jira-settings", "ko.extensions"], function (ko, templateMarkup, O, asSubscribable, jiraSettings) {

  function JiraIssue(params) {
    asSubscribable.call(this);
    this.serverSessionID = O.sure(jiraSettings, "serverSessionID");
    this.jSessionID = O.sure(jiraSettings, "jSessionID");
    var isLoggedIn = ko.pureComputed(function () { return jiraSettings.restServer.isLoggedIn(); });
    var jiraTickets = O.sure(params, "jiraTickets");
    var issueKey = this.issueKey = ko.observable();
    setIssueKey(jiraTickets());
    this.subscribe(jiraTickets, setIssueKey);
    var issue = this.issue = ko.observable({});
    this.hasIssue = ko.pureComputed(function () {
      return (issue() || {}).key && isLoggedIn();
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
    }, this);
    function setIssueKey(jts) {
      jts.concat([""]).slice(0, 1).forEach(function (jt) {
        issueKey(jt);
      });
    }
  }

  // This runs when the component is torn down. Put here any logic necessary to clean up,
  // for example cancelling setTimeouts or disposing Knockout subscriptions/computeds.
  JiraIssue.prototype.dispose = function () { };

  return { viewModel: JiraIssue, template: templateMarkup };

});
