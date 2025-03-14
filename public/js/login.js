document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');
  
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
  
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
  
      try {
        const response = await fetch('/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        });
  
        const data = await response.json();
  
        if (response.ok && data.success) {
          console.log('[DEBUG] Login success, redirecting to:', data.redirectTo);
          window.location.href = data.redirectTo;
        } else {
          console.log('[DEBUG] Login failed:', data.error);
          errorMessage.textContent = data.error || 'Login failed';
          errorMessage.style.display = 'block';
        }
  
      } catch (err) {
        console.error('[DEBUG] Fetch error:', err);
        errorMessage.textContent = 'Something went wrong. Please try again later.';
        errorMessage.style.display = 'block';
      }
    });
  });
  
  