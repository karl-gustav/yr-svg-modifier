const https = require("https");

// source https://ozzyczech.cz/js/fetch-in-pure-node-js/
module.exports = (params, postData) => new Promise((resolve, reject) => {
    const req = https.request(params, (res) => {

        // reject on bad status
        if (res.statusCode < 200 || res.statusCode >= 300) {
            return reject(new Error('statusCode=' + res.statusCode));
        }

        // read data
        let body = [];
        res.on('data', chunk => {
            body.push(chunk);
        });

        res.on('end', () => {
            try {
                body = Buffer.concat(body).toString();
            } catch (e) {
                reject(e);
            }
      
            resolve(body); // submit data
        });
    });

    req.on('error', (err) => {
        reject(err);
    });

    if (postData) {
        req.write(postData);
    }

    req.end(); // close request
});
