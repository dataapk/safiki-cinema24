// ======================================================
// VIRTUAL SPORTS ADMIN.JS
// ======================================================

console.log(
    "🚀 VIRTUALSPORTS-ADMIN.JS STARTED"
);


// ======================================================
// VIRTUAL SPORTS STATE
// ======================================================

window.adminVirtualSportsGames = {};

window.currentEditingVirtualSportsGame = null;

window.activeVirtualSportsGameId = null;

let currentVirtualSportsAdminSport = "cricket";


// ======================================================
// HELPERS
// ======================================================

function normalizeVirtualSport(
    sport
) {

    return String(
        sport || ""
    )
    .trim()
    .toLowerCase();

}


function normalizeVirtualStatus(
    status
) {

    return String(
        status || ""
    )
    .trim()
    .toLowerCase();

}


function normalizeVirtualMatchStatus(
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
    ].includes(value)
        ? value
        : "enable";

}


function escapeVirtualSportsHTML(
    value
) {

    return String(
        value ?? ""
    )
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}


function escapeVirtualSportsJS(
    value
) {

    return String(
        value ?? ""
    )
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r");

}


// ======================================================
// GRID ID
// ======================================================

function getVirtualSportsGridId(
    sport,
    status
) {

    const sportName =
        normalizeVirtualSport(
            sport
        );

    const statusName =
        normalizeVirtualStatus(
            status
        );


    const map = {

        cricket: {

            live:
                "adminVirtualCricketLiveGrid",

            upcoming:
                "adminVirtualCricketUpcomingGrid",

            featured:
                "adminVirtualCricketFeaturedGrid"

        },

        football: {

            live:
                "adminVirtualFootballLiveGrid",

            upcoming:
                "adminVirtualFootballUpcomingGrid",

            featured:
                "adminVirtualFootballFeaturedGrid"

        }

    };


    return (
        map[
            sportName
        ]?.[
            statusName
        ] || ""
    );

}


// ======================================================
// OPEN VIRTUAL SPORTS SPORT
// ======================================================

window.openVirtualSportsAdminSport =
function (sport) {

    const sportName =
        normalizeVirtualSport(
            sport
        );


    if (
        sportName !== "cricket" &&
        sportName !== "football"
    ) {

        return;

    }


    currentVirtualSportsAdminSport =
        sportName;


    const cricketSection =
        document.getElementById(
            "virtualCricketAdminSection"
        );


    const footballSection =
        document.getElementById(
            "virtualFootballAdminSection"
        );


    if (cricketSection) {

        cricketSection.style.display =
            sportName === "cricket"
                ? "block"
                : "none";

    }


    if (footballSection) {

        footballSection.style.display =
            sportName === "football"
                ? "block"
                : "none";

    }


    renderVirtualSportsGames(
        sportName,
        "live"
    );

    renderVirtualSportsGames(
        sportName,
        "upcoming"
    );

    renderVirtualSportsGames(
        sportName,
        "featured"
    );

};


// ======================================================
// SHOW LIVE
// ======================================================

window.openVirtualSportsLive =
function (sport) {

    showVirtualSportsStatus(
        sport,
        "live"
    );

};


// ======================================================
// SHOW UPCOMING
// ======================================================

window.openVirtualSportsUpcoming =
function (sport) {

    showVirtualSportsStatus(
        sport,
        "upcoming"
    );

};


// ======================================================
// SHOW FEATURED
// ======================================================

window.openVirtualSportsFeatured =
function (sport) {

    showVirtualSportsStatus(
        sport,
        "featured"
    );

};


// ======================================================
// STATUS TAB
// ======================================================

