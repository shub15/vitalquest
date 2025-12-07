# Test the daily post endpoint
$uri = "http://127.0.0.1:8000/api/feed/generate-daily-post?user_id=user_a&username=alice&date=2025-12-06&total_steps=12000&total_calories_active=700"
$response = Invoke-RestMethod -Method Post -Uri $uri
$response | ConvertTo-Json -Depth 10
Write-Host "`nFeed after post creation:"
$feed_uri = "http://127.0.0.1:8000/api/feed/user/user_a"
$feed = Invoke-RestMethod -Uri $feed_uri
$feed | ConvertTo-Json -Depth 10
