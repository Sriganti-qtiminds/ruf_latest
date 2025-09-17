

const razorPayKeys = `${import.meta.env.VITE_RAZOR_PAY_KEY}`;
const apiUrl = `${import.meta.env.VITE_API_URL}`;

export const handleProjectPayment = async (
  invId,
  payment,
  userData,
  setIsPaymentLoading,
  setPaymentShowModal,
  setIsPaymentSuccess
) => {
  if (!payment || !payment.id || payment.wkly_cost_amt <= (payment.amt_act ?? 0)) {
    console.error("Invalid payment data:", payment);
    alert("Invalid payment data or no payment required.");
    return;
  }

  setIsPaymentLoading(true);
  try {
    const amount = payment.wkly_cost_amt - (payment.amt_act ?? 0);
    console.log("Calling API:", `${apiUrl}/pay/project/create-order`, { T_amount: parseInt(amount), currency: "INR", Inv_Id: payment.id });
    const orderResponse = await fetch(`${apiUrl}/pay/project/create-order`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        T_amount: parseInt(amount),
        currency: "INR",
        Inv_Id: payment.id,
      }),
    });

    if (!orderResponse.ok) {
      const text = await orderResponse.text();
      console.error("API response:", text);
      throw new Error(`Failed to create order: ${orderResponse.status} ${orderResponse.statusText}`);
    }

    const orderData = await orderResponse.json();
    if (!orderData.success) throw new Error("Failed to create project order");

    const options = {
      key: razorPayKeys,
      amount: orderData.order.amount,
      currency: orderData.order.currency,
      name: userData.name || "Unknown Tenant",
      description: `Payment for Invoice ${payment.id}`,
      order_id: orderData.order.id,
      handler: async (response) => {
        try {
          const verifyResponse = await fetch(`${apiUrl}/project/verify-payment`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: orderData.order.id,
              Inv_Id: payment.id,
              user_id: userData.id || null,
              project_id: payment.proj_id || null,
            }),
          });

          if (!verifyResponse.ok) {
            const text = await verifyResponse.text();
            console.error("Verify payment response:", text);
            throw new Error(`Payment verification failed: ${verifyResponse.status} ${verifyResponse.statusText}`);
          }

          const verifyData = await verifyResponse.json();
          if (verifyData.success) {
            setIsPaymentSuccess(true);
            setPaymentShowModal(true);
          } else {
            throw new Error(verifyData.message || "Payment verification failed");
          }
        } catch (error) {
          console.error("Payment verification error:", error);
          alert(`Payment verification failed: ${error.message}`);
          setIsPaymentSuccess(false);
          setPaymentShowModal(true);
        }
      },
      prefill: {
        name: userData.name || "Unknown Tenant",
        email: userData.email || "unknown@example.com",
        contact: userData.mobile || "0000000000",
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
