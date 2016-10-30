When (/^I try to add a new rating$/) do
  page.click_link('New', :href => '/ratings/new')
end

Then (/^I should be able to see the new rating's page$/) do
	# assert page.has_content?("Welcome! You have signed up successfully.")
  visit(new_rating_path)
end

When (/^I try to add a new organization name$/) do
  fill_in 'Name', :with => "Theatre Organization A"
end

When (/^I try to add a numerical rating$/) do
  fill_in 'Rating', :with => 9.6
end

When (/^I try to add some comments$/) do
  fill_in 'Comment', :with => "I have been there for a couple of times. THEY ARE AWESOME!"
end

Then (/^I should be able to save the rating and go to the confirmation page$/) do
  click_button 'Create Rating'
  assert page.has_content?("Rating was successfully created.")
end

When (/^I try to cancel adding a new rating$/) do
  page.click_link('Cancel', :href => '/ratings')
end


Then (/^I should be able to go back to the main rating list page$/) do
  assert page.has_content?("Ratings")
end
