import { initializeApp } from "[https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js](https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js)";
import { getFirestore, collection, addDoc } from "[https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js](https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js)";

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

const orderForm = document.getElementById('contactForm');

// دالة برمجية لتحويل ملف الصورة إلى نص Base64 ليتم حفظه في السيرفر بسهولة
function convertImageToBase64(file) {
    return new Promise((resolve, reject) => {
        if (!file) resolve(""); // إذا لم يتم رفع صورة، ترجع قيمة فارغة
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

orderForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('clientName').value.trim();
    const phone = document.getElementById('clientPhone').value.trim();
    const order = document.getElementById('clientOrder').value.trim();
    const imageFile = document.getElementById('clientImage').files[0]; // جلب ملف الصورة

    if (name === "" || phone === "" || order === "") {
        alert("يرجى تعبئة الحقول الأساسية أولاً ✨");
        return;
    }

    try {
        // تحويل الصورة برمجياً قبل الإرسال (ستكون فارغة إذا لم يرفع المستخدم شيئاً)
        const imageBase64 = await convertImageToBase64(imageFile);

        // 1. حفظ البيانات كاملة مع الصورة في Firebase
        await addDoc(collection(db, "orders"), {
            clientName: name,
            clientPhone: phone,
            clientOrder: order,
            clientImage: imageBase64, // حفظ كود الصورة الاختيارية هنا
            status: "active",
            timestamp: new Date()
        });

        // رسالة تنبيه بنجاح الإرسال وحفظ البيانات في السيرفر
        alert("تم إرسال طلبكِ بنجاح! ✨");

        // 2. تجهيز نص رسالة الواتساب التلقائية والانتقال إليها
        const whatsappNumber = "96896492685";
        let messageText = `مرحباً Design Studio ✨%0A%0Aأود طلب خدمة من الموقع، وهذه تفاصيلي:%0A👤 *الاسم:* ${name}%0A📱 *الهاتف:* ${phone}%0A📝 *تفاصيل الطلب:* ${order}`;
        
        if(imageFile) {
            messageText += `%0A📸 *ملاحظة:* قمت بإرفاق صورة توضيحية للمثال في الموقع!`;
        }

        const whatsappUrl = `https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${messageText}`;
        
        // الانتقال المباشر للواتساب المتوافق مع الهواتف والكمبيوتر
        window.location.href = whatsappUrl;

        orderForm.reset();

    } catch (error) {
        console.error("حدث خطأ أثناء إرسال الطلب: ", error);
        alert("عذراً، حدث خطأ أثناء إرسال الطلب. حاولي مجدداً!");
    }
});
