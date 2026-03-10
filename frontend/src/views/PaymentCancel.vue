<template>
  <section class="payment-result cancel">
    <div class="result-container">
      <img src="https://cdn-icons-png.flaticon.com/512/463/463612.png" alt="Cancel" class="result-icon" />
      <h1>Payment Not Completed</h1>
      <p>You can try again or choose a different payment method.</p>
      <router-link to="/checkout" class="return-button">Back to Checkout</router-link>
    </div>
  </section>
</template>

  
  <style scoped>
  .payment-result {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 70vh;
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  }
  
  .result-container {
    background: white;
    padding: 40px;
    border-radius: 20px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    text-align: center;
    max-width: 500px;
  }
  
  .result-icon {
    width: 100px;
    height: 100px;
    margin-bottom: 20px;
  }
  
  h1 {
    font-size: 2rem;
    color: #ef4444;
    margin-bottom: 10px;
  }
  
  p {
    color: #374151;
    font-size: 1.1rem;
    margin-bottom: 20px;
  }
  
  .return-button {
    display: inline-block;
    padding: 12px 24px;
    background: linear-gradient(135deg, #ef4444, #dc2626);
    color: white;
    font-weight: 600;
    border-radius: 12px;
    text-decoration: none;
    transition: all 0.3s ease;
  }
  
  .return-button:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 20px rgba(239, 68, 68, 0.3);
  }
  </style>
  