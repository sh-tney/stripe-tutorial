function onload() {
    const stripeKey = localStorage["stripekey"] ?? "";
    document.querySelector("#stripekey").value = stripeKey;
  
    if (stripeKey) {
      show();
    }
  }
  
  let stripe;
  let cardElement;
  
  function show(e) {
    e?.preventDefault();
  
    const key = document.querySelector("#stripekey").value;
    localStorage["stripekey"] = document.querySelector("#stripekey").value;
    stripe = Stripe(key);
  
    const elements = stripe.elements();
    const style = {
      base: {
        color: "#32325d",
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSmoothing: "antialiased",
        fontSize: "16px",
        "::placeholder": {
          color: "#aab7c4"
        }
      },
      invalid: {
        color: "#fa755a",
        iconColor: "#fa755a"
      }
    };
  
    cardElement = elements.create("card", { style });
    cardElement.mount("#card-element");
  }
  
  async function doSubmit(e) {
    e.preventDefault();
  
    const name = document.querySelector("#stripename").value;
    const paymentOption = {
      payment_method: {
        card: cardElement,
        billing_details: { name: name }
      }
    };
    const clientSecret = document.querySelector("#stripeclientsecret").value;
  
    try {
      document.querySelector("#submitbutton").disabled = true;
      const { paymentIntent, error } = await stripe.confirmCardPayment(
        clientSecret,
        paymentOption
      );
  
      if (error) {
        document.querySelector("#output").value = JSON.stringify(error, null, 2);
      } else {
        document.querySelector("#output").value = JSON.stringify(paymentIntent, null, 2);
      }
    } catch (e) {
      alert(e);
    } finally {
      document.querySelector("#submitbutton").disabled = false;
    }
  }
  