// HealthNova Master Domain Shell & Multi-Tier Disaster Mobile Platform (Fusion 2026)
// Incorporates:
// 1. Role / Portal Selection Cards styled strictly like VetNova baseline (Image 1):
//    - Top "Allow location" pill
//    - Vertical cards for Citizen, Emergency Doctor, Government Officer, 108 Ambulance, Disaster Pharmacy
// 2. Strict Role Isolation: User/Citizen only sees Citizen screen, without other portals cluttering
// 3. Paired Service Cards in User screen styled strictly like VetNova baseline (Image 2):
//    - "Live Disaster News" (Live Alerts badge) & "Find Emergency Doctor" (Video / Call badge)
// 4. Attractive & Realistic High-Tech 3D Anatomical Body (Medical gradient shading, ribcage, muscle contours, pulsating radar nodes)
// 5. Dynamic Doctor Registration & Directory (persisted across sessions via localStorage, non-static)
// 6. Real-Time Video Calling via Jitsi Meet with Doctor Incoming Call Alert & Accept/Decline trigger
// 7. Strict 10-Digit Mobile Number Validation (sanitized and validated for [6-9]\d{9})
// 8. Live Disaster News with Full Article & Specific Government Actions Taken Modal
// 9. Calamity First Aid (Verified St John Ambulance Videos & 3D Guide) & Clinical Diagnosis
// 10. Emergency IVR Numbers: NDMA 1078, ERSS 112, Relief 1070, DDMA 1077
// 11. Multilingual Support (EN, HI, MR) & 100% Phase 1-4 Offline Dijkstra Routing & Outbox

(function () {
  const { useState, useEffect, useRef } = window.React || {};

  // --- MULTILINGUAL TRANSLATION DICTIONARY (EN, HI, MR) ---
  const I18N = {
    en: {
      portalTitle: "Healthcare & Disaster Response Gateway",
      portalSubtitle: "Select the operational mobile platform for Fusion 2026",
      vetnovaTitle: "VetNova Platform",
      vetnovaDesc: "Comprehensive Animal Health, SIH National Surveillance & AI Livestock Diagnostics",
      vetnovaBtn: "Launch VetNova 🐾",
      healthnovaTitle: "HealthNova Platform",
      healthnovaDesc: "Emergency Disaster Intelligence, Calamity Triage & 5-Tier Medical Mobile Suite",
      healthnovaBtn: "Launch HealthNova 🛡️",
      switchPortal: "Switch Platform",
      switchRole: "Switch Role ⇋",
      splashTagline: "Emergency Medical & Disaster Response Intelligence",
      splashLoading: "Initializing offline clinical engines & calamity protocols…",
      splashReady: "Ready for Mobile Field Operations",
      allowLocationPill: "Allow location",
      roleCitizenTitle: "I am a User",
      roleCitizenSub: "Farmer or pet owner • Disaster Triage & First Aid",
      roleDoctorTitle: "I am a Doctor",
      roleDoctorSub: "Registered emergency medical practitioner",
      roleGovTitle: "Govt Disaster & Surveillance Officer",
      roleGovBadge: "DAHD / SEOC Portal",
      roleGovSub: "State/District outbreak radar, GIS map, lab referrals & alerts",
      roleAmbTitle: "I am a Delivery / 108 Ambulance Partner",
      roleAmbBadge: "Live transit route",
      roleAmbSub: "Deliver medical triage, dynamic evacuation & live GPS route",
      roleMedTitle: "Disaster E-Pharmacy & Medical Stores",
      roleMedSub: "Find nearby stockpiles & order essential calamity kits",
      roleAeroTitle: "AeroRelief — Air-Supply Coordination",
      roleAeroBadge: "Decision-Support",
      roleAeroSub: "Logistics decision-support for possible emergency air delivery when ground access is disrupted",
      loginTitle: "Citizen Emergency Login",
      loginSubtitle: "Enter your 10-digit mobile number for emergency SOS alerts & tele-consultations",
      fullNameLabel: "Full Name",
      phoneLabel: "Mobile Number (Strictly 10 Digits)",
      cityLabel: "City / District",
      loginBtn: "Verify & Enter HealthNova 🛡️",
      logoutBtn: "Switch User",
      newsCardTitle: "Live Disaster News",
      newsCardBadge: "Live Alerts",
      newsCardSub: "Read official advisories & government containment actions",
      findDocCardTitle: "Find Emergency Doctor",
      findDocCardBadge: "Video / Call",
      findDocCardSub: "Consult verified on-duty disaster physicians",
      newsSectionTitle: "Live Disaster News & Government Actions",
      readArticleBtn: "Read Full Article & Actions →",
      govActionsHeading: "Government Actions & Field Containment Taken",
      ivrSectionTitle: "Emergency Disaster IVR Helplines (Toll-Free 24x7)",
      ndmaLabel: "National Disaster Management (NDMA)",
      erssLabel: "All-India Emergency Response (ERSS)",
      reliefCommLabel: "Relief Commissioner (Natural Calamities)",
      ddmaLabel: "District Disaster Management (DDMA)",
      callAction: "Call Now",
      liveGpsGranted: "Live GPS Active (Accurate Triage)",
      liveGpsPrompt: "Accurate Calamity Analysis Requires Live Location",
      allowGpsBtn: "Allow Live Location 📍",
      calamityTitle: "Emergency Calamity Hub",
      calamitySubtitle: "Select an active disaster to view first aid or generate a clinical diagnosis",
      flood: "Floods & Submersion",
      cyclone: "Cyclones & High Winds",
      heatwave: "Severe Heatwaves",
      other: "Earthquakes / Industrial / Other",
      firstAidBtn: "🩹 First Aid Protocols",
      diagnosisBtn: "🩺 Clinical Diagnosis",
      firstAidHeading: "Emergency First Aid Guide",
      ytVideoHeading: "Demonstration Video Guide (First Aid)",
      ytWatchDirect: "Watch on YouTube (Official Video)",
      interactive3dHeading: "Interactive 3D Anatomical Guide",
      symptomSelectHeading: "Select Patient Symptoms",
      voiceInputPlaceholder: "Speak or type additional symptoms…",
      voiceListening: "🎙️ Listening to voice input…",
      voiceBtn: "Voice Input",
      injuryQuestion: "Is the patient physically injured or showing visible wounds?",
      uploadWound: "Capture / Upload Injury Photo (Camera & Gallery)",
      woundAttached: "Wound image loaded for trauma evaluation",
      runDiagnosisBtn: "Generate Offline Clinical Report ⚡",
      reportTitle: "Clinical Diagnosis & Triage Report",
      homeRemediesTitle: "🌿 Home-Made Remedies & Field Interventions",
      medicationsTitle: "💊 Recommended Medications & Formulations",
      opsTitle: "Disaster Operations & Tactical Infrastructure",
      outboxBtn: "📦 Outbox",
      onlineStatus: "ONLINE",
      offlineStatus: "OFFLINE (IndexedDB Active)",
      doctorRegHeading: "Physician On-Duty Registration",
      doctorNameLabel: "Doctor Name & Degree",
      doctorSpecLabel: "Specialization",
      doctorRegNoLabel: "Registration Number",
      doctorHospitalLabel: "Hospital Affiliation",
      doctorAvailabilityLabel: "Emergency Availability Status",
      statusAvailable: "Available for Emergency Calls 🟢",
      statusBusy: "Busy / In Surgery 🔴",
      registerDoctorBtn: "Register as Active Emergency Doctor 🩺",
      callDoctorVoice: "Normal Call 📞",
      callDoctorVideo: "Jitsi Video Call 📹",
      activeCallTitle: "Emergency Voice Call Active",
      videoCallTitle: "Jitsi Meet Tele-Consultation",
      endCallBtn: "End Call",
      backToCitizenHub: "← Back to Citizen Hub",
      newsHubTitle: "Live Disaster News & Sentinel Radar",
      newsHubSubtitle: "Real-time satellite bulletins, hyper-local impact horizons & verified anti-disinformation shield",
      newsFilterAll: "All Alerts (7)",
      newsFilterFlood: "🌊 Flood Surge",
      newsFilterCyclone: "🌪️ Cyclone Megha",
      newsFilterHeat: "☀️ Heatwave Cat-4",
      newsFilterLandslide: "⛰️ Landslide Ghats",
      newsFilterOutbreak: "🦠 Leptospirosis Surge",
      newsFilterHazmat: "☣️ Ammonia Hazmat",
      newsFilterInfra: "📡 Satellite Mesh",
      threatHorizonBadge: "Hyperlocal Threat Horizon",
      rumorBusterTitle: "Rumor-Buster Sentinel Shield",
      rumorDebunkLabel: "Debunked Viral Hoax",
      rumorFactLabel: "Official State Ground Truth",
      listenRadioBtn: "Listen Radio Dispatch 🎙️",
      stopRadioBtn: "Stop Broadcast ⏹️",
      satelliteSmsBeaconBtn: "Generate Offline SMS Beacon 📡",
      smsBeaconCopied: "Emergency SMS text copied to clipboard!",
      actionChecklistTitle: "60-Second Field Action Checklist",
      nearestSheltersTitle: "Nearest Designated Relief Camps"
    },
    hi: {
      portalTitle: "स्वास्थ्य एवं आपदा प्रतिक्रिया पोर्टल",
      portalSubtitle: "फ्यूजन 2026 के लिए अपना कार्यप्रणाली मोबाइल ऐप चुनें",
      vetnovaTitle: "वेटनोवा (VetNova)",
      vetnovaDesc: "पशु स्वास्थ्य, एसआईएच राष्ट्रीय निगरानी एवं कृत्रिम बुद्धिमत्ता रोग निदान",
      vetnovaBtn: "वेटनोवा शुरू करें 🐾",
      healthnovaTitle: "हेल्थनोवा (HealthNova)",
      healthnovaDesc: "आपदा आपातकालीन चिकित्सा खुफिया, 5-स्तरीय मोबाइल प्रणाली एवं प्राथमिक उपचार",
      healthnovaBtn: "हेल्थनोवा शुरू करें 🛡️",
      switchPortal: "पोर्टल बदलें",
      switchRole: "भूमिका बदलें ⇋",
      splashTagline: "आपातकालीन चिकित्सा एवं आपदा प्रतिक्रिया प्रणाली",
      splashLoading: "ऑफलाइन चिकित्सीय नियम एवं आपदा प्रोटोकॉल लोड हो रहे हैं…",
      splashReady: "मोबाइल क्षेत्रीय उपयोग हेतु तैयार",
      allowLocationPill: "स्थान अनुमति दें",
      roleCitizenTitle: "मैं एक नागरिक / यूजर हूँ",
      roleCitizenSub: "किसान या नागरिक • आपदा प्राथमिक चिकित्सा एवं रोग निदान",
      roleDoctorTitle: "मैं एक डॉक्टर हूँ",
      roleDoctorSub: "पंजीकृत आपातकालीन चिकित्सा व्यवसायी",
      roleGovTitle: "सरकारी आपदा एवं निगरानी अधिकारी",
      roleGovBadge: "डीएएचडी / एसईओसी पोर्टल",
      roleGovSub: "राज्य/जिला प्रकोप रडार, जीआईएस मैप व आपात निर्देश",
      roleAmbTitle: "108 एम्बुलेंस एवं ईएमएस सेवा",
      roleAmbBadge: "लाइव ट्रांजिट रूट",
      roleAmbSub: "फील्ड मरीज निकासी, अस्पताल आवंटन व लाइव जीपीएस रूट",
      roleMedTitle: "आपदा औषधि भंडार एवं फार्मेसी",
      roleMedSub: "आपातकालीन दवा भंडार व आपदा किट ऑर्डर करें",
      roleAeroTitle: "एयरोरिलीफ: आपातकालीन एयर-सप्लाई समन्वय",
      roleAeroBadge: "निर्णय समर्थन",
      roleAeroSub: "सड़क संपर्क टूटने पर आपातकालीन हवाई चिकित्सा आपूर्ति लॉजिस्टिक्स सहायता",
      loginTitle: "नागरिक आपातकालीन लॉगिन",
      loginSubtitle: "आपातकालीन अलर्ट व सीधे डॉक्टर कॉल हेतु 10 अंकों का मोबाइल नंबर दर्ज करें",
      fullNameLabel: "पूरा नाम",
      phoneLabel: "मोबाइल नंबर (केवल 10 अंक)",
      cityLabel: "शहर / जिला",
      loginBtn: "सत्यापित करें व हेल्थनोवा में प्रवेश करें 🛡️",
      logoutBtn: "उपयोगकर्ता बदलें",
      newsCardTitle: "लाइव आपदा समाचार",
      newsCardBadge: "लाइव अलर्ट",
      newsCardSub: "आधिकारिक चेतावनी व सरकारी कार्रवाई देखें",
      findDocCardTitle: "आपातकालीन डॉक्टर खोजें",
      findDocCardBadge: "वीडियो / कॉल",
      findDocCardSub: "सक्रिय आपातकालीन डॉक्टरों से परामर्श लें",
      newsSectionTitle: "लाइव आपदा समाचार एवं सरकारी कार्रवाई",
      readArticleBtn: "पूरा समाचार व सरकारी कार्रवाई पढ़ें →",
      govActionsHeading: "सरकारी कार्रवाई एवं राहत उपाय",
      ivrSectionTitle: "आपदा आपातकालीन आईवीआर हेल्पलाइन (२४x७ टोल-फ्री)",
      ndmaLabel: "राष्ट्रीय आपदा प्रबंधन प्राधिकरण (NDMA)",
      erssLabel: "अखिल भारतीय आपातकालीन सेवा (ERSS)",
      reliefCommLabel: "राहत आयुक्त (प्राकृतिक आपदाएं)",
      ddmaLabel: "जिला आपदा प्रबंधन प्राधिकरण (DDMA)",
      callAction: "कॉल करें",
      liveGpsGranted: "लाइव जीपीएस सक्रिय (सटीक विश्लेषण)",
      liveGpsPrompt: "सटीक आपदा विश्लेषण हेतु लाइव जीपीएस आवश्यक है",
      allowGpsBtn: "लाइव लोकेशन चालू करें 📍",
      calamityTitle: "आपदा प्राथमिक चिकित्सा एवं निदान केंद्र",
      calamitySubtitle: "प्राथमिक उपचार देखने या रोग निदान के लिए आपदा का चयन करें",
      flood: "बाढ़ एवं जलभराव",
      cyclone: "चक्रवात एवं आंधी-तूफान",
      heatwave: "भीषण लू / ग्रीष्म लहर",
      other: "भूकंप / भूस्खलन / अन्य",
      firstAidBtn: "🩹 प्राथमिक उपचार (First Aid)",
      diagnosisBtn: "🩺 चिकित्सीय निदान (Diagnosis)",
      firstAidHeading: "आपातकालीन प्राथमिक चिकित्सा मार्गदर्शिका",
      ytVideoHeading: "प्रशिक्षण वीडियो गाइड (प्राथमिक उपचार)",
      ytWatchDirect: "यूट्यूब पर वीडियो देखें",
      interactive3dHeading: "इंटरएक्टिव 3D शारीरिक मार्गदर्शिका",
      symptomSelectHeading: "मरीज के लक्षण चुनें",
      voiceInputPlaceholder: "लक्षण बोलें या लिखें…",
      voiceListening: "🎙️ आवाज सुन रहे हैं…",
      voiceBtn: "माइक इनपुट",
      injuryQuestion: "क्या व्यक्ति को कोई घाव, चोट या कट लगा है?",
      uploadWound: "चोट का फोटो लें / अपलोड करें (कैमरा व गैलरी)",
      woundAttached: "चोट का फोटो सफलतापूर्वक लोड हुआ",
      runDiagnosisBtn: "ऑफलाइन चिकित्सीय रिपोर्ट तैयार करें ⚡",
      reportTitle: "चिकित्सीय निदान एवं उपचार रिपोर्ट",
      homeRemediesTitle: "🌿 घरेलू उपचार एवं प्राथमिक राहत",
      medicationsTitle: "💊 सुझाई गई दवाएं एवं खुराक",
      opsTitle: "आपदा संचालन, मानचित्र एवं बुनियादी ढांचा",
      outboxBtn: "📦 आउटबॉक्स",
      onlineStatus: "ऑनलाइन",
      offlineStatus: "ऑफलाइन (इंडेक्सडीबी सक्रिय)",
      doctorRegHeading: "ऑन-ड्यूटी डॉक्टर पंजीकरण",
      doctorNameLabel: "डॉक्टर का नाम व पदवी",
      doctorSpecLabel: "विशेषज्ञता",
      doctorRegNoLabel: "पंजीकरण संख्या",
      doctorHospitalLabel: "संबंधित अस्पताल",
      doctorAvailabilityLabel: "उपलब्धता स्थिति",
      statusAvailable: "आपातकालीन कॉल हेतु उपलब्ध 🟢",
      statusBusy: "व्यस्त / सर्जरी में 🔴",
      registerDoctorBtn: "सक्रिय डॉक्टर के रूप में पंजीकृत करें 🩺",
      callDoctorVoice: "सामान्य कॉल 📞",
      callDoctorVideo: "जित्सी वीडियो कॉल 📹",
      activeCallTitle: "आपातकालीन वॉइस कॉल चालू",
      videoCallTitle: "जित्सी मीट टेली-परामर्श",
      endCallBtn: "कॉल समाप्त करें",
      backToCitizenHub: "← नागरिक हब पर वापस जाएं",
      newsHubTitle: "लाइव आपदा समाचार एवं सेंटिनल रडार",
      newsHubSubtitle: "सैटेलाइट बुलेटिन, वास्तविक दूरी/प्रभाव अनुमान एवं अफवाह निवारण कवच",
      newsFilterAll: "सभी अलर्ट (7)",
      newsFilterFlood: "🌊 बाढ़ चेतावनी",
      newsFilterCyclone: "🌪️ चक्रवात मेघा",
      newsFilterHeat: "☀️ भीषण लू (हीटवेव)",
      newsFilterLandslide: "⛰️ भूस्खलन खतरा",
      newsFilterOutbreak: "🦠 लेप्टोस्पायरोसिस",
      newsFilterHazmat: "☣️ अमोनिया गैस रिसाव",
      newsFilterInfra: "📡 सैटेलाइट टावर",
      threatHorizonBadge: "हाइपरलोकल खतरा क्षितिज",
      rumorBusterTitle: "अफवाह-निवारक प्रहरी कवच",
      rumorDebunkLabel: "खंडित की गई भ्रामक अफवाह",
      rumorFactLabel: "आधिकारिक प्रमाणित सत्य",
      listenRadioBtn: "रेडियो बुलेटिन सुनें 🎙️",
      stopRadioBtn: "प्रसारण रोकें ⏹️",
      satelliteSmsBeaconBtn: "ऑफलाइन एसएमएस बीकन 📡",
      smsBeaconCopied: "आपातकालीन एसएमएस क्लिपबोर्ड पर कॉपी हुआ!",
      actionChecklistTitle: "६०-सेकंड त्वरित जीवन-रक्षा चेकलिस्ट",
      nearestSheltersTitle: "निकटतम अधिकृत राहत शिविर"
    },
    mr: {
      portalTitle: "आरोग्य व आपत्ती प्रतिसाद पोर्टल",
      portalSubtitle: "फ्यूजन २०२६ साठी कार्यप्रणाली मोबाइल प्लॅटफॉर्म निवडा",
      vetnovaTitle: "व्हेटनोव्हा (VetNova)",
      vetnovaDesc: "पशुवैद्यकीय आरोग्य, एसआयएच राष्ट्रीय पाळत व एआय रोगनिदान",
      vetnovaBtn: "व्हेटनोव्हा सुरू करा 🐾",
      healthnovaTitle: "हेल्थनोव्हा (HealthNova)",
      healthnovaDesc: "आपत्ती वैद्यकीय बुद्धिमत्ता, ५-स्तरीय मोबाइल प्रणाली व प्रथमोपचार",
      healthnovaBtn: "हेल्थनोव्हा सुरू करा 🛡️",
      switchPortal: "पोर्टल बदला",
      switchRole: "भूमिका बदला ⇋",
      splashTagline: "आपत्कालीन वैद्यकीय व आपत्ती प्रतिसाद बुद्धिमत्ता",
      splashLoading: "ऑफलाइन वैद्यकीय सूत्रे व आपत्ती नियम लोड होत आहेत…",
      splashReady: "मोबाइल क्षेत्रीय वापरासाठी सज्ज",
      allowLocationPill: "स्थान अनुमती द्या",
      roleCitizenTitle: "मी एक नागरिक / वापरकर्ता आहे",
      roleCitizenSub: "शेतकरी किंवा नागरिक • आपत्ती प्रथमोपचार व रोगनिदान",
      roleDoctorTitle: "मी एक डॉक्टर आहे",
      roleDoctorSub: "नोंदणीकृत आपत्कालीन वैद्यकीय तज्ज्ञ",
      roleGovTitle: "शासकीय आपत्ती व पाळत अधिकारी",
      roleGovBadge: "डीएएचडी / एसईओसी पोर्टल",
      roleGovSub: "राज्य/जिल्हा उद्रेक रडार, जीआयएस नकाशा व प्रशासकीय आदेश",
      roleAmbTitle: "१०८ रुग्णवाहिका व ईएमएस ताफा",
      roleAmbBadge: "थेट वाहतूक मार्ग",
      roleAmbSub: "रुग्णवाहिका ट्रॅकिंग, रुग्णालय वाटप व थेट जीपीएस मार्ग",
      roleMedTitle: "आपत्ती औषध साठा व फार्मसी",
      roleMedSub: "मध्यवर्ती औषध साठा व आपत्कालीन किट्स ऑर्डर करा",
      roleAeroTitle: "एरोरिलिफ: आपत्कालीन हवाई पुरवठा समन्वय",
      roleAeroBadge: "निर्णय सहाय्य",
      roleAeroSub: "रस्ते बंद पडल्यास संभाव्य हवाई वैद्यकीय पुरवठा लॉजिस्टिक्स निर्णय-सल्ला",
      loginTitle: "नागरिक आपत्कालीन लॉगिन",
      loginSubtitle: "थेट आपत्कालीन कॉल व टेलि-सल्ल्यासाठी १० अंकी मोबाईल नंबर टाका",
      fullNameLabel: "पूर्ण नाव",
      phoneLabel: "मोबाईल नंबर (फक्त १० अंक)",
      cityLabel: "शहर / जिल्हा",
      loginBtn: "पडताळणी करा व हेल्थनोव्हा सुरू करा 🛡️",
      logoutBtn: "वापरकर्ता बदला",
      newsCardTitle: "थेट आपत्ती बातम्या",
      newsCardBadge: "थेट अलर्ट",
      newsCardSub: "शासकीय इशारे व प्रत्यक्ष मदतकार्य पहा",
      findDocCardTitle: "आपत्कालीन डॉक्टर शोधा",
      findDocCardBadge: "व्हिडिओ / कॉल",
      findDocCardSub: "सक्रिय ऑन-ड्यूटी डॉक्टरांचा सल्ला घ्या",
      newsSectionTitle: "थेट आपत्ती बातम्या व शासकीय उपाययोजना",
      readArticleBtn: "संपूर्ण बातमी व शासकीय कारवाई पहा →",
      govActionsHeading: "शासनाने केलेली प्रत्यक्ष कारवाई व मदतकार्य",
      ivrSectionTitle: "आपत्ती आपत्कालीन आयव्हीआर हेल्पलाईन (२४x७ टोल-फ्री)",
      ndmaLabel: "राष्ट्रीय आपत्ती व्यवस्थापन प्राधिकरण (NDMA)",
      erssLabel: "अखिल भारतीय आपत्कालीन सेवा (ERSS)",
      reliefCommLabel: "मदत व पुनर्वसन आयुक्त (नैसर्गिक आपत्ती)",
      ddmaLabel: "जिल्हा आपत्ती व्यवस्थापन प्राधिकरण (DDMA)",
      callAction: "कॉल करा",
      liveGpsGranted: "थेट जीपीएस सक्रिय (अचूक विश्लेषण)",
      liveGpsPrompt: "अचूक आपत्ती विश्लेषणासाठी थेट जीपीएस आवश्यक आहे",
      allowGpsBtn: "थेट स्थान सुरू करा 📍",
      calamityTitle: "आपत्कालीन आपत्ती व प्रथमोपचार केंद्र",
      calamitySubtitle: "प्रथमोपचार किंवा रोगनिदानासाठी संबंधित आपत्ती निवडा",
      flood: "महापूर व जलप्रलय",
      cyclone: "चक्रीवादळ व तीव्र वारे",
      heatwave: "उष्णतेची लाट (उष्माघात)",
      other: "भूकंप / दरड कोसळणे / इतर",
      firstAidBtn: "🩹 प्रथमोपचार (First Aid)",
      diagnosisBtn: "🩺 वैद्यकीय निदान (Diagnosis)",
      firstAidHeading: "आपत्कालीन प्रथमोपचार मार्गदर्शिका",
      ytVideoHeading: "मार्गदर्शक प्रात्यक्षिक व्हिडिओ (प्रथमोपचार)",
      ytWatchDirect: "यूट्यूबवर व्हिडिओ पहा",
      interactive3dHeading: "परस्परसंवादी 3D शारीरिक प्रात्यक्षिक",
      symptomSelectHeading: "रुग्णाची लक्षणे निवडा",
      voiceInputPlaceholder: "लक्षणे बोला किंवा टाईप करा…",
      voiceListening: "🎙️ आवाज ऐकत आहे…",
      voiceBtn: "व्हॉइस इनपुट",
      injuryQuestion: "रुग्णाला प्रत्यक्ष दुखापत, जखम किंवा खरचटले आहे का?",
      uploadWound: "जखमेचा फोटो काढा / अपलोड करा (कॅमेरा व गॅलरी)",
      woundAttached: "जखमेचे छायाचित्र मूल्यांकनसाठी जोडले गेले",
      runDiagnosisBtn: "ऑफलाइन वैद्यकीय अहवाल तयार करा ⚡",
      reportTitle: "वैद्यकीय निदान व उपचार अहवाल",
      homeRemediesTitle: "🌿 घरगुती उपाय व प्राथमिक काळजी",
      medicationsTitle: "💊 शिफारस केलेली औषधे व मात्रा",
      opsTitle: "आपत्ती संचालन, नकाशा व पायाभूत सुविधा",
      outboxBtn: "📦 आउटबॉक्स",
      onlineStatus: "ऑनलाइन",
      offlineStatus: "ऑफलाइन (इंडेक्सडीबी सक्रिय)",
      doctorRegHeading: "कर्तव्यावरील डॉक्टर नोंदणी",
      doctorNameLabel: "डॉक्टरांचे नाव व पदवी",
      doctorSpecLabel: "तज्ज्ञता",
      doctorRegNoLabel: "नोंदणी क्रमांक",
      doctorHospitalLabel: "रुग्णालय संलग्नता",
      doctorAvailabilityLabel: "उपलब्धता स्थिती",
      statusAvailable: "आपत्कालीन कॉलसाठी उपलब्ध 🟢",
      statusBusy: "व्यस्त / शस्त्रक्रियेत 🔴",
      registerDoctorBtn: "सक्रिय डॉक्टर म्हणून नोंदणी करा 🩺",
      callDoctorVoice: "सामान्य कॉल 📞",
      callDoctorVideo: "जित्सी व्हिडिओ कॉल 📹",
      activeCallTitle: "आपत्कालीन व्हॉइस कॉल सुरू",
      videoCallTitle: "जित्सी मीट टेलि-कन्सल्टेशन",
      endCallBtn: "कॉल बंद करा",
      backToCitizenHub: "← नागरिक हबवर परत जा",
      newsHubTitle: "थेट आपत्ती बातम्या व सेंटिनेल रडार",
      newsHubSubtitle: "थेट उपग्रह अलर्ट, अचूक अंतर/धोका अंदाज व अफवा विरोधी सुरक्षा कवच",
      newsFilterAll: "सर्व अलर्ट (७)",
      newsFilterFlood: "🌊 महापूर इशारा",
      newsFilterCyclone: "🌪️ मेघा चक्रीवादळ",
      newsFilterHeat: "☀️ उष्णतेची लाट",
      newsFilterLandslide: "⛰️ दरड धोका",
      newsFilterOutbreak: "🦠 लेप्टोस्पायरोसिस",
      newsFilterHazmat: "☣️ अमोनिया विषारी वायू",
      newsFilterInfra: "📡 उपग्रह मोबाइल टॉवर",
      threatHorizonBadge: "हायपरलोकल धोका क्षितीज",
      rumorBusterTitle: "अफवा-विरोधी सेंटिनेल कवच",
      rumorDebunkLabel: "खोडून काढलेली खोटी अफवा",
      rumorFactLabel: "शासकीय अधिकृत सत्य",
      listenRadioBtn: "रेडिओ बुलेटिन ऐका 🎙️",
      stopRadioBtn: "प्रसारण थांबवा ⏹️",
      satelliteSmsBeaconBtn: "ऑफलाइन एसएमएस बीकन 📡",
      smsBeaconCopied: "आपत्कालीन एसएमएस क्लिपबोर्डवर कॉपी झाला!",
      actionChecklistTitle: "६०-सेकंद जीवन-रक्षक कृती आराखडा",
      nearestSheltersTitle: "जवळचे अधिकृत मदत शिबिर"
    }
  };

  // --- DISASTER NEWS ARTICLES WITH GOVERNMENT ACTIONS & MULTI-DIMENSIONAL INNOVATIONS ---
  const DISASTER_NEWS = [
    {
      id: "news-1",
      category: "flood",
      tag: "FLOOD SURGE RED ALERT",
      tagColor: "#0284c7",
      priority: "CRITICAL",
      time: "8 mins ago (Live Telemetry)",
      title: "Khadakwasla Dam Spillway Inundation: 32,500 Cusecs Surge Discharge into Mutha River Channel",
      summary: "Upstream catchment heavy precipitation triggers 8-gate release. Low-lying riverside causeways submerged. Emergency SDRF motorboat units mobilized.",
      article: "Following relentless precipitation of 215mm across the Western Ghats catchment within 12 hours, the Maharashtra Water Resources Department authorized an escalated discharge rate of 32,500 cusecs from Khadakwasla Dam into the Mutha river channel. Baba Bhide Bridge, Pulachi Wadi causeway, and riverbed parking zones are completely submerged under 4.8 meters of flood current. District Magistrate and Pune Municipal Corporation have issued Red Inundation Protocols for Deccan Gymkhana, Shaniwar Peth, and Sangvi settlements.",
      epicenter: { name: "Khadakwasla Dam Spillway", lat: 18.4287, lng: 73.7634 },
      velocityKmH: 12.5,
      telemetry: [
        { label: "Spillway Discharge", val: "32,500 Cusecs", status: "alert" },
        { label: "Mutha River Stage", val: "+4.8m Over Datum", status: "alert" },
        { label: "Active Sluice Gates", val: "8 of 11 Open", status: "warn" },
        { label: "Catchment Inflow", val: "38,200 Cusecs", status: "alert" }
      ],
      govActions: [
        "District Magistrate deployed 4 SDRF inflatable motorboat rescue units to Sangvi, Baba Bhide Bridge, and Pulachi Wadi.",
        "12 Relief camps operationalized in municipal schools with dry ration packets, bottled water, and mobile chlorination units.",
        "Local police and civil defense launched 24x7 loudspeaker warnings instructing all vehicles and ground-floor dwellers to evacuate.",
        "Disaster Control Room (1077) activated with real-time acoustic water-level telemetry sensors monitoring bridge piers."
      ],
      rumorBuster: {
        claim: "Dam masonry wall has suffered structural breach and the entire Pune core will submerge within 30 minutes.",
        fact: "Dam instrumentation and piezo-sensors confirm 100% structural stability. Discharge is controlled and scheduled to manage reservoir buffer safely.",
        source: "State Emergency Operation Centre (SEOC) & Chief Engineer Irrigation",
        verificationCode: "SEOC-HYD-8821-VERIFIED",
        trustScore: 99.9
      },
      actionChecklist: [
        "Move all vehicles from riverbed causeways and underground parking lots immediately.",
        "Elevate drinking water jars, food supplies, and medical kits above first-floor level.",
        "Switch off main MCB electrical breaker before floodwaters contact lower wall sockets."
      ],
      nearestShelters: [
        { name: "Bhave High School Relief Camp", distanceKm: 1.2, bedsAvail: "185 / 300 Beds", supplies: "Hot Khichdi, Safe Water, Doctor Desk", contact: "020-25501000" },
        { name: "Sangvi Municipal Community Hall", distanceKm: 3.4, bedsAvail: "92 / 200 Beds", supplies: "Emergency Cots, Blankets, ORS Hub", contact: "020-27282000" }
      ],
      radioScript: {
        en: "Emergency flood alert from HealthNova. Khadakwasla Dam is discharging 32,500 cusecs into the Mutha river channel. Move immediately away from low-lying riverside causeways and bridges. Disconnect ground-floor electricity. Follow official municipal instructions.",
        hi: "हेल्थनोवा आपातकालीन बाढ़ चेतावनी। खडकवासला बांध से मुठा नदी में 32,500 क्यूसेक पानी छोड़ा जा रहा है। नदी किनारे और निचले इलाकों से तुरंत सुरक्षित ऊंचाई वाले स्थानों पर जाएं। भूतल के बिजली के मेन स्विच बंद कर दें।",
        mr: "हेल्थनोव्हा आपत्कालीन महापूर इशारा. खडकवासला धरणातून मुठा नदी पात्रात ३२,५०० क्युसेक पाण्याचा विसर्ग सुरू आहे. नदीकाठच्या सखल भागातील नागरिकांनी तात्काळ सुरक्षित स्थळी स्थलांतर करावे. घरातील मुख्य वीज पुरवठा बंद ठेवा."
      }
    },
    {
      id: "news-2",
      category: "cyclone",
      tag: "CYCLONE MEGHA GALE WARNING",
      tagColor: "#ea580c",
      priority: "CRITICAL",
      time: "22 mins ago (Radar Tracking)",
      title: "Severe Cyclonic Storm 'Megha' Intensifies: 115 km/h Squall Bands Approaching Ghats Corridor",
      summary: "Central pressure dips to 982 hPa. Heavy orographic downpours and uprooted transmission towers reported along Konkan-Western Ghats pass.",
      article: "Cyclonic Storm 'Megha' centered over east-central Arabian Sea has rapidly intensified into a Severe Cyclonic Storm, tracking north-northeast towards northern Maharashtra coastal estuaries. IMD Doppler Radar at Mumbai and Goa indicate spiral squall bands delivering intense rainfall rates exceeding 45mm/hour. Gale force gusts of 90-115 km/h are causing structural stress to billboards, overhead lines, and coastal tree canopies. Port warnings hoisted at Signal No. 8.",
      epicenter: { name: "Raigad-Ghats Convergence Zone", lat: 18.2500, lng: 73.3500 },
      velocityKmH: 28.0,
      telemetry: [
        { label: "Peak Wind Gusts", val: "115 km/h", status: "alert" },
        { label: "Central Barometer", val: "982 hPa", status: "alert" },
        { label: "Rainfall Rate", val: "48 mm/hr", status: "alert" },
        { label: "Eye Distance", val: "76 km Coastward", status: "warn" }
      ],
      govActions: [
        "Complete ban on deep-sea marine fishing; 480 registered motorized vessels safely harbored.",
        "4 NDRF Battalions stationed across coastal creeks and Ghat highway choke-points with chainsaw tree cutters.",
        "Pre-emptive evacuation of 4,100 citizens from vulnerable tin-roof and kachha dwellings to cyclone shelters.",
        "MSEDCL dispatched 60 quick-reaction power pole replacement teams equipped with heavy mobile cranes."
      ],
      rumorBuster: {
        claim: "Cyclone Megha eye has spawned an inland super-tornado heading directly into central Pune city.",
        fact: "Doppler weather radar shows uniform squall gale lines, NOT tornadic vortex formation. Heavy wind and rain expected, but no tornado activity detected.",
        source: "India Meteorological Department (IMD) Pune Radars",
        verificationCode: "IMD-RAD-MEGHA-409-CERTIFIED",
        trustScore: 99.8
      },
      actionChecklist: [
        "Dismantle or firmly tether loose tin sheets, rooftop solar panels, and balcony flower pots.",
        "Charge all emergency flashlights, phones, and backup medical oxygen concentrators.",
        "Stay indoors away from exterior glass windows and large age-old roadside banyan trees."
      ],
      nearestShelters: [
        { name: "Deccan Gymkhana Indoor Stadium Shelter", distanceKm: 2.1, bedsAvail: "240 / 500 Beds", supplies: "Generator Backup, Food Rations, Tarpaulins", contact: "020-25678000" },
        { name: "Kothrud Sports Complex Emergency Hub", distanceKm: 4.8, bedsAvail: "160 / 350 Beds", supplies: "Emergency Medical Staff, Clean Water Tankers", contact: "020-25381000" }
      ],
      radioScript: {
        en: "Cyclone Megha alert from HealthNova. Severe gale winds up to 115 km per hour are approaching. Secure all loose outdoor items immediately and remain inside sturdy structures away from glass panes. Avoid outdoor travel.",
        hi: "चक्रवात मेघा आपातकालीन चेतावनी। 115 किमी प्रति घंटे की रफ्तार से तेज आंधी और भारी बारिश पहुंच रही है। बालकनी व छत की खुली वस्तुएं सुरक्षित बांधें और मजबूत पक्के मकानों के भीतर रहें।",
        mr: "मेघा चक्रीवादळ आपत्कालीन इशारा. ताशी ११५ किमी वेगाने सोसाट्याचे वारे आणि मुसळधार पाऊस धडकत आहे. घराबाहेरील पत्रे व साहित्य सुरक्षित करा, पक्क्या इमारतीत राहा आणि झाडांखाली थांबू नका."
      }
    },
    {
      id: "news-3",
      category: "heatwave",
      tag: "HEATWAVE LEVEL-4 DIRECTIVE",
      tagColor: "#dc2626",
      priority: "HIGH",
      time: "1 hour ago (Health Dept Directive)",
      title: "Severe Heatwave Wave-4 Directive: Mandatory Outdoor Work Ban 12 PM - 4 PM & Free Cold ORS Kiosks",
      summary: "Ambient temperature hits 43.8°C with lethal wet-bulb index. District Collector enforces Section 144 occupational labor moratorium to prevent exertional hyperpyrexia.",
      article: "A protracted anticyclonic ridge across northwestern India has triggered unprecedented thermal compression across the Deccan plateau, driving surface ambient temperatures to 43.8°C. Wet-bulb temperatures exceeding 31°C present critical risk of exertional heat stroke and acute cardiovascular collapse. Under the Disaster Management Act, all brick kilns, highway road asphalt crews, and open construction operations are strictly barred between 12:00 PM and 4:00 PM. Civil hospitals have activated 24x7 cool-room resuscitation pods.",
      epicenter: { name: "Deccan Urban Heat Core", lat: 18.5204, lng: 73.8567 },
      velocityKmH: 0.0,
      telemetry: [
        { label: "Surface Ambient Temp", val: "43.8 °C", status: "alert" },
        { label: "Wet-Bulb Stress Index", val: "31.4 °C", status: "alert" },
        { label: "Solar UV Index", val: "11.2 (Extreme)", status: "alert" },
        { label: "Heat Wards Occupancy", val: "68% Capacity", status: "warn" }
      ],
      govActions: [
        "Mandatory workplace suspension enforced by labor inspectors across all infrastructure work zones.",
        "Public Health Department designated 55 air-conditioned Heat Stroke Treatment Pods in all taluka and civil hospitals.",
        "Municipal Corporation opened 80 Free Cold Water & Electrolyte ORS hydration booths at bus stands and market centers.",
        "108 Emergency Ambulances outfitted with instant ice packs, sub-lingual thermometers, and chilled Normal Saline IV lines."
      ],
      rumorBuster: {
        claim: "Municipal drinking water supply is contaminated with toxic chemical coagulants due to heat boiling the pipes.",
        fact: "Routine water quality testing confirms normal safe chlorine residuals (0.4 PPM). Water remains 100% potable and certified safe for domestic use.",
        source: "State Public Health Laboratory Pune",
        verificationCode: "PHL-WATER-TEST-310-SAFE",
        trustScore: 99.7
      },
      actionChecklist: [
        "Consume at least 500ml of ORS, tender coconut water, or salted chaas every 2 hours.",
        "Keep elderly, pregnant mothers, and infants inside darkened, well-ventilated rooms during peak heat.",
        "If anyone exhibits confusion, cessation of sweating, or high body temperature, drench them in cold water immediately and dial 108."
      ],
      nearestShelters: [
        { name: "Pune Railway Station Cold Hydration Kiosk", distanceKm: 1.8, bedsAvail: "Open Public Kiosk", supplies: "Chilled ORS, Clean RO Water, Doctor Desk", contact: "020-26122000" },
        { name: "Sassoon Hospital Heat Stroke Acute Ward", distanceKm: 2.3, bedsAvail: "35 / 50 AC Beds", supplies: "Ice Baths, Chilled Saline IV, Critical ICU", contact: "020-26128000" }
      ],
      radioScript: {
        en: "HealthNova Heatwave Health Directive. Temperatures have exceeded 43.8 degrees Celsius. Heavy outdoor work is prohibited between 12 PM and 4 PM. Drink plenty of salted water and ORS. Keep vulnerable individuals in air-cooled or shaded spaces.",
        hi: "हेल्थनोवा हीटवेव आपातकालीन बुलेटिन। तापमान 43.8 डिग्री पार कर चुका है। दोपहर 12 से 4 बजे तक खुले में काम पर रोक है। ओआरएस और पानी भरपूर पिएं। बुजुर्गों व बच्चों को धूप से बचाएं।",
        mr: "उष्णतेच्या लाटेचा आपत्कालीन इशारा. तापमान ४३.८ अंशांवर पोहोचले आहे. दुपारी १२ ते ४ या वेळेत उन्हात काम करणे प्रतिबंधित आहे. भरपूर पाणी, लिंबू सरबत आणि ओआरएस प्या. उष्माघाताची लक्षणे दिसल्यास १०८ वर संपर्क करा."
      }
    },
    {
      id: "news-4",
      category: "landslide",
      tag: "MAVAL RIDGE LANDSLIDE RISK",
      tagColor: "#b45309",
      priority: "HIGH",
      time: "2 hours ago (Geological Survey)",
      title: "Maval Ghats Western Ridge Slope Instability Warning: Soil Saturation Exceeds 94% Threshold",
      summary: "Subsurface pore-water pressure sensors detect micro-creeps along NH-48 Ghat corridor. Traffic restricted to single convoy lane; precautionary slope containment underway.",
      article: "Automated piezometers and geotechnical accelerometers deployed by the Geological Survey of India across the Bhor-Maval escarpment have registered hazardous soil pore pressures of 142 kPa following 310mm of continuous monsoon rain. Soil saturation is at 94.2%, with surface tiltmeters detecting 2.4-degree displacement along loose basalt talus slopes. Maharashtra State Road Development Corporation (MSRDC) has closed heavy transport corridors along old ghat curves, routing emergency vehicles through reinforced tunnel passes.",
      epicenter: { name: "Maval-Khandala Ridge Escarpment", lat: 18.7500, lng: 73.4800 },
      velocityKmH: 0.0,
      telemetry: [
        { label: "Soil Water Saturation", val: "94.2% Critical", status: "alert" },
        { label: "Pore Water Pressure", val: "142 kPa", status: "alert" },
        { label: "Escarpment Tiltmeter", val: "+2.4° Shift", status: "warn" },
        { label: "Rainfall Acc. 48h", val: "318 mm", status: "alert" }
      ],
      govActions: [
        "State Highway Police diverted all non-essential heavy commercial freight away from old ghat switchbacks.",
        "Geotechnical rock-bolting and steel catch-fence rapid response units deployed to kilometer marker 44-52.",
        "Lonavala and Maval taluka administration relocated 120 families from foothill hamlets into concrete municipal halls.",
        "Earth-moving backhoes and rock-breakers pre-positioned every 3 kilometers for instantaneous boulder clearance."
      ],
      rumorBuster: {
        claim: "Expressway tunnels have suffered massive ceiling collapse and the entire highway is cut off for weeks.",
        fact: "All concrete expressway tunnels are structurally sound and verified intact. Precautionary speed controls (40 km/h) are enforced only on open road cuts.",
        source: "State Highway Police & Geotechnical Survey Team",
        verificationCode: "GSI-MAVAL-SLOPE-771-CERT",
        trustScore: 99.8
      },
      actionChecklist: [
        "Cancel all non-essential road travel along ghat passes until rainfall drops below 50mm/day.",
        "If living along sloped foothills, inspect your home's exterior walls for fresh vertical cracks or muddy seepage.",
        "Keep an evacuation Go-Bag ready with Aadhaar, ration card, 3 days of medications, and a whistle."
      ],
      nearestShelters: [
        { name: "Lonavala Municipal Council Relief Hall", distanceKm: 6.5, bedsAvail: "140 / 250 Beds", supplies: "Dry Blankets, Hot Canteen, First Aid Desk", contact: "02114-273000" },
        { name: "Talegaon General Hospital Emergency Triage", distanceKm: 12.0, bedsAvail: "45 / 80 Trauma Beds", supplies: "Trauma Surgeons, Ortho OT, Blood Bank", contact: "02114-223000" }
      ],
      radioScript: {
        en: "Geological hazard alert from HealthNova. Severe slope instability and landslide risk detected on Maval Ghats due to heavy saturation. Avoid traveling on ghat roads. Residents near steep hillsides must stay alert for soil movement.",
        hi: "भूस्खलन चेतावनी। मावळ घाट क्षेत्र में अत्यधिक बारिश से चट्टान खिसकने का गंभीर खतरा है। घाट मार्गों पर यात्रा न करें। पहाड़ी ढलानों पर रहने वाले लोग सतर्क रहें और सुरक्षित स्थान पर जाएं।",
        mr: "दरड कोसळण्याचा आपत्कालीन इशारा. मावळ घाट परिसरात जमिनीमध्ये पाणी मुरल्याने दरड कोसळण्याचा मोठा धोका निर्माण झाला आहे. घाटातील प्रवास टाळा. डोंगराच्या पायथ्याशी राहणाऱ्या नागरिकांनी सुरक्षित स्थळी जावे."
      }
    },
    {
      id: "news-5",
      category: "outbreak",
      tag: "EPIDEMIC LEPTOSPIROSIS WATCH",
      tagColor: "#059669",
      priority: "HIGH",
      time: "3 hours ago (Public Health Surveillance)",
      title: "Post-Inundation Epidemic Alert: Leptospirosis Chemoprophylaxis Drive Dispatched to 18 Riverine Slums",
      summary: "Rising water turbidity increases bacterial exposure from rodent urine. Free Doxycycline distribution points active; citizens with fever, calf pain, or red eyes urged to report.",
      article: "In the aftermath of backwater inundation across Mula-Mutha lowlands, the Integrated Disease Surveillance Programme (IDSP) has initiated containment protocols against Leptospira interrogans. Epidemiological field teams identified 18 high-risk clusters where floodwaters entered ground dwellings. Over 45,000 preventive chemoprophylaxis blister packs of Doxycycline (200mg single dose) have been dispatched to urban primary health centres for citizens who waded through contaminated floodwaters.",
      epicenter: { name: "Mula-Mutha Confluence Basin", lat: 18.5350, lng: 73.8900 },
      velocityKmH: 0.0,
      telemetry: [
        { label: "High-Risk Clusters", val: "18 Monitored", status: "warn" },
        { label: "Doxycycline Dispatched", val: "45,000 Doses", status: "ok" },
        { label: "Water Turbidity Index", val: "78 NTU (High)", status: "alert" },
        { label: "Mobile Testing Teams", val: "14 Rapid Vans", status: "ok" }
      ],
      govActions: [
        "14 Mobile Surveillance Vans deployed with point-of-care rapid IgM Leptospira antibody testing kits.",
        "Distribution of free prophylactic Doxycycline tablets to all sanitation workers and flood-affected families.",
        "Pest management teams spraying rodenticide and bleaching powder across stagnant puddle corridors.",
        "Sassoon Hospital opened an expedited 24x7 Post-Flood Fever Clinic with free biochemical screening."
      ],
      rumorBuster: {
        claim: "Leptospirosis is airborne and spreading through apartment air conditioners.",
        fact: "Leptospirosis is strictly a water-contact bacterial infection transmitted through skin abrasions or eyes touching rodent-contaminated water. It CANNOT spread through air or AC units.",
        source: "National Centre for Disease Control (NCDC)",
        verificationCode: "NCDC-LEPTO-SURV-119-VERIFIED",
        trustScore: 99.9
      },
      actionChecklist: [
        "Do NOT walk barefoot through residual floodwater, muddy puddles, or overflowing drainage ditches.",
        "Wash exposed legs and arms immediately with soap and clean bottled or boiled water.",
        "If experiencing sudden high fever, chills, severe calf muscle ache, or yellow eyes, see a doctor within 24 hours."
      ],
      nearestShelters: [
        { name: "Sassoon Hospital Fever & Prophylaxis Desk", distanceKm: 2.3, bedsAvail: "Free Medicine Counter", supplies: "Doxycycline, IV Ceftriaxone, Lab Testing", contact: "020-26128000" },
        { name: "Yerawada Primary Health Centre", distanceKm: 4.1, bedsAvail: "8 / 15 Observation Beds", supplies: "ORS, Antibiotic Prophylaxis, Chlorine Tabs", contact: "020-26681000" }
      ],
      radioScript: {
        en: "Public health outbreak alert from HealthNova. Leptospirosis infection risk is elevated in flood-affected river areas. Avoid stepping into stagnant floodwaters. Wash feet thoroughly with soap and visit your nearest civic clinic for free preventive medication if you have fever or severe leg pain.",
        hi: "स्वास्थ्य विभाग चेतावनी। बाढ़ के पानी से लेप्टोस्पायरोसिस का खतरा बढ़ गया है। गंदे पानी में नंगे पैर न चलें। पैरों को साबुन से धोएं और तेज बुखार या पिंडलियों में दर्द होने पर तुरंत नजदीकी सरकारी अस्पताल जाएं।",
        mr: "आरोग्य विभागाचा आपत्कालीन इशारा. पुराच्या पाण्यामुळे लेप्टोस्पायरोसिस आजाराचा धोका वाढला आहे. साचलेल्या पाण्यात अनवाणी चालू नका. पाय साबणाने स्वच्छ धुवा आणि ताप किंवा पोटऱ्यांमध्ये तीव्र वेदना असल्यास ताबडतोब मोफत गोळ्या घ्या."
      }
    },
    {
      id: "news-6",
      category: "hazmat",
      tag: "BHOSARI MIDC AMMONIA HAZMAT",
      tagColor: "#7c3aed",
      priority: "CRITICAL",
      time: "35 mins ago (Hazmat Telemetry)",
      title: "Chemical Hazmat Protocol Level-2: Ammonia Vapor Dispersion Contained in Bhosari MIDC Sector 7",
      summary: "Industrial cold-storage relief valve malfunction releases localized NH3 plume. Neutralizing water fog scrubbers active. 1.2 km perimeter under shelter-in-place advisory.",
      article: "A high-pressure refrigeration expansion valve rupture at an industrial cold storage plant in Bhosari MIDC Sector 7 caused a release of anhydrous ammonia vapor (NH3). Atmospheric air sensors registered localized readings of 38 PPM (NIOSH ceiling 50 PPM). PCMC Fire Brigade Hazmat Units arrived within 8 minutes and deployed high-pressure water fog curtains which dissolve and neutralize the water-soluble ammonia gas. Residents within a 1.2-kilometer radius are advised to remain indoors with damp cloth barriers.",
      epicenter: { name: "Bhosari MIDC Sector 7 Chemical Cluster", lat: 18.6280, lng: 73.8470 },
      velocityKmH: 4.5,
      telemetry: [
        { label: "Atmospheric NH3 Level", val: "38 PPM (Neutralizing)", status: "warn" },
        { label: "Fog Curtain Pressure", val: "40 Bar Active", status: "ok" },
        { label: "Wind Dispersion Rate", val: "4.5 km/h SE", status: "warn" },
        { label: "Exclusion Perimeter", val: "1.2 km Radius", status: "alert" }
      ],
      govActions: [
        "PCMC Fire Brigade Hazmat Unit deployed 4 water-fog curtain tenders neutralizing the vapor plume.",
        "Factory Inspectorate shut down main isolation valves and initiated nitrogen purging of pressure vessels.",
        "Traffic police cordoned off MIDC spine road from Landewadi chowk to Telco gate for non-emergency vehicles.",
        "YCM Hospital Pimpri placed specialized respiratory decontamination showers on active standby."
      ],
      rumorBuster: {
        claim: "Lethal military nerve gas leak occurred and entire Pimpri-Chinchwad city is being permanently evacuated.",
        fact: "The leak was commercial refrigeration ammonia (NH3) from a single storage unit. Water fog scrubbing has neutralized 90% of the gas. No nerve agent exists.",
        source: "Maharashtra Pollution Control Board & Fire Hazmat Command",
        verificationCode: "MPCB-HAZ-BHOSARI-902-VERIFIED",
        trustScore: 99.9
      },
      actionChecklist: [
        "Cover nose and mouth with a wet cotton handkerchief or towel; water rapidly dissolves and traps ammonia gas.",
        "Close all doors and windows; seal exterior gaps under doors using damp rolled blankets.",
        "Turn off air-conditioners and ventilation fans that suck in outside air."
      ],
      nearestShelters: [
        { name: "Bhosari Police Station Public Safe Assembly", distanceKm: 1.5, bedsAvail: "Decontaminated Zone", supplies: "Eye Wash Stations, Oxygen Concentrators", contact: "020-27122000" },
        { name: "YCM Hospital Emergency Pulmonology Wing", distanceKm: 4.6, bedsAvail: "20 / 30 Hazmat Beds", supplies: "Nebulization Units, Oxygen, Decon Showers", contact: "020-27424000" }
      ],
      radioScript: {
        en: "Chemical hazmat advisory from HealthNova. A localized ammonia gas leak in Bhosari MIDC is being neutralized with water fog curtains. Residents nearby should remain indoors, close windows, and place a damp cloth over nose and mouth if detecting a pungent smell.",
        hi: "रासायनिक आपातकालीन सूचना। भोसरी एमआईडीसी में अमोनिया गैस रिसाव पर पानी के फव्वारों से काबू पाया जा रहा है। नजदीकी निवासी खिड़की-दरवाजे बंद रखें और मुंह-नाक पर गीला कपड़ा रखें।",
        mr: "रासायनिक वायू गळतीचा इशारा. भोसरी एमआयडीसी येथे अमोनिया वायू गळतीवर अग्निशामक दलाने नियंत्रण मिळवले आहे. परिसरातील नागरिकांनी घराची दारे-खिडक्या बंद ठेवाव्यात आणि नाका-तोंडावर ओला रुमाल धरावा."
      }
    },
    {
      id: "news-7",
      category: "infra",
      tag: "EMERGENCY SATELLITE COW MESH",
      tagColor: "#2563eb",
      priority: "MODERATE",
      time: "4 hours ago (Telecom Infrastructure)",
      title: "Emergency Low-Earth-Orbit Satellite COW (Cell-On-Wheels) Mesh Node Activated at Deccan Hub",
      summary: "Grid blackout mitigation: Solar-diesel hybrid mobile telecommunications tower restores 112/108 connectivity and free citizen emergency messaging.",
      article: "To counteract communication outages caused by fallen distribution towers and power grid flooding, the Department of Telecommunications (DoT) and Telecom Disaster Management Cell deployed a rapid-deployment Cell-On-Wheels (COW) vehicle at Deccan Gymkhana Ground. Linked directly to low-earth-orbit (LEO) satellite uplinks, the mobile tower provides 5.5 kilometers of coverage radius, prioritizing emergency distress packets, 112/108 dispatches, and free public Wi-Fi messaging for disaster-hit residents.",
      epicenter: { name: "Deccan Gymkhana Central Hub", lat: 18.5170, lng: 73.8410 },
      velocityKmH: 0.0,
      telemetry: [
        { label: "Satellite Uplink Speed", val: "100 Mbps LEO", status: "ok" },
        { label: "Coverage Radius", val: "5.5 km Active", status: "ok" },
        { label: "Active Mobile Channels", val: "1,200 Voice/SMS", status: "ok" },
        { label: "Auxiliary Solar Battery", val: "94% Charged", status: "ok" }
      ],
      govActions: [
        "Department of Telecommunications deployed 3 mobile COW units across power-outage sectors.",
        "Priority Quality of Service (QoS) routing assigned to emergency responder calls, 108 ambulances, and NDRF radios.",
        "Open public SSID 'HEALTHNOVA-EMERGENCY-MESH' activated with zero login fees for text messaging and safety beacons.",
        "Solar generator recharging kiosk set up on-site with 60 USB charging ports for citizens with flat mobile batteries."
      ],
      rumorBuster: {
        claim: "Emergency mobile towers emit harmful high-frequency disaster radiation that damages phones.",
        fact: "The COW station operates on standard, regulated 4G/LTE mobile frequencies adhering strictly to international ICNIRP radiation safety norms.",
        source: "Department of Telecommunications (DoT) Technical Cell",
        verificationCode: "DOT-COW-RADIO-319-CERT",
        trustScore: 99.9
      },
      actionChecklist: [
        "Turn phone onto Battery Saver mode and dim screen brightness to conserve battery.",
        "Send text messages or SMS instead of making continuous voice calls to preserve tower bandwidth.",
        "Visit the Deccan COW station if you require emergency solar charging for your phone."
      ],
      nearestShelters: [
        { name: "Deccan Mobile Solar Charging Hub", distanceKm: 2.1, bedsAvail: "60 USB Ports Open", supplies: "Free Solar Charging, Wi-Fi Messaging", contact: "020-25678000" },
        { name: "PMC Central Disaster Control Desk", distanceKm: 1.9, bedsAvail: "24x7 Help Desk", supplies: "Satellite Phones, Amateur HAM Radio", contact: "020-25501111" }
      ],
      radioScript: {
        en: "Telecom infrastructure bulletin from HealthNova. An emergency satellite mobile tower is now operational at Deccan Gymkhana Ground providing free emergency text communication and phone charging stations for affected citizens.",
        hi: "दूरसंचार सेवा अपडेट। डेक्कन जिमखाना में आपातकालीन सैटेलाइट मोबाइल टावर शुरू कर दिया गया है। नागरिक मुफ्त आपातकालीन संदेश भेज सकते हैं और वहां लगे सौर कियोस्क पर फोन चार्ज कर सकते हैं।",
        mr: "दूरसंचार सेवा माहिती. डेक्कन जिमखाना मैदानावर आपत्कालीन उपग्रह मोबाइल टॉवर सुरू करण्यात आला आहे. नागरिकांना मोफत संदेश पाठवण्यासाठी आणि मोबाईल चार्जिंगसाठी सोलर किऑस्क उपलब्ध आहे."
      }
    }
  ];

  // --- CALAMITY CLINICAL KNOWLEDGE BASE (REAL ST JOHN AMBULANCE EMBEDDABLE VIDEOS) ---
  const CALAMITY_DATA = {
    flood: {
      id: "flood",
      icon: "🌊",
      color: "#0284c7",
      symptoms: [
        { id: "fever_chills", en: "High Fever with Chills", hi: "कंपकंपी के साथ तेज बुखार", mr: "थंडी वाजून तीव्र ताप" },
        { id: "jaundice_eyes", en: "Yellow Eyes / Red Conjunctiva (Leptospirosis Alert)", hi: "आंखों में पीलापन या लाली (लेप्टोस्पायरोसिस संकेत)", mr: "डोळे पिवळे / लाल होणे (लेप्टोस्पायरोसिस धोका)" },
        { id: "watery_diarrhea", en: "Severe Watery Diarrhea / Vomiting", hi: "पानी जैसा दस्त / उल्टी", mr: "पाण्यासारखे जुलाब व उलट्या" },
        { id: "trench_foot", en: "Cold, Numb, White Wrinkled Feet (Trench Foot)", hi: "पैर सुन्न, ठंडे व झुर्रीदार होना", mr: "पाय सुन्न पडणे, पांढरे सुरकुतणे (ट्रेन्च फूट)" },
        { id: "calf_pain", en: "Severe Calf Muscle Pain", hi: "पिंडलियों में तेज दर्द", mr: "पोटऱ्यांमध्ये असह्य वेदना" },
        { id: "dirty_water_cut", en: "Cuts exposed to dirty flood water", hi: "गंदे बाढ़ के पानी में कटा हुआ घाव", mr: "गढूळ पुराच्या पाण्याने दूषित झालेली जखम" }
      ],
      firstAid: [
        {
          step: 1,
          title: "Drowning & Submersion Recovery",
          detail: "Remove patient from water safely. Check pulse and breathing. If not breathing, start CPR immediately: 30 chest compressions followed by 2 rescue breaths at 100-120 bpm."
        },
        {
          step: 2,
          title: "Hypothermia Management",
          detail: "Remove cold, wet clothing immediately. Wrap patient in dry blankets or emergency thermal foil. Warm core body first, not extremities. Do not massage frozen skin."
        },
        {
          step: 3,
          title: "Floodwater Wound Care",
          detail: "Wash any skin cuts thoroughly with clean bottled/boiled water and soap. Apply antiseptic povidone-iodine. Keep elevated and bandage dry to prevent bacterial infection."
        }
      ],
      ytVideoId: "BQNNOh8c8ks", // Verified: "How to do CPR on an Adult - St John Ambulance"
      demoZone: "chest",
      remedies: [
        "WHO Standard ORS: Dissolve 6 level teaspoons of sugar and 1/2 teaspoon of salt in 1 liter of boiled and cooled water. Administer frequent sips.",
        "Boiled Tulsi & Ginger Broth: Boil 10 tulsi leaves with crushed ginger in water; drink lukewarm to relieve chills and respiratory congestion.",
        "Warm Saline Wash: For macerated skin and trench foot, wash with warm salted water and air-dry thoroughly."
      ],
      medications: [
        "Electrolyte Hydration Sachets (ORS): 1 sachet per 1L drinking water freely.",
        "Paracetamol 500mg: 1 tablet every 6-8 hours for fever/bodyache (max 3g/day). Avoid NSAIDs if Leptospirosis/Dengue suspected.",
        "Zinc Sulfate 20mg: Once daily for 14 days in acute diarrheal illness.",
        "Antiseptic Ointment (Povidone-Iodine 5%): Apply twice daily to abrasions.",
        "Medical Consultation: Doxycycline or Azithromycin required if confirmed Leptospirosis exposure."
      ]
    },
    cyclone: {
      id: "cyclone",
      icon: "🌪️",
      color: "#0d9488",
      symptoms: [
        { id: "bleeding_laceration", en: "Heavy Bleeding from Flying Debris / Glass", hi: "कांच या मलबे से गहरा कट व तेज खून बहना", mr: "उडालेल्या पत्र्यामुळे/काचेमुळे तीव्र रक्तस्त्राव" },
        { id: "head_trauma", en: "Head Impact / Dizziness / Loss of Consciousness", hi: "सिर में चोट / चक्कर / बेहोशी", mr: "डोक्याला मार / चक्कर / बेशुद्ध पडणे" },
        { id: "blunt_chest", en: "Chest Impact / Difficulty Breathing", hi: "छाती पर चोट / सांस लेने में तकलीफ", mr: "छातीवर मार लागल्याने श्वास घेण्यास अडचण" },
        { id: "fracture_limb", en: "Deformed Limb / Inability to Bear Weight", hi: "हड्डी टूटने का संदेह / हाथ-पैर में सूजन", mr: "हाड मोडल्याची शक्यता / तीव्र सूज" },
        { id: "hypovolemic_shock", en: "Pale Cold Skin / Rapid Shallow Pulse (Shock)", hi: "त्वचा ठंडी व पीली / तेज कमजोर नब्ज", mr: "त्वचा थंड व फिकट पडणे / नाडी जलद चालणे" }
      ],
      firstAid: [
        {
          step: 1,
          title: "Direct Pressure Bleeding Control",
          detail: "Apply firm, continuous direct pressure over bleeding wound with a sterile gauze or clean cloth for at least 5-10 minutes. Elevate injured limb above heart level."
        },
        {
          step: 2,
          title: "Tourniquet for Severe Arterial Bleeding",
          detail: "If blood is spurting from an arm or leg, place a commercial tourniquet or broad cloth strip 2-3 inches above the wound (not over a joint). Tighten until bleeding stops. Record the exact time applied."
        },
        {
          step: 3,
          title: "Rigid Splinting for Fractures",
          detail: "Immobilize broken limb using cardboard, wood planks, or rolled newspapers. Secure firmly above and below the fracture site. Do not attempt to realign crooked bones."
        }
      ],
      ytVideoId: "4e7evinsfm0", // Verified: "How to Treat Cuts and Grazes - St John Ambulance"
      demoZone: "limb",
      remedies: [
        "Clean Elevation Wrap: Elevate wounded limb on folded blankets or pillows to diminish swelling and blood pooling.",
        "Cold Compression: Place ice or cold wrapped items near blunt contusions for 15-minute intervals to limit hematoma expansion.",
        "Sugar-Water Calming Solution: Give small warm sweet water sips to conscious shock victims (do not give anything if semi-conscious)."
      ],
      medications: [
        "Sterile Gauze Pads & Crepe Bandage: Dress wounds snugly.",
        "Paracetamol 650mg: For severe musculoskeletal trauma pain.",
        "Tetanus Toxoid (TT 0.5ml IM): Mandatory within 24-48 hours for metal or debris wounds.",
        "Povidone-Iodine 10% Solution: Thorough wound irrigation.",
        "Emergency Splints & Triangular Bandages: Arm/leg immobilization."
      ]
    },
    heatwave: {
      id: "heatwave",
      icon: "☀️",
      color: "#ea580c",
      symptoms: [
        { id: "hyperthermia", en: "High Body Temp (>104°F / 40°C) with Hot Dry Skin", hi: "शरीर का तेज तापमान (>104°F) व सूखी गर्म त्वचा", mr: "अंग भाजून निघणे (>१०४°F) व कोरडी त्वचा" },
        { id: "delirium", en: "Confusion, Dizziness, Slurred Speech or Seizures", hi: "बेहोशी, भ्रम या जुबान लड़खड़ाना", mr: "भ्रम, चक्कर येणे, बोलण्यात अडखळणे" },
        { id: "rapid_heartbeat", en: "Rapid Pounding Pulse & Shortness of Breath", hi: "तेज धड़कन व सांस फूलना", mr: "धडधड वाढणे व धाप लागणे" },
        { id: "heat_cramps", en: "Severe Muscle Cramps in Calves & Abdomen", hi: "मांसपेशियों में गंभीर ऐंठन", mr: "स्नायूंमध्ये असह्य गोळे येणे" },
        { id: "throbbing_headache", en: "Throbbing Headache & Intense Nausea", hi: "सिर में तेज धड़कता दर्द व उल्टी की इच्छा", mr: "तीव्र डोकेदुखी व मळमळ" }
      ],
      firstAid: [
        {
          step: 1,
          title: "Immediate Aggressive Evaporative Cooling",
          detail: "Move patient to shade immediately. Remove excess clothing. Spray or sponge with cool water and fan vigorously to promote evaporation. Place cold packs in armpits, neck, and groin."
        },
        {
          step: 2,
          title: "Airway & Lateral Recovery Position",
          detail: "If patient is confused or vomiting, place them on their left side in the recovery position to prevent aspiration. Never force fluids into a confused patient."
        },
        {
          step: 3,
          title: "Cold Water Sips for Conscious Patients",
          detail: "If fully alert, give cool water with electrolytes or pinch of salt in small sips. Avoid ice-cold drinks that trigger stomach cramps."
        }
      ],
      ytVideoId: "GmqXqwSV3bo", // Verified: "The Recovery Position - St John Ambulance"
      demoZone: "head",
      remedies: [
        "Raw Mango Panna (Kairi Panha): Drink roasted raw mango pulp blended with cumin, black salt, and jaggery to immediately replenish lost minerals.",
        "Wet Sheet Evaporation: Wrap the patient in a damp cotton bedsheet and direct an electric/hand fan over them.",
        "Cold Forehead & Foot Compression: Apply cool wet towels to the soles of feet and forehead to hasten core heat dispersion."
      ],
      medications: [
        "Oral Rehydration Salts (ORS): 500ml per hour while sweating heavily.",
        "Normal Saline 0.9% IV (Paramedic Administered): For heat exhaustion with hypotension.",
        "Paracetamol: NOTE - Do NOT use Paracetamol/Aspirin for heat stroke; they do not lower environmental hyperthermia and can stress the liver.",
        "Electrolyte Powder containing Potassium, Sodium & Magnesium."
      ]
    },
    other: {
      id: "other",
      icon: "⚡",
      color: "#7c3aed",
      symptoms: [
        { id: "crush_limb", en: "Heavy Object Compression on Limbs (>15 mins)", hi: "हाथ-पैर मलबे में 15 मिनट से अधिक दबे होना", mr: "अवयव मलब्याखाली १५ मिनिटांपेक्षा जास्त दाबले जाणे" },
        { id: "smoke_cough", en: "Chemical Inhalation / Ash Cough / Asphyxiation", hi: "धुआं या गैस से दम घुटना व खांसी", mr: "धूर किंवा वायूमुळे गुदमरणे व खोकला" },
        { id: "burns_scalds", en: "Thermal Burns / Chemical Skin Blisters", hi: "आग से जलना या त्वचा पर छाले", mr: "भाजणे किंवा त्वचेवर फोड येणे" },
        { id: "neck_spine_pain", en: "Severe Neck / Back Pain after Fall (Spinal Risk)", hi: "गिरने के बाद गर्दन या रीढ़ में तेज दर्द", mr: "पडल्यानंतर मान किंवा पाठीत असह्य वेदना" }
      ],
      firstAid: [
        {
          step: 1,
          title: "Crush Syndrome Precautions",
          detail: "Before releasing an object that has crushed a limb for >15 minutes, prepare for sudden toxic reperfusion shock. Alert 108 EMS for IV hydration immediately."
        },
        {
          step: 2,
          title: "Burn Management (Rule of 20)",
          detail: "Cool burns immediately under clean running tap water for 20 minutes. Never apply ice, butter, or oil. Cover loosely with sterile cling wrap or clean non-adherent dressing."
        },
        {
          step: 3,
          title: "Spinal Immobilization",
          detail: "Keep head, neck, and spine in neutral alignment. Do not bend or twist the spine. Support sides of the head with rolled blankets."
        }
      ],
      ytVideoId: "61urGQrmeNM", // Verified: "How to Treat Shock - St John Ambulance"
      demoZone: "spine",
      remedies: [
        "Cool Clean Water Irrigation: Pour clean cool water over minor burns for 15-20 minutes continuous.",
        "Honey or Aloe Dressing: For minor 1st-degree superficial burns, pure aloe vera or medical honey can protect unbroken skin.",
        "Moist Cloth Smoke Mask: Breathe through a multi-layered moist cotton cloth to filter toxic particulate debris."
      ],
      medications: [
        "Silver Sulfadiazine 1% Burn Cream: Apply gently to 2nd-degree burns without bursting blisters.",
        "Sterile Non-Adherent Paraffin Gauze Dressings: Cover burn wounds.",
        "Salbutamol Inhaler (100mcg): For acute bronchospasm from smoke inhalation.",
        "Intravenous Ringer's Lactate (Medical EMS): Mandatory for crush syndrome & extensive burn fluid loss."
      ]
    }
  };

  // --- DYNAMIC REGISTERED DOCTORS SYSTEM (LOCALSTORAGE PERSISTED) ---
  const DEFAULT_DOCTORS = [
    {
      id: "doc-1",
      name: "Dr. Arvind Patil, MD",
      spec: "Emergency & Disaster Medicine",
      regNo: "MCI-MH-2012-4412",
      hospital: "Sassoon General Hospital, Pune",
      phone: "9822011222",
      available: true
    },
    {
      id: "doc-2",
      name: "Dr. Anjali Deshpande, MS",
      spec: "Trauma & Orthopedic Surgery",
      regNo: "MCI-MH-2016-8941",
      hospital: "Jehangir Hospital, Pune",
      phone: "9822033444",
      available: true
    },
    {
      id: "doc-3",
      name: "Dr. Milind Shinde, MBBS, DNB",
      spec: "Critical Care & Clinical Toxicology",
      regNo: "MCI-MH-2018-1092",
      hospital: "Sahyadri Super Speciality",
      phone: "9822055666",
      available: false
    }
  ];

  function getStoredDoctors() {
    try {
      const saved = localStorage.getItem("healthnova_doctors");
      return saved ? JSON.parse(saved) : DEFAULT_DOCTORS;
    } catch (e) {
      return DEFAULT_DOCTORS;
    }
  }

  function saveStoredDoctors(docs) {
    try {
      localStorage.setItem("healthnova_doctors", JSON.stringify(docs));
    } catch (e) {}
  }

  // --- HYPERLOCAL DISTANCE & THREAT HORIZON CALCULATOR (HAVERSINE ENGINE) ---
  function calcDistanceKm(lat1, lon1, lat2, lon2) {
    if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return null;
    const R = 6371; // Earth's mean radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10;
  }

  // --- ATTRACTIVE & REALISTIC 3D ANATOMICAL BODY (HIGH-TECH MEDICAL CT & HOLOGRAPHIC SHADER) ---
  function Interactive3DAnatomyCanvas({ defaultZone }) {
    const canvasRef = useRef(null);
    const [rotation, setRotation] = useState(0);
    const [selectedHotspot, setSelectedHotspot] = useState(defaultZone || "chest");
    const [autoRotate, setAutoRotate] = useState(false);
    const isDraggingRef = useRef(false);
    const lastXRef = useRef(0);
    const animRef = useRef(null);

    useEffect(() => {
      setSelectedHotspot(defaultZone || "chest");
    }, [defaultZone]);

    // Auto-rotate tick
    useEffect(() => {
      let interval = null;
      if (autoRotate) {
        interval = setInterval(() => {
          setRotation((r) => (r + 1.2) % 360);
        }, 30);
      }
      return () => {
        if (interval) clearInterval(interval);
      };
    }, [autoRotate]);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");

      // Handle Retina / HiDPI crispness
      const dpr = window.devicePixelRatio || 1;
      const w = 320;
      const h = 260;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.scale(dpr, dpr);

      let start = Date.now();
      const render = () => {
        const elapsed = (Date.now() - start) / 1000;
        const cx = w / 2;
        const cy = h / 2 - 12;

        const radY = (rotation * Math.PI) / 180;
        const cosY = Math.cos(radY);
        const sinY = Math.sin(radY);

        // 3D Matrix Projection Function with Perspective Foreshortening
        const project3D = (x, y, z) => {
          const rx = x * cosY + z * sinY;
          const rz = -x * sinY + z * cosY;
          const fov = 340;
          const scale = fov / (fov + rz);
          return {
            x: cx + rx * scale,
            y: cy + y * scale,
            scale,
            depth: rz
          };
        };

        ctx.clearRect(0, 0, w, h);

        // 1. Sci-Fi Medical CT Dark Radial Viewport Background
        const bgGrad = ctx.createRadialGradient(cx, cy, 20, cx, cy, 170);
        bgGrad.addColorStop(0, "#081b3b");
        bgGrad.addColorStop(0.65, "#040d1e");
        bgGrad.addColorStop(1, "#02050d");
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, w, h);

        // 2. High-Tech Hologram Isometric Grid & Coordinate Crosshairs
        ctx.strokeStyle = "rgba(14, 165, 233, 0.09)";
        ctx.lineWidth = 1;
        for (let x = 0; x < w; x += 20) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, h);
          ctx.stroke();
        }
        for (let y = 0; y < h; y += 20) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(w, y);
          ctx.stroke();
        }

        // Viewport Corner Ticks
        ctx.strokeStyle = "rgba(56, 189, 248, 0.4)";
        ctx.lineWidth = 1.5;
        const tick = 8;
        // Top-left
        ctx.beginPath(); ctx.moveTo(8, 8 + tick); ctx.lineTo(8, 8); ctx.lineTo(8 + tick, 8); ctx.stroke();
        // Top-right
        ctx.beginPath(); ctx.moveTo(w - 8 - tick, 8); ctx.lineTo(w - 8, 8); ctx.lineTo(w - 8, 8 + tick); ctx.stroke();
        // Bottom-left
        ctx.beginPath(); ctx.moveTo(8, h - 8 - tick); ctx.lineTo(8, h - 8); ctx.lineTo(8 + tick, h - 8); ctx.stroke();
        // Bottom-right
        ctx.beginPath(); ctx.moveTo(w - 8 - tick, h - 8); ctx.lineTo(w - 8, h - 8); ctx.lineTo(w - 8, h - 8 - tick); ctx.stroke();

        // 3. Animated Vertical CT Scan Laser Beam sweeping the body
        const scanY = cy + Math.sin(elapsed * 1.8) * 110;
        const scanGrad = ctx.createLinearGradient(0, scanY - 14, 0, scanY + 14);
        scanGrad.addColorStop(0, "rgba(56, 189, 248, 0)");
        scanGrad.addColorStop(0.5, "rgba(56, 189, 248, 0.35)");
        scanGrad.addColorStop(1, "rgba(56, 189, 248, 0)");
        ctx.fillStyle = scanGrad;
        ctx.fillRect(cx - 90, scanY - 14, 180, 28);
        ctx.strokeStyle = "rgba(56, 189, 248, 0.75)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx - 85, scanY);
        ctx.lineTo(cx + 85, scanY);
        ctx.stroke();

        // 4. REALISTIC ANATOMICAL HUMAN 3D MODEL
        // Color Palettes based on selected hotspot
        const isHeadActive = selectedHotspot === "head";
        const isChestActive = selectedHotspot === "chest";
        const isSpineActive = selectedHotspot === "spine";
        const isLimbActive = selectedHotspot === "limb";
        const isAbdomenActive = selectedHotspot === "abdomen";
        const isLungsActive = selectedHotspot === "lungs";

        // Dynamic 3D lighting gradient helper
        const getBodyGradient = (p1, p2, activeColor, normalColor1, normalColor2) => {
          const grad = ctx.createLinearGradient(p1.x - 20, p1.y, p2.x + 20, p2.y);
          if (activeColor) {
            grad.addColorStop(0, activeColor);
            grad.addColorStop(1, "#dc2626");
          } else {
            grad.addColorStop(0, normalColor1);
            grad.addColorStop(0.5, normalColor2);
            grad.addColorStop(1, "#0369a1");
          }
          return grad;
        };

        // --- A. SKULL & CRANIUM ---
        const headTop = project3D(0, -96, 0);
        const headCenter = project3D(0, -78, 0);
        const chin = project3D(0, -62, 4);
        const templeL = project3D(-14, -80, 0);
        const templeR = project3D(14, -80, 0);
        const jawL = project3D(-11, -66, 2);
        const jawR = project3D(11, -66, 2);

        // Skull Mesh Fill
        ctx.beginPath();
        ctx.moveTo(headTop.x, headTop.y);
        ctx.bezierCurveTo(templeL.x - 4, templeL.y - 10, jawL.x - 3, jawL.y - 4, chin.x, chin.y);
        ctx.bezierCurveTo(jawR.x + 3, jawR.y - 4, templeR.x + 4, templeR.y - 10, headTop.x, headTop.y);
        ctx.closePath();

        const headGrad = ctx.createRadialGradient(headCenter.x - 4, headCenter.y - 6, 2, headCenter.x, headCenter.y, 22 * headCenter.scale);
        headGrad.addColorStop(0, isHeadActive ? "#fb923c" : "#7dd3fc");
        headGrad.addColorStop(0.7, isHeadActive ? "#ea580c" : "#0284c7");
        headGrad.addColorStop(1, isHeadActive ? "#9a3412" : "#034870");
        ctx.fillStyle = headGrad;
        ctx.fill();
        ctx.strokeStyle = isHeadActive ? "#fed7aa" : "rgba(224, 242, 254, 0.85)";
        ctx.lineWidth = 1.6;
        ctx.stroke();

        // Facial Holographic Wireframe (Brow arch & Ocular orbits)
        const browL = project3D(-7, -78, 6);
        const browR = project3D(7, -78, 6);
        const noseTip = project3D(0, -72, 8);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.45)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(browL.x, browL.y);
        ctx.lineTo(noseTip.x, noseTip.y);
        ctx.lineTo(browR.x, browR.y);
        ctx.stroke();

        // Brain Hologram (if Head active)
        if (isHeadActive) {
          ctx.strokeStyle = "rgba(254, 215, 170, 0.8)";
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.arc(headCenter.x, headCenter.y - 3, 10 * headCenter.scale, 0, Math.PI * 2);
          ctx.stroke();
          // Neural impulse sparks
          for (let i = 0; i < 4; i++) {
            const sparkAng = elapsed * 5 + i * (Math.PI / 2);
            const sx = headCenter.x + Math.cos(sparkAng) * 6;
            const sy = headCenter.y - 3 + Math.sin(sparkAng) * 6;
            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.arc(sx, sy, 1.5, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // --- B. CERVICAL SPINE & NECK ---
        const neckTopL = project3D(-6, -60, 0);
        const neckTopR = project3D(6, -60, 0);
        const neckBaseL = project3D(-9, -46, 0);
        const neckBaseR = project3D(9, -46, 0);

        ctx.beginPath();
        ctx.moveTo(neckTopL.x, neckTopL.y);
        ctx.lineTo(neckBaseL.x, neckBaseL.y);
        ctx.lineTo(neckBaseR.x, neckBaseR.y);
        ctx.lineTo(neckTopR.x, neckTopR.y);
        ctx.closePath();
        ctx.fillStyle = isSpineActive ? "#c084fc" : "#0284c7";
        ctx.fill();
        ctx.strokeStyle = "rgba(224, 242, 254, 0.6)";
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // --- C. CLAVICLES & SHOULDERS ---
        const sternalNotch = project3D(0, -45, 4);
        const shoulderL = project3D(-38, -43, 0);
        const shoulderR = project3D(38, -43, 0);

        ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(shoulderL.x, shoulderL.y);
        ctx.quadraticCurveTo(shoulderL.x * 0.5, sternalNotch.y - 2, sternalNotch.x, sternalNotch.y);
        ctx.quadraticCurveTo(shoulderR.x * 0.5, sternalNotch.y - 2, shoulderR.x, shoulderR.y);
        ctx.stroke();

        // --- D. THORACIC CAGE & MUSCULAR TORSO (CHEST & ABDOMEN) ---
        const underarmL = project3D(-34, -28, 0);
        const underarmR = project3D(34, -28, 0);
        const waistL = project3D(-22, 16, 0);
        const waistR = project3D(22, 16, 0);
        const hipL = project3D(-26, 32, 0);
        const hipR = project3D(26, 32, 0);
        const groin = project3D(0, 36, 2);

        // Muscular Torso Silhouette
        ctx.beginPath();
        ctx.moveTo(shoulderL.x, shoulderL.y);
        ctx.bezierCurveTo(underarmL.x - 3, underarmL.y + 4, waistL.x - 4, waistL.y - 4, waistL.x, waistL.y);
        ctx.lineTo(hipL.x, hipL.y);
        ctx.lineTo(groin.x, groin.y);
        ctx.lineTo(hipR.x, hipR.y);
        ctx.lineTo(waistR.x, waistR.y);
        ctx.bezierCurveTo(waistR.x + 4, waistR.y - 4, underarmR.x + 3, underarmR.y + 4, shoulderR.x, shoulderR.y);
        ctx.closePath();

        const chestGrad = getBodyGradient(shoulderL, shoulderR,
          isChestActive ? "#ef4444" : isAbdomenActive ? "#f59e0b" : null,
          "#0ea5e9", "#0284c7");
        ctx.fillStyle = chestGrad;
        ctx.fill();
        ctx.strokeStyle = "rgba(224, 242, 254, 0.75)";
        ctx.lineWidth = 1.6;
        ctx.stroke();

        // Sculpted Pectoralis Major Muscles
        const pecBottomY = -24;
        const pecLeftCenter = project3D(-16, pecBottomY, 5);
        const pecRightCenter = project3D(16, pecBottomY, 5);
        const sternumMid = project3D(0, pecBottomY + 2, 6);

        ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
        ctx.lineWidth = 1.3;
        // Left pec curve
        ctx.beginPath();
        ctx.moveTo(sternalNotch.x, sternalNotch.y);
        ctx.bezierCurveTo(pecLeftCenter.x, pecLeftCenter.y + 8, underarmL.x + 4, underarmL.y + 6, underarmL.x, underarmL.y);
        ctx.stroke();
        // Right pec curve
        ctx.beginPath();
        ctx.moveTo(sternalNotch.x, sternalNotch.y);
        ctx.bezierCurveTo(pecRightCenter.x, pecRightCenter.y + 8, underarmR.x - 4, underarmR.y + 6, underarmR.x, underarmR.y);
        ctx.stroke();

        // Bilateral Curved Ribcage Arches (5 pairs with 3D projection)
        ctx.strokeStyle = "rgba(224, 242, 254, 0.3)";
        ctx.lineWidth = 1.1;
        for (let r = 1; r <= 4; r++) {
          const ribY = -34 + r * 10;
          const rL = project3D(-28 + r * 1.5, ribY, 2);
          const rR = project3D(28 - r * 1.5, ribY, 2);
          const rM = project3D(0, ribY + 3, 5);
          ctx.beginPath();
          ctx.moveTo(rL.x, rL.y);
          ctx.quadraticCurveTo(rM.x, rM.y, rR.x, rR.y);
          ctx.stroke();
        }

        // Rectus Abdominis (Six-pack abdominal muscle blocks)
        ctx.strokeStyle = "rgba(255, 255, 255, 0.28)";
        ctx.lineWidth = 1;
        // Linea alba (center vertical line)
        const xiphoid = project3D(0, -12, 5);
        const navel = project3D(0, 16, 5);
        ctx.beginPath();
        ctx.moveTo(xiphoid.x, xiphoid.y);
        ctx.lineTo(navel.x, navel.y);
        ctx.stroke();
        // Tendinous intersections (horizontal abs divisions)
        for (let a = 0; a < 3; a++) {
          const ay = -6 + a * 8;
          const aL = project3D(-12, ay, 4);
          const aR = project3D(12, ay, 4);
          ctx.beginPath();
          ctx.moveTo(aL.x, aL.y);
          ctx.lineTo(aR.x, aR.y);
          ctx.stroke();
        }

        // --- E. SPINAL COLUMN (VERTEBRAE CHAIN) ---
        ctx.strokeStyle = isSpineActive ? "#e9d5ff" : "rgba(255, 255, 255, 0.4)";
        for (let v = 0; v < 10; v++) {
          const vy = -56 + v * 8;
          const vertNode = project3D(0, vy, -2);
          ctx.fillStyle = isSpineActive ? "#a855f7" : "rgba(224, 242, 254, 0.8)";
          ctx.beginPath();
          ctx.arc(vertNode.x, vertNode.y, 2.2 * vertNode.scale, 0, Math.PI * 2);
          ctx.fill();
        }

        // --- F. INTERNAL ORGANS HOLOGRAPHIC OVERLAYS ---
        // 1. Bilateral Lungs (soft aqua respiration breathing)
        const lungBreath = 1 + Math.sin(elapsed * 2.2) * 0.08;
        const lungL = project3D(-15, -28, 3);
        const lungR = project3D(15, -28, 3);
        ctx.fillStyle = isLungsActive ? "rgba(56, 189, 248, 0.5)" : "rgba(14, 165, 233, 0.22)";
        ctx.beginPath();
        ctx.ellipse(lungL.x, lungL.y, 8 * lungL.scale * lungBreath, 15 * lungL.scale * lungBreath, -0.15, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(lungR.x, lungR.y, 8 * lungR.scale * lungBreath, 15 * lungR.scale * lungBreath, 0.15, 0, Math.PI * 2);
        ctx.fill();

        // 2. Beating Heart Chamber (pulsating dual-systolic rhythm in left thorax)
        const heartPulse = 1 + Math.pow(Math.sin(elapsed * 6), 4) * 0.35;
        const heartPos = project3D(-6, -26, 4);
        ctx.save();
        ctx.beginPath();
        ctx.arc(heartPos.x, heartPos.y, (isChestActive ? 7.5 : 5.5) * heartPulse, 0, Math.PI * 2);
        const heartGrad = ctx.createRadialGradient(heartPos.x, heartPos.y, 1, heartPos.x, heartPos.y, 8 * heartPulse);
        heartGrad.addColorStop(0, "#ff4d6d");
        heartGrad.addColorStop(0.7, "#dc2626");
        heartGrad.addColorStop(1, "rgba(220, 38, 38, 0)");
        ctx.fillStyle = heartGrad;
        ctx.fill();
        ctx.restore();

        // --- G. ARMS & EXTREMITIES (MUSCLE CONTOURS) ---
        const armColor = isLimbActive ? "#f97316" : "#38bdf8";

        // Left Arm (Deltoid -> Bicep -> Forearm -> Hand)
        const elbowL = project3D(-46, -6, 0);
        const wristL = project3D(-48, 28, 0);
        const handL = project3D(-50, 44, 0);

        ctx.strokeStyle = armColor;
        ctx.lineWidth = 7 * shoulderL.scale;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(shoulderL.x, shoulderL.y);
        ctx.lineTo(elbowL.x, elbowL.y);
        ctx.lineTo(wristL.x, wristL.y);
        ctx.stroke();

        // Left Hand
        ctx.lineWidth = 4 * shoulderL.scale;
        ctx.beginPath();
        ctx.moveTo(wristL.x, wristL.y);
        ctx.lineTo(handL.x, handL.y);
        ctx.stroke();

        // Right Arm (Deltoid -> Bicep -> Forearm -> Hand)
        const elbowR = project3D(46, -6, 0);
        const wristR = project3D(48, 28, 0);
        const handR = project3D(50, 44, 0);

        ctx.lineWidth = 7 * shoulderR.scale;
        ctx.beginPath();
        ctx.moveTo(shoulderR.x, shoulderR.y);
        ctx.lineTo(elbowR.x, elbowR.y);
        ctx.lineTo(wristR.x, wristR.y);
        ctx.stroke();

        // Right Hand
        ctx.lineWidth = 4 * shoulderR.scale;
        ctx.beginPath();
        ctx.moveTo(wristR.x, wristR.y);
        ctx.lineTo(handR.x, handR.y);
        ctx.stroke();

        // --- H. PELVIS & LEGS (LOWER EXTREMITIES) ---
        const kneeL = project3D(-18, 76, 0);
        const kneeR = project3D(18, 76, 0);
        const ankleL = project3D(-16, 120, 0);
        const ankleR = project3D(16, 120, 0);
        const footL = project3D(-18, 132, 6);
        const footR = project3D(18, 132, 6);

        const legColor = isLimbActive ? "#ea580c" : "#0284c7";
        ctx.strokeStyle = legColor;
        ctx.lineWidth = 9 * hipL.scale;

        // Left Leg (Thigh & Shin)
        ctx.beginPath();
        ctx.moveTo(hipL.x, hipL.y);
        ctx.lineTo(kneeL.x, kneeL.y);
        ctx.lineTo(ankleL.x, ankleL.y);
        ctx.stroke();

        // Left Foot
        ctx.lineWidth = 5 * hipL.scale;
        ctx.beginPath();
        ctx.moveTo(ankleL.x, ankleL.y);
        ctx.lineTo(footL.x, footL.y);
        ctx.stroke();

        // Right Leg (Thigh & Shin)
        ctx.lineWidth = 9 * hipR.scale;
        ctx.beginPath();
        ctx.moveTo(hipR.x, hipR.y);
        ctx.lineTo(kneeR.x, kneeR.y);
        ctx.lineTo(ankleR.x, ankleR.y);
        ctx.stroke();

        // Right Foot
        ctx.lineWidth = 5 * hipR.scale;
        ctx.beginPath();
        ctx.moveTo(ankleR.x, ankleR.y);
        ctx.lineTo(footR.x, footR.y);
        ctx.stroke();

        // Knee Patella Joints Glow
        ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(kneeL.x, kneeL.y, 4, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(kneeR.x, kneeR.y, 4, 0, Math.PI * 2); ctx.stroke();

        // --- I. PULSATING RADAR HOTSPOT NODES & CONCENTRIC SONAR RINGS ---
        const pulseSize = 6 + Math.sin(elapsed * 4) * 3;
        const drawRadarHotspot = (p, label, key) => {
          const isSelected = selectedHotspot === key;
          const nodeColor = isSelected ? "#ef4444" : "#10b981";

          ctx.save();
          // Expanding Sonar Ripple
          ctx.beginPath();
          ctx.arc(p.x, p.y, pulseSize + (isSelected ? 6 : 2), 0, Math.PI * 2);
          ctx.strokeStyle = isSelected ? "rgba(239, 68, 68, 0.45)" : "rgba(16, 185, 129, 0.35)";
          ctx.lineWidth = 2;
          ctx.stroke();

          // Outer Target Reticle (if selected)
          if (isSelected) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, pulseSize + 11, 0, Math.PI * 2);
            ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
            ctx.setLineDash([3, 3]);
            ctx.lineWidth = 1.2;
            ctx.stroke();
            ctx.setLineDash([]);
          }

          // Core Solid Node
          ctx.beginPath();
          ctx.arc(p.x, p.y, isSelected ? 7 : 5, 0, Math.PI * 2);
          ctx.fillStyle = nodeColor;
          ctx.fill();
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 1.6;
          ctx.stroke();

          // High-tech HUD Callout Label
          ctx.fillStyle = isSelected ? "#fef08a" : "#f1f5f9";
          ctx.font = isSelected ? "bold 10px system-ui" : "9px system-ui";
          ctx.shadowColor = "#000000";
          ctx.shadowBlur = 4;
          const labelX = p.x > cx ? p.x + 10 : p.x - (ctx.measureText(label).width + 10);
          ctx.fillText(label, labelX, p.y + 3);
          ctx.restore();
        };

        // Render Hotspots with projected 3D coordinates
        drawRadarHotspot(headCenter, "Head Cooling", "head");
        drawRadarHotspot(sternumMid, "Chest CPR Node", "chest");
        drawRadarHotspot(project3D(0, -48, 0), "Spine / Airway", "spine");
        drawRadarHotspot(lungR, "Lungs / Resp", "lungs");
        drawRadarHotspot(navel, "Abdomen Trauma", "abdomen");
        drawRadarHotspot(wristL, "Limb Tourniquet", "limb");

        // 5. VIEWPORT CORNER HUD TELEMETRY
        ctx.fillStyle = "rgba(56, 189, 248, 0.85)";
        ctx.font = "8px monospace";
        ctx.fillText(`ROTATION: ${Math.round((rotation % 360 + 360) % 360)}°`, 12, 20);
        ctx.fillText(`TRIAGE: ${selectedHotspot.toUpperCase()}`, 12, 30);

        ctx.fillStyle = "rgba(16, 185, 129, 0.9)";
        ctx.fillText("BPM: 74 • SPO2: 99%", w - 105, 20);
        ctx.fillText("3D BIO-MATRIX: OK", w - 105, 30);

        animRef.current = requestAnimationFrame(render);
      };

      render();
      return () => {
        if (animRef.current) cancelAnimationFrame(animRef.current);
      };
    }, [rotation, selectedHotspot]);

    // Interactive Drag to Rotate handlers
    const handleMouseDown = (e) => {
      isDraggingRef.current = true;
      lastXRef.current = e.clientX;
      setAutoRotate(false);
    };

    const handleMouseMove = (e) => {
      if (!isDraggingRef.current) return;
      const delta = e.clientX - lastXRef.current;
      setRotation((r) => (r + delta * 0.8) % 360);
      lastXRef.current = e.clientX;
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };

    const handleTouchStart = (e) => {
      if (e.touches.length > 0) {
        isDraggingRef.current = true;
        lastXRef.current = e.touches[0].clientX;
        setAutoRotate(false);
      }
    };

    const handleTouchMove = (e) => {
      if (!isDraggingRef.current || e.touches.length === 0) return;
      const delta = e.touches[0].clientX - lastXRef.current;
      setRotation((r) => (r + delta * 0.8) % 360);
      lastXRef.current = e.touches[0].clientX;
    };

    const handleTouchEnd = () => {
      isDraggingRef.current = false;
    };

    // Canvas click to select hotspot
    const handleCanvasClick = (e) => {
      const rect = canvasRef.current.getBoundingClientRect();
      const clickY = e.clientY - rect.top;
      const h = rect.height;
      if (clickY < h * 0.22) setSelectedHotspot("head");
      else if (clickY < h * 0.38) setSelectedHotspot("chest");
      else if (clickY < h * 0.52) setSelectedHotspot("abdomen");
      else setSelectedHotspot("limb");
    };

    const HOTSPOT_INFO = {
      head: { label: "Head / Cranium", guidance: "Cool scalp with cold water cloth. Elevate head 30°. Monitor for confusion or concussion.", icon: "🧠" },
      chest: { label: "Chest / CPR & Cardiac", guidance: "Place heel of hand on center of sternum. 100-120 compressions/min, 5-6cm depth. Check pulse.", icon: "❤️" },
      spine: { label: "Spine & Cervical Airway", guidance: "Do not move or rotate neck. Keep cervical spine in neutral alignment. Use log-roll if vomiting.", icon: "🦴" },
      lungs: { label: "Lungs & Respiratory", guidance: "Ensure open airway. Sit patient upright. If asthma or smoke inhalation, provide rescue spacer.", icon: "🫁" },
      abdomen: { label: "Abdomen & Internal Bleed", guidance: "Check for rigid, distended abdomen. Lie supine with knees bent to relax abdominal wall.", icon: "🩹" },
      limb: { label: "Limbs & Tourniquet Splint", guidance: "Apply firm direct pressure. If severe arterial pulsatile bleeding, apply tourniquet 5cm above wound.", icon: "🩸" }
    };

    const curHotspotInfo = HOTSPOT_INFO[selectedHotspot] || HOTSPOT_INFO.chest;

    return (
      <div style={{
        background: "#0a1124",
        borderRadius: 16,
        border: "1.5px solid #1e293b",
        padding: 12,
        marginTop: 10,
        boxShadow: "0 10px 30px rgba(0,0,0,0.45)",
        color: "#ffffff"
      }}>
        {/* Header HUD with Live Status */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 8px #10b981" }} />
            <div style={{ fontSize: 12, fontWeight: 900, color: "#38bdf8", letterSpacing: 0.5 }}>
              3D HOLOGRAPHIC ANATOMICAL SCANNER
            </div>
          </div>
          <button
            type="button"
            onClick={() => setAutoRotate(!autoRotate)}
            style={{
              padding: "4px 8px",
              fontSize: 10,
              background: autoRotate ? "#0284c7" : "rgba(255,255,255,0.08)",
              border: "1px solid rgba(56, 189, 248, 0.4)",
              borderRadius: 6,
              color: "#ffffff",
              cursor: "pointer",
              fontWeight: 800
            }}
          >
            {autoRotate ? "⏸ Pause Spin" : "🔄 Auto-Spin 360°"}
          </button>
        </div>

        {/* 3D Viewport with Drag Rotation */}
        <div
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onClick={handleCanvasClick}
          style={{
            position: "relative",
            display: "flex",
            justifyContent: "center",
            background: "#030816",
            borderRadius: 12,
            overflow: "hidden",
            cursor: "grab",
            border: "1px solid rgba(56, 189, 248, 0.2)"
          }}
        >
          <canvas
            ref={canvasRef}
            style={{ width: "100%", maxWidth: 320, height: 260, display: "block" }}
          />

          <div style={{
            position: "absolute",
            bottom: 6,
            left: 0,
            right: 0,
            textAlign: "center",
            fontSize: 9,
            color: "rgba(148, 163, 184, 0.7)",
            pointerEvents: "none"
          }}>
            👆 Drag horizontally to rotate 360° • Tap body to inspect zone
          </div>
        </div>

        {/* Quick Angle Presets */}
        <div style={{ display: "flex", justifyContent: "space-between", gap: 4, marginTop: 8 }}>
          {[
            { label: "Front (0°)", deg: 0 },
            { label: "Left Profile (90°)", deg: 90 },
            { label: "Back / Spine (180°)", deg: 180 },
            { label: "Right Profile (270°)", deg: 270 }
          ].map((btn) => (
            <button
              key={btn.deg}
              type="button"
              onClick={() => {
                setRotation(btn.deg);
                setAutoRotate(false);
              }}
              style={{
                flex: 1,
                padding: "4px 2px",
                fontSize: 9,
                fontWeight: 800,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 6,
                color: "#94a3b8",
                cursor: "pointer"
              }}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* Hotspot Zone Selector Buttons */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 8, justifyContent: "center" }}>
          {[
            { key: "head", label: "🧠 Head / Brain" },
            { key: "chest", label: "❤️ Chest / CPR" },
            { key: "spine", label: "🦴 Spine / Neck" },
            { key: "lungs", label: "🫁 Lungs / Resp" },
            { key: "abdomen", label: "🩹 Abdomen" },
            { key: "limb", label: "🩸 Limbs / Bleed" }
          ].map((z) => (
            <button
              key={z.key}
              type="button"
              onClick={() => setSelectedHotspot(z.key)}
              style={{
                padding: "5px 9px",
                fontSize: 10,
                fontWeight: 800,
                borderRadius: 14,
                border: "1px solid",
                borderColor: selectedHotspot === z.key ? "#38bdf8" : "rgba(255,255,255,0.15)",
                background: selectedHotspot === z.key ? "rgba(2, 132, 199, 0.35)" : "rgba(255,255,255,0.05)",
                color: selectedHotspot === z.key ? "#38bdf8" : "#cbd5e1",
                cursor: "pointer"
              }}
            >
              {z.label}
            </button>
          ))}
        </div>

        {/* Selected Hotspot Action Guidance Card */}
        <div style={{
          marginTop: 10,
          background: "rgba(2, 132, 199, 0.12)",
          border: "1px solid rgba(56, 189, 248, 0.3)",
          borderRadius: 10,
          padding: "10px 12px"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
            <span style={{ fontSize: 16 }}>{curHotspotInfo.icon}</span>
            <div style={{ fontSize: 12, fontWeight: 900, color: "#38bdf8" }}>
              {curHotspotInfo.label} — Clinical Protocol:
            </div>
          </div>
          <div style={{ fontSize: 11, color: "#e2e8f0", lineHeight: 1.45 }}>
            {curHotspotInfo.guidance}
          </div>
        </div>
      </div>
    );
  }

  // --- DUAL PLATFORM GATEWAY SCREEN (PURE WHITE MOBILE CONTAINER) ---
  function PortalChoiceScreen({ onSelectPlatform, lang, setLang }) {
    const t = I18N[lang] || I18N.en;

    return (
      <div style={{
        minHeight: "100vh",
        background: "#f1f5f9",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      }}>
        {/* MOBILE VIEWPORT CONTAINER */}
        <div style={{
          width: "100%",
          maxWidth: 440,
          minHeight: "100vh",
          background: "#ffffff",
          boxShadow: "0 10px 40px rgba(15, 23, 42, 0.08)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          borderLeft: "1px solid #e2e8f0",
          borderRight: "1px solid #e2e8f0",
          padding: "20px 16px"
        }}>
          <div>
            {/* Top Language Bar */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 18 }}>🛡️</span>
                <span style={{ fontSize: 12, fontWeight: 900, color: "#0f172a", letterSpacing: 0.5 }}>FUSION 2026</span>
              </div>
              <div style={{
                display: "flex",
                gap: 4,
                background: "#f8fafc",
                padding: "3px 6px",
                borderRadius: 20,
                border: "1px solid #e2e8f0"
              }}>
                {["en", "hi", "mr"].map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setLang(l)}
                    style={{
                      border: "none",
                      background: lang === l ? "#0284c7" : "transparent",
                      color: lang === l ? "#ffffff" : "#64748b",
                      fontSize: 10,
                      fontWeight: 800,
                      padding: "4px 10px",
                      borderRadius: 16,
                      cursor: "pointer"
                    }}
                  >
                    {l === "en" ? "EN" : l === "hi" ? "HI" : "MR"}
                  </button>
                ))}
              </div>
            </div>

            {/* Title & Subtitle */}
            <div style={{ textAlign: "center", marginBottom: 22 }}>
              <h1 style={{
                fontSize: 22,
                fontWeight: 900,
                margin: "0 0 6px 0",
                color: "#0f172a",
                letterSpacing: -0.4
              }}>
                {t.portalTitle}
              </h1>
              <p style={{ fontSize: 12, color: "#64748b", margin: 0, lineHeight: 1.4 }}>
                {t.portalSubtitle}
              </p>
            </div>

            {/* TWO MOBILE APPLICATION CARDS (STACKED VERTICALLY IN WHITE TINTS) */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              {/* Card 1: VetNova (Animal Healthcare Mobile App) */}
              <div
                id="portal-card-vetnova"
                onClick={() => onSelectPlatform("vetnova")}
                style={{
                  background: "#ffffff",
                  border: "1.5px solid #a7f3d0",
                  borderRadius: 16,
                  padding: "18px",
                  cursor: "pointer",
                  boxShadow: "0 4px 16px rgba(16, 185, 129, 0.08)",
                  transition: "transform 0.15s ease",
                  position: "relative"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 28, background: "#ecfdf5", padding: "6px 10px", borderRadius: 10 }}>🐾</span>
                    <div>
                      <h2 style={{ fontSize: 18, fontWeight: 900, margin: 0, color: "#065f46" }}>
                        {t.vetnovaTitle}
                      </h2>
                      <span style={{ fontSize: 10, color: "#059669", fontWeight: 700 }}>Veterinary Intelligence</span>
                    </div>
                  </div>
                  <span style={{ fontSize: 9, background: "#ecfdf5", color: "#065f46", border: "1px solid #a7f3d0", padding: "3px 8px", borderRadius: 10, fontWeight: 800 }}>
                    ACTIVE
                  </span>
                </div>

                <p style={{ fontSize: 12, color: "#475569", lineHeight: 1.45, margin: "0 0 12px 0" }}>
                  {t.vetnovaDesc}
                </p>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 14 }}>
                  {["61-Class Neural ML", "1962 IVR Helpline", "Drug Withdrawal", "Doctor Booking"].map((chip) => (
                    <span key={chip} style={{ fontSize: 9, background: "#f8fafc", border: "1px solid #e2e8f0", padding: "3px 6px", borderRadius: 6, color: "#334155", fontWeight: 700 }}>
                      ✓ {chip}
                    </span>
                  ))}
                </div>

                <button
                  type="button"
                  style={{
                    width: "100%",
                    padding: "11px",
                    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                    border: "none",
                    borderRadius: 10,
                    color: "#ffffff",
                    fontSize: 13,
                    fontWeight: 800,
                    cursor: "pointer",
                    boxShadow: "0 3px 10px rgba(16, 185, 129, 0.25)"
                  }}
                >
                  {t.vetnovaBtn}
                </button>
              </div>

              {/* Card 2: HealthNova (Emergency Disaster Medical Mobile App) */}
              <div
                id="portal-card-healthnova"
                onClick={() => onSelectPlatform("healthnova")}
                style={{
                  background: "#ffffff",
                  border: "1.5px solid #bae6fd",
                  borderRadius: 16,
                  padding: "18px",
                  cursor: "pointer",
                  boxShadow: "0 4px 16px rgba(2, 132, 199, 0.1)",
                  transition: "transform 0.15s ease",
                  position: "relative"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <img
                      src="/healthnova-logo.png"
                      alt="HealthNova"
                      style={{ width: 42, height: 42, objectFit: "contain", borderRadius: 10, background: "#f0f9ff", border: "1px solid #bae6fd", padding: 2 }}
                    />
                    <div>
                      <h2 style={{ fontSize: 18, fontWeight: 900, margin: 0, color: "#0284c7" }}>
                        {t.healthnovaTitle}
                      </h2>
                      <span style={{ fontSize: 10, color: "#0369a1", fontWeight: 700 }}>Disaster Response App</span>
                    </div>
                  </div>
                  <span style={{ fontSize: 9, background: "#f0f9ff", color: "#0369a1", border: "1px solid #bae6fd", padding: "3px 8px", borderRadius: 10, fontWeight: 800 }}>
                    5-TIER SUITE
                  </span>
                </div>

                <p style={{ fontSize: 12, color: "#475569", lineHeight: 1.45, margin: "0 0 12px 0" }}>
                  {t.healthnovaDesc}
                </p>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 14 }}>
                  {["Citizen Triage", "Doctor Video & Voice Calls", "Real 3D Body Guide", "Dijkstra Routing"].map((chip) => (
                    <span key={chip} style={{ fontSize: 9, background: "#f8fafc", border: "1px solid #e2e8f0", padding: "3px 6px", borderRadius: 6, color: "#334155", fontWeight: 700 }}>
                      ✓ {chip}
                    </span>
                  ))}
                </div>

                <button
                  type="button"
                  style={{
                    width: "100%",
                    padding: "11px",
                    background: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
                    border: "none",
                    borderRadius: 10,
                    color: "#ffffff",
                    fontSize: 13,
                    fontWeight: 800,
                    cursor: "pointer",
                    boxShadow: "0 3px 10px rgba(2, 132, 199, 0.25)"
                  }}
                >
                  {t.healthnovaBtn}
                </button>
              </div>

            </div>
          </div>

          {/* Mobile Footer */}
          <div style={{ textAlign: "center", marginTop: 20, fontSize: 11, color: "#94a3b8" }}>
            🔒 Mobile Medical & Veterinary Suite • Fusion 2026
          </div>
        </div>
      </div>
    );
  }

  // --- HEALTHNOVA ANIMATED SPLASH SCREEN ---
  function HealthNovaSplashScreen({ onComplete, lang }) {
    const t = I18N[lang] || I18N.en;
    const [progress, setProgress] = useState(25);

    useEffect(() => {
      const timer1 = setTimeout(() => setProgress(65), 500);
      const timer2 = setTimeout(() => setProgress(100), 1200);
      const timer3 = setTimeout(() => onComplete(), 1800);
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    }, [onComplete]);

    return (
      <div style={{
        minHeight: "100vh",
        background: "#ffffff",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 16,
        fontFamily: "system-ui, sans-serif"
      }}>
        <div style={{ textAlign: "center", maxWidth: 360, width: "100%" }}>
          <div style={{ position: "relative", width: 120, height: 120, margin: "0 auto 16px" }}>
            <img
              src="/healthnova-logo.png"
              alt="HealthNova Logo"
              style={{
                position: "relative",
                width: 120,
                height: 120,
                objectFit: "contain",
                borderRadius: 20,
                background: "#f0f9ff",
                border: "2px solid #bae6fd",
                padding: 6,
                boxShadow: "0 10px 24px rgba(2, 132, 199, 0.12)"
              }}
            />
          </div>

          <h1 style={{ fontSize: 26, fontWeight: 900, letterSpacing: -0.5, color: "#0f172a", margin: "0 0 4px 0" }}>
            HEALTHNOVA
          </h1>
          <div style={{ fontSize: 12, color: "#0284c7", fontWeight: 700, letterSpacing: 0.3, marginBottom: 20 }}>
            {t.splashTagline}
          </div>

          <div style={{ width: "100%", height: 6, background: "#e2e8f0", borderRadius: 10, margin: "0 auto 10px", overflow: "hidden" }}>
            <div style={{ width: `${progress}%`, height: "100%", background: "linear-gradient(90deg, #0284c7, #10b981)", transition: "width 0.4s ease-out" }} />
          </div>

          <div style={{ fontSize: 11, color: "#64748b" }}>
            {progress < 100 ? t.splashLoading : t.splashReady}
          </div>

          <button
            type="button"
            onClick={onComplete}
            style={{
              marginTop: 18,
              background: "#f1f5f9",
              border: "1px solid #cbd5e1",
              color: "#475569",
              fontSize: 11,
              fontWeight: 700,
              padding: "6px 14px",
              borderRadius: 20,
              cursor: "pointer"
            }}
          >
            Skip Splash →
          </button>
        </div>
      </div>
    );
  }

  // --- HEALTHNOVA MASTER MOBILE APPLICATION (WITH ROLE ISOLATION & DYNAMIC DOCTOR WEBRTC) ---
  function HealthNovaMasterShell({ onOpenPortal, onOpenVetNova }) {
    const [lang, setLang] = useState("en");
    const t = I18N[lang] || I18N.en;

    // Selected Role: null (displays Role Picker like VetNova Image 1) | "citizen" | "doctor" | "government" | "ambulance" | "medicine" | "aerorelife"
    const [selectedRole, setSelectedRole] = useState(() => {
      try {
        const p = new URLSearchParams(window.location.search).get("role");
        if (p) return p.toLowerCase();
      } catch (e) {}
      return null;
    });

    // User Login State (persisted in localStorage)
    const [user, setUser] = useState(() => {
      try {
        const saved = localStorage.getItem("healthnova_user");
        return saved ? JSON.parse(saved) : null;
      } catch (e) {
        return null;
      }
    });

    const [loginName, setLoginName] = useState("");
    const [loginPhone, setLoginPhone] = useState("");
    const [loginCity, setLoginCity] = useState("Pune");

    // News Article Modal State & Sentinel Radar Interactive Engine
    const [selectedNews, setSelectedNews] = useState(null);
    const [newsFilter, setNewsFilter] = useState("all");
    const [expandedRumorId, setExpandedRumorId] = useState(null);
    const [activeAudioNewsId, setActiveAudioNewsId] = useState(null);
    const [audioVoiceLang, setAudioVoiceLang] = useState("en");
    const [smsBeaconCopiedId, setSmsBeaconCopiedId] = useState(null);
    const [checkedTasks, setCheckedTasks] = useState({});

    // Dynamic Doctors System (Stored in localStorage and updated in real-time)
    const [doctorsList, setDoctorsList] = useState(getStoredDoctors);
    const [docRegName, setDocRegName] = useState("");
    const [docRegSpec, setDocRegSpec] = useState("Emergency Medicine & Disaster Trauma");
    const [docRegNo, setDocRegNo] = useState("");
    const [docRegHospital, setDocRegHospital] = useState("District General Hospital");
    const [docRegPhone, setDocRegPhone] = useState("");
    const [docRegAvailable, setDocRegAvailable] = useState(true);

    // Active Calling States
    const [voiceCallDoctor, setVoiceCallDoctor] = useState(null);
    const [voiceCallSeconds, setVoiceCallSeconds] = useState(0);
    const [voiceCallMuted, setVoiceCallMuted] = useState(false);
    const [voiceCallSpeaker, setVoiceCallSpeaker] = useState(true);

    const [videoCallDoctor, setVideoCallDoctor] = useState(null);
    const [jitsiRoomId, setJitsiRoomId] = useState("");

    // Incoming Call State (triggers doctor modal in real time)
    const [incomingCall, setIncomingCall] = useState(null);

    // Cross-tab and local real-time sync for doctor registration and incoming call alert
    useEffect(() => {
      const syncState = () => {
        try {
          const rawDoc = localStorage.getItem("healthnova_doctors");
          if (rawDoc) {
            const parsed = JSON.parse(rawDoc);
            if (Array.isArray(parsed)) setDoctorsList(parsed);
          }
          const rawCall = localStorage.getItem("healthnova_incoming_call");
          if (rawCall) {
            const callData = JSON.parse(rawCall);
            // Valid if created within last 90 seconds and still ringing
            if (Date.now() - callData.timestamp < 90000 && callData.status === "ringing") {
              setIncomingCall((prev) => (prev && prev.callId === callData.callId ? prev : callData));
            } else if (callData.status !== "ringing") {
              setIncomingCall(null);
            }
          } else {
            setIncomingCall(null);
          }
        } catch (err) {}
      };

      const handleStorageChange = (e) => {
        if (e.key === "healthnova_doctors") {
          setDoctorsList(getStoredDoctors());
        }
        if (e.key === "healthnova_incoming_call") {
          syncState();
        }
      };

      const handleCustomDocUpdate = (e) => {
        if (e.detail) setDoctorsList(e.detail);
        else setDoctorsList(getStoredDoctors());
      };

      const handleCustomCall = (e) => {
        if (e.detail) setIncomingCall(e.detail);
      };

      window.addEventListener("storage", handleStorageChange);
      window.addEventListener("healthnova_doctors_updated", handleCustomDocUpdate);
      window.addEventListener("healthnova_incoming_call", handleCustomCall);

      // Fast polling (600ms) guarantees instant sync across all tabs and single-page flows
      const pollTimer = setInterval(syncState, 600);

      return () => {
        window.removeEventListener("storage", handleStorageChange);
        window.removeEventListener("healthnova_doctors_updated", handleCustomDocUpdate);
        window.removeEventListener("healthnova_incoming_call", handleCustomCall);
        clearInterval(pollTimer);
      };
    }, []);

    // Timer for voice call duration
    useEffect(() => {
      let interval = null;
      if (voiceCallDoctor) {
        interval = setInterval(() => {
          setVoiceCallSeconds((s) => s + 1);
        }, 1000);
      } else {
        setVoiceCallSeconds(0);
      }
      return () => {
        if (interval) clearInterval(interval);
      };
    }, [voiceCallDoctor]);

    // Calamity State in User Tier
    const [selectedCalamity, setSelectedCalamity] = useState("flood");
    const [calamityMode, setCalamityMode] = useState("first_aid");

    // Live Device Geolocation State
    const [locationState, setLocationState] = useState({
      status: "prompt",
      lat: 18.5204,
      lng: 73.8567,
      accuracy: null,
      error: null
    });

    // --- RESCUEGRID AI AUTHORITATIVE DISASTER STATE (SHARED ACROSS GOVT, AMBULANCE & MEDICINE) ---
    const [rescueGridState, setRescueGridState] = useState(null);
    const [isRecalculating, setIsRecalculating] = useState(false);

    const fetchRescueGridState = async () => {
      try {
        const res = await fetch("/api/rescuegrid/state");
        const data = await res.json();
        if (data && data.ok && data.state) {
          setRescueGridState(data.state);
          localStorage.setItem("rescuegrid_shared_state", JSON.stringify(data.state));
        }
      } catch (e) {
        const cached = localStorage.getItem("rescuegrid_shared_state");
        if (cached) {
          try { setRescueGridState(JSON.parse(cached)); } catch (_) {}
        }
      }
    };

    useEffect(() => {
      fetchRescueGridState();
      const pollTimer = setInterval(fetchRescueGridState, 1500);
      const handleStateChange = (e) => {
        if (e.detail) setRescueGridState(e.detail);
        else fetchRescueGridState();
      };
      window.addEventListener("rescuegrid:statechange", handleStateChange);
      return () => {
        clearInterval(pollTimer);
        window.removeEventListener("rescuegrid:statechange", handleStateChange);
      };
    }, []);

    const handleRecalculatePlan = async (roadOverrides, hospitalOverrides) => {
      setIsRecalculating(true);
      try {
        const res = await fetch("/api/rescuegrid/recalculate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            version: "v2.0.0-flood-recalculated",
            roadOverrides: roadOverrides || { "ROAD-03": "VERIFIED_CLOSED" },
            hospitalOverrides: hospitalOverrides || { "HOSP-01": { availableBeds: 6 } }
          })
        });
        const data = await res.json();
        if (data && data.ok && data.state) {
          setRescueGridState(data.state);
          localStorage.setItem("rescuegrid_shared_state", JSON.stringify(data.state));
          window.dispatchEvent(new CustomEvent("rescuegrid:statechange", { detail: data.state }));
        }
      } catch (e) {
        console.warn("Recalculate error:", e);
      } finally {
        setIsRecalculating(false);
      }
    };

    const handleResetPlan = async () => {
      try {
        const res = await fetch("/api/rescuegrid/reset", { method: "POST" });
        const data = await res.json();
        if (data && data.ok && data.state) {
          setRescueGridState(data.state);
          localStorage.setItem("rescuegrid_shared_state", JSON.stringify(data.state));
          window.dispatchEvent(new CustomEvent("rescuegrid:statechange", { detail: data.state }));
        }
      } catch (e) {}
    };

    const handleToggleRoadClosure = async (roadId, newState) => {
      try {
        const cur = (rescueGridState && rescueGridState.roadStates && rescueGridState.roadStates[roadId]) || "FLOOD_EXPOSED";
        const targetState = newState || (cur === "VERIFIED_CLOSED" ? "FLOOD_EXPOSED" : "VERIFIED_CLOSED");
        await fetch("/api/rescuegrid/roads/update-state", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ roadId, state: targetState, rationale: "Field controller update in RescueGrid Command Center" })
        });
        fetchRescueGridState();
      } catch (e) {}
    };

    const handleSetHospitalCapacity = async (hospitalId, availableBeds) => {
      try {
        await fetch("/api/rescuegrid/hospitals/update-capacity", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ hospitalId, availableBeds, reason: "Simulated ward flooding" })
        });
        fetchRescueGridState();
      } catch (e) {}
    };

    const requestLiveLocation = () => {
      if (!navigator.geolocation) {
        setLocationState((prev) => ({ ...prev, status: "denied", error: "Geolocation unsupported" }));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocationState({
            status: "granted",
            lat: Number(pos.coords.latitude.toFixed(4)),
            lng: Number(pos.coords.longitude.toFixed(4)),
            accuracy: Math.round(pos.coords.accuracy),
            error: null
          });
        },
        (err) => {
          setLocationState((prev) => ({ ...prev, status: "denied", error: err.message }));
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    };

    // Diagnosis State
    const [selectedSymptoms, setSelectedSymptoms] = useState([]);
    const [customSymptomText, setCustomSymptomText] = useState("");
    const [isListening, setIsListening] = useState(false);
    const [isInjured, setIsInjured] = useState(false);
    const [injuryImagePreview, setInjuryImagePreview] = useState(null);
    const [diagnosticReport, setDiagnosticReport] = useState(null);

    // Operations / Outbox Section & Sync State (GIS Map open by default in user portal)
    const [opsSectionOpen, setOpsSectionOpen] = useState(true);
    const [outboxOpen, setOutboxOpen] = useState(false);
    const [outboxItems, setOutboxItems] = useState([]);
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    // --- AERORELIEF EMERGENCY AIR-SUPPLY COORDINATION STATE (PRD SECTION 6) ---
    const [aeroMissions, setAeroMissions] = useState([]);
    const [aeroSubmitting, setAeroSubmitting] = useState(false);
    const [aeroSubmitFeedback, setAeroSubmitFeedback] = useState(null);
    const [aeroSelectedZoneId, setAeroSelectedZoneId] = useState("AERO-ZONE-PUNE-02");
    const [aeroRequestForm, setAeroRequestForm] = useState({
      community: "Pulachi Wadi Submersion Enclave",
      supplies: "Kit A: Hydration & Cholera (150 Packs), Kit B: Trauma (40 Kits)",
      quantity: "190 Units Total",
      patientCount: 6,
      urgency: "critical",
      originStock: "Depot-01 (Shivajinagar Central Depot — 14,500 packs in stock)",
      contact: "Govt UHF Radio Grid Channel 4",
      candidateZoneId: "AERO-ZONE-PUNE-02",
      notes: "Pulachi Wadi Causeway ROAD-01 VERIFIED_CLOSED. Stranded citizens isolated on terrace."
    });

    const fetchAeroMissions = async () => {
      try {
        const res = await fetch("/api/rescuegrid/airlift-request");
        const data = await res.json();
        if (data && data.ok && Array.isArray(data.requests)) {
          setAeroMissions(data.requests);
        }
      } catch (e) {
        console.warn("AeroRelief fetch error:", e);
      }
    };

    useEffect(() => {
      fetchAeroMissions();
      const interval = setInterval(fetchAeroMissions, 2500);
      return () => clearInterval(interval);
    }, []);

    const handleCreateAeroMission = async (e) => {
      if (e) e.preventDefault();
      setAeroSubmitting(true);
      setAeroSubmitFeedback(null);
      try {
        const res = await fetch("/api/rescuegrid/airlift-request", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            candidateZoneId: aeroRequestForm.candidateZoneId || "AERO-ZONE-PUNE-01",
            community: aeroRequestForm.community,
            supplies: aeroRequestForm.supplies,
            quantity: aeroRequestForm.quantity,
            patientCount: Number(aeroRequestForm.patientCount) || 1,
            urgency: aeroRequestForm.urgency,
            originStock: aeroRequestForm.originStock,
            contact: aeroRequestForm.contact,
            requestedBy: "SEOC Emergency Logistics Coordinator",
            notes: aeroRequestForm.notes
          })
        });
        const data = await res.json();
        if (data && data.ok) {
          setAeroSubmitFeedback({
            type: "success",
            msg: `AeroRelief request ${data.requestId} created with status 'SUBMITTED FOR REVIEW'. Missing human checks highlighted.`
          });
          fetchAeroMissions();
          fetchRescueGridState();
        } else {
          setAeroSubmitFeedback({ type: "error", msg: data.message || "Failed to submit request." });
        }
      } catch (err) {
        setAeroSubmitFeedback({ type: "error", msg: err.message });
      } finally {
        setAeroSubmitting(false);
      }
    };

    const handleUpdateAeroMissionStatus = async (requestId, nextStatus, reviewOwner) => {
      try {
        const res = await fetch("/api/rescuegrid/airlift-request/update-status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            requestId,
            status: nextStatus,
            reviewOwner: reviewOwner || "Capt. V. Nair (SEOC Aviation Liaison)",
            notes: `State transitioned to ${nextStatus.toUpperCase()} during live command simulation.`
          })
        });
        const data = await res.json();
        if (data && data.ok) {
          fetchAeroMissions();
          fetchRescueGridState();
        }
      } catch (e) {
        console.warn("Status update error:", e);
      }
    };

    // Online/Offline tracking
    useEffect(() => {
      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);
      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);
      return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      };
    }, []);

    const loadOutbox = async () => {
      if (window.HealthNovaStorage) {
        try {
          const items = await window.HealthNovaStorage.getOutboxIncidents();
          setOutboxItems(items || []);
        } catch (e) {
          console.warn("Outbox load error:", e);
        }
      }
    };

    useEffect(() => {
      loadOutbox();
      const interval = setInterval(loadOutbox, 5000);
      return () => clearInterval(interval);
    }, []);

    // Strict 10-Digit Phone Handler for Citizen Login
    const handleLoginSubmit = (e) => {
      e.preventDefault();
      const cleanPhone = loginPhone.replace(/\D/g, "");
      if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
        alert("Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.");
        return;
      }
      const newUser = {
        name: loginName.trim() || "Field Citizen",
        phone: cleanPhone,
        city: loginCity.trim() || "Pune"
      };
      localStorage.setItem("healthnova_user", JSON.stringify(newUser));
      setUser(newUser);
    };

    const handleLogout = () => {
      localStorage.removeItem("healthnova_user");
      setUser(null);
    };

    // Strict 10-Digit Phone Handler for Doctor Registration
    const handleDoctorRegister = (e) => {
      e.preventDefault();
      const cleanPhone = docRegPhone.replace(/\D/g, "");
      if (!docRegName.trim()) {
        alert("Please enter doctor name.");
        return;
      }
      if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
        alert("Doctor mobile number must be strictly 10 digits starting with 6, 7, 8, or 9.");
        return;
      }

      const newDoc = {
        id: `doc-${Date.now()}`,
        name: docRegName.trim(),
        spec: docRegSpec.trim(),
        regNo: docRegNo.trim() || `MCI-MH-${Math.floor(1000 + Math.random() * 9000)}`,
        hospital: docRegHospital.trim() || "District General Hospital",
        phone: cleanPhone,
        available: docRegAvailable
      };

      const updated = [newDoc, ...doctorsList];
      setDoctorsList(updated);
      saveStoredDoctors(updated);
      try {
        window.dispatchEvent(new CustomEvent("healthnova_doctors_updated", { detail: updated }));
      } catch (e) {}

      setDocRegName("");
      setDocRegPhone("");
      setDocRegNo("");
      alert(`Doctor ${newDoc.name} registered successfully! Users can now see and call this doctor dynamically in real time.`);
    };

    // Real-Time Video Call Trigger (broadcasts incoming call alert to doctor)
    const initiateVideoCall = (doctor) => {
      const roomId = `hn-meet-${Date.now().toString().slice(-6)}`;
      setJitsiRoomId(roomId);
      setVideoCallDoctor(doctor);

      // Broadcast incoming call session to doctor view
      const callSession = {
        callId: `call-${Date.now()}`,
        roomId,
        callerName: user ? user.name : "Field Citizen",
        callerPhone: user ? user.phone : "108-Emergency",
        doctorId: doctor.id,
        doctorName: doctor.name,
        timestamp: Date.now(),
        status: "ringing"
      };
      try {
        localStorage.setItem("healthnova_incoming_call", JSON.stringify(callSession));
        window.dispatchEvent(new CustomEvent("healthnova_incoming_call", { detail: callSession }));
      } catch (err) {}
    };

    const initiateVoiceCall = (doctor) => {
      setVoiceCallDoctor(doctor);
    };

    // --- LIVE DISASTER RADIO AUDIO SYNTHESIZER (HANDS-FREE BROADCAST) ---
    const handleToggleAudioBroadcast = (newsItem, overrideLang) => {
      if (!newsItem) return;
      const targetLang = overrideLang || audioVoiceLang || lang || "en";
      if (activeAudioNewsId === newsItem.id && (!overrideLang || overrideLang === audioVoiceLang)) {
        if (window.speechSynthesis) window.speechSynthesis.cancel();
        setActiveAudioNewsId(null);
        return;
      }
      if (!window.speechSynthesis) {
        alert("Web Speech API is not supported on this browser.");
        return;
      }
      window.speechSynthesis.cancel();
      if (overrideLang) setAudioVoiceLang(overrideLang);
      const scriptText =
        (newsItem.radioScript && newsItem.radioScript[targetLang]) ||
        (newsItem.radioScript && newsItem.radioScript.en) ||
        newsItem.summary;
      const utterance = new SpeechSynthesisUtterance(scriptText);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      if (targetLang === "hi") utterance.lang = "hi-IN";
      else if (targetLang === "mr") utterance.lang = "mr-IN";
      else utterance.lang = "en-IN";
      utterance.onend = () => setActiveAudioNewsId(null);
      utterance.onerror = () => setActiveAudioNewsId(null);
      setActiveAudioNewsId(newsItem.id);
      window.speechSynthesis.speak(utterance);
    };

    const handleStopAudioBroadcast = () => {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      setActiveAudioNewsId(null);
    };

    // --- ZERO-INTERNET SATELLITE / SMS BEACON GENERATOR ---
    const handleCopySmsBeacon = (newsItem) => {
      const userLat = locationState.lat ? locationState.lat.toFixed(4) : "18.5204";
      const userLng = locationState.lng ? locationState.lng.toFixed(4) : "73.8567";
      const uName = (user && user.name) ? user.name : "HealthNova Citizen";
      const shelter = (newsItem.nearestShelters && newsItem.nearestShelters[0])
        ? newsItem.nearestShelters[0].name
        : "Municipal Relief Camp";
      const beaconText = `[HEALTHNOVA SOS BEACON] Name: ${uName} | GPS: ${userLat}, ${userLng} | Hazard: ${newsItem.tag} | Status: SAFE / MONITORED | Nearest Shelter: ${shelter} | Emergency 112/1077`;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(beaconText).catch(() => {});
      }
      setSmsBeaconCopiedId(newsItem.id);
      setTimeout(() => setSmsBeaconCopiedId(null), 3500);
    };

    const toggleTaskChecked = (taskKey) => {
      setCheckedTasks((prev) => ({
        ...prev,
        [taskKey]: !prev[taskKey]
      }));
    };

    const toggleSymptom = (symId) => {
      setSelectedSymptoms((prev) =>
        prev.includes(symId) ? prev.filter((id) => id !== symId) : [...prev, symId]
      );
    };

    const toggleSpeechRecognition = () => {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        alert("Speech-to-Text is not supported by your current browser. Please type symptoms manually.");
        return;
      }

      if (isListening) {
        setIsListening(false);
        return;
      }

      try {
        const recognition = new SpeechRecognition();
        recognition.lang = lang === "hi" ? "hi-IN" : lang === "mr" ? "mr-IN" : "en-IN";
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        setIsListening(true);
        recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          setCustomSymptomText((prev) => (prev ? prev + " " + transcript : transcript));
          setIsListening(false);
        };
        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => setIsListening(false);
        recognition.start();
      } catch (e) {
        setIsListening(false);
      }
    };

    const handleImageUpload = (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (uploadEvt) => {
        setInjuryImagePreview(uploadEvt.target.result);
      };
      reader.readAsDataURL(file);
    };

    const generateDiagnosis = () => {
      const calamity = CALAMITY_DATA[selectedCalamity];
      let severity = "MODERATE";
      let probableCondition = "Environmental Exposure Reaction";

      if (selectedCalamity === "flood") {
        if (selectedSymptoms.includes("jaundice_eyes") || selectedSymptoms.includes("calf_pain")) {
          probableCondition = "Suspected Leptospirosis (Weil's Syndrome Risk)";
          severity = "CRITICAL 108 EMERGENCY";
        } else if (selectedSymptoms.includes("watery_diarrhea")) {
          probableCondition = "Acute Floodwater Gastroenteritis / Cholera Risk";
          severity = "HIGH URGENCY";
        } else if (selectedSymptoms.includes("trench_foot")) {
          probableCondition = "Immersion Foot / Trench Foot Tissue Maceration";
          severity = "MODERATE";
        }
      } else if (selectedCalamity === "cyclone") {
        if (selectedSymptoms.includes("hypovolemic_shock") || selectedSymptoms.includes("head_trauma")) {
          probableCondition = "Severe Debris Trauma with Hemorrhagic Shock Risk";
          severity = "CRITICAL 108 EMERGENCY";
        } else if (selectedSymptoms.includes("bleeding_laceration")) {
          probableCondition = "Deep Penetrating Laceration from Flying Shards";
          severity = "HIGH URGENCY";
        } else {
          probableCondition = "Blunt Contusion / Musculoskeletal Sprain";
          severity = "MODERATE";
        }
      } else if (selectedCalamity === "heatwave") {
        if (selectedSymptoms.includes("hyperthermia") || selectedSymptoms.includes("delirium")) {
          probableCondition = "Exertional Heat Stroke (Emergency Hyperpyrexia)";
          severity = "CRITICAL 108 EMERGENCY";
        } else if (selectedSymptoms.includes("heat_cramps") || selectedSymptoms.includes("throbbing_headache")) {
          probableCondition = "Heat Exhaustion with Hyponatremic Depletion";
          severity = "HIGH URGENCY";
        }
      } else {
        if (selectedSymptoms.includes("crush_limb") || selectedSymptoms.includes("smoke_cough")) {
          probableCondition = "Crush Injury / Toxic Inhalation Syndrome";
          severity = "CRITICAL 108 EMERGENCY";
        } else {
          probableCondition = "Thermal Burns / Blunt Impact Contusion";
          severity = "MODERATE";
        }
      }

      setDiagnosticReport({
        calamity: selectedCalamity,
        probableCondition,
        severity,
        symptomsEvaluated: [...selectedSymptoms],
        additionalNotes: customSymptomText,
        injuryImageAttached: Boolean(injuryImagePreview),
        remedies: calamity.remedies,
        medications: calamity.medications,
        timestamp: new Date().toISOString()
      });
    };

    const sendReportToOutbox = async () => {
      if (!diagnosticReport || !window.HealthNovaStorage) return;
      const clientIncidentId = `hn-client-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const payload = {
        clientIncidentId,
        category: selectedCalamity === "flood" ? "medical_supply" : "injury",
        urgency: diagnosticReport.severity.includes("CRITICAL") ? "critical" : "high",
        location: {
          type: "Point",
          coordinates: [locationState.lng, locationState.lat]
        },
        locationAccuracyM: locationState.accuracy || 12,
        peopleAffected: 1,
        requestText: `[OFFLINE CLINICAL TRIAGE] ${diagnosticReport.probableCondition} (Calamity: ${selectedCalamity.toUpperCase()}). Patient Phone: ${user ? user.phone : "Unregistered"}. Symptoms: ${diagnosticReport.symptomsEvaluated.join(", ")}; Notes: ${diagnosticReport.additionalNotes || "None"}`,
        createdAtDevice: new Date().toISOString(),
        sourceType: "field_responder",
        dataMode: "simulated"
      };

      try {
        await window.HealthNovaStorage.enqueueIncident(payload);
        if (navigator.onLine) {
          await window.HealthNovaStorage.flushOutbox();
        }
        await loadOutbox();
        alert(`Incident report saved to offline Outbox (ID: ${clientIncidentId}).`);
      } catch (e) {
        alert("Enqueued to offline storage.");
      }
    };

    const curCalamity = CALAMITY_DATA[selectedCalamity];

    const formatCallTime = (secs) => {
      const m = Math.floor(secs / 60);
      const s = secs % 60;
      return `${m < 10 ? "0" : ""}${m}:${s < 10 ? "0" : ""}${s}`;
    };

    // =========================================================================
    // SCREEN 1: PORTAL / ROLE SELECTION (STYLED EXACTLY LIKE VETNOVA IMAGE 1)
    // =========================================================================
    if (!selectedRole) {
      return (
        <div style={{
          minHeight: "100vh",
          background: "#e2e9e8",
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        }}>
          {/* MOBILE VIEWPORT CONTAINER */}
          <div style={{
            width: "100%",
            maxWidth: 440,
            minHeight: "100vh",
            background: "linear-gradient(180deg, #fbfcfc 0%, #f4f8f6 38%, #f0f5f3 100%)",
            boxShadow: "0 10px 40px rgba(15, 23, 42, 0.08)",
            padding: "20px 16px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            borderLeft: "1px solid rgba(10, 61, 56, 0.09)",
            borderRight: "1px solid rgba(10, 61, 56, 0.09)"
          }}>
            {/* Top Navigation & Language */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <img src="/healthnova-logo.png" alt="HealthNova" style={{ width: 28, height: 28, objectFit: "contain" }} />
                <span style={{ fontSize: 14, fontWeight: 900, color: "#065f46" }}>HealthNova</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <button
                  type="button"
                  onClick={onOpenVetNova}
                  style={{
                    background: "#ecfdf5",
                    border: "1.5px solid #a7f3d0",
                    color: "#065f46",
                    fontSize: 10,
                    fontWeight: 900,
                    padding: "3px 8px",
                    borderRadius: 14,
                    cursor: "pointer"
                  }}
                  title="Switch to VetNova Veterinary Platform"
                >
                  🐾 VetNova
                </button>
                <button
                  type="button"
                  onClick={onOpenPortal}
                  style={{
                    background: "#f1f5f9",
                    border: "1px solid #cbd5e1",
                    color: "#475569",
                    fontSize: 10,
                    fontWeight: 800,
                    padding: "3px 7px",
                    borderRadius: 14,
                    cursor: "pointer"
                  }}
                  title="Return to Main Platforms Hub"
                >
                  ⇋ Hub
                </button>
                {["en", "hi", "mr"].map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setLang(l)}
                    style={{
                      border: "1px solid #cbd5e1",
                      background: lang === l ? "#116b62" : "#ffffff",
                      color: lang === l ? "#ffffff" : "#475569",
                      fontSize: 10,
                      fontWeight: 800,
                      padding: "3px 8px",
                      borderRadius: 14,
                      cursor: "pointer"
                    }}
                  >
                    {l.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Top "Allow location" pill (as seen in Image 1) */}
            <div style={{ textAlign: "center", marginBottom: 18 }}>
              <button
                type="button"
                onClick={requestLiveLocation}
                style={{
                  background: locationState.status === "granted" ? "#116b62" : "#134e4a",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: 24,
                  padding: "8px 22px",
                  fontSize: 13,
                  fontWeight: 800,
                  cursor: "pointer",
                  boxShadow: "0 2px 8px rgba(17, 107, 98, 0.3)"
                }}
              >
                {locationState.status === "granted" ? "✓ Location Allowed" : t.allowLocationPill}
              </button>
            </div>

            {/* VERTICAL ROLE CARDS (STYLED EXACTLY LIKE VETNOVA IMAGE 1) */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

              {/* Card 1: Citizen / User */}
              <div
                onClick={() => setSelectedRole("citizen")}
                style={{
                  background: "#ffffff",
                  borderRadius: 18,
                  padding: "16px 18px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
                  border: "1px solid rgba(0,0,0,0.03)"
                }}
              >
                <div style={{ fontSize: 36, lineHeight: 1 }}>👤</div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: "#061018" }}>
                    {t.roleCitizenTitle}
                  </div>
                  <div style={{ fontSize: 12, color: "#4e5c66", marginTop: 2 }}>
                    {t.roleCitizenSub}
                  </div>
                </div>
              </div>

              {/* Card 2: Veterinarian / Emergency Doctor */}
              <div
                onClick={() => setSelectedRole("doctor")}
                style={{
                  background: "#ffffff",
                  borderRadius: 18,
                  padding: "16px 18px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
                  border: "1px solid rgba(0,0,0,0.03)"
                }}
              >
                <div style={{ fontSize: 36, lineHeight: 1 }}>👨‍⚕️</div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: "#061018" }}>
                    {t.roleDoctorTitle}
                  </div>
                  <div style={{ fontSize: 12, color: "#4e5c66", marginTop: 2 }}>
                    {t.roleDoctorSub}
                  </div>
                </div>
              </div>

              {/* Card 3: Disaster E-Pharmacy & Medical Stores */}
              <div
                onClick={() => setSelectedRole("medicine")}
                style={{
                  background: "#ffffff",
                  borderRadius: 18,
                  padding: "16px 18px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
                  borderLeft: "5px solid #10b981",
                  border: "1px solid rgba(0,0,0,0.03)",
                  borderLeftWidth: 5
                }}
              >
                <div style={{ fontSize: 36, lineHeight: 1 }}>🏪</div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: "#061018" }}>
                    {t.roleMedTitle}
                  </div>
                  <div style={{ fontSize: 12, color: "#4e5c66", marginTop: 2 }}>
                    {t.roleMedSub}
                  </div>
                </div>
              </div>

              {/* Card 4: Delivery / 108 Ambulance Partner */}
              <div
                onClick={() => setSelectedRole("ambulance")}
                style={{
                  background: "#ffffff",
                  borderRadius: 18,
                  padding: "16px 18px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
                  borderLeft: "5px solid #2563eb",
                  border: "1px solid rgba(0,0,0,0.03)",
                  borderLeftWidth: 5
                }}
              >
                <div style={{ fontSize: 36, lineHeight: 1 }}>🛵</div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 16, fontWeight: 900, color: "#061018" }}>{t.roleAmbTitle}</span>
                    <span style={{ fontSize: 10, background: "#dbeafe", color: "#1d4ed8", padding: "2px 6px", borderRadius: 10, fontWeight: 800 }}>🚀 {t.roleAmbBadge}</span>
                  </div>
                  <div style={{ fontSize: 12, color: "#4e5c66", marginTop: 2 }}>
                    {t.roleAmbSub}
                  </div>
                </div>
              </div>


              {/* Card 5: Govt Disaster & Surveillance Officer */}
              <div
                onClick={() => setSelectedRole("government")}
                style={{
                  background: "#ffffff",
                  borderRadius: 18,
                  padding: "16px 18px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
                  borderLeft: "5px solid #dc2626",
                  border: "1px solid rgba(0,0,0,0.03)",
                  borderLeftWidth: 5
                }}
              >
                <div style={{ fontSize: 36, lineHeight: 1 }}>🏛️</div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 16, fontWeight: 900, color: "#061018" }}>{t.roleGovTitle}</span>
                    <span style={{ fontSize: 10, background: "#fee2e2", color: "#b91c1c", padding: "2px 6px", borderRadius: 10, fontWeight: 800 }}>📍 {t.roleGovBadge}</span>
                  </div>
                  <div style={{ fontSize: 12, color: "#4e5c66", marginTop: 2 }}>
                    {t.roleGovSub}
                  </div>
                </div>
              </div>

              {/* Card 6: AeroRelief: Emergency Air-Supply Coordination */}
              <div
                id="portal-card-aerorelife"
                onClick={() => setSelectedRole("aerorelife")}
                style={{
                  background: "#ffffff",
                  borderRadius: 18,
                  padding: "16px 18px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
                  borderLeft: "5px solid #8b5cf6",
                  border: "1px solid rgba(0,0,0,0.03)",
                  borderLeftWidth: 5
                }}
              >
                <div style={{ fontSize: 36, lineHeight: 1 }}>🚁</div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 16, fontWeight: 900, color: "#061018" }}>{t.roleAeroTitle || "AeroRelief — Air-Supply Coordination"}</span>
                    <span style={{ fontSize: 10, background: "#ede9fe", color: "#6d28d9", padding: "2px 6px", borderRadius: 10, fontWeight: 800 }}>⚡ {t.roleAeroBadge || "Decision-Support"}</span>
                  </div>
                  <div style={{ fontSize: 12, color: "#4e5c66", marginTop: 2 }}>
                    {t.roleAeroSub || "Logistics decision-support for possible emergency air delivery when ground access is disrupted"}
                  </div>
                </div>
              </div>

            </div>

            <div style={{ marginTop: 24, textAlign: "center" }}>
              <button
                type="button"
                onClick={onOpenPortal}
                style={{ background: "none", border: "none", color: "#4e5c66", fontSize: 12, cursor: "pointer", textDecoration: "underline" }}
              >
                ← Return to Platform Gateway (VetNova / HealthNova)
              </button>
            </div>
          </div>
        </div>
      );
    }

    // =========================================================================
    // SCREEN 2: CITIZEN LOGIN (IF USER CHOOSES CITIZEN AND IS NOT LOGGED IN)
    // =========================================================================
    if (selectedRole === "citizen" && !user) {
      return (
        <div style={{
          minHeight: "100vh",
          background: "#e2e9e8",
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        }}>
          <div style={{
            width: "100%",
            maxWidth: 440,
            minHeight: "100vh",
            background: "#ffffff",
            boxShadow: "0 10px 40px rgba(15, 23, 42, 0.08)",
            padding: "24px 18px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            borderLeft: "1px solid #e2e8f0",
            borderRight: "1px solid #e2e8f0"
          }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <button
                  type="button"
                  onClick={() => setSelectedRole(null)}
                  style={{ background: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: 10, padding: "5px 10px", fontSize: 11, cursor: "pointer", fontWeight: 800 }}
                >
                  ← {t.switchRole}
                </button>
                <span style={{ fontSize: 12, fontWeight: 800, color: "#065f46" }}>👤 Citizen Login</span>
              </div>

              <div style={{ background: "#ffffff", border: "1.5px solid #bae6fd", borderRadius: 16, padding: "20px", boxShadow: "0 4px 18px rgba(2, 132, 199, 0.08)" }}>
                <div style={{ fontSize: 17, fontWeight: 900, color: "#0f172a", marginBottom: 4 }}>
                  📱 {t.loginTitle}
                </div>
                <div style={{ fontSize: 12, color: "#64748b", marginBottom: 16, lineHeight: 1.45 }}>
                  {t.loginSubtitle}
                </div>

                <form onSubmit={handleLoginSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: "#334155", marginBottom: 4 }}>
                      👤 {t.fullNameLabel}
                    </label>
                    <input
                      type="text"
                      required
                      value={loginName}
                      onChange={(e) => setLoginName(e.target.value)}
                      placeholder="e.g. Rajesh Deshmukh"
                      style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 13, boxSizing: "border-box" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: "#334155", marginBottom: 4 }}>
                      📞 {t.phoneLabel}
                    </label>
                    <input
                      type="tel"
                      required
                      maxLength="10"
                      value={loginPhone}
                      onChange={(e) => setLoginPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      placeholder="e.g. 9822019911 (10 digits)"
                      style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 13, boxSizing: "border-box" }}
                    />
                    <div style={{ fontSize: 10, color: loginPhone.length === 10 ? "#16a34a" : "#dc2626", marginTop: 2, fontWeight: 700 }}>
                      {loginPhone.length}/10 digits entered
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: "#334155", marginBottom: 4 }}>
                      📍 {t.cityLabel}
                    </label>
                    <input
                      type="text"
                      value={loginCity}
                      onChange={(e) => setLoginCity(e.target.value)}
                      placeholder="e.g. Pune, Satara, Sangli"
                      style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 13, boxSizing: "border-box" }}
                    />
                  </div>

                  <button
                    type="submit"
                    style={{
                      marginTop: 8,
                      width: "100%",
                      padding: "12px",
                      background: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
                      border: "none",
                      borderRadius: 10,
                      color: "#ffffff",
                      fontSize: 14,
                      fontWeight: 900,
                      cursor: "pointer",
                      boxShadow: "0 4px 12px rgba(2, 132, 199, 0.25)"
                    }}
                  >
                    {t.loginBtn}
                  </button>
                </form>
              </div>
            </div>

            <div style={{ textAlign: "center", fontSize: 11, color: "#94a3b8" }}>
              🔒 Verified emergency phone number enables direct doctor tele-consultations.
            </div>
          </div>
        </div>
      );
    }

    // =========================================================================
    // ROLE SCREENS (CITIZEN ONLY SEES CITIZEN, DOCTOR ONLY SEES DOCTOR, ETC.)
    // =========================================================================
    return (
      <div style={{
        minHeight: "100vh",
        background: "#e2e9e8",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      }}>
        {/* MOBILE VIEWPORT CONTAINER */}
        <div style={{
          width: "100%",
          maxWidth: 440,
          minHeight: "100vh",
          background: "#ffffff",
          boxShadow: "0 10px 40px rgba(15, 23, 42, 0.12)",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          borderLeft: "1px solid #e2e8f0",
          borderRight: "1px solid #e2e8f0"
        }}>

          {/* TOP STATUS BAR WITH ROLE SWITCHER */}
          <header style={{
            position: "sticky",
            top: 0,
            zIndex: 30,
            background: "#ffffff",
            color: "#0f172a",
            padding: "10px 14px",
            borderBottom: "1.5px solid #e2e8f0",
            boxShadow: "0 2px 6px rgba(0,0,0,0.03)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <img
                  src="/healthnova-logo.png"
                  alt="HealthNova"
                  style={{ width: 30, height: 30, objectFit: "contain", borderRadius: 6, background: "#f0f9ff", border: "1px solid #bae6fd", padding: 2 }}
                />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 900, color: "#0284c7", lineHeight: 1.1 }}>
                    HealthNova
                  </div>
                  <div style={{ fontSize: 9, color: "#166534", fontWeight: 800 }}>
                    {selectedRole === "citizen" && user ? `👤 ${user.name}` : (selectedRole === "aerorelife" || selectedRole === "aerorelief") ? "🚁 Role: AERORELIEF (AIR-SUPPLY)" : `Role: ${selectedRole.toUpperCase()}`}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                {/* Switch to VetNova */}
                <button
                  type="button"
                  onClick={onOpenVetNova}
                  style={{
                    background: "#ecfdf5",
                    border: "1.5px solid #a7f3d0",
                    color: "#065f46",
                    padding: "3px 7px",
                    borderRadius: 12,
                    fontSize: 10,
                    fontWeight: 900,
                    cursor: "pointer"
                  }}
                  title="Switch to VetNova Veterinary Platform"
                >
                  🐾 VetNova
                </button>

                {/* Switch Role Button */}
                <button
                  type="button"
                  onClick={() => setSelectedRole(null)}
                  style={{
                    background: "#f0fdf4",
                    border: "1px solid #a7f3d0",
                    color: "#065f46",
                    padding: "3px 8px",
                    borderRadius: 12,
                    fontSize: 10,
                    fontWeight: 800,
                    cursor: "pointer"
                  }}
                >
                  {t.switchRole}
                </button>

                {/* Online/Offline Badge */}
                <span style={{ fontSize: 9, fontWeight: 800, padding: "3px 6px", borderRadius: 8, background: isOnline ? "#dcfce7" : "#ffedd5", color: isOnline ? "#15803d" : "#c2410c", border: "1px solid", borderColor: isOnline ? "#bbf7d0" : "#fed7aa" }}>
                  {isOnline ? "🟢" : "🟠"}
                </span>

                {/* Outbox Badge */}
                <button
                  type="button"
                  onClick={() => setOutboxOpen(true)}
                  style={{ background: "#f0f9ff", border: "1px solid #bae6fd", color: "#0284c7", padding: "3px 7px", borderRadius: 10, fontSize: 10, fontWeight: 800, cursor: "pointer" }}
                >
                  📦 {outboxItems.length}
                </button>
              </div>
            </div>
          </header>

          {/* ========================================================================= */}
          {/* CITIZEN PORTAL (ONLY CITIZEN FEATURES VISIBLE, NO OTHER TIERS DISPLAYED)  */}
          {/* ========================================================================= */}
          {selectedRole === "citizen" && (
            <main style={{ padding: "12px", display: "flex", flexDirection: "column", gap: 14, background: "#f8fafc" }}>

              {/* 1. PAIRED SERVICE CARDS STYLED EXACTLY LIKE VETNOVA IMAGE 2 */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {/* News Card (Like Image 2 left) */}
                <div
                  onClick={() => {
                    const el = document.getElementById("disaster-news-radar-hub");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                    else setSelectedNews(DISASTER_NEWS[0]);
                  }}
                  style={{
                    background: "#ffffff",
                    borderRadius: 18,
                    padding: "14px 12px",
                    cursor: "pointer",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
                    border: "1px solid rgba(0,0,0,0.04)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <div style={{ width: 42, height: 42, borderRadius: 12, background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>
                      📰
                    </div>
                    <span style={{ fontSize: 9, background: "#059669", color: "#ffffff", padding: "3px 7px", borderRadius: 10, fontWeight: 800 }}>
                      {t.newsCardBadge}
                    </span>
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 900, color: "#064e3b", margin: "0 0 2px 0" }}>
                      {t.newsCardTitle}
                    </div>
                    <div style={{ fontSize: 10, color: "#64748b", lineHeight: 1.35 }}>
                      {t.newsCardSub}
                    </div>
                  </div>
                </div>

                {/* Find Doctor Card (Like Image 2 right) */}
                <div
                  onClick={() => {
                    const el = document.getElementById("doctor-directory-section");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                  style={{
                    background: "#ffffff",
                    borderRadius: 18,
                    padding: "14px 12px",
                    cursor: "pointer",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
                    border: "1px solid rgba(0,0,0,0.04)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <div style={{ width: 42, height: 42, borderRadius: 12, background: "#ede9fe", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>
                      👨‍⚕️
                    </div>
                    <span style={{ fontSize: 9, background: "#4338ca", color: "#ffffff", padding: "3px 7px", borderRadius: 10, fontWeight: 800 }}>
                      {t.findDocCardBadge}
                    </span>
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 900, color: "#1e1b4b", margin: "0 0 2px 0" }}>
                      {t.findDocCardTitle}
                    </div>
                    <div style={{ fontSize: 10, color: "#64748b", lineHeight: 1.35 }}>
                      {t.findDocCardSub}
                    </div>
                  </div>
                </div>
              </div>

              {/* ========================================================================= */}
              {/* INNOVATION: LIVE DISASTER NEWS & SENTINEL RADAR (HYPERLOCAL + RUMOR-BUSTER) */}
              {/* ========================================================================= */}
              <section
                id="disaster-news-radar-hub"
                style={{
                  background: "#ffffff",
                  borderRadius: 16,
                  border: "1.5px solid #0284c7",
                  padding: "14px 12px",
                  boxShadow: "0 4px 18px rgba(2, 132, 199, 0.08)"
                }}
              >
                {/* Header with Live Radar Pulsing Badge */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 16 }}>📡</span>
                      <h2 style={{ fontSize: 14, fontWeight: 900, color: "#0f172a", margin: 0 }}>
                        {t.newsHubTitle}
                      </h2>
                    </div>
                    <div style={{ fontSize: 10, color: "#64748b", marginTop: 2 }}>
                      {t.newsHubSubtitle}
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2 }}>
                    <span style={{
                      fontSize: 8,
                      fontWeight: 900,
                      background: "#f0fdf4",
                      color: "#16a34a",
                      border: "1px solid #bbf7d0",
                      padding: "2px 6px",
                      borderRadius: 10,
                      display: "flex",
                      alignItems: "center",
                      gap: 4
                    }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", display: "inline-block" }}></span>
                      LIVE SATELLITE
                    </span>
                    <span style={{ fontSize: 8, color: "#64748b", fontWeight: 700 }}>
                      📍 GPS: {locationState.lat ? locationState.lat.toFixed(4) : "18.5204"}, {locationState.lng ? locationState.lng.toFixed(4) : "73.8567"}
                    </span>
                  </div>
                </div>

                {/* Live Breaking News Flash Ticker */}
                <div
                  onClick={() => setSelectedNews(DISASTER_NEWS[0])}
                  style={{
                    background: "linear-gradient(90deg, #fef2f2 0%, #fff1f2 100%)",
                    border: "1px solid #fecaca",
                    borderRadius: 10,
                    padding: "6px 10px",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    cursor: "pointer",
                    marginBottom: 10
                  }}
                >
                  <span style={{ fontSize: 8, background: "#dc2626", color: "#ffffff", padding: "2px 5px", borderRadius: 4, fontWeight: 900, whiteSpace: "nowrap" }}>
                    🔴 FLASH ALERT
                  </span>
                  <div style={{ fontSize: 10, fontWeight: 800, color: "#991b1b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
                    Khadakwasla Dam: 32,500 Cusecs Discharge • Cyclone Megha Squall at 115 km/h • Heatwave Cat-4 Labor Ban
                  </div>
                  <span style={{ fontSize: 10, color: "#dc2626", fontWeight: 900 }}>→</span>
                </div>

                {/* Category Filter Chips Bar */}
                <div style={{
                  display: "flex",
                  gap: 6,
                  overflowX: "auto",
                  paddingBottom: 6,
                  marginBottom: 10,
                  WebkitOverflowScrolling: "touch"
                }}>
                  {[
                    { key: "all", label: t.newsFilterAll },
                    { key: "flood", label: t.newsFilterFlood },
                    { key: "cyclone", label: t.newsFilterCyclone },
                    { key: "heatwave", label: t.newsFilterHeat },
                    { key: "landslide", label: t.newsFilterLandslide },
                    { key: "outbreak", label: t.newsFilterOutbreak },
                    { key: "hazmat", label: t.newsFilterHazmat },
                    { key: "infra", label: t.newsFilterInfra }
                  ].map((filterTab) => (
                    <button
                      key={filterTab.key}
                      type="button"
                      onClick={() => setNewsFilter(filterTab.key)}
                      style={{
                        padding: "5px 10px",
                        borderRadius: 12,
                        fontSize: 10,
                        fontWeight: 800,
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                        border: newsFilter === filterTab.key ? "1.5px solid #0284c7" : "1px solid #e2e8f0",
                        background: newsFilter === filterTab.key ? "#f0f9ff" : "#f8fafc",
                        color: newsFilter === filterTab.key ? "#0284c7" : "#475569"
                      }}
                    >
                      {filterTab.label}
                    </button>
                  ))}
                </div>

                {/* Filtered News Articles List */}
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {DISASTER_NEWS.filter((item) => newsFilter === "all" || item.category === newsFilter).map((article) => {
                    const distKm = calcDistanceKm(
                      locationState.lat || 18.5204,
                      locationState.lng || 73.8567,
                      article.epicenter.lat,
                      article.epicenter.lng
                    );
                    const horizonHours = (distKm != null && article.velocityKmH > 0)
                      ? (distKm / article.velocityKmH).toFixed(1)
                      : null;
                    const isAudioPlaying = activeAudioNewsId === article.id;
                    const isRumorOpen = expandedRumorId === article.id;
                    const isSmsCopied = smsBeaconCopiedId === article.id;

                    const zoneTier = (distKm == null || distKm > 15)
                      ? { label: "PERIPHERAL WATCH", color: "#0284c7", bg: "#f0f9ff" }
                      : (distKm > 5)
                      ? { label: "ELEVATED BUFFER", color: "#d97706", bg: "#fffbeb" }
                      : { label: "CRITICAL HAZARD ZONE", color: "#dc2626", bg: "#fef2f2" };

                    return (
                      <div
                        key={article.id}
                        style={{
                          background: "#ffffff",
                          border: `1px solid ${article.priority === "CRITICAL" ? "#fca5a5" : "#e2e8f0"}`,
                          borderRadius: 12,
                          padding: "10px",
                          boxShadow: "0 2px 6px rgba(0,0,0,0.03)"
                        }}
                      >
                        {/* Card Top: Tag + Priority + Time */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                          <span style={{
                            fontSize: 9,
                            fontWeight: 900,
                            background: `${article.tagColor}15`,
                            color: article.tagColor,
                            padding: "2px 7px",
                            borderRadius: 6,
                            border: `1px solid ${article.tagColor}30`
                          }}>
                            {article.tag}
                          </span>
                          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <span style={{ fontSize: 8, fontWeight: 900, padding: "2px 6px", borderRadius: 4, background: zoneTier.bg, color: zoneTier.color }}>
                              {zoneTier.label}
                            </span>
                            <span style={{ fontSize: 9, color: "#64748b" }}>
                              {article.time}
                            </span>
                          </div>
                        </div>

                        {/* Title & Summary */}
                        <div style={{ fontSize: 12, fontWeight: 900, color: "#0f172a", lineHeight: 1.35, marginBottom: 4 }}>
                          {article.title}
                        </div>
                        <div style={{ fontSize: 10, color: "#475569", lineHeight: 1.4, marginBottom: 8 }}>
                          {article.summary}
                        </div>

                        {/* Hyperlocal Threat Horizon Box */}
                        <div style={{
                          background: "#f8fafc",
                          border: "1px solid #e2e8f0",
                          borderRadius: 8,
                          padding: "6px 8px",
                          marginBottom: 8,
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          fontSize: 9
                        }}>
                          <div>
                            <span style={{ fontWeight: 800, color: "#0f172a" }}>📍 Epicenter: </span>
                            <span style={{ color: "#0284c7", fontWeight: 800 }}>{article.epicenter.name}</span>
                            <span style={{ color: "#64748b" }}> ({distKm != null ? `${distKm} km away` : "Calculating..."})</span>
                          </div>
                          {horizonHours ? (
                            <div style={{ fontWeight: 800, color: "#dc2626", background: "#fee2e2", padding: "1px 5px", borderRadius: 4 }}>
                              ⏱️ Arrival: ~{horizonHours}h
                            </div>
                          ) : (
                            <div style={{ fontWeight: 700, color: "#16a34a" }}>
                              🛡️ Stationary Vector
                            </div>
                          )}
                        </div>

                        {/* Telemetry Sensor Pack */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, marginBottom: 8 }}>
                          {article.telemetry.map((tel, idx) => (
                            <div
                              key={idx}
                              style={{
                                background: tel.status === "alert" ? "#fff1f2" : tel.status === "warn" ? "#fffbeb" : "#f0fdf4",
                                border: `1px solid ${tel.status === "alert" ? "#fecdd3" : tel.status === "warn" ? "#fef3c7" : "#bbf7d0"}`,
                                borderRadius: 6,
                                padding: "4px 6px",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center"
                              }}
                            >
                              <span style={{ fontSize: 8, color: "#64748b", fontWeight: 700 }}>{tel.label}:</span>
                              <span style={{
                                fontSize: 9,
                                fontWeight: 900,
                                color: tel.status === "alert" ? "#be123c" : tel.status === "warn" ? "#b45309" : "#15803d"
                              }}>
                                {tel.val}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Active Audio Visualizer (if playing) */}
                        {isAudioPlaying && (
                          <div style={{
                            background: "#fffbeb",
                            border: "1px solid #fde68a",
                            borderRadius: 8,
                            padding: "6px 8px",
                            marginBottom: 8,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between"
                          }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <span style={{ fontSize: 10, fontWeight: 900, color: "#b45309" }}>🎙️ RADIO BROADCASTING LIVE:</span>
                              <span style={{ display: "inline-flex", alignItems: "flex-end", height: 12, gap: 2 }}>
                                {[7, 12, 5, 11, 9, 12, 4, 10].map((h, i) => (
                                  <span key={i} style={{ width: 3, height: h, background: "#d97706", borderRadius: 1 }} />
                                ))}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={handleStopAudioBroadcast}
                              style={{
                                background: "#b45309",
                                color: "#ffffff",
                                border: "none",
                                borderRadius: 4,
                                padding: "2px 6px",
                                fontSize: 9,
                                fontWeight: 800,
                                cursor: "pointer"
                              }}
                            >
                              Stop ⏹️
                            </button>
                          </div>
                        )}

                        {/* Interactive Action Toolbar (4 Innovative Buttons) */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5 }}>
                          <button
                            type="button"
                            onClick={() => setSelectedNews(article)}
                            style={{
                              padding: "6px",
                              background: "#0284c7",
                              color: "#ffffff",
                              border: "none",
                              borderRadius: 6,
                              fontSize: 9,
                              fontWeight: 800,
                              cursor: "pointer",
                              textAlign: "center"
                            }}
                          >
                            📖 Read Brief & Actions →
                          </button>

                          <button
                            type="button"
                            onClick={() => handleToggleAudioBroadcast(article)}
                            style={{
                              padding: "6px",
                              background: isAudioPlaying ? "#b45309" : "#f8fafc",
                              color: isAudioPlaying ? "#ffffff" : "#0f172a",
                              border: "1px solid #cbd5e1",
                              borderRadius: 6,
                              fontSize: 9,
                              fontWeight: 800,
                              cursor: "pointer",
                              textAlign: "center"
                            }}
                          >
                            {isAudioPlaying ? "⏹️ Stop Radio" : "🎙️ Listen Radio"}
                          </button>

                          <button
                            type="button"
                            onClick={() => setExpandedRumorId(isRumorOpen ? null : article.id)}
                            style={{
                              padding: "6px",
                              background: isRumorOpen ? "#fef2f2" : "#f8fafc",
                              color: isRumorOpen ? "#b91c1c" : "#334155",
                              border: "1px solid #cbd5e1",
                              borderRadius: 6,
                              fontSize: 9,
                              fontWeight: 800,
                              cursor: "pointer",
                              textAlign: "center"
                            }}
                          >
                            🛡️ {isRumorOpen ? "Hide Fact-Check" : "Fact-Check Shield"}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleCopySmsBeacon(article)}
                            style={{
                              padding: "6px",
                              background: isSmsCopied ? "#15803d" : "#f8fafc",
                              color: isSmsCopied ? "#ffffff" : "#334155",
                              border: "1px solid #cbd5e1",
                              borderRadius: 6,
                              fontSize: 9,
                              fontWeight: 800,
                              cursor: "pointer",
                              textAlign: "center"
                            }}
                          >
                            {isSmsCopied ? "✓ SMS Copied!" : "📡 Offline SOS SMS"}
                          </button>
                        </div>

                        {/* Inline Expandable Rumor-Buster Box */}
                        {isRumorOpen && (
                          <div style={{
                            marginTop: 8,
                            background: "#f8fafc",
                            border: "1px solid #cbd5e1",
                            borderRadius: 8,
                            padding: "8px"
                          }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                              <span style={{ fontSize: 9, fontWeight: 900, color: "#0f172a" }}>
                                🛡️ {t.rumorBusterTitle}
                              </span>
                              <span style={{ fontSize: 8, background: "#dcfce7", color: "#166534", padding: "1px 5px", borderRadius: 4, fontWeight: 800 }}>
                                ✓ {article.rumorBuster.trustScore}% Verified
                              </span>
                            </div>

                            <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 6, padding: "6px", marginBottom: 4 }}>
                              <div style={{ fontSize: 8, fontWeight: 900, color: "#991b1b" }}>❌ {t.rumorDebunkLabel}:</div>
                              <div style={{ fontSize: 9, color: "#7f1d1d" }}>"{article.rumorBuster.claim}"</div>
                            </div>

                            <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 6, padding: "6px", marginBottom: 4 }}>
                              <div style={{ fontSize: 8, fontWeight: 900, color: "#166534" }}>✅ {t.rumorFactLabel}:</div>
                              <div style={{ fontSize: 9, color: "#14532d" }}>{article.rumorBuster.fact}</div>
                            </div>

                            <div style={{ fontSize: 8, color: "#64748b", fontWeight: 700 }}>
                              🔒 Authority: {article.rumorBuster.source} • Hash: #{article.rumorBuster.verificationCode}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* 2. EMERGENCY DISASTER IVR HELPLINES */}
              <section style={{
                background: "#fef2f2",
                border: "1.5px solid #fecaca",
                borderRadius: 14,
                padding: "12px"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                  <span style={{ fontSize: 15 }}>📞</span>
                  <div style={{ fontSize: 12, fontWeight: 900, color: "#991b1b" }}>
                    {t.ivrSectionTitle}
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                  {/* NDMA 1078 */}
                  <div style={{ background: "#ffffff", padding: "6px 8px", borderRadius: 8, border: "1px solid #fca5a5" }}>
                    <div style={{ fontSize: 9, color: "#7f1d1d", fontWeight: 800 }}>NDMA</div>
                    <div style={{ fontSize: 15, fontWeight: 900, color: "#dc2626" }}>1078</div>
                    <div style={{ fontSize: 8, color: "#64748b", margin: "1px 0 3px" }}>Disaster Helpline</div>
                    <a
                      href="tel:1078"
                      style={{ display: "block", textAlign: "center", background: "#dc2626", color: "#ffffff", padding: "3px", borderRadius: 6, fontSize: 9, fontWeight: 800, textDecoration: "none" }}
                    >
                      📞 {t.callAction} 1078
                    </a>
                  </div>

                  {/* ERSS 112 */}
                  <div style={{ background: "#ffffff", padding: "6px 8px", borderRadius: 8, border: "1px solid #fca5a5" }}>
                    <div style={{ fontSize: 9, color: "#7f1d1d", fontWeight: 800 }}>ERSS</div>
                    <div style={{ fontSize: 15, fontWeight: 900, color: "#dc2626" }}>112</div>
                    <div style={{ fontSize: 8, color: "#64748b", margin: "1px 0 3px" }}>Police / Fire / EMS</div>
                    <a
                      href="tel:112"
                      style={{ display: "block", textAlign: "center", background: "#dc2626", color: "#ffffff", padding: "3px", borderRadius: 6, fontSize: 9, fontWeight: 800, textDecoration: "none" }}
                    >
                      📞 {t.callAction} 112
                    </a>
                  </div>

                  {/* Relief Commissioner 1070 */}
                  <div style={{ background: "#ffffff", padding: "6px 8px", borderRadius: 8, border: "1px solid #fca5a5" }}>
                    <div style={{ fontSize: 9, color: "#7f1d1d", fontWeight: 800 }}>Relief Comm.</div>
                    <div style={{ fontSize: 15, fontWeight: 900, color: "#dc2626" }}>1070</div>
                    <div style={{ fontSize: 8, color: "#64748b", margin: "1px 0 3px" }}>Natural Calamities</div>
                    <a
                      href="tel:1070"
                      style={{ display: "block", textAlign: "center", background: "#dc2626", color: "#ffffff", padding: "3px", borderRadius: 6, fontSize: 9, fontWeight: 800, textDecoration: "none" }}
                    >
                      📞 {t.callAction} 1070
                    </a>
                  </div>

                  {/* DDMA 1077 */}
                  <div style={{ background: "#ffffff", padding: "6px 8px", borderRadius: 8, border: "1px solid #fca5a5" }}>
                    <div style={{ fontSize: 9, color: "#7f1d1d", fontWeight: 800 }}>DDMA Control</div>
                    <div style={{ fontSize: 15, fontWeight: 900, color: "#dc2626" }}>1077</div>
                    <div style={{ fontSize: 8, color: "#64748b", margin: "1px 0 3px" }}>District Disaster Hub</div>
                    <a
                      href="tel:1077"
                      style={{ display: "block", textAlign: "center", background: "#dc2626", color: "#ffffff", padding: "3px", borderRadius: 6, fontSize: 9, fontWeight: 800, textDecoration: "none" }}
                    >
                      📞 {t.callAction} 1077
                    </a>
                  </div>
                </div>
              </section>

              {/* 3. CALAMITY HUB (FIRST AID WITH 3D BODY & OFFLINE CLINICAL DIAGNOSIS) */}
              <section style={{
                background: "#ffffff",
                borderRadius: 14,
                border: "1.5px solid #0284c7",
                padding: "12px",
                boxShadow: "0 2px 8px rgba(2, 132, 199, 0.06)"
              }}>
                <div style={{ fontSize: 13, fontWeight: 900, color: "#0f172a", marginBottom: 2 }}>
                  🚨 {t.calamityTitle}
                </div>
                <div style={{ fontSize: 10, color: "#64748b", marginBottom: 8 }}>
                  {t.calamitySubtitle}
                </div>

                {/* 4 Calamity Buttons Grid */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 10 }}>
                  {[
                    { key: "flood", icon: "🌊", label: t.flood, color: "#0284c7" },
                    { key: "cyclone", icon: "🌪️", label: t.cyclone, color: "#0d9488" },
                    { key: "heatwave", icon: "☀️", label: t.heatwave, color: "#ea580c" },
                    { key: "other", icon: "⚡", label: t.other, color: "#7c3aed" }
                  ].map((c) => (
                    <button
                      key={c.key}
                      type="button"
                      onClick={() => {
                        setSelectedCalamity(c.key);
                        setSelectedSymptoms([]);
                        setDiagnosticReport(null);
                      }}
                      style={{
                        padding: "8px 6px",
                        borderRadius: 8,
                        border: "1.5px solid",
                        borderColor: selectedCalamity === c.key ? c.color : "#e2e8f0",
                        background: selectedCalamity === c.key ? `${c.color}15` : "#ffffff",
                        color: selectedCalamity === c.key ? c.color : "#475569",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        fontWeight: 800,
                        fontSize: 10,
                        textAlign: "left"
                      }}
                    >
                      <span style={{ fontSize: 16 }}>{c.icon}</span>
                      <span style={{ lineHeight: 1.2 }}>{c.label}</span>
                    </button>
                  ))}
                </div>

                {/* Mode Selector */}
                <div style={{ display: "flex", gap: 6, background: "#f1f5f9", padding: 3, borderRadius: 8, marginBottom: 10 }}>
                  <button
                    type="button"
                    onClick={() => setCalamityMode("first_aid")}
                    style={{
                      flex: 1,
                      padding: "7px",
                      borderRadius: 6,
                      border: "none",
                      background: calamityMode === "first_aid" ? "#0284c7" : "transparent",
                      color: calamityMode === "first_aid" ? "#ffffff" : "#475569",
                      fontWeight: 800,
                      fontSize: 11,
                      cursor: "pointer"
                    }}
                  >
                    {t.firstAidBtn}
                  </button>
                  <button
                    type="button"
                    onClick={() => setCalamityMode("diagnosis")}
                    style={{
                      flex: 1,
                      padding: "7px",
                      borderRadius: 6,
                      border: "none",
                      background: calamityMode === "diagnosis" ? "#0284c7" : "transparent",
                      color: calamityMode === "diagnosis" ? "#ffffff" : "#475569",
                      fontWeight: 800,
                      fontSize: 11,
                      cursor: "pointer"
                    }}
                  >
                    {t.diagnosisBtn}
                  </button>
                </div>

                {/* First Aid vs Clinical Diagnosis */}
                {calamityMode === "first_aid" ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <div style={{ background: "#f8fafc", padding: 10, borderRadius: 8, border: "1px solid #e2e8f0" }}>
                      <div style={{ fontSize: 12, fontWeight: 900, color: "#0f172a", marginBottom: 6 }}>
                        🩹 {t.firstAidHeading} — {curCalamity.icon}
                      </div>
                      {curCalamity.firstAid.map((st) => (
                        <div key={st.step} style={{ marginBottom: 8 }}>
                          <div style={{ fontSize: 11, fontWeight: 800, color: curCalamity.color }}>
                            Step {st.step}: {st.title}
                          </div>
                          <div style={{ fontSize: 10, color: "#334155", lineHeight: 1.45, marginTop: 2 }}>
                            {st.detail}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* YouTube Video Demonstration */}
                    <div style={{ background: "#f8fafc", padding: 10, borderRadius: 8, border: "1px solid #e2e8f0" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                        <div style={{ fontSize: 11, fontWeight: 800, color: "#0f172a" }}>
                          📺 {t.ytVideoHeading}
                        </div>
                        <a
                          href={`https://www.youtube.com/watch?v=${curCalamity.ytVideoId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ fontSize: 10, color: "#0284c7", fontWeight: 800, textDecoration: "none" }}
                        >
                          {t.ytWatchDirect} ↗
                        </a>
                      </div>

                      <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, overflow: "hidden", borderRadius: 8, background: "#000000" }}>
                        <iframe
                          src={`https://www.youtube.com/embed/${curCalamity.ytVideoId}?rel=0&modestbranding=1`}
                          title="Emergency First Aid Video Guide"
                          style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: 0 }}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                        />
                      </div>
                    </div>

                    {/* Realistic 3D Anatomical Body Guide */}
                    <Interactive3DAnatomyCanvas defaultZone={curCalamity.demoZone} />
                  </div>
                ) : (
                  /* Clinical AI Diagnosis */
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <div style={{ background: "#f8fafc", padding: 10, borderRadius: 8, border: "1px solid #e2e8f0" }}>
                      <div style={{ fontSize: 11, fontWeight: 800, color: "#0f172a", marginBottom: 6 }}>
                        📋 {t.symptomSelectHeading}:
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                        {curCalamity.symptoms.map((sym) => {
                          const isChecked = selectedSymptoms.includes(sym.id);
                          return (
                            <label
                              key={sym.id}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                                background: isChecked ? "#e0f2fe" : "#ffffff",
                                padding: "5px 8px",
                                borderRadius: 6,
                                border: "1px solid",
                                borderColor: isChecked ? "#0284c7" : "#e2e8f0",
                                fontSize: 10,
                                cursor: "pointer",
                                color: isChecked ? "#0369a1" : "#334155",
                                fontWeight: isChecked ? 700 : 500
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleSymptom(sym.id)}
                              />
                              <span>{sym[lang] || sym.en}</span>
                            </label>
                          );
                        })}
                      </div>

                      {/* Speech-to-Text Microphone Input */}
                      <div style={{ marginTop: 10 }}>
                        <div style={{ display: "flex", gap: 6 }}>
                          <input
                            type="text"
                            value={customSymptomText}
                            onChange={(e) => setCustomSymptomText(e.target.value)}
                            placeholder={t.voiceInputPlaceholder}
                            style={{
                              flex: 1,
                              padding: "6px 8px",
                              borderRadius: 6,
                              border: "1px solid #cbd5e1",
                              fontSize: 10
                            }}
                          />
                          <button
                            type="button"
                            onClick={toggleSpeechRecognition}
                            style={{
                              padding: "6px 10px",
                              background: isListening ? "#dc2626" : "#0284c7",
                              color: "#ffffff",
                              border: "none",
                              borderRadius: 6,
                              fontSize: 10,
                              fontWeight: 800,
                              cursor: "pointer",
                              whiteSpace: "nowrap"
                            }}
                          >
                            🎙️ {isListening ? "Listening…" : t.voiceBtn}
                          </button>
                        </div>
                      </div>

                      {/* Injury Photo Upload */}
                      <div style={{ marginTop: 10, padding: "8px", background: "#ffffff", borderRadius: 6, border: "1px solid #e2e8f0" }}>
                        <div style={{ fontSize: 10, fontWeight: 800, color: "#0f172a", marginBottom: 4 }}>
                          {t.injuryQuestion}
                        </div>
                        <div style={{ display: "flex", gap: 12, marginBottom: 6 }}>
                          <label style={{ fontSize: 10, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                            <input
                              type="radio"
                              name="isInjured"
                              checked={isInjured}
                              onChange={() => setIsInjured(true)}
                            />
                            Yes (Wound / Injury)
                          </label>
                          <label style={{ fontSize: 10, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                            <input
                              type="radio"
                              name="isInjured"
                              checked={!isInjured}
                              onChange={() => {
                                setIsInjured(false);
                                setInjuryImagePreview(null);
                              }}
                            />
                            No (Internal Illness)
                          </label>
                        </div>

                        {isInjured && (
                          <div>
                            <label style={{ display: "block", fontSize: 9, fontWeight: 700, color: "#0369a1", marginBottom: 3 }}>
                              📸 {t.uploadWound}:
                            </label>
                            <input
                              type="file"
                              accept="image/*"
                              capture="environment"
                              onChange={handleImageUpload}
                              style={{ fontSize: 9 }}
                            />
                            {injuryImagePreview && (
                              <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 6 }}>
                                <img
                                  src={injuryImagePreview}
                                  alt="Wound Preview"
                                  style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 6, border: "1.5px solid #0284c7" }}
                                />
                                <span style={{ fontSize: 9, color: "#15803d", fontWeight: 700 }}>
                                  ✓ {t.woundAttached}
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={generateDiagnosis}
                        style={{
                          width: "100%",
                          marginTop: 10,
                          padding: "10px",
                          background: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
                          border: "none",
                          borderRadius: 8,
                          color: "#ffffff",
                          fontWeight: 900,
                          fontSize: 12,
                          cursor: "pointer",
                          boxShadow: "0 3px 8px rgba(2, 132, 199, 0.25)"
                        }}
                      >
                        {t.runDiagnosisBtn}
                      </button>
                    </div>

                    {/* Output Report */}
                    {diagnosticReport && (
                      <div style={{ background: "#ffffff", borderRadius: 8, border: "1px solid #cbd5e1", padding: 10 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                          <span style={{ fontSize: 11, fontWeight: 900, color: "#0f172a" }}>
                            {diagnosticReport.probableCondition}
                          </span>
                          <span style={{ fontSize: 9, fontWeight: 800, padding: "2px 5px", borderRadius: 6, background: "#dc2626", color: "#ffffff" }}>
                            {diagnosticReport.severity}
                          </span>
                        </div>

                        {diagnosticReport.severity.includes("CRITICAL") && (
                          <div style={{ background: "#fee2e2", border: "1px solid #f87171", borderRadius: 6, padding: "8px", marginBottom: 8 }}>
                            <div style={{ fontSize: 10, fontWeight: 900, color: "#991b1b", marginBottom: 4 }}>
                              🚨 CRITICAL CONDITION: Immediate Doctor Consultation Recommended!
                            </div>
                            <div style={{ display: "flex", gap: 6 }}>
                              <button
                                type="button"
                                onClick={() => initiateVideoCall(doctorsList[0])}
                                style={{ flex: 1, padding: "6px", background: "#0284c7", color: "#ffffff", border: "none", borderRadius: 6, fontSize: 10, fontWeight: 800, cursor: "pointer" }}
                              >
                                📹 Jitsi Video Call
                              </button>
                              <button
                                type="button"
                                onClick={() => initiateVoiceCall(doctorsList[0])}
                                style={{ flex: 1, padding: "6px", background: "#16a34a", color: "#ffffff", border: "none", borderRadius: 6, fontSize: 10, fontWeight: 800, cursor: "pointer" }}
                              >
                                📞 Voice Call Doctor
                              </button>
                            </div>
                          </div>
                        )}

                        <div style={{ marginBottom: 6 }}>
                          <div style={{ fontSize: 10, fontWeight: 800, color: "#15803d", marginBottom: 2 }}>{t.homeRemediesTitle}:</div>
                          <ul style={{ margin: 0, paddingLeft: 16, fontSize: 10, color: "#334155" }}>
                            {diagnosticReport.remedies.map((rem, i) => <li key={i}>{rem}</li>)}
                          </ul>
                        </div>

                        <div style={{ marginBottom: 6 }}>
                          <div style={{ fontSize: 10, fontWeight: 800, color: "#0369a1", marginBottom: 2 }}>{t.medicationsTitle}:</div>
                          <ul style={{ margin: 0, paddingLeft: 16, fontSize: 10, color: "#334155" }}>
                            {diagnosticReport.medications.map((med, i) => <li key={i}>{med}</li>)}
                          </ul>
                        </div>

                        <button
                          type="button"
                          onClick={sendReportToOutbox}
                          style={{ width: "100%", padding: "8px", background: "#0f172a", color: "#38bdf8", border: "1px solid #0284c7", borderRadius: 6, fontWeight: 800, fontSize: 11, cursor: "pointer" }}
                        >
                          💾 Save Report to Offline Outbox
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </section>

              {/* 4. DYNAMIC EMERGENCY DOCTOR TELE-CARE DIRECTORY (NON-STATIC, PERSISTED IN REAL TIME) */}
              <section id="doctor-directory-section" style={{
                background: "#ffffff",
                borderRadius: 14,
                border: "1.5px solid #059669",
                padding: "12px",
                boxShadow: "0 2px 8px rgba(5, 150, 105, 0.06)"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <div style={{ fontSize: 13, fontWeight: 900, color: "#065f46" }}>
                    🩺 Verified On-Duty Disaster Doctors ({doctorsList.length})
                  </div>
                  <span style={{ fontSize: 9, background: "#ecfdf5", color: "#065f46", padding: "2px 6px", borderRadius: 8, fontWeight: 800 }}>
                    DYNAMIC REAL-TIME
                  </span>
                </div>
                <div style={{ fontSize: 10, color: "#64748b", marginBottom: 8 }}>
                  Connect with registered emergency physicians via live Jitsi video or voice calls
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {doctorsList.map((doc) => (
                    <div key={doc.id} style={{ background: "#f8fafc", padding: "8px 10px", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{ fontWeight: 800, fontSize: 12, color: "#0f172a" }}>{doc.name}</span>
                            {doc.id && doc.id.startsWith("doc-") && (
                              <span style={{ fontSize: 8, background: "#dbeafe", color: "#1d4ed8", padding: "1px 5px", borderRadius: 6, fontWeight: 800 }}>
                                ✨ NEWLY REGISTERED
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: 9, color: "#059669", fontWeight: 700 }}>{doc.spec} • {doc.regNo}</div>
                          <div style={{ fontSize: 8, color: "#64748b" }}>{doc.hospital} • 📞 {doc.phone}</div>
                        </div>
                        <span style={{ fontSize: 8, fontWeight: 800, padding: "2px 5px", borderRadius: 6, background: doc.available ? "#dcfce7" : "#fee2e2", color: doc.available ? "#15803d" : "#991b1b" }}>
                          {doc.available ? "ONLINE 🟢" : "BUSY 🔴"}
                        </span>
                      </div>

                      <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                        <button
                          type="button"
                          onClick={() => initiateVideoCall(doc)}
                          style={{
                            flex: 1,
                            padding: "6px",
                            background: "#0284c7",
                            color: "#ffffff",
                            border: "none",
                            borderRadius: 6,
                            fontSize: 10,
                            fontWeight: 800,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 4
                          }}
                        >
                          <span>📹</span> {t.callDoctorVideo}
                        </button>
                        <button
                          type="button"
                          onClick={() => initiateVoiceCall(doc)}
                          style={{
                            flex: 1,
                            padding: "6px",
                            background: "#16a34a",
                            color: "#ffffff",
                            border: "none",
                            borderRadius: 6,
                            fontSize: 10,
                            fontWeight: 800,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 4
                          }}
                        >
                          <span>📞</span> {t.callDoctorVoice}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* 5. TACTICAL OPERATIONS & MAP SECTION */}
              <div id="healthnova-user-map-section" style={{ borderTop: "1px solid #e2e8f0", paddingTop: 8 }}>
                <div
                  id="toggle-user-map-section-btn"
                  onClick={() => setOpsSectionOpen(!opsSectionOpen)}
                  style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", background: "#ffffff", padding: "8px 10px", borderRadius: 8, border: "1px solid #e2e8f0" }}
                >
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 800, color: "#0f172a" }}>
                      🗺️ {t.opsTitle}
                    </div>
                    <div style={{ fontSize: 9, color: "#64748b" }}>
                      GIS Map, Dijkstra Route & Hospital Beds
                    </div>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 800 }}>{opsSectionOpen ? "▲" : "▼"}</span>
                </div>

                {opsSectionOpen && (
                  <div style={{ marginTop: 8 }}>
                    {window.SentinelCommandMap && (
                      <window.SentinelCommandMap onNavigateToIntake={() => setOpsSectionOpen(true)} />
                    )}
                  </div>
                )}
              </div>

            </main>
          )}

          {/* ========================================================================= */}
          {/* DOCTOR PORTAL (ONLY DOCTOR DASHBOARD VISIBLE WHEN IN DOCTOR ROLE)        */}
          {/* ========================================================================= */}
          {selectedRole === "doctor" && (
            <main style={{ padding: "12px", display: "flex", flexDirection: "column", gap: 14, background: "#f8fafc" }}>
              <section style={{
                background: "#ffffff",
                borderRadius: 14,
                border: "1.5px solid #059669",
                padding: "14px",
                boxShadow: "0 2px 8px rgba(5, 150, 105, 0.06)"
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                  <div>
                    <span style={{ fontSize: 9, background: "#ecfdf5", color: "#065f46", padding: "2px 6px", borderRadius: 8, fontWeight: 800 }}>
                      PHYSICIAN EMERGENCY COMMAND
                    </span>
                    <h2 style={{ fontSize: 16, fontWeight: 900, margin: "3px 0 0 0", color: "#0f172a" }}>
                      👨‍⚕️ Emergency Doctor Portal
                    </h2>
                  </div>
                  <span style={{ fontSize: 24 }}>🩺</span>
                </div>

                                {/* Real-time Incoming Emergency Video Call Monitor Banner */}
                {incomingCall && (
                  <div style={{
                    background: "linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)",
                    border: "2px solid #ef4444",
                    borderRadius: 12,
                    padding: "12px",
                    marginBottom: 14,
                    boxShadow: "0 6px 20px rgba(239, 68, 68, 0.25)"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 28 }}>📹</span>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 900, color: "#991b1b" }}>
                            INCOMING EMERGENCY VIDEO CALL
                          </div>
                          <div style={{ fontSize: 12, fontWeight: 800, color: "#0f172a" }}>
                            Caller: {incomingCall.callerName} • 📞 {incomingCall.callerPhone}
                          </div>
                          <div style={{ fontSize: 10, color: "#0284c7" }}>
                            Room: {incomingCall.roomId}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          type="button"
                          onClick={() => {
                            setJitsiRoomId(incomingCall.roomId);
                            setVideoCallDoctor({ name: incomingCall.callerName, spec: "Field Patient", phone: incomingCall.callerPhone });
                            setIncomingCall(null);
                            try {
                              localStorage.removeItem("healthnova_active_emergency_call");
                            } catch (_) {}
                          }}
                          style={{
                            background: "#16a34a",
                            color: "#ffffff",
                            border: "none",
                            borderRadius: 8,
                            padding: "9px 14px",
                            fontSize: 11,
                            fontWeight: 900,
                            cursor: "pointer"
                          }}
                        >
                          ACCEPT CALL 🟢
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIncomingCall(null);
                            try {
                              localStorage.removeItem("healthnova_active_emergency_call");
                            } catch (_) {}
                          }}
                          style={{
                            background: "#64748b",
                            color: "#ffffff",
                            border: "none",
                            borderRadius: 8,
                            padding: "9px 10px",
                            fontSize: 11,
                            fontWeight: 900,
                            cursor: "pointer"
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Doctor Registration Form */}
                <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "12px", marginBottom: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 900, color: "#065f46", marginBottom: 8 }}>
                    📋 {t.doctorRegHeading}
                  </div>

                  <form onSubmit={handleDoctorRegister} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <div>
                      <label style={{ display: "block", fontSize: 10, fontWeight: 800, color: "#334155", marginBottom: 2 }}>
                        {t.doctorNameLabel}
                      </label>
                      <input
                        type="text"
                        required
                        value={docRegName}
                        onChange={(e) => setDocRegName(e.target.value)}
                        placeholder="e.g. Dr. Ramesh Joshi, MD"
                        style={{ width: "100%", padding: "7px 10px", borderRadius: 6, border: "1px solid #cbd5e1", fontSize: 11, boxSizing: "border-box" }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: 10, fontWeight: 800, color: "#334155", marginBottom: 2 }}>
                        {t.doctorSpecLabel}
                      </label>
                      <input
                        type="text"
                        value={docRegSpec}
                        onChange={(e) => setDocRegSpec(e.target.value)}
                        placeholder="e.g. Emergency Medicine & Trauma"
                        style={{ width: "100%", padding: "7px 10px", borderRadius: 6, border: "1px solid #cbd5e1", fontSize: 11, boxSizing: "border-box" }}
                      />
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                      <div>
                        <label style={{ display: "block", fontSize: 10, fontWeight: 800, color: "#334155", marginBottom: 2 }}>
                          {t.doctorRegNoLabel}
                        </label>
                        <input
                          type="text"
                          required
                          value={docRegNo}
                          onChange={(e) => setDocRegNo(e.target.value)}
                          placeholder="MCI-2018-99412"
                          style={{ width: "100%", padding: "7px 10px", borderRadius: 6, border: "1px solid #cbd5e1", fontSize: 11, boxSizing: "border-box" }}
                        />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: 10, fontWeight: 800, color: "#334155", marginBottom: 2 }}>
                          Direct Phone (Strictly 10 Digits)
                        </label>
                        <input
                          type="tel"
                          required
                          value={docRegPhone}
                          onChange={(e) => setDocRegPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                          placeholder="9822019911"
                          style={{ width: "100%", padding: "7px 10px", borderRadius: 6, border: "1px solid #cbd5e1", fontSize: 11, boxSizing: "border-box" }}
                        />
                        <div style={{ fontSize: 9, color: docRegPhone.length === 10 ? "#16a34a" : "#dc2626", marginTop: 2, fontWeight: 700 }}>
                          {docRegPhone.length}/10 digits entered
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                      <div>
                        <label style={{ display: "block", fontSize: 10, fontWeight: 800, color: "#334155", marginBottom: 2 }}>
                          {t.doctorHospitalLabel}
                        </label>
                        <input
                          type="text"
                          value={docRegHospital}
                          onChange={(e) => setDocRegHospital(e.target.value)}
                          placeholder="Sassoon General Hospital"
                          style={{ width: "100%", padding: "7px 10px", borderRadius: 6, border: "1px solid #cbd5e1", fontSize: 11, boxSizing: "border-box" }}
                        />
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, paddingTop: 16 }}>
                        <input
                          type="checkbox"
                          id="docAvailableCheckbox"
                          checked={docRegAvailable}
                          onChange={(e) => setDocRegAvailable(e.target.checked)}
                          style={{ width: 16, height: 16 }}
                        />
                        <label htmlFor="docAvailableCheckbox" style={{ fontSize: 11, fontWeight: 700, color: "#1e293b", cursor: "pointer" }}>
                          {t.doctorAvailableLabel}
                        </label>
                      </div>
                    </div>

                    <button
                      type="submit"
                      style={{
                        marginTop: 4,
                        background: "#059669",
                        border: "none",
                        borderRadius: 6,
                        padding: "8px 12px",
                        color: "#ffffff",
                        fontSize: 12,
                        fontWeight: 900,
                        cursor: "pointer"
                      }}
                    >
                      {t.registerDoctorBtn}
                    </button>
                  </form>
                </div>

                {/* Active Registered Doctors (Synchronized with localStorage) */}
                <div style={{ fontSize: 12, fontWeight: 900, color: "#0f172a", marginBottom: 8 }}>
                  👨‍⚕️ Registered On-Duty Emergency Physicians ({doctorsList.length})
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {doctorsList.map((doc) => (
                    <div key={doc.id} style={{ background: "#f8fafc", padding: "8px 10px", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: 12, color: "#0f172a" }}>{doc.name}</div>
                          <div style={{ fontSize: 9, color: "#059669", fontWeight: 700 }}>{doc.spec} • {doc.regNo}</div>
                          <div style={{ fontSize: 8, color: "#64748b" }}>{doc.hospital} • Phone: {doc.phone}</div>
                        </div>
                        <span style={{ fontSize: 8, fontWeight: 800, padding: "2px 5px", borderRadius: 6, background: doc.available ? "#dcfce7" : "#fee2e2", color: doc.available ? "#15803d" : "#991b1b" }}>
                          {doc.available ? "ONLINE 🟢" : "BUSY 🔴"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </main>
          )}

          {/* ========================================================================= */}
          {/* GOVERNMENT PORTAL — RESCUEGRID AI COMMAND CENTER                          */}
          {/* ========================================================================= */}
          {selectedRole === "government" && (() => {
            const rg = rescueGridState || {
              scenarioVersion: "v1.0.0-baseline",
              floodActive: true,
              floodSeverity: "severe",
              roadStates: { "ROAD-01": "VERIFIED_CLOSED", "ROAD-02": "REPORTED_CLOSED", "ROAD-03": "FLOOD_EXPOSED", "ROAD-04": "UNCERTAIN", "ROAD-05": "NO_KNOWN_HAZARD", "ROAD-06": "VERIFIED_OPEN" },
              hospitalCapacities: {
                "HOSP-01": { id: "HOSP-01", name: "Sassoon General Hospital & Trauma Centre", totalBeds: 120, availableBeds: 24, icuAvailable: 6 },
                "HOSP-02": { id: "HOSP-02", name: "Bharati Hospital Emergency Polyclinic", totalBeds: 80, availableBeds: 18, icuAvailable: 3 },
                "HOSP-03": { id: "HOSP-03", name: "Aundh Sub-District Civil Hospital", totalBeds: 60, availableBeds: 9, icuAvailable: 1 }
              },
              ambulances: [
                { id: "MH-12-AMB-108", type: "ALS (Advanced Life Support)", status: "AVAILABLE" },
                { id: "MH-12-AMB-204", type: "BLS (Basic Life Support)", status: "AVAILABLE" },
                { id: "MH-12-AMB-312", type: "ALS (High-Water Amphibious)", status: "AVAILABLE" },
                { id: "MH-12-AMB-405", type: "BLS (Basic Life Support)", status: "UNAVAILABLE", unavailReason: "Under scheduled mechanical overhaul" }
              ],
              incidents: [
                { id: "INC-FL-01", title: "Pulachi Wadi Submersion", urgency: "critical", peopleAffected: 6 },
                { id: "INC-FL-02", title: "Bhide Bridge Stranded Citizens", urgency: "high", peopleAffected: 10 },
                { id: "INC-FL-03", title: "Sangvi Lowland Inundation", urgency: "high", peopleAffected: 12 },
                { id: "INC-FL-04", title: "Yerawada Slum Waterlogging", urgency: "moderate", peopleAffected: 8 }
              ],
              inventory: {
                "Kit A: Hydration & Cholera": { available: 14500, required: 3600, shortage: 0 },
                "Kit B: Trauma & Wound Care": { available: 8200, required: 2400, shortage: 0 },
                "Kit C: Anti-Infective & Doxy": { available: 5400, required: 1800, shortage: 0 },
                "Kit D: Anti-Venom & Tetanus": { available: 1200, required: 450, shortage: 0 }
              },
              ambulanceAssignments: [
                { incidentId: "INC-FL-01", ambulanceId: "MH-12-AMB-108", routeDistanceKm: 4.8, etaMinutes: 8.2, status: "DISPATCHED", detourRequired: false, rationale: "Assigned closest ALS unit via direct corridor." },
                { incidentId: "INC-FL-02", ambulanceId: "MH-12-AMB-204", routeDistanceKm: 5.4, etaMinutes: 9.3, status: "DISPATCHED", detourRequired: false, rationale: "Assigned BLS unit for evacuation." },
                { incidentId: "INC-FL-03", ambulanceId: "MH-12-AMB-312", routeDistanceKm: 6.2, etaMinutes: 10.6, status: "DISPATCHED", detourRequired: false, rationale: "Assigned Amphibious ALS unit." },
                { incidentId: "INC-FL-04", ambulanceId: null, routeDistanceKm: null, etaMinutes: null, status: "QUEUED_SECOND_WAVE", detourRequired: false, rationale: "Fleet capacity exhausted. Queued for second wave." }
              ],
              hospitalAllocations: [
                { incidentId: "INC-FL-01", hospitalId: "HOSP-01", hospitalName: "Sassoon General Hospital", patientsAllocated: 6, status: "ALLOCATED" },
                { incidentId: "INC-FL-02", hospitalId: "HOSP-01", hospitalName: "Sassoon General Hospital", patientsAllocated: 10, status: "ALLOCATED" },
                { incidentId: "INC-FL-03", hospitalId: "HOSP-02", hospitalName: "Bharati Hospital Emergency Polyclinic", patientsAllocated: 12, status: "ALLOCATED" },
                { incidentId: "INC-FL-04", hospitalId: "HOSP-03", hospitalName: "Aundh Sub-District Civil Hospital", patientsAllocated: 8, status: "ALLOCATED" }
              ],
              stagingCamps: [],
              unmetDemandPatients: 0,
              beforeAfterMetrics: {
                baseline: { version: "v1.0.0-baseline", totalIncidents: 4, assignedAmbulances: 3, unassignedAmbulances: 0, avgRouteEtaMinutes: 9.4, allocatedHospitalBeds: 36, unmetPatientDemand: 0, activeMedicalCamps: 0 },
                recalculated: null,
                explanations: ["Baseline V1 plan initialized with 4 emergency disaster incidents across Central and Western Pune."]
              },
              auditLog: []
            };

            const isRoad3Closed = rg.roadStates && rg.roadStates["ROAD-03"] === "VERIFIED_CLOSED";
            const sassoonBeds = rg.hospitalCapacities && rg.hospitalCapacities["HOSP-01"] ? rg.hospitalCapacities["HOSP-01"].availableBeds : 24;

            return (
              <main style={{ padding: "12px", display: "flex", flexDirection: "column", gap: 14, background: "#f8fafc" }}>
                <section style={{
                  background: "#ffffff",
                  borderRadius: 14,
                  border: "1.5px solid #991b1b",
                  padding: "14px",
                  boxShadow: "0 2px 8px rgba(153, 27, 27, 0.06)"
                }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 9, background: "#fee2e2", color: "#991b1b", padding: "2px 6px", borderRadius: 8, fontWeight: 800 }}>
                          RESCUEGRID AI COMMAND
                        </span>
                        <span style={{ fontSize: 9, background: rg.scenarioVersion.includes("recalculated") ? "#dcfce7" : "#e0f2fe", color: rg.scenarioVersion.includes("recalculated") ? "#166534" : "#0369a1", padding: "2px 6px", borderRadius: 8, fontWeight: 900 }}>
                          {rg.scenarioVersion}
                        </span>
                      </div>
                      <h2 style={{ fontSize: 16, fontWeight: 900, margin: "4px 0 0 0", color: "#0f172a" }}>
                        🏛️ Government & SEOC Command Center
                      </h2>
                      <div style={{ fontSize: 10, color: "#64748b" }}>
                        Shared Disaster Scenario & Unified Response Engine
                      </div>
                    </div>
                    <span style={{ fontSize: 26 }}>🛡️</span>
                  </div>

                  {/* Griid AI Status Badge */}
                  <div style={{ background: "#f0fdf4", padding: "6px 8px", borderRadius: 6, marginBottom: 10, border: "1px solid #bbf7d0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 9, fontWeight: 800, color: "#166534" }}>
                      🗺️ Griid AI Status: Fallback Active (HealthNova Leaflet & Dijkstra)
                    </span>
                    <span style={{ fontSize: 8, background: "#16a34a", color: "#ffffff", padding: "2px 5px", borderRadius: 6, fontWeight: 800 }}>ONLINE</span>
                  </div>

                  {/* 1. SCENARIO SIMULATION CONTROLS */}
                  <div style={{ background: "#f8fafc", padding: "10px", borderRadius: 8, border: "1px solid #e2e8f0", marginBottom: 12 }}>
                    <div style={{ fontSize: 11, fontWeight: 900, color: "#0f172a", marginBottom: 6 }}>
                      ⚡ Simulated Disaster Scenario Controls:
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
                      <button
                        type="button"
                        onClick={() => handleToggleRoadClosure("ROAD-03")}
                        style={{
                          background: isRoad3Closed ? "#dc2626" : "#475569",
                          color: "#ffffff",
                          border: "none",
                          borderRadius: 6,
                          padding: "6px 10px",
                          fontSize: 10,
                          fontWeight: 800,
                          cursor: "pointer"
                        }}
                      >
                        ROAD-03: {isRoad3Closed ? "⛔ VERIFIED CLOSED" : "⚠️ FLOOD EXPOSED (CLICK TO CLOSE)"}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSetHospitalCapacity("HOSP-01", sassoonBeds <= 6 ? 24 : 6)}
                        style={{
                          background: sassoonBeds <= 6 ? "#ea580c" : "#475569",
                          color: "#ffffff",
                          border: "none",
                          borderRadius: 6,
                          padding: "6px 10px",
                          fontSize: 10,
                          fontWeight: 800,
                          cursor: "pointer"
                        }}
                      >
                        Sassoon Beds: {sassoonBeds} {sassoonBeds <= 6 ? "(FLOOD REDUCED)" : "(CLICK TO REDUCE TO 6)"}
                      </button>
                    </div>

                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        type="button"
                        onClick={handleRecalculatePlan}
                        style={{
                          flex: 1,
                          background: "#2563eb",
                          color: "#ffffff",
                          border: "none",
                          borderRadius: 6,
                          padding: "8px 10px",
                          fontSize: 11,
                          fontWeight: 900,
                          cursor: "pointer"
                        }}
                      >
                        🔄 Recalculate Recommendations
                      </button>
                      <button
                        type="button"
                        onClick={handleResetPlan}
                        style={{
                          background: "#64748b",
                          color: "#ffffff",
                          border: "none",
                          borderRadius: 6,
                          padding: "8px 10px",
                          fontSize: 11,
                          fontWeight: 800,
                          cursor: "pointer"
                        }}
                      >
                        Reset V1
                      </button>
                    </div>
                  </div>

                  {/* 2. HAZARD ZONES & ROAD STATUS */}
                  <div style={{ fontSize: 11, fontWeight: 900, color: "#0f172a", marginBottom: 6 }}>
                    🌊 Hazard Zones & Road Closures:
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 12 }}>
                    {Object.entries(rg.roadStates || {}).map(([code, st]) => (
                      <div key={code} style={{ background: "#f8fafc", padding: "6px 8px", borderRadius: 6, border: "1px solid #e2e8f0" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontWeight: 800, fontSize: 10, color: "#0f172a" }}>{code}</span>
                          <span style={{
                            fontSize: 8,
                            fontWeight: 800,
                            padding: "2px 4px",
                            borderRadius: 4,
                            background: st === "VERIFIED_CLOSED" ? "#fee2e2" : st === "FLOOD_EXPOSED" ? "#ffedd5" : "#ecfdf5",
                            color: st === "VERIFIED_CLOSED" ? "#991b1b" : st === "FLOOD_EXPOSED" ? "#c2410c" : "#065f46"
                          }}>
                            {st}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* 3. ACTIVE INCIDENTS */}
                  <div style={{ fontSize: 11, fontWeight: 900, color: "#0f172a", marginBottom: 6 }}>
                    🚨 Emergency Incidents ({(rg.incidents || []).length} Active):
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
                    {(rg.incidents || []).map((inc) => (
                      <div key={inc.id} style={{ background: "#f8fafc", padding: "8px 10px", borderRadius: 6, border: "1px solid #e2e8f0" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontWeight: 800, fontSize: 11, color: "#0f172a" }}>{inc.id}: {inc.title}</span>
                          <span style={{ fontSize: 8, fontWeight: 800, color: inc.urgency === "critical" ? "#dc2626" : "#ea580c" }}>
                            {inc.urgency.toUpperCase()}
                          </span>
                        </div>
                        <div style={{ fontSize: 9, color: "#475569", marginTop: 2 }}>
                          Affected: <strong>{inc.peopleAffected} citizens</strong>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* 4. TEMPORARY MEDICAL CAMP RECOMMENDATION (CAMP ALPHA) */}
                  {(rg.stagingCamps || []).length > 0 && (
                    <div style={{ background: "#fef3c7", border: "1.5px solid #f59e0b", borderRadius: 8, padding: "10px", marginBottom: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: 10, fontWeight: 900, color: "#92400e" }}>
                          ⛺ CANDIDATE TEMPORARY MEDICAL CAMP ACTIVATED
                        </span>
                        <span style={{ fontSize: 8, background: "#d97706", color: "#ffffff", padding: "2px 5px", borderRadius: 6, fontWeight: 800 }}>RECOMMENDED</span>
                      </div>
                      <div style={{ fontSize: 11, fontWeight: 900, color: "#78350f", marginTop: 2 }}>
                        {rg.stagingCamps[0].name}
                      </div>
                      <div style={{ fontSize: 9, color: "#92400e", marginTop: 2 }}>
                        Capacity: <strong>{rg.stagingCamps[0].targetCapacityBeds} Beds</strong> • Redirected: <strong>{rg.stagingCamps[0].patientsRedirected} excess flood patients</strong> from Sassoon overload.
                      </div>
                      <div style={{ fontSize: 8, color: "#78350f", marginTop: 2 }}>
                        Supplies Dispatched: 250 ORS, 120 Trauma Packs, 1,000 Clean Water Pouches.
                      </div>
                    </div>
                  )}

                  {/* 5. BEFORE-AND-AFTER DECISION METRICS TABLE */}
                  <div style={{ fontSize: 11, fontWeight: 900, color: "#0f172a", marginBottom: 6 }}>
                    📊 Before-and-After Decision Metrics:
                  </div>
                  <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, overflow: "hidden", marginBottom: 12 }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 9, textAlign: "left" }}>
                      <thead>
                        <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                          <th style={{ padding: "6px 4px", color: "#475569" }}>Metric</th>
                          <th style={{ padding: "6px 4px", color: "#475569" }}>Baseline (V1)</th>
                          <th style={{ padding: "6px 4px", color: "#0369a1" }}>Active State</th>
                          <th style={{ padding: "6px 4px", color: "#15803d" }}>Delta</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                          <td style={{ padding: "4px 2px", fontWeight: 700 }}>Ambulances Deployed</td>
                          <td style={{ padding: "4px 2px" }}>3 / 3 Units</td>
                          <td style={{ padding: "4px 2px" }}>3 / 3 Units</td>
                          <td style={{ padding: "4px 2px", color: isRoad3Closed ? "#ea580c" : "#16a34a" }}>
                            {isRoad3Closed ? "Rerouted via Bypass" : "Direct Corridors"}
                          </td>
                        </tr>
                        <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                          <td style={{ padding: "4px 2px", fontWeight: 700 }}>Average Route ETA</td>
                          <td style={{ padding: "4px 2px" }}>9.4 mins</td>
                          <td style={{ padding: "4px 2px", fontWeight: 800, color: isRoad3Closed ? "#dc2626" : "#16a34a" }}>
                            {rg.beforeAfterMetrics && rg.beforeAfterMetrics.recalculated ? `${rg.beforeAfterMetrics.recalculated.avgRouteEtaMinutes} mins` : "9.4 mins"}
                          </td>
                          <td style={{ padding: "4px 2px", color: isRoad3Closed ? "#dc2626" : "#64748b" }}>
                            {isRoad3Closed ? "+6.5m detour penalty" : "Nominal"}
                          </td>
                        </tr>
                        <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                          <td style={{ padding: "4px 2px", fontWeight: 700 }}>Allocated Beds</td>
                          <td style={{ padding: "4px 2px" }}>36 / 36 (100%)</td>
                          <td style={{ padding: "4px 2px", fontWeight: 800, color: sassoonBeds <= 6 ? "#ea580c" : "#16a34a" }}>
                            {rg.beforeAfterMetrics && rg.beforeAfterMetrics.recalculated ? `${rg.beforeAfterMetrics.recalculated.allocatedHospitalBeds} Beds` : "36 Beds"}
                          </td>
                          <td style={{ padding: "4px 2px", color: sassoonBeds <= 6 ? "#dc2626" : "#16a34a" }}>
                            {sassoonBeds <= 6 ? "-12 beds (Ward Flooding)" : "All Satisfied"}
                          </td>
                        </tr>
                        <tr>
                          <td style={{ padding: "4px 2px", fontWeight: 700 }}>Unmet Demand / Camps</td>
                          <td style={{ padding: "4px 2px" }}>0 Pts / 0 Camps</td>
                          <td style={{ padding: "4px 2px", fontWeight: 800, color: rg.unmetDemandPatients > 0 ? "#dc2626" : "#16a34a" }}>
                            {rg.unmetDemandPatients} Pts / {(rg.stagingCamps || []).length} Camp
                          </td>
                          <td style={{ padding: "4px 2px", color: rg.unmetDemandPatients > 0 ? "#ea580c" : "#16a34a" }}>
                            {rg.unmetDemandPatients > 0 ? "Absorbed by Camp Alpha" : "Normal"}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* 6. DECISION EXPLANATIONS */}
                  <div style={{ background: "#f1f5f9", padding: "8px 10px", borderRadius: 6, fontSize: 9, color: "#334155", lineHeight: 1.45 }}>
                    <strong>RescueGrid AI Recommendation Rationale:</strong>
                    <ul style={{ margin: "4px 0 0 0", paddingLeft: 14 }}>
                      {((rg.beforeAfterMetrics && rg.beforeAfterMetrics.explanations) || []).map((exp, i) => (
                        <li key={i} style={{ marginBottom: 2 }}>{exp}</li>
                      ))}
                    </ul>
                  </div>

                  {/* 7. STATE EMERGENCY GIS TACTICAL MAP */}
                  <div id="healthnova-govt-map-section" style={{ marginTop: 14, borderTop: "1px solid #e2e8f0", paddingTop: 10 }}>
                    <div style={{ fontSize: 12, fontWeight: 900, color: "#0f172a", marginBottom: 6 }}>
                      🗺️ State Emergency GIS Tactical Map (Multi-Disaster Command)
                    </div>
                    {window.SentinelCommandMap
                      ? React.createElement(window.SentinelCommandMap)
                      : <div style={{ background: "#f8fafc", borderRadius: 8, padding: "20px", textAlign: "center", fontSize: 11, color: "#64748b", border: "1px solid #e2e8f0" }}>🗺️ Loading Sentinel GIS Map…</div>
                    }
                  </div>
                </section>
              </main>
            );
          })()}

          {/* ========================================================================= */}
          {/* AMBULANCE PORTAL — RESCUEGRID AI DISPATCH ASSISTANT                       */}
          {/* ========================================================================= */}
          {selectedRole === "ambulance" && (() => {
            const rg = rescueGridState || {
              scenarioVersion: "v1.0.0-baseline",
              ambulances: [
                { id: "MH-12-AMB-108", type: "ALS (Advanced Life Support)", status: "AVAILABLE" },
                { id: "MH-12-AMB-204", type: "BLS (Basic Life Support)", status: "AVAILABLE" },
                { id: "MH-12-AMB-312", type: "ALS (High-Water Amphibious)", status: "AVAILABLE" },
                { id: "MH-12-AMB-405", type: "BLS (Basic Life Support)", status: "UNAVAILABLE", unavailReason: "Under scheduled mechanical overhaul" }
              ],
              ambulanceAssignments: [
                { incidentId: "INC-FL-01", ambulanceId: "MH-12-AMB-108", routeDistanceKm: 4.8, etaMinutes: 8.2, status: "DISPATCHED", detourRequired: false, rationale: "Assigned closest ALS unit via direct corridor." },
                { incidentId: "INC-FL-02", ambulanceId: "MH-12-AMB-204", routeDistanceKm: 5.4, etaMinutes: 9.3, status: "DISPATCHED", detourRequired: false, rationale: "Assigned BLS unit for evacuation." },
                { incidentId: "INC-FL-03", ambulanceId: "MH-12-AMB-312", routeDistanceKm: 6.2, etaMinutes: 10.6, status: "DISPATCHED", detourRequired: false, rationale: "Assigned Amphibious ALS unit." },
                { incidentId: "INC-FL-04", ambulanceId: null, routeDistanceKm: null, etaMinutes: null, status: "QUEUED_SECOND_WAVE", detourRequired: false, rationale: "Fleet capacity exhausted. Queued for second wave." }
              ],
              hospitalCapacities: {
                "HOSP-01": { id: "HOSP-01", name: "Sassoon General Hospital & Trauma Centre", totalBeds: 120, availableBeds: 24, icuAvailable: 6 },
                "HOSP-02": { id: "HOSP-02", name: "Bharati Hospital Emergency Polyclinic", totalBeds: 80, availableBeds: 18, icuAvailable: 3 },
                "HOSP-03": { id: "HOSP-03", name: "Aundh Sub-District Civil Hospital", totalBeds: 60, availableBeds: 9, icuAvailable: 1 }
              },
              roadStates: { "ROAD-03": "FLOOD_EXPOSED" }
            };

            const isRoad3Closed = rg.roadStates && rg.roadStates["ROAD-03"] === "VERIFIED_CLOSED";

            return (
              <main style={{ padding: "12px", display: "flex", flexDirection: "column", gap: 14, background: "#f8fafc" }}>
                <section style={{
                  background: "#ffffff",
                  borderRadius: 14,
                  border: "1.5px solid #15803d",
                  padding: "14px",
                  boxShadow: "0 2px 8px rgba(21, 128, 61, 0.06)"
                }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 9, background: "#dcfce7", color: "#15803d", padding: "2px 6px", borderRadius: 8, fontWeight: 800 }}>
                          108 FLEET COMMAND
                        </span>
                        <span style={{ fontSize: 9, background: rg.scenarioVersion.includes("recalculated") ? "#dcfce7" : "#e0f2fe", color: rg.scenarioVersion.includes("recalculated") ? "#166534" : "#0369a1", padding: "2px 6px", borderRadius: 8, fontWeight: 900 }}>
                          {rg.scenarioVersion}
                        </span>
                      </div>
                      <h2 style={{ fontSize: 16, fontWeight: 900, margin: "4px 0 0 0", color: "#0f172a" }}>
                        🚑 RescueGrid AI Dispatch Assistant
                      </h2>
                      <div style={{ fontSize: 10, color: "#64748b" }}>
                        Intelligent Fleet Routing, Detour Avoidance & Staging
                      </div>
                    </div>
                    <span style={{ fontSize: 26 }}>🚨</span>
                  </div>

                  {/* Griid AI Status Badge */}
                  <div style={{ background: "#f0fdf4", padding: "6px 8px", borderRadius: 6, marginBottom: 10, border: "1px solid #bbf7d0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 9, fontWeight: 800, color: "#166534" }}>
                      🗺️ Griid AI Status: Fallback Active (HealthNova Leaflet & Dijkstra)
                    </span>
                    <span style={{ fontSize: 8, background: "#15803d", color: "#ffffff", padding: "2px 5px", borderRadius: 6, fontWeight: 800 }}>FLEET SYNCED</span>
                  </div>

                  {/* Detour Alert */}
                  {isRoad3Closed && (
                    <div style={{ background: "#fef2f2", border: "1.5px solid #ef4444", borderRadius: 8, padding: "8px 10px", marginBottom: 10 }}>
                      <div style={{ fontSize: 10, fontWeight: 900, color: "#991b1b" }}>
                        ⚠️ ACTIVE DETOUR ENFORCED: ROAD-03 VERIFIED CLOSED
                      </div>
                      <div style={{ fontSize: 9, color: "#b91c1c", marginTop: 2 }}>
                        Ambulances for Incident INC-FL-02 rerouted via University Flyover & Senapati Bapat Road. Route length increased by +3.1 km (+6.5 mins).
                      </div>
                    </div>
                  )}

                  {/* 1. DISPATCH ASSIGNMENTS & ROUTE STATUS */}
                  <div style={{ fontSize: 11, fontWeight: 900, color: "#0f172a", marginBottom: 6 }}>
                    🚨 Active Incident Dispatches & Routes:
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
                    {(rg.ambulanceAssignments || []).map((assign, i) => (
                      <div key={i} style={{ background: "#f8fafc", padding: "8px 10px", borderRadius: 6, borderLeft: assign.ambulanceId ? "3px solid #16a34a" : "3px solid #ea580c", border: "1px solid #e2e8f0" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontWeight: 800, fontSize: 11, color: "#0f172a" }}>
                            {assign.incidentId}
                          </span>
                          <span style={{ fontSize: 8, fontWeight: 900, padding: "2px 5px", borderRadius: 4, background: assign.ambulanceId ? "#dcfce7" : "#ffedd5", color: assign.ambulanceId ? "#166534" : "#c2410c" }}>
                            {assign.status}
                          </span>
                        </div>
                        <div style={{ fontSize: 9, color: "#334155", marginTop: 2 }}>
                          Unit: <strong>{assign.ambulanceId || "None Available (Queued)"}</strong>
                        </div>
                        {assign.routeDistanceKm && (
                          <div style={{ fontSize: 9, color: "#166534", fontWeight: 700, marginTop: 1 }}>
                            Route: {assign.routeDistanceKm} km • ETA: {assign.etaMinutes} mins {assign.detourRequired ? "⚠️ (DETOUR ACTIVE)" : "✓ (OPTIMAL)"}
                          </div>
                        )}
                        <div style={{ fontSize: 8, color: "#64748b", marginTop: 2 }}>
                          Reason: {assign.rationale}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* 2. FLEET AVAILABILITY STATUS (STRICT NO DOUBLE-BOOKING) */}
                  <div style={{ fontSize: 11, fontWeight: 900, color: "#0f172a", marginBottom: 6 }}>
                    🚑 Fleet Inventory Status:
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {(rg.ambulances || []).map((amb) => (
                      <div key={amb.id} style={{ background: "#f8fafc", padding: "6px 8px", borderRadius: 6, border: "1px solid #e2e8f0" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontWeight: 800, fontSize: 10, color: "#0f172a" }}>{amb.id} ({amb.type})</span>
                          <span style={{ fontSize: 8, fontWeight: 800, color: amb.status === "AVAILABLE" ? "#16a34a" : "#dc2626" }}>
                            {amb.status}
                          </span>
                        </div>
                        {amb.unavailReason && (
                          <div style={{ fontSize: 8, color: "#dc2626", marginTop: 2 }}>
                            {amb.unavailReason}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* 3. NEARBY HOSPITALS & PATIENT RESOURCES TELEMETRY (AMBULANCE DRIVER LIVE VIEW) */}
                  <div id="ambulance-nearby-hospitals-section" style={{ marginTop: 14, marginBottom: 12, borderTop: "1px solid #e2e8f0", paddingTop: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <div style={{ fontSize: 12, fontWeight: 900, color: "#0f172a" }}>
                        🏥 Nearby Emergency Hospitals & Live Patient Resources:
                      </div>
                      <span style={{ fontSize: 9, fontWeight: 800, background: "#dbeafe", color: "#1e40af", padding: "2px 6px", borderRadius: 6 }}>
                        3 Facilities Nearby
                      </span>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {[
                        {
                          id: "HOSP-01",
                          name: "Sassoon General Hospital & Trauma Centre",
                          tier: "Level 1 Tertiary Emergency",
                          distance: "4.8 km (~8 mins)",
                          totalBeds: 120,
                          availBeds: (rg.hospitalCapacities && rg.hospitalCapacities["HOSP-01"] ? rg.hospitalCapacities["HOSP-01"].availableBeds : 24),
                          icuBeds: (rg.hospitalCapacities && rg.hospitalCapacities["HOSP-01"] ? rg.hospitalCapacities["HOSP-01"].icuAvailable : 6),
                          floodStatus: "Dry / Elevated Ramp Intact",
                          resources: [
                            "🫁 100% Medical Oxygen & Ventilators",
                            "🩸 24x7 Emergency Blood Bank & Trauma Suites",
                            "🐍 Anti-Venom & Rapid Tetanus Units",
                            "💊 Advanced Resuscitation Crash Carts"
                          ]
                        },
                        {
                          id: "HOSP-02",
                          name: "Bharati Hospital Emergency Polyclinic",
                          tier: "Level 2 Emergency Trauma",
                          distance: "6.2 km (~10 mins)",
                          totalBeds: 80,
                          availBeds: (rg.hospitalCapacities && rg.hospitalCapacities["HOSP-02"] ? rg.hospitalCapacities["HOSP-02"].availableBeds : 18),
                          icuBeds: (rg.hospitalCapacities && rg.hospitalCapacities["HOSP-02"] ? rg.hospitalCapacities["HOSP-02"].icuAvailable : 3),
                          floodStatus: "Dry / Perimeter Monitored",
                          resources: [
                            "🫁 Central High-Flow Oxygen Pipeline",
                            "🩺 Rapid Stabilization & Dehydration Ward",
                            "🩹 Trauma Dressing & Wound Irrigation Bays",
                            "💊 Kit B Trauma & Kit C Stockpiles"
                          ]
                        },
                        {
                          id: "HOSP-03",
                          name: "Aundh Sub-District Civil Hospital",
                          tier: "Level 2 Sub-District Hospital",
                          distance: "7.1 km (~12 mins)",
                          totalBeds: 60,
                          availBeds: (rg.hospitalCapacities && rg.hospitalCapacities["HOSP-03"] ? rg.hospitalCapacities["HOSP-03"].availableBeds : 9),
                          icuBeds: (rg.hospitalCapacities && rg.hospitalCapacities["HOSP-03"] ? rg.hospitalCapacities["HOSP-03"].icuAvailable : 1),
                          floodStatus: "Dry / North Flyover Access Intact",
                          resources: [
                            "🫁 Cylinder Oxygen Reserves",
                            "🧪 Rapid Diagnostics & Observation Beds",
                            "💉 Tetanus Toxoid & Water Infection Bays",
                            "💊 Kit A Hydration & WHO-ORS Kiosk"
                          ]
                        }
                      ].map((hosp) => {
                        const occupied = hosp.totalBeds - hosp.availBeds;
                        const fillPercent = Math.min(100, Math.max(0, Math.round((occupied / hosp.totalBeds) * 100)));
                        const isHighFill = fillPercent >= 85;
                        const fillColor = fillPercent >= 90 ? "#dc2626" : (fillPercent >= 75 ? "#d97706" : "#16a34a");

                        return (
                          <div key={hosp.id} style={{ background: "#ffffff", border: "1.5px solid #e2e8f0", borderRadius: 8, padding: "10px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 4 }}>
                              <div>
                                <div style={{ fontSize: 12, fontWeight: 900, color: "#0f172a" }}>
                                  🏥 {hosp.name}
                                </div>
                                <div style={{ fontSize: 9, color: "#64748b" }}>
                                  {hosp.tier} • 📍 {hosp.distance} • Access: <strong>{hosp.floodStatus}</strong>
                                </div>
                              </div>
                              <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 7px", borderRadius: 6, background: isHighFill ? "#fee2e2" : "#dcfce7", color: isHighFill ? "#991b1b" : "#166534" }}>
                                {hosp.availBeds} Beds Avail ({hosp.icuBeds} ICU)
                              </span>
                            </div>

                            {/* Occupancy Fill Meter */}
                            <div style={{ marginTop: 8, marginBottom: 6 }}>
                              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, fontWeight: 800, color: "#334155", marginBottom: 3 }}>
                                <span>Occupancy Load: {occupied} / {hosp.totalBeds} Beds Total</span>
                                <span style={{ color: fillColor }}>{fillPercent}% Filled {isHighFill ? "⚠️ (HIGH SURGE)" : "✓ (ACCEPTING)"}</span>
                              </div>
                              <div style={{ width: "100%", height: 6, background: "#e2e8f0", borderRadius: 999, overflow: "hidden" }}>
                                <div style={{ width: `${fillPercent}%`, height: "100%", background: fillColor, borderRadius: 999 }} />
                              </div>
                            </div>

                            {/* Resources Available to Patients */}
                            <div style={{ marginTop: 6, background: "#f8fafc", padding: "6px 8px", borderRadius: 6, border: "1px solid #f1f5f9" }}>
                              <div style={{ fontSize: 9, fontWeight: 800, color: "#0f172a", marginBottom: 3 }}>
                                🩺 Resources Available to Patients:
                              </div>
                              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3, fontSize: 8.5, color: "#475569" }}>
                                {hosp.resources.map((res, idx) => (
                                  <div key={idx} style={{ display: "flex", alignItems: "center", gap: 3 }}>
                                    <span>{res}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 4. TACTICAL OPERATIONS & EVACUATION ROUTE GIS MAP */}
                  <div id="healthnova-ambulance-map-section" style={{ marginTop: 14, borderTop: "1px solid #e2e8f0", paddingTop: 10 }}>
                    <div style={{ fontSize: 12, fontWeight: 900, color: "#0f172a", marginBottom: 6 }}>
                      🗺️ Tactical Operations & Evacuation Route GIS Map
                    </div>
                    {window.SentinelCommandMap
                      ? React.createElement(window.SentinelCommandMap)
                      : <div style={{ background: "#f8fafc", borderRadius: 8, padding: "20px", textAlign: "center", fontSize: 11, color: "#64748b", border: "1px solid #e2e8f0" }}>🗺️ Loading Sentinel GIS Map…</div>
                    }
                  </div>
                </section>
              </main>
            );
          })()}

          {/* ========================================================================= */}
          {/* MEDICINE PORTAL — RESCUEGRID AI MEDICAL RESOURCE INTELLIGENCE             */}
          {/* ========================================================================= */}
          {selectedRole === "medicine" && (() => {
            const rg = rescueGridState || {
              scenarioVersion: "v1.0.0-baseline",
              hospitalCapacities: {
                "HOSP-01": { id: "HOSP-01", name: "Sassoon General Hospital & Trauma Centre", totalBeds: 120, availableBeds: 24, icuAvailable: 6 },
                "HOSP-02": { id: "HOSP-02", name: "Bharati Hospital Emergency Polyclinic", totalBeds: 80, availableBeds: 18, icuAvailable: 3 },
                "HOSP-03": { id: "HOSP-03", name: "Aundh Sub-District Civil Hospital", totalBeds: 60, availableBeds: 9, icuAvailable: 1 }
              },
              hospitalAllocations: [
                { incidentId: "INC-FL-01", hospitalId: "HOSP-01", hospitalName: "Sassoon General Hospital", patientsAllocated: 6, status: "ALLOCATED" },
                { incidentId: "INC-FL-02", hospitalId: "HOSP-01", hospitalName: "Sassoon General Hospital", patientsAllocated: 10, status: "ALLOCATED" },
                { incidentId: "INC-FL-03", hospitalId: "HOSP-02", hospitalName: "Bharati Hospital Emergency Polyclinic", patientsAllocated: 12, status: "ALLOCATED" },
                { incidentId: "INC-FL-04", hospitalId: "HOSP-03", hospitalName: "Aundh Sub-District Civil Hospital", patientsAllocated: 8, status: "ALLOCATED" }
              ],
              inventory: {
                "Kit A: Hydration & Cholera": { available: 14500, required: 3600, shortage: 0 },
                "Kit B: Trauma & Wound Care": { available: 8200, required: 2400, shortage: 0 },
                "Kit C: Anti-Infective & Doxy": { available: 5400, required: 1800, shortage: 0 },
                "Kit D: Anti-Venom & Tetanus": { available: 1200, required: 450, shortage: 0 }
              },
              stagingCamps: [],
              unmetDemandPatients: 0
            };

            const sassoonBeds = rg.hospitalCapacities && rg.hospitalCapacities["HOSP-01"] ? rg.hospitalCapacities["HOSP-01"].availableBeds : 24;

            return (
              <main style={{ padding: "12px", display: "flex", flexDirection: "column", gap: 14, background: "#f8fafc" }}>
                <section style={{
                  background: "#ffffff",
                  borderRadius: 14,
                  border: "1.5px solid #0369a1",
                  padding: "14px",
                  boxShadow: "0 2px 8px rgba(3, 105, 161, 0.06)"
                }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 9, background: "#e0f2fe", color: "#0369a1", padding: "2px 6px", borderRadius: 8, fontWeight: 800 }}>
                          DISASTER PHARMACY DEPOT
                        </span>
                        <span style={{ fontSize: 9, background: rg.scenarioVersion.includes("recalculated") ? "#dcfce7" : "#e0f2fe", color: rg.scenarioVersion.includes("recalculated") ? "#166534" : "#0369a1", padding: "2px 6px", borderRadius: 8, fontWeight: 900 }}>
                          {rg.scenarioVersion}
                        </span>
                      </div>
                      <h2 style={{ fontSize: 16, fontWeight: 900, margin: "4px 0 0 0", color: "#0f172a" }}>
                        💊 RescueGrid AI Medical Resource Intelligence
                      </h2>
                      <div style={{ fontSize: 10, color: "#64748b" }}>
                        Capacity Enforcement, Kit Redistribution & Field Camps
                      </div>
                    </div>
                    <span style={{ fontSize: 26 }}>📦</span>
                  </div>

                  {/* Griid AI Status Badge */}
                  <div style={{ background: "#f0fdf4", padding: "6px 8px", borderRadius: 6, marginBottom: 10, border: "1px solid #bbf7d0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 9, fontWeight: 800, color: "#166534" }}>
                      🏥 Griid AI Status: Fallback Active (HealthNova Leaflet & Dijkstra)
                    </span>
                    <span style={{ fontSize: 8, background: "#0284c7", color: "#ffffff", padding: "2px 5px", borderRadius: 6, fontWeight: 800 }}>COLD CHAIN OK</span>
                  </div>

                  {/* 1. HOSPITAL CAPACITIES & LOAD FACTORS */}
                  <div style={{ fontSize: 11, fontWeight: 900, color: "#0f172a", marginBottom: 6 }}>
                    🏥 Hospital Capacity & Patient Allocation:
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
                    {[
                      { id: "HOSP-01", name: "Sassoon Trauma Centre", avail: sassoonBeds, total: 120, status: sassoonBeds <= 6 ? "FLOOD CONSTRAINED" : "NORMAL", color: sassoonBeds <= 6 ? "#dc2626" : "#0284c7" },
                      { id: "HOSP-02", name: "Bharati Emergency Polyclinic", avail: (rg.hospitalCapacities && rg.hospitalCapacities["HOSP-02"] && rg.hospitalCapacities["HOSP-02"].availableBeds) || 18, total: 80, status: "OPERATIONAL", color: "#16a34a" },
                      { id: "HOSP-03", name: "Aundh Civil Hospital", avail: (rg.hospitalCapacities && rg.hospitalCapacities["HOSP-03"] && rg.hospitalCapacities["HOSP-03"].availableBeds) || 9, total: 60, status: "OPERATIONAL", color: "#16a34a" }
                    ].map((hosp) => (
                      <div key={hosp.id} style={{ background: "#f8fafc", padding: "8px 10px", borderRadius: 6, border: "1px solid #e2e8f0" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div>
                            <span style={{ fontWeight: 800, fontSize: 11, color: "#0f172a" }}>{hosp.name}</span>
                            <span style={{ fontSize: 8, color: hosp.color, marginLeft: 6, fontWeight: 700 }}>({hosp.status})</span>
                          </div>
                          <span style={{ fontSize: 10, fontWeight: 900, color: hosp.color }}>
                            {hosp.avail} Beds Avail
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* 2. CANDIDATE TEMPORARY MEDICAL CAMP (IF UNMET DEMAND) */}
                  {(rg.stagingCamps || []).length > 0 && (
                    <div style={{ background: "#fef3c7", border: "1.5px solid #f59e0b", borderRadius: 8, padding: "10px", marginBottom: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: 10, fontWeight: 900, color: "#92400e" }}>
                          ⛺ CANDIDATE TEMPORARY MEDICAL CAMP RECOMMENDED
                        </span>
                        <span style={{ fontSize: 8, background: "#d97706", color: "#ffffff", padding: "2px 5px", borderRadius: 6, fontWeight: 800 }}>ACTIVATED</span>
                      </div>
                      <div style={{ fontSize: 11, fontWeight: 900, color: "#78350f", marginTop: 2 }}>
                        {rg.stagingCamps[0].name}
                      </div>
                      <div style={{ fontSize: 9, color: "#92400e", marginTop: 2 }}>
                        Target Capacity: <strong>{rg.stagingCamps[0].targetCapacityBeds} Beds</strong> • Redirected: <strong>{rg.stagingCamps[0].patientsRedirected} excess patients</strong>.
                      </div>
                      <div style={{ fontSize: 8, color: "#78350f", marginTop: 4 }}>
                        Provisioned Supplies: 250 ORS/Hydration Kits, 120 Trauma Dressing Kits, 1,000 Water Pouches from Depot-01.
                      </div>
                    </div>
                  )}

                  {/* 3. RELIEF KITS STOCKPILE & DEMAND CONSERVATION */}
                  <div style={{ fontSize: 11, fontWeight: 900, color: "#0f172a", marginBottom: 6 }}>
                    📦 Relief Kits Stockpile & Demand Conservation:
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                    {[
                      { name: "Kit A: Hydration / Cholera", stock: "14,500 Packs", req: "3,600 Packs", color: "#0284c7", contents: "WHO ORS, Zinc, Water Tablets" },
                      { name: "Kit B: Trauma & Wound", stock: "8,200 Kits", req: "2,400 Kits", color: "#dc2626", contents: "Iodine, Gauze, Tourniquets" },
                      { name: "Kit C: Anti-Infective", stock: "5,400 Packs", req: "1,800 Packs", color: "#16a34a", contents: "Doxycycline 100mg, Azithromycin" },
                      { name: "Kit D: Anti-Venom & TT", stock: "1,200 Vials", req: "450 Vials", color: "#7c3aed", contents: "Snake Anti-venom, TT Vials" }
                    ].map((kit, i) => (
                      <div key={i} style={{ background: "#f8fafc", padding: "6px 8px", borderRadius: 6, border: "1px solid #e2e8f0" }}>
                        <div style={{ fontSize: 9, fontWeight: 800, color: kit.color }}>{kit.name}</div>
                        <div style={{ fontSize: 12, fontWeight: 900, color: "#0f172a", margin: "1px 0" }}>{kit.stock}</div>
                        <div style={{ fontSize: 8, color: "#15803d", fontWeight: 700 }}>Req: {kit.req} (0 Shortage)</div>
                        <div style={{ fontSize: 8, color: "#64748b", marginTop: 2 }}>{kit.contents}</div>
                      </div>
                    ))}
                  </div>

                  {/* 4. TACTICAL OPERATIONS & RESOURCE GIS MAP */}
                  <div id="healthnova-pharmacy-map-section" style={{ marginTop: 14, borderTop: "1px solid #e2e8f0", paddingTop: 10 }}>
                    <div style={{ fontSize: 12, fontWeight: 900, color: "#0f172a", marginBottom: 6 }}>
                      🗺️ Tactical Operations & Resource GIS Map
                    </div>
                    {window.SentinelCommandMap
                      ? React.createElement(window.SentinelCommandMap)
                      : <div style={{ background: "#f8fafc", borderRadius: 8, padding: "20px", textAlign: "center", fontSize: 11, color: "#64748b", border: "1px solid #e2e8f0" }}>🗺️ Loading Sentinel GIS Map…</div>
                    }
                  </div>

                  <div style={{ marginTop: 10, textAlign: "center", fontSize: 8, color: "#94a3b8" }}>
                    🔒 SIMULATED DATA — Hospital capacity and camp recommendations are decision-support models.
                  </div>
                </section>
              </main>
            );
          })()}


          {/* ========================================================================= */}
          {/* 6. AERORELIEF: EMERGENCY AIR-SUPPLY COORDINATION (PRD v1.0)               */}
          {/* ========================================================================= */}
          {(selectedRole === "aerorelife" || selectedRole === "aerorelief") && (() => {
            const rg = rescueGridState || {
              scenarioVersion: "v1.0.0-baseline",
              roadStates: {
                "ROAD-01": "VERIFIED_CLOSED",
                "ROAD-02": "REPORTED_CLOSED",
                "ROAD-03": "FLOOD_EXPOSED",
                "ROAD-04": "UNCERTAIN",
                "ROAD-05": "NO_KNOWN_HAZARD",
                "ROAD-06": "VERIFIED_OPEN"
              },
              hospitalCapacities: {
                "HOSP-01": { id: "HOSP-01", name: "Sassoon General Hospital & Trauma Centre", totalBeds: 120, availableBeds: 24, icuAvailable: 6 },
                "HOSP-02": { id: "HOSP-02", name: "Bharati Hospital Emergency Polyclinic", totalBeds: 80, availableBeds: 18, icuAvailable: 3 },
                "HOSP-03": { id: "HOSP-03", name: "Aundh Sub-District Civil Hospital", totalBeds: 60, availableBeds: 9, icuAvailable: 1 }
              },
              ambulances: [
                { id: "MH-12-AMB-108", type: "ALS (Advanced Life Support)", status: "AVAILABLE" },
                { id: "MH-12-AMB-204", type: "BLS (Basic Life Support)", status: "AVAILABLE" },
                { id: "MH-12-AMB-312", type: "ALS (Amphibious Unit)", status: "AVAILABLE" },
                { id: "MH-12-AMB-405", type: "BLS (Maintenance)", status: "UNAVAILABLE" }
              ],
              incidents: [
                { id: "INC-FL-01", title: "Pulachi Wadi Submersion", category: "injury", urgency: "critical", peopleAffected: 6, medicalNeeds: ["Direct Trauma", "Hypothermia", "ORS Hydration"] },
                { id: "INC-FL-02", title: "Bhide Bridge Stranded Citizens", category: "evacuation", urgency: "high", peopleAffected: 10, medicalNeeds: ["Evacuation", "Sterile Dressing"] },
                { id: "INC-FL-03", title: "Sangvi Lowland Inundation", category: "medical_supply", urgency: "high", peopleAffected: 12, medicalNeeds: ["Cholera Prophylaxis", "Water Purification"] },
                { id: "INC-FL-04", title: "Yerawada Slum Waterlogging", category: "injury", urgency: "moderate", peopleAffected: 8, medicalNeeds: ["Minor Abrasions", "Thermal Foil"] }
              ],
              inventory: {
                "Kit A: Hydration & Cholera": { available: 14500, required: 3600, shortage: 0, unit: "Packs" },
                "Kit B: Trauma & Wound Care": { available: 8200, required: 2400, shortage: 0, unit: "Kits" },
                "Kit C: Anti-Infective & Doxy": { available: 5400, required: 1800, shortage: 0, unit: "Packs" },
                "Kit D: Anti-Venom & Tetanus": { available: 1200, required: 450, shortage: 0, unit: "Vials" }
              },
              unmetDemandPatients: 0,
              auditLog: []
            };

            // Section 6.3 Candidate-Zone Catalog & Attributes
            const candidateZones = [
              {
                candidate_id: "AERO-ZONE-PUNE-01",
                label: "Sangvi Riverside Sports Ground (Clearing)",
                geometry: "Point [73.8162, 18.5735] (EPSG:4326), Derived from Pune Municipal Open Space Registry (Layer ID: PUNE-OS-104)",
                source_type: "Prepared dataset & synthetic demo fixture",
                source_timestamp: "2026-10-09T08:30:00Z (Aerial Survey)",
                retrieved_at: "2026-10-10T02:15:00Z (Platform Ingestion)",
                spatial_resolution: "0.5m GSD Cartosat-3 (Imagery resolution only — never implies pixel-level precision)",
                evidence_status: "Reviewed by authorized personnel",
                known_constraints: "Overhead 11kV distribution line 85m south-east; perimeter fencing; saturated turf ('none mapped' is not 'none present')",
                review_owner: "Capt. V. Nair (SEOC Aviation Liaison Officer)",
                review_time: "2026-10-10T02:45:00Z",
                mission_status: "accepted",
                statusBadgeColor: "#059669",
                evidenceBadgeColor: "#0284c7",
                lat: 18.5735,
                lng: 73.8162,
                missingChecks: [
                  "Current micro-weather wind gust verification (<25 kt)",
                  "Low-altitude rotor clearance sweep on approach"
                ]
              },
              {
                candidate_id: "AERO-ZONE-PUNE-02",
                label: "Pulachi Wadi Elevated Concrete Deck / Terrace",
                geometry: "Point [73.8440, 18.5165] (EPSG:4326), Derived from field GPS survey by SDRF Bravo unit",
                source_type: "Field report (Disaster Rapid Response Team Bravo)",
                source_timestamp: "2026-10-10T01:00:00Z (Field Inspection)",
                retrieved_at: "2026-10-10T02:20:00Z (Platform Ingestion)",
                spatial_resolution: "Handheld GPS Waypoint (±4.2m horizontal accuracy)",
                evidence_status: "Field-observed candidate",
                known_constraints: "Tarpaulin emergency shelters within 28m of pad center; wet moss on surface; tree canopy 25m north ('none mapped' is not 'none present')",
                review_owner: "Pending qualified aviation reviewer",
                review_time: "Awaiting human review",
                mission_status: "submitted",
                statusBadgeColor: "#d97706",
                evidenceBadgeColor: "#7c3aed",
                lat: 18.5165,
                lng: 73.8440,
                missingChecks: [
                  "Airspace clearance (NOTAM/ATC)",
                  "Rotor wash safety radius clearing (min 30m)",
                  "Surface load-bearing strength certification"
                ]
              },
              {
                candidate_id: "AERO-ZONE-PUNE-03",
                label: "Bhide Riverbank Sandbar & Low Causeways",
                geometry: "Polygon [[73.8505, 18.5185], [73.8518, 18.5185], [73.8518, 18.5195], [73.8505, 18.5195]], Derived from automated optical flood mask",
                source_type: "Satellite-derived candidate (Sentinel-2 L2A optical NDWI)",
                source_timestamp: "2026-10-08T14:10:00Z (Satellite Pass)",
                retrieved_at: "2026-10-10T02:10:00Z (Copernicus Hub Fetch)",
                spatial_resolution: "10.0m optical (coarse optical pixel; open appearance must NOT infer landing suitability)",
                evidence_status: "Rejected",
                known_constraints: "Active river surge overflow; unstable water-saturated silt sandbar; rotor downwash brownout risk ('none mapped' is not 'none present')",
                review_owner: "Flt. Lt. R. Kulkarni (IAF NDRF Aviation Cell)",
                review_time: "2026-10-10T03:00:00Z",
                mission_status: "declined",
                statusBadgeColor: "#dc2626",
                evidenceBadgeColor: "#dc2626",
                lat: 18.5190,
                lng: 73.8510,
                missingChecks: [
                  "REJECTED: Submerged unstable ground completely unsuitable for rotary-wing ops"
                ]
              }
            ];

            const activeZone = candidateZones.find(z => z.candidate_id === aeroSelectedZoneId) || candidateZones[0];
            const liveClosedRoads = Object.entries(rg.roadStates || {}).filter(([_, s]) => s === "VERIFIED_CLOSED" || s === "REPORTED_CLOSED");
            const liveExposedRoads = Object.entries(rg.roadStates || {}).filter(([_, s]) => s === "FLOOD_EXPOSED" || s === "UNCERTAIN");

            return (
              <main style={{ padding: "14px", display: "flex", flexDirection: "column", gap: 16, background: "#f8fafc" }}>

                {/* 1. MASTER HEADER BAR */}
                <section style={{
                  background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 60%, #4338ca 100%)",
                  borderRadius: 16,
                  padding: "18px 20px",
                  color: "#ffffff",
                  boxShadow: "0 10px 25px -5px rgba(67, 56, 202, 0.35)",
                  border: "1px solid rgba(255,255,255,0.15)"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 28 }}>🚁</span>
                        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 900, letterSpacing: "-0.02em" }}>
                          6. AeroRelief: Emergency Air-Supply Coordination
                        </h1>
                        <span style={{ background: "#f59e0b", color: "#78350f", fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 12 }}>
                          DECISION-SUPPORT
                        </span>
                        <span style={{ background: "rgba(239, 68, 68, 0.2)", color: "#fca5a5", border: "1px solid #ef4444", fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 12 }}>
                          NON-OPERATIONAL DEMO FIXTURE
                        </span>
                      </div>
                      <div style={{ fontSize: 12, color: "#c7d2fe", marginTop: 6, maxWidth: 780, lineHeight: 1.5 }}>
                        Fusion 2026 • PRD v1.0 • Evaluates road-access disruption, models unmet urgent medical demand, and prepares traceable candidate delivery zone dossiers for qualified aviation and disaster command review.
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <button
                        type="button"
                        onClick={() => setSelectedRole(null)}
                        style={{
                          background: "rgba(255,255,255,0.15)",
                          border: "1px solid rgba(255,255,255,0.25)",
                          color: "#ffffff",
                          padding: "6px 12px",
                          borderRadius: 8,
                          fontSize: 11,
                          fontWeight: 800,
                          cursor: "pointer"
                        }}
                      >
                        ← Switch Role
                      </button>
                    </div>
                  </div>

                  {/* Operational Telemetry Banner */}
                  <div style={{
                    marginTop: 14,
                    paddingTop: 12,
                    borderTop: "1px solid rgba(255,255,255,0.15)",
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                    gap: 10
                  }}>
                    <div style={{ background: "rgba(0,0,0,0.2)", padding: "8px 12px", borderRadius: 10 }}>
                      <div style={{ fontSize: 10, color: "#a5b4fc", textTransform: "uppercase", fontWeight: 700 }}>Ground Access State</div>
                      <div style={{ fontSize: 14, fontWeight: 900, color: liveClosedRoads.length > 0 ? "#fca5a5" : "#86efac" }}>
                        {liveClosedRoads.length > 0 ? `${liveClosedRoads.length} Routes Blocked` : "Open Corridors"}
                      </div>
                    </div>
                    <div style={{ background: "rgba(0,0,0,0.2)", padding: "8px 12px", borderRadius: 10 }}>
                      <div style={{ fontSize: 10, color: "#a5b4fc", textTransform: "uppercase", fontWeight: 700 }}>Unmet Patient Demand</div>
                      <div style={{ fontSize: 14, fontWeight: 900, color: (rg.unmetDemandPatients || 0) > 0 ? "#fde047" : "#86efac" }}>
                        {(rg.unmetDemandPatients || 0) > 0 ? `${rg.unmetDemandPatients} Stranded Patients` : "Demand Handled"}
                      </div>
                    </div>
                    <div style={{ background: "rgba(0,0,0,0.2)", padding: "8px 12px", borderRadius: 10 }}>
                      <div style={{ fontSize: 10, color: "#a5b4fc", textTransform: "uppercase", fontWeight: 700 }}>Candidate Delivery Zones</div>
                      <div style={{ fontSize: 14, fontWeight: 900, color: "#e0e7ff" }}>
                        3 Demo Zones Configured
                      </div>
                    </div>
                    <div style={{ background: "rgba(0,0,0,0.2)", padding: "8px 12px", borderRadius: 10 }}>
                      <div style={{ fontSize: 10, color: "#a5b4fc", textTransform: "uppercase", fontWeight: 700 }}>Active Airlift Missions</div>
                      <div style={{ fontSize: 14, fontWeight: 900, color: "#c4b5fd" }}>
                        {aeroMissions.length} Structured Dossiers
                      </div>
                    </div>
                  </div>
                </section>

                

{/* REAL-TIME TACTICAL GIS AIR-SUPPLY OPERATIONS MAP */}
                <section id="aerorelief-realtime-map-section" style={{
                  background: "#ffffff",
                  borderRadius: 14,
                  border: "2px solid #6366f1",
                  padding: "16px",
                  boxShadow: "0 4px 16px rgba(99, 102, 241, 0.12)"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 900, color: "#1e1b4b", display: "flex", alignItems: "center", gap: 8 }}>
                        <span>🗺️</span>
                        <span>Real-Time AeroRelief Tactical Air-Supply GIS Map</span>
                        <span style={{ fontSize: 10, background: "#10b981", color: "#ffffff", padding: "2px 8px", borderRadius: 10, fontWeight: 800 }}>
                          ● LIVE REAL-TIME MAP
                        </span>
                      </div>
                      <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>
                        Continuously tracks emergency staging depot, candidate delivery zones, closed transit causeways & conceptual delivery vectors.
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 10, background: "#ede9fe", color: "#6d28d9", padding: "3px 8px", borderRadius: 6, fontWeight: 800 }}>
                        🏬 Depot-01 Base
                      </span>
                      <span style={{ fontSize: 10, background: "#e0f2fe", color: "#0369a1", padding: "3px 8px", borderRadius: 6, fontWeight: 800 }}>
                        📍 3 Candidate Zones Mapped
                      </span>
                      <span style={{ fontSize: 10, background: "#fee2e2", color: "#b91c1c", padding: "3px 8px", borderRadius: 6, fontWeight: 800 }}>
                        ⚠️ Non-Operational Simulation
                      </span>
                    </div>
                  </div>

                  {/* Mandatory PRD 6.4 Route Disclaimer Banner */}
                  <div style={{
                    background: "#fef3c7",
                    border: "1px solid #fde047",
                    padding: "8px 12px",
                    borderRadius: 8,
                    fontSize: 11,
                    color: "#92400e",
                    fontWeight: 700,
                    marginBottom: 10
                  }}>
                    🏷️ Conceptual origin-to-delivery-area line — not an approved flight route. Candidate selection is a prioritization aid for qualified assessment, not an operational go/no-go determination.
                  </div>

                  {window.SentinelCommandMap
                    ? React.createElement(window.SentinelCommandMap)
                    : <div style={{ background: "#f8fafc", borderRadius: 8, padding: "20px", textAlign: "center", fontSize: 11, color: "#64748b", border: "1px solid #e2e8f0" }}>🗺️ Loading Sentinel Real-Time GIS Map…</div>
                  }
                </section>

                {/* 2. SECTION 6.1 PURPOSE & 6.4 LANDING-ZONE SAFETY BOUNDARY */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: 14 }}>
                  {/* 6.1 Purpose Card */}
                  <section style={{
                    background: "#ffffff",
                    borderRadius: 14,
                    border: "1.5px solid #6366f1",
                    padding: "16px",
                    boxShadow: "0 2px 8px rgba(99, 102, 241, 0.08)"
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <span style={{ fontSize: 16 }}>🎯</span>
                      <h2 style={{ margin: 0, fontSize: 14, fontWeight: 900, color: "#1e1b4b" }}>
                        6.1 Purpose
                      </h2>
                      <span style={{ fontSize: 9, background: "#ede9fe", color: "#6d28d9", padding: "2px 6px", borderRadius: 6, fontWeight: 800 }}>
                        CORE DEFINITION
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: "#334155", lineHeight: 1.6, background: "#f8fafc", padding: "12px", borderRadius: 10, border: "1px solid #e2e8f0" }}>
                      <strong>AeroRelief</strong> is a logistics decision-support module for possible air delivery of emergency medical supplies when ground access is disrupted. It does not operate aircraft, produce an authoritative flight plan, certify a landing area, or approve a mission. Its output is a structured request for review by authorized responders and aviation professionals.
                    </div>
                    <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, fontSize: 11 }}>
                      <div style={{ background: "#fef2f2", color: "#991b1b", padding: "6px 8px", borderRadius: 6, fontWeight: 700 }}>
                        ✕ Does NOT operate aircraft
                      </div>
                      <div style={{ background: "#fef2f2", color: "#991b1b", padding: "6px 8px", borderRadius: 6, fontWeight: 700 }}>
                        ✕ Does NOT produce flight plans
                      </div>
                      <div style={{ background: "#fef2f2", color: "#991b1b", padding: "6px 8px", borderRadius: 6, fontWeight: 700 }}>
                        ✕ Does NOT certify landing sites
                      </div>
                      <div style={{ background: "#f0fdf4", color: "#166534", padding: "6px 8px", borderRadius: 6, fontWeight: 700 }}>
                        ✓ Generates human review requests
                      </div>
                    </div>
                  </section>

                  {/* 6.4 Safety Boundary Card */}
                  <section style={{
                    background: "#ffffff",
                    borderRadius: 14,
                    border: "2px solid #ef4444",
                    padding: "16px",
                    boxShadow: "0 2px 8px rgba(239, 68, 68, 0.08)"
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <span style={{ fontSize: 16 }}>⚠️</span>
                      <h2 style={{ margin: 0, fontSize: 14, fontWeight: 900, color: "#991b1b" }}>
                        6.4 Landing-Zone Safety Boundary & Guardrails
                      </h2>
                      <span style={{ fontSize: 9, background: "#fee2e2", color: "#dc2626", padding: "2px 6px", borderRadius: 6, fontWeight: 800 }}>
                        MANDATORY POLICY
                      </span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 11, color: "#334155", lineHeight: 1.45 }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        <span style={{ color: "#ef4444", fontWeight: 900 }}>•</span>
                        <span><strong>Do not automatically infer helicopter landing suitability</strong> from open-looking satellite imagery, road polygons, empty parcels or a low flood score.</span>
                      </div>
                      <div style={{ display: "flex", gap: 6 }}>
                        <span style={{ color: "#ef4444", fontWeight: 900 }}>•</span>
                        <span><strong>Do not generate instructions</strong> for piloting, low-altitude navigation or bypassing aviation restrictions.</span>
                      </div>
                      <div style={{ display: "flex", gap: 6 }}>
                        <span style={{ color: "#ef4444", fontWeight: 900 }}>•</span>
                        <span><strong>Do not use prototype line as flight path.</strong> Label it: <em>“conceptual origin-to-delivery-area line — not an approved flight route.”</em></span>
                      </div>
                      <div style={{ display: "flex", gap: 6 }}>
                        <span style={{ color: "#ef4444", fontWeight: 900 }}>•</span>
                        <span><strong>Candidate selection is a prioritization aid</strong> for qualified assessment, not an operational go/no-go determination.</span>
                      </div>
                      <div style={{ display: "flex", gap: 6 }}>
                        <span style={{ color: "#ef4444", fontWeight: 900 }}>•</span>
                        <span>Current weather, airspace restrictions, obstacles, slope/surface, rotor clearance, and permissions require authoritative external assessment.</span>
                      </div>
                      <div style={{ display: "flex", gap: 6 }}>
                        <span style={{ color: "#ef4444", fontWeight: 900 }}>•</span>
                        <span>Demo only with synthetic or historical scenario data; all generated mission details marked non-operational.</span>
                      </div>
                    </div>
                  </section>
                </div>

                

                {/* 3. SECTION 6.5 WHAT MAKES AERORELIEF VALUABLE */}
                <section style={{
                  background: "linear-gradient(135deg, #ffffff 0%, #f5f3ff 100%)",
                  borderRadius: 14,
                  border: "1.5px solid #8b5cf6",
                  padding: "16px",
                  boxShadow: "0 2px 10px rgba(139, 92, 246, 0.08)"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 18 }}>💎</span>
                    <h2 style={{ margin: 0, fontSize: 14, fontWeight: 900, color: "#5b21b6" }}>
                      6.5 What Makes AeroRelief Valuable
                    </h2>
                    <span style={{ fontSize: 9, background: "#ede9fe", color: "#6d28d9", padding: "2px 6px", borderRadius: 6, fontWeight: 800 }}>
                      SYSTEM RATIONALE
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: "#475569", lineHeight: 1.6, fontStyle: "italic", marginBottom: 12 }}>
                    “Its value is not a visually attractive helicopter icon. It is the link between road-access failure, unmet medical demand, available supplies, a traceable candidate delivery request and the evidence required for human review. A judge should be able to see why air-supply consideration was raised and what remains unknown.”
                  </div>

                  {/* 4 Connected Value Nodes */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 10 }}>
                    <div style={{ background: "#ffffff", borderRadius: 10, padding: "10px", border: "1px solid #e0e7ff", boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
                      <div style={{ fontSize: 10, fontWeight: 800, color: "#dc2626", textTransform: "uppercase" }}>1. Road-Access Failure</div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#1e293b", marginTop: 4 }}>
                        {liveClosedRoads.length > 0 ? liveClosedRoads.map(([r]) => r).join(", ") : "ROAD-01, ROAD-03"} Verified Closed
                      </div>
                      <div style={{ fontSize: 10, color: "#64748b", marginTop: 2 }}>
                        Bypass detour adds +3.8 km and +6.5m to +14m delay; bridge causeways impassable.
                      </div>
                    </div>

                    <div style={{ background: "#ffffff", borderRadius: 10, padding: "10px", border: "1px solid #e0e7ff", boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
                      <div style={{ fontSize: 10, fontWeight: 800, color: "#d97706", textTransform: "uppercase" }}>2. Unmet Medical Demand</div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#1e293b", marginTop: 4 }}>
                        36 Casualties across 4 Sectors
                      </div>
                      <div style={{ fontSize: 10, color: "#64748b", marginTop: 2 }}>
                        Stranded citizens in Sangvi & Pulachi Wadi require cholera rehydration & wound dressings.
                      </div>
                    </div>

                    <div style={{ background: "#ffffff", borderRadius: 10, padding: "10px", border: "1px solid #e0e7ff", boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
                      <div style={{ fontSize: 10, fontWeight: 800, color: "#059669", textTransform: "uppercase" }}>3. Available Supplies</div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#1e293b", marginTop: 4 }}>
                        Depot-01 Central Stockpile
                      </div>
                      <div style={{ fontSize: 10, color: "#64748b", marginTop: 2 }}>
                        14,500 packs Kit A & 8,200 kits Kit B available at Shivajinagar staging base.
                      </div>
                    </div>

                    <div style={{ background: "#ffffff", borderRadius: 10, padding: "10px", border: "1px solid #e0e7ff", boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
                      <div style={{ fontSize: 10, fontWeight: 800, color: "#7c3aed", textTransform: "uppercase" }}>4. Human Evidence Dossier</div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#1e293b", marginTop: 4 }}>
                        Traceable Candidate Requests
                      </div>
                      <div style={{ fontSize: 10, color: "#64748b", marginTop: 2 }}>
                        Captures spatial resolution, constraints & missing checks for aviation officer review.
                      </div>
                    </div>
                  </div>
                </section>

                {/* 4. SECTION 6.2 END-TO-END WORKFLOW (STEPS 1 TO 8) */}
                <section style={{
                  background: "#ffffff",
                  borderRadius: 14,
                  border: "1.5px solid #0284c7",
                  padding: "16px",
                  boxShadow: "0 2px 8px rgba(2, 132, 199, 0.08)"
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 18 }}>📋</span>
                      <h2 style={{ margin: 0, fontSize: 14, fontWeight: 900, color: "#0369a1" }}>
                        6.2 End-to-End Workflow Execution (Steps 1 – 8)
                      </h2>
                    </div>
                    <span style={{ fontSize: 10, background: "#e0f2fe", color: "#0369a1", padding: "3px 8px", borderRadius: 12, fontWeight: 800 }}>
                      AUTOMATED & HUMAN-IN-THE-LOOP INTERACTION
                    </span>
                  </div>

                  {/* 8-Step Progress Pipeline */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 10 }}>
                    {/* Step 1 */}
                    <div style={{ background: "#f8fafc", padding: "10px 12px", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                        <span style={{ background: "#0284c7", color: "#fff", width: 18, height: 18, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 900 }}>1</span>
                        <strong style={{ fontSize: 11, color: "#0f172a" }}>Incident Reports Indicate Need</strong>
                      </div>
                      <div style={{ fontSize: 10, color: "#475569" }}>
                        4 active disaster clusters identified across Pune river basin. {rg.incidents.length} communities reporting urgent medical/supply needs.
                      </div>
                    </div>

                    {/* Step 2 */}
                    <div style={{ background: "#f8fafc", padding: "10px 12px", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                        <span style={{ background: "#0284c7", color: "#fff", width: 18, height: 18, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 900 }}>2</span>
                        <strong style={{ fontSize: 11, color: "#0f172a" }}>Road Network Evaluated</strong>
                      </div>
                      <div style={{ fontSize: 10, color: "#475569" }}>
                        Verified closures (ROAD-01, ROAD-03) excluded from ground candidates; uncertain roads held with risk penalties.
                      </div>
                    </div>

                    {/* Step 3 */}
                    <div style={{ background: "#f8fafc", padding: "10px 12px", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                        <span style={{ background: "#0284c7", color: "#fff", width: 18, height: 18, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 900 }}>3</span>
                        <strong style={{ fontSize: 11, color: "#0f172a" }}>Ground Delivery Failure Engine</strong>
                      </div>
                      <div style={{ fontSize: 10, color: "#475569" }}>
                        Engine flags why ground transport is delayed or impossible: fleet 100% committed, causeways submerged under 1.4m water.
                      </div>
                    </div>

                    {/* Step 4 */}
                    <div style={{ background: "#eff6ff", padding: "10px 12px", borderRadius: 8, border: "1px solid #93c5fd" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                        <span style={{ background: "#2563eb", color: "#fff", width: 18, height: 18, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 900 }}>4</span>
                        <strong style={{ fontSize: 11, color: "#1e40af" }}>Coordinator Opens AeroRelief Request</strong>
                      </div>
                      <div style={{ fontSize: 10, color: "#1e3a8a" }}>
                        Intake captures: target community, supplies, urgency, people affected, origin stock & radio contact.
                      </div>
                    </div>

                    {/* Step 5 */}
                    <div style={{ background: "#f8fafc", padding: "10px 12px", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                        <span style={{ background: "#0284c7", color: "#fff", width: 18, height: 18, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 900 }}>5</span>
                        <strong style={{ fontSize: 11, color: "#0f172a" }}>Map Shows Candidate Delivery Zones</strong>
                      </div>
                      <div style={{ fontSize: 10, color: "#475569" }}>
                        Candidate zones loaded from GIS layers with evidence source, timestamp, resolution, uncertainty, and review state.
                      </div>
                    </div>

                    {/* Step 6 */}
                    <div style={{ background: "#fef3c7", padding: "10px 12px", borderRadius: 8, border: "1px solid #fde047" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                        <span style={{ background: "#d97706", color: "#fff", width: 18, height: 18, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 900 }}>6</span>
                        <strong style={{ fontSize: 11, color: "#92400e" }}>Platform Prepares Summary & Missing Checks</strong>
                      </div>
                      <div style={{ fontSize: 10, color: "#78350f" }}>
                        Highlights missing checks for human review. Does NOT say “safe to land” or “flight approved”.
                      </div>
                    </div>

                    {/* Step 7 */}
                    <div style={{ background: "#f5f3ff", padding: "10px 12px", borderRadius: 8, border: "1px solid #c4b5fd" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                        <span style={{ background: "#7c3aed", color: "#fff", width: 18, height: 18, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 900 }}>7</span>
                        <strong style={{ fontSize: 11, color: "#5b21b6" }}>Authorized Human Review Lifecycle</strong>
                      </div>
                      <div style={{ fontSize: 10, color: "#4c1d95" }}>
                        Human updates state: draft ➔ submitted ➔ accepted/declined ➔ dispatched ➔ delivered/failed/cancelled.
                      </div>
                    </div>

                    {/* Step 8 */}
                    <div style={{ background: "#f0fdf4", padding: "10px 12px", borderRadius: 8, border: "1px solid #86efac" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                        <span style={{ background: "#16a34a", color: "#fff", width: 18, height: 18, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 900 }}>8</span>
                        <strong style={{ fontSize: 11, color: "#166534" }}>Delivery Confirmation & Timeline</strong>
                      </div>
                      <div style={{ fontSize: 10, color: "#14532d" }}>
                        Delivery confirmation updates central stock inventory & incident status; recorded for demo timeline.
                      </div>
                    </div>
                  </div>
                </section>

                {/* 5. INTERACTIVE COORDINATOR INTAKE FORM (6.2 STEP 4 & STEP 6) */}
                <section style={{
                  background: "#ffffff",
                  borderRadius: 14,
                  border: "1.5px solid #2563eb",
                  padding: "16px",
                  boxShadow: "0 2px 8px rgba(37, 99, 235, 0.08)"
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 18 }}>📝</span>
                      <h2 style={{ margin: 0, fontSize: 14, fontWeight: 900, color: "#1e3a8a" }}>
                        Coordinator AeroRelief Request Intake (Step 4 & Step 6)
                      </h2>
                    </div>
                    <span style={{ fontSize: 10, background: "#dbeafe", color: "#1d4ed8", padding: "2px 8px", borderRadius: 6, fontWeight: 800 }}>
                      LIVE DECISION INTAKE
                    </span>
                  </div>

                  <form onSubmit={handleCreateAeroMission} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12 }}>
                    <div>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: "#334155", marginBottom: 3 }}>
                        Target Community / Cutoff Enclave
                      </label>
                      <input
                        type="text"
                        required
                        value={aeroRequestForm.community}
                        onChange={(e) => setAeroRequestForm({ ...aeroRequestForm, community: e.target.value })}
                        placeholder="e.g. Sangvi Lowland Cutoff Enclave"
                        style={{ width: "100%", padding: "8px 10px", borderRadius: 6, border: "1px solid #cbd5e1", fontSize: 12, boxSizing: "border-box" }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: "#334155", marginBottom: 3 }}>
                        Supplies & Quantities Needed
                      </label>
                      <input
                        type="text"
                        required
                        value={aeroRequestForm.supplies}
                        onChange={(e) => setAeroRequestForm({ ...aeroRequestForm, supplies: e.target.value })}
                        placeholder="e.g. Kit A: Hydration & Cholera (150 Packs)"
                        style={{ width: "100%", padding: "8px 10px", borderRadius: 6, border: "1px solid #cbd5e1", fontSize: 12, boxSizing: "border-box" }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: "#334155", marginBottom: 3 }}>
                        Estimated People Affected / Patients
                      </label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={aeroRequestForm.patientCount}
                        onChange={(e) => setAeroRequestForm({ ...aeroRequestForm, patientCount: e.target.value })}
                        style={{ width: "100%", padding: "8px 10px", borderRadius: 6, border: "1px solid #cbd5e1", fontSize: 12, boxSizing: "border-box" }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: "#334155", marginBottom: 3 }}>
                        Triage Urgency Level
                      </label>
                      <select
                        value={aeroRequestForm.urgency}
                        onChange={(e) => setAeroRequestForm({ ...aeroRequestForm, urgency: e.target.value })}
                        style={{ width: "100%", padding: "8px 10px", borderRadius: 6, border: "1px solid #cbd5e1", fontSize: 12, boxSizing: "border-box" }}
                      >
                        <option value="critical">Critical (Immediate hypothermia / trauma shock)</option>
                        <option value="high">High (Severe isolation & cholera risk)</option>
                        <option value="moderate">Moderate (Precautionary supply staging)</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: "#334155", marginBottom: 3 }}>
                        Origin / Stock Availability Source
                      </label>
                      <input
                        type="text"
                        required
                        value={aeroRequestForm.originStock}
                        onChange={(e) => setAeroRequestForm({ ...aeroRequestForm, originStock: e.target.value })}
                        placeholder="e.g. Depot-01 (Shivajinagar Central Depot)"
                        style={{ width: "100%", padding: "8px 10px", borderRadius: 6, border: "1px solid #cbd5e1", fontSize: 12, boxSizing: "border-box" }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: "#334155", marginBottom: 3 }}>
                        Communication Contact in Target Area
                      </label>
                      <input
                        type="text"
                        value={aeroRequestForm.contact}
                        onChange={(e) => setAeroRequestForm({ ...aeroRequestForm, contact: e.target.value })}
                        placeholder="e.g. VHF Ch-14 / SatPhone +91-98811-RESCUE"
                        style={{ width: "100%", padding: "8px 10px", borderRadius: 6, border: "1px solid #cbd5e1", fontSize: 12, boxSizing: "border-box" }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: "#334155", marginBottom: 3 }}>
                        Candidate Delivery Zone
                      </label>
                      <select
                        value={aeroRequestForm.candidateZoneId}
                        onChange={(e) => {
                          setAeroRequestForm({ ...aeroRequestForm, candidateZoneId: e.target.value });
                          setAeroSelectedZoneId(e.target.value);
                        }}
                        style={{ width: "100%", padding: "8px 10px", borderRadius: 6, border: "1px solid #cbd5e1", fontSize: 12, boxSizing: "border-box" }}
                      >
                        {candidateZones.map((z) => (
                          <option key={z.candidate_id} value={z.candidate_id}>
                            {z.candidate_id}: {z.label} ({z.evidence_status})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: "#334155", marginBottom: 3 }}>
                        Ground Delivery Access Failure Notes
                      </label>
                      <input
                        type="text"
                        value={aeroRequestForm.notes}
                        onChange={(e) => setAeroRequestForm({ ...aeroRequestForm, notes: e.target.value })}
                        placeholder="e.g. Bridge ROAD-03 closed; ground ambulance detour >25 min"
                        style={{ width: "100%", padding: "8px 10px", borderRadius: 6, border: "1px solid #cbd5e1", fontSize: 12, boxSizing: "border-box" }}
                      />
                    </div>

                    <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginTop: 4 }}>
                      <div style={{ fontSize: 11, color: "#64748b" }}>
                        ⚠️ Notice: Submitting prepares a structured mission request for human aviation review. Does not authorize flight or certify landing pad.
                      </div>
                      <button
                        type="submit"
                        disabled={aeroSubmitting}
                        style={{
                          background: aeroSubmitting ? "#94a3b8" : "linear-gradient(135deg, #2563eb, #1d4ed8)",
                          color: "#ffffff",
                          border: "none",
                          padding: "10px 18px",
                          borderRadius: 8,
                          fontSize: 12,
                          fontWeight: 800,
                          cursor: aeroSubmitting ? "not-allowed" : "pointer",
                          boxShadow: "0 2px 6px rgba(37,99,235,0.3)"
                        }}
                      >
                        {aeroSubmitting ? "Transmitting Structured Dossier…" : "✈️ Open AeroRelief Review Request (Step 4)"}
                      </button>
                    </div>
                  </form>

                  {aeroSubmitFeedback && (
                    <div style={{
                      marginTop: 12,
                      padding: "10px 14px",
                      borderRadius: 8,
                      fontSize: 11,
                      fontWeight: 700,
                      background: aeroSubmitFeedback.type === "success" ? "#f0fdf4" : "#fef2f2",
                      color: aeroSubmitFeedback.type === "success" ? "#15803d" : "#b91c1c",
                      border: aeroSubmitFeedback.type === "success" ? "1px solid #86efac" : "1px solid #fca5a5"
                    }}>
                      {aeroSubmitFeedback.msg}
                    </div>
                  )}
                </section>

                {/* 6. SECTION 6.3 CANDIDATE-ZONE ATTRIBUTES SPECIFICATION (ALL 9 ATTRIBUTES) */}
                <section style={{
                  background: "#ffffff",
                  borderRadius: 14,
                  border: "1.5px solid #8b5cf6",
                  padding: "16px",
                  boxShadow: "0 2px 8px rgba(139, 92, 246, 0.08)"
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 18 }}>📍</span>
                      <h2 style={{ margin: 0, fontSize: 14, fontWeight: 900, color: "#5b21b6" }}>
                        6.3 Candidate-Zone Attributes & Geographic Verification
                      </h2>
                    </div>
                    <span style={{ fontSize: 10, background: "#ede9fe", color: "#6d28d9", padding: "2px 8px", borderRadius: 6, fontWeight: 800 }}>
                      TABLE SCHEMA & FIELD SPECIFICATION
                    </span>
                  </div>

                  {/* Zone Quick-Switcher Pills */}
                  <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
                    {candidateZones.map((z) => (
                      <button
                        key={z.candidate_id}
                        type="button"
                        onClick={() => setAeroSelectedZoneId(z.candidate_id)}
                        style={{
                          background: aeroSelectedZoneId === z.candidate_id ? "#7c3aed" : "#f1f5f9",
                          color: aeroSelectedZoneId === z.candidate_id ? "#ffffff" : "#334155",
                          border: "none",
                          padding: "6px 12px",
                          borderRadius: 20,
                          fontSize: 11,
                          fontWeight: 800,
                          cursor: "pointer"
                        }}
                      >
                        {z.candidate_id}: {z.label.split("(")[0]} ({z.evidence_status})
                      </button>
                    ))}
                  </div>

                  {/* Active Zone Comprehensive Attribute Table */}
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11, textAlign: "left" }}>
                      <thead>
                        <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                          <th style={{ padding: "8px 10px", color: "#475569", fontWeight: 800, width: "160px" }}>Field (PRD 6.3)</th>
                          <th style={{ padding: "8px 10px", color: "#475569", fontWeight: 800, width: "220px" }}>Meaning / Rule</th>
                          <th style={{ padding: "8px 10px", color: "#1e1b4b", fontWeight: 900 }}>Active Value ({activeZone.candidate_id})</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                          <td style={{ padding: "8px 10px", fontWeight: 800, color: "#1e293b" }}>candidate_id</td>
                          <td style={{ padding: "8px 10px", color: "#64748b" }}>Stable identifier; not an aviation approval number.</td>
                          <td style={{ padding: "8px 10px", fontWeight: 800, color: "#7c3aed" }}>{activeZone.candidate_id}</td>
                        </tr>
                        <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                          <td style={{ padding: "8px 10px", fontWeight: 800, color: "#1e293b" }}>geometry</td>
                          <td style={{ padding: "8px 10px", color: "#64748b" }}>Point or polygon in map CRS, with documented derivation.</td>
                          <td style={{ padding: "8px 10px", color: "#0f172a" }}>{activeZone.geometry}</td>
                        </tr>
                        <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                          <td style={{ padding: "8px 10px", fontWeight: 800, color: "#1e293b" }}>source_type</td>
                          <td style={{ padding: "8px 10px", color: "#64748b" }}>Prepared dataset, satellite-derived candidate, field report or synthetic demo fixture.</td>
                          <td style={{ padding: "8px 10px", color: "#0f172a" }}>
                            <span style={{ background: "#e0f2fe", color: "#0369a1", padding: "2px 6px", borderRadius: 4, fontWeight: 700 }}>
                              {activeZone.source_type}
                            </span>
                          </td>
                        </tr>
                        <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                          <td style={{ padding: "8px 10px", fontWeight: 800, color: "#1e293b" }}>source_timestamp / retrieved_at</td>
                          <td style={{ padding: "8px 10px", color: "#64748b" }}>When underlying observation was made and when platform retrieved it; do not conflate them.</td>
                          <td style={{ padding: "8px 10px", color: "#0f172a" }}>
                            <div><strong>Observed:</strong> {activeZone.source_timestamp}</div>
                            <div><strong>Retrieved:</strong> {activeZone.retrieved_at}</div>
                          </td>
                        </tr>
                        <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                          <td style={{ padding: "8px 10px", fontWeight: 800, color: "#1e293b" }}>spatial_resolution</td>
                          <td style={{ padding: "8px 10px", color: "#64748b" }}>Source resolution where known; never imply pixel-level precision from coarse imagery.</td>
                          <td style={{ padding: "8px 10px", color: "#0f172a" }}>{activeZone.spatial_resolution}</td>
                        </tr>
                        <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                          <td style={{ padding: "8px 10px", fontWeight: 800, color: "#1e293b" }}>evidence_status</td>
                          <td style={{ padding: "8px 10px", color: "#64748b" }}>Unverified candidate, field-observed candidate, rejected, or reviewed by authorized personnel.</td>
                          <td style={{ padding: "8px 10px" }}>
                            <span style={{ background: activeZone.evidenceBadgeColor + "15", color: activeZone.evidenceBadgeColor, padding: "2px 8px", borderRadius: 10, fontWeight: 800 }}>
                              {activeZone.evidence_status}
                            </span>
                          </td>
                        </tr>
                        <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                          <td style={{ padding: "8px 10px", fontWeight: 800, color: "#1e293b" }}>known_constraints</td>
                          <td style={{ padding: "8px 10px", color: "#64748b" }}>Known obstacles, hazard overlaps or missing data; “none mapped” is not “none present.”</td>
                          <td style={{ padding: "8px 10px", color: "#b91c1c", fontWeight: 600 }}>{activeZone.known_constraints}</td>
                        </tr>
                        <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                          <td style={{ padding: "8px 10px", fontWeight: 800, color: "#1e293b" }}>review_owner / review_time</td>
                          <td style={{ padding: "8px 10px", color: "#64748b" }}>Qualified reviewer and review time, when applicable.</td>
                          <td style={{ padding: "8px 10px", color: "#0f172a" }}>
                            <strong>{activeZone.review_owner}</strong> {activeZone.review_time ? `• ${activeZone.review_time}` : ""}
                          </td>
                        </tr>
                        <tr>
                          <td style={{ padding: "8px 10px", fontWeight: 800, color: "#1e293b" }}>mission_status</td>
                          <td style={{ padding: "8px 10px", color: "#64748b" }}>Draft / submitted / accepted / declined / dispatched / delivered / failed / cancelled.</td>
                          <td style={{ padding: "8px 10px" }}>
                            <span style={{ background: activeZone.statusBadgeColor, color: "#ffffff", padding: "2px 8px", borderRadius: 10, fontWeight: 800, textTransform: "uppercase" }}>
                              {activeZone.mission_status}
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </section>

                {/* 7. SECTION 6.2 STEP 7 & 8: MISSION LIFECYCLE & HUMAN UPDATE TRACKER */}
                <section style={{
                  background: "#ffffff",
                  borderRadius: 14,
                  border: "1.5px solid #10b981",
                  padding: "16px",
                  boxShadow: "0 2px 8px rgba(16, 185, 129, 0.08)"
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 18 }}>🗂️</span>
                      <h2 style={{ margin: 0, fontSize: 14, fontWeight: 900, color: "#065f46" }}>
                        6.2 Step 7 & 8: Registered Missions & Human Lifecycle Transitions
                      </h2>
                    </div>
                    <span style={{ fontSize: 10, background: "#d1fae5", color: "#065f46", padding: "2px 8px", borderRadius: 6, fontWeight: 800 }}>
                      HUMAN-IN-THE-LOOP STATE ENGINE
                    </span>
                  </div>

                  <div style={{ fontSize: 11, color: "#475569", marginBottom: 12 }}>
                    <strong>PRD Step 7 Rule:</strong> After authorized personnel review the mission, a human can update its state: <code>draft ➔ submitted for review ➔ accepted / declined ➔ dispatched by authorized operator ➔ delivered / failed / cancelled</code>.
                  </div>

                  {aeroMissions.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "20px", color: "#64748b", fontSize: 12 }}>
                      No missions registered yet. Use the intake form above to open a structured review request.
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {aeroMissions.map((m) => {
                        const statusColors = {
                          draft: { bg: "#f1f5f9", text: "#475569", border: "#cbd5e1" },
                          submitted: { bg: "#fef3c7", text: "#92400e", border: "#fde047" },
                          accepted: { bg: "#dcfce7", text: "#166534", border: "#86efac" },
                          declined: { bg: "#fee2e2", text: "#991b1b", border: "#fca5a5" },
                          dispatched: { bg: "#dbeafe", text: "#1e40af", border: "#93c5fd" },
                          delivered: { bg: "#ccfbf1", text: "#115e59", border: "#5eead4" },
                          failed: { bg: "#f3e8ff", text: "#6b21a8", border: "#d8b4fe" },
                          cancelled: { bg: "#f1f5f9", text: "#64748b", border: "#cbd5e1" }
                        };
                        const sc = statusColors[m.status] || statusColors.submitted;

                        return (
                          <div
                            key={m.requestId}
                            style={{
                              background: "#ffffff",
                              borderRadius: 10,
                              border: `1.5px solid ${sc.border}`,
                              padding: "12px 14px",
                              boxShadow: "0 1px 4px rgba(0,0,0,0.04)"
                            }}
                          >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
                              <div>
                                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                                  <strong style={{ fontSize: 13, color: "#0f172a" }}>{m.requestId}</strong>
                                  <span style={{ fontSize: 10, background: sc.bg, color: sc.text, padding: "2px 8px", borderRadius: 10, fontWeight: 800, textTransform: "uppercase" }}>
                                    {m.status}
                                  </span>
                                  <span style={{ fontSize: 10, background: "#ede9fe", color: "#6d28d9", padding: "2px 6px", borderRadius: 6, fontWeight: 700 }}>
                                    Zone: {m.candidateZoneId}
                                  </span>
                                  <span style={{ fontSize: 10, background: m.urgency === "critical" ? "#fee2e2" : "#fef3c7", color: m.urgency === "critical" ? "#dc2626" : "#b45309", padding: "2px 6px", borderRadius: 6, fontWeight: 700 }}>
                                    Urgency: {m.urgency.toUpperCase()}
                                  </span>
                                </div>
                                <div style={{ fontSize: 12, fontWeight: 700, color: "#1e293b", marginTop: 4 }}>
                                  Target: {m.community || "Disaster Stranded Community"} • {m.patientCount || 1} Patients
                                </div>
                                <div style={{ fontSize: 11, color: "#475569", marginTop: 2 }}>
                                  <strong>Supplies:</strong> {m.supplies || "Emergency Kits"} • <strong>Origin:</strong> {m.originStock || "Depot-01"}
                                </div>
                                {m.contact && (
                                  <div style={{ fontSize: 10, color: "#0284c7", marginTop: 2 }}>
                                    📻 Field Contact: {m.contact}
                                  </div>
                                )}
                                {m.notes && (
                                  <div style={{ fontSize: 10, color: "#64748b", marginTop: 2, fontStyle: "italic" }}>
                                    Rationale: {m.notes}
                                  </div>
                                )}
                              </div>

                              <div style={{ textAlign: "right" }}>
                                <div style={{ fontSize: 10, color: "#94a3b8" }}>
                                  Reviewer: <strong>{m.reviewOwner || "Pending Qualified Officer"}</strong>
                                </div>
                                {m.reviewTime && (
                                  <div style={{ fontSize: 9, color: "#94a3b8" }}>
                                    {new Date(m.reviewTime).toLocaleTimeString()}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Missing Checks Box (PRD Step 6) */}
                            {m.missingChecks && m.missingChecks.length > 0 && (
                              <div style={{ marginTop: 8, background: "#fffbeb", padding: "8px 10px", borderRadius: 6, border: "1px solid #fef08a", fontSize: 10 }}>
                                <strong style={{ color: "#92400e" }}>⚠️ Step 6 Missing Checks Highlighted for Human Review (Does NOT say "Safe to Land"):</strong>
                                <ul style={{ margin: "4px 0 0 16px", padding: 0, color: "#78350f" }}>
                                  {m.missingChecks.map((chk, idx) => (
                                    <li key={idx}>{chk}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Human State Update Buttons (PRD Step 7 & 8) */}
                            <div style={{ marginTop: 10, paddingTop: 8, borderTop: "1px solid #f1f5f9", display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                              <span style={{ fontSize: 10, fontWeight: 800, color: "#64748b", marginRight: 4 }}>
                                Update Mission State:
                              </span>

                              {m.status === "draft" && (
                                <button
                                  type="button"
                                  onClick={() => handleUpdateAeroMissionStatus(m.requestId, "submitted")}
                                  style={{ background: "#fef3c7", color: "#92400e", border: "1px solid #fde047", padding: "4px 8px", borderRadius: 6, fontSize: 10, fontWeight: 800, cursor: "pointer" }}
                                >
                                  Submit for Review ➔
                                </button>
                              )}

                              {(m.status === "draft" || m.status === "submitted") && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateAeroMissionStatus(m.requestId, "accepted", "Capt. V. Nair (SEOC Aviation Liaison)")}
                                    style={{ background: "#dcfce7", color: "#166534", border: "1px solid #86efac", padding: "4px 8px", borderRadius: 6, fontSize: 10, fontWeight: 800, cursor: "pointer" }}
                                  >
                                    Accept Mission ✓
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateAeroMissionStatus(m.requestId, "declined", "Capt. V. Nair (SEOC Aviation Liaison)")}
                                    style={{ background: "#fee2e2", color: "#991b1b", border: "1px solid #fca5a5", padding: "4px 8px", borderRadius: 6, fontSize: 10, fontWeight: 800, cursor: "pointer" }}
                                  >
                                    Decline ✕
                                  </button>
                                </>
                              )}

                              {m.status === "accepted" && (
                                <button
                                  type="button"
                                  onClick={() => handleUpdateAeroMissionStatus(m.requestId, "dispatched", "IAF / NDRF Operator Dispatched")}
                                  style={{ background: "#dbeafe", color: "#1e40af", border: "1px solid #93c5fd", padding: "4px 8px", borderRadius: 6, fontSize: 10, fontWeight: 800, cursor: "pointer" }}
                                >
                                  Dispatch by Authorized Operator 🚁
                                </button>
                              )}

                              {m.status === "dispatched" && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateAeroMissionStatus(m.requestId, "delivered", "Disaster Rapid Response Team Bravo")}
                                    style={{ background: "#10b981", color: "#ffffff", border: "none", padding: "4px 10px", borderRadius: 6, fontSize: 10, fontWeight: 800, cursor: "pointer" }}
                                  >
                                    Confirm Delivery ✓ (Step 8 Updates Inventory)
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateAeroMissionStatus(m.requestId, "failed")}
                                    style={{ background: "#f3e8ff", color: "#6b21a8", border: "1px solid #d8b4fe", padding: "4px 8px", borderRadius: 6, fontSize: 10, fontWeight: 800, cursor: "pointer" }}
                                  >
                                    Mark Failed
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateAeroMissionStatus(m.requestId, "cancelled")}
                                    style={{ background: "#f1f5f9", color: "#64748b", border: "1px solid #cbd5e1", padding: "4px 8px", borderRadius: 6, fontSize: 10, fontWeight: 800, cursor: "pointer" }}
                                  >
                                    Cancel
                                  </button>
                                </>
                              )}

                              {(m.status === "delivered" || m.status === "failed" || m.status === "declined" || m.status === "cancelled") && (
                                <span style={{ fontSize: 10, color: "#64748b", fontStyle: "italic" }}>
                                  Terminal State Reached • Recorded in Demo Timeline
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </section>

                

                {/* 9. DEMO TIMELINE & LIVE AUDIT TRAIL */}
                <section style={{
                  background: "#ffffff",
                  borderRadius: 14,
                  border: "1px solid #e2e8f0",
                  padding: "14px"
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                    <div style={{ fontSize: 12, fontWeight: 900, color: "#334155" }}>
                      ⏱️ Demo Timeline & Real-Time RescueGrid Audit Log
                    </div>
                    <span style={{ fontSize: 9, color: "#64748b" }}>
                      Scenario: {rg.scenarioVersion || "v1.0.0-baseline"}
                    </span>
                  </div>
                    <div style={{ maxHeight: 200, overflowY: "auto", display: "flex", flexDirection: "column", gap: 4, fontSize: 10, color: "#475569" }}>
                      {(rg.auditLog || []).slice(-12).reverse().map((entry, idx) => (
                        <div key={idx} style={{ padding: "4px 8px", background: "#f8fafc", borderRadius: 4, borderLeft: "3px solid #6366f1" }}>
                        <span style={{ color: "#94a3b8" }}>{new Date(entry.timestamp).toLocaleTimeString()}</span> • <strong style={{ color: "#1e293b" }}>{entry.action}</strong>: {entry.details}
                      </div>
                    ))}
                  </div>
                </section>

                <div style={{ textAlign: "center", fontSize: 9, color: "#94a3b8", padding: "4px 0" }}>
                  AeroRelief • Fusion 2026 PRD v1.0 • Logistics Decision-Support Module • Strictly Non-Operational Simulation
                </div>
              </main>
            );
          })()}




          {/* ========================================================================= */}
          {/* MODAL: INCOMING VIDEO CALL MODAL FOR DOCTORS (REAL-TIME WEBRTC RINGING)   */}
          {/* ========================================================================= */}
          {incomingCall && (
            <div style={{
              position: "fixed",
              inset: 0,
              background: "rgba(15, 23, 42, 0.85)",
              zIndex: 999999,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              padding: 16
            }}>
              <div style={{
                width: "100%",
                maxWidth: 380,
                background: "#ffffff",
                borderRadius: 18,
                padding: "20px",
                textAlign: "center",
                boxShadow: "0 20px 50px rgba(0,0,0,0.5)"
              }}>
                <div style={{ fontSize: 44, marginBottom: 8 }}>🚨</div>
                <div style={{ fontSize: 16, fontWeight: 900, color: "#dc2626", marginBottom: 4 }}>
                  INCOMING EMERGENCY VIDEO CALL
                </div>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#0f172a", marginBottom: 2 }}>
                  {incomingCall.callerName}
                </div>
                <div style={{ fontSize: 12, color: "#0284c7", fontWeight: 700, marginBottom: 14 }}>
                  📞 {incomingCall.callerPhone}
                </div>

                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    type="button"
                    onClick={() => {
                      setJitsiRoomId(incomingCall.roomId);
                      setVideoCallDoctor({ name: incomingCall.callerName, spec: "Field Patient" });
                      setIncomingCall(null);
                      localStorage.removeItem("healthnova_incoming_call");
                    }}
                    style={{
                      flex: 1,
                      padding: "12px",
                      background: "#16a34a",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: 10,
                      fontWeight: 900,
                      fontSize: 13,
                      cursor: "pointer"
                    }}
                  >
                    Accept Video Call 📹
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIncomingCall(null);
                      localStorage.removeItem("healthnova_incoming_call");
                    }}
                    style={{
                      flex: 1,
                      padding: "12px",
                      background: "#dc2626",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: 10,
                      fontWeight: 900,
                      fontSize: 13,
                      cursor: "pointer"
                    }}
                  >
                    Decline ✕
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* MODAL: FULL NEWS ARTICLE & GOVERNMENT ACTIONS MODAL                       */}
          {/* ========================================================================= */}
          {selectedNews && (() => {
            const modalDistKm = calcDistanceKm(
              locationState.lat || 18.5204,
              locationState.lng || 73.8567,
              selectedNews.epicenter ? selectedNews.epicenter.lat : 18.5204,
              selectedNews.epicenter ? selectedNews.epicenter.lng : 73.8567
            );
            const modalHorizonHours = (modalDistKm != null && selectedNews.velocityKmH > 0)
              ? (modalDistKm / selectedNews.velocityKmH).toFixed(1)
              : null;
            const isModalAudioPlaying = activeAudioNewsId === selectedNews.id;
            const isModalSmsCopied = smsBeaconCopiedId === selectedNews.id;
            const modalSmsText = `[HEALTHNOVA SOS BEACON] Name: ${user ? user.name : "Citizen"} | GPS: ${(locationState.lat || 18.5204).toFixed(4)}, ${(locationState.lng || 73.8567).toFixed(4)} | Hazard: ${selectedNews.tag} | Status: SAFE / MONITORED | Shelter: ${selectedNews.nearestShelters && selectedNews.nearestShelters[0] ? selectedNews.nearestShelters[0].name : "Relief Camp"} | HelpLine: 112/1077`;

            return (
              <div style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.65)",
                backdropFilter: "blur(4px)",
                zIndex: 99999,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: 16
              }}>
                <div style={{
                  width: "100%",
                  maxWidth: 440,
                  maxHeight: "88vh",
                  background: "#ffffff",
                  borderRadius: 18,
                  padding: "18px 16px",
                  overflowY: "auto",
                  boxShadow: "0 24px 48px rgba(0,0,0,0.35)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 12
                }}>
                  {/* Top Bar: Tag + Priority + Close */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{
                        fontSize: 9,
                        fontWeight: 900,
                        background: `${selectedNews.tagColor}15`,
                        color: selectedNews.tagColor,
                        padding: "3px 8px",
                        borderRadius: 6,
                        border: `1px solid ${selectedNews.tagColor}30`
                      }}>
                        {selectedNews.tag}
                      </span>
                      <span style={{ fontSize: 9, color: "#64748b", fontWeight: 700 }}>
                        {selectedNews.time}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        handleStopAudioBroadcast();
                        setSelectedNews(null);
                      }}
                      style={{ border: "none", background: "#f1f5f9", borderRadius: "50%", width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, cursor: "pointer", fontWeight: 900, color: "#475569" }}
                    >
                      ✕
                    </button>
                  </div>

                  {/* Title */}
                  <h3 style={{ fontSize: 15, fontWeight: 900, color: "#0f172a", margin: 0, lineHeight: 1.35 }}>
                    {selectedNews.title}
                  </h3>

                  {/* Hyperlocal Threat Horizon Bar */}
                  <div style={{
                    background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
                    border: "1px solid #bae6fd",
                    borderRadius: 10,
                    padding: "8px 10px"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                      <div style={{ fontSize: 11, fontWeight: 900, color: "#0369a1" }}>
                        🎯 {t.threatHorizonBadge}
                      </div>
                      <span style={{
                        fontSize: 9,
                        fontWeight: 900,
                        padding: "2px 6px",
                        borderRadius: 6,
                        background: modalDistKm <= 5 ? "#fee2e2" : modalDistKm <= 15 ? "#fef3c7" : "#dcfce7",
                        color: modalDistKm <= 5 ? "#b91c1c" : modalDistKm <= 15 ? "#b45309" : "#15803d"
                      }}>
                        {modalDistKm <= 5 ? "🔴 HIGH IMPACT PERIMETER" : modalDistKm <= 15 ? "🟠 ELEVATED ADVISORY" : "🟢 PERIPHERAL WATCH"}
                      </span>
                    </div>
                    <div style={{ fontSize: 10, color: "#0c4a6e", lineHeight: 1.4 }}>
                      Distance from your GPS: <strong>{modalDistKm != null ? `${modalDistKm} km` : "Calculating..."}</strong> • Epicenter: <strong>{selectedNews.epicenter ? selectedNews.epicenter.name : "Stationary"}</strong>
                      {modalHorizonHours && (
                        <span> • Est. Wave/Front Arrival: <strong>~{modalHorizonHours} hours ({selectedNews.velocityKmH} km/h vector)</strong></span>
                      )}
                    </div>
                  </div>

                  {/* Hands-Free Emergency Radio Audio Player */}
                  <div style={{
                    background: isModalAudioPlaying ? "#fffbeb" : "#f8fafc",
                    border: `1.5px solid ${isModalAudioPlaying ? "#f59e0b" : "#e2e8f0"}`,
                    borderRadius: 12,
                    padding: "10px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 6
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 11, fontWeight: 900, color: isModalAudioPlaying ? "#b45309" : "#1e293b" }}>
                        🎙️ Emergency Radio Dispatcher
                      </span>
                      <div style={{ display: "flex", gap: 4 }}>
                        {[
                          { k: "en", lbl: "EN" },
                          { k: "hi", lbl: "हिंदी" },
                          { k: "mr", lbl: "मराठी" }
                        ].map((l) => (
                          <button
                            key={l.k}
                            type="button"
                            onClick={() => {
                              setAudioVoiceLang(l.k);
                              if (isModalAudioPlaying) handleToggleAudioBroadcast(selectedNews, l.k);
                            }}
                            style={{
                              padding: "2px 6px",
                              borderRadius: 4,
                              fontSize: 9,
                              fontWeight: 800,
                              cursor: "pointer",
                              border: audioVoiceLang === l.k ? "1px solid #d97706" : "1px solid #cbd5e1",
                              background: audioVoiceLang === l.k ? "#fef3c7" : "#ffffff",
                              color: audioVoiceLang === l.k ? "#b45309" : "#475569"
                            }}
                          >
                            {l.lbl}
                          </button>
                        ))}
                      </div>
                    </div>

                    {isModalAudioPlaying && (
                      <div style={{ display: "flex", alignItems: "center", gap: 6, margin: "2px 0" }}>
                        <span style={{ fontSize: 9, fontWeight: 800, color: "#d97706" }}>LIVE AUDIO TRANSMITTING:</span>
                        <span style={{ display: "inline-flex", alignItems: "flex-end", height: 12, gap: 2 }}>
                          {[8, 12, 6, 11, 10, 12, 5, 9, 11, 7].map((h, i) => (
                            <span key={i} style={{ width: 3, height: h, background: "#d97706", borderRadius: 1 }} />
                          ))}
                        </span>
                      </div>
                    )}

                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        type="button"
                        onClick={() => handleToggleAudioBroadcast(selectedNews, audioVoiceLang)}
                        style={{
                          flex: 1,
                          padding: "8px",
                          background: isModalAudioPlaying ? "#b45309" : "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
                          color: "#ffffff",
                          border: "none",
                          borderRadius: 8,
                          fontSize: 11,
                          fontWeight: 900,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 6
                        }}
                      >
                        {isModalAudioPlaying ? "⏹️ Stop Radio Broadcast" : `🎙️ ${t.listenRadioBtn}`}
                      </button>
                    </div>
                  </div>

                  {/* Sensor Telemetry 4-Pack */}
                  {selectedNews.telemetry && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5 }}>
                      {selectedNews.telemetry.map((tel, i) => (
                        <div
                          key={i}
                          style={{
                            background: tel.status === "alert" ? "#fff1f2" : tel.status === "warn" ? "#fffbeb" : "#f0fdf4",
                            border: `1px solid ${tel.status === "alert" ? "#fecdd3" : tel.status === "warn" ? "#fef3c7" : "#bbf7d0"}`,
                            borderRadius: 6,
                            padding: "5px 8px",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center"
                          }}
                        >
                          <span style={{ fontSize: 9, color: "#64748b", fontWeight: 700 }}>{tel.label}:</span>
                          <span style={{ fontSize: 9, fontWeight: 900, color: tel.status === "alert" ? "#be123c" : tel.status === "warn" ? "#b45309" : "#15803d" }}>
                            {tel.val}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Full Factual Article */}
                  <div style={{ fontSize: 11, color: "#334155", lineHeight: 1.55 }}>
                    {selectedNews.article}
                  </div>

                  {/* Rumor-Buster Sentinel Card */}
                  {selectedNews.rumorBuster && (
                    <div style={{
                      background: "#f8fafc",
                      border: "1.5px solid #cbd5e1",
                      borderRadius: 12,
                      padding: "10px"
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                        <span style={{ fontSize: 11, fontWeight: 900, color: "#0f172a" }}>
                          🛡️ {t.rumorBusterTitle}
                        </span>
                        <span style={{ fontSize: 9, background: "#dcfce7", color: "#166534", padding: "1px 6px", borderRadius: 4, fontWeight: 800 }}>
                          ✓ {selectedNews.rumorBuster.trustScore}% Verified Authenticity
                        </span>
                      </div>

                      <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "7px 9px", marginBottom: 6 }}>
                        <div style={{ fontSize: 9, fontWeight: 900, color: "#991b1b", marginBottom: 2 }}>
                          ❌ {t.rumorDebunkLabel}:
                        </div>
                        <div style={{ fontSize: 10, color: "#7f1d1d", lineHeight: 1.35 }}>
                          "{selectedNews.rumorBuster.claim}"
                        </div>
                      </div>

                      <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "7px 9px", marginBottom: 6 }}>
                        <div style={{ fontSize: 9, fontWeight: 900, color: "#166534", marginBottom: 2 }}>
                          ✅ {t.rumorFactLabel}:
                        </div>
                        <div style={{ fontSize: 10, color: "#14532d", lineHeight: 1.35 }}>
                          {selectedNews.rumorBuster.fact}
                        </div>
                      </div>

                      <div style={{ fontSize: 8, color: "#64748b", fontWeight: 700 }}>
                        🔒 Verified Authority: {selectedNews.rumorBuster.source} • Code #{selectedNews.rumorBuster.verificationCode}
                      </div>
                    </div>
                  )}

                  {/* 60-Second Field Action Checklist */}
                  {selectedNews.actionChecklist && (
                    <div style={{
                      background: "#fffbeb",
                      border: "1px solid #fde68a",
                      borderRadius: 12,
                      padding: "10px"
                    }}>
                      <div style={{ fontSize: 11, fontWeight: 900, color: "#92400e", marginBottom: 6 }}>
                        ⚡ {t.actionChecklistTitle}:
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                        {selectedNews.actionChecklist.map((act, i) => {
                          const taskKey = `${selectedNews.id}-task-${i}`;
                          const isDone = !!checkedTasks[taskKey];
                          return (
                            <div
                              key={i}
                              onClick={() => toggleTaskChecked(taskKey)}
                              style={{
                                display: "flex",
                                alignItems: "flex-start",
                                gap: 6,
                                cursor: "pointer",
                                fontSize: 10,
                                color: isDone ? "#15803d" : "#78350f",
                                textDecoration: isDone ? "line-through" : "none"
                              }}
                            >
                              <span style={{ fontSize: 12 }}>{isDone ? "✅" : "⬜"}</span>
                              <span style={{ lineHeight: 1.35 }}>{act}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Official Government & Responder Actions */}
                  {selectedNews.govActions && (
                    <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "10px" }}>
                      <div style={{ fontSize: 11, fontWeight: 900, color: "#166534", marginBottom: 6 }}>
                        🛡️ {t.govActionsHeading}:
                      </div>
                      <ul style={{ margin: 0, paddingLeft: 16, fontSize: 10, color: "#14532d", lineHeight: 1.45 }}>
                        {selectedNews.govActions.map((act, i) => (
                          <li key={i} style={{ marginBottom: 3 }}>{act}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Nearest Designated Municipal Relief Camps */}
                  {selectedNews.nearestShelters && (
                    <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "10px" }}>
                      <div style={{ fontSize: 11, fontWeight: 900, color: "#0f172a", marginBottom: 6 }}>
                        🏠 {t.nearestSheltersTitle}:
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {selectedNews.nearestShelters.map((sh, idx) => (
                          <div key={idx} style={{ background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: 8, padding: "6px 8px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <span style={{ fontSize: 10, fontWeight: 900, color: "#0f172a" }}>{sh.name}</span>
                              <span style={{ fontSize: 9, fontWeight: 800, color: "#059669" }}>{sh.distanceKm} km away</span>
                            </div>
                            <div style={{ fontSize: 9, color: "#64748b", margin: "2px 0" }}>
                              🛏️ {sh.bedsAvail} • 🍱 {sh.supplies}
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
                              <a href={`tel:${sh.contact}`} style={{ fontSize: 9, color: "#0284c7", fontWeight: 800, textDecoration: "none" }}>
                                📞 Call {sh.contact}
                              </a>
                              <a
                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(sh.name + " Pune")}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ fontSize: 9, color: "#16a34a", fontWeight: 800, textDecoration: "none" }}
                              >
                                🗺️ Directions →
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Zero-Internet Satellite / SMS Beacon Generator */}
                  <div style={{
                    background: "#0f172a",
                    borderRadius: 10,
                    padding: "10px",
                    color: "#f8fafc"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                      <span style={{ fontSize: 10, fontWeight: 900, color: "#38bdf8" }}>
                        📡 Low-Bandwidth SMS Safety Beacon
                      </span>
                      <span style={{ fontSize: 8, color: "#94a3b8" }}>
                        ZERO-INTERNET 2G/SMS
                      </span>
                    </div>
                    <div style={{ fontSize: 9, color: "#cbd5e1", lineHeight: 1.35, marginBottom: 6, fontFamily: "monospace", background: "#1e293b", padding: "6px", borderRadius: 6 }}>
                      {modalSmsText}
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        type="button"
                        onClick={() => handleCopySmsBeacon(selectedNews)}
                        style={{
                          flex: 1,
                          padding: "6px",
                          background: isModalSmsCopied ? "#15803d" : "#0284c7",
                          color: "#ffffff",
                          border: "none",
                          borderRadius: 6,
                          fontSize: 9,
                          fontWeight: 800,
                          cursor: "pointer"
                        }}
                      >
                        {isModalSmsCopied ? "✓ Beacon Copied!" : "📋 Copy SOS SMS Text"}
                      </button>
                      <a
                        href={`sms:112?body=${encodeURIComponent(modalSmsText)}`}
                        style={{
                          flex: 1,
                          padding: "6px",
                          background: "#334155",
                          color: "#38bdf8",
                          border: "1px solid #475569",
                          borderRadius: 6,
                          fontSize: 9,
                          fontWeight: 800,
                          textAlign: "center",
                          textDecoration: "none",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}
                      >
                        📲 Open SMS App
                      </a>
                    </div>
                  </div>

                  {/* Modal Close Button */}
                  <button
                    type="button"
                    onClick={() => {
                      handleStopAudioBroadcast();
                      setSelectedNews(null);
                    }}
                    style={{
                      width: "100%",
                      padding: "10px",
                      background: "#0f172a",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: 8,
                      fontWeight: 800,
                      fontSize: 12,
                      cursor: "pointer"
                    }}
                  >
                    Close Article ✕
                  </button>
                </div>
              </div>
            );
          })()}

          {/* ========================================================================= */}
          {/* MODAL: REAL-TIME EMERGENCY VOICE CALLING SCREEN                           */}
          {/* ========================================================================= */}
          {voiceCallDoctor && (
            <div style={{
              position: "fixed",
              inset: 0,
              background: "linear-gradient(180deg, #0f172a 0%, #1e293b 100%)",
              zIndex: 99999,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "40px 20px 30px",
              color: "#ffffff"
            }}>
              <div style={{ textAlign: "center" }}>
                <span style={{ fontSize: 11, background: "rgba(16, 185, 129, 0.2)", color: "#34d399", padding: "4px 12px", borderRadius: 20, fontWeight: 800 }}>
                  🟢 {t.activeCallTitle}
                </span>
                <div style={{ marginTop: 24, fontSize: 24, fontWeight: 900 }}>
                  {voiceCallDoctor.name}
                </div>
                <div style={{ fontSize: 13, color: "#94a3b8", marginTop: 4 }}>
                  {voiceCallDoctor.spec} • {voiceCallDoctor.hospital}
                </div>
                <div style={{ fontSize: 12, color: "#38bdf8", marginTop: 6 }}>
                  Patient: {user ? user.name : "Citizen"} ({user ? user.phone : ""})
                </div>

                <div style={{ fontSize: 28, fontWeight: 900, color: "#34d399", marginTop: 20, letterSpacing: 2 }}>
                  {formatCallTime(voiceCallSeconds)}
                </div>
              </div>

              {/* Call Controls */}
              <div style={{ width: "100%", maxWidth: 320, display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-around" }}>
                  <button
                    type="button"
                    onClick={() => setVoiceCallMuted(!voiceCallMuted)}
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: "50%",
                      background: voiceCallMuted ? "#dc2626" : "rgba(255,255,255,0.15)",
                      border: "none",
                      color: "#ffffff",
                      fontSize: 18,
                      cursor: "pointer"
                    }}
                  >
                    {voiceCallMuted ? "🔇" : "🎙️"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setVoiceCallSpeaker(!voiceCallSpeaker)}
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: "50%",
                      background: voiceCallSpeaker ? "#0284c7" : "rgba(255,255,255,0.15)",
                      border: "none",
                      color: "#ffffff",
                      fontSize: 18,
                      cursor: "pointer"
                    }}
                  >
                    📢
                  </button>
                  <a
                    href={`tel:${voiceCallDoctor.phone.replace(/[^0-9]/g, "")}`}
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: "50%",
                      background: "#16a34a",
                      border: "none",
                      color: "#ffffff",
                      fontSize: 18,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      textDecoration: "none"
                    }}
                    title="Dial via Phone SIM Network"
                  >
                    📱
                  </a>
                </div>

                <button
                  type="button"
                  onClick={() => setVoiceCallDoctor(null)}
                  style={{
                    width: "100%",
                    padding: "14px",
                    background: "#dc2626",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: 30,
                    fontWeight: 900,
                    fontSize: 15,
                    cursor: "pointer",
                    boxShadow: "0 6px 20px rgba(220, 38, 38, 0.4)"
                  }}
                >
                  🛑 {t.endCallBtn}
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* MODAL: JITSI MEET REAL-TIME VIDEO CALLING SCREEN                          */}
          {/* ========================================================================= */}
          {videoCallDoctor && (
            <div style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.85)",
              zIndex: 99999,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              padding: 12
            }}>
              <div style={{
                width: "100%",
                maxWidth: 440,
                background: "#0f172a",
                borderRadius: 16,
                padding: "14px",
                display: "flex",
                flexDirection: "column",
                gap: 10,
                boxShadow: "0 20px 50px rgba(0,0,0,0.5)"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 900, color: "#38bdf8" }}>
                      📹 {t.videoCallTitle}
                    </div>
                    <div style={{ fontSize: 10, color: "#94a3b8" }}>
                      {videoCallDoctor.name} ({videoCallDoctor.spec || ""})
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setVideoCallDoctor(null);
                      localStorage.removeItem("healthnova_incoming_call");
                    }}
                    style={{ background: "#dc2626", color: "#ffffff", border: "none", borderRadius: 8, padding: "4px 8px", fontSize: 11, fontWeight: 800, cursor: "pointer" }}
                  >
                    ✕ Close
                  </button>
                </div>

                {/* Embedded Jitsi Meet WebRTC Frame */}
                <div style={{ width: "100%", height: 380, borderRadius: 10, overflow: "hidden", background: "#000000" }}>
                  <iframe
                    src={`https://meet.jit.si/${jitsiRoomId}#config.prejoinPageEnabled=false&userInfo.displayName=${encodeURIComponent((user ? user.name : "Citizen") + " (" + (user ? user.phone : "") + ")")}`}
                    style={{ width: "100%", height: "100%", border: 0 }}
                    allow="camera; microphone; fullscreen; display-capture; autoplay"
                    title="Jitsi Video Consultation"
                  />
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <a
                    href={`https://meet.jit.si/${jitsiRoomId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: 10, color: "#38bdf8", fontWeight: 800, textDecoration: "none" }}
                  >
                    ↗ Open External App
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      setVideoCallDoctor(null);
                      localStorage.removeItem("healthnova_incoming_call");
                    }}
                    style={{
                      background: "#dc2626",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: 8,
                      padding: "8px 16px",
                      fontSize: 12,
                      fontWeight: 900,
                      cursor: "pointer"
                    }}
                  >
                    🛑 {t.endCallBtn}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* OUTBOX QUEUE MODAL DRAWER */}
          {outboxOpen && (
            <div style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.5)",
              zIndex: 99999,
              display: "flex",
              justifyContent: "center",
              alignItems: "flex-end"
            }}>
              <div style={{
                width: "100%",
                maxWidth: 440,
                background: "#ffffff",
                maxHeight: "80vh",
                padding: "16px",
                borderTopLeftRadius: 18,
                borderTopRightRadius: 18,
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between"
              }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 900, margin: 0 }}>📦 IndexedDB Outbox</h3>
                    <button type="button" onClick={() => setOutboxOpen(false)} style={{ border: "none", background: "none", fontSize: 18, cursor: "pointer" }}>✕</button>
                  </div>
                  <p style={{ fontSize: 10, color: "#64748b", margin: "0 0 10px 0" }}>
                    Offline records queued in browser storage (`incident_outbox`).
                  </p>

                  {outboxItems.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "26px 0", color: "#94a3b8", fontSize: 11 }}>
                      Outbox is empty. All local reports synced!
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {outboxItems.map((item) => (
                        <div key={item.clientIncidentId} style={{ background: "#f8fafc", padding: "8px", borderRadius: 6, border: "1px solid #e2e8f0" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: 9, color: "#64748b" }}>{item.clientIncidentId}</span>
                            <span style={{ fontSize: 8, fontWeight: 800, padding: "2px 5px", borderRadius: 6, background: item.syncStatus === "synced" ? "#dcfce7" : "#ffedd5", color: item.syncStatus === "synced" ? "#166534" : "#9a3412" }}>
                              {item.syncStatus}
                            </span>
                          </div>
                          <div style={{ fontSize: 10, fontWeight: 700, margin: "2px 0", color: "#0f172a" }}>
                            {item.category} ({item.urgency})
                          </div>
                          <div style={{ fontSize: 9, color: "#475569" }}>{item.requestText}</div>
                          {item.serverIncidentId && (
                            <div style={{ fontSize: 9, color: "#16a34a", fontWeight: 700, marginTop: 2 }}>
                              Server ID: {item.serverIncidentId}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{ paddingTop: 12 }}>
                  <button
                    type="button"
                    onClick={async () => {
                      if (window.HealthNovaStorage) {
                        await window.HealthNovaStorage.flushOutbox();
                        loadOutbox();
                      }
                    }}
                    style={{
                      width: "100%",
                      padding: "10px",
                      background: "#0284c7",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: 8,
                      fontWeight: 800,
                      fontSize: 12,
                      cursor: "pointer"
                    }}
                  >
                    ⚡ Sync Outbox Now
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    );
  }

  // --- ROOT DELEGATION COMPONENT ---
  function SentinelRootWrapper({ App }) {
    const [platform, setPlatform] = useState(() => {
      const p = new URLSearchParams(window.location.search).get("app");
      return p === "vetnova" ? "vetnova" : p === "healthnova" ? "healthnova" : null;
    });
    const [splashDone, setSplashDone] = useState(false);
    const [lang, setLang] = useState("en");

    // 1. If VetNova selected -> render original VetNova App with Return pill
    if (platform === "vetnova") {
      return (
        <div style={{ position: "relative" }}>
          <div
            id="return-to-healthnova-btn"
            style={{
              position: "fixed",
              bottom: 22,
              right: 18,
              zIndex: 99999,
              background: "#0f172a",
              color: "#ffffff",
              padding: "10px 16px",
              borderRadius: 30,
              boxShadow: "0 4px 16px rgba(0,0,0,0.35)",
              display: "flex",
              alignItems: "center",
              gap: 8,
              border: "1.5px solid #0284c7",
              cursor: "pointer",
              fontWeight: 800,
              fontSize: 12,
              fontFamily: "system-ui, sans-serif"
            }}
            onClick={() => {
              setPlatform("healthnova");
              try { window.history.replaceState({}, "", "/?app=healthnova"); } catch (_) {}
            }}
            title="Switch to HealthNova Disaster Emergency Intelligence Platform"
          >
            <span>🛡️ Return to HealthNova</span>
          </div>
          <div
            id="return-to-hub-btn"
            style={{
              position: "fixed",
              bottom: 22,
              left: 18,
              zIndex: 99999,
              background: "#ffffff",
              color: "#0f172a",
              padding: "10px 16px",
              borderRadius: 30,
              boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
              display: "flex",
              alignItems: "center",
              gap: 8,
              border: "1.5px solid #cbd5e1",
              cursor: "pointer",
              fontWeight: 800,
              fontSize: 12,
              fontFamily: "system-ui, sans-serif"
            }}
            onClick={() => {
              setPlatform(null);
              setSplashDone(false);
              try { window.history.replaceState({}, "", "/"); } catch (_) {}
            }}
            title="Return to Main Platforms Hub"
          >
            <span>⇋ All Platforms</span>
          </div>
          <App />
        </div>
      );
    }

    // 2. If HealthNova selected -> show animated splash first, then mobile master shell
    if (platform === "healthnova") {
      if (!splashDone) {
        return (
          <HealthNovaSplashScreen
            onComplete={() => setSplashDone(true)}
            lang={lang}
          />
        );
      }
      return (
        <HealthNovaMasterShell
          onOpenPortal={() => {
            setPlatform(null);
            setSplashDone(false);
            try { window.history.replaceState({}, "", "/"); } catch (_) {}
          }}
          onOpenVetNova={() => {
            setPlatform("vetnova");
            try { window.history.replaceState({}, "", "/?app=vetnova"); } catch (_) {}
          }}
        />
      );
    }

    // 3. Default root -> Pure White-Tinted Mobile Gateway Screen (HealthNova & VetNova)
    return (
      <PortalChoiceScreen
        onSelectPlatform={(p) => {
          setPlatform(p);
          if (p === "healthnova") setSplashDone(false);
          try { window.history.replaceState({}, "", p ? `/?app=${p}` : "/"); } catch (_) {}
        }}
        lang={lang}
        setLang={setLang}
      />
    );
  }

  // Pure function returning a React Component element: zero hooks in Boot!
  window.renderSentinelRoot = function (App) {
    return <SentinelRootWrapper App={App} />;
  };
})();
