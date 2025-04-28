// paymentUtils.js
const razorPayKeys = `${import.meta.env.VITE_RAZOR_PAY_KEY}`;
const apiUrl = `${import.meta.env.VITE_API_URL}`;

export const handlePayment = async (
  propertyId,
  invoice,
  setIsPaymentLoading,
  setPaymentShowModal,
  setIsPaymentSuccess
) => {
  if (!invoice || invoice.property_id !== propertyId) return;

  setIsPaymentLoading(true);
  try {
    const orderResponse = await fetch(`${apiUrl}/create-order`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        T_amount: parseInt(invoice.Inv_Total),
        currency: "INR",
        Inv_Id: invoice.Inv_Id,
      }),
    });

    const orderData = await orderResponse.json();
    if (!orderData.success) throw new Error("Failed to create order");

    const options = {
      key: razorPayKeys,
      amount: orderData.order.amount,
      currency: orderData.order.currency,
      name: invoice.tenant_name,
      description: invoice.Inv_Id,
      order_id: orderData.order.id,
      handler: async (response) => {
        try {
          const verifyResponse = await fetch(`${apiUrl}/verify-payment`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: orderData.order.id,
              Inv_Id: invoice.Inv_Id,
              user_id: invoice.tenant_id,
              prop_id: invoice.property_id,
            }),
          });
          const verifyData = await verifyResponse.json();
          if (verifyData.success) {
            setIsPaymentSuccess(true);
            setPaymentShowModal(true);
          } else {
            throw new Error(
              verifyData.message || "Payment verification failed"
            );
          }
        } catch (error) {
          console.error("Payment verification error:", error);
          alert(`Payment verification failed: ${error.message}`);
          setIsPaymentSuccess(false);
          setPaymentShowModal(true);
        }
      },
      prefill: {
        name: invoice.tenant_name,
        email: invoice.tenant_email,
        contact: invoice.tenant_mobile,
      },
      theme: { color: "#001433" },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  } catch (error) {
    console.error("Payment error:", error);
    alert(`Payment failed: ${error.message}`);
    setIsPaymentSuccess(false);
    setPaymentShowModal(true);
  } finally {
    setIsPaymentLoading(false);
  }
};
