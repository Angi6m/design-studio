import { initializeApp } from "[https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js](https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js)";
import { getFirestore, collection, query, orderBy, getDocs, doc, updateDoc } from "[https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js](https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js)";

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

async function fetchOrders() {
    const ordersContainer = document.getElementById("ordersContainer");
    const loadingMessage = document.getElementById("loadingMessage");
    const ordersTable = document.getElementById("ordersTable");

    try {
        const ordersQuery = query(collection(db, "orders"), orderBy("timestamp", "desc"));
        const querySnapshot = await getDocs(ordersQuery);

        ordersContainer.innerHTML = "";
        let visibleOrdersCount = 0;

        querySnapshot.forEach((documentSnapshot) => {
            const data = documentSnapshot.data();
            const orderId = documentSnapshot.id; 

            // تخطي الطلبات المؤرشفة لتنظيف اللوحة
            if (data.status === "archived") {
                return; 
            }

            visibleOrdersCount++;

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

            // البرمجة الخاصة بفحص وعرض الصورة التوضيحية الاختيارية للعميل
            let imageCellHtml = `<span style="color: #aaa;">لا توجد صورة</span>`;
            if (data.clientImage && data.clientImage !== "") {
                imageCellHtml = `<button class="view-img-btn" data-img="${data.clientImage}" style="background-color: #d4a373; color: white; border: none; padding: 4px 10px; border-radius: 4px; cursor: pointer; font-size: 13px;">عرض الصورة 🖼️</button>`;
            }

            const row = `
                <tr id="row-${orderId}">
                    <td><strong>${data.clientName || 'بدون اسم'}</strong></td>
                    <td><a href="[https://wa.me/$](https://wa.me/$){data.clientPhone}" target="_blank" style="color: #25D366; font-weight: bold; text-decoration: none;">📱 ${data.clientPhone || 'بدون رقم'}</a></td>
                    <td>${imageCellHtml}</td> <td>${data.clientOrder || 'لا توجد تفاصيل'}</td>
                    <td style="color: #666; font-size: 14px;">${formattedTime}</td>
                    <td>
                        <button class="archive-btn" data-id="${orderId}" style="background-color: #d4a373; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-weight: bold;">تنظيف وعمل ✅</button>
                    </td>
                </tr>
            `;
            ordersContainer.innerHTML += row;
        });

        if (visibleOrdersCount === 0) {
            loadingMessage.innerHTML = "اللوحة نظيفة! لا توجد طلبات جديدة حالياً ✨📥";
            ordersTable.style.display = "none";
            loadingMessage.style.display = "block";
            return;
        }

        loadingMessage.style.display = "none";
        ordersTable.style.display = "table";

        // تشغيل أزرار عرض الصور عند الضغط عليها في نافذة منفصلة
        document.querySelectorAll('.view-img-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const base64Data = e.target.getAttribute('data-img');
                const win = window.open();
                win.document.write(`<iframe src="${base64Data}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
            });
        });

        // تشغيل أزرار التنظيف والأرشفة عند الضغط عليها
        document.querySelectorAll('.archive-btn').forEach(button => {
            button.addEventListener('click', async (e) => {
                const id = e.target.getAttribute('data-id');
                await archiveOrder(id);
            });
        });

    } catch (error) {
        console.error("خطأ أثناء جلب الطلبات: ", error);
        loadingMessage.innerHTML = "❌ فشل تحميل البيانات من السيرفر.";
    }
}

async function archiveOrder(id) {
    if (confirm("هل تمت تلبية هذا الطلب وتريدين نقله للأرشيف لتنظيف اللوحة؟ ✨")) {
        try {
            await updateDoc(doc(db, "orders", id), {
                status: "archived"
            });
            alert("تمت أرشفة الطلب بنجاح وتنظيف اللوحة! 🥳");
            fetchOrders(); 
        } catch (error) {
            console.error("خطأ أثناء الأرشفة: ", error);
            alert("عذراً، حدث خطأ أثناء نقل الطلب. حاولي مجدداً!");
        }
    }
}

window.onload = fetchOrders;
