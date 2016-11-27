class ReOrderRatingsColumns < ActiveRecord::Migration
  def change
    change_column :ratings, :organization_id, :integer, after: :comment
  end
end
