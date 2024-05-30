import dotenv from "dotenv";

function getConfig() {
  dotenv.config();
  if (!process.env.STRIPE_PRIVATE_KEY)
    throw new Error("Missing environment variable: STRIPE_PRIVATE_KEY");
  return { STRIPE_PRIVATE_KEY: process.env.STRIPE_PRIVATE_KEY };
}

console.log("hello world");
console.log(JSON.stringify(getConfig()));