function showVirtualSportsStatus(
    sport,
    status
) {

    const sportName =
        normalizeVirtualSport(
            sport
        );


    const contentMap = {

        cricket: {

            live:
                "virtualCricketLive",

            upcoming:
                "virtualCricketUpcoming",

            featured:
                "virtualCricketFeatured"

        },

        football: {

            live:
                "virtualFootballLive",

            upcoming:
                "virtualFootballUpcoming",

            featured:
                "virtualFootballFeatured"

        }

    };


    const sportMap =
        contentMap[
            sportName
        ];


    if (!sportMap) return;


    Object.values(
        sportMap
    )
    .forEach(
        id => {

            const element =
                document.getElementById(
                    id
                );

            if (element) {

                element.style.display =
                    "none";

            }

        }
    );


    const active =
        document.getElementById(
            sportMap[
                status
            ]
        );


    if (active) {

        active.style.display =
            "block";

    }


    renderVirtualSportsGames(
        sportName,
        status
    );

}


// ======================================================
// RENDER GAMES
// ======================================================

function renderVirtualSportsGames(
    sport,
    status
) {

    const sportName =
        normalizeVirtualSport(
            sport
        );

    const statusName =
        normalizeVirtualStatus(
            status
        );


    const gridId =
        getVirtualSportsGridId(
            sportName,
            statusName
        );


    if (!gridId) return;


    const grid =
        document.getElementById(
            gridId
        );


    if (!grid) return;


    const games =
        Object.values(
            window.adminVirtualSportsGames || {}
        )
        .filter(
            game => {

                return (
                    normalizeVirtualSport(
                        game.sport
                    ) === sportName
                    &&
                    normalizeVirtualStatus(
                        game.status
                    ) === statusName
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
                        numeric: true,
                        sensitivity: "base"
                    }
                );

            }
        );


    if (
        games.length === 0
    ) {

        grid.innerHTML = `
            <p class="no-sports-games">
                No Virtual ${
                    sportName === "cricket"
                        ? "Cricket"
                        : "Football"
                } ${escapeVirtualSportsHTML(
                    statusName
                )} games available.
            </p>
        `;

        return;

    }


    grid.innerHTML =
        games
            .map(
                game =>
                    createVirtualSportsAdminCard(
                        game
                    )
            )
            .join("");

}


// ======================================================
// CREATE ADMIN CARD
// ======================================================

function createVirtualSportsAdminCard(
    game
) {

    const matchStatus =
        normalizeVirtualMatchStatus(
            game.match_status
        );


    return `

        <div
            class="match-card"
            data-game-id="${escapeVirtualSportsHTML(
                game.game_id
            )}"
        >

            <div class="admin-match-main">

                <!-- GAME ID -->

                <div class="admin-match-column">

                    <div class="admin-match-label">
                        ID
                    </div>

                    <div class="admin-match-value admin-game-id">

                        ${escapeVirtualSportsHTML(
                            game.game_id
                        )}

                    </div>

                </div>


                <!-- TITLE -->

                <div class="admin-match-column">

                    <div class="admin-match-label">
                        Title
                    </div>

                    <div class="admin-match-value">

                        ${escapeVirtualSportsHTML(
                            game.title || ""
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
                            ${escapeVirtualSportsHTML(
                                game.home_team || ""
                            )}
                        </span>

                        <strong>
                            VS
                        </strong>

                        <span>
                            ${escapeVirtualSportsHTML(
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

                    <div class="admin-match-value">

                        ${escapeVirtualSportsHTML(
                            game.status || ""
                        )}

                    </div>

                </div>


                <!-- MATCH STATUS -->

                <div class="admin-match-column">

                    <div class="admin-match-label">
                        Match Status
                    </div>

                    <div class="admin-match-value">

                        ${escapeVirtualSportsHTML(
                            matchStatus
                        )}

                    </div>

                </div>

            </div>


            <!-- EDIT -->

            <div class="admin-match-action">

                <button
                    type="button"
                    class="admin-edit-match-btn"
                    onclick="
                        openVirtualSportsGameEditor(
                            '${escapeVirtualSportsJS(
                                game.game_id
                            )}'
                        )
                    "
                >

                    ✏️ Edit Match

                </button>

            </div>

        </div>

    `;

}


// ======================================================
// ADD NEW GAME
// ======================================================

