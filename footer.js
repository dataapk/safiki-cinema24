// ===========================================
// FOOTER SIDEBAR
// ===========================================

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


 // ======================================================
// FOOTER SPORTS — DYNAMIC GAMES
// ======================================================

window.renderFooterSportsGames = function () {

    const games =
        getAllSportsGames()
            .filter(game =>
                isSportsGameEnabled(game)
            );


    // ==================================================
    // EXISTING LEAGUE CONTAINERS
    // ==================================================

    const leagueContainers = {

        "Asia Cup T20":
            "footerAsiaCupDynamic",

        "International T20":
            "footerInternationalT20Dynamic",

        "International ODI":
            "footerInternationalODIDynamic",

        "Premier League":
            "footerPremierLeagueDynamic",

        "La Liga":
            "footerLaLigaDynamic",

        "Champions League":
            "footerChampionsLeagueDynamic",

        "Barsalona":
        "footerBarsalonaDynamic"

    };


    // ==================================================
    // SPORT CONTAINERS
    // Used when game has NO league
    // ==================================================

    const sportContainers = {

        cricket:
            "footerCricketDynamic",

        football:
            "footerFootballDynamic",

        basketball:
            "footerBasketballDynamic",

        tennis:
            "footerTennisDynamic",

        volleyball:
            "footerVolleyballDynamic",

        boxing:
            "footerBoxingDynamic",

        hockey:
            "footerHockeyDynamic",

        rugby:
            "footerRugbyDynamic",

        golf:
            "footerGolfDynamic"

    };


    // ==================================================
    // CLEAR EXISTING LEAGUE CONTAINERS
    // ==================================================

    Object.values(
        leagueContainers
    ).forEach(
        containerId => {

            const container =
                document.getElementById(
                    containerId
                );

            if (container) {
                container.innerHTML = "";
            }

        }
    );


    // ==================================================
    // CLEAR DIRECT SPORT CONTAINERS
    // ==================================================

    Object.values(
        sportContainers
    ).forEach(
        containerId => {

            const container =
                document.getElementById(
                    containerId
                );

            if (container) {
                container.innerHTML = "";
            }

        }
    );


    // ==================================================
    // STATUS TITLE
    // ==================================================

    function getStatusTitle(status) {

        if (status === "live") {
            return "🔥 LIVE";
        }

        if (status === "upcoming") {
            return "⏱ UPCOMING";
        }

        if (status === "featured") {
            return "⭐ FEATURED";
        }

        return "";

    }


    // ==================================================
    // CREATE GAME ROW
    // ==================================================

    function createFooterGameRow(game, status) {

        const row =
            document.createElement(
                "div"
            );


        row.className =
            "footer-dynamic-game";


        row.dataset.gameId =
            game.game_id;


        row.dataset.footerStatus =
            status;


        row.innerHTML = `

            <i class="fas fa-circle"></i>

            <span>
                ${
                    game.home_team ||
                    ""
                }
                vs
                ${
                    game.away_team ||
                    ""
                }
            </span>

        `;


        // ==================================================
        // GAME CLICK
        // ==================================================

        row.onclick =
            function (event) {

                event.stopPropagation();

                window.openedSportsGameFromFooter =
                    true;

                footerCloseSidebar();

                openSportsGame(
                    game.sport,
                    game.game_id
                );

            };


        return row;

    }


    // ==================================================
    // RENDER STATUS SECTIONS
    // ==================================================

    function renderStatusGames(
        container,
        statusGames
    ) {

        const statuses = [
            "live",
            "upcoming",
            "featured"
        ];


        statuses.forEach(
            status => {

                const gamesForStatus =
                    statusGames.filter(
                        game => {

                            return (
                                normalizeSportsStatus(
                                    game.status
                                ) === status
                            );

                        }
                    );


                // Empty status
                // Do not show anything
                if (
                    gamesForStatus.length === 0
                ) {
                    return;
                }


                const section =
                    document.createElement(
                        "div"
                    );


                section.className =
                    "footer-sport-status-section";


                const title =
                    document.createElement(
                        "div"
                    );


                title.className =
                    "footer-sport-status-title";


                title.textContent =
                    getStatusTitle(
                        status
                    );


                section.appendChild(
                    title
                );


                gamesForStatus.forEach(
                    game => {

                        const row =
                            createFooterGameRow(
                                game,
                                status
                            );


                        section.appendChild(
                            row
                        );

                    }
                );


                container.appendChild(
                    section
                );

            }
        );

    }


    // ==================================================
    // 1. RENDER GAMES WITH LEAGUE
    // ==================================================

    games
        .filter(
            game =>
                game.league &&
                String(
                    game.league
                ).trim() !== ""
        )
        .forEach(
            game => {

                const league =
                    String(
                        game.league
                    ).trim();


                // ==================================================
                // ONLY USE EXISTING LEAGUE CONTAINERS
                // ==================================================

                const containerId =
                    leagueContainers[
                        league
                    ];


                // ==================================================
                // LEAGUE DOES NOT EXIST IN FOOTER
                // DO NOT CREATE A NEW LEAGUE
                // ==================================================

                if (!containerId) {
                    return;
                }


                const container =
                    document.getElementById(
                        containerId
                    );


                if (!container) {
                    return;
                }


                // ==================================================
                // STORE GAME FOR THIS EXISTING LEAGUE
                // ==================================================

                if (
                    !container._footerLeagueGames
                ) {

                    container._footerLeagueGames =
                        [];

                }


                container._footerLeagueGames.push(
                    game
                );

            }
        );



   // ==================================================
// 2. RENDER EXISTING LEAGUE GAMES
// ==================================================

Object.entries(
    leagueContainers
).forEach(
    ([league, containerId]) => {

        const container =
            document.getElementById(
                containerId
            );

        if (!container) {
            return;
        }


        const leagueGames =
            container._footerLeagueGames ||
            [];


        // ==================================================
        // NO GAMES INSIDE THIS LEAGUE
        // ==================================================

        if (
            leagueGames.length === 0
        ) {

            container.innerHTML = `

                <div class="footer-no-games">
                    No Games Available
                </div>

            `;

            return;
        }


        // ==================================================
        // RENDER LEAGUE GAMES
        // ==================================================

        renderStatusGames(
            container,
            leagueGames
        );


        delete container._footerLeagueGames;

    }
);

// ==================================================
// RENDER GAMES WITHOUT LEAGUE
// ==================================================

Object.entries(
    sportContainers
).forEach(
    ([sport, containerId]) => {

        const container =
            document.getElementById(
                containerId
            );

        if (!container) {
            return;
        }


        // Only games with NO league
        const directGames =
            games.filter(
                game => {

                    const gameSport =
                        normalizeSportsSport(
                            game.sport
                        );

                    const hasLeague =
                        game.league &&
                        String(
                            game.league
                        ).trim() !== "";

                    return (
                        gameSport === sport &&
                        !hasLeague
                    );

                }
            );


        // No direct games
        if (
            directGames.length === 0
        ) {
            return;
        }


        // Render LIVE / UPCOMING / FEATURED
        renderStatusGames(
            container,
            directGames
        );

    }
);

    // ==================================================
    // 5. NO GAMES AVAILABLE
    // ==================================================

    Object.entries(
        sportContainers
    ).forEach(
        ([sport, containerId]) => {

            const container =
                document.getElementById(
                    containerId
                );


            if (!container) {
                return;
            }


            const sportHasGames =
                games.some(
                    game => {

                        return (
                            normalizeSportsSport(
                                game.sport
                            ) === sport
                        );

                    }
                );


            if (
                sportHasGames
            ) {
                return;
            }


            // Only show fallback when
            // the sport has absolutely no games.

            container.innerHTML = `

                <div class="footer-no-games">
                    No Games Available
                </div>

            `;

        }
    );

};


