define(["knockout", "text!./home.html", "jira-settings"], function (ko, homeTemplate, jiraSettings) {

  function HomeViewModel(route) {
    this.message = ko.observable('Welcome to Jirable!');
  }

  HomeViewModel.prototype.doSomething = function () {
    this.message('You invoked doSomething() on the viewmodel.');
  };

  return { viewModel: HomeViewModel, template: homeTemplate };

});
