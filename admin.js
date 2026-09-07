// ======================================================
// SAFIKI ADMIN PANEL ENGINE
// ======================================================


// ======================================================
// GLOBAL ADMIN SPORTS CACHE
// ======================================================

window.adminSportsGames =
    window.adminSportsGames || {};

window.adminSportsGamesLoaded =
    false;

window.activeSportsGameId =
    null;

window.currentAddSportsGame =
    "";

window.currentEditingSportsGame =
    null;

window.pendingDeleteSportsGameId =
    "";


// ======================================================
// DOM READY
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        // ==================================================
        // INIT SIDEBAR
        // ==================================================

        initSidebar();


        // ==================================================
        // GAME LOAD BUTTON LOGIC
        // ==================================================

        const btn =
            document.getElementById(
                "loadGameBtn"
            );


        if (btn) {

            btn.addEventListener(
                "click",
                function () {

                    const selector =
                        document.getElementById(
                            "gameSelector"
                        );


                    const game =
                        selector
                            ? selector.value
                            : "";


                    if (!game) {

                        alert(
                            "Select a game first"
                        );

                        return;

                    }


                    const statsSection =
                        document.getElementById(
                            "gameStatsSection"
                        );


                    if (statsSection) {

                        statsSection.style.display =
                            "block";

                    }


                    console.log(
                        "Game selected:",
                        game
                    );

                }
            );

        }


        // ==================================================
        // RTP SLIDER
        // ==================================================

        const rtpSlider =
            document.getElementById(
                "gs_rtp"
            );


        if (rtpSlider) {

            rtpSlider.addEventListener(
                "input",
                function () {

                    const output =
                        document.getElementById(
                            "gs_rtp_value"
                        );


                    if (output) {

                        output.innerText =
                            this.value + "%";

                    }

                }
            );

        }


        // ==================================================
        // ADMIN SPORTS SYSTEM
        // ==================================================

        console.log(
            "🏏 ADMIN SPORTS SYSTEM READY"
        );


        loadAdminSportsGames();

    }
);


// ======================================================
// SIDEBAR SYSTEM
// ======================================================

function initSidebar() {

    const menuItems =
        document.querySelectorAll(
            ".sidebar-menu > li:not(#gamesMenu)"
        );


    const sections =
        document.querySelectorAll(
            ".admin-section"
        );


    // ==================================================
    // NORMAL SIDEBAR MENU ITEMS
    // ==================================================

    menuItems.forEach(
        item => {

            item.addEventListener(
                "click",
                function () {

                    const target =
                        item.getAttribute(
                            "data-target"
                        );


                    document
                        .querySelectorAll(
                            ".sidebar-menu > li"
                        )
                        .forEach(
                            menuItem => {

                                menuItem.classList.remove(
                                    "active"
                                );

                            }
                        );


                    item.classList.add(
                        "active"
                    );


                    sections.forEach(
                        section => {

                            section.style.display =
                                "none";

                        }
                    );


                    const activeSection =
                        document.getElementById(
                            target
                        );


                    if (activeSection) {

                        activeSection.style.display =
                            "block";


                        activeSection.scrollIntoView({
                            behavior: "smooth"
                        });

                    }

                }
            );

        }
    );


    // ==================================================
    // GAMES PARENT MENU
    // ==================================================

    const gamesMenu =
        document.getElementById(
            "gamesMenu"
        );


    const gamesSubmenu =
        gamesMenu
            ? gamesMenu.querySelector(
                ".games-submenu"
            )
            : null;


    const gamesArrow =
        gamesMenu
            ? gamesMenu.querySelector(
                ".games-menu-arrow"
            )
            : null;


    if (gamesMenu) {

        gamesMenu.addEventListener(
            "click",
            function (event) {

                const clickedSubItem =
                    event.target.closest(
                        ".games-submenu li"
                    );


                if (clickedSubItem) {

                    return;

                }


                if (!gamesSubmenu) {

                    return;

                }


                const isOpen =
                    gamesSubmenu.style.display ===
                    "block";


                gamesSubmenu.style.display =
                    isOpen
                        ? "none"
                        : "block";


                if (gamesArrow) {

                    gamesArrow.textContent =
                        isOpen
                            ? "▾"
                            : "▴";

                }

            }
        );

    }


    // ==================================================
    // SPORTS SUB MENU
    // ==================================================

    const sportsSubMenu =
        document.getElementById(
            "sportsSubMenu"
        );


    if (sportsSubMenu) {

        sportsSubMenu.addEventListener(
            "click",
            function (event) {

                event.stopPropagation();


                document
                    .querySelectorAll(
                        ".sidebar-menu > li"
                    )
                    .forEach(
                        menuItem => {

                            menuItem.classList.remove(
                                "active"
                            );

                        }
                    );


                if (gamesMenu) {

                    gamesMenu.classList.add(
                        "active"
                    );

                }


                sections.forEach(
                    section => {

                        section.style.display =
                            "none";

                    }
                );


                const gamesSection =
                    document.getElementById(
                        "gamesSection"
                    );


                if (gamesSection) {

                    gamesSection.style.display =
                        "block";

                    gamesSection.scrollIntoView({
                        behavior: "smooth"
                    });

                }


                openSportsSection();

            }
        );

    }

    // ==================================================
// VIRTUAL SPORTS SUB MENU
// ==================================================

const virtualSportsSubMenu =
    document.getElementById(
        "virtualSportsSubMenu"
    );


if (virtualSportsSubMenu) {

    virtualSportsSubMenu.addEventListener(
        "click",
        function (event) {

            event.stopPropagation();


            document
                .querySelectorAll(
                    ".sidebar-menu > li"
                )
                .forEach(
                    menuItem => {

                        menuItem.classList.remove(
                            "active"
                        );

                    }
                );


            if (gamesMenu) {

                gamesMenu.classList.add(
                    "active"
                );

            }


            sections.forEach(
                section => {

                    section.style.display =
                        "none";

                }
            );


            const gamesSection =
                document.getElementById(
                    "gamesSection"
                );


            if (gamesSection) {

                gamesSection.style.display =
                    "block";

                gamesSection.scrollIntoView({
                    behavior: "smooth"
                });

            }


            openVirtualSportsSection();

        }
    );

}


    // ==================================================
    // CASINO SUB MENU
    // ==================================================

    const casinoSubMenu =
        document.getElementById(
            "casinoSubMenu"
        );


    if (casinoSubMenu) {

        casinoSubMenu.addEventListener(
            "click",
            function (event) {

                event.stopPropagation();


                document
                    .querySelectorAll(
                        ".sidebar-menu > li"
                    )
                    .forEach(
                        menuItem => {

                            menuItem.classList.remove(
                                "active"
                            );

                        }
                    );


                if (gamesMenu) {

                    gamesMenu.classList.add(
                        "active"
                    );

                }


                sections.forEach(
                    section => {

                        section.style.display =
                            "none";

                    }
                );


                const gamesSection =
                    document.getElementById(
                        "gamesSection"
                    );


                if (gamesSection) {

                    gamesSection.style.display =
                        "block";

                    gamesSection.scrollIntoView({
                        behavior: "smooth"
                    });

                }


                openCasinoSection();

            }
        );

    }

}


// ======================================================
// RTP FUNCTION START
// ======================================================

function toggleRtpPanel() {

    const panel =
        document.getElementById(
            "rtpPanel"
        );


    if (!panel) return;


    panel.style.display =
        panel.style.display === "block"
            ? "none"
            : "block";

}


function saveRtp() {

    const input =
        document.getElementById(
            "rtpInput"
        );


    if (!input) return;


    const rtp =
        input.value;


    const currentRtp =
        document.getElementById(
            "currentRtp"
        );


    const houseEdge =
        document.getElementById(
            "houseEdge"
        );


    if (currentRtp) {

        currentRtp.innerText =
            rtp + "%";

    }


    if (houseEdge) {

        houseEdge.innerText =
            (100 - rtp) + "%";

    }


    alert(
        "RTP Updated"
    );

}


// ======================================================
// RTP FUNCTION END
// ======================================================


// ======================================================
// PLAYER CONTROL START
// ======================================================

function togglePlayerPanel() {

    const panel =
        document.getElementById(
            "playerPanel"
        );


    if (!panel) return;


    panel.style.display =
        panel.style.display === "block"
            ? "none"
            : "block";

}


function savePlayerSettings() {

    alert(
        "Player Settings Saved"
    );

}


// ======================================================
// PLAYER CONTROL END
// ======================================================


// ======================================================
// ADMIN ACTIONS ENGINE
// ======================================================

function addBalance() {

    openAdminModal(
        "Add Balance",
        `
        <input
            type="text"
            id="balanceUserId"
            placeholder="User ID">

        <input
            type="number"
            id="balanceAmount"
            placeholder="Amount">

        <button onclick="confirmAddBalance()">
            Add Balance
        </button>
        `
    );

}


function confirmAddBalance() {

    const userInput =
        document.getElementById(
            "balanceUserId"
        );


    const amountInput =
        document.getElementById(
            "balanceAmount"
        );


    const userId =
        userInput
            ? userInput.value
            : "";


    const amount =
        amountInput
            ? amountInput.value
            : "";


    alert(
        "Balance Added\nUser: " +
        userId +
        "\nAmount: " +
        amount
    );


    closeAdminModal();

}


function deductBalance() {

    openAdminModal(
        "Deduct Balance",
        `
        <input
            type="text"
            id="deductUserId"
            placeholder="User ID">

        <input
            type="number"
            id="deductAmount"
            placeholder="Amount">

        <button onclick="confirmDeductBalance()">
            Deduct Balance
        </button>
        `
    );

}


function confirmDeductBalance() {

    const userInput =
        document.getElementById(
            "deductUserId"
        );


    const amountInput =
        document.getElementById(
            "deductAmount"
        );


    const userId =
        userInput
            ? userInput.value
            : "";


    const amount =
        amountInput
            ? amountInput.value
            : "";


    alert(
        "Balance Deducted\nUser: " +
        userId +
        "\nAmount: " +
        amount
    );


    closeAdminModal();

}


function suspendUser() {

    openAdminModal(
        "Suspend User",
        `
        <input
            type="text"
            id="suspendUserId"
            placeholder="User ID">

        <select id="suspendDuration">

            <option>24 Hours</option>
            <option>7 Days</option>
            <option>30 Days</option>
            <option>Permanent</option>

        </select>

        <button onclick="confirmSuspendUser()">
            Suspend User
        </button>
        `
    );

}


function confirmSuspendUser() {

    const userInput =
        document.getElementById(
            "suspendUserId"
        );


    const durationInput =
        document.getElementById(
            "suspendDuration"
        );


    const userId =
        userInput
            ? userInput.value
            : "";


    const duration =
        durationInput
            ? durationInput.value
            : "";


    alert(
        "User Suspended\nUser: " +
        userId +
        "\nDuration: " +
        duration
    );


    closeAdminModal();

}


function deleteUser() {

    openAdminModal(
        "Delete User",
        `
        <input
            type="text"
            id="deleteUserId"
            placeholder="User ID">

        <button onclick="confirmDeleteUser()">
            Permanently Delete
        </button>
        `
    );

}


function confirmDeleteUser() {

    const input =
        document.getElementById(
            "deleteUserId"
        );


    const userId =
        input
            ? input.value
            : "";


    const confirmDelete =
        confirm(
            "Delete User ID: " +
            userId +
            " ?"
        );


    if (confirmDelete) {

        alert(
            "User Deleted: " +
            userId
        );


        closeAdminModal();

    }

}


// ======================================================
// NOTIFICATION START
// ======================================================

function sendNotification() {

    const titleInput =
        document.getElementById(
            "notifTitle"
        );


    const msgInput =
        document.getElementById(
            "notifMessage"
        );


    const title =
        titleInput
            ? titleInput.value
            : "";


    const msg =
        msgInput
            ? msgInput.value
            : "";


    if (!title || !msg) {

        alert(
            "Fill Notification Data"
        );

        return;

    }


    alert(
        "Notification Sent"
    );

}


// ======================================================
// NOTIFICATION END
// ======================================================


// ======================================================
// ADMIN MODAL
// ======================================================

function openModal(
    action,
    userId = null
) {

    const modal =
        document.getElementById(
            "adminModal"
        );


    const title =
        document.getElementById(
            "modalTitle"
        );


    const body =
        document.getElementById(
            "modalBody"
        );


    if (!modal) return;


    modal.style.display =
        "block";


    if (title) {

        title.innerHTML =
            action;

    }


    if (body) {

        body.innerHTML =
            "User ID : " +
            userId;

    }

}


// ======================================================
// ACTION PANEL
// ======================================================

