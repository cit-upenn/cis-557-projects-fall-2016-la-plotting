# TL;DR: YOU SHOULD DELETE THIS FILE
#
# This file is used by web_steps.rb, which you should also delete
#
# You have been warned
module NavigationHelpers
  # Maps a name to a path. Used by the
  #
  #   When /^I go to (.+)$/ do |page_name|
  #
  # step definition in web_steps.rb
  #
  def path_to(page_name)
    case page_name

    when /^the home\s?page$/
      '/'
    when /^the organization list index page/
      '/'
    when /^the add new rating page/
      @organization = Organization.create(name:'Test Organization', latitude: 34.0505261069255, longitude: -118.240632675751, size: 'Medium', org_type:'Community', address:'120 N. Judge John Aiso Street', city:'Los Angeles', zip: 90012, county: 'Los Angeles', state: 'CA')
      new_organization_rating_path(@organization)

    when /^the individual organization page/
      @organization = Organization.create(name:'Test Organization', latitude: 34.0505261069255, longitude: -118.240632675751, size: 'Medium', org_type:'Community', address:'120 N. Judge John Aiso Street', city:'Los Angeles', zip: 90012, county: 'Los Angeles', state: 'CA')
      @rating = @organization.ratings.create(user_name: 'Blake', score: 8.9, comment: "love it!")
      organization_path(@organization)

    when /^the all organization landing pag/
      '/'

    when /^the edit organization rating page/
      @organization = Organization.create(name:'Test Organization', latitude: 34.0505261069255, longitude: -118.240632675751, size: 'Medium', org_type:'Community', address:'120 N. Judge John Aiso Street', city:'Los Angeles', zip: 90012, county: 'Los Angeles', state: 'CA')
      @rating = @organization.ratings.create(user_name: 'Blake', score: 8.9, comment: "love it!")
      edit_rating_path(@rating)


    # Add more mappings here.
    # Here is an example that pulls values out of the Regexp:
    #
    #   when /^(.*)'s profile page$/i
    #     user_profile_path(User.find_by_login($1))

    else
      begin
        page_name =~ /^the (.*) page$/
        path_components = $1.split(/\s+/)
        self.send(path_components.push('path').join('_').to_sym)
      rescue NoMethodError, ArgumentError
        raise "Can't find mapping from \"#{page_name}\" to a path.\n" +
          "Now, go and add a mapping in #{__FILE__}"
      end
    end
  end
end

World(NavigationHelpers)
