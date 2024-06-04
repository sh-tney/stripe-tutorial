# README

This is a repo serves as template for a very simple Node-based Stripe application, with a backend server that creates PaymentIntents and responds to Stripe webhooks, as well as a simple frontend with a Stripe Checkout form.

### How do I get set up?

1. Install the [Stripe CLI](https://docs.stripe.com/stripe-cli)
   - `brew install stripe/stripe-cli/stripe`, or the equivalent for your package manager
2. Grab node dependencies:

   - `nvm use`
   - `npm install`

3. Setup your Stripe account
   - On the [Stripe Dashboard](https://dashboard.stripe.com/test/), go to **Settings** -> **Developers** -> **API Keys**
   - Add the **Secret Key** to a `.env` file in this folder (refer to `.env.example`)
   - Record the **Publishable Key** for later use in the front end.

### How do I run this locally?

Probably run each of these in a separate terminal.

1. `npm run backend`
2. `npm run frontend` - This is where that **Publishable Key** from earlier will go
3. `stripe login` + `stripe listen --forward-to localhost:4242/webhook`

#### Credit to Ben Crowl for all the `/frontend` code, original [here](https://codepen.io/mrcrowl/pen/WNJxgxR?editors=1011).
