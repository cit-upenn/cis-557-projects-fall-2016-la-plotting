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
    # Three restaurants in 500 meters radius of this organization from yelp_token
    @restaurants = find_yelp_business(@organization[:latitude], @organization[:longitude])
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

    def find_yelp_business(lat, lng)
      yelp_token = 'Bd-zPkv8p5CQldgybJ9mtbEt-5ll_frcOgPCgKTY9j_81fG9-5mdq6C9QIXJQIRguCE8NOP17oWDCB021qrvos_jElK-ebJrP8YOcmCzpkxW4nViDZgCSoEzDhc7WHYx'
      header = "Bearer " + yelp_token
      url = 'https://api.yelp.com/v3/businesses/search?latitude=' + lat.to_s + '&longitude=' + lng.to_s + '&radius=500&limit=3&categories=restaurants'
      open(url, "Authorization" => header) do |f|
        query_result_string = f.read
        query_result_json = JSON.parse(query_result_string)
        return query_result_json
      end
    end# end of function

end
