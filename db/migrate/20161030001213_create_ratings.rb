class CreateRatings < ActiveRecord::Migration
  def change
    create_table :ratings do |t|
      t.string :Name
      t.float :Rating
      t.string :Comment

      t.timestamps null: false
    end
  end
end
