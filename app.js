import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js"; 
import { getAuth, signInWithEmailAndPassword, signOut, setPersistence, browserLocalPersistence } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js"; 
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, getDoc, setDoc, runTransaction, increment, query, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js"; 

const firebaseConfig = { 
    apiKey: "AIzaSyCiD4zPW-iNzSM6iMP8A4EmaxHInxB0Z9k", 
    authDomain: "defense-news-app-2143d.firebaseapp.com", 
    projectId: "defense-news-app-2143d", 
    storageBucket: "defense-news-app-2143d.appspot.com", 
    messagingSenderId: "55873751006", 
    appId: "1:55873751006:web:b7e9b971ae94a1f5d93f4f", 
    measurementId: "G-YYM4JLS1L2" 
}; 

const app = initializeApp(firebaseConfig); 
const auth = getAuth(app); 
const db = getFirestore(app); 

const DRIVE_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzExA_T2J2SpmD1fykUwV4ZK1oPuGSrpbsUMiLifVdROjL9Uocq3MBAtR3TnYjcFOkj/exec"; 

setPersistence(auth, browserLocalPersistence).catch((err) => { 
    console.error("Auth persistence error:", err); 
}); 

let currentRoomUser = localStorage.getItem('current_room_user') || null; 
let userRole = localStorage.getItem('current_user_role') || 'user'; 
let deviceSessionId = localStorage.getItem('device_session_id') || ('dev_' + Math.random().toString(36).substring(2)); 
localStorage.setItem('device_session_id', deviceSessionId); 

let allNews = []; 
let allCyberTasks = []; 
let allMemberReports = []; 
let notifications = []; 

// 🔑 ໂຫຼດ Notification ແຍກຕາມ User / Room
function loadUserNotifications() {
    const key = currentRoomUser ? `user_notifications_${currentRoomUser}` : 'user_notifications_guest';
    notifications = JSON.parse(localStorage.getItem(key) || '[]');
}

function saveUserNotifications() {
    const key = currentRoomUser ? `user_notifications_${currentRoomUser}` : 'user_notifications_guest';
    localStorage.setItem(key, JSON.stringify(notifications));
}

let currentShareData = { title: '', text: '', url: '' }; 
let chatUnsubscribe = null; 
let globalNewsUnsubscribe = null; 
let globalFeedbackUnsubscribe = null; 
let isInitialLoad = true; 
let isHeaderHidden = false; 
let currentSummaryPeriod = 'weekly'; 

// Snake Game Variables 
let snakeInterval = null; 
let snake = []; 
let frog = {}; 
let score = 0; 
let highScore = 0; 
let dx = 12; 
let dy = 0; 
let nextDx = 12; 
let nextDy = 0; 
const gridSize = 12; 
const canvasSize = 240; 

function loadUserHighScore() {
    const key = currentRoomUser ? `snake_highscore_${currentRoomUser}` : 'snake_highscore_guest';
    highScore = localStorage.getItem(key) || 0;
}

const subAdminPins = { 
    "SUB_ADMIN_1": "1234", 
    "SUB_ADMIN_2": "5678", 
    "SUB_ADMIN_3": "9999" 
}; 

window.addEventListener('DOMContentLoaded', () => { 
    loadUserNotifications();
    loadUserHighScore();
    checkDeviceRestriction(); 
    checkLocationRestriction(); 
    checkRoomAuthUI(); 
    loadFullScoreSummary(); 
    updateLiveClock(); 
    setInterval(updateLiveClock, 1000); 
     
    setInterval(verifySubAdminSession, 10000); 
    initRealtimeListeners(); 
    initTouchGoldGlowEffect(); 
    initAntiCopyProtection(); 
    initSnakeKeyboardControls(); 
    initFirefliesMovement(); 
     
    setTimeout(checkUrlHashForPost, 800); 
}); 

function checkUrlHashForPost() { 
    const hash = window.location.hash; 
    if (hash && hash.startsWith('#post-')) { 
        switchTab('news'); 
        setTimeout(() => { 
            const postElem = document.querySelector(hash); 
            if (postElem) { 
                postElem.scrollIntoView({ behavior: 'smooth', block: 'center' }); 
                postElem.classList.add('highlight-flash'); 
                setTimeout(() => postElem.classList.remove('highlight-flash'), 3000); 
            } 
        }, 400); 
    } 
} 

window.toggleHeaderVis = () => { 
    const header = document.getElementById('main-header'); 
    const icon = document.getElementById('floating-toggle-icon'); 
    const text = document.getElementById('floating-toggle-text'); 
     
    isHeaderHidden = !isHeaderHidden; 
    if (isHeaderHidden) { 
        header.classList.add('-translate-y-full', 'opacity-0'); 
        icon.innerText = '👁️'; 
        text.innerText = 'ເປີດ Header'; 
    } else { 
        header.classList.remove('-translate-y-full', 'opacity-0'); 
        icon.innerText = '🙈'; 
        text.innerText = 'ຊ່ອນ Header'; 
    } 
}; 

window.toggleSidebarMobile = () => { 
    const sidebar = document.getElementById('sidebar-container'); 
    sidebar.classList.toggle('hidden'); 
    if (!sidebar.classList.contains('hidden')) { 
        sidebar.classList.add('fixed', 'inset-0', 'z-50', 'bg-slate-900/95', 'p-6', 'overflow-y-auto'); 
    } else { 
        sidebar.classList.remove('fixed', 'inset-0', 'z-50', 'bg-slate-900/95', 'p-6', 'overflow-y-auto'); 
    } 
}; 

function initFirefliesMovement() { 
    const fireflies = document.querySelectorAll('.interactive-firefly'); 
    fireflies.forEach((ff, index) => { 
        let posX = Math.random() * window.innerWidth * 0.8; 
        let posY = Math.random() * window.innerHeight * 0.8; 
        let speedX = (Math.random() - 0.5) * 1.2; 
        let speedY = (Math.random() - 0.5) * 1.2; 

        ff.style.left = `${posX}px`; 
        ff.style.top = `${posY}px`; 

        setInterval(() => { 
            posX += speedX; 
            posY += speedY; 
            if (posX <= 0 || posX >= window.innerWidth - 30) speedX *= -1; 
            if (posY <= 0 || posY >= window.innerHeight - 30) speedY *= -1; 
            ff.style.left = `${posX}px`; 
            ff.style.top = `${posY}px`; 
        }, 60); 
    }); 

    window.addEventListener('pointermove', (e) => { 
        const mouseX = e.clientX; 
        const mouseY = e.clientY; 
        fireflies.forEach((ff, index) => { 
            const offsetX = (index + 1) * 8; 
            const offsetY = (index + 1) * 5; 
            ff.style.left = `${mouseX + offsetX - 20}px`; 
            ff.style.top = `${mouseY + offsetY - 20}px`; 
        }); 
    }); 
} 

function checkDeviceRestriction() { 
    const isDesktop = getDeviceType() === 'desktop'; 
    const isCurrentlyAdmin = userRole === 'admin'; 
    if (isDesktop && !isCurrentlyAdmin) { 
        document.getElementById('desktop-blocked-modal').classList.remove('hidden'); 
        document.getElementById('room-login-modal').classList.add('hidden'); 
    } 
} 

function checkLocationRestriction() { 
    if (userRole === 'admin') return; 
    if ("geolocation" in navigator) { 
        navigator.geolocation.getCurrentPosition((position) => { 
            const lat = position.coords.latitude; 
            const lon = position.coords.longitude; 
            const danangLat = 16.0544; 
            const danangLon = 108.2022; 
            const maxDistanceKm = 40;  
            const distance = getDistanceFromLatLonInKm(lat, lon, danangLat, danangLon); 
            if (distance > maxDistanceKm) { 
                document.getElementById('location-blocked-modal').classList.remove('hidden'); 
                document.getElementById('room-login-modal').classList.add('hidden'); 
            } 
        }, (error) => { console.warn("Geolocation error:", error); }, { timeout: 10000 }); 
    } 
} 

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) { 
    const R = 6371;  
    const dLat = deg2rad(lat2 - lat1); 
    const dLon = deg2rad(lon2 - lon1); 
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon/2) * Math.sin(dLon/2);  
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));  
} 

function deg2rad(deg) { return deg * (Math.PI/180); } 

window.openAdminLoginFromBlocked = () => { 
    document.getElementById('desktop-blocked-modal').classList.add('hidden'); 
    document.getElementById('location-blocked-modal').classList.add('hidden'); 
    document.getElementById('room-login-modal').classList.remove('hidden'); 
}; 

window.startSnakeGame = () => { 
    document.getElementById('snake-overlay').classList.add('hidden'); 
    snake = [{ x: 120, y: 120 }, { x: 108, y: 120 }, { x: 96, y: 120 }]; 
    score = 0; 
    document.getElementById('snake-score').innerText = score; 
    document.getElementById('snake-highscore').innerText = highScore; 
    dx = gridSize; dy = 0; nextDx = gridSize; nextDy = 0; 
    spawnFrog(); 
    if (snakeInterval) clearInterval(snakeInterval); 
    snakeInterval = setInterval(gameLoop, 150); 
}; 

function spawnFrog() { 
    const cols = canvasSize / gridSize; 
    frog = { x: Math.floor(Math.random() * cols) * gridSize, y: Math.floor(Math.random() * cols) * gridSize }; 
    snake.forEach(part => { if (part.x === frog.x && part.y === frog.y) spawnFrog(); }); 
} 

function gameLoop() { 
    dx = nextDx; dy = nextDy; 
    const head = { x: snake[0].x + dx, y: snake[0].y + dy }; 
    if (head.x < 0 || head.x >= canvasSize || head.y < 0 || head.y >= canvasSize) { gameOver(); return; } 
    for (let i = 0; i < snake.length; i++) { 
        if (head.x === snake[i].x && head.y === snake[i].y) { gameOver(); return; } 
    } 
    snake.unshift(head); 
    if (head.x === frog.x && head.y === frog.y) { 
        score += 10; 
        document.getElementById('snake-score').innerText = score; 
        if (score > highScore) { 
            highScore = score; 
            const key = currentRoomUser ? `snake_highscore_${currentRoomUser}` : 'snake_highscore_guest';
            localStorage.setItem(key, highScore); 
            document.getElementById('snake-highscore').innerText = highScore; 
        } 
        spawnFrog(); 
    } else { snake.pop(); } 
    drawSnakeGame(); 
} 

