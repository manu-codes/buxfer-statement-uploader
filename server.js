

var stmt = require('./data')
var querystring = require('querystring');
var https = require('https');


// To do read from file and add it in gitignore
var host = 'www.buxfer.com';
var username = '***@gmail.com';
var password = '###';
// var apiKey = '*****';
var sessionId = null;
// var deckId = '68DC5A20-EE4F-11E2-A00C-0858C0D5C2ED';


function performRequest(endpoint, method, data, success) {
    var dataString = JSON.stringify(data);
    var headers = {};

    if (method == 'GET') {
        endpoint += '?' + querystring.stringify(data);
    }
    else {
        headers = {
            'Content-Type': 'application/json',
            'Content-Length': dataString.length
        };
    }
    var options = {
        host: host,
        path: endpoint,
        method: method,
        headers: headers
    };

    var req = https.request(options, function (res) {
        res.setEncoding('utf-8');

        var responseString = '';

        res.on('data', function (data) {
            responseString += data;
        });

        res.on('end', function () {
            try {
                console.log(responseString);
                // var responseObject = JSON.parse(responseString);
                success(responseString);
            } catch (e) {
                onError(responseString, e);
            }
        });
    });

    req.write(dataString);
    req.end();
}

// /api/login
// LOGIN
var token = '';
function logonTo(endpoint, method, sendingData, success) {


    performRequest('/api/login', 'POST', {
        username: username,
        password: password
    }, function (data) {
        try {
            data = JSON.parse(data);
        } catch (e) {
            onError(e);
        }
        token = data.response.token;
        console.log('Logged in:', data.response.token);
        var obj = { ...sendingData, 'token': token };
        performRequest(endpoint, method, obj, success);
    }

    );
}
function onError(res, e) {
    console.log('Error occured!!')
    console.log(e);
    console.log(res);

}

//   v1i1sgotcv2qn1k3m91i8hb1f3

// logonTo('/api/accounts', 'POST', {
// }, function (data) {
//     console.log('accounts in:', JSON.parse(data));

// });

// logonTo('/api/add_transaction', 'POST', {
//     description:'test10',
//     amount :-30,
//     accountId:662181,
//     date: '2017-11-02',
//     type:'expense'
// }, function (data) {
//     console.log( data);

// });



function sendData(payload) {
    console.log('sending', payload);

    return new Promise((resolve, reject) => {



        performRequest('/api/add_transaction', 'POST', { ...payload, token }, function (data) {
            console.log('responded')
            resolve(data);

        }

        );




    });
}


async function addTransactions() {

    for (var i = 0; i < stmt.statement.length; i++) {
        let item = stmt.statement[i];
        let amount = 0;
        let type = 'expense';
        let date = 'YYYY-MM-DD'
        let ind = item.Amount.indexOf(' CR');

        if (ind > -1) {
            amount = parseFloat(item.Amount.replace(' CR', '').replace(',', ''));
            type = 'income';
        } else {
            amount = parseFloat('-' + item.Amount.replace(',', ''));
        }

        let dateArray = item.Date.split('/');
        date = date.replace('YYYY', dateArray[2]).replace('MM', dateArray[1]).replace('DD', dateArray[0]);

        let description = item.Description;



        let payload = { description, amount, type, date, accountId: 662181 };

        if (description.indexOf('E Pay ') > -1) {
            payload.type = 'transfer';
            payload.fromAccountId = 543659;
            payload.toAccountId = 662181;
        }

        await sendData(payload)

    }
    return 'SUCCESS---- ALL UPLOADED-------';
}






performRequest('/api/login', 'POST', {
    username: username,
    password: password
}, function (data) {
    try {
        data = JSON.parse(data);
    } catch (e) {
        onError(e);
    }
    token = data.response.token;
    console.log('Logged in:', data.response.token);
    // addTransactions().then(v => {
    //     console.log(v);  // prints 
    // });
}

);


