/**
 * End-to-End User Journey Tests
 * Tests complete user flows without page reloads
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/dom';
import { renderWithRouter, verifyNoPageReload, verifyAnalyticsData, createMockNavigationMonitor } from '../utils/navigation-test-utils';
import { Routes, Route, Link } from 'react-router-dom';
import React from 'react';

// Mock components for testing
const MockHeader = () => (
  <header>
    <nav>
      <Link to="/" data-testid="home-link">Home</Link>
      <Link to="/product" data-testid="products-link">Products</Link>
      <Link to="/cart" data-testid="cart-link">Cart</Link>
      <Link to="/account" data-testid="account-link">Account</Link>
    </nav>
  </header>
);

const MockProductCard = ({ id }: { id: string }) => (
  <div data-testid={`product-${id}`}>
    <h3>Product {id}</h3>
    <Link to={`/product/${id}`} data-testid={`product-${id}-link`}>
      View Details
    </Link>
    <button data-testid={`add-to-cart-${id}`}>Add to Cart</button>
  </div>
);

const MockPages = {
  Home: () => (
    <div>
      <h1>Home Page</h1>
      <MockHeader />
      <div data-testid="hero-section">
        <Link to="/product" data-testid="shop-now">Shop Now</Link>
      </div>
    </div>
  ),
  
  Products: () => (
    <div>
      <h1>Products</h1>
      <MockHeader />
      <div data-testid="products-grid">
        <MockProductCard id="1" />
        <MockProductCard id="2" />
        <MockProductCard id="3" />
      </div>
    </div>
  ),
  
  ProductDetail: ({ productId }: { productId: string }) => (
    <div>
      <h1>Product {productId}</h1>
      <MockHeader />
      <button data-testid="add-to-cart-detail">Add to Cart</button>
      <Link to="/cart" data-testid="go-to-cart">View Cart</Link>
      <Link to="/product" data-testid="back-to-products">Back to Products</Link>
    </div>
  ),
  
  Cart: () => (
    <div>
      <h1>Shopping Cart</h1>
      <MockHeader />
      <div data-testid="cart-items">
        <div>Product 1 - $50</div>
        <div>Product 2 - $75</div>
      </div>
      <Link to="/checkout" data-testid="proceed-checkout">Proceed to Checkout</Link>
    </div>
  ),
  
  Checkout: () => (
    <div>
      <h1>Checkout</h1>
      <form data-testid="checkout-form">
        <input placeholder="Email" data-testid="email-input" />
        <input placeholder="Address" data-testid="address-input" />
        <button type="submit" data-testid="place-order">Place Order</button>
      </form>
      <Link to="/cart" data-testid="back-to-cart">Back to Cart</Link>
    </div>
  ),
  
  Account: () => (
    <div>
      <h1>My Account</h1>
      <MockHeader />
      <Link to="/orders" data-testid="view-orders">Order History</Link>
      <Link to="/login" data-testid="login-link">Login</Link>
    </div>
  ),
  
  Login: () => (
    <div>
      <h1>Login</h1>
      <form data-testid="login-form">
        <input placeholder="Email" data-testid="login-email" />
        <input placeholder="Password" data-testid="login-password" />
        <button type="submit" data-testid="login-submit">Login</button>
      </form>
      <Link to="/account" data-testid="back-to-account">Back to Account</Link>
    </div>
  )
};

describe('End-to-End User Journeys', () => {
  let reloadVerifier: ReturnType<typeof verifyNoPageReload>;
  let mockMonitor: ReturnType<typeof createMockNavigationMonitor>;

  beforeEach(() => {
    reloadVerifier = verifyNoPageReload();
    mockMonitor = createMockNavigationMonitor();
    vi.clearAllMocks();
  });

  describe('Shopping Flow Journey', () => {
    it('should complete full shopping journey without page reloads', async () => {
      const App = () => (
        <Routes>
          <Route path="/" element={<MockPages.Home />} />
          <Route path="/product" element={<MockPages.Products />} />
          <Route path="/product/:id" element={<MockPages.ProductDetail productId="1" />} />
          <Route path="/cart" element={<MockPages.Cart />} />
          <Route path="/checkout" element={<MockPages.Checkout />} />
        </Routes>
      );

      const { user } = renderWithRouter(<App />);

      // Start at home page
      expect(screen.getByText('Home Page')).toBeInTheDocument();
      
      // Navigate to products
      await user.click(screen.getByTestId('shop-now'));
      await waitFor(() => {
        expect(screen.getByText('Products')).toBeInTheDocument();
      });
      reloadVerifier.assert();

      // View product details
      await user.click(screen.getByTestId('product-1-link'));
      await waitFor(() => {
        expect(screen.getByText('Product 1')).toBeInTheDocument();
      });
      reloadVerifier.assert();

      // Add to cart and go to cart
      await user.click(screen.getByTestId('add-to-cart-detail'));
      await user.click(screen.getByTestId('go-to-cart'));
      await waitFor(() => {
        expect(screen.getByText('Shopping Cart')).toBeInTheDocument();
      });
      reloadVerifier.assert();

      // Proceed to checkout
      await user.click(screen.getByTestId('proceed-checkout'));
      await waitFor(() => {
        expect(screen.getByText('Checkout')).toBeInTheDocument();
      });
      reloadVerifier.assert();

      // Fill checkout form
      await user.type(screen.getByTestId('email-input'), 'user@example.com');
      await user.type(screen.getByTestId('address-input'), '123 Main St');
      
      // Complete order (would normally submit)
      await user.click(screen.getByTestId('place-order'));
      
      // Verify no page reloads occurred throughout entire journey
      reloadVerifier.assert();
    });
  });

  describe('Authentication Flow Journey', () => {
    it('should handle login/logout flow without page reloads', async () => {
      const App = () => (
        <Routes>
          <Route path="/" element={<MockPages.Home />} />
          <Route path="/account" element={<MockPages.Account />} />
          <Route path="/login" element={<MockPages.Login />} />
        </Routes>
      );

      const { user } = renderWithRouter(<App />);

      // Navigate to account
      await user.click(screen.getByTestId('account-link'));
      await waitFor(() => {
        expect(screen.getByText('My Account')).toBeInTheDocument();
      });
      reloadVerifier.assert();

      // Go to login
      await user.click(screen.getByTestId('login-link'));
      await waitFor(() => {
        expect(screen.getByText('Login')).toBeInTheDocument();
      });
      reloadVerifier.assert();

      // Fill login form
      await user.type(screen.getByTestId('login-email'), 'user@example.com');
      await user.type(screen.getByTestId('login-password'), 'password123');
      
      // Submit login
      await user.click(screen.getByTestId('login-submit'));
      
      // Navigate back to account
      await user.click(screen.getByTestId('back-to-account'));
      await waitFor(() => {
        expect(screen.getByText('My Account')).toBeInTheDocument();
      });
      
      reloadVerifier.assert();
    });
  });

  describe('Browse and Compare Journey', () => {
    it('should handle product browsing and comparison without page reloads', async () => {
      const App = () => (
        <Routes>
          <Route path="/" element={<MockPages.Home />} />
          <Route path="/product" element={<MockPages.Products />} />
          <Route path="/product/1" element={<MockPages.ProductDetail productId="1" />} />
          <Route path="/product/2" element={<MockPages.ProductDetail productId="2" />} />
          <Route path="/product/3" element={<MockPages.ProductDetail productId="3" />} />
        </Routes>
      );

      const { user } = renderWithRouter(<App />);

      // Navigate to products
      await user.click(screen.getByTestId('products-link'));
      await waitFor(() => {
        expect(screen.getByText('Products')).toBeInTheDocument();
      });
      reloadVerifier.assert();

      // View multiple products for comparison
      for (const productId of ['1', '2', '3']) {
        await user.click(screen.getByTestId(`product-${productId}-link`));
        await waitFor(() => {
          expect(screen.getByText(`Product ${productId}`)).toBeInTheDocument();
        });
        reloadVerifier.assert();

        // Go back to products list
        await user.click(screen.getByTestId('back-to-products'));
        await waitFor(() => {
          expect(screen.getByText('Products')).toBeInTheDocument();
        });
        reloadVerifier.assert();
      }
    });
  });

  describe('Error Recovery Journey', () => {
    it('should recover from navigation errors in user journey', async () => {
      const App = () => {
        const [hasError, setHasError] = React.useState(false);
        
        return (
          <Routes>
            <Route path="/" element={<MockPages.Home />} />
            <Route path="/product" element={<MockPages.Products />} />
            <Route path="/error-prone" element={
              hasError ? 
                <div>Error occurred</div> : 
                <div>
                  <h1>Error Prone Page</h1>
                  <button 
                    onClick={() => setHasError(true)}
                    data-testid="trigger-error"
                  >
                    Trigger Error
                  </button>
                  <Link to="/" data-testid="home-fallback">Go Home</Link>
                </div>
            } />
          </Routes>
        );
      };

      const { user } = renderWithRouter(<App />, {
        initialEntries: ['/error-prone']
      });

      // Trigger an error
      await user.click(screen.getByTestId('trigger-error'));
      await waitFor(() => {
        expect(screen.getByText('Error occurred')).toBeInTheDocument();
      });

      // Recover by navigating home
      await user.click(screen.getByTestId('home-fallback'));
      await waitFor(() => {
        expect(screen.getByText('Home Page')).toBeInTheDocument();
      });

      // Continue normal journey
      await user.click(screen.getByTestId('products-link'));
      await waitFor(() => {
        expect(screen.getByText('Products')).toBeInTheDocument();
      });

      reloadVerifier.assert();
    });
  });

  describe('Deep Linking Journey', () => {
    it('should handle deep links and navigation without page reloads', async () => {
      const App = () => (
        <Routes>
          <Route path="/" element={<MockPages.Home />} />
          <Route path="/product" element={<MockPages.Products />} />
          <Route path="/product/:id" element={<MockPages.ProductDetail productId="123" />} />
          <Route path="/cart" element={<MockPages.Cart />} />
        </Routes>
      );

      // Start with deep link
      const { user } = renderWithRouter(<App />, {
        initialEntries: ['/product/123']
      });

      // Should load directly into product detail
      expect(screen.getByText('Product 123')).toBeInTheDocument();
      
      // Navigate to cart
      await user.click(screen.getByTestId('go-to-cart'));
      await waitFor(() => {
        expect(screen.getByText('Shopping Cart')).toBeInTheDocument();
      });
      reloadVerifier.assert();

      // Navigate back to products
      await user.click(screen.getByTestId('products-link'));
      await waitFor(() => {
        expect(screen.getByText('Products')).toBeInTheDocument();
      });
      reloadVerifier.assert();

      // Navigate home
      await user.click(screen.getByTestId('home-link'));
      await waitFor(() => {
        expect(screen.getByText('Home Page')).toBeInTheDocument();
      });
      
      reloadVerifier.assert();
    });
  });

  describe('Back Button Journey', () => {
    it('should handle browser back button throughout user journey', async () => {
      const App = () => (
        <Routes>
          <Route path="/" element={<MockPages.Home />} />
          <Route path="/product" element={<MockPages.Products />} />
          <Route path="/product/1" element={<MockPages.ProductDetail productId="1" />} />
          <Route path="/cart" element={<MockPages.Cart />} />
        </Routes>
      );

      const { user } = renderWithRouter(<App />, {
        initialEntries: ['/']
      });

      // Build up navigation history
      await user.click(screen.getByTestId('products-link'));
      await user.click(screen.getByTestId('product-1-link'));
      await user.click(screen.getByTestId('go-to-cart'));

      // Should be in cart
      expect(screen.getByText('Shopping Cart')).toBeInTheDocument();

      // Use browser back button navigation
      window.history.back();
      await waitFor(() => {
        expect(screen.getByText('Product 1')).toBeInTheDocument();
      });
      reloadVerifier.assert();

      window.history.back();
      await waitFor(() => {
        expect(screen.getByText('Products')).toBeInTheDocument();
      });
      reloadVerifier.assert();

      window.history.back();
      await waitFor(() => {
        expect(screen.getByText('Home Page')).toBeInTheDocument();
      });
      reloadVerifier.assert();
    });
  });
});