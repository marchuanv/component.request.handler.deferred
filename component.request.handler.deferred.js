const requestHandler = require("component.request.handler.route");
const delegate = require("component.delegate");
const utils = require("utils");
const logging = require("logging");
logging.config.add("Request Handler Deferred");
module.exports = {
    sessions: [],
    handle: ({ callingModule, port, path }) => {
        delegate.register("component.request.handler.deferred", (request) => {
            return new Promise(async(resolve) => {
                const deferredMessage = "Request Deffered";
                let { deferredsessionid } = request.headers;
                deferredsessionid = deferredsessionid || utils.generateGUID();
                let deferredSession = module.exports.sessions.find(session => session.id === deferredsessionid);
                if (deferredSession && deferredSession.completed === true){
                    module.exports.sessions = module.exports.sessions.filter(session => session.id !== deferredSession.id)
                    return resolve(deferredSession.results);
                } else {
                    deferredSession = {
                        id: deferredsessionid,
                        results: { headers: {}, statusCode: -1, statusMessage: "" },
                        completed: false
                    };
                    module.exports.sessions.push(deferredSession);
                }
                let tryCount = 0;
                const intervalId = setInterval(() => {
                    tryCount = tryCount + 1;
                    if (deferredSession.results.statusCode === 200){
                        deferredSession.completed = true;
                        clearInterval(intervalId);
                        resolve(deferredSession.results);
                    } else if (tryCount === 30 && deferredSession.results.statusCode === -1) { //Timeout defer
                        deferredSession.completed = false;
                        deferredSession.results.statusCode = 202;
                        deferredSession.results.statusMessage = deferredMessage;
                        deferredSession.results.headers = { 
                            "Content-Type":"text/plain", 
                            "Content-Length": Buffer.byteLength(deferredMessage),
                            deferredsessionid
                        };
                        deferredSession.results.data = deferredMessage;
                        deferredSession.completed = false;
                        resolve(deferredSession.results);
                    }  else if (tryCount === 200 && deferredSession.results.statusCode === -1) { //taking too long fail deferred request
                        clearInterval(intervalId);
                        deferredSession.completed = true;
                        deferredSession.results.statusCode = 500;
                        deferredSession.results.statusMessage = "deferred request failed";
                        deferredSession.results.headers = { 
                            "Content-Type":"text/plain", 
                            "Content-Length": Buffer.byteLength(deferredSession.results.statusMessage),
                            deferredsessionid: deferredSession.id
                        };
                        deferredSession.results.data = deferredSession.results.statusMessage;
                    }
                },100);
                deferredSession.results = await delegate.call(callingModule, request);
            });
        });
        requestHandler.handle({ callingModule: "component.request.handler.deferred", port, path });
    }
};