# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rake db:seed (or created alongside the db with db:setup).
#
# Examples:
#
#   cities = City.create([{ name: 'Chicago' }, { name: 'Copenhagen' }])
#   Mayor.create(name: 'Emanuel', city: cities.first)
require 'csv'
# require 'pathname'
#
# The first seed of sample dataset
# csv_text = File.read(Rails.root.join("lib", "seeds", "la_sample.csv"))
# csv = CSV.parse(csv_text, :headers => true, :encoding => 'ISO-8859-1')
# csv.each do |row|
#   t = Organization.new
#   t.id = row['OrgID']
#   t.name = row['Name']
#   t.size = row['Size']
#   t.org_type = row['Type']
#   t.address = row['StAdd']
#   t.city = row['City']
#   t.zip = row['Zip']
#   t.county = row['County']
#   t.state = row['State']
#   t.latitude = row['Latitude']
#   t.longitude = row['Longitude']
#   t.save
#   puts "#{t.id}, #{t.name} saved"
# end
#
# puts "There are now #{Organization.count} rows in the organization table"

# Destroyed the sample dataset
# old_ids = [1646, 1655, 1703, 1711, 1841, 1853, 2023, 2727, 9241]
# old_ids.each do |old_id|
#   org = Organization.find_by(id: old_id)
#   org.destroy
# end
#
# # Destroy the empty organziations
# empty_org_ids = [9242, 9243]
# empty_org_ids.each do |empty_org_id|
#   org = Organization.find_by(id: empty_org_id)
#   org.destroy
# end

# Seed the actual db of all organizations in LA
csv_text = File.read(Rails.root.join("lib", "seeds", "LA-Data.csv"))
csv = CSV.parse(csv_text, :headers => true, :encoding => 'ISO-8859-1')
csv.each do |row|
  t = Organization.new
  t.id = row['OrgID']
  t.name = row['Name']
  t.size = row['Size']
  t.org_type = row['Type']
  t.address = row['StAdd']
  t.city = row['City']
  t.zip = row['Zip']
  t.county = row['County']
  t.state = row['State']
  t.latitude = row['Latitude']
  t.longitude = row['Longitude']
  t.save
  puts "#{t.id}, #{t.name} saved"
end

puts "There are now #{Organization.count} rows in the organization table"
