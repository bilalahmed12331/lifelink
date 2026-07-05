const pool = require('../config/db');

const getAllArticles = async (req, res) => {
  try {
    const { category } = req.query;

    let query = `
      SELECT a.*, u.name as author_name
      FROM health_articles a
      LEFT JOIN users u ON a.author_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (category) {
      query += ` AND a.category = ?`;
      params.push(category);
    }

    query += ` ORDER BY a.created_at DESC`;

    const [articles] = await pool.query(query, params);

    res.json(articles);
  } catch (error) {
    console.error('Get all articles error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getArticle = async (req, res) => {
  try {
    const { article_id } = req.params;

    await pool.query(
      'UPDATE health_articles SET views = views + 1 WHERE id = ?',
      [article_id]
    );

    const [articles] = await pool.query(
      `SELECT a.*, u.name as author_name
       FROM health_articles a
       LEFT JOIN users u ON a.author_id = u.id
       WHERE a.id = ?`,
      [article_id]
    );

    if (articles.length === 0) {
      return res.status(404).json({ message: 'Article not found' });
    }

    res.json(articles[0]);
  } catch (error) {
    console.error('Get article error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const createArticle = async (req, res) => {
  try {
    const { title, content, category, image_url } = req.body;
    const userId = req.user.id;

    const [result] = await pool.query(
      'INSERT INTO health_articles (title, content, category, author_id, image_url) VALUES (?, ?, ?, ?, ?)',
      [title, content, category, userId, image_url]
    );

    res.status(201).json({ message: 'Article created successfully', id: result.insertId });
  } catch (error) {
    console.error('Create article error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateArticle = async (req, res) => {
  try {
    const { article_id } = req.params;
    const { title, content, category, image_url } = req.body;
    const userId = req.user.id;

    const [articles] = await pool.query(
      'SELECT author_id FROM health_articles WHERE id = ?',
      [article_id]
    );

    if (articles.length === 0) {
      return res.status(404).json({ message: 'Article not found' });
    }

    if (articles[0].author_id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this article' });
    }

    await pool.query(
      'UPDATE health_articles SET title = ?, content = ?, category = ?, image_url = ? WHERE id = ?',
      [title, content, category, image_url, article_id]
    );

    res.json({ message: 'Article updated successfully' });
  } catch (error) {
    console.error('Update article error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteArticle = async (req, res) => {
  try {
    const { article_id } = req.params;
    const userId = req.user.id;

    const [articles] = await pool.query(
      'SELECT author_id FROM health_articles WHERE id = ?',
      [article_id]
    );

    if (articles.length === 0) {
      return res.status(404).json({ message: 'Article not found' });
    }

    if (articles[0].author_id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this article' });
    }

    await pool.query(
      'DELETE FROM health_articles WHERE id = ?',
      [article_id]
    );

    res.json({ message: 'Article deleted successfully' });
  } catch (error) {
    console.error('Delete article error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAllArticles,
  getArticle,
  createArticle,
  updateArticle,
  deleteArticle
};
