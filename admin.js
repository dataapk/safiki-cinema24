// ======================================================
// SAFIKI ADMIN PANEL ENGINE
// ======================================================


// ======================================================
// GLOBAL ADMIN SPORTS CACHE
// =====================================================

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
// DASHBOARD ENGINE START
// ======================================================

// ------------------------------------------------------
// DASHBOARD DEFAULT STATE
// ------------------------------------------------------

const dashboardState = {

    totalUsers: 0,

    totalDeposit: null,

    totalWithdraw: null,

    pendingWithdraw: null,

    todayNewAccounts: 0,

    activeUsers: 0,

    suspendedUsers: 0,

    onlineUsers: null,

    totalGames: 0,

    systemStatus: "Online",

    todayDeposit: null,

    todayWithdraw: null,

    todayProfit: null,

    todayPendingDeposit: null,

    todayPendingWithdraw: null

};



(async function () {

    try {

        // =========================================
        // CHECK SUPABASE SESSION
        // =========================================

        const {
            data: sessionData,
            error: sessionError
        } =
            await window.supabaseClient
                .auth
                .getSession();


        if (
            sessionError ||
            !sessionData ||
            !sessionData.session
        ) {

            window.location.replace(
                "admin-login.html"
            );

            return;

        }


        // =========================================
        // CURRENT AUTH USER
        // =========================================

        const authUser =
            sessionData.session.user;


        if (!authUser) {

            window.location.replace(
                "admin-login.html"
            );

            return;

        }


        // =========================================
        // CHECK ADMIN AUTHORIZATION
        // =========================================

        const {
            data: adminRecord,
            error: adminError
        } =
            await window.supabaseClient
                .from("admin_users")
                .select("auth_user_id")
                .eq(
                    "auth_user_id",
                    authUser.id
                )
                .maybeSingle();


if (adminError) {

    console.error(
        "❌ Admin DB check failed:",
        adminError
    );

    return;

}

if (!adminRecord) {

    console.error(
        "❌ Admin record not found for:",
        authUser.id
    );

    return;

}


        // =========================================
        // ADMIN VERIFIED
        // =========================================

        console.log(
            "✅ Admin access verified."
        );


    } catch (error) {

        console.error(
            "Admin access verification failed:",
            error
        );

        window.location.replace(
            "admin-login.html"
        );

    }

})();



// ------------------------------------------------------
// DASHBOARD VALUE HELPER
// ------------------------------------------------------

function setDashboardValue(
    elementId,
    value,
    fallback = "—"
) {

    const element =
        document.getElementById(
            elementId
        );


    if (!element) return;


    element.textContent =
        value !== null &&
        value !== undefined &&
        value !== ""
            ? value
            : fallback;

}


// ------------------------------------------------------
// LOAD DASHBOARD USER DATA
// ------------------------------------------------------

async function loadDashboardUserData() {

    try {

        const { data, error } =
            await supabaseClient
                .from("user_data")
                .select(
                    "user_id, status, created_at"
                );


        if (error) {

            console.error(
                "Dashboard user data error:",
                error
            );

            return;

        }


        const users =
            Array.isArray(data)
                ? data
                : [];


        dashboardState.totalUsers =
            users.length;


        dashboardState.activeUsers =
            users.filter(
                user =>
                    String(user.status)
                        .toLowerCase()
                    === "active"
            ).length;


        dashboardState.suspendedUsers =
            users.filter(
                user =>
                    String(user.status)
                        .toLowerCase()
                    === "suspended"
            ).length;


        // ----------------------------------------------
        // TODAY'S NEW ACCOUNTS
        // ----------------------------------------------

        const now =
            new Date();


        const todayStart =
            new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate()
            );


        dashboardState.todayNewAccounts =
            users.filter(
                user => {

                    if (!user.created_at) {
                        return false;
                    }


                    const createdAt =
                        new Date(
                            user.created_at
                        );


                    return createdAt >=
                        todayStart;

                }
            ).length;


    } catch (error) {

        console.error(
            "Dashboard loading failed:",
            error
        );

    }

}


// ------------------------------------------------------
// LOAD DASHBOARD GAME DATA
// ------------------------------------------------------

async function loadDashboardGameData() {

    try {

        const { data, error } =
            await supabaseClient
                .from("sports_games")
                .select("game_id");


        if (error) {

            console.error(
                "Dashboard game data error:",
                error
            );

            return;

        }


        dashboardState.totalGames =
            Array.isArray(data)
                ? data.length
                : 0;


    } catch (error) {

        console.error(
            "Dashboard game loading failed:",
            error
        );

    }

}


// ------------------------------------------------------
// RENDER DASHBOARD
// ------------------------------------------------------

function renderDashboard() {

    setDashboardValue(
        "dashboardTotalUsers",
        dashboardState.totalUsers
    );


    setDashboardValue(
        "dashboardTotalDeposit",
        dashboardState.totalDeposit !== null
            ? dashboardState.totalDeposit
            : null
    );


    setDashboardValue(
        "dashboardTotalWithdraw",
        dashboardState.totalWithdraw !== null
            ? dashboardState.totalWithdraw
            : null
    );


    setDashboardValue(
        "dashboardPendingWithdraw",
        dashboardState.pendingWithdraw !== null
            ? dashboardState.pendingWithdraw
            : null
    );


    setDashboardValue(
        "dashboardTodayNewAccounts",
        dashboardState.todayNewAccounts
    );


    setDashboardValue(
        "dashboardActiveUsers",
        dashboardState.activeUsers
    );


    setDashboardValue(
        "dashboardSuspendedUsers",
        dashboardState.suspendedUsers
    );


    setDashboardValue(
        "dashboardOnlineUsers",
        dashboardState.onlineUsers
    );


    setDashboardValue(
        "dashboardTotalGames",
        dashboardState.totalGames
    );


    setDashboardValue(
        "dashboardSystemStatus",
        dashboardState.systemStatus
    );


    setDashboardValue(
        "dashboardTodayDeposit",
        dashboardState.todayDeposit !== null
            ? dashboardState.todayDeposit
            : null
    );


    setDashboardValue(
        "dashboardTodayWithdraw",
        dashboardState.todayWithdraw !== null
            ? dashboardState.todayWithdraw
            : null
    );


    setDashboardValue(
        "dashboardTodayProfit",
        dashboardState.todayProfit !== null
            ? dashboardState.todayProfit
            : null
    );


    setDashboardValue(
        "dashboardTodayPendingDeposit",
        dashboardState.todayPendingDeposit !== null
            ? dashboardState.todayPendingDeposit
            : null
    );


    setDashboardValue(
        "dashboardTodayPendingWithdraw",
        dashboardState.todayPendingWithdraw !== null
            ? dashboardState.todayPendingWithdraw
            : null
    );

}


// ------------------------------------------------------
// MAIN DASHBOARD LOADER
// ------------------------------------------------------

async function loadDashboard() {

    await Promise.all([
        loadDashboardUserData(),
        loadDashboardGameData()
    ]);


    renderDashboard();

}


// ======================================================
// DASHBOARD ENGINE END
// ======================================================


// ======================================================
// USER DATA ENGINE START
// ======================================================


// ------------------------------------------------------
// USER DATA STATE
// ------------------------------------------------------

let currentSelectedUser =
    null;


// ------------------------------------------------------
// USER DATA DEFAULT VALUE
// ------------------------------------------------------

function getUserDataValue(
    value,
    fallback = "—"
) {

    return value !== null &&
        value !== undefined &&
        value !== ""
        ? value
        : fallback;

}


// ------------------------------------------------------
// FORMAT DATE
// ------------------------------------------------------

