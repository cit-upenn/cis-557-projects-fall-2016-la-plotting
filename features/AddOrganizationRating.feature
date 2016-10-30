Feature: User in the rating page
  As a user
  I want to add a new rating and comment to the list
  So that I can track the ratings

Scenario: Go to add new rating page
  Given I am on the rating creation page
  When I try to add a new rating
  Then I should be able to see the new rating's page

Scenario: Add a new rating of an organization
  Given I am on the add new rating page
  When I try to add a new organization name
  And I try to add a numerical rating
  And I try to add some comments
  Then I should be able to save the rating and go to the confirmation page

Scenario: Cancel adding a new rating of an organization
  Given I am on the add new rating page
  When I try to cancel adding a new rating
  Then I should be able to go back to the main rating list page
