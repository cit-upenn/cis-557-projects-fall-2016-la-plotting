class OrganizationsController < ApplicationController

  def index
    @organizations = Organization.all
    js :organizations => @organizations
  end# end of a method

  def show
    @organization = Organization.find(params[:id])
    @ratings = @organization.ratings
    # The average rating of this organization, rounded to the nearest 10th
    @average = avg_ratings_cal(@ratings)
    # The most recent non-empty comment on this organization
    @comment = recent_comment(@ratings)
    # Three restaurants in 1500 meters radius of this organization from yelp_token
    @restaurants = find_yelp_business(@organization[:latitude], @organization[:longitude], 'restaurants')
    @bars = find_yelp_business(@organization[:latitude], @organization[:longitude], 'bars')
    #the paloma gem uses this to pass variables from contoller to javascript
    js :organization => @organization, :restaurants => @restaurants, :bars => @bars
  end# end of a method



  private
    def avg_ratings_cal(ratings)
      ratings.pluck(:score).empty? ? 'No ratings yet. Be the first to rate it!' : ratings.average(:score).round(1)
    end# end of method

    def recent_comment(ratings)
      if ratings.pluck(:comment).empty?
        'No comments yet. Be the first to leave a comment!'
      else
        comments = ratings.pluck(:comment).reverse
        comments.select! do |element|
          element != ''
        end
        comments.first
      end
    end# end of method

    def find_yelp_business(lat, lng, type)
      # the yelp token is set to an environment variable
      header = "Bearer " + ENV['YELP_TOKEN']
      url = 'https://api.yelp.com/v3/businesses/search?latitude=' + lat.to_s + '&longitude=' + lng.to_s + "&radius=1500&limit=10&categories=#{type}"
      open(url, "Authorization" => header) do |f|
        query_result_string = f.read
        query_result_json = JSON.parse(query_result_string)
        return query_result_json
      end
    end# end of method

end
