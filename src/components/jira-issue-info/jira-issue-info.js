define(['knockout', 'text!./jira-issue-info.html',"objecter", 'asSubscribable',"jira-settings"], function (ko, templateMarkup,O, asSubscribable,jiraSettings) {

  function JiraIssueInfo(params) {
    var self = asSubscribable.call(this);
    var jiraIssue = O.sure(O.sure(params, "jiraIssue"));
    var issue = jiraIssue("issue");
    var issueKey = this.issueKey = jiraIssue("issueKey");
    var issueRefreshInterval = jiraIssue("issueRefreshInterval");
    var lastError = jiraIssue("lastError");
    var hasIssueKey = this.hasIssueKey = ko.pureComputed(function () {
      return checkIssueKey(issueKey());
    });
    this.issueStatus = ko.pureComputed(function () {
      return (((issue() || {}).fields || {}).status || {}).name;
    });
    this.browseLink = ko.pureComputed(function () {
      return jiraSettings.buildBrowseUrl(this.issueKey());
    }.bind(this));
    this.subscribe(this.issueKey, loadIssue);
    var procID = setInterval(function () { loadIssue(issueKey()); }, issueRefreshInterval);

    var super_dispose = this.dispose.bind(this);
    this.dispose = function dispose() {
      super_dispose();
      clearInterval(procID);
    }

    loadIssue(issueKey());

    function loadIssue(key) {
      if (!key) return issue({});
      if (!checkIssueKey(key)) return;
      //startLoading();
      jiraSettings.getIssue(key + "?expand=transitions")
        .done(function (data) {
          issue(data);
          lastError("");
        })
        .fail(function (e) {
          lastError(e);
          issue({});
        })
        .always(function () {
          //finishedLoading();
        });
    }
    function checkIssueKey(key) {
      return /^\s*[a-z]{3,}-\d+\s*$/i.test(ko.unwrap(key));
    }
  }


  return { viewModel: JiraIssueInfo, template: templateMarkup };

});
