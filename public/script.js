// 🔐 Utility: Check if user is logged in
function checkAuth() {
  const token = localStorage.getItem('token');
  if (!token) {
    alert("⚠️ Not authenticated. Redirecting to login.");
    window.location.href = '/index.html';
  }
  return token;
}

// 👤 Utility: Fetch current user profile
async function fetchProfile() {
  const token = checkAuth();
  try {
    const res = await fetch('/api/profile', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const user = await res.json();
    if (!res.ok) throw new Error(user.message || 'Failed to fetch user');
    return user;
  } catch (err) {
    console.error("Profile fetch error:", err);
    alert("⚠️ Could not load profile");
  }
}

// 🔓 Utility: Logout
function setupLogout() {
  const btn = document.getElementById('logoutBtn');
  if (btn) {
    btn.addEventListener('click', () => {
      localStorage.removeItem('token');
      alert("🚪 Logged out");
      window.location.href = '/index.html';
    });
  }
}


