process.env.NODE_CONFIG_DIR = __dirname + '/config';
process.env.NODE_ENV = 'smart-utilities-producer';
var config = require('config');

var wpwithin = require('./library/wpwithin');
var wpwConstants = require('./library/constants');
var types = require('./library/types/types');
var typesConverter = require('./library/types/converter');
var client;

var host = config.get('host');
var port = config.get('port');
var logFileName = config.get('logFileName');

wpwithin.createClient(host, port, true, logFileName, function (err, response) {

    console.log("createClient.callback");
    console.log("createClient.callback.err: " + err);
    console.log("createClient.callback.response: %j", response);

    if (err == null) {

        client = response;

        setup();
    }
});

function setup() {

    client.setup("Smart Utilities 1", "Smart Utilities Producer Device 1", function (err, response) {

        console.log("setup.callback.err: " + err);
        console.log("setup.callback.response: %j", response);

        if (err == null) {
            console.log ("Error is null!");
            addService();
        }
    });
}


function addService() {

    var service = new types.Service();

    service.id = 1;
    service.name = "Energy";
    service.description = "Energy Price / Time Slots";
    service.serviceType = "smart-utilities-energy";
    service.prices = new Array();
    // Creat Price
    for (var i=0; i < 24; i++) {
      var rwPrice = new types.Price();
      rwPrice.id = i;
      rwPrice.description = i + "-" + (i+1);
      rwPrice.unitId = 1;
      rwPrice.unitDescription = "kwh";
      var pricePerUnit = new types.PricePerUnit();
      var min = 10;
      var max = 100;
      var amount = parseInt(Math.random() * (max - min) + min);
      pricePerUnit.amount = amount;
      pricePerUnit.currencyCode = "GBP";
      rwPrice.pricePerUnit = pricePerUnit;

      // Add prices
      service.prices.push(rwPrice);
    }


    client.addService(service, function (err, response) {

        console.log("addService.callback");
        console.log("err: " + err);
        console.log("response: %j", response);

        if (err == null) {

            initProducer();
        }
    });
}

function initProducer() {

    var pspConfig = new Array();

    pspConfig[wpwConstants.PSP_NAME] = config.get('pspConfig.psp_name');
    pspConfig[wpwConstants.API_ENDPOINT] = config.get('pspConfig.api_endpoint');
    pspConfig[wpwConstants.HTE_PUBLIC_KEY] = config.get('pspConfig.hte_public_key');
    pspConfig[wpwConstants.HTE_PRIVATE_KEY] = config.get('pspConfig.hte_private_key');

    if (pspConfig[wpwConstants.PSP_NAME] === "worldpayonlinepayments") {

        pspConfig[wpwConstants.MERCHANT_CLIENT_KEY] = config.get('pspConfig.merchant_client_key');
        pspConfig[wpwConstants.MERCHANT_SERVICE_KEY] = config.get('pspConfig.merchant_service_key');

    } else if (pspConfig[wpwConstants.PSP_NAME] === "securenet") {

        pspConfig[wpwConstants.DEVELOPER_ID] = config.get('pspConfig.developer_id');
        pspConfig[wpwConstants.APP_VERSION] = config.get('pspConfig.app_version');
        pspConfig[wpwConstants.PUBLIC_KEY] = config.get('pspConfig.public_key');
        pspConfig[wpwConstants.SECURE_KEY] = config.get('pspConfig.secure_key');
        pspConfig[wpwConstants.SECURE_NET_ID] = config.get('pspConfig.secure_net_id');

    } else {
        console.log("pspConfig.psp_name not set in config file.");
        return;
    }

    client.initProducer(pspConfig, function (err, response) {

        console.log("initProducer.callback");
        console.log("initProducer.err: " + err);
        console.log("initProducer.response: %j", response);

        if (err == null) {

            startBroadcast();
        }
    });
}

function startBroadcast() {

    client.startServiceBroadcast(0, function (err, response) {

        console.log("startServiceBroadcast.callback");
        console.log("startServiceBroadcast.err: " + err);
        console.log("startServiceBroadcast.response: %j", response);
    });
}