function drawSnakeGame() { 
    const canvas = document.getElementById('snakeCanvas'); 
    if (!canvas) return; 
    const ctx = canvas.getContext('2d'); 
    ctx.fillStyle = '#020617'; ctx.fillRect(0, 0, canvasSize, canvasSize); 
    ctx.font = '14px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; 
    ctx.fillText('🐸', frog.x + gridSize / 2, frog.y + gridSize / 2); 
    snake.forEach((part, index) => { 
        ctx.fillStyle = index === 0 ? '#10b981' : '#059669'; 
        ctx.beginPath(); ctx.roundRect(part.x + 1, part.y + 1, gridSize - 2, gridSize - 2, 3); ctx.fill(); 
    }); 
} 

function gameOver() { 
    clearInterval(snakeInterval); snakeInterval = null; 
    const overlay = document.getElementById('snake-overlay'); 
    document.getElementById('snake-overlay-title').innerText = '💀 ເກມຈົບແນວ (Game Over)'; 
    document.getElementById('snake-overlay-desc').innerHTML = `ຄະແນນຂອງທ່ານ: <strong class="text-amber-400 text-sm">${score}</strong><br>ກົດປຸ່ມລຸ່ມນີ້ເພື່ອເລີ່ມຫຼິ້ນໃໝ່!`; 
    overlay.classList.remove('hidden'); 
} 

window.changeSnakeDir = (dir) => { 
    if (dir === 'UP' && dy === 0) { nextDx = 0; nextDy = -gridSize; } 
    if (dir === 'DOWN' && dy === 0) { nextDx = 0; nextDy = gridSize; } 
    if (dir === 'LEFT' && dx === 0) { nextDx = -gridSize; nextDy = 0; } 
    if (dir === 'RIGHT' && dx === 0) { nextDx = gridSize; nextDy = 0; } 
}; 

function initSnakeKeyboardControls() { 
    window.addEventListener('keydown', (e) => { 
        if (['ArrowUp', 'KeyW'].includes(e.code)) { window.changeSnakeDir('UP'); e.preventDefault(); } 
        if (['ArrowDown', 'KeyS'].includes(e.code)) { window.changeSnakeDir('DOWN'); e.preventDefault(); } 
        if (['ArrowLeft', 'KeyA'].includes(e.code)) { window.changeSnakeDir('LEFT'); e.preventDefault(); } 
        if (['ArrowRight', 'KeyD'].includes(e.code)) { window.changeSnakeDir('RIGHT'); e.preventDefault(); } 
    }); 
} 

window.openGuideModal = () => { 
    const userSec = document.getElementById('guide-section-user'); 
    const adminSec = document.getElementById('guide-section-admin'); 
    const superSec = document.getElementById('guide-section-super'); 
    userSec.classList.add('hidden'); adminSec.classList.add('hidden'); superSec.classList.add('hidden'); 
    if (isSuperAdmin()) { userSec.classList.remove('hidden'); adminSec.classList.remove('hidden'); superSec.classList.remove('hidden'); } 
    else if (userRole === 'admin') { userSec.classList.remove('hidden'); adminSec.classList.remove('hidden'); } 
    else { userSec.classList.remove('hidden'); } 
    document.getElementById('guide-modal').classList.remove('hidden'); 
}; 

window.closeGuideModal = () => document.getElementById('guide-modal').classList.add('hidden'); 

function initAntiCopyProtection() { 
    document.addEventListener('contextmenu', (e) => e.preventDefault()); 
    document.addEventListener('copy', (e) => { e.preventDefault(); alert('⚠️ ຂໍອະໄພ, ລະບົບປ້ອງກັນການຄັດລອກຂໍ້ຄວາມ!'); }); 
} 

function initTouchGoldGlowEffect() { 
    window.addEventListener('pointerdown', (e) => { 
        const glow = document.createElement('div'); 
        glow.className = 'touch-gold-glow'; 
        glow.style.left = `${e.clientX}px`; glow.style.top = `${e.clientY}px`; 
        document.body.appendChild(glow); 
        setTimeout(() => glow.remove(), 600); 
    }); 
} 

function playLoudAlertSound() { 
    try { 
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)(); 
        for (let i = 0; i < 3; i++) { 
            setTimeout(() => { 
                if (audioCtx.state === 'suspended') audioCtx.resume(); 
                const osc = audioCtx.createOscillator(); 
                const gain = audioCtx.createGain(); 
                osc.type = 'sine'; osc.frequency.setValueAtTime(880, audioCtx.currentTime); 
                gain.gain.setValueAtTime(1.0, audioCtx.currentTime); 
                gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3); 
                osc.connect(gain); gain.connect(audioCtx.destination); 
                osc.start(); osc.stop(audioCtx.currentTime + 0.3); 
            }, i * 350); 
        } 
    } catch (e) { console.error(e); } 
} 

function addNotification(title, message, linkId = null) { 
    const newNotif = { 
        id: Date.now(), title, message, linkId, 
        time: new Date().toLocaleTimeString('lo-LA', { hour: '2-digit', minute: '2-digit' }), 
        read: false 
    }; 
    notifications.unshift(newNotif); 
    if (notifications.length > 20) notifications.pop(); 
    saveUserNotifications(); 
    updateNotificationUI(); 
    playLoudAlertSound(); 
} 

function updateNotificationUI() { 
    const badge = document.getElementById('notification-badge'); 
    const bellIcon = document.getElementById('bell-icon'); 
    const list = document.getElementById('notification-list'); 
    const unreadCount = notifications.filter(n => !n.read).length; 

    if (unreadCount > 0) { badge.innerText = unreadCount; badge.classList.remove('hidden'); bellIcon.classList.add('animate-bell'); } 
    else { badge.classList.add('hidden'); bellIcon.classList.remove('animate-bell'); } 

    if (notifications.length === 0) { list.innerHTML = `<div class="p-4 text-center text-slate-500">ຍັງບໍ່ມີການແຈ້ງເຕືອນ</div>`; return; } 

    list.innerHTML = notifications.map(n => ` 
        <div onclick="clickNotificationItem(${n.linkId ? `'${n.linkId}'` : 'null'})" class="p-3 hover:bg-slate-800 transition cursor-pointer ${n.read ? 'opacity-70' : 'bg-slate-800/60 font-semibold'}"> 
            <div class="flex justify-between items-center text-amber-400 mb-0.5"> 
                <span>${n.title}</span> 
                <span class="text-[10px] text-slate-400">${n.time}</span> 
            </div> 
            <p class="text-slate-200 text-[11px] truncate">${n.message}</p> 
        </div> 
    `).join(''); 
} 

window.clickNotificationItem = (postId) => { 
    document.getElementById('notification-dropdown').classList.add('hidden'); 
    if (postId) { 
        switchTab('news'); 
        setTimeout(() => { 
            const postElem = document.getElementById(`post-${postId}`); 
            if (postElem) { 
                postElem.scrollIntoView({ behavior: 'smooth', block: 'center' }); 
                postElem.classList.add('highlight-flash'); 
                setTimeout(() => postElem.classList.remove('highlight-flash'), 2000); 
            } 
        }, 200); 
    } 
}; 

window.toggleNotificationDropdown = () => { 
    const dropdown = document.getElementById('notification-dropdown'); 
    dropdown.classList.toggle('hidden'); 
    if (!dropdown.classList.contains('hidden')) { 
        notifications.forEach(n => n.read = true); 
        saveUserNotifications(); 
        updateNotificationUI(); 
    } 
}; 

window.clearNotifications = () => { 
    notifications = []; 
    saveUserNotifications(); 
    updateNotificationUI(); 
}; 

function initRealtimeListeners() { 
    const newsQuery = query(collection(db, "news"), orderBy("date", "desc")); 
    globalNewsUnsubscribe = onSnapshot(newsQuery, (snapshot) => { 
        allNews = []; 
        snapshot.forEach(docSnap => allNews.push({ id: docSnap.id, ...docSnap.data() })); 
        document.getElementById('stat-total-news').innerText = allNews.length; 
        renderNews(allNews); 

        if (!isInitialLoad) { 
            snapshot.docChanges().forEach((change) => { 
                if (change.type === "added") { 
                    const newPostData = change.doc.data(); 
                    addNotification("📢 ແຈ້ງການ/ຂ່າວສານໃໝ່!", newPostData.title, change.doc.id); 
                } 
            }); 
        } 
    }); 

    const reportsQuery = query(collection(db, "member_reports"), orderBy("date", "desc")); 
    onSnapshot(reportsQuery, (snapshot) => { 
        if (!isInitialLoad) { 
            snapshot.docChanges().forEach((change) => { 
                const data = change.doc.data(); 
                if (currentRoomUser && data.room === currentRoomUser) { 
                    if (data.approved && change.type === "modified") { 
                        addNotification("🎉 ບົດລາຍງານຖືກອະນຸມັດແລ້ວ!", `ຫ້ອງຂອງທ່ານ (${data.room}) ໄດ້ຮັບການອະນຸມັດແລ້ວ!`); 
                        loadFullScoreSummary(); loadFullScoreboard(); 
                    } else if (data.specialPoints !== undefined && change.type === "added") { 
                        const pts = data.specialPoints; 
                        const signText = pts > 0 ? `+${pts}` : `${pts}`; 
                        addNotification("⭐ ມີການປັບຄະແນນພິເສດ!", `ຫ້ອງຂອງທ່ານ (${data.room}) ຖືກປັບຄະແນນ ${signText} ຈາກຜູ້ສ້າງເວັບໄຊ!`); 
                        loadFullScoreSummary(); loadFullScoreboard(); 
                    } 
                } 
            }); 
        } 
    }); 

    const chatQuery = query(collection(db, "admin_chats"), orderBy("timestamp", "desc")); 
    globalFeedbackUnsubscribe = onSnapshot(chatQuery, (snapshot) => { 
        if (!isInitialLoad) { 
            snapshot.docChanges().forEach((change) => { 
                if (change.type === "added") { 
                    const msgData = change.doc.data(); 
                    if (userRole === 'admin' && msgData.sender !== currentRoomUser) { 
                        addNotification("💬 ຂໍ້ຄວາມກຸ່ມ / ແຈ້ງເຕືອນໃໝ່", `${msgData.sender}: ${msgData.text}`); 
                    } 
                } 
            }); 
        } 
        isInitialLoad = false; 
    }, () => { isInitialLoad = false; }); 
} 

