# == Schema Information
#
# Table name: organizations
#
#  id            :integer          not null, primary key
#  name          :string
#  size          :string
#  org_type      :string
#  address       :string
#  city          :string
#  zip           :integer
#  county        :string
#  state         :string
#  latitude      :float
#  longitude     :float
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#  ratings_count :integer
#

require 'test_helper'

class OrganizationTest < ActiveSupport::TestCase
  # test "the truth" do
  #   assert true
  # end
end
