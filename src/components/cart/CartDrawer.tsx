"use client";
import { useCart } from "./CartProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function CartDrawer() {
  const { open, setOpen, lines, updateQty, remove, clear, total, count } = useCart();
  const router = useRouter();

  // Debug cart state
  console.log('Cart state:', { lines: lines.length, total, open, count });

  // Lock body scroll when cart is open
  useEffect(() => {
    if (open) {
      // Store the current scroll position
      const scrollY = window.scrollY;
      
      // Add CSS class to prevent scrolling
      document.body.classList.add('body-scroll-lock');
      document.body.style.top = `-${scrollY}px`;
      
      return () => {
        // Remove CSS class and restore scroll position when cart closes
        document.body.classList.remove('body-scroll-lock');
        document.body.style.top = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [open]);

  // Cleanup effect to ensure scroll lock is removed on unmount
  useEffect(() => {
    return () => {
      // Cleanup on unmount
      document.body.classList.remove('body-scroll-lock');
      document.body.style.top = '';
    };
  }, []);

  return (
    <>
      <button onClick={() => setOpen(true)} className="cart-button relative">
        <span className="flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h8M17 18a2 2 0 100 4 2 2 0 000-4zM9 18a2 2 0 100 4 2 2 0 000-4z" />
          </svg>
          {lines.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {lines.length}
            </span>
          )}
        </span>
      </button>
      
      {open && (
        <div className="cart-overlay">
          <div className="flex-1" onClick={() => setOpen(false)} />
          <div className="cart-drawer">
            <div className="cart-header">
              <h2 className="cart-title">Your Cart</h2>
              <button onClick={() => setOpen(false)} className="cart-close">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="flex-1 flex flex-col bg-white">
              {lines.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                  <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h8M17 18a2 2 0 100 4 2 2 0 000-4zM9 18a2 2 0 100 4 2 2 0 000-4z" />
                  </svg>
                  <div className="text-lg font-medium text-gray-500 mb-2">Your cart is empty</div>
                  <div className="text-sm text-gray-400">Add some items to get started</div>
                </div>
              ) : (
                <>
               
                  {/* Cart Items */}
                  <div className={`flex-1 overflow-y-auto cart-scrollable relative ${lines.length > 3 ? 'max-h-96' : ''}`}>
                    {lines.length > 3 && (
                      <>
                        <div className="text-center py-2 text-xs text-gray-500 bg-gray-50 border-b border-gray-100">
                          Scroll to see more items ({lines.length} total)
                        </div>
                        <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-white to-transparent pointer-events-none z-10"></div>
                      </>
                    )}
                    {lines.map(l => (
                      <div key={l.id} className="p-4 border-b border-gray-100">
                        <div className="flex gap-4">
                          <div className="w-16 h-16 rounded-md bg-gray-200 overflow-hidden flex-shrink-0">
                            {l.photo ? (
                              <img src={l.photo} alt={l.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900 text-sm mb-1">{l.name}</div>
                            <div className="flex items-center justify-between mb-2">
                              <div className="text-sm text-gray-600">
                                ₹{l.price.toLocaleString("en-IN")} × {l.qty}
                              </div>
                              <div className="font-medium text-gray-900">
                                ₹{(l.price * l.qty).toLocaleString("en-IN")}
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => updateQty(l.id, Math.max(1, l.qty - 1))}
                                className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-300"
                              >
                                -
                              </button>
                              <input
                                type="number"
                                min={1}
                                value={l.qty}
                                onChange={e => updateQty(l.id, Number(e.target.value || 1))}
                                className="w-12 text-center border border-gray-300 rounded px-1 py-1 text-sm"
                              />
                              <button
                                onClick={() => updateQty(l.id, l.qty + 1)}
                                className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-300"
                              >
                                +
                              </button>
                              <button 
                                onClick={() => remove(l.id)} 
                                className="text-red-600 hover:text-red-800 text-sm font-medium ml-2"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {lines.length > 3 && (
                      <>
                        <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-white to-transparent pointer-events-none z-10"></div>
                        <div className="text-center py-2 text-xs text-gray-500 bg-gray-50 border-t border-gray-100">
                          ↑ Scroll up to see all items
                        </div>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
            
            {lines.length > 0 && (
              <div className="cart-footer">
                <div className="cart-total">
                  <span>Total</span>
                  <span>₹{total.toLocaleString("en-IN")}</span>
                </div>
                <button 
                  onClick={() => {
                    setOpen(false); // Close cart drawer
                    router.push("/checkout");
                  }}
                  disabled={lines.length === 0} 
                  className="cart-checkout-btn"
                >
                  Proceed to Checkout
                </button>
                <button type="button" onClick={clear} className="cart-clear-btn">
                  Clear cart
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}