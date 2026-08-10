function openMyReferral() {

    closeProfileSidebar();

    lockBodyScroll();

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

    unlockBodyScroll();

}
