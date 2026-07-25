
js_content = """/* ========================================= */
/* MY BONUS SECTION — FULL JAVASCRIPT        */
/* ========================================= */

/*
 * NOTE: This file contains demo data and UI logic.
 * Replace demo values with your backend API calls.
 * Function names are kept exactly as referenced in HTML.
 */

/* ========================================= */
/* GLOBAL STATE                              */
/* ========================================= */

const BonusState = {
  activeTab: 'deposit',
  countdownInterval: null,
  depositBonus: {
    balance: 0,
    wagerRequired: 0,
    wagerCompleted: 0,
    validUntil: null,
    isExpired: false,
    bonusMode: false,
    canClaim: false
  },
  cashback: {
    daily: { eligible: false, amount: 0, progress: 0, threshold: 1000 },
    weekly: { eligible: false, amount: 0, progress: 0, threshold: 5000 },
    monthly: { eligible: false, amount: 0, progress: 0, threshold: 20000 }
  },
  referral: {
    code: 'ABC123',
    totalReferred: 0,
    activeToday: 0,
    totalDeposit: 0,
    reward: 0,
    users: []
  }
};

/* ========================================= */
/* TAB SWITCHING                             */
/* ========================================= */

/**
 * Switch between bonus tabs (deposit / cashback / referral)
 * @param {string} tabName - 'deposit' | 'cashback' | 'referral'
 */
function openBonusTab(tabName) {
  // Update tab buttons
  document.querySelectorAll('.bonus-menu-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  
  const activeBtn = document.getElementById(tabName + 'BonusTab');
  if (activeBtn) activeBtn.classList.add('active');

  // Update tab content
  document.querySelectorAll('.bonus-tab-content').forEach(content => {
    content.classList.remove('active');
  });

  const activeContent = document.getElementById(tabName + 'BonusContent');
  if (activeContent) activeContent.classList.add('active');

  BonusState.activeTab = tabName;

  // Load data for the selected tab
  if (tabName === 'deposit') {
    loadDepositBonusData();
  } else if (tabName === 'cashback') {
    loadCashbackData();
  } else if (tabName === 'referral') {
    loadReferralData();
  }
}

/* ========================================= */
/* CLOSE BONUS SECTION                       */
/* ========================================= */

/**
 * Close the My Bonus section / modal
 */
function closeMyBonus() {
  const section = document.getElementById('my-bonus-section');
  if (section) {
    section.style.opacity = '0';
    section.style.transform = 'translateY(20px)';
    section.style.transition = 'all 0.3s ease';
    
    setTimeout(() => {
      section.style.display = 'none';
      // Reset for next open
      section.style.opacity = '';
      section.style.transform = '';
      section.style.transition = '';
    }, 300);
  }

  // Clear countdown to prevent memory leak
  if (BonusState.countdownInterval) {
    clearInterval(BonusState.countdownInterval);
    BonusState.countdownInterval = null;
  }
}

/**
 * Open the My Bonus section / modal
 */
function openMyBonus() {
  const section = document.getElementById('my-bonus-section');
  if (section) {
    section.style.display = 'block';
    // Small delay for animation
    requestAnimationFrame(() => {
      section.style.opacity = '1';
      section.style.transform = 'translateY(0)';
    });
  }
  // Load default tab data
  openBonusTab('deposit');
}

/* ========================================= */
/* DEPOSIT BONUS SECTION                     */
/* ========================================= */

/**
 * Load deposit bonus data from backend
 * REPLACE this with your actual API call
 */
function loadDepositBonusData() {
  // ===== DEMO DATA =====
  // Replace with: fetch('/api/bonus/deposit').then(r => r.json())
  const demoData = {
    balance: 2500.00,
    wagerRequired: 15000.00,
    wagerCompleted: 8750.00,
    wagerMultiplier: 15,
    validUntil: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 hours from now
    bonusMode: true,
    status: 'active',
    canClaim: false
  };
  // =====================

  BonusState.depositBonus = { ...demoData };
  renderDepositBonus();
  startCountdown(demoData.validUntil);
}

/**
 * Render deposit bonus UI with current data
 */
function renderDepositBonus() {
  const data = BonusState.depositBonus;
  const percent = data.wagerRequired > 0 
    ? Math.min(100, Math.round((data.wagerCompleted / data.wagerRequired) * 100)) 
    : 0;

  // Balance
  const balanceEl = document.getElementById('bonusBalanceAmount');
  if (balanceEl) balanceEl.textContent = formatCurrency(data.balance);

  // Wager requirement text
  const wagerTextEl = document.getElementById('wagerRequirementText');
  if (wagerTextEl) wagerTextEl.textContent = data.wagerMultiplier + 'x';

  // Validity date & time
  if (data.validUntil) {
    const dateEl = document.getElementById('validityDate');
    const timeEl = document.getElementById('validityTime');
    if (dateEl) dateEl.textContent = formatDate(data.validUntil);
    if (timeEl) timeEl.textContent = formatTime(data.validUntil);
  }

  // Progress bar
  const fillEl = document.getElementById('bonusProgressFill');
  const percentEl = document.getElementById('bonusProgressPercent');
  const wagerEl = document.getElementById('bonusWagerText');

  if (fillEl) fillEl.style.width = percent + '%';
  if (percentEl) percentEl.textContent = percent + '%';
  if (wagerEl) {
    wagerEl.textContent = 'Wager: ' + formatCurrency(data.wagerCompleted) + 
                          ' / ' + formatCurrency(data.wagerRequired);
  }

  // Bonus mode toggle
  const toggleEl = document.getElementById('bonusModeToggle');
  if (toggleEl) toggleEl.checked = data.bonusMode;

  // Claim button
  const claimBtn = document.getElementById('claimBonusBtn');
  if (claimBtn) {
    if (data.canClaim && !data.isExpired) {
      claimBtn.classList.remove('locked');
      claimBtn.disabled = false;
      claimBtn.textContent = 'CLAIM NOW';
    } else {
      claimBtn.classList.add('locked');
      claimBtn.disabled = true;
      claimBtn.textContent = data.isExpired ? 'EXPIRED' : 'UNCLAIM';
    }
  }

  // Status badge
  const statusBadge = document.getElementById('bonusStatusBadge');
  if (statusBadge) {
    if (data.isExpired) {
      statusBadge.textContent = 'EXPIRED';
      statusBadge.className = 'bonus-status';
      statusBadge.style.background = '#ff5252';
      statusBadge.style.color = '#fff';
    } else {
      statusBadge.textContent = 'ACTIVE';
      statusBadge.className = 'bonus-status active';
      statusBadge.style.background = '';
      statusBadge.style.color = '';
    }
  }
}

/**
 * Start countdown timer for bonus validity
 * @param {Date} targetDate - expiry date/time
 */
function startCountdown(targetDate) {
  // Clear existing interval
  if (BonusState.countdownInterval) {
    clearInterval(BonusState.countdownInterval);
  }

  function updateTimer() {
    const now = new Date().getTime();
    const target = new Date(targetDate).getTime();
    const diff = target - now;

    if (diff <= 0) {
      // Expired
      clearInterval(BonusState.countdownInterval);
      BonusState.countdownInterval = null;
      BonusState.depositBonus.isExpired = true;
      renderDepositBonus();
      updateCountdownDisplay(0, 0, 0);
      return;
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    updateCountdownDisplay(hours, minutes, seconds);
  }

  updateTimer(); // Run immediately
  BonusState.countdownInterval = setInterval(updateTimer, 1000);
}

/**
 * Update countdown display elements
 */
function updateCountdownDisplay(hours, minutes, seconds) {
  const hEl = document.getElementById('cdHours');
  const mEl = document.getElementById('cdMinutes');
  const sEl = document.getElementById('cdSeconds');

  if (hEl) hEl.textContent = padZero(hours);
  if (mEl) mEl.textContent = padZero(minutes);
  if (sEl) sEl.textContent = padZero(seconds);
}

/**
 * Handle Bonus Mode toggle
 */
document.addEventListener('DOMContentLoaded', function() {
  const toggle = document.getElementById('bonusModeToggle');
  if (toggle) {
    toggle.addEventListener('change', function() {
      BonusState.depositBonus.bonusMode = this.checked;
      // ===== CALL YOUR BACKEND =====
      // fetch('/api/bonus/toggle-mode', {
      //   method: 'POST',
      //   body: JSON.stringify({ mode: this.checked })
      // });
      console.log('Bonus Mode:', this.checked ? 'ON' : 'OFF');
    });
  }

  // Claim button handler
  const claimBtn = document.getElementById('claimBonusBtn');
  if (claimBtn) {
    claimBtn.addEventListener('click', function() {
      if (!this.disabled && !this.classList.contains('locked')) {
        claimDepositBonus();
      }
    });
  }
});

/**
 * Claim deposit bonus
 * REPLACE with your actual API call
 */
function claimDepositBonus() {
  // ===== BACKEND CALL =====
  // fetch('/api/bonus/claim-deposit', { method: 'POST' })
  //   .then(r => r.json())
  //   .then(data => {
  //     if (data.success) {
  //       showToast('Bonus claimed successfully!');
  //       loadDepositBonusData();
  //     }
  //   });

  // Demo: simulate claim
  const btn = document.getElementById('claimBonusBtn');
  if (btn) {
    btn.textContent = 'CLAIMING...';
    btn.disabled = true;
    
    setTimeout(() => {
      showToast('🎉 Bonus claimed successfully!');
      BonusState.depositBonus.balance = 0;
      BonusState.depositBonus.canClaim = false;
      renderDepositBonus();
    }, 1500);
  }
}

/* ========================================= */
/* CASHBACK SECTION                          */
/* ========================================= */

/**
 * Load cashback data from backend
 * REPLACE this with your actual API call
 */
function loadCashbackData() {
  // ===== DEMO DATA =====
  const demoData = {
    totalCashback: 1250.00,
    daily: { eligible: true, amount: 45.00, progress: 850, threshold: 1000 },
    weekly: { eligible: false, amount: 0, progress: 3200, threshold: 5000 },
    monthly: { eligible: false, amount: 0, progress: 12500, threshold: 20000 }
  };
  // =====================

  BonusState.cashback = demoData;
  renderCashback();
}

/**
 * Render cashback UI
 */
function renderCashback() {
  const data = BonusState.cashback;

  // Total
  const totalEl = document.getElementById('totalCashbackAmount');
  if (totalEl) totalEl.textContent = formatCurrency(data.totalCashback);

  // Render each tier
  renderCashbackTier('daily', data.daily, '2%');
  renderCashbackTier('weekly', data.weekly, '5%');
  renderCashbackTier('monthly', data.monthly, '7%');
}

/**
 * Render individual cashback tier card
 */
function renderCashbackTier(tier, data, rate) {
  const statusEl = document.getElementById(tier + 'CashbackStatus');
  const fillEl = document.getElementById(tier + 'ProgressFill');
  const textEl = document.getElementById(tier + 'ProgressText');
  const amountEl = document.getElementById(tier + 'CashbackAmount');
  const btnEl = document.getElementById('claim' + capitalize(tier) + 'Btn');

  const percent = data.threshold > 0 
    ? Math.min(100, Math.round((data.progress / data.threshold) * 100)) 
    : 0;

  if (statusEl) {
    statusEl.textContent = data.eligible ? 'Eligible' : 'Not Eligible';
    statusEl.className = 'tier-status' + (data.eligible ? ' eligible' : '');
  }

  if (fillEl) fillEl.style.width = percent + '%';
  
  if (textEl) {
    textEl.textContent = formatCurrency(data.progress) + ' / ' + formatCurrency(data.threshold);
  }

  if (amountEl) amountEl.textContent = formatCurrency(data.amount);

  if (btnEl) {
    btnEl.disabled = !data.eligible;
    if (data.eligible) {
      btnEl.textContent = 'Claim ' + formatCurrency(data.amount);
    } else {
      btnEl.textContent = 'Claim';
    }
  }
}

// Attach cashback claim handlers
document.addEventListener('DOMContentLoaded', function() {
  ['daily', 'weekly', 'monthly'].forEach(tier => {
    const btn = document.getElementById('claim' + capitalize(tier) + 'Btn');
    if (btn) {
      btn.addEventListener('click', function() {
        if (!this.disabled) {
          claimCashback(tier);
        }
      });
    }
  });
});

/**
 * Claim cashback for a specific tier
 * @param {string} tier - 'daily' | 'weekly' | 'monthly'
 */
function claimCashback(tier) {
  // ===== BACKEND CALL =====
  // fetch('/api/bonus/claim-cashback', {
  //   method: 'POST',
  //   body: JSON.stringify({ tier: tier })
  // });

  const btn = document.getElementById('claim' + capitalize(tier) + 'Btn');
  if (btn) {
    btn.textContent = 'Processing...';
    btn.disabled = true;

    setTimeout(() => {
      showToast('💰 ' + capitalize(tier) + ' cashback claimed!');
      BonusState.cashback[tier].eligible = false;
      BonusState.cashback[tier].amount = 0;
      renderCashback();
    }, 1200);
  }
}

/* ========================================= */
/* REFERRAL SECTION                          */
/* ========================================= */

/**
 * Load referral data from backend
 * REPLACE this with your actual API call
 */
function loadReferralData() {
  // ===== DEMO DATA =====
  const demoData = {
    code: 'REF2024BD',
    totalReferred: 12,
    activeToday: 3,
    totalDeposit: 85000.00,
    reward: 17000.00,
    users: [
      { name: 'Rahim H.', deposit: 5000, reward: 1000 },
      { name: 'Karim A.', deposit: 3000, reward: 600 },
      { name: 'Sadia K.', deposit: 8000, reward: 1600 },
      { name: 'Tanvir M.', deposit: 2000, reward: 400 },
      { name: 'Nusrat J.', deposit: 6000, reward: 1200 }
    ]
  };
  // =====================

  BonusState.referral = demoData;
  renderReferral();
}

/**
 * Render referral UI
 */
function renderReferral() {
  const data = BonusState.referral;

  // Stats
  const totalRefEl = document.getElementById('totalReferred');
  const activeEl = document.getElementById('activeReferred');
  const depositEl = document.getElementById('referredTotalDeposit');
  const rewardEl = document.getElementById('referralRewardAmount');
  const codeEl = document.getElementById('referralCode');

  if (totalRefEl) totalRefEl.textContent = data.totalReferred;
  if (activeEl) activeEl.textContent = data.activeToday;
  if (depositEl) depositEl.textContent = formatCurrency(data.totalDeposit);
  if (rewardEl) rewardEl.textContent = formatCurrency(data.reward);
  if (codeEl) codeEl.textContent = data.code;

  // User list
  const listEl = document.getElementById('referralUserList');
  if (listEl && data.users.length > 0) {
    listEl.innerHTML = data.users.map(user => `
      <div class="referral-user-item">
        <div class="referral-user-info">
          <span class="referral-user-name">${escapeHtml(user.name)}</span>
          <span class="referral-user-deposit">Deposited: ${formatCurrency(user.deposit)}</span>
        </div>
        <span class="referral-user-reward">+${formatCurrency(user.reward)}</span>
      </div>
    `).join('');
  }
}

/**
 * Copy referral code to clipboard
 */
function copyReferralCode() {
  const code = BonusState.referral.code;
  
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(code).then(() => {
      showToast('📋 Referral code copied: ' + code);
    }).catch(() => {
      fallbackCopy(code);
    });
  } else {
    fallbackCopy(code);
  }
}

/**
 * Fallback copy method for older browsers
 */
function fallbackCopy(text) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  
  try {
    document.execCommand('copy');
    showToast('📋 Referral code copied: ' + text);
  } catch (err) {
    showToast('❌ Failed to copy. Code: ' + text);
  }
  
  document.body.removeChild(textarea);
}

/* ========================================= */
/* UTILITY FUNCTIONS                         */
/* ========================================= */

/**
 * Format number as currency (৳)
 * @param {number} amount
 * @returns {string}
 */
function formatCurrency(amount) {
  if (amount === undefined || amount === null) return '৳ 0.00';
  return '৳ ' + Number(amount).toLocaleString('en-BD', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

/**
 * Format date as DD/MM/YYYY
 * @param {Date} date
 * @returns {string}
 */
function formatDate(date) {
  const d = new Date(date);
  const day = padZero(d.getDate());
  const month = padZero(d.getMonth() + 1);
  const year = d.getFullYear();
  return day + ' / ' + month + ' / ' + year;
}

/**
 * Format time as HH:MM:SS
 * @param {Date} date
 * @returns {string}
 */
function formatTime(date) {
  const d = new Date(date);
  return padZero(d.getHours()) + ' : ' + 
         padZero(d.getMinutes()) + ' : ' + 
         padZero(d.getSeconds());
}

/**
 * Pad number with leading zero
 * @param {number} num
 * @returns {string}
 */
function padZero(num) {
  return num < 10 ? '0' + num : String(num);
}

/**
 * Capitalize first letter
 * @param {string} str
 * @returns {string}
 */
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Escape HTML to prevent XSS
 * @param {string} text
 * @returns {string}
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Show toast notification
 * @param {string} message
 */
function showToast(message) {
  // Remove existing toast
  const existing = document.querySelector('.bonus-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'bonus-toast';
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%) translateY(-100px);
    background: linear-gradient(135deg, #00c853, #00e676);
    color: #fff;
    padding: 14px 28px;
    border-radius: 10px;
    font-weight: 700;
    font-size: 14px;
    z-index: 9999;
    box-shadow: 0 4px 20px rgba(0,200,83,0.3);
    transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    white-space: nowrap;
  `;

  document.body.appendChild(toast);

  // Animate in
  requestAnimationFrame(() => {
    toast.style.transform = 'translateX(-50%) translateY(0)';
  });

  // Auto remove
  setTimeout(() => {
    toast.style.transform = 'translateX(-50%) translateY(-100px)';
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 400);
  }, 3000);
}

/* ========================================= */
/* INITIALIZATION                            */
/* ========================================= */

document.addEventListener('DOMContentLoaded', function() {
  // Load initial tab data
  openBonusTab('deposit');
});

/* ========================================= */
/* BACKEND INTEGRATION GUIDE                 */
/* ========================================= */

/*
 * To connect with your backend, replace the demo data sections:
 *
 * 1. loadDepositBonusData()
 *    → fetch('/api/bonus/deposit-status')
 *    → Returns: { balance, wagerRequired, wagerCompleted, validUntil, bonusMode, status }
 *
 * 2. claimDepositBonus()
 *    → fetch('/api/bonus/claim-deposit', { method: 'POST' })
 *
 * 3. loadCashbackData()
 *    → fetch('/api/bonus/cashback-status')
 *    → Returns: { totalCashback, daily: {...}, weekly: {...}, monthly: {...} }
 *
 * 4. claimCashback(tier)
 *    → fetch('/api/bonus/claim-cashback', { method: 'POST', body: { tier } })
 *
 * 5. loadReferralData()
 *    → fetch('/api/bonus/referral-status')
 *    → Returns: { code, totalReferred, activeToday, totalDeposit, reward, users: [...] }
 *
 * 6. Bonus Mode Toggle
 *    → fetch('/api/bonus/toggle-mode', { method: 'POST', body: { mode: boolean } })
 *
 * All API calls should update BonusState and call render functions.
 */
"""

with open('/mnt/agents/output/mybonus.js', 'w', encoding='utf-8') as f:
    f.write(js_content)

print("✅ mybonus.js created successfully!")
print(f"📄 Size: {len(js_content)} characters | ~{len(js_content.splitlines())} lines")
