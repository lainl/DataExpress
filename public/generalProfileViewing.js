
async function loadUserProfile(userId) {
  try {
    const response = await fetch(`/users/${userId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch user data');
    }

    const user = await response.json();

    document.getElementById('profilePic').src = user.profilePic || '/default-profile.jpg';
    document.getElementById('userName').textContent = user.username;
    document.getElementById('userPhone').textContent = user.phoneNumber || 'N/A';
    document.getElementById('userProfession').textContent = user.profession || 'N/A';
    document.getElementById('userBio').textContent = user.bio || 'N/A';
    document.getElementById('userInterests').textContent = user.intrestes?.join(', ') || 'N/A';
  } catch (error) {
    console.error('Error loading user profile:', error);
    alert('Failed to load user profile');
  }
}


window.addEventListener('load', () => {
  const currentUserId = '<%= user?._id %>'; 
  if (currentUserId) {
    loadUserProfile(currentUserId);
  }
});