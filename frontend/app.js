const API_URL = 'https://course-management-system-556e.onrender.com/';
let authToken = localStorage.getItem('token') || '';
let currentUser = JSON.parse(localStorage.getItem('user') || 'null');
let isRegisterMode = false;

document.addEventListener('DOMContentLoaded', () => {
  updateUIForUser();
  fetchCourses();
  if (currentUser) fetchMyEnrollments();
});

function updateUIForUser() {
  const authBtn = document.getElementById('authBtn');
  const userBadge = document.getElementById('userBadge');
  const adminBtn = document.getElementById('adminCreateBtn');
  const myLearning = document.getElementById('myLearningSection');

  if (currentUser) {
    userBadge.style.display = 'inline-block';
    userBadge.textContent = `${currentUser.name} (${currentUser.role.toUpperCase()})`;
    authBtn.textContent = 'Logout';
    authBtn.onclick = handleLogout;

    adminBtn.style.display = currentUser.role === 'admin' ? 'inline-block' : 'none';
    myLearning.style.display = currentUser.role === 'student' ? 'block' : 'none';
  } else {
    userBadge.style.display = 'none';
    authBtn.textContent = 'Login / Register';
    authBtn.onclick = toggleAuthModal;
    adminBtn.style.display = 'none';
    myLearning.style.display = 'none';
  }
}

async function fetchCourses() {
  const search = document.getElementById('searchInput').value;
  const category = document.getElementById('categoryFilter').value;

  const res = await fetch(`${API_URL}/courses?search=${encodeURIComponent(search)}&category=${encodeURIComponent(category)}`);
  const data = await res.json();

  const grid = document.getElementById('catalogGrid');
  grid.innerHTML = '';

  if (data.courses) {
    data.courses.forEach(course => {
      grid.innerHTML += `
        <div class="card">
          <div>
            <span class="tag">${course.category} • ${course.level}</span>
            <h3>${course.title}</h3>
            <p>${course.description}</p>
          </div>
          ${currentUser && currentUser.role === 'student' ? 
            `<button onclick="enrollCourse('${course._id}')">Enroll Now</button>` : ''}
        </div>
      `;
    });
  }
}

async function fetchMyEnrollments() {
  if (!authToken) return;
  const res = await fetch(`${API_URL}/enrollments/my-courses`, {
    headers: { 'Authorization': `Bearer ${authToken}` }
  });
  const data = await res.json();
  const grid = document.getElementById('myCoursesGrid');
  grid.innerHTML = '';

  if (data.enrollments) {
    data.enrollments.forEach(item => {
      grid.innerHTML += `
        <div class="card">
          <div>
            <h3>${item.course.title}</h3>
            <p>Progress: ${item.overallProgress}%</p>
            <div class="progress-bar-bg">
              <div class="progress-bar-fill" style="width: ${item.overallProgress}%;"></div>
            </div>
          </div>
          <button onclick="simulateProgress('${item.course._id}')">Complete Next Lesson</button>
        </div>
      `;
    });
  }
}

async function enrollCourse(courseId) {
  const res = await fetch(`${API_URL}/enrollments/${courseId}`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${authToken}` }
  });
  const data = await res.json();
  alert(data.message || data.error);
  if (data.success) fetchMyEnrollments();
}

async function simulateProgress(courseId) {
  // Pass dynamic mock lesson ID for progress recalculation
  const res = await fetch(`${API_URL}/enrollments/${courseId}/progress`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    },
    body: JSON.stringify({ lessonId: new Date().getTime().toString() })
  });
  const data = await res.json();
  if (data.success) fetchMyEnrollments();
}

// Auth Handlers
function toggleAuthModal() {
  const modal = document.getElementById('authModal');
  modal.style.display = modal.style.display === 'flex' ? 'none' : 'flex';
}

function toggleAuthMode() {
  isRegisterMode = !isRegisterMode;
  document.getElementById('modalTitle').textContent = isRegisterMode ? 'Register Account' : 'Account Access';
  document.getElementById('authName').style.display = isRegisterMode ? 'block' : 'none';
  document.getElementById('authRole').style.display = isRegisterMode ? 'block' : 'none';
  document.getElementById('submitAuthBtn').textContent = isRegisterMode ? 'Register' : 'Login';
}

async function handleAuthSubmit(e) {
  e.preventDefault();
  const endpoint = isRegisterMode ? '/auth/register' : '/auth/login';
  const payload = {
    email: document.getElementById('authEmail').value,
    password: document.getElementById('authPassword').value
  };

  if (isRegisterMode) {
    payload.name = document.getElementById('authName').value;
    payload.role = document.getElementById('authRole').value;
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  if (data.success) {
    authToken = data.token;
    currentUser = data.user;
    localStorage.setItem('token', authToken);
    localStorage.setItem('user', JSON.stringify(currentUser));
    updateUIForUser();
    toggleAuthModal();
    fetchCourses();
    if (currentUser.role === 'student') fetchMyEnrollments();
  } else {
    alert(data.error);
  }
}

function handleLogout() {
  localStorage.clear();
  authToken = '';
  currentUser = null;
  updateUIForUser();
  fetchCourses();
}