async function verifySubAdminSession() { 
    if (userRole === 'admin' && currentRoomUser && currentRoomUser.startsWith('Admin ຮອງ')) { 
        try { 
            const adminKey = currentRoomUser.includes('1') ? 'SUB_ADMIN_1' : currentRoomUser.includes('2') ? 'SUB_ADMIN_2' : 'SUB_ADMIN_3'; 
            const docRef = doc(db, "admin_sessions", adminKey); 
            const docSnap = await getDoc(docRef); 
            if (docSnap.exists()) { 
                const data = docSnap.data(); 
                if (adminKey === 'SUB_ADMIN_1') { 
                    let devices = data.devices || []; 
                    if (!devices.includes(deviceSessionId)) { 
                        alert('⚠️ ບັນຊີ Admin ຮອງ 1 ນີ້ ຖືກລັອກອິນເຕັມຈຳກັດ 2 ເຄື່ອງແລ້ວ!'); 
                        await logoutSession(); 
                    } 
                } else { 
                    if (data.deviceId !== deviceSessionId) { 
                        alert('⚠️ ບັນຊີນີ້ຖືກລັອກອິນຈາກເຄື່ອງມືຖືເຄື່ອງອື່ນແລ້ວ!'); 
                        await logoutSession(); 
                    } 
                } 
            } 
        } catch (e) { console.error(e); } 
    } 
} 

function isSuperAdmin() { 
    return currentRoomUser && currentRoomUser.includes('ຜູ້ສ້າງ:'); 
} 

