const express = require('express');
const router = express.Router();
const apiClient = require('../services/apiClient');

// Home page
router.get('/', async (req, res) => {
  const featuredProjects = await apiClient.getFeaturedProjects(3);
  res.render('home', {
    title: 'Vertex Construction Group | Building Excellence & Infrastructure',
    description: 'Vertex Construction Group is your trusted partner for high-quality construction services, from residential to commercial and industrial projects.',
    activePage: 'home',
    featuredProjects,
  });
});

// About page
router.get('/about', (req, res) => {
  res.render('about', {
    title: 'About Vertex Construction Group | Our Story & Leadership',
    description: "Learn about Vertex Construction Group's mission, vision, team, and decades of engineering excellence in the construction industry.",
    activePage: 'about',
  });
});

// Services page
router.get('/services', (req, res) => {
  res.render('services', {
    title: 'Services | Vertex Construction Group',
    description: 'Explore the comprehensive turnkey construction and civil engineering services offered by Vertex Construction Group.',
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
    title: 'Portfolio & Projects | Vertex Construction Group',
    description: 'View our portfolio of landmark completed and ongoing construction projects by Vertex Construction Group.',
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
      title: 'Project Not Found | Vertex Construction Group',
      description: 'The requested project could not be found.',
      activePage: 'projects',
    });
  }

  res.render('project-detail', {
    title: `${project.title} | Vertex Construction Group Projects`,
    description: project.overview ? project.overview.substring(0, 160) : 'Project details',
    activePage: 'projects',
    project,
  });
});

// Testimonials page
router.get('/testimonials', (req, res) => {
  res.render('testimonials', {
    title: 'Testimonials & Awards | Vertex Construction Group',
    description: 'Read what our clients and partners say about working with Vertex Construction Group.',
    activePage: 'testimonials',
  });
});

// Contact page
router.get('/contact', (req, res) => {
  res.render('contact', {
    title: 'Contact Us | Vertex Construction Group',
    description: 'Get in touch with Vertex Construction Group for your commercial, residential, or industrial construction project needs.',
    activePage: 'contact',
  });
});

module.exports = router;
