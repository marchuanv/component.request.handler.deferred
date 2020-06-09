const requestHandler = require("component.request.handler.route");
const delegate = require("component.delegate");
const logging = require("logging");
logging.config.add("Request Handler Deferred");
module.exports = { 
    handle: ({ callingModule, port, path }) => {
        delegate.register("component.request.handler.deferred", (request) => {
            return new Promise(async(resolve) => {
                let results = { headers: {}, statusCode: -1, statusMessage: "" };
                let tryCount = 0;
                const intervalId = setInterval(() => {
                    tryCount = tryCount + 1;
                    if (results && results.statusCode > 0){
                        clearInterval(intervalId);
                        resolve(results);
                    } else if (tryCount === 30) {
                        clearInterval(intervalId);
                        const message = "Request Deffered";
                        results.statusCode = 202;
                        results.statusMessage = message;
                        results.headers = { "Content-Type":"text/plain", "Content-Length": Buffer.byteLength(message) };
                        results.data = message;
                        resolve(results);
                    }
                },100);
                results = await delegate.call(callingModule, request);
            });
        });
        requestHandler.handle({ callingModule: "component.request.handler.deferred", port, path });
    }
};