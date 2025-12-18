import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import GovLogo from "../components/GovLogo";
import { useUser } from "../context/UserContext";
import { getPaymentToken } from "../utils/paymentToken";
import ReactPixel from "react-facebook-pixel";
import { hashUserData } from "../utils/pixel";
import moment from "moment";
import useUtmNavigator from "../hooks/useUtmNavigator";
import { usePixelTracking } from '../hooks/usePixelTracking';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
const phoneRegex = /^\(\d{2}\)\s\d{5}-\d{4}$/;

const CheckoutUpsell: React.FC = () => {
  usePixelTracking();
  
  const [loading, setLoading] = useState(false);
  const [includeOrderBump, setIncludeOrderBump] = useState(false);
  const navigate = useUtmNavigator();
  const location = useLocation();

  const basePrice = 47;
  const orderBumpPrice = 48.3;
  const totalPrice = Number((basePrice + (includeOrderBump ? orderBumpPrice : 0)).toFixed(2));

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [cpf, setCpf] = useState("");
  const [error, setError] = useState("");

  const { setTransactionData } = useUser();

  useEffect(() => {
    ReactPixel.init("617874301266607");

    ReactPixel.track("ViewContent", {
      event_name: "ViewContent",
      event_time: Math.floor(Date.now() / 1000),
      event_id: "ViewContent_" + Date.now(),
      action_source: "website",
      user_data: hashUserData({}),
      custom_data: {
        order_id: "",
        currency: "BRL",
        value: totalPrice,
        content_name: "",
        content_ids: "",
        contents: "",
        num_items: 1,
      },
    });
  }, []);

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
    if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`;
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    if (numbers.length <= 11) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedCPF = formatCPF(e.target.value);
    if (formattedCPF.length <= 14) {
      setCpf(formattedCPF);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedPhone = formatPhone(e.target.value);
    if (formattedPhone.length <= 15) {
      setPhone(formattedPhone);
    }
  };

  const validateFields = () => {
    if (!email || !phone || !name || !cpf) {
      setError("Preencha todos os campos para prosseguir");
      return false;
    }

    if (!emailRegex.test(email)) {
      setError("Email inválido");
      return false;
    }

    if (!cpfRegex.test(cpf)) {
      setError("CPF inválido");
      return false;
    }

    if (!phoneRegex.test(phone)) {
      setError("Telefone inválido");
      return false;
    }

    if (name.length < 3) {
      setError("Nome deve ter pelo menos 3 caracteres");
      return false;
    }

    return true;
  };

  const handleGeneratePix = async () => {
    setLoading(true);
    setError("");

    if (!validateFields()) {
      setLoading(false);
      return;
    }

    try {
      const paymentData = {
        customer: {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.replace(/\D/g, ""),
          document: {
            number: cpf.replace(/\D/g, ""),
            type: "cpf",
          },
        },
        items: [
          {
            tangible: false,
            quantity: 1,
            unitPrice: Math.round(totalPrice * 100), // Convert to cents and ensure integer
            title: includeOrderBump ? "Curso em Vídeo + Material de Estudo" : "Curso em Vídeo",
          },
        ],
        postbackUrl: "https://23e5f574-d7fe-465c-b8bb-26a183113031.mock.pstmn.io",
        amount: Math.round(totalPrice * 100), // Convert to cents and ensure integer
        paymentMethod: "pix",
      };

      console.log("Payment request data:", paymentData);

      const response = await fetch("https://api.novaera-pagamentos.com/api/v1/transactions", {
        method: "POST",
        body: JSON.stringify(paymentData),
        headers: {
          "Content-Type": "application/json",
          Authorization: getPaymentToken(),
        },
      });

      const body = await response.json();

      if (!response.ok) {
        console.error("Payment error:", body);
        throw new Error(body.message || "Erro ao processar o pagamento");
      }

      if (body.success === false) {
        console.error("Payment error:", body);
        throw new Error(body.message || "Erro ao gerar o pagamento");
      }

      setTransactionData({
        qrCode: body.data.pix.qrcode,
        transactionId: body.data.id,
      });

      const user = {
        name,
        email,
        cpf: cpf.replace(/\D/g, ""),
        phone,
      };

      ReactPixel.track("InitiateCheckout", {
        event_name: "InitiateCheckout",
        event_time: Math.floor(Date.now() / 1000),
        event_id: "InitiateCheckout_" + (body.data.id || Date.now()),
        user_data: hashUserData(user || {}),
        value: totalPrice,
        custom_data: {
          content_name: "Curso em Vídeo",
          content_ids: Date.now(),
          currency: "BRL",
          num_items: 1,
          user: user,
          order_id: body.data.id,
          contents: [
            {
              quantity: 1,
              item_price: totalPrice,
            },
          ],
        },
      });

      const ipResponse = await fetch("https://api.ipify.org?format=json");
      const ipData = await ipResponse.json();

      const query = new URLSearchParams(location.search);
    } catch (err) {
      console.error("Error generating PIX:", err);
      setError("Erro ao gerar o pagamento. Por favor, tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Component JSX implementation */}
    </div>
  );
};

export default CheckoutUpsell;