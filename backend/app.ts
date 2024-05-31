import dotenv from "dotenv";
import express from "express";
import Stripe from "stripe";

function getConfig() {
  dotenv.config();
  if (!process.env.STRIPE_PRIVATE_KEY)
    throw new Error("Missing environment variable: STRIPE_PRIVATE_KEY");
  return { STRIPE_PRIVATE_KEY: process.env.STRIPE_PRIVATE_KEY };
}

// SETUP
const port = 4242;
const config = getConfig();
console.log("Config OK.");
const stripe = new Stripe(config.STRIPE_PRIVATE_KEY);
const app = express();

// WEBHOOK RECEIVER
app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  (request, response) => {
    let event = JSON.parse(request.body) as Stripe.Event;
    console.log(`Received Stripe event: ${event.type}`);

    // Handle the event
    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object;
        console.log(`PaymentIntent ${paymentIntent.id} was successful!`);
        break;
      default:
        console.log(`Unhandled event type ${event.type}.`);
    }

    response.send();
  }
);

const makeAutomaticPaymentIntentURI = "/makeAutomaticPaymentIntent";
app.get(makeAutomaticPaymentIntentURI, async (_request, response) => {
  try {
    const result = await stripe.paymentIntents.create({
      amount: 200,
      currency: "aud",
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
