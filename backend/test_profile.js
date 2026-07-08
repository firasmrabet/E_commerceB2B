import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

async function test() {
    console.log("Supabase URL:", supabaseUrl);
    console.log("Supabase Key (first 10 chars):", supabaseKey ? supabaseKey.substring(0, 10) : 'null');
    
    if (!supabase) {
        console.log("No supabase client");
        return;
    }

    try {
        const { data, error } = await supabase
            .from('client_profiles')
            .upsert({
                user_id: 'bc016094-2a37-416a-b0b9-76eb7b272238', // User ID from user's logs
                name_encrypted: 'test',
                phone_encrypted: 'test',
                phone_hash: crypto.randomBytes(8).toString('hex'),
                created_at: new Date().toISOString()
            }, { onConflict: 'user_id' });

        console.log("Data:", data);
        console.log("Error:", error);
    } catch (e) {
        console.error("Exception:", e);
    }
}

test();
