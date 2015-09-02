define(["jira-settings"], function (jiraSettings) {
  describe("A suite", function () {

    it("basePath expectation", function () {
      expect(jiraSettings.buildIssueUrl("ops-1")).toBe(jiraSettings.baseUrl + jiraSettings.api + "issue/ops-1");
    });
    it("buildBrowseUrl expectation", function () {
      expect(jiraSettings.buildBrowseUrl("ops-1")).toBe(jiraSettings.baseUrl + "browse/ops-1");
    });
  });
  describe("B suite", function () {
    var issue;
    return;
    beforeEach(function (done) {
      jiraSettings.getIssue("ops-1?expand=transitions")
      .done(function (issueP) {
        issue = issueP;
        done();
      })
      .fail(function (e) {
        issue = e;
        done();
      });
    });
    it("getIssue expectation", function (done) {
      expect(issue.key).toEqual("OPS-1");
      expect(issue.transitions[0].id).toBeGreaterThan(0);
      done();
    });
  });
});