function toggleActionPanel(
    panelId,
    btn = null
) {

    const target =
        document.getElementById(
            panelId
        );


    const isOpen =
        target &&
        target.style.display === "block";


    const panels =
        document.querySelectorAll(
            ".sub-panel"
        );


    const buttons =
        document.querySelectorAll(
            ".profile-toggle-btn"
        );


    if (isOpen) {

        target.style.display =
            "none";


        if (btn) {

            btn.classList.remove(
                "active"
            );

        }


        return;

    }


    panels.forEach(
        panel => {

            panel.style.display =
                "none";

        }
    );


    buttons.forEach(
        button => {

            button.classList.remove(
                "active"
            );

        }
    );


    if (target) {

        target.style.display =
            "block";

    }


    if (btn) {

        btn.classList.add(
            "active"
        );

    }

}


function toggleActionButtons() {

    const panel =
        document.getElementById(
            "actionButtons"
        );


    if (!panel) return;


    panel.style.display =
        panel.style.display === "block"
            ? "none"
            : "block";

}


// ======================================================
// GAMES SECTION JS START
// SPORTS CONTROL PANEL
// ======================================================

window.activeGameId =
    null;

window.activeSportsGameId =
    null;


// ======================================================
// OPEN GAME SETTINGS PANEL
// ======================================================

function openGameSettings(gameId) {

    const panel =
        document.getElementById(
            "gameSettingsPanel"
        );


    if (!panel) return;


    if (
        window.activeGameId ===
        gameId
    ) {

        const isVisible =
            window.getComputedStyle(
                panel
            ).display !==
            "none";


        if (isVisible) {

            panel.style.display =
                "none";

            window.activeGameId =
                null;

            return;

        }

    }


    window.activeGameId =
        gameId;


    panel.style.display =
        "block";


    const idElement =
        document.getElementById(
            "gs_id"
        );


    const nameElement =
        document.getElementById(
            "gs_name"
        );


    if (idElement) {

        idElement.innerText =
            gameId;

    }


    if (nameElement) {

        nameElement.innerText =
            getGameName(
                gameId
            );

    }

}


// ======================================================
// GAME SUB SECTION
// SPORTS CONTROL PANEL
// ======================================================

window.openSportsSection =
function () {

    const sports =
        document.getElementById(
            "sportsSection"
        );

    const casino =
        document.getElementById(
            "casinoSection"
        );

    const virtualEsports =
        document.getElementById(
            "virtualEsportsSection"
        );

    const title =
        document.getElementById(
            "gamesControlPanelTitle"
        );


    // ------------------------------------------
    // TITLE
    // ------------------------------------------

    if (title) {

        title.textContent =
            "Sports Control Panel";

    }


    // ------------------------------------------
    // HIDE OTHER MAIN GAME SECTIONS
    // ------------------------------------------

    if (casino) {

        casino.style.display =
            "none";

    }

    if (virtualEsports) {

        virtualEsports.style.display =
            "none";

    }


    // ------------------------------------------
    // SHOW SPORTS
    // ------------------------------------------

    if (sports) {

        sports.style.display =
            "block";

    }


    // ------------------------------------------
    // HIDE SPORTS SUB SECTIONS
    // ------------------------------------------

    hideAllAdminSportsSections();

};

// ======================================================
// VIRTUAL ESPORTS CONTROL PANEL
// ======================================================

window.openVirtualSportsSection =
function () {

    const sports =
        document.getElementById(
            "sportsSection"
        );

    const casino =
        document.getElementById(
            "casinoSection"
        );

    const virtualSports =
        document.getElementById(
            "virtualSportsSection"
        );

    const title =
        document.getElementById(
            "gamesControlPanelTitle"
        );


    if (!virtualSports) {

        console.warn(
            "⚠️ ADMIN: Virtual Esports section not found."
        );

        return;

    }


    // ------------------------------------------
    // TITLE
    // ------------------------------------------


if (title) {

    title.textContent =
        "Virtual Sports Control Panel";

}


    // ------------------------------------------
    // HIDE SPORTS
    // ------------------------------------------

    if (sports) {

        sports.style.display =
            "none";

    }


    // ------------------------------------------
    // HIDE CASINO
    // ------------------------------------------

    if (casino) {

        casino.style.display =
            "none";

    }


    // ------------------------------------------
    // SHOW VIRTUAL SPORTS
    // ------------------------------------------

    virtualsports.style.display =
        "block";


    // ------------------------------------------
    // HIDE VIRTUAL GAME PANELS
    // ------------------------------------------

    const cricket =
        document.getElementById(
            "virtualCricketSection"
        );

    const football =
        document.getElementById(
            "virtualFootballSection"
        );


    if (cricket) {

        cricket.style.display =
            "none";

    }


    if (football) {

        football.style.display =
            "none";

    }

};


// ======================================================
// OPEN CASINO SECTION
// ======================================================

window.openCasinoSection =
function () {

    const sports =
        document.getElementById(
            "sportsSection"
        );


    const casino =
        document.getElementById(
            "casinoSection"
        );


    const title =
        document.getElementById(
            "gamesControlPanelTitle"
        );


    if (title) {

        title.textContent =
            "Casino Control Panel";

    }


    if (sports) {

        sports.style.display =
            "none";

    }


    hideAllAdminSportsSections();


    // ==================================================
    // CLOSE OPEN EDIT MATCH PANEL
    // ==================================================

    const editModal =
        document.getElementById(
            "sportsGameEditModal"
        );


    if (editModal) {

        editModal.style.display =
            "none";

    }


    document
        .querySelectorAll(
            ".sports-game-edit-modal"
        )
        .forEach(
            panel => {

                panel.style.display =
                    "none";

            }
        );


    // ==================================================
    // SHOW CASINO
    // ==================================================

    if (casino) {

        casino.style.display =
            "block";

    }

};


// ======================================================
// HIDE ALL ADMIN SPORTS SECTIONS
// ======================================================

function hideAllAdminSportsSections() {

    document
        .querySelectorAll(
            ".admin-sport-section"
        )
        .forEach(
            section => {

                section.style.display =
                    "none";

            }
        );

}


// ======================================================
// SPORTS SELECTORS
// ======================================================

window.adminSportsCricket =
function () {

    hideAllAdminSportsSections();


    const section =
        document.getElementById(
            "adminCricketSection"
        );


    if (section) {

        section.style.display =
            "block";

    }


    ensureSportsAddGameButton(
        "adminCricketSection",
        "cricket"
    );


    openCricketLive();

};


window.adminSportsFootball =
function () {

    hideAllAdminSportsSections();


    const section =
        document.getElementById(
            "adminFootballSection"
        );


    if (section) {

        section.style.display =
            "block";

    }


    ensureSportsAddGameButton(
        "adminFootballSection",
        "football"
    );


    openFootballLive();

};


window.adminSportsTennis =
function () {

    hideAllAdminSportsSections();


    const section =
        document.getElementById(
            "adminTennisSection"
        );


    if (section) {

        section.style.display =
            "block";

    }


    ensureSportsAddGameButton(
        "adminTennisSection",
        "tennis"
    );


    openTennisLive();

};


window.adminSportsBasketball =
function () {

    hideAllAdminSportsSections();


    const section =
        document.getElementById(
            "adminBasketballSection"
        );


    if (section) {

        section.style.display =
            "block";

    }


    ensureSportsAddGameButton(
        "adminBasketballSection",
        "basketball"
    );


    openBasketballLive();

};


window.adminSportsVolleyball =
function () {

    hideAllAdminSportsSections();


    const section =
        document.getElementById(
            "adminVolleyballSection"
        );


    if (section) {

        section.style.display =
            "block";

    }


    ensureSportsAddGameButton(
        "adminVolleyballSection",
        "volleyball"
    );


    openVolleyballLive();

};


window.adminSportsBoxing =
function () {

    hideAllAdminSportsSections();


    const section =
        document.getElementById(
            "adminBoxingSection"
        );


    if (section) {

        section.style.display =
            "block";

    }


    ensureSportsAddGameButton(
        "adminBoxingSection",
        "boxing"
    );


    openBoxingLive();

};


window.adminSportsHockey =
function () {

    hideAllAdminSportsSections();


    const section =
        document.getElementById(
            "adminHockeySection"
        );


    if (section) {

        section.style.display =
            "block";

    }


    ensureSportsAddGameButton(
        "adminHockeySection",
        "hockey"
    );


    openHockeyLive();

};


window.adminSportsRugby =
function () {

    hideAllAdminSportsSections();


    const section =
        document.getElementById(
            "adminRugbySection"
        );


    if (section) {

        section.style.display =
            "block";

    }


    ensureSportsAddGameButton(
        "adminRugbySection",
        "rugby"
    );


    openRugbyLive();

};


window.adminSportsGolf =
function () {

    hideAllAdminSportsSections();


    const section =
        document.getElementById(
            "adminGolfSection"
        );


    if (section) {

        section.style.display =
            "block";

    }


    ensureSportsAddGameButton(
        "adminGolfSection",
        "golf"
    );


    openGolfLive();

};


window.adminSportsOthers =
function () {

    hideAllAdminSportsSections();


    console.log(
        "🏆 Other Sports Control Selected"
    );

};


// ======================================================
// GENERIC SPORTS TAB HANDLER
// ======================================================

function openAdminSportTab(
    sport,
    contentClass,
    gridId,
    button,
    status
) {

    // ==============================================
    // HIDE ALL SPORT CONTENT PANELS
    // ==============================================

    document
        .querySelectorAll(
            "." + contentClass
        )
        .forEach(
            item => {

                item.style.display =
                    "none";

            }
        );


    // ==============================================
    // FIND GRID
    // ==============================================

    const grid =
        document.getElementById(
            gridId
        );


    if (!grid) {

        console.warn(
            "⚠️ ADMIN: Sports grid not found:",
            gridId
        );

        return;

    }


    // ==============================================
    // SHOW GRID'S PARENT CONTENT PANEL
    // ==============================================

    const panel =
        grid.closest(
            "." + contentClass
        );


    if (panel) {

        panel.style.display =
            "block";

    }


    // ==============================================
    // ACTIVE TAB BUTTON
    // ==============================================

    const buttons =
        button
            ? button.parentElement
                .querySelectorAll(
                    "button"
                )
            : [];


    buttons.forEach(
        btn => {

            btn.classList.remove(
                "active"
            );

        }
    );


    if (button) {

        button.classList.add(
            "active"
        );

    }


    // ==============================================
    // LOAD + RENDER SPORTS DATA
    // ==============================================

    ensureAdminSportsGamesLoaded()
        .then(
            loaded => {

                if (!loaded) {

                    console.error(
                        "❌ ADMIN: Sports games could not be loaded."
                    );

                    return;

                }


                renderAdminSportGames(
                    sport,
                    status
                );

            }
        );

}


// ======================================================
// CRICKET TABS
// ======================================================

window.openCricketLive =
async function (btn) {

    setSportsTabVisibility(
        "cricket",
        "live"
    );


    await ensureAdminSportsGamesLoaded();


    renderAdminSportGames(
        "cricket",
        "live"
    );

};


window.openCricketUpcoming =
async function (btn) {

    setSportsTabVisibility(
        "cricket",
        "upcoming"
    );


    await ensureAdminSportsGamesLoaded();


    renderAdminSportGames(
        "cricket",
        "upcoming"
    );

};


window.openCricketFeatured =
async function (btn) {

    setSportsTabVisibility(
        "cricket",
        "featured"
    );


    await ensureAdminSportsGamesLoaded();


    renderAdminSportGames(
        "cricket",
        "featured"
    );

};


// ======================================================
// COMMON SPORTS TAB VISIBILITY
// ======================================================

function setSportsTabVisibility(
    sport,
    status
) {

    const prefix =
        normalizeSportName(
            sport
        );


    const livePanel =
        document.getElementById(
            prefix + "Live"
        );


    const upcomingPanel =
        document.getElementById(
            prefix + "Upcoming"
        );


    const featuredPanel =
        document.getElementById(
            prefix + "Featured"
        );


    [
        livePanel,
        upcomingPanel,
        featuredPanel
    ]
    .forEach(
        panel => {

            if (panel) {

                panel.style.display =
                    "none";

            }

        }
    );


    const target =
        status === "live"
            ? livePanel
            : status === "upcoming"
                ? upcomingPanel
                : featuredPanel;


    if (target) {

        target.style.display =
            "block";

    }

}


// ======================================================
// COMMON SPORTS ADD GAME BUTTON
// ======================================================

