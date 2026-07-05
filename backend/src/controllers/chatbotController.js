const chatbotResponses = {
  eligibility: {
    keywords: ['eligible', 'can donate', 'who can donate', 'requirements', 'age', 'weight', 'qualify'],
    response: 'To be eligible to donate blood, you must: Be at least 18 years old (or 16-17 with parental consent), Weigh at least 50kg (110lbs), Be in good general health, Not have donated blood in the last 56 days (8 weeks), Have a hemoglobin level of at least 12.5 g/dL for women and 13.0 g/dL for men. Additional criteria may apply based on your medical history and recent activities.'
  },
  frequency: {
    keywords: ['how often', 'frequency', 'how many times', 'interval', 'between donations'],
    response: 'You can donate whole blood every 56 days (8 weeks). For platelets, you can donate every 7 days up to 24 times a year. For plasma, you can donate every 28 days up to 13 times a year. Always consult with healthcare professionals at the donation center for personalized advice.'
  },
  benefits: {
    keywords: ['benefits', 'advantages', 'why donate', 'good for', 'health benefits'],
    response: 'Blood donation benefits include: Free health screening before each donation, Reduced risk of heart disease by lowering iron levels, Burns calories (approximately 650 calories per donation), Mental satisfaction of saving lives, Regular check-ups of blood pressure, hemoglobin, and infectious diseases, Potential to detect health issues early'
  },
  preparation: {
    keywords: ['prepare', 'before donation', 'what to do', 'ready', 'eat', 'drink'],
    response: 'Before donating blood: Eat a healthy meal rich in iron (spinach, red meat, beans), Drink plenty of water (16 oz extra), Get a good night\'s sleep, Avoid fatty foods, Avoid alcohol for 24 hours before, Bring valid ID, Wear comfortable clothing with sleeves that can be rolled up'
  },
  after: {
    keywords: ['after donation', 'post donation', 'recovery', 'what to do after', 'side effects'],
    response: 'After donating blood: Rest for 10-15 minutes at the center, Drink extra fluids for 24-48 hours, Avoid heavy lifting or vigorous exercise for 24 hours, Eat iron-rich foods, Keep the bandage on for 4-6 hours, Avoid alcohol for 24 hours, Contact the center if you feel dizzy or unwell'
  },
  duration: {
    keywords: ['how long', 'time', 'duration', 'take', 'process'],
    response: 'The entire blood donation process takes about 1 hour: Registration (10-15 minutes), Health screening and mini-physical (10-15 minutes), Actual donation (10-15 minutes), Refreshment and recovery (10-15 minutes). The actual blood draw typically takes 8-10 minutes.'
  },
  types: {
    keywords: ['types', 'kind', 'whole blood', 'platelets', 'plasma', 'double red'],
    response: 'Types of blood donation: Whole Blood - Most common type, takes about 10 minutes. Platelets - Used for cancer patients, takes 1-2 hours. Plasma - Used for trauma patients, takes about 1 hour. Double Red Blood Cells - Two units of red cells, takes about 30 minutes. The center will recommend the best type based on your blood type and current needs.'
  },
  blood_groups: {
    keywords: ['blood group', 'blood type', 'a+', 'a-', 'b+', 'b-', 'ab+', 'ab-', 'o+', 'o-', 'universal'],
    response: 'There are 8 main blood types: A+, A-, B+, B-, AB+, AB-, O+, O-. O- is the universal donor (can give to anyone). AB+ is the universal recipient (can receive from anyone). Blood type compatibility is crucial for safe transfusions. Knowing your blood type helps match you with patients who need your specific type.'
  },
  diseases: {
    keywords: ['disease', 'hiv', 'aids', 'hepatitis', 'cancer', 'diabetes', 'infection', 'sick'],
    response: 'Certain conditions may temporarily or permanently defer you from donating: HIV/AIDS, Hepatitis B or C, Recent tattoos or piercings (within 3-12 months), Recent travel to certain countries, Pregnancy (deferred until 6 weeks after delivery), Recent surgery (depends on type and recovery), Certain medications. Each case is evaluated individually by medical professionals.'
  },
  medications: {
    keywords: ['medicine', 'drug', 'medication', 'antibiotic', 'aspirin'],
    response: 'Some medications may affect your eligibility: Antibiotics - Wait until you finish the course and are symptom-free for 7 days. Aspirin - May affect platelet donation. Blood thinners - Usually deferred. Accutane - Deferred for 1 month after last dose. Always inform the staff about any medications you\'re taking during screening.'
  },
  weight: {
    keywords: ['weight', 'kg', 'pounds', 'heavy', 'light'],
    response: 'The minimum weight requirement for blood donation is 50kg (110lbs). This is to ensure your body can safely handle the loss of blood volume. If you weigh less than this, you may not be eligible for whole blood donation but might qualify for other types of donations.'
  },
  age: {
    keywords: ['age', 'old', 'young', '18', '16', '17', 'senior'],
    response: 'The minimum age for blood donation is 18 years old. Some centers accept donors aged 16-17 with parental consent. There is no upper age limit for donation as long as you meet all health criteria. Many seniors continue to donate regularly well into their 70s and beyond.'
  },
  pain: {
    keywords: ['pain', 'hurt', 'painful', 'needle', 'scared', 'afraid'],
    response: 'Blood donation is generally not painful. You may feel a quick pinch when the needle is inserted, similar to a flu shot. Some people experience mild discomfort during the donation, but it should not be painful. The staff is trained to make you comfortable and can stop the process if you experience any significant discomfort.'
  },
  risks: {
    keywords: ['risk', 'danger', 'safe', 'complication', 'side effect'],
    response: 'Blood donation is very safe with minimal risks. Possible side effects include: Mild dizziness or lightheadedness, Bruising at the needle site, Fatigue for a few hours. Serious complications are extremely rare. All equipment is sterile and single-use. The process is monitored by trained healthcare professionals.'
  },
  iron: {
    keywords: ['iron', 'hemoglobin', 'anemia', 'low iron', 'deficiency'],
    response: 'Iron is crucial for blood donation. Your hemoglobin must be at least 12.5 g/dL for women and 13.0 g/dL for men. If your iron is low, you may be temporarily deferred. To increase iron: Eat iron-rich foods (red meat, spinach, beans), Take iron supplements if recommended, Avoid tea/coffee with meals (they inhibit iron absorption), Vitamin C helps iron absorption.'
  },
  emergency: {
    keywords: ['emergency', 'urgent', 'critical', 'immediate', 'help now'],
    response: 'For emergency blood needs: Call emergency services (112/911) immediately, Go to the nearest hospital emergency room, Contact LifeLink emergency hotline at our emergency number, Do not wait - every minute counts in critical situations. Our system can quickly match and alert nearby donors for urgent requests.'
  },
  appointment: {
    keywords: ['appointment', 'book', 'schedule', 'when', 'time'],
    response: 'To book a donation appointment: Log into your LifeLink dashboard, Click on "Schedule Donation", Choose your preferred date and time, Select the nearest donation center, Confirm your appointment. You can also walk in to most centers during operating hours, but appointments are recommended to reduce wait times.'
  },
  location: {
    keywords: ['location', 'where', 'center', 'near me', 'address'],
    response: 'LifeLink has donation centers in major cities across Pakistan. To find the nearest center: Use our "Find Centers" feature on the website, Enter your city or area in the search bar, View the map with all center locations, Check operating hours and contact information. You can also call our helpline for assistance.'
  },
  contact: {
    keywords: ['contact', 'phone', 'email', 'call', 'reach'],
    response: 'To contact LifeLink: Phone: Our helpline number available on the website, Email: support@lifelink.com, Live Chat: Available on our website 24/7, Social Media: Message us on Facebook/Twitter, Visit: Our nearest center for in-person assistance. Our team is ready to help with any questions or concerns.'
  },
  default: {
    keywords: [],
    response: 'I can help you with information about blood donation. Common topics include: eligibility requirements, donation frequency, health benefits, preparation tips, what to expect after donation, blood types, and more. Please ask your specific question, and I\'ll do my best to provide helpful information. For urgent medical needs, please contact emergency services immediately.'
  }
};

