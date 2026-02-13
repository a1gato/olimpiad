import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://awgxwsdroufycxjqsdtw.supabase.co'
const supabaseKey = 'sb_publishable_O4BLoy1kzvcctuhnhxBZFg_AWfB7EaT'
const supabase = createClient(supabaseUrl, supabaseKey)

async function createAdmin() {
    const email = 'admin@example.com'
    const password = 'admin1'

    console.log(`Creating user: ${email}...`)

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
    })

    if (error) {
        console.error('Error creating user:', error.message)
    } else {
        console.log('User created successfully:', data.user)
        console.log('NOTE: If email confirmation is enabled, you need to confirm it in the Supabase dashboard.')
    }
}

createAdmin()
