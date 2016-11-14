Feature: Users comment and rate on organizations
  As a user
  I should be able to add my user name, rating, and comment to an organization
  So that I can express my opinions on these listed organizations

Scenario: Add name, rating, and comment correctly
  Given I am on the add new rating page
  When I try to add my user name
  And add my rating on this organization
  And add my comment on this organization
  And I click the 'Create Rating' button
  Then I am able to go the page that says "Rating was successfully created."

Scenario: Quit add name, rating, and comment correctly
  Given I am on the add new rating page
  When I try to add my user name
  And add my rating on this organization
  And add my comment on this organization
  And I click the 'Cancel' button to quit adding such information
  Then I am able to go to organization index page

Scenario: Name too long, rating out of range
  Given I am on the add new rating page
  When I added "qwertyuiopasdfgh" as user name
  And 19 as rating
  And comment with ''
  And I click the 'Create Rating' button
  Then I am able to see error messages "Your user name should be shorter than 12 letters" and "The rating should range 0 - 10"

Scenario: No name, no rating
  Given I am on the add new rating page
  When I added no user name
  And added no rating
  And leave with a very long comment
  And I click the 'Create Rating' button
  Then I will see three error messages
