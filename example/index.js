const viot = require("../index");
const template = require("./template");


const state = {
    CURRENT_EFFECT: "off",
    BRIGHTNESS: 20
};

viot.on("set-effect", (data) => {
    // Verify 'data' is valid here
    viot.setState("CURRENT_EFFECT", data);

    state.CURRENT_EFFECT = data;
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