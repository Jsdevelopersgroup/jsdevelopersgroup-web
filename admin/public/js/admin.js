// Admin Portal Vanilla JavaScript

const ICONS = [
  "Building2",
  "Clock",
  "Users",
  "DollarSign",
  "Layers",
  "CheckCircle",
  "Ruler",
  "Home",
  "MapPin"
];

let galleryItems = []; // Array of { file: File | null, url: string }
let specItems = [];    // Array of { icon: string, title: string, value: string }
let featuredFile = null;

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initToggleSwitches();
  initDeleteButtons();
  initModal();
  if (window.lucide) window.lucide.createIcons();
});

/* ---------------- THEME ---------------- */
function initTheme() {
  const root = document.documentElement;
  const toggleButtons = document.querySelectorAll('.theme-toggle-btn');

  toggleButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const isDark = root.classList.contains('dark');
      if (isDark) {
        root.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      } else {
        root.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      }
    });
  });
}

/* ---------------- TOAST ---------------- */
function showToast(message, isError = false) {
  const toast = document.getElementById('admin-toast');
  const msgEl = document.getElementById('toast-message');
  const iconEl = document.getElementById('toast-icon');
  if (!toast || !msgEl) return;

  msgEl.textContent = message;
  if (isError) {
    toast.className = 'fixed bottom-6 right-6 z-50 bg-destructive text-destructive-foreground border shadow-lg rounded-lg p-4 max-w-sm flex items-center space-x-2';
    if (iconEl) iconEl.setAttribute('data-lucide', 'alert-circle');
  } else {
    toast.className = 'fixed bottom-6 right-6 z-50 bg-card text-foreground border shadow-lg rounded-lg p-4 max-w-sm flex items-center space-x-2';
    if (iconEl) iconEl.setAttribute('data-lucide', 'check-circle');
  }

  if (window.lucide) window.lucide.createIcons();

  toast.classList.remove('hidden');
  setTimeout(() => {
    toast.classList.add('hidden');
  }, 3500);
}

/* ---------------- STATUS & FEATURED SWITCH TOGGLES ---------------- */
function initToggleSwitches() {
  const switches = document.querySelectorAll('.toggle-switch');
  switches.forEach(sw => {
    sw.addEventListener('change', async () => {
      const id = sw.getAttribute('data-id');
      const field = sw.getAttribute('data-field');
      const value = sw.checked;

      try {
        const res = await fetch(`/api/projects/${id}/toggle`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ field, value }),
        });

        if (!res.ok) throw new Error('Toggle request failed');

        // Update badge text and color
        const row = sw.closest('tr');
        if (field === 'is_active') {
          const badge = row.querySelector('.status-badge');
          if (badge) {
            badge.textContent = value ? 'Active' : 'Inactive';
            badge.className = `status-badge inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${value ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`;
          }
        } else if (field === 'is_featured') {
          const badge = row.querySelector('.featured-badge');
          if (badge) {
            badge.textContent = value ? 'Featured' : 'Normal';
            badge.className = `featured-badge inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${value ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`;
          }
        }

        showToast(`Project ${field === 'is_active' ? 'active' : 'featured'} status updated`);
      } catch (err) {
        sw.checked = !value; // revert switch state
        showToast('Error updating status', true);
      }
    });
  });
}

/* ---------------- DELETE PROJECT ---------------- */
function initDeleteButtons() {
  const deleteBtns = document.querySelectorAll('.btn-delete-project');
  deleteBtns.forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-id');
      if (!confirm('Are you sure you want to delete this project? This cannot be undone.')) {
        return;
      }

      try {
        const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Delete failed');

        showToast('Project deleted successfully');
        const row = btn.closest('tr');
        if (row) row.remove();
      } catch (err) {
        showToast('Error deleting project', true);
      }
    });
  });
}

