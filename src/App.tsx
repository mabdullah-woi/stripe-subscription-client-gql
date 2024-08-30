import { useMutation, useQuery } from "@apollo/client";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useEffect, useState } from "react";
import PaymentForm from "./PaymentForm";
import { CREATE_CUSTOMER, GET_PRICES } from "./graphql/queries.ts";

const stripePromise = loadStripe("STRIPE_PUBLISHABLE_KEY");

const App: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [customerId, setCustomerId] = useState<string>("");
  const [prices, setPrices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { refetch: refetchPrices } = useQuery(GET_PRICES, {
    onCompleted: (data) => {
      setPrices(data.getStripePrices);
    },
    onError: (error) => {
      console.error("Failed to fetch prices:", error);
    },
  });

  const [createCustomer] = useMutation(CREATE_CUSTOMER);

  const handleCustomerCreation = async () => {
    if (!email) {
      alert("Please enter a valid email.");
      return;
    }

    setIsLoading(true);

    try {
      const { data } = await createCustomer({ variables: { email } });
      setCustomerId(data.createStripeCustomer.id);
    } catch (error) {
      console.error("Failed to create or get customer:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Fetch prices when component mounts
    refetchPrices();
  }, [refetchPrices]);

  return (
    <Elements stripe={stripePromise}>
      <div>
        <h1>Subscription Service</h1>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" />
        <button onClick={handleCustomerCreation} disabled={isLoading}>
          {isLoading ? "Creating Customer..." : "Create Customer"}
        </button>
        {customerId && prices.length > 0 && <PaymentForm customerId={customerId} priceId={prices[0].id} />}
      </div>
    </Elements>
  );
};

export default App;
