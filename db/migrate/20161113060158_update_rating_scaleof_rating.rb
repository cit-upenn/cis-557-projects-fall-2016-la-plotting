class UpdateRatingScaleofRating < ActiveRecord::Migration
  def change
    change_column :ratings, :rating, :decimal, precision: 3, scale: 1
  end
end