function ensureSportsAddGameButton(
    sportSectionId,
    sportName
) {

    const section =
        document.getElementById(
            sportSectionId
        );


    if (!section) {

        console.error(
            "❌ ADMIN: Sports section not found:",
            sportSectionId
        );

        return;

    }


    let addGameRow =
        section.querySelector(
            ".sports-add-game-row"
        );


    if (!addGameRow) {

        addGameRow =
            document.createElement(
                "div"
            );


        addGameRow.className =
            "sports-add-game-row";


        addGameRow.innerHTML = `

            <button
                type="button"
                class="sports-add-game-btn"
                onclick="
                    openAddSportsGameModal(
                        '${escapeAdminSportsJS(
                            sportName
                        )}'
                    )
                "
            >
                ➕ Add New Game
            </button>

        `;


        const title =
            section.querySelector(
                "h3"
            );


        if (title) {

            title.insertAdjacentElement(
                "afterend",
                addGameRow
            );

        } else {

            section.prepend(
                addGameRow
            );

        }

    }

}


// ======================================================
// COMMON ADD SPORTS GAME MODAL
// ======================================================

window.openAddSportsGameModal =
function (sport) {

    console.log(
        "➕ ADD NEW GAME CLICKED:",
        sport
    );


    const currentSport =
        normalizeSportName(
            sport
        );


    if (!currentSport) {

        console.error(
            "❌ ADMIN: Sport not provided."
        );

        return;

    }


    const sectionMap = {

        cricket:
            "adminCricketSection",

        football:
            "adminFootballSection",

        tennis:
            "adminTennisSection",

        basketball:
            "adminBasketballSection",

        volleyball:
            "adminVolleyballSection",

        boxing:
            "adminBoxingSection",

        hockey:
            "adminHockeySection",

        rugby:
            "adminRugbySection",

        golf:
            "adminGolfSection"

    };


    const sectionId =
        sectionMap[
            currentSport
        ];


    const currentSection =
        sectionId
            ? document.getElementById(
                sectionId
            )
            : null;


    if (!currentSection) {

        console.error(
            "❌ ADMIN: Sports section not found:",
            currentSport
        );

        return;

    }


    let modal =
        document.getElementById(
            "addSportsGameModal"
        );


    if (!modal) {

        modal =
            document.createElement(
                "div"
            );


        modal.id =
            "addSportsGameModal";


        modal.className =
            "sports-game-edit-modal";


        modal.innerHTML = `

            <div class="sports-game-edit-box">

                <div class="sports-game-edit-header">

                    <h3 id="addSportsGameModalTitle">
                        ➕ Add New Game
                    </h3>

                    <button
                        type="button"
                        onclick="closeAddSportsGameModal()">
                        ✕
                    </button>

                </div>


                <div class="sports-game-edit-body">

                    <div class="sports-add-form-row">

                        <div class="sports-add-form-label">
                            Game ID
                        </div>

                        <div class="sports-add-form-control">

                            <input
                                type="text"
                                id="addSportsGameId"
                                readonly>

                        </div>

                    </div>


                    <div class="sports-add-form-row">

                        <div class="sports-add-form-label">
                            Match Title
                        </div>

                        <div class="sports-add-form-control">

                            <input
                                type="text"
                                id="addSportsGameTitle"
                                placeholder="Enter match title">

                        </div>

                    </div>


                    <div class="sports-add-form-row">

                        <div class="sports-add-form-label">
                            League
                        </div>

                        <div class="sports-add-form-control">

                            <input
                                type="text"
                                id="addSportsGameLeague"
                                placeholder="Enter league">

                        </div>

                    </div>


                    <div class="sports-add-form-row">

                        <div class="sports-add-form-label">
                            Status
                        </div>

                        <div class="sports-add-form-control">

                            <select
                                id="addSportsGameStatus">

                                <option value="live">
                                    LIVE
                                </option>

                                <option value="upcoming">
                                    UPCOMING
                                </option>

                                <option value="featured">
                                    FEATURED
                                </option>

                            </select>

                        </div>

                    </div>


                    <div class="sports-add-form-row">

                        <div class="sports-add-form-label">
                            Match Status
                        </div>

                        <div class="sports-add-form-control">

                            <select
                                id="addSportsMatchStatus">

                                <option value="enable">
                                    ENABLE
                                </option>

                                <option value="disable">
                                    DISABLE
                                </option>

                                <option value="reject">
                                    REJECT
                                </option>

                            </select>

                        </div>

                    </div>


                    <div class="sports-add-form-row">

                        <div class="sports-add-form-label">
                            Home Team
                        </div>

                        <div class="sports-add-form-control">

                            <input
                                type="text"
                                id="addSportsGameHome"
                                placeholder="Select team">

                        </div>

                    </div>


                    <div class="sports-add-form-row">

                        <div class="sports-add-form-label">
                            Away Team
                        </div>

                        <div class="sports-add-form-control">

                            <input
                                type="text"
                                id="addSportsGameAway"
                                placeholder="Select team">

                        </div>

                    </div>


                    <!-- ==================================
                         LEGACY MARKET CONTROLS
                    =================================== -->

                    <div class="sports-add-markets-row">

                        <div class="sports-add-markets-title">
                            Betting Markets
                        </div>


                        <div class="sports-add-market-items">

                            <label class="sports-market-toggle">

                                <span>
                                    Total Runs
                                </span>

                                <input
                                    type="checkbox"
                                    id="addSportsTotalRuns"
                                    checked>

                            </label>


                            <label class="sports-market-toggle">

                                <span>
                                    Over / Under
                                </span>

                                <input
                                    type="checkbox"
                                    id="addSportsOverUnder"
                                    checked>

                            </label>


                            <label class="sports-market-toggle">

                                <span>
                                    Match Winner
                                </span>

                                <input
                                    type="checkbox"
                                    id="addSportsMatchWinner"
                                    checked>

                            </label>

                        </div>

                    </div>

                </div>


                <div class="sports-game-edit-footer">

                    <button
                        type="button"
                        onclick="closeAddSportsGameModal()">
                        Cancel
                    </button>


                    <button
                        type="button"
                        onclick="saveNewSportsGame()">
                        💾 Add Game
                    </button>

                </div>

            </div>

        `;


        document.body.appendChild(
            modal
        );

    }


    window.currentAddSportsGame =
        currentSport;


    const addGameRow =
        currentSection.querySelector(
            ".sports-add-game-row"
        );


    if (addGameRow) {

        addGameRow.insertAdjacentElement(
            "afterend",
            modal
        );

    } else {

        currentSection.prepend(
            modal
        );

    }


    const title =
        document.getElementById(
            "addSportsGameModalTitle"
        );


    if (title) {

        title.textContent =
            "➕ Add New " +
            capitalizeSport(
                currentSport
            ) +
            " Game";

    }


    const gameIdInput =
        document.getElementById(
            "addSportsGameId"
        );

    const titleInput =
        document.getElementById(
            "addSportsGameTitle"
        );

    const leagueInput =
        document.getElementById(
            "addSportsGameLeague"
        );

    const statusInput =
        document.getElementById(
            "addSportsGameStatus"
        );

    const matchStatusInput =
        document.getElementById(
            "addSportsMatchStatus"
        );

    const homeInput =
        document.getElementById(
            "addSportsGameHome"
        );

    const awayInput =
        document.getElementById(
            "addSportsGameAway"
        );

    const totalRuns =
        document.getElementById(
            "addSportsTotalRuns"
        );

    const overUnder =
        document.getElementById(
            "addSportsOverUnder"
        );

    const matchWinner =
        document.getElementById(
            "addSportsMatchWinner"
        );


    if (gameIdInput) {

        gameIdInput.value =
            currentSport +
            "-" +
            Date.now();

    }


    if (titleInput) {

        titleInput.value =
            "";

    }


    if (leagueInput) {

        leagueInput.value =
            "";

    }


    if (statusInput) {

        statusInput.value =
            "live";

    }


    if (matchStatusInput) {

        matchStatusInput.value =
            "enable";

    }


    if (homeInput) {

        homeInput.value =
            "";

    }


    if (awayInput) {

        awayInput.value =
            "";

    }


    if (totalRuns) {

        totalRuns.checked =
            true;

    }


    if (overUnder) {

        overUnder.checked =
            true;

    }


    if (matchWinner) {

        matchWinner.checked =
            true;

    }


    modal.style.display =
        "block";


    console.log(
        "✅ COMMON ADD GAME PANEL OPENED:",
        currentSport
    );

};


// ======================================================
// CLOSE COMMON ADD SPORTS GAME
// ======================================================

window.closeAddSportsGameModal =
function () {

    const modal =
        document.getElementById(
            "addSportsGameModal"
        );


    if (modal) {

        modal.style.display =
            "none";

    }


    console.log(
        "✅ COMMON ADD GAME PANEL CLOSED"
    );

};


// ======================================================
// SAVE NEW SPORTS GAME
// ======================================================

window.saveNewSportsGame =
async function () {

    console.log(
        "💾 ADD NEW SPORTS GAME SAVE CLICKED"
    );


    const sport =
        normalizeSportName(
            window.currentAddSportsGame
        );


    if (!sport) {

        alert(
            "Unable to determine the selected sport."
        );

        return;

    }


    const gameIdInput =
        document.getElementById(
            "addSportsGameId"
        );

    const titleInput =
        document.getElementById(
            "addSportsGameTitle"
        );

    const leagueInput =
        document.getElementById(
            "addSportsGameLeague"
        );

    const statusInput =
        document.getElementById(
            "addSportsGameStatus"
        );

    const matchStatusInput =
        document.getElementById(
            "addSportsMatchStatus"
        );

    const homeInput =
        document.getElementById(
            "addSportsGameHome"
        );

    const awayInput =
        document.getElementById(
            "addSportsGameAway"
        );

    const totalRunsInput =
        document.getElementById(
            "addSportsTotalRuns"
        );

    const overUnderInput =
        document.getElementById(
            "addSportsOverUnder"
        );

    const matchWinnerInput =
        document.getElementById(
            "addSportsMatchWinner"
        );


    const gameId =
        gameIdInput
            ? gameIdInput.value.trim()
            : "";

    const title =
        titleInput
            ? titleInput.value.trim()
            : "";

    const league =
        leagueInput
            ? leagueInput.value.trim()
            : "";

    const status =
        statusInput && statusInput.value
            ? statusInput.value
                .trim()
                .toLowerCase()
            : "live";

    const matchStatus =
        matchStatusInput &&
        matchStatusInput.value
            ? matchStatusInput.value
                .trim()
                .toLowerCase()
            : "enable";

    const homeTeam =
        homeInput
            ? homeInput.value.trim()
            : "";

    const awayTeam =
        awayInput
            ? awayInput.value.trim()
            : "";


    const totalRunsEnabled =
        totalRunsInput
            ? totalRunsInput.checked
            : true;

    const overUnderEnabled =
        overUnderInput
            ? overUnderInput.checked
            : true;

    const matchWinnerEnabled =
        matchWinnerInput
            ? matchWinnerInput.checked
            : true;


    // ==================================================
    // VALIDATION
    // ==================================================

    if (
        !gameId ||
        !title ||
        !league ||
        !homeTeam ||
        !awayTeam
    ) {

        alert(
            "Please fill in all match information."
        );

        return;

    }


    if (
        ![
            "live",
            "upcoming",
            "featured"
        ].includes(status)
    ) {

        alert(
            "Please select a valid status."
        );

        return;

    }


    if (
        ![
            "enable",
            "disable",
            "reject"
        ].includes(matchStatus)
    ) {

        alert(
            "Please select a valid match status."
        );

        return;

    }


    if (!window.supabaseClient) {

        console.error(
            "❌ ADMIN: Supabase client unavailable."
        );

        alert(
            "Supabase connection unavailable."
        );

        return;

    }


    // ==================================================
    // NEW GAME OBJECT
    // ==================================================

    const newGame = {

        game_id:
            gameId,

        sport:
            sport,

        title:
            title,

        league:
            league,

        status:
            status,

        match_status:
            matchStatus,

        home_team:
            homeTeam,

        away_team:
            awayTeam,

        total_runs_enabled:
            totalRunsEnabled,

        over_under_enabled:
            overUnderEnabled,

        match_winner_enabled:
            matchWinnerEnabled

    };


    console.log(
        "➕ ADMIN: NEW SPORTS GAME:",
        newGame
    );


    // ==================================================
    // INSERT INTO SUPABASE
    // ==================================================

    const {
        data,
        error
    } =
        await window.supabaseClient
            .from(
                "sports_games"
            )
            .insert([
                newGame
            ])
            .select()
            .single();


    if (error) {

        console.error(
            "❌ ADMIN: Sports game insert failed:",
            error
        );

        alert(
            "Failed to add game.\n\n" +
            error.message
        );

        return;

    }


    // ==================================================
    // UPDATE ADMIN CACHE
    // ==================================================

    if (
        !window.adminSportsGames
    ) {

        window.adminSportsGames = {};

    }


    window.adminSportsGames[
        data.game_id
    ] = data;


    console.log(
        "✅ ADMIN: Game added to cache:",
        data
    );


    // ==================================================
    // CLOSE ADD GAME PANEL
    // ==================================================

    closeAddSportsGameModal();


    // ==================================================
    // RE-RENDER ALL SPORTS
    // ==================================================

    renderAllAdminSportsGames();


    // ==================================================
    // ALSO RENDER CURRENT GAME STATUS
    // ==================================================

    renderAdminSportGames(
        sport,
        normalizeStatus(
            data.status
        )
    );


    // ==================================================
    // SUCCESS MESSAGE
    // ==================================================

    alert(
        "✅ " +
        capitalizeSport(
            sport
        ) +
        " game added successfully!"
    );

};

