class ChangeRatingsAttributes < ActiveRecord::Migration
  def change
    rename_column :ratings, :Name, :user_name
    rename_column :ratings, :Rating, :rating
    rename_column :ratings, :Comment, :comment
    change_column :ratings, :comment, :text
    add_reference :ratings, :organizations, index: true, foreign_key: true    
  end
end
