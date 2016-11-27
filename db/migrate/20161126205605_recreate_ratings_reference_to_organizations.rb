class RecreateRatingsReferenceToOrganizations < ActiveRecord::Migration
  def change
    add_reference :ratings, :organization, index: true
    add_foreign_key :ratings, :organizations
  end
end
