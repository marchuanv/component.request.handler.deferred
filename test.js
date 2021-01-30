const requestHandlerDeferred = require("./component.request.handler.deferred.js");
const delegate = require("component.delegate");
(async()=>{ 
    delegate.register("component.request.handler.user", "3000/authenticate",() => {
        return { statusCode: 200, statusMessage: "Success", headers: {}, data: "test passed" };
    });
    delegate.register("component.request.handler.user", "4000/authenticate",() => {
        return new Promise((reject) => {
            setTimeout(() => {
                reject("Something went wrong");
            },4000);
        });
    });
    await requestHandlerDeferred.handle({ port: 3000, host: "localhost", path: "/test" });
    await requestHandlerDeferred.handle({ port: 4000, host: "localhost", path: "/test" });
    await requestHandlerDeferred.handle({ port: 3000, host: "localhost", path: "/authenticate" });
    await requestHandlerDeferred.handle({ port: 4000, host: "localhost", path: "/authenticate" });
})().catch((err)=>{
    console.error(err);
});