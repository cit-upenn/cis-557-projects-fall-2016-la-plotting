Then(/^I am able to see organization's address$/) do
  page.has_css?('#org-address') && page.assert_text('120 N. Judge John Aiso Street')
end

Then(/^I am able to see organization's type$/) do
  page.has_css?('#org-type', text: 'Community')
end

Then(/^I am able to see organization's size$/) do
  page.has_css?('#org-size', text: 'Medium')
end

Then(/^I am able to see organization's average rating score$/) do
  page.has_css?('#org-rating', :text => 8.9)
end

Then(/^I am able to see organization's latest comments$/) do
  page.has_css?('#org-comment', text: "love it!")
end

Then(/^I should be able to see a map$/) do
  page.has_css?("div#map-one-org")
end

Then(/^I am able to see organization's name$/) do
  page.has_css?('.sidebar-one-org div h3') && page.assert_text('Test Organization')
end

Then(/^I am able to see a checkbox of nearby restaurants$/) do
  page.has_css?('input#ck-nearby-restaurants')
end

Then(/^I am able to see a table including nearby restaurants$/) do
  page.has_css?('div#yelp-restaurants')
end

When(/^I click the back button$/) do
  click_link 'Back', {:class => 'btn-back', :href => '/organizations'}
end
When(/^I click the comment button$/) do
  click_link 'Comment', {:class => 'btn-comment', :href => "/organizations/" + @organization.id.to_s + "/ratings/new"}
end

Then(/^I am able to go to all organization page$/) do
  @organizations = Organization.all
  visit(organizations_path(@organizations))
end

Then(/^I am able to go to the organization comment page$/) do
  visit(new_organization_rating_path(@organization))
end

When(/^I check the nearby restaurants check box$/) do
  find(:css, "#ck-nearby-restaurants").set(true)
end

Then(/^I am able to see three restaurant information$/) do
  page.has_css?("table.tbl-yelp-restaurant", :count=>3)
end
