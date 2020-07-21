const requestHandlerDeferred = require("./component.request.handler.deferred.js");
const delegate = require("component.delegate");
(async()=>{ 
    const callingModule = "component.request.handler.user";
    delegate.register(callingModule, "user",() => {
        return new Promise((reject) => {
            setTimeout(() => {
                reject("Something went wrong");
            },4000);
        });
    });
    await requestHandlerDeferred.handle({ privatePort: 3000, path: "/test" });
    await requestHandlerDeferred.handle({ privatePort: 4000, path: "/test" });
})().catch((err)=>{
    console.error(err);
});