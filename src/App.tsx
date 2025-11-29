import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Main from './components/Main';
import Footer from './components/Footer';
import Inscription from './pages/Inscription';
import ProgramDetails from './pages/ProgramDetails';
import Checkout from './pages/Checkout';
import PixPayment from './pages/PixPayment';
import PixPaymentUpsell from './pages/PixPaymentUpsell';
import SuccessPage from './pages/SuccessPage';
import Upsell1 from './pages/Upsell1';
import Upsell2 from './pages/Upsell2';
import Upsell3 from './pages/Upsell3';
import Upsell4 from './pages/Upsell4';
import BehavioralQuiz from './pages/BehavioralQuiz';
import CheckoutUpsell from './pages/CheckoutUpsell';
import Login from './components/Login';
import { LocationProvider } from './context/LocationContext';
import { UserProvider } from './context/UserContext';

function ScrollToTop() {
  const location = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return null;
}

function App() {
  return (
    <UserProvider>
      <LocationProvider>
        <Router>
          <ScrollToTop />
          <div className="min-h-screen bg-[#F9FAFB] flex flex-col">
            <Routes>
              {/* Rota do Login - sem Header e Footer */}
              <Route path="/login" element={<Login />} />
              
              {/* Rotas principais - com Header e Footer */}
              <Route path="/*" element={
                <>
                  <Header />
                  <Routes>
                    <Route path="/" element={
                      <>
                       
                        <Main />
                      </>
                    } />
                    <Route path="/inscricao" element={<Inscription />} />
                    <Route path="/programa" element={<ProgramDetails />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/checkout-upsell" element={<CheckoutUpsell />} />
                    <Route path="/pix-payment" element={<PixPayment />} />
                    <Route path="/pix-payment-upsell" element={<PixPaymentUpsell />} />
                    <Route path="/sucesso" element={<SuccessPage />} />
                    <Route path="/upsell1" element={<Upsell1 />} />
                    <Route path="/upsell2" element={<Upsell2 />} />
                    <Route path="/upsell3" element={<Upsell3 />} />
                    <Route path="/upsell4" element={<Upsell4 />} />
                    <Route path="/quiz" element={<BehavioralQuiz />} />
                  </Routes>
                  <Footer />
                </>
              } />
            </Routes>
          </div>
        </Router>
      </LocationProvider>
    </UserProvider>
  );
}

export default App;