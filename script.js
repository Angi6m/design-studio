const form = document.getElementById("contactForm");

form.addEventListener("submit", function(event) {

    event.preventDefault();

    const name = document.querySelector('input[type="text"]').value;
    const phone = document.querySelector('input[type="tel"]').value;
    const message = document.querySelector('textarea').value;

    if (name === "") {
        alert("يرجى إدخال الاسم");
        return;
    }

    if (phone === "") {
        alert("يرجى إدخال رقم الهاتف");
        return;
    }

    if (message === "") {
        alert("يرجى كتابة تفاصيل الطلب");
        return;
    }

    alert("تم إرسال الطلب بنجاح!");
});


// استدعاء الدوال الحركية من سيرفرات فايربيس مباشرة
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// مفاتيح الربط الخاصة بمشروع Design Studio
const firebaseConfig = {
  apiKey: "AIzaSyA69wrlpPFGg35NYXalTvciadHKx0ZpbM8",
  authDomain: "design-studio-e876e.firebaseapp.com",
  projectId: "design-studio-e876e",
  storageBucket: "design-studio-e876e.firebasestorage.app",
  messagingSenderId: "22933282452",
  appId: "1:22933282452:web:46876456f6ef5909631e81",
  measurementId: "G-Q1YJWZ8DER"
};

// تهيئة فايربيس وقاعدة البيانات
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// الإمساك بعناصر النموذج من الـ HTML
const orderForm = document.getElementById('contactForm');

// مراقبة ضغط الزر وإرسال البيانات
orderForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // منع الصفحة من التحديث التلقائي عند الإرسال

    // سحب القيم التي كتبها الزبون
    const name = document.getElementById('clientName').value;
    const order = document.getElementById('clientOrder').value;

    try {
        // إرسال البيانات وحفظها في جدول داخل فايربيس نسميه "orders"
        await addDoc(collection(db, "orders"), {
            clientName: name,
            clientOrder: order,
            timestamp: new Date() // حفظ وقت وتاريخ الطلب تلقائياً
        });

        // إظهار رسالة نجاح للزبون وتفريغ المربعات
        alert("تم استلام طلبكِ بنجاح! سنتواصل معكِ قريباً ✨");
        orderForm.reset();

    } catch (error) {
        console.error("حدث خطأ أثناء إرسال الطلب: ", error);
        alert("عذراً، حدث خطأ أثناء إرسال الطلب. حاولي مجدداً!");
    }
});
