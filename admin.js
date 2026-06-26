// استدعاء دالتين من Firebase لقراءة البيانات وترتيبها
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, query, orderBy, getDocs, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// نفس مفاتيح الربط الخاصة بمشروعك (Design Studio) لفتح نفس السيرفر
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

// دالة لجلب الطلبات وعرضها في الجدول
async function fetchOrders() {
    const ordersContainer = document.getElementById("ordersContainer");
    const loadingMessage = document.getElementById("loadingMessage");
    const ordersTable = document.getElementById("ordersTable");

    try {
        // إنشاء استعلام لجلب الطلبات من جدول "orders" مرتبة حسب الوقت (الأحدث أولاً)
        const ordersQuery = query(collection(db, "orders"), orderBy("timestamp", "desc"));
        const querySnapshot = await getDocs(ordersQuery);

      querySnapshot.forEach((documentSnapshot) => {
    const data = documentSnapshot.data();
    const orderId = documentSnapshot.id; 

    // تخطي الطلبات التي تم تنظيفها وأرشفتها
    if (data.status === "archived") {
        return; 
    }

    let formattedTime = "غير محدد";
    if (data.timestamp) {
        const date = data.timestamp.toDate();
        formattedTime = date.toLocaleString("ar-EG", {
            hour: '2-digit',
            minute: '2-digit',
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    }

   // تأكدي أن متغير row مكتوب بهذا الشكل ويحتوي على الـ button في النهاية:
            const row = `
                <tr id="row-${orderId}">
                    <td><strong>${data.clientName || 'بدون اسم'}</strong></td>
                    <td><a href="https://wa.me/${data.clientPhone}" target="_blank" style="color: #25D366; font-weight: bold; text-decoration: none;">📱 ${data.clientPhone || 'بدون رقم'}</a></td>
                    <td>${data.clientOrder || 'لا توجد تفاصيل'}</td>
                    <td style="color: #666; font-size: 14px;">${formattedTime}</td>
                    <td>
                        <button class="archive-btn" data-id="${orderId}" style="background-color: #d4a373; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-weight: bold;">تنظيف وعمل ✅</button>
                    </td>
                </tr>
            `;
            ordersContainer.innerHTML += row;

// تفعيل عمل الأزرار عند الضغط (توضع مباشرة بعد نهاية حلقة forEach)
document.querySelectorAll('.archive-btn').forEach(button => {
    button.addEventListener('click', async (e) => {
        const id = e.target.getAttribute('data-id');
        await archiveOrder(id);
    });
});
        // مسح أي نص مؤقت
        ordersContainer.innerHTML = "";

        if (querySnapshot.empty) {
            loadingMessage.innerHTML = "لا توجد طلبات مسجلة حتى الآن! 📥";
            return;
        }

        // الدوران على كل طلب وجلبه
        querySnapshot.forEach((doc) => {
            const data = doc.data();

            // تحويل الوقت من نظام Firebase إلى تاريخ ووقت مفهوم باللغة العربية
            let formattedTime = "غير محدد";
            if (data.timestamp) {
                const date = data.timestamp.toDate();
                formattedTime = date.toLocaleString("ar-EG", {
                    hour: '2-digit',
                    minute: '2-digit',
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                });
            }

            // إنشاء سطر جديد في الجدول لكل زبون
            const row = `
                <tr>
                    <td><strong>${data.clientName || 'بدون اسم'}</strong></td>
                    <td><a href="https://wa.me/${data.clientPhone}" target="_blank" style="color: #25D366; font-weight: bold; text-decoration: none;">📱 ${data.clientPhone || 'بدون رقم'}</a></td>
                    <td>${data.clientOrder || 'لا توجد تفاصيل'}</td>
                    <td style="color: #666; font-size: 14px;">${formattedTime}</td>
                </tr>
            `;
            ordersContainer.innerHTML += row;
        });

        // إخفاء رسالة التحميل وإظهار الجدول الفخم
        loadingMessage.style.display = "none";
        ordersTable.style.display = "table";

    } catch (error) {
        console.error("خطأ أثناء جلب الطلبات: ", error);
        loadingMessage.innerHTML = "❌ فشل تحميل البيانات من السيرفر. تأكدي من إعدادات الحماية في فايربيس.";
    }
}
// دالة أرشفة الطلب وتنظيفه من الشاشة دون حذفه من السيرفر
async function archiveOrder(id) {
    if (confirm("هل تمت تلبية هذا الطلب وتريدين نقله للأرشيف لتنظيف اللوحة؟ ✨")) {
        try {
            // تحديث حالة الطلب في Firebase إلى مؤرشف
            await updateDoc(doc(db, "orders", id), {
                status: "archived"
            });
            
            alert("تمت أرشفة الطلب بنجاح وتنظيف اللوحة! 🥳");
            fetchOrders(); // إعادة تحديث شاشة اللوحة فوراً
        } catch (error) {
            console.error("خطأ أثناء الأرشفة: ", error);
            alert("عذراً، حدث خطأ أثناء نقل الطلب. حاولي مجدداً!");
        }
    }
}
// تشغيل الدالة تلقائياً بمجرد فتح الصفحة
window.onload = fetchOrders;
