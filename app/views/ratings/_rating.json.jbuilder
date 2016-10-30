json.extract! rating, :id, :Name, :Rating, :Comment, :created_at, :updated_at
json.url rating_url(rating, format: :json)