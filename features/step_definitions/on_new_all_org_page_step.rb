Then(/^I should be able to see a map of all organization$/) do
  page.has_css?("div#map-all-orgs")
end

Then(/^I should be able to see a new search box$/) do
  page.has_css?("input#btn-org-search")
end

Then(/^I should be able to see a new clear search button$/) do
  page.has_css?("input#btn-org-clear")
end
