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
    await requestHandlerDeferred.handle({ publicPort: 3000, publicHost: "localhost", privatePort: 3000, privateHost: "localhost", path: "/test" });
    await requestHandlerDeferred.handle({ publicPort: 4000, publicHost: "localhost", privatePort: 4000, privateHost: "localhost", path: "/test" });
    await requestHandlerDeferred.handle({ publicPort: 3000, publicHost: "localhost", privatePort: 3000, privateHost: "localhost", path: "/authenticate" });
    await requestHandlerDeferred.handle({ publicPort: 4000, publicHost: "localhost", privatePort: 4000, privateHost: "localhost", path: "/authenticate" });
})().catch((err)=>{
    console.error(err);
});