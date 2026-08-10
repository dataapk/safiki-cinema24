function openMyReferral() {

    // Profile sidebar বন্ধ
    closeProfileSidebar();

    // My Referral section open
    const section =
        document.getElementById("referralBonusContent");

    if (section) {
        section.style.display = "block";
    }

}


function closeMyReferral() {

    const section =
        document.getElementById("referralBonusContent");

    if (section) {
        section.style.display = "none";
    }

}
