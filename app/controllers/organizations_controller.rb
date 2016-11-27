class OrganizationsController < ApplicationController
  def index
    @organizations = Organization.all
  end

  def show
    @organization = Organization.find(params[:id])
    @ratings = @organization.ratings

    # The average rating of this organization, rounded to the nearest 10th
    @average = @ratings.pluck(:score).empty? ? 'No ratings yet. Be the first to rate it!' : @ratings.average(:score).round(1)

    # The most recent non-empty comment on this organization
    if @ratings.pluck(:comment).empty?
      @comment = 'No comments yet. Be the first to leave a comment!'
    else
      @comments = @ratings.pluck(:comment).reverse
      @comments.select! do |element|
        element != ''
      end
      @comment = @comments.first
    end
    
  end
end
