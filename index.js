const mqtt = require("mqtt");

const defaultOptions = {
	host: "mqtt://localhost"
}

const listeners = {}
const on = (action, fn) => {
	if(action === "status") return console.error("viot: Cannot listen to 'status' event");
	if(!listeners[action]) listeners[action] = []
	listeners[action].push(fn);
}

const validateTemplate = (template) => {
	if(!template) return false;
	try{
		if(typeof template === "object") template = JSON.stringify(template); 
		else {
			parsedTemplate = JSON.parse(template);
			if(!parsedTemplate) return false;
		}

		return template;
	} catch(e){
		return false;
	}
}

let viotTemplate;
const setTemplate = (template) => {
	template = validateTemplate(template);
	if(!template) return console.error("viot: Invalid template provided");

	viotTemplate = template;
}

let viotState = {};
let viotStateListeners = [];
const setState = (key, value) => {
	viotState[key] = value;

	viotStateListeners.forEach(listener => listener(viotState));
}

const initialize = (opts) => {
	const options = {...defaultOptions, ...opts};
	if(!options.apiKey) 
		return console.error("viot: No device API key provided");
	//if(!options.template)
	//	return console.error("viot: No template provided");
	if(!options.defaultState)
		return console.warn("viot: No default state provided");

	if(options.template){
		template = validateTemplate(options.template);
		if(!template) return console.error("viot: Invalid template provided");
		viotTemplate = template	
	}

	if(options.defaultState && typeof options.defaultState !== "object") return console.error("viot: Invalid default state provided")

	viotState = options.defaultState;

	const client = mqtt.connect(options.host, {
		username: options.apiKey,
		password: options.apiKey
	});

	const updateState = (state) => {
		console.log("viot: State changed, sending new state", viotState)
		client.publish(`device/${options.apiKey}/emit`, JSON.stringify({
			command: "state",
			message: viotState 
		}));
	}

	viotStateListeners.push(updateState);
	updateState();

	client.on("connect", () => {
		console.log("viot: Connected to MQTT service");
		client.subscribe(`device/${options.apiKey}/receive`, (err) => {
			if(err) console.error("viot", err);
		});
	
		client.publish(`device/${options.apiKey}/emit`, '{"command": "connect"}');
	});

	client.on("message", (topic, message) => {	
		if(options.verbose) console.debug(`viot: Received ${topic} with message: ${message.toString()}`);

		try {
			const receivedMessage = JSON.parse(message.toString());
			if(!receivedMessage.command){
				if(options.debug) console.debug(`viot: Received message with no command parameter: '${message.toString()}' at topic ${topic}`);
				return;
			};

			switch(receivedMessage.command){
				case "status": {
					if(options.debug) console.debug(`viot: Received status call`)
					client.publish(`device/${options.apiKey}/emit`, JSON.stringify({
						command: "status",
						message : "online"
					}));
					
					break;
				}

				case "template": {
					if(options.debug) console.debug("viot: Responding to template request");
					client.publish(`device/${options.apiKey}/emit`, JSON.stringify({
						command: "template",
						message : {...(viotTemplate ? {template: viotTemplate} : {}), state: viotState}
					}));

					break;
				}

				default: {
					if(options.debug) console.debug(`viot: Received command '${receivedMessage.command}' with value: '${receivedMessage.value}'`)

					if(listeners[receivedMessage.command])
						listeners[receivedMessage.command].forEach(fn => fn(receivedMessage.value))
					else
						console.log(`viot: Received command '${receivedMessage.command}' which does not have a handler`);
				}
			}
		} catch(e){
			console.error(e);
		}
	})
};

module.exports = {
	on,
	initialize,
	setState
}











