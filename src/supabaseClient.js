import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xryxtzhbthpuulrcbeqv.supabase.co';

const supabaseAnonKey = 'sb_publishable_C296y9tpYQSrEmHlacYJYA_lMdo1wvY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
