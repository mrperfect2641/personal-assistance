const SUPABASE_URL = 'https://teafrrntffzraoiuurie.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlYWZycm50ZmZ6cmFvaXV1cmllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1OTMwMzgsImV4cCI6MjA2OTE2OTAzOH0.EZ7Lkxo_H1lZMMMH9OmjqKm3ALcIRripTzYrz7FosZs';
// const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

document.getElementById('signupForm').addEventListener('submit', async e => {
  e.preventDefault();
  const email = e.target.email.value;
  const password = e.target.password.value;

//   const { data, error } = await supabase.auth.signUp({ email, password });
    const { data, error } = await supabaseClient.auth.signUp({ email, password });
        if (error) {
            alert('Sign-up failed: ' + error.message);
        } else {
            alert('A confirmation email has been sent. Please verify and then log in.');
            window.location.href = 'login.html';
        }
        });
