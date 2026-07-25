
js_content = """/* ========================================= */
/* ID VERIFICATION — FULL JAVASCRIPT         */
/* ========================================= */

/*
 * NOTE: Replace demo/simulation sections with your backend API calls.
 * All function names match the HTML onclick handlers exactly.
 */

/* ========================================= */
/* GLOBAL STATE                              */
/* ========================================= */

const KycState = {
  country: '',
  countryCode: '',
  frontImage: null,
  backImage: null,
  selfieImage: null,
  cameraStream: null,
  isCameraActive: false,
  verificationStatus: {
    idUploaded: false,
    faceMatched: false,
    verified: false
  }
};

/* ========================================= */
/* UTILITY FUNCTIONS                         */
/* ========================================= */

function formatCurrency(amount) {
  if (amount === undefined || amount === null) return '৳ 0.00';
  return '৳ ' + Number(amount).toLocaleString('en-BD', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function padZero(num) {
  return num < 10 ? '0' + num : String(num);
}

function showToast(message, type = 'success') {
  const existing = document.querySelector('.kyc-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'kyc-toast';
  
  const iconMap = {
    success: 'fa-check-circle',
    error: 'fa-times-circle',
    info: 'fa-info-circle',
    warning: 'fa-exclamation-triangle'
  };
  
  const colorMap = {
    success: 'linear-gradient(135deg, #14805e, #1a9e75)',
    error: 'linear-gradient(135deg, #e74c3c, #ff5252)',
    info: 'linear-gradient(135deg, #2979ff, #448aff)',
    warning: 'linear-gradient(135deg, #f39c12, #ffcc00)'
  };

  toast.innerHTML = `<i class="fas ${iconMap[type] || iconMap.success}"></i> <span>${message}</span>`;
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%) translateY(-100px);
    background: ${colorMap[type] || colorMap.success};
    color: #fff;
    padding: 14px 28px;
    border-radius: 10px;
    font-weight: 700;
    font-size: 14px;
    z-index: 9999;
    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    white-space: nowrap;
    display: flex;
    align-items: center;
    gap: 10px;
  `;

  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.style.transform = 'translateX(-50%) translateY(0)';
  });

  setTimeout(() => {
    toast.style.transform = 'translateX(-50%) translateY(-100px)';
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 400);
  }, 3000);
}

/* ========================================= */
/* COUNTRY SELECTION                         */
/* ========================================= */

/**
 * Update KYC requirements based on selected country
 * Called when country dropdown changes
 */
function updateKycRequirements() {
  const select = document.getElementById('kycCountrySelect');
  if (!select) return;

  const selectedOption = select.options[select.selectedIndex];
  const countryCode = selectedOption.value;
  const dialCode = selectedOption.getAttribute('data-code') || '';

  KycState.country = countryCode;
  KycState.countryCode = dialCode;

  if (!countryCode) {
    showToast('Please select your country', 'warning');
    return;
  }

  // Show selected country info
  const countryName = selectedOption.text.split(' ').slice(1).join(' ').replace(/\(\+\d+\)/, '').trim();
  showToast(`Country set: ${countryName}`, 'info');

  // ===== BACKEND CALL (replace demo) =====
  // fetch('/api/kyc/country-requirements', {
  //   method: 'POST',
  //   body: JSON.stringify({ country: countryCode })
  // })
  // .then(r => r.json())
  // .then(data => {
  //   // Update UI based on country-specific requirements
  // });

  console.log('Country selected:', countryCode, dialCode);
}

/* ========================================= */
/* ID IMAGE UPLOAD & PREVIEW                 */
/* ========================================= */

/**
 * Preview uploaded ID image (front or back)
 * @param {HTMLInputElement} input - file input element
 * @param {string} side - 'front' or 'back'
 */
function previewIdImage(input, side) {
  if (!input.files || input.files.length === 0) return;

  const file = input.files[0];
  
  // Validate file type
  if (!file.type.startsWith('image/')) {
    showToast('Please upload an image file (JPG, PNG)', 'error');
    input.value = '';
    return;
  }

  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    showToast('File size must be less than 5MB', 'error');
    input.value = '';
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    const imgData = e.target.result;
    
    // Store in state
    if (side === 'front') {
      KycState.frontImage = imgData;
    } else {
      KycState.backImage = imgData;
    }

    // Update preview
    updateUploadPreview(side, imgData);
    
    // Update status
    updateUploadStatus(side, 'completed');
    
    // Check if both uploaded
    checkIdUploadComplete();
    
    showToast(`${capitalize(side)} side uploaded successfully!`, 'success');
  };
  
  reader.onerror = function() {
    showToast('Failed to read image. Please try again.', 'error');
  };
  
  reader.readAsDataURL(file);
}

/**
 * Update the upload preview area
 */
function updateUploadPreview(side, imgData) {
  const previewImg = document.getElementById(side + 'PreviewImg');
  const previewContainer = document.getElementById(side + 'Preview');
  const placeholder = previewContainer ? previewContainer.querySelector('.upload-placeholder') : null;

  if (previewImg) {
    previewImg.src = imgData;
    previewImg.style.display = 'block';
  }

  if (placeholder) {
    placeholder.style.display = 'none';
  }

  // Add uploaded class to card
  const card = document.getElementById(side + 'UploadCard');
  if (card) card.classList.add('uploaded');
}

/**
 * Update upload status badge
 */
function updateUploadStatus(side, status) {
  const statusEl = document.getElementById(side + 'Status');
  if (!statusEl) return;

  if (status === 'completed') {
    statusEl.innerHTML = '<i class="fas fa-check-circle"></i> Uploaded';
    statusEl.classList.add('completed');
  } else if (status === 'pending') {
    statusEl.innerHTML = '<i class="fas fa-clock"></i> Pending';
    statusEl.classList.remove('completed');
  }
}

/**
 * Check if both front and back are uploaded
 */
function checkIdUploadComplete() {
  const bothUploaded = KycState.frontImage && KycState.backImage;
  
  if (bothUploaded) {
    KycState.verificationStatus.idUploaded = true;
    updateStatusBar('idUpload', 'completed');
    checkVerifyReady();
    showToast('ID documents uploaded! Proceed to face verification.', 'success');
  }
}

/* ========================================= */
/* CAMERA / SELFIE FUNCTIONS                 */
/* ========================================= */

/**
 * Start the selfie camera
 */
function startSelfieCamera() {
  const video = document.getElementById('selfieVideo');
  const placeholder = document.getElementById('cameraPlaceholder');
  const ovalFrame = document.getElementById('cameraOvalFrame');
  const overlay = document.getElementById('cameraOverlay');
  const startBtn = document.getElementById('cameraStartBtn');
  const actionBtns = document.getElementById('cameraActionBtns');

  if (!video) {
    showToast('Camera element not found', 'error');
    return;
  }

  // Check for camera support
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    showToast('Camera not supported on this device/browser', 'error');
    return;
  }

  // Show loading state
  if (startBtn) {
    startBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Starting...</span>';
    startBtn.disabled = true;
  }

  navigator.mediaDevices.getUserMedia({ 
    video: { 
      facingMode: 'user',
      width: { ideal: 640 },
      height: { ideal: 480 }
    },
    audio: false 
  })
  .then(function(stream) {
    KycState.cameraStream = stream;
    KycState.isCameraActive = true;

    video.srcObject = stream;
    video.style.display = 'block';
    
    if (placeholder) placeholder.style.display = 'none';
    if (ovalFrame) ovalFrame.classList.add('active');
    if (overlay) overlay.style.display = 'flex';

    // Hide start button, show action buttons
    if (startBtn) startBtn.style.display = 'none';
    if (actionBtns) actionBtns.style.display = 'flex';

    showToast('Camera started! Position your face in the oval', 'info');
  })
  .catch(function(err) {
    console.error('Camera error:', err);
    
    if (startBtn) {
      startBtn.innerHTML = '<i class="fas fa-camera"></i> <span>Start Camera</span>';
      startBtn.disabled = false;
    }

    let errorMsg = 'Could not access camera';
    if (err.name === 'NotAllowedError') {
      errorMsg = 'Camera permission denied. Please allow camera access.';
    } else if (err.name === 'NotFoundError') {
      errorMsg = 'No camera found on this device.';
    } else if (err.name === 'NotReadableError') {
      errorMsg = 'Camera is being used by another application.';
    }
    
    showToast(errorMsg, 'error');
  });
}

/**
 * Capture selfie from camera
 */
function captureSelfie() {
  const video = document.getElementById('selfieVideo');
  const canvas = document.getElementById('selfieCanvas');
  const capturedImg = document.getElementById('capturedSelfie');
  const overlay = document.getElementById('cameraOverlay');
  const ovalFrame = document.getElementById('cameraOvalFrame');

  if (!video || !canvas || !KycState.isCameraActive) {
    showToast('Camera is not active', 'error');
    return;
  }

  // Set canvas size to match video
  canvas.width = video.videoWidth || 640;
  canvas.height = video.videoHeight || 480;

  const ctx = canvas.getContext('2d');
  
  // Flip horizontally (mirror effect)
  ctx.translate(canvas.width, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  ctx.setTransform(1, 0, 0, 1, 0, 0);

  // Get image data
  const imageData = canvas.toDataURL('image/png');
  KycState.selfieImage = imageData;

  // Stop camera stream
  stopCamera();

  // Show captured image
  if (capturedImg) {
    capturedImg.src = imageData;
    capturedImg.style.display = 'block';
  }

  if (video) video.style.display = 'none';
  if (overlay) overlay.style.display = 'none';
  if (ovalFrame) ovalFrame.classList.remove('active');

  // Update action buttons
  const actionBtns = document.getElementById('cameraActionBtns');
  if (actionBtns) {
    actionBtns.innerHTML = `
      <button class="camera-capture-btn" onclick="retakeSelfie()">
        <i class="fas fa-redo"></i> Retake
      </button>
      <button class="camera-capture-btn" style="background: linear-gradient(135deg, #14805e, #1a9e75);" onclick="confirmSelfie()">
        <i class="fas fa-check"></i> Confirm
      </button>
    `;
  }

  showToast('Selfie captured! Click Confirm to proceed.', 'success');
}

/**
 * Retake selfie
 */
function retakeSelfie() {
  const capturedImg = document.getElementById('capturedSelfie');
  const placeholder = document.getElementById('cameraPlaceholder');
  const startBtn = document.getElementById('cameraStartBtn');
  const actionBtns = document.getElementById('cameraActionBtns');

  // Hide captured image
  if (capturedImg) capturedImg.style.display = 'none';
  
  // Reset action buttons
  if (actionBtns) {
    actionBtns.innerHTML = `
      <button class="camera-capture-btn" onclick="captureSelfie()">
        <i class="fas fa-camera-retro"></i> Capture
      </button>
      <button class="camera-retake-btn" onclick="retakeSelfie()">
        <i class="fas fa-redo"></i> Retake
      </button>
    `;
    actionBtns.style.display = 'none';
  }

  // Show start button again
  if (startBtn) {
    startBtn.style.display = 'flex';
    startBtn.innerHTML = '<i class="fas fa-camera"></i> <span>Start Camera</span>';
    startBtn.disabled = false;
  }

  if (placeholder) placeholder.style.display = 'flex';

  KycState.selfieImage = null;
  KycState.verificationStatus.faceMatched = false;
  updateStatusBar('faceVerify', 'pending');
  checkVerifyReady();
}

/**
 * Confirm selfie and proceed
 */
function confirmSelfie() {
  // Simulate face matching
  simulateFaceMatch();
}

/**
 * Stop camera stream
 */
function stopCamera() {
  if (KycState.cameraStream) {
    KycState.cameraStream.getTracks().forEach(track => track.stop());
    KycState.cameraStream = null;
  }
  KycState.isCameraActive = false;
}

/* ========================================= */
/* FACE MATCHING / VERIFICATION              */
/* ========================================= */

/**
 * Simulate face matching process
 * REPLACE with actual face recognition API
 */
function simulateFaceMatch() {
  const actionBtns = document.getElementById('cameraActionBtns');
  
  if (actionBtns) {
    actionBtns.innerHTML = `
      <div style="display:flex;align-items:center;gap:10px;color:#14805e;font-weight:700;">
        <i class="fas fa-spinner fa-spin" style="font-size:18px;"></i>
        <span>Matching face...</span>
      </div>
    `;
  }

  // Simulate processing delay
  setTimeout(() => {
    // Demo: always match successfully
    KycState.verificationStatus.faceMatched = true;
    updateStatusBar('faceVerify', 'completed');
    checkVerifyReady();
    
    if (actionBtns) {
      actionBtns.innerHTML = `
        <div style="display:flex;align-items:center;gap:10px;color:#14805e;font-weight:700;">
          <i class="fas fa-check-circle" style="font-size:18px;"></i>
          <span>Face Matched!</span>
        </div>
      `;
    }

    showToast('Face verification successful! Ready to verify.', 'success');
  }, 2500);

  // ===== REAL IMPLEMENTATION =====
  // fetch('/api/kyc/face-match', {
  //   method: 'POST',
  //   body: JSON.stringify({
  //     idFront: KycState.frontImage,
  //     selfie: KycState.selfieImage
  //   })
  // })
  // .then(r => r.json())
  // .then(data => {
  //   if (data.matched) {
  //     KycState.verificationStatus.faceMatched = true;
  //     updateStatusBar('faceVerify', 'completed');
  //     checkVerifyReady();
  //     showToast('Face matched successfully!', 'success');
  //   } else {
  //     showToast('Face did not match. Please retake.', 'error');
  //     retakeSelfie();
  //   }
  // });
}

/* ========================================= */
/* VERIFICATION STATUS BAR                   */
/* ========================================= */

/**
 * Update status bar step
 * @param {string} step - 'idUpload' | 'faceVerify' | 'finalVerify'
 * @param {string} status - 'pending' | 'completed' | 'failed'
 */
function updateStatusBar(step, status) {
  const dotMap = {
    idUpload: 'idStatusDot',
    faceVerify: 'faceStatusDot',
    finalVerify: 'finalStatusDot'
  };

  const itemMap = {
    idUpload: 'idUploadStatus',
    faceVerify: 'faceVerifyStatus',
    finalVerify: 'finalVerifyStatus'
  };

  const dot = document.getElementById(dotMap[step]);
  const item = document.getElementById(itemMap[step]);

  if (dot) {
    dot.className = 'status-dot ' + status;
  }

  if (item) {
    item.classList.remove('active', 'completed');
    if (status === 'completed') item.classList.add('completed');
    else if (status === 'active') item.classList.add('active');
  }

  // Update connectors
  const connectors = document.querySelectorAll('.status-connector');
  
  if (step === 'idUpload' && status === 'completed') {
    if (connectors[0]) connectors[0].classList.add('active');
  }
  
  if (step === 'faceVerify' && status === 'completed') {
    if (connectors[1]) connectors[1].classList.add('active');
  }
}

/**
 * Check if verify button should be enabled
 */
function checkVerifyReady() {
  const verifyBtn = document.getElementById('verifyNowBtn');
  const note = document.getElementById('verifyNote');
  
  const ready = KycState.verificationStatus.idUploaded && 
                KycState.verificationStatus.faceMatched;

  if (verifyBtn) {
    verifyBtn.disabled = !ready;
    
    if (ready) {
      verifyBtn.innerHTML = `
        <i class="fas fa-fingerprint"></i>
        <span>Verify Now</span>
        <div class="btn-shine"></div>
      `;
    } else {
      verifyBtn.innerHTML = `
        <i class="fas fa-lock"></i>
        <span>Verify Now</span>
        <div class="btn-shine"></div>
      `;
    }
  }

  if (note) {
    if (ready) {
      note.innerHTML = '<i class="fas fa-check-circle" style="color:#14805e;"></i> All requirements met. Click Verify Now!';
      note.style.color = '#14805e';
    } else {
      note.innerHTML = '<i class="fas fa-lock"></i> Upload both ID sides and capture selfie to enable verification';
      note.style.color = '';
    }
  }
}

/* ========================================= */
/* MAIN VERIFICATION                         */
/* ========================================= */

/**
 * Start the full verification process
 */
function startVerification() {
  if (!KycState.verificationStatus.idUploaded || !KycState.verificationStatus.faceMatched) {
    showToast('Please complete all steps before verifying', 'warning');
    return;
  }

  const verifyBtn = document.getElementById('verifyNowBtn');
  
  if (verifyBtn) {
    verifyBtn.disabled = true;
    verifyBtn.innerHTML = `
      <i class="fas fa-spinner fa-spin"></i>
      <span>Verifying...</span>
    `;
  }

  // Simulate verification process
  setTimeout(() => {
    // Demo: always approve
    KycState.verificationStatus.verified = true;
    updateStatusBar('finalVerify', 'completed');
    showVerificationResult(true);
    
    // Simulate email notification
    simulateEmailNotification();
    
    showToast('🎉 ID Verification Approved!', 'success');
  }, 3000);

  // ===== REAL IMPLEMENTATION =====
  // fetch('/api/kyc/verify', {
  //   method: 'POST',
  //   body: JSON.stringify({
  //     country: KycState.country,
  //     idFront: KycState.frontImage,
  //     idBack: KycState.backImage,
  //     selfie: KycState.selfieImage
  //   })
  // })
  // .then(r => r.json())
  // .then(data => {
  //   if (data.approved) {
  //     KycState.verificationStatus.verified = true;
  //     updateStatusBar('finalVerify', 'completed');
  //     showVerificationResult(true, data);
  //     showToast('ID Verification Approved!', 'success');
  //   } else {
  //     showVerificationResult(false, data);
  //     showToast(data.message || 'Verification failed', 'error');
  //   }
  // })
  // .catch(err => {
  //   showToast('Verification error. Please try again.', 'error');
  //   if (verifyBtn) {
  //     verifyBtn.disabled = false;
  //     verifyBtn.innerHTML = '<i class="fas fa-fingerprint"></i><span>Verify Now</span>';
  //   }
  // });
}

/**
 * Show verification result
 * @param {boolean} approved - true for approved, false for rejected
 * @param {object} data - optional response data
 */
function showVerificationResult(approved, data = {}) {
  const resultBox = document.getElementById('kycResultBox');
  const icon = document.getElementById('resultIcon');
  const title = document.getElementById('resultTitle');
  const desc = document.getElementById('resultDesc');
  const timeEl = document.getElementById('verifyTime');
  const refEl = document.getElementById('verifyRefId');

  if (!resultBox) return;

  resultBox.style.display = 'block';
  resultBox.scrollIntoView({ behavior: 'smooth', block: 'center' });

  const now = new Date();
  const refId = data.refId || 'KYC-' + Math.random().toString(36).substr(2, 8).toUpperCase();

  if (timeEl) timeEl.textContent = padZero(now.getHours()) + ':' + padZero(now.getMinutes());
  if (refEl) refEl.textContent = refId;

  if (approved) {
    if (icon) {
      icon.innerHTML = '<i class="fas fa-check-circle"></i>';
      icon.className = 'result-icon';
    }
    if (title) title.textContent = 'Verification Approved!';
    if (desc) {
      desc.innerHTML = 'Your identity has been successfully verified. ' +
        'A confirmation email has been sent to your registered address. ' +
        'You can now enjoy full access to all features.';
    }
    resultBox.style.borderColor = '#14805e';
    resultBox.style.background = 'linear-gradient(135deg, rgba(20, 128, 94, 0.08), rgba(20, 128, 94, 0.03))';
  } else {
    if (icon) {
      icon.innerHTML = '<i class="fas fa-times-circle"></i>';
      icon.className = 'result-icon rejected';
    }
    if (title) title.textContent = 'Verification Failed';
    if (desc) {
      desc.innerHTML = data.message || 
        'We could not verify your identity. Please ensure your ID is clear ' +
        'and your face matches the ID photo. You can retry the process.';
    }
    resultBox.style.borderColor = '#e74c3c';
    resultBox.style.background = 'linear-gradient(135deg, rgba(231, 76, 60, 0.08), rgba(231, 76, 60, 0.03))';
  }
}

/**
 * Close verification result
 */
function closeKycResult() {
  const resultBox = document.getElementById('kycResultBox');
  if (resultBox) {
    resultBox.style.opacity = '0';
    resultBox.style.transform = 'translateY(10px)';
    resultBox.style.transition = 'all 0.3s ease';
    setTimeout(() => {
      resultBox.style.display = 'none';
      resultBox.style.opacity = '';
      resultBox.style.transform = '';
      resultBox.style.transition = '';
    }, 300);
  }
}

/**
 * Simulate email notification
 * REPLACE with actual email API
 */
function simulateEmailNotification() {
  console.log('[EMAIL] Sending verification confirmation email...');
  
  // ===== BACKEND CALL =====
  // fetch('/api/notifications/send-email', {
  //   method: 'POST',
  //   body: JSON.stringify({
  //     type: 'kyc_verified',
  //     userId: 'USER_ID',
  //     timestamp: new Date().toISOString()
  //   })
  // });
}

/* ========================================= */
/* COPY REFERRAL CODE                        */
/* ========================================= */

function copyReferralCode() {
  const codeEl = document.getElementById('referralCode');
  const code = codeEl ? codeEl.textContent : 'ABC123';
  
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(code).then(() => {
      showToast('📋 Referral code copied: ' + code, 'success');
    }).catch(() => {
      fallbackCopyText(code);
    });
  } else {
    fallbackCopyText(code);
  }
}

function fallbackCopyText(text) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  
  try {
    document.execCommand('copy');
    showToast('📋 Referral code copied: ' + text, 'success');
  } catch (err) {
    showToast('❌ Failed to copy. Code: ' + text, 'error');
  }
  
  document.body.removeChild(textarea);
}

/* ========================================= */
/* HELPER                                    */
/* ========================================= */

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/* ========================================= */
/* INITIALIZATION                            */
/* ========================================= */

document.addEventListener('DOMContentLoaded', function() {
  // Initialize status bar
  updateStatusBar('idUpload', 'pending');
  updateStatusBar('faceVerify', 'pending');
  updateStatusBar('finalVerify', 'pending');
  
  // Ensure verify button is disabled initially
  checkVerifyReady();
  
  console.log('ID Verification JS loaded successfully');
});

// Cleanup on page unload
window.addEventListener('beforeunload', function() {
  stopCamera();
});
"""

with open('/mnt/agents/output/id-verification.js', 'w', encoding='utf-8') as f:
    f.write(js_content)

print("✅ ID Verification JS created!")
print(f"📄 Size: {len(js_content)} characters | ~{len(js_content.splitlines())} lines")

