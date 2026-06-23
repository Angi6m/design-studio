
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

const orderForm = document.getElementById('contactForm');

orderForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('clientName').value.trim();
    const phone = document.getElementById('clientPhone').value.trim();
    const order = document.getElementById('clientOrder').value.trim();

    if (name === "" || phone === "" || order === "") {
        alert("يرجى تعبئة جميع الحقول أولاً  ✨");
        return;
    }

    try {
        // 1. حفظ البيانات في الـ Firebase أولاً كالعادة
        await addDoc(collection(db, "orders"), {
            clientName: name,
            clientPhone: phone,
            clientOrder: order,
            timestamp: new Date()
        });

        // 2. تجهيز نص الرسالة التلقائية للواتساب وتنسيقها بشكل فخم
        const whatsappNumber = "96896492685"; // رقم الواتساب الخاص بكِ
        const messageText = `مرحباً Design Studio ✨%0A%0Aأود طلب خدمة من الموقع، وهذه تفاصيلي:%0A👤 *الاسم:* ${name}%0A📱 *الهاتف:* ${phone}%0A📝 *تفاصيل الطلب:* ${order}`;

        // 3. فتح رابط الواتساب مباشرة في صفحة جديدة
        const whatsappUrl = `https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${messageText}`;
        window.open(whatsappUrl, '_blank');

        // تفريغ الحقول بعد النجاح
        orderForm.reset();

    } catch (error) {
        console.error("حدث خطأ أثناء إرسال الطلب: ", error);
        alert("عذراً، حدث خطأ أثناء إرسال الطلب. حاولي مجدداً!");
    }
});
