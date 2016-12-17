When(/^I updated the score to (\d+)$/) do |arg1|
  fill_in 'Score', :with => arg1
end

When(/^When I click the update rating button$/) do
  find(:css, "input.btn-submit").click
end

Then(/^It should go to the page of organization I just rated$/) do
  visit(rating_path(@rating))
end
