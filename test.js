const requestHandlerDeferred = require("./component.request.handler.deferred.js");
const requestUnsecure = require("component.request.unsecure");
const delegate = require("component.delegate");
(async()=>{

    const newUnsecureRequestA = { host: "localhost", port: 3000, path: "/test" };
    const newUnsecureRequestB = { host: "localhost", port: 3000, path: "/test" };

    delegate.register("component.request.handler.user", `${newUnsecureRequestA.port}${newUnsecureRequestA.path}`,() => {
        return { statusCode: 200, statusMessage: "Success", headers: {}, data: "test passed" };
    });
    delegate.register("component.request.handler.user", `${newUnsecureRequestB.port}${newUnsecureRequestB.path}`,() => {
        return new Promise((reject) => {
            setTimeout(() => {
                reject("Something went wrong");
            },4000);
        });
    });
    await requestHandlerDeferred.handle(newUnsecureRequestA);
    await requestHandlerDeferred.handle(newUnsecureRequestB);

    let results = await requestUnsecure.send({ 
        host: newUnsecureRequestA.host,
        port: newUnsecureRequestA.port,
        path: newUnsecureRequestA.path,
        method: "GET",
        headers: {}, 
        data: ""
    });
    if (results.statusCode !== 200){
        throw "deferred test for port 3000 failed";
    }

    results = await requestUnsecure.send({ 
        host: newUnsecureRequestB.host,
        port: newUnsecureRequestB.port,
        path: newUnsecureRequestB.path,
        method: "GET",
        headers: {}, 
        data: "",
        retryCount: 1
    });
    if (results.statusCode !== 202){
        throw "deferred test for port 4000 failed";
    }

    process.exit();

})().catch((err)=>{
    console.error(err);
});