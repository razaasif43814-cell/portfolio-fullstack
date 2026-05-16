/* ═══════════════════════════════════════════════════════
   admin.js — Admin Panel Logic (Dashboard, Users, Projects, Messages, Blogs)
═══════════════════════════════════════════════════════ */

/* ── Helpers ── */
function getToken() {
  return document.cookie.split(';').map(c=>c.trim()).find(c=>c.startsWith('access_token='))?.split('=')[1]
    || localStorage.getItem('token') || '';
}
function authHeaders() {
  return { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + getToken() };
}
async function api(url, method, body) {
  var opts = { method: method || 'GET', headers: authHeaders(), credentials: 'same-origin' };
  if (body) opts.body = JSON.stringify(body);
  var res = await fetch(url, opts);
  return { ok: res.ok, status: res.status, data: await res.json() };
}
function formatDate(iso) {
  if (!iso) return '—';
  var d = new Date(iso);
  return d.toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' });
}
function truncate(str, len) { return str && str.length > len ? str.slice(0, len) + '…' : (str || ''); }
function escapeHtml(t) {
  var d = document.createElement('div'); d.textContent = t || ''; return d.innerHTML;
}

/* ── Sidebar Toggle (mobile) ── */
function initSidebar() {
  var sidebar = document.getElementById('admin-sidebar');
  var toggle = document.getElementById('sidebar-toggle');
  var close = document.getElementById('sidebar-close');
  if (toggle) toggle.onclick = function() { sidebar.classList.toggle('open'); };
  if (close) close.onclick = function() { sidebar.classList.remove('open'); };

  var logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.onclick = async function() {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' });
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    };
  }
}

/* ══════════════════════════════════════════════════════
   DASHBOARD
══════════════════════════════════════════════════════ */
async function initAdminDashboard() {
  initSidebar();
  // Load stats
  try {
    var r = await api('/api/stats');
    if (r.ok) {
      var s = r.data.data;
      document.getElementById('stat-users').textContent = s.users || 0;
      document.getElementById('stat-projects').textContent = s.projects || 0;
      document.getElementById('stat-messages').textContent = s.messages || 0;
      document.getElementById('stat-unread').textContent = s.unread_messages || 0;
      document.getElementById('stat-blogs').textContent = s.blogs || 0;
      document.getElementById('stat-published').textContent = s.published_blogs || 0;
      var badge = document.getElementById('msg-badge');
      if (badge && s.unread_messages > 0) badge.textContent = s.unread_messages;
    }
  } catch(e) { console.error('Stats error:', e); }

  // Load recent messages
  try {
    var mr = await api('/api/messages?per_page=5');
    if (mr.ok) {
      var tbody = document.getElementById('recent-messages-body');
      if (!mr.data.data.length) { tbody.innerHTML = '<tr><td colspan="4" class="loading-cell">No messages yet</td></tr>'; return; }
      tbody.innerHTML = mr.data.data.map(function(m) {
        return '<tr><td>' + escapeHtml(m.from_name) + '</td><td>' + escapeHtml(truncate(m.subject,30)) +
          '</td><td>' + formatDate(m.created_at) + '</td><td><span class="status-badge ' +
          (m.is_read ? 'read' : 'unread') + '">' + (m.is_read ? 'Read' : 'New') + '</span></td></tr>';
      }).join('');
    }
  } catch(e) {}

  // Notifications
  var bell = document.getElementById('notification-bell');
  var panel = document.getElementById('notif-panel');
  var notifClose = document.getElementById('notif-close');
  if (bell) bell.onclick = function() { panel.style.display = panel.style.display === 'none' ? 'block' : 'none'; };
  if (notifClose) notifClose.onclick = function() { panel.style.display = 'none'; };

  // Socket.IO live notifications
  if (typeof io !== 'undefined') {
    var socket = io();
    socket.on('new_notification', function(data) {
      var dot = document.getElementById('notif-dot');
      if (dot) dot.style.display = 'block';
      var list = document.getElementById('notif-list');
      var empty = list.querySelector('.notif-empty');
      if (empty) empty.remove();
      var item = document.createElement('div');
      item.className = 'notif-item';
      item.innerHTML = '<i class="fas fa-bell"></i><div><strong>' + escapeHtml(data.title) +
        '</strong><br><small>' + escapeHtml(data.message) + '</small></div>';
      list.prepend(item);
    });
  }

  // Load username
  try {
    var ur = await api('/api/auth/me');
    if (ur.ok) {
      var un = document.getElementById('sidebar-username');
      if (un) un.textContent = ur.data.user.name;
    }
  } catch(e) {}
}

