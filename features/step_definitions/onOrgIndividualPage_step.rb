Then(/^I am able to see organization's address$/) do
  page.has_css?('#org-address')
end

Then(/^I am able to see organization's type$/) do
  page.has_css?('#org-type')
end

Then(/^I am able to see organization's size$/) do
  page.has_css?('#org-size')
end

Then(/^I am able to see organization's average rating score$/) do
  page.has_css?('#org-rating')
end

Then(/^I am able to see organization's latest comments$/) do
  page.has_css?('#org-comment')
end

Then(/^I am able to see organization's restaurants$/) do
  page.has_css?('#yelp-restaurants')
end
