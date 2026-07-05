const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getAllArticles,
  getArticle,
  createArticle,
  updateArticle,
  deleteArticle
} = require('../controllers/articleController');

router.get('/', getAllArticles);

router.get('/:article_id', getArticle);

router.post('/', auth, createArticle);

router.put('/:article_id', auth, updateArticle);

router.delete('/:article_id', auth, deleteArticle);

module.exports = router;
