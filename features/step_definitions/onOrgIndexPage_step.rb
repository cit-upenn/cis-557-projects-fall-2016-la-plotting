Then(/^I am able to see 9 organization information$/) do
  page.has_css?("table#tbl-org tr", :count=>10)
end

When(/^I try to click the Add Comment link$/) do
  page.has_link?('Add Comments', :href => new_rating_path.to_s)
end

Then(/^I am able to visit the organization rating and commenting page$/) do
  visit(new_rating_path)
end

Then(/^I am not able to add, edit, or delete any listed organization$/) do
  page.has_no_text?('add') and page.has_no_text?('edit') and page.has_no_text?('delete')
end
