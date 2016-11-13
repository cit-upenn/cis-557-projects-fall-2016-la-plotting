# == Schema Information
#
# Table name: ratings
#
#  id               :integer          not null, primary key
#  user_name        :string
#  rating           :float
#  comment          :text
#  created_at       :datetime         not null
#  updated_at       :datetime         not null
#  organizations_id :integer
#

class Rating < ActiveRecord::Base
  belongs_to :organization, inverse_of: :ratings,
                            counter_cache: true,
                            foreign_key: 'organizations_id',
                            -> { readonly }
end