/* ---------------- ADD / EDIT MODAL ---------------- */
function initModal() {
  const modal = document.getElementById('project-modal');
  const btnAdd = document.getElementById('btn-add-project');
  const btnClose = document.getElementById('modal-close-btn');
  const btnCancel = document.getElementById('btn-modal-cancel');
  const form = document.getElementById('project-form');
  const titleInput = document.getElementById('form-title');
  const slugInput = document.getElementById('form-slug');

  if (!modal) return;

  // Auto-generate slug from title
  if (titleInput && slugInput) {
    titleInput.addEventListener('input', () => {
      if (!document.getElementById('form-project-id').value) {
        slugInput.value = titleInput.value.toLowerCase().trim().replace(/[^a-z0-9_-]/g, '-');
      }
    });
  }

  function openModal(isEdit = false) {
    document.getElementById('modal-title').textContent = isEdit ? 'Edit Project' : 'Add Project';
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    if (window.lucide) window.lucide.createIcons();
  }

  function closeModal() {
    modal.classList.add('hidden');
    document.body.style.overflow = '';
    resetForm();
  }

  if (btnAdd) {
    btnAdd.addEventListener('click', () => {
      resetForm();
      openModal(false);
    });
  }

  if (btnClose) btnClose.addEventListener('click', closeModal);
  if (btnCancel) btnCancel.addEventListener('click', closeModal);

  // Edit buttons on table rows
  const editBtns = document.querySelectorAll('.btn-edit-project');
  editBtns.forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-id');
      try {
        const res = await fetch(`/api/projects/${id}`);
        if (!res.ok) throw new Error('Failed to load project details');
        const project = await res.json();
        populateForm(project);
        openModal(true);
      } catch (err) {
        showToast('Error loading project details', true);
      }
    });
  });

  // Featured image picker
  const featuredInput = document.getElementById('featured-image-file');
  if (featuredInput) {
    featuredInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      featuredFile = file;

      const reader = new FileReader();
      reader.onload = (re) => {
        const img = document.getElementById('featured-image-preview');
        const placeholder = document.getElementById('featured-image-placeholder');
        img.src = re.target.result;
        img.classList.remove('hidden');
        placeholder.classList.add('hidden');
      };
      reader.readAsDataURL(file);
    });
  }

  // Gallery Add Slot button
  const btnAddGallery = document.getElementById('btn-add-gallery-slot');
  if (btnAddGallery) {
    btnAddGallery.addEventListener('click', () => {
      if (galleryItems.length < 10) {
        galleryItems.push({ file: null, url: '' });
        renderGallerySlots();
      }
    });
  }

  // Specs Add Row button
  const btnAddSpec = document.getElementById('btn-add-spec-row');
  if (btnAddSpec) {
    btnAddSpec.addEventListener('click', () => {
      specItems.push({ icon: 'Building2', title: '', value: '' });
      renderSpecs();
    });
  }

  // Form Submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const saveBtn = document.getElementById('btn-modal-save');
    saveBtn.disabled = true;
    saveBtn.innerText = 'Saving...';

    const projectId = document.getElementById('form-project-id').value;
    const isEdit = Boolean(projectId);

    const fd = new FormData();
    fd.append('title', document.getElementById('form-title').value);
    fd.append('slug', document.getElementById('form-slug').value);
    fd.append('category', document.getElementById('form-category').value);
    fd.append('year', document.getElementById('form-year').value);
    fd.append('location', document.getElementById('form-location').value);
    fd.append('client', document.getElementById('form-client').value);
    fd.append('overview', document.getElementById('form-overview').value);

    // Featured Image
    if (featuredFile) {
      fd.append('images[0].file', featuredFile);
      fd.append('images[0].is_featured', 'true');
      fd.append('images[0].display_order', '0');
      fd.append('images[0].alt_text', document.getElementById('form-title').value);
    } else {
      const existingUrl = document.getElementById('form-featured-image-url').value;
      if (existingUrl) {
        fd.append('images[0].image_url', existingUrl);
        fd.append('images[0].is_featured', 'true');
        fd.append('images[0].display_order', '0');
        fd.append('images[0].alt_text', document.getElementById('form-title').value);
      }
    }

    // Gallery Images
    let galleryIndex = 1;
    galleryItems.forEach(item => {
      if (item.file) {
        fd.append(`images[${galleryIndex}].file`, item.file);
        fd.append(`images[${galleryIndex}].is_featured`, 'false');
        fd.append(`images[${galleryIndex}].display_order`, String(galleryIndex));
        fd.append(`images[${galleryIndex}].alt_text', document.getElementById('form-title').value`);
        galleryIndex++;
      } else if (item.url && !item.url.startsWith('data:')) {
        fd.append(`images[${galleryIndex}].image_url`, item.url);
        fd.append(`images[${galleryIndex}].is_featured`, 'false');
        fd.append(`images[${galleryIndex}].display_order`, String(galleryIndex));
        fd.append(`images[${galleryIndex}].alt_text', document.getElementById('form-title').value`);
        galleryIndex++;
      }
    });

    // Specifications
    specItems.forEach((s, idx) => {
      if (s.title && s.value) {
        fd.append(`specs[${idx}].icon_name`, s.icon || 'Building2');
        fd.append(`specs[${idx}].title`, s.title);
        fd.append(`specs[${idx}].value`, s.value);
      }
    });

    try {
      const url = isEdit ? `/api/projects/${projectId}` : `/api/projects`;
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        body: fd,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to save project');
      }

      showToast(isEdit ? 'Project updated successfully' : 'Project created successfully');
      closeModal();
      setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
      showToast(err.message || 'Error saving project', true);
      saveBtn.disabled = false;
      saveBtn.innerText = 'Save Project';
    }
  });
}