// ======================================================
// FOOTBALL TABS
// ======================================================

window.openFootballLive =
function (btn) {

    openAdminSportTab(
        "football",
        "football-content",
        "adminFootballLiveGrid",
        btn,
        "live"
    );

};


window.openFootballUpcoming =
function (btn) {

    openAdminSportTab(
        "football",
        "football-content",
        "adminFootballUpcomingGrid",
        btn,
        "upcoming"
    );

};


window.openFootballFeatured =
function (btn) {

    openAdminSportTab(
        "football",
        "football-content",
        "adminFootballFeaturedGrid",
        btn,
        "featured"
    );

};


// ======================================================
// TENNIS TABS
// ======================================================

window.openTennisLive =
function (btn) {

    openAdminSportTab(
        "tennis",
        "tennis-content",
        "adminTennisLiveGrid",
        btn,
        "live"
    );

};


window.openTennisUpcoming =
function (btn) {

    openAdminSportTab(
        "tennis",
        "tennis-content",
        "adminTennisUpcomingGrid",
        btn,
        "upcoming"
    );

};


window.openTennisFeatured =
function (btn) {

    openAdminSportTab(
        "tennis",
        "tennis-content",
        "adminTennisFeaturedGrid",
        btn,
        "featured"
    );

};


// ======================================================
// BASKETBALL TABS
// ======================================================

window.openBasketballLive =
function (btn) {

    openAdminSportTab(
        "basketball",
        "basketball-content",
        "adminBasketballLiveGrid",
        btn,
        "live"
    );

};


window.openBasketballUpcoming =
function (btn) {

    openAdminSportTab(
        "basketball",
        "basketball-content",
        "adminBasketballUpcomingGrid",
        btn,
        "upcoming"
    );

};


window.openBasketballFeatured =
function (btn) {

    openAdminSportTab(
        "basketball",
        "basketball-content",
        "adminBasketballFeaturedGrid",
        btn,
        "featured"
    );

};


// ======================================================
// VOLLEYBALL TABS
// ======================================================

window.openVolleyballLive =
function (btn) {

    openAdminSportTab(
        "volleyball",
        "volleyball-content",
        "adminVolleyballLiveGrid",
        btn,
        "live"
    );

};


window.openVolleyballUpcoming =
function (btn) {

    openAdminSportTab(
        "volleyball",
        "volleyball-content",
        "adminVolleyballUpcomingGrid",
        btn,
        "upcoming"
    );

};


window.openVolleyballFeatured =
function (btn) {

    openAdminSportTab(
        "volleyball",
        "volleyball-content",
        "adminVolleyballFeaturedGrid",
        btn,
        "featured"
    );

};


// ======================================================
// BOXING TABS
// ======================================================

window.openBoxingLive =
function (btn) {

    openAdminSportTab(
        "boxing",
        "boxing-content",
        "adminBoxingLiveGrid",
        btn,
        "live"
    );

};


window.openBoxingUpcoming =
function (btn) {

    openAdminSportTab(
        "boxing",
        "boxing-content",
        "adminBoxingUpcomingGrid",
        btn,
        "upcoming"
    );

};


window.openBoxingFeatured =
function (btn) {

    openAdminSportTab(
        "boxing",
        "boxing-content",
        "adminBoxingFeaturedGrid",
        btn,
        "featured"
    );

};


// ======================================================
// HOCKEY TABS
// ======================================================

window.openHockeyLive =
function (btn) {

    openAdminSportTab(
        "hockey",
        "hockey-content",
        "adminHockeyLiveGrid",
        btn,
        "live"
    );

};


window.openHockeyUpcoming =
function (btn) {

    openAdminSportTab(
        "hockey",
        "hockey-content",
        "adminHockeyUpcomingGrid",
        btn,
        "upcoming"
    );

};


window.openHockeyFeatured =
function (btn) {

    openAdminSportTab(
        "hockey",
        "hockey-content",
        "adminHockeyFeaturedGrid",
        btn,
        "featured"
    );

};


// ======================================================
// RUGBY TABS
// ======================================================

window.openRugbyLive =
function (btn) {

    openAdminSportTab(
        "rugby",
        "rugby-content",
        "adminRugbyLiveGrid",
        btn,
        "live"
    );

};


window.openRugbyUpcoming =
function (btn) {

    openAdminSportTab(
        "rugby",
        "rugby-content",
        "adminRugbyUpcomingGrid",
        btn,
        "upcoming"
    );

};


window.openRugbyFeatured =
function (btn) {

    openAdminSportTab(
        "rugby",
        "rugby-content",
        "adminRugbyFeaturedGrid",
        btn,
        "featured"
    );

};


// ======================================================
// GOLF TABS
// ======================================================

window.openGolfLive =
function (btn) {

    openAdminSportTab(
        "golf",
        "golf-content",
        "adminGolfLiveGrid",
        btn,
        "live"
    );

};


window.openGolfUpcoming =
function (btn) {

    openAdminSportTab(
        "golf",
        "golf-content",
        "adminGolfUpcomingGrid",
        btn,
        "upcoming"
    );

};


window.openGolfFeatured =
function (btn) {

    openAdminSportTab(
        "golf",
        "golf-content",
        "adminGolfFeaturedGrid",
        btn,
        "featured"
    );

};


// ======================================================
// SUPABASE SPORTS GAME LOAD
// ======================================================

window.loadAdminSportsGames =
async function () {

    console.log(
        "🔄 ADMIN: Loading sports games from Supabase..."
    );


    if (!window.supabaseClient) {

        console.error(
            "❌ ADMIN: supabaseClient is not available."
        );

        return false;

    }


    const {
        data,
        error
    } =
        await window.supabaseClient
            .from(
                "sports_games"
            )
            .select("*")
            .order(
                "game_id",
                {
                    ascending:
                        true
                }
            );


    console.log(
        "📦 ADMIN SUPABASE DATA:",
        data
    );


    console.log(
        "📦 ADMIN SUPABASE ERROR:",
        error
    );


    if (error) {

        console.error(
            "❌ ADMIN: Failed to load sports games:",
            error
        );

        window.adminSportsGamesLoaded =
            false;

        return false;

    }


    window.adminSportsGames =
        {};


    if (
        !data ||
        data.length === 0
    ) {

        console.warn(
            "⚠️ ADMIN: No sports games found."
        );

        window.adminSportsGamesLoaded =
            true;

        return true;

    }


    data.forEach(
        game => {

            if (!game.game_id) {

                return;

            }


            window.adminSportsGames[
                game.game_id
            ] = game;

        }
    );


    window.adminSportsGamesLoaded =
        true;


    console.log(
        "🗂️ ADMIN SPORTS CACHE:",
        window.adminSportsGames
    );


    // ==================================================
    // RENDER CURRENTLY AVAILABLE SPORTS DATA
    // ==================================================

    renderAllAdminSportsGames();


    return true;

};


// ======================================================
// ENSURE SPORTS DATA IS LOADED
// ======================================================

async function ensureAdminSportsGamesLoaded() {

    if (
        window.adminSportsGamesLoaded
    ) {

        return true;

    }


    if (!window.supabaseClient) {

        console.error(
            "❌ ADMIN: Supabase client unavailable."
        );

        return false;

    }


    console.log(
        "🔄 ADMIN: Loading sports games..."
    );


    const {
        data,
        error
    } =
        await window.supabaseClient
            .from(
                "sports_games"
            )
            .select("*");


    if (error) {

        console.error(
            "❌ ADMIN: Failed to load sports games:",
            error
        );

        return false;

    }


    window.adminSportsGames = {};


    (data || []).forEach(
        game => {

            if (
                game &&
                game.game_id
            ) {

                window.adminSportsGames[
                    game.game_id
                ] = game;

            }

        }
    );


    window.adminSportsGamesLoaded =
        true;


    console.log(
        "✅ ADMIN: Sports games loaded:",
        Object.values(
            window.adminSportsGames
        )
    );


    return true;

}


// ======================================================
// RENDER ALL SPORTS GAMES
// ======================================================

function renderAllAdminSportsGames() {

    const sports =
        getSupportedSports();


    const statuses = [
        "live",
        "upcoming",
        "featured"
    ];


    sports.forEach(
        sport => {

            statuses.forEach(
                status => {

                    renderAdminSportGames(
                        sport,
                        status
                    );

                }
            );

        }
    );

}


// ======================================================
// GENERIC SPORTS GAME RENDERER
// ======================================================

function renderAdminSportGames(
    sport,
    status
) {

    const sportName =
        normalizeSportName(
            sport
        );


    const statusName =
        normalizeStatus(
            status
        );


    const gridId =
        getSportsGridId(
            sportName,
            statusName
        );


    if (!gridId) {

        console.warn(
            "⚠️ ADMIN: Grid not found for:",
            sportName,
            statusName
        );

        return;

    }


    const grid =
        document.getElementById(
            gridId
        );


    if (!grid) {

        return;

    }


    const allGames =
        Object.values(
            window.adminSportsGames || {}
        );


    const games =
        allGames
            .filter(
                game => {

                    return (
                        normalizeSportName(
                            game.sport
                        ) ===
                        sportName
                        &&
                        normalizeStatus(
                            game.status
                        ) ===
                        statusName
                    );

                }
            )
            .sort(
                (a, b) => {

                    return String(
                        a.game_id || ""
                    )
                    .localeCompare(
                        String(
                            b.game_id || ""
                        ),
                        undefined,
                        {
                            numeric:
                                true,

                            sensitivity:
                                "base"
                        }
                    );

                }
            );


    if (
        games.length === 0
    ) {

        grid.innerHTML = `
            <p class="no-sports-games">
                No ${capitalizeSport(
                    sportName
                )} ${statusName} games available.
            </p>
        `;

        return;

    }


    grid.innerHTML =
        games
            .map(
                game =>
                    createAdminSportsCard(
                        game
                    )
            )
            .join("");

}


// ======================================================
// BACKWARD COMPATIBILITY
// ======================================================

function renderAdminCricketGamesByStatus(
    status
) {

    return renderAdminSportGames(
        "cricket",
        status
    );

}


function renderAdminCricketGames(
    games
) {

    const sourceGames =
        Array.isArray(games)
            ? games
            : Object.values(
                window.adminSportsGames || {}
            );


    const cricketGames =
        sourceGames.filter(
            game => {

                return normalizeSportName(
                    game.sport
                ) ===
                "cricket";

            }
        );


    [
        "live",
        "upcoming",
        "featured"
    ]
    .forEach(
        status => {

            const gridId =
                getSportsGridId(
                    "cricket",
                    status
                );


            const grid =
                document.getElementById(
                    gridId
                );


            if (!grid) {

                return;

            }


            const gamesForStatus =
                cricketGames.filter(
                    game => {

                        return normalizeStatus(
                            game.status
                        ) ===
                        status;

                    }
                );


            if (
                gamesForStatus.length ===
                0
            ) {

                grid.innerHTML = `
                    <p class="no-sports-games">
                        No Cricket ${status}
                        games available.
                    </p>
                `;

                return;

            }


            grid.innerHTML =
                gamesForStatus
                    .map(
                        game =>
                            createAdminSportsCard(
                                game
                            )
                    )
                    .join("");

        }
    );

}


// ======================================================
// CREATE ADMIN SPORTS CARD
// ======================================================

