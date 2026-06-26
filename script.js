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
        await addDoc(collection(db, "orders"), {
            clientName: name,
            clientPhone: phone,
            clientOrder: order,
            timestamp: new Date()
        });

        alert("تم إرسال طلبكِ بنجاح يا ملاك! ✨");

        const whatsappNumber = "96896492685";
        const messageText = `مرحباً Design Studio ✨%0A%0Aأود طلب خدمة من الموقع، وهذه تفاصيلي:%0A👤 *الاسم:* ${name}%0A📱 *الهاتف:* ${phone}%0A📝 *تفاصيل الطلب:* ${order}`;
        
        // حل مشكلة الهواتف: استخدام window.location.href لضمان انتقال الهواتف مباشرة إلى تطبيق واتساب دون حظر النوافذ المنبثقة
        const whatsappUrl = `https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${messageText}`;
        window.location.href = whatsappUrl;

        orderForm.reset();

    } catch (error) {
        console.error("حدث خطأ أثناء إرسال الطلب: ", error);
        alert("عذراً، حدث خطأ أثناء إرسال الطلب. حاولي مجدداً!");
    }
});
