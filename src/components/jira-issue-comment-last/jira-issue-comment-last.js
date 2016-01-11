define(['knockout', 'text!./jira-issue-comment-last.html', "objecter"], function (ko, templateMarkup, O) {

  function JiraIssueCommentLast(params) {
    var jiraIssue = O.sure(O.sure(params, "jiraissue"));
    var issueFields = jiraIssue("issuefields");
    this.commentLast = ko.pureComputed(function () {
      return ((issueFields().comment || {}).comments || [])
        .slice(-1)
        .map(function (c) {
          var d = parseJiraDate(c.created);
          return "["+c.author.displayName +"] on "+d.toDateString() + " " + d.toLocaleTimeString() + ":\n" + c.body;
        })[0];
    });
  }
  
  function parseJiraDate(jiraDate) {
    function isNotEmpty(s) { return s; }
    var dateAndZone = jiraDate.split(/^(.+)([-+]\d+)$/).filter(isNotEmpty);
    var date = Date.parse(dateAndZone[0]);
    var zoneHourMinute = dateAndZone[1].split(/([-+]?\d\d)/).filter(isNotEmpty);
    var zoneHours = parseInt(zoneHourMinute[0]);
    var zoneMinutes =  zoneHours * 60 + parseInt(zoneHourMinute[1]);
    var resDate = new Date(date - zoneMinutes * 60000);
    return createDateAsUTC(resDate);
  }

  function createDateAsUTC(date) {
    return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()));
  }

  function convertDateToUTC(date) {
    return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
  }
  return { viewModel: JiraIssueCommentLast, template: templateMarkup };

});
