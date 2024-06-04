import dotenv from "dotenv";
import express from "express";
import Stripe from "stripe";
import { createId } from "@paralleldrive/cuid2";

function getConfig() {
  dotenv.config();
  if (!process.env.STRIPE_PRIVATE_KEY)
    throw new Error("Missing environment variable: STRIPE_PRIVATE_KEY");
  return {
    STRIPE_PRIVATE_KEY: process.env.STRIPE_PRIVATE_KEY,
    DESTINATION_STRIPE_ACCT: process.env.DESTINATION_STRIPE_ACCT,
  };
}

// SETUP
const feeRate = 0.1; // 10%
const port = 4242;
const config = getConfig();
console.log("Config OK.");
const signature = createId();
const stripe = new Stripe(config.STRIPE_PRIVATE_KEY);
const app = express();

// WEBHOOK RECEIVER
app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (request, response) => {
    let event = JSON.parse(request.body) as Stripe.Event;
    console.log(`Received Stripe event: ${event.type}`);

    // Handle the event
    switch (event.type) {
      case "payment_intent.succeeded":
        if (verify(event.data.object))
          console.log(
            `-> PaymentIntent ${event.data.object.id} was successful!`
          );
        break;
      case "payment_intent.amount_capturable_updated":
        if (verify(event.data.object)) {
          const captureResponse = await stripe.paymentIntents.capture(
            event.data.object.id
          );
          if (
            !captureResponse.latest_charge ||
            !config.DESTINATION_STRIPE_ACCT
          ) {
            console.log(`-> Captured ${captureResponse.id}, didn't Transfer`);
          } else {
            await stripe.transfers.create({
              currency: captureResponse.currency,
              amount:
                captureResponse.amount -
                Math.floor(captureResponse.amount * feeRate),
              destination: config.DESTINATION_STRIPE_ACCT,
            });
          }
          console.log(
            `-> Captured & Transferred PaymentIntent ${captureResponse.id}`
          );
        }
        break;
      default:
        console.log(`Unhandled event type ${event.type}.`);
    }

    response.send();

    function verify(paymentIntent: Stripe.PaymentIntent): boolean {
      if (paymentIntent.transfer_group !== signature) {
        console.log(`-> Event is from another application, ignoring`);
        return false;
      }
      return true;
    }
  }
);

const makeAutomaticPaymentIntentURI = "/makeAutomaticPaymentIntent";
app.get(makeAutomaticPaymentIntentURI, async (_request, response) => {
  try {
    const result = await stripe.paymentIntents.create({
      amount: 200,
      currency: "aud",
      transfer_group: signature,
      on_behalf_of: config.DESTINATION_STRIPE_ACCT,
    });
    console.log(`Created Automatic PaymentIntent ${result.id}`);
    response.json(result);
  } catch (e) {
    console.log(e);
    response.send("Something Bad Happened");
  }
});

const makePreauthPaymentIntentURI = "/makePreauthPaymentIntent";
app.get(makePreauthPaymentIntentURI, async (_request, response) => {
  try {
    const result = await stripe.paymentIntents.create({
      amount: 200,
      currency: "aud",
      capture_method: "manual",
      transfer_group: signature,
      on_behalf_of: config.DESTINATION_STRIPE_ACCT,
    });
    console.log(`Created Preauth PaymentIntent ${result.id}`);
    response.json(result);
  } catch (e) {
    console.log(e);
    response.send("Something Bad Happened");
  }
});

app.listen(port, () => {
  console.log(`Listening on port 4242`);
  console.log(` --> http://localhost:${port}${makeAutomaticPaymentIntentURI}`);
  console.log(` --> http://localhost:${port}${makePreauthPaymentIntentURI}`);
  console.log("");
});
