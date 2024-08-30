import { gql } from "@apollo/client";

export const GET_PRICES = gql`
  query {
    getStripePrices {
      id
      amount
      currency
      product {
        id
        name
        description
      }
    }
  }
`;

export const CREATE_CUSTOMER = gql`
  mutation createStripeCustomer($email: String!) {
    createStripeCustomer(createCustomerInput: { email: $email }) {
      id
    }
  }
`;

export const ATTACH_PAYMENT_METHOD = gql`
  mutation attachStripePaymentMethod($customerId: String!, $paymentMethodId: String!) {
    attachStripePaymentMethod(attachPaymentMethodInput: { customerId: $customerId, paymentMethodId: $paymentMethodId }) {
      success
    }
  }
`;

export const CREATE_SUBSCRIPTION = gql`
  mutation createStripeSubscription($customerId: String!, $priceId: String!) {
    createStripeSubscription(createSubscriptionInput: { customerId: $customerId, priceId: $priceId }) {
      id
    }
  }
`;