function formatUserDate(
    value
) {

    if (!value) {
        return "—";
    }

    const date =
        new Date(value);

    if (Number.isNaN(
        date.getTime()
    )) {
        return "—";
    }

    return date.toLocaleDateString(
        "en-GB",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


// ------------------------------------------------------
// LOAD USER DATA
// ------------------------------------------------------

async function loadUserData(
    searchUserId = ""
) {

    const userListBody =
        document.getElementById(
            "userListBody"
        );

    if (!userListBody) {
        return;
    }


    userListBody.innerHTML =
        `<tr>
            <td colspan="8">
                Loading users...
            </td>
        </tr>`;


    try {

        let query =
            supabaseClient
                .from("user_data")
                .select(
                    "user_id, email, full_name, country, address, account_level, status, created_at, last_login_at"
                )
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                );


        // ----------------------------------------------
        // SEARCH BY USER ID
        // ----------------------------------------------

        if (searchUserId) {

            query =
                query.eq(
                    "user_id",
                    searchUserId
                );

        }


        const {
            data,
            error
        } = await query;


        if (error) {

            console.error(
                "User data loading error:",
                error
            );

            userListBody.innerHTML =
                `<tr>
                    <td colspan="8">
                        Failed to load user data.
                    </td>
                </tr>`;

            return;

        }


        const users =
            Array.isArray(data)
                ? data
                : [];


        if (!users.length) {

            userListBody.innerHTML =
                `<tr>
                    <td colspan="8">
                        No user found.
                    </td>
                </tr>`;

            return;

        }


        // ----------------------------------------------
        // RENDER USERS
        // ----------------------------------------------

        userListBody.innerHTML =
            "";


        users.forEach(
            user => {

                const row =
                    document.createElement(
                        "tr"
                    );


                // --------------------------------------
                // USER ID
                // --------------------------------------

                const idCell =
                    document.createElement(
                        "td"
                    );

                idCell.textContent =
                    getUserDataValue(
                        user.user_id
                    );


                // --------------------------------------
                // USERNAME
                // --------------------------------------

                const usernameCell =
                    document.createElement(
                        "td"
                    );

                usernameCell.textContent =
                    "—";


                // --------------------------------------
                // BALANCE
                // --------------------------------------

                const balanceCell =
                    document.createElement(
                        "td"
                    );

                balanceCell.textContent =
                    "—";


                // --------------------------------------
                // TOTAL DEPOSIT
                // --------------------------------------

                const depositCell =
                    document.createElement(
                        "td"
                    );

                depositCell.textContent =
                    "—";


                // --------------------------------------
                // TOTAL WITHDRAW
                // --------------------------------------

                const withdrawCell =
                    document.createElement(
                        "td"
                    );

                withdrawCell.textContent =
                    "—";


                // --------------------------------------
                // PENDING WITHDRAW
                // --------------------------------------

                const pendingWithdrawCell =
                    document.createElement(
                        "td"
                    );

                pendingWithdrawCell.textContent =
                    "—";


                // --------------------------------------
                // STATUS
                // --------------------------------------

                const statusCell =
                    document.createElement(
                        "td"
                    );

                statusCell.textContent =
                    getUserDataValue(
                        user.status
                    );


                // --------------------------------------
                // ACTION
                // --------------------------------------

                const actionCell =
                    document.createElement(
                        "td"
                    );


                const detailsButton =
                    document.createElement(
                        "button"
                    );

                detailsButton.className =
                    "view-user";

                detailsButton.textContent =
                    "Details";


                detailsButton.addEventListener(
                    "click",
                    function () {

                        selectUser(
                            user
                        );

                        toggleActionButtons();

                    }
                );


                actionCell.appendChild(
                    detailsButton
                );


                // --------------------------------------
                // ADD ROW CELLS
                // --------------------------------------

                row.appendChild(
                    idCell
                );

                row.appendChild(
                    usernameCell
                );

                row.appendChild(
                    balanceCell
                );

                row.appendChild(
                    depositCell
                );

                row.appendChild(
                    withdrawCell
                );

                row.appendChild(
                    pendingWithdrawCell
                );

                row.appendChild(
                    statusCell
                );

                row.appendChild(
                    actionCell
                );


                userListBody.appendChild(
                    row
                );

            }
        );


    } catch (error) {

        console.error(
            "User data loading failed:",
            error
        );

        userListBody.innerHTML =
            `<tr>
                <td colspan="8">
                    Failed to load user data.
                </td>
            </tr>`;

    }

}


// ------------------------------------------------------
// SELECT USER
// ------------------------------------------------------

function selectUser(
    user
) {

    currentSelectedUser =
        user;


    console.log(
        "Selected user:",
        user.user_id
    );


    loadPersonalInformation(
        user
    );


    // ----------------------------------------------
    // Prepare history panels
    // ----------------------------------------------

    resetDepositHistory();

    resetWithdrawHistory();

}


// ------------------------------------------------------
// LOAD PERSONAL INFORMATION
// ------------------------------------------------------

function loadPersonalInformation(
    user
) {

    if (!user) {
        return;
    }


    const fullName =
        document.getElementById(
            "profileFullName"
        );

    const email =
        document.getElementById(
            "profileEmail"
        );

    const country =
        document.getElementById(
            "profileCountry"
        );

    const address =
        document.getElementById(
            "profileAddress"
        );

    const accountLevel =
        document.getElementById(
            "profileAccountLevel"
        );

    const registrationDate =
        document.getElementById(
            "profileRegistrationDate"
        );

    const lastLogin =
        document.getElementById(
            "profileLastLogin"
        );


    if (fullName) {

        fullName.textContent =
            getUserDataValue(
                user.full_name
            );

    }


    if (email) {

        email.textContent =
            getUserDataValue(
                user.email
            );

    }


    if (country) {

        country.textContent =
            getUserDataValue(
                user.country
            );

    }


    if (address) {

        address.textContent =
            getUserDataValue(
                user.address
            );

    }


    if (accountLevel) {

        accountLevel.textContent =
            getUserDataValue(
                user.account_level
            );

    }


    if (registrationDate) {

        registrationDate.textContent =
            formatUserDate(
                user.created_at
            );

    }


    if (lastLogin) {

        lastLogin.textContent =
            formatUserDate(
                user.last_login_at
            );

    }

}


// ------------------------------------------------------
// RESET DEPOSIT HISTORY
// ------------------------------------------------------

function resetDepositHistory() {

    const totalDeposit =
        document.getElementById(
            "totalDeposit"
        );

    const todayDeposit =
        document.getElementById(
            "todayDeposit"
        );

    const depositHistoryList =
        document.getElementById(
            "depositHistoryList"
        );


    if (totalDeposit) {

        totalDeposit.textContent =
            "—";

    }


    if (todayDeposit) {

        todayDeposit.textContent =
            "—";

    }


    if (depositHistoryList) {

        depositHistoryList.innerHTML =
            "";

    }

}


// ------------------------------------------------------
// RESET WITHDRAW HISTORY
// ------------------------------------------------------

function resetWithdrawHistory() {

    const totalWithdraw =
        document.getElementById(
            "totalWithdraw"
        );

    const todayWithdraw =
        document.getElementById(
            "todayWithdraw"
        );

    const withdrawHistoryList =
        document.getElementById(
            "withdrawHistoryList"
        );


    if (totalWithdraw) {

        totalWithdraw.textContent =
            "—";

    }


    if (todayWithdraw) {

        todayWithdraw.textContent =
            "—";

    }


    if (withdrawHistoryList) {

        withdrawHistoryList.innerHTML =
            "";

    }

}


// ------------------------------------------------------
// USER SEARCH
// ------------------------------------------------------

function searchUserData() {

    const searchInput =
        document.getElementById(
            "userSearchInput"
        );

    if (!searchInput) {
        return;
    }


    const userId =
        searchInput.value
            .trim();


    loadUserData(
        userId
    );

}


// ------------------------------------------------------
// USER SEARCH BUTTON
// ------------------------------------------------------

function initUserSearch() {

    const searchButton =
        document.getElementById(
            "userSearchBtn"
        );

    const searchInput =
        document.getElementById(
            "userSearchInput"
        );


    if (searchButton) {

        searchButton.addEventListener(
            "click",
            function () {

                searchUserData();

            }
        );

    }


    if (searchInput) {

        searchInput.addEventListener(
            "keydown",
            function (event) {

                if (
                    event.key === "Enter"
                ) {

                    searchUserData();

                }

            }
        );

    }

}


// ------------------------------------------------------
// USER DATA INITIALIZATION
// ------------------------------------------------------

function initUserData() {

    initUserSearch();

    loadUserData();

}


// ======================================================
// USER DATA ENGINE END
// ======================================================



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
        // DASHBOARD
        // ==================================================

             loadDashboard();

        // ==================================================
       // USER DATA
       // ==================================================

             initUserData();


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


            // ------------------------------------------
            // HIDE VIRTUAL SPORTS
            // ------------------------------------------

            const virtualSports =
                document.getElementById(
                    "virtualSportsSection"
                );


            if (virtualSports) {

                virtualSports.style.display =
                    "none";

            }


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

    const virtualSports =
    document.getElementById(
        "virtualSportsSection"
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

    if (virtualSports) {

    virtualSports.style.display =
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
    "⚠️ ADMIN: Virtual Sports section not found."
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

    virtualSports.style.display =
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
// COMMON SPORTS ADD GAME BUTTON + API CHECK
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

            <!-- MANUAL ADD GAME -->

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


            <!-- API CHECK -->

            <div
                class="sports-api-check-box"
                data-sport="${escapeAdminSportsJS(
                    sportName
                )}"
            >

                <input
                    type="text"
                    class="sports-api-key-input"
                    placeholder="Check API"
                    autocomplete="off"
                    spellcheck="false"
                >

                <button
                    type="button"
                    class="sports-api-check-btn"
                    onclick="
                        openSportsApiCheck(
                            this
                        )
                    "
                >
                    Check
                </button>

            </div>


            <!-- API GAME DROPDOWN -->

            <div
                class="sports-api-games-dropdown"
                style="display:none;"
            ></div>

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
// SPORTS API CHECK
// ======================================================

async function openSportsApiCheck(button) {

    console.log(
        "🔎 ADMIN: Opening Sports API Check..."
    );


    /*
    ============================================================
        FIND API CHECK BOX
    ============================================================
    */

    const apiBox =
        button.closest(
            ".sports-api-check-box"
        );


    if (!apiBox) {

        console.error(
            "❌ ADMIN: API check box not found."
        );

        return;

    }


    /*
    ============================================================
        GET SPORT
        FROM CURRENT SPORT CONTROL PANEL
    ============================================================
    */

    const sportSection =
        button.closest(
            "[id$='-sports-section'], " +
            ".admin-sports-section, " +
            ".sports-admin-section"
        );


    let selectedSport =
        apiBox.dataset.sport ||
        "";


    /*
    ------------------------------------------------------------
        FALLBACK:
        READ SPORT FROM EXISTING ADMIN CONTEXT
    ------------------------------------------------------------
    */

    if (!selectedSport) {

        selectedSport =
            window.currentAdminSportsSport ||
            window.currentSportsSport ||
            window.activeSportsSport ||
            "";

    }


    selectedSport =
        String(
            selectedSport
        )
        .trim()
        .toLowerCase();


    /*
    ============================================================
        API INPUT
    ============================================================
    */

    const input =
        apiBox.querySelector(
            ".sports-api-key-input"
        );


    if (!input) {

        console.error(
            "❌ ADMIN: API key input not found."
        );

        return;

    }


    const temporaryApiKey =
        String(
            input.value || ""
        ).trim();

    window.sportsApiCheckApiKey =
    temporaryApiKey;


    /*
    ============================================================
        DROPDOWN
    ============================================================
    */

    const addGameRow =
        apiBox.closest(
            ".sports-add-game-row"
        );


    const dropdown =
        addGameRow
            ? addGameRow.querySelector(
                ".sports-api-games-dropdown"
            )
            : null;


    if (!dropdown) {

        console.error(
            "❌ ADMIN: API games dropdown not found."
        );

        return;

    }


    /*
    ============================================================
        VALIDATION
    ============================================================
    */

    if (!temporaryApiKey) {

        dropdown.style.display =
            "block";

        dropdown.innerHTML = `
            <div class="sports-api-empty">
                Wrong API
            </div>
        `;

        return;

    }


    if (!selectedSport) {

        dropdown.style.display =
            "block";

        dropdown.innerHTML = `
            <div class="sports-api-empty">
                Sport not selected.
            </div>
        `;

        return;

    }


    /*
    ============================================================
        LOADING
    ============================================================
    */

    dropdown.style.display =
        "block";


    dropdown.innerHTML = `
        <div class="sports-api-loading">
            Checking API...
        </div>
    `;


    /*
    ============================================================
        DISABLE CHECK BUTTON
    ============================================================
    */

    button.disabled =
        true;


    try {

        /*
        ========================================================
            SEND ONLY:
                apiKey
                sport

            NO TEAM
            NO MATCH TITLE
            NO SEARCH TEXT
        ========================================================
        */

        const response =
            await fetch(
                "https://safiki-cinema24.vercel.app/api/odds",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        "Accept":
                            "application/json"
                    },

                    body:
                        JSON.stringify({

                            apiKey:
                                temporaryApiKey,

                            sport:
                                selectedSport

                        })
                }
            );


        /*
        ========================================================
            READ RESPONSE
        ========================================================
        */

        let result = null;


        try {

            result =
                await response.json();

        } catch (error) {

            result = null;

        }


        console.log(
            "🔎 ADMIN: Sports API Check Response:",
            result
        );

        console.log(
    "🔎 ADMIN: API CHECK GAMES:",
    response?.games
);


        /*
        ========================================================
            WRONG API
        ========================================================
        */

        if (
            !response.ok ||
            !result ||
            result.code ===
                "WRONG_API"
        ) {

            dropdown.innerHTML = `
                <div class="sports-api-empty">
                    Wrong API
                </div>
            `;

            return;

        }


        /*
        ========================================================
            NO GAMES AVAILABLE
        ========================================================
        */

        if (
            result.code ===
                "NO_GAMES_AVAILABLE" ||
            !Array.isArray(
                result.games
            ) ||
            result.games.length === 0
        ) {

            dropdown.innerHTML = `
                <div class="sports-api-empty">
                    No Games Available
                </div>
            `;

            return;

        }


        /*
        ========================================================
            RENDER REAL API GAMES
        ========================================================
        */

        const games =
            result.games;

        window.sportsApiCheckGames = games;

        console.log(
    "🔑 API CHECK - SPORT KEYS:",
    games.map(game => ({
        game_id: game.id,
        api_sport_key: game.api_sport_key,
        api_sport_title: game.api_sport_title,
        home_team: game.home_team,
        away_team: game.away_team
    }))
);


        dropdown.innerHTML =
            games
                .map(
                    game => {

                        const gameId =
                            String(
                                game.id || ""
                            );

                        const apiSportKey =
                 String(
                game.api_sport_key ||
                   ""
                    ).trim();


                      console.log(
    "🔎 API CHECK RAW GAME:",
    game
);

                        /*
========================================================
    INSPECT PROVIDER BOOKMAKERS + MARKETS
========================================================
*/

try {

    const bookmakers =
        Array.isArray(
            game?.bookmakers
        )
            ? game.bookmakers
            : [];


    console.log(
        "🏦 API CHECK - BOOKMAKERS:",
        bookmakers
    );


    bookmakers.forEach(
        (bookmaker, bookmakerIndex) => {

            const bookmakerMarkets =
                Array.isArray(
                    bookmaker?.markets
                )
                    ? bookmaker.markets
                    : [];


            console.log(
                `🏦 BOOKMAKER ${bookmakerIndex + 1}:`,
                {
                    key:
                        bookmaker?.key || "",

                    title:
                        bookmaker?.title || "",

                    marketCount:
                        bookmakerMarkets.length
                }
            );


            console.log(
                `📊 BOOKMAKER ${bookmakerIndex + 1} - MARKETS:`,
                bookmakerMarkets
            );


            console.log(
                `🔑 BOOKMAKER ${bookmakerIndex + 1} - MARKET KEYS:`,
                bookmakerMarkets.map(
                    market =>
                        String(
                            market?.key || ""
                        ).trim()
                )
                .filter(
                    Boolean
                )
            );

        }
    );


} catch (error) {

    console.error(
        "❌ Failed to inspect bookmaker markets:",
        error
    );

}


const homeTeam =
    String(
        game.home_team ||
        ""
    );


const awayTeam =
    String(
        game.away_team ||
        ""
    );


const league =
    String(
        game.api_sport_title ||
        ""
    );


const status =
    String(
        game.status ||
        "upcoming"
    )
    .toLowerCase();


                        let statusHtml =
                            "";


                        if (
                            status ===
                            "live"
                        ) {

                            statusHtml = `
                                <span
                                    class="sports-api-status sports-api-status-live">
                                    LIVE
                                </span>
                            `;

                        } else {

                            statusHtml = `
                                <span
                                    class="sports-api-status sports-api-status-upcoming">
                                    UPCOMING
                                </span>
                            `;

                        }


                        /*
                        ------------------------------------------------
                            SAFE DISPLAY VALUES
                        ------------------------------------------------
                        */

                        const safeGameId =
                            encodeURIComponent(
                                gameId
                            );


                        return `
                            <div
                                class="sports-api-game-card"
                                data-api-game-id="${safeGameId}"
                            >

                                <div
                                    class="sports-api-game-info">

                                    <div
                                        class="sports-api-game-teams">

                                        ${escapeAdminSportsHTML(
                                            homeTeam
                                        )}

                                        <span>
                                            vs
                                        </span>

                                        ${escapeAdminSportsHTML(
                                            awayTeam
                                        )}

                                    </div>


                                    <div
                                        class="sports-api-game-meta">

                                        <span
                                            class="sports-api-game-league">

                                            ${escapeAdminSportsHTML(
                                                league
                                            )}

                                        </span>

                                        ${statusHtml}

                                    </div>

                                </div>


                                <button
                                    type="button"
                                    class="sports-api-add-btn"
                                    onclick="
                                        addSportsApiGame(
                                            this
                                        )
                                    "
                                >
                                    Add
                                </button>

                            </div>
                        `;

                    }
                )
                .join("");


    } catch (error) {

        console.error(
            "❌ ADMIN: Sports API Check failed."
        );


        dropdown.innerHTML = `
            <div class="sports-api-empty">
                Wrong API
            </div>
        `;


    } finally {

        /*
        ========================================================
            RESTORE CHECK BUTTON
        ========================================================
        */

        button.disabled =
            false;


        /*
        --------------------------------------------------------
            TEMPORARY KEY
            REMOVE FROM INPUT AFTER CHECK
        --------------------------------------------------------
        */

        input.value = "";

    }

}

