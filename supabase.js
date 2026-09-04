// =============================
// SAFIKI CASINO - SUPABASE
// =============================

const SUPABASE_URL = "https://dijuduhvleunvwmnncue.supabase.co";

const SUPABASE_KEY = "sb_publishable_dw-uENrowls3CoIxyJamJg_vtpR7wR3";

window.supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

console.log("✅ Supabase Connected");
