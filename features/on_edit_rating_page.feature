Feature: Users comment and rate on organizations

Scenario: Update the rating on an organization
  Given I am on the edit organization rating page
  When I updated the score to 10
  And When I click the update rating button
  Then It should go to the page of organization I just rated
