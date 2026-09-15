const express = require('express');
const router = express.Router();
const pageController = require('../controllers/page.controller');

// Main Pages
router.get('/', pageController.getHome);
router.get('/index.html', (req, res) => res.redirect(301, '/'));

// Apps & Setup Guide
router.get('/apps-one4k', pageController.getApps);
router.get('/apps-tivione', (req, res) => res.redirect(301, '/apps-one4k'));
router.get('/apps', (req, res) => res.redirect(301, '/apps-one4k'));

// Channels Lineup
router.get('/channel', pageController.getChannel);
router.get('/channels', (req, res) => res.redirect(301, '/channel'));

// Reseller Program
router.get('/reseller', pageController.getReseller);

// Contact Us
router.get('/contact-us', pageController.getContact);
router.get('/contact', (req, res) => res.redirect(301, '/contact-us'));

// Cart & Checkout
router.get('/cart', pageController.getCart);

// Shop
router.get('/shop', pageController.getShop);

module.exports = router;