function createAdminSportsCard(
    game
) {

    const totalRuns =
        game.total_runs_enabled !==
        false;


    const overUnder =
        game.over_under_enabled !==
        false;


    const matchWinner =
        game.match_winner_enabled !==
        false;


    const matchStatus =
        normalizeMatchStatus(
            game.match_status
        );


    const enabledMarketCount =
        [
            totalRuns,
            overUnder,
            matchWinner
        ]
        .filter(Boolean)
        .length;


    const totalMarketCount =
        3;


    return `

        <div
            class="match-card"
            data-game-id="${escapeAdminSportsHTML(
                game.game_id
            )}"
        >


            <!-- =========================================
                 MAIN CARD CONTENT
            ========================================= -->


            <div class="admin-match-main">


                <!-- GAME ID -->

                <div class="admin-match-column">

                    <div class="admin-match-label">
                        ID
                    </div>

                    <div class="admin-match-value admin-game-id">

                        ${escapeAdminSportsHTML(
                            game.game_id
                        )}

                    </div>

                </div>


                <!-- LEAGUE -->

                <div class="admin-match-column">

                    <div class="admin-match-label">
                        League
                    </div>

                    <div class="admin-match-value admin-game-league">

                        ${escapeAdminSportsHTML(
                            game.league || ""
                        )}

                    </div>

                </div>


                <!-- TEAMS -->

                <div
                    class="
                        admin-match-column
                        admin-match-teams-column
                    "
                >

                    <div class="admin-match-label">
                        Teams
                    </div>


                    <div class="admin-match-value admin-match-teams">

                        <span>
                            ${escapeAdminSportsHTML(
                                game.home_team || ""
                            )}
                        </span>


                        <strong>
                            VS
                        </strong>


                        <span>
                            ${escapeAdminSportsHTML(
                                game.away_team || ""
                            )}
                        </span>

                    </div>

                </div>


                <!-- STATUS -->

                <div class="admin-match-column">

                    <div class="admin-match-label">
                        Status
                    </div>


                    <div class="admin-match-value admin-game-status">

                        ${escapeAdminSportsHTML(
                            game.status || ""
                        )}

                    </div>

                </div>


                <!-- MATCH STATUS -->

                <div class="admin-match-column">

                    <div class="admin-match-label">
                        Match Status
                    </div>


                    <div
                        class="
                            admin-match-value
                            admin-game-match-status
                        "
                    >

                        ${escapeAdminSportsHTML(
                            matchStatus
                        )}

                    </div>

                </div>


                <!-- MARKETS -->

                <div
                    class="
                        admin-match-column
                        admin-markets-column
                    "
                >

                    <div class="admin-match-label">
                        Markets
                    </div>


                    <button
                        type="button"
                        class="admin-markets-toggle-btn"

                        onclick="
                            toggleAdminSportsMarkets(
                                '${escapeAdminSportsJS(
                                    game.game_id
                                )}'
                            )
                        "
                    >

                        <span>
                            Markets
                        </span>


                        <span class="admin-market-count">

                            ${enabledMarketCount}/${totalMarketCount}

                        </span>


                        <span class="admin-markets-arrow">
                            ▾
                        </span>

                    </button>

                </div>

            </div>


            <!-- =========================================
                 EDIT BUTTON
            ========================================== -->

            <div class="admin-match-action">

                <button
                    type="button"
                    class="admin-edit-match-btn"

                    onclick="
                        openSportsGameEditor(
                            '${escapeAdminSportsJS(
                                game.game_id
                            )}'
                        )
                    "
                >

                    ✏️ Edit Match

                </button>

            </div>


            <!-- =========================================
                 EXPANDABLE MARKETS
            ========================================== -->

            <div
                id="adminMarkets-${escapeAdminSportsHTML(
                    game.game_id
                )}"
                class="admin-markets-panel"
                style="display:none;"
            >

                <div class="admin-markets-panel-title">
                    Betting Markets
                </div>


                <div class="admin-markets-grid">


                    <!-- TOTAL RUNS -->

                    <div class="admin-market-item">

                        <span>
                            Total Runs
                        </span>


                        <button
                            type="button"
                            class="${
                                totalRuns
                                    ? "market-on"
                                    : "market-off"
                            }"

                            onclick="
                                toggleAdminMarket(
                                    '${escapeAdminSportsJS(
                                        game.game_id
                                    )}',
                                    'total_runs_enabled'
                                )
                            "
                        >

                            ${totalRuns
                                ? "ON"
                                : "OFF"}

                        </button>

                    </div>


                    <!-- OVER / UNDER -->

                    <div class="admin-market-item">

                        <span>
                            Over / Under
                        </span>


                        <button
                            type="button"
                            class="${
                                overUnder
                                    ? "market-on"
                                    : "market-off"
                            }"

                            onclick="
                                toggleAdminMarket(
                                    '${escapeAdminSportsJS(
                                        game.game_id
                                    )}',
                                    'over_under_enabled'
                                )
                            "
                        >

                            ${overUnder
                                ? "ON"
                                : "OFF"}

                        </button>

                    </div>


                    <!-- MATCH WINNER -->

                    <div class="admin-market-item">

                        <span>
                            Match Winner
                        </span>


                        <button
                            type="button"
                            class="${
                                matchWinner
                                    ? "market-on"
                                    : "market-off"
                            }"

                            onclick="
                                toggleAdminMarket(
                                    '${escapeAdminSportsJS(
                                        game.game_id
                                    )}',
                                    'match_winner_enabled'
                                )
                            "
                        >

                            ${matchWinner
                                ? "ON"
                                : "OFF"}

                        </button>

                    </div>


                </div>

            </div>


        </div>

    `;

}


// ======================================================
// CONFIRM DELETE SPORTS GAME
// ======================================================

window.confirmDeleteSportsGame =
function () {

    const gameIdInput =
        document.getElementById(
            "editSportsGameId"
        );


    const gameId =
        gameIdInput
            ? gameIdInput.value.trim()
            : "";


    if (!gameId) {

        console.error(
            "❌ ADMIN: Game ID not found for delete."
        );

        alert(
            "Game ID not found."
        );

        return;

    }


    let confirmBox =
        document.getElementById(
            "sportsDeleteConfirm"
        );


    if (!confirmBox) {

        confirmBox =
            document.createElement(
                "div"
            );


        confirmBox.id =
            "sportsDeleteConfirm";


        confirmBox.innerHTML = `

            <div class="sports-delete-confirm-box">

                <div class="sports-delete-confirm-title">
                    Delete Game
                </div>


                <div class="sports-delete-confirm-message">

                    Are you sure you want to delete this game?

                </div>


                <div class="sports-delete-confirm-actions">

                    <button
                        type="button"
                        class="sports-delete-cancel-btn"
                        onclick="closeSportsDeleteConfirm()">
                        Cancel
                    </button>


                    <button
                        type="button"
                        class="sports-delete-confirm-btn"
                        onclick="deleteSportsGame()">
                        Confirm
                    </button>

                </div>

            </div>

        `;


        document.body.appendChild(
            confirmBox
        );

    }


    window.pendingDeleteSportsGameId =
        gameId;


    confirmBox.style.display =
        "flex";


    console.log(
        "⚠️ ADMIN: Delete confirmation opened:",
        gameId
    );

};


// ======================================================
// CLOSE DELETE CONFIRMATION
// ======================================================

window.closeSportsDeleteConfirm =
function () {

    const confirmBox =
        document.getElementById(
            "sportsDeleteConfirm"
        );


    if (confirmBox) {

        confirmBox.style.display =
            "none";

    }

};


// ======================================================
// DELETE SPORTS GAME
// ======================================================

window.deleteSportsGame =
async function () {

    const gameId =
        String(
            window.pendingDeleteSportsGameId ||
            ""
        )
        .trim();


    if (!gameId) {

        console.error(
            "❌ ADMIN: No game selected for deletion."
        );

        return;

    }


    if (!window.supabaseClient) {

        console.error(
            "❌ ADMIN: Supabase client unavailable."
        );

        alert(
            "Supabase connection unavailable."
        );

        return;

    }


    const {
        error
    } =
        await window.supabaseClient
            .from(
                "sports_games"
            )
            .delete()
            .eq(
                "game_id",
                gameId
            );


    if (error) {

        console.error(
            "❌ ADMIN: Sports game delete failed:",
            error
        );

        alert(
            "Failed to delete game.\n\n" +
            error.message
        );

        return;

    }


    delete window.adminSportsGames[
        gameId
    ];


    const deletedGame =
        window.currentEditingSportsGame;


    const currentSport =
        deletedGame &&
        deletedGame.sport
            ? normalizeSportName(
                deletedGame.sport
            )
            : "";


    closeSportsDeleteConfirm();


    closeSportsGameEditor();


    if (currentSport) {

        renderAllAdminSportsGames();

    }


    window.pendingDeleteSportsGameId =
        "";

    window.currentEditingSportsGame =
        null;


    alert(
        "✅ Game deleted successfully!"
    );


    console.log(
        "✅ ADMIN: SPORTS GAME DELETED:",
        gameId
    );

};


// ======================================================
// TOGGLE SPORTS MARKET
// ======================================================

window.toggleAdminMarket =
async function (
    gameId,
    field
) {

    const game =
        window.adminSportsGames[
            gameId
        ];


    if (!game) {

        console.error(
            "❌ ADMIN: Game not found:",
            gameId
        );

        return;

    }


    const allowedFields = [

        "total_runs_enabled",

        "over_under_enabled",

        "match_winner_enabled"

    ];


    if (
        !allowedFields.includes(
            field
        )
    ) {

        console.error(
            "❌ ADMIN: Invalid market field:",
            field
        );

        return;

    }


    const newValue =
        game[field] === false;


    if (!window.supabaseClient) {

        alert(
            "Supabase connection unavailable."
        );

        return;

    }


    const {
        data,
        error
    } =
        await window.supabaseClient
            .from(
                "sports_games"
            )
            .update({

                [field]:
                    newValue

            })
            .eq(
                "game_id",
                gameId
            )
            .select()
            .single();


    if (error) {

        console.error(
            "❌ ADMIN: Market update failed:",
            error
        );

        alert(
            "Failed to update market.\n\n" +
            error.message
        );

        return;

    }


    window.adminSportsGames[
        gameId
    ] = data;


    renderAdminSportGames(
        normalizeSportName(
            data.sport
        ),
        normalizeStatus(
            data.status
        )
    );

};


// ======================================================
// TOGGLE SPORTS MARKETS PANEL
// ======================================================

window.toggleAdminSportsMarkets =
function (gameId) {

    const safeGameId =
        String(
            gameId || ""
        );


    const panel =
        document.getElementById(
            "adminMarkets-" +
            safeGameId
        );


    if (!panel) {

        console.error(
            "❌ ADMIN: Markets panel not found:",
            gameId
        );

        return;

    }


    const isCurrentlyHidden =
        panel.style.display ===
            "none" ||
        panel.style.display ===
            "";


    panel.style.display =
        isCurrentlyHidden
            ? "block"
            : "none";


    const card =
        panel.closest(
            ".match-card"
        );


    if (!card) {

        return;

    }


    const button =
        card.querySelector(
            ".admin-markets-toggle-btn"
        );


    if (!button) {

        return;

    }


    const arrow =
        button.querySelector(
            ".admin-markets-arrow"
        );


    if (arrow) {

        arrow.textContent =
            isCurrentlyHidden
                ? "▴"
                : "▾";

    }

};


// ======================================================
// OPEN SPORTS GAME EDITOR
// ======================================================

window.openSportsGameEditor =
function (gameId) {

    console.log(
        "✏️ ADMIN: Opening editor:",
        gameId
    );


    const game =
        window.adminSportsGames[
            gameId
        ];


    if (!game) {

        console.error(
            "❌ ADMIN: Game not found:",
            gameId
        );

        alert(
            "Sports game not found."
        );

        return;

    }


    window.currentEditingSportsGame =
        game;


    const gameIdInput =
        document.getElementById(
            "editSportsGameId"
        );


    const titleInput =
        document.getElementById(
            "editSportsGameTitle"
        );


    const leagueInput =
        document.getElementById(
            "editSportsGameLeague"
        );


    const statusInput =
        document.getElementById(
            "editSportsGameStatus"
        );


    const matchStatusInput =
        document.getElementById(
            "editSportsGameMatchStatus"
        );


    const homeInput =
        document.getElementById(
            "editSportsGameHome"
        );


    const awayInput =
        document.getElementById(
            "editSportsGameAway"
        );


    const totalRunsInput =
        document.getElementById(
            "editTotalRuns"
        );


    const overUnderInput =
        document.getElementById(
            "editOverUnder"
        );


    const matchWinnerInput =
        document.getElementById(
            "editMatchWinner"
        );


    if (gameIdInput) {

        gameIdInput.value =
            game.game_id || "";

    }


    if (titleInput) {

        titleInput.value =
            game.title || "";

    }


    if (leagueInput) {

        leagueInput.value =
            game.league || "";

    }


    if (homeInput) {

        homeInput.value =
            game.home_team || "";

    }


    if (awayInput) {

        awayInput.value =
            game.away_team || "";

    }


    if (statusInput) {

        statusInput.value =
            normalizeStatus(
                game.status
            );

    }


    if (matchStatusInput) {

        matchStatusInput.value =
            normalizeMatchStatus(
                game.match_status
            );

    }


    if (totalRunsInput) {

        totalRunsInput.checked =
            game.total_runs_enabled !==
            false;

    }


    if (overUnderInput) {

        overUnderInput.checked =
            game.over_under_enabled !==
            false;

    }


    if (matchWinnerInput) {

        matchWinnerInput.checked =
            game.match_winner_enabled !==
            false;

    }


    window.activeSportsGameId =
        gameId;


    const modal =
        document.getElementById(
            "sportsGameEditModal"
        );


    if (modal) {

        modal.style.display =
            "flex";


        console.log(
            "✅ ADMIN: Sports game editor opened."
        );

    } else {

        console.error(
            "❌ ADMIN: sportsGameEditModal not found."
        );

    }

};