window.openVirtualSportsAddGame =
function (sport) {

    const sportName =
        normalizeVirtualSport(
            sport
        );


    if (
        sportName !== "cricket" &&
        sportName !== "football"
    ) {

        return;

    }


    const gameId =
        "virtual-" +
        sportName +
        "-" +
        Date.now();


    const newGame = {

        game_id:
            gameId,

        sport:
            sportName,

        title:
            "",

        status:
            "upcoming",

        match_status:
            "enable",

        home_team:
            "",

        away_team:
            ""

    };


    window.adminVirtualSportsGames[
        gameId
    ] = newGame;


    window.currentEditingVirtualSportsGame =
        newGame;

    window.activeVirtualSportsGameId =
        gameId;


    setVirtualSportsEditorValues(
        newGame
    );


    const modal =
        document.getElementById(
            "virtualSportsGameEditModal"
        );


    if (modal) {

        modal.style.display =
            "flex";

    }

};


// ======================================================
// SET EDITOR VALUES
// ======================================================

function setVirtualSportsEditorValues(
    game
) {

    const gameId =
        document.getElementById(
            "editVirtualGameId"
        );

    const title =
        document.getElementById(
            "editVirtualGameTitle"
        );

    const status =
        document.getElementById(
            "editVirtualGameStatus"
        );

    const matchStatus =
        document.getElementById(
            "editVirtualGameMatchStatus"
        );

    const home =
        document.getElementById(
            "editVirtualGameHome"
        );

    const away =
        document.getElementById(
            "editVirtualGameAway"
        );


    if (gameId) {

        gameId.value =
            game.game_id || "";

    }


    if (title) {

        title.value =
            game.title || "";

    }


    if (status) {

        status.value =
            normalizeVirtualStatus(
                game.status
            );

    }


    if (matchStatus) {

        matchStatus.value =
            normalizeVirtualMatchStatus(
                game.match_status
            );

    }


    if (home) {

        home.value =
            game.home_team || "";

    }


    if (away) {

        away.value =
            game.away_team || "";

    }

}


// ======================================================
// OPEN EDITOR
// ======================================================

window.openVirtualSportsGameEditor =
function (gameId) {

    const game =
        window.adminVirtualSportsGames[
            gameId
        ];


    if (!game) {

        alert(
            "Virtual Sports game not found."
        );

        return;

    }


    window.currentEditingVirtualSportsGame =
        game;


    window.activeVirtualSportsGameId =
        gameId;


    setVirtualSportsEditorValues(
        game
    );


    const modal =
        document.getElementById(
            "virtualSportsGameEditModal"
        );


    if (modal) {

        modal.style.display =
            "flex";

    }

};


// ======================================================
// CLOSE EDITOR
// ======================================================

window.closeVirtualSportsEditor =
function () {

    const modal =
        document.getElementById(
            "virtualSportsGameEditModal"
        );


    if (modal) {

        modal.style.display =
            "none";

    }


    window.currentEditingVirtualSportsGame =
        null;

    window.activeVirtualSportsGameId =
        null;

};


// ======================================================
// SAVE GAME
// ======================================================

window.saveVirtualSportsGameChanges =
async function () {

    const gameId =
        document.getElementById(
            "editVirtualGameId"
        )?.value.trim();


    const title =
        document.getElementById(
            "editVirtualGameTitle"
        )?.value.trim();


    const status =
        normalizeVirtualStatus(
            document.getElementById(
                "editVirtualGameStatus"
            )?.value
        );


    const matchStatus =
        normalizeVirtualMatchStatus(
            document.getElementById(
                "editVirtualGameMatchStatus"
            )?.value
        );


    const homeTeam =
        document.getElementById(
            "editVirtualGameHome"
        )?.value.trim();


    const awayTeam =
        document.getElementById(
            "editVirtualGameAway"
        )?.value.trim();


    if (!gameId) {

        alert(
            "Game ID is missing."
        );

        return;

    }


    if (!title || !homeTeam || !awayTeam) {

        alert(
            "Please fill in all game information."
        );

        return;

    }


    if (![
        "live",
        "upcoming",
        "featured"
    ].includes(status)) {

        alert(
            "Please select a valid game status."
        );

        return;

    }


    if (![
        "enable",
        "disable",
        "reject"
    ].includes(matchStatus)) {

        alert(
            "Please select a valid match status."
        );

        return;

    }


    if (!window.supabaseClient) {

        alert(
            "Supabase connection unavailable."
        );

        return;

    }


    const updatedGame = {

        game_id:
            gameId,

        sport:
            normalizeVirtualSport(
                currentVirtualSportsAdminSport
            ),

        title:
            title,

        status:
            status,

        match_status:
            matchStatus,

        home_team:
            homeTeam,

        away_team:
            awayTeam

    };


    const {
        data,
        error
    } =
        await window.supabaseClient
            .from(
                "virtual_sports_games"
            )
            .upsert(
                updatedGame,
                {
                    onConflict:
                        "game_id"
                }
            )
            .select()
            .single();


    if (error) {

        console.error(
            "❌ Virtual Sports save failed:",
            error
        );

        alert(
            "Failed to save Virtual Sports game.\n\n" +
            error.message
        );

        return;

    }


    window.adminVirtualSportsGames[
        gameId
    ] = data;


    closeVirtualSportsEditor();


    renderVirtualSportsGames(
        data.sport,
        data.status
    );


    alert(
        "✅ Virtual Sports game saved successfully!"
    );

};


// ======================================================
// DELETE GAME
// ======================================================

window.confirmDeleteVirtualSportsGame =
async function () {

    const gameId =
        window.activeVirtualSportsGameId;


    if (!gameId) {

        return;

    }


    const confirmed =
        confirm(
            "Delete this Virtual Sports game?"
        );


    if (!confirmed) {

        return;

    }


    if (!window.supabaseClient) {

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
                "virtual_sports_games"
            )
            .delete()
            .eq(
                "game_id",
                gameId
            );


    if (error) {

        console.error(
            "❌ Virtual Sports delete failed:",
            error
        );

        alert(
            "Failed to delete game.\n\n" +
            error.message
        );

        return;

    }


    delete window.adminVirtualSportsGames[
        gameId
    ];


    closeVirtualSportsEditor();


    renderVirtualSportsGames(
        currentVirtualSportsAdminSport,
        "live"
    );

    renderVirtualSportsGames(
        currentVirtualSportsAdminSport,
        "upcoming"
    );

    renderVirtualSportsGames(
        currentVirtualSportsAdminSport,
        "featured"
    );


    alert(
        "🗑 Virtual Sports game deleted."
    );

};


// ======================================================
// LOAD VIRTUAL SPORTS GAMES
// ======================================================

window.loadVirtualSportsAdminGames =
async function () {

    if (!window.supabaseClient) {

        console.error(
            "❌ Supabase client unavailable."
        );

        return;

    }


    const {
        data,
        error
    } =
        await window.supabaseClient
            .from(
                "virtual_sports_games"
            )
            .select("*")
            .order(
                "created_at",
                {
                    ascending:
                        true
                }
            );


    if (error) {

        console.error(
            "❌ Virtual Sports games load failed:",
            error
        );

        return;

    }


    window.adminVirtualSportsGames = {};


    (data || [])
        .forEach(
            game => {

                window.adminVirtualSportsGames[
                    game.game_id
                ] = game;

            }
        );


    renderVirtualSportsGames(
        "cricket",
        "live"
    );

    renderVirtualSportsGames(
        "cricket",
        "upcoming"
    );

    renderVirtualSportsGames(
        "cricket",
        "featured"
    );

    renderVirtualSportsGames(
        "football",
        "live"
    );

    renderVirtualSportsGames(
        "football",
        "upcoming"
    );

    renderVirtualSportsGames(
        "football",
        "featured"
    );

};


// ======================================================
// INITIALIZE
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadVirtualSportsAdminGames();

    }
);


// ======================================================
// END
// ======================================================