function updateLiveClock() { 
    const clockElement = document.getElementById('live-clock'); 
    if (!clockElement) return; 
    const now = new Date(); 
    clockElement.innerText = now.toLocaleDateString('lo-LA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }); 
} 

window.handleLoginTypeChange = (val) => { 
    const adminFields = document.getElementById('admin-auth-fields'); 
    const subAdminFields = document.getElementById('sub-admin-fields'); 
    const hintElem = document.getElementById('sub-admin-hint'); 
    adminFields.classList.add('hidden'); subAdminFields.classList.add('hidden'); 

    if (val === 'SUPER_ADMIN') { 
        adminFields.classList.remove('hidden'); 
    } else if (val.startsWith('SUB_ADMIN')) { 
        subAdminFields.classList.remove('hidden'); 
        hintElem.innerText = (val === 'SUB_ADMIN_1') ? '* ໄອດີນີ້ ສາມາດລັອກອິນໄດ້ສູງສຸດ 2 ເຄື່ອງພ້ອມກັນ' : '* 1 ໄອດີ ສາມາດລັອກອິນໄດ້ພຽງ 1 ເຄື່ອງເທົ່ານັ້ນ'; 
    } 
}; 

function checkRoomAuthUI() { 
    loadUserNotifications();
    loadUserHighScore();
    const authNav = document.getElementById('auth-nav'); 
    const adminBox = document.getElementById('admin-panel-box'); 
    const roomModal = document.getElementById('room-login-modal'); 
    const roomDisplay = document.getElementById('member-room-display'); 
    const feedbackRoomDisplay = document.getElementById('feedback-room-display'); 
    const adminChatLi = document.getElementById('tab-admin-chat-li'); 
    const superAdminSpecialPoints = document.getElementById('super-admin-special-points'); 

    if (currentRoomUser) { 
        roomModal.classList.add('hidden'); 
        if (roomDisplay) roomDisplay.value = currentRoomUser; 
        if (feedbackRoomDisplay) feedbackRoomDisplay.value = currentRoomUser; 

        authNav.innerHTML = ` 
            <div class="text-right"> 
                <span class="text-xs block text-emerald-400 font-bold">🏠 ${currentRoomUser}</span> 
                <span class="text-[10px] bg-slate-700 px-2 py-0.5 rounded text-slate-300 uppercase">${userRole}</span> 
            </div> 
            <button onclick="logoutSession()" class="bg-red-600/80 hover:bg-red-600 text-white text-xs px-3 py-1.5 rounded-lg transition shadow">ອອກຈາກລະບົບ</button> 
        `; 

        if (userRole === 'admin') { 
            adminBox.classList.remove('hidden'); 
            if (adminChatLi) adminChatLi.classList.remove('hidden'); 
            if (isSuperAdmin()) { if(superAdminSpecialPoints) superAdminSpecialPoints.classList.remove('hidden'); } 
            else { if(superAdminSpecialPoints) superAdminSpecialPoints.classList.add('hidden'); } 
            listenAdminChat(); 
        } else { 
            adminBox.classList.add('hidden'); 
            if (adminChatLi) adminChatLi.classList.add('hidden'); 
            if(superAdminSpecialPoints) superAdminSpecialPoints.classList.add('hidden'); 
            if (chatUnsubscribe) { chatUnsubscribe(); chatUnsubscribe = null; } 
        } 
    } else { 
        if (!(getDeviceType() === 'desktop' && userRole !== 'admin')) { roomModal.classList.remove('hidden'); } 
        authNav.innerHTML = `<span class="text-xs text-amber-400 font-semibold">⚠️ ກະລຸນາເລືອກຫ້ອງກ່ອນ</span>`; 
        adminBox.classList.add('hidden'); 
        if (adminChatLi) adminChatLi.classList.add('hidden'); 
        if(superAdminSpecialPoints) superAdminSpecialPoints.classList.add('hidden'); 
        if (chatUnsubscribe) { chatUnsubscribe(); chatUnsubscribe = null; } 
    } 

    loadNews(); loadCyberTasks(); loadMemberReports(); loadFullScoreSummary(); loadUserFeedbacks(); updateNotificationUI(); 
} 

window.confirmRoomLogin = async () => { 
    const select = document.getElementById('login-room-select'); 
    const val = select.value; 
    if (!val) { alert('ກະລຸນາເລືອກຫ້ອງພັກ ຫຼື ໂໝດ Admin!'); return; } 

    if (val === 'SUPER_ADMIN') { 
        const email = document.getElementById('admin-email-input').value; 
        const password = document.getElementById('admin-password-input').value; 
        if (!email || !password) { alert('ກະລຸນາປ້ອນອີເມວ ແລະ ລະຫັດຜ່ານຜູ້ສ້າງ!'); return; } 
        try { 
            const userCredential = await signInWithEmailAndPassword(auth, email, password); 
            currentRoomUser = `ຜູ້ສ້າງ: ${userCredential.user.email}`; 
            userRole = 'admin'; 
            localStorage.setItem('current_room_user', currentRoomUser); 
            localStorage.setItem('current_user_role', userRole); 
            document.getElementById('desktop-blocked-modal').classList.add('hidden'); 
            document.getElementById('location-blocked-modal').classList.add('hidden'); 
            checkRoomAuthUI(); 
        } catch (err) { alert('ລັອກອິນຜູ້ສ້າງບໍ່ສຳເລັດ: ' + err.message); } 
    } else if (val.startsWith('SUB_ADMIN')) { 
        const pinInput = document.getElementById('sub-admin-pin').value; 
        if (pinInput !== subAdminPins[val]) { alert('❌ ລະຫັດຜ່ານ PIN ບໍ່ຖືກຕ້ອງ!'); return; } 
        const adminName = val === 'SUB_ADMIN_1' ? 'Admin ຮອງ 1' : val === 'SUB_ADMIN_2' ? 'Admin ຮອງ 2' : 'Admin ຮອງ 3'; 
        try { 
            const docRef = doc(db, "admin_sessions", val); 
            const docSnap = await getDoc(docRef); 
            if (val === 'SUB_ADMIN_1') { 
                let devices = docSnap.exists() ? (docSnap.data().devices || []) : []; 
                if (!devices.includes(deviceSessionId)) { 
                    if (devices.length >= 2) { alert(`⚠️ "${adminName}" ນີ້ ມີການລັອກອິນເຕັມຈຳກັດ 2 ເຄື່ອງແລ້ວ.`); return; } 
                    devices.push(deviceSessionId); 
                } 
                await setDoc(docRef, { devices: devices, timestamp: new Date() }, { merge: true }); 
            } else { 
                if (docSnap.exists()) { 
                    const data = docSnap.data(); 
                    if (data.deviceId !== deviceSessionId && (Date.now() - (data.timestamp ? data.timestamp.toMillis() : 0) < 7200000)) { 
                        alert(`⚠️ "${adminName}" ນີ້ ກຳລັງຖືກເປີດໃຊ້ງານຢູ່ເທິງມືຖືເຄື່ອງອື່ນແລ້ວ!`); 
                        return; 
                    } 
                } 
                await setDoc(docRef, { deviceId: deviceSessionId, timestamp: new Date() }); 
            } 
            currentRoomUser = adminName; 
            userRole = 'admin'; 
            localStorage.setItem('current_room_user', currentRoomUser); 
            localStorage.setItem('current_user_role', userRole); 
            document.getElementById('desktop-blocked-modal').classList.add('hidden'); 
            document.getElementById('location-blocked-modal').classList.add('hidden'); 
            checkRoomAuthUI(); 
            alert(`🎉 ເຂົ້າສູ່ລະບົບ ${adminName} ສຳເລັດ!`); 
        } catch (err) { alert('ຜິດພາດ: ' + err.message); } 
    } else { 
        if (getDeviceType() === 'desktop') { alert('⚠️ ຫ້າມ User ເຂົ້າຜ່ານຄອມພິວເຕີ.'); return; } 
        currentRoomUser = val; 
        userRole = 'user'; 
        localStorage.setItem('current_room_user', currentRoomUser); 
        localStorage.setItem('current_user_role', userRole); 
        checkRoomAuthUI(); 
    } 
}; 

window.logoutSession = async () => { 
    try { 
        if (userRole === 'admin' && currentRoomUser.includes('ຜູ້ສ້າງ')) await signOut(auth); 
        else if (userRole === 'admin' && currentRoomUser.includes('Admin ຮອງ 1')) { 
            const docRef = doc(db, "admin_sessions", "SUB_ADMIN_1"); 
            const docSnap = await getDoc(docRef); 
            if (docSnap.exists()) { 
                let devices = (docSnap.data().devices || []).filter(id => id !== deviceSessionId); 
                await updateDoc(docRef, { devices: devices }); 
            } 
        } 
    } catch (e) { console.error(e); } 
    localStorage.removeItem('current_room_user'); 
    localStorage.removeItem('current_user_role'); 
    currentRoomUser = null; 
    userRole = 'user'; 
    document.getElementById('login-room-select').value = ""; 
    checkRoomAuthUI(); checkDeviceRestriction(); checkLocationRestriction(); 
}; 

window.submitSpecialPoint = async () => { 
    if (!isSuperAdmin()) { alert('⚠️ ສະເພາະຜູ້ສ້າງເວັບໄຊເທົ່ານັ້ນທີ່ມີສິດປັບຄະແນນພິເສດ!'); return; } 
    const room = document.getElementById('special-room-select').value; 
    const pointInput = document.getElementById('special-point-value').value; 
    if (!room) { alert('ກະລຸນາເລືອກຫ້ອງພັກ!'); return; } 
    const points = parseInt(pointInput); 
    if (isNaN(points) || points === 0) { alert('ກະລຸນາໃສ່ຈຳນວນຄະແນນທີ່ຖືກຕ້ອງ (ເຊັ່ນ: 3, 5 ຫຼື -1)'); return; } 

    try { 
        const dateStr = new Date().toLocaleString('lo-LA'); 
        const reasonText = points > 0 ? `➕ ຮັບຄະແນນພິເສດ (+${points} ຄະແນນ) ຈາກຜູ້ສ້າງເວັບໄຊ` : `➖ ຖືກຫັກຄະແນນ (${points} ຄະແນນ) ຈາກຜູ້ສ້າງເວັບໄຊ`; 
        await addDoc(collection(db, "member_reports"), { 
            room: room, name: "ຜູ້ສ້າງເວັບໄຊ (Super Admin)", description: reasonText, mediaItems: [], date: dateStr, weekTag: "special_adjustment_" + Date.now(), approved: true, specialPoints: points, createdAt: new Date() 
        }); 
        alert(`🎉 ບັນທຶກການປັບຄະແນນໃຫ້ [${room}] ສຳເລັດແລ້ວ!`); 
        document.getElementById('special-point-value').value = ''; 
        loadMemberReports(); loadFullScoreSummary(); loadFullScoreboard(); 
    } catch (err) { alert('ຜິດພາດ: ' + err.message); } 
}; 

window.switchTab = (tab) => { 
    const newsSec = document.getElementById('section-news'); 
    const scoreSummarySec = document.getElementById('section-score-summary'); 
    const scoreboardSec = document.getElementById('section-scoreboard'); 
    const cyberSec = document.getElementById('section-cyber'); 
    const memberSec = document.getElementById('section-member'); 
    const snakeGameSec = document.getElementById('section-snake-game'); 
    const feedbackSec = document.getElementById('section-user-feedback'); 
    const adminChatSec = document.getElementById('section-admin-chat'); 
    const fireflyLayer = document.getElementById('firefly-layer'); 
     
    newsSec.classList.add('hidden'); scoreSummarySec.classList.add('hidden'); scoreboardSec.classList.add('hidden'); cyberSec.classList.add('hidden'); memberSec.classList.add('hidden'); snakeGameSec.classList.add('hidden'); feedbackSec.classList.add('hidden'); if(adminChatSec) adminChatSec.classList.add('hidden'); 

    if (tab === 'snake-game') { if (fireflyLayer) fireflyLayer.classList.add('hidden'); } 
    else { if (fireflyLayer) fireflyLayer.classList.remove('hidden'); } 

    if (tab === 'news') { newsSec.classList.remove('hidden'); document.getElementById('news-categories-box').classList.remove('hidden'); } 
    else if (tab === 'score-summary') { scoreSummarySec.classList.remove('hidden'); document.getElementById('news-categories-box').classList.add('hidden'); loadFullScoreSummary(); } 
    else if (tab === 'scoreboard') { scoreboardSec.classList.remove('hidden'); document.getElementById('news-categories-box').classList.add('hidden'); loadFullScoreboard(); } 
    else if (tab === 'cyber') { cyberSec.classList.remove('hidden'); document.getElementById('news-categories-box').classList.add('hidden'); loadCyberTasks(); } 
    else if (tab === 'member') { memberSec.classList.remove('hidden'); document.getElementById('news-categories-box').classList.add('hidden'); loadMemberReports(); } 
    else if (tab === 'snake-game') { snakeGameSec.classList.remove('hidden'); document.getElementById('news-categories-box').classList.add('hidden'); } 
    else if (tab === 'user-feedback') { feedbackSec.classList.remove('hidden'); document.getElementById('news-categories-box').classList.add('hidden'); loadUserFeedbacks(); } 
    else if (tab === 'admin-chat') { 
        if (userRole !== 'admin') { alert('⚠️ ສຳລັບ Admin ເທົ່ານັ້ນ!'); return; } 
        adminChatSec.classList.remove('hidden'); document.getElementById('news-categories-box').classList.add('hidden'); 
    } 

    const sidebar = document.getElementById('sidebar-container'); 
    if (window.innerWidth < 1024 && !sidebar.classList.contains('hidden')) { 
        toggleSidebarMobile(); 
    } 
}; 

window.switchSummaryPeriod = (period) => { 
    currentSummaryPeriod = period; 
    const btnW = document.getElementById('btn-period-weekly'); 
    const btnM = document.getElementById('btn-period-monthly'); 
    const btnY = document.getElementById('btn-period-yearly'); 
     
    btnW.className = "px-3.5 py-2 rounded-lg transition text-slate-300 hover:text-white"; 
    btnM.className = "px-3.5 py-2 rounded-lg transition text-slate-300 hover:text-white"; 
    btnY.className = "px-3.5 py-2 rounded-lg transition text-slate-300 hover:text-white"; 

    if (period === 'weekly') { 
        btnW.className = "px-3.5 py-2 rounded-lg transition bg-amber-500 text-slate-950 font-bold shadow"; 
    } else if (period === 'monthly') { 
        btnM.className = "px-3.5 py-2 rounded-lg transition bg-amber-500 text-slate-950 font-bold shadow"; 
    } else if (period === 'yearly') { 
        btnY.className = "px-3.5 py-2 rounded-lg transition bg-amber-500 text-slate-950 font-bold shadow"; 
    } 

    loadFullScoreSummary(); 
}; 

window.submitUserFeedback = async () => { 
    if (!currentRoomUser || currentRoomUser.includes('Admin') || currentRoomUser.includes('ຜູ້ສ້າງ')) { 
        alert('ກະລຸນາລັອກອິນດ້ວຍໄອດີຫ້ອງພັກກ່ອນສົ່ງຄຳຄິດຄຳເຫັນ!'); 
        document.getElementById('room-login-modal').classList.remove('hidden'); return; 
    } 
    const commentText = document.getElementById('feedback-text-input').value.trim(); 
    if (!commentText) { alert('ກະລຸນາປ້ອນຂໍ້ຄວາມຄຳຄິດຄຳເຫັນ!'); return; } 

    try { 
        await addDoc(collection(db, "user_feedbacks"), { room: currentRoomUser, comment: commentText, date: new Date().toLocaleString('lo-LA'), timestamp: new Date() }); 
        await addDoc(collection(db, "admin_chats"), { sender: `💬 ຄວາມຄິດຄຳເຫັນຈາກ [${currentRoomUser}]`, text: commentText, time: new Date().toLocaleTimeString('lo-LA', { hour: '2-digit', minute: '2-digit' }), timestamp: new Date() }); 
        alert('🎉 ສົ່ງຄຳຄິດຄຳເຫັນສຳເລັດ!'); 
        document.getElementById('feedback-text-input').value = ''; 
        loadUserFeedbacks(); 
    } catch (err) { alert('ຜິດພາດ: ' + err.message); } 
}; 

async function loadUserFeedbacks() { 
    const container = document.getElementById('user-feedback-history'); 
    if (!container) return; 
    try { 
        const snapshot = await getDocs(query(collection(db, "user_feedbacks"), orderBy("timestamp", "desc"))); 
        if (snapshot.empty) { container.innerHTML = `<div class="text-center py-6 text-slate-500">ຍັງບໍ່ມີປະຫວັດຄຳຄິດຄຳເຫັນ.</div>`; return; } 
        let html = ''; 
        snapshot.forEach(docSnap => { 
            const fb = docSnap.data(); 
            // 🔒 ແຍກສະແດງປະຫວັດຄຳຄິດຄຳເຫັນສະເພາະຫ້ອງໃຜຫ້ອງມັນ (ຫຼື Admin)
            if (fb.room === currentRoomUser || userRole === 'admin') { 
                html += ` 
                    <div class="bg-slate-900/60 p-4 rounded-xl border border-pink-500/30 space-y-2 animate-fade-in"> 
                        <div class="flex justify-between items-center text-xs text-slate-400 border-b border-slate-800 pb-1.5"> 
                            <span class="font-bold text-pink-400">🏠 ${fb.room}</span> 
                            <span>${fb.date || ''}</span> 
                        </div> 
                        <p class="text-sm text-slate-200 whitespace-pre-line">${fb.comment}</p> 
                    </div> 
                `; 
            } 
        }); 
        container.innerHTML = html || `<div class="text-center py-6 text-slate-500">ຍັງບໍ່ມີປະຫວັດສຳລັບຫ້ອງຂອງທ່ານ.</div>`; 
    } catch (err) { container.innerHTML = `<div class="text-center py-6 text-red-400">ຜິດພາດ: ${err.message}</div>`; } 
} 

function listenAdminChat() { 
    if (chatUnsubscribe) chatUnsubscribe(); 
    chatUnsubscribe = onSnapshot(query(collection(db, "admin_chats"), orderBy("timestamp", "asc")), (snapshot) => { 
        const container = document.getElementById('admin-chat-messages'); 
        if (!container) return; 
        if (snapshot.empty) { container.innerHTML = `<div class="text-center py-12 text-slate-500">ຍັງບໍ່ມີຂໍ້ຄວາມສົນທະນາ.</div>`; return; } 
        let html = ''; 
        snapshot.forEach((docSnap) => { 
            const msg = docSnap.data(); 
            const isMe = msg.sender === currentRoomUser; 
            const isFeedback = msg.sender.includes('ຄວາມຄິດຄຳເຫັນ'); 
            html += ` 
                <div class="flex flex-col ${isMe ? 'items-end' : 'items-start'} animate-fade-in"> 
                    <span class="text-[10px] text-slate-400 mb-1 px-1">${msg.sender} (${msg.time || ''})</span> 
                    <div class="max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${isFeedback ? 'bg-pink-950/80 text-pink-200 border border-pink-500/60 rounded-bl-none shadow-lg' : isMe ? 'bg-sky-600 text-white rounded-br-none shadow-lg' : 'bg-slate-700 text-slate-100 rounded-bl-none border border-slate-600'}"> 
                        ${msg.text} 
                    </div> 
                </div> 
            `; 
        }); 
        container.innerHTML = html; container.scrollTop = container.scrollHeight; 
    }); 
} 

window.sendAdminMessage = async () => { 
    const input = document.getElementById('admin-chat-input'); 
    const text = input.value.trim(); 
    if (!text || userRole !== 'admin') return; 
    try { 
        input.value = ''; 
        await addDoc(collection(db, "admin_chats"), { sender: currentRoomUser, text: text, time: new Date().toLocaleTimeString('lo-LA', { hour: '2-digit', minute: '2-digit' }), timestamp: new Date() }); 
    } catch (err) { alert('ຜິດພາດ: ' + err.message); } 
}; 

async function loadFullScoreSummary() { 
    const container = document.getElementById('summary-bars-container'); 
    if (!container) return; 
     
    const topRoomLabel = document.getElementById('summary-top-room-label'); 
    const totalPtsLabel = document.getElementById('summary-total-points-label'); 
    const appCountLabel = document.getElementById('summary-approved-count-label'); 
    const chartTitle = document.getElementById('summary-chart-title'); 

    const now = new Date(); 
    const currentWeekStr = getWeekNumber(now); 
    const currentMonthNum = now.getMonth(); 
    const currentYearNum = now.getFullYear(); 

    if (currentSummaryPeriod === 'weekly') { 
        topRoomLabel.innerText = "ຫ້ອງອັນດັບ 1 (ອາທິດນີ້)"; 
        totalPtsLabel.innerText = "ຄະແນນລວມ (ອາທິດນີ້)"; 
        appCountLabel.innerText = "ບົດລາຍງານທີ່ອະນຸມັດ (ອາທິດນີ້)"; 
        chartTitle.innerHTML = `<span>📈</span> <span>ກຣາຟສະຫຼຸບຄະແນນປະຈຳອາທິດ (${currentWeekStr})</span>`; 
    } else if (currentSummaryPeriod === 'monthly') { 
        topRoomLabel.innerText = "ຫ້ອງອັນດັບ 1 (ເດືອນນີ້)"; 
        totalPtsLabel.innerText = "ຄະແນນລວມ (ເດືອນນີ້)"; 
        appCountLabel.innerText = "ບົດລາຍງານທີ່ອະນຸມັດ (ເດືອນນີ້)"; 
        chartTitle.innerHTML = `<span>📈</span> <span>ກຣາຟສະຫຼຸບຄະແນນປະຈຳເດືອນ (${currentMonthNum + 1}/${currentYearNum})</span>`; 
    } else if (currentSummaryPeriod === 'yearly') { 
        topRoomLabel.innerText = "ຫ້ອງອັນດັບ 1 (ປີນີ້)"; 
        totalPtsLabel.innerText = "ຄະແນນລວມ (ປີນີ້)"; 
        appCountLabel.innerText = "ບົດລາຍງານທີ່ອະນຸມັດ (ປີນີ້)"; 
        chartTitle.innerHTML = `<span>📈</span> <span>ກຣາຟສະຫຼຸບຄະແນນປະຈຳປີ (${currentYearNum})</span>`; 
    } 

    try { 
        const querySnapshot = await getDocs(collection(db, "member_reports")); 
        let scores = {}; let totalPts = 0; let approvedReportsCount = 0; 
        const rooms = ["ຫ້ອງ 104", "ຫ້ອງ 105", "ຫ້ອງ 108", "ຫ້ອງ 109", "ຫ້ອງ 110", "ຫ້ອງ 111", "ຫ້ອງ 112", "ຫ້ອງ 113", "ຫ້ອງ 114"]; 
        rooms.forEach(r => { scores[r] = 0; }); 

        querySnapshot.forEach(docSnap => { 
            const data = docSnap.data(); 
            if (data.approved && data.room) { 
                let reportDate = data.createdAt ? data.createdAt.toDate() : (data.date ? parseLaoDate(data.date) : new Date()); 
                 
                let matchesPeriod = false; 
                if (currentSummaryPeriod === 'weekly') { 
                    if (data.weekTag === currentWeekStr || getWeekNumber(reportDate) === currentWeekStr) matchesPeriod = true; 
                } else if (currentSummaryPeriod === 'monthly') { 
                    if (reportDate.getMonth() === currentMonthNum && reportDate.getFullYear() === currentYearNum) matchesPeriod = true; 
                } else if (currentSummaryPeriod === 'yearly') { 
                    if (reportDate.getFullYear() === currentYearNum) matchesPeriod = true; 
                } 

                if (matchesPeriod) { 
                    const ptsToAdd = (data.specialPoints !== undefined) ? data.specialPoints : 1; 
                    scores[data.room] = (scores[data.room] || 0) + ptsToAdd; 
                    if (scores[data.room] < 0) scores[data.room] = 0; 
                    if (ptsToAdd > 0) approvedReportsCount += 1; 
                } 
            } 
        }); 

        totalPts = Object.values(scores).reduce((a, b) => a + b, 0); 
        let maxPts = -1; let topRoom = 'ຍັງບໍ່ມີຂໍ້ມູນ'; 
        rooms.forEach(r => { if (scores[r] > maxPts) { maxPts = scores[r]; topRoom = r; } }); 

        document.getElementById('summary-top-room').innerText = `${topRoom} (${maxPts} ຄະແນນ)`; 
        document.getElementById('summary-total-points').innerText = `${totalPts} ຄະແນນ`; 
        document.getElementById('summary-approved-count').innerText = `${approvedReportsCount} ບົດລາຍງານ`; 

        const highestPoint = Math.max(...Object.values(scores), 1); 
        container.innerHTML = rooms.map(room => { 
            const pts = scores[room] || 0; 
            const percent = highestPoint > 0 ? Math.round((pts / highestPoint) * 100) : 0; 
            return ` 
                <div class="space-y-1 bg-slate-900/60 p-3.5 rounded-xl border border-slate-700/60"> 
                    <div class="flex justify-between items-center text-xs font-semibold"> 

                        <span class="text-slate-200">🏠 ${room}</span> 

                        <span class="text-amber-400 font-bold">${pts} ຄະແນນ (${percent}%)</span> 

                    </div> 

                    <div class="w-full bg-slate-800 rounded-full h-3 overflow-hidden border border-slate-700"> 

                        <div class="bg-gradient-to-r from-emerald-500 to-amber-400 h-3 rounded-full transition-all duration-500" style="width: ${percent}%"></div> 

                    </div> 

                </div> 

            `; 

        }).join(''); 

    } catch (err) { container.innerHTML = `<div class="text-center py-6 text-red-400">ຜິດພາດ: ${err.message}</div>`; } 

} 

 

function parseLaoDate(dateStr) { 

    try { 

        if (dateStr.includes('/')) { 

            const parts = dateStr.split(',')[0].split('/'); 

            if (parts.length === 3) { 

                return new Date(parts[2], parts[1] - 1, parts[0]); 

            } 

        } 

    } catch (e) { } 

    return new Date(); 

} 

 

async function loadFullScoreboard() { 

    const container = document.getElementById('full-scoreboard-container'); 

    if (!container) return; 

    try { 

        const querySnapshot = await getDocs(collection(db, "member_reports")); 

        let scores = {}; 

        const rooms = ["ຫ້ອງ 104", "ຫ້ອງ 105", "ຫ້ອງ 108", "ຫ້ອງ 109", "ຫ້ອງ 110", "ຫ້ອງ 111", "ຫ້ອງ 112", "ຫ້ອງ 113", "ຫ້ອງ 114"]; 

        rooms.forEach(room => { scores[room] = 0; }); 

        querySnapshot.forEach(docSnap => { 

            const data = docSnap.data(); 

            if (data.approved && data.room) {  

                const ptsToAdd = (data.specialPoints !== undefined) ? data.specialPoints : 1; 

                scores[data.room] = (scores[data.room] || 0) + ptsToAdd;  

                if (scores[data.room] < 0) scores[data.room] = 0; 

            } 

        }); 

         

        container.innerHTML = rooms.map((room, index) => { 

            const pts = scores[room] || 0; 

            return ` 

                <div class="bg-slate-800/85 backdrop-blur border border-amber-500/50 bg-amber-950/20 p-5 rounded-2xl shadow-xl flex items-center justify-between animate-fade-in"> 

                    <div class="flex items-center space-x-3"> 

                        <div class="bg-amber-500/20 text-amber-400 font-bold w-10 h-10 rounded-xl flex items-center justify-center text-base border border-amber-500/40"> 

                            #${index + 1} 

                        </div> 

                        <div> 

                            <h4 class="font-bold text-slate-100 text-base">${room}</h4> 

                            <p class="text-xs text-slate-400">ສະຖານະ: ພ້ອມປະຕິບັດງານ</p> 

                        </div> 

                    </div> 

                    <div class="text-right"> 

                        <span class="text-2xl font-extrabold text-amber-400">${pts}</span> 

                        <span class="block text-[10px] text-slate-400 uppercase">ຄະແນນສະສົມ</span> 

                    </div> 

                </div> 

            `; 

        }).join(''); 

    } catch (err) { container.innerHTML = `<div class="text-center py-12 text-red-400 col-span-full">ຜິດພາດ: ${err.message}</div>`; } 

} 

 

function getDeviceType() { 

    const ua = navigator.userAgent; 

    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) return "mobile"; 

    if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Opera Mini/i.test(ua)) return "mobile"; 

    return "desktop"; 

} 

 

