define(['ko','jquery','promise-monad'], function (ko,$,PM) {
  var baseUrl = "http://usmrtpwjirq01.corp.itauinternational.com:81/";
  var api = "rest/api/2/";
  var browse = "browse/";
  var issue = "issue/";
  var transitionsApi = "transitions"
  var commentApi = "comment";
  function n(path) {
    return path.replace(/\/$/, "");
  }
  function args(a) { return Array.prototype.slice.call(a); }
  function combinePath() {
    function sureArray(x) { return $.isArray(x) ? x : [x];}
    var paths = [].slice.call(arguments, 0).reduce(function (a, b) { return sureArray(a).concat(sureArray(b)); });
    return paths.reduce(function (a, b) { return n(a) + "/" + n(b); });
  }
  function buildPath() {
    var args = [baseUrl, api].concat([].slice.call(arguments,0));
    return combinePath( args);
  }
  function buildBrowseUrl(issueKey) {
    return issueKey ? combinePath(baseUrl, browse, issueKey) : baseUrl;
  }
  function buildIssueUrl(issueKey) {
    return combinePath(buildPath(issue, issueKey), args(arguments).slice(1));
  }
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
  return {
    baseUrl: baseUrl,
    api: api,
    buildPath: buildPath,
    buildBrowseUrl: buildBrowseUrl,
    buildIssueUrl: buildIssueUrl,
    getIssue: getIssue,
    postIssueTransition: postIssueTransition,
    postIssueComment: postIssueComment
  };

});