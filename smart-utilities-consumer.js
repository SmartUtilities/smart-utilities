process.env.NODE_CONFIG_DIR= __dirname +'/config';
process.env.NODE_ENV = 'smart-utilities-consumer';
var config = require('config');

var wpwithin = require('./library/wpwithin');
var wpwConstants = require('./library/constants');
var types = require('./library/types/types');
var typesConverter = require('./library/types/converter');
var client;
var device;

var host = config.get('host');
var port = config.get('port');
var logFileName = config.get('logFileName');


// DATABASE
// =============================================================================

var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : '10.0.0.160',
  user     : 'root',
  password : 'w0rldp4y!',
  database : 'smart_utilities'
});

/* connection.connect();

connection.query('SELECT 1 + 1 AS solution', function (error, results, fields) {
  if (error) throw error;
  console.log('The solution is: ', results[0].solution);
});

connection.end(); */

// API/Platform
// =============================================================================

// call the packages we need
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');
var path = require('path');
path.resolve('public');

// app.use(express.static(__dirname + '/public'));
app.use(express.static(path.join(__dirname, 'public')));

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = 3000;        // set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

router.get('/search', function(req, res) {
    res.json({ message: 'hooray! welcome to our api!' });
});


router.route('/search').post(function(req, res) {
  //

  // console.log (req.body.devices);
  var devices = req.body.devices;
  if (req.body.devices.length != 0) {

    var transactionID = Math.floor(Date.now() / 1000);

    var query = "INSERT INTO CONSUMERS (tid, consumer, duration) VALUES ";
    for (var i=0; i < req.body.devices.length; i++) {
        query += "("+ transactionID +", " + "'" +req.body.devices[i].name + "'" + ", " + req.body.devices[i].duration +")"
        query += (i <  req.body.devices.length - 1) ? ", " : "";
    }

    console.log (query);

    connection.connect();

    connection.query(query, function (error, results, fields) {
      if (error) throw error;

      // Create Client
      wpwithin.createClient(host, port, true, logFileName, function (err, response) {

          console.log("createClient.callback");
          console.log("createClient.callback.err: " + err);
          console.log("createClient.callback.response: %j", response);


          if (err == null) {

              client = response;

              setup();
          }
      });
    });

    connection.end();
  }
  res.json({"message" : "OK"});
});

// more routes for our API will happen here

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
//app.use('/platform', router);

app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);

// Methods
// =============================================================================

function setup() {

    client.setup("Smart Utilities", "Smart Utilities Consumer Device", function (err, response) {

        console.log("setup.callback.err: " + err);
        console.log("setup.callback.response: %j", response);

        console.log("Calling discover devices..");

        device = client.getDevice(function (err, response) {

            console.log("getDevice.callback");
            console.log("getDevice.callback.err: ", err);
            console.log("getDevice.callback.response: %j", response);

            if (err == null) {

                device = response;
            }
        });
        //console.log ("================ Setup Devices: ==========================", devices);
        discoverDevices();
    });
}

function discoverDevices() {
    /* client.searchForDevice(10000, "Smart Utilities", function (err, response) {

      console.log ("Callback reponse: ", response);

      console.log ("================ Discover Devices: ==========================", devices);


      // Connect to the first device
      var serviceMessage = response;

      connectToDevice(serviceMessage);

    }); */


    client.deviceDiscovery(10000, function (err, response) {

        console.log("deviceDiscovery.callback.err: %s", err);
        console.log("deviceDiscovery.callback.response: %j", response);

        //console.log ("================ Discover Devices: ==========================", devices);

        if (response != null && response.length > 0) {

            console.log("Discovered %d devices on the network.", response.length);
            console.log("Devices:");

            for (var i = 0; i < response.length; i++) {


                // console.log (response[i].serviceTypes[0]);

                if (response[i].serviceTypes.join(', ').indexOf("smart-utilities-energy") >= 0) {
                  /* console.log (response[i].serviceTypes.join(', '));
                  console.log (response[i].serviceTypes.join(', ').indexOf("smart-utilities-energy")); */
                  console.log ("============================= SMART UTILITIES ENERGY ==============================");
                  connectToDevice(response[i]);
                }
                /* console.log("Description: %s", response[i].deviceDescription);
                console.log("Hostname: %s", response[i].hostname);
                console.log("Port: %d", response[i].portNumber);
                console.log("Server ID: %s", response[i].serverId);
                console.log("URL Prefix: %s", response[i].urlPrefix);
                console.log("Service types: %s", response[i].serviceTypes.join(', '));

                console.log("-------"); */
            }

            // Connect to the first device
            //var serviceMessage = response[0];

            // connectToDevice(serviceMessage);

        } else {

            console.log("Did not discover any devices on the network.");
        }

    });
}