async function trackVisitor() { 

    const today = new Date().toISOString().split('T')[0]; 

    const device = getDeviceType();  

    if (sessionStorage.getItem(`visited_${today}`)) { loadVisitorStats(); return; } 

 

    try { 

        await runTransaction(db, async (transaction) => { 

            const todayRef = doc(db, "visitors", today); 

            const totalRef = doc(db, "visitors", "total_stats"); 

            const todayDoc = await transaction.get(todayRef); 

            if (!todayDoc.exists()) transaction.set(todayRef, { desktop: device === 'desktop' ? 1 : 0, mobile: device === 'mobile' ? 1 : 0, count: 1 }); 

            else transaction.update(todayRef, { desktop: increment(device === 'desktop' ? 1 : 0), mobile: increment(device === 'mobile' ? 1 : 0), count: increment(1) }); 

 

            const totalDoc = await transaction.get(totalRef); 

            if (!totalDoc.exists()) transaction.set(totalRef, { desktop: device === 'desktop' ? 1 : 0, mobile: device === 'mobile' ? 1 : 0, count: 1 }); 

            else transaction.update(totalRef, { desktop: increment(device === 'desktop' ? 1 : 0), mobile: increment(device === 'mobile' ? 1 : 0), count: increment(1) }); 

        }); 

        sessionStorage.setItem(`visited_${today}`, 'true'); 

    } catch (e) { console.error(e); } 

    loadVisitorStats(); 

} 

 

