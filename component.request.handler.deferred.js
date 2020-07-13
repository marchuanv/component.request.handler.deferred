const requestHandler = require("component.request.handler.route");
const delegate = require("component.delegate");
const utils = require("utils");
const logging = require("logging");
logging.config.add("Request Handler Deferred");
module.exports = {
    deferredRequests: [],
    handle: (callingModule, { port, path }) => {
        const defer = (request) => {
            return new Promise(async(resolve) => {
                let { deferredrequestid } = request.headers;
                let deferredReq = module.exports.deferredRequests.find(req => req.id === deferredrequestid);
                if (deferredReq){
                    if (deferredReq.completed === true){
                        module.exports.deferredRequests = module.exports.deferredRequests.filter(req => req.id !== deferredReq.id)
                    }
                    if (deferredReq.results.error){
                        const statusMessage = "Internal Server Error";
                        deferredReq.results.statusCode = 500;
                        deferredReq.results.statusMessage = statusMessage;
                        deferredReq.results.data = statusMessage;
                        deferredReq.results.headers = { 
                            "Content-Type":"text/plain", 
                            "Content-Length": Buffer.byteLength(statusMessage)
                        };
                    }
                    resolve(deferredReq.results);
                } else {
                    const statusMessage = "Request Deffered";
                    const deferredrequestid = utils.generateGUID();
                    deferredReq = {
                        id: deferredrequestid,
                        results: { 
                            headers: { 
                                "Content-Type":"text/plain", 
                                "Content-Length": Buffer.byteLength(statusMessage),
                                deferredrequestid
                            }, 
                            statusCode: 202, 
                            statusMessage,
                            data: statusMessage
                        },
                        completed: false
                    };
                    request.headers.deferredrequestid = deferredrequestid;
                    module.exports.deferredRequests.push(deferredReq);
                    setTimeout(async () => {
                        resolve(await defer(request));
                    },1000);
                    deferredReq.results = await delegate.call(callingModule, request);
                    deferredReq.completed = true;
                }
            });
        };
        const currentModule = `component.request.handler.deferred.${path.replace("/","")}`;
        delegate.register(currentModule, defer);
        requestHandler.handle(currentModule, { port, path });
    }
};