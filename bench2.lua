wrk.method = "POST"
wrk.path = "/api/order/"
wrk.body = '{"sourceOrderId":"UPSBILLINGTHIRDPARTYSHIPPING3","currency":"GBP","customerName":"OneFlow Systems Ltd","items":[{"sku":"WALL_CANVAS","sourceItemId":"20160621063753-1","components":[{"path":"https://s3-eu-west-1.amazonaws.com/oneflow-public/CardSample.pdf","code":"Canvas","barcode":"AJBARCODES00301","fetch":true}],"shipmentIndex":0,"quantity":1,"barcode":"AJBARCODES003"}],"shipments":[{"shipByDate":"2016-11-30T00:00:00.000Z","shipTo":{"name":"Billy Whizz","address1":"11 Hampson Way","town":"London","postcode":"SW8 1HY","phone":"2142222222","isoCountry":"GB"},"shipmentIndex":0,"carrier":{"alias":"shipping"},"canShipEarly":false}]}'
wrk.headers["Content-Type"] = "application/json"
wrk.headers["Accept"] = "application/json"

local counter = 1
local threads = {}

function setup(thread)
	thread:set("id", counter)
	table.insert(threads, thread)
	counter = counter + 1
end

function init(args)
	statuses = {}
end

response = function(status, headers, body) 
	if statuses[status] == nil then
		statuses[status] = 1
	else
		statuses[status] = statuses[status] + 1
	end
end

done = function(summary, latency, requests)
	io.write("STATUSES:\n")
	for index, thread in ipairs(threads) do
		local statuses = thread:get("statuses")
		local id = thread:get("id")
		-- io.write(string.format("Thread: %d\n", id))
		for key, value in pairs(statuses) do 
			io.write(string.format("Thread: %d, %s: %d\n", id, key, value))
		end
	end
end