async function loadVisitorStats() { 

    try { 

        const totalDoc = await getDoc(doc(db, "visitors", "total_stats")); 

        if (totalDoc.exists()) { 

            const data = totalDoc.data(); 

            document.getElementById('visitor-desktop').innerText = (data.desktop || 0).toLocaleString(); 

            document.getElementById('visitor-mobile').innerText = (data.mobile || 0).toLocaleString(); 

            document.getElementById('visitor-total').innerText = (data.count || 0).toLocaleString(); 

        } 

    } catch (e) { console.error(e); } 

} 

trackVisitor(); 

 

async function loadNews() { 

    try { 

        const q = query(collection(db, "news"), orderBy("date", "desc")); 

        const snapshot = await getDocs(q); 

        allNews = []; 

        snapshot.forEach(docSnap => allNews.push({ id: docSnap.id, ...docSnap.data() })); 

        document.getElementById('stat-total-news').innerText = allNews.length; 

        renderNews(allNews); 

    } catch (e) { console.error(e); } 

} 

 

function renderNews(newsList) { 

    const container = document.getElementById('news-container'); 

    if (!container) return; 

    if (newsList.length === 0) { container.innerHTML = `<div class="text-center py-12 text-slate-500 bg-slate-800/85 rounded-2xl border border-slate-700">ຍັງບໍ່ມີຂ່າວສານ</div>`; return; } 

    container.innerHTML = newsList.map(item => { 

        const likes = item.likes || []; 

        const hasLiked = currentRoomUser && likes.includes(currentRoomUser); 

        return ` 

            <div id="post-${item.id}" class="bg-slate-800/85 backdrop-blur border border-slate-700/80 rounded-2xl p-5 space-y-3 shadow-xl animate-fade-in transition-all"> 

                <div class="flex justify-between items-start"> 

                    <span class="text-xs px-3 py-1 rounded-full font-medium ${item.category === 'notice' ? 'bg-red-950 text-red-300 border border-red-800' : 'bg-emerald-950 text-emerald-300 border border-emerald-800'}"> 

                        ${item.category === 'notice' ? '📢 ແຈ້ງການດ່ວນ' : '🎖️ ພາວະກິດ/ກິດຈະກຳ'} 

                    </span> 

                    <span class="text-xs text-slate-400">${item.date || ''}</span> 

                </div> 

                <h3 class="text-lg font-bold text-emerald-300">${item.title}</h3> 

                <p class="text-sm text-slate-300 whitespace-pre-line leading-relaxed">${item.content}</p> 

                 

                <div class="flex flex-wrap justify-between items-center pt-3 border-t border-slate-700/60 gap-2"> 

                    <div class="flex items-center space-x-2"> 

                        <button onclick="toggleLike('${item.id}')" class="text-xs px-3.5 py-1.5 rounded-xl border transition flex items-center space-x-1.5 ${hasLiked ? 'bg-pink-600/30 text-pink-400 border-pink-500/50' : 'bg-slate-900/60 text-slate-300 border-slate-700'}"> 

                            <span>${hasLiked ? '❤️' : '🤍'}</span> <span>${hasLiked ? 'ຖືກໃຈແນວ' : 'ຖືກໃຈ'} (${likes.length})</span> 

                        </button> 

                        <button onclick="handleShare('${item.id}', '${item.title.replace(/'/g, "\\'")}', '${item.content.replace(/'/g, "\\'").replace(/\n/g, ' ').substring(0, 100)}...')" class="text-xs bg-emerald-900/60 text-emerald-300 px-3.5 py-1.5 rounded-xl border border-emerald-700/60 transition flex items-center space-x-1"><span>🔗</span> <span>ແຊ</span></button> 

                    </div> 

                    ${userRole === 'admin' && isSuperAdmin() ? ` 

                        <div class="flex space-x-2"> 

                            <button onclick="openEditNewsModal('${item.id}', '${item.title.replace(/'/g, "\\'")}', '${item.category}', '${item.content.replace(/'/g, "\\'").replace(/\n/g, '\\n')}')" class="text-xs bg-amber-600 px-3 py-1.5 rounded-lg text-white">ແກ້ໄຂ</button> 

                            <button onclick="deleteNewsItem('${item.id}')" class="text-xs bg-red-950 px-3 py-1.5 rounded-lg text-red-300">ລົບ</button> 

                        </div> 

                    ` : ''} 

                </div> 

            </div> 

        `; 

    }).join(''); 

} 

 

window.toggleLike = async (newsId) => { 

    if (!currentRoomUser) { alert('ກະລຸນາເລືອກຫ້ອງພັກກ່ອນ!'); document.getElementById('room-login-modal').classList.remove('hidden'); return; } 

    const newsRef = doc(db, "news", newsId); 

    try { 

        await runTransaction(db, async (transaction) => { 

            const docSnap = await transaction.get(newsRef); 

            if (!docSnap.exists()) throw "ບໍ່ພົບຂ່າວສານ!"; 

            let likes = docSnap.data().likes || []; 

            if (likes.includes(currentRoomUser)) likes = likes.filter(r => r !== currentRoomUser); 

            else likes.push(currentRoomUser); 

            transaction.update(newsRef, { likes: likes }); 

        }); 

        loadNews(); 

    } catch (e) { alert('ຜິດພາດ: ' + e); } 

}; 

 

window.handleShare = (id, title, text) => { 

    const baseUrl = window.location.origin + window.location.pathname; 

    currentShareData = { title, text, url: `${baseUrl}#post-${id}` }; 

    document.getElementById('share-modal-title').innerText = title; 

    document.getElementById('share-modal').classList.remove('hidden'); 

}; 

window.closeShareModal = () => document.getElementById('share-modal').classList.add('hidden'); 

 

window.shareToPlatform = (platform) => { 

    const url = encodeURIComponent(currentShareData.url); 

    const text = encodeURIComponent(`${currentShareData.title}\n${currentShareData.text}`); 

    if (platform === 'facebook') window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank', 'width=600,height=400'); 

    else if (platform === 'messenger') window.open(`https://www.facebook.com/dialog/send?link=${url}&app_id=291494419107518&redirect_uri=${url}`, '_blank', 'width=600,height=400'); 

    else if (platform === 'telegram') window.open(`https://t.me/share/url?url=${url}&text=${text}`, '_blank', 'width=600,height=400'); 

    else if (platform === 'whatsapp') window.open(`https://api.whatsapp.com/send?text=${text}%20${url}`, '_blank', 'width=600,height=400'); 

    else if (platform === 'copy') { 

        navigator.clipboard.writeText(`${currentShareData.title}\n${currentShareData.url}`).then(() => { alert('ກ໊ອບປີ້ລິ້ງສຳເລັດ!'); closeShareModal(); }); 

    } 

}; 

 

window.openNewsModal = () => { if (!isSuperAdmin()) { alert('ສະເພາະຜູ້ສ້າງເວັບໄຊເທົ່ານັ້ນ!'); return; } document.getElementById('news-modal').classList.remove('hidden'); }; 

window.closeNewsModal = () => document.getElementById('news-modal').classList.add('hidden'); 

