// ============================================
// FOOTER SIDEBAR
// ============================================

// ===== DOM ELEMENTS =====
const footerSidebar = document.getElementById("footerSidebar");
const footerSidebarOverlay = document.getElementById("footerSidebarOverlay");

// ===== STATE =====
let isFooterSidebarOpen = false;

// ===== SIDEBAR OPEN =====
// ===== SIDEBAR OPEN =====

window.footerOpenSidebar = function(){

    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("sidebarOverlay");

    if(!sidebar) return;


    sidebar.classList.add("active");


    if(overlay){
        overlay.classList.add("active");
    }


    isFooterSidebarOpen = true;

    document.body.style.overflow="hidden";

};


window.footerToggleSidebar = function () {

    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("sidebarOverlay");

    console.log("Menu clicked");
    console.log(sidebar);


    if(!sidebar) return;


    if(sidebar.classList.contains("active")){

        sidebar.classList.remove("active");

        if(overlay){
            overlay.classList.remove("active");
        }

        document.body.style.overflow="";


    }else{

        sidebar.classList.add("active");

        if(overlay){
            overlay.classList.add("active");
        }

        document.body.style.overflow="hidden";

    }

};




window.footerCloseSidebar = function(){

    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("sidebarOverlay");

    sidebar.classList.remove("active");
    overlay.classList.remove("active");

    isFooterSidebarOpen = false;

    const menuBtn = document.getElementById("menuBtn");

    if(menuBtn){
        menuBtn.classList.remove("active");
    }

    document.body.style.overflow="";
};
 // Login হওয়ার পরে শুধু এই ফাংশন চালাবে। =====


// ================= USER UI =================

window.footerUpdateUserUI = function(user){

    const guest = document.getElementById("footerGuestSection");
    const profile = document.getElementById("footerUserSection");

    if(!guest || !profile) return;

    if(user){

        guest.style.display = "none";
        profile.style.display = "block";

        document.getElementById("footerUserName").textContent =
            user.name || "Player";

        document.getElementById("footerUserVip").textContent =
            user.vip || "VIP 0";

        document.getElementById("footerUserAvatar").src =
            user.avatar || "images/default-avatar.png";

    }else{

        guest.style.display = "block";
        profile.style.display = "none";

    }

};
// ===== SIDEBAR CLOSE =====
window.footerCloseSidebar = function(){

    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("sidebarOverlay");

    sidebar.classList.remove("active");
    overlay.classList.remove("active");

    document.body.style.overflow="";
};

// ===== SIDEBAR TOGGLE =====
window.footerToggleSidebar = function () {

    if (isFooterSidebarOpen) {
        footerCloseSidebar();
    } else {
        footerOpenSidebar();
    }

};
   // ===== FOOTER MENU SUB TOGGLE =====
window.footerToggleMenuSub = function(menuSubId, arrowId) {

    const menuSub = document.getElementById(menuSubId);
    const arrow = document.getElementById(arrowId);

    if (!menuSub) return;

    // Close other sub menus
    document.querySelectorAll('.footer-menusub-list').forEach(function(menu){

        if(menu.id !== menuSubId){

            menu.classList.add('footer-menusub-hidden');

            const otherArrow =
                document.getElementById(
                    menu.id.replace("MenuSub","Arrow")
                );

            if(otherArrow){
                otherArrow.classList.remove("rotate");
            }

        }

    });

    // Toggle Current
    if(menuSub.classList.contains("footer-menusub-hidden")){

        menuSub.classList.remove("footer-menusub-hidden");

        if(arrow){
            arrow.classList.add("rotate");
        }

    }else{

        menuSub.classList.add("footer-menusub-hidden");

        if(arrow){
            arrow.classList.remove("rotate");
        }

    }

};


// ===== FOOTER ACTIVE =====
// ===== SET ACTIVE =====
window.footerSetActive = function(element) {

    if(!element) return;


    // যদি একই item আবার click করা হয়
    if(element.classList.contains("active")){

        element.classList.remove("active");

        return;

    }


    // অন্য সব বন্ধ
    document.querySelectorAll('.footer-bottom-item').forEach(function(item){

        item.classList.remove('active');

    });


    // Current active
    element.classList.add('active');

};


// ===== NAVIGATION =====
window.footerGoToLogin      = () => alert("Login");
window.footerGoToSignup     = () => alert("Sign Up");
window.footerGoToBonus      = () => alert("Bonus");
window.footerGoToRefer      = () => alert("Refer");
window.footerGoToSupport    = () => alert("Support");
window.footerOpenSearch     = () => alert("Search");
window.footerOpenBetHistory = () => alert("Bet History");
window.footerGoHome         = () => alert("Home");


// ===== OVERLAY CLICK =====
if (footerSidebarOverlay) {

    footerSidebarOverlay.addEventListener("click", function(e){

        if(e.target === footerSidebarOverlay){
            footerCloseSidebar();
        }

    });

}


// ===== ESC KEY =====
document.addEventListener("keydown", function(e){

    if(e.key === "Escape" && isFooterSidebarOpen){
        footerCloseSidebar();
    }

});


// ===== AUTH STATE LISTENER =====
// Login / Logout হলে Footer Menu Auto Update হবে

if(window.supabaseClient){

    supabaseClient.auth.onAuthStateChange(function(event, session){

        console.log("Footer Auth Change:", event);

        if(event === "SIGNED_IN"){

            const user = session?.user;

            if(window.footerUpdateUserUI){

                footerUpdateUserUI({
                    name: user?.user_metadata?.name || "Player",
                    vip: "VIP 0",
                    avatar: "images/default-avatar.png"
                });

            }

        }


        if(event === "SIGNED_OUT"){

            if(window.footerUpdateUserUI){

                footerUpdateUserUI(null);

            }

        }

    });

}



// ===== INITIALIZE =====
footerCloseSidebar();

console.log("✅ footer.js Ready!");
