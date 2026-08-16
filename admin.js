// ##########################################################
// ########## استيراد مكتبات Firebase ##########
// ##########################################################

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
// ##########################################################
// ########## استيراد مكتبات Firestore ##########
// ##########################################################

import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    getDoc,
    updateDoc,
    deleteDoc,
    doc,
    query,
    orderBy,
    setDoc,
    arrayUnion
}
from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCV4UaAdvztAvV3FDbncRb9tbb18tNLZPQ",
  authDomain: "yazia-design.firebaseapp.com",
  projectId: "yazia-design",
  storageBucket: "yazia-design.firebasestorage.app",
  messagingSenderId: "306527987581",
  appId: "1:306527987581:web:0cbf69fb7b7a501dd94e14"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ##########################################################
// ########## إعداد Cloudinary ##########
// ##########################################################

const CLOUD_NAME = "p2cp7es3";

const UPLOAD_PRESET = "yazia_upload";

// ####### جلب وعرض البيانات في جدول الإدارة #######
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

            // فحص الصورة الاختيارية
            let imageCellHtml = `<span style="color: #aaa;">لا توجد صورة</span>`;
            if (data.clientImage && data.clientImage !== "") {
                imageCellHtml = `<button class="view-img-btn" data-img="${data.clientImage}" style="background-color: #d4a373; color: white; border: none; padding: 4px 10px; border-radius: 4px; cursor: pointer; font-size: 13px;">عرض الصورة 🖼️</button>`;
            }

            // بناء سطر الجدول الكامل شاملاً الباقة والسعر
            const row = `
                <tr id="row-${orderId}">
                    <td><strong>${data.clientName || 'بدون اسم'}</strong></td>
                    <td><a href="https://wa.me/${data.clientPhone}" target="_blank" style="color: #25D366; font-weight: bold; text-decoration: none;">📱 ${data.clientPhone || 'بدون رقم'}</a></td>
                    <td style="color: #5c4d3c; font-weight: 500;">${data.clientPackage || 'لم يتم الاختيار'}</td>
                    <td style="color: #d4a373; font-weight: bold;">${data.clientPrice || 'غير محدد'}</td>
                    <td>${imageCellHtml}</td>
                    <td>${data.clientOrder || 'لا توجد تفاصيل'}</td>
                    <td style="color: #666; font-size: 13px;">${formattedTime}</td>
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

        // تفعيل أزرار عرض الصور المرفقة
        document.querySelectorAll('.view-img-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const base64Data = e.target.getAttribute('data-img');
                const win = window.open();
                win.document.write(`<iframe src="${base64Data}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
            });
        });

        // تفعيل أزرار التنظيف والأرشفة
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

// ####### دالة نقل الطلبات المنجزة للأرشيف #######
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

// ================================
// التنقل بين أقسام لوحة الإدارة
// ================================

const tabs = document.querySelectorAll(".admin-tab");
const contents = document.querySelectorAll(".tab-content");

tabs.forEach(tab => {

    tab.addEventListener("click", () => {

        tabs.forEach(btn => btn.classList.remove("active"));
        contents.forEach(section => section.classList.remove("active"));

        tab.classList.add("active");

        document
            .getElementById(tab.dataset.tab)
            .classList.add("active");

    });

});
// ##########################################################
// ########## تجهيز عناصر رفع الصور ##########
// ##########################################################

const uploadBtn = document.getElementById("uploadPortfolioBtn");
const serviceType = document.getElementById("serviceType");
const portfolioImages = document.getElementById("portfolioImages");
// ##########################################################
// ########## رفع الصور ##########

// ##########################################################
// ########## دالة رفع صورة واحدة إلى Cloudinary ##########
// ##########################################################

async function uploadImageToCloudinary(file){

    const formData = new FormData();

    formData.append("file", file);

    formData.append("upload_preset", UPLOAD_PRESET);

    const response = await fetch(

        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,

        {
            method: "POST",
            body: formData
        }

    );

    const data = await response.json();

    return data.secure_url;

}

// ##########################################################
// ########## حفظ روابط الصور داخل Firestore ##########
// ##########################################################

async function saveImageToFirestore(service,imageUrl){

    const serviceRef = doc(db,"services",service);

    const serviceSnap = await getDoc(serviceRef);

    if(serviceSnap.exists()){

        await updateDoc(serviceRef,{

            images:arrayUnion(imageUrl)

        });

    }

    else{

        await setDoc(serviceRef,{

            images:[imageUrl]

        });

    }

}

uploadBtn.addEventListener("click",async()=>{

    const files=document.getElementById("portfolioImages").files;

    if(files.length===0){

        alert("اختاري صورة واحدة أو أكثر.");

        return;

    }

    for(const file of files){

       const imageUrl = await uploadImageToCloudinary(file);

await saveImageToFirestore(

    serviceType.value,

    imageUrl

);

console.log(imageUrl);
    }

alert("تم رفع الصور إلى Cloudinary 🎉");

await loadPortfolioImages();
});
// ##########################################################
// ########## تحديث المعرض بعد رفع الصور ##########
// ##########################################################

// ##########################################################
// ########## عرض صور الخدمة داخل لوحة الإدارة ##########
// ##########################################################

