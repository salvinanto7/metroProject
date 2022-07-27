var express = require('express');
var router = express.Router();
var db = require('../db');
var mysql = require('mysql')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('admin/index', { title: 'Metro Station' });
});

module.exports = router;
