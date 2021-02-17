const requestHandlerDeferred = require("./component.request.handler.deferred.js");
const request = require("component.request");
const delegate = require("component.delegate");
(async()=>{ 
    delegate.register("component.request.handler.user", "3000/test",() => {
        return { statusCode: 200, statusMessage: "Success", headers: {}, data: "test passed" };
    });
    delegate.register("component.request.handler.user", "4000/test",() => {
        return new Promise((reject) => {
            setTimeout(() => {
                reject("Something went wrong");
            },4000);
        });
    });
    await requestHandlerDeferred.handle({ port: 3000, host: "localhost", path: "/test" });
    await requestHandlerDeferred.handle({ port: 4000, host: "localhost", path: "/test" });

    let results = await request.send({ 
        host: "localhost",
        port: 3000,
        path: "/test",
        method: "GET",
        headers: {}, 
        data: "",
        retryCount: 1
    });
    if (results.statusCode !== 200){
        throw "deferred test for port 3000 failed";
    }

    results = await request.send({ 
        host: "localhost",
        port: 4000,
        path: "/test",
        method: "GET",
        headers: {}, 
        data: "",
        retryCount: 1
    });
    if (results.statusCode !== 202){
        throw "deferred test for port 4000 failed";
    }


})().catch((err)=>{
    console.error(err);
});