async function loadPortfolioImages() {

    const gallery = document.getElementById("portfolioGallery");

    // تفريغ المعرض قبل عرض الصور الجديدة
    gallery.innerHTML = "";

    // معرفة الخدمة المختارة
    const service = document.getElementById("serviceType").value;

    try {

        // الوصول إلى وثيقة الخدمة داخل Firestore
        const serviceRef = doc(db, "services", service);

        const serviceSnap = await getDoc(serviceRef);

        // إذا لم توجد الخدمة
        if (!serviceSnap.exists()) {

            gallery.innerHTML = `
                <p class="no-images">
                    لا توجد صور لهذه الخدمة حاليًا 🖼️
                </p>
            `;

            return;
        }

        // جلب مصفوفة الصور
        const images = serviceSnap.data().images || [];

        // إذا كانت المصفوفة فارغة
        if (images.length === 0) {

            gallery.innerHTML = `
                <p class="no-images">
                    لا توجد صور لهذه الخدمة حاليًا 🖼️
                </p>
            `;

            return;
        }

        // عرض كل الصور
       // ##########################################################
// ########## عرض الصور مع زر الحذف ##########
// ##########################################################

images.forEach((image, index) => {

    gallery.innerHTML += `

        <div class="portfolio-card">

            <img
                src="${image}"
                alt="صورة من أعمال الخدمة"
            >



<div class="portfolio-card-info">

    <span>
        الصورة ${index + 1}
    </span>

    <div class="image-actions">

        <button
            class="move-up-btn"
            data-index="${index}"
            ${index === 0 ? "disabled" : ""}
        >
            ⬆️
        </button>

        <button
            class="move-down-btn"
            data-index="${index}"
            ${index === images.length - 1 ? "disabled" : ""}
        >
            ⬇️
        </button>

        <button
            class="delete-image-btn"
            data-index="${index}"
        >
            🗑️ حذف
        </button>

    </div>

</div>

        </div>

    `;

});
    } catch (error) {

        console.error(
            "حدث خطأ أثناء تحميل صور الخدمة:",
            error
        );

        gallery.innerHTML = `
            <p class="no-images">
                ❌ حدث خطأ أثناء تحميل الصور.
            </p>
        `;
    }
}
// ##########################################################
// ########## تحديث الصور عند تغيير الخدمة ##########
// ##########################################################

serviceType.addEventListener("change", () => {

    loadPortfolioImages();

});

// ##########################################################
// ########## حذف صورة من Firestore ##########
// ##########################################################

async function deletePortfolioImage(index) {

    const service = document.getElementById("serviceType").value;

    const serviceRef = doc(db, "services", service);

    try {

        const serviceSnap = await getDoc(serviceRef);

        if (!serviceSnap.exists()) {

            alert("لم يتم العثور على الخدمة.");

            return;
        }

        // ##########################################################
// ########## تفعيل أزرار الصور ##########
// ##########################################################



        const images = serviceSnap.data().images || [];

        // التأكد أن الصورة موجودة
        if (index < 0 || index >= images.length) {

            alert("الصورة غير موجودة.");

            return;
        }

        const confirmed = confirm(
            "هل أنتِ متأكدة من حذف هذه الصورة؟ 🗑️"
        );

        if (!confirmed) {

            return;
        }

        // حذف الصورة من المصفوفة
        images.splice(index, 1);

        // تحديث Firestore
        await updateDoc(serviceRef, {

            images: images

        });

        alert("تم حذف الصورة من الموقع ولوحة الإدارة ✅");

        // إعادة تحميل المعرض
        loadPortfolioImages();

    } catch (error) {

        console.error(
            "حدث خطأ أثناء حذف الصورة:",
            error
        );

        alert(
            "عذراً، حدث خطأ أثناء حذف الصورة."
        );

    }

}



// ##########################################################
// ########## التحكم في أزرار معرض الصور ##########
// ##########################################################

document.addEventListener("click", async (event) => {

    // البحث عن الزر نفسه حتى لو ضغطنا على محتواه
    const button = event.target.closest("button");

    if (!button) {
        return;
    }


    // ######################################################
    // ########## زر التحريك للأعلى
    // ######################################################

    if (button.classList.contains("move-up-btn")) {

        console.log("⬆️ تم الضغط على زر الأعلى");

        const index = Number(button.dataset.index);

        console.log("رقم الصورة:", index);

        await movePortfolioImage(index, -1);

        return;
    }


    // ######################################################
    // ########## زر التحريك للأسفل
    // ######################################################

    if (button.classList.contains("move-down-btn")) {

        console.log("⬇️ تم الضغط على زر الأسفل");

        const index = Number(button.dataset.index);

        console.log("رقم الصورة:", index);

        await movePortfolioImage(index, 1);

        return;
    }


    // ######################################################
    // ########## زر حذف الصورة
    // ######################################################

    if (button.classList.contains("delete-image-btn")) {

        console.log("🗑️ تم الضغط على حذف");

        const index = Number(button.dataset.index);

        await deletePortfolioImage(index);

        return;
    }

});

async function movePortfolioImage(index, direction) {

    const service = document.getElementById("serviceType").value;

    const serviceRef = doc(db, "services", service);

    try {

        const serviceSnap = await getDoc(serviceRef);

        if (!serviceSnap.exists()) {

            console.log("الخدمة غير موجودة");

            return;
        }

        const images = serviceSnap.data().images || [];

        const newIndex = index + direction;

        if (
            newIndex < 0 ||
            newIndex >= images.length
        ) {

            return;
        }

        // تبديل الصور
        const temp = images[index];

        images[index] = images[newIndex];

        images[newIndex] = temp;

        // حفظ الترتيب الجديد
        await updateDoc(serviceRef, {

            images: images

        });

        console.log("✅ تم تغيير ترتيب الصورة");

        // إعادة عرض المعرض
        await loadPortfolioImages();

    } catch (error) {

        console.error(
            "❌ خطأ أثناء تغيير ترتيب الصورة:",
            error
        );

        alert("حدث خطأ أثناء تغيير ترتيب الصورة.");

    }

}