// ============================================
// FOOTER MENU SUB TOGGLE
// ============================================

window.footerToggleMenuSub = function(menuSubId, arrowId) {

    const menuSub =
        document.getElementById(menuSubId);

    const arrow =
        document.getElementById(arrowId);

    if (!menuSub) return;


    // ==========================================
    // FIND CURRENT MENU LEVEL
    // ==========================================

    const parentContainer =
        menuSub.parentElement;

    if (!parentContainer) return;


    // ==========================================
    // MAIN MENU CHECK
    // Casino / Sports / Virtual Sports
    // ==========================================

    const mainMenuIds = [
        "casinoMenuSub",
        "sportsMenuSub",
        "virtualSportsMenuSub"
    ];

    const isMainMenu =
        mainMenuIds.includes(menuSubId);


    // ==========================================
    // MAIN MENU BEHAVIOR
    // ==========================================
    // ==========================================
// SPORTS MAIN SECTIONS
// ==========================================

const sportsSectionIds = [
    "footerCricketSub",
    "footerFootballSub",
    "footerBasketballSub",
    "footerTennisSub",
    "footerVolleyballSub",
    "footerBoxingSub",
    "footerHockeySub",
    "footerRugbySub",
    "footerGolfSub"
];

const isSportsSection =
    sportsSectionIds.includes(menuSubId);


// ==========================================
// SPORTS SECTION BEHAVIOR
// ==========================================

if (isSportsSection) {

    sportsSectionIds.forEach(function(id) {

        if (id === menuSubId) return;

        const otherMenu =
            document.getElementById(id);

        if (!otherMenu) return;


        // Close other Sports section
        otherMenu.classList.add(
            "footer-menusub-hidden"
        );


        // Reset other Sports arrow
        const otherParent =
            otherMenu.closest(
                ".footer-menu-item"
            );

        if (otherParent) {

            const otherArrow =
                otherParent.querySelector(
                    ".footer-menu-header .footer-arrow"
                );

            if (otherArrow) {

                otherArrow.classList.remove(
                    "rotate"
                );

            }

        }


        // Reset inner opened menus
        otherMenu
            .querySelectorAll(
                ".footer-menusub-list, .footer-nested-submenu, .footer-match-list"
            )
            .forEach(function(sub) {

                sub.classList.add(
                    "footer-menusub-hidden"
                );

            });


        // Reset inner arrows
        otherMenu
            .querySelectorAll(
                ".footer-arrow, .footer-nested-arrow, .footer-league-arrow"
            )
            .forEach(function(innerArrow) {

                innerArrow.classList.remove(
                    "rotate"
                );

            });

    });

}


// ==========================================
// MAIN MENU BEHAVIOR
// ==========================================

    if (isMainMenu) {

        // ------------------------------------------
        // Close other Main Menus only
        // ------------------------------------------

        mainMenuIds.forEach(function(id) {

            if (id === menuSubId) return;


            const otherMenu =
                document.getElementById(id);

            if (!otherMenu) return;


            otherMenu.classList.add(
                "footer-menusub-hidden"
            );


            // Reset other Main Menu arrow
            const otherParent =
                otherMenu.closest(
                    ".footer-menu-item"
                );


            if (otherParent) {

                const otherArrow =
                    otherParent.querySelector(
                        ".footer-menu-header .footer-arrow"
                    );


                if (otherArrow) {

                    otherArrow.classList.remove(
                        "rotate"
                    );

                }

            }

        });


        // ------------------------------------------
        // Toggle Current Main Menu
        // ------------------------------------------

        const isClosed =
            menuSub.classList.contains(
                "footer-menusub-hidden"
            );


        if (isClosed) {

            menuSub.classList.remove(
                "footer-menusub-hidden"
            );


            if (arrow) {

                arrow.classList.add(
                    "rotate"
                );

            }

        } else {

    menuSub.classList.add(
        "footer-menusub-hidden"
    );

    if (arrow) {

        arrow.classList.remove(
            "rotate"
        );

    }


    // ==========================================
    // RESET ALL INNER MENUS
    // ==========================================

    menuSub
        .querySelectorAll(
            ".footer-menusub-list, .footer-nested-submenu, .footer-match-list"
        )
        .forEach(function(sub) {

            sub.classList.add(
                "footer-menusub-hidden"
            );

        });


    // ==========================================
    // RESET ALL INNER ARROWS
    // ==========================================

    menuSub
        .querySelectorAll(
            ".footer-arrow, .footer-nested-arrow, .footer-league-arrow"
        )
        .forEach(function(innerArrow) {

            innerArrow.classList.remove(
                "rotate"
            );

        });

}

        return;

    }


    // ==========================================
    // CLOSE ONLY SIBLING SUB MENUS
    // Cricket / Football / League / Match
    // ==========================================

    Array.from(parentContainer.children).forEach(
        function(child) {

            if (child === menuSub) return;


            /*
             * Only look for submenu elements
             * belonging to this same level.
             */

            const siblingSub =
                child.classList &&
                (
                    child.classList.contains(
                        "footer-menusub-list"
                    ) ||
                    child.classList.contains(
                        "footer-nested-submenu"
                    ) ||
                    child.classList.contains(
                        "footer-match-list"
                    )
                )
                    ? child
                    : null;


            if (!siblingSub) return;


            siblingSub.classList.add(
                "footer-menusub-hidden"
            );


            /*
             * Reset arrow belonging
             * to this sibling menu.
             */

            const siblingArrow =
                child.querySelector(
                    ".footer-arrow, .footer-nested-arrow, .footer-league-arrow"
                );


            if (siblingArrow) {

                siblingArrow.classList.remove(
                    "rotate"
                );

            }

        }
    );


    // ==========================================
    // TOGGLE CURRENT NESTED MENU
    // ==========================================

    const isClosed =
        menuSub.classList.contains(
            "footer-menusub-hidden"
        );


    if (isClosed) {

        menuSub.classList.remove(
            "footer-menusub-hidden"
        );


        if (arrow) {

            arrow.classList.add(
                "rotate"
            );

        }

    } else {

        menuSub.classList.add(
            "footer-menusub-hidden"
        );


        if (arrow) {

            arrow.classList.remove(
                "rotate"
            );

        }

    }

};

