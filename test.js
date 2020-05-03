const componentRequestHandlerDeferred = require("./component.request.handler.deferred.js");
const logging = require("logging");
logging.config(["Request Handler Deferred", "Request Handler Route","Request Handler"]);
(async()=>{
    (await componentRequestHandlerDeferred.handle({ port: 3000, path: "/test" })).receive((request) => {
        return new Promise((resolve)=>{
            setTimeout(()=>{
                resolve({
                    statusCode: 200,
                    statusMessage:"Success",
                    data: "",
                    contentType: "text/plain"
                });
            },7000);
        });
    });
})().catch((err)=>{
    console.log(err);
});
