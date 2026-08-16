// ####### استيراد مكتبات الفايربيس #######
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
 getFirestore, 
 collection,
  addDoc,
  getDocs,
  doc,
  getDoc

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
// ########## جلب صور الخدمة من Firestore ##########
// ##########################################################

async function getServiceImages(service){

    const serviceRef = doc(db,"services",service);

    const serviceSnap = await getDoc(serviceRef);

    if(serviceSnap.exists()){

        return serviceSnap.data().images || [];

    }

    return [];

}

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
   // ####### التعديل الأكيد ليتوافق الجافا سكريبت مع النص الظاهر في موقعكِ #######
else if (price === "باقات على حسب الخدمة") {
    priceDisplay.textContent = "باقات على حسب الخدمة";
    currencyLabel.style.display = "none"; 
    socialPricesImageWrapper.style.display = "block"; // إظهار الصورة فوراً
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

const menuToggle = document.getElementById("menuToggle");
const navLinks = document.querySelector(".nav-links");

menuToggle.addEventListener("click", () => {
    navLinks.classList.toggle("active");
});

window.addEventListener("scroll", () => {
    const navbar = document.querySelector(".navbar");

    if (window.scrollY > 50) {
        navbar.classList.add("scrolled");
    } else {
        navbar.classList.remove("scrolled");
    }
});

const modal = document.getElementById("serviceModal");
const closeModal = document.querySelector(".close-modal");

document.querySelectorAll(".service-btn").forEach(button => {

    button.addEventListener("click", async () => {

        const service = services[button.dataset.service];

        document.getElementById("modalTitle").textContent = service.title;
        document.getElementById("modalDescription").textContent = service.description;

        // ##########################################################
        // ########## جلب الصور من Firestore ##########
        // ##########################################################

        const firestoreImages = await getServiceImages(button.dataset.service);

        if(firestoreImages.length > 0){

            currentImages = firestoreImages;

        }else{

            // إذا ما فيه صور في Firestore استخدم الصور القديمة مؤقتًا
            currentImages = service.images;

        }

        currentIndex = 0;

        showImage(currentIndex);

        modal.classList.add("active");

    });

});

closeModal.addEventListener("click",()=>{

    modal.classList.remove("active");
clearInterval(sliderInterval);

});

window.addEventListener("click",(e)=>{

    if(e.target===modal){

        modal.classList.remove("active");
        clearInterval(sliderInterval);
    }

});

let currentImages = [];
let currentIndex = 0;
let sliderInterval;

const sliderImage = document.getElementById("sliderImage");
const sliderDots = document.getElementById("sliderDots");
function showImage(index){

    sliderImage.src = currentImages[index];

    sliderDots.innerHTML = "";

    currentImages.forEach((_, i)=>{

        const dot = document.createElement("span");

        if(i === index){
            dot.classList.add("active");
        }

        dot.addEventListener("click",()=>{

            currentIndex = i;

            showImage(currentIndex);

        });

        sliderDots.appendChild(dot);

    });

}

document.querySelector(".next").addEventListener("click", () => {

    currentIndex++;

    if (currentIndex >= currentImages.length) {
        currentIndex = 0;
    }

    showImage(currentIndex);

});

document.querySelector(".prev").addEventListener("click", () => {

    currentIndex--;

    if (currentIndex < 0) {
        currentIndex = currentImages.length - 1;
    }

    showImage(currentIndex);
    

});

function startSlider(){

    clearInterval(sliderInterval);

    sliderInterval = setInterval(()=>{

        currentIndex++;

        if(currentIndex >= currentImages.length){
            currentIndex = 0;
        }

        showImage(currentIndex);

    },5000);

}

// ##########################################################
// ########## بيانات الخدمات الأساسية ##########
// ########## العناوين والأوصاف فقط ##########
// ##########################################################

const services = {

    identity: {

        title: "🎨 الهوية البصرية",

        description:
            "نصمم هوية بصرية متكاملة تشمل الشعار والألوان والخطوط بما يعكس شخصية علامتك التجارية.",

        // الصور الآن تُقرأ من Firestore
        images: []

    },


    social: {

        title: "📱 إدارة حسابات التواصل",

        description:
            "إدارة احترافية لحسابات التواصل تشمل التخطيط للمحتوى والنشر والتفاعل مع الجمهور.",

        // الصور الآن تُقرأ من Firestore
        images: []

    },


    posts: {

        title: "🖼️ تصميم البوستات",

        description:
            "تصميم منشورات احترافية ومتوافقة مع هوية نشاطك لجميع المنصات.",

        // الصور الآن تُقرأ من Firestore
        images: []

    },


    other: {

        title: "✨ خدمات تصميم أخرى",

        description:
            "منيو، بزنس كارد، دعوات، قائمة أسعار، وغيرها.",

        // الصور الآن تُقرأ من Firestore
        images: []

    }

};