// ======================================================
// ADD SPORTS API GAME
// ======================================================

async function addSportsApiGame(
    button
) {

    console.log(
        "➕ ADMIN: Adding API Sports Game..."
    );


    /*
    ========================================================
        FIND CLICKED API GAME CARD
    ========================================================
    */

    const gameCard =
        button.closest(
            ".sports-api-game-card"
        );


    if (!gameCard) {

        console.error(
            "❌ ADMIN: API game card not found."
        );

        return;

    }


    /*
    ========================================================
        GET PROVIDER EVENT ID
    ========================================================
    */

    const encodedGameId =
        gameCard.dataset.apiGameId || "";


    let apiGameId = "";


    try {

        apiGameId =
            decodeURIComponent(
                encodedGameId
            );

    } catch (error) {

        apiGameId =
            encodedGameId;

    }


    apiGameId =
        String(
            apiGameId || ""
        ).trim();


    if (!apiGameId) {

        console.error(
            "❌ ADMIN: API game ID missing."
        );

        return;

    }


    /*
    ========================================================
        GET CURRENT API CHECK GAME
    ========================================================
    */

    const apiGames =
        Array.isArray(
            window.sportsApiCheckGames
        )
            ? window.sportsApiCheckGames
            : [];


    const apiGame =
        apiGames.find(
            game =>
                String(
                    game?.id || ""
                ).trim() === apiGameId
        ) || null;


    console.log(
        "🔎 ADD GAME - FOUND API GAME:",
        apiGame
    );


    if (!apiGame) {

        console.error(
            "❌ ADMIN: Selected API game is not available."
        );

        alert(
            "Selected API game data is no longer available. Please run API Check again."
        );

        return;

    }


    /*
    ========================================================
        READ API CHECK API KEY
    ========================================================
    */

    const apiKey =
        String(
            window.sportsApiCheckApiKey || ""
        ).trim();


    if (!apiKey) {

        console.error(
            "❌ ADMIN: Sports API key is not available."
        );

        alert(
            "Sports API key is not available."
        );

        return;

    }


    /*
    ========================================================
        READ TEAMS
    ========================================================
    */

    let homeTeam =
        String(
            apiGame?.home_team || ""
        ).trim();


    let awayTeam =
        String(
            apiGame?.away_team || ""
        ).trim();


    /*
    ========================================================
        FALLBACK TEAM READ
    ========================================================
    */

    if (
        !homeTeam ||
        !awayTeam
    ) {

        const teamsElement =
            gameCard.querySelector(
                ".sports-api-game-teams"
            );


        if (teamsElement) {

            const teamText =
                String(
                    teamsElement.textContent || ""
                )
                .replace(
                    /\s+/g,
                    " "
                )
                .trim();


            const parts =
                teamText
                    .split(
                        /\s+vs\s+/i
                    )
                    .map(
                        value =>
                            value.trim()
                    );


            if (!homeTeam) {

                homeTeam =
                    parts[0] || "";

            }


            if (!awayTeam) {

                awayTeam =
                    parts[1] || "";

            }

        }

    }


    /*
    ========================================================
        LEAGUE
    ========================================================
    */

    const league =
        String(
            apiGame?.api_sport_title ||
            apiGame?.sport_title ||
            gameCard.querySelector(
                ".sports-api-game-league"
            )?.textContent ||
            ""
        )
        .trim();


    /*
    ========================================================
        STATUS
    ========================================================
    */

    const status =
        String(
            apiGame?.status ||
            "upcoming"
        )
        .trim()
        .toLowerCase();


    /*
    ========================================================
        SPORT
    ========================================================
    */

    const apiCheckBox =
        gameCard
            .closest(
                ".sports-add-game-row"
            )
            ?.querySelector(
                ".sports-api-check-box"
            );


    const sport =
        String(
            apiCheckBox?.dataset?.sport ||
            ""
        )
        .trim()
        .toLowerCase();


    /*
    ========================================================
        PROVIDER SPORT KEY
    ========================================================
    */

    const apiSportKey =
        String(
            apiGame?.api_sport_key ||
            apiGame?.sport_key ||
            ""
        )
        .trim();


    /*
    ========================================================
        VALIDATION
    ========================================================
    */

    if (!sport) {

        console.error(
            "❌ ADMIN: Sports category not found."
        );

        return;

    }


    if (!apiSportKey) {

        console.error(
            "❌ ADMIN: Provider sport key missing."
        );

        alert(
            "Provider sport key is missing."
        );

        return;

    }


    if (
        !homeTeam ||
        !awayTeam
    ) {

        console.error(
            "❌ ADMIN: Team data missing.",
            {
                apiGameId,
                homeTeam,
                awayTeam
            }
        );

        alert(
            "Game team information is missing."
        );

        return;

    }


    /*
    ========================================================
        PREVENT DOUBLE ADD
    ========================================================
    */

    const existingGame =
        window.adminSportsGames &&
        window.adminSportsGames[
            "api-" +
            apiGameId
        ];


    if (
        existingGame
    ) {

        button.disabled =
            true;

        button.textContent =
            "Added";

        gameCard.classList.add(
            "sports-api-game-added"
        );

        return;

    }


    /*
    ========================================================
        DISABLE BUTTON DURING SAVE
    ========================================================
    */

    button.disabled =
        true;

    button.textContent =
        "Loading...";


    try {

        /*
        ====================================================
            CHECK SUPABASE
        ====================================================
        */

        if (
            !window.supabaseClient
        ) {

            throw new Error(
                "Supabase connection unavailable."
            );

        }


        /*
        ====================================================
            STEP 1
            DISCOVER PROVIDER MARKET CATALOG
        ====================================================

            This uses the catalog function already added.
            Discovery itself is not an odds charge.
        ====================================================
        */

        let marketCatalog = null;


        if (
            typeof fetchSportsMarketCatalog ===
            "function"
        ) {

            marketCatalog =
                await fetchSportsMarketCatalog(
                    apiKey,
                    apiSportKey
                );

        }


        /*
        ====================================================
            BUILD ODDS MARKET CANDIDATES
        ====================================================

            We use catalog -> served_by.

            Player / batter / pitcher / anytime / futures
            props are handled by the single /props request,
            so we do not request those again through /odds.

            Outrights are not tied to this selected fixture,
            so they are excluded from this event fetch.
        ====================================================
        */

        let oddsCandidateKeys =
            [];


        if (
            marketCatalog &&
            Array.isArray(
                marketCatalog.oddsMarketKeys
            )
        ) {

            oddsCandidateKeys =
                marketCatalog
                    .oddsMarketKeys
                    .filter(
                        marketKey => {

                            const key =
                                String(
                                    marketKey || ""
                                )
                                .trim()
                                .toLowerCase();


                            if (
                                !key
                            ) {

                                return false;

                            }


                            if (
                                key ===
                                "outrights"
                            ) {

                                return false;

                            }


                            if (
                                key.startsWith(
                                    "player_"
                                )
                            ) {

                                return false;

                            }


                            if (
                                key.startsWith(
                                    "batter_"
                                )
                            ) {

                                return false;

                            }


                            if (
                                key.startsWith(
                                    "pitcher_"
                                )
                            ) {

                                return false;

                            }


                            if (
                                key.startsWith(
                                    "anytime_"
                                )
                            ) {

                                return false;

                            }


                            if (
                                key.startsWith(
                                    "futures_"
                                )
                            ) {

                                return false;

                            }


                            return true;

                        }
                    );

        }


        oddsCandidateKeys =
            [
                ...new Set(
                    oddsCandidateKeys
                )
            ];


        /*
        ====================================================
            FREE EVENT ODDS COVERAGE
        ====================================================
        */

        let coveredOddsMarkets =
            [];


        if (
            oddsCandidateKeys.length > 0
        ) {

            try {

                const coverageParams =
                    new URLSearchParams({

                        regions:
                            "us",

                        markets:
                            oddsCandidateKeys.join(","),

                        eventIds:
                            apiGameId

                    });


                const coverageUrl =
                    "https://parlay-api.com/v1/sports/" +
                    encodeURIComponent(
                        apiSportKey
                    ) +
                    "/odds/coverage?" +
                    coverageParams.toString();


                const coverageResponse =
                    await fetch(
                        coverageUrl,
                        {
                            method:
                                "GET",

                            headers: {
                                "Accept":
                                    "application/json",

                                "X-API-Key":
                                    apiKey,

                                "User-Agent":
                                    "SportsWebsite/1.0"
                            }
                        }
                    );


                let coverageData =
                    null;


                try {

                    coverageData =
                        await coverageResponse.json();

                } catch (error) {

                    coverageData =
                        null;

                }


                const discoveredKeys =
                    new Set();


                /*
                ------------------------------------------------
                    READ MARKET LISTS FROM HEADERS
                ------------------------------------------------
                */

                const servedHeader =
                    String(
                        coverageResponse.headers.get(
                            "x-markets-served"
                        ) ||
                        ""
                    );


                servedHeader
                    .split(",")
                    .map(
                        value =>
                            value.trim()
                    )
                    .filter(
                        Boolean
                    )
                    .forEach(
                        key =>
                            discoveredKeys.add(
                                key
                            )
                    );


                /*
                ------------------------------------------------
                    RECURSIVE MARKET KEY EXTRACTOR
                ------------------------------------------------
                */

                const collectMarketKeys =
                    value => {

                        if (
                            !value
                        ) {

                            return;

                        }


                        if (
                            typeof value ===
                            "string"
                        ) {

                            const trimmed =
                                value.trim();


                            if (
                                oddsCandidateKeys.includes(
                                    trimmed
                                )
                            ) {

                                discoveredKeys.add(
                                    trimmed
                                );

                            }


                            return;

                        }


                        if (
                            Array.isArray(
                                value
                            )
                        ) {

                            value.forEach(
                                item =>
                                    collectMarketKeys(
                                        item
                                    )
                            );

                            return;

                        }


                        if (
                            typeof value !==
                            "object"
                        ) {

                            return;

                        }


                        const directKeys = [
                            "market_key",
                            "marketKey",
                            "key"
                        ];


                        directKeys.forEach(
                            field => {

                                const fieldValue =
                                    String(
                                        value?.[
                                            field
                                        ] ||
                                        ""
                                    ).trim();


                                if (
                                    fieldValue &&
                                    oddsCandidateKeys.includes(
                                        fieldValue
                                    )
                                ) {

                                    discoveredKeys.add(
                                        fieldValue
                                    );

                                }

                            }
                        );


                        const marketFields = [
                            "markets",
                            "market_keys",
                            "marketKeys",
                            "served",
                            "served_markets",
                            "results",
                            "data",
                            "coverage"
                        ];


                        marketFields.forEach(
                            field => {

                                if (
                                    value?.[
                                        field
                                    ] !== undefined
                                ) {

                                    collectMarketKeys(
                                        value[
                                            field
                                        ]
                                    );

                                }

                            }
                        );

                    };


                collectMarketKeys(
                    coverageData
                );


                coveredOddsMarkets =
                    [
                        ...discoveredKeys
                    ]
                    .filter(
                        key =>
                            oddsCandidateKeys.includes(
                                key
                            )
                    );


                /*
                ------------------------------------------------
                    FALLBACK

                    If the free coverage endpoint does not
                    expose the served list in its body/header,
                    use the catalog candidates.

                    They are already restricted to
                    fixture-level /odds markets.
                ------------------------------------------------
                */

                if (
                    coveredOddsMarkets.length ===
                    0 &&
                    coverageResponse.ok
                ) {

                    coveredOddsMarkets =
                        [
                            ...oddsCandidateKeys
                        ];

                }


            } catch (error) {

                console.warn(
                    "⚠️ Odds coverage discovery failed. Using catalog market candidates."
                );


                coveredOddsMarkets =
                    [
                        ...oddsCandidateKeys
                    ];

            }

        }


        coveredOddsMarkets =
            [
                ...new Set(
                    coveredOddsMarkets
                        .map(
                            key =>
                                String(
                                    key || ""
                                ).trim()
                        )
                        .filter(
                            Boolean
                        )
                )
            ];


        console.log(
            "🔎 ADD GAME - COVERED ODDS MARKETS:",
            coveredOddsMarkets
        );


        /*
        ====================================================
            STEP 2
            FETCH ACTUAL GAME-LINE ODDS
        ====================================================

            This is the first charged call.

            It requests only the market keys selected above,
            for this one event.
        ====================================================
        */

        let oddsResult =
            null;


        if (
            coveredOddsMarkets.length > 0
        ) {

            oddsResult =
                await fetchSportOdds(
                    apiKey,
                    apiSportKey,
                    apiGameId,
                    coveredOddsMarkets
                );

        }


        /*
        ====================================================
            READ BOOKMAKERS FROM ODDS RESPONSE
        ====================================================
        */

        let apiBookmakers =
            [];


        if (
            oddsResult &&
            Array.isArray(
                oddsResult.data
            )
        ) {

            const matchingEvent =
                oddsResult.data.find(
                    event => {

                        const eventId =
                            String(
                                event?.id ||
                                ""
                            ).trim();


                        const canonicalId =
                            String(
                                event?.canonical_event_id ||
                                ""
                            ).trim();


                        const requestedCanonicalId =
                            String(
                                apiGame?.canonical_event_id ||
                                ""
                            ).trim();


                        return (
                            eventId ===
                                apiGameId ||
                            (
                                requestedCanonicalId &&
                                canonicalId ===
                                    requestedCanonicalId
                            )
                        );

                    }
                ) ||
                oddsResult.data[0] ||
                null;


            if (
                matchingEvent &&
                Array.isArray(
                    matchingEvent.bookmakers
                )
            ) {

                apiBookmakers =
                    matchingEvent.bookmakers
                        .map(
                            bookmaker =>
                                ({
                                    ...bookmaker,

                                    markets:
                                        Array.isArray(
                                            bookmaker?.markets
                                        )
                                            ? [
                                                ...bookmaker.markets
                                            ]
                                            : []
                                })
                        );

            }

        }


        /*
        ====================================================
            STEP 3
            FETCH ACTUAL PLAYER / PROP MARKETS
        ====================================================

            One /props call is 3 credits and returns all
            books/markets for the requested sport board.
            eventId narrows it to the selected game.
        ====================================================
        */

        const propsMarketKeys =
            marketCatalog &&
            Array.isArray(
                marketCatalog.propsMarketKeys
            )
                ? [
                    ...new Set(
                        marketCatalog.propsMarketKeys
                            .map(
                                key =>
                                    String(
                                        key || ""
                                    ).trim()
                            )
                            .filter(
                                Boolean
                            )
                    )
                ]
                : [];


        if (
            propsMarketKeys.length > 0
        ) {

            try {

                const propsParams =
                    new URLSearchParams({

                        eventId:
                            apiGameId,

                        markets:
                            propsMarketKeys.join(","),

                        limit:
                            "10000",

                        offset:
                            "0",

                        maxAgeSec:
                            "600"

                    });


                const propsUrl =
                    "https://parlay-api.com/v1/sports/" +
                    encodeURIComponent(
                        apiSportKey
                    ) +
                    "/props?" +
                    propsParams.toString();


                const propsResponse =
                    await fetch(
                        propsUrl,
                        {
                            method:
                                "GET",

                            headers: {
                                "Accept":
                                    "application/json",

                                "X-API-Key":
                                    apiKey,

                                "User-Agent":
                                    "SportsWebsite/1.0"
                            }
                        }
                    );


                let propsData =
                    null;


                try {

                    propsData =
                        await propsResponse.json();

                } catch (error) {

                    propsData =
                        null;

                }


                const propsRows =
                    Array.isArray(
                        propsData
                    )
                        ? propsData
                        : (
                            Array.isArray(
                                propsData?.data
                            )
                                ? propsData.data
                                : (
                                    Array.isArray(
                                        propsData?.results
                                    )
                                        ? propsData.results
                                        : (
                                            Array.isArray(
                                                propsData?.rows
                                            )
                                                ? propsData.rows
                                                : []
                                        )
                                )
                        );


                /*
                ------------------------------------------------
                    GROUP PROP ROWS
                ------------------------------------------------
                */

                const propGroups =
                    new Map();


                propsRows.forEach(
                    row => {

                        if (
                            !row ||
                            typeof row !==
                                "object"
                        ) {

                            return;

                        }


                        const bookmakerKey =
                            String(
                                row?.bookmaker ||
                                row?.bookmaker_key ||
                                row?.source ||
                                ""
                            )
                            .trim();


                        const bookmakerTitle =
                            String(
                                row?.bookmaker_title ||
                                row?.bookmaker ||
                                row?.bookmaker_key ||
                                row?.source ||
                                "Bookmaker"
                            )
                            .trim();


                        const marketKey =
                            String(
                                row?.market_key ||
                                ""
                            )
                            .trim();


                        if (
                            !bookmakerKey ||
                            !marketKey
                        ) {

                            return;

                        }


                        const groupKey =
                            bookmakerKey +
                            "::" +
                            marketKey;


                        if (
                            !propGroups.has(
                                groupKey
                            )
                        ) {

                            propGroups.set(
                                groupKey,
                                {
                                    bookmakerKey,
                                    bookmakerTitle,
                                    marketKey,
                                    marketTitle:
                                        String(
                                            row?.market ||
                                            row?.market_title ||
                                            row?.market_name ||
                                            marketKey
                                        )
                                        .trim(),

                                    outcomes: []
                                }
                            );

                        }


                        const group =
                            propGroups.get(
                                groupKey
                            );


                        const player =
                            String(
                                row?.player ||
                                row?.selection ||
                                row?.name ||
                                row?.team ||
                                row?.outcome ||
                                ""
                            )
                            .trim();


                        const line =
                            row?.line !==
                                undefined &&
                            row?.line !==
                                null
                                ? row.line
                                : null;


                        const addOutcome =
                            (
                                outcomeName,
                                price
                            ) => {

                                if (
                                    price ===
                                        undefined ||
                                    price ===
                                        null
                                ) {

                                    return;

                                }


                                const existing =
                                    group.outcomes.find(
                                        outcome =>
                                            outcome.name ===
                                                outcomeName &&
                                            String(
                                                outcome.price
                                            ) ===
                                                String(
                                                    price
                                                ) &&
                                            String(
                                                outcome.point
                                            ) ===
                                                String(
                                                    line
                                                )
                                    );


                                if (
                                    existing
                                ) {

                                    return;

                                }


                                group.outcomes.push({
                                    name:
                                        outcomeName,

                                    price:
                                        price,

                                    ...(line !==
                                        null
                                        ? {
                                            point:
                                                line
                                        }
                                        : {})
                                });

                            };


                        const overPrice =
                            row?.over_price;


                        const underPrice =
                            row?.under_price;


                        if (
                            overPrice !==
                                undefined &&
                            overPrice !==
                                null
                        ) {

                            addOutcome(
                                player
                                    ? player +
                                      " Over"
                                    : "Over",
                                overPrice
                            );

                        }


                        if (
                            underPrice !==
                                undefined &&
                            underPrice !==
                                null
                        ) {

                            addOutcome(
                                player
                                    ? player +
                                      " Under"
                                    : "Under",
                                underPrice
                            );

                        }


                        /*
                        ----------------------------------------
                            GENERIC SINGLE-PRICE PROP
                        ----------------------------------------
                        */

                        if (
                            (
                                overPrice ===
                                    undefined ||
                                overPrice ===
                                    null
                            ) &&
                            (
                                underPrice ===
                                    undefined ||
                                underPrice ===
                                    null
                            ) &&
                            row?.price !==
                                undefined &&
                            row?.price !==
                                null
                        ) {

                            addOutcome(
                                player ||
                                "Selection",
                                row.price
                            );

                        }

                    }
                );


                /*
                ------------------------------------------------
                    MERGE NORMALIZED PROP MARKETS INTO
                    API BOOKMAKERS
                ------------------------------------------------
                */

                propGroups.forEach(
                    group => {

                        let bookmaker =
                            apiBookmakers.find(
                                item =>
                                    String(
                                        item?.key ||
                                        ""
                                    )
                                    .trim() ===
                                    group.bookmakerKey
                            );


                        if (
                            !bookmaker
                        ) {

                            bookmaker = {

                                key:
                                    group.bookmakerKey,

                                title:
                                    group.bookmakerTitle,

                                markets:
                                    []

                            };


                            apiBookmakers.push(
                                bookmaker
                            );

                        }


                        if (
                            !Array.isArray(
                                bookmaker.markets
                            )
                        ) {

                            bookmaker.markets =
                                [];

                        }


                        let market =
                            bookmaker.markets.find(
                                item =>
                                    String(
                                        item?.key ||
                                        ""
                                    )
                                    .trim() ===
                                    group.marketKey
                            );


                        if (
                            !market
                        ) {

                            market = {

                                key:
                                    group.marketKey,

                                title:
                                    group.marketTitle,

                                outcomes:
                                    []

                            };


                            bookmaker.markets.push(
                                market
                            );

                        }


                        if (
                            !Array.isArray(
                                market.outcomes
                            )
                        ) {

                            market.outcomes =
                                [];

                        }


                        group.outcomes.forEach(
                            outcome => {

                                const exists =
                                    market.outcomes.find(
                                        existing =>
                                            existing?.name ===
                                                outcome?.name &&
                                            String(
                                                existing?.price
                                            ) ===
                                                String(
                                                    outcome?.price
                                                ) &&
                                            String(
                                                existing?.point
                                            ) ===
                                                String(
                                                    outcome?.point
                                                )
                                    );


                                if (
                                    !exists
                                ) {

                                    market.outcomes.push(
                                        outcome
                                    );

                                }

                            }
                        );

                    }
                );


                console.log(
                    "📊 ADD GAME - PROP MARKETS:",
                    {
                        rows:
                            propsRows.length,

                        marketKeys:
                            propsMarketKeys,

                        groups:
                            propGroups.size
                    }
                );


            } catch (error) {

                /*
                ------------------------------------------------
                    PROP FAILURE DOES NOT CANCEL GAME ADD
                ------------------------------------------------
                */

                console.warn(
                    "⚠️ API prop market fetch failed. Game will continue with game-line markets."
                );

            }

        }


        /*
        ====================================================
            NORMALIZE FINAL BOOKMAKER DATA
        ====================================================
        */

        apiBookmakers =
            apiBookmakers
                .filter(
                    bookmaker =>
                        bookmaker &&
                        Array.isArray(
                            bookmaker.markets
                        ) &&
                        bookmaker.markets.length > 0
                )
                .map(
                    bookmaker =>
                        ({
                            ...bookmaker,

                            markets:
                                bookmaker.markets
                                    .filter(
                                        market =>
                                            market &&
                                            String(
                                                market?.key ||
                                                ""
                                            ).trim()
                                    )
                                    .map(
                                        market =>
                                            ({
                                                ...market,

                                                key:
                                                    String(
                                                        market?.key ||
                                                        ""
                                                    ).trim(),

                                                ...(Array.isArray(
                                                    market?.outcomes
                                                )
                                                    ? {
                                                        outcomes:
                                                            market.outcomes
                                                    }
                                                    : {})
                                            })
                                    )
                        })
                );


        console.log(
            "🏦 ADD GAME - FINAL API BOOKMAKERS:",
            apiBookmakers
        );


        /*
        ====================================================
            BUILD NEW SPORTS GAME
        ====================================================
        */

        const newGame = {

                        game_id:
                "api-" +
                apiGameId,

            /*
            ------------------------------------------------
                PROVIDER EVENT ID
                Dynamic ID from API Check game.
                Do NOT hardcode.
            ------------------------------------------------
            */

            api_event_id:
                apiGameId,

            sport:
                sport,

            api_sport_key:
                apiSportKey,

            title:
                `${homeTeam} vs ${awayTeam}`,

            league:
                league,

            status:
                status === "live"
                    ? "live"
                    : "upcoming",

            /*
            ------------------------------------------------
                ALWAYS START DISABLED
            ------------------------------------------------
            */

            match_status:
                "disable",

            home_team:
                homeTeam,

            away_team:
                awayTeam,

            /*
            ------------------------------------------------
                LEGACY FIELDS
                KEPT UNCHANGED
            ------------------------------------------------
            */

            total_runs_enabled:
                false,

            over_under_enabled:
                false,

            match_winner_enabled:
                false,

            /*
            ------------------------------------------------
                EXISTING MASTER MARKET STATE
            ------------------------------------------------
            */

            enabled_markets:
                {},

            /*
            ------------------------------------------------
                PROVIDER MARKET DATA
            ------------------------------------------------
            */

            api_bookmakers:
                apiBookmakers,

            /*
            ------------------------------------------------
                API MARKET ADMIN STATE
            ------------------------------------------------
            */

            api_market_settings:
                {}

        };


        /*
        ====================================================
            INSERT INTO EXISTING sports_games
        ====================================================
        */

        const {
            data,
            error
        } =
            await window.supabaseClient
                .from(
                    "sports_games"
                )
                .insert(
                    newGame
                )
                .select()
                .single();


        /*
        ====================================================
            SUPABASE ERROR
        ====================================================
        */

        if (
            error
        ) {

            console.error(
                "❌ ADMIN: Failed to add API game:",
                error
            );

            throw error;

        }


        /*
        ====================================================
            USE SAVED SUPABASE ROW
        ====================================================
        */

        const savedGame =
            data ||
            newGame;


        console.log(
            "✅ ADMIN: API game added to sports_games:",
            savedGame
        );


        /*
        ====================================================
            UPDATE ADMIN CACHE
        ====================================================
        */

        if (
            !window.adminSportsGames
        ) {

            window.adminSportsGames =
                {};

        }


        window.adminSportsGames[
            savedGame.game_id
        ] =
            savedGame;


        /*
        ====================================================
            UPDATE LOADED STATE
        ====================================================
        */

        window.adminSportsGamesLoaded =
            true;


        /*
        ====================================================
            REFRESH ADMIN GAME LIST
        ====================================================
        */

        if (
            typeof renderAllAdminSportsGames ===
                "function"
        ) {

            renderAllAdminSportsGames();

        }


        /*
        ====================================================
            MARK API RESULT AS ADDED
        ====================================================
        */

        gameCard.classList.add(
            "sports-api-game-added"
        );


        button.disabled =
            true;

        button.textContent =
            "Added";


        /*
        ====================================================
            SAVE ADDED GAME ID
        ====================================================
        */

        gameCard.dataset.addedGameId =
            savedGame.game_id;


        console.log(
            "✅ ADMIN: API game successfully added."
        );


    } catch (error) {

        console.error(
            "❌ ADMIN: Add API game failed:",
            error
        );


        /*
        ----------------------------------------------------
            RESTORE BUTTON IF SAVE FAILED
        ----------------------------------------------------
        */

        button.disabled =
            false;

        button.textContent =
            "Add";


        alert(
            "Failed to add game."
        );

    }

}


