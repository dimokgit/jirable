define(['knockout', 'text!./jira-issue-comment.html', "jquery","objecter", "asSubscribable", "jira-settings"], function (ko, templateMarkup, $,O, asSubscribable, jiraSettings) {

  function JiraIssueComment(params) {
    var jiraIssue = O.sure(O.sure(params, "jiraissue"));
    var issue = jiraIssue("issue");
    var lastError = jiraIssue("lastError");
    this.hasIssue = jiraIssue("hasIssue");
    this.isCommentLoaded = ko.observable(false);
    this.isCommentLoading = ko.observable(false);
    this.commentNew = jiraIssue("commentNew");
    this.addComment = function () {
      this.isCommentLoading(true);
      jiraSettings
        .postIssueComment(issue().key, this.commentNew)
        .done(function () {
          this.commentNew("");
          this.isCommentLoaded(true);
          setTimeout(function () { this.isCommentLoaded(false); }.bind(this), 1000);
        }.bind(this))
        .fail(function (e) {
          lastError(e);
        })
        .always(function () {
          this.isCommentLoading(false);
        }.bind(this));
    }.bind(this);

  }

  
  return { viewModel: JiraIssueComment, template: templateMarkup };

});
