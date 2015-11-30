define(['knockout', 'text!./jira-issue-comment-last.html', "objecter"], function (ko, templateMarkup, O) {

  function JiraIssueCommentLast(params) {
    var jiraIssue = O.sure(O.sure(params, "jiraissue"));
    var issueFields = jiraIssue("issuefields");
    this.commentLast = ko.pureComputed(function () {
      return ((issueFields().comment || {}).comments || [])
        .slice(-1)
        .map(function (c) {
          var d = new Date(c.created);
          return "["+c.author.displayName +"] on "+d.toDateString() + " " + d.toLocaleTimeString() + ":\n" + c.body;
        })[0];
    });
  }
  
  return { viewModel: JiraIssueCommentLast, template: templateMarkup };

});