const detectLanguage = (message) => {
  const urduPattern = /[\u0600-\u06FF]/;
  if (urduPattern.test(message)) {
    return 'urdu';
  }
  const romanUrduWords = ['kya', 'hai', 'ho', 'kaise', 'kitna', 'kab', 'kahan', 'ka', 'ki', 'ke', 'main', 'tum', 'ap', 'plz', 'please', 'batao', 'sawal'];
  const lowerMessage = message.toLowerCase();
  if (romanUrduWords.some(word => lowerMessage.includes(word))) {
    return 'roman_urdu';
  }
  return 'english';
};

const findResponse = (message) => {
  const lowerMessage = message.toLowerCase();
  
  for (const [category, data] of Object.entries(chatbotResponses)) {
    if (category === 'default') continue;
    
    for (const keyword of data.keywords) {
      if (lowerMessage.includes(keyword)) {
        return data.response;
      }
    }
  }
  
  return chatbotControllers.default.response;
};

const chatbotResponse = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const language = detectLanguage(message);
    const response = findResponse(message);

    let finalResponse = response;

    if (language === 'urdu') {
      finalResponse = 'میں آپ کی مدد کر سکتا ہوں۔ براہ کرم انگریزی میں اپنا سوال پوچھیں یا رومن اردو استعمال کریں۔ ' + response;
    } else if (language === 'roman_urdu') {
      finalResponse = 'Main aapki madad kar sakta hoon. ' + response;
    }

    res.json({
      response: finalResponse,
      language_detected: language,
      category: 'blood_donation'
    });
  } catch (error) {
    console.error('Chatbot response error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  chatbotResponse
};
