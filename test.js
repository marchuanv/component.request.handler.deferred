const requestHandlerDeferred = require("./component.request.handler.deferred.js");
const delegate = require("component.delegate");
(async()=>{ 
    const callingModule = "component.request.handler.secure.login";
    delegate.register(callingModule, () => {
        return new Promise((reject) => {
            setTimeout(() => {
                reject("Something went wrong");
            },4000);
        });
    });
    await requestHandlerDeferred.handle(callingModule, { privatePort: 3000, path: "/test" });
})().catch((err)=>{
    console.error(err);
});