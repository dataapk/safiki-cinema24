/* SPORTS BET Affiliate Program — affiliate_program schema
   Requires window.supabaseClient to be initialized before this file. */
(function () {
  'use strict';

  const CFG = {
    schema: 'affiliate_program',

    tables: {
      applications: 'applications',
      affiliates: 'affiliates',
      admins: 'admins',
      audit: 'audit_log',
      referrals: 'referrals',
      commissions: 'commissions',
      payouts: 'payouts',
      settings: 'settings'
    },

    pageSize: 20,

    functions: {
      calculateDailyCommission: 'affiliate-daily-calculation',
      settleWeeklyCommission: 'affiliate-weekly-settlement',
      processPayout: 'affiliate-process-payout'
    },

    selectors: {
      applications: [
        '#affcApplicationListBody',
        '#affcApplicationsTableBody',
        '#affcApplicationTableBody',
        '[data-affiliate-applications-body]'
      ],

      appPages: [
        '#affcApplicationPagination',
        '#affcApplicationsPagination',
        '[data-affiliate-applications-pagination]'
      ],

      affiliates: [
        '#affcAffiliateListBody',
        '#affcAccountsTableBody',
        '#affcAffiliatesTableBody',
        '[data-affiliate-accounts-body]'
      ],

      affiliatePages: [
        '#affcAffiliatePagination',
        '#affcAccountsPagination',
        '#affcAffiliatesPagination',
        '[data-affiliate-accounts-pagination]'
      ],

      appSearch: [
        '#affcApplicationSearch',
        '#affcApplicationsSearch',
        '#affiliateApplicationSearch',
        '[data-affiliate-application-search]'
      ],

      affiliateSearch: [
        '#affcAffiliateSearch',
        '#affcAccountsSearch',
        '#affiliateSearch',
        '[data-affiliate-search]'
      ],

      refresh: [
        '#refreshAffiliateDataBtn',
        '#affcRefreshBtn',
        '[data-affiliate-refresh]'
      ],

      message: [
        '#affcMessage',
        '#affiliateProgramMessage',
        '[data-affiliate-message]'
      ]
    }
  };

  const S = {
    applications: [],
    affiliates: [],
    referrals: [],
    commissions: [],
    payouts: [],
    settings: null,
    appPage: 1,
    affiliatePage: 1,
    appSearch: '',
    affiliateSearch: '',
    user: null
  };

  const $ = (s, root = document) => root.querySelector(s);

  const $$ = (s, root = document) =>
    Array.from(root.querySelectorAll(s));

  const first = list => {
    for (const s of list) {
      const el = $(s);
      if (el) return el;
    }

    return null;
  };

  const all = list =>
    [...new Set(list.flatMap(s => $$(s)))];

  const esc = v =>
    String(v == null ? '' : v).replace(/[&<>"']/g, c => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[c]));

  const status = v =>
    String(v || 'pending').trim().toLowerCase();

  const date = v => {
    if (!v) return '—';

    const d = new Date(v);

    return Number.isNaN(d.getTime())
      ? '—'
      : d.toLocaleString();
  };

  const money = (v, c = 'USD') =>
    `${esc(c)} ${Number(v || 0).toFixed(2)}`;

  const badge = v => {
    const s = status(v);

    return `<span class="affc-status affc-status-${s.replace(
      /[^a-z0-9_-]/g,
      ''
    )}">${esc(s.charAt(0).toUpperCase() + s.slice(1))}</span>`;
  };

  function client() {
    const c = window.supabaseClient || window.supabase;

    if (!c || typeof c.from !== 'function') {
      throw new Error(
        'Supabase client missing. Set window.supabaseClient before loading affiliate.js.'
      );
    }

    return c;
  }

  function table(name) {
    const c = client();

    return typeof c.schema === 'function'
      ? c.schema(CFG.schema).from(name)
      : c.from(`${CFG.schema}.${name}`);
  }

  async function signedInUser() {
    const { data, error } = await client().auth.getUser();

    if (error) throw error;

    return data?.user || null;
  }

  async function adminCheck() {
    const user = await signedInUser();

    S.user = user;

    if (!user) {
      throw new Error(
        'Please sign in with an authorized Affiliate Program admin account.'
      );
    }

    const { data, error } = await table(CFG.tables.admins)
      .select('user_id,role,is_active')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      throw new Error(
        'Access denied: this account is not an active Affiliate Program admin.'
      );
    }

    return user;
  }

  function message(text, type = 'info') {
    const el = first(CFG.selectors.message);

    if (!el) {
      console[type === 'error' ? 'error' : 'log'](
        '[Affiliate Program]',
        text
      );

      return;
    }

    el.textContent = text;
    el.dataset.type = type;
    el.hidden = false;

    el.classList.remove(
      'success',
      'error',
      'warning',
      'info'
    );

    el.classList.add(type);
  }

  function busy(btn, on, text = 'Please wait…') {
    if (!btn) return;

    if (on) {
      btn.dataset.oldText = btn.textContent;
      btn.disabled = true;
      btn.textContent = text;
    } else {
      btn.disabled = false;

      if (btn.dataset.oldText) {
        btn.textContent = btn.dataset.oldText;
        delete btn.dataset.oldText;
      }
    }
  }

  async function audit(
    action,
    entityType,
    entityId,
    details = {}
  ) {
    const user = S.user || await signedInUser();

    if (!user) {
      throw new Error(
        'Could not identify the admin for the audit log.'
      );
    }

    const { error } = await table(CFG.tables.audit).insert({
      actor_user_id: user.id,
      action,
      entity_type: entityType,
      entity_id: entityId || null,
      details
    });

    if (error) throw error;
  }

  async function loadApplications() {
    await adminCheck();

    const { data, error } = await table(CFG.tables.applications)
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1000);

    if (error) throw error;

    S.applications = data || [];

    renderApplications();
    updateCounts();

    return S.applications;
  }

  async function loadAffiliates() {
    await adminCheck();

    const { data, error } = await table(CFG.tables.affiliates)
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1000);

    if (error) throw error;

    S.affiliates = data || [];

    renderAffiliates();
    updateCounts();

    return S.affiliates;
  }

  async function loadOptional() {
    for (const key of [
      'referrals',
      'commissions',
      'payouts'
    ]) {
      try {
        const { data, error } = await table(CFG.tables[key])
          .select('*')
          .limit(1000);

        if (!error) {
          S[key] = data || [];
        }
      } catch (_) {
        // Optional data must not stop the main page from loading.
      }
    }

    try {
      const { data, error } = await table(CFG.tables.settings)
        .select('*')
        .limit(1)
        .maybeSingle();

      if (!error) {
        S.settings = data || null;
      }
    } catch (_) {
      // Settings are optional until the settings table is configured.
    }

    updateCounts();
  }

  function appRows() {
    const q = S.appSearch.trim().toLowerCase();

    return S.applications.filter(a =>
      !q ||
      [
        a.first_name,
        a.last_name,
        a.email,
        a.player_id,
        a.affiliate_id,
        a.promotion_link,
        a.link_category,
        a.contact_platform,
        a.telegram_username,
        a.whatsapp_number,
        a.status
      ]
        .join(' ')
        .toLowerCase()
        .includes(q)
    );
  }

  function renderApplications() {
    const body = first(CFG.selectors.applications);

    if (!body) return;

    const rows = appRows();

    const pages = Math.max(
      1,
      Math.ceil(rows.length / CFG.pageSize)
    );

    S.appPage = Math.min(S.appPage, pages);

    const slice = rows.slice(
      (S.appPage - 1) * CFG.pageSize,
      S.appPage * CFG.pageSize
    );

    if (!slice.length) {
      body.innerHTML =
        '<tr><td colspan="9" class="affc-empty">No applications found.</td></tr>';
    } else {
      body.innerHTML = slice.map(a => {
        const pending = [
          'pending',
          'submitted',
          'under_review'
        ].includes(status(a.status));

        const verified = a.player_id_verified === true;

        const name =
          `${a.first_name || ''} ${a.last_name || ''}`.trim() ||
          '—';

        const contactPlatform =
          a.contact_platform ||
          (a.telegram_username
            ? 'telegram'
            : a.whatsapp_number
              ? 'whatsapp'
              : '—');

        return `
          <tr data-application-id="${esc(a.id)}">
            <td>${esc(name)}</td>
            <td>${esc(a.email || '—')}</td>
            <td>${esc(a.player_id || '—')}</td>
            <td>${esc(a.link_category || '—')}</td>
            <td>${esc(contactPlatform)}</td>
            <td>${verified ? badge('verified') : badge('not verified')}</td>
            <td>${badge(a.status)}</td>
            <td>${date(a.created_at)}</td>
            <td class="affc-actions">
              <button
                type="button"
                data-affiliate-action="view-application"
                data-id="${esc(a.id)}"
              >View</button>

              ${
                pending
                  ? `
                    <button
                      type="button"
                      data-affiliate-action="verify-player"
                      data-id="${esc(a.id)}"
                    >${verified ? 'Unverify Player ID' : 'Verify Player ID'}</button>

                    <button
                      type="button"
                      data-affiliate-action="approve-application"
                      data-id="${esc(a.id)}"
                      ${verified ? '' : 'title="Verify Player ID first"'}
                    >Approve</button>

                    <button
                      type="button"
                      data-affiliate-action="reject-application"
                      data-id="${esc(a.id)}"
                    >Reject</button>
                  `
                  : ''
              }
            </td>
          </tr>
        `;
      }).join('');
    }

    pagination(
      first(CFG.selectors.appPages),
      S.appPage,
      pages,
      'application-page'
    );
  }

  function renderAffiliates() {
    const body = first(CFG.selectors.affiliates);

    if (!body) return;

    const q = S.affiliateSearch.trim().toLowerCase();

    const rows = S.affiliates.filter(a =>
      !q ||
      [
        a.affiliate_id,
        a.player_id,
        a.auth_user_id,
        a.status,
        a.id
      ]
        .join(' ')
        .toLowerCase()
        .includes(q)
    );

    const pages = Math.max(
      1,
      Math.ceil(rows.length / CFG.pageSize)
    );

    S.affiliatePage = Math.min(S.affiliatePage, pages);

    const slice = rows.slice(
      (S.affiliatePage - 1) * CFG.pageSize,
      S.affiliatePage * CFG.pageSize
    );

    if (!slice.length) {
      body.innerHTML =
        '<tr><td colspan="7" class="affc-empty">No affiliates found.</td></tr>';
    } else {
      body.innerHTML = slice.map(a => `
        <tr>
          <td>${esc(a.affiliate_id || '—')}</td>
          <td>${esc(a.player_id || '—')}</td>
          <td>${esc(a.auth_user_id || '—')}</td>
          <td>${Number(a.commission_rate || 0).toFixed(2)}%</td>
          <td>${badge(a.status)}</td>
          <td>${date(a.approved_at || a.created_at)}</td>
          <td>${esc(a.id || '—')}</td>
        </tr>
      `).join('');
    }

    pagination(
      first(CFG.selectors.affiliatePages),
      S.affiliatePage,
      pages,
      'affiliate-page'
    );
  }

  function pagination(el, page, pages, action) {
    if (!el) return;

    if (pages <= 1) {
      el.innerHTML = '';
      return;
    }

    el.innerHTML = `
      <button
        type="button"
        data-affiliate-action="${action}"
        data-page="${page - 1}"
        ${page <= 1 ? 'disabled' : ''}
      >Previous</button>

      <span>Page ${page} of ${pages}</span>

      <button
        type="button"
        data-affiliate-action="${action}"
        data-page="${page + 1}"
        ${page >= pages ? 'disabled' : ''}
      >Next</button>
    `;
  }

  function updateCounts() {
    const pending = S.applications.filter(a =>
      [
        'pending',
        'submitted',
        'under_review'
      ].includes(status(a.status))
    ).length;

    const active = S.affiliates.filter(a =>
      [
        'active',
        'approved'
      ].includes(status(a.status))
    ).length;

    const set = (selectors, value) => {
      selectors.forEach(s => {
        $$(s).forEach(el => {
          el.textContent = String(value);
        });
      });
    };

    set([
      '#affcPendingApplicationsCount',
      '#affcApplicationsCount',
      '[data-affiliate-pending-count]'
    ], pending);

    set([
      '#affcActiveAffiliatesCount',
      '#affcAffiliatesCount',
      '[data-affiliate-active-count]'
    ], active);

    set([
      '#affcReferralsCount',
      '[data-affiliate-referrals-count]'
    ], S.referrals.length);

    set([
      '#affcCommissionsTotal',
      '[data-affiliate-commissions-total]'
    ], S.commissions.reduce(
      (n, c) => n + Number(c.commission_amount || 0),
      0
    ).toFixed(2));
  }

  function getApplication(id) {
    return S.applications.find(
      a => String(a.id) === String(id)
    );
  }

  function details(app) {
    if (!app) return;

    let panel =
      $('#affcApplicationDetails') ||
      $('#affcApplicationDetailPanel') ||
      $('[data-affiliate-application-details]');

    if (!panel) {
      panel = document.createElement('section');

      panel.id = 'affcApplicationDetails';
      panel.className = 'affc-application-details';

      panel.style.cssText =
        'margin:16px 0;padding:18px;border:1px solid #2b5038;border-radius:12px;background:#0c1c13;color:#f2fff4';

      const body = first(CFG.selectors.applications);
      const tableEl = body?.closest('table');

      if (tableEl?.parentElement) {
        tableEl.parentElement.insertBefore(panel, tableEl);
      } else {
        body?.parentElement?.insertBefore(panel, body);
      }
    }

    const contact =
      app.contact_platform === 'whatsapp'
        ? app.whatsapp_number
        : app.telegram_username;

    panel.hidden = false;

    panel.innerHTML = `
      <div style="display:flex;justify-content:space-between;gap:12px;align-items:center">
        <h3>Application Details</h3>
        <button type="button" data-affiliate-action="close-details">Close</button>
      </div>

      <p><b>Name:</b> ${esc(`${app.first_name || ''} ${app.last_name || ''}`.trim())}</p>
      <p><b>Email:</b> ${esc(app.email || '—')}</p>
      <p><b>Player ID:</b> ${esc(app.player_id || '—')} — ${app.player_id_verified ? 'Verified' : 'Not verified'}</p>

      <p>
        <b>Promotion link:</b>
        ${
          app.promotion_link
            ? `<a href="${esc(app.promotion_link)}" target="_blank" rel="noopener noreferrer">${esc(app.promotion_link)}</a>`
            : '—'
        }
      </p>

      <p><b>Category:</b> ${esc(app.link_category || '—')}</p>
      <p><b>Contact platform:</b> ${esc(app.contact_platform || '—')}</p>
      <p><b>Contact:</b> ${esc(contact || '—')}</p>
      <p><b>Status:</b> ${badge(app.status)}</p>
      <p><b>Submitted:</b> ${date(app.created_at)}</p>
      <p><b>Review notes:</b> ${esc(app.review_notes || '—')}</p>

      <div class="affc-actions">
        <button
          type="button"
          data-affiliate-action="verify-player"
          data-id="${esc(app.id)}"
        >${app.player_id_verified ? 'Unverify Player ID' : 'Verify Player ID'}</button>

        <button
          type="button"
          data-affiliate-action="approve-application"
          data-id="${esc(app.id)}"
          ${app.player_id_verified ? '' : 'disabled'}
        >Approve</button>

        <button
          type="button"
          data-affiliate-action="reject-application"
          data-id="${esc(app.id)}"
        >Reject</button>
      </div>
    `;

    panel.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest'
    });
  }

  async function verifyPlayerId(id, btn) {
    const app = getApplication(id);

    if (!app) {
      throw new Error('Application not found.');
    }

    await adminCheck();

    busy(btn, true, 'Saving…');

    try {
      const value = app.player_id_verified !== true;

      const { error } = await table(CFG.tables.applications)
        .update({
          player_id_verified: value,
          updated_at: new Date().toISOString()
        })
        .eq('id', app.id);

      if (error) throw error;

      await audit(
        value
          ? 'application_player_id_verified'
          : 'application_player_id_unverified',
        'application',
        app.id,
        {
          player_id: app.player_id,
          player_id_verified: value
        }
      );

      message(
        value
          ? 'Player ID marked verified.'
          : 'Player ID verification removed.',
        'success'
      );

      await loadApplications();

      const updated = getApplication(id);

      if (updated) {
        details(updated);
      }
    } finally {
      busy(btn, false);
    }
  }

  async function approveApplication(id, btn) {
    const app = getApplication(id);

    if (!app) {
      throw new Error('Application not found.');
    }

    if (app.player_id_verified !== true) {
      throw new Error(
        'Verify the Player ID before approving this application.'
      );
    }

    const user = await adminCheck();

    if (!window.confirm(
      `Approve affiliate application for ${app.email || app.player_id || app.id}?`
    )) {
      return;
    }

    busy(btn, true, 'Approving…');

    try {
      const now = new Date().toISOString();

      const affiliateId =
        app.affiliate_id ||
        `AFF-${String(app.id).replace(/-/g, '').slice(0, 10).toUpperCase()}`;

      const { error: appError } = await table(CFG.tables.applications)
        .update({
          status: 'approved',
          affiliate_id: affiliateId,
          reviewed_by: user.id,
          reviewed_at: now,
          updated_at: now
        })
        .eq('id', app.id);

      if (appError) throw appError;

      const record = {
        affiliate_id: affiliateId,
        application_id: app.id,
        auth_user_id: app.auth_user_id || null,
        player_id: app.player_id,
        commission_rate: Number(
          S.settings?.default_commission_rate ?? 0
        ),
        status: 'active',
        approved_by: user.id,
        approved_at: now,
        updated_at: now
      };

      const {
        data: existing,
        error: lookupError
      } = await table(CFG.tables.affiliates)
        .select('id')
        .eq('application_id', app.id)
        .maybeSingle();

      if (lookupError) throw lookupError;

      if (existing?.id) {
        const { error } = await table(CFG.tables.affiliates)
          .update(record)
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        const { error } = await table(CFG.tables.affiliates)
          .insert(record);

        if (error) throw error;
      }

      await audit(
        'application_approved',
        'application',
        app.id,
        {
          affiliate_id: affiliateId,
          player_id: app.player_id,
          email: app.email
        }
      );

      message(
        `Application approved. Affiliate ID: ${affiliateId}`,
        'success'
      );

      await Promise.all([
        loadApplications(),
        loadAffiliates()
      ]);

      const panel =
        $('#affcApplicationDetails') ||
        $('#affcApplicationDetailPanel');

      if (panel) {
        panel.hidden = true;
      }
    } finally {
      busy(btn, false);
    }
  }

  async function rejectApplication(id, btn) {
    const app = getApplication(id);

    if (!app) {
      throw new Error('Application not found.');
    }

    const user = await adminCheck();

    const note = window.prompt(
      'Optional rejection reason (saved to Review Notes):',
      app.review_notes || ''
    );

    if (note === null) return;

    if (!window.confirm(
      `Reject affiliate application for ${app.email || app.id}?`
    )) {
      return;
    }

    busy(btn, true, 'Rejecting…');

    try {
      const now = new Date().toISOString();

      const { error } = await table(CFG.tables.applications)
        .update({
          status: 'rejected',
          review_notes: note.trim() || null,
          reviewed_by: user.id,
          reviewed_at: now,
          updated_at: now
        })
        .eq('id', app.id);

      if (error) throw error;

      await audit(
        'application_rejected',
        'application',
        app.id,
        {
          email: app.email,
          player_id: app.player_id,
          review_notes: note.trim() || null
        }
      );

      message(
        'Application rejected and removed from the Pending view.',
        'success'
      );

      await loadApplications();

      const panel =
        $('#affcApplicationDetails') ||
        $('#affcApplicationDetailPanel');

      if (panel) {
        panel.hidden = true;
      }
    } finally {
      busy(btn, false);
    }
  }

  async function refresh() {
    try {
      await adminCheck();

      await Promise.all([
        loadApplications(),
        loadAffiliates()
      ]);

      await loadOptional();

      message(
        'Affiliate Program data refreshed.',
        'success'
      );
    } catch (e) {
      message(
        e.message || 'Could not load Affiliate Program data.',
        'error'
      );

      console.error('[Affiliate Program]', e);
    }
  }

  function bindSearch() {
    all(CFG.selectors.appSearch).forEach(el => {
      if (el.dataset.affcBound) return;

      el.dataset.affcBound = '1';

      el.addEventListener('input', () => {
        S.appSearch = el.value || '';
        S.appPage = 1;

        renderApplications();
      });
    });

    all(CFG.selectors.affiliateSearch).forEach(el => {
      if (el.dataset.affcBound) return;

      el.dataset.affcBound = '1';

      el.addEventListener('input', () => {
        S.affiliateSearch = el.value || '';
        S.affiliatePage = 1;

        renderAffiliates();
      });
    });

    all(CFG.selectors.refresh).forEach(el => {
      if (el.dataset.affcBound) return;

      el.dataset.affcBound = '1';
      el.addEventListener('click', refresh);
    });
  }

  function bindActions() {
    if (document.documentElement.dataset.affcActionsBound) {
      return;
    }

    document.documentElement.dataset.affcActionsBound = '1';

    document.addEventListener('click', async event => {
      const btn = event.target.closest('[data-affiliate-action]');

      if (!btn) return;

      const action = btn.dataset.affiliateAction;
      const id = btn.dataset.id;

      try {
        if (action === 'view-application') {
          details(getApplication(id));
        } else if (action === 'close-details') {
          const panel =
            $('#affcApplicationDetails') ||
            $('#affcApplicationDetailPanel');

          if (panel) panel.hidden = true;
        } else if (action === 'verify-player') {
          await verifyPlayerId(id, btn);
        } else if (action === 'approve-application') {
          await approveApplication(id, btn);
        } else if (action === 'reject-application') {
          await rejectApplication(id, btn);
        } else if (action === 'application-page') {
          S.appPage = Number(btn.dataset.page) || 1;
          renderApplications();
        } else if (action === 'affiliate-page') {
          S.affiliatePage = Number(btn.dataset.page) || 1;
          renderAffiliates();
        } else if (action === 'refresh') {
          await refresh();
        }
      } catch (e) {
        message(e.message || 'Action failed.', 'error');
        console.error('[Affiliate Program]', e);
      }
    });
  }

  function bindSignup() {
    const form = $('#affiliateSignupForm');

    if (!form || form.dataset.affcSignupBound) {
      return;
    }

    form.dataset.affcSignupBound = '1';

    const confirm = $('#confirmPassword');

    if (confirm) {
      confirm.addEventListener('input', () => {
        confirm.setCustomValidity('');
      });
    }

    form.addEventListener('submit', async event => {
      event.preventDefault();

      const statusBox = $('#pendingStatus');

      const submit = form.querySelector(
        'button[type="submit"],input[type="submit"]'
      );

      if (statusBox) {
        statusBox.classList.remove('show');
        statusBox.textContent = '';
      }

      const val = id =>
        (($(id)?.value) || '').trim();

      const password = $('#password')?.value || '';
      const confirmation = $('#confirmPassword')?.value || '';

      if (password !== confirmation) {
        if (confirm) {
          confirm.setCustomValidity('Passwords do not match.');
          confirm.reportValidity();
        }

        return;
      }

      if (confirm) {
        confirm.setCustomValidity('');
      }

      const platform = val('#socialPlatform').toLowerCase();
      const contact = val('#socialValue');

      if (!platform || !contact) {
        signupStatus(
          'Choose Telegram or WhatsApp and enter the contact detail.',
          'error'
        );

        return;
      }

      busy(submit, true, 'Submitting…');

      try {
        const c = client();
        const email = val('#email').toLowerCase();

        const {
          data: existing,
          error: lookupError
        } = await table(CFG.tables.applications)
          .select('id,status')
          .eq('email', email)
          .in('status', [
            'pending',
            'submitted',
            'under_review',
            'approved'
          ])
          .limit(1);

        if (lookupError) throw lookupError;

        if (existing?.length) {
          throw new Error(
            'An application for this email already exists. Please contact the Affiliate Program admin.'
          );
        }

        // Password is only sent to Supabase Auth.
        // Never store the password in affiliate_program.applications.
        const auth = await c.auth.signUp({
          email,
          password,
          options: {
            data: {
              first_name: val('#firstName'),
              last_name: val('#lastName'),
              account_type: 'affiliate_applicant'
            }
          }
        });

        if (auth.error) throw auth.error;

        const user = auth.data?.user;

        if (!user) {
          throw new Error(
            'Supabase Auth did not return a user. Please try again.'
          );
        }

        const row = {
          auth_user_id: user.id,
          email,
          first_name: val('#firstName'),
          last_name: val('#lastName'),
          promotion_link: val('#promotionLink'),
          link_category: val('#linkCategory'),
          contact_platform: platform,
          telegram_username:
            platform === 'telegram' ? contact : null,
          whatsapp_number:
            platform === 'whatsapp' ? contact : null,
          player_id: val('#playerId'),
          player_id_verified: false,
          status: 'pending'
        };

        const {
          data,
          error
        } = await table(CFG.tables.applications)
          .insert(row)
          .select('id,status')
          .single();

        if (error) throw error;

        form.reset();

        const socialField = $('#socialValueField');

        if (socialField) {
          socialField.hidden = true;
        }

        if (statusBox) {
          statusBox.classList.add('show');
        }

        signupStatus(
          'Application saved successfully. Status: Pending for Admin Approval.',
          'success'
        );

        form.dataset.applicationId = data?.id || '';
      } catch (e) {
        signupStatus(
          e.message || 'Could not save the application. Please try again.',
          'error'
        );

        console.error('[Affiliate signup]', e);
      } finally {
        busy(submit, false);
      }
    });
  }

  function signupStatus(text, type) {
    const el = $('#pendingStatus');

    if (!el) {
      window.alert(text);
      return;
    }

    el.textContent = text;
    el.dataset.type = type;
    el.classList.add('show');

    el.style.background =
      type === 'success' ? '#12391f' : '#3b1717';

    el.style.borderColor =
      type === 'success' ? '#31d36b' : '#ff7b7b';

    el.style.color =
      type === 'success' ? '#e7ffed' : '#ffe1e1';

    el.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest'
    });
  }

  function styles() {
    if ($('#affcRuntimeStyles')) return;

    const el = document.createElement('style');

    el.id = 'affcRuntimeStyles';

    el.textContent = `
      .affc-status {
        display: inline-block;
        padding: 4px 9px;
        border-radius: 999px;
        font-size: 12px;
        font-weight: 700;
        background: #24362a;
        color: #dff5e5;
      }

      .affc-status-pending,
      .affc-status-submitted,
      .affc-status-under_review,
      .affc-status-notverified {
        background: #4a3a12;
        color: #ffe69a;
      }

      .affc-status-approved,
      .affc-status-active,
      .affc-status-verified {
        background: #123d24;
        color: #a8ffc0;
      }

      .affc-status-rejected,
      .affc-status-suspended,
      .affc-status-inactive {
        background: #4a2020;
        color: #ffc0c0;
      }

      .affc-actions {
        display: flex;
        gap: 6px;
        flex-wrap: wrap;
      }

      .affc-empty {
        text-align: center;
        padding: 20px;
        color: #9ab5a2;
      }
    `;

    document.head.appendChild(el);
  }

  async function init() {
    styles();
    bindSignup();
    bindSearch();
    bindActions();
    bindFinancialForms();

    if ($('#affiliateSignupForm')) return;

    if (
      first(CFG.selectors.applications) ||
      first(CFG.selectors.affiliates) ||
      $('[data-affiliate-admin]')
    ) {
      await refresh();
    }
  }

  // Financial actions are delegated to authenticated server-side
  // Edge Functions. Browser code must not calculate or mark a real
  // payout as paid by itself.

  function financialResultTarget() {
    return (
      $('#affcDailyCalculationResult') ||
      $('#affcWeeklySettlementResult') ||
      $('#affcPayoutResult') ||
      $('#affcFinancialResult')
    );
  }

  function showFinancialResult(text, type = 'info') {
    const el = financialResultTarget();

    if (!el) {
      message(text, type);
      return;
    }

    el.textContent = text;
    el.dataset.type = type;
    el.hidden = false;

    el.classList.remove(
      'success',
      'error',
      'warning',
      'info'
    );

    el.classList.add(type);
  }

  function setFinancialValue(id, value, currency = 'USD') {
    const el = $(id);

    if (el) {
      el.textContent =
        value == null
          ? '—'
          : `${currency} ${Number(value || 0).toFixed(2)}`;
    }
  }

  function renderFinancialResult(result, kind) {
    const data =
      result?.data ||
      result?.result ||
      result ||
      {};

    const currency = data.currency || 'USD';

    const mappings = {
      total_deposits: '#affcDailyTotalDeposits',
      total_withdrawals: '#affcDailyTotalWithdrawals',
      valid_bets: '#affcDailyTotalBets',
      player_win: '#affcDailyPlayerWin',
      player_loss: '#affcDailyPlayerLoss',
      gross_gaming_revenue: '#affcDailyGGR',
      eligible_deductions: '#affcDailyEligibleDeductions',
      net_gaming_revenue: '#affcDailyNGR',
      commission_amount: '#affcDailyAccruedCommission'
    };

    for (const [key, selector] of Object.entries(mappings)) {
      if (data[key] !== undefined) {
        setFinancialValue(
          selector,
          data[key],
          currency
        );
      }
    }

    const target =
      kind === 'daily'
        ? $('#affcDailyCalculationResult')
        : kind === 'weekly'
          ? $('#affcWeeklySettlementResult')
          : $('#affcPayoutResult');

    if (target) {
      const start =
        data.period_start ||
        data.periodStart;

      const end =
        data.period_end ||
        data.periodEnd;

      const amount =
        data.commission_amount ??
        data.amount;

      const statusText =
        data.payout_status ||
        data.settlement_status ||
        data.status ||
        'completed';

      target.textContent = [
        start ? `Period start: ${start}` : '',
        end ? `Period end: ${end}` : '',
        amount !== undefined
          ? `Amount: ${money(amount, currency)}`
          : '',
        `Status: ${statusText}`,
        data.payout_reference || data.transaction_reference
          ? `Reference: ${data.payout_reference || data.transaction_reference}`
          : ''
      ]
        .filter(Boolean)
        .join(' | ');

      target.dataset.type = 'success';
      target.hidden = false;
    }

    const cycleBody = $('#affcDailyCyclesTableBody');

    if (
      kind === 'daily' &&
      cycleBody &&
      Array.isArray(data.cycles)
    ) {
      cycleBody.innerHTML = data.cycles.length
        ? data.cycles.map(c => `
            <tr>
              <td>${esc(c.period_start || c.cycle_start || '—')}</td>
              <td>${esc(c.period_end || c.cycle_end || '—')}</td>
              <td>${esc(c.valid_bets ?? '—')}</td>
              <td>${esc(c.player_win ?? '—')}</td>
              <td>${esc(c.player_loss ?? '—')}</td>
              <td>${esc(c.gross_gaming_revenue ?? '—')}</td>
              <td>${esc(c.net_gaming_revenue ?? '—')}</td>
              <td>${badge(c.settlement_status || c.status || 'finalized')}</td>
            </tr>
          `).join('')
        : '<tr><td colspan="8" class="affc-empty">No daily cycles returned.</td></tr>';
    }
  }

  async function invokeFinancialFunction(key, payload, kind) {
    await adminCheck();

    const functionName = CFG.functions[key];

    if (!functionName) {
      throw new Error(
        `Server function for ${key} is not configured.`
      );
    }

    const { data, error } = await client().functions.invoke(
      functionName,
      { body: payload }
    );

    if (error) throw error;

    if (data?.success === false || data?.error) {
      throw new Error(
        data.message ||
        data.error ||
        'Financial operation failed.'
      );
    }

    renderFinancialResult(data, kind);

    return data;
  }

  async function calculateDailyCommission(form) {
    const formEl =
      typeof form === 'string'
        ? $(form)
        : form;

    const affiliateId =
      ($('#affcDailyAffiliateId')?.value || '').trim();

    const periodStart =
      ($('#affcDailyPeriodStart')?.value || '').trim();

    const periodEnd =
      ($('#affcDailyPeriodEnd')?.value || '').trim();

    if (!periodStart || !periodEnd) {
      throw new Error(
        'Choose both daily period start and end.'
      );
    }

    if (new Date(periodEnd) <= new Date(periodStart)) {
      throw new Error(
        'Period end must be later than period start.'
      );
    }

    const btn = formEl?.querySelector(
      'button[type="submit"],input[type="submit"]'
    );

    busy(btn, true, 'Calculating…');

    try {
      showFinancialResult(
        'Calculating from the server…'
      );

      return await invokeFinancialFunction(
        'calculateDailyCommission',
        {
          affiliate_id: affiliateId || null,
          period_start: periodStart,
          period_end: periodEnd,
          timezone: 'Asia/Dhaka',
          cutoff_hour: 6
        },
        'daily'
      );
    } finally {
      busy(btn, false);
    }
  }

  async function settleWeeklyCommission(form) {
    const formEl =
      typeof form === 'string'
        ? $(form)
        : form;

    const periodStart =
      ($('#affcWeeklyPeriodStart')?.value || '').trim();

    const periodEnd =
      ($('#affcWeeklyPeriodEnd')?.value || '').trim();

    if (!periodStart || !periodEnd) {
      throw new Error(
        'Choose both weekly period start and end.'
      );
    }

    const days =
      (new Date(periodEnd) - new Date(periodStart)) /
      86400000;

    if (days < 6.99 || days > 7.01) {
      throw new Error(
        'Weekly settlement must cover exactly seven days.'
      );
    }

    const btn = formEl?.querySelector(
      'button[type="submit"],input[type="submit"]'
    );

    busy(btn, true, 'Settling…');

    try {
      showFinancialResult(
        'Settling weekly commission on the server…'
      );

      return await invokeFinancialFunction(
        'settleWeeklyCommission',
        {
          period_start: periodStart,
          period_end: periodEnd,
          timezone: 'Asia/Dhaka',
          carry_forward_negative_balance: true,
          preserve_currency_separation: true
        },
        'weekly'
      );
    } finally {
      busy(btn, false);
    }
  }

  async function processPayout(form) {
    const formEl =
      typeof form === 'string'
        ? $(form)
        : form;

    const payoutId =
      ($('#affcPayoutId')?.value ||
        formEl?.querySelector('[name="payout_id"]')?.value ||
        '').trim();

    if (!payoutId) {
      throw new Error(
        'Enter or select the saved payout ID.'
      );
    }

    if (!window.confirm(
      'Submit this saved payout for secure server-side processing?'
    )) {
      return;
    }

    const btn = formEl?.querySelector(
      'button[type="submit"],input[type="submit"]'
    );

    busy(btn, true, 'Processing…');

    try {
      showFinancialResult(
        'Submitting payout to the server…'
      );

      return await invokeFinancialFunction(
        'processPayout',
        {
          payout_id: payoutId,
          idempotency_key: `affiliate-payout:${payoutId}`
        },
        'payout'
      );
    } finally {
      busy(btn, false);
    }
  }

  function bindFinancialForms() {
    const bind = (selector, handler) => {
      const form = $(selector);

      if (!form || form.dataset.affcFinancialBound) {
        return;
      }

      form.dataset.affcFinancialBound = '1';

      form.addEventListener('submit', event => {
        event.preventDefault();

        handler(form).catch(e => {
          showFinancialResult(
            e.message || 'Financial operation failed.',
            'error'
          );

          console.error(
            '[Affiliate finance]',
            e
          );
        });
      });
    };

    bind(
      '#affcDailyCalculationForm',
      calculateDailyCommission
    );

    bind(
      '#affcDailyCommissionForm',
      calculateDailyCommission
    );

    bind(
      '#affcWeeklySettlementForm',
      settleWeeklyCommission
    );

    bind(
      '#affcWeeklyCommissionForm',
      settleWeeklyCommission
    );

    bind(
      '#affcPayoutForm',
      processPayout
    );
  }

  window.AffiliateProgram = {
    config: CFG,
    state: S,
    refresh,
    loadApplications,
    loadAffiliates,
    renderApplications,
    renderAffiliates,
    approveApplication,
    rejectApplication,
    verifyPlayerId,
    calculateDailyCommission,
    settleWeeklyCommission,
    processPayout
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
