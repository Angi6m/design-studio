// ####### استيراد مكتبات الفايربيس #######
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyA69wrlpPFGg35NYXalTvciadHKx0ZpbM8",
  authDomain: "design-studio-e876e.firebaseapp.com",
  projectId: "design-studio-e876e",
  storageBucket: "design-studio-e876e.firebasestorage.app",
  messagingSenderId: "22933282452",
  appId: "1:22933282452:web:46876456f6ef5909631e81",
  measurementId: "G-Q1YJWZ8DER"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ####### برمجة تفاعل قائمة الأسعار وتحديث السعر وإظهار صورة الباقات تلقائياً #######
const packageSelect = document.getElementById('packageSelect');
const priceDisplay = document.getElementById('priceDisplay');
const currencyLabel = document.getElementById('currencyLabel');
const socialPricesImageWrapper = document.getElementById('socialPricesImageWrapper'); // جلب صندوق الصورة الجديد

packageSelect.addEventListener('change', () => {
    const selectedOption = packageSelect.options[packageSelect.selectedIndex];
    const price = selectedOption.getAttribute('data-price');
    
    // # إذا لم يتم اختيار أي باقة أو العودة للخيارات الافتراضية #
    if (price === "0" || !price) {
        priceDisplay.textContent = "--";
        currencyLabel.style.display = "inline";
        socialPricesImageWrapper.style.display = "none"; // إخفاء الصورة
    } 
    // # إذا اختار العميل باقة إدارة السوشيال ميديا #
    else if (price === "على حسب الخدمة") {
        priceDisplay.textContent = "على حسب الخدمة";
        currencyLabel.style.display = "none"; 
        socialPricesImageWrapper.style.display = "block"; // إظهار صورة باقات الأسعار فوراً! 🔥
    } 
    // # إذا اختار العميل أي باقة عادية بها سعر رقمي (مثل بزنس كارد) #
    else {
        priceDisplay.textContent = price;
        currencyLabel.style.display = "inline"; 
        socialPricesImageWrapper.style.display = "none"; // إخفاء الصورة لكي لا تظهر مع الباقات العادية
    }
});

// ####### حركة إضافية: عند الضغط على الصورة تفتح في نافذة جديدة كبيرة لرؤيتها بوضوح #######
if (document.getElementById('socialPricesImg')) {
    document.getElementById('socialPricesImg').addEventListener('click', (e) => {
        window.open(e.target.src, '_blank');
    });
}
// ####### دالة تحويل ملف الصورة الاختيارية لنص يحفظ في السيرفر #######
function convertImageToBase64(file) {
    return new Promise((resolve, reject) => {
        if (!file) resolve(""); 
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

// ####### برمجة نموذج الإرسال والربط مع السيرفر والواتساب #######
const orderForm = document.getElementById('contactForm');

orderForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('clientName').value.trim();
    const phone = document.getElementById('clientPhone').value.trim();
    const order = document.getElementById('clientOrder').value.trim();
    const imageFile = document.getElementById('clientImage').files[0]; 
    
    // جلب الباقة المختارة والسعر
    const chosenPackage = packageSelect.value;
    const chosenPrice = priceDisplay.textContent;

    if (name === "" || phone === "" || order === "") {
        alert("يرجى تعبئة الحقول الأساسية أولاً ✨");
        return;
    }

    try {
        const imageBase64 = await convertImageToBase64(imageFile);

        // 1. حفظ الطلب في السيرفر مع بيانات السعر والباقة والصورة
        await addDoc(collection(db, "orders"), {
            clientName: name,
            clientPhone: phone,
            clientOrder: order,
            clientPackage: chosenPackage || "لم يتم اختيار باقة محددة",
            clientPrice: chosenPrice !== "--" ? chosenPrice + " ر.ع" : "غير محدد",
            clientImage: imageBase64, 
            status: "active",
            timestamp: new Date()
        });

        alert("تم إرسال طلبكِ بنجاح! ✨");

        // 2. تجهيز نص رسالة الواتساب الاحترافية شاملة السعر والباقة المحددة
        const whatsappNumber = "96896492685";
        let messageText = `مرحباً Design Studio ✨%0A%0Aأود طلب خدمة من الموقع، وهذه تفاصيلي:%0A👤 *الاسم:* ${name}%0A📱 *الهاتف:* ${phone}`;
        
        if (chosenPackage !== "") {
            messageText += `%0A📦 *الباقة المختارة:* ${chosenPackage}%0A💰 *السعر المقدر:* ${chosenPrice} ر.ع`;
        }
        
        messageText += `%0A📝 *تفاصيل الطلب:* ${order}`;
        
        if(imageFile) {
            messageText += `%0A📸 *ملاحظة:* قمت بإرفاق صورة توضيحية للمثال في الموقع!`;
        }

        const whatsappUrl = `https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${messageText}`;
        
        // الانتقال الفوري المتوافق مع الهواتف والكمبيوتر بدون حظر النوافذ
        window.location.href = whatsappUrl;
        orderForm.reset();
        priceDisplay.textContent = "--";

    } catch (error) {
        console.error("حدث خطأ أثناء إرسال الطلب: ", error);
        alert("عذراً، حدث خطأ أثناء إرسال الطلب. حاولي مجدداً!");
    }
});
