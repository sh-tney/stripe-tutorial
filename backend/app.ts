import dotenv from "dotenv";
import express from "express";
import Stripe from "stripe";

function getConfig() {
  dotenv.config();
  if (!process.env.STRIPE_PRIVATE_KEY)
    throw new Error("Missing environment variable: STRIPE_PRIVATE_KEY");
  return { STRIPE_PRIVATE_KEY: process.env.STRIPE_PRIVATE_KEY };
}

const port = 4242;
const config = getConfig();
console.log("Config OK.");
const stripe = new Stripe(config.STRIPE_PRIVATE_KEY);
const app = express();

// Replace this endpoint secret with your endpoint's unique secret
// If you are testing with the CLI, find the secret by running 'stripe listen'
// If you are using an endpoint defined with the API or dashboard, look in your webhook settings
// at https://dashboard.stripe.com/webhooks
const endpointSecret = "whsec_...";

const makePaymentIntentURI = "/makePaymentIntent";
app.get(makePaymentIntentURI, async (_request, response) => {
  try {
    const result = await stripe.paymentIntents.create({
      amount: 200,
      currency: "aud",
    });
    console.log(`Created PaymentIntent ${result.id}`);
    response.json(result);
  } catch (e) {
    console.log(e);
    response.send("Something Bad Happened");
  }
});

app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  (request, response) => {
    let event = request.body;
    // Only verify the event if you have an endpoint secret defined.
    // Otherwise use the basic event deserialized with JSON.parse
    if (endpointSecret) {
      // Get the signature sent by Stripe
      const signature = request.headers["stripe-signature"];
      try {
        event = stripe.webhooks.constructEvent(
          request.body,
          signature!,
          endpointSecret
        );
      } catch (err) {
        //console.log(`⚠️  Webhook signature verification failed.`, err?.message);
        return response.sendStatus(400);
      }
    }

    // Handle the event
    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object;
        console.log(
          `PaymentIntent for ${paymentIntent.amount} was successful!`
        );
        // Then define and call a method to handle the successful payment intent.
        // handlePaymentIntentSucceeded(paymentIntent);
        break;
      case "payment_method.attached":
        const paymentMethod = event.data.object;
        // Then define and call a method to handle the successful attachment of a PaymentMethod.
        // handlePaymentMethodAttached(paymentMethod);
        break;
      default:
        // Unexpected event type
        console.log(`Unhandled event type ${event.type}.`);
    }

    // Return a 200 response to acknowledge receipt of the event
    response.send();
  }
);

app.listen(port, () => {
  console.log(`Listening on port 4242`);
  console.log(` --> http://localhost:${port}${makePaymentIntentURI}`);
  console.log("");
});