// ===== FOOTER ACTIVE =====

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

async function footerOpenMyBets(){

    // ==========================================
    // CHECK LOGIN STATUS
    // ==========================================

    const {
        data: { session }
    } = await supabaseClient.auth.getSession();


    // ==========================================
    // GUEST USER
    // ==========================================

    if(!session || !session.user){

        // Guest হলে My Bets খুলবে না
        // সরাসরি Login Page খুলবে

        openLogin();

        return;

    }


        // ==========================================
    // REAL USER
    // ==========================================

    lockBodyScroll();

    const myBets =
        document.getElementById("my-bets-popup");


    if(!myBets) {

        console.error(
            "My Bets popup element not found: #my-bets-popup"
        );

        return;

    }


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
//footerCloseSidebar();

// =====================================================
// PREMIUM FOOTER INFORMATION POPUP
// =====================================================

window.openFooterInfo = function (type) {

    const popup =
        document.getElementById("footerInfoPopup");

    const title =
        document.getElementById("footerInfoTitle");

    const content =
        document.getElementById("footerInfoContent");

    if (!popup || !title || !content) {
        console.log("Footer info popup elements not found");
        return;
    }

    const footerInfo = {

        about: {
            title: "About Us",
            content: `
                <h4>Welcome to SPORTS BET</h4>

                <p>
                    SPORTS BET is an online platform designed
                    to provide users with a simple and convenient
                    destination for sports entertainment and gaming.
                </p>

                <p>
                    Our goal is to create a clean, user-friendly
                    experience where users can easily explore
                    available sports and entertainment options.
                </p>
            `
        },

        promotions: {
            title: "Promotions",
            content: `
                <h4>Current Promotions</h4>

                <p>
                    Discover our latest promotional offers,
                    special events and seasonal campaigns.
                </p>

                <p>
                    Promotional terms, eligibility requirements
                    and applicable conditions will be displayed
                    here.
                </p>
            `
        },

        contact: {
            title: "Contact Us",
            content: `
                <h4>We're Here to Help</h4>

                <p>
                    If you have any questions or need assistance,
                    please contact our support team.
                </p>

                <p>
                    Email: support@example.com
                </p>
            `
        },

        affiliate: {
            title: "Affiliate",
            content: `
                <h4>Affiliate Program</h4>

                <p>
                    Our affiliate program allows partners to
                    introduce new users to SPORTS BET and
                    participate in our partnership program.
                </p>

                <p>
                    More information about registration,
                    commission structure and requirements
                    will be added here.
                </p>
            `
        },

        help: {
            title: "Help Center",
            content: `
                <h4>How Can We Help?</h4>

                <p>
                    Find helpful information about your account,
                    deposits, withdrawals, sports markets and
                    general platform navigation.
                </p>

                <p>
                    If you cannot find the answer you need,
                    please contact our support team.
                </p>
            `
        },

        faq: {
            title: "FAQ",
            content: `
                <h4>Frequently Asked Questions</h4>

                <p>
                    <strong>How do I create an account?</strong><br>
                    Follow the registration process and provide
                    the required information.
                </p>

                <p>
                    <strong>How can I contact support?</strong><br>
                    Use our Contact Us section for assistance.
                </p>

                <p>
                    <strong>Where can I find the latest offers?</strong><br>
                    Visit the Promotions section.
                </p>
            `
        },

        terms: {
            title: "Terms & Conditions",
            content: `
                <h4>Terms & Conditions</h4>

                <p>
                    These terms describe the rules and conditions
                    applicable to the use of the SPORTS BET platform.
                </p>

                <p>
                    Please read all applicable terms carefully
                    before using the platform.
                </p>
            `
        },

        privacy: {
            title: "Privacy Policy",
            content: `
                <h4>Your Privacy Matters</h4>

                <p>
                    We respect user privacy and are committed to
                    protecting information provided through our platform.
                </p>

                <p>
                    Details regarding information collection,
                    usage, storage and protection will be provided
                    in this section.
                </p>
            `
        },

        responsible: {
            title: "Responsible Gaming",
            content: `
                <h4>Play Responsibly</h4>

                <p>
                    Gaming should always be treated as entertainment.
                    Please set reasonable limits and never spend more
                    than you can afford.
                </p>

                <p>
                    SPORTS BET is intended for adults only.
                    If gaming becomes difficult to control,
                    seek appropriate support.
                </p>
            `
        }

    };

    const info =
        footerInfo[type];

    if (!info) {
        console.log(
            "Footer information type not found:",
            type
        );
        return;
    }

    title.textContent =
        info.title;

    content.innerHTML =
        info.content;

    popup.style.display =
        "flex";

    document.body.style.overflow =
        "hidden";
};


// =====================================================
// CLOSE FOOTER INFORMATION POPUP
// =====================================================

window.closeFooterInfo = function () {

    const popup =
        document.getElementById("footerInfoPopup");

    if (!popup) {
        return;
    }

    popup.style.display =
        "none";

    document.body.style.overflow =
        "";
};

console.log("✅ footer.js Ready!");
