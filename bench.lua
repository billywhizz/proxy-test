init = function(args)
	depth = 20
	local r = {}
	for i=1,depth do
		 r[i] = wrk.format(nil, "/")
	end
	req = table.concat(r)
end

request = function()
	return req
end
