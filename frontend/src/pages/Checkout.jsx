import React, { useState, useContext, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { AuthContext } from "../context/AuthContext";
import { clearCart } from "../redux/cartSlice";

const Checkout = () => {
  const { user } = useContext(AuthContext);
  const cartItems = useSelector((state) => state.cart.cartItems);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);

  // Pre-fetched as soon as the page loads, NOT inside the click handler.
  // Razorpay's checkout window must open synchronously within the click
  // event to be trusted as a real user action - if there's an `await`
  // (e.g. fetching the order) between the click and rzp1.open(), browsers
  // often block it or render it as a blank popup instead of the real modal.
  const [razorpayOrder, setRazorpayOrder] = useState(null);
  const [demoModeOnly, setDemoModeOnly] = useState(false);

  const [address, setAddress] = useState({
    fullName: "",
    street: "",
    city: "",
    postalCode: "",
    country: "",
  });

  useEffect(() => {
    if (cartItems.length === 0) {
      toast("Your cart is empty", { icon: "🛒" });
      navigate("/shop");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalPrice = cartItems.reduce(
    (acc, item) => acc + item.price * item.qty,
    0,
  );

  useEffect(() => {
    if (totalPrice <= 0) return;

    const prepareOrder = async () => {
      try {
        const orderRes = await fetch("/api/payment/order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: totalPrice }),
        });
        const orderData = await orderRes.json();

        if (!orderRes.ok) {
          // Razorpay isn't configured on the backend - fall back to demo mode.
          setDemoModeOnly(true);
          return;
        }
        setRazorpayOrder(orderData);
      } catch (error) {
        console.error(error);
        setDemoModeOnly(true);
      }
    };

    prepareOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalPrice]);

  const saveOrder = async (paymentId) => {
    const saveOrderRes = await fetch("/api/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.token}`,
      },
      body: JSON.stringify({
        items: cartItems,
        totalAmount: totalPrice,
        address,
        paymentId,
      }),
    });
    const data = await saveOrderRes.json();
    if (saveOrderRes.ok) {
      dispatch(clearCart());
      navigate("/ordersuccess");
    } else {
      toast.error(data.message || "Order could not be saved");
    }
    return saveOrderRes.ok;
  };

  const runDemoPayment = async () => {
    // Used when Razorpay isn't configured on the backend, so the
    // checkout flow is still demonstrable end-to-end without live keys.
    setProcessing(true);
    try {
      await saveOrder("demo_txn_" + Date.now());
    } finally {
      setProcessing(false);
    }
  };

  const openRazorpayCheckout = () => {
    if (!window.Razorpay) {
      toast.error("Payment gateway failed to load. Please refresh and try again.");
      return;
    }

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      name: "ShopNest",
      description: "Order Payment",
      order_id: razorpayOrder.id,
      handler: async function (response) {
        try {
          const verifyRes = await fetch("/api/payment/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response),
          });
          if (verifyRes.ok) {
            await saveOrder(response.razorpay_payment_id);
          } else {
            toast.error("Payment verification failed");
          }
        } catch (error) {
          console.error(error);
          toast.error("Something went wrong while confirming your payment");
        } finally {
          setProcessing(false);
        }
      },
      modal: {
        ondismiss: () => setProcessing(false),
      },
      prefill: {
        name: address.fullName,
        email: user?.email,
        contact: "9999999999",
      },
      theme: {
        color: "#f97316",
      },
    };

    // This runs synchronously inside the click handler below - no `await`
    // in between - so the browser treats it as a direct, trusted user
    // action instead of blocking it as an unexpected popup.
    const rzp1 = new window.Razorpay(options);
    rzp1.open();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please login first");
      navigate("/login", { state: { from: "/checkout" } });
      return;
    }

    setProcessing(true);

    if (razorpayOrder) {
      openRazorpayCheckout();
      return;
    }

    if (demoModeOnly) {
      const useDemoMode = window.confirm(
        "Online payments aren't configured on this server yet.\n\nContinue with a demo order instead?",
      );
      if (useDemoMode) {
        runDemoPayment();
      } else {
        setProcessing(false);
      }
      return;
    }

    // Still waiting on the pre-fetch from page load - shouldn't normally
    // happen since it kicks off immediately, but guard against a slow network.
    toast.error("Still preparing your payment - please try again in a moment.");
    setProcessing(false);
  };

  if (cartItems.length === 0) return null;

  return (
    <div className="checkout-container">
      <h2>Checkout</h2>
      <div className="checkout-content">
        <form onSubmit={handleSubmit} className="shipping-form">
          <h3>Shipping Address</h3>
          <input
            type="text"
            placeholder="Full Name"
            required
            value={address.fullName}
            onChange={(e) =>
              setAddress({ ...address, fullName: e.target.value })
            }
          />
          <input
            type="text"
            placeholder="Street"
            required
            value={address.street}
            onChange={(e) => setAddress({ ...address, street: e.target.value })}
          />
          <input
            type="text"
            placeholder="City"
            required
            value={address.city}
            onChange={(e) => setAddress({ ...address, city: e.target.value })}
          />
          <input
            type="text"
            placeholder="Postal Code"
            required
            value={address.postalCode}
            onChange={(e) =>
              setAddress({ ...address, postalCode: e.target.value })
            }
          />
          <input
            type="text"
            placeholder="Country"
            required
            value={address.country}
            onChange={(e) =>
              setAddress({ ...address, country: e.target.value })
            }
          />
          <div className="checkout-summary">
            <h4>Total to Pay: ₹{totalPrice.toFixed(2)}</h4>
            <button type="submit" className="btn" disabled={processing}>
              {processing ? "Processing..." : "Pay Now"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;