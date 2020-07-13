const requestHandler = require("component.request.handler.route");
const delegate = require("component.delegate");
const utils = require("utils");
const logging = require("logging");
logging.config.add("Request Handler Deferred");
module.exports = {
    sessions: [],
    handle: ({ callingModule, port, path }) => {
        const defer = (request) => {
            return new Promise(async(resolve) => {
                let { deferredsessionid } = request.headers;
                let deferredSession = module.exports.sessions.find(session => session.id === deferredsessionid);
                if (deferredSession){
                    if (deferredSession.completed === true){
                        module.exports.sessions = module.exports.sessions.filter(session => session.id !== deferredSession.id)
                    }
                    if (deferredSession.results.error){
                        const statusMessage = "500 Internal Server Error";
                        deferredSession.results.statusCode = 500;
                        deferredSession.results.statusMessage = statusMessage;
                        deferredSession.results.data = statusMessage;
                        deferredSession.results.headers = { 
                            "Content-Type":"text/plain", 
                            "Content-Length": Buffer.byteLength(statusMessage)
                        };
                    }
                    resolve(deferredSession.results);
                } else {
                    const statusMessage = "Request Deffered";
                    const deferredsessionid = utils.generateGUID();
                    deferredSession = {
                        id: deferredsessionid,
                        results: { 
                            headers: { 
                                "Content-Type":"text/plain", 
                                "Content-Length": Buffer.byteLength(statusMessage),
                                deferredsessionid
                            }, 
                            statusCode: 202, 
                            statusMessage,
                            data: statusMessage
                        },
                        completed: false
                    };
                    request.headers.deferredsessionid = deferredsessionid;
                    module.exports.sessions.push(deferredSession);
                    setTimeout(async () => {
                        resolve(await defer(request));
                    },1000);
                    deferredSession.results = await delegate.call(callingModule, request);
                    deferredSession.completed = true;
                }
            });
        };
        delegate.register("component.request.handler.deferred", defer);
        requestHandler.handle({ callingModule: "component.request.handler.deferred", port, path });
    }
};