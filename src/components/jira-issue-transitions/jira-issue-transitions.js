define(['knockout', 'text!./jira-issue-transitions.html', "jquery","objecter", "asSubscribable", "jira-settings"], function (ko, templateMarkup, $,O, asSubscribable, jiraSettings) {
  function JiraIssueTransitions(params) {
    asSubscribable.call(this);
    var jiraIssue = O.sure(O.sure(params, "jiraIssue"));
    var issue = jiraIssue("issue");
    var commentNew = jiraIssue("commentNew");

    this.transitions = ko.pureComputed(function () {
      return issue().transitions || [];
    });
    this.postTransition = function (transition) {
      jiraSettings.postIssueTransition(issue().key, transition.id, commentNew)
        .done(function () {
          issue.notifySubscribers(issue());
        }).fail(function (e) {
          alert(JSON.stringify(e));
        });
    }.bind(this);
  }

  // This runs when the component is torn down. Put here any logic necessary to clean up,
  // for example cancelling setTimeouts or disposing Knockout subscriptions/computeds.
  JiraIssueTransitions.prototype.dispose = function () { };

  return { viewModel: JiraIssueTransitions, template: templateMarkup };

});
