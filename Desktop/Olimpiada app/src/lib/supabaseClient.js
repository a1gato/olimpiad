import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://awgxwsdroufycxjqsdtw.supabase.co'
const supabaseKey = 'sb_publishable_O4BLoy1kzvcctuhnhxBZFg_AWfB7EaT'

export const supabase = createClient(supabaseUrl, supabaseKey)
