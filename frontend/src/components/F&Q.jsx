import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

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
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 px-4 sm:px-8 py-8 sm:py-10 text-white">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-2 sm:mb-3">Frequently Asked Questions</h2>
        </div>

        {/* FAQ Items */}
        <div className="divide-y divide-gray-200">
          {faqData.map((item) => (
            <div key={item.id} className="transition-all duration-200 hover:bg-gray-50">
              <button
                onClick={() => toggleItem(item.id)}
                className="w-full px-4 sm:px-8 py-4 sm:py-6 text-left focus:outline-none transition-all duration-200 active:bg-gray-300"
              >
                <div className="flex items-start justify-between">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 pr-4 sm:pr-8 leading-relaxed">
                    {item.question}
                  </h3>
                  <div className="flex-shrink-0 ml-2 sm:ml-4 mt-1">
                    {openItem === item.id ? (
                      <ChevronUp className="w-5 h-5 text-green-600 transition-transform duration-200" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400 transition-transform duration-200" />
                    )}
                  </div>
                </div>
              </button>
              
              {/* Answer with smooth animation */}
              <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                openItem === item.id ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
              }`}>
                <div className="px-4 sm:px-8 pb-4 sm:pb-6">
                  <div className="bg-gray-50 rounded-lg p-3 sm:p-4 border-l-3 border-gray-700">
                    <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                      {item.answer}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-4 sm:px-8 py-5 sm:py-6 text-center border-t border-gray-200">
          <p className="text-gray-600 mb-3 text-sm sm:text-base">Still have questions?</p>
          <button onClick={handleGetHelp} className="bg-green-600 hover:bg-green-700 active:bg-green-800 text-white px-6 py-2.5 sm:py-2 rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-green-500 focus:ring-opacity-20 text-sm sm:text-base min-h-[44px] sm:min-h-auto">
            Get Help
          </button>
        </div>
      </div>
    </div>
  );
};

export default FAQSection;