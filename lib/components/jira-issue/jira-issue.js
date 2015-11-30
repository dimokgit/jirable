define(['knockout', 'text!./jira-issue.html', 'objecter', 'asSubscribable', "jira-settings", "ko.extensions"], function (ko, templateMarkup, O, asSubscribable, jiraSettings) {

  function JiraIssue(params) {
    asSubscribable.call(this);
    this.serverSessionID = O.sure(jiraSettings, "serverSessionID");
    this.jSessionID = O.sure(jiraSettings, "jSessionID");
    var jiraTickets = O.sure(params, "jiraTickets");
    this.hasJiraTicketsParam = ko.pureComputed(function () { return jiraTickets().length > 0; });
    var issueKey = this.issueKey = ko.observable().extend({ persist: "JIRA_issueKey" });
    this.hasIssueKey = ko.pureComputed(function () { return !!issueKey() && jiraSettings.restServer.isLoggedIn(); });
    this.canChangeIssueKey = ko.pureComputed(function () { return jiraTickets().length == 0; });
    if (jiraTickets().length)
      setIssueKey(jiraTickets());
    this.subscribe(jiraTickets, setIssueKey);
    var issue = this.issue = ko.observable({});
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
      if ((jts || []).length > 1) {
        var error = "Jira Tickets array has more then one ticket";
        alert(error);
        throw new Error(error);
      }
      jts.concat([""]).slice(0, 1).forEach(function (jt) {
        issueKey(jt);
      });
    }
  }

  return { viewModel: JiraIssue, template: templateMarkup };

});
