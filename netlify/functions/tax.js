const https = require('https');

exports.handler = async function(event) {
  const zip = event.queryStringParameters && event.queryStringParameters.zip;
  if (!zip) {
    return { statusCode: 400, body: JSON.stringify({ error: 'No zip provided' }) };
  }

  const ZIPTAX_KEY = 'ziptax_sk_wDwNbg2NgXN5JxdzDymtZZWVb7s1I9B';
  const url = 'https://api.zip-tax.com/request/v60?key=' + ZIPTAX_KEY + '&postalcode=' + zip;

  return new Promise(function(resolve) {
    https.get(url, function(res) {
      let body = '';
      res.on('data', function(chunk) { body += chunk; });
      res.on('end', function() {
        try {
          const data = JSON.parse(body);
          if (data && data.results && data.results.length > 0) {
            const r = data.results[0];
            resolve({
              statusCode: 200,
              headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
              },
              body: JSON.stringify({
                rate: r.taxSales,
                state: r.geoState,
                county: r.geoCounty,
                city: r.geoCity
              })
            });
          } else {
            resolve({
              statusCode: 200,
              headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
              body: JSON.stringify({ rate: null })
            });
          }
        } catch(e) {
          resolve({
            statusCode: 200,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ rate: null, error: 'Parse error' })
          });
        }
      });
    }).on('error', function(e) {
      resolve({
        statusCode: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ rate: null, error: e.message })
      });
    });
  });
};