function resetForm() {
  document.getElementById('form-project-id').value = '';
  document.getElementById('form-title').value = '';
  document.getElementById('form-slug').value = '';
  document.getElementById('form-category').value = '';
  document.getElementById('form-year').value = new Date().getFullYear();
  document.getElementById('form-location').value = '';
  document.getElementById('form-client').value = '';
  document.getElementById('form-overview').value = '';
  document.getElementById('form-featured-image-url').value = '';

  featuredFile = null;
  const featuredImg = document.getElementById('featured-image-preview');
  const placeholder = document.getElementById('featured-image-placeholder');
  featuredImg.src = '';
  featuredImg.classList.add('hidden');
  placeholder.classList.remove('hidden');

  galleryItems = [];
  renderGallerySlots();

  specItems = [];
  renderSpecs();

  const saveBtn = document.getElementById('btn-modal-save');
  saveBtn.disabled = false;
  saveBtn.innerText = 'Save Project';
}

function populateForm(project) {
  document.getElementById('form-project-id').value = project.id || '';
  document.getElementById('form-title').value = project.title || '';
  document.getElementById('form-slug').value = project.slug || '';
  document.getElementById('form-category').value = project.category || '';
  document.getElementById('form-year').value = project.project_date ? project.project_date.split('-')[0] : (project.year || '');
  document.getElementById('form-location').value = project.location || '';
  document.getElementById('form-client').value = project.client || '';
  document.getElementById('form-overview').value = project.overview || '';

  // Featured image
  const featuredImgObj = project.images?.find(img => img.is_featured) || project.images?.[0];
  const featuredImg = document.getElementById('featured-image-preview');
  const placeholder = document.getElementById('featured-image-placeholder');
  const hiddenUrl = document.getElementById('form-featured-image-url');

  featuredFile = null;
  if (featuredImgObj && featuredImgObj.image_url) {
    hiddenUrl.value = featuredImgObj.image_url;
    featuredImg.src = featuredImgObj.image_url;
    featuredImg.classList.remove('hidden');
    placeholder.classList.add('hidden');
  } else {
    hiddenUrl.value = '';
    featuredImg.src = '';
    featuredImg.classList.add('hidden');
    placeholder.classList.remove('hidden');
  }

  // Gallery images (non-featured)
  galleryItems = [];
  if (Array.isArray(project.images)) {
    const galleryOnly = project.images.filter(img => !img.is_featured);
    galleryOnly.forEach(img => {
      galleryItems.push({ file: null, url: img.image_url });
    });
  }
  renderGallerySlots();

  // Specs
  specItems = [];
  if (Array.isArray(project.specifications)) {
    project.specifications.forEach(s => {
      specItems.push({
        icon: s.icon_name || 'Building2',
        title: s.title || '',
        value: s.value || '',
      });
    });
  }
  renderSpecs();
}

