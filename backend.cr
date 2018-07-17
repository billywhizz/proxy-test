require "http/server"

server = HTTP::Server.new do |context|
  context.response.content_type = "text/plain"
  context.response.print "Hello world!"
end

server.bind_tcp "0.0.0.0", 3000
puts "Listening on http://127.0.0.1:3000"
server.listen