window.openEditNewsModal = (id, title, category, content) => { 

    if (!isSuperAdmin()) { alert('ສະເພາະຜູ້ສ້າງເວັບໄຊເທົ່ານັ້ນ!'); return; } 

    document.getElementById('edit-news-id').value = id; 

    document.getElementById('edit-news-title').value = title; 

    document.getElementById('edit-news-category').value = category; 

    document.getElementById('edit-news-content').value = content; 

    document.getElementById('edit-news-modal').classList.remove('hidden'); 

}; 

window.closeEditNewsModal = () => document.getElementById('edit-news-modal').classList.add('hidden'); 

 

window.saveNews = async () => { 

    if (!isSuperAdmin()) return; 

    const title = document.getElementById('news-title').value; 

    const category = document.getElementById('news-category').value; 

    const content = document.getElementById('news-content').value; 

    if (!title || !content) return alert('ກະລຸນາຕື່ມຂໍ້ມູນໃຫ້ຄົບ'); 

    await addDoc(collection(db, "news"), { title, category, content, date: new Date().toLocaleString('lo-LA'), likes: [] }); 

    alert('ເພີ່ມຂ່າວສຳເລັດ!'); closeNewsModal(); loadNews(); 

}; 

 

window.updateNews = async () => { 

    if (!isSuperAdmin()) return; 

    const id = document.getElementById('edit-news-id').value; 

    const title = document.getElementById('edit-news-title').value; 

    const category = document.getElementById('edit-news-category').value; 

    const content = document.getElementById('edit-news-content').value; 

    if (!title || !content) return alert('ກະລຸນາຕື່ມຂໍ້ມູນໃຫ້ຄົບ'); 

    await updateDoc(doc(db, "news", id), { title, category, content }); 

    alert('ແກ້ໄຂຂ່າວສຳເລັດ!'); closeEditNewsModal(); loadNews(); 

}; 

 

window.deleteNewsItem = async (id) => { 

    if (!isSuperAdmin()) return; 

    if (confirm('ລົບຂ່າວນີ້ແທ້ບໍ?')) { await deleteDoc(doc(db, "news", id)); loadNews(); } 

}; 

 

const uploadMediaSmart = (file) => { 

    return new Promise((resolve, reject) => { 

        const reader = new FileReader(); 

        reader.readAsDataURL(file); 

        reader.onload = async () => { 

            try { 

                const base64Data = reader.result; 

                const response = await fetch(DRIVE_WEB_APP_URL, { 

                    method: "POST", 

                    body: JSON.stringify({ 

                        room: currentRoomUser || "Admin", 

                        filename: `video_${Date.now()}.webm`, 

                        filedata: base64Data 

                    }) 

                }); 

                const result = await response.json(); 

                if (result.status === "success") { 

                    resolve({ type: 'video', url: result.webViewUrl }); 

                } else { 

                    reject(new Error(result.message || "ອັບໂຫລດບໍ່ສຳເລັດ")); 

                } 

            } catch (err) { 

                reject(err); 

            } 

        }; 

        reader.onerror = (error) => reject(error); 

    }); 

}; 

 

function getWeekNumber(d) { 

    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())); 

    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7)); 

    return `${d.getUTCFullYear()}-W${Math.ceil((((d - new Date(Date.UTC(d.getUTCFullYear(),0,1))) / 86400000) + 1)/7)}`; 

} 

 

function checkVideoDuration(file) { 

    return new Promise((resolve) => { 

        const video = document.createElement('video'); 

        video.preload = 'metadata'; 

        video.onloadedmetadata = function() { 

            window.URL.revokeObjectURL(video.src); 

            resolve(video.duration); 

        }; 

        video.onerror = function() { 

            resolve(0);  

        }; 

        video.src = URL.createObjectURL(file); 

    }); 

} 

 

window.submitMemberReport = async () => { 

    if (!currentRoomUser || currentRoomUser.includes('Admin') || currentRoomUser.includes('ຜູ້ສ້າງ')) { 

        alert('ກະລຸນາລັອກອິນດ້ວຍໄອດີຫ້ອງພັກກ່ອນ!'); 

        document.getElementById('room-login-modal').classList.remove('hidden'); return; 

    } 

 

    const now = new Date(); 

    if (now.getDay() !== 0) { alert('⚠️ ລະບົບອະນຸຍາດໃຫ້ສົ່ງສະເພາະມື້ວັນອາທິດເທົ່ານັ້ນ!'); return; } 

    const totalMinutesNow = now.getHours() * 60 + now.getMinutes(); 

    if (totalMinutesNow < 960 || totalMinutesNow > 1140) { alert('⚠️ ເວລາສົ່ງ: 16:00 - 19:00 ໂມງ!'); return; } 

 

    const name = document.getElementById('member-name').value; 

    const description = document.getElementById('member-task-desc').value; 

    const fileInput = document.getElementById('member-media-files'); 

    const statusText = document.getElementById('member-upload-status'); 

    if (!name || !description) return alert('ກະລຸນາປ້ອນຂໍ້ມູນໃຫ້ຄົບ'); 

 

    const files = fileInput.files; 

    if (files.length === 0) return alert('ກະລຸນາເປີດກ້ອງຖ່າຍວິດີໂອສົດກ່ອນສົ່ງ!'); 

 

    const videoFile = files[0]; 

 

    statusText.innerText = `⏳ ກຳລັງກວດສອບຄວາມຍາວວິດີໂອ...`; 

    const duration = await checkVideoDuration(videoFile); 

    if (duration > 62) { 

        alert(`❌ ວິດີໂະຍາວເກີນໄປ (${Math.round(duration)} ວິນາທີ)! ລະບົບກຳນົດໃຫ້ຖ່າຍວິດີໂອຄວາມຍາວສູງສຸດບໍ່ເກີນ 1 ນາທີ.`); 

        statusText.innerText = '⚠️ ກະລຸນາຖ່າຍວິດີໂອໃໝ່ ຄວາມຍາວບໍ່ເກີນ 1 ນາທີ!'; 

        return; 

    } 

 

    const currentWeekStr = getWeekNumber(now); 

    const reportsSnap = await getDocs(collection(db, "member_reports")); 

    let submitted = false; 

    reportsSnap.forEach(docSnap => { 

        if (docSnap.data().room === currentRoomUser && docSnap.data().weekTag === currentWeekStr) submitted = true; 

    }); 

    if (submitted) return alert('⚠️ ຫ້ອງຂອງທ່ານສົ່ງບົດລາຍງານສຳລັບອາທິດນີ້ໄປແລ້ວ!'); 

 

    statusText.innerText = `⏳ ກຳລັງອັບໂຫລດວິດີໂອສົດຂຶ້ນ Google Drive...`; 

    try { 

        let mediaItems = []; 

        const uploadedMedia = await uploadMediaSmart(videoFile); 

        mediaItems.push(uploadedMedia); 

 

        statusText.innerText = `⏳ ກຳລັງບັນທຶກບົດລາຍງານ...`; 

        await addDoc(collection(db, "member_reports"), { 

            room: currentRoomUser, name, description, mediaItems, date: new Date().toLocaleString('lo-LA'), weekTag: currentWeekStr, approved: false, createdAt: new Date() 

        }); 

        alert('🎉 ສົ່ງບົດລາຍງານວິດີໂອສຳເລັດ!'); 

        document.getElementById('member-name').value = ''; 

        document.getElementById('member-task-desc').value = ''; 

        fileInput.value = ''; 

        statusText.innerText = '⚠️ ລະບົບກວດສອບຄວາມຍາວວິດີໂອຕ້ອງບໍ່ເກີນ 60 ວິນາທີ ແລະ ຈະອັບໂຫລດຂຶ້ນ Google Drive ອັດຕະໂນມັດ'; 

        loadMemberReports(); loadFullScoreSummary(); 

    } catch (e) { alert(e.message); statusText.innerText = '❌ ອັບໂຫລດບໍ່ສຳເລັດ'; } 

}; 

 

async function loadMemberReports() { 

    const container = document.getElementById('member-reports-container'); 

    if (!container) return; 

    try { 

        const snapshot = await getDocs(collection(db, "member_reports")); 

        allMemberReports = []; 

        snapshot.forEach(docSnap => allMemberReports.push({ id: docSnap.id, ...docSnap.data() })); 

        renderMemberReports(); 

    } catch (e) { container.innerHTML = `<div class="text-center py-6 text-red-400">ຜິດພາດ: ${e.message}</div>`; } 

} 

 

function isImageItem(item) { 

    if (!item) return false; 

    if (typeof item === 'string') { 

        return item.startsWith('data:image/') || item.match(/\.(jpeg|jpg|png|gif|webp)$/i); 

    } 

    if (item.type === 'image') return true; 

    if (item.url && (item.url.startsWith('data:image/') || item.url.match(/\.(jpeg|jpg|png|gif|webp)$/i))) return true; 

    return false; 

} 

 