function renderGallerySlots() {
  const container = document.getElementById('gallery-slots-container');
  if (!container) return;
  container.innerHTML = '';

  galleryItems.forEach((item, idx) => {
    const slotDiv = document.createElement('div');
    slotDiv.className = 'space-y-2 border rounded-lg p-2 bg-muted/20';

    slotDiv.innerHTML = `
      <label class="block cursor-pointer">
        <input type="file" accept="image/*" class="hidden gallery-file-input" data-idx="${idx}">
        <div class="relative aspect-square rounded-md border border-dashed flex items-center justify-center hover:bg-muted/40 transition-colors overflow-hidden bg-background">
          ${item.url ? `
            <img src="${item.url}" class="absolute inset-0 w-full h-full object-cover">
          ` : `
            <span class="text-xs text-muted-foreground text-center px-2">Click to upload</span>
          `}
        </div>
      </label>
      <button type="button" class="btn-remove-gallery w-full text-xs text-destructive hover:underline" data-idx="${idx}">
        Remove
      </button>
    `;

    container.appendChild(slotDiv);
  });

  // Attach events
  container.querySelectorAll('.gallery-file-input').forEach(input => {
    input.addEventListener('change', (e) => {
      const idx = Number(e.target.getAttribute('data-idx'));
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (re) => {
        galleryItems[idx] = { file, url: re.target.result };
        renderGallerySlots();
      };
      reader.readAsDataURL(file);
    });
  });

  container.querySelectorAll('.btn-remove-gallery').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.getAttribute('data-idx'));
      galleryItems.splice(idx, 1);
      renderGallerySlots();
    });
  });

  if (window.lucide) window.lucide.createIcons();
}

function renderSpecs() {
  const container = document.getElementById('specs-container');
  if (!container) return;
  container.innerHTML = '';

  specItems.forEach((spec, idx) => {
    const row = document.createElement('div');
    row.className = 'grid grid-cols-1 sm:grid-cols-4 gap-2 border rounded-lg p-3 bg-muted/10 items-center';

    const iconOptions = ICONS.map(icon => `
      <option value="${icon}" ${spec.icon === icon ? 'selected' : ''}>${icon}</option>
    `).join('');

    row.innerHTML = `
      <select class="spec-icon-select border rounded px-2 py-1.5 text-sm bg-background" data-idx="${idx}">
        ${iconOptions}
      </select>
      <input 
        type="text" 
        placeholder="Specification Title" 
        value="${spec.title || ''}" 
        class="spec-title-input border rounded px-2 py-1.5 text-sm bg-background" 
        data-idx="${idx}"
      />
      <input 
        type="text" 
        placeholder="Value" 
        value="${spec.value || ''}" 
        class="spec-value-input border rounded px-2 py-1.5 text-sm bg-background" 
        data-idx="${idx}"
      />
      <button type="button" class="btn-remove-spec text-xs text-destructive hover:underline text-left sm:text-center" data-idx="${idx}">
        Remove
      </button>
    `;

    container.appendChild(row);
  });

  // Attach events
  container.querySelectorAll('.spec-icon-select').forEach(sel => {
    sel.addEventListener('change', (e) => {
      const idx = Number(e.target.getAttribute('data-idx'));
      specItems[idx].icon = e.target.value;
    });
  });

  container.querySelectorAll('.spec-title-input').forEach(inp => {
    inp.addEventListener('input', (e) => {
      const idx = Number(e.target.getAttribute('data-idx'));
      specItems[idx].title = e.target.value;
    });
  });

  container.querySelectorAll('.spec-value-input').forEach(inp => {
    inp.addEventListener('input', (e) => {
      const idx = Number(e.target.getAttribute('data-idx'));
      specItems[idx].value = e.target.value;
    });
  });

  container.querySelectorAll('.btn-remove-spec').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.getAttribute('data-idx'));
      specItems.splice(idx, 1);
      renderSpecs();
    });
  });

  if (window.lucide) window.lucide.createIcons();
}
