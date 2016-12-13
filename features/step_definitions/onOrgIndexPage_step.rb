Then(/^I am able to see 9 organization information$/) do
  page.has_css?("table#tbl-org tr", :count=>10)
end

When(/^I try to click the More link$/) do
  page.has_link?('More...')
end

Then(/^I am able to visit the individual organization page$/) do
  @organization = Organization.create(name:'Test Organization', latitude: 34.0505261069255, longitude: -118.240632675751, size: 'Medium', org_type:'Community', address:'120 N. Judge John Aiso Street', city:'Los Angeles', zip: 90012, county: 'Loas Angeles', state: 'CA')
  visit(organization_path(@organization))
end

Then(/^I am not able to add, edit, or delete any listed organization$/) do
  page.has_no_text?('add') and page.has_no_text?('edit') and page.has_no_text?('delete')
end
