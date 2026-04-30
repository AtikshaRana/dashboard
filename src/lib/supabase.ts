import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://ynzrhtukyyeiuvtoqiif.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_d0QSNfhwiLVUPbXEWdInFg_1rBKymZG";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
