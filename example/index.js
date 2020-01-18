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
    template,
    defaultState: state,
    apiKey: "69a1ee068d4d0286a0c33c8467a1548cff583dad3a4744d2fca98e053d57b866",
};

viot.initialize(options)