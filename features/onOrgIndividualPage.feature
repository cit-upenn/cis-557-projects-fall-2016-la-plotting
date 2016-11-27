Feature: Users comment and rate on organizations
  As a user
  I should be able to add my user name, rating, and comment to an organization
  So that I can express my opinions on these listed organizations

Scenario: See organization basic information
  Given I am on the individual organization page
  Then I am able to see organization's address
  Then I am able to see organization's type
  Then I am able to see organization's size

Scenario: See organization's rating information
  Given I am on the individual organization page
  Then I am able to see organization's average rating score
  Then I am able to see organization's latest comments

Scenario: See organization's surrounding restaurants
  Given I am on the individual organization page
  Then I am able to see organization's restaurants
