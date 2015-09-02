define(['knockout', 'text!./jira-issue-summary.html', "objecter"], function (ko, templateMarkup,  O) {

  function JiraIssueSummary(params) {
    var jiraIssue = O.sure(O.sure(params, "jiraissue"));
    var issueFields = jiraIssue("issuefields");
    this.hasIssue = jiraIssue("hasIssue");
    this.summary = ko.pureComputed(function () {
      var s = issueFields().summary;
      this.isLoaded(false);
      if (s) setTimeout(function () {
        this.isLoaded(true);
      }.bind(this), 300);
      return s;
    }, this);
    this.isLoaded = ko.observable(false);
  }

  return { viewModel: JiraIssueSummary, template: templateMarkup };

});
