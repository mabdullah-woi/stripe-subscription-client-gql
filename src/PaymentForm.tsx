import { useMutation } from "@apollo/client";
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import React, { useState } from "react";
import { ATTACH_PAYMENT_METHOD, CREATE_SUBSCRIPTION } from "./graphql/queries.ts";

interface PaymentFormProps {
  customerId: string;
  priceId: string;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ customerId, priceId }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const [attachPaymentMethod] = useMutation(ATTACH_PAYMENT_METHOD);
  const [createSubscription] = useMutation(CREATE_SUBSCRIPTION);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) return; // Stripe or Elements not loaded yet

    setIsProcessing(true);
    setErrorMessage(null);

    const cardElement = elements.getElement(CardElement);

    // Create payment method
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: "card",
      card: cardElement!,
    });

    if (error) {
      setErrorMessage(error.message || "An error occurred.");
      setIsProcessing(false);
      return;
    }

    try {
      // Attach payment method to customer
      await attachPaymentMethod({ variables: { customerId, paymentMethodId: paymentMethod.id } });

      // Create the subscription
      await createSubscription({ variables: { customerId, priceId } });

      // At this point, Stripe has automatically confirmed the payment
      alert("Subscription successful!");
    } catch (error: any) {
      setErrorMessage(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{ maxWidth: "400px", margin: "0 auto", padding: "20px", border: "1px solid #ddd", borderRadius: "8px", boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)" }}
    >
      <CardElement
        options={{
          style: {
            base: {
              fontSize: "16px",
              color: "#424770",
              letterSpacing: "0.025em",
              fontFamily: "Source Code Pro, monospace",
              "::placeholder": {
                color: "#aab7c4",
              },
            },
            invalid: {
              color: "#9e2146",
            },
          },
        }}
      />
      <button
        type="submit"
        disabled={!stripe || isProcessing}
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          fontSize: "16px",
          color: "#fff",
          backgroundColor: "#6772e5",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          transition: "background-color 0.3s ease",
        }}
      >
        {isProcessing ? "Processing..." : "Subscribe"}
      </button>
      {errorMessage && <div style={{ color: "red", marginTop: "15px" }}>{errorMessage}</div>}
    </form>
  );
};

export default PaymentForm;
