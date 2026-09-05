// ==========================
// SAFIKI ADMIN PANEL ENGINE
// ==========================


// ======================================================
// GLOBAL ADMIN SPORTS CACHE
// ======================================================

window.adminSportsGames = window.adminSportsGames || {};
window.activeSportsGameId = null;


// ======================================================
// DOM READY
// ======================================================

document.addEventListener("DOMContentLoaded", function () {

    // INIT SIDEBAR
    initSidebar();


    // =========================
    // GAME LOAD BUTTON LOGIC
    // =========================

    const btn =
        document.getElementById("loadGameBtn");


    if (btn) {

        btn.addEventListener("click", function () {

            const selector =
                document.getElementById("gameSelector");


            const game =
                selector ? selector.value : "";


            if (!game) {

                alert("Select a game first");

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

        });

    }


    // =========================
    // RTP SLIDER
    // =========================

    const rtpSlider =
        document.getElementById("gs_rtp");


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


    // =========================
    // ADMIN SPORTS SYSTEM
    // =========================

    console.log(
        "🏏 ADMIN SPORTS SYSTEM READY"
    );


    loadAdminSportsGames();

});


// ======================================================
// SIDEBAR SYSTEM
// ======================================================

function initSidebar() {

    const menuItems =
        document.querySelectorAll(
            ".sidebar-menu li"
        );


    const sections =
        document.querySelectorAll(
            ".admin-section"
        );


    menuItems.forEach(item => {

        item.addEventListener(
            "click",
            function () {

                const target =
                    item.getAttribute(
                        "data-target"
                    );


                menuItems.forEach(menuItem => {

                    menuItem.classList.remove(
                        "active"
                    );

                });


                item.classList.add(
                    "active"
                );


                sections.forEach(section => {

                    section.style.display =
                        "none";

                });


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

    });

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


    let rtp =
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
        userInput ? userInput.value : "";


    const amount =
        amountInput ? amountInput.value : "";


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
        userInput ? userInput.value : "";


    const amount =
        amountInput ? amountInput.value : "";


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
        userInput ? userInput.value : "";


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
        input ? input.value : "";


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


    panels.forEach(panel => {

        panel.style.display =
            "none";

    });


    buttons.forEach(button => {

        button.classList.remove(
            "active"
        );

    });


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

// CURRENT GAME
window.activeGameId = null;
window.activeSportsGameId = null;

// ======================================================
// OPEN GAME SETTINGS PANEL
// ======================================================

function openGameSettings(gameId) {

    const panel =
        document.getElementById("gameSettingsPanel");

    if (!panel) return;

    if (window.activeGameId === gameId) {

        const isVisible =
            window.getComputedStyle(panel).display !== "none";

        if (isVisible) {

            panel.style.display = "none";
            window.activeGameId = null;

            return;
        }
    }

    window.activeGameId = gameId;

    panel.style.display = "block";

    const idElement =
        document.getElementById("gs_id");

    const nameElement =
        document.getElementById("gs_name");

    if (idElement) {
        idElement.innerText = gameId;
    }

    if (nameElement) {
        nameElement.innerText =
            getGameName(gameId);
    }
}


// ======================================================
// GAME SUB SECTION
// ======================================================

window.openSportsSection = function () {

    const sports =
        document.getElementById("sportsSection");

    const casino =
        document.getElementById("casinoSection");

    if (sports) {
        sports.style.display = "block";
    }

    if (casino) {
        casino.style.display = "none";
    }
};


window.openCasinoSection = function () {

    const sports =
        document.getElementById("sportsSection");

    const casino =
        document.getElementById("casinoSection");

    if (sports) {
        sports.style.display = "none";
    }

    if (casino) {
        casino.style.display = "block";
    }
};


// ======================================================
// HIDE ALL ADMIN SPORTS SECTIONS
// ======================================================

function hideAllAdminSportsSections() {

    document
        .querySelectorAll(".admin-sport-section")
        .forEach(section => {

            section.style.display = "none";

        });
}


// ======================================================
// SPORTS SELECTORS
// ======================================================

window.adminSportsCricket = function () {

    hideAllAdminSportsSections();

    const section =
        document.getElementById("adminCricketSection");

    if (section) {
        section.style.display = "block";
    }

    openCricketLive();
};


window.adminSportsFootball = function () {

    hideAllAdminSportsSections();

    const section =
        document.getElementById("adminFootballSection");

    if (section) {
        section.style.display = "block";
    }

    openFootballLive();
};


window.adminSportsTennis = function () {

    hideAllAdminSportsSections();

    const section =
        document.getElementById("adminTennisSection");

    if (section) {
        section.style.display = "block";
    }

    openTennisLive();
};


window.adminSportsBasketball = function () {

    hideAllAdminSportsSections();

    const section =
        document.getElementById("adminBasketballSection");

    if (section) {
        section.style.display = "block";
    }

    openBasketballLive();
};


window.adminSportsVolleyball = function () {

    hideAllAdminSportsSections();

    const section =
        document.getElementById("adminVolleyballSection");

    if (section) {
        section.style.display = "block";
    }

    openVolleyballLive();
};


window.adminSportsBoxing = function () {

    hideAllAdminSportsSections();

    const section =
        document.getElementById("adminBoxingSection");

    if (section) {
        section.style.display = "block";
    }

    openBoxingLive();
};


window.adminSportsHockey = function () {

    hideAllAdminSportsSections();

    const section =
        document.getElementById("adminHockeySection");

    if (section) {
        section.style.display = "block";
    }

    openHockeyLive();
};


window.adminSportsRugby = function () {

    hideAllAdminSportsSections();

    const section =
        document.getElementById("adminRugbySection");

    if (section) {
        section.style.display = "block";
    }

    openRugbyLive();
};


window.adminSportsGolf = function () {

    hideAllAdminSportsSections();

    const section =
        document.getElementById("adminGolfSection");

    if (section) {
        section.style.display = "block";
    }

    openGolfLive();
};


// Keep existing function
window.adminSportsOthers = function () {

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

    document
        .querySelectorAll("." + contentClass)
        .forEach(item => {

            item.style.display = "none";

        });

    const panel =
        document.getElementById(gridId);

    if (panel) {

        panel.style.display = "grid";

    }

    const buttons =
        button
            ? button.parentElement.querySelectorAll("button")
            : [];

    buttons.forEach(btn => {

        btn.classList.remove("active");

    });

    if (button) {

        button.classList.add("active");

    }

    renderAdminSportGames(
        sport,
        status
    );
}



// ======================================================
// CRICKET TABS
// ======================================================

window.openCricketLive = async function (btn) {

    const panel = document.getElementById("cricketLive");

    if (panel) {
        panel.style.display = "block";
    }

    await ensureAdminSportsGamesLoaded();

    renderAdminCricketGamesByStatus("live");
};


window.openCricketUpcoming = async function (btn) {

    const panel = document.getElementById("cricketUpcoming");

    if (panel) {
        panel.style.display = "block";
    }

    await ensureAdminSportsGamesLoaded();

    renderAdminCricketGamesByStatus("upcoming");
};


window.openCricketFeatured = async function (btn) {

    const panel = document.getElementById("cricketFeatured");

    if (panel) {
        panel.style.display = "block";
    }

    await ensureAdminSportsGamesLoaded();

    renderAdminCricketGamesByStatus("featured");
};

// ======================================================
// ADD NEW CRICKET GAME MODAL
// ======================================================
// ======================================================
// ADD NEW CRICKET GAME
// INLINE EXPANDABLE PANEL
// ======================================================

window.openAddCricketGameModal = function () {

    console.log(
        "➕ ADD NEW GAME CLICKED"
    );


    // ==================================================
    // CRICKET SECTION
    // ==================================================

    const cricketSection =
        document.getElementById(
            "adminCricketSection"
        );


    if (!cricketSection) {

        console.error(
            "❌ Cricket section not found."
        );

        return;

    }


    // ==================================================
    // FIND EXISTING MODAL
    // ==================================================

    let modal =
        document.getElementById(
            "addCricketGameModal"
        );


    // ==================================================
    // CREATE MODAL ONCE
    // ==================================================

    if (!modal) {

        modal =
            document.createElement("div");

        modal.id =
            "addCricketGameModal";

        modal.className =
            "sports-game-edit-modal";


        modal.innerHTML = `

            <div class="sports-game-edit-box">

                <div class="sports-game-edit-header">

                    <h3>
                        ➕ Add New Cricket Game
                    </h3>

                    <button
                        type="button"
                        onclick="closeAddCricketGameModal()">
                        ✕
                    </button>

                </div>


                <div class="sports-game-edit-body">


                    <!-- GAME ID -->

                    <div class="sports-add-form-row">

                        <div class="sports-add-form-label">
                            Game ID
                        </div>

                        <div class="sports-add-form-control">

                            <input
                                type="text"
                                id="addCricketGameId"
                                readonly>

                        </div>

                    </div>


                    <!-- MATCH TITLE -->

                    <div class="sports-add-form-row">

                        <div class="sports-add-form-label">
                            Match Title
                        </div>

                        <div class="sports-add-form-control">

                            <input
                                type="text"
                                id="addCricketGameTitle"
                                placeholder="Pakistan vs India">

                        </div>

                    </div>


                    <!-- LEAGUE -->

                    <div class="sports-add-form-row">

                        <div class="sports-add-form-label">
                            League
                        </div>

                        <div class="sports-add-form-control">

                            <input
                                type="text"
                                id="addCricketGameLeague"
                                placeholder="T20 International">

                        </div>

                    </div>


                    <!-- STATUS -->

                    <div class="sports-add-form-row">

                        <div class="sports-add-form-label">
                            Status
                        </div>

                        <div class="sports-add-form-control">

                            <select
                                id="addCricketGameStatus">

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
                    <!-- MATCH STATUS -->

<div class="sports-add-form-row">

    <div class="sports-add-form-label">
        Match Status
    </div>

    <div class="sports-add-form-control">

        <select
            id="addCricketMatchStatus">

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


                    <!-- HOME TEAM -->

                    <div class="sports-add-form-row">

                        <div class="sports-add-form-label">
                            Home Team
                        </div>

                        <div class="sports-add-form-control">

                            <input
                                type="text"
                                id="addCricketGameHome"
                                placeholder="Pakistan">

                        </div>

                    </div>


                    <!-- AWAY TEAM -->

                    <div class="sports-add-form-row">

                        <div class="sports-add-form-label">
                            Away Team
                        </div>

                        <div class="sports-add-form-control">

                            <input
                                type="text"
                                id="addCricketGameAway"
                                placeholder="India">

                        </div>

                    </div>


                    <!-- BETTING MARKETS -->

                    <div class="sports-add-markets-row">

                        <div class="sports-add-markets-title">
                            Betting Markets
                        </div>


                        <div class="sports-add-market-items">

                            <label class="sports-market-toggle">

                                <input
                                    type="checkbox"
                                    id="addTotalRuns"
                                    checked>

                                <span>
                                    Total Runs
                                </span>

                            </label>


                            <label class="sports-market-toggle">

                                <input
                                    type="checkbox"
                                    id="addOverUnder"
                                    checked>

                                <span>
                                    Over / Under
                                </span>

                            </label>


                            <label class="sports-market-toggle">

                                <input
                                    type="checkbox"
                                    id="addMatchWinner"
                                    checked>

                                <span>
                                    Match Winner
                                </span>

                            </label>

                        </div>

                    </div>


                </div>


                <div class="sports-game-edit-footer">

                    <button
                        type="button"
                        onclick="closeAddCricketGameModal()">
                        Cancel
                    </button>

                    <button
                        type="button"
                        onclick="saveNewCricketGame()">
                        💾 Add Game
                    </button>

                </div>

            </div>

        `;


        // INSERT DIRECTLY UNDER ADD NEW GAME ROW

        const addGameRow =
            cricketSection.querySelector(
                ".sports-add-game-row"
            );


        if (addGameRow) {

            addGameRow.insertAdjacentElement(
                "afterend",
                modal
            );

        } else {

            cricketSection.prepend(
                modal
            );

        }

    }


    // ==================================================
    // FORM ELEMENTS
    // ==================================================

    const gameIdInput =
        document.getElementById(
            "addCricketGameId"
        );

    const titleInput =
        document.getElementById(
            "addCricketGameTitle"
        );

    const leagueInput =
        document.getElementById(
            "addCricketGameLeague"
        );

    const statusInput =
        document.getElementById(
            "addCricketGameStatus"
        );

    const homeInput =
        document.getElementById(
            "addCricketGameHome"
        );

    const awayInput =
        document.getElementById(
            "addCricketGameAway"
        );

    const totalRuns =
        document.getElementById(
            "addTotalRuns"
        );

    const overUnder =
        document.getElementById(
            "addOverUnder"
        );

    const matchWinner =
        document.getElementById(
            "addMatchWinner"
        );


    // ==================================================
    // RESET FORM
    // ==================================================

    if (gameIdInput) {

        gameIdInput.value =
            "cricket-" +
            Date.now();

    }

    if (titleInput) {
        titleInput.value = "";
    }

    if (leagueInput) {
        leagueInput.value = "";
    }

    if (statusInput) {
        statusInput.value = "live";
    }

    if (homeInput) {
        homeInput.value = "";
    }

    if (awayInput) {
        awayInput.value = "";
    }

    if (totalRuns) {
        totalRuns.checked = true;
    }

    if (overUnder) {
        overUnder.checked = true;
    }

    if (matchWinner) {
        matchWinner.checked = true;
    }


    // ==================================================
    // OPEN INLINE PANEL
    // ==================================================

    modal.style.display =
        "block";


    console.log(
        "✅ ADD GAME PANEL OPENED"
    );

};


// ======================================================
// CLOSE ADD NEW CRICKET GAME
// ======================================================

window.closeAddCricketGameModal =
function () {

    const modal =
        document.getElementById(
            "addCricketGameModal"
        );


    if (modal) {

        modal.style.display =
            "none";

    }


    console.log(
        "✅ ADD GAME PANEL CLOSED"
    );

};
// ======================================================
// SAVE NEW CRICKET GAME
// ======================================================

window.saveNewCricketGame = async function () {

    console.log(
        "💾 ADD NEW CRICKET GAME SAVE CLICKED"
    );


    // ==================================================
    // GET FORM VALUES
    // ==================================================

    const gameIdInput =
        document.getElementById(
            "addCricketGameId"
        );

    const titleInput =
        document.getElementById(
            "addCricketGameTitle"
        );

    const leagueInput =
        document.getElementById(
            "addCricketGameLeague"
        );

    const statusInput =
        document.getElementById(
            "addCricketGameStatus"
        );

    const homeInput =
        document.getElementById(
            "addCricketGameHome"
        );

    const awayInput =
        document.getElementById(
            "addCricketGameAway"
        );

    const totalRunsInput =
        document.getElementById(
            "addTotalRuns"
        );

    const overUnderInput =
        document.getElementById(
            "addOverUnder"
        );

    const matchWinnerInput =
        document.getElementById(
            "addMatchWinner"
        );
    const matchStatusInput =
    document.getElementById(
        "addCricketMatchStatus"
    );

const matchStatus =
    matchStatusInput && matchStatusInput.value
        ? matchStatusInput.value
            .trim()
            .toLowerCase()
        : "enable";


    // ==================================================
    // FORM DATA
    // ==================================================

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


    // ==================================================
    // SUPABASE CHECK
    // ==================================================

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
    // CREATE NEW GAME
    // ==================================================

    const newGame = {

        game_id:
            gameId,

        sport:
            "cricket",

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
        "➕ ADMIN: NEW CRICKET GAME:",
        newGame
    );


    // ==================================================
    // INSERT INTO SUPABASE
    // ==================================================

    const {
        data,
        error
    } = await window.supabaseClient
        .from("sports_games")
        .insert([
            newGame
        ])
        .select()
        .single();


    // ==================================================
    // HANDLE ERROR
    // ==================================================

    if (error) {

        console.error(
            "❌ ADMIN: Cricket game insert failed:",
            error
        );

        alert(
            "Failed to add game.\n\n" +
            error.message
        );

        return;
    }


    // ==================================================
    // SUCCESS
    // ==================================================

    console.log(
        "✅ ADMIN: NEW CRICKET GAME ADDED:",
        data
    );


    // ==================================================
    // UPDATE ADMIN CACHE
    // ==================================================

    window.adminSportsGames[
        data.game_id
    ] = data;


    // ==================================================
    // CLOSE ADD PANEL
    // ==================================================

    closeAddCricketGameModal();


    // ==================================================
    // RENDER ACCORDING TO STATUS
    // ==================================================

    renderAdminSportGames(
        "cricket",
        String(
            data.status || ""
        )
        .trim()
        .toLowerCase()
    );


    // ==================================================
    // SUCCESS MESSAGE
    // ==================================================

    alert(
        "✅ Cricket game added successfully!"
    );

};
    

// ======================================================
// FOOTBALL TABS
// ======================================================

window.openFootballLive = function (btn) {

    openAdminSportTab(
        "football",
        "football-content",
        "adminFootballLiveGrid",
        btn,
        "live"
    );
};


window.openFootballUpcoming = function (btn) {

    openAdminSportTab(
        "football",
        "football-content",
        "adminFootballUpcomingGrid",
        btn,
        "upcoming"
    );
};


window.openFootballFeatured = function (btn) {

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

window.openTennisLive = function (btn) {

    openAdminSportTab(
        "tennis",
        "tennis-content",
        "adminTennisLiveGrid",
        btn,
        "live"
    );
};


window.openTennisUpcoming = function (btn) {

    openAdminSportTab(
        "tennis",
        "tennis-content",
        "adminTennisUpcomingGrid",
        btn,
        "upcoming"
    );
};


window.openTennisFeatured = function (btn) {

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

window.openBasketballLive = function (btn) {

    openAdminSportTab(
        "basketball",
        "basketball-content",
        "adminBasketballLiveGrid",
        btn,
        "live"
    );
};


window.openBasketballUpcoming = function (btn) {

    openAdminSportTab(
        "basketball",
        "basketball-content",
        "adminBasketballUpcomingGrid",
        btn,
        "upcoming"
    );
};


window.openBasketballFeatured = function (btn) {

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

window.openVolleyballLive = function (btn) {

    openAdminSportTab(
        "volleyball",
        "volleyball-content",
        "adminVolleyballLiveGrid",
        btn,
        "live"
    );
};


window.openVolleyballUpcoming = function (btn) {

    openAdminSportTab(
        "volleyball",
        "volleyball-content",
        "adminVolleyballUpcomingGrid",
        btn,
        "upcoming"
    );
};


window.openVolleyballFeatured = function (btn) {

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

window.openBoxingLive = function (btn) {

    openAdminSportTab(
        "boxing",
        "boxing-content",
        "adminBoxingLiveGrid",
        btn,
        "live"
    );
};


window.openBoxingUpcoming = function (btn) {

    openAdminSportTab(
        "boxing",
        "boxing-content",
        "adminBoxingUpcomingGrid",
        btn,
        "upcoming"
    );
};


window.openBoxingFeatured = function (btn) {

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

window.openHockeyLive = function (btn) {

    openAdminSportTab(
        "hockey",
        "hockey-content",
        "adminHockeyLiveGrid",
        btn,
        "live"
    );
};


window.openHockeyUpcoming = function (btn) {

    openAdminSportTab(
        "hockey",
        "hockey-content",
        "adminHockeyUpcomingGrid",
        btn,
        "upcoming"
    );
};


window.openHockeyFeatured = function (btn) {

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

window.openRugbyLive = function (btn) {

    openAdminSportTab(
        "rugby",
        "rugby-content",
        "adminRugbyLiveGrid",
        btn,
        "live"
    );
};


window.openRugbyUpcoming = function (btn) {

    openAdminSportTab(
        "rugby",
        "rugby-content",
        "adminRugbyUpcomingGrid",
        btn,
        "upcoming"
    );
};


window.openRugbyFeatured = function (btn) {

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

window.openGolfLive = function (btn) {

    openAdminSportTab(
        "golf",
        "golf-content",
        "adminGolfLiveGrid",
        btn,
        "live"
    );
};


window.openGolfUpcoming = function (btn) {

    openAdminSportTab(
        "golf",
        "golf-content",
        "adminGolfUpcomingGrid",
        btn,
        "upcoming"
    );
};


window.openGolfFeatured = function (btn) {

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

window.adminSportsGames = {};

window.adminSportsGamesLoaded = false;


window.loadAdminSportsGames = async function () {

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
    } = await window.supabaseClient
        .from("sports_games")
        .select("*")
        .order("game_id", {
            ascending: true
        });

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

        window.adminSportsGamesLoaded = false;

        return false;
    }

    window.adminSportsGames = {};

    if (!data || data.length === 0) {

        console.warn(
            "⚠️ ADMIN: No sports games found."
        );

        window.adminSportsGamesLoaded = true;

        return true;
    }

data.forEach(game => {

    if (!game.game_id) return;

    window.adminSportsGames[
        game.game_id
    ] = game;

});
    console.log(
    "🔍 FULL CRICKET GAME FROM SUPABASE:",
    window.adminSportsGames["cricket-live-1"]
);

console.log(
    "🔍 CRICKET STATUS RAW:",
    JSON.stringify(
        window.adminSportsGames["cricket-live-1"]?.status
    )
);


console.log(
    "🏏 ADMIN GAME CHECK:",
    window.adminSportsGames["cricket-live-1"]?.sport,
    window.adminSportsGames["cricket-live-1"]?.status
);


window.adminSportsGamesLoaded = true;

console.log(
    "🗂️ ADMIN SPORTS CACHE:",
    window.adminSportsGames
);

    // ------------------------------------------
    // INITIAL CRICKET LIVE RENDER
    // ------------------------------------------

    renderAdminSportGames(
        "cricket",
        "live"
    );

    return true;
};


// ======================================================
// ENSURE SPORTS DATA IS LOADED
// ======================================================

async function ensureAdminSportsGamesLoaded() {

    if (
        window.adminSportsGamesLoaded &&
        Object.keys(
            window.adminSportsGames || {}
        ).length > 0
    ) {

        return true;
    }

    return await loadAdminSportsGames();
}


// ======================================================
// GENERIC SPORTS GAME RENDERER
// ======================================================

function renderAdminSportGames(
    sport,
    status
) {

    const sportName =
        String(sport || "")
            .trim()
            .toLowerCase();

    const statusName =
        String(status || "")
            .trim()
            .toLowerCase();


    const gridMap = {

        cricket: {
            live: "adminCricketLiveGrid",
            upcoming: "adminCricketUpcomingGrid",
            featured: "adminCricketFeaturedGrid"
        },

        football: {
            live: "adminFootballLiveGrid",
            upcoming: "adminFootballUpcomingGrid",
            featured: "adminFootballFeaturedGrid"
        },

        tennis: {
            live: "adminTennisLiveGrid",
            upcoming: "adminTennisUpcomingGrid",
            featured: "adminTennisFeaturedGrid"
        },

        basketball: {
            live: "adminBasketballLiveGrid",
            upcoming: "adminBasketballUpcomingGrid",
            featured: "adminBasketballFeaturedGrid"
        },

        volleyball: {
            live: "adminVolleyballLiveGrid",
            upcoming: "adminVolleyballUpcomingGrid",
            featured: "adminVolleyballFeaturedGrid"
        },

        boxing: {
            live: "adminBoxingLiveGrid",
            upcoming: "adminBoxingUpcomingGrid",
            featured: "adminBoxingFeaturedGrid"
        },

        hockey: {
            live: "adminHockeyLiveGrid",
            upcoming: "adminHockeyUpcomingGrid",
            featured: "adminHockeyFeaturedGrid"
        },

        rugby: {
            live: "adminRugbyLiveGrid",
            upcoming: "adminRugbyUpcomingGrid",
            featured: "adminRugbyFeaturedGrid"
        },

        golf: {
            live: "adminGolfLiveGrid",
            upcoming: "adminGolfUpcomingGrid",
            featured: "adminGolfFeaturedGrid"
        }

    };


    const gridId =
        gridMap[sportName]?.[statusName];


    if (!gridId) {

        console.warn(
            "⚠️ ADMIN: Grid not found for:",
            sportName,
            statusName
        );

        return;
    }


    const grid =
        document.getElementById(gridId);


    if (!grid) {

        console.warn(
            "⚠️ ADMIN: Grid element not found:",
            gridId
        );

        return;
    }


    // ------------------------------------------
    // GET MATCHES FROM ADMIN CACHE
    // ------------------------------------------

    const allGames =
        Object.values(
            window.adminSportsGames || {}
        );


    console.log(
        "📦 ADMIN: ALL CACHED SPORTS GAMES:",
        allGames
    );


    // ------------------------------------------
    // FILTER MATCHES
    // ------------------------------------------

    const games =
        allGames
            .filter(game => {

                const gameSport =
                    String(game.sport || "")
                        .trim()
                        .toLowerCase();

                const gameStatus =
                    String(game.status || "")
                        .trim()
                        .toLowerCase();


                console.log(
                    "🔎 ADMIN MATCH CHECK:",
                    game.game_id,
                    "SPORT:",
                    gameSport,
                    "STATUS:",
                    gameStatus,
                    "TARGET:",
                    sportName,
                    statusName
                );


                return (
                    gameSport === sportName &&
                    gameStatus === statusName
                );

            })
            .sort((a, b) => {

                return String(a.game_id || "")
                    .localeCompare(
                        String(b.game_id || ""),
                        undefined,
                        {
                            numeric: true,
                            sensitivity: "base"
                        }
                    );

            });


    console.log(
        `🎮 ADMIN: ${sportName} / ${statusName}:`,
        games
    );


    // ------------------------------------------
    // NO GAMES
    // ------------------------------------------

    if (games.length === 0) {

        grid.innerHTML = `
            <p class="no-sports-games">
                No ${sportName} ${statusName} games available.
            </p>
        `;

        return;
    }


    // ------------------------------------------
    // RENDER GAME CARDS
    // ------------------------------------------

    grid.innerHTML =
        games
            .map(game =>
                createAdminSportsCard(game)
            )
            .join("");
}


// ======================================================
// CRICKET STATUS RENDER
// ======================================================

function renderAdminCricketGamesByStatus(status) {

    const statusName =
        String(status || "")
            .trim()
            .toLowerCase();


    console.log(
        "🏏 ADMIN: Rendering Cricket status:",
        statusName
    );


    return renderAdminSportGames(
        "cricket",
        statusName
    );
}


// ======================================================
// KEEP EXISTING CRICKET RENDER FUNCTION
// ======================================================

function renderAdminCricketGames(games) {

    const sourceGames =
        Array.isArray(games)
            ? games
            : Object.values(
                window.adminSportsGames || {}
            );


    const cricketGames =
        sourceGames.filter(game => {

            return String(game.sport || "")
                .trim()
                .toLowerCase() === "cricket";

        });


    const statusGroups = {

        live: [],
        upcoming: [],
        featured: []

    };


    cricketGames.forEach(game => {

        const status =
            String(game.status || "")
                .trim()
                .toLowerCase();


        if (statusGroups[status]) {

            statusGroups[status].push(game);

        }

    });


    const grids = {

        live:
            document.getElementById(
                "adminCricketLiveGrid"
            ),

        upcoming:
            document.getElementById(
                "adminCricketUpcomingGrid"
            ),

        featured:
            document.getElementById(
                "adminCricketFeaturedGrid"
            )

    };


    Object.keys(grids).forEach(status => {

        const grid =
            grids[status];


        if (!grid) return;


        const gamesForStatus =
            statusGroups[status];


        if (gamesForStatus.length === 0) {

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
                .map(game =>
                    createAdminSportsCard(game)
                )
                .join("");

    });

}


// ======================================================
// CREATE ADMIN SPORTS CARD
// ======================================================

function createAdminSportsCard(game) {

    const totalRuns =
        game.total_runs_enabled !== false;

    const overUnder =
        game.over_under_enabled !== false;

    const matchWinner =
        game.match_winner_enabled !== false;

    return `
        <div
            class="match-card"
            data-game-id="${escapeAdminSportsHTML(game.game_id)}"
        >

            <div class="admin-game-id">
                ID:
                ${escapeAdminSportsHTML(game.game_id)}
            </div>

            <h5>
                ${escapeAdminSportsHTML(
                    game.league || ""
                )}
            </h5>

            <p class="admin-match-title">

                ${escapeAdminSportsHTML(
                    game.home_team || ""
                )}

                <strong>VS</strong>

                ${escapeAdminSportsHTML(
                    game.away_team || ""
                )}

            </p>

            <p>
                Status:
                <strong class="admin-game-status">
                    ${escapeAdminSportsHTML(
                        game.status || ""
                    )}
                </strong>
            </p>

            <div class="market-list">

                <div>
                    Total Runs

                    <button
                        type="button"
                        class="${
                            totalRuns
                                ? "market-on"
                                : "market-off"
                        }"
                        onclick="toggleAdminMarket(
                            '${escapeAdminSportsJS(game.game_id)}',
                            'total_runs_enabled'
                        )"
                    >
                        ${totalRuns ? "ON" : "OFF"}
                    </button>
                </div>

                <div>
                    Over / Under

                    <button
                        type="button"
                        class="${
                            overUnder
                                ? "market-on"
                                : "market-off"
                        }"
                        onclick="toggleAdminMarket(
                            '${escapeAdminSportsJS(game.game_id)}',
                            'over_under_enabled'
                        )"
                    >
                        ${overUnder ? "ON" : "OFF"}
                    </button>
                </div>

                <div>
                    Match Winner

                    <button
                        type="button"
                        class="${
                            matchWinner
                                ? "market-on"
                                : "market-off"
                        }"
                        onclick="toggleAdminMarket(
                            '${escapeAdminSportsJS(game.game_id)}',
                            'match_winner_enabled'
                        )"
                    >
                        ${matchWinner ? "ON" : "OFF"}
                    </button>
                </div>

            </div>

            <button
                type="button"
                class="admin-edit-match-btn"
                onclick="openSportsGameEditor(
                    '${escapeAdminSportsJS(game.game_id)}'
                )"
            >
                ✏️ Edit Match
            </button>

        </div>
    `;
}


// ======================================================
// BACKWARD COMPATIBILITY
// ======================================================

function createAdminCricketCard(game) {

    return createAdminSportsCard(game);

}


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
        !allowedFields.includes(field)
    ) {

        console.error(
            "❌ ADMIN: Invalid market field:",
            field
        );

        return;
    }

    const newValue =
        game[field] === false;

    console.log(
        "🔄 ADMIN: Toggle market:",
        gameId,
        field,
        newValue
    );

    const {
        data,
        error
    } = await supabaseClient
        .from("sports_games")
        .update({
            [field]: newValue
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

    const sport =
        String(data.sport || "")
            .toLowerCase();

    const status =
        String(data.status || "")
            .toLowerCase();

    renderAdminSportGames(
        sport,
        status
    );

};


// ======================================================
// OPEN SPORTS GAME EDITOR
// ======================================================

window.openSportsGameEditor = function (gameId) {

    console.log("✏️ ADMIN: Opening editor:", gameId);

    const game = window.adminSportsGames[gameId];

    if (!game) {
        console.error("❌ ADMIN: Game not found:", gameId);
        alert("Sports game not found.");
        return;
    }

    const gameIdInput =
        document.getElementById("editSportsGameId");

    const titleInput =
        document.getElementById("editSportsGameTitle");

    const leagueInput =
    document.getElementById("editSportsGameLeague");

const statusInput =
    document.getElementById("editSportsGameStatus");

const matchStatusInput =
    document.getElementById("editSportsGameMatchStatus");

    const homeInput =
        document.getElementById("editSportsGameHome");

    const awayInput =
        document.getElementById("editSportsGameAway");

    const totalRunsInput =
        document.getElementById("editTotalRuns");

    const overUnderInput =
        document.getElementById("editOverUnder");

    const matchWinnerInput =
        document.getElementById("editMatchWinner");


    // ==================================================
    // FILL BASIC GAME INFORMATION
    // ==================================================

    if (gameIdInput) {
        gameIdInput.value = game.game_id || "";
    }

    if (titleInput) {
        titleInput.value = game.title || "";
    }

    if (leagueInput) {
        leagueInput.value = game.league || "";
    }

    if (homeInput) {
        homeInput.value = game.home_team || "";
    }

    if (awayInput) {
        awayInput.value = game.away_team || "";
    }


    // ==================================================
    // STATUS
    // IMPORTANT:
    // SELECT VALUES ARE LOWERCASE
    // live / upcoming / featured
    // ==================================================

    if (statusInput) {

        const status =
            String(game.status || "live")
                .trim()
                .toLowerCase();

        statusInput.value = status;

        console.log(
            "📌 ADMIN: Editor status:",
            status
        );
    }

    // ==================================================
// MATCH STATUS
// IMPORTANT:
// SELECT VALUES ARE LOWERCASE
// enable / disable / reject
// ==================================================

if (matchStatusInput) {

    const matchStatus =
        String(game.match_status || "enable")
            .trim()
            .toLowerCase();

    matchStatusInput.value = matchStatus;

    console.log(
        "📌 ADMIN: Editor match status:",
        matchStatus
    );
}


    // ==================================================
    // MARKET SETTINGS
    // ==================================================

    if (totalRunsInput) {
        totalRunsInput.checked =
            game.total_runs_enabled !== false;
    }

    if (overUnderInput) {
        overUnderInput.checked =
            game.over_under_enabled !== false;
    }

    if (matchWinnerInput) {
        matchWinnerInput.checked =
            game.match_winner_enabled !== false;
    }


    // ==================================================
    // ACTIVE GAME ID
    // ==================================================

    window.activeSportsGameId = gameId;


    // ==================================================
    // OPEN MODAL
    // ==================================================

    const modal =
        document.getElementById("sportsGameEditModal");

    if (modal) {

        modal.style.display = "flex";

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

};
// ======================================================
// SAVE SPORTS GAME
// ======================================================

window.saveSportsGameChanges = async function () {

    const gameIdInput =
        document.getElementById("editSportsGameId");

    const gameId =
        gameIdInput
            ? gameIdInput.value.trim()
            : "";


    // ==================================================
    // CHECK GAME ID
    // ==================================================

    if (!gameId) {

        alert("Game ID is missing.");

        return;
    }


    // ==================================================
    // GET INPUTS
    // ==================================================

    const titleInput =
        document.getElementById("editSportsGameTitle");

    const leagueInput =
        document.getElementById("editSportsGameLeague");

    const statusInput =
        document.getElementById("editSportsGameStatus");
    
    const matchStatusInput =
    document.getElementById("editSportsGameMatchStatus");

    const homeInput =
        document.getElementById("editSportsGameHome");

    const awayInput =
        document.getElementById("editSportsGameAway");

    const totalRunsInput =
        document.getElementById("editTotalRuns");

    const overUnderInput =
        document.getElementById("editOverUnder");

    const matchWinnerInput =
        document.getElementById("editMatchWinner");


// ==================================================
// GET STATUS
// ==================================================

const selectedStatus =
    statusInput
        ? String(statusInput.value || "")
            .trim()
            .toLowerCase()
        : "";


// ==================================================
// GET MATCH STATUS
// ==================================================

const selectedMatchStatus =
    matchStatusInput
        ? String(matchStatusInput.value || "")
            .trim()
            .toLowerCase()
        : "enable";


// ==================================================
// VALID STATUS
// ==================================================

const allowedStatuses = [
    "live",
    "upcoming",
    "featured"
];

if (!allowedStatuses.includes(selectedStatus)) {

    alert(
        "Please select a valid game status."
    );

    return;
}


// ==================================================
// VALID MATCH STATUS
// ==================================================

const allowedMatchStatuses = [
    "enable",
    "disable",
    "reject"
];

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


// ==================================================
// BUILD UPDATED GAME
// ==================================================

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


    // ==================================================
    // VALIDATE GAME INFORMATION
    // ==================================================

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


    // ==================================================
    // SUPABASE CHECK
    // ==================================================

    if (typeof supabaseClient === "undefined") {

        console.error(
            "❌ ADMIN: Supabase client unavailable."
        );

        alert(
            "Supabase connection unavailable."
        );

        return;
    }


    // ==================================================
    // SAVE TO SUPABASE
    // ==================================================

    console.log(
        "💾 ADMIN: Updating game:",
        gameId,
        updatedGame
    );


    const {
        data,
        error
    } = await supabaseClient
        .from("sports_games")
        .update(updatedGame)
        .eq("game_id", gameId)
        .select()
        .single();


    // ==================================================
    // HANDLE ERROR
    // ==================================================

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


    // ==================================================
    // VERIFY SAVED STATUS
    // ==================================================

    console.log(
        "💾 SAVE RESULT - STATUS:",
        JSON.stringify(data?.status)
    );
    
    console.log(
    "💾 SAVE RESULT - MATCH STATUS:",
    JSON.stringify(data?.match_status)
);

    console.log(
        "💾 SAVE RESULT - FULL DATA:",
        data
    );


    // ==================================================
    // UPDATE LOCAL CACHE
    // ==================================================

    console.log(
        "✅ ADMIN: Sports game updated:",
        data
    );

    window.adminSportsGames[gameId] = data;


    // ==================================================
    // CLOSE EDITOR
    // ==================================================

    if (
        typeof closeSportsGameEditor === "function"
    ) {

        closeSportsGameEditor();

    }


    // ==================================================
    // RENDER UPDATED GAME
    // ==================================================

    const sport =
        String(data.sport || "")
            .trim()
            .toLowerCase();

    const status =
        String(data.status || "")
            .trim()
            .toLowerCase();


    renderAdminSportGames(
        sport,
        status
    );


    // ==================================================
    // SUCCESS
    // ==================================================

    alert(
        "✅ Match updated successfully!"
    );
};

// ======================================================
// HTML ESCAPE
// ======================================================

function escapeAdminSportsHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


function escapeAdminSportsJS(value) {

    return String(value ?? "")
        .replace(/\\/g, "\\\\")
        .replace(/'/g, "\\'")
        .replace(/"/g, '\\"')
        .replace(/\n/g, "\\n")
        .replace(/\r/g, "\\r");

}


// ======================================================
// OPTIONAL AUTO LOAD
// ======================================================

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        function () {

            loadAdminSportsGames();

        }
    );

} else {

    loadAdminSportsGames();

}


// ======================================================
// GAME NAME MAP
// ======================================================

function getGameName(id) {

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
            .substring(2, 12)
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

    autoDeposit: true,

    manualDeposit: false,

    autoWithdraw: false,

    manualWithdraw: true

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

function getRequest(id) {

    return window.withdrawRequests.find(
        request =>
            request.id === id
    );

}


// ======================================================
// APPROVE WITHDRAW
// ======================================================

function approveWithdraw(
    id
) {

    const req =
        getRequest(id);


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
        getRequest(id);


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
        getRequest(id);


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


    window.withdrawRequests.forEach(
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


    window.withdrawRequests.forEach(
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


    window.withdrawRequests.forEach(
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
            .split("T")[0];


    if (
        !Array.isArray(
            window.withdrawHistory
        )
    ) {

        window.withdrawHistory =
            [];

    }


    window.withdrawHistory.forEach(
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


    (players || []).forEach(
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
        loss - win;


    if (
        netRevenue <= 0
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


    window.referralPlayers.forEach(
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
    24 * 60 * 60 * 1000
);


// ======================================================
// WEEKLY AUTO TRIGGER
// ======================================================

setInterval(
    () => {

        runWeeklyCheck();

    },
    7 * 24 * 60 * 60 * 1000
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


    window.referralPlayers.forEach(
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


    window.affiliatePayoutRequests.forEach(
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
        window.affiliatePayoutRequests.find(
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
        window.affiliatePayoutRequests.find(
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
        window.affiliatePayoutRequests.find(
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


    window.affiliatePayoutHistory.forEach(
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
