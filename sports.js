// ============================================
// SPORTS.JS — FULL CRICKET EVENTS SYSTEM
// Live | Upcoming | Featured — One Template
// ============================================

(function() {
    'use strict';

    // ============================================
    // 1. CONFIGURATION
    // ============================================
    const CONFIG = {
        enableLogs: true,
        streamLoadDelay: 1500,      // Demo delay — remove when API ready
        countdownInterval: 1000,    // 1 second tick
        commentaryInterval: 8000,   // 8 seconds for live ticker
        apiBase: '/api/cricket',    // [API: Your endpoint base]
    };

    const log = (...args) => CONFIG.enableLogs && console.log('[Sports]', ...args);
    const $  = (sel) => document.querySelector(sel);
    const $$ = (sel) => document.querySelectorAll(sel);

    // ============================================
    // 2. DEMO DATA — [API: Replace with fetch()]
    // ============================================
    const MATCH_DB = {
        // 🔴 LIVE (2)
        'cricket-live-1': {
            type: 'live',
            title: '🏏 Bangladesh vs India',
            home: 'Bangladesh',
            away: 'India',
            runs: 142,
            wickets: 3,
            overs: '18.4',
            tournament: 'T20 World Cup',
            streamUrl: '', // [API: Live stream URL]
            statusText: 'LIVE',
            commentary: [
                '18.4 — SIX! Over mid-wicket!',
                '18.3 — Dot ball, good length.',
                '18.2 — Single taken, strike rotated.'
            ]
        },
        'cricket-live-2': {
            type: 'live',
            title: '🏏 Australia vs Pakistan',
            home: 'Australia',
            away: 'Pakistan',
            runs: 198,
            wickets: 2,
            overs: '22.1',
            tournament: 'ODI Series',
            streamUrl: '',
            statusText: 'LIVE',
            commentary: [
                '22.1 — FOUR! Through the covers!',
                '22.0 — Wide ball signaled.',
                '21.6 — Wicket! Caught behind!'
            ]
        },

        // 🟡 UPCOMING (2) — startTime = Unix timestamp (ms)
        'cricket-upcoming-1': {
            type: 'upcoming',
            title: '🏏 England vs New Zealand',
            home: 'England',
            away: 'New Zealand',
            tournament: 'Test Series',
            startTime: Date.now() + 1000 * 60 * 45, // 45 mins from now (demo)
            statusText: 'UPCOMING',
            specialNote: 'High stakes series decider'
        },
        'cricket-upcoming-2': {
            type: 'upcoming',
            title: '🏏 South Africa vs West Indies',
            home: 'South Africa',
            away: 'West Indies',
            tournament: 'T20 Blast',
            startTime: Date.now() + 1000 * 60 * 120, // 2 hours from now (demo)
            statusText: 'UPCOMING',
            specialNote: 'Top of the table clash'
        },

        // ⭐ FEATURED (2)
        'cricket-featured-1': {
            type: 'featured',
            title: '🏏 India vs Australia',
            home: 'India',
            away: 'Australia',
            tournament: 'World Cup Final',
            statusText: 'FEATURED',
            specialNote: '🏆 Most popular match today — 500K+ bets placed'
        },
        'cricket-featured-2': {
            type: 'featured',
            title: '🏏 Pakistan vs England',
            home: 'Pakistan',
            away: 'England',
            tournament: 'Champions Trophy',
            statusText: 'FEATURED',
            specialNote: '🔥 Trending worldwide — High odds available'
        }
    };

    // ============================================
    // 3. STATE
    // ============================================
    const State = {
        currentMatchId: null,
        countdownTimer: null,
        commentaryTimer: null,
        streamTimer: null,

        reset() {
            this.currentMatchId = null;
            clearInterval(this.commentaryTimer);
            clearTimeout(this.streamTimer);
        }
    };

    // ============================================
    // 4. OPEN MATCH FULL PAGE
    // ============================================
    window.openMatch = function(matchId) {
        log('Opening match:', matchId);

        const data = MATCH_DB[matchId];
        if (!data) {
            alert('Match data not found: ' + matchId);
            return;
        }

        State.reset();
        State.currentMatchId = matchId;

        // Hide sports list
        const listPage = $('#sports-main-content') || $('#main-content') || $('main');
        if (listPage) listPage.style.display = 'none';

        // Show full page
        const fullPage = $('#match-fullpage');
        if (fullPage) {
            fullPage.style.display = 'block';
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        // Setup page based on type
        setupFullPage(matchId, data);

        // Update URL (fake navigation)
        history.pushState({ page: 'match', matchId: matchId }, '', '#match=' + matchId);
    };

    // ============================================
    // 5. SETUP FULL PAGE (Live / Upcoming / Featured)
    // ============================================
    function setupFullPage(matchId, data) {
        // Header title
        const titleEl = $('#fullpage-title');
        if (titleEl) titleEl.textContent = data.title || '🏏 Cricket Match';

        // Type-specific sections
        const liveSection     = $('#fullpage-live-stream');
        const upcomingSection = $('#fullpage-upcoming-info');
        const featuredSection = $('#fullpage-featured-banner');
        const commentarySection = $('#fullpage-commentary-section');

        // Hide all type sections first
        if (liveSection) liveSection.style.display = 'none';
        if (upcomingSection) upcomingSection.style.display = 'none';
        if (featuredSection) featuredSection.style.display = 'none';
        if (commentarySection) commentarySection.style.display = 'none';

        // Show based on type
        if (data.type === 'live') {
            if (liveSection) liveSection.style.display = 'block';
            if (commentarySection) commentarySection.style.display = 'block';
            initLiveStream(data.streamUrl || '');
            initLiveCommentary(data.commentary || []);
        }
        else if (data.type === 'upcoming') {
            if (upcomingSection) upcomingSection.style.display = 'block';
            initUpcomingCountdown(matchId, data.startTime);
        }
        else if (data.type === 'featured') {
            if (featuredSection) featuredSection.style.display = 'block';
            // Featured may also have stream if live — optional
            if (data.streamUrl) {
                if (liveSection) liveSection.style.display = 'block';
                initLiveStream(data.streamUrl);
            }
        }

        // Common: Match Info Bar
        updateMatchInfoBar(data);

        // Common: Reset markets
        $$('.betting-market-card').forEach(card => {
            const opts = card.querySelector('.market-options');
            const toggle = card.querySelector('.market-toggle');
            if (opts) opts.style.display = 'none';
            if (toggle) toggle.textContent = '▶';
        });

        // Clear previous bet selections
        $$('.bet-option-btn').forEach(btn => btn.classList.remove('selected'));
    }

    // ============================================
    // 6. BACK TO SPORTS LIST
    // ============================================
    window.backToSportsList = function() {
        log('Going back to list');

        State.reset();

        const fullPage = $('#match-fullpage');
        if (fullPage) fullPage.style.display = 'none';

        const listPage = $('#sports-main-content') || $('#main-content') || $('main');
        if (listPage) listPage.style.display = 'block';

        history.pushState({ page: 'list' }, '', window.location.pathname);
    };

    // ============================================
    // 7. MATCH INFO BAR (Common for all types)
    // ============================================
    function updateMatchInfoBar(data) {
        const homeEl    = $('#fp-team-home');
        const awayEl    = $('#fp-team-away');
        const runsEl    = $('#fp-runs');
        const wicketsEl = $('#fp-wickets');
        const oversEl   = $('#fp-overs');
        const statusDot = $('#status-dot');
        const statusText = $('#status-text');

        if (homeEl)    homeEl.textContent = data.home || 'Team A';
        if (awayEl)    awayEl.textContent = data.away || 'Team B';
        if (runsEl)    runsEl.textContent = data.runs !== undefined ? data.runs : '—';
        if (wicketsEl) wicketsEl.textContent = data.wickets !== undefined ? '/' + data.wickets : '';
        if (oversEl)   oversEl.textContent = data.overs ? '(' + data.overs + ' ov)' : '';

        if (statusText) statusText.textContent = data.statusText || '';

        // Status dot color
        if (statusDot) {
            if (data.type === 'live') {
                statusDot.style.color = '#ff2e2e';
                statusDot.style.animation = 'livePulse 1.5s ease-in-out infinite';
            } else if (data.type === 'upcoming') {
                statusDot.style.color = '#ffc107';
                statusDot.style.animation = 'none';
            } else {
                statusDot.style.color = '#e94560';
                statusDot.style.animation = 'none';
            }
        }
    }

    // ============================================
    // 8. LIVE STREAM MODULE (Smooth Loading)
    // ============================================
    function initLiveStream(url) {
        const loader  = $('#stream-loader');
        const player  = $('#stream-player');
        const offline = $('#stream-offline');
        const iframe  = $('#cricket-live-iframe');

        if (!loader || !player || !offline) return;

        loader.style.display = 'flex';
        player.style.display = 'none';
        offline.style.display = 'none';
        if (iframe) iframe.src = '';

        // [API: Replace setTimeout with real fetch]
        State.streamTimer = setTimeout(() => {
            loader.style.display = 'none';

            if (url && url.trim() !== '') {
                if (iframe) iframe.src = url;
                player.style.display = 'block';
                log('Stream loaded');
            } else {
                offline.style.display = 'flex';
                log('Stream offline (no URL)');
            }
        }, CONFIG.streamLoadDelay);
    }

    // ============================================
    // 9. LIVE COMMENTARY TICKER
    // ============================================
    function initLiveCommentary(lines) {
        const container = $('#live-commentary');
        if (!container) return;

        let index = 0;
        const update = () => {
            if (!lines.length) return;
            const p = document.createElement('p');
            p.textContent = lines[index % lines.length];
            p.style.animation = 'fadeIn 0.4s ease';
            container.prepend(p);
            if (container.children.length > 5) {
                container.lastElementChild.remove();
            }
            index++;
        };

        update();
        State.commentaryTimer = setInterval(update, CONFIG.commentaryInterval);
    }

    // ============================================
    // 10. UPCOMING COUNTDOWN (List + Full Page)
    // ============================================
    function initUpcomingCountdown(matchId, startTime) {
        const fullPageTimer = $('#fullpage-countdown');

        function tick() {
            const now = Date.now();
            const diff = startTime - now;

            // Format time
            let display = '';
            if (diff <= 0) {
                display = '00:00:00';
                promoteToLive(matchId);
                return;
            } else {
                const h = Math.floor(diff / 3600000);
                const m = Math.floor((diff % 3600000) / 60000);
                const s = Math.floor((diff % 60000) / 1000);
                display = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
            }

            // Update list item countdown
            const listTimer = $(`#countdown-${matchId}`);
            if (listTimer) listTimer.textContent = display;

            // Update full page countdown if this match is open
            if (State.currentMatchId === matchId && fullPageTimer) {
                fullPageTimer.textContent = display;
            }
        }

        tick(); // immediate
        if (!State.countdownTimer) {
            State.countdownTimer = setInterval(() => {
                // Tick all upcoming
                $$('.upcoming-item').forEach(item => {
                    const id = item.dataset.matchId;
                    const data = MATCH_DB[id];
                    if (data && data.type === 'upcoming') {
                        const now = Date.now();
                        const diff = data.startTime - now;
                        const listTimer = $(`#countdown-${id}`);
                        if (listTimer) {
                            if (diff <= 0) {
                                listTimer.textContent = '00:00:00';
                                promoteToLive(id);
                            } else {
                                const h = Math.floor(diff / 3600000);
                                const m = Math.floor((diff % 3600000) / 60000);
                                const s = Math.floor((diff % 60000) / 1000);
                                listTimer.textContent = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
                            }
                        }
                    }
                });
            }, CONFIG.countdownInterval);
        }
    }

    // ============================================
    // 11. AUTO-PROMOTE UPCOMING → LIVE
    // ============================================
    function promoteToLive(matchId) {
        const data = MATCH_DB[matchId];
        if (!data || data.type !== 'upcoming') return;

        log('Promoting to LIVE:', matchId);

        // Update data
        data.type = 'live';
        data.statusText = 'LIVE';
        data.streamUrl = ''; // [API: Fetch real stream URL]
        data.runs = 0;
        data.wickets = 0;
        data.overs = '0.0';
        data.commentary = ['Match has started!', 'Toss completed.', 'Play begins...'];

        // Move DOM element from Upcoming section to Live section
        const item = $(`.sports-league-item[data-match-id="${matchId}"]`);
        if (item) {
            // Remove countdown box
            const countdownBox = item.querySelector('.event-countdown-box');
            if (countdownBox) countdownBox.remove();

            // Add LIVE badge
            const header = item.querySelector('.league-header');
            if (header) {
                header.insertAdjacentHTML('beforeend', '<span class="event-live-badge">● LIVE</span>');
                header.setAttribute('onclick', `openMatch('${matchId}')`);
            }

            // Move to Live section
            const liveSection = $('#section-live');
            if (liveSection) liveSection.appendChild(item);

            // Remove upcoming class
            item.classList.remove('upcoming-item');
            item.classList.add('live-item');
        }

        // If full page is open for this match, refresh it
        if (State.currentMatchId === matchId) {
            setupFullPage(matchId, data);
        }
    }

    // ============================================
    // 12. BETTING MARKET TOGGLE
    // ============================================
    window.toggleMarket = function(header) {
        const card = header.closest('.betting-market-card');
        if (!card) return;

        const options = card.querySelector('.market-options');
        const toggle = card.querySelector('.market-toggle');

        if (!options || !toggle) return;

        const isOpen = options.style.display === 'grid' || options.style.display === 'block';

        if (isOpen) {
            options.style.display = 'none';
            toggle.textContent = '▶';
        } else {
            options.style.display = 'grid';
            toggle.textContent = '▼';
        }
    };

    // ============================================
    // 13. BET SELECTION
    // ============================================
    window.selectBet = function(btn) {
        const marketCard = btn.closest('.betting-market-card');
        const marketName = marketCard?.querySelector('.market-name')?.textContent || 'Unknown';
        const teamName   = btn.querySelector('.bet-team-name')?.textContent || '';
        const odds       = btn.querySelector('.bet-odds')?.textContent || '';

        // Deselect others in same market
        if (marketCard) {
            marketCard.querySelectorAll('.bet-option-btn').forEach(b => b.classList.remove('selected'));
        }

        // Toggle
        if (btn.classList.contains('selected')) {
            btn.classList.remove('selected');
            log('Bet removed:', marketName);
        } else {
            btn.classList.add('selected');
            const bet = {
                matchId: State.currentMatchId,
                market: marketName,
                selection: teamName,
                odds: odds,
                time: new Date().toISOString()
            };
            log('Bet placed:', bet);
            // [API: Send to bet slip / cart]
            // window.addToBetSlip && window.addToBetSlip(bet);
        }
    };

    // ============================================
    // 14. BROWSER BACK BUTTON SUPPORT
    // ============================================
    window.addEventListener('popstate', function(e) {
        if (e.state && e.state.page === 'list') {
            const fullPage = $('#match-fullpage');
            const listPage = $('#sports-main-content') || $('#main-content') || $('main');
            if (fullPage) fullPage.style.display = 'none';
            if (listPage) listPage.style.display = 'block';
            State.reset();
        }
    });

    // ============================================
    // 15. INIT ON PAGE LOAD
    // ============================================
    document.addEventListener('DOMContentLoaded', function() {
        log('Sports.js initialized');

        // Hide full page on first load
        const fullPage = $('#match-fullpage');
        if (fullPage) fullPage.style.display = 'none';

        // Check URL hash for direct match access (#match=cricket-live-1)
        const hash = window.location.hash;
        if (hash.startsWith('#match=')) {
            const matchId = hash.replace('#match=', '');
            if (MATCH_DB[matchId]) {
                setTimeout(() => openMatch(matchId), 100);
            }
        }

        // Start list countdowns immediately
        $$('.upcoming-item').forEach(item => {
            const id = item.dataset.matchId;
            const data = MATCH_DB[id];
            if (data && data.type === 'upcoming') {
                initUpcomingCountdown(id, data.startTime);
            }
        });
    });

})();