/* ══════════════════════════════════════════════════════
   USERS PAGE
══════════════════════════════════════════════════════ */
async function initUsersPage() {
  initSidebar();
  try {
    var r = await api('/api/users');
    if (r.status === 401 || r.status === 403) { window.location.href = '/login'; return; }
    var tbody = document.getElementById('users-body');
    var count = document.getElementById('user-count');
    if (count) count.textContent = r.data.total + ' users';
    if (!r.data.data.length) { tbody.innerHTML = '<tr><td colspan="6" class="loading-cell">No users</td></tr>'; return; }
    tbody.innerHTML = r.data.data.map(function(u) {
      return '<tr><td>' + escapeHtml(u.name) + '</td><td>' + escapeHtml(u.email) +
        '</td><td><span class="status-badge ' + u.role + '">' + u.role + '</span></td><td>' +
        formatDate(u.created_at) + '</td><td>' + formatDate(u.last_login) +
        '</td><td class="table-actions">' +
        '<button class="tbl-btn" onclick="toggleRole(\'' + u.id + '\',\'' + u.role + '\')"><i class="fas fa-exchange-alt"></i></button>' +
        '<button class="tbl-btn danger" onclick="deleteUser(\'' + u.id + '\')"><i class="fas fa-trash"></i></button>' +
        '</td></tr>';
    }).join('');
  } catch(e) { console.error(e); }
}

async function toggleRole(id, current) {
  var newRole = current === 'admin' ? 'user' : 'admin';
  if (!confirm('Change role to ' + newRole + '?')) return;
  await api('/api/users/' + id + '/role', 'PUT', { role: newRole });
  initUsersPage();
}

async function deleteUser(id) {
  if (!confirm('Delete this user?')) return;
  await api('/api/users/' + id, 'DELETE');
  initUsersPage();
}

/* ══════════════════════════════════════════════════════
   PROJECTS PAGE
══════════════════════════════════════════════════════ */
async function initProjectsPage() {
  initSidebar();
  loadProjects();

  var modal = document.getElementById('project-modal');
  document.getElementById('add-project-btn').onclick = function() {
    document.getElementById('modal-title').textContent = 'Add Project';
    document.getElementById('project-form').reset();
    document.getElementById('project-id').value = '';
    modal.style.display = 'flex';
  };
  document.getElementById('modal-close').onclick = function() { modal.style.display = 'none'; };
  modal.onclick = function(e) { if (e.target === modal) modal.style.display = 'none'; };

  document.getElementById('project-form').onsubmit = async function(e) {
    e.preventDefault();
    var id = document.getElementById('project-id').value;
    var payload = {
      title: document.getElementById('proj-title').value,
      description: document.getElementById('proj-desc').value,
      date: document.getElementById('proj-date').value,
      category: document.getElementById('proj-category').value || 'web app',
      image: document.getElementById('proj-image').value,
      tags: document.getElementById('proj-tags').value.split(',').map(function(t){return t.trim()}).filter(Boolean),
      github: document.getElementById('proj-github').value,
      webapp: document.getElementById('proj-webapp').value,
    };
    var r = id ? await api('/api/projects/' + id, 'PUT', payload) : await api('/api/projects', 'POST', payload);
    var fb = document.getElementById('project-feedback');
    if (r.ok) { fb.textContent = '✅ Saved!'; fb.className = 'auth-feedback success'; setTimeout(function(){modal.style.display='none';loadProjects()},600); }
    else { fb.textContent = r.data.message; fb.className = 'auth-feedback error'; }
  };
}

