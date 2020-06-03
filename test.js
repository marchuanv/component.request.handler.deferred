const componentRequestHandlerDeferred = require("./component.request.handler.deferred.js");
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
                },5000);
            });
        });
    };
    requeue();
})().catch((err)=>{
    console.log(err);
});
