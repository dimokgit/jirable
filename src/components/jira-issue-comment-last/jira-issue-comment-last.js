define(['knockout', 'text!./jira-issue-comment-last.html', "objecter"], function (ko, templateMarkup, O) {

  function JiraIssueCommentLast(params) {
    var jiraIssue = O.sure(O.sure(params, "jiraissue"));
    var issueFields = jiraIssue("issuefields");
    this.hasIssue = jiraIssue("hasIssue");
    this.commentLast = ko.pureComputed(function () {
      return ((issueFields().comment || {}).comments || [])
        .slice(-1)
        .map(function (c) { return c.body; })[0];
    });
  }
  
  return { viewModel: JiraIssueCommentLast, template: templateMarkup };

});