async function loadProjects() {
  var r = await api('/api/projects');
  var tbody = document.getElementById('projects-body');
  var count = document.getElementById('project-count');
  if (count) count.textContent = r.data.total + ' projects';
  if (!r.data.data.length) { tbody.innerHTML = '<tr><td colspan="6" class="loading-cell">No projects</td></tr>'; return; }
  tbody.innerHTML = r.data.data.map(function(p) {
    var imgHtml = p.image ? '<img src="'+escapeHtml(p.image)+'" class="table-img" />' : '—';
    var tags = (p.tags||[]).map(function(t){return '<span class="tag">'+escapeHtml(t)+'</span>'}).join(' ');
    return '<tr><td>'+imgHtml+'</td><td>'+escapeHtml(p.title)+'</td><td>'+escapeHtml(p.category)+
      '</td><td>'+tags+'</td><td>'+escapeHtml(p.date)+'</td><td class="table-actions">'+
      '<button class="tbl-btn" onclick="editProject(\''+p.id+'\')"><i class="fas fa-edit"></i></button>'+
      '<button class="tbl-btn danger" onclick="deleteProject(\''+p.id+'\')"><i class="fas fa-trash"></i></button></td></tr>';
  }).join('');
}

async function editProject(id) {
  var r = await api('/api/projects/' + id);
  if (!r.ok) return;
  var p = r.data.data;
  document.getElementById('modal-title').textContent = 'Edit Project';
  document.getElementById('project-id').value = p.id;
  document.getElementById('proj-title').value = p.title;
  document.getElementById('proj-desc').value = p.description;
  document.getElementById('proj-date').value = p.date;
  document.getElementById('proj-category').value = p.category;
  document.getElementById('proj-image').value = p.image;
  document.getElementById('proj-tags').value = (p.tags||[]).join(', ');
  document.getElementById('proj-github').value = p.github;
  document.getElementById('proj-webapp').value = p.webapp;
  document.getElementById('project-modal').style.display = 'flex';
}

async function deleteProject(id) {
  if (!confirm('Delete this project?')) return;
  await api('/api/projects/' + id, 'DELETE');
  loadProjects();
}

/* ══════════════════════════════════════════════════════
   MESSAGES PAGE
══════════════════════════════════════════════════════ */
async function initMessagesPage() {
  initSidebar();
  var r = await api('/api/messages');
  if (r.status === 401 || r.status === 403) { window.location.href = '/login'; return; }
  var tbody = document.getElementById('messages-body');
  var count = document.getElementById('msg-count');
  if (count) count.textContent = r.data.total + ' messages · ' + r.data.unread + ' unread';
  if (!r.data.data.length) { tbody.innerHTML = '<tr><td colspan="7" class="loading-cell">No messages</td></tr>'; return; }
  tbody.innerHTML = r.data.data.map(function(m) {
    return '<tr><td><span class="status-badge '+(m.is_read?'read':'unread')+'">'+(m.is_read?'Read':'New')+'</span></td>'+
      '<td>'+escapeHtml(m.from_name)+'</td><td>'+escapeHtml(m.from_email)+'</td>'+
      '<td>'+escapeHtml(truncate(m.subject,25))+'</td><td>'+escapeHtml(truncate(m.message,40))+'</td>'+
      '<td>'+formatDate(m.created_at)+'</td><td class="table-actions">'+
      (!m.is_read?'<button class="tbl-btn" onclick="markRead(\''+m.id+'\')"><i class="fas fa-check"></i></button>':'')+
      '<button class="tbl-btn danger" onclick="deleteMsg(\''+m.id+'\')"><i class="fas fa-trash"></i></button></td></tr>';
  }).join('');
}

async function markRead(id) { await api('/api/messages/'+id+'/read','PUT'); initMessagesPage(); }
async function deleteMsg(id) { if(!confirm('Delete?'))return; await api('/api/messages/'+id,'DELETE'); initMessagesPage(); }

