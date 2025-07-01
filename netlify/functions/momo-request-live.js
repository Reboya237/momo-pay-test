import { v4 as uuidv4 } from 'uuid';
import fetch from 'node-fetch';

export async function handler(event) {
  try {
    const { amount, phone } = JSON.parse(event.body);
    const subscriptionKey = "3c9aa91fc6ca42a8989180f12d037a79";  // Replace this

    const tokenRes = await fetch("https://momodeveloper.mtn.com/collection/token/", {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": subscriptionKey,
        "Content-Type": "application/json"
      }
    });
    if (!tokenRes.ok) {
      const err = await tokenRes.text();
      throw new Error(`Token error: ${err}`);
    }
    const { access_token } = await tokenRes.json();

    const reference = uuidv4();
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
      throw new Error(`Payment error: ${err}`);
    }

    return {
      statusCode: 200,
      body: `✅ Payment request sent! Ref: ${reference}. Complete the payment on your phone.`
    };
  } catch (err) {
    console.error("MoMo Live Error:", err);
    return {
      statusCode: err.message.startsWith("Token") || err.message.startsWith("Payment") ? 400 : 500,
      body: `❌ ${err.message}`
    };
  }
}
