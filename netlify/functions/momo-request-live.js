const uuid = require("uuid");
const fetch = require("node-fetch");

exports.handler = async function (event) {
  try {
    const { amount, phone } = JSON.parse(event.body);

    const subscriptionKey = "3c9aa91fc6ca42a8989180f12d037a79"; // Replace with your key
    const tokenUrl = "https://sandbox.momodeveloper.mtn.com/collection/v1_0/bc-authorize"; // ✅ LIVE TOKEN URL

    // Step 1: Get Access Token
    const tokenRes = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": subscriptionKey
      }
    });

    if (!tokenRes.ok) {
      const err = await tokenRes.text();
      throw new Error(`Token Error: ${err}`);
    }

    const { access_token } = await tokenRes.json();
    const reference = uuid.v4();

    // Step 2: Send Payment Request
    const payRes = await fetch("https://proxy.momoapi.mtn.com/collection/v1_0/requesttopay", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${access_token}`,
        "X-Reference-Id": reference,
        "X-Target-Environment": "mtncameroon", // or "sandbox" if testing
        "Ocp-Apim-Subscription-Key": subscriptionKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        amount,
        currency: "XAF",
        externalId: reference,
        payer: { partyIdType: "MSISDN", partyId: phone },
        payerMessage: "Purchase from MADECC",
        payeeNote: "eBook or Course Payment"
      })
    });

    if (!payRes.ok) {
      const err = await payRes.text();
      throw new Error(`Payment Error: ${err}`);
    }

    return {
      statusCode: 200,
      body: `✅ Payment request sent! Ref: ${reference}`
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: `❌ ${err.message}`
    };
  }
};