// ======================================================
// CLOSE SPORTS GAME EDITOR
// ======================================================

window.closeSportsGameEditor =
function () {

    const modal =
        document.getElementById(
            "sportsGameEditModal"
        );


    if (modal) {

        modal.style.display =
            "none";

    }


    window.activeSportsGameId =
        null;


    window.currentEditingSportsGame =
        null;

};


// ======================================================
// SAVE SPORTS GAME
// ======================================================

window.saveSportsGameChanges =
async function () {

    const gameIdInput =
        document.getElementById(
            "editSportsGameId"
        );


    const gameId =
        gameIdInput
            ? gameIdInput.value.trim()
            : "";


    if (!gameId) {

        alert(
            "Game ID is missing."
        );

        return;

    }


    const titleInput =
        document.getElementById(
            "editSportsGameTitle"
        );


    const leagueInput =
        document.getElementById(
            "editSportsGameLeague"
        );


    const statusInput =
        document.getElementById(
            "editSportsGameStatus"
        );


    const matchStatusInput =
        document.getElementById(
            "editSportsGameMatchStatus"
        );


    const homeInput =
        document.getElementById(
            "editSportsGameHome"
        );


    const awayInput =
        document.getElementById(
            "editSportsGameAway"
        );


    const totalRunsInput =
        document.getElementById(
            "editTotalRuns"
        );


    const overUnderInput =
        document.getElementById(
            "editOverUnder"
        );


    const matchWinnerInput =
        document.getElementById(
            "editMatchWinner"
        );


    const selectedStatus =
        statusInput
            ? normalizeStatus(
                statusInput.value
            )
            : "";


    const selectedMatchStatus =
        matchStatusInput
            ? normalizeMatchStatus(
                matchStatusInput.value
            )
            : "enable";


    const allowedStatuses = [

        "live",

        "upcoming",

        "featured"

    ];


    const allowedMatchStatuses = [

        "enable",

        "disable",

        "reject"

    ];


    if (
        !allowedStatuses.includes(
            selectedStatus
        )
    ) {

        alert(
            "Please select a valid game status."
        );

        return;

    }


    if (
        !allowedMatchStatuses.includes(
            selectedMatchStatus
        )
    ) {

        alert(
            "Please select a valid match status."
        );

        return;

    }


    const updatedGame = {

        title:
            titleInput
                ? titleInput.value.trim()
                : "",

        league:
            leagueInput
                ? leagueInput.value.trim()
                : "",

        status:
            selectedStatus,

        match_status:
            selectedMatchStatus,

        home_team:
            homeInput
                ? homeInput.value.trim()
                : "",

        away_team:
            awayInput
                ? awayInput.value.trim()
                : "",

        total_runs_enabled:
            totalRunsInput
                ? totalRunsInput.checked
                : true,

        over_under_enabled:
            overUnderInput
                ? overUnderInput.checked
                : true,

        match_winner_enabled:
            matchWinnerInput
                ? matchWinnerInput.checked
                : true

    };


    if (
        !updatedGame.title ||
        !updatedGame.league ||
        !updatedGame.home_team ||
        !updatedGame.away_team
    ) {

        alert(
            "Please fill in all match information."
        );

        return;

    }


    if (!window.supabaseClient) {

        console.error(
            "❌ ADMIN: Supabase client unavailable."
        );

        alert(
            "Supabase connection unavailable."
        );

        return;

    }


    console.log(
        "💾 ADMIN: Updating game:",
        gameId,
        updatedGame
    );


    const {
        data,
        error
    } =
        await window.supabaseClient
            .from(
                "sports_games"
            )
            .update(
                updatedGame
            )
            .eq(
                "game_id",
                gameId
            )
            .select()
            .single();


    if (error) {

        console.error(
            "❌ ADMIN: Sports game update failed:",
            error
        );

        alert(
            "Failed to update match.\n\n" +
            error.message
        );

        return;

    }


    console.log(
        "💾 SAVE RESULT:",
        data
    );


    window.adminSportsGames[
        gameId
    ] = data;


    const sport =
        normalizeSportName(
            data.sport
        );


    closeSportsGameEditor();


    renderAllAdminSportsGames();


    alert(
        "✅ Match updated successfully!"
    );

};


// ======================================================
// HTML ESCAPE
// ======================================================

function escapeAdminSportsHTML(
    value
) {

    return String(
        value ?? ""
    )
    .replace(
        /&/g,
        "&amp;"
    )
    .replace(
        /</g,
        "&lt;"
    )
    .replace(
        />/g,
        "&gt;"
    )
    .replace(
        /"/g,
        "&quot;"
    )
    .replace(
        /'/g,
        "&#039;"
    );

}


function escapeAdminSportsJS(
    value
) {

    return String(
        value ?? ""
    )
    .replace(
        /\\/g,
        "\\\\"
    )
    .replace(
        /'/g,
        "\\'"
    )
    .replace(
        /"/g,
        '\\"'
    )
    .replace(
        /\n/g,
        "\\n"
    )
    .replace(
        /\r/g,
        "\\r"
    );

}


// ======================================================
// SPORTS HELPERS
// ======================================================

function normalizeSportName(
    sport
) {

    return String(
        sport || ""
    )
    .trim()
    .toLowerCase();

}


function normalizeStatus(
    status
) {

    return String(
        status || ""
    )
    .trim()
    .toLowerCase();

}


function normalizeMatchStatus(
    status
) {

    const value =
        String(
            status || "enable"
        )
        .trim()
        .toLowerCase();


    return [
        "enable",
        "disable",
        "reject"
    ].includes(
        value
    )
        ? value
        : "enable";

}


function capitalizeSport(
    sport
) {

    const value =
        normalizeSportName(
            sport
        );


    if (!value) {

        return "";

    }


    return (
        value.charAt(0)
            .toUpperCase() +
        value.slice(1)
    );

}


function getSupportedSports() {

    return [

        "cricket",

        "football",

        "tennis",

        "basketball",

        "volleyball",

        "boxing",

        "hockey",

        "rugby",

        "golf"

    ];

}


function getSportsGridId(
    sport,
    status
) {

    const map = {

        cricket: {

            live:
                "adminCricketLiveGrid",

            upcoming:
                "adminCricketUpcomingGrid",

            featured:
                "adminCricketFeaturedGrid"

        },


        football: {

            live:
                "adminFootballLiveGrid",

            upcoming:
                "adminFootballUpcomingGrid",

            featured:
                "adminFootballFeaturedGrid"

        },


        tennis: {

            live:
                "adminTennisLiveGrid",

            upcoming:
                "adminTennisUpcomingGrid",

            featured:
                "adminTennisFeaturedGrid"

        },


        basketball: {

            live:
                "adminBasketballLiveGrid",

            upcoming:
                "adminBasketballUpcomingGrid",

            featured:
                "adminBasketballFeaturedGrid"

        },


        volleyball: {

            live:
                "adminVolleyballLiveGrid",

            upcoming:
                "adminVolleyballUpcomingGrid",

            featured:
                "adminVolleyballFeaturedGrid"

        },


        boxing: {

            live:
                "adminBoxingLiveGrid",

            upcoming:
                "adminBoxingUpcomingGrid",

            featured:
                "adminBoxingFeaturedGrid"

        },


        hockey: {

            live:
                "adminHockeyLiveGrid",

            upcoming:
                "adminHockeyUpcomingGrid",

            featured:
                "adminHockeyFeaturedGrid"

        },


        rugby: {

            live:
                "adminRugbyLiveGrid",

            upcoming:
                "adminRugbyUpcomingGrid",

            featured:
                "adminRugbyFeaturedGrid"

        },


        golf: {

            live:
                "adminGolfLiveGrid",

            upcoming:
                "adminGolfUpcomingGrid",

            featured:
                "adminGolfFeaturedGrid"

        }

    };


    return (
        map[
            normalizeSportName(
                sport
            )
        ]?.[
            normalizeStatus(
                status
            )
        ] ||
        ""
    );

}


// ======================================================
// GAME NAME MAP
// ======================================================

function getGameName(
    id
) {

    const games = {

        "G1001":
            "Jhandi Munda",

        "G1002":
            "Teen Patti",

        "G1003":
            "Wheel"

    };


    return (
        games[id] ||
        "Unknown Game"
    );

}


// ======================================================
// SETTINGS ACCORDION
// ======================================================

function toggleSection(
    sectionId
) {

    const allSections =
        document.querySelectorAll(
            ".settings-content"
        );


    const current =
        document.getElementById(
            sectionId
        );


    if (!current) return;


    const isOpen =
        current.style.display ===
        "block";


    allSections.forEach(
        section => {

            section.style.display =
                "none";

        }
    );


    if (!isOpen) {

        current.style.display =
            "block";

    }

}


// ======================================================
// GAME STATUS TOGGLE
// ======================================================

function toggleGameStatus() {

    const btn =
        document.getElementById(
            "gameStatusBtn"
        );


    if (!btn) return;


    if (
        btn.classList.contains(
            "status-active"
        )
    ) {

        btn.classList.remove(
            "status-active"
        );


        btn.classList.add(
            "status-inactive"
        );


        btn.innerHTML =
            "🔴 INACTIVE";

    }

    else {

        btn.classList.remove(
            "status-inactive"
        );


        btn.classList.add(
            "status-active"
        );


        btn.innerHTML =
            "🟢 ACTIVE";

    }

}


// ======================================================
// TEST BACKEND CONNECTION
// ======================================================

function testConnection() {

    const status =
        document.getElementById(
            "connectionStatus"
        );


    const sync =
        document.getElementById(
            "lastSyncTime"
        );


    if (
        !status ||
        !sync
    ) return;


    status.innerHTML =
        "🟡 Checking...";


    setTimeout(
        () => {

            status.innerHTML =
                "🟢 Connected";


            sync.innerHTML =
                new Date()
                    .toLocaleString();

        },
        1000
    );

}


// ======================================================
// API KEY GENERATOR
// ======================================================

function generateApiKey() {

    const key =
        "API-" +
        Math.random()
            .toString(36)
            .substring(
                2,
                12
            )
            .toUpperCase();


    const field =
        document.getElementById(
            "gs_apiKey"
        );


    if (field) {

        field.value =
            key;

    }

}


// ======================================================
// SAVE GAME SETTINGS
// ======================================================

function saveGameSettings() {

    const data = {

        gameId:
            window.activeGameId,

        status:
            document.getElementById(
                "gameStatusBtn"
            )?.innerText || "",

        rtp:
            document.getElementById(
                "gs_rtp"
            )?.value || "",

        minBet:
            document.getElementById(
                "gs_minBet"
            )?.value || "",

        maxBet:
            document.getElementById(
                "gs_maxBet"
            )?.value || "",

        apiKey:
            document.getElementById(
                "gs_apiKey"
            )?.value || "",

        serverKey:
            document.getElementById(
                "gs_serverKey"
            )?.value || ""

    };


    console.log(
        "Game Settings Saved:",
        data
    );


    alert(
        "✅ Game Settings Saved"
    );

}


// ======================================================
// ADD GAME PLACEHOLDER
// ======================================================

function openAddGame() {

    alert(
        "Add Game System Coming Next"
    );

}


// ======================================================
// GAMES SECTION END
// ======================================================


// ======================================================
// FINANCE SECTION START
// ======================================================

const financeConfig = {

    autoDeposit:
        true,

    manualDeposit:
        false,

    autoWithdraw:
        false,

    manualWithdraw:
        true

};


// ======================================================
// FINANCE SECTION TOGGLE
// ======================================================

function toggleFinanceSection(
    panelId
) {

    const panels = [

        "depositFinancePanel",

        "withdrawFinancePanel"

    ];


    panels.forEach(
        function (id) {

            const panel =
                document.getElementById(
                    id
                );


            if (!panel) return;


            if (id === panelId) {

                if (
                    panel.style.display ===
                    "none" ||
                    panel.style.display ===
                    ""
                ) {

                    panel.style.display =
                        "block";

                }

                else {

                    panel.style.display =
                        "none";

                }

            }

            else {

                panel.style.display =
                    "none";

            }

        }
    );

}


