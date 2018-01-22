require "http/server"

server = HTTP::Server.new("0.0.0.0", 3000) do |context|
  context.response.content_type = "text/plain"
end

puts "Listening on http://127.0.0.1:3000"
server.listen
