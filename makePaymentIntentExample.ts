import dotenv from "dotenv";
import Stripe from "stripe";

function getConfig() {
  dotenv.config();
  if (!process.env.STRIPE_PRIVATE_KEY)
    throw new Error("Missing environment variable: STRIPE_PRIVATE_KEY");
  return { STRIPE_PRIVATE_KEY: process.env.STRIPE_PRIVATE_KEY };
}

async function main() {
  const config = getConfig();
  console.log("Config OK");

  const stripe = new Stripe(config.STRIPE_PRIVATE_KEY);
  const result = await stripe.paymentIntents.create({
    amount: 200,
    currency: "aud",
    capture_method: "manual",
  });
  console.log(JSON.stringify(result));
}

await main();