function renderMemberReports() { 

    const container = document.getElementById('member-reports-container'); 

    if (!container) return; 

    if (allMemberReports.length === 0) { container.innerHTML = `<div class="text-center py-8 text-slate-500">ຍັງບໍ່ມີບົດລາຍງານ</div>`; return; } 

    container.innerHTML = allMemberReports.map(rep => { 

        let items = rep.mediaItems || []; 

        if (items.length === 0 && rep.mediaUrls) { 

            items = rep.mediaUrls.map(u => ({ type: isImageItem(u) ? 'image' : 'video', url: u })); 

        } 

        return ` 

            <div class="bg-slate-900/85 border ${rep.approved ? 'border-emerald-600' : 'border-slate-700'} rounded-xl p-4 space-y-3 shadow-md animate-fade-in"> 

                <div class="flex justify-between items-center text-xs border-b border-slate-800 pb-2"> 

                    <span class="font-bold text-emerald-400">🏠 ຫ້ອງ: ${rep.room || ''} | 👤 ຜູ້ສົ່ງ: ${rep.name}</span> 

                    <div class="flex items-center space-x-2"> 

                        <span class="px-2 py-0.5 rounded text-[10px] ${rep.approved ? 'bg-emerald-950 text-emerald-300' : 'bg-amber-950 text-amber-300'}"> 

                            ${rep.approved ? '✅ ອະນຸມັດແລ້ວ' : '⏳ ລໍຖ້າ Admin ອະນຸມັດ'} 

                        </span> 

                        <span class="text-slate-400">${rep.date || ''}</span> 

                    </div> 

                </div> 

                <p class="text-sm text-slate-200 whitespace-pre-line">${rep.description}</p> 

                <div class="grid grid-cols-1 gap-2 pt-2"> 

                    ${items.map(item => { 

                        const isImg = isImageItem(item); 

                        const mediaUrl = item.url || item; 

                        if (isImg) { 

                            return ` 

                                <div class="relative group bg-slate-950 p-2 rounded-xl border border-slate-700 text-center space-y-2"> 

                                    <span class="text-xs text-emerald-400 font-bold block">📷 ຮູບພາບການປະຕິບັດງານ</span> 

                                    <img src="${mediaUrl}" alt="Report Image" class="max-h-64 mx-auto rounded-lg object-contain cursor-pointer hover:opacity-95 transition" onclick="window.open('${mediaUrl}')"> 

                                </div> 

                            `; 

                        } else { 

                            return ` 

                                <div class="relative group bg-slate-950 p-3 rounded-xl border border-slate-700 text-center space-y-2"> 

                                    <span class="text-xs text-emerald-400 font-bold block">📁 ວິດີໂອບົນ Google Drive</span> 

                                    <a href="${mediaUrl}" target="_blank" rel="noopener noreferrer" class="inline-block bg-blue-600 hover:bg-blue-500 text-white text-xs px-4 py-2 rounded-xl shadow transition font-medium">🔗 ເປີດເບິ່ງວິດີໂອໃນ Google Drive</a> 

                                </div> 

                            `; 

                        } 

                    }).join('')} 

                </div> 

                <div class="flex justify-end space-x-2 pt-2"> 

                    ${userRole === 'admin' ? ` 

                        ${!rep.approved ? `<button onclick="approveMemberReport('${rep.id}')" class="text-xs bg-emerald-600 px-3 py-1.5 rounded-lg text-white font-medium">✅ ອະນຸມັດ</button>` : ''} 

                        ${isSuperAdmin() ? `<button onclick="deleteMemberReport('${rep.id}')" class="text-xs bg-red-950 px-3 py-1.5 rounded-lg text-red-300">ລົບລາຍງານ</button>` : ''} 

                    ` : ''} 

                </div> 

            </div> 

        `; 

    }).join(''); 

} 

 

window.approveMemberReport = async (reportId) => { 

    if (userRole !== 'admin') { alert('⚠️ ສະເພາະ Admin ເທົ່ານັ້ນ!'); return; } 

    const report = allMemberReports.find(r => r.id === reportId); 

    if (!report) return; 

 

    try { 

        await updateDoc(doc(db, "member_reports", reportId), { approved: true }); 

        await addDoc(collection(db, "cyber_tasks"), { 

            title: `${report.room || 'ຫ້ອງ'} - ໂດຍ: ${report.name}`, 

            description: report.description, 

            mediaItems: report.mediaItems || [], 

            date: report.date || new Date().toLocaleString('lo-LA') 

        }); 

        alert('ອະນຸມັດສຳເລັດ!'); 

        loadMemberReports(); loadCyberTasks(); loadFullScoreSummary(); 

    } catch (e) { alert('ຜິດພາດ: ' + e.message); } 

}; 

 

window.deleteMemberReport = async (id) => { 

    if (!isSuperAdmin()) { alert('ສະເພາະຜູ້ສ້າງເວັບໄຊເທົ່ານັ້ນ!'); return; } 

    if (confirm('ລົບລາຍງານນີ້ແທ້ບໍ?')) { await deleteDoc(doc(db, "member_reports", id)); loadMemberReports(); loadFullScoreSummary(); } 

}; 

 

async function loadCyberTasks() { 

    const container = document.getElementById('cyber-container'); 

    if (!container) return; 

    try { 

        const snapshot = await getDocs(collection(db, "cyber_tasks")); 

        allCyberTasks = []; 

        snapshot.forEach(docSnap => allCyberTasks.push({ id: docSnap.id, ...docSnap.data() })); 

        document.getElementById('stat-cyber-done').innerText = `${allCyberTasks.length} / ${allCyberTasks.length}`; 

        renderCyberTasks(); 

    } catch (e) { container.innerHTML = `<div class="text-center py-12 text-red-400">ຜິດພາດ: ${e.message}</div>`; } 

} 

 

function renderCyberTasks() { 

    const container = document.getElementById('cyber-container'); 

    if (!container) return; 

    if (allCyberTasks.length === 0) { container.innerHTML = `<div class="text-center py-12 text-slate-500 bg-slate-800/85 rounded-2xl border border-slate-700">ຍັງບໍ່ມີລາຍການ</div>`; return; } 

    container.innerHTML = allCyberTasks.map(task => { 

        let items = task.mediaItems || []; 

        if (items.length === 0 && task.mediaUrls) { 

            items = task.mediaUrls.map(u => ({ type: isImageItem(u) ? 'image' : 'video', url: u })); 

        } 

        return ` 

            <div class="bg-slate-800/85 backdrop-blur border border-emerald-600 bg-emerald-950/25 rounded-2xl p-5 shadow-lg animate-fade-in space-y-3"> 

                <div class="flex items-center justify-between"> 

                    <div class="flex items-center space-x-3"> 

                        <input type="checkbox" checked disabled class="w-5 h-5 accent-emerald-500"> 

                        <div> 

                            <h4 class="font-bold text-emerald-300 text-base">${task.title}</h4> 

                            <p class="text-[11px] text-emerald-400/90 mt-0.5">📅 ວັນເວລາ: ${task.date || ''}</p> 

                            <p class="text-xs text-slate-300 mt-1">${task.description || ''}</p> 

                        </div> 

                    </div> 

                    ${userRole === 'admin' && isSuperAdmin() ? `<button onclick="deleteCyberTask('${task.id}')" class="text-xs bg-red-950 px-3 py-1 rounded-lg text-red-300">ລົບ</button>` : ''} 

                </div> 

                <div class="grid grid-cols-1 gap-2 mt-3 pt-3 border-t border-slate-700"> 

                    ${items.map(item => { 

                        const isImg = isImageItem(item); 

                        const mediaUrl = item.url || item; 

                        if (isImg) { 

                            return ` 

                                <div class="relative group bg-slate-950 p-2 rounded-xl border border-slate-700 text-center space-y-2"> 

                                    <span class="text-xs text-emerald-400 font-bold block">📷 ຮູບພາບການປະຕິບັດງານ</span> 

                                    <img src="${mediaUrl}" alt="Task Image" class="max-h-64 mx-auto rounded-lg object-contain cursor-pointer hover:opacity-95 transition" onclick="window.open('${mediaUrl}')"> 

                                </div> 

                            `; 

                        } else { 

                            return ` 

                                <div class="relative group bg-slate-950 p-3 rounded-xl border border-slate-700 text-center space-y-2"> 

                                    <span class="text-xs text-emerald-400 font-bold block">📁 ວິດີໂອບົນ Google Drive</span> 

                                    <a href="${mediaUrl}" target="_blank" rel="noopener noreferrer" class="inline-block bg-blue-600 hover:bg-blue-500 text-white text-xs px-4 py-2 rounded-xl shadow transition font-medium">🔗 ເປີດເບິ່ງວິດີໂອໃນ Google Drive</a> 

                                </div> 

                            `; 

                        } 

                    }).join('')} 

                </div> 

            </div> 

        `; 

    }).join(''); 

} 

 

window.openCyberModal = () => { if (!isSuperAdmin()) { alert('ສະເພາະຜູ້ສ້າງເວັບໄຊເທົ່ານັ້ນ!'); return; } document.getElementById('cyber-modal').classList.remove('hidden'); }; 

window.closeCyberModal = () => document.getElementById('cyber-modal').classList.add('hidden'); 

 

window.saveCyberTaskVideo = async () => { 

    if (!isSuperAdmin()) return; 

    const title = document.getElementById('cyber-task-title').value; 

    const description = document.getElementById('cyber-task-desc').value; 

    const files = document.getElementById('cyber-media-files').files; 

    if (!title) return alert('ກະລຸນາໃສ່ຫົວຂໍ້'); 

    if (files.length === 0) return alert('ກະລຸນາເລືອກຮູບພາບ ຫຼື ວິດີໂອ'); 

 

    const statusText = document.getElementById('upload-status'); 

    statusText.innerText = `⏳ ກຳລັງປະມວນຜົນໄຟລ໌...`; 

    try { 

        let mediaItems = []; 

        const uploadedMedia = await uploadMediaSmart(files[0]); 

        mediaItems.push(uploadedMedia); 

 

        await addDoc(collection(db, "cyber_tasks"), { title, description, mediaItems, date: new Date().toLocaleString('lo-LA') }); 

        alert('ເພີ່ມລາຍການສຳເລັດ!'); 

        closeCyberModal(); loadCyberTasks(); switchTab('cyber'); 

    } catch (e) { alert(e.message); statusText.innerText = '❌ ອັບໂຫລດບໍ່ສຳເລັດ'; } 

}; 

 

window.deleteCyberTask = async (id) => { 

    if (!isSuperAdmin()) return; 

    if (confirm('ລົບລາຍການນີ້ແທ້ບໍ?')) { await deleteDoc(doc(db, "cyber_tasks", id)); loadCyberTasks(); } 

}; 

 

window.filterCategory = (cat) => { 

    if (cat === 'all') renderNews(allNews); 

    else renderNews(allNews.filter(n => n.category === cat)); 

}; 

window.searchNews = () => { 

    const kw = document.getElementById('search-input').value.toLowerCase(); 

    renderNews(allNews.filter(n => n.title.toLowerCase().includes(kw) || n.content.toLowerCase().includes(kw))); 

};