class AddRatingCountToOrganization < ActiveRecord::Migration
  def change
    add_column :organizations, :ratings_count, :integer
  end
end
