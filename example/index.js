const viot = require("../index");
const template = require("./template");


const state = {
    CURRENT_EFFECT: "off",
    BRIGHTNESS: 20,
    SYNC: false
};

viot.on("set-sync", (data) => {
    console.log("Sync is now ", data ? "on" : "off");
    state.SYNC = data
    viot.setState("SYNC", data);
})

viot.on("set-effect", (data) => {
    console.log("Effect changed to:", data)

    state.CURRENT_EFFECT = data;
    viot.setState("CURRENT_EFFECT", data);
});

viot.on("set-brightness", (data) => {
    if(data >= 0 && data <= 100){
        state.BRIGHTNESS = data;
        viot.setState("BRIGHTNESS", data);
    }
})

const options = {
    debug: true,
//    template,
    defaultState: state,
    apiKey: "8df654a9723775dbd66a217e145214bc1ae5b33602b421099d59af461e549972",
};

viot.initialize(options)
