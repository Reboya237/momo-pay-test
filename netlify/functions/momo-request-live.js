const uuid = require("uuid");
const fetch = require("node-fetch");

exports.handler = async function (event) {
  try {
    const { amount, phone } = JSON.parse(event.body);
    const subscriptionKey = "3c9aa91fc6ca42a8989180f12d037a79"; // Replace this with your live key

    const tokenRes = await fetch("https://momodeveloper.mtn.com/collection/token/", {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": subscriptionKey,
        "Content-Type": "application/json"
      }
    });

    if (!tokenRes.ok) {
      const err = await tokenRes.text();
      throw new Error(`Token Error: ${err}`);
    }

    const { access_token } = await tokenRes.json();
    const reference = uuid.v4();

    const payRes = await fetch("https://momodeveloper.mtn.com/collection/v1_0/requesttopay", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${access_token}`,
        "X-Reference-Id": reference,
        "X-Target-Environment": "mtncameroon",
        "Ocp-Apim-Subscription-Key": subscriptionKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        amount,
        currency: "XAF",
        externalId: reference,
        payer: { partyIdType: "MSISDN", partyId: phone },
        payerMessage: "Thank you for your purchase",
        payeeNote: "MADECC CONSTRUCTION"
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
