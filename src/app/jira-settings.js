define(['ko', 'jquery', "objecter", 'promise-monad', "swagger", "js-cookie"], function (ko, $, O, PM, swagger, jsc) {
  var baseUrl = "http://usmrtpwjirq01.corp.itauinternational.com:81/";
  //var baseUrl = "http://jira.corp.itauinternational.com:81/secure/Dashboard.jspa";
  var sessionPath = "includes/js/GetSession1.jsp";//"session/GetSession.jsp";
  var api = "rest/api/2/";
  var browse = "browse/";
  var issue = "issue/";
  var transitionsApi = "transitions"
  var commentApi = "comment";
  var cookieName = "JSESSIONID";
  var jSessionID = ko.observable("").extend({ persist: 'JIRA_' + cookieName });
  var serverSessionID = ko.observableArray([]);
  var serverSessionIDExpired = [];
  var isRestLogin = ko.observable();

  function isSessionNotExpired(sid) { return serverSessionIDExpired.indexOf(sid) < 0;}
  serverSessionID.subscribe(function (sids) {
      sids.forEach(function (sid) {
        restServer.testSessionID(sid)
          .done(function () {
            isRestLogin(false);
            jSessionID(sid);
          })
          .fail(function () {
            serverSessionIDExpired.push(sid);
          });
      });
      if (serverSessionID().length) serverSessionID([]);
  });

  var sessionPullInterval = 5 * 1000;
  setInterval(function () {
    if (!jSessionID())
      getJiraSession().done(serverSessionID);
    else {
      var sid = jSessionID();
      restServer.testSessionID(sid)
        .fail(function () {
          serverSessionIDExpired.push(sid);
          jSessionID("");
        });
    }
  }, sessionPullInterval);

  function showError(e) {
    alert(JSON.stringify(e, null, 2));
  }
  //#region build path
  function n(path) {
    return path.replace(/\/$/, "");
  }
  function args(a) { return Array.prototype.slice.call(a); }
  function combinePath() {
    function sureArray(x) { return $.isArray(x) ? x : [x]; }
    var paths = [].slice.call(arguments, 0).reduce(function (a, b) { return sureArray(a).concat(sureArray(b)); });
    return paths.reduce(function (a, b) { return n(a) + "/" + n(b); });
  }
  function buildPath() {
    var args = [baseUrl, api].concat([].slice.call(arguments, 0));
    return combinePath(args);
  }
  function buildBrowseUrl(issueKey) {
    return issueKey ? combinePath(baseUrl, browse, issueKey) : baseUrl;
  }
  function buildIssueUrl(issueKey) {
    return combinePath(buildPath(issue, issueKey), args(arguments).slice(1));
  }
  //#endregion

  function getJiraSession() {
    var sessionUrl = combinePath(baseUrl, sessionPath);
    log("Pulling server sessionID from " + sessionUrl);
    var d = $.Deferred();
    $.ajax({
      url: sessionUrl,
      type: "GET",
      xhrFields: {
        withCredentials: true
      }
    })
      .done(function (sids) {
        d.resolve(sids.trim().split(/\s/)
          .filter(isSessionNotExpired));
      })
      .fail(function (e) {
        showError({ sessionUrl: sessionUrl, error: e });
      });
    return d;
  }
  //#region client-side JIRA REST
  function makeTransition(id, comment) {
    return {
      "update": { "comment": [{ "add": { "body": comment } }] },
      "fields": {},
      "transition": { "id": id }
    }
  }
  function makeComment(comment) {
    return { "body": comment };
  }
  function getIssue(key) {
    var url = buildPath("issue", key);
    return $.ajax({
      url: url,
      contentType: "application/json;charset=UTF-8",
      type: "GET",
      xhrFields: {
        withCredentials: true
      }
    });
  }
  function postIssueTransition(issueKey, transitionId, comment) {
    issueKey = ko.unwrap(issueKey);
    transitionId = ko.unwrap(transitionId);
    comment = ko.unwrap(comment);
    var url = buildIssueUrl(issueKey, transitionsApi);
    var data = makeTransition(transitionId, comment);
    var pm = new PM(function () { return postIssue(url, data); });
    if (comment)
      pm.push(function () { return postIssueComment(issueKey, comment) });
    return pm.pump(true);
  }
  function postIssueComment(issueKey, comment) {
    var url = buildIssueUrl(ko.unwrap(issueKey), commentApi);
    return postIssue(url, makeComment(ko.unwrap(comment)));
  }
  function postIssue(url, data) {
    return $.ajax({
      url: url,
      type: "POST",
      contentType: "application/json;charset=UTF-8",
      data: JSON.stringify(data),
      xhrFields: {
        withCredentials: true
      }
    });
  }
  //#endregion

  //#region log
  var debug = true;
  function log(a) {
    if (debug)
      console.log(typeof a === "string" ? a : JSON.stringify(a, null, 2));
  }
  //#endregion

  //#region RestServer
  var restServer = new (function RestServer(jSessionID) {
    //#region IE fixup
    if (!window.location.origin) {
      window.location.origin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port : '');
    }
    //#endregion

    //#region Error handling
    var showError = this.showError = function showError(options, e) {
      var d = $.D.makeErrorDialog;
      (d || alert)(swaggerErrorParser(e), typeof options === 'string' ? { title: options } : options);
    }
    function swaggerErrorParser(e) {
      return typeof e === 'string' ? e : e.obj.response.body.ExceptionMessage;
    }
    //#endregion

    var jiraUser = this.jiraUser = ko.observable();
    var jiraPassword = this.jiraPassword = ko.observable();
    this.isLoggedIn = ko.pureComputed(function () { return jSessionID(); });
    this.logOff = function () {
      jSessionID(null);
      jiraUser("");
      jiraPassword("");
    }
    var baseHost = location.origin;
    getHostUrl = function (paths) { return combinePath(baseHost, paths); }
    ko.computed(function () {
      var args = [jiraUser(), jiraPassword()];
      if (args.every(function (v) { return v; }))
        loginToJira.apply(null, args);
    });
    function loginToJira(user, password) {
      log({ func: "loginToJira", jiraUser: user, jiraPassword: password });
      if (user && password) {
        function s(sessionID) {
          isRestLogin(true);
          jSessionID(sessionID.obj);
        }
        var stdErr = showError.bind(null, "Jira GetSessionID");
        swSessionID(user, password).done(s).fail(stdErr);
      }
    }
    //#region REST API
    this.getTicket = function getTicket(key) {
      log({ func: "getTicket", key: key });
      return swGetTicket(key, jSessionID())
        .fail(function (e) {
          debugger;
          log(e);
        });
    }
    this.postIssueTransition = function postIssueTransition(ticket, transition, comment, doLock) {
      return swPostTrans(ko.unwrap(ticket), ko.unwrap(transition), ko.unwrap(comment), ko.unwrap(doLock) || false, ko.unwrap(jSessionID));
    };
    this.postIssueComment = function postIssueComment(ticket, comment, doLock) {
      return swPostComment(ko.unwrap(ticket), ko.unwrap(comment), ko.unwrap(doLock) || false, ko.unwrap(jSessionID));
    };
    this.testSessionID = function testSessionID(sessionID) {
      log("Testing sessionID: " + sessionID);
      return swTestSessionID(ko.unwrap(sessionID)).done(function (data) { jiraUser(data.obj); });
    }
    var swSessionID;
    var swGetTicket;
    var swPostTrans;
    var swPostComment;
    var swTestSessionID;
    // Init swagger client
    var swaggerLoaded = this.swaggerLoaded = $.Deferred();
    var exports = new swagger({
      url: getHostUrl("/swagger/docs/v1"),
      success: function () {
        // test REST connection is alive
        swSessionID = function (user, password) {
          var d = $.Deferred();
          exports.Jira[O.name(exports.Jira, "Jira_GetSessionID")]({ user: user, password: password }, d.resolve.bind(d), d.reject.bind(d));
          return d;
        };
        swGetTicket = function (key, sessionID) {
          var d = $.Deferred();
          exports.Jira[O.name(exports.Jira, "Jira_GetTicket")]({ ticket: key, sessionID: sessionID }, d.resolve.bind(d), d.reject.bind(d));
          return d;
        };
        swPostTrans = function (ticket, transition, comment, doLock, sessionID) {
          var d = $.Deferred();
          exports.Jira[O.name(exports.Jira, "Jira_TransitionTicket")]({ ticket: ticket, transition: transition, comment: comment, doLock: doLock, sessionID: sessionID }, d.resolve.bind(d), d.reject.bind(d));
          return d;
        };
        swPostComment = function (ticket, comment, doLock, sessionID) {
          var d = $.Deferred();
          exports.Jira[O.name(exports.Jira, "Jira_PostComment")]({ ticket: ticket, comment: comment, doLock: doLock, sessionID: sessionID }, d.resolve.bind(d), d.reject.bind(d));
          return d;
        };
        swTestSessionID = function (sessionID) {
          var d = $.Deferred();
          exports.Jira[O.name(exports.Jira, "Jira_Selfie")]({ sessionID: sessionID }, d.resolve.bind(d), d.reject.bind(d));
          return d;
        };
        exports.Jira.Jira_Selfie({ sessionID: jSessionID() },
          function (self) {
            jiraUser(self.obj);
          }, function (e) {
            if (e.status === 403) {
              e = e.statusText + " is no longer valid. Please re-login to JIRA.";
              jSessionID(null);
            }
            showError.bind(null, { title: "Jira Selfie" })(e);
          });
        console.log("restClient loaded");
        swaggerLoaded.resolve(exports);
      },
      failure: showError.bind(null, "restClient falied")
    });
    //#endregion
  })(jSessionID);

  restServer.swaggerLoaded.done(function () {
    getJiraSession().done(serverSessionID);
  });
  //#endregion

  //#region output
  //getIssue("bmw-60");
  return {
    baseUrl: baseUrl,
    api: api,
    buildPath: buildPath,
    buildBrowseUrl: buildBrowseUrl,
    buildIssueUrl: buildIssueUrl,
    getIssue: getIssue,
    postIssueTransition: postIssueTransition,
    postIssueComment: postIssueComment,
    serverSessionID: serverSessionID,
    jSessionID: jSessionID,
    isRestLogin: isRestLogin,
    restServer: restServer
  };
  //#endregion

});