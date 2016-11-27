class RemoveRatingsReference < ActiveRecord::Migration
  def change
    remove_reference :ratings, :organizations, index: true, foreign_key: true
  end
end
