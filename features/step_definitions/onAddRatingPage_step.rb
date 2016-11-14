# When (/^I try to add a new rating$/) do
#   page.click_link('New', :href => '/ratings/new')
# end
#
# Then (/^I should be able to see the new rating's page$/) do
# 	# assert page.has_content?("Welcome! You have signed up successfully.")
#   visit(new_rating_path)
# end
#
# When (/^I try to add a new organization name$/) do
#   fill_in 'Name', :with => "Theatre Organization A"
# end
#
# When (/^I try to add a numerical rating$/) do
#   fill_in 'Rating', :with => 9.6
# end
#
# When (/^I try to add some comments$/) do
#   fill_in 'Comment', :with => "I have been there for a couple of times. THEY ARE AWESOME!"
# end
#
# Then (/^I should be able to save the rating and go to the confirmation page$/) do
#   click_button 'Create Rating'
#   assert page.has_content?("Rating was successfully created.")
# end
#
# When (/^I try to cancel adding a new rating$/) do
#   page.click_link('Cancel', :href => '/ratings')
# end
#
#
# Then (/^I should be able to go back to the main rating list page$/) do
#   assert page.has_content?("Ratings")
# end

When(/^I try to add my user name$/) do
  fill_in 'User name', :with => "Aaron Su"
end

When(/^add my rating on this organization$/) do
  fill_in 'Rating', :with => 8
end

When(/^add my comment on this organization$/) do
  fill_in 'Comment', :with => "This organization is awesome!"
end

When(/^I click the 'Create Rating' button$/) do
  click_button 'Create Rating'
end

Then(/^I am able to go the page that says "([^"]*)"$/) do |arg1|
  page.has_content?(arg1)
end

When(/^I click the 'Cancel' button to quit adding such information$/) do
  click_link 'Cancel', :href => "/organizations"
end

When(/^I click the 'Cancel' button to quit updating such information$/) do
  click_link 'Cancel', :href => "/organizations"
end

Then(/^I am able to go to organization index page$/) do
  page.has_css?('h3', :text => 'Listing organizations', :visible => true)
end

When(/^I added "([^"]*)" as user name$/) do |arg1|
  fill_in 'User name', :with => arg1
end

When(/^(\d+) as rating$/) do |arg1|
    fill_in 'Rating', :with => arg1
end
When(/^comment with ''$/) do
  fill_in 'Comment', :with => ""
end

Then(/^I am able to see error messages "([^"]*)" and "([^"]*)"$/) do |arg1, arg2|
  page.has_content?(arg1) and page.has_content?(arg2)
end

When(/^I added no user name$/) do
  fill_in 'User name', :with => ''
end

When(/^added no rating$/) do
  fill_in 'Rating', :with => nil
end

When(/^leave with a very long comment$/) do
  range = [*'0'..'9',*'A'..'Z',*'a'..'z']
  comment = Array.new(300){ range.sample }.join
  fill_in 'Comment', :with => comment
end

Then(/^I will see three error messages$/) do
  page.has_content?('Please comment within 300 words') and page.has_content?('Your preferred name to display must be given') and page.has_content?('You must specify a rating on this organization')
end
