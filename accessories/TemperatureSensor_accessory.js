var Accessory = require('../').Accessory;
var Service = require('../').Service;
var Characteristic = require('../').Characteristic;
var uuid = require('../').uuid;



// here's a fake temperature sensor device that we'll expose to HomeKit
var DS3231ESPTEMP = {
    currentTemperature: 50,
    getTemperature: function() {
        console.log("Getting the current temperature!");
        return DS3231ESPTEMP.currentTemperature;
    },

    setTemperature: function(value) {
        console.log(value);
        DS3231ESPTEMP.currentTemperature = Math.round(value) //Math.round(Math.random() * 100);
    }
}




// Generate a consistent UUID for our Temperature Sensor Accessory that will remain the same
// even when restarting our server. We use the `uuid.generate` helper function to create
// a deterministic UUID based on an arbitrary "namespace" and the string "temperature-sensor".
var sensorUUID = uuid.generate('hap-nodejs:accessories:temperature-sensor');

// This is the Accessory that we'll return to HAP-NodeJS that represents our fake lock.
var sensor = exports.accessory = new Accessory('Temperature Sensor', sensorUUID);

// Add properties for publishing (in case we're using Core.js and not BridgedCore.js)
sensor.username = "A3:99:32:BB:5E:AA";
sensor.pincode = "031-45-154";

// Add the actual TemperatureSensor Service.
// We can see the complete list of Services and Characteristics in `lib/gen/HomeKitTypes.js`
sensor
    .addService(Service.TemperatureSensor)
    .getCharacteristic(Characteristic.CurrentTemperature)
    .on('get', function(callback) {

        // return our current value
        callback(null, DS3231ESPTEMP.getTemperature());
    });

var mqtt = require('mqtt');
var client = mqtt.connect('mqtt://localhost');

client.on('connect', function() {
    client.subscribe('temperature');

    client.on('message', function(topic, message) {
        DS3231ESPTEMP.setTemperature(message);
        console.log("Sensor current temperature from mqtt:" + DS3231ESPTEMP.currentTemperature)
        // update the characteristic value so interested iOS devices can get notified
        sensor
            .getService(Service.TemperatureSensor)
            .setCharacteristic(Characteristic.CurrentTemperature, DS3231ESPTEMP.currentTemperature)
        console.log(message.toString());
    });
});


// randomize our temperature reading every 3 seconds
// setInterval(function() {
//
//     DS3231ESPTEMP.setTemperature(sensor.getaccTemperature());
//     console.log("Sensor current temperature from websocket:" + DS3231ESPTEMP.currentTemperature)
//         // update the characteristic value so interested iOS devices can get notified
//     sensor
//         .getService(Service.TemperatureSensor)
//         .setCharacteristic(Characteristic.CurrentTemperature, DS3231ESPTEMP.currentTemperature)
//
//
// }, 10000);