// ======================================================
// END ADD SPORTS API GAME
// ======================================================

// ======================================================
// COMMON ADD SPORTS GAME MODAL
// ======================================================

window.openAddSportsGameModal =
async function (sport) {

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
     MASTER BETTING MARKETS
=================================== -->

<div class="sports-add-markets-row">

    <div class="sports-add-markets-title">
        Betting Markets
    </div>


    <div
        class="sports-add-market-items"
        id="addSportsMarketsContainer">

        <div class="sports-markets-loading">
            Loading markets...
        </div>

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


    await loadSportsMasterMarkets(
    currentSport
);


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

async function loadSportsMasterMarkets(
    sport
) {

    const container =
        document.getElementById(
            "addSportsMarketsContainer"
        );

    if (!container) {
        return;
    }


    container.innerHTML = `
        <div class="sports-markets-loading">
            Loading markets...
        </div>
    `;


    if (!window.supabaseClient) {

        container.innerHTML = `
            <div class="sports-markets-empty">
                Supabase connection unavailable.
            </div>
        `;

        return;
    }


    const normalizedSport =
        String(
            sport || ""
        )
        .trim()
        .toLowerCase();


    if (!normalizedSport) {

        container.innerHTML = `
            <div class="sports-markets-empty">
                No sport selected.
            </div>
        `;

        return;
    }


    const {
        data,
        error
    } =
        await window.supabaseClient
            .from("sports_markets")
            .select(
                "market_key, market_name, enabled, display_order"
            )
            .eq(
                "sport",
                normalizedSport
            )
            .order(
                "display_order",
                {
                    ascending: true
                }
            );


    if (error) {

        console.error(
            "❌ Failed to load master sports markets:",
            error
        );

        container.innerHTML = `
            <div class="sports-markets-empty">
                Failed to load markets.
            </div>
        `;

        return;
    }


    if (
        !Array.isArray(data) ||
        data.length === 0
    ) {

        container.innerHTML = `
            <div class="sports-markets-empty">
                No markets available for this sport.
            </div>
        `;

        return;
    }


    container.innerHTML =
        data
            .map(
                market => {

                    const marketKey =
                        String(
                            market.market_key || ""
                        )
                        .trim();


                    const marketName =
                        String(
                            market.market_name || ""
                        )
                        .trim();


                    if (!marketKey) {
                        return "";
                    }


                    return `
                        <label
                            class="sports-market-toggle">

                            <span>
                                ${marketName}
                            </span>

                            <input
                                type="checkbox"
                                class="sports-master-market-checkbox"
                                data-market-key="${marketKey}"
                                ${market.enabled !== false
                                    ? "checked"
                                    : ""}>

                        </label>
                    `;
                }
            )
            .join("");


    console.log(
        "✅ MASTER MARKETS LOADED:",
        {
            sport: normalizedSport,
            markets: data
        }
    );

}

// ======================================================
//end  LOAD MASTER SPORTS MARKETS
// ======================================================

// ======================================================
// LOAD API MARKETS FOR SPORTS GAME
// ======================================================

async function loadSportsApiMarkets(
    game
) {

    /*
    ========================================================
        DYNAMIC MARKET LABEL FORMATTER
    ========================================================
    */

    function formatMarketLabel(
        value
    ) {

        const text =
            String(
                value || ""
            )
            .trim()
            .replace(
                /[_-]+/g,
                " "
            )
            .replace(
                /\s+/g,
                " "
            );

        if (!text) {

            return "Unnamed Market";

        }


        return text
            .split(" ")
            .map(
                word => {

                    /*
                    --------------------------------------------
                        Generic formatting only.
                        No market names are hardcoded.
                    --------------------------------------------
                    */

                    if (
                        /^[a-z0-9]+$/i.test(
                            word
                        ) &&
                        /\d/.test(
                            word
                        )
                    ) {

                        return word.toUpperCase();

                    }


                    return (
                        word.charAt(0).toUpperCase() +
                        word.slice(1)
                    );

                }
            )
            .join(" ");

    }


    /*
    ========================================================
        FIND EXISTING MASTER MARKET CONTAINER
    ========================================================
    */

    const masterContainer =
        document.getElementById(
            "editSportsMarketsContainer"
        );

    const masterSection =
    masterContainer
        ? masterContainer.closest(
            ".sports-add-markets-row"
        )
        : null;


    if (!masterContainer) {

        console.warn(
            "⚠️ Master Betting Markets container not found."
        );

        return;

    }


   
/*
/*
========================================================
    FIND API MARKETS CONTAINER
========================================================
*/

const container =
    document.getElementById(
        "editSportsApiMarketsContainer"
    );


if (!container) {

    console.warn(
        "⚠️ API Sports Markets container not found."
    );

    return;

}


/*
========================================================
    LOADING STATE
========================================================
*/

container.innerHTML = `
    <div class="sports-markets-loading">
        Loading API markets...
    </div>
`;

    /*
    ========================================================
        READ SAVED PROVIDER BOOKMAKERS
    ========================================================
    */

    const apiBookmakers =
        Array.isArray(
            game?.api_bookmakers
        )
            ? game.api_bookmakers
            : [];


    /*
    ========================================================
        READ SAVED API MARKET SETTINGS
    ========================================================
    */

    const apiMarketSettings =
        game?.api_market_settings &&
        typeof game.api_market_settings ===
            "object" &&
        !Array.isArray(
            game.api_market_settings
        )
            ? {
                ...game.api_market_settings
            }
            : {};


    /*
    ========================================================
        NO API DATA
    ========================================================
    */

    if (
        apiBookmakers.length === 0
    ) {

        container.innerHTML = `
            <div class="sports-markets-empty">
                No API markets available for this game.
            </div>
        `;

        console.log(
            "ℹ️ API MARKETS: No saved provider bookmakers.",
            {
                gameId:
                    game?.game_id || ""
            }
        );

        return;

    }


    /*
    ========================================================
        BUILD ALL BOOKMAKER MARKET CARDS
    ========================================================
    */

    const bookmakerHtml =
        apiBookmakers
            .map(
                (
                    bookmaker,
                    bookmakerIndex
                ) => {

                    const bookmakerKey =
                        String(
                            bookmaker?.key ||
                            bookmaker?.title ||
                            `bookmaker_${bookmakerIndex + 1}`
                        )
                        .trim();


                    const bookmakerTitle =
                        String(
                            bookmaker?.title ||
                            bookmaker?.key ||
                            `Bookmaker ${bookmakerIndex + 1}`
                        )
                        .trim();


                    const markets =
                        Array.isArray(
                            bookmaker?.markets
                        )
                            ? bookmaker.markets
                            : [];


                    const marketCards =
                        markets
                            .map(
                                (
                                    market,
                                    marketIndex
                                ) => {

                                    if (
                                        !market ||
                                        typeof market !==
                                            "object"
                                    ) {

                                        return "";

                                    }


                                    const marketKey =
                                        String(
                                            market?.key ||
                                            `market_${marketIndex + 1}`
                                        )
                                        .trim();


                                    if (
                                        !marketKey
                                    ) {

                                        return "";

                                    }


                                    /*
                                    --------------------------------
                                        UNIQUE MARKET SETTING KEY
                                    --------------------------------
                                    */

                                    const settingKey =
                                        bookmakerKey +
                                        "::" +
                                        marketKey;


                                    const encodedSettingKey =
                                        encodeURIComponent(
                                            settingKey
                                        );


                                    /*
                                    --------------------------------
                                        CURRENT ADMIN STATE
                                    --------------------------------
                                    */

                                    const savedSetting =
                                        apiMarketSettings[
                                            settingKey
                                        ] &&
                                        typeof apiMarketSettings[
                                            settingKey
                                        ] === "object" &&
                                        !Array.isArray(
                                            apiMarketSettings[
                                                settingKey
                                            ]
                                        )
                                            ? apiMarketSettings[
                                                settingKey
                                            ]
                                            : {};


                                    /*
                                    --------------------------------
                                        DELETED MARKETS STAY HIDDEN
                                    --------------------------------
                                    */

                                    if (
                                        savedSetting.deleted ===
                                            true
                                    ) {

                                        return "";

                                    }


                                    const isEnabled =
                                        savedSetting.enabled !==
                                            false;


                                    /*
                                    --------------------------------
                                        FULLY DYNAMIC MARKET NAME
                                    --------------------------------
                                    */

                                    const providerMarketName =
                                        String(
                                            market?.title ||
                                            market?.name ||
                                            marketKey
                                        )
                                        .trim();


                                    const marketName =
                                        formatMarketLabel(
                                            providerMarketName
                                        );


                                    /*
                                    --------------------------------
                                        OUTCOMES
                                    --------------------------------
                                    */

                                    const outcomes =
                                        Array.isArray(
                                            market?.outcomes
                                        )
                                            ? market.outcomes
                                            : [];


                                    const outcomeHtml =
                                        outcomes
                                            .map(
                                                outcome => {

                                                    if (
                                                        !outcome ||
                                                        typeof outcome !==
                                                            "object"
                                                    ) {

                                                        return "";

                                                    }


                                                    const outcomeName =
                                                        String(
                                                            outcome?.name ||
                                                            ""
                                                        )
                                                        .trim();


                                                    const price =
                                                        outcome?.price !==
                                                            undefined &&
                                                        outcome?.price !==
                                                            null
                                                            ? String(
                                                                outcome.price
                                                            )
                                                            : "";


                                                    const point =
                                                        outcome?.point !==
                                                            undefined &&
                                                        outcome?.point !==
                                                            null
                                                            ? String(
                                                                outcome.point
                                                            )
                                                            : "";


                                                    if (
                                                        !outcomeName &&
                                                        !price &&
                                                        !point
                                                    ) {

                                                        return "";

                                                    }


                                                    return `
                                                        <div
                                                            class="sports-api-market-outcome"
                                                        >

                                                            <span
                                                                class="sports-api-market-outcome-name"
                                                            >
                                                                ${escapeAdminSportsHTML(
                                                                    outcomeName ||
                                                                    "Unnamed outcome"
                                                                )}
                                                            </span>

                                                            <span
                                                                class="sports-api-market-outcome-values"
                                                            >

                                                                ${
                                                                    point
                                                                        ? `
                                                                            <span
                                                                                class="sports-api-market-outcome-point"
                                                                            >
                                                                                ${escapeAdminSportsHTML(
                                                                                    point
                                                                                )}
                                                                            </span>
                                                                        `
                                                                        : ""
                                                                }

                                                                ${
                                                                    price
                                                                        ? `
                                                                            <span
                                                                                class="sports-api-market-outcome-price"
                                                                            >
                                                                                ${escapeAdminSportsHTML(
                                                                                    price
                                                                                )}
                                                                            </span>
                                                                        `
                                                                        : ""
                                                                }

                                                            </span>

                                                        </div>
                                                    `;

                                                }
                                            )
                                            .join("");


                                    /*
                                    --------------------------------
                                        MARKET CARD
                                    --------------------------------
                                    */

                                    return `
                                        <div
                                            class="sports-api-market-card"
                                            data-api-setting-key="${encodedSettingKey}"
                                        >

                                            <div
                                                class="sports-api-market-card-header"
                                            >

                                                <div
                                                    class="sports-api-market-card-title"
                                                >

                                                    ${escapeAdminSportsHTML(
                                                        marketName
                                                    )}

                                                    <span
                                                        class="sports-api-market-card-key"
                                                    >
                                                        ${escapeAdminSportsHTML(
                                                            marketKey
                                                        )}
                                                    </span>

                                                </div>


                                                <div
                                                    class="sports-api-market-card-actions"
                                                >

                                                    <label
                                                        class="sports-api-market-check"
                                                    >

                                                        <input
                                                            type="checkbox"
                                                            class="sports-api-market-checkbox"
                                                            data-setting-key="${encodedSettingKey}"
                                                            ${
                                                                isEnabled
                                                                    ? "checked"
                                                                    : ""
                                                            }
                                                        >

                                                        <span>
                                                            Enable
                                                        </span>

                                                    </label>


                                                    <button
                                                        type="button"
                                                        class="sports-api-market-delete-btn"
                                                        data-setting-key="${encodedSettingKey}"
                                                    >
                                                        Delete
                                                    </button>

                                                </div>

                                            </div>


                                            ${
                                                outcomeHtml
                                                    ? `
                                                        <div
                                                            class="sports-api-market-outcomes"
                                                        >
                                                            ${outcomeHtml}
                                                        </div>
                                                    `
                                                    : `
                                                        <div
                                                            class="sports-markets-empty"
                                                        >
                                                            No outcomes available.
                                                        </div>
                                                    `
                                            }

                                        </div>
                                    `;

                                }
                            )
                            .join("");


                    if (
                        !marketCards
                    ) {

                        return "";

                    }


                    return `
                        <div
                            class="sports-api-market-group"
                        >

                            <div
                                class="sports-api-bookmaker-title"
                            >
                                ${escapeAdminSportsHTML(
                                    bookmakerTitle
                                )}
                            </div>

                            <div
                                class="sports-api-market-list"
                            >
                                ${marketCards}
                            </div>

                        </div>
                    `;

                }
            )
            .join("");


    /*
    ========================================================
        RENDER
    ========================================================
    */

    container.innerHTML =
        bookmakerHtml ||
        `
            <div class="sports-markets-empty">
                No API markets available for this game.
            </div>
        `;


    /*
    ========================================================
        SAVE MARKET SETTINGS
    ========================================================
    */

    async function saveMarketSettings(
        settings
    ) {

        if (
            !window.supabaseClient
        ) {

            throw new Error(
                "Supabase connection unavailable."
            );

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
                    api_market_settings:
                        settings
                })
                .eq(
                    "game_id",
                    game.game_id
                )
                .select(
                    "game_id, api_market_settings"
                )
                .single();


        if (error) {

            throw error;

        }


        const savedSettings =
            data?.api_market_settings ||
            {};


        game.api_market_settings =
            savedSettings;


        if (
            window.adminSportsGames &&
            window.adminSportsGames[
                game.game_id
            ]
        ) {

            window.adminSportsGames[
                game.game_id
            ] = {
                ...window.adminSportsGames[
                    game.game_id
                ],

                api_market_settings:
                    savedSettings
            };

        }


        window.currentEditingSportsGame =
            game;


        return savedSettings;

    }


    /*
    ========================================================
        ENABLE / DISABLE CHECKBOX
    ========================================================
    */

    container
        .querySelectorAll(
            ".sports-api-market-checkbox"
        )
        .forEach(
            checkbox => {

                checkbox.addEventListener(
                    "change",
                    async () => {

                        const settingKey =
                            decodeURIComponent(
                                checkbox.dataset.settingKey ||
                                ""
                            );


                        if (
                            !settingKey
                        ) {

                            return;

                        }


                        const settings =
                            game?.api_market_settings &&
                            typeof game.api_market_settings ===
                                "object" &&
                            !Array.isArray(
                                game.api_market_settings
                            )
                                ? {
                                    ...game.api_market_settings
                                }
                                : {};


                        settings[
                            settingKey
                        ] = {

                            ...(settings[
                                settingKey
                            ] || {}),

                            enabled:
                                checkbox.checked,

                            deleted:
                                false

                        };


                        checkbox.disabled =
                            true;


                        try {

                            await saveMarketSettings(
                                settings
                            );

                        } catch (error) {

                            console.error(
                                "❌ Failed to save API market state:",
                                error
                            );


                            checkbox.checked =
                                !checkbox.checked;


                            alert(
                                "Failed to save API market state."
                            );

                        } finally {

                            checkbox.disabled =
                                false;

                        }

                    }
                );

            }
        );


    /*
    ========================================================
        DELETE API MARKET
    ========================================================
    */

    container
        .querySelectorAll(
            ".sports-api-market-delete-btn"
        )
        .forEach(
            deleteButton => {

                deleteButton.addEventListener(
                    "click",
                    async () => {

                        const settingKey =
                            decodeURIComponent(
                                deleteButton.dataset.settingKey ||
                                ""
                            );


                        if (
                            !settingKey
                        ) {

                            return;

                        }


                        const confirmed =
                            window.confirm(
                                "Delete this API market from this game?"
                            );


                        if (
                            !confirmed
                        ) {

                            return;

                        }


                        const settings =
                            game?.api_market_settings &&
                            typeof game.api_market_settings ===
                                "object" &&
                            !Array.isArray(
                                game.api_market_settings
                            )
                                ? {
                                    ...game.api_market_settings
                                }
                                : {};


                        settings[
                            settingKey
                        ] = {

                            ...(settings[
                                settingKey
                            ] || {}),

                            enabled:
                                false,

                            deleted:
                                true

                        };


                        deleteButton.disabled =
                            true;


                        try {

                            await saveMarketSettings(
                                settings
                            );


                            await loadSportsApiMarkets(
                                game
                            );

                        } catch (error) {

                            console.error(
                                "❌ Failed to delete API market:",
                                error
                            );


                            deleteButton.disabled =
                                false;


                            alert(
                                "Failed to delete API market."
                            );

                        }

                    }
                );

            }
        );


    /*
    ========================================================
        DEBUG
    ========================================================
    */

    const marketKeys =
        apiBookmakers
            .flatMap(
                bookmaker =>
                    Array.isArray(
                        bookmaker?.markets
                    )
                        ? bookmaker.markets.map(
                            market =>
                                String(
                                    market?.key ||
                                    ""
                                ).trim()
                        )
                        : []
            )
            .filter(
                Boolean
            );


    console.log(
        "✅ API MARKETS LOADED DYNAMICALLY:",
        {
            gameId:
                game?.game_id || "",

            bookmakerCount:
                apiBookmakers.length,

            totalAvailableMarkets:
                apiBookmakers.reduce(
                    (
                        total,
                        bookmaker
                    ) =>
                        total +
                        (
                            Array.isArray(
                                bookmaker?.markets
                            )
                                ? bookmaker.markets.length
                                : 0
                        ),
                    0
                ),

            marketKeys:
                marketKeys
        }
    );

}


