document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("loginForm");
  const loginIdInput = document.getElementById("loginId");
  const passwordInput = document.getElementById("password");

  const supabase = window.supabase.createClient(
    "https://teafrrntffzraoiuurie.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlYWZycm50ZmZ6cmFvaXV1cmllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1OTMwMzgsImV4cCI6MjA2OTE2OTAzOH0.EZ7Lkxo_H1lZMMMH9OmjqKm3ALcIRripTzYrz7FosZs"
  );

  loginForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const loginId = loginIdInput.value.trim().toLowerCase();
    const password = passwordInput.value;

    let emailToLogin = loginId;

    // Check if input is NOT an email → treat as username
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginId);

    if (!isEmail) {
      // Lookup email from profiles table using username
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("email")
        .eq("username", loginId)
        .maybeSingle();

      if (error || !profile) {
        alert("Username not found. Please check and try again.");
        return;
      }

      emailToLogin = profile.email;
    }

    // Now login using email + password
    const { data, error } = await supabase.auth.signInWithPassword({
      email: emailToLogin,
      password,
    });

    if (error) {
      alert("Login failed: Invalid email or password.");
    } else {
      alert("Login successful!");
      window.location.href = "index.html"; // or your dashboard/home page
    }
  });
});