function connectToDevice(serviceMessage) {

    //console.log ("================ Connect to Devices: ==========================", devices);

    'use strict';

    var hceCard = new types.HCECard();
    hceCard.firstName = config.get('hceCard.firstName');
    hceCard.lastName =  config.get('hceCard.lastName');
    hceCard.expMonth = config.get('hceCard.expMonth');
    hceCard.expYear = config.get('hceCard.expYear');
    hceCard.cardNumber = config.get('hceCard.cardNumber');
    hceCard.type = config.get('hceCard.type');
    hceCard.cvc = config.get('hceCard.cvc');

    var pspConfig = new Array();
    pspConfig[wpwConstants.PSP_NAME] = config.get('pspConfig.psp_name');
    pspConfig[wpwConstants.API_ENDPOINT] = config.get('pspConfig.api_endpoint');

    if (pspConfig[wpwConstants.PSP_NAME] === "securenet") {
        // additional parameters for securenet
        pspConfig[wpwConstants.APP_VERSION] = config.get('pspConfig.app_version');
        pspConfig[wpwConstants.DEVELOPER_ID] = config.get('pspConfig.developer_id');

    }

    client.initConsumer(serviceMessage.scheme, serviceMessage.hostname, serviceMessage.portNumber,
        serviceMessage.urlPrefix, device.uid, hceCard, pspConfig, function (err, response) {

            console.log("initConsumer.callback.err: %s", err);
            console.log("initConsumer.callback.response: %j", response);

            if (err == null) {

                console.log("Did initialise consumer.");

                getAvailableServices();
            }
        });
}

function getAvailableServices() {

    client.requestServices(function (err, response) {




        console.log("requestServices.callback.err: %s", err);
        console.log("requestServices.callback.response: %j", response);

        if (err == null && response != null && response.length > 0) {

            var svc = response[0];

            console.log("Services:");
            console.log("Id: %s", svc.serviceId);
            console.log("Description: %s", svc.serviceDescription);
            console.log("----------");

            getServicePrices(svc.serviceId);
        }
    });
}

function getServicePrices(serviceId) {

    client.getServicePrices(serviceId, function (err, response) {

        console.log("requestServicePrices.callback.err: %s", err);
        console.log("requestServicePrices.callback.response: %j", response);

        if (err == null && response != null && response.length > 0) {

            var price = response[0];

            console.log("Price details for ServiceId: %d", serviceId);
            console.log("Id: %d", price.id);
            console.log("Description: %s", price.description);
            console.log("UnitId: %d", price.unitId);
            console.log("unitDescription: %s", price.unitDescription);
            console.log("PricePerUnit:");
            console.log("\tAmount: %d", price.pricePerUnit.amount);
            console.log("\tCurrency Code: %s", price.pricePerUnit.currencyCode);
            console.log("----------");

            getServicePriceQuote(serviceId, 10, price.id);
        } else {

            console.log("Did not receive any service prices :/");
        }
    });
}

function getServicePriceQuote(serviceId, numberOfUnits, priceId) {

    client.selectService(serviceId, numberOfUnits, priceId, function (err, response) {

        console.log("selectService.callback.err: %s", err);
        console.log("selectService.callback.response: %j", response);

        if (err == null && response != null) {

            console.log("TotalPriceResponse:");
            console.log("ServerId: %s", response.serverId);
            console.log("ClientId: %s", response.clientId);
            console.log("PriceId: %d", response.priceId);
            console.log("UnitsToSupply: %d", response.unitsToSupply);
            console.log("TotalPrice: %d", response.totalPrice);
            console.log("PaymentReferenceId: %s", response.paymentReferenceId);
            console.log("MerchantClientKey: %s", response.merchantClientKey);
            console.log("CurrencyCode: %s", response.currencyCode);
            console.log("------");

            purchaseService(serviceId, response);

        } else {

            console.log("Did not receive total price response from selectService()");
        }
    });
}

function purchaseService(serviceId, totalPriceResponse) {

    client.makePayment(totalPriceResponse, function (err, response) {

        console.log("makePayment.callback.err: %s", err);
        console.log("makePayment.callback.response: %j", response);

        if (err == null && response != null) {

            console.log("Resonse from make payment:");
            console.log("ServerID: %s", response.serverId);
            console.log("ClientID: %s", response.clientId);
            console.log("TotalPaid: %d", response.totalPaid);
            console.log("ServiceDeliveryToken:");
            console.log("\tKey: %s", response.serviceDeliveryToken.key);
            console.log("\tIssued: %s", response.serviceDeliveryToken.issued);
            console.log("\tExpiry: %s", response.serviceDeliveryToken.expiry);
            console.log("\tRefundOnExpiry: %b", response.serviceDeliveryToken.refundOnExpiry);
            console.log("\tSignature: %s", response.serviceDeliveryToken.signature);
            console.log("----------");

            beginServiceDelivery(serviceId, response.serviceDeliveryToken, 8);

        } else {

            console.log("Did not receive correct response to make payment..");
        }
    });
}

function beginServiceDelivery(serviceId, serviceDeliveryToken, unitsToSupply) {

    client.beginServiceDelivery(serviceId, serviceDeliveryToken, unitsToSupply, function (err, response) {

        console.log("beginServiceDelivery.callback.err: %s", err);
        console.log("beginServiceDelivery.callback.response: %j", response);

        var sleep = require('system-sleep');

        console.log("Will sleep for 10 seconds..");
        sleep(10);

        endServiceDelivery(serviceId, serviceDeliveryToken, 8);
    });
}

function endServiceDelivery(serviceId, serviceDeliveryToken, unitsReceived) {

    client.endServiceDelivery(serviceId, serviceDeliveryToken, unitsReceived, function (err, response) {

        console.log("endServiceDelivery.callback.err: %s", err);
        console.log("endServiceDelivery.callback.response: %j", response);
        process.exit(0);
    });
}
