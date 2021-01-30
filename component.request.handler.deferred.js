const requestHandlerRoute = require("component.request.handler.route");
const delegate = require("component.delegate");
const utils = require("utils");
const logging = require("logging");
logging.config.add("Request Handler Deferred");
const defer = (callingModule, name, request) => {
    return new Promise(async(resolve) => {
        let { deferredrequestid } = request.headers;
        let deferredReq = module.exports.deferredRequests.find(req => req.id === deferredrequestid);
        if (deferredReq){
            if (deferredReq.completed === true){
                module.exports.deferredRequests = module.exports.deferredRequests.filter(req => req.id !== deferredReq.id)
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
                resolve(await defer(callingModule, name, request));
            },1000);
            deferredReq.results = await delegate.call( {context: callingModule, name}, request);
            deferredReq.completed = true;
        }
    });
}; 
module.exports = {
    deferredRequests: [],
    handle: (options) => {
        requestHandlerRoute.handle(options);
        const name = `${options.port}${options.path}`;
        delegate.register(`component.request.handler.deferred`, name, async (request) => {
            return await defer(`component.request.handler.user`, name, request);
        });
    }
};