// ======================================================
// ADD COIN FORM
// ======================================================

function toggleAddCoinForm() {

    const form =
        document.getElementById(
            "addCoinForm"
        );


    if (!form) return;


    form.style.display =
        form.style.display ===
        "none" ||
        form.style.display ===
        ""
            ? "block"
            : "none";

}


// ======================================================
// PAYMENT GATEWAY FORM
// ======================================================

function toggleAddGatewayForm() {

    const form =
        document.getElementById(
            "addGatewayForm"
        );


    if (!form) return;


    form.style.display =
        form.style.display ===
        "none" ||
        form.style.display ===
        ""
            ? "block"
            : "none";

}


// ======================================================
// DEPOSIT MENU
// ======================================================

function toggleDepositMenu(
    panelId
) {

    const panels = [

        "paymentGatewayPanel",

        "depositSettingsPanel",

        "pendingDepositsPanel",

        "depositHistoryPanel",

        "depositReportsPanel",

        "depositLogsPanel"

    ];


    panels.forEach(
        function (id) {

            const panel =
                document.getElementById(
                    id
                );


            if (!panel) return;


            if (id === panelId) {

                panel.style.display =
                    panel.style.display ===
                    "none" ||
                    panel.style.display ===
                    ""
                        ? "block"
                        : "none";

            }

            else {

                panel.style.display =
                    "none";

            }

        }
    );

}


// ======================================================
// WITHDRAW MENU
// ======================================================

function toggleWithdrawMenu(
    panelId
) {

    const panels = [

        "withdrawRequestPanel",

        "approvedWithdrawPanel",

        "rejectedWithdrawPanel",

        "withdrawHistoryPanel",

        "withdrawReportsPanel",

        "approvalRulesPanel"

    ];


    panels.forEach(
        function (id) {

            const panel =
                document.getElementById(
                    id
                );


            if (!panel) return;


            if (id === panelId) {

                panel.style.display =
                    panel.style.display ===
                    "none" ||
                    panel.style.display ===
                    ""
                        ? "block"
                        : "none";

            }

            else {

                panel.style.display =
                    "none";

            }

        }
    );

}


// ======================================================
// AUTO DEPOSIT
// ======================================================

function toggleAutoDeposit() {

    financeConfig.autoDeposit =
        !financeConfig.autoDeposit;


    alert(
        "Auto Deposit: " +
        (
            financeConfig.autoDeposit
                ? "ON"
                : "OFF"
        )
    );

}


// ======================================================
// MANUAL DEPOSIT
// ======================================================

function toggleManualDeposit() {

    financeConfig.manualDeposit =
        !financeConfig.manualDeposit;


    alert(
        "Manual Deposit: " +
        (
            financeConfig.manualDeposit
                ? "ON"
                : "OFF"
        )
    );

}


// ======================================================
// AUTO WITHDRAW
// ======================================================

function toggleAutoWithdraw() {

    financeConfig.autoWithdraw =
        !financeConfig.autoWithdraw;


    alert(
        "Auto Withdraw: " +
        (
            financeConfig.autoWithdraw
                ? "ON"
                : "OFF"
        )
    );

}


// ======================================================
// MANUAL WITHDRAW
// ======================================================

function toggleManualWithdraw() {

    financeConfig.manualWithdraw =
        !financeConfig.manualWithdraw;


    alert(
        "Manual Withdraw: " +
        (
            financeConfig.manualWithdraw
                ? "ON"
                : "OFF"
        )
    );

}


// ======================================================
// SAVE FINANCE SETTINGS
// ======================================================

function saveFinanceSettings() {

    const financeData = {

        autoDeposit:
            financeConfig.autoDeposit,

        manualDeposit:
            financeConfig.manualDeposit,

        autoWithdraw:
            financeConfig.autoWithdraw,

        manualWithdraw:
            financeConfig.manualWithdraw

    };


    console.log(
        "Finance Settings Saved:",
        financeData
    );


    alert(
        "✅ Finance Settings Saved"
    );

}


// ======================================================
// FINANCE SECTION END
// ======================================================


// ======================================================
// WALLET ADD FEATURE
// ======================================================

function toggleEditWallet(
    formId
) {

    const form =
        document.getElementById(
            formId
        );


    if (!form) return;


    form.style.display =
        form.style.display ===
        "none"
            ? "block"
            : "none";

}


// ======================================================
// WITHDRAW DATA STORE
// ======================================================

window.withdrawRequests =
    window.withdrawRequests ||
    [

        {

            id:
                "W001",

            userId:
                1052,

            username:
                "player123",

            amount:
                250,

            coin:
                "USDT",

            status:
                "pending"

        }

    ];


// ======================================================
// FIND REQUEST
// ======================================================

function getRequest(
    id
) {

    return window.withdrawRequests
        .find(
            request =>
                request.id ===
                id
        );

}


// ======================================================
// APPROVE WITHDRAW
// ======================================================

function approveWithdraw(
    id
) {

    const req =
        getRequest(
            id
        );


    if (!req) {

        alert(
            "Withdraw Request Not Found"
        );

        return;

    }


    req.status =
        "approved";


    alert(
        "Withdraw Request Approved"
    );


    renderPanels();

}


// ======================================================
// REJECT WITHDRAW
// ======================================================

function rejectWithdraw(
    id
) {

    const req =
        getRequest(
            id
        );


    if (!req) return;


    req.status =
        "rejected";


    alert(
        "Rejected: " +
        id
    );


    renderPanels();

}


// ======================================================
// SEND MONEY
// ======================================================

function sendMoney(
    id
) {

    const req =
        getRequest(
            id
        );


    if (!req) {

        alert(
            "Withdraw Request Not Found"
        );

        return;

    }


    if (
        req.status !==
        "approved"
    ) {

        alert(
            "Not approved yet!"
        );

        return;

    }


    req.status =
        "completed";


    alert(
        "Your payment has been sent successfully."
    );


    renderPanels();

}


// ======================================================
// RENDER ALL PANELS
// ======================================================

function renderPanels() {

    renderRequestPanel();

    renderApprovedPanel();

    renderRejectedPanel();

    renderHistoryPanel();

    renderAffiliateOverview();

    renderReferralPlayers();

    renderAffiliatePayoutRequests();

    renderAffiliatePayoutHistory();

}


// ======================================================
// WITHDRAW REQUEST PANEL
// ======================================================

function renderRequestPanel() {

    const tbody =
        document.querySelector(
            "#withdrawRequestPanel tbody"
        );


    if (!tbody) return;


    tbody.innerHTML =
        "";


    window.withdrawRequests
        .forEach(
            req => {

                let statusText =
                    "";

                let actionButtons =
                    "";


                if (
                    req.status ===
                    "pending"
                ) {

                    statusText =
                        "🟡 Pending";


                    actionButtons = `

                        <button
                            onclick="approveWithdraw('${req.id}')"
                        >
                            Approve
                        </button>

                        <button
                            onclick="rejectWithdraw('${req.id}')"
                        >
                            Reject
                        </button>

                    `;

                }

                else if (
                    req.status ===
                    "approved"
                ) {

                    statusText =
                        "🟢 Approved";


                    actionButtons =
                        `<span>Approved</span>`;

                }

                else if (
                    req.status ===
                    "rejected"
                ) {

                    statusText =
                        "🔴 Rejected";


                    actionButtons =
                        `<span>Rejected</span>`;

                }


                tbody.innerHTML += `

                    <tr>

                        <td>
                            ${req.id}
                        </td>

                        <td>
                            ${req.userId}
                        </td>

                        <td>
                            ${req.username}
                        </td>

                        <td>
                            ${req.amount}
                        </td>

                        <td>
                            ${req.coin}
                        </td>

                        <td>
                            ${statusText}
                        </td>

                        <td>
                            ${actionButtons}
                        </td>

                    </tr>

                `;

            }
        );

}


// ======================================================
// APPROVED PANEL
// ======================================================

function renderApprovedPanel() {

    const tbody =
        document.querySelector(
            "#approvedWithdrawPanel tbody"
        );


    if (!tbody) return;


    tbody.innerHTML =
        "";


    window.withdrawRequests
        .forEach(
            req => {

                if (
                    req.status ===
                    "approved" ||
                    req.status ===
                    "completed"
                ) {

                    let paymentStatus =
                        "";

                    let actionButton =
                        "";


                    if (
                        req.status ===
                        "approved"
                    ) {

                        paymentStatus =
                            "🟡 Waiting for Payment";


                        actionButton = `

                            <button
                                onclick="sendMoney('${req.id}')"
                            >
                                Send Money
                            </button>

                        `;

                    }


                    if (
                        req.status ===
                        "completed"
                    ) {

                        paymentStatus =
                            "🟢 Payment Completed";


                        actionButton = `

                            <button disabled>
                                Completed
                            </button>

                        `;

                    }


                    tbody.innerHTML += `

                        <tr>

                            <td>
                                ${req.userId}
                            </td>

                            <td>
                                ${req.coin}
                            </td>

                            <td>
                                ${req.amount}
                            </td>

                            <td>
                                ${paymentStatus}
                            </td>

                            <td>
                                ${actionButton}
                            </td>

                        </tr>

                    `;

                }

            }
        );

}


// ======================================================
// REJECTED PANEL
// ======================================================

function renderRejectedPanel() {

    const tbody =
        document.querySelector(
            "#rejectedWithdrawPanel tbody"
        );


    if (!tbody) return;


    tbody.innerHTML =
        "";


    window.withdrawRequests
        .forEach(
            req => {

                if (
                    req.status ===
                    "rejected"
                ) {

                    tbody.innerHTML += `

                        <tr>

                            <td>
                                ${req.userId}
                            </td>

                            <td>
                                ${req.coin}
                            </td>

                            <td>
                                ${req.amount}
                            </td>

                            <td>
                                🔴 Rejected
                            </td>

                        </tr>

                    `;

                }

            }
        );

}


// ======================================================
// HISTORY PANEL
// ======================================================

function renderHistoryPanel() {

    const list =
        document.getElementById(
            "withdrawHistoryList"
        );


    if (!list) return;


    list.innerHTML =
        "";


    let total =
        0;


    let today =
        0;


    const todayDate =
        new Date()
            .toISOString()
            .split(
                "T"
            )[0];


    if (
        !Array.isArray(
            window.withdrawHistory
        )
    ) {

        window.withdrawHistory =
            [];

    }


    window.withdrawHistory
        .forEach(
            item => {

                total +=
                    Number(
                        item.amount
                    );


                if (
                    item.date &&
                    item.date.includes(
                        todayDate
                    )
                ) {

                    today +=
                        Number(
                            item.amount
                        );

                }


                list.innerHTML += `

                    <p>

                        ${item.date}
                        -
                        ${item.amount}
                        BDT
                        (${item.status})

                    </p>

                `;

            }
        );


    const totalWithdraw =
        document.getElementById(
            "totalWithdraw"
        );


    const todayWithdraw =
        document.getElementById(
            "todayWithdraw"
        );


    if (totalWithdraw) {

        totalWithdraw.innerText =
            total;

    }


    if (todayWithdraw) {

        todayWithdraw.innerText =
            today;

    }

}


// ======================================================
// OPTIONAL NOTIFICATION
// ======================================================

function sendNotificationToUser(
    userId,
    message
) {

    console.log(
        "Notification:",
        userId,
        message
    );

}


// ======================================================
// AFFILIATE CENTER
// ======================================================

let affiliateStats = {

    totalReferrals:
        0,

    activeReferrals:
        0,

    commissionPaid:
        0,

    pendingCommission:
        0

};


let weeklyRevenueStore =
    {};


// ======================================================
// AFFILIATE OVERVIEW
// ======================================================

function renderAffiliateOverview(
    data = affiliateStats
) {

    if (!data) return;


    const total =
        document.getElementById(
            "totalReferrals"
        );


    const active =
        document.getElementById(
            "activeReferrals"
        );


    const paid =
        document.getElementById(
            "commissionPaid"
        );


    const pending =
        document.getElementById(
            "pendingCommission"
        );


    if (total) {

        total.textContent =
            data.totalReferrals ??
            0;

    }


    if (active) {

        active.textContent =
            data.activeReferrals ??
            0;

    }


    if (paid) {

        paid.textContent =
            "$" +
            (
                data.commissionPaid ??
                0
            );

    }


    if (pending) {

        pending.textContent =
            "$" +
            (
                data.pendingCommission ??
                0
            );

    }

}


// ======================================================
// REVENUE ANALYTICS
// ======================================================

