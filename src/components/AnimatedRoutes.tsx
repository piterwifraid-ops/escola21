import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import Main from '../pages/Main';
import Inscription from '../pages/Inscription';
import ProgramDetails from '../pages/ProgramDetails';
import Checkout from '../pages/Checkout';
import CheckoutUpsell from '../pages/CheckoutUpsell';
import PixPayment from '../pages/PixPayment';
import PixPaymentUpsell from '../pages/PixPaymentUpsell';
import SuccessPage from '../pages/SuccessPage';
import Upsell1 from '../pages/Upsell1';
import Upsell2 from '../pages/Upsell2';
import Upsell3 from '../pages/Upsell3';
import Upsell4 from '../pages/Upsell4';
import BehavioralQuiz from '../pages/BehavioralQuiz';

export default function AnimatedRoutes() {
  const location = useLocation();

  return (
    <motion.div
      key={location.pathname}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      className="flex-1"
    >
      <Routes location={location}>
        <Route path="/" element={<Main />} />
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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </motion.div>
  );
}