/* ══════════════════════════════════════════════════════
   BLOGS PAGE
══════════════════════════════════════════════════════ */
async function initBlogsPage() {
  initSidebar();
  loadBlogs();

  var modal = document.getElementById('blog-modal');
  document.getElementById('add-blog-btn').onclick = function() {
    document.getElementById('blog-modal-title').textContent = 'New Blog Post';
    document.getElementById('blog-form').reset();
    document.getElementById('blog-id').value = '';
    modal.style.display = 'flex';
  };
  document.getElementById('blog-modal-close').onclick = function() { modal.style.display = 'none'; };
  modal.onclick = function(e) { if (e.target === modal) modal.style.display = 'none'; };

  // Auto-generate slug from title
  document.getElementById('blog-title').oninput = function() {
    var slug = this.value.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
    document.getElementById('blog-slug').value = slug;
  };

  document.getElementById('blog-form').onsubmit = async function(e) {
    e.preventDefault();
    var id = document.getElementById('blog-id').value;
    var payload = {
      title: document.getElementById('blog-title').value,
      slug: document.getElementById('blog-slug').value,
      content: document.getElementById('blog-content').value,
      excerpt: document.getElementById('blog-excerpt').value,
      category: document.getElementById('blog-category').value,
      status: document.getElementById('blog-status').value,
      tags: document.getElementById('blog-tags').value.split(',').map(function(t){return t.trim()}).filter(Boolean),
    };
    var r = id ? await api('/api/blogs/'+id,'PUT',payload) : await api('/api/blogs','POST',payload);
    var fb = document.getElementById('blog-feedback');
    if (r.ok) { fb.textContent='✅ Saved!'; fb.className='auth-feedback success'; setTimeout(function(){modal.style.display='none';loadBlogs()},600); }
    else { fb.textContent=r.data.message; fb.className='auth-feedback error'; }
  };
}

async function loadBlogs() {
  var r = await api('/api/blogs/all');
  if (r.status===401||r.status===403) { window.location.href='/login'; return; }
  var tbody = document.getElementById('blogs-body');
  var count = document.getElementById('blog-count');
  if (count) count.textContent = r.data.total + ' posts';
  if (!r.data.data.length) { tbody.innerHTML='<tr><td colspan="6" class="loading-cell">No blog posts</td></tr>'; return; }
  tbody.innerHTML = r.data.data.map(function(b) {
    return '<tr><td>'+escapeHtml(truncate(b.title,30))+'</td><td>'+escapeHtml(b.category)+
      '</td><td><span class="status-badge '+b.status+'">'+b.status+'</span></td><td>'+b.views+
      '</td><td>'+formatDate(b.created_at)+'</td><td class="table-actions">'+
      '<button class="tbl-btn" onclick="editBlog(\''+b.id+'\')"><i class="fas fa-edit"></i></button>'+
      '<button class="tbl-btn danger" onclick="deleteBlog(\''+b.id+'\')"><i class="fas fa-trash"></i></button></td></tr>';
  }).join('');
}

async function editBlog(id) {
  var r = await api('/api/blogs/'+id);
  if (!r.ok) return;
  var b = r.data.data;
  document.getElementById('blog-modal-title').textContent = 'Edit Post';
  document.getElementById('blog-id').value = b.id;
  document.getElementById('blog-title').value = b.title;
  document.getElementById('blog-slug').value = b.slug;
  document.getElementById('blog-content').value = b.content;
  document.getElementById('blog-excerpt').value = b.excerpt;
  document.getElementById('blog-category').value = b.category;
  document.getElementById('blog-status').value = b.status;
  document.getElementById('blog-tags').value = (b.tags||[]).join(', ');
  document.getElementById('blog-modal').style.display = 'flex';
}

async function deleteBlog(id) {
  if(!confirm('Delete this post?'))return;
  await api('/api/blogs/'+id,'DELETE');
  loadBlogs();
}
