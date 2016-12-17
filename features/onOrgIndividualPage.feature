Feature: Users comment and rate on organizations

Scenario: See a map
  Given I am on the individual organization page
  Then I should be able to see a map

Scenario: See organization name
  Given I am on the individual organization page
  Then I am able to see organization's name

Scenario: See organization address
  Given I am on the individual organization page
  Then I am able to see organization's address

Scenario: See organization type
  Given I am on the individual organization page
  Then I am able to see organization's type

Scenario: See organization budget
  Given I am on the individual organization page
  Then I am able to see organization's size


Scenario: See organization's rating information
  Given I am on the individual organization page
  Then I am able to see organization's average rating score

Scenario: See organization's latest comment
  Given I am on the individual organization page
  Then I am able to see organization's latest comments

Scenario: Check organization's surrounding restaurants
  Given I am on the individual organization page
  Then I am able to see a checkbox of nearby restaurants

Scenario: See organization's surrounding restaurants
  Given I am on the individual organization page
  Then I am able to see a table including nearby restaurants

Scenario: Go to all organization page
  Given I am on the individual organization page
  When I click the back button
  Then I am able to go to all organization page

Scenario: Go to comment on this organization
  Given I am on the individual organization page
  When I click the comment button
  Then I am able to go to the organization comment page

Scenario: Click to see nearby restaurants' information
  Given I am on the individual organization page
  When I check the nearby restaurants check box
  Then I am able to see three restaurant information
