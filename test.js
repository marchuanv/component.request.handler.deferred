const requestHandler = require("./component.request.handler.deferred.js");
const delegate = require("component.delegate");
(async()=>{ 
    const callingModule = "component.request.handler.secure";
    delegate.register(callingModule, (callback) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ statusCode: 200, statusMessage: "Success", headers: {}, data: null });
            },4000);
        });
    });
    await requestHandler.handle({ callingModule, port: 3000, path: "/test" });
})().catch((err)=>{
    console.error(err);
});