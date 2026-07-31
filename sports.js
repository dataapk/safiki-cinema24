// ============================================
// CRICKET EVENTS — FULL PAGE VIEW (JS ONLY)
// ============================================

(function() {
    'use strict';

    // ============================================
    // CONFIGURATION
    // ============================================
    const CONFIG = {
        streamLoadDelay: 1500,          // Fake loading delay (ms) — adjust or remove when API ready
        commentaryInterval: 8000,       // Live ticker refresh (ms)
        enableConsoleLogs: true,        // Set false in production
        apiEndpoints: {
            liveStream: '/api/cricket/live-stream',
            matchData: '/api/cricket/match-data',
            odds: '/api/cricket/odds',
            commentary: '/api/cricket/commentary'
        }
    };

    // ============================================
    // UTILITY FUNCTIONS
    // ============================================
    const log = (...args) => CONFIG.enableConsoleLogs && console.log('[Cricket]', ...args);
    const $ = (selector) => document.querySelector(selector);
    const $$ = (selector) => document.querySelectorAll(selector);

    // ============================================
    // STATE MANAGEMENT
    // ============================================
    const State = {
        currentMatchId: null,
        currentLeague: null,
        isStreamLoading: false,
        activeMarkets: new Set(),
        selectedBets: [],
        commentaryTimer: null,
        streamTimer: null,

        reset() {
            this.currentMatchId = null;
            this.currentLeague = null;
            this.isStreamLoading = false;
            this.activeMarkets.clear();
            this.selectedBets = [];
            clearInterval(this.commentaryTimer);
            clearTimeout(this.streamTimer);
        }
    };

    // ============================================
    // PAGE NAVIGATION
    // ============================================

    /**
     * Open Cricket Events Full Page View
     * Call this from your existing onclick="openSportsGame('cricket', 'cricket-live-1')"
     */
    window.openSportsGame = function(league, matchId) {
        log('Opening cricket event:', league, matchId);

        State.reset();
        State.currentLeague = league;
        State.currentMatchId = matchId;

        // Hide trending/previous page content
        hidePreviousPage();

        // Show cricket events page
        const page = $('#cricket-events-page');
        if (page) {
            page.style.display = 'block';
            document.body.scrollTop = 0;
            document.documentElement.scrollTop = 0;
        }

        // Initialize all modules
        initLiveStream(matchId);
        initMatchInfo(matchId);
        initBettingMarkets(matchId);
        initLiveCommentary(matchId);
    };

    /**
     * Back Button — Return to previous page
     */
    window.backToTrending = function() {
        log('Going back to trending/previous page');

        State.reset();

        const page = $('#cricket-events-page');
        if (page) {
            page.style.display = 'none';
        }

        showPreviousPage();
    };

    // ============================================
    // LIVE STREAM MODULE (Smooth Loading)
    // ============================================

    function initLiveStream(matchId) {
        const loader = $('#stream-loader');
        const player = $('#stream-player');
        const offline = $('#stream-offline');
        const iframe = $('#cricket-live-iframe');

        if (!loader || !player || !offline) return;

        // Reset states
        loader.style.display = 'flex';
        player.style.display = 'none';
        offline.style.display = 'none';
        State.isStreamLoading = true;

        // ========================================
        // [API INTEGRATION POINT]
        // Replace this setTimeout with your actual API call
        // ========================================
        State.streamTimer = setTimeout(() => {
            fetchLiveStreamUrl(matchId)
                .then(streamData => {
                    loader.style.display = 'none';
                    State.isStreamLoading = false;

                    if (streamData && streamData.url) {
                        // Stream available — load it
                        if (iframe) iframe.src = streamData.url;
                        player.style.display = 'block';
                        log('Live stream loaded for match:', matchId);
                    } else {
                        // No stream — show offline message
                        offline.style.display = 'flex';
                        log('No stream available for match:', matchId);
                    }
                })
                .catch(err => {
                    loader.style.display = 'none';
                    offline.style.display = 'flex';
                    State.isStreamLoading = false;
                    log('Stream load error:', err);
                });
        }, CONFIG.streamLoadDelay);
    }

    /**
     * [API PLACEHOLDER]
     * Fetch live stream URL from your backend
     */
    function fetchLiveStreamUrl(matchId) {
        // ========================================
        // TODO: Replace with actual fetch()
        // ========================================
        return new Promise((resolve) => {
            // Demo response — replace with:
            // fetch(`${CONFIG.apiEndpoints.liveStream}?matchId=${matchId}`)
            //   .then(r => r.json())
            resolve({
                url: '', // Set actual stream URL here, empty = offline
                quality: '720p',
                latency: 'low'
            });
        });
    }

    // ============================================
    // MATCH INFO MODULE
    // ============================================

    function initMatchInfo(matchId) {
        fetchMatchData(matchId)
            .then(data => {
                updateMatchInfoUI(data);
            })
            .catch(err => {
                log('Match data error:', err);
            });
    }

    function updateMatchInfoUI(data) {
        // Update teams
        const homeTeam = $('.team-home');
        const awayTeam = $('.team-away');
        const scoreRuns = $('.score-runs');
        const scoreWickets = $('.score-wickets');
        const scoreOvers = $('.score-overs');

        if (homeTeam && data.homeTeam) homeTeam.textContent = data.homeTeam;
        if (awayTeam && data.awayTeam) awayTeam.textContent = data.awayTeam;
        if (scoreRuns && data.runs !== undefined) scoreRuns.textContent = data.runs;
        if (scoreWickets && data.wickets !== undefined) scoreWickets.textContent = '/' + data.wickets;
        if (scoreOvers && data.overs !== undefined) scoreOvers.textContent = '(' + data.overs + ' ov)';
    }

    /**
     * [API PLACEHOLDER]
     * Fetch live match score & info
     */
    function fetchMatchData(matchId) {
        // ========================================
        // TODO: Replace with actual fetch()
        // ========================================
        return new Promise((resolve) => {
            resolve({
                homeTeam: 'Bangladesh',
                awayTeam: 'India',
                runs: 142,
                wickets: 3,
                overs: 18.4,
                status: 'live',
                matchId: matchId
            });
        });
    }

    // ============================================
    // BETTING MARKETS MODULE
    // ============================================

    function initBettingMarkets(matchId) {
        // Collapse all markets initially
        $$('.betting-market-card').forEach(card => {
            const options = card.querySelector('.market-options');
            const toggle = card.querySelector('.market-toggle');
            if (options) options.style.display = 'none';
            if (toggle) toggle.textContent = '▶';
        });

        // Attach click handlers to market headers
        $$('.market-header').forEach(header => {
            header.addEventListener('click', function() {
                toggleMarket(this);
            });
        });

        // Attach click handlers to bet buttons
        $$('.bet-option-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                handleBetSelection(this);
            });
        });

        // Load odds from API
        fetchOddsData(matchId)
            .then(data => {
                updateOddsUI(data);
            })
            .catch(err => {
                log('Odds data error:', err);
            });
    }

    function toggleMarket(header) {
        const card = header.closest('.betting-market-card');
        if (!card) return;

        const options = card.querySelector('.market-options');
        const toggle = header.querySelector('.market-toggle');
        const marketName = header.querySelector('.market-name')?.textContent || '';

        if (!options || !toggle) return;

        const isOpen = options.style.display === 'block';

        if (isOpen) {
            options.style.display = 'none';
            toggle.textContent = '▶';
            State.activeMarkets.delete(marketName);
        } else {
            options.style.display = 'block';
            toggle.textContent = '▼';
            State.activeMarkets.add(marketName);
        }
    }

    function handleBetSelection(btn) {
        const teamName = btn.querySelector('.bet-team-name')?.textContent || '';
        const odds = btn.querySelector('.bet-odds')?.textContent || '';
        const marketCard = btn.closest('.betting-market-card');
        const marketName = marketCard?.querySelector('.market-name')?.textContent || '';

        // Toggle selection
        const isSelected = btn.classList.contains('selected');

        // Deselect all in same market (single selection per market)
        if (marketCard) {
            marketCard.querySelectorAll('.bet-option-btn').forEach(b => b.classList.remove('selected'));
        }

        if (!isSelected) {
            btn.classList.add('selected');

            const bet = {
                market: marketName,
                selection: teamName,
                odds: odds,
                matchId: State.currentMatchId,
                timestamp: new Date().toISOString()
            };

            // Remove previous selection from same market
            State.selectedBets = State.selectedBets.filter(b => b.market !== marketName);
            State.selectedBets.push(bet);

            log('Bet selected:', bet);
            onBetPlaced(bet);
        } else {
            State.selectedBets = State.selectedBets.filter(b => b.market !== marketName);
            log('Bet deselected from:', marketName);
        }
    }

    function updateOddsUI(data) {
        // ========================================
        // TODO: Map API odds data to DOM elements
        // ========================================
        // Example: Update all .bet-odds spans with real values
        log('Odds updated:', data);
    }

    /**
     * [API PLACEHOLDER]
     * Fetch betting odds
     */
    function fetchOddsData(matchId) {
        return new Promise((resolve) => {
            resolve({
                matchWinner: { team1: 1.85, draw: 3.40, team2: 2.10 },
                totalRuns: { over: 1.90, under: 1.90, line: 320.5 },
                firstOver: { over: 1.95, under: 1.85, line: 7.5 }
            });
        });
    }

    /**
     * Callback when user selects a bet
     * Connect to your bet slip / cart system here
     */
    function onBetPlaced(bet) {
        // ========================================
        // TODO: Integrate with your bet slip
        // ========================================
        // Example: window.addToBetSlip(bet);
        log('Bet ready for slip:', bet);
    }

    // ============================================
    // LIVE COMMENTARY TICKER
    // ============================================

    function initLiveCommentary(matchId) {
        updateCommentary(); // First load

        State.commentaryTimer = setInterval(() => {
            updateCommentary();
        }, CONFIG.commentaryInterval);
    }

    function updateCommentary() {
        fetchCommentary(State.currentMatchId)
            .then(data => {
                const container = $('#live-commentary');
                if (!container || !data.lines) return;

                container.innerHTML = '';
                data.lines.forEach(line => {
                    const p = document.createElement('p');
                    p.textContent = line;
                    container.appendChild(p);
                });
            })
            .catch(err => {
                log('Commentary error:', err);
            });
    }

    /**
     * [API PLACEHOLDER]
     * Fetch live commentary lines
     */
    function fetchCommentary(matchId) {
        return new Promise((resolve) => {
            resolve({
                lines: [
                    '18.4 — SIX! What a shot over mid-wicket!',
                    '18.3 — Dot ball, good length delivery.',
                    '18.2 — Single taken, rotated the strike well.'
                ]
            });
        });
    }

    // ============================================
    // PAGE VISIBILITY HELPERS
    // ============================================

    function hidePreviousPage() {
        // ========================================
        // TODO: Add your existing page container IDs here
        // ========================================
        const pagesToHide = [
            '#trending-page',
            '#sports-list-page',
            '#home-page'
            // Add more as needed
        ];

        pagesToHide.forEach(id => {
            const el = $(id);
            if (el) el.style.display = 'none';
        });
    }

    function showPreviousPage() {
        // ========================================
        // TODO: Add your default page ID here
        // ========================================
        const pagesToShow = [
            '#trending-page',
            '#sports-list-page'
            // Add more as needed
        ];

        pagesToShow.forEach(id => {
            const el = $(id);
            if (el) el.style.display = 'block';
        });
    }

    // ============================================
    // STREAM BOX SMOOTH LOADING (Network Handler)
    // ============================================

    /**
     * Call this if you want to manually retry stream load
     * e.g., onclick="retryStream()"
     */
    window.retryStream = function() {
        if (State.currentMatchId) {
            initLiveStream(State.currentMatchId);
        }
    };

    /**
     * Check network status and adjust stream quality
     */
    function handleNetworkChange() {
        const isOnline = navigator.onLine;
        log('Network status:', isOnline ? 'online' : 'offline');

        if (!isOnline) {
            const loader = $('#stream-loader');
            const player = $('#stream-player');
            const offline = $('#stream-offline');

            if (loader) loader.style.display = 'none';
            if (player) player.style.display = 'none';
            if (offline) offline.style.display = 'flex';
        }
    }

    // Listen for network changes
    window.addEventListener('online', handleNetworkChange);
    window.addEventListener('offline', handleNetworkChange);

    // ============================================
    // INITIALIZATION
    // ============================================

    document.addEventListener('DOMContentLoaded', function() {
        log('Cricket Events JS loaded successfully');

        // Ensure cricket page is hidden on first load
        const page = $('#cricket-events-page');
        if (page) page.style.display = 'none';
    });

})();
