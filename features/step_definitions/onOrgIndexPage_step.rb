Then(/^I am able to see 9 organization information$/) do
  page.has_css?("table#tbl-org tr", :count=>10)
end

When(/^I try to click the More link$/) do
  page.has_link?('More...')
end

Then(/^I am able to visit the individual organization page$/) do
  @organization = Organization.find(1703)
  visit(organization_path(@organization))
end

Then(/^I am not able to add, edit, or delete any listed organization$/) do
  page.has_no_text?('add') and page.has_no_text?('edit') and page.has_no_text?('delete')
end
