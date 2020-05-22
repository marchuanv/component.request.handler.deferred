const componentRequestHandlerRoute = require("component.request.handler.route");
const logging = require("logging");
logging.config.add("Request Handler Deferred");
module.exports = { 
    sessions: [],
    handle: (options) => {
        return new Promise(async (resovle) => {
            const requeue = async () => {
                (await componentRequestHandlerRoute.handle(options)).receive(async(request) => {
                    requeue();
                    let results = { headers: {}, statusCode: -1, statusMessage: "" };
                    const resultsPromise = new Promise((resultsResolve, resultsReject) => {
                        resovle({ receive: async (callback) => {
                            let tryCount = 0;
                            const intervalId = setInterval(() => {
                                tryCount = tryCount + 1;
                                if (results && results.statusCode === 200){
                                    clearInterval(intervalId);
                                } else if (tryCount === 4) {
                                    clearInterval(intervalId);
                                    resultsResolve({
                                        statusCode: 202,
                                        statusMessage: "Request Deffered",
                                        data: "",
                                        contentType: "text/plain"
                                    });
                                }
                            },1000);
                            results = callback(request);
                            if (results && results.then){
                                results = await results.catch((error)=>{
                                    logging.write("Request Handler Deferred"," ", error.toString());
                                    resultsReject(error);
                                });
                            }
                            if (results){
                                resultsResolve(results)
                            } else {
                                logging.write("Request Handler Deferred",`callback did not return any data`);
                                return resultsReject("callback did not return any data.");
                            }
                        }});
                    });
                    results = await resultsPromise;
                    return results;
                });
            };
            requeue();
        });
    }
};