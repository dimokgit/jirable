define(['knockout', 'text!./jira-issue-comment.html', "jquery","objecter", "asSubscribable", "jira-settings"], function (ko, templateMarkup, $,O, asSubscribable, jiraSettings) {

  function JiraIssueComment(params) {
    var jiraIssue = O.sure(O.sure(params, "jiraissue"));
    var issue = jiraIssue("issue");
    var lastError = jiraIssue("lastError");
    this.isCommentLoaded = ko.observable(false);
    this.isCommentLoading = ko.observable(false);
    this.commentNew = jiraIssue("commentNew");
    this.addComment = function () {
      if (!this.commentNew()) return;
      this.isCommentLoading(true);
      jiraSettings.restServer
        .postIssueComment(issue().key, this.commentNew)
        .done(function () {
          this.commentNew("");
          this.isCommentLoaded(true);
          setTimeout(function () { this.isCommentLoaded(false); }.bind(this), 1000);
        }.bind(this))
        .fail(jiraSettings.restServer.showError.bind(null, "JIRA PostComment"))
        .always(function () {
          this.isCommentLoading(false);
        }.bind(this));
    }.bind(this);

  }

  
  return { viewModel: JiraIssueComment, template: templateMarkup };

});
