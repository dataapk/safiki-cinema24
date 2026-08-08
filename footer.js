// ============================================
// FOOTER SIDEBAR
// ============================================

// ===== DOM ELEMENTS =====
const footerSidebar = document.getElementById("footerSidebar");
const footerSidebarOverlay = document.getElementById("footerSidebarOverlay");



// ===== SIDEBAR OPEN =====
// ===== SIDEBAR OPEN =====

window.footerToggleSidebar = function(){

    console.log("Footer menu clicked");

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

// ===== FOOTER ACTIVE =====

window.footerSetActive = function(element){

    if(!element) return;


    document.querySelectorAll('.footer-bottom-item')
    .forEach(function(item){

        item.classList.remove('active');

    });


    element.classList.add('active');

};
// ===== SIDEBAR TOGGLE =====

window.footerToggleSidebar = function(){

    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("sidebarOverlay");
    const menuBtn = document.getElementById("menuBtn");


    if(!sidebar) return;


    const isOpen = sidebar.classList.contains("active");


    if(isOpen){

        sidebar.classList.remove("active");

        if(overlay){
            overlay.classList.remove("active");
        }

        if(menuBtn){
            menuBtn.classList.remove("active");
        }

        document.body.style.overflow = "";


    }else{

        sidebar.classList.add("active");

        if(overlay){
            overlay.classList.add("active");
        }

        if(menuBtn){
            menuBtn.classList.add("active");
        }

        document.body.style.overflow = "hidden";

    }

};


window.footerCloseSidebar = function(){

    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("sidebarOverlay");

    if(sidebar){
        sidebar.classList.remove("active");
    }

    if(overlay){
        overlay.classList.remove("active");
    }


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

window.footerGoToLogin   = () => alert("Login");

window.footerGoToSignup  = () => alert("Sign Up");

window.footerGoToBonus   = () => alert("Bonus");

window.footerGoToRefer   = () => alert("Refer");

window.footerGoToSupport = () => alert("Support");

window.footerOpenSearch  = () => alert("Search");


// ===== HOME =====

window.footerGoHome = () => {


    window.location.reload();

};


// ===== OVERLAY CLICK =====
if (footerSidebarOverlay) {

    footerSidebarOverlay.addEventListener("click", function(e){

        if(e.target === footerSidebarOverlay){
            footerCloseSidebar();
        }

    });

}


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
// ===== ESC KEY + OUTSIDE CLICK CLOSE =====

function closeFooterSidebar(){

    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("sidebarOverlay");
    const menuBtn = document.getElementById("menuBtn");


    if(sidebar){
        sidebar.classList.remove("active");
    }

    if(overlay){
        overlay.classList.remove("active");
    }

    if(menuBtn){
        menuBtn.classList.remove("active");
    }

    document.body.style.overflow="";
}


// ESC KEY
document.addEventListener("keydown", function(e){

    if(e.key === "Escape"){

        const sidebar = document.getElementById("sidebar");

        if(sidebar && sidebar.classList.contains("active")){
            closeFooterSidebar();
        }

    }

});

/* ==========================================
   MY BETS SYSTEM
========================================== */


/* ==============================
   DATA STORAGE
============================== */

let sportsActiveBets = JSON.parse(
    localStorage.getItem("sportsActiveBets")
) || [];


let sportsBetHistory = JSON.parse(
    localStorage.getItem("sportsBetHistory")
) || [];


let casinoBetHistory = JSON.parse(
    localStorage.getItem("casinoBetHistory")
) || [];


let casinoTopWinners = JSON.parse(
    localStorage.getItem("casinoTopWinners")
) || [];



/* ==============================
   OPEN MY BETS
============================== */

function footerOpenMyBets(){
    lockBodyScroll();

    const myBets =
    document.getElementById("my-bets-page");


    // Toggle Open / Close
    if(myBets.style.display === "block"){

        myBets.style.display = "none";

        return;

    }


    // Hide Other Pages
    document.querySelectorAll(".page-section").forEach(page=>{

        page.style.display="none";

    });


    myBets.style.display="block";


    // Default Sports
    openSportsBets();

    // Default Active
    openSportsActive();

    updateMyBetsCount();

}



/* ==============================
   BACK FROM MY BETS
============================== */


function backFromMyBets(){

    unlockBodyScroll();

    const myBets =
    document.getElementById("my-bets-page");

    if(myBets){

        myBets.style.display="none";

    }

    if(window.currentSportsPage){

        const page =
        document.getElementById(window.currentSportsPage);

        if(page){

            page.style.display="block";

        }

    }

    // Reset Footer Active
    footerSetActive(
        document.getElementById("homeBtn")
    );

}



/* ==============================
   SPORTS / CASINO TAB
============================== */


function openSportsBets(){


    document
    .getElementById(
        "sports-bets-section"
    )
    .style.display="block";


    document
    .getElementById(
        "casino-bets-section"
    )
    .style.display="none";



    setMainTab(
        "sportsTab"
    );


    renderSportsActive();


}



function openCasinoBets(){


    document
    .getElementById(
        "sports-bets-section"
    )
    .style.display="none";


    document
    .getElementById(
        "casino-bets-section"
    )
    .style.display="block";



    setMainTab(
        "casinoTab"
    );


    renderCasinoHistory();


}



/* ==============================
   ACTIVE / HISTORY SPORTS
============================== */


function openSportsActive(){

    document.getElementById("sports-active-container").style.display="block";

    document.getElementById("sports-history-container").style.display="none";


    document.getElementById("sportsActiveTab").classList.add("active");

    document.getElementById("sportsHistoryTab").classList.remove("active");

}



function openSportsHistory(){

    document.getElementById("sports-active-container").style.display="none";

    document.getElementById("sports-history-container").style.display="block";


    // Active Tab Change
    document.getElementById("sportsActiveTab").classList.remove("active");
    document.getElementById("sportsHistoryTab").classList.add("active");


    renderSportsHistory();

}



/* ==============================
   CASINO
============================== */


function openCasinoHistory(){

    document
    .getElementById("casino-history-container")
    .style.display = "block";

    document
    .getElementById("casino-topwinner-container")
    .style.display = "none";

    // Active Tab Change
    document
    .getElementById("casinoMyBetTab")
    .classList.add("active");

    document
    .getElementById("casinoWinnerTab")
    .classList.remove("active");

}



function openCasinoTopWinner(){

    document
    .getElementById("casino-history-container")
    .style.display = "none";

    document
    .getElementById("casino-topwinner-container")
    .style.display = "block";

    // Active Tab Change
    document
    .getElementById("casinoMyBetTab")
    .classList.remove("active");

    document
    .getElementById("casinoWinnerTab")
    .classList.add("active");

    renderTopWinner();

}



/* ==============================
   TAB ACTIVE
============================== */


function setMainTab(id){


    document
    .querySelectorAll(
        ".mybets-main-tab"
    )
    .forEach(btn=>{

        btn.classList.remove(
            "active"
        );

    });


    const btn =
    document.getElementById(id);


    if(btn){

        btn.classList.add(
            "active"
        );

    }


}



/* ==============================
   SPORTS ACTIVE RENDER
============================== */


function renderSportsActive(){


const box =
document.getElementById(
"sports-active-container"
);



if(!box) return;



if(
sportsActiveBets.length===0
){

box.innerHTML=
`
<div class="mybets-empty">

No Active Bet

</div>
`;

return;

}



box.innerHTML=
sportsActiveBets.map(
bet=>{


return `

<div class="sports-bet-card">


<div class="bet-row">

<span class="bet-label">
Match
</span>

<span class="bet-value">
${bet.match}
</span>

</div>


<div class="bet-row">

<span>
Odds
</span>

<span>
${bet.odds}
</span>

</div>


<div class="bet-row">

<span>
Stake
</span>

<span>
${bet.amount}
</span>

</div>


<div class="bet-pending">
Pending
</div>


</div>

`;

}).join("");

}



/* ==============================
   SPORTS HISTORY
============================== */


function renderSportsHistory(){


const box =
document.getElementById(
"sports-history-container"
);



if(!box)return;



if(
sportsBetHistory.length===0
){

box.innerHTML=
`
<div class="mybets-empty">
No History
</div>
`;

return;

}



box.innerHTML =
sportsBetHistory.map(
bet=>{


return`

<div class="sports-bet-card">


<div class="bet-row">

<span>
${bet.time}
</span>

</div>


<div class="bet-row">

<span>
Bet ID
</span>

<span>
${bet.id}
</span>

</div>


<div class="bet-row">

<span>
${bet.match}
</span>

</div>


<div class="${
bet.result==="WIN"
?
"bet-win"
:
"bet-loss"
}">

${bet.result}

</div>


</div>

`;

}).join("");

}



/* ==============================
   CASINO HISTORY
============================== */


function renderCasinoHistory(){


const box =
document.getElementById(
"casino-history-container"
);


if(!box)return;


if(
casinoBetHistory.length===0
){

box.innerHTML=
`
<div class="mybets-empty">
No Casino Bet
</div>
`;

return;

}


box.innerHTML =
casinoBetHistory.map(
bet=>{


return`

<div class="casino-bet-card">


<div class="bet-row">

${bet.time}

</div>


<div class="bet-row">

Bet ID:
${bet.id}

</div>


<div class="bet-row">

${bet.game}

</div>


<div class="${
bet.result==="WIN"
?
"bet-win"
:
"bet-loss"
}">

${bet.result}

</div>


<button class="bet-view-btn">

View →

</button>


</div>

`;

}).join("");

}



/* ==============================
   TOP WINNER
============================== */


function renderTopWinner(){


const box =
document.getElementById(
"casino-topwinner-container"
);


if(!box)return;



box.innerHTML =
casinoTopWinners.map(
item=>{


return`

<div class="top-winner-card">

<div class="top-winner-name">

${item.name}

</div>

<div>

${item.game}

</div>


<div class="bet-win">

${item.amount}

</div>


</div>

`;

}).join("");

}



/* ==============================
   FOOTER BADGE
============================== */


function updateMyBetsCount(){


const badge =
document.getElementById(
"myBetsCount"
);


if(!badge)return;


badge.innerText =
sportsActiveBets.length;


}
window.footerOpenMyBets = footerOpenMyBets;



/* ==========================================
   END MY BETS SYSTEM
========================================== */




// OUTSIDE CLICK
document.addEventListener("click", function(e){

    const sidebar = document.getElementById("sidebar");
    const menuBtn = document.getElementById("menuBtn");


    if(
        sidebar &&
        sidebar.classList.contains("active") &&
        !sidebar.contains(e.target) &&
        !menuBtn.contains(e.target)
    ){

        closeFooterSidebar();

    }

});


// ===== INITIALIZE =====
footerCloseSidebar();

console.log("✅ footer.js Ready!");
