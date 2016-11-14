Feature: Users see organization list and go comment
  As a user
  I should be able to see the organizations information list on the organization main page
  And I should be able to go to that organization's rating and commenting page to rate and leave comments on
  And I should not be able to add, edit, or delete any organization to or from the organization list
  So that I can see organizations and go comment on them

Scenario: See organization information listed
  Given I am on the organization list index page
  Then I am able to see 9 organization information

Scenario: Visit the organization rating page
  Given I am on the organization list index page
  When I try to click the Add Comment link
  Then I am able to visit the organization rating and commenting page

Scenario: Cannot modify organization information on index interface
  Given I am on the organization list index page
  Then I am not able to add, edit, or delete any listed organization