// ======================================================
// END LOAD API MARKETS
// ======================================================




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

    const apiSportKeyInput =
    document.getElementById(
        "editSportsGameApiSportKey"
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

    const apiSportKey =
    apiSportKeyInput
        ? apiSportKeyInput.value.trim()
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
    !apiSportKey ||
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
// SELECTED MASTER MARKETS
// ==================================================

const enabledMarkets = {};

const marketsContainer =
    document.getElementById(
        "adminMarketsGrid-" + gameId
    );

if (marketsContainer) {

    const marketButtons =
        marketsContainer.querySelectorAll(
            "button[data-market-key]"
        );

    console.log(
        "🔎 MASTER MARKET BUTTON COUNT:",
        marketButtons.length
    );

    marketButtons.forEach(button => {

        const marketKey =
            String(
                button.getAttribute(
                    "data-market-key"
                ) || ""
            ).trim();

        const isOn =
            button.classList.contains(
                "market-on"
            );

        console.log(
            "🔎 MASTER MARKET STATE:",
            {
                marketKey: marketKey,
                isOn: isOn
            }
        );

        if (
            marketKey &&
            isOn
        ) {
            enabledMarkets[
                marketKey
            ] = true;
        }

    });

} else {

    console.error(
        "❌ MASTER MARKETS CONTAINER NOT FOUND:",
        "adminMarketsGrid-" + gameId
    );

}

console.log(
    "💾 SELECTED MASTER MARKETS:",
    JSON.stringify(
        enabledMarkets,
        null,
        2
    )
);

    // ==================================================
    // NEW GAME OBJECT
    // ==================================================

const newGame = {

    game_id:
        gameId,

    sport:
        sport,

    api_sport_key:
        apiSportKey,

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
            matchWinnerEnabled,

        enabled_markets:
            enabledMarkets

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

// ======================================================
// CREATE ADMIN SPORTS CARD
// ======================================================

// ======================================================
// CREATE ADMIN SPORTS CARD
// ======================================================

function createAdminSportsCard(
    game
) {

    const matchStatus =
        normalizeMatchStatus(
            game.match_status
        );


    // ==================================================
    // MASTER MARKET SOURCE OF TRUTH
    // ==================================================

    const enabledMarkets =
        game.enabled_markets &&
        typeof game.enabled_markets === "object" &&
        !Array.isArray(
            game.enabled_markets
        )
            ? game.enabled_markets
            : {};


    const enabledMarketCount =
        Object.keys(
            enabledMarkets
        )
        .filter(
            marketKey =>
                enabledMarkets[
                    marketKey
                ] === true
        )
        .length;


    const totalMarketCount =
        Object.keys(
            enabledMarkets
        ).length;


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
                EDIT MATCH  MARKETS
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


                <div
    class="admin-markets-grid"
    id="adminMarketsGrid-${escapeAdminSportsHTML(
        game.game_id
    )}"
>

    <div class="sports-markets-loading">
        Loading markets...
    </div>

</div>


                </div>

            </div>


        </div>

    `;

}

 // ======================================================
// LOAD MASTER MARKETS FOR EDIT MATCH SPORTS GAME PANEL
// ======================================================

async function loadAdminGameMasterMarkets(
    game
) {

    const container =
        document.getElementById(
            "adminMarketsGrid-" +
            game.game_id
        );

    if (!container) {
        console.warn(
            "⚠️ Admin market container not found:",
            game.game_id
        );
        return;
    }

    container.innerHTML = `
        <div class="sports-markets-loading">
            Loading markets...
        </div>
    `;

    if (!window.supabaseClient) {
        container.innerHTML = `
            <div class="sports-markets-empty">
                Supabase connection unavailable.
            </div>
        `;
        return;
    }

    const sport =
        String(
            game.sport || ""
        )
        .trim()
        .toLowerCase();

    if (!sport) {
        container.innerHTML = `
            <div class="sports-markets-empty">
                No sport selected.
            </div>
        `;
        return;
    }

    const {
        data,
        error
    } =
        await window.supabaseClient
            .from("sports_markets")
            .select(
                "market_key, market_name, enabled, display_order"
            )
            .eq(
                "sport",
                sport
            )
            .order(
                "display_order",
                {
                    ascending: true
                }
            );
    console.log(
    "🚨 MARKET QUERY START:",
    {
        gameId: game.game_id,
        sport: sport
    }
);

    console.log(
    "🚨 MASTER MARKET QUERY RESULT:",
    {
        gameId: game.game_id,
        sport: sport,
        data: data,
        error: error,
        count:
            Array.isArray(data)
                ? data.length
                : "NOT_ARRAY"
    }
);

    if (error) {

        console.error(
            "❌ Failed to load admin master markets:",
            error
        );

        container.innerHTML = `
            <div class="sports-markets-empty">
                Failed to load markets.
            </div>
        `;

        return;
    }

    if (
        !Array.isArray(data) ||
        data.length === 0
    ) {

        container.innerHTML = `
            <div class="sports-markets-empty">
                No markets available.
            </div>
        `;

        return;
    }

    const enabledMarkets =
        game.enabled_markets &&
        typeof game.enabled_markets === "object"
            ? {
                ...game.enabled_markets
            }
            : {};

    container.innerHTML =
        data
            .map(
                market => {

                    const marketKey =
                        String(
                            market.market_key || ""
                        )
                        .trim();

                    const marketName =
                        String(
                            market.market_name || ""
                        )
                        .trim();

                    if (!marketKey) {
                        return "";
                    }

                    const isOn =
                        enabledMarkets[
                            marketKey
                        ] === true;

                    return `
                        <div
                            class="admin-market-item">

                            <span>
                                ${escapeAdminSportsHTML(
                                    marketName
                                )}
                            </span>

                            <button
                                type="button"
                                class="${
                                    isOn
                                        ? "market-on"
                                        : "market-off"
                                }"
                                data-market-key="${escapeAdminSportsJS(
                                    marketKey
                                )}"
                            >
                                ${
                                    isOn
                                        ? "ON"
                                        : "OFF"
                                }
                            </button>

                        </div>
                    `;
                }
            )
            .join("");

    // ==================================================
    // MARKET CLICK DIAGNOSTIC
    // ==================================================

    container.onclick = function (
        event
    ) {

        const button =
            event.target.closest(
                "button[data-market-key]"
            );

        if (!button) {
            return;
        }

        console.log(
            "🚨 MARKET BUTTON CLICKED:",
            {
                gameId:
                    game.game_id,

                marketKey:
                    button.getAttribute(
                        "data-market-key"
                    ),

                currentState:
                    button.classList.contains(
                        "market-on"
                    )
            }
        );

    };

    // ==================================================
    // LOADED
    // ==================================================

    console.log(
        "✅ ADMIN MASTER MARKETS LOADED:",
        {
            gameId:
                game.game_id,

            sport:
                sport,

            markets:
                data,

            enabledMarkets:
                enabledMarkets
        }
    );
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
async function (gameId) {

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

    const apiSportKeyInput =
    document.getElementById(
        "editSportsGameApiSportKey"
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


    if (gameIdInput) {

        gameIdInput.value =
            game.game_id || "";

    }

    if (apiSportKeyInput) {

    apiSportKeyInput.value =
        game.api_sport_key || "";

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


    window.activeSportsGameId =
        gameId;


  
// ==================================================
// LOAD API MARKETS FOR EDITOR
// ==================================================

await loadSportsApiMarkets(
    game
);


// ==================================================
// LOAD MASTER MARKETS FOR EDITOR
// ==================================================

await loadSportsEditMasterMarkets(
    game
);

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
// LOAD MASTER MARKETS FOR SPORTS GAME EDITOR
// ======================================================

async function loadSportsEditMasterMarkets(
    game
) {

    const container =
        document.getElementById(
            "editSportsMarketsContainer"
        );


    if (!container) {

        console.warn(
            "⚠️ Edit Sports Markets container not found."
        );

        return;

    }


    container.innerHTML = `
        <div class="sports-markets-loading">
            Loading markets...
        </div>
    `;


    if (!window.supabaseClient) {

        container.innerHTML = `
            <div class="sports-markets-empty">
                Supabase connection unavailable.
            </div>
        `;

        return;

    }


    const gameId =
        String(
            game?.game_id || ""
        ).trim();


    if (!gameId) {

        container.innerHTML = `
            <div class="sports-markets-empty">
                Game ID not found.
            </div>
        `;

        return;

    }


    // ==================================================
    // GET FRESH GAME DATA FROM SUPABASE
    // ==================================================

    const {
        data: freshGame,
        error: gameError
    } =
        await window.supabaseClient
            .from("sports_games")
            .select(
                "game_id, sport, enabled_markets"
            )
            .eq(
                "game_id",
                gameId
            )
            .maybeSingle();


    if (gameError) {

        console.error(
            "❌ Failed to load current game data:",
            gameError
        );

        container.innerHTML = `
            <div class="sports-markets-empty">
                Failed to load current game data.
            </div>
        `;

        return;

    }


    const currentGame =
        freshGame || game;


    const sport =
        String(
            currentGame?.sport || ""
        )
        .trim()
        .toLowerCase();


    if (!sport) {

        container.innerHTML = `
            <div class="sports-markets-empty">
                No sport selected.
            </div>
        `;

        return;

    }


    // ==================================================
    // LOAD MASTER MARKETS
    // ==================================================

    const {
        data,
        error
    } =
        await window.supabaseClient
            .from("sports_markets")
            .select(
                "market_key, market_name, enabled, display_order"
            )
            .eq(
                "sport",
                sport
            )
            .order(
                "display_order",
                {
                    ascending: true
                }
            );


    if (error) {

        console.error(
            "❌ Failed to load edit master markets:",
            error
        );

        container.innerHTML = `
            <div class="sports-markets-empty">
                Failed to load markets.
            </div>
        `;

        return;

    }


    if (
        !Array.isArray(data) ||
        data.length === 0
    ) {

        container.innerHTML = `
            <div class="sports-markets-empty">
                No markets available for this sport.
            </div>
        `;

        return;

    }


    // ==================================================
    // CURRENT SAVED MASTER MARKETS
    // ==================================================

    const enabledMarkets =
        currentGame?.enabled_markets &&
        typeof currentGame.enabled_markets === "object" &&
        !Array.isArray(
            currentGame.enabled_markets
        )
            ? {
                ...currentGame.enabled_markets
            }
            : {};


    // ==================================================
    // RENDER MASTER MARKET CHECKBOXES
    // ==================================================

    container.innerHTML =
        data
            .map(
                market => {

                    const marketKey =
                        String(
                            market.market_key || ""
                        )
                        .trim();


                    const marketName =
                        String(
                            market.market_name || ""
                        )
                        .trim();


                    if (!marketKey) {

                        return "";

                    }


                    const isChecked =
                        enabledMarkets[
                            marketKey
                        ] === true;


                    return `
                        <label
                            class="sports-market-toggle">

                            <span>
                                ${marketName}
                            </span>

                            <input
                                type="checkbox"
                                class="sports-edit-market-checkbox"
                                data-market-key="${marketKey}"
                                ${isChecked
                                    ? "checked"
                                    : ""}>

                        </label>
                    `;

                }
            )
            .join("");


    // ==================================================
    // UPDATE ADMIN GAME CACHE WITH FRESH STATE
    // ==================================================

    if (
        window.adminSportsGames &&
        window.adminSportsGames[gameId]
    ) {

        window.adminSportsGames[gameId] = {
            ...window.adminSportsGames[gameId],
            enabled_markets: {
                ...enabledMarkets
            }
        };

    }


    // ==================================================
    // DEBUG — CURRENT SAVED MARKET STATE
    // ==================================================

    console.log(
        "✅ EDIT MASTER MARKETS LOADED:",
        {
            sport,
            gameId,
            marketCount:
                data.length,
            enabledMarketKeys:
                Object.keys(
                    enabledMarkets
                ),
            enabledMarkets:
                JSON.parse(
                    JSON.stringify(
                        enabledMarkets
                    )
                )
        }
    );

}


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


    // ==================================================
    // EXISTING GAME DATA
    // ==================================================

    const existingGame =
        window.adminSportsGames &&
        window.adminSportsGames[gameId]
            ? window.adminSportsGames[gameId]
            : null;


    // ==================================================
    // API SPORT KEY
    // Keep the existing provider sport key.
    // Do NOT generate a random key here.
    // ==================================================

  const apiSportKey =
    existingGame &&
    existingGame.api_sport_key
        ? String(
            existingGame.api_sport_key
        ).trim()
        : "";


// ==================================================
// SELECTED MASTER MARKETS
// ==================================================

const enabledMarkets = {};

const marketsContainer =
    document.getElementById(
        "editSportsMarketsContainer"
    );

if (marketsContainer) {

    marketsContainer
        .querySelectorAll(
            "input.sports-edit-market-checkbox:checked"
        )
        .forEach(checkbox => {

            const marketKey =
                String(
                    checkbox.dataset.marketKey || ""
                ).trim();

            if (marketKey) {
                enabledMarkets[marketKey] = true;
            }

        });

}

console.log(
    "💾 SELECTED MASTER MARKETS:",
    enabledMarkets
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

    console.log(
    "🚨 BEFORE UPDATED GAME:",
    JSON.stringify(
        enabledMarkets,
        null,
        2
    )
);

console.log(
    "🚨 ENABLED MARKETS TYPE:",
    typeof enabledMarkets,
    Array.isArray(enabledMarkets)
);


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
                : true,

        enabled_markets:
        enabledMarkets,

        // ==============================================
        // PROVIDER SPORT KEY
        // ==============================================

        api_sport_key:
            apiSportKey

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
// TOGGLE ADMIN MASTER MARKET
// ======================================================

window.toggleAdminMasterMarket = async function (
    gameId,
    marketKey
) {

    console.log(
        "🚨 TOGGLE FUNCTION CALLED:",
        {
            gameId: gameId,
            marketKey: marketKey
        }
    );

    try {

        const game =
            window.adminSportsGames[gameId];

        if (!game) {
            console.error(
                "❌ ADMIN: Game not found:",
                gameId
            );
            return;
        }

        const safeMarketKey =
            String(
                marketKey || ""
            ).trim();

        if (!safeMarketKey) {
            console.error(
                "❌ ADMIN: Invalid market key:",
                marketKey
            );
            return;
        }

        // ==================================================
        // COPY CURRENT MASTER MARKETS
        // ==================================================

        const enabledMarkets = {
            ...(game.enabled_markets || {})
        };

        // ==================================================
        // TOGGLE MARKET LOCALLY
        // ==================================================

        if (
            enabledMarkets[safeMarketKey] === true
        ) {

            delete enabledMarkets[
                safeMarketKey
            ];

        } else {

            enabledMarkets[
                safeMarketKey
            ] = true;

        }

        // ==================================================
        // UPDATE LOCAL GAME STATE ONLY
        // ==================================================

        window.adminSportsGames[
            gameId
        ] = {
            ...game,
            enabled_markets:
                enabledMarkets
        };

        console.log(
            "🔄 ADMIN MASTER MARKET TOGGLED:",
            {
                gameId,
                marketKey:
                    safeMarketKey,
                enabledMarkets
            }
        );

        console.log(
    "🚨 AFTER TOGGLE LOCAL GAME:",
    JSON.stringify(
        window.adminSportsGames[gameId].enabled_markets,
        null,
        2
    )
);

        // ==================================================
        // REFRESH MASTER MARKET UI
        // ==================================================

        await loadAdminGameMasterMarkets(
            window.adminSportsGames[gameId]
        );

    } catch (error) {

        console.error(
            "❌ ADMIN MASTER MARKET TOGGLE ERROR:",
            error
        );

    }
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
