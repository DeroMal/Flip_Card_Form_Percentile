// Replace with your URL of the Google Apps Script endpoint
const GOOGLE_SCRIPT_URL = 'Google_Apps_Script_Endpoint_URL';

// Headers to handle CORS (Cross-Origin Resource Sharing)
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,HEAD,POST,OPTIONS",
  "Access-Control-Max-Age": "86400",
  "Access-Control-Allow-Headers": "Content-Type"
};

export default {
  async fetch(request, env, ctx) {
    if (request.method === 'OPTIONS') {
      // Handle CORS preflight request. This is a preliminary request sent by browsers
      // to check the server's CORS policy.
      return new Response(null, {
        headers: corsHeaders
      });
    }

    if (request.method === 'POST') {
      try {
        console.log("Fetching Google Script URL...");

        // Convert the request body to a string format suitable for sending to the Google Script
        const requestBodyBuffer = new TextEncoder().encode(JSON.stringify(await request.json()));

        // Send the POST request to the Google Script URL
        let response = await fetch(GOOGLE_SCRIPT_URL, {
          method: 'POST',
          body: requestBodyBuffer,
          headers: { 'Content-Type': 'application/json' },
        });

        // If the Google Script responds with a redirect (status code 302), follow the redirect
        if (response.status === 302) {
          const redirectUrl = response.headers.get('Location');
          response = await fetch(redirectUrl);
        }
        
        // If the response is not successful, throw an error
        if (!response.ok) {
          throw new Error(`Google Script responded with status: ${response.status}`);
        }

        // Parse the response data and return it
        const data = await response.json();
        return new Response(JSON.stringify(data), {
          status: 200,
          headers: corsHeaders
        });
      } catch (error) {
        // Log any errors and return a 500 status code
        console.error("Error occurred:", error);
        return new Response(error.message, {
          status: 500,
          headers: corsHeaders
        });
      }
    }
    
    // If the request method is not POST, return a 400 status code
    return new Response('Expected POST', {
      status: 400,
      headers: corsHeaders
    });
  },
};
