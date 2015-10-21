define(['knockout', 'text!./jira-issue-info.html', "objecter", 'asSubscribable', "jira-settings"]
 , function (ko, templateMarkup, O, asSubscribable, jiraSettings) {

  function JiraIssueInfo(params) {
    var self = asSubscribable.call(this);
    //#region fields
    var isLoading = this.isLoading = ko.observable(false);
    var jiraIssue = O.sure(O.sure(params, "jiraIssue"));
    var issue = jiraIssue("issue");
    var hasIssue = jiraIssue("hasIssue");
    var issueFields = jiraIssue("issueFields");
    var issueRefreshInterval = jiraIssue("issueRefreshInterval");
    var lastError = jiraIssue("lastError");
    var commentNew = jiraIssue("commentNew");
    //#endregion

    //#region properties/methods
    this.baseUrl = O.sure(jiraSettings, "baseUrl");
    var loginRequired = this.loginRequired = ko.pureComputed(function () {
      return !jiraSettings.restServer.isLoggedIn();
    });
    this.logOff = O.sure(jiraSettings.restServer,"logOff");
    this.jiraUser = O.sure(jiraSettings.restServer,"jiraUser");
    this.jiraPassword = O.sure(jiraSettings.restServer,"jiraPassword");
    var issueKey = this.issueKey = jiraIssue("issueKey");
    var hasIssueKey = this.hasIssueKey = ko.pureComputed(function () {
      return checkIssueKey(issueKey());
    });
    this.issueStatus = ko.pureComputed(function () {
      return (((issue() || {}).fields || {}).status || {}).name;
    });
    this.browseLink = ko.pureComputed(function () {
      return jiraSettings.buildBrowseUrl(this.issueKey());
    }.bind(this));
    //#endregion

    this.transitions = ko.pureComputed(function () {
      return issue().transitions || [];
    });
    this.postTransition = function (transition) {
      isLoading(true);
      var key = issue().key;
      jiraSettings.restServer.postIssueTransition(key, O.sure(transition, "name"), commentNew)
        .done(function (trans) {
          issue.notifySubscribers(issue());
          commentNew("");
          loadIssue(key);
        })
        .fail(jiraSettings.restServer.showError.bind(null, "JIRA PostTransition"))
        .always(isLoading.bind(null, false));
    }.bind(this);

    this.gotoIssue = function (data) {
      issueKey(data.key);
    }
    this.issueLinks = ko.pureComputed(function () {
      return (issueFields().issuelinks || []).map(function (il) {
        var issue = il.outwardIssue || il.inwardIssue;
        return { key: issue.key, status: issue.fields.status.name };
      });
    });
    //#region load issue
    function checkLoginRequired(e) {
      if (e.responseJSON) {
        var yes = e.responseJSON.errorMessages.some(function (e) { return e === "Login Required"; });
        loginRequired(yes);
        return yes;
      }
    }
    this.subscribe(this.issueKey, loadIssue);
    var procID = setInterval(function () { if (hasIssue()) loadIssue(issueKey()); }, issueRefreshInterval);
    loadIssue(issueKey());
    var keyCache;
    function loadIssue(key) {
      if (!key) return issue({});
      if (!checkIssueKey(key)) return;
      isLoading(keyCache !== key);
      keyCache = key;
      jiraSettings.restServer.getTicket(key)
        .done(function (data) {
          //loginRequired(false);
          issue(data.obj);
          lastError("");
        })
        .fail(function (e) {
          //if (!checkLoginRequired(e))
            lastError(e);
          //issue({});
        })
        .always(function () {
          isLoading(false);
        });
    }
    //#endregion

    //#region dispose
    var super_dispose = this.dispose.bind(this);
    this.dispose = function dispose() {
      super_dispose();
      clearInterval(procID);
    }
    //#endregion

    //#region helpers
    function checkIssueKey(key) {
      return /^\s*[a-z]{3,}-\d+\s*$/i.test(ko.unwrap(key));
    }
    //#endregion
  }


  return { viewModel: JiraIssueInfo, template: templateMarkup };

});
