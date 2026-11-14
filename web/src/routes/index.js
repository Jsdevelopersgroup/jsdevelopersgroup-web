const express = require('express');
const router = express.Router();
const apiClient = require('../services/apiClient');

// Home page
router.get('/', async (req, res) => {
  const featuredProjects = await apiClient.getFeaturedProjects(3);
  res.render('home', {
    title: 'JS Developers Group | Building Excellence',
    description: 'JS Developers Group is your trusted partner for high-quality construction services, from residential to commercial projects.',
    activePage: 'home',
    featuredProjects,
  });
});

// About page
router.get('/about', (req, res) => {
  res.render('about', {
    title: 'About JS Developers Group | Our Story',
    description: "Learn about JS Developers Group's mission, vision, team, and experience in the construction industry.",
    activePage: 'about',
  });
});

// Services page
router.get('/services', (req, res) => {
  res.render('services', {
    title: 'Services | JS Developers Group',
    description: 'Explore the comprehensive construction services offered by JS Developers Group, from residential to commercial projects.',
    activePage: 'services',
  });
});

// Projects page
router.get('/projects', async (req, res) => {
  const [projects, categories] = await Promise.all([
    apiClient.getProjects(),
    apiClient.getCategories(),
  ]);

  res.render('projects', {
    title: 'Projects | JS Developers Group',
    description: 'View our portfolio of completed and ongoing construction projects by JS Developers Group.',
    activePage: 'projects',
    projects,
    categories,
  });
});

// Project detail page
router.get('/projects/:id', async (req, res) => {
  const project = await apiClient.getProjectById(req.params.id);
  if (!project) {
    return res.status(404).render('404', {
      title: 'Project Not Found | JS Developers Group',
      description: 'The requested project could not be found.',
      activePage: 'projects',
    });
  }

  res.render('project-detail', {
    title: `${project.title} | JS Developers Group Projects`,
    description: project.overview ? project.overview.substring(0, 160) : 'Project details',
    activePage: 'projects',
    project,
  });
});

// Testimonials page
router.get('/testimonials', (req, res) => {
  res.render('testimonials', {
    title: 'Testimonials | JS Developers Group',
    description: 'Read what our clients say about their experience working with JS Developers Group.',
    activePage: 'testimonials',
  });
});

// Contact page
router.get('/contact', (req, res) => {
  res.render('contact', {
    title: 'Contact Us | JS Developers Group',
    description: 'Get in touch with JS Developers Group for your construction project needs.',
    activePage: 'contact',
  });
});

module.exports = router;
