import React from "react";
import { useCart } from "../pages/cart.js";
import { useNavigate } from "react-router-dom";
import "./pages.css";

const ViewCart = () => {
  const { cart, totalPrice, removeFromCart, addToCart } = useCart();
  const navigate = useNavigate();
  console.log("Cart contents:", cart);

  const updateQty = (item, newQty) => {
    const qty = Number(newQty);
    if (qty <= 0) {
      removeFromCart(item.id);
    } else {
      const diff = qty - item.qty;
      if (diff !== 0) {
        addToCart(item, diff);
      }
    }
  };

  return (
    <div className="main">
      <div className="container">
        <div className="row margin-bottom-40">
          <div className="col-md-12 col-sm-12">
            <h1>Shopping Cart</h1>

            {cart.length > 0 ? (
              <div className="goods-page">
                <div className="goods-data clearfix">
                  <div className="table-wrapper-responsive">
                    <table>
                      <thead>
                        <tr>
                          <th>Image</th>
                          <th>Description</th>
                          <th>Quantity</th>
                          <th>Unit Price</th>
                          <th>Total</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {cart.map((item) => (
                          <tr key={item.id}>
                            <td>
                              <img
                                src={item.image}
                                alt={String(item.product_name)}
                                width="60"
                              />
                            </td>
                            <td>{String(item.product_name)}</td>
                            <td>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "5px",
                                }}
                              >
                                <button
                                  className="btn btn-sm btn-secondary"
                                  onClick={() => updateQty(item, item.qty - 1)}
                                >
                                  −
                                </button>
                                <span
                                  style={{
                                    minWidth: "30px",
                                    textAlign: "center",
                                  }}
                                >
                                  {item.qty}
                                </span>
                                <button
                                  className="btn btn-sm btn-secondary"
                                  onClick={() => updateQty(item, item.qty + 1)}
                                >
                                  +
                                </button>
                              </div>
                            </td>
                            <td>₱{Number(item.price).toFixed(2)}</td>
                            <td>
                              ₱{(Number(item.price) * item.qty).toFixed(2)}
                            </td>
                            <td>
                              <button
                                onClick={() => removeFromCart(item.id)}
                                className="btn btn-danger btn-sm"
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="shopping-total">
                    <ul>
                      <li className="shopping-total-price">
                        <em>Total</em>
                        <strong className="price">
                          ₱{totalPrice.toFixed(2)}
                        </strong>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="cart-actions">
                  <button
                    className="btn btn-primary"
                    onClick={() => navigate("/pos/detail")}
                  >
                    Continue Shopping
                  </button>

                  <button
                    className="btn btn-info"
                    onClick={() => navigate("/pos/detail/checkout")}
                  >
                    Checkout
                  </button>
                </div>
              </div>
            ) : (
              <p>Your cart is empty.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewCart;
