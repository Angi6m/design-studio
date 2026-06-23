
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
        alert("يرجى تعبئة جميع الحقول أولاً يا أختي ✨");
        return;
    }

    try {
        await addDoc(collection(db, "orders"), {
            clientName: name,
            clientPhone: phone,
            clientOrder: order,
            timestamp: new Date()
        });

        alert("تم استلام طلبكِ بنجاح! سنتواصل معكِ قريباً ✨");
        orderForm.reset();

    } catch (error) {
        console.error("حدث خطأ أثناء إرسال الطلب: ", error);
        alert("عذراً، حدث خطأ أثناء إرسال الطلب. حاولي مجدداً!");
    }
});