function renderRevenueAnalytics(
    data
) {

    if (!data) return;


    const today =
        document.getElementById(
            "todayRevenue"
        );


    const weekly =
        document.getElementById(
            "weeklyRevenue"
        );


    const monthly =
        document.getElementById(
            "monthlyRevenue"
        );


    const lifetime =
        document.getElementById(
            "lifetimeRevenue"
        );


    if (today) {

        today.textContent =
            "$" +
            (
                data.todayRevenue ??
                0
            );

    }


    if (weekly) {

        weekly.textContent =
            "$" +
            (
                data.weeklyRevenue ??
                0
            );

    }


    if (monthly) {

        monthly.textContent =
            "$" +
            (
                data.monthlyRevenue ??
                0
            );

    }


    if (lifetime) {

        lifetime.textContent =
            "$" +
            (
                data.lifetimeRevenue ??
                0
            );

    }

}


// ======================================================
// REVENUE TABLE
// ======================================================

function renderRevenueTable(
    players
) {

    const tbody =
        document.getElementById(
            "revenueAnalyticsTableBody"
        );


    if (!tbody) return;


    tbody.innerHTML =
        "";


    (players || [])
        .forEach(
            p => {

                tbody.innerHTML += `

                    <tr>

                        <td>
                            ${p.affiliateId}
                        </td>

                        <td>
                            ${p.playerId}
                        </td>

                        <td>
                            $${p.todayRevenue ?? 0}
                        </td>

                        <td>
                            $${p.weeklyRevenue ?? 0}
                        </td>

                        <td>
                            $${p.monthlyRevenue ?? 0}
                        </td>

                        <td>
                            ${p.status}
                        </td>

                    </tr>

                `;

            }
        );

}


// ======================================================
// DAILY CALCULATION
// ======================================================

function calculateDailyRevenue(
    player
) {

    const deposit =
        player.todayDeposit ??
        0;


    const loss =
        player.todayLoss ??
        0;


    const win =
        player.todayWin ??
        0;


    const netRevenue =
        loss -
        win;


    if (
        netRevenue <=
        0
    ) {

        return {

            revenue:
                0,

            commission:
                0

        };

    }


    let commissionRate =
        0;


    if (
        netRevenue <=
        100
    ) {

        commissionRate =
            0.35;

    }

    else if (
        netRevenue <=
        300
    ) {

        commissionRate =
            0.45;

    }

    else if (
        netRevenue <=
        500
    ) {

        commissionRate =
            0.50;

    }

    else {

        commissionRate =
            0.60;

    }


    const revenue =
        netRevenue;


    const commission =
        revenue *
        commissionRate;


    return {

        revenue:
            revenue,

        commission:
            commission

    };

}


// ======================================================
// DAILY AUTO ENGINE
// ======================================================

function runDailyAffiliateEngine() {

    if (
        !Array.isArray(
            window.referralPlayers
        )
    ) {

        return;

    }


    window.referralPlayers
        .forEach(
            player => {

                const calc =
                    calculateDailyRevenue(
                        player
                    );


                player.todayRevenue =
                    calc.revenue;


                player.revenueEarned =
                    calc.commission;


                addToWeeklyRevenue(
                    player.playerId,
                    calc.revenue
                );

            }
        );


    console.log(
        "DAILY ENGINE RUN COMPLETED"
    );

}


// ======================================================
// DAILY AUTO TRIGGER
// ======================================================

setInterval(
    () => {

        runDailyAffiliateEngine();

    },
    24 *
    60 *
    60 *
    1000
);


// ======================================================
// WEEKLY AUTO TRIGGER
// ======================================================

setInterval(
    () => {

        runWeeklyCheck();

    },
    7 *
    24 *
    60 *
    60 *
    1000
);


// ======================================================
// WEEKLY CHECK
// ======================================================

function runWeeklyCheck() {

    Object.keys(
        weeklyRevenueStore
    )
    .forEach(
        playerId => {

            const payout =
                calculateWeeklyPayout(
                    playerId
                );


            if (
                payout &&
                payout.eligible
            ) {

                console.log(
                    "PAYOUT READY:",
                    playerId,
                    payout.payout
                );

            }

        }
    );

}


// ======================================================
// DAILY INTO WEEKLY
// ======================================================

function addToWeeklyRevenue(
    playerId,
    dailyRevenue
) {

    if (
        !weeklyRevenueStore[
            playerId
        ]
    ) {

        weeklyRevenueStore[
            playerId
        ] = {

            totalRevenue:
                0,

            days:
                0

        };

    }


    weeklyRevenueStore[
        playerId
    ].totalRevenue +=
        Number(
            dailyRevenue || 0
        );


    weeklyRevenueStore[
        playerId
    ].days +=
        1;

}


// ======================================================
// MONTHLY DATA
// ======================================================

function setMonthlyData(
    payload
) {

    const element =
        document.getElementById(
            "monthlyRevenueAnalytics"
        );


    if (!element) return;


    element.textContent =
        "$" +
        (
            payload?.totalRevenue ||
            0
        );

}


// ======================================================
// LIFETIME DATA
// ======================================================

function setLifetimeData(
    payload
) {

    const revenue =
        document.getElementById(
            "lifetimeRevenueAnalytics"
        );


    const commission =
        document.getElementById(
            "lifetimeCommissionAnalytics"
        );


    if (revenue) {

        revenue.textContent =
            "$" +
            (
                payload?.totalRevenue ||
                0
            );

    }


    if (commission) {

        commission.textContent =
            "$" +
            (
                payload?.totalCommission ||
                0
            );

    }

}


// ======================================================
// SHOW AFFILIATE PANEL
// ======================================================

function showAffiliatePanel(
    panelId
) {

    const panels = [

        "referralPlayersPanel",

        "commissionControlPanel",

        "affiliateRevenuePanel",

        "affiliateWeeklySettlementPanel",

        "affiliateMonthlySettlementPanel",

        "affiliatePayoutRequestPanel",

        "affiliatePayoutHistoryPanel"

    ];


    panels.forEach(
        id => {

            const panel =
                document.getElementById(
                    id
                );


            if (panel) {

                panel.style.display =
                    "none";

            }

        }
    );


    const targetPanel =
        document.getElementById(
            panelId
        );


    if (targetPanel) {

        targetPanel.style.display =
            "block";

    }

}


// ======================================================
// REFERRAL PLAYERS
// ======================================================

function renderReferralPlayers() {

    const tbody =
        document.getElementById(
            "referralPlayersTableBody"
        );


    if (!tbody) return;


    tbody.innerHTML =
        "";


    if (
        !Array.isArray(
            window.referralPlayers
        )
    ) {

        return;

    }


    window.referralPlayers
        .forEach(
            player => {

                const calc =
                    calculateDailyRevenue(
                        player
                    );


                tbody.innerHTML += `

                    <tr>

                        <td>
                            ${player.affiliateId}
                        </td>

                        <td>
                            ${player.playerId}
                        </td>

                        <td>
                            ${player.username}
                        </td>

                        <td>
                            $${player.todayDeposit ?? 0}
                        </td>

                        <td>
                            $${player.todayLoss ?? 0}
                        </td>

                        <td>
                            $${player.todayWin ?? 0}
                        </td>

                        <td>
                            $${calc.revenue.toFixed(2)}
                        </td>

                        <td>
                            $${calc.commission.toFixed(2)}
                        </td>

                        <td>
                            ${player.status}
                        </td>

                    </tr>

                `;

            }
        );

}


// ======================================================
// AFFILIATE PAYOUT REQUESTS
// ======================================================

function renderAffiliatePayoutRequests() {

    const tbody =
        document.getElementById(
            "affiliatePayoutRequestTableBody"
        );


    if (!tbody) return;


    tbody.innerHTML =
        "";


    if (
        !Array.isArray(
            window.affiliatePayoutRequests
        )
    ) {

        return;

    }


    window.affiliatePayoutRequests
        .forEach(
            req => {

                tbody.innerHTML += `

                    <tr>

                        <td>
                            ${req.requestId}
                        </td>

                        <td>
                            ${req.affiliateId}
                        </td>

                        <td>
                            ${req.username}
                        </td>

                        <td>
                            ${req.amount}
                        </td>

                        <td>
                            ${req.status}
                        </td>

                        <td>

                            <button
                                onclick="approveAffiliatePayout('${req.requestId}')"
                            >
                                Approve
                            </button>

                            <button
                                onclick="rejectAffiliatePayout('${req.requestId}')"
                            >
                                Reject
                            </button>

                        </td>

                    </tr>

                `;

            }
        );

}


// ======================================================
// COMMISSION CONTROL
// ======================================================

function saveAffiliateSettings() {

    const settings = {

        level1Commission:
            document.getElementById(
                "level1Commission"
            )?.value || "",

        level2Commission:
            document.getElementById(
                "level2Commission"
            )?.value || "",

        level3Commission:
            document.getElementById(
                "level3Commission"
            )?.value || "",

        affiliateMinWithdraw:
            document.getElementById(
                "affiliateMinWithdraw"
            )?.value || "",

        affiliateMinPayout:
            document.getElementById(
                "affiliateMinPayout"
            )?.value || "",

        affiliateSettlementCycle:
            document.getElementById(
                "affiliateSettlementCycle"
            )?.value || ""

    };


    localStorage.setItem(
        "affiliateSettings",
        JSON.stringify(
            settings
        )
    );


    alert(
        "Affiliate Settings Saved Successfully"
    );

}


// ======================================================
// APPROVE AFFILIATE PAYOUT
// ======================================================

function approveAffiliatePayout(
    requestId
) {

    if (
        !Array.isArray(
            window.affiliatePayoutRequests
        )
    ) {

        return;

    }


    const request =
        window.affiliatePayoutRequests
            .find(
                r =>
                    r.requestId ===
                    requestId
            );


    if (!request) return;


    request.status =
        "Approved";


    console.log(
        "PAYOUT APPROVED:",
        requestId
    );


    renderAffiliatePayoutRequests();

}


// ======================================================
// REJECT AFFILIATE PAYOUT
// ======================================================

function rejectAffiliatePayout(
    requestId
) {

    if (
        !Array.isArray(
            window.affiliatePayoutRequests
        )
    ) {

        return;

    }


    const request =
        window.affiliatePayoutRequests
            .find(
                r =>
                    r.requestId ===
                    requestId
            );


    if (!request) return;


    request.status =
        "Rejected";


    console.log(
        "PAYOUT REJECTED:",
        requestId
    );


    renderAffiliatePayoutRequests();

}


// ======================================================
// SEND AFFILIATE PAYMENT
// ======================================================

function sendAffiliatePayment(
    requestId
) {

    if (
        !Array.isArray(
            window.affiliatePayoutRequests
        )
    ) {

        return;

    }


    if (
        !Array.isArray(
            window.affiliatePayoutHistory
        )
    ) {

        window.affiliatePayoutHistory =
            [];

    }


    const request =
        window.affiliatePayoutRequests
            .find(
                r =>
                    r.requestId ===
                    requestId
            );


    if (!request) return;


    if (
        request.status !==
        "Approved"
    ) {

        alert(
            "Approve first before sending payment"
        );

        return;

    }


    window.affiliatePayoutHistory.push({

        transactionId:
            "TXN_" +
            Date.now(),

        affiliateId:
            request.affiliateId,

        amount:
            request.amount,

        date:
            new Date()
                .toLocaleDateString(),

        status:
            "Paid"

    });


    request.status =
        "Paid";


    console.log(
        "PAYMENT SENT:",
        requestId
    );


    renderAffiliatePayoutRequests();

    renderAffiliatePayoutHistory();

}


// ======================================================
// PAYOUT HISTORY
// ======================================================

function renderAffiliatePayoutHistory() {

    const tbody =
        document.getElementById(
            "affiliatePayoutHistoryTableBody"
        );


    if (!tbody) return;


    tbody.innerHTML =
        "";


    if (
        !Array.isArray(
            window.affiliatePayoutHistory
        )
    ) {

        return;

    }


    window.affiliatePayoutHistory
        .forEach(
            item => {

                tbody.innerHTML += `

                    <tr>

                        <td>
                            ${item.transactionId}
                        </td>

                        <td>
                            ${item.affiliateId}
                        </td>

                        <td>
                            ${item.amount}
                        </td>

                        <td>
                            ${item.date}
                        </td>

                        <td>
                            ${item.status}
                        </td>

                    </tr>

                `;

            }
        );

}


// ======================================================
// FINAL ADMIN ENGINE MARKER
// ======================================================

console.log(
    "✅ SAFIKI ADMIN.JS LOADED"
);

console.log(
    "🏏 SPORTS CONTROL ENGINE READY"
);
