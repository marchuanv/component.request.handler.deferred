const componentRequestHandlerDeferred = require("./component.request.handler.deferred.js");
const logging = require("logging");
logging.config(["Request Handler Deferred", "Request Handler Route","Request Handler"]);
(async()=>{
    const requeue = async () => {
        (await componentRequestHandlerDeferred.handle({ port: 3000, path: "/test" })).receive((request) => {
            requeue();
            return new Promise((resolve)=>{
                setTimeout(()=>{
                    resolve({
                        statusCode: 200,
                        statusMessage:"Success",
                        data: "",
                        contentType: "text/plain"
                    });
                },1000);
            });
        });
    };
    requeue();
})().catch((err)=>{
    console.log(err);
});
