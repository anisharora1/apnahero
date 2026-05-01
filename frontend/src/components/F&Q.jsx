import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const FAQSection = () => {
  const [openItem, setOpenItem] = useState(null);

  const faqData = [
    {
      id: 1,
      question: "How do I post an ad on the platform?",
      answer: "To post an ad, click the 'Sell Now' or 'Post Ad' button, choose your category, fill in the item details, upload photos, set your price, and publish. It's free to post in most categories. Your ad will be live within minutes after review."
    },
    {
      id: 2,
      question: "Is it safe to buy and sell on this platform?",
      answer: "Yes! We have safety measures including user verification, secure messaging, and safety tips. Always meet in public places, inspect items before purchase, and trust your instincts. Report any suspicious activity immediately."
    },
    {
      id: 3,
      question: "How do I contact a seller or buyer?",
      answer: "Use our secure in-app messaging system by clicking 'Chat' on any listing. You can also call the seller if they've provided a phone number. Never share personal details like bank information through messages."
    },
    {
      id: 4,
      question: "What payment methods are accepted?",
      answer: "Payment is typically handled directly between buyer and seller. Common methods include cash on delivery, bank transfer, digital wallets, or cash during meetup. We recommend cash payments for local deals and verified payment methods for shipped items."
    },
    {
      id: 6,
      question: "What should I do if I encounter fraud or scam?",
      answer: "Report suspicious users immediately using the 'get help' button. Common red flags include requests for advance payments, deals that seem too good to be true, or sellers avoiding face-to-face meetings. Our team reviews all reports promptly."
    },
    {
      id: 7,
      question: "How do I verify my account?",
      answer: "Account verification is done through phone number OTP and email confirmation."
    }
  ];

  const toggleItem = (id) => {
    setOpenItem(openItem === id ? null : id);
  };

  const handleGetHelp = () => {
    const message = "Hello, I have a question about the platform. Please help me.";
    const url = `https://wa.me/919117662441?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-8 md:px-12 pt-10 pb-6 border-b border-gray-100">
        <span className="text-xs font-semibold tracking-widest text-gray-400 uppercase">FAQ</span>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mt-2">
          Frequently Asked Questions
        </h2>
        <p className="text-gray-500 text-sm mt-1">Everything you need to know about the platform.</p>
      </div>

      {/* FAQ Items */}
      <div className="divide-y divide-gray-100">
        {faqData.map((item, index) => (
          <div
            key={item.id}
            className={`transition-colors duration-200 ${openItem === item.id ? 'bg-gray-50' : 'hover:bg-gray-50'}`}
          >
            <button
              onClick={() => toggleItem(item.id)}
              className="w-full px-8 md:px-12 py-5 text-left focus:outline-none"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <span className="text-xs font-bold text-gray-300 w-5 shrink-0">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <h3 className="text-sm md:text-base font-semibold text-gray-800 leading-snug">
                    {item.question}
                  </h3>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-300 ${openItem === item.id ? 'rotate-180' : ''}`}
                />
              </div>
            </button>

            {/* Answer */}
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
              openItem === item.id ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            }`}>
              <div className="px-8 md:px-12 pb-5 pl-[4.5rem]">
                <p className="text-gray-600 text-sm md:text-base leading-relaxed border-l-2 border-gray-900 pl-4">
                  {item.answer}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-8 md:px-12 py-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-gray-500 text-sm">Still have questions? We're here to help.</p>
        <button
          onClick={handleGetHelp}
          className="bg-gray-900 hover:bg-gray-700 text-white px-6 py-2.5 rounded-xl font-medium text-sm transition-colors duration-200 focus:outline-none"
        >
          Get Help on WhatsApp
        </button>
      </div>
    </div>
  );
};

export default FAQSection;