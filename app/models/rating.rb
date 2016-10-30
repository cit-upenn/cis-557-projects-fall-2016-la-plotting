# == Schema Information
#
# Table name: ratings
#
#  id         :integer          not null, primary key
#  Name       :string
#  Rating     :float
#  Comment    :string
#  created_at :datetime         not null
#  updated_at :datetime         not null
#

class Rating < ActiveRecord